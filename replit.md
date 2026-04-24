# GramCare — Rural Telemedicine Portal

Low-bandwidth full-stack web app connecting rural Indian patients with doctors.

## Artifacts
- `artifacts/telemed` — React + Vite web app (patient + doctor portal)
- `artifacts/api-server` — Express 5 API server (Postgres via Drizzle, Clerk auth)
- `lib/api-spec` — OpenAPI 3 contract (source of truth)
- `lib/api-client-react` — Orval-generated React Query client

## Features
- Patient portal: browse doctors, book appointment slots, track appointments, upload compressed documents (images auto-resized client-side), rule-based symptom checker, one-tap emergency alert
- Doctor portal: accept/reject pending requests, view today's schedule, active emergencies feed, per-patient records (documents)
- Chat (polling every 4s) with offline queue in `localStorage`
- Notifications bell with unread count, auto-clears on mark-all-read
- Bilingual (EN / HI) toggle, persisted per-user in profile
- Offline banner, warm terracotta theme, large tappable buttons
- Doctor weekly availability editor (used by patient slot picker)
- Demo Mode: one-tap "Try Live Demo" auto-logs in as a preloaded patient (Ramesh Kumar) or doctor (Dr. Sharma), with seeded appointments, chat history, and documents. Switchable from the in-app banner.
- Mobile bottom navigation, dashboard skeleton loaders, 3-step onboarding screen on first demo entry

## Demo Mode
- Backend: `lib/demo.ts` seeds idempotent dummy users/appointments/messages/documents on server start. Routes at `POST /api/demo/login`, `POST /api/demo/logout`, `GET /api/demo/me` set/clear an httpOnly `demo_uid` cookie. `requireAuth` accepts the demo cookie before falling back to Clerk.
- Frontend: `lib/demo.ts` exposes `useDemo()` (active, role, start, stop, switchRole). `RoleGate`/`SignedInOnly` bypass Clerk when demo is active.
- Demo IDs: `demo_patient_001`, `demo_doctor_001`, `demo_doctor_002`.

## Conventions
- Auth: Clerk proxy + `clerkMiddleware`; client imports from `@clerk/react`
- API query hooks require explicit `queryKey` when passing `query` options — import `getXxxQueryKey()` from `@workspace/api-client-react`
- Mutations: `.mutateAsync({ data: {...} })` or `({ paramName, data })`
- `startsAt` body fields are serialized as ISO strings (`.toISOString()`)
- Images compressed via `lib/compress-image.ts` before upload (max 1280px, JPEG q=0.7)

## Theme
- Primary: `hsl(17 56% 45%)` terracotta
- Background: cream `hsl(45 33% 97%)`
- Font: Plus Jakarta Sans
- Radius: `0.75rem`

## Running
Workflows auto-managed:
- `artifacts/api-server: API Server`
- `artifacts/telemed: web`
- `artifacts/mockup-sandbox: Component Preview Server`
