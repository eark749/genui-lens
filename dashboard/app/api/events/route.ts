import { NextResponse } from "next/server";

export async function GET() {
  try {
    const resp = await fetch(
      `${process.env.BACKEND_URL ?? "http://localhost:8000"}/debug/events?limit=100`,
      {
        headers: { Authorization: `Bearer ${process.env.GENUI_API_KEY}` },
        cache: "no-store",
      }
    );
    const data = await resp.json();
    return NextResponse.json(data.events ?? []);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
