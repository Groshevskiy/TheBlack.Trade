# TheBlack.Trade Local Runbook

## Purpose

This runbook describes how to start the local development stack, avoid the PostgreSQL port conflict on macOS, seed the minimum reference data, and verify the current MVP business flow for quotes and orders.

## Local topology

- Docker Postgres is exposed on `localhost:55432` and maps to container port `5432`.
- Local macOS PostgreSQL may continue to use `localhost:5432`.
- The local Nest API should run on `localhost:4001`.
- Directus runs in Docker on `localhost:8055`.
- The containerized API uses `postgres:5432` internally.

## Start the Docker stack

From the repository root:

```bash
docker compose -f docker-compose.local.yml up -d
```

Check status:

```bash
docker compose -f docker-compose.local.yml ps
```

The expected Postgres port mapping is:

```text
0.0.0.0:55432->5432/tcp
```

## Verify Docker Postgres from macOS

```bash
psql "postgresql://theblacktrade:theblacktrade@localhost:55432/theblacktrade" -c "select 1;"
```

Expected result:

```text
 ?column?
----------
        1
```

## Apply schema and seed data

Apply the initial schema:

```bash
docker compose -f docker-compose.local.yml exec -T postgres \
  psql -U theblacktrade -d theblacktrade \
  < infrastructure/db/migrations/0001_initial_schema.sql
```

Apply reference seed data:

```bash
docker compose -f docker-compose.local.yml exec -T postgres \
  psql -U theblacktrade -d theblacktrade \
  < infrastructure/db/seeds/001_reference_seed.sql
```

## Create minimum pair and test user

The current MVP quote flow requires a `tb_pairs` record and a valid `tb_users` record.

Create the minimum buy pair for `RUB -> USDT / TRC20`:

```bash
docker compose -f docker-compose.local.yml exec -T postgres \
  psql -U theblacktrade -d theblacktrade <<'SQL'
INSERT INTO tb_pairs (
  id,
  direction_code,
  fiat_currency_id,
  asset_id,
  network_id,
  min_amount,
  max_amount,
  fee_profile,
  is_active
)
SELECT
  '00000000-0000-0000-0000-000000000301',
  'buy',
  f.id,
  a.id,
  n.id,
  1000,
  1000000,
  '{"fee_percent": 0.015}'::jsonb,
  true
FROM tb_fiat_currencies f
JOIN tb_assets a ON a.code = 'USDT'
JOIN tb_networks n
  ON n.asset_id = a.id
 AND n.code = 'TRC20'
 AND n.direction_code = 'buy'
WHERE f.code = 'RUB'
ON CONFLICT (id) DO NOTHING;
SQL
```

Create a test user:

```bash
docker compose -f docker-compose.local.yml exec -T postgres \
  psql -U theblacktrade -d theblacktrade <<'SQL'
INSERT INTO tb_users (
  id, email, locale, kyc_level, status
)
VALUES (
  '00000000-0000-0000-0000-000000000401',
  'qa@theblack.trade',
  'ru',
  'basic',
  'active'
)
ON CONFLICT (id) DO NOTHING;
SQL
```

## Run the local API

Run the Nest API outside Docker with the Docker Postgres connection string:

```bash
cd apps/api
DATABASE_URL='postgresql://theblacktrade:theblacktrade@localhost:55432/theblacktrade' \
PORT=4001 \
npm run dev
```

## Smoke checks

In a new terminal:

```bash
BASE_URL='http://localhost:4001'

curl -s "$BASE_URL/api/health" | jq
curl -s "$BASE_URL/api/reference/assets" | jq
curl -s "$BASE_URL/api/reference/networks?asset_code=USDT&direction_code=buy&is_active=true" | jq
```

Expected behavior:
- health returns `status: ok` and `database: ok`;
- assets include `BTC`, `ETH`, `USDT`;
- networks return `TRC20` for `USDT` + `buy`.

## Quote flow

Create a quote:

```bash
curl -sS -X POST "$BASE_URL/api/quotes/calculate" \
  -H 'Content-Type: application/json' \
  -d '{
    "direction_code": "buy",
    "fiat_currency_code": "RUB",
    "asset_code": "USDT",
    "network_code": "TRC20",
    "amount_type": "fiat",
    "amount": 10000
  }' | jq
```

Expected behavior:
- returns `quote_id`;
- `amount_out` is `98.5` with the current stub rate logic;
- `expires_at` is roughly 5 minutes ahead.

