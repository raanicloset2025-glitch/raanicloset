import { NextResponse } from "next/server";
import { getStoreState, saveStoreState } from "@/lib/d1";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const data = await getStoreState();
    return NextResponse.json(data ?? {}, {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error("[GET /api/store] Error reading store:", error);
    return NextResponse.json(
      { error: "Failed to read store" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    if (!bodyText || !bodyText.trim()) {
      return NextResponse.json(
        { error: "Payload cannot be empty" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    let data: any;
    try {
      data = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return NextResponse.json(
        { error: "Payload must be a JSON object" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    await saveStoreState(data);
    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[POST /api/store] Error saving store:", error);
    return NextResponse.json(
      { error: "Failed to write store" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
