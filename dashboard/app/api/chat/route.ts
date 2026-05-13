import { NextRequest, NextResponse } from "next/server";
import { makeC1Response } from "@thesysai/genui-sdk/server";

export const runtime = "edge";

const THESYS_BASE = "https://api.thesys.dev/v1/embed";
const MODEL = "c1/anthropic/claude-sonnet-4.6/v-20260331";

type Msg = { role: string; content: string; id?: string };
const store: Record<string, Msg[]> = {};

function getThread(threadId: string): Msg[] {
  if (!store[threadId]) store[threadId] = [];
  return store[threadId];
}

function extractComponents(c1Content: string) {
  const matches = [...c1Content.matchAll(/= ([A-Z][a-zA-Z]+)\(/g)];
  const types = [...new Set(matches.map((m) => m[1]))];
  return types.map((t) => ({
    component_id: t.toLowerCase(),
    type: t,
    path: "$",
  }));
}

function cleanIntent(raw: string): string {
  // C1Chat appends ["User clicked: ...",{...}] to follow-up action content
  return raw
    .replace(/<[^>]*>/g, "")
    .split('["')[0]
    .trim()
    .slice(0, 120) || "chat";
}

async function postToLens(path: string, body: object) {
  return fetch(`http://localhost:8000${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GENUI_API_KEY}`,
    },
    body: JSON.stringify({ project_id: process.env.GENUI_PROJECT_ID, ...body }),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  const { prompt, threadId, responseId } = (await req.json()) as {
    prompt: Msg;
    threadId: string;
    responseId: string;
  };

  const thread = getThread(threadId);
  thread.push(prompt);

  const intent = typeof prompt.content === "string"
    ? cleanIntent(prompt.content)
    : "chat";

  // Create view BEFORE streaming so FK is satisfied when onAction fires
  await postToLens("/v1/views", {
    view_id: responseId,
    session_id: threadId,
    thread_id: threadId,
    intent,
    library: "@thesysai/genui-sdk",
    components: [],
  });

  const { responseStream, writeContent, end, getAssistantMessage } = makeC1Response();

  (async () => {
    try {
      const resp = await fetch(`${THESYS_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.THESYS_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: thread.map(({ role, content }) => ({ role, content })),
          stream: true,
        }),
      });

      if (!resp.ok || !resp.body) {
        console.error("Thesys API error:", await resp.text());
        await end();
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const chunk = JSON.parse(data);
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) await writeContent(content);
          } catch {}
        }
      }

      await end();

      const assistantMsg = getAssistantMessage();
      thread.push({ ...assistantMsg, id: responseId });

      // Second view POST with actual components (different auto-id for FK safety)
      const components = extractComponents(assistantMsg.content);
      if (components.length > 0) {
        postToLens("/v1/views", {
          session_id: threadId,
          thread_id: threadId,
          intent,
          library: "@thesysai/genui-sdk",
          components,
        });
      }
    } catch (err) {
      console.error("C1 stream error:", err);
      await end().catch(() => {});
    }
  })();

  const encoder = new TextEncoder();
  const encodedStream = responseStream.pipeThrough(
    new TransformStream<string, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(encoder.encode(chunk));
      },
    })
  );

  return new NextResponse(encodedStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
