# GramCare — Rural Telemedicine Portal

Low-bandwidth full-stack web app connecting rural Indian patients with qualified
doctors. Patients can book appointments, chat, upload medical documents, run a
rule-based symptom checker and trigger emergency alerts. Doctors get a
schedule, an emergency feed, per-patient records and a weekly availability
editor. Bilingual (English / हिन्दी), works on slow connections.

---

## Architecture

![GramCare architecture diagram](docs/architecture.svg)

## Project Structure

The repo is a **pnpm monorepo** with a clean frontend / backend separation:

```
/                           project root (pnpm workspace)
├── artifacts/
│   ├── telemed/            FRONTEND  — React 18 + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── pages/      route components (patient/, doctor/, chat/, ...)
│   │   │   ├── components/ UI + layout (app shell, bottom nav, demo banner)
│   │   │   ├── lib/        i18n, demo mode, image compression, utils
│   │   │   └── hooks/
│   │   ├── index.html
│   │   └── package.json
│   │
│   └── api-server/         BACKEND   — Node.js + Express 5
│       ├── src/
│       │   ├── routes/     REST endpoints (appointments, chat, demo, ...)
│       │   ├── lib/        auth, demo seeding, helpers
│       │   ├── db/         Drizzle schema + Postgres client
│       │   └── index.ts    server entry
│       └── package.json
│
├── lib/
│   ├── api-spec/           OpenAPI 3 contract (single source of truth)
│   └── api-client-react/   Orval-generated React Query hooks (shared)
│
├── package.json            root workspace manifest
├── pnpm-workspace.yaml
└── README.md
```

**Frontend** (`artifacts/telemed`) contains all UI code — React components,
pages, styling, i18n.
**Backend** (`artifacts/api-server`) contains all server code — Express routes,
database access (Drizzle ORM + Postgres), authentication, demo data seeding.

The two apps are fully decoupled and communicate only over HTTP. The shared
`lib/api-spec` OpenAPI document defines every endpoint; `lib/api-client-react`
is generated from it so the frontend and backend stay in sync automatically.

---

## Tech Stack

| Layer       | Tech                                                 |
| ----------- | ---------------------------------------------------- |
| Frontend    | React 18, Vite, TypeScript, Tailwind CSS, wouter     |
| Data layer  | TanStack Query, Orval-generated hooks                |
| Backend     | Node.js, Express 5, TypeScript                       |
| Database    | PostgreSQL via Drizzle ORM                           |
| Auth        | Clerk (production) + cookie-based Demo Mode          |
| Contract    | OpenAPI 3                                            |
| Tooling     | pnpm workspaces, esbuild                             |

---

## Running Locally

Install once at the repo root:

```bash
pnpm install
```

Run the **backend** (port 8080):

```bash
pnpm --filter @workspace/api-server run dev
```

Run the **frontend** (Vite dev server on its own port, proxies `/api` to the
backend):

```bash
pnpm --filter @workspace/telemed run dev
```

The two processes are independent — you can stop, restart, or deploy either
one without touching the other.

### Required environment variables

Backend:
- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — used to sign cookies
- Clerk keys (provided by the Replit Clerk integration)

Frontend:
- Clerk publishable key (provided by the Replit Clerk integration)

---

## Frontend ↔ Backend Contract

1. Edit the OpenAPI document in `lib/api-spec/openapi.yaml`.
2. Implement the route in `artifacts/api-server/src/routes/*`.
3. Regenerate the typed React Query client:

   ```bash
   pnpm --filter @workspace/api-client-react run codegen
   ```

4. Import the generated hook in the frontend:

   ```ts
   import { useListAppointments } from "@workspace/api-client-react";
   ```

This guarantees the frontend never drifts from the backend.

---

## Demo Mode

Click **Try Live Demo** on the landing page to enter as a preloaded patient
(*Ramesh Kumar*) or doctor (*Dr. Sharma*) — no sign-up required. Seeded data
includes appointments, chat history and medical documents. Switch between the
patient and doctor view from the banner at the top.

Demo Mode uses an httpOnly `demo_uid` cookie set by `POST /api/demo/login`;
`requireAuth` accepts it before falling back to Clerk.

---

## Features

- Patient: browse doctors, book slots, track appointments, upload compressed
  documents (auto-resized client-side), rule-based symptom checker, one-tap
  emergency alert
- Doctor: accept/reject pending requests, today's schedule, active emergencies
  feed, per-patient records, weekly availability editor
- Real-time-feel chat (4 s polling) with offline queue in `localStorage`
- Notifications bell with unread count
- Bilingual (EN / HI), persisted per user
- Offline banner, mobile bottom nav, dashboard skeleton loaders, 3-step
  onboarding on first demo entry
- Modern healthcare design system: soft blue (#2563EB) + teal (#10B981) on
  light gray, Inter typography, card-based layout
