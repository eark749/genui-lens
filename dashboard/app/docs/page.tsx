"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "quick-install", label: "Quick Install" },
  { id: "use-cases", label: "Use Cases" },
  { id: "typescript-example", label: "TypeScript Example" },
  { id: "api-reference", label: "API Reference" },
  { id: "what-shows-up-where", label: "What shows up where" },
];

export default function DocsPage() {
  const [activeId, setActiveId] = useState("introduction");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex gap-12 max-w-5xl">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Breadcrumb + badge row */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium tracking-wide uppercase">
            Getting Started
          </span>
        </div>

        {/* Title block */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 leading-tight">
            What is GenUI Lens?
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-zinc-500">
            Observability and analytics for AI-generated UIs built with Thesys C1.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-5 mb-10">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 text-xs font-medium">
            @genui-lens/sdk · v0.1.1
          </span>
          <a
            href="https://www.npmjs.com/package/@genui-lens/sdk"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:opacity-80 transition-opacity"
          >
            ↗ npm
          </a>
        </div>

        {/* Introduction */}
        <Section id="introduction" title="Introduction">
          <p>
            When you build AI-native apps with{" "}
            <a href="https://thesys.dev" target="_blank" rel="noreferrer" className="text-purple-600 dark:text-purple-400 underline underline-offset-2">
              Thesys C1
            </a>
            , the AI dynamically generates React UI on the fly. You get rich, interactive interfaces — but you
            have no visibility into what the AI is actually rendering, which components users interact with, or
            which AI responses drive real business outcomes.
          </p>
          <p className="mt-3">
            <strong className="text-gray-900 dark:text-zinc-100">GenUI Lens</strong> fills that gap.
            It tracks every AI-generated view, every button click, every form submission, and every follow-up message
            — and surfaces them in a dashboard so you can measure what matters.
          </p>

          {/* Video placeholder */}
          <div
            id="video-placeholder"
            className="mt-6 rounded-xl overflow-hidden border border-gray-200 dark:border-[#27272a] aspect-video bg-gray-50 dark:bg-[#111113] flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 dark:text-zinc-600">Demo video coming soon</p>
            </div>
          </div>

          {/* Key features */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "📊", title: "View analytics", desc: "See every AI-generated UI render — intent, frequency, success rate." },
              { icon: "🖱️", title: "Interaction tracking", desc: "Count clicks, fills, and submissions per component type." },
              { icon: "✅", title: "Business outcomes", desc: "Know which AI responses lead to real user actions." },
              { icon: "💬", title: "Conversation replay", desc: "Replay full sessions to see exactly what the user saw and did." },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-gray-200 dark:border-[#27272a] p-4 bg-white dark:bg-[#111113]"
              >
                <div className="text-xl mb-2">{f.icon}</div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Quick Install */}
        <Section id="quick-install" title="Quick Install">
          <p className="mb-4">
            Install the SDK in your Thesys C1 app. It works with Next.js, Vite, Remix — any framework.
          </p>

          <SubHeading>1. Install the package</SubHeading>
          <CodeBlock lang="bash" code="npm install @genui-lens/sdk" />

          <SubHeading className="mt-6">2. Add environment variables</SubHeading>
          <CodeBlock
            lang=".env.local"
            code={`NEXT_PUBLIC_LENS_API_KEY=lens_your_api_key_here
NEXT_PUBLIC_LENS_BACKEND=https://your-lens-backend.com
NEXT_PUBLIC_LENS_PROJECT_ID=your-project-id`}
          />
          <Note className="mt-3">
            Get your API key and project ID from the{" "}
            <a href="/projects" className="underline underline-offset-2">Projects</a> page.
            Deploy the backend to Railway, Render, or Fly.io — or run it locally on port 8000.
          </Note>

          <SubHeading className="mt-6">3. Initialise once at app startup</SubHeading>
          <CodeBlock
            lang="typescript"
            code={`// app/layout.tsx  (or _app.tsx / main.tsx)
import { init } from "@genui-lens/sdk";

init({
  apiKey:    process.env.NEXT_PUBLIC_LENS_API_KEY!,
  backendUrl: process.env.NEXT_PUBLIC_LENS_BACKEND!,
  projectId: process.env.NEXT_PUBLIC_LENS_PROJECT_ID!,
});`}
          />
        </Section>

        {/* Use Cases */}
        <Section id="use-cases" title="Use Cases">
          <div className="space-y-4">
            {[
              {
                title: "Which AI-generated forms get submitted?",
                desc: "Track views with intent = the user prompt, then measure which ones fire a business event (form submit). The Tasks page shows success rate per intent automatically.",
                badge: "Tasks",
              },
              {
                title: "Which buttons do users actually click?",
                desc: "Every onAction callback fires an action event tagged with the component type. The UI Elements page aggregates clicks per component across all views.",
                badge: "UI Elements",
              },
              {
                title: "Which conversations go beyond one message?",
                desc: "A follow-up message fires a business event on the previous view. Conversations page shows which intents get follow-ups vs dead ends.",
                badge: "Conversations",
              },
              {
                title: "Where do users drop off in a multi-step flow?",
                desc: "Session replay in Conversations lets you see the full thread — which AI response lost the user.",
                badge: "Conversations",
              },
            ].map((u) => (
              <div
                key={u.title}
                className="rounded-lg border border-gray-200 dark:border-[#27272a] p-4 bg-white dark:bg-[#111113]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{u.title}</h3>
                  <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 font-medium">
                    {u.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2 leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* TypeScript Example */}
        <Section id="typescript-example" title="TypeScript Example">
          <p className="mb-4">
            Full wiring for a Next.js app using <Code>C1Chat</Code> from{" "}
            <Code>@thesysai/genui-sdk</Code>. This is the same pattern the dashboard chat page uses.
          </p>

          <SubHeading>app/page.tsx</SubHeading>
          <CodeBlock
            lang="typescript"
            code={`"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { init } from "@genui-lens/sdk";

const C1Chat = dynamic(
  () => import("@thesysai/genui-sdk").then((m) => m.C1Chat),
  { ssr: false }
);

const LENS_API_KEY = process.env.NEXT_PUBLIC_LENS_API_KEY ?? "";
const LENS_BACKEND = process.env.NEXT_PUBLIC_LENS_BACKEND ?? "http://localhost:8000";
const LENS_PROJECT = process.env.NEXT_PUBLIC_LENS_PROJECT_ID ?? "";

export default function ChatPage() {
  const ctx = useRef<{ threadId: string; responseId: string } | null>(null);

  useEffect(() => {
    if (LENS_API_KEY) init({ apiKey: LENS_API_KEY, backendUrl: LENS_BACKEND });
  }, []);

  async function trackEvent(body: object) {
    return fetch(\`\${LENS_BACKEND}/v1/events\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${LENS_API_KEY}\`,
      },
      body: JSON.stringify({ project_id: LENS_PROJECT, ...body }),
    }).catch(console.error);
  }

  return (
    <C1Chat
      processMessage={async ({ threadId, messages, responseId, abortController }) => {
        ctx.current = { threadId, responseId };

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
        return resp;
      }}
      onAction={(action) => {
        if (!ctx.current) return;
        const { threadId, responseId } = ctx.current;

        // Normalise all button variants → "button"
        const BUTTON_TYPES = new Set(["button", "submitbutton", "iconbutton", "buttongroup"]);
        const compId = BUTTON_TYPES.has(action.type?.toLowerCase() ?? "")
          ? "button"
          : action.type?.toLowerCase() ?? "button";

        trackEvent({
          session_id: threadId,
          view_id: responseId,
          event_type: "action",
          component_id: compId,
          action_type: "click",
          payload: action.params ?? {},
        });

        trackEvent({
          session_id: threadId,
          view_id: responseId,
          event_type: "business",
          action_type: action.type,
          payload: action.params ?? {},
        });
      }}
      agentName="Your AI Assistant"
      theme={{ mode: "dark" }}
    />
  );
}`}
          />

          <SubHeading className="mt-6">app/api/chat/route.ts</SubHeading>
          <CodeBlock
            lang="typescript"
            code={`import { NextRequest, NextResponse } from "next/server";
import { makeC1Response } from "@thesysai/genui-sdk/server";

export const runtime = "nodejs"; // must be nodejs — edge kills in-memory thread store

const THESYS_BASE = "https://api.thesys.dev/v1/embed";
const MODEL       = "c1/anthropic/claude-sonnet-4.6/v-20260331";
const LENS_BACKEND = process.env.LENS_BACKEND ?? "http://localhost:8000";
const LENS_API_KEY = process.env.LENS_API_KEY ?? "";
const LENS_PROJECT = process.env.LENS_PROJECT_ID ?? "";

type Msg = { role: string; content: string; id?: string };
const store: Record<string, Msg[]> = {};

export async function POST(req: NextRequest) {
  const { prompt, threadId, responseId } = await req.json();

  const thread = (store[threadId] ??= []);
  thread.push(prompt);

  // Register the view before streaming (avoids FK violations)
  await fetch(\`\${LENS_BACKEND}/v1/views\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${LENS_API_KEY}\`,
    },
    body: JSON.stringify({
      project_id: LENS_PROJECT,
      view_id: responseId,
      session_id: threadId,
      thread_id: threadId,
      intent: prompt.content?.slice(0, 120) ?? "chat",
      library: "@thesysai/genui-sdk",
      components: [],
    }),
  });

  const { responseStream, writeContent, end, getAssistantMessage } = makeC1Response();

  (async () => {
    const resp = await fetch(\`\${THESYS_BASE}/chat/completions\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${process.env.THESYS_API_KEY}\`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: thread.map(({ role, content }) => ({ role, content })),
        stream: true,
      }),
    });

    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split("\\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const content = JSON.parse(data).choices?.[0]?.delta?.content;
          if (content) await writeContent(content);
        } catch {}
      }
    }
    await end();

    const assistantMsg = getAssistantMessage();
    thread.push({ ...assistantMsg, id: responseId });
  })();

  return new NextResponse(
    responseStream.pipeThrough(
      new TransformStream<string, Uint8Array>({
        transform(chunk, ctrl) { ctrl.enqueue(new TextEncoder().encode(chunk)); },
      })
    ),
    { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
  );
}`}
          />
        </Section>

        {/* API Reference */}
        <Section id="api-reference" title="API Reference">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                <Code>init(config)</Code>
              </h3>
              <p className="text-sm text-gray-500 dark:text-zinc-500 mb-3">Call once at app startup.</p>
              <ParamTable
                rows={[
                  ["apiKey", "string", "required", "Bearer token for Lens backend auth"],
                  ["backendUrl", "string", "required", "Base URL of your Lens backend (no trailing slash)"],
                  ["projectId?", "string", "optional", "Scopes all data to this project"],
                ]}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                <Code>startView(options)</Code>
              </h3>
              <p className="text-sm text-gray-500 dark:text-zinc-500 mb-3">
                Create a view record. Call once per AI response, before streaming starts.
              </p>
              <ParamTable
                rows={[
                  ["intent", "string", "required", "User prompt / intent for this response"],
                  ["library", "string", "required", '"c1" | "c1chat" | "agent_builder"'],
                  ["threadId?", "string", "optional", "Groups views into sessions"],
                  ["sessionId?", "string", "optional", "Override auto-generated session ID"],
                  ["components?", "ComponentDef[]", "optional", "Components in this view"],
                  ["metadata?", "object", "optional", "Extra key/value pairs"],
                ]}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                <Code>trackEvent(options)</Code>
              </h3>
              <p className="text-sm text-gray-500 dark:text-zinc-500 mb-3">
                Fire an analytics event against a view.
              </p>
              <ParamTable
                rows={[
                  ["viewId", "string", "required", "ID returned by startView()"],
                  ["eventType", '"action" | "business" | "error"', "required", "Type of event"],
                  ["componentId?", "string", "optional", "Component that triggered the event"],
                  ["actionType?", "string", "optional", '"click" | "fill" | "follow_up" | …'],
                  ["payload?", "object", "optional", "Any extra data to store"],
                ]}
              />
            </div>
          </div>
        </Section>

        {/* What shows up where */}
        <Section id="what-shows-up-where" title="What shows up where">
          <div className="space-y-2">
            {[
              {
                call: "startView()",
                page: "Tasks · Conversations · UI Elements",
                desc: "Creates the view record. Each view = one AI response. The intent becomes the task label.",
              },
              {
                call: "trackEvent({ eventType: 'action' })",
                page: "UI Elements → Interactions",
                desc: "Increments the interaction count for the matched component_id.",
              },
              {
                call: "trackEvent({ eventType: 'business' })",
                page: "Tasks → Success Rate · Conversations",
                desc: "Counts as a success for that view's task. Success rate = business events ÷ total views.",
              },
              {
                call: "components[] in startView",
                page: "UI Elements → Appearances",
                desc: "Each component_id gets an appearance count. Category (Input / Action / Display) set in categories.ts.",
              },
            ].map((r) => (
              <div
                key={r.call}
                className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-[#27272a] rounded-lg p-3"
              >
                <div className="flex flex-wrap items-start gap-2">
                  <Code>{r.call}</Code>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                    → {r.page}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1.5">{r.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* On this page — right sidebar */}
      <div className="hidden lg:block w-48 flex-shrink-0">
        <div className="sticky top-8">
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider mb-3">
            On this page
          </p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`block text-xs py-1 transition-colors ${
                  activeId === s.id
                    ? "text-purple-600 dark:text-purple-400 font-medium"
                    : "text-gray-400 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-400"
                }`}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-12 scroll-mt-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-4 pb-2 border-b border-gray-100 dark:border-[#1c1c1f]">
        {title}
      </h2>
      <div className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">{children}</div>
    </div>
  );
}

function SubHeading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-sm font-semibold text-gray-800 dark:text-zinc-300 mb-2 ${className}`}>
      {children}
    </h3>
  );
}

function Note({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg text-xs text-amber-700 dark:text-amber-400 ${className}`}>
      {children}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-gray-100 dark:bg-[#27272a] text-gray-800 dark:text-zinc-300 px-1.5 py-0.5 rounded">
      {children}
    </code>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-[#27272a] group">
      <div className="bg-gray-100 dark:bg-[#1c1c1f] px-4 py-1.5 flex items-center justify-between border-b border-gray-200 dark:border-[#27272a]">
        <span className="text-xs text-gray-400 dark:text-zinc-600 font-mono">{lang}</span>
        <button
          onClick={copy}
          className="text-xs text-gray-400 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>
      <pre className="bg-gray-50 dark:bg-[#0d0d0f] text-gray-800 dark:text-zinc-300 text-xs font-mono p-4 overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function ParamTable({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="border-b border-gray-100 dark:border-[#1c1c1f]">
          {["param", "type", "", "description"].map((h) => (
            <th key={h} className="text-left py-1.5 pr-4 text-gray-400 dark:text-zinc-600 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50 dark:divide-[#1c1c1f]">
        {rows.map(([param, type, req, desc]) => (
          <tr key={param}>
            <td className="py-1.5 pr-4 font-mono text-gray-800 dark:text-zinc-300">{param}</td>
            <td className="py-1.5 pr-4 text-purple-600 dark:text-purple-400">{type}</td>
            <td className="py-1.5 pr-4 text-gray-400 dark:text-zinc-600">{req}</td>
            <td className="py-1.5 text-gray-500 dark:text-zinc-500">{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
