"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";

const C1Chat = dynamic(
  () => import("@thesysai/genui-sdk").then((m) => m.C1Chat),
  { ssr: false }
);

export default function ChatPage() {
  const lastCtx = useRef<{ threadId: string; responseId: string } | null>(null);

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
          lastCtx.current = { threadId, responseId };
          return fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: messages[messages.length - 1],
              threadId,
              responseId,
            }),
            signal: abortController.signal,
          });
        }}
        onAction={(action) => {
          const ctx = lastCtx.current;
          if (!ctx) return;
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: ctx.threadId,
              view_id: ctx.responseId,
              event_type: "business",
              action_type: action.type,
              payload: action.params ?? {},
            }),
          }).catch(() => {});
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
