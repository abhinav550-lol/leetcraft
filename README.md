# LeetCraft

Production-ready full-stack app to turn accepted LeetCode solutions into structured write-ups (intuition, approach, algorithm, time/space) with Markdown/PDF export. Stack: React (Vite, Tailwind) for web, Node.js/Express for API, Groq Llama3 for AI, Postgres + Prisma for persistence.

## Architecture
- Backend: Node.js + Express, Prisma (Postgres), JWT auth, Zod validation, rate limiting, pino logging, Groq Llama3 write-up generation, Markdown/PDF export.
- Frontend: Vite + React + Tailwind consuming REST APIs.
- Shared: npm workspaces (apps/*, packages/*), consistent lint/format, env templates.

## Folder layout
- apps/api: Express API
- apps/api/prisma: Prisma schema
- apps/api/src: app, routes, middleware, services, config
- apps/web: Vite React frontend
- packages/*: reserved for shared packages (types, clients) later

## Backend capabilities
- Auth: register/login with hashed passwords, JWT access/refresh tokens.
- Submissions: create/list user submissions with code + metadata.
- AI write-ups: generate structured content via Groq Llama3; persisted as writeup records.
- Exports: download write-up as Markdown or PDF.
- Observability: health endpoint, structured logging, error handling, rate limiting, security headers.

## API (summary)
- POST /api/v1/auth/register — email, password, name? -> tokens
- POST /api/v1/auth/login — email, password -> tokens
- GET /api/v1/submissions — list user submissions (requires Bearer token)
- POST /api/v1/submissions — create submission { title, problemUrl?, language, code, notes? }
- POST /api/v1/submissions/:submissionId/generate — trigger Groq write-up
- GET /api/v1/submissions/:submissionId/writeup — fetch write-up status/content
- GET /api/v1/submissions/:submissionId/writeup/export?format=pdf|md — download

## Setup (backend)
1) Install dependencies
```bash
npm install
npm install --prefix apps/api
```

2) Env vars
- Copy apps/api/.env.example to apps/api/.env and fill values (Postgres URL, JWT secrets, Groq API key).

3) Database
```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

4) Run dev server
```bash
cd apps/api
npm run dev
```
API default: http://localhost:4000

5) Tests
```bash
cd apps/api
npm test
```

## Setup (frontend)
1) Install deps
```bash
npm install --prefix apps/web
```

2) Env vars
- Copy apps/web/.env.example to apps/web/.env and set `VITE_API_URL` (default http://localhost:4000/api/v1).

3) Run dev server
```bash
cd apps/web
npm run dev
```
Frontend default: http://localhost:5173

4) Build/preview
```bash
cd apps/web
npm run build
npm run preview
```

## Tech decisions
- DB: Postgres with Prisma ORM.
- Package manager: npm with workspaces.
- API validation: Zod.
- PDF: md-to-pdf (Puppeteer-based).
- Logging: pino/pino-http.

## Notes
- Keep GROQ_API_KEY and JWT secrets safe.
- Rate limits applied to auth and general API paths.
- API returns JSON errors `{ error: string }` with HTTP status codes.
