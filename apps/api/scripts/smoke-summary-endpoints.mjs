const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:4000/api';
const readinessTimeoutMs = Number(process.env.API_READY_TIMEOUT_MS ?? 20000);
const readinessIntervalMs = Number(process.env.API_READY_INTERVAL_MS ?? 1000);

const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;
const hasOrderIdentity = (order) => Boolean(order?.id && order?.publicId && order?.statusCode && order?.directionCode);
const sameCount = (actual, expected) => actual === expected;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureApiReady() {
  const healthUrl = `${baseUrl}/health`;
  const startedAt = Date.now();
  let lastReason = 'unknown readiness failure';

  while (Date.now() - startedAt < readinessTimeoutMs) {
    try {
      const response = await fetch(healthUrl);
      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.ok && payload?.status === 'ok') {
        return;
      }

      lastReason = response.ok
        ? 'unexpected health payload'
        : `HTTP ${response.status}`;
    } catch (error) {
      lastReason = error instanceof Error ? error.message : String(error);
    }

    await sleep(readinessIntervalMs);
  }

  console.error(`API is not ready after ${readinessTimeoutMs}ms: ${healthUrl} (${lastReason})`);
  process.exit(1);
}



function validateOperationsSummary(item) {
  const errors = [];
  if (!Array.isArray(item?.webhookEvents)) errors.push('item.webhookEvents must be an array');
  if (!Array.isArray(item?.webhookAttempts)) errors.push('item.webhookAttempts must be an array');
  if (!Array.isArray(item?.auditLogs)) errors.push('item.auditLogs must be an array');
  for (const key of ['webhookEvents', 'deliveredWebhookEvents', 'failedWebhookEvents', 'pendingWebhookEvents', 'webhookAttempts', 'auditLogs', 'auditEntityTypes', 'auditActions']) {
    if (!isNonNegativeInteger(item?.metrics?.[key])) errors.push(`metrics.${key} must be a non-negative integer`);
  }
  if (Array.isArray(item?.webhookEvents) && !sameCount(item.metrics?.webhookEvents, item.webhookEvents.length)) {
    errors.push(`metrics.webhookEvents (${item.metrics?.webhookEvents}) must equal webhookEvents.length (${item.webhookEvents.length})`);
  }
  if (Array.isArray(item?.webhookAttempts) && !sameCount(item.metrics?.webhookAttempts, item.webhookAttempts.length)) {
    errors.push(`metrics.webhookAttempts (${item.metrics?.webhookAttempts}) must equal webhookAttempts.length (${item.webhookAttempts.length})`);
  }
  if (Array.isArray(item?.auditLogs) && !sameCount(item.metrics?.auditLogs, item.auditLogs.length)) {
    errors.push(`metrics.auditLogs (${item.metrics?.auditLogs}) must equal auditLogs.length (${item.auditLogs.length})`);
  }
  if ((item.metrics?.deliveredWebhookEvents ?? 0) + (item.metrics?.failedWebhookEvents ?? 0) + (item.metrics?.pendingWebhookEvents ?? 0) !== (item.metrics?.webhookEvents ?? 0)) {
    errors.push('delivered + failed + pending webhook events must equal total webhook events');
  }
  if (Array.isArray(item?.auditLogs)) {
    const entityTypes = new Set(item.auditLogs.map((log) => log.entityType).filter(Boolean)).size;
    const actions = new Set(item.auditLogs.map((log) => log.action).filter(Boolean)).size;
    if (!sameCount(item.metrics?.auditEntityTypes, entityTypes)) {
      errors.push(`metrics.auditEntityTypes (${item.metrics?.auditEntityTypes}) must equal unique audit entity types (${entityTypes})`);
    }
    if (!sameCount(item.metrics?.auditActions, actions)) {
      errors.push(`metrics.auditActions (${item.metrics?.auditActions}) must equal unique audit actions (${actions})`);
    }
  }
  return errors;
}

