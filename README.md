# WhatsApp Sender

This repository contains:
- `frontend/` (Vite/React UI)
- `backend/` (Node/Express API + WhatsApp worker + PostgreSQL)

## Run live (production)

Step-by-step: **[RUN_LIVE.md](./RUN_LIVE.md)** — **Vercel = UI only**; API runs on **your** Node host (VPS, Railway, Render, etc.) + PostgreSQL (e.g. Supabase).

## Local run (recommended Node version)
- Node 20 (see `.nvmrc`)

### 1) Database
Use either:
- Supabase Postgres (`DATABASE_URL=...`), or
- Local Postgres

### 2) Backend env
Create `backend/.env` (not committed) using `backend/.env.example` as reference.

For a local demo without OpenAI/Gemini keys, set:
- `AI_PROVIDER=mock`

Optional **Google sign-in:** set `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend) to the same OAuth Web Client ID, then `npm run migrate` (includes `003_google_auth.sql`). See **`RUN_LIVE.md`**.

## AI setup (per-contact messages)
Messages are generated per contact when you start a campaign.

Backend env options:
- OpenAI:
  - `AI_PROVIDER=openai`
  - `OPENAI_API_KEY=...`
  - `OPENAI_MODEL=gpt-4o-mini` (optional)
- Gemini:
  - `AI_PROVIDER=gemini`
  - `GEMINI_API_KEY=...`
  - `GEMINI_MODEL=gemini-1.5-flash` (optional)

### 3) Run migrations + start
```bash
cd backend
npm ci
npm run migrate
npm run start
```

### 4) Frontend (dev)
Optional: `cp frontend/.env.example frontend/.env.local` — leave `VITE_API_BASE_URL` empty to use the Vite proxy to port 4000.

```bash
cd frontend
npm ci
npm run dev
```

Or build the frontend and let the backend serve it:
```bash
cd frontend
npm ci
npm run build
```

## VPS deployment
See `DEPLOYMENT_VPS.md`.

## Multi-tenant safety
- Each user sees only their own contacts/campaigns (scoped by owner user ID).
- Admin-only access can view all clients if `ADMIN_EMAILS` includes your email.
