import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const resp = await fetch("http://localhost:8000/v1/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GENUI_API_KEY}`,
    },
    body: JSON.stringify({
      ...body,
      project_id: process.env.GENUI_PROJECT_ID,
    }),
  });
  const data = await resp.json();
  return NextResponse.json(data, { status: resp.status });
}
