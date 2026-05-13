const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";
const API_KEY = process.env.GENUI_API_KEY ?? "";

async function get(path: string) {
  const res = await fetch(`${BACKEND}${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Backend ${res.status} on ${path}`);
  return res.json();
}

export interface IntentStat {
  intent: string;
  view_count: number;
  success_events: number;
  success_rate: number;
}

export interface ComponentStat {
  component_id: string;
  type: string;
  view_count: number;
  action_count: number;
  error_count: number;
}

export interface EventRow {
  id: string;
  intent: string | null;
  session_id: string;
  view_id: string | null;
  event_type: string;
  component_id: string | null;
  action_type: string | null;
  business_type: string | null;
  timestamp: string;
  payload: Record<string, unknown>;
}

export async function getViewSummary(): Promise<IntentStat[]> {
  const data = await get("/v1/summary/views");
  return data.intents ?? [];
}

export async function getComponentSummary(): Promise<ComponentStat[]> {
  const data = await get("/v1/summary/components");
  return data.components ?? [];
}

export async function getEvents(limit = 100): Promise<EventRow[]> {
  const data = await get(`/debug/events?limit=${limit}`);
  return data.events ?? [];
}

export interface SessionSummary {
  session_id: string;
  title: string;
  started_at: string;
  view_count: number;
  success_count: number;
  success_rate: number;
}

export interface ViewDetail {
  view_id: string;
  intent: string;
  created_at: string;
  success_count: number;
  action_count: number;
  components: string[];
}

export interface SessionDetail {
  session_id: string;
  views: ViewDetail[];
}

export async function getSessions(): Promise<SessionSummary[]> {
  const data = await get("/v1/sessions");
  return data.sessions ?? [];
}

export async function getSessionDetail(sessionId: string): Promise<SessionDetail> {
  return get(`/v1/sessions/${sessionId}`);
}
