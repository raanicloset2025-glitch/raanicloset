/**
 * Uploads an image/video to the local /api/upload route and returns its public URL
 * (e.g. "/uploads/vid_123.mp4"). Throws on failure.
 */
export async function uploadMedia(file: Blob, fileName = "upload"): Promise<string> {
  const form = new FormData();
  form.append("file", file, fileName);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.url) {
    throw new Error(data?.error || `Upload failed (${res.status})`);
  }
  return data.url as string;
}