async function validateOperationsSummaryConsistency() {
  const response = await fetch(`${baseUrl}/operations/summary`);
  const payload = await response.json().catch(() => null);
  if (!response.ok) return [`operations summary HTTP ${response.status}`];
  return validateOperationsSummary(payload?.item);
}

function validateAccountSummary(item) {
  const errors = [];
  if (!item?.user?.id) errors.push('missing item.user.id');
  if (!Array.isArray(item?.orders)) errors.push('item.orders must be an array');
  if (!item?.metrics || typeof item.metrics !== 'object') errors.push('missing item.metrics');
  for (const key of ['orders', 'unreadNotifications', 'wallets', 'payoutRequisites']) {
    if (!isNonNegativeInteger(item?.metrics?.[key])) errors.push(`metrics.${key} must be a non-negative integer`);
  }
  if (Array.isArray(item?.orders) && !sameCount(item.metrics?.orders, item.orders.length)) {
    errors.push(`metrics.orders (${item.metrics?.orders}) must equal orders.length (${item.orders.length})`);
  }
  if (Array.isArray(item?.orders) && item.orders.some((order) => !hasOrderIdentity(order))) {
    errors.push('every order must include id, publicId, statusCode and directionCode');
  }
  return errors;
}

function validateCustomerOrdersSummary(item) {
  const errors = [];
  if (!item?.user?.id) errors.push('missing item.user.id');
  if (!Array.isArray(item?.orders)) errors.push('item.orders must be an array');
  for (const key of ['total', 'open', 'completed', 'needsAction']) {
    if (!isNonNegativeInteger(item?.metrics?.[key])) errors.push(`metrics.${key} must be a non-negative integer`);
  }
  if (Array.isArray(item?.orders) && !sameCount(item.metrics?.total, item.orders.length)) {
    errors.push(`metrics.total (${item.metrics?.total}) must equal orders.length (${item.orders.length})`);
  }
  if ((item.metrics?.open ?? 0) + (item.metrics?.completed ?? 0) > (item.metrics?.total ?? 0)) {
    errors.push('metrics.open + metrics.completed cannot exceed metrics.total');
  }
  if (Array.isArray(item?.orders) && item.orders.some((order) => !hasOrderIdentity(order))) {
    errors.push('every order must include id, publicId, statusCode and directionCode');
  }
  return errors;
}



function validateNotificationsSummary(item) {
  const errors = [];
  if (!item?.user?.id) errors.push('missing item.user.id');
  if (!Array.isArray(item?.notifications)) errors.push('item.notifications must be an array');
  for (const key of ['total', 'unread', 'read', 'channels', 'templates', 'actionRequired']) {
    if (!isNonNegativeInteger(item?.metrics?.[key])) errors.push(`metrics.${key} must be a non-negative integer`);
  }
  if (Array.isArray(item?.notifications) && !sameCount(item.metrics?.total, item.notifications.length)) {
    errors.push(`metrics.total (${item.metrics?.total}) must equal notifications.length (${item.notifications.length})`);
  }
  if ((item.metrics?.unread ?? 0) + (item.metrics?.read ?? 0) !== (item.metrics?.total ?? 0)) {
    errors.push('metrics.unread + metrics.read must equal metrics.total');
  }
  if ((item.metrics?.actionRequired ?? 0) > (item.metrics?.unread ?? 0)) {
    errors.push('metrics.actionRequired cannot exceed metrics.unread');
  }
  if (Array.isArray(item?.notifications)) {
    const channelCount = new Set(item.notifications.map((n) => n.channel).filter(Boolean)).size;
    const templateCount = new Set(item.notifications.map((n) => n.templateCode).filter(Boolean)).size;
    if (!sameCount(item.metrics?.channels, channelCount)) {
      errors.push(`metrics.channels (${item.metrics?.channels}) must equal unique channel count (${channelCount})`);
    }
    if (!sameCount(item.metrics?.templates, templateCount)) {
      errors.push(`metrics.templates (${item.metrics?.templates}) must equal unique template count (${templateCount})`);
    }
  }
  return errors;
}

