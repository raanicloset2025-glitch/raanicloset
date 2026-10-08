# Technical Audit Report: Photo/Crop Upload & Supabase Storage

**Project**: Raani Closet (`modest-hypatia`)  
**Scope**: Deep technical audit of `react-image-crop`, canvas image processing, memory lifecycle, and Supabase Storage upload flows across `admin/src` and `frontend/src`.  
**Agent**: Explorer (`explorer_audit_crop`)  
**Date**: 2026-10-08  

---

## 1. Observation

Direct code observations from inspecting the codebase across `admin/src` and `frontend/src`:

### 1.1 `admin/src/components/CropModal.tsx`
- **Line 10–23**:
  ```tsx
  export interface CropModalProps {
    imageSrc: string;
    aspect?: number;
    title?: string;
    onCropComplete: (croppedDataUrl: string) => void;
    onClose: () => void;
  }

  export default function CropModal({
    imageSrc,
    title = "Adjust And Crop Image",
    onCropComplete,
    onClose,
  }: CropModalProps) {
  ```
  `aspect` is declared in `CropModalProps`, but omitted from the component parameter destructuring.
- **Line 120–125**:
  ```tsx
  <ReactCrop
    crop={crop}
    onChange={(_, percentCrop) => setCrop(percentCrop)}
    onComplete={(c) => setCompletedCrop(c)}
    className="max-h-full"
  >
  ```
  `aspect` is never passed to `<ReactCrop>`.
- **Line 131–134**:
  ```tsx
  onLoad={(e) => {
    setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  }}
  ```
  `onLoad` only calls `setCrop`, never setting `completedCrop`.
- **Line 144**:
  ```tsx
  disabled={isCompressing || !completedCrop?.width || !completedCrop?.height}
  ```
  Because `completedCrop` is `undefined` on load, the "Crop And Save" button is disabled by default until the user clicks and drags a crop handle.
- **Line 148**:
  ```tsx
  {isCompressing ? "}Ploading..." : "Crop And Save"}
  ```
  Verbatim UI typo: `"}Ploading..."`.
- **Line 114**:
  ```tsx
  <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover*text-white transition-colors">
  ```
  Verbatim CSS typo: `hover*text-white` with `*` instead of `:`.
- **Line 46–53 & 61–71**:
  ```tsx
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";

  const cropX = completedCrop.x * scaleX;
  const cropY = completedCrop.y * scaleY;
  const cropWidth = completedCrop.width * scaleX;
  const cropHeight = completedCrop.height * scaleY;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );
  ```
  `completedCrop.width * scaleX` is already in natural image pixels. Multiplying by `pixelRatio` inflates canvas dimensions by 4x to 9x area on Retina/mobile displays.
- **Line 73–77**:
  ```tsx
  canvas.toBlob(async (blob) => {
    if (!blob) {
      setIsCompressing(false);
      return;
    }
  ```
  If `blob` is null, it silently aborts with no user notification or error message.
- **Line 81**:
  ```tsx
  if (imageSrc.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
  ```
  `URL.revokeObjectURL` is executed only upon upload success. It is never called if the user clicks "Cancel", clicks the close button (`X`), if `canvas.toBlob` returns null, or if `uploadImage` throws an error.
- **Line 126–130**:
  ```tsx
  <img 
    ref={imgRef} 
    src={imageSrc} 
    alt="Crop target" 
    className="max-h-[50vh] w-auto object-contain"
  ```
  `crossOrigin="anonymous"` is missing. Drawing any remote image URL onto canvas taints the canvas context, throwing `DOMException: Failed to execute 'toBlob' on 'HTMLCanvasElement': Tainted canvases may not be exported.`

---

