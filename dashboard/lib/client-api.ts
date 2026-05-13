// JWT-authenticated analytics calls for dashboard client components
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

async function get(path: string, token: string, projectId: string) {
  const url = new URL(`${BACKEND}${path}`);
  url.searchParams.set("project_id", projectId);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Backend ${res.status}`);
  }
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

export interface SessionSummary {
  session_id: string;
  title: string;
  started_at: string;
  view_count: number;
  success_count: number;
  success_rate: number;
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

export async function fetchViewSummary(token: string, projectId: string): Promise<IntentStat[]> {
  const data = await get("/v1/summary/views", token, projectId);
  return data.intents ?? [];
}

export async function fetchComponentSummary(token: string, projectId: string): Promise<ComponentStat[]> {
  const data = await get("/v1/summary/components", token, projectId);
  return data.components ?? [];
}

export async function fetchSessions(token: string, projectId: string): Promise<SessionSummary[]> {
  const data = await get("/v1/sessions", token, projectId);
  return data.sessions ?? [];
}

export async function fetchEvents(token: string, projectId: string, limit = 100): Promise<EventRow[]> {
  const data = await get(`/debug/events?limit=${limit}`, token, projectId);
  return data.events ?? [];
}
