# API service skeleton

## Suggested stack

- NestJS 12
- Drizzle ORM stable line
- PostgreSQL
- Redis for quote TTL, locks and retries
- OpenAPI code generation from `output/theblack-trade-openapi-implementation-ready.yaml`

## Initial modules

- health
- auth
- reference
- quotes
- wallets
- payout-requisites
- orders
- operator-actions
- notifications
- documents
- webhooks
- internal

## First run

- `npm install`
- `npm run dev`
- Open `http://localhost:4000/api/health`
