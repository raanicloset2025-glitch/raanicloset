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
  
  // Track FFmpeg progress
  ff.on('progress', ({ progress }) => {
    // scale ffmpeg progress (0-1) to 20-70%
    const mappedProgress = 20 + Math.floor(progress * 50);
    onProgress?.(mappedProgress);
  });

  onProgress?.(25);
  // Convert to HLS segments (10s each, web optimized)
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
  
  // Read generated files
  const files = await ff.listDir('.');
  const hlsFiles = files.filter(f => f.name.endsWith('.m3u8') || f.name.endsWith('.ts'));
  
  const folderId = uuidv4();
  let uploadedCount = 0;
  
  // Upload all chunks
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
