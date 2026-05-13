"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { fetchViewSummary, fetchComponentSummary, fetchSessions } from "@/lib/client-api";
import { cleanIntent, isDirtyIntent, getCategory } from "@/lib/categories";
import { NoProject } from "@/components/NoProject";

function pct(r: number) {
  return `${(r * 100).toFixed(1)}%`;
}

function rateColor(r: number) {
  if (r >= 0.7) return "text-green-600 dark:text-green-400";
  if (r >= 0.4) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-lg bg-gray-200 dark:bg-[#1c1c1f] animate-pulse" />)}
      </div>
      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map((i) => <div key={i} className="h-64 rounded-lg bg-gray-200 dark:bg-[#1c1c1f] animate-pulse" />)}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const intentsResult = useAnalytics(fetchViewSummary, []);
  const componentsResult = useAnalytics(fetchComponentSummary, []);
  const sessionsResult = useAnalytics(fetchSessions, []);

  if (intentsResult.projectMissing) return <NoProject />;
  if (intentsResult.loading) return <Skeleton />;

  const intents = intentsResult.data;
  const components = componentsResult.data;
  const sessions = sessionsResult.data;

  const cleanIntents = intents.filter((i) => !isDirtyIntent(i.intent));
  const totalTasks = cleanIntents.length;
  const totalConversations = sessions.length;
  const avgSuccessRate = cleanIntents.length > 0
    ? cleanIntents.reduce((s, i) => s + i.success_rate, 0) / cleanIntents.length : 0;
  const engagementRate = sessions.length > 0
    ? sessions.filter((s) => s.success_count > 0).length / sessions.length : 0;

  const topTasks = [...cleanIntents].sort((a, b) => b.view_count - a.view_count).slice(0, 5);
  const topElements = [...components]
    .filter((c) => getCategory(c.component_id) === "Action" || c.action_count > 0)
    .sort((a, b) => b.action_count - a.action_count)
    .slice(0, 5);

  const kpis = [
    { label: "Total Tasks", value: totalTasks },
    { label: "Conversations", value: totalConversations },
    { label: "Avg Task Success", value: pct(avgSuccessRate) },
    { label: "Session Engagement", value: pct(engagementRate) },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Overview</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">
          Health of your AI-driven experiences across all tasks and conversations.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-[#111113] rounded-lg border border-gray-200 dark:border-[#27272a] p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111113] rounded-lg border border-gray-200 dark:border-[#27272a]">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1c1c1f]">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Top Tasks by Volume</h2>
            <p className="text-xs text-gray-400 dark:text-zinc-600 mt-0.5">Most frequently requested intents</p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-[#1c1c1f]">
            {topTasks.length === 0 && <p className="px-5 py-6 text-sm text-gray-400 dark:text-zinc-600">No tasks yet.</p>}
            {topTasks.map((row) => (
              <div key={row.intent} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors">
                <p className="text-sm text-gray-800 dark:text-zinc-300 truncate max-w-[200px]">{cleanIntent(row.intent)}</p>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400 dark:text-zinc-600">{row.view_count} runs</span>
                  <span className={`text-xs font-semibold ${rateColor(row.success_rate)}`}>{pct(row.success_rate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111113] rounded-lg border border-gray-200 dark:border-[#27272a]">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1c1c1f]">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Top UI Elements by Interactions</h2>
            <p className="text-xs text-gray-400 dark:text-zinc-600 mt-0.5">Which components users actually click</p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-[#1c1c1f]">
            {topElements.length === 0 && <p className="px-5 py-6 text-sm text-gray-400 dark:text-zinc-600">No interactions yet.</p>}
            {topElements.map((row) => (
              <div key={row.component_id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors">
                <span className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-[#27272a] text-gray-600 dark:text-zinc-400">{row.type}</span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400 dark:text-zinc-600">{row.view_count} appearances</span>
                  <span className={`text-xs font-semibold ${row.action_count > 0 ? "text-purple-600 dark:text-purple-400" : "text-gray-300 dark:text-zinc-700"}`}>
                    {row.action_count} clicks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
