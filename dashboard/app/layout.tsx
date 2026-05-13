import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "GenUI Lens" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
          <span className="font-semibold text-gray-900 mr-2">⬡ GenUI Lens</span>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Intents
          </Link>
          <Link href="/components" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Components
          </Link>
          <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Events
          </Link>
          <Link href="/chat" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Chat
          </Link>
        </nav>
        <main className="px-6 py-8 max-w-6xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
