# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- **Reading Buddy** (`artifacts/reading-buddy`, preview `/`): React + Vite web app for college students to track leisure reading. The root route is a landing page explaining the product with links to launch the tracker at `/app`. The tracker includes Log Reading, My Books, Reading Goals, and Settings tabs with a warm bookstore-inspired visual direction.
- **API Server** (`artifacts/api-server`, preview `/api`): Shared Express API server.
- **Canvas** (`artifacts/mockup-sandbox`, preview `/__mockup`): Design/mockup sandbox.

## Reading Buddy Data Model

Reading Buddy uses PostgreSQL tables defined in `lib/db/src/schema/readingBuddy.ts`. The database layer can use an external Supabase PostgreSQL connection via `connection_string` or `CONNECTION_STRING`; if that value is Supabase's direct `db.<project>.supabase.co` host and Replit's `DATABASE_URL` is still available, it safely falls back to `DATABASE_URL` because Supabase's pooler connection string is required in some hosted environments.

- `reading_buddy_books`: book title, author, total/current pages, status, dates.
- `reading_buddy_sessions`: logged pages/minutes tied to a book.
- `reading_buddy_settings`: daily page goal and reminder time.

API endpoints are defined in `lib/api-spec/openapi.yaml` and implemented in `artifacts/api-server/src/routes/readingBuddy.ts`.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
