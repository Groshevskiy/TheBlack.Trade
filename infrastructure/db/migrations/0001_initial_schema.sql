CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tb_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  directus_user_id UUID NULL,
  email TEXT,
  phone TEXT,
  telegram TEXT,
  locale TEXT DEFAULT 'ru',
  kyc_level TEXT DEFAULT 'none',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  precision INT NOT NULL DEFAULT 8,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES tb_assets(id),
  code TEXT NOT NULL,
  direction_code TEXT NOT NULL,
  confirmations_required INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(asset_id, code, direction_code)
);

CREATE TABLE IF NOT EXISTS tb_fiat_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  precision INT NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction_code TEXT NOT NULL,
  fiat_currency_id UUID NOT NULL REFERENCES tb_fiat_currencies(id),
  asset_id UUID NOT NULL REFERENCES tb_assets(id),
  network_id UUID NOT NULL REFERENCES tb_networks(id),
  min_amount NUMERIC(20,8),
  max_amount NUMERIC(20,8),
  fee_profile JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_uid TEXT NOT NULL UNIQUE,
  pair_id UUID NOT NULL REFERENCES tb_pairs(id),
  amount_type TEXT NOT NULL,
  amount_in NUMERIC(20,8) NOT NULL,
  amount_out NUMERIC(20,8) NOT NULL,
  rate NUMERIC(20,8) NOT NULL,
  fee_breakdown JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES tb_users(id),
  asset_id UUID NOT NULL REFERENCES tb_assets(id),
  network_id UUID NOT NULL REFERENCES tb_networks(id),
  address TEXT NOT NULL,
  memo TEXT,
  label TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_payout_requisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES tb_users(id),
  fiat_currency_id UUID NOT NULL REFERENCES tb_fiat_currencies(id),
  requisite_type TEXT NOT NULL,
  bank_name TEXT,
  card_mask TEXT,
  sbp_phone TEXT,
  owner_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES tb_users(id),
  quote_id UUID REFERENCES tb_quotes(id),
  direction_code TEXT NOT NULL,
  status_code TEXT NOT NULL,
  fiat_amount NUMERIC(20,8),
  crypto_amount NUMERIC(20,8),
  rate NUMERIC(20,8),
  payout_requisite_id UUID REFERENCES tb_payout_requisites(id),
  wallet_id UUID REFERENCES tb_wallets(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_order_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES tb_orders(id),
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  actor_type TEXT,
  actor_id TEXT,
  payload_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_order_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES tb_orders(id),
  action_code TEXT NOT NULL,
  request_id TEXT,
  idempotency_key TEXT,
  operator_id TEXT,
  result_status TEXT,
  payload_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES tb_users(id),
  order_id UUID REFERENCES tb_orders(id),
  document_type TEXT NOT NULL,
  file_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES tb_users(id),
  channel TEXT NOT NULL,
  template_code TEXT,
  title TEXT,
  body TEXT,
  read_at TIMESTAMPTZ,
  payload_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload_json JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_webhook_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_event_id UUID NOT NULL REFERENCES tb_webhook_events(id),
  response_code INT,
  response_body TEXT,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL,
  key TEXT NOT NULL,
  request_hash TEXT,
  response_snapshot JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(scope, key)
);

CREATE TABLE IF NOT EXISTS tb_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT,
  actor_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  diff_json JSONB DEFAULT '{}'::jsonb,
  request_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tb_orders_user_id ON tb_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_tb_orders_status_code ON tb_orders(status_code);
CREATE INDEX IF NOT EXISTS idx_tb_order_timeline_order_id ON tb_order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_tb_notifications_user_id ON tb_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_tb_webhook_events_status ON tb_webhook_events(status);
