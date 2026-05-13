"use client";

import { useState } from "react";
import { IntentStat } from "@/lib/api";
import { cleanIntent, isDirtyIntent } from "@/lib/categories";

function pct(r: number) {
  return `${(r * 100).toFixed(1)}%`;
}

function rateColor(r: number) {
  if (r >= 0.7) return "text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400";
  if (r >= 0.4) return "text-yellow-700 bg-yellow-50 dark:bg-yellow-950/40 dark:text-yellow-400";
  return "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400";
}

export function TasksClient({ intents }: { intents: IntentStat[] }) {
  const [search, setSearch] = useState("");

  const clean = intents
    .filter((i) => !isDirtyIntent(i.intent))
    .map((i) => ({ ...i, label: cleanIntent(i.intent) }))
    .filter((i) => search === "" || i.label.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.view_count - a.view_count);

  const totalViews = clean.reduce((s, i) => s + i.view_count, 0);
  const totalSuccess = clean.reduce((s, i) => s + i.success_events, 0);
  const avgRate = totalViews > 0 ? totalSuccess / totalViews : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Tasks</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">
          Each row is a task your assistant performs. Success fires when a user follows up or clicks a component.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Tasks", value: clean.length },
          { label: "Total Runs", value: totalViews },
          { label: "Avg Success Rate", value: pct(avgRate) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-[#111113] rounded-lg border border-gray-200 dark:border-[#27272a] p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 dark:border-[#27272a] rounded-lg bg-white dark:bg-[#111113] text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-[#3f3f46]"
        />
      </div>

      <div className="space-y-2">
        {clean.length === 0 && (
          <div className="bg-white dark:bg-[#111113] rounded-lg border border-gray-200 dark:border-[#27272a] px-4 py-10 text-center text-gray-400 dark:text-zinc-600 text-sm">
            {search ? "No tasks match your search." : "No tasks tracked yet. Chat with the assistant to generate tasks."}
          </div>
        )}
        {clean.map((row) => (
          <div
            key={row.intent}
            className="bg-white dark:bg-[#111113] rounded-lg border border-gray-200 dark:border-[#27272a] px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-zinc-200 truncate">{row.label}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-600 mt-0.5">
                {row.view_count} run{row.view_count !== 1 ? "s" : ""} · {row.success_events} success{row.success_events !== 1 ? "es" : ""}
              </p>
            </div>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${rateColor(row.success_rate)}`}>
              {pct(row.success_rate)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
