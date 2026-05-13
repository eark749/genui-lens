"use client";

import { useState, useEffect, useCallback } from "react";
import { EventRow } from "@/lib/api";
import { cleanIntent } from "@/lib/categories";

const TYPE_BADGE: Record<string, string> = {
  action: "bg-purple-100 text-purple-700",
  business: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
};

type Filter = "all" | "action" | "business" | "error";

function fmt(ts: string) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function EventStreamClient({ initialEvents }: { initialEvents: EventRow[] }) {
  const [events, setEvents] = useState<EventRow[]>(initialEvents);
  const [filter, setFilter] = useState<Filter>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  const filtered =
    filter === "all" ? events : events.filter((e) => e.event_type === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Event Stream</h1>
        <p className="mt-1 text-sm text-gray-500">
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
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (8s)
          </label>
          <span className="text-sm text-gray-400">{filtered.length} events</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Time", "Task / Intent", "Type", "Element", "Action", "Payload"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No events yet.
                </td>
              </tr>
            )}
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap tabular-nums text-xs">
                  {fmt(e.timestamp)}
                </td>
                <td
                  className="px-4 py-3 font-mono text-xs text-gray-600 max-w-[180px] truncate"
                  title={e.intent ?? ""}
                >
                  {e.intent ? cleanIntent(e.intent) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      TYPE_BADGE[e.event_type] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {e.event_type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  {e.component_id ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {e.action_type ?? e.business_type ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[200px] truncate">
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
