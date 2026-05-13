# @genui-lens/sdk

Observability SDK for apps built with [Thesys C1](https://thesys.dev) — tracks AI-generated UI interactions, task success rates, and full conversation timelines.

## Install

```bash
npm install @genui-lens/sdk
```

## Quick start

```typescript
import { init, startView, trackEvent } from "@genui-lens/sdk";

// 1. Initialise once at app startup
init({
  apiKey: process.env.NEXT_PUBLIC_GENUI_API_KEY!,
  endpoint: process.env.NEXT_PUBLIC_LENS_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_GENUI_PROJECT_ID!,
});

// 2. When an AI response starts rendering
const { viewId } = await startView({
  intent: "Show me a sales dashboard",
  library: "c1chat",
  threadId: "thread-abc",
});

// 3. When a user interacts with a component
await trackEvent({
  viewId,
  eventType: "action",
  componentId: "button",
  actionType: "click",
  payload: { label: "Submit" },
});

// 4. When a user engages (follow-up, form submit)
await trackEvent({
  viewId,
  eventType: "business",
  actionType: "follow_up",
});
```

## Drop-in C1Chat wrapper

Copy `examples/InstrumentedC1Chat.tsx` from this package — it wraps `C1Chat` and wires up tracking automatically.

```typescript
import { InstrumentedC1Chat } from "./InstrumentedC1Chat";

<InstrumentedC1Chat
  threadId="thread-abc"
  agentName="My Assistant"
  processMessage={...}
/>
```

## API

### `init(config)`

| param | type | description |
|---|---|---|
| `apiKey` | `string` | GenUI Lens API key |
| `endpoint` | `string` | Backend URL (no trailing slash) |
| `projectId` | `string` | Your project ID |

### `startView(options)`

| param | type | description |
|---|---|---|
| `intent` | `string` | The user's message / task |
| `library` | `string` | `"c1"` \| `"c1chat"` \| `"agent_builder"` |
| `threadId?` | `string` | Groups views into a session |
| `sessionId?` | `string` | Override auto-generated session |
| `components?` | `ComponentDef[]` | Components rendered in this view |

Returns `{ viewId: string }`.

### `trackEvent(options)`

| param | type | description |
|---|---|---|
| `eventType` | `string` | `"action"` \| `"business"` \| `"error"` |
| `viewId?` | `string` | View to attach this event to |
| `componentId?` | `string` | Element type e.g. `"button"` |
| `actionType?` | `string` | e.g. `"click"` \| `"follow_up"` |
| `payload?` | `object` | Any extra data |

## What shows up where

| call | dashboard page |
|---|---|
| `startView()` | Tasks, Conversations, UI Elements → Appearances |
| `trackEvent({ eventType: "action" })` | UI Elements → Interactions |
| `trackEvent({ eventType: "business" })` | Tasks → Success Rate |

## License

MIT
