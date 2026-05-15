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

## Running Locally

### 1. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:5432/postgres
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_JWT_SECRET=<your-jwt-secret>
```

```bash
uvicorn app.main:app --reload --port 8000
```

### 2. Dashboard

```bash
cd dashboard
npm install --legacy-peer-deps
```

Create `dashboard/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000
THESYS_API_KEY=<your-thesys-api-key>
GENUI_API_KEY=<your-genui-lens-api-key>
GENUI_PROJECT_ID=<your-project-id>
```

```bash
npm run dev   # runs on localhost:3001
```

---

Built by [Vansh](https://github.com/eark749)