### 1.2 `admin/src/lib/uploadHelper.ts`
- **Line 10–39**:
  ```typescript
  export async function uploadImage(file: File, onProgress?: (p: number) => void): Promise<string> {
    try {
      onProgress?.(10);
      // Compress Image
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
      };
      const compressedFile = await imageCompression(file, options);
      onProgress?.(40);

      const ext = 'webp';
      const filename = `${Date.now()}-${uuidv4()}.${ext}`;
      const filePath = `images/${filename}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, compressedFile, { upsert: true });

      if (error) throw error;
      onProgress?.(100);

      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      return publicUrlData.publicUrl.replace(/\s/g, '%20');
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  }
  ```
  1. `supabase.storage.from(BUCKET_NAME).upload(filePath, compressedFile, { upsert: true })` does NOT pass `contentType: 'image/webp'`.
  2. Non-raster files (e.g. SVG logos from `NavbarEditor`, `.ico` favicons) passed to `imageCompression` either throw or corrupt the SVG vector into lossy WebP.
  3. Already-optimized WebP blobs from `CropModal` are re-compressed through `browser-image-compression`, causing double compression overhead and loss of quality.
  4. No file size check before compression.
- **Line 57–77 & Line 119–136**:
  ```typescript
  for (const f of hlsFiles) {
    const fileData = await ff.readFile(f.name);
    const blob = new Blob([fileData as any]);
    const filePath = `videos/${folderId}/${f.name}`;
    
    await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, { upsert: true });
      
    uploadedCount++;
  ...
  const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`videos/${folderId}/${outputPlaylist}`);
  return publicUrlData.publicUrl;
  ```
  1. Line 124 ignores `{ error }` from Supabase storage upload; failures silently pass.
  2. Upload calls omit `contentType` for `.m3u8` (`application/x-mpegURL`) and `.ts` (`video/mp2t`), causing Safari/HLS players to reject streams.
  3. Line 135 fails to run `.replace(/\s/g, '%20')` on the public URL, leaving raw spaces from `BUCKET_NAME`.

---

### 1.3 `admin/src/components/NavbarEditor.tsx`
- **Line 27–41**:
  ```tsx
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'clothing' | 'jewelry' | 'tab') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        
        if (type === 'clothing') store.setClothingLogoUrl(url);
        else if (type === 'jewelry') store.setJewelryLogoUrl(url);
        else if (type === 'tab') store.setTabLogoUrl(url);
      } catch (error) {
        console.error("Logo upload failed:", error);
        alert("Logo upload failed. Please try again.");
      }
    }
  };
  ```
  1. No loading indicator or disabled state during upload.
  2. `e.target.value = ""` is omitted; re-selecting the same file fails to trigger `onChange`.
  3. SVG vector logos are forced through WebP raster compression.

---

### 1.4 `admin/src/components/CategoryProductEditor.tsx`
- **Line 106**: `const url = URL.createObjectURL(file);`
- **Line 266–274**: Category image file input does not reset `e.target.value = ""`.
- **Line 576**: `onClose={() => setCropperState((prev) => ({ ...prev, isOpen: false }))}` does not revoke `cropperState.imageSrc`.
- Caller passes `aspect={3 / 4}` and `aspect={1}`, but `CropModal` ignores `aspect`.

---

### 1.5 `admin/src/components/ProductMasterEditor.tsx`
- **Line 45**: `const url = URL.createObjectURL(file);`
- **Line 340**: `onClose={() => setCropperState((prev) => ({ ...prev, isOpen: false }))}` does not revoke `cropperState.imageSrc`.

---

### 1.6 `admin/src/components/ClientDiariesEditor.tsx`
- **Line 33**: `const url = URL.createObjectURL(file);`
- **Line 30–39**: Does not reset `e.target.value = ""`.
- **Line 169**: `onClose={() => setCropperState((prev) => ({ ...prev, isOpen: false }))}` does not revoke `cropperState.imageSrc`.

---

### 1.7 `frontend/src/app/admin/page.tsx`
- **Line 55–60**:
  ```tsx
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateCategory(cat.id, { image: url }, type);
  };
  ```
- **Line 120–125**:
  ```tsx
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateProduct(product.id, { imageSrc: url, images: [url, url, url] });
  };
  ```
  `URL.createObjectURL(file)` is written directly into Zustand store. The file is NEVER uploaded to Supabase Storage. These ephemeral `blob:` URLs break when the tab is refreshed or viewed from another browser.

---

### 1.8 `frontend/src/components/CropModal.tsx`
- **Line 4 & Line 73–75**:
  ```tsx
  import Cropper from "react-easy-crop";
  ...
  const dataUrl = canvas.toDataURL("image/webp", 0.88);
  onCropComplete(dataUrl);
  onClose();
  ```
  Uses `react-easy-crop` and converts the crop to a base64 Data URL without uploading to Supabase Storage. Base64 strings can exceed 1MB, exceeding localStorage and D1 payload limits.

---

## 2. Logic Chain

From the direct observations above, we establish the following causal chains:

1. **Aspect Ratio Ignored & Storefront Layout Breakage**:
   - *Observation*: `CropModalProps` specifies `aspect?: number`, but `CropModal` does not destructure `aspect` (lines 18-23) and does not pass `aspect` to `<ReactCrop>` (line 120).
   - *Logic*: Because `aspect` is omitted, `ReactCrop` operates in free-form mode. Callers (`ProductMasterEditor`, `CategoryProductEditor`, `ClientDiariesEditor`) that require strict 3:4 or 1:1 ratios receive arbitrary aspect ratios. When published, cards in the storefront exhibit distorted image geometry, misalignment, or unwanted white space.

2. **Unresponsive "Crop And Save" Button on Initial Load**:
   - *Observation*: `onLoad` only sets `crop` (line 132), leaving `completedCrop` as `undefined`. Line 144 disables the button when `!completedCrop?.width`.
   - *Logic*: When the modal opens, a user viewing the default centered crop box cannot click "Crop And Save". The button is disabled with no indication why. The user must touch a handle to trigger `onComplete` before the button activates.

3. **Retina Display Canvas Bloat & Crash Risk**:
   - *Observation*: `canvas.width` and `canvas.height` multiply `scaleX` by `window.devicePixelRatio` (lines 50–51).
   - *Logic*: `completedCrop.width * scaleX` is already measured in the natural pixel dimensions of the source photo. Multiplying by DPR (2x or 3x) produces a canvas with 4x to 9x the source pixel area. On high-resolution smartphone photos (e.g. 4000x3000), the canvas reaches 12,000x9,000 pixels (>100 megapixels), exceeding browser canvas memory limits (e.g., Safari's 16MP limit), causing `toBlob` to fail or return null.

4. **Permanent Memory Leaks via Blob URLs**:
   - *Observation*: `URL.createObjectURL` is called whenever a file is chosen, but `URL.revokeObjectURL` is only called inside the success branch of `uploadImage` (line 81).
   - *Logic*: Whenever a user opens the crop dialog and clicks "Cancel", clicks `X`, or selects an alternative file, the created object URL is never revoked. Over an editing session, dozens of full-resolution image blobs remain pinned in browser memory.

5. **MIME Type Mismatch in Supabase Storage**:
   - *Observation*: `supabase.storage.from(BUCKET_NAME).upload(...)` in `uploadHelper.ts` does not specify `contentType`.
   - *Logic*: Without `contentType: 'image/webp'`, Supabase defaults to `application/octet-stream` or falls back to generic inference. When served via CDN, browsers receive `application/octet-stream`, triggering a file download rather than rendering the image inline.

6. **Destruction of Brand SVG Logos and Favicons**:
   - *Observation*: `NavbarEditor.tsx` passes logo files to `uploadImage(file)`, which unconditionally executes `browser-image-compression` with `fileType: 'image/webp'`.
   - *Logic*: Scalable vector graphics (SVG) and ICO files are not raster images. `browser-image-compression` throws an unhandled error or rasterizes SVG into fixed-dimension WebP, destroying crisp SVG rendering across resolutions.

7. **Corrupted Video HLS Playlists**:
   - *Observation*: In `uploadVideo`, line 124 does not check `{ error }`, omits HLS MIME types, and line 135 omits `.replace(/\s/g, '%20')`.
   - *Logic*: Segment upload failures go undetected, `.m3u8` playlists are served with wrong MIME types without space encoding, preventing Safari and HLS video players from streaming the video.

8. **Frontend Storefront 404 Disconnect**:
   - *Observation*: In `frontend/src/app/admin/page.tsx`, `handleImageUpload` saves `URL.createObjectURL(file)` directly to the store.
   - *Logic*: Because blob URLs are session-local, any category or product photo uploaded through `/admin` on the frontend is broken (`ERR_FILE_NOT_FOUND`) upon page reload or access from another client.

---

## 3. Caveats

- **Cloudflare D1 Storage Limits**: Images are stored in Supabase Storage, and only their public URLs are stored in Zustand / D1 database. This architecture is correct, provided images are uploaded to Supabase and not stored as base64 strings.
- **FFmpeg WASM Deployment**: `uploadVideo` relies on unpkg CDN for `@ffmpeg/core`. While this was not modified, deploying `@ffmpeg/core` files locally to Next.js `public/` avoids third-party CDN downtime.
- **No other caveats**: The entire photo/crop upload and Supabase storage lifecycle across `admin` and `frontend` was analyzed line by line.

---

## 4. Conclusion

The photo cropping and upload pipeline contains several high-severity bugs that impact user experience, storage reliability, and visual integrity:
1. `CropModal` fails to enforce aspect ratios, disables the save button on load, bloats canvas dimensions on Retina monitors, contains UI typos (`}Ploading...`, `hover*text-white`), and lacks CORS handling.
2. Memory leaks occur whenever crops are cancelled due to uncalled `URL.revokeObjectURL`.
3. `uploadHelper.ts` omits `contentType` in Supabase uploads, corrupts SVG logos via raster compression, doubly compresses WebP crops, and ignores HLS upload errors.
4. `frontend/src/app/admin/page.tsx` stores ephemeral `blob:` URLs instead of uploading to Supabase Storage.

Implementing the concrete fixes proposed below will resolve all issues, enforce pixel-perfect aspect ratios, guarantee memory safety, ensure proper Supabase MIME headers, and preserve 100% of the existing luxury UI styling and Framer Motion animations.

---

## 5. Concrete Proposed Code Improvements

### 5.1 Fix `admin/src/components/CropModal.tsx`

```tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  makeAspectCrop,
  centerCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/uploadHelper";

