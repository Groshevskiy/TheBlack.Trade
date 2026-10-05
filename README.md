# TheBlack.Trade

Crypto trade platform workspace for fiat-to-crypto flows, including the Nest API, Astro web cabinet, local runbook, and verification commands. [cite:223][cite:224]

## Repository structure

- `apps/api` — Nest API for health, reference data, quotes, orders, dashboard, and aggregated summary endpoints. [cite:214]
- `apps/astro-web` — Astro frontend for customer and operator cabinet screens. [cite:218]
- `docs/RUNBOOK.local.md` — local stack, seed data, smoke checks, and verification workflow. [cite:223][cite:224]

## Verification

Run these commands from the repository root. [cite:221]

```bash
npm run verify:api
npm run verify:web
npm run verify:static
npm run verify:ready
npm run verify:http
npm run verify
```

### Command meanings

| Command | Purpose |
|---|---|
| `npm run verify:api` | Builds the Nest API and runs the summary smoke spec. [cite:222] |
| `npm run verify:web` | Builds the Astro frontend. [cite:222] |
| `npm run verify:static` | Runs API and web verification together without requiring a live API process. [cite:221][cite:222] |
| `npm run verify:ready` | Polls the local API health endpoint until it is ready or the readiness timeout expires. [cite:272] |
| `npm run verify:http` | Runs HTTP smoke checks for aggregated summary endpoints against a reachable local API. [cite:221][cite:225] |
| `npm run verify` | Runs the full static and HTTP verification pipeline. [cite:221][cite:222] |

## HTTP summary checks

`npm run verify:http` validates these aggregated endpoints when the local API is running: `/api/auth/me/summary`, `/api/auth/me/orders-summary`, `/api/orders/operator/queue-summary`, `/api/wallets/summary`, `/api/notifications/summary`, and `/api/operations/summary`. It checks reachability, required response shape, non-negative counters, order identity fields, metric-count invariants, and cross-endpoint consistency for dashboard, account, wallets, notifications, and operations summaries. [cite:216][cite:217][cite:225][cite:250][cite:253]

## Startup sequence

Before `npm run verify:http`, make sure the API is actually ready. A container in `Started` state is not sufficient by itself; wait until the health endpoint returns a successful JSON response. [cite:255][cite:263]

```bash
docker compose up -d api
npm run verify:ready
npm run verify:http
```

Expected health response shape:

```json
{"status":"ok","service":"theblacktrade-api","database":"ok"}
```

If `verify:http` returns `fetch failed`, re-check `curl http://localhost:4000/api/health` first. In practice, that error means the local API is not reachable yet or is restarting before Nest finishes bootstrapping. [cite:255][conversation_history:1]

`verify:http` polls the health endpoint for up to 20 seconds by default. On a slower machine or after a cold boot, override the readiness window when needed:

```bash
API_READY_TIMEOUT_MS=30000 API_READY_INTERVAL_MS=1000 npm run verify:http
```

`API_READY_TIMEOUT_MS` controls the total wait time in milliseconds; `API_READY_INTERVAL_MS` controls the delay between health checks. [cite:272]

`npm run verify` already runs `verify:static`, `verify:ready`, and `verify:http` in that order, so it is the preferred one-command pre-handoff or pre-merge verification flow. [cite:275]

## Local setup

For local stack startup, Docker topology, PostgreSQL port mapping, schema application, seed data, quote flow, order flow, and verification examples, use [`docs/RUNBOOK.local.md`](docs/RUNBOOK.local.md). [cite:224][cite:225]
