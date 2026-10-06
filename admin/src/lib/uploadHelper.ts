import { supabase } from './supabaseClient';
import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'raani closet image and product';

// 1. Image Compressor & Uploader
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
    return publicUrlData.publicUrl;
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
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { upsert: true });

    if (error) throw error;
    onProgress?.(100);

    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }

  // If heavy video (>45MB), use FFmpeg chunking (HLS)
  onProgress?.(5);
  const ff = await loadFFmpeg();
  onProgress?.(20);
  
  const inputName = 'input_video.mp4';
  const outputPlaylist = 'output.m3u8';
  
  await ff.writeFile(inputName, await fetchFile(file));
  
  // Track FFmpeg progress
  ff.on('progress', ({ progress, time }) => {
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
    const blob = new Blob([fileData]);
    const filePath = `videos/${folderId}/${f.name}`;
    
    await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, { upsert: true });
      
    uploadedCount++;
    const upProgress = 70 + Math.floor((uploadedCount / hlsFiles.length) * 30);
    onProgress?.(upProgress);
  }

  onProgress?.(100);
  const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`videos/${folderId}/${outputPlaylist}`);
  return publicUrlData.publicUrl;
}
