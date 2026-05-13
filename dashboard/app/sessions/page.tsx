import { getSessions } from "@/lib/api";
import { SessionRow } from "@/components/SessionRow";

export const revalidate = 0;

export default async function SessionsPage() {
  const sessions = await getSessions();

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s) => s.success_count > 0).length;
  const avgSuccess =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.success_rate, 0) / sessions.length
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sessions</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Each row is one conversation. Click to expand the full thread.
          </p>
        </div>
        <span className="text-sm text-gray-400">{totalSessions} sessions</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Sessions", value: totalSessions },
          { label: "Had Engagement", value: activeSessions },
          { label: "Avg Success Rate", value: `${(avgSuccess * 100).toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-10 text-center text-gray-400 text-sm">
          No sessions yet. Go to Chat and start a conversation.
        </div>
      )}

      <div>
        {sessions.map((s) => (
          <SessionRow key={s.session_id} session={s} />
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700 space-y-1">
        <p><span className="font-semibold">✓ follow-up</span> — user sent another message after this response (counts as success)</p>
        <p><span className="font-semibold">✓ clicks</span> — user clicked a Button/Form in AI-generated UI</p>
        <p><span className="font-semibold text-purple-700">Purple chips</span> — interactive components (Button, Form, etc.)</p>
        <p><span className="font-semibold text-gray-600">Gray chips</span> — display-only (Card, BarChart, etc.) — clicks here don&apos;t count</p>
      </div>
    </div>
  );
}
