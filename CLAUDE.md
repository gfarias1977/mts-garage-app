# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Docs-first rule

> **MANDATORY: Before writing any code, read the relevant `/docs` file for the area you are working in. Do not generate code first and check docs after. The docs define the only acceptable pattern — no exceptions.**

Use this table to find the right file:

| Area | File |
|------|------|
| UI components & date formatting | `docs/12-ui.md` |
| Data fetching, DB queries & user data isolation | `docs/13-data-fetching.md` |
| Authentication & Clerk usage | `docs/10-auth.md` |
| Data mutations, Server Actions & Zod validation | `docs/14 - data-mutations.md` |
| Server Components & async params | `docs/15 - server-components.md` |
| Forms (react-hook-form + zod + shadcn) | `docs/04-forms.md` |
| Error handling (toast, error.tsx, loading.tsx) | `docs/09-error-handling.md` |
| Database schema, migrations & naming | `docs/11-database.md` |
| Environment variables | `docs/07-environment.md` |

Rules:
- If a `docs/` file covers the area you are working in, **read it before writing a single line of code**.
- The docs override any default behavior, general best practices, or patterns learned from training data.
- If the task spans multiple areas (e.g. a form that calls a Server Action that writes to the DB), read **all** relevant docs files before starting.
- If you are unsure which doc applies, check the `/docs` directory and read the closest match.


## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint

npm run db:push      # Apply schema to local DB (dev only)
npm run db:generate  # Generate SQL migration
npm run db:migrate   # Apply migration to production DB
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed the database
```

No test framework is installed.

## Architecture

Fleet management SaaS with auth, real-time MQTT tracking, and IoT device management.

**Stack:** Next.js 16 (App Router) · TypeScript · Drizzle ORM · Neon (PostgreSQL) · Clerk (auth) · Tailwind CSS v4 · shadcn/ui · TanStack Query · Zustand · react-hook-form · Zod · sonner

**Key directories under `src/`:**
- `app/(auth)/` — Public sign-in/sign-up pages
- `app/(dashboard)/` — Protected pages; each feature has `page.tsx` + `actions.ts`
- `db/schema/` — One Drizzle schema file per entity
- `data/` — Server-only async query helpers, one file per entity
- `components/ui/` — shadcn/ui generated components (treat as read-only)
- `workers/` — Background services (e.g., `mqtt-worker.ts`)

**Path alias:** `@/*` → `src/*`

## Data Layer

All data fetching happens in **Server Components** via helpers in `src/data/`. Never fetch in Client Components or `useEffect`.

Mutations use a **two-layer pattern:**
1. `src/data/*.ts` — plain async Drizzle queries scoped to `userId`
2. `src/app/(dashboard)/[feature]/actions.ts` — Server Actions that validate with Zod, call data helpers, and return `{ success: true; data } | { success: false; error }`

Every query and mutation **must** filter by the authenticated `userId`. Never trust client-supplied IDs.

## Database Schema Conventions

- All columns use a 3-letter table prefix (e.g., `dev_id`, `dev_name` for `devicesTable`)
- Use Drizzle ORM exclusively — no raw SQL

```ts
export const devicesTable = pgTable('devices', {
  id: bigserial('dev_id', { mode: 'bigint' }).primaryKey(),
  userId: bigint('dev_user_id', { mode: 'bigint' }).notNull(),
});
```

Database selection:
- `USE_LOCAL_DB=true` → `LOCAL_DATABASE_URL` (local Postgres)
- Otherwise → `DATABASE_URL` (Neon)

## Auth

Clerk owns the entire auth layer — never implement custom auth. Middleware lives in `proxy.ts` (not `middleware.ts` — Next.js 16 breaking change). Read the current user with `auth()` from `@clerk/nextjs/server` in Server Components. Bridge to the internal DB via `getUserByClerkId(clerkId)`.

## UI

Use shadcn/ui components exclusively. Add new components with `npx shadcn add <component>`. Icons via lucide-react. Dates formatted with date-fns (`do MMM yyyy`).

## Next.js 16 Breaking Changes

- `params` and `searchParams` in pages/layouts are **Promises** and must be awaited
- Middleware file is `proxy.ts`, not `middleware.ts`
- Read `node_modules/next/dist/docs/` before writing Next.js-specific code

## Detailed Docs

In-repo coding standards live in `docs/` (numbered 00–15) covering theme, layout, forms, state, environment variables, error handling, auth, database, UI, data fetching, mutations, and server components.
