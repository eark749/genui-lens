import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload = { project_id: process.env.GENUI_PROJECT_ID, ...body };
  console.log("[track] POST /v1/events", JSON.stringify(payload).slice(0, 200));
  try {
    const resp = await fetch("http://localhost:8000/v1/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GENUI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    console.log("[track] backend response", resp.status, text.slice(0, 100));
    try {
      return NextResponse.json(JSON.parse(text), { status: resp.status });
    } catch {
      return NextResponse.json({ error: text }, { status: resp.status });
    }
  } catch (err) {
    console.error("[track] FETCH ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
