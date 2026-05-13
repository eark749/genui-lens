import { getComponentSummary } from "@/lib/api";

export const revalidate = 0;

export default async function ComponentsPage() {
  const components = await getComponentSummary();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Component Performance</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Component", "Type", "Views", "Actions", "Errors"].map((h) => (
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
            {components.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No components tracked yet.
                </td>
              </tr>
            )}
            {components.map((row) => (
              <tr key={row.component_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-900">{row.component_id}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{row.view_count}</td>
                <td className="px-4 py-3 text-gray-600">{row.action_count}</td>
                <td
                  className={`px-4 py-3 font-medium ${
                    row.error_count > 0 ? "text-red-600" : "text-gray-300"
                  }`}
                >
                  {row.error_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
