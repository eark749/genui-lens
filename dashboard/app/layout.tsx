import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProjectProvider } from "@/context/ProjectContext";
import { AppLayoutWrapper } from "@/components/AppLayoutWrapper";

export const metadata: Metadata = { title: "GenUI Lens" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-[#09090b] min-h-screen transition-colors">
        <ThemeProvider>
          <ProjectProvider>
            <AppLayoutWrapper>
              {children}
            </AppLayoutWrapper>
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
