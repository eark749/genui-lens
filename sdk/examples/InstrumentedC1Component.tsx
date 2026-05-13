"use client";

import { useState, useEffect } from "react";
import { C1Component } from "@thesysai/genui-sdk";
import { startView, trackEvent } from "@genui-lens/sdk";

interface Props {
  c1Response: string;
  isStreaming?: boolean;
  updateMessage?: (msg: string) => void;
  onAction?: (action: any) => void;
  intent?: string;
  sessionId?: string;
  threadId?: string;
  [key: string]: any;
}

export function InstrumentedC1Component({
  c1Response,
  intent = "unknown",
  sessionId,
  threadId,
  onAction,
  ...rest
}: Props) {
  const [viewId, setViewId] = useState<string | null>(null);

  useEffect(() => {
    if (!c1Response) return;
    startView({ sessionId, intent, library: "c1", threadId }).then((r) =>
      setViewId(r.viewId)
    );
  }, [c1Response]);

  function handleAction(action: any) {
    trackEvent({
      sessionId,
      viewId: viewId ?? undefined,
      eventType: "action",
      componentId: action?.type ?? "unknown",
      actionType: "click",
      payload: {
        humanFriendlyMessage: action?.humanFriendlyMessage,
        llmFriendlyMessage: action?.llmFriendlyMessage,
        params: action?.params,
        threadId: action?.threadId,
      },
    });
    onAction?.(action);
  }

  return (
    <C1Component {...rest} c1Response={c1Response} onAction={handleAction} />
  );
}
