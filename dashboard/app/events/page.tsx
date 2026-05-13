import { getEvents } from "@/lib/api";

export const revalidate = 0;

const TYPE_BADGE: Record<string, string> = {
  view: "bg-blue-100 text-blue-700",
  action: "bg-purple-100 text-purple-700",
  business: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
};

function fmt(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default async function EventsPage() {
  const events = await getEvents(100);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Event Log</h1>
        <span className="text-sm text-gray-400">{events.length} events</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Time", "Intent", "Type", "Component", "Action / Business", "Payload"].map((h) => (
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
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No events yet.
                </td>
              </tr>
            )}
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap tabular-nums">{fmt(e.timestamp)}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 max-w-[160px] truncate">
                  {e.intent ?? "—"}
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
                <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[220px] truncate">
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
