import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const resp = await fetch(
      `${process.env.BACKEND_URL ?? "http://localhost:8000"}/v1/sessions/${id}`,
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
