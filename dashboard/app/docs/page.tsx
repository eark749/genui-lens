export default function DocsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 text-xs font-medium">
            @genui-lens/sdk · v0.1.1
          </span>
          <a
            href="https://www.npmjs.com/package/@genui-lens/sdk"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium hover:opacity-80 transition-opacity"
          >
            ↗ npmjs.com
          </a>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">SDK Docs</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-500">
          <Code>@genui-lens/sdk</Code> is a TypeScript SDK that adds observability to any app built
          with Thesys C1 or C1Chat. Install it, call <Code>init()</Code>, and every view and interaction
          flows into this dashboard automatically.
        </p>
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg text-xs text-amber-700 dark:text-amber-400">
          <strong>Requires a hosted backend.</strong> The SDK sends data to a GenUI Lens backend instance.
          Clone the backend repo, deploy it (Railway, Render, Fly.io), then pass its URL as <Code>endpoint</Code> in <Code>init()</Code>.
        </div>
      </div>

      <Section title="Install">
        <CodeBlock lang="bash" code={`npm install @genui-lens/sdk`} />
        <p className="mt-3">Works in any framework — Next.js, Vite, Remix. TypeScript and JavaScript both supported.</p>
      </Section>

      <Section title="initialise once">
        <p className="mb-3">Call <Code>init()</Code> once at app startup — before any <Code>startView</Code> or <Code>trackEvent</Code> calls.</p>
        <CodeBlock lang="typescript" code={`import { init } from "@genui-lens/sdk";

init({
  apiKey: process.env.NEXT_PUBLIC_GENUI_API_KEY!,   // your Lens API key
  endpoint: process.env.NEXT_PUBLIC_LENS_ENDPOINT!, // e.g. https://your-lens-backend.com
  projectId: process.env.NEXT_PUBLIC_GENUI_PROJECT_ID!,
});`} />
        <div className="mt-4 space-y-2">
          {[
            { key: "apiKey", desc: "API key issued by the GenUI Lens backend. Sent as Bearer token on every request." },
            { key: "endpoint", desc: "Base URL of the GenUI Lens backend (no trailing slash)." },
            { key: "projectId", desc: "Your project ID. All data is scoped to this project." },
          ].map((r) => (
            <div key={r.key} className="flex gap-3 text-xs">
              <Code>{r.key}</Code>
              <span className="text-gray-500 dark:text-zinc-500">{r.desc}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Core API">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2">startView(options)</h3>
            <p className="mb-3">
              Call when the AI starts rendering a response. Creates a <em>view</em> record — the unit
              that success rate and component appearances are counted against.
            </p>
            <CodeBlock lang="typescript" code={`const { viewId } = await startView({
  intent: "Show me a sales dashboard",   // what the user asked
  library: "c1chat",                      // "c1" | "c1chat" | "agent_builder"
  threadId: "thread-abc",                // optional — groups views into sessions
  components: [                          // optional — components in this response
    { componentId: "button", type: "Button", path: "$" },
    { componentId: "barchart", type: "BarChart", path: "$.charts[0]" },
  ],
});`} />
            <table className="mt-3 w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#1c1c1f]">
                  <th className="text-left py-1.5 pr-4 text-gray-500 dark:text-zinc-500 font-medium">option</th>
                  <th className="text-left py-1.5 text-gray-500 dark:text-zinc-500 font-medium">description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#1c1c1f]">
                {[
                  ["intent", "string", "The user's message / intent for this response"],
                  ["library", "string", "Which Thesys library rendered the response"],
                  ["threadId?", "string", "Thread ID — views sharing a threadId group into one session"],
                  ["sessionId?", "string", "Override session ID (auto-generated + persisted in localStorage if omitted)"],
                  ["components?", "ComponentDef[]", "Components rendered in this view"],
                  ["metadata?", "object", "Any extra key/value pairs to store"],
                ].map(([opt, type, desc]) => (
                  <tr key={opt}>
                    <td className="py-1.5 pr-4 font-mono text-gray-800 dark:text-zinc-300">{opt}</td>
                    <td className="py-1.5 pr-4 text-purple-600 dark:text-purple-400">{type}</td>
                    <td className="py-1.5 text-gray-500 dark:text-zinc-500">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2">trackEvent(options)</h3>
            <p className="mb-3">
              Fire an analytics event. Two event types matter most:
              <Code>action</Code> (component clicked) and <Code>business</Code> (success signal).
            </p>
            <CodeBlock lang="typescript" code={`// Action event — user clicked a component
await trackEvent({
  viewId,
  eventType: "action",
  componentId: "button",   // must match a component_id in the Component table
  actionType: "click",
  payload: { label: "Submit" },
});

// Business event — user engaged (follow-up message, form submit)
await trackEvent({
  viewId,
  eventType: "business",
  actionType: "follow_up",
});`} />
          </div>
        </div>
      </Section>

      <Section title="Drop-in C1Chat wrapper">
        <p className="mb-3">
          The SDK ships an <Code>InstrumentedC1Chat</Code> example that wraps <Code>C1Chat</Code>
          and wires up tracking automatically. Copy it from <Code>sdk/examples/InstrumentedC1Chat.tsx</Code>.
        </p>
        <CodeBlock lang="typescript" code={`"use client";

import { useState, useEffect } from "react";
import { C1Chat } from "@thesysai/genui-sdk";
import { startView, trackEvent } from "@genui-lens/sdk";

export function InstrumentedC1Chat({ threadId, onAction, ...rest }) {
  const [viewId, setViewId] = useState(null);

  useEffect(() => {
    startView({ intent: "conversational", library: "c1chat", threadId })
      .then((r) => setViewId(r.viewId));
  }, [threadId]);

  function handleAction(event) {
    trackEvent({
      viewId,
      eventType: "action",
      componentId: event?.type ?? "unknown",
      actionType: "click",
      payload: event?.params,
    });
    onAction?.(event);
  }

  return <C1Chat {...rest} threadId={threadId} onAction={handleAction} />;
}`} />
      </Section>

      <Section title="What shows up where">
        <div className="space-y-2">
          {[
            { call: "startView()", page: "Tasks, Conversations, UI Elements", desc: "Creates the view record. Each view = one AI response. The intent becomes the task label." },
            { call: "trackEvent({ eventType: 'action' })", page: "UI Elements → Interactions", desc: "Increments the interaction count for the matched component_id." },
            { call: "trackEvent({ eventType: 'business' })", page: "Tasks → Success Rate, Conversations", desc: "Counts as a success for that view's task. Success rate = business events / total views." },
            { call: "components[] in startView", page: "UI Elements → Appearances", desc: "Each component_id gets an appearance count. Interactive vs display category set in the dashboard." },
          ].map((r) => (
            <div key={r.call} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-[#27272a] rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Code>{r.call}</Code>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5 flex-shrink-0">→ {r.page}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1.5">{r.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="TypeScript types">
        <CodeBlock lang="typescript" code={`import type {
  LensConfig,       // { apiKey, endpoint, projectId }
  StartViewOptions, // options for startView()
  TrackEventOptions,// options for trackEvent()
  ComponentDef,     // { componentId, type, path?, metadata? }
} from "@genui-lens/sdk";`} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-3 pb-2 border-b border-gray-100 dark:border-[#1c1c1f]">
        {title}
      </h2>
      <div className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">{children}</div>
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
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-[#27272a]">
      <div className="bg-gray-100 dark:bg-[#1c1c1f] px-4 py-1.5 text-xs text-gray-400 dark:text-zinc-600 font-mono border-b border-gray-200 dark:border-[#27272a]">
        {lang}
      </div>
      <pre className="bg-gray-50 dark:bg-[#0d0d0f] text-gray-800 dark:text-zinc-300 text-xs font-mono p-4 overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}