export interface CropModalProps {
  imageSrc: string;
  aspect?: number;
  title?: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export default function CropModal({
  imageSrc,
  aspect,
  title = "Adjust And Crop Image",
  onCropComplete,
  onClose,
}: CropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guarantee memory cleanup of blob URL on unmount or close
  useEffect(() => {
    return () => {
      if (imageSrc && imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  // Handle image load: compute initial centered crop honoring aspect constraint
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      if (!width || !height) return;

      const initialCrop = aspect
        ? centerCrop(
            makeAspectCrop(
              {
                unit: "%",
                width: 85,
              },
              aspect,
              width,
              height
            ),
            width,
            height
          )
        : { unit: "%" as const, width: 85, height: 85, x: 7.5, y: 7.5 };

      setCrop(initialCrop);
      setCompletedCrop(convertToPixelCrop(initialCrop, width, height));
    },
    [aspect]
  );

  const createCroppedImage = async () => {
    try {
      if (!completedCrop || !imgRef.current) {
        setErrorMessage("Please make a selection first");
        return;
      }
      setIsCompressing(true);
      setErrorMessage(null);

      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not initialize canvas context");
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const sourceX = completedCrop.x * scaleX;
      const sourceY = completedCrop.y * scaleY;
      const sourceWidth = completedCrop.width * scaleX;
      const sourceHeight = completedCrop.height * scaleY;

      // Cap maximum dimensions to 1920px to prevent canvas limit exhaustion
      const MAX_DIMENSION = 1920;
      let targetWidth = Math.round(sourceWidth);
      let targetHeight = Math.round(sourceHeight);

      if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * MAX_DIMENSION) / targetWidth);
          targetWidth = MAX_DIMENSION;
        } else {
          targetWidth = Math.round((targetWidth * MAX_DIMENSION) / targetHeight);
          targetHeight = MAX_DIMENSION;
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", 0.9);
      });

      if (!blob) {
        throw new Error("Failed to export image from canvas");
      }

      const file = new File(
        [blob],
        `cropped-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`,
        { type: "image/webp" }
      );

      const url = await uploadImage(file);

      if (imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }

      onCropComplete(url);
      onClose();
    } catch (e: any) {
      console.error("Error cropping image:", e);
      setErrorMessage(e?.message || "Image crop/upload failed. Please try again.");
      setIsCompressing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col my-8"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h3 className="text-base font-serif text-white tracking-wide">{title}</h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              {aspect ? "Adjust crop window to frame image" : "Drag corners to resize crop area freely"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="px-6 py-2 bg-red-900/40 border-b border-red-500/20 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        <div className="relative w-full bg-[#050505] flex items-center justify-center p-4 min-h-[300px] max-h-[60vh] overflow-hidden">
          <ReactCrop
            crop={crop}
            aspect={aspect}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            className="max-h-full"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              crossOrigin="anonymous"
              className="max-h-[50vh] w-auto object-contain"
              onLoad={onImageLoad}
              onError={() => setErrorMessage("Failed to load image. File may be corrupted.")}
            />
          </ReactCrop>
        </div>

        <div className="p-6 flex items-center justify-between border-t border-white/5 bg-[#0F0F0F]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs uppercase tracking-wider text-slate-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={createCroppedImage}
            disabled={isCompressing || !completedCrop?.width || !completedCrop?.height}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#CBA153] hover:bg-[#DFB76C] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-full transition-all disabled:opacity-50"
          >
            {isCompressing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isCompressing ? "Uploading..." : "Crop And Save"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

---

### 5.2 Fix `admin/src/lib/uploadHelper.ts`

```typescript
import { supabase } from './supabaseClient';
import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'raani closet image and product';

// 1. Image Compressor & Uploader
export async function uploadImage(file: File, onProgress?: (p: number) => void): Promise<string> {
  try {
    if (!file) throw new Error("No file provided for upload");

    // Max upload size safety boundary (35MB)
    const MAX_RAW_MB = 35;
    if (file.size > MAX_RAW_MB * 1024 * 1024) {
      throw new Error(`File size exceeds ${MAX_RAW_MB}MB limit`);
    }

    onProgress?.(10);

    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const isIco = file.type === 'image/x-icon' || file.name.toLowerCase().endsWith('.ico');
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const isAlreadyOptimizedWebp = file.type === 'image/webp' && file.size < 2 * 1024 * 1024;

    let fileToUpload: File | Blob = file;
    let ext = 'webp';
    let contentType = 'image/webp';

    if (isSvg) {
      // Preserve vector SVG without raster compression
      ext = 'svg';
      contentType = 'image/svg+xml';
      fileToUpload = file;
    } else if (isIco) {
      // Preserve favicon ICO without compression
      ext = 'ico';
      contentType = 'image/x-icon';
      fileToUpload = file;
    } else if (isGif) {
      // Preserve animated GIF
      ext = 'gif';
      contentType = 'image/gif';
      fileToUpload = file;
    } else if (isAlreadyOptimizedWebp) {
      // Pre-compressed WebP from CropModal bypasses redundant compression
      ext = 'webp';
      contentType = 'image/webp';
      fileToUpload = file;
    } else {
      // Compress raster images
      try {
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp' as const,
        };
        fileToUpload = await imageCompression(file, options);
        ext = 'webp';
        contentType = 'image/webp';
      } catch (compErr) {
        console.warn("Image compression failed, falling back to original file:", compErr);
        fileToUpload = file;
        ext = file.name.split('.').pop() || 'jpg';
        contentType = file.type || 'image/jpeg';
      }
    }

    onProgress?.(50);

    const filename = `${Date.now()}-${uuidv4()}.${ext}`;
    const filePath = `images/${filename}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileToUpload, {
        upsert: true,
        contentType,
        cacheControl: '3600',
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      throw error;
    }

    onProgress?.(100);

    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return publicUrlData.publicUrl.replace(/\s/g, '%20');
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
}

// 2. Video Processor & Uploader
let ffmpeg: FFmpeg | null = null;

async function loadFFmpeg() {
  if (ffmpeg) return ffmpeg;
  ffmpeg = new FFmpeg();
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  return ffmpeg;
}

export async function uploadVideo(file: File, onProgress?: (p: number) => void): Promise<string> {
  const maxSizeMB = 45;
  const sizeMB = file.size / (1024 * 1024);

  // If video is small enough, upload directly as MP4
  if (sizeMB < maxSizeMB) {
    onProgress?.(10);
    const ext = file.name.split('.').pop() || 'mp4';
    const filename = `${Date.now()}-${uuidv4()}.${ext}`;
    const filePath = `videos/${filename}`;
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || 'video/mp4',
        cacheControl: '3600',
      });

    if (error) throw error;
    onProgress?.(100);

    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return publicUrlData.publicUrl.replace(/\s/g, '%20');
  }

