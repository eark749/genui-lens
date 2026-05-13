import { getSessions } from "@/lib/api";
import { SessionRow } from "@/components/SessionRow";

export const revalidate = 0;

export default async function ConversationsPage() {
  const sessions = await getSessions();

  const totalSessions = sessions.length;
  const engaged = sessions.filter((s) => s.success_count > 0).length;
  const avgSuccess =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.success_rate, 0) / sessions.length
      : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Conversations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Each row is one conversation thread. Click to see the full message timeline.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Sessions", value: totalSessions },
          { label: "Had Engagement", value: engaged },
          { label: "Avg Success Rate", value: `${(avgSuccess * 100).toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
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
        <p><strong>✓ follow-up</strong> — user sent another message (success event)</p>
        <p><strong>✓ clicks</strong> — user clicked a Button or Form in AI-generated UI</p>
        <p><strong className="text-purple-700">Purple chips</strong> — interactive components · <strong>Gray chips</strong> — display-only (charts, cards)</p>
      </div>
    </div>
  );
}
