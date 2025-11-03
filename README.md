# AI Trading Agent (Bun + TypeScript)

Trade using LLMs. Periodically collects market context, lets an AI suggest actions through constrained tools, executes orders via an exchange SDK, persists telemetry with Prisma, and serves a small API for a React UI.

## Architecture (high level)
- **Agent (scheduler)**: `index.ts` — every 5 minutes, builds an enriched prompt (indicators, portfolio, open positions), streams a model response via OpenRouter, and executes tool calls (open/close positions). Invocation + tool calls are recorded in the DB.
- **API server**: `backend.ts` (Express) — read-only endpoints used by the UI:
  - `GET /performance` — timeseries of `PortfolioSize` per model
  - `GET /invocations?limit=n` — latest model invocations + tool calls
- **Frontend**: `frontend/` (React + Vite + TS) — dashboards for performance and recent activity; additional routes for Leaderboard and Blog.
- **Exchange SDK**: `lighter-sdk-ts/` — generated OpenAPI client + signing for placing/canceling orders.
- **Database**: Prisma models under `prisma/` (Models, Invocations, ToolCalls, PortfolioSize).

## Tech stack
- Runtime: Bun
- Lang: TypeScript
- DB/ORM: PostgreSQL + Prisma
- UI: React + Vite, Recharts

## Quick start
Requirements: Bun v1.3+, Node not required. PostgreSQL only needed if you run the agent or API against a real DB.

1) Install deps (root and frontend)
```bash
bun install
cd frontend && bun install
```

2) Run API server (read-only endpoints)
```bash
# If you don't have a DB, the server starts but queries will 500
export DATABASE_URL="postgresql://USER:PASS@HOST:5432/DB?schema=public"
cd .. && bun run backend.ts
```

3) Run frontend (dev)
```bash
cd frontend
# Optional: point UI to a custom API
echo VITE_BACKEND_URL=http://localhost:3000 > .env
bun run dev
```

4) Run agent (requires real credentials)
```bash
export DATABASE_URL=...
export OPENROUTER_API_KEY=...
bun run index.ts
```

## Configuration
- `DATABASE_URL` — Postgres connection string (Prisma)
- `OPENROUTER_API_KEY` — for model inference via OpenRouter
- Frontend: `VITE_BACKEND_URL` — UI → API base URL override

## Key files
- Agent: `index.ts`, `prompt.ts`, `createPosition.ts`, `cancelOrder.ts`
- API: `backend.ts`
- SDK: `lighter-sdk-ts/` (generated client + signer)
- Prisma: `prisma/schema.prisma`, migrations under `prisma/migrations/`
- Frontend: `frontend/src/App.tsx`, `components/`, `pages/` (Leaderboard, Blog)

## API (used by UI)
- `GET /performance`
  - Returns: `[ { createdAt, netPortfolio, model: { name } }, ... ]` (ascending by time)
  - Cache: 5m in-memory
- `GET /invocations?limit=n`
  - Returns recent invocations + tool calls, cached ~2m (lazy refresh)

## Development workflow
1) Branch naming: `feat/...`, `fix/...`, `chore/...`
2) Use Bun for everything (install, run, build, test)
3) Keep PRs small and single-purpose; include before/after screenshots when UI changes
4) Lint/build locally; avoid committing secrets (no `.env` in git)

## Contributing (what maintainers look for)
- Scope clearly (one concern per PR); avoid mixing refactors with features
- Observability improvements are welcome (no DB write-path changes required)
- For backend changes, include:
  - Endpoint contract (request/response, limits, cache strategy)
  - Safety & performance notes (indexes, batching, back-pressure)
- For UI, prefer read-only use of existing endpoints; avoid coupling to trading logic

### PR checklist
- [ ] Clear title & concise description
- [ ] No secrets committed; `.env` stays local
- [ ] Builds with Bun; runs `backend.ts` / `frontend` locally
- [ ] Backwards compatible API (if touching server)
- [ ] Screenshots for UI

## License
MIT

