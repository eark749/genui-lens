"use client";

import { useState, useEffect, useCallback } from "react";
import { EventRow } from "@/lib/api";
import { cleanIntent } from "@/lib/categories";

const TYPE_BADGE: Record<string, string> = {
  action: "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400",
  business: "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400",
  error: "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400",
};

type Filter = "all" | "action" | "business" | "error";

function fmt(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function EventStreamClient({ initialEvents }: { initialEvents: EventRow[] }) {
  const [events, setEvents] = useState<EventRow[]>(initialEvents);
  const [filter, setFilter] = useState<Filter>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) setEvents(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  const filtered = filter === "all" ? events : events.filter((e) => e.event_type === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Event Stream</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">
          Raw feed of all analytics events. Useful for debugging what&apos;s being tracked.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(["all", "business", "action", "error"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                filter === f
                  ? "bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-gray-900 dark:border-zinc-100"
                  : "bg-white dark:bg-transparent text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-[#27272a] hover:border-gray-400 dark:hover:border-zinc-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500 cursor-pointer">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded" />
            Auto-refresh (8s)
          </label>
          <span className="text-sm text-gray-400 dark:text-zinc-600">{filtered.length} events</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111113] rounded-lg border border-gray-200 dark:border-[#27272a] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#0d0d0f] border-b border-gray-200 dark:border-[#27272a]">
            <tr>
              {["Time", "Task / Intent", "Type", "Element", "Action", "Payload"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#1c1c1f]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 dark:text-zinc-600 text-sm">
                  No events yet.
                </td>
              </tr>
            )}
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors">
                <td className="px-4 py-3 text-gray-400 dark:text-zinc-600 whitespace-nowrap tabular-nums text-xs">
                  {fmt(e.timestamp)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-zinc-400 max-w-[180px] truncate" title={e.intent ?? ""}>
                  {e.intent ? cleanIntent(e.intent) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TYPE_BADGE[e.event_type] ?? "bg-gray-100 dark:bg-[#27272a] text-gray-600 dark:text-zinc-400"}`}>
                    {e.event_type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-zinc-400">
                  {e.component_id ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 dark:text-zinc-400">
                  {e.action_type ?? e.business_type ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400 dark:text-zinc-600 max-w-[200px] truncate">
                  {JSON.stringify(e.payload)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
