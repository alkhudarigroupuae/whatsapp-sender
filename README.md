# WhatsApp Sender

This repository contains:
- `frontend/` (Vite/React UI)
- `backend/` (Node/Express API + WhatsApp worker + PostgreSQL)

## Local run (recommended Node version)
- Node 20 (see `.nvmrc`)

### 1) Database
Use either:
- Supabase Postgres (`DATABASE_URL=...`), or
- Local Postgres

### 2) Backend env
Create a local `.env` (not committed) using `.env.example` as reference.

For a local demo without OpenAI/Gemini keys, set:
- `AI_PROVIDER=mock`

### 3) Run migrations + start
```bash
cd backend
npm ci
npm run migrate
npm run start
```

### 4) Frontend (dev)
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

