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
        width: "100%",
        height: "100%",
        background: isDark ? "#111113" : "#ffffff",
        overflow: "hidden",
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
          const BUTTON_VARIANTS = new Set(["button", "submitbutton", "iconbutton", "buttongroup"]);
          const rawType = action.type?.toLowerCase() ?? "button";
          const compId = BUTTON_VARIANTS.has(rawType) ? "button" : rawType;
          trackEvent({
            session_id: ctx.threadId,
            view_id: ctx.responseId,
            event_type: "action",
            component_id: compId,
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
