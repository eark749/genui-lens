import { getViewSummary, getComponentSummary, getSessions } from "@/lib/api";
import { cleanIntent, isDirtyIntent, getCategory } from "@/lib/categories";

export const revalidate = 0;

function pct(r: number) {
  return `${(r * 100).toFixed(1)}%`;
}

function rateColor(r: number) {
  if (r >= 0.7) return "text-green-600";
  if (r >= 0.4) return "text-yellow-600";
  return "text-red-500";
}

export default async function OverviewPage() {
  const [intents, components, sessions] = await Promise.all([
    getViewSummary(),
    getComponentSummary(),
    getSessions(),
  ]);

  const cleanIntents = intents.filter((i) => !isDirtyIntent(i.intent));

  const totalTasks = cleanIntents.length;
  const totalConversations = sessions.length;
  const avgSuccessRate =
    cleanIntents.length > 0
      ? cleanIntents.reduce((s, i) => s + i.success_rate, 0) / cleanIntents.length
      : 0;
  const engagementRate =
    sessions.length > 0
      ? sessions.filter((s) => s.success_count > 0).length / sessions.length
      : 0;

  const topTasks = [...cleanIntents]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5);

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
        <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Health of your AI-driven experiences across all tasks and conversations.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top tasks */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Top Tasks by Volume</h2>
            <p className="text-xs text-gray-400 mt-0.5">Most frequently requested intents</p>
          </div>
          <div className="divide-y divide-gray-50">
            {topTasks.length === 0 && (
              <p className="px-5 py-6 text-sm text-gray-400">No tasks yet.</p>
            )}
            {topTasks.map((row) => (
              <div key={row.intent} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm text-gray-800 truncate max-w-[200px]">
                  {cleanIntent(row.intent)}
                </p>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400">{row.view_count} runs</span>
                  <span className={`text-xs font-semibold ${rateColor(row.success_rate)}`}>
                    {pct(row.success_rate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top UI elements */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Top UI Elements by Interactions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Which components users actually click</p>
          </div>
          <div className="divide-y divide-gray-50">
            {topElements.length === 0 && (
              <p className="px-5 py-6 text-sm text-gray-400">No interactions yet.</p>
            )}
            {topElements.map((row) => (
              <div key={row.component_id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                    {row.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400">{row.view_count} appearances</span>
                  <span className={`text-xs font-semibold ${row.action_count > 0 ? "text-purple-600" : "text-gray-300"}`}>
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
