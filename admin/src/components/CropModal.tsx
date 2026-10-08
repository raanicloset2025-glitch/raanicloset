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

      // scaleX is naturalWidth / displayed width, mapping displayed pixels directly to natural image pixels
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

      canvas.width = Math.max(1, targetWidth);
      canvas.height = Math.max(1, targetHeight);

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
              onError={() => setErrorMessage("Failed to load image. File may be corrupted or blocked.")}
            />
          </ReactCrop>
        </div>

        <div className="p-6 flex items-center justify-between border-t border-white/5 bg-[#0F0F0F]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
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