function validateWalletsSummary(item) {
  const errors = [];
  if (!item?.user?.id) errors.push('missing item.user.id');
  if (!Array.isArray(item?.wallets)) errors.push('item.wallets must be an array');
  if (!Array.isArray(item?.payoutRequisites)) errors.push('item.payoutRequisites must be an array');
  if (!Array.isArray(item?.orders)) errors.push('item.orders must be an array');
  for (const key of ['wallets', 'verifiedWallets', 'payoutRequisites', 'activeOrders', 'networks']) {
    if (!isNonNegativeInteger(item?.metrics?.[key])) errors.push(`metrics.${key} must be a non-negative integer`);
  }
  if (Array.isArray(item?.wallets) && !sameCount(item.metrics?.wallets, item.wallets.length)) {
    errors.push(`metrics.wallets (${item.metrics?.wallets}) must equal wallets.length (${item.wallets.length})`);
  }
  if (Array.isArray(item?.payoutRequisites) && !sameCount(item.metrics?.payoutRequisites, item.payoutRequisites.length)) {
    errors.push(`metrics.payoutRequisites (${item.metrics?.payoutRequisites}) must equal payoutRequisites.length (${item.payoutRequisites.length})`);
  }
  if (Array.isArray(item?.orders) && !sameCount(item.metrics?.activeOrders, item.orders.length)) {
    errors.push(`metrics.activeOrders (${item.metrics?.activeOrders}) must equal orders.length (${item.orders.length})`);
  }
  if ((item.metrics?.verifiedWallets ?? 0) > (item.metrics?.wallets ?? 0)) {
    errors.push('metrics.verifiedWallets cannot exceed metrics.wallets');
  }
  if (Array.isArray(item?.orders) && item.orders.some((order) => !hasOrderIdentity(order))) {
    errors.push('every active order must include id, publicId, statusCode and directionCode');
  }
  if (Array.isArray(item?.wallets)) {
    const uniqueNetworks = new Set(item.wallets.map((wallet) => wallet.networkId).filter(Boolean)).size;
    if (!sameCount(item.metrics?.networks, uniqueNetworks)) {
      errors.push(`metrics.networks (${item.metrics?.networks}) must equal unique wallet network count (${uniqueNetworks})`);
    }
  }
  return errors;
}

function validateOperatorQueueSummary(item) {
  const errors = [];
  if (!Array.isArray(item?.items)) errors.push('item.items must be an array');
  for (const key of ['total', 'active', 'completed', 'needsAttention', 'pendingDocuments']) {
    if (!isNonNegativeInteger(item?.metrics?.[key])) errors.push(`metrics.${key} must be a non-negative integer`);
  }
  if (Array.isArray(item?.items) && !sameCount(item.metrics?.total, item.items.length)) {
    errors.push(`metrics.total (${item.metrics?.total}) must equal items.length (${item.items.length})`);
  }
  if ((item.metrics?.active ?? 0) + (item.metrics?.completed ?? 0) > (item.metrics?.total ?? 0)) {
    errors.push('metrics.active + metrics.completed cannot exceed metrics.total');
  }
  if (Array.isArray(item?.items) && item.items.some((order) => !hasOrderIdentity(order) || !isNonNegativeInteger(order.pendingDocuments))) {
    errors.push('every queue item must include order identity and non-negative pendingDocuments');
  }
  const pendingDocuments = Array.isArray(item?.items) ? item.items.reduce((sum, order) => sum + order.pendingDocuments, 0) : 0;
  if (Array.isArray(item?.items) && !sameCount(item.metrics?.pendingDocuments, pendingDocuments)) {
    errors.push(`metrics.pendingDocuments (${item.metrics?.pendingDocuments}) must equal summed item pendingDocuments (${pendingDocuments})`);
  }
  return errors;
}