## Order flow

Use the returned `quote_id` and the seeded test user:

```bash
BASE_URL='http://localhost:4001'
QUOTE_ID='quote_REPLACE_ME'
USER_ID='00000000-0000-0000-0000-000000000401'

curl -sS -X POST "$BASE_URL/api/orders" \
  -H 'Content-Type: application/json' \
  -d "{
    \"quote_id\": \"$QUOTE_ID\",
    \"user_id\": \"$USER_ID\"
  }" | jq
```

Expected behavior:
- returns an order with `publicId` like `ord_...`;
- `statusCode` is `draft`;
- `fiatAmount`, `cryptoAmount`, and `rate` come from the quote.

Fetch the order by `publicId` (not by internal UUID):

```bash
ORDER_PUBLIC_ID='ord_REPLACE_ME'

curl -sS "$BASE_URL/api/orders/$ORDER_PUBLIC_ID" | jq
curl -sS "$BASE_URL/api/orders" | jq
```

Important note: the current route name is `GET /api/orders/:id`, but the implementation expects the `publicId`, not the internal UUID field.

## Timeline verification

```bash
docker compose -f docker-compose.local.yml exec postgres \
  psql -U theblacktrade -d theblacktrade -c "
SELECT
  o.id,
  o.public_id,
  o.status_code,
  t.event_type,
  t.from_status,
  t.to_status,
  t.actor_type,
  t.actor_id,
  t.payload_json,
  t.created_at
FROM tb_orders o
LEFT JOIN tb_order_timeline t ON t.order_id = o.id
WHERE o.public_id = '$ORDER_PUBLIC_ID'
ORDER BY t.created_at DESC;
"
```

Expected behavior:
- one `order_created` event exists;
- `to_status = draft`;
- `actor_type = user`;
- `payload_json` includes the source `quote_id`.

## Current MVP caveats

- `GET /api/orders/:id` currently expects `publicId`, not internal UUID.
- Wallet and payout requisites are not yet included in the tested flow.
- Rate calculation is still a stub implementation.
- The minimum `tb_pairs` setup is currently created manually for local development.
- The local API must use `localhost:55432`, while Docker services must keep using `postgres:5432`.

## Verification commands

From the repository root:

```bash
npm run verify:api
npm run verify:web
npm run verify:static
npm run verify:ready
```

Use `verify:api` to rebuild the Nest API and run the summary smoke spec.

Use `verify:web` to rebuild the Astro frontend.

Use `verify:static` to run both API and web verification in sequence without requiring a live local API process.

Use `verify:ready` to poll the local API health endpoint until it is ready or the readiness timeout expires.

## HTTP summary smoke checks

When the local API is running and reachable, validate readiness first, then run the summary smoke checks:

```bash
cd /Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade
npm run verify:ready
npm run verify:http
```

Expected health response shape:

```json
{"status":"ok","service":"theblacktrade-api","database":"ok"}
```

This command checks:
- `GET /api/auth/me/summary`;
- `GET /api/auth/me/orders-summary`;
- `GET /api/orders/operator/queue-summary`;
- `GET /api/wallets/summary`;
- `GET /api/notifications/summary`;
- `GET /api/operations/summary`.

It validates HTTP reachability, response invariants, non-negative metrics, count consistency, required order identity fields, and cross-endpoint consistency for dashboard, account, wallets, notifications, and operations summaries.

If `npm run verify:http` returns `fetch failed`, check the health endpoint again before debugging summary logic. In practice, that message usually means the local API is still booting or has restarted before becoming reachable.

`verify:http` polls the health endpoint for up to 20 seconds by default. Increase the window after a cold boot or on a slower machine:

```bash
API_READY_TIMEOUT_MS=30000 API_READY_INTERVAL_MS=1000 npm run verify:http
```

`API_READY_TIMEOUT_MS` is the total readiness wait in milliseconds; `API_READY_INTERVAL_MS` is the polling interval.

## Full verification

To run the entire verification pipeline from the repository root:

```bash
npm run verify
```

Expected usage:
- run `verify:static` during normal development;
- run `verify:ready` to confirm or wait for API readiness;
- run `verify:http` after `verify:ready` succeeds;
- run `verify` before handoff or merge when the full local stack is available; it executes `verify:static`, `verify:ready`, and `verify:http` in sequence.
