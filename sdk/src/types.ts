export interface LensConfig {
  apiKey: string;
  endpoint: string;
  projectId: string;
}

export interface ComponentDef {
  componentId: string;
  type: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

export interface StartViewOptions {
  sessionId?: string;
  intent: string;
  library: "c1" | "c1chat" | "agent_builder" | string;
  c1MessageId?: string;
  threadId?: string;
  metadata?: Record<string, unknown>;
  components?: ComponentDef[];
}

export interface TrackEventOptions {
  sessionId?: string;
  viewId?: string;
  eventType: "view" | "action" | "business" | "error";
  componentId?: string;
  actionType?: string;
  businessType?: string;
  payload?: Record<string, unknown>;
}
