"use client";

import { useState } from "react";
import { getSessionDetail, SessionSummary, ViewDetail } from "@/lib/api";

const INTERACTIVE = new Set([
  "button", "submitbutton", "form", "datepicker", "textinput",
  "select", "checkbox", "radio", "toggle", "slider",
]);

function cleanIntent(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .split('["')[0]
    .replace(/\[&quot;.*$/i, "")
    .trim()
    .slice(0, 100) || "—";
}

function fmt(ts: string) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(id: string) {
  return id.slice(0, 8);
}

function rateColor(rate: number) {
  if (rate >= 0.7) return "text-green-600";
  if (rate >= 0.4) return "text-yellow-600";
  return "text-red-500";
}

function ViewRow({ view, idx }: { view: ViewDetail; idx: number }) {
  const isInteractive = view.components.some((c) =>
    INTERACTIVE.has(c.toLowerCase())
  );
  const hasSuccess = view.success_count > 0;
  const hasAction = view.action_count > 0;

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
        {idx + 1}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 font-mono truncate">
          {cleanIntent(view.intent)}
        </p>
        {view.components.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {view.components.map((c) => (
              <span
                key={c}
                className={`inline-flex px-1.5 py-0.5 rounded text-xs ${
                  INTERACTIVE.has(c.toLowerCase())
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 text-xs">
        {hasSuccess && (
          <span className="text-green-600 font-medium" title="User followed up — success">
            ✓ follow-up
          </span>
        )}
        {hasAction && (
          <span className="text-purple-600 font-medium" title="User clicked a component">
            ✓ {view.action_count} click{view.action_count > 1 ? "s" : ""}
          </span>
        )}
        {!hasSuccess && !hasAction && isInteractive && (
          <span className="text-gray-300 text-xs">no interaction</span>
        )}
        <span className="text-gray-300">{fmt(view.created_at)}</span>
      </div>
    </div>
  );
}

export function SessionRow({ session }: { session: SessionSummary }) {
  const [expanded, setExpanded] = useState(false);
  const [views, setViews] = useState<ViewDetail[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!expanded && views === null) {
      setLoading(true);
      const detail = await getSessionDetail(session.session_id);
      setViews(detail.views);
      setLoading(false);
    }
    setExpanded((e) => !e);
  }

  const title = cleanIntent(session.title);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <button
        onClick={toggle}
        className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              <span className="font-mono">{shortId(session.session_id)}</span>
              <span className="mx-1.5">·</span>
              {fmt(session.started_at)}
              <span className="mx-1.5">·</span>
              {session.view_count} message{session.view_count !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <p className={`text-sm font-semibold ${rateColor(session.success_rate)}`}>
                {(session.success_rate * 100).toFixed(0)}% success
              </p>
              <p className="text-xs text-gray-400">
                {session.success_count}/{session.view_count} engaged
              </p>
            </div>
            <span className="text-gray-400 text-xs w-4">
              {expanded ? "▲" : "▼"}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
          {loading && (
            <p className="text-sm text-gray-400 py-3">Loading...</p>
          )}
          {views !== null && views.length === 0 && (
            <p className="text-sm text-gray-400 py-3">No messages in this session.</p>
          )}
          {views !== null &&
            views.map((v, i) => <ViewRow key={v.view_id} view={v} idx={i} />)}
        </div>
      )}
    </div>
  );
}
