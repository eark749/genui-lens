"use client";

import { useState } from "react";
import { ComponentStat } from "@/lib/api";
import { getCategory, Category } from "@/lib/categories";

const CATEGORY_COLORS: Record<Category, string> = {
  Action: "bg-purple-100 text-purple-700",
  Input: "bg-blue-100 text-blue-700",
  Display: "bg-gray-100 text-gray-600",
};

const FILTERS: Array<Category | "All"> = ["All", "Action", "Input", "Display"];

function interactionRate(actions: number, views: number): string {
  if (views === 0) return "—";
  return `${((actions / views) * 100).toFixed(0)}%`;
}

function rateColor(actions: number, views: number): string {
  if (views === 0) return "text-gray-300";
  const r = actions / views;
  if (r >= 0.3) return "text-purple-600 font-semibold";
  if (r > 0) return "text-purple-400";
  return "text-gray-300";
}

export function UIElementsClient({ components }: { components: ComponentStat[] }) {
  const [filter, setFilter] = useState<Category | "All">("All");
  const [interactiveOnly, setInteractiveOnly] = useState(false);

  const rows = components
    .map((c) => ({ ...c, category: getCategory(c.component_id) }))
    .filter((c) => filter === "All" || c.category === filter)
    .filter((c) => !interactiveOnly || c.action_count > 0 || c.category !== "Display")
    .sort((a, b) => b.view_count - a.view_count);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">UI Elements</h1>
        <p className="mt-1 text-sm text-gray-500">
          How often generated elements appear and how frequently users interact with them.
          Only <strong>Action</strong> and <strong>Input</strong> elements can receive clicks — Display elements are visual only.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
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
        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={interactiveOnly}
            onChange={(e) => setInteractiveOnly(e.target.checked)}
            className="rounded"
          />
          Interactive only
        </label>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Element", "Category", "Appearances", "Interactions", "Interaction Rate"].map((h) => (
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No elements match.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.component_id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-mono text-gray-900 text-sm">{row.component_id}</p>
                    <p className="text-xs text-gray-400">{row.type}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[row.category]}`}>
                    {row.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{row.view_count}</td>
                <td className="px-4 py-3 text-gray-600">
                  {row.category === "Display" && row.action_count === 0 ? (
                    <span className="text-gray-300">—</span>
                  ) : (
                    row.action_count
                  )}
                </td>
                <td className={`px-4 py-3 ${rateColor(row.action_count, row.view_count)}`}>
                  {row.category === "Display" && row.action_count === 0
                    ? <span className="text-gray-300 font-normal">display only</span>
                    : interactionRate(row.action_count, row.view_count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