async function validateAccountSummaryConsistency() {
  const errors = [];
  const [accountResponse, walletsResponse, notificationsResponse] = await Promise.all([
    fetch(`${baseUrl}/auth/me/summary`),
    fetch(`${baseUrl}/wallets/summary`),
    fetch(`${baseUrl}/notifications/summary`),
  ]);
  const accountPayload = await accountResponse.json().catch(() => null);
  const walletsPayload = await walletsResponse.json().catch(() => null);
  const notificationsPayload = await notificationsResponse.json().catch(() => null);

  if (!accountResponse.ok) return [`account summary HTTP ${accountResponse.status}`];
  if (!walletsResponse.ok) return [`wallets summary HTTP ${walletsResponse.status}`];
  if (!notificationsResponse.ok) return [`notifications summary HTTP ${notificationsResponse.status}`];

  const accountItem = accountPayload?.item || {};
  const walletsItem = walletsPayload?.item || {};
  const notificationsItem = notificationsPayload?.item || {};

  if (!sameCount(accountItem?.metrics?.wallets, walletsItem?.metrics?.wallets)) {
    errors.push(`account metrics.wallets (${accountItem?.metrics?.wallets}) must equal wallets summary metrics.wallets (${walletsItem?.metrics?.wallets})`);
  }
  if (!sameCount(accountItem?.metrics?.payoutRequisites, walletsItem?.metrics?.payoutRequisites)) {
    errors.push(`account metrics.payoutRequisites (${accountItem?.metrics?.payoutRequisites}) must equal wallets summary metrics.payoutRequisites (${walletsItem?.metrics?.payoutRequisites})`);
  }
  if (!sameCount(accountItem?.metrics?.unreadNotifications, notificationsItem?.metrics?.unread)) {
    errors.push(`account metrics.unreadNotifications (${accountItem?.metrics?.unreadNotifications}) must equal notifications summary metrics.unread (${notificationsItem?.metrics?.unread})`);
  }

  const accountOrders = Array.isArray(accountItem?.orders) ? accountItem.orders.length : null;
  const walletsOrders = Array.isArray(walletsItem?.orders) ? walletsItem.orders.length : null;
  if (accountOrders !== null && walletsOrders !== null && walletsOrders > accountOrders) {
    errors.push(`wallets summary active orders length (${walletsOrders}) cannot exceed account summary orders length (${accountOrders})`);
  }

  return errors;
}

async function validateDashboardWalletsConsistency() {
  const errors = [];
  const [dashboardResponse, walletsResponse] = await Promise.all([
    fetch(`${baseUrl}/dashboard/summary`),
    fetch(`${baseUrl}/wallets/summary`),
  ]);
  const dashboardPayload = await dashboardResponse.json().catch(() => null);
  const walletsPayload = await walletsResponse.json().catch(() => null);

  if (!dashboardResponse.ok) return [`dashboard summary HTTP ${dashboardResponse.status}`];
  if (!walletsResponse.ok) return [`wallets summary HTTP ${walletsResponse.status}`];

  const dashboardItem = dashboardPayload?.item || {};
  const walletsItem = walletsPayload?.item || {};
  const dashboardWallets = dashboardItem?.metrics?.wallets;
  const walletsTotal = walletsItem?.metrics?.wallets;
  const dashboardPayouts = dashboardItem?.metrics?.payoutRequisites;
  const walletsPayouts = walletsItem?.metrics?.payoutRequisites;
  const dashboardWalletItems = Array.isArray(dashboardItem?.wallets) ? dashboardItem.wallets.length : null;
  const walletsItems = Array.isArray(walletsItem?.wallets) ? walletsItem.wallets.length : null;
  const dashboardPayoutItems = Array.isArray(dashboardItem?.payoutRequisites) ? dashboardItem.payoutRequisites.length : null;
  const walletsPayoutItems = Array.isArray(walletsItem?.payoutRequisites) ? walletsItem.payoutRequisites.length : null;

  if (!sameCount(dashboardWallets, walletsTotal)) {
    errors.push(`dashboard metrics.wallets (${dashboardWallets}) must equal wallets summary metrics.wallets (${walletsTotal})`);
  }
  if (!sameCount(dashboardPayouts, walletsPayouts)) {
    errors.push(`dashboard metrics.payoutRequisites (${dashboardPayouts}) must equal wallets summary metrics.payoutRequisites (${walletsPayouts})`);
  }
  if (dashboardWalletItems !== null && walletsItems !== null && !sameCount(dashboardWalletItems, walletsItems)) {
    errors.push(`dashboard wallets length (${dashboardWalletItems}) must equal wallets summary wallets length (${walletsItems})`);
  }
  if (dashboardPayoutItems !== null && walletsPayoutItems !== null && !sameCount(dashboardPayoutItems, walletsPayoutItems)) {
    errors.push(`dashboard payoutRequisites length (${dashboardPayoutItems}) must equal wallets summary payoutRequisites length (${walletsPayoutItems})`);
  }

  return errors;
}

