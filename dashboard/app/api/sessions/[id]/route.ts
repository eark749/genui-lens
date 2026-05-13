import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resp = await fetch(
      `${process.env.BACKEND_URL ?? "http://localhost:8000"}/v1/sessions/${params.id}`,
      {
        headers: { Authorization: `Bearer ${process.env.GENUI_API_KEY}` },
        cache: "no-store",
      }
    );
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
