import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { C as createAstro, d as maybeRenderHead, i as renderComponent, p as addAttribute, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as $$BaseLayout } from "./BaseLayout__drHlUMR.mjs";
//#region src/pages/orders/[id].astro
var _id__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Id,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Id = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Id;
	const { id } = Astro.params;
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": `Order ${id}`,
		"data-astro-cid-sydbu2jh": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="hero card" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Customer order</p><h2 data-astro-cid-sydbu2jh>Track order <span class="mono" data-astro-cid-sydbu2jh>${id}</span></h2><p class="lede" data-astro-cid-sydbu2jh>Статус сделки, timeline, документы, уведомления и следующие клиентские действия в одном экране.</p></div><div class="hero-actions" data-astro-cid-sydbu2jh><a class="ghost-link" href="/orders" data-astro-cid-sydbu2jh>Back to orders</a><button id="refresh" type="button" data-astro-cid-sydbu2jh>Refresh</button></div></section><div id="notice" class="notice" hidden data-astro-cid-sydbu2jh></div><section class="grid layout" data-astro-cid-sydbu2jh><div class="stack" data-astro-cid-sydbu2jh><section class="card" data-astro-cid-sydbu2jh><div class="section-head" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Current state</p><h2 id="hero-title" data-astro-cid-sydbu2jh>Loading…</h2><p class="lede" id="hero-subtitle" data-astro-cid-sydbu2jh>Fetching order details.</p></div><div id="status-badge" class="status draft" data-astro-cid-sydbu2jh>draft</div></div><div class="facts" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Public ID</span><strong id="publicId" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Direction</span><strong id="direction" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Fiat amount</span><strong id="fiat" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Crypto amount</span><strong id="crypto" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Rate</span><strong id="rate" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Expires</span><strong id="expires" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Wallet</span><strong id="wallet" class="mono" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Payout requisite</span><strong id="payout" class="mono" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Updated</span><strong id="updated" data-astro-cid-sydbu2jh>—</strong></div></div></section><section class="card" data-astro-cid-sydbu2jh><div class="section-head" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Progress</p><h2 data-astro-cid-sydbu2jh>Order timeline</h2></div><span id="timeline-count" class="tiny" data-astro-cid-sydbu2jh>0 events</span></div><div id="timeline" class="timeline" data-astro-cid-sydbu2jh><p class="empty" data-astro-cid-sydbu2jh>Loading timeline…</p></div></section><section class="card" data-astro-cid-sydbu2jh><div class="section-head" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Available actions</p><h2 data-astro-cid-sydbu2jh>Customer flow controls</h2></div><span id="actions-count" class="tiny" data-astro-cid-sydbu2jh>0 actions</span></div><div id="actions" class="actions" data-astro-cid-sydbu2jh><p class="empty" data-astro-cid-sydbu2jh>Loading available actions…</p></div></section></div><div class="stack" data-astro-cid-sydbu2jh><section class="card" data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Next step</p><h2 id="next-title" data-astro-cid-sydbu2jh>Preparing instructions…</h2><p class="lede" id="next-copy" data-astro-cid-sydbu2jh>The page will explain what the customer should do next.</p></section><section class="card" data-astro-cid-sydbu2jh><div class="section-head" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Documents</p><h2 data-astro-cid-sydbu2jh>Your uploads</h2></div><span id="documents-count" class="tiny" data-astro-cid-sydbu2jh>0 docs</span></div><div id="documents" class="feed" data-astro-cid-sydbu2jh><p class="empty" data-astro-cid-sydbu2jh>Loading documents…</p></div></section><section class="card" data-astro-cid-sydbu2jh><div class="section-head" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Notifications</p><h2 data-astro-cid-sydbu2jh>Recent updates</h2></div><span id="notifications-count" class="tiny" data-astro-cid-sydbu2jh>0 items</span></div><div id="notifications" class="feed" data-astro-cid-sydbu2jh><p class="empty" data-astro-cid-sydbu2jh>Loading notifications…</p></div></section></div></section><script${addAttribute(JSON.stringify(id), "data-public-id")}>
    const API = \`\${window.location.protocol}//\${window.location.hostname}:4000/api\`;
    const publicId = JSON.parse(document.currentScript?.dataset.publicId || 'null');
    const refreshBtn = document.getElementById('refresh');
    const notice = document.getElementById('notice');
    const title = document.getElementById('hero-title');
    const subtitle = document.getElementById('hero-subtitle');
    const statusBadge = document.getElementById('status-badge');
    const timelineEl = document.getElementById('timeline');
    const timelineCount = document.getElementById('timeline-count');
    const actionsEl = document.getElementById('actions');
    const actionsCount = document.getElementById('actions-count');
    const documentsEl = document.getElementById('documents');
    const documentsCount = document.getElementById('documents-count');
    const notificationsEl = document.getElementById('notifications');
    const notificationsCount = document.getElementById('notifications-count');
    const nextTitle = document.getElementById('next-title');
    const nextCopy = document.getElementById('next-copy');

    const fields = {
      publicId: document.getElementById('publicId'),
      direction: document.getElementById('direction'),
      fiat: document.getElementById('fiat'),
      crypto: document.getElementById('crypto'),
      rate: document.getElementById('rate'),
      expires: document.getElementById('expires'),
      wallet: document.getElementById('wallet'),
      payout: document.getElementById('payout'),
      updated: document.getElementById('updated'),
    };

    const fmt = (value, digits = 2) => Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: digits });
    const date = (value) => value ? new Date(value).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : '—';

    function setNotice(message = '', type = 'error') {
      if (!message) {
        notice.hidden = true;
        notice.className = 'notice';
        notice.textContent = '';
        return;
      }
      notice.hidden = false;
      notice.className = \`notice \${type === 'success' ? 'success' : ''}\`.trim();
      notice.textContent = message;
    }

    async function api(path, options = {}) {
      const response = await fetch(\`\${API}\${path}\`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof payload?.message === 'string'
          ? payload.message
          : JSON.stringify(payload ?? {}).slice(0, 200) || \`HTTP \${response.status}\`;
        throw new Error(message);
      }
      return payload;
    }

    function nextStepForStatus(status) {
      switch (status) {
        case 'draft':
          return {
            title: 'Review the newly created request',
            copy: 'Quote is locked in draft. Follow the upcoming steps and prepare payment details before the request moves to awaiting_payment.',
          };
        case 'awaiting_payment':
          return {
            title: 'Send fiat payment and upload proof',
            copy: 'The system expects customer payment confirmation next. Operator or automated actions will move the order forward after proof is reviewed.',
          };
        case 'payment_confirmed':
          return {
            title: 'Payment confirmed',
            copy: 'The order is ready for processing. Watch timeline and notifications for the next operational change.',
          };
        case 'processing':
          return {
            title: 'Processing in progress',
            copy: 'Assets are being processed. Keep the order open and monitor recent notifications until final completion.',
          };
        case 'completed':
          return {
            title: 'Order completed',
            copy: 'The lifecycle is closed. Use notifications and timeline as a receipt trail for support or compliance follow-up.',
          };
        default:
          return {
            title: 'Monitor the lifecycle',
            copy: 'This screen aggregates the current state, audit-like timeline, related documents and user notifications for the order.',
          };
      }
    }

    function renderSummary(item) {
      const order = item?.order ?? item;
      title.textContent = \`\${order.directionCode || order.direction_code || 'Order'} · \${order.publicId || publicId}\`;
      subtitle.textContent = \`Current status: \${order.statusCode || 'unknown'}. Updated \${date(order.updatedAt)}.\`;
      const status = order.statusCode || 'draft';
      statusBadge.textContent = status;
      statusBadge.className = \`status \${status}\`;
      fields.publicId.textContent = order.publicId || '—';
      fields.direction.textContent = order.directionCode || order.direction_code || '—';
      fields.fiat.textContent = fmt(order.fiatAmount || order.fiat_amount, 2);
      fields.crypto.textContent = fmt(order.cryptoAmount || order.crypto_amount, 8);
      fields.rate.textContent = fmt(order.rate, 6);
      fields.expires.textContent = date(order.expiresAt || order.expires_at);
      fields.wallet.textContent = order.walletId || order.wallet_id || '—';
      fields.payout.textContent = order.payoutRequisiteId || order.payout_requisite_id || '—';
      fields.updated.textContent = date(order.updatedAt || order.updated_at);
      const next = nextStepForStatus(status);
      nextTitle.textContent = next.title;
      nextCopy.textContent = next.copy;
    }

    function renderTimeline(items = []) {
      timelineCount.textContent = \`\${items.length} events\`;
      if (!items.length) {
        timelineEl.innerHTML = '<p class="empty">No timeline events yet.</p>';
        return;
      }
      timelineEl.innerHTML = items.map((item) => \`
        <div class="event">
          <div class="dot"></div>
          <div class="event-copy">
            <b>\${item.eventType || 'event'}</b>
            <span>\${item.fromStatus || '—'} → \${item.toStatus || '—'}</span>
            <span class="tiny">\${date(item.createdAt)}</span>
          </div>
        </div>
      \`).join('');
    }

    function renderActions(items = []) {
      actionsCount.textContent = \`\${items.length} actions\`;
      if (!items.length) {
        actionsEl.innerHTML = '<p class="empty">No customer-visible actions are currently available.</p>';
        return;
      }
      actionsEl.innerHTML = items.map((item) => \`
        <div class="action-row">
          <div class="action-copy">
            <b>\${item.actionCode || item.action_code}</b>
            <span class="tiny">\${item.status || 'pending'} · \${date(item.createdAt)}</span>
          </div>
          <button type="button" disabled>Recorded</button>
        </div>
      \`).join('');
    }

    function renderDocuments(items = []) {
      documentsCount.textContent = \`\${items.length} docs\`;
      if (!items.length) {
        documentsEl.innerHTML = '<p class="empty">No documents attached to this order yet.</p>';
        return;
      }
      documentsEl.innerHTML = items.map((item) => \`
        <div class="feed-item">
          <b>\${item.documentType || item.document_type}</b>
          <p>\${item.status || 'pending'} · file \${item.fileId || item.file_id}</p>
        </div>
      \`).join('');
    }

    function renderNotifications(items = []) {
      notificationsCount.textContent = \`\${items.length} items\`;
      if (!items.length) {
        notificationsEl.innerHTML = '<p class="empty">No recent notifications for this user.</p>';
        return;
      }
      notificationsEl.innerHTML = items.slice(0, 8).map((item) => \`
        <div class="feed-item">
          <b>\${item.title || item.templateCode || item.template_code || 'Notification'}</b>
          <p>\${item.body || 'No body'} · \${date(item.createdAt)}</p>
        </div>
      \`).join('');
    }

    async function loadOrderView() {
      refreshBtn.disabled = true;
      setNotice('');
      try {
        const [summaryPayload, timelinePayload, actionsPayload] = await Promise.all([
          api(\`/orders/\${publicId}/summary\`),
          api(\`/orders/\${publicId}/timeline\`),
          api(\`/orders/\${publicId}/actions\`),
        ]);

        renderSummary(summaryPayload?.item);
        renderTimeline(Array.isArray(timelinePayload?.items) ? timelinePayload.items : []);
        renderActions(Array.isArray(actionsPayload?.items) ? actionsPayload.items : []);

        const orderId = summaryPayload?.item?.order?.id || summaryPayload?.item?.id;
        const userId = summaryPayload?.item?.order?.userId || summaryPayload?.item?.userId;

        if (orderId) {
          const documentsPayload = await api(\`/documents?order_id=\${orderId}\`);
          renderDocuments(Array.isArray(documentsPayload?.items) ? documentsPayload.items : []);
        } else {
          renderDocuments([]);
        }

        if (userId) {
          const notificationsPayload = await api(\`/notifications?user_id=\${userId}\`);
          renderNotifications(Array.isArray(notificationsPayload?.items) ? notificationsPayload.items : []);
        } else {
          renderNotifications([]);
        }
      } catch (error) {
        setNotice(error.message || 'Failed to load order details.');
        timelineEl.innerHTML = '<p class="empty">Unable to load timeline.</p>';
        actionsEl.innerHTML = '<p class="empty">Unable to load actions.</p>';
        documentsEl.innerHTML = '<p class="empty">Unable to load documents.</p>';
        notificationsEl.innerHTML = '<p class="empty">Unable to load notifications.</p>';
      } finally {
        refreshBtn.disabled = false;
      }
    }

    refreshBtn.addEventListener('click', loadOrderView);
    loadOrderView();
  <\/script>` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/orders/[id].astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/orders/[id].astro";
var $$url = "/orders/[id]";
//#endregion
//#region \0virtual:astro:page:src/pages/orders/[id]@_@astro
var page = () => _id__exports;
//#endregion
export { page };
