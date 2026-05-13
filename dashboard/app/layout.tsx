import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = { title: "GenUI Lens" };

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/tasks", label: "Tasks" },
  { href: "/conversations", label: "Conversations" },
  { href: "/ui-elements", label: "UI Elements" },
  { href: "/event-stream", label: "Event Stream" },
  { href: "/chat", label: "Chat" },
  { href: "/docs", label: "Docs" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-[#09090b] min-h-screen transition-colors">
        <ThemeProvider>
          <nav className="bg-white dark:bg-[#111113] border-b border-gray-200 dark:border-[#27272a] px-6 py-3 flex items-center gap-6">
            <span className="font-semibold text-gray-900 dark:text-zinc-100 mr-2">⬡ GenUI Lens</span>
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </nav>
          <main className="px-6 py-8 max-w-6xl mx-auto">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
