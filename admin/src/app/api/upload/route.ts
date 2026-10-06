import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Uploaded media is written as real files into BOTH apps' public/uploads folders,
// so the same "/uploads/<file>" URL works on the storefront (3000) and admin preview (3001).
// (Later this can be swapped for Cloudflare R2 without touching the editors.)
const TARGET_DIRS = [
  path.join(process.cwd(), "public", "uploads"),
  path.join(process.cwd(), "..", "frontend", "public", "uploads"),
];

const ALLOWED = /^(image|video)\//;
const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

function safeExt(name: string, mime: string) {
  const fromName = path.extname(name || "").toLowerCase().replace(/[^.a-z0-9]/g, "");
  if (fromName && fromName.length <= 6) return fromName;
  const fromMime = mime.split("/")[1]?.split(";")[0]?.replace(/[^a-z0-9]/g, "");
  return fromMime ? `.${fromMime}` : ".bin";
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }
    if (!ALLOWED.test(file.type)) {
      return NextResponse.json({ error: "Only image or video files allowed" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 200 MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = file.type.startsWith("video/") ? "vid" : "img";
    const fileName = `${kind}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${safeExt(file.name, file.type)}`;

    for (const dir of TARGET_DIRS) {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, fileName), buffer);
    }

    return NextResponse.json({ success: true, url: `/uploads/${fileName}` });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
