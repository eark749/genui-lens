import { getViewSummary } from "@/lib/api";

export const revalidate = 0;

function pct(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

function rateColor(rate: number) {
  if (rate >= 0.7) return "text-green-600";
  if (rate >= 0.4) return "text-yellow-600";
  return "text-red-500";
}

export default async function IntentsPage() {
  const intents = await getViewSummary();

  const totalViews = intents.reduce((s, i) => s + i.view_count, 0);
  const totalSuccess = intents.reduce((s, i) => s + i.success_events, 0);
  const avgRate = totalViews > 0 ? totalSuccess / totalViews : 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Intent Performance</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Views", value: totalViews },
          { label: "Total Successes", value: totalSuccess },
          { label: "Avg Success Rate", value: pct(avgRate) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Intent", "Views", "Successes", "Success Rate"].map((h) => (
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
            {intents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No views tracked yet. Integrate the SDK and fire some events.
                </td>
              </tr>
            )}
            {intents.map((row) => (
              <tr key={row.intent} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-900">{row.intent}</td>
                <td className="px-4 py-3 text-gray-600">{row.view_count}</td>
                <td className="px-4 py-3 text-gray-600">{row.success_events}</td>
                <td className={`px-4 py-3 font-semibold ${rateColor(row.success_rate)}`}>
                  {pct(row.success_rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
