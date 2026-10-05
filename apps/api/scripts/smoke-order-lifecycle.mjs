const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:4000/api';
const readinessTimeoutMs = Number(process.env.API_READY_TIMEOUT_MS ?? 20000);
const readinessIntervalMs = Number(process.env.API_READY_INTERVAL_MS ?? 1000);
const fixture = {
  userId: '00000000-0000-0000-0000-000000000401',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureApiReady() {
  const healthUrl = `${baseUrl}/health`;
  const startedAt = Date.now();
  let lastReason = 'unknown readiness failure';

  while (Date.now() - startedAt < readinessTimeoutMs) {
    try {
      const response = await fetch(healthUrl);
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.status === 'ok') return;
      lastReason = response.ok ? 'unexpected health payload' : `HTTP ${response.status}`;
    } catch (error) {
      lastReason = error instanceof Error ? error.message : String(error);
    }
    await sleep(readinessIntervalMs);
  }

  throw new Error(`API is not ready after ${readinessTimeoutMs}ms: ${healthUrl} (${lastReason})`);
}

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed with HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function hasTransition(items, fromStatus, toStatus, eventType) {
  return items.some((item) => item.fromStatus === fromStatus && item.toStatus === toStatus && item.eventType === eventType);
}

async function main() {
  await ensureApiReady();

  const quote = await api('/quotes/calculate', {
    method: 'POST',
    body: JSON.stringify({
      direction_code: 'buy',
      fiat_currency_code: 'RUB',
      asset_code: 'USDT',
      network_code: 'TRC20',
      amount_type: 'fiat',
      amount: 15000,
    }),
  });
  assert(quote?.quote_id, 'quote.quote_id is required');

  const createdOrder = await api('/orders', {
    method: 'POST',
    body: JSON.stringify({
      quote_id: quote.quote_id,
      user_id: fixture.userId,
    }),
  });
  assert(createdOrder?.id && createdOrder?.publicId, 'created order identity is required');
  assert(createdOrder.statusCode === 'draft', `expected created order draft status, got ${createdOrder.statusCode}`);

  const updatedToAwaiting = await api(`/orders/${createdOrder.publicId}/status`, {
    method: 'POST',
    body: JSON.stringify({
      status_code: 'awaiting_payment',
      operator_id: 'ci-lifecycle-bootstrap',
      payload: { source: 'lifecycle-smoke' },
    }),
  });
  assert(updatedToAwaiting?.item?.statusCode === 'awaiting_payment', 'order must move to awaiting_payment');

  const createdDocument = await api('/documents', {
    method: 'POST',
    body: JSON.stringify({
      owner_user_id: fixture.userId,
      order_id: createdOrder.id,
      document_type: 'payment_proof',
      file_id: `ci-payment-proof-${createdOrder.publicId}`,
      metadata: { source: 'lifecycle-smoke' },
    }),
  });
  assert(createdDocument?.item?.id, 'document creation must return item.id');

  assert(createdDocument?.item?.status === 'submitted', 'created payment proof must start in submitted status');

  const approvedDocument = await api(`/documents/${createdDocument.item.id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status: 'approved', operator_id: 'ci-operator-1' }),
  });
  assert(approvedDocument?.item?.status === 'approved', 'payment proof must be approved');

  const paymentConfirmedOrder = await api(`/orders/${createdOrder.publicId}`);
  assert(paymentConfirmedOrder?.statusCode === 'payment_confirmed', 'approved payment proof must move order to payment_confirmed');


  const startProcessing = await api(`/orders/${createdOrder.publicId}/actions`, {
    method: 'POST',
    body: JSON.stringify({
      action_code: 'start_processing',
      operator_id: 'ci-operator-1',
      idempotency_key: `start-${createdOrder.publicId}`,
      request_id: `req-start-${createdOrder.publicId}`,
      payload: { source: 'lifecycle-smoke' },
    }),
  });
  assert(startProcessing?.order?.statusCode === 'processing', 'start_processing must move order to processing');

  const complete = await api(`/orders/${createdOrder.publicId}/actions`, {
    method: 'POST',
    body: JSON.stringify({
      action_code: 'complete',
      operator_id: 'ci-operator-1',
      idempotency_key: `complete-${createdOrder.publicId}`,
      request_id: `req-complete-${createdOrder.publicId}`,
      payload: { source: 'lifecycle-smoke' },
    }),
  });
  assert(complete?.order?.statusCode === 'completed', 'complete must move order to completed');

  const order = await api(`/orders/${createdOrder.publicId}`);
  assert(order?.statusCode === 'completed', `expected final order status completed, got ${order?.statusCode}`);

  const actions = await api(`/orders/${createdOrder.publicId}/actions`);
  assert(Array.isArray(actions?.items), 'order actions must return an items array');
  assert(actions.items.length === 0, 'completed order must not expose further actions');

  const timeline = await api(`/orders/${createdOrder.publicId}/timeline`);
  assert(Array.isArray(timeline?.items), 'timeline.items must be an array');
  assert(hasTransition(timeline.items, null, 'draft', 'order_created'), 'timeline must contain order_created');
  assert(hasTransition(timeline.items, 'draft', 'awaiting_payment', 'status_changed'), 'timeline must contain status_changed to awaiting_payment');
  assert(hasTransition(timeline.items, 'awaiting_payment', 'payment_confirmed', 'status_changed'), 'timeline must contain payment proof approval status transition');
  assert(timeline.items.some((item) => item.eventType === 'document_reviewed'), 'timeline must contain document_reviewed event');
  assert(hasTransition(timeline.items, 'payment_confirmed', 'processing', 'action_start_processing'), 'timeline must contain start_processing transition');
  assert(hasTransition(timeline.items, 'processing', 'completed', 'action_complete'), 'timeline must contain complete transition');
  assert(timeline.items.some((item) => item.eventType === 'document_submitted'), 'timeline must contain document_submitted event');

  const notifications = await api(`/notifications?user_id=${fixture.userId}`);
  assert(Array.isArray(notifications?.items), 'notifications.items must be an array');
  const orderNotifications = notifications.items.filter((item) => item?.payloadJson?.order_public_id === createdOrder.publicId && item?.templateCode === 'order_status_changed');
  assert(orderNotifications.length >= 4, `expected at least 4 order status notifications, got ${orderNotifications.length}`);

  const documents = await api(`/documents?order_id=${createdOrder.id}`);
  assert(Array.isArray(documents?.items) && documents.items.some((item) => item.id === createdDocument.item.id), 'documents list must include created document');

  const auditLogs = await api(`/audit-logs?entity_type=order&entity_id=${createdOrder.id}`);
  assert(Array.isArray(auditLogs?.items), 'auditLogs.items must be an array');
  const orderAuditLogs = auditLogs.items;
  assert(orderAuditLogs.some((item) => item?.action === 'order.status_changed'), 'audit logs must include status change');
  assert(orderAuditLogs.some((item) => item?.action === 'order.action.start_processing'), 'audit logs must include start_processing action');
  assert(orderAuditLogs.some((item) => item?.action === 'order.action.complete'), 'audit logs must include complete action');

  const webhookEvents = await api('/webhook-events?entity_type=order');
  assert(Array.isArray(webhookEvents?.items), 'webhookEvents.items must be an array');
  const orderWebhookEvents = webhookEvents.items.filter((item) => item?.entityId === createdOrder.id);
  assert(orderWebhookEvents.length >= 4, `expected at least 4 webhook events for order, got ${orderWebhookEvents.length}`);

  console.log(`Lifecycle smoke passed for ${createdOrder.publicId}`);
}

main().catch((error) => {
  console.error('Lifecycle smoke failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
