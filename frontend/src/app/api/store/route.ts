import { NextResponse } from "next/server";
import { getStoreState, saveStoreState } from "@/lib/d1";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getStoreState();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read store" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await saveStoreState(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to write store" }, { status: 500 });
  }
}




// removed edge runtime
