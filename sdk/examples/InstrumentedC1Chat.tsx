"use client";

import { useState, useEffect } from "react";
import { C1Chat } from "@thesysai/genui-sdk";
import { startView, trackEvent } from "@genui-lens/sdk";

interface Props {
  apiUrl?: string;
  threadId?: string;
  onAction?: (event: any) => void;
  [key: string]: any;
}

export function InstrumentedC1Chat({ threadId, onAction, ...rest }: Props) {
  const [viewId, setViewId] = useState<string | null>(null);

  useEffect(() => {
    startView({
      intent: "conversational",
      library: "c1chat",
      threadId,
    }).then((r) => setViewId(r.viewId));
  }, [threadId]);

  function handleAction(event: any) {
    trackEvent({
      viewId: viewId ?? undefined,
      eventType: "action",
      componentId: event?.type ?? "unknown",
      actionType: "click",
      payload: {
        humanFriendlyMessage: event?.humanFriendlyMessage,
        llmFriendlyMessage: event?.llmFriendlyMessage,
        params: event?.params,
        threadId: event?.threadId,
      },
    });
    onAction?.(event);
  }

  return <C1Chat {...rest} threadId={threadId} onAction={handleAction} />;
}
