# Workspace

## Overview

Customer Strategy Generator — a web app that generates personalized strategic customer management playbooks based on the BCG Matrix. Users enter their business context and receive AI-generated strategies across 4 segments (Star, Cash Cow, Question Mark, Pineapple) with tactical plans, conversation hooks, and ready-to-use message templates.

Built as a pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Frontend**: React + Vite + TailwindCSS v4
- **AI**: OpenAI GPT-5.2 via Replit AI Integrations (no API key needed)
- **Database**: PostgreSQL (via `pg` pool) — stores user playbooks per authenticated user
- **Auth**: Clerk (Replit-managed) — `@clerk/react` on client, `@clerk/express` on server
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Form handling**: react-hook-form + @hookform/resolvers
- **Animations**: framer-motion

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── client-strategy/    # React frontend (Customer Strategy Generator)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/   # OpenAI server integration
│   └── integrations-openai-ai-react/    # OpenAI React hooks
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace config
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## API Endpoints

- `GET /api/healthz` — Health check
- `POST /api/strategy/generate` — Generate BCG strategy playbook (takes industry, targetAudience, mainProduct)
- `POST /api/strategy/improve` — Improve a text block with AI (takes text, context, blockType, fieldType)

## Frontend Features

- **Input Form**: Industry dropdown, target audience text, product/service textarea
- **Strategy Playbook**: 4 BCG-style cards (Star, Cash Cow, Question Mark, Pineapple)
- **Inline Editing**: Click any text to edit, "Improve with AI" button on each section
- **Export**: PDF download (window.print), WhatsApp sharing, copy all templates
- **Language**: All UI and generated content in Brazilian Portuguese

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with strategy generation routes.

- Routes: `src/routes/strategy.ts` — strategy generation and text improvement
- Depends on: `@workspace/db`, `@workspace/api-zod`, `@workspace/integrations-openai-ai-server`

### `artifacts/client-strategy` (`@workspace/client-strategy`)

React + Vite frontend for the Customer Strategy Generator.

- Pages: `src/pages/home.tsx` — main page with form and playbook display
- Components: `EditableField.tsx`, `StrategyBlockCard.tsx`, `PlaybookExportBar.tsx`
- Hooks: `use-strategy.ts` — manages playbook state, generation, and improvement

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec with strategy endpoints. Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/integrations-openai-ai-server` (`@workspace/integrations-openai-ai-server`)

OpenAI SDK client configured via Replit AI Integrations environment variables.

### `lib/db` (`@workspace/db`)

Database layer (not actively used — app is stateless).
