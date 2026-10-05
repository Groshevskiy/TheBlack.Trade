import pg from 'pg';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://theblacktrade:theblacktrade@localhost:55432/theblacktrade';
const { Client } = pg;
const client = new Client({ connectionString });

const ids = {
  user: '00000000-0000-0000-0000-000000000401',
  asset: '00000000-0000-0000-0000-000000000101',
  network: '00000000-0000-0000-0000-000000000201',
  fiat: '00000000-0000-0000-0000-000000000301',
  wallet: '00000000-0000-0000-0000-000000000501',
  payout: '00000000-0000-0000-0000-000000000601',
  order: '00000000-0000-0000-0000-000000000701',
  notification: '00000000-0000-0000-0000-000000000801',
  timeline: '00000000-0000-0000-0000-000000000901',
};

async function main() {
  await client.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO tb_assets (id, code, name, precision, is_active)
       VALUES ($1, 'USDT', 'Tether USD', 6, TRUE)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, precision = EXCLUDED.precision, is_active = TRUE`,
      [ids.asset],
    );

    await client.query(
      `INSERT INTO tb_fiat_currencies (id, code, name, precision, is_active)
       VALUES ($1, 'RUB', 'Russian Ruble', 2, TRUE)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, precision = EXCLUDED.precision, is_active = TRUE`,
      [ids.fiat],
    );

    await client.query(
      `INSERT INTO tb_networks (id, asset_id, code, direction_code, confirmations_required, is_active)
       VALUES ($1, $2, 'TRC20', 'buy', 1, TRUE)
       ON CONFLICT (id) DO UPDATE SET asset_id = EXCLUDED.asset_id, code = EXCLUDED.code, direction_code = EXCLUDED.direction_code, confirmations_required = EXCLUDED.confirmations_required, is_active = TRUE`,
      [ids.network, ids.asset],
    );

    await client.query(
      `INSERT INTO tb_users (id, email, phone, locale, kyc_level, status)
       VALUES ($1, 'smoke@theblack.trade', '+79990000000', 'ru', 'basic', 'active')
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, phone = EXCLUDED.phone, locale = EXCLUDED.locale, kyc_level = EXCLUDED.kyc_level, status = 'active', updated_at = now()`,
      [ids.user],
    );

    await client.query(
      `INSERT INTO tb_wallets (id, user_id, asset_id, network_id, address, label, is_verified)
       VALUES ($1, $2, $3, $4, 'TSmokeSummaryWallet111111111111111111', 'CI smoke wallet', TRUE)
       ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, asset_id = EXCLUDED.asset_id, network_id = EXCLUDED.network_id, address = EXCLUDED.address, label = EXCLUDED.label, is_verified = TRUE`,
      [ids.wallet, ids.user, ids.asset, ids.network],
    );

    const { rows: fiatRows } = await client.query(
      `SELECT id FROM tb_fiat_currencies WHERE code = 'RUB' LIMIT 1`,
    );

    if (fiatRows.length === 0) {
      throw new Error('Reference fiat currency RUB is missing');
    }

    const fiatId = fiatRows[0].id;

    await client.query(
      `INSERT INTO tb_payout_requisites (id, user_id, fiat_currency_id, requisite_type, bank_name, card_mask, owner_name, status)
       VALUES ($1, $2, $3, 'card', 'Smoke Bank', '2200 **** 0000', 'CI Smoke User', 'active')
       ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, fiat_currency_id = EXCLUDED.fiat_currency_id, requisite_type = EXCLUDED.requisite_type, bank_name = EXCLUDED.bank_name, card_mask = EXCLUDED.card_mask, owner_name = EXCLUDED.owner_name, status = 'active'`,
      [ids.payout, ids.user, fiatId],
    );

    await client.query(
      `INSERT INTO tb_orders (id, public_id, user_id, direction_code, status_code, fiat_amount, crypto_amount, rate, payout_requisite_id, wallet_id, metadata, expires_at)
       VALUES ($1, 'SMOKE-SUMMARY-001', $2, 'buy', 'processing', 1000, 10, 100, $3, $4, '{"source":"ci-summary-smoke"}'::jsonb, now() + interval '30 minutes')
       ON CONFLICT (id) DO UPDATE SET public_id = EXCLUDED.public_id, user_id = EXCLUDED.user_id, direction_code = EXCLUDED.direction_code, status_code = EXCLUDED.status_code, fiat_amount = EXCLUDED.fiat_amount, crypto_amount = EXCLUDED.crypto_amount, rate = EXCLUDED.rate, payout_requisite_id = EXCLUDED.payout_requisite_id, wallet_id = EXCLUDED.wallet_id, metadata = EXCLUDED.metadata, expires_at = EXCLUDED.expires_at, updated_at = now()`,
      [ids.order, ids.user, ids.payout, ids.wallet],
    );

    await client.query(
      `INSERT INTO tb_notifications (id, user_id, channel, template_code, title, body, payload_json)
       VALUES ($1, $2, 'in_app', 'order_processing', 'Order is processing', 'CI summary fixture notification', '{"actionRequired":true}'::jsonb)
       ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, channel = EXCLUDED.channel, template_code = EXCLUDED.template_code, title = EXCLUDED.title, body = EXCLUDED.body, read_at = NULL, payload_json = EXCLUDED.payload_json`,
      [ids.notification, ids.user],
    );

    await client.query(
      `INSERT INTO tb_order_timeline (id, order_id, event_type, from_status, to_status, actor_type, actor_id, payload_json)
       VALUES ($1, $2, 'status_changed', 'payment_confirmed', 'processing', 'system', 'ci', '{"source":"ci-summary-smoke"}'::jsonb)
       ON CONFLICT (id) DO UPDATE SET order_id = EXCLUDED.order_id, event_type = EXCLUDED.event_type, from_status = EXCLUDED.from_status, to_status = EXCLUDED.to_status, actor_type = EXCLUDED.actor_type, actor_id = EXCLUDED.actor_id, payload_json = EXCLUDED.payload_json`,
      [ids.timeline, ids.order],
    );

    await client.query('COMMIT');
    console.log('Summary smoke fixture is ready.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Failed to bootstrap summary smoke fixture:', error);
  process.exit(1);
});
