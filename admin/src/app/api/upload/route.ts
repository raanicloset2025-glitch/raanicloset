import { NextResponse } from "next/server";
import { uploadMediaToSupabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (supabaseUrl && supabaseKey) {
      const supabaseClient = createClient(supabaseUrl, supabaseKey);
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
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
      "raani-closet-images",
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
