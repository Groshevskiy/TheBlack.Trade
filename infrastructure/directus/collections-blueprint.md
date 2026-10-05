# Directus Collections Blueprint

## Core collections

- `tb_users`
- `tb_assets`
- `tb_networks`
- `tb_fiat_currencies`
- `tb_pairs`
- `tb_quotes`
- `tb_wallets`
- `tb_payout_requisites`
- `tb_orders`
- `tb_order_timeline`
- `tb_order_actions`
- `tb_documents`
- `tb_notifications`
- `tb_webhook_events`
- `tb_webhook_attempts`
- `tb_idempotency_keys`
- `tb_audit_logs`
- `tb_provider_accounts`
- `tb_provider_transactions`
- `tb_risk_cases`

## Key relations

- `tb_networks.asset_id -> tb_assets.id`
- `tb_pairs.asset_id -> tb_assets.id`
- `tb_pairs.network_id -> tb_networks.id`
- `tb_quotes.pair_id -> tb_pairs.id`
- `tb_wallets.user_id -> tb_users.id`
- `tb_payout_requisites.user_id -> tb_users.id`
- `tb_orders.user_id -> tb_users.id`
- `tb_orders.quote_id -> tb_quotes.id`
- `tb_order_timeline.order_id -> tb_orders.id`
- `tb_order_actions.order_id -> tb_orders.id`
- `tb_documents.order_id -> tb_orders.id`
- `tb_notifications.user_id -> tb_users.id`
- `tb_webhook_attempts.webhook_event_id -> tb_webhook_events.id`

## Suggested Directus roles

- `client`
- `operator`
- `supervisor`
- `service`
- `admin`
