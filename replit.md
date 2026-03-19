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

EthicalHacking.ai landing page with 5 sections:
1. **Hero** — "AI-Powered Cybersecurity Intelligence" with animated background grid, cyan/green buttons
2. **Stats Bar** — 500+ AI Tools Tracked, 50+ Categories, Weekly Updates, 100% Free to Start
3. **Features** — 4-card grid: AI Tools Directory, Weekly Newsletter, Prompt Library, AI Reports
4. **Newsletter** — Email capture form storing to PostgreSQL via `/api/newsletter/subscribe`
5. **Footer** — Logo, copyright 2026, nav links, social icons

Design: Dark navy theme (#0A0E27), cyan (#00D4FF) and green (#00FF88) accents, futuristic hacker aesthetic. Fully responsive.

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
