"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";

const FULL_PAGE_ROUTES = ["/login", "/auth", "/"];
const FLUSH_ROUTES = ["/chat"]; // full-height, no padding

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullPage = FULL_PAGE_ROUTES.some((r) =>
    r === "/" ? pathname === "/" : pathname.startsWith(r)
  );
  const isFlush = FLUSH_ROUTES.some((r) => pathname.startsWith(r));

  if (isFullPage) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      {isFlush ? (
        <div className="flex-1 overflow-hidden">{children}</div>
      ) : (
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      )}
    </div>
  );
}
