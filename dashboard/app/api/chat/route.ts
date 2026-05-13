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

function decodeEntities(s: string): string {
  return s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function cleanIntent(raw: string): string {
  return decodeEntities(raw)
    .replace(/<[^>]*>/g, "")
    .split('["')[0]
    .trim()
    .slice(0, 120) || "chat";
}

async function postToLens(path: string, body: object) {
  const payload = { project_id: process.env.GENUI_PROJECT_ID, ...body };
  console.log(`[lens] POST ${path}`, JSON.stringify(payload).slice(0, 200));
  try {
    const resp = await fetch(`http://localhost:8000${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GENUI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    if (!resp.ok) {
      console.error(`[lens] ${path} ${resp.status}:`, text.slice(0, 300));
    } else {
      console.log(`[lens] ${path} OK`, text.slice(0, 100));
    }
    return resp;
  } catch (err) {
    console.error(`[lens] ${path} FETCH ERROR:`, err);
  }
}

export async function POST(req: NextRequest) {
  const { prompt, threadId, responseId } = (await req.json()) as {
    prompt: Msg;
    threadId: string;
    responseId: string;
  };

  const thread = getThread(threadId);

  // Fire events for the previous assistant response (server-side, reliable)
  const prevAssistant = [...thread].reverse().find((m) => m.role === "assistant");
  if (prevAssistant?.id) {
    // Always fire business event (user engaged by sending a follow-up)
    postToLens("/v1/events", {
      session_id: threadId,
      view_id: prevAssistant.id,
      event_type: "business",
      action_type: "follow_up",
      payload: {},
    });

    // If the message is a C1 component action (form submit / button click),
    // also fire an action event so UI Elements interaction count increments.
    // Format: {text}["User clicked: {label}",{params}]
    const content = typeof prompt.content === "string" ? decodeEntities(prompt.content) : "";
    const actionMatch = content.match(/\["User clicked:\s*([^"]+)",\s*(\{.*\})\]/s);
    if (actionMatch) {
      const label = actionMatch[1].trim();
      const params = (() => { try { return JSON.parse(actionMatch[2]); } catch { return {}; } })();

      // Fire per-field interaction events so input/select/textarea get interaction counts
      // (button click itself is handled by client-side onAction — don't double-count)
      const fieldTypes = new Set<string>();
      function collectComponentTypes(obj: unknown) {
        if (!obj || typeof obj !== "object") return;
        for (const v of Object.values(obj as Record<string, unknown>)) {
          if (v && typeof v === "object" && "componentType" in v && typeof (v as Record<string,unknown>).componentType === "string") {
            fieldTypes.add(((v as Record<string,unknown>).componentType as string).toLowerCase());
          }
          collectComponentTypes(v);
        }
      }
      collectComponentTypes(params);

      for (const compType of fieldTypes) {
        if (compType === "button") continue;
        postToLens("/v1/events", {
          session_id: threadId,
          view_id: prevAssistant.id,
          event_type: "action",
          component_id: compType,
          action_type: "fill",
          payload: {},
        });
      }
    }
  }

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
