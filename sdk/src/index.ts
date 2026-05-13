import { setConfig, getConfig, post } from "./client";
import type { LensConfig, StartViewOptions, TrackEventOptions } from "./types";

let _currentViewId: string | null = null;
let _sessionId: string | null = null;

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getOrCreateSession(): string {
  if (_sessionId) return _sessionId;
  try {
    const stored = localStorage.getItem("genui_lens_session");
    if (stored) {
      _sessionId = stored;
      return _sessionId;
    }
  } catch {}
  _sessionId = generateId();
  try {
    localStorage.setItem("genui_lens_session", _sessionId);
  } catch {}
  return _sessionId;
}

export function init(config: LensConfig): void {
  setConfig(config);
}

export async function startView(
  options: StartViewOptions
): Promise<{ viewId: string }> {
  const config = getConfig();
  const sessionId = options.sessionId ?? getOrCreateSession();
  const viewId = generateId();

  const res = (await post("/v1/views", {
    project_id: config.projectId,
    view_id: viewId,
    session_id: sessionId,
    intent: options.intent,
    library: options.library,
    c1_message_id: options.c1MessageId ?? null,
    thread_id: options.threadId ?? null,
    metadata: options.metadata ?? {},
    components: (options.components ?? []).map((c) => ({
      component_id: c.componentId,
      type: c.type,
      path: c.path ?? null,
      metadata: c.metadata ?? {},
    })),
    timestamp: new Date().toISOString(),
  })) as { view_id?: string } | null;

  const resolvedId = res?.view_id ?? viewId;
  _currentViewId = resolvedId;
  return { viewId: resolvedId };
}

export async function trackEvent(options: TrackEventOptions): Promise<void> {
  const config = getConfig();
  const sessionId = options.sessionId ?? getOrCreateSession();

  await post("/v1/events", {
    project_id: config.projectId,
    session_id: sessionId,
    view_id: options.viewId ?? _currentViewId ?? null,
    event_id: generateId(),
    event_type: options.eventType,
    component_id: options.componentId ?? null,
    action_type: options.actionType ?? null,
    business_type: options.businessType ?? null,
    payload: options.payload ?? {},
    timestamp: new Date().toISOString(),
  });
}

export type { LensConfig, StartViewOptions, TrackEventOptions, ComponentDef } from "./types";