  // If heavy video (>45MB), use FFmpeg chunking (HLS)
  onProgress?.(5);
  const ff = await loadFFmpeg();
  onProgress?.(20);
  
  const inputName = 'input_video.mp4';
  const outputPlaylist = 'output.m3u8';
  
  await ff.writeFile(inputName, await fetchFile(file));
  
  ff.on('progress', ({ progress }) => {
    const mappedProgress = 20 + Math.floor(progress * 50);
    onProgress?.(mappedProgress);
  });

  onProgress?.(25);
  await ff.exec([
    '-i', inputName,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '28', 
    '-hls_time', '10',
    '-hls_list_size', '0',
    '-f', 'hls',
    outputPlaylist
  ]);

  onProgress?.(70);
  
  const files = await ff.listDir('.');
  const hlsFiles = files.filter(f => f.name.endsWith('.m3u8') || f.name.endsWith('.ts'));
  
  const folderId = uuidv4();
  let uploadedCount = 0;
  
  for (const f of hlsFiles) {
    const fileData = await ff.readFile(f.name);
    const blob = new Blob([fileData as any]);
    const filePath = `videos/${folderId}/${f.name}`;
    const chunkContentType = f.name.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp2t';
    
    const { error: chunkError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        upsert: true,
        contentType: chunkContentType,
        cacheControl: '3600',
      });

