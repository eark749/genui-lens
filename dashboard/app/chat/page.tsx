"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";

const C1Chat = dynamic(
  () => import("@thesysai/genui-sdk").then((m) => m.C1Chat),
  { ssr: false }
);

async function trackEvent(body: object) {
  return fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

export default function ChatPage() {
  // holds context of the CURRENT displayed response
  const currentCtx = useRef<{ threadId: string; responseId: string } | null>(null);

  return (
    <div
      style={{
        position: "fixed",
        top: "49px",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        background: "#fff",
      }}
    >
      <C1Chat
        processMessage={async ({ threadId, messages, responseId, abortController }) => {
          const resp = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: messages[messages.length - 1],
              threadId,
              responseId,
            }),
            signal: abortController.signal,
          });
          // Update AFTER headers arrive — view is created server-side before stream starts,
          // so by the time fetch resolves the view_id is safe to reference in onAction.
          currentCtx.current = { threadId, responseId };
          return resp;
        }}
        onAction={(action) => {
          // Fires for form submits, button clicks inside generated UI
          const ctx = currentCtx.current;
          if (!ctx) return;
          // action event — component action count
          trackEvent({
            session_id: ctx.threadId,
            view_id: ctx.responseId,
            event_type: "action",
            component_id: action.type?.toLowerCase() ?? "button",
            action_type: "click",
            payload: action.params ?? {},
          });

          // business event — success rate
          trackEvent({
            session_id: ctx.threadId,
            view_id: ctx.responseId,
            event_type: "business",
            action_type: action.type,
            payload: action.params ?? {},
          });
        }}
        agentName="GenUI Lens Assistant"
        welcomeMessage={{
          title: "GenUI Lens Chat",
          description: "Powered by Thesys C1 — ask anything and watch the AI render rich UI.",
        }}
      />
    </div>
  );
}