async function validateDashboardNotificationsConsistency() {
  const errors = [];
  const [dashboardResponse, notificationsResponse] = await Promise.all([
    fetch(`${baseUrl}/dashboard/summary`),
    fetch(`${baseUrl}/notifications/summary`),
  ]);
  const dashboardPayload = await dashboardResponse.json().catch(() => null);
  const notificationsPayload = await notificationsResponse.json().catch(() => null);

  if (!dashboardResponse.ok) return [`dashboard summary HTTP ${dashboardResponse.status}`];
  if (!notificationsResponse.ok) return [`notifications summary HTTP ${notificationsResponse.status}`];

  const dashboardItem = dashboardPayload?.item || {};
  const notificationsItem = notificationsPayload?.item || {};
  const dashboardUnread = dashboardItem?.metrics?.unreadNotifications;
  const notificationsUnread = notificationsItem?.metrics?.unread;
  const dashboardNotifications = Array.isArray(dashboardItem?.notifications) ? dashboardItem.notifications.length : null;
  const notificationsTotal = Array.isArray(notificationsItem?.notifications) ? notificationsItem.notifications.length : null;

  if (!sameCount(dashboardUnread, notificationsUnread)) {
    errors.push(`dashboard metrics.unreadNotifications (${dashboardUnread}) must equal notifications summary metrics.unread (${notificationsUnread})`);
  }
  if (dashboardNotifications !== null && notificationsTotal !== null && dashboardNotifications > notificationsTotal) {
    errors.push(`dashboard notifications length (${dashboardNotifications}) cannot exceed notifications summary length (${notificationsTotal})`);
  }

  return errors;
}

const endpoints = [
  { path: '/auth/me/summary', validate: validateAccountSummary },
  { path: '/auth/me/orders-summary', validate: validateCustomerOrdersSummary },
  { path: '/orders/operator/queue-summary', validate: validateOperatorQueueSummary },
  { path: '/wallets/summary', validate: validateWalletsSummary },
  { path: '/notifications/summary', validate: validateNotificationsSummary },
  { path: 'dashboard-notifications-consistency', validate: validateDashboardNotificationsConsistency, custom: true },
  { path: 'dashboard-wallets-consistency', validate: validateDashboardWalletsConsistency, custom: true },
  { path: 'account-summary-consistency', validate: validateAccountSummaryConsistency, custom: true },
  { path: 'operations-summary-consistency', validate: validateOperationsSummaryConsistency, custom: true },
];

let failed = false;
for (const endpoint of endpoints) {
  try {
    if (endpoint.custom) {
      const errors = await endpoint.validate();
      if (errors.length) {
        failed = true;
        console.error(`FAIL ${endpoint.path}: ${errors.join('; ')}`);
        continue;
      }
      console.log(`PASS ${endpoint.path}: cross-endpoint consistency is valid`);
      continue;
    }

    const response = await fetch(`${baseUrl}${endpoint.path}`);
    const payload = await response.json().catch(() => null);
    const errors = response.ok ? endpoint.validate(payload?.item) : [`HTTP ${response.status}`];
    if (errors.length) {
      failed = true;
      console.error(`FAIL ${endpoint.path}: ${errors.join('; ')}`);
      continue;
    }
    console.log(`PASS ${endpoint.path}: response shape and metric invariants are valid`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${endpoint.path}: ${error.message}`);
  }
}

if (failed) process.exitCode = 1;