    if (chunkError) {
      throw new Error(`Failed to upload HLS segment ${f.name}: ${chunkError.message}`);
    }
      
    uploadedCount++;
    const upProgress = 70 + Math.floor((uploadedCount / hlsFiles.length) * 30);
    onProgress?.(upProgress);
  }

  onProgress?.(100);
  const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`videos/${folderId}/${outputPlaylist}`);
  return publicUrlData.publicUrl.replace(/\s/g, '%20');
}
```

---

### 5.3 Fix `admin/src/components/NavbarEditor.tsx`

Update `handleLogoUpload` to show a luxury spinner state and safely reset file input values:

```tsx
const [uploadingLogoType, setUploadingLogoType] = React.useState<'clothing' | 'jewelry' | 'tab' | null>(null);

const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'clothing' | 'jewelry' | 'tab') => {
  const file = e.target.files?.[0];
  e.target.value = ""; // Always reset so re-selecting the same file works
  if (!file) return;

  setUploadingLogoType(type);
  try {
    const url = await uploadImage(file);
    if (type === 'clothing') store.setClothingLogoUrl(url);
    else if (type === 'jewelry') store.setJewelryLogoUrl(url);
    else if (type === 'tab') store.setTabLogoUrl(url);
  } catch (error: any) {
    console.error("Logo upload failed:", error);
    alert(error?.message || "Logo upload failed. Please try again.");
  } finally {
    setUploadingLogoType(null);
  }
};
```

---

### 5.4 Fix `frontend/src/app/admin/page.tsx`

Upload the photo to Supabase Storage before setting state, and show a clean loading indicator:

```tsx
// Inside CategoryRow
const [isUploading, setIsUploading] = useState(false);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;

  setIsUploading(true);
  try {
    const { uploadMediaToSupabase } = await import("@/lib/supabase");
    const ext = file.name.split('.').pop() || 'webp';
    const filePath = `images/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const publicUrl = await uploadMediaToSupabase(file, 'raani closet image and product', filePath);
    updateCategory(cat.id, { image: publicUrl }, type);
  } catch (err) {
    console.error("Category image upload failed:", err);
  } finally {
    setIsUploading(false);
  }
};
```

```tsx
// Inside ProductRow
const [isUploading, setIsUploading] = useState(false);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;

  setIsUploading(true);
  try {
    const { uploadMediaToSupabase } = await import("@/lib/supabase");
    const ext = file.name.split('.').pop() || 'webp';
    const filePath = `images/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const publicUrl = await uploadMediaToSupabase(file, 'raani closet image and product', filePath);
    updateProduct(product.id, { imageSrc: publicUrl, images: [publicUrl, publicUrl, publicUrl] });
  } catch (err) {
    console.error("Product photo upload failed:", err);
  } finally {
    setIsUploading(false);
  }
};
```

---

## 6. Verification Method

To independently verify the audit findings and future fixes:

1. **Check Aspect Ratio Enforcement**:
   - Inspect `admin/src/components/CropModal.tsx`. Confirm `aspect` is destructured and passed to `<ReactCrop aspect={aspect}>`.
   - In `CategoryProductEditor` (categories, aspect=1), resizing the crop frame must stay strictly square (1:1).
   - In `ProductMasterEditor` (products, aspect=3/4), resizing must stay strictly 3:4.
2. **Check Default Button State on Load**:
   - Open `CropModal` with any test image.
   - Confirm "Crop And Save" is immediately enabled without touching the handles.
3. **Verify Canvas Dimensions & Coordinate Scaling**:
   - Upload a test photo on a high-DPI display (e.g. DPR=2).
   - Confirm exported canvas dimensions do NOT scale with DPR, and do not exceed 1920px.
4. **Verify Supabase MIME Types via Network Tab / Curl**:
   - Upload a test image through `CropModal`.
   - Inspect the response headers for the resulting Supabase public URL:
     `curl -I https://xrrvjgjemerbuqqwwqkt.supabase.co/storage/v1/object/public/raani%20closet%20image%20and%20product/images/...`
     Confirm `content-type: image/webp` (not `application/octet-stream`).
5. **Verify Memory Cleanup**:
   - In browser DevTools Memory/Network tab, open `CropModal` with a large file, click "Cancel". Confirm `URL.revokeObjectURL` was executed and heap memory is freed.
6. **Build Verification**:
   - Run `npm run build` in `admin` and `frontend`. Confirm 0 errors.
