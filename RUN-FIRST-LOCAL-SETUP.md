# First runnable local setup

## Prerequisites

- Docker Desktop or Docker Engine with Compose plugin
- Node.js 22.x only if you want to run apps outside containers
- Free local ports: 3000, 4000, 5432, 6379, 8055, 9000, 9001, 8025

## Boot sequence

1. Copy `.env.example` to `.env` if you plan to externalize variables. Keep `PUBLIC_DEMO_USER_ID` and `PUBLIC_DEMO_OPERATOR_ID` set so the Astro UI can bootstrap actor context for order/customer/operator flows until real auth/session wiring is in place.
2. Run `docker compose -f docker-compose.local.yml up -d postgres redis minio mailhog`.
3. Wait until PostgreSQL is healthy.
4. Run `docker compose -f docker-compose.local.yml up -d directus api astro`.
5. Open:
   - Astro: `http://localhost:3000`
   - API health: `http://localhost:4000/api/health`
   - Directus: `http://localhost:8055`
   - MinIO Console: `http://localhost:9001`
   - MailHog: `http://localhost:8025`

## Optional Directus sync

- Pull current schema: `docker compose -f docker-compose.local.yml exec api npm run directus:schema:pull`
- Apply bootstrap schema: `docker compose -f docker-compose.local.yml exec api npm run directus:schema:apply`

## Reference slice checks

1. `GET /api/reference/assets`
2. `GET /api/reference/networks`
3. `GET /api/reference/networks?asset_code=USDT&direction_code=buy&is_active=true`

## MVP slice checks

1. `GET /api/health` returns `status: ok` and `database: ok`
2. `POST /api/quotes/calculate` with:
   ```json
   {
     "direction_code": "buy",
     "fiat_currency_code": "RUB",
     "asset_code": "USDT",
     "network_code": "TRC20",
     "amount_type": "fiat",
     "amount": 15000
   }
   ```
3. Use returned `quote_id` in `POST /api/orders` with:
   ```json
   {
     "quote_id": "<returned_quote_id>",
     "user_id": "11111111-1111-1111-1111-111111111111"
   }
   ```
4. `GET /api/orders`
5. `GET /api/orders/<public_id>`

## Known gaps

- Quotes still use placeholder rate calculation even though asset/network validation is now real.
- Pairing is currently approximated via active network selection rather than a dedicated `tb_pairs` lookup.
- User existence and ownership validation are not enforced yet.
- Migrations are present in SQL, but automatic migration execution is not wired into container startup.
- Mail delivery and MinIO bucket provisioning are not auto-provisioned yet.
