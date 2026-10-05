import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { C as createAstro, d as maybeRenderHead, i as renderComponent, m as defineScriptVars, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as $$BaseLayout } from "./BaseLayout_BpIUrvSy.mjs";
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
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="card hero" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Customer order</p><h2 data-astro-cid-sydbu2jh>Track order <span class="mono" data-astro-cid-sydbu2jh>${id}</span></h2><p class="lede" data-astro-cid-sydbu2jh>Статус сделки, timeline, документы и дальнейшие шаги для клиента.</p></div><button id="refresh" type="button" data-astro-cid-sydbu2jh>Refresh</button></section><div id="notice" class="notice" hidden data-astro-cid-sydbu2jh></div><section class="grid layout" data-astro-cid-sydbu2jh><div class="stack" data-astro-cid-sydbu2jh><section class="card" data-astro-cid-sydbu2jh><div class="section-head" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Current state</p><h2 id="hero-title" data-astro-cid-sydbu2jh>Loading…</h2><p class="lede" id="hero-subtitle" data-astro-cid-sydbu2jh>Fetching order details.</p></div><div id="status-badge" class="status draft" data-astro-cid-sydbu2jh>draft</div></div><div class="facts" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Public ID</span><strong id="publicId" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Direction</span><strong id="direction" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Fiat amount</span><strong id="fiat" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Crypto amount</span><strong id="crypto" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Rate</span><strong id="rate" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Expires</span><strong id="expires" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Wallet</span><strong id="wallet" class="mono" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Payout requisite</span><strong id="payout" class="mono" data-astro-cid-sydbu2jh>—</strong></div><div data-astro-cid-sydbu2jh><span data-astro-cid-sydbu2jh>Updated</span><strong id="updated" data-astro-cid-sydbu2jh>—</strong></div></div></section><section class="card" data-astro-cid-sydbu2jh><div class="section-head" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Progress</p><h2 data-astro-cid-sydbu2jh>Order timeline</h2></div><span id="timeline-count" class="tiny" data-astro-cid-sydbu2jh>0 events</span></div><div id="timeline" class="timeline" data-astro-cid-sydbu2jh><p class="empty" data-astro-cid-sydbu2jh>Loading timeline…</p></div></section></div><div class="stack" data-astro-cid-sydbu2jh><section class="card" data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Next step</p><h2 id="next-title" data-astro-cid-sydbu2jh>Preparing instructions…</h2><p class="lede" id="next-copy" data-astro-cid-sydbu2jh>The page will explain what the customer should do next.</p></section><section class="card" data-astro-cid-sydbu2jh><div class="section-head" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Documents</p><h2 data-astro-cid-sydbu2jh>Your uploads</h2></div><span id="documents-count" class="tiny" data-astro-cid-sydbu2jh>0 docs</span></div><div id="documents" class="feed" data-astro-cid-sydbu2jh><p class="empty" data-astro-cid-sydbu2jh>Loading documents…</p></div></section><section class="card" data-astro-cid-sydbu2jh><div class="section-head" data-astro-cid-sydbu2jh><div data-astro-cid-sydbu2jh><p class="eyebrow" data-astro-cid-sydbu2jh>Notifications</p><h2 data-astro-cid-sydbu2jh>Recent updates</h2></div><span id="notifications-count" class="tiny" data-astro-cid-sydbu2jh>0 items</span></div><div id="notifications" class="feed" data-astro-cid-sydbu2jh><p class="empty" data-astro-cid-sydbu2jh>Loading notifications…</p></div></section></div></section><script>(function(){${defineScriptVars({ id })}
    const API = \`\${window.location.protocol}//\${window.location.hostname}:4000/api\`;
    const orderId = id;
    const $ = (s) => document.querySelector(s);
    const fmt = (v) => Number(v ?? 0).toLocaleString('en-US');
    const date = (v) => v ? new Date(v).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : '—';
    const cut = (v) => v ? \`\${String(v).slice(0, 8)}…\` : '—';
    const nextSteps = {
      draft: ['Order created', 'Ожидается переход к шагу оплаты или подтверждению реквизитов.'],
      awaiting_payment: ['Send payment', 'Переведите фиат по выданным реквизитам и дождитесь подтверждения оплаты.'],
      payment_confirmed: ['Payment confirmed', 'Платёж подтверждён, заявка готовится к исполнению.'],
      processing: ['Processing payout', 'Оператор завершает обмен и готовит перевод криптовалюты.'],
      completed: ['Completed', 'Сделка завершена. Сохраните детали и проверьте поступление средств.'],
      cancelled: ['Cancelled', 'Заявка отменена. При необходимости создайте новую сделку.'],
      expired: ['Expired', 'Срок действия заявки истёк. Создайте новую заявку для продолжения.'],
    };

    function notify(message = '') {
      const box = $('#notice');
      if (!message) { box.hidden = true; box.textContent = ''; return; }
      box.hidden = false; box.textContent = message;
    }

    async function fetchJson(url) {
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Request failed');
      return data;
    }

    function renderSummary(order) {
      $('#hero-title').textContent = \`\${fmt(order.fiatAmount)} fiat → \${fmt(order.cryptoAmount)} crypto\`;
      $('#hero-subtitle').textContent = \`Quote \${cut(order.quoteId)} · User \${cut(order.userId)}\`;
      $('#publicId').textContent = order.publicId;
      $('#direction').textContent = order.directionCode;
      $('#fiat').textContent = fmt(order.fiatAmount);
      $('#crypto').textContent = fmt(order.cryptoAmount);
      $('#rate').textContent = order.rate;
      $('#expires').textContent = date(order.expiresAt);
      $('#wallet').textContent = cut(order.walletId);
      $('#payout').textContent = cut(order.payoutRequisiteId);
      $('#updated').textContent = date(order.updatedAt);
      $('#status-badge').className = \`status \${order.statusCode}\`;
      $('#status-badge').textContent = order.statusCode.replaceAll('_', ' ');
      const [title, copy] = nextSteps[order.statusCode] || ['Status updated', 'Следуйте дальнейшим инструкциям поддержки.'];
      $('#next-title').textContent = title;
      $('#next-copy').textContent = copy;
    }

    function renderTimeline(items) {
      $('#timeline-count').textContent = \`\${items.length} events\`;
      $('#timeline').innerHTML = items.length ? items.map((item) => \`
        <article class="event">
          <div class="event-meta"><strong>\${item.eventType}</strong><span>\${date(item.createdAt)}</span></div>
          <p>\${item.fromStatus || '—'} → \${item.toStatus || '—'}</p>
          <p>\${item.actorType || 'system'}\${item.actorId ? \` · \${item.actorId}\` : ''}</p>
        </article>\`).join('') : '<p class="empty">No events yet.</p>';
    }

    function renderDocuments(items) {
      $('#documents-count').textContent = \`\${items.length} docs\`;
      $('#documents').innerHTML = items.length ? items.map((item) => \`
        <article class="feed-item">
          <div class="feed-meta"><strong>\${item.documentType}</strong><span class="status \${item.status}">\${item.status}</span></div>
          <p>ID: <span class="mono">\${item.id}</span></p>
          <p>Created: \${date(item.createdAt)}</p>
        </article>\`).join('') : '<p class="empty">No uploaded documents yet.</p>';
    }

    function renderNotifications(items) {
      $('#notifications-count').textContent = \`\${items.length} items\`;
      $('#notifications').innerHTML = items.length ? items.map((item) => \`
        <article class="feed-item">
          <div class="feed-meta"><strong>\${item.title}</strong><span>\${date(item.createdAt)}</span></div>
          <p>\${item.body}</p>
          <p>Channel: \${item.channel}</p>
        </article>\`).join('') : '<p class="empty">No notifications yet.</p>';
    }

    async function load() {
      try {
        notify('');
        const data = await fetchJson(\`\${API}/orders/\${orderId}/summary\`);
        const item = data.item || {};
        renderSummary(item.order);
        renderTimeline(item.timeline || []);
        renderDocuments(item.documents || []);
        renderNotifications(item.notifications || []);
      } catch (error) {
        console.error('customer order detail failed', error);
        notify(error.message || 'Unable to load order detail');
      }
    }

    document.getElementById('refresh').addEventListener('click', load);
    load();
  })();<\/script>` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/orders/[id].astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/orders/[id].astro";
var $$url = "/orders/[id]";
//#endregion
//#region \0virtual:astro:page:src/pages/orders/[id]@_@astro
var page = () => _id__exports;
//#endregion
export { page };
