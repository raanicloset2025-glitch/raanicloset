import { NextResponse } from "next/server";
import { uploadMediaToSupabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob | File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
    }

    const isVideo = file.type.startsWith("video/");
    const folder = isVideo ? "videos" : "images";
    const ext = isVideo ? "mp4" : "webp";
    const filePath = `${folder}/${Date.now()}-${uuidv4()}.${ext}`;

    const publicUrl = await uploadMediaToSupabase(
      file,
      "raani closet image and product",
      filePath,
      file.type || (isVideo ? "video/mp4" : "image/webp")
    );

    return NextResponse.json({ url: publicUrl, success: true });
  } catch (error: any) {
    console.error("[API /api/upload] Error uploading media:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
