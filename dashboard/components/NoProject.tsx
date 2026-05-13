"use client";

import Link from "next/link";

export function NoProject() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-4xl mb-4">⬡</p>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">No project selected</h2>
      <p className="text-sm text-gray-500 dark:text-zinc-500 mb-6">Pick a project to see its analytics.</p>
      <Link
        href="/projects"
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
      >
        Go to Projects
      </Link>
    </div>
  );
}
