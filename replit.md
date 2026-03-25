# Workspace

## Overview

pnpm workspace monorepo using TypeScript. EthicalHacking.ai — an AI-powered cybersecurity intelligence platform landing page.

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
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + React Hook Form

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── ethical-hacking/    # EthicalHacking.ai landing page (React + Vite) at /
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Artifacts

### `artifacts/ethical-hacking` (`@workspace/ethical-hacking`)

EthicalHacking.ai — AI-powered cybersecurity intelligence platform. Two pages:

**Home (`/`)** — Landing page with 5 sections:
1. **Hero** — "AI-Powered Cybersecurity Intelligence", updated subtitle, cyan/green CTAs
2. **Stats Bar** — 500+ AI Tools Tracked, 50+ Categories, Weekly Updates, 100% Free to Start
3. **Features** — 4-card grid: AI Tools Directory, Weekly Newsletter, Prompt Library, AI Reports
4. **Newsletter** — Email capture form storing to PostgreSQL via `/api/newsletter/subscribe`
5. **Footer** — © 2025 EthicalHacking.ai | hello@ethicalhacking.ai | Privacy Policy | Terms of Service

**Tools Directory (`/tools`)** — Searchable AI tools directory:
- Fetches from Supabase (`ai_tools` + `tool_categories` tables)
- Search by name/description, filter by category and pricing model
- Responsive 3-col grid with tool cards (name, category, description, pricing badge, rating, visit link)
- Featured tools (gold border), New tools (NEW badge)
- Category pills with emoji icons from `tool_categories.icon`

**Navbar** — Fixed header with logo + Home + Browse AI Tools links, mobile hamburger menu.

**Supabase integration**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` env vars, client in `src/lib/supabase.ts`.

Design: Dark navy theme (#0A0E27), cyan (#00D4FF) and green (#00FF88) accents, futuristic hacker aesthetic. Fully responsive.

**Routing**: API calls in dev proxied via Vite to `localhost:8080` (api-server). In production on Vercel, `VITE_API_BASE_URL` is set to the Replit backend URL.

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes:
  - `src/routes/health.ts` — `GET /api/healthz`
  - `src/routes/newsletter.ts` — `POST /api/newsletter/subscribe`
- Depends on: `@workspace/db`, `@workspace/api-zod`

## Database Schema

- **`newsletter_subscribers`** — id, email (unique), subscribed_at

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
