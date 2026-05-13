"use client";

import { useRef } from "react";
import { useTheme } from "next-themes";
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
  const currentCtx = useRef<{ threadId: string; responseId: string } | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      style={{
        position: "fixed",
        top: "57px",
        left: "16px",
        right: "16px",
        bottom: "16px",
        zIndex: 10,
        background: isDark ? "#111113" : "#ffffff",
        border: `1px solid ${isDark ? "#27272a" : "#e5e7eb"}`,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: isDark
          ? "0 0 0 1px #1c1c1f"
          : "0 1px 3px 0 rgb(0 0 0 / 0.06)",
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
          currentCtx.current = { threadId, responseId };
          return resp;
        }}
        onAction={(action) => {
          const ctx = currentCtx.current;
          if (!ctx) return;
          trackEvent({
            session_id: ctx.threadId,
            view_id: ctx.responseId,
            event_type: "action",
            component_id: action.type?.toLowerCase() ?? "button",
            action_type: "click",
            payload: action.params ?? {},
          });
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
        theme={{ mode: isDark ? "dark" : "light" }}
      />
    </div>
  );
}
