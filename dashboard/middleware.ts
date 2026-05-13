import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Client-side auth is handled per-page via supabase.auth.getSession().
// This middleware only skips static assets.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
