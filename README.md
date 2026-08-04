# Revellio — Portfolio

Personal portfolio with a self-hosted CMS. Public site is a Swiss / dark-minimal design (one accent, 1px hairlines, no radius/shadow); the owner edits all content from a browser — no deploy to publish.

Built on **Next.js 16** (App Router, Turbopack) + **React 19** + **Tailwind v4**, backed by **Neon** (serverless Postgres) and gated by **Clerk** auth.

## Stack

| Layer     | Tech                                              |
| --------- | ------------------------------------------------- |
| Framework | Next.js 16.2 (App Router, Turbopack), React 19    |
| Styling   | Tailwind CSS v4, CSS variables (`app/globals.css`)|
| Data      | Neon serverless Postgres (`@neondatabase/serverless`) |
| Auth      | Clerk (`@clerk/nextjs`) — single-admin gate       |
| Media     | AWS S3 (presigned uploads)                        |
| Motion    | GSAP (scroll reveals), xterm.js (interactive terminal) |

## Routes

**Public**
- `/` — hero, selected projects, principles, interactive terminal
- `/projects` — filterable project grid · `/projects/[slug]` — case study
- `/about` — bio, timeline, skills, tech marquee, certificates
- `/journey` — milestone timeline
- `/contact` — contact form (no backend yet) + links

**Admin**
- `/cms` — content editor (projects, journey, certificates, profile, CV, media)
- `/sign-in`, `/sign-up` — Clerk auth

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run db:seed        # seed Neon with initial content
npm run dev            # http://localhost:3000
```

### Environment (`.env`)

```bash
# Neon Postgres
DATABASE_URL=postgres://...

# Clerk auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Admin gate — comma-separated emails allowed into /cms and mutations.
# Leave blank in dev = any signed-in user passes. Set before deploy.
ADMIN_EMAILS=you@example.com

# AWS S3 (media uploads)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
S3_BUCKET=...
```

## Scripts

| Command           | Does                                      |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Dev server (Turbopack)                    |
| `npm run build`   | Production build                          |
| `npm run start`   | Serve the production build                |
| `npm run lint`    | ESLint                                    |
| `npm run db:seed` | Seed Neon from `lib/data.ts` seed data    |

## Architecture

- **`lib/data.ts`** — domain types + seed data (SSR / first-paint fallback).
- **`lib/db.ts`** — all SQL. Server-only. Maps `snake_case` rows → camelCase UI types.
- **`lib/store.ts`** — client store via `useSyncExternalStore`. Reads hydrate once from `/api/content`; writes are optimistic then reconciled against `/api/mutate` truth.
- **`app/api/mutate/route.ts`** — single mutation dispatcher; each `action` maps 1:1 to a `lib/db` function. Gated by `isAdmin()`.
- **`lib/admin.ts`** — single-admin gate: signed-in **and** email in `ADMIN_EMAILS` (blank allowlist = any signed-in user).
- **`components/site/`** — public building blocks (`primitives`, `Chrome`, `Nav`, `ProjectRow`, `Terminal`, motion).
- **`components/cms/`** — admin editor tabs and drawers.

Content flow: **CMS edit → `/api/mutate` → Neon → store reconciles → live**. No redeploy.

## Design system

See `DESIGN.md`. One accent (`#4CE0FF`), a white-opacity ladder, always-1px lines, no border-radius, no shadow (except the CMS drawer), no gradient (except a faint hero grid rule). Type scales fluidly with `clamp()` so display headings never overflow between mobile and desktop.

