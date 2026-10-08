import { uploadMediaToSupabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads an image or video directly to Supabase Storage and returns its public URL.
 * Falls back to /api/upload route if direct client upload cannot be completed.
 */
export async function uploadMedia(file: Blob, fileName = "upload"): Promise<string> {
  const isVideo = file.type.startsWith("video/") || fileName.endsWith(".mp4") || fileName.endsWith(".webm");
  const folder = isVideo ? "videos" : "images";
  const ext = fileName.includes(".") ? fileName.split(".").pop() : (isVideo ? "mp4" : "webp");
  const filePath = `${folder}/${Date.now()}-${uuidv4()}.${ext}`;

  try {
    return await uploadMediaToSupabase(
      file,
      "raani closet image and product",
      filePath,
      file.type || (isVideo ? "video/mp4" : "image/webp")
    );
  } catch (directErr) {
    console.warn("[uploadMedia] Direct Supabase upload failed, attempting /api/upload route:", directErr);
    const form = new FormData();
    form.append("file", file, fileName);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.url) {
      throw new Error(data?.error || `Upload failed (${res.status})`);
    }
    return data.url as string;
  }
}
