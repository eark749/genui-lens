# GenUI Lens

Open-source analytics platform for tracking AI-generated UI interactions — built on top of the [Thesys C1](https://thesys.dev) SDK.

**[Live Demo](http://34.207.202.178/docs)** · **[Walkthrough Video](https://youtu.be/h0vCqQ7ZRHU)** · **[npm](https://www.npmjs.com/package/@genui-lens/sdk)**

---

## What is this?

AI can now generate full UI — buttons, forms, cards — not just text. But there's no analytics for it. GenUI Lens tracks what users actually do with AI-generated UI: which components get clicked, which conversations lead to engagement, and which UI patterns work.

---

## Stack

- **Dashboard** — Next.js 14, Supabase auth, Tailwind CSS
- **Backend** — FastAPI, SQLAlchemy, Supabase (PostgreSQL)
- **SDK** — TypeScript, zero dependencies

---

## SDK Usage

```bash
npm install @genui-lens/sdk
```

```typescript
import { init, startView, trackEvent } from "@genui-lens/sdk";

// 1. Initialise once
init({
  apiKey: "your-api-key",
  endpoint: "https://your-backend.com",
  projectId: "your-project-id",
});

// 2. When AI generates a response
const { viewId } = await startView({
  intent: "user prompt here",
  library: "c1chat",
  threadId,
});

// 3. When user interacts with generated UI
trackEvent({
  viewId,
  eventType: "action",
  componentId: "button",
  actionType: "click",
});
```

---

## Project Structure

```
genui-lens/
├── backend/        # FastAPI backend — events, views, sessions, analytics
├── dashboard/      # Next.js dashboard — projects, conversations, analytics
└── sdk/            # @genui-lens/sdk — drop-in tracking for any GenUI app
```

---

## Self-hosting

See [DEPLOY.md](./DEPLOY.md) for full AWS EC2 deployment guide (PM2 + Nginx, no Docker).

---

## Bug Report

Found a peer dependency issue in `@thesysai/genui-sdk` while building this. See [THESYS_SDK_BUG_REPORT.md](./THESYS_SDK_BUG_REPORT.md).

---

Built by [Vansh](https://github.com/eark749)
