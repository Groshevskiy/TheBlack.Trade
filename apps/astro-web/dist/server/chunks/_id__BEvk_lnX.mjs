import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { C as createAstro, d as maybeRenderHead, i as renderComponent, m as defineScriptVars, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as $$BaseLayout } from "./BaseLayout__drHlUMR.mjs";
//#region src/pages/operator/orders/[id].astro
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
		"title": `Operator Order ${id}`,
		"data-astro-cid-4hdzmhc5": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="card hero" data-astro-cid-4hdzmhc5><div data-astro-cid-4hdzmhc5><p class="eyebrow" data-astro-cid-4hdzmhc5>Operator order</p><h2 data-astro-cid-4hdzmhc5>Order <span class="mono" data-astro-cid-4hdzmhc5>${id}</span></h2><p class="lede" data-astro-cid-4hdzmhc5>Операционный просмотр заказа, документов, уведомлений и управляющих действий.</p></div><button id="refresh" type="button" data-astro-cid-4hdzmhc5>Refresh</button></section><div id="notice" class="notice" hidden data-astro-cid-4hdzmhc5></div><section class="grid layout" data-astro-cid-4hdzmhc5><div class="stack" data-astro-cid-4hdzmhc5><section class="card" data-astro-cid-4hdzmhc5><p class="eyebrow" data-astro-cid-4hdzmhc5>Summary</p><h2 id="summary-title" data-astro-cid-4hdzmhc5>Loading…</h2><p class="lede" id="summary-subtitle" data-astro-cid-4hdzmhc5>Fetching order data.</p><div class="facts" data-astro-cid-4hdzmhc5><div data-astro-cid-4hdzmhc5><span data-astro-cid-4hdzmhc5>Public ID</span><strong id="publicId" data-astro-cid-4hdzmhc5>—</strong></div><div data-astro-cid-4hdzmhc5><span data-astro-cid-4hdzmhc5>Status</span><strong id="status" data-astro-cid-4hdzmhc5>—</strong></div><div data-astro-cid-4hdzmhc5><span data-astro-cid-4hdzmhc5>Direction</span><strong id="direction" data-astro-cid-4hdzmhc5>—</strong></div><div data-astro-cid-4hdzmhc5><span data-astro-cid-4hdzmhc5>Fiat</span><strong id="fiat" data-astro-cid-4hdzmhc5>—</strong></div><div data-astro-cid-4hdzmhc5><span data-astro-cid-4hdzmhc5>Crypto</span><strong id="crypto" data-astro-cid-4hdzmhc5>—</strong></div><div data-astro-cid-4hdzmhc5><span data-astro-cid-4hdzmhc5>Rate</span><strong id="rate" data-astro-cid-4hdzmhc5>—</strong></div><div data-astro-cid-4hdzmhc5><span data-astro-cid-4hdzmhc5>Wallet</span><strong id="wallet" class="mono" data-astro-cid-4hdzmhc5>—</strong></div><div data-astro-cid-4hdzmhc5><span data-astro-cid-4hdzmhc5>Payout requisite</span><strong id="payout" class="mono" data-astro-cid-4hdzmhc5>—</strong></div><div data-astro-cid-4hdzmhc5><span data-astro-cid-4hdzmhc5>Updated</span><strong id="updated" data-astro-cid-4hdzmhc5>—</strong></div></div></section><section class="card" data-astro-cid-4hdzmhc5><div class="section-head" data-astro-cid-4hdzmhc5><div data-astro-cid-4hdzmhc5><p class="eyebrow" data-astro-cid-4hdzmhc5>Lifecycle</p><h2 data-astro-cid-4hdzmhc5>Timeline</h2></div><span id="timeline-count" class="tiny" data-astro-cid-4hdzmhc5>0 events</span></div><div id="timeline" class="feed" data-astro-cid-4hdzmhc5><p class="empty" data-astro-cid-4hdzmhc5>Loading timeline…</p></div></section><section class="card" data-astro-cid-4hdzmhc5><div class="section-head" data-astro-cid-4hdzmhc5><div data-astro-cid-4hdzmhc5><p class="eyebrow" data-astro-cid-4hdzmhc5>Outbound</p><h2 data-astro-cid-4hdzmhc5>Notifications</h2></div><span id="notifications-count" class="tiny" data-astro-cid-4hdzmhc5>0 items</span></div><div id="notifications" class="feed" data-astro-cid-4hdzmhc5><p class="empty" data-astro-cid-4hdzmhc5>Loading notifications…</p></div></section></div><div class="stack" data-astro-cid-4hdzmhc5><section class="card" data-astro-cid-4hdzmhc5><div class="section-head" data-astro-cid-4hdzmhc5><div data-astro-cid-4hdzmhc5><p class="eyebrow" data-astro-cid-4hdzmhc5>Actions</p><h2 data-astro-cid-4hdzmhc5>Operator controls</h2></div></div><div id="actions" class="action-list" data-astro-cid-4hdzmhc5><p class="empty" data-astro-cid-4hdzmhc5>Loading actions…</p></div></section><section class="card" data-astro-cid-4hdzmhc5><div class="section-head" data-astro-cid-4hdzmhc5><div data-astro-cid-4hdzmhc5><p class="eyebrow" data-astro-cid-4hdzmhc5>Compliance</p><h2 data-astro-cid-4hdzmhc5>Documents</h2></div><span id="documents-count" class="tiny" data-astro-cid-4hdzmhc5>0 docs</span></div><div id="documents" class="feed" data-astro-cid-4hdzmhc5><p class="empty" data-astro-cid-4hdzmhc5>Loading documents…</p></div></section></div></section><script>(function(){${defineScriptVars({ id })}
    const API = \`\${window.location.protocol}//\${window.location.hostname}:4000/api\`;
    const orderId = id;
    const $ = (s) => document.querySelector(s);
    const fmt = (v) => Number(v ?? 0).toLocaleString('en-US');
    const date = (v) => v ? new Date(v).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : '—';
    const cut = (v) => v ? \`\${String(v).slice(0, 8)}…\` : '—';

    function notify(message = '') {
      const box = $('#notice');
      if (!message) { box.hidden = true; box.textContent = ''; return; }
      box.hidden = false; box.textContent = message;
    }

    async function fetchJson(url, options) {
      const response = await fetch(url, options);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Request failed');
      return data;
    }

    function renderSummary(order) {
      $('#summary-title').textContent = \`\${fmt(order.fiatAmount)} fiat → \${fmt(order.cryptoAmount)} crypto\`;
      $('#summary-subtitle').textContent = \`Quote \${cut(order.quoteId)} · User \${cut(order.userId)}\`;
      $('#publicId').textContent = order.publicId;
      $('#status').textContent = order.statusCode;
      $('#direction').textContent = order.directionCode;
      $('#fiat').textContent = fmt(order.fiatAmount);
      $('#crypto').textContent = fmt(order.cryptoAmount);
      $('#rate').textContent = order.rate;
      $('#wallet').textContent = cut(order.walletId);
      $('#payout').textContent = cut(order.payoutRequisiteId);
      $('#updated').textContent = date(order.updatedAt);
    }

    function renderTimeline(items) {
      $('#timeline-count').textContent = \`\${items.length} events\`;
      $('#timeline').innerHTML = items.length ? items.map((item) => \`
        <article class="feed-item">
          <div class="feed-meta"><strong>\${item.eventType}</strong><span>\${date(item.createdAt)}</span></div>
          <p>\${item.fromStatus || '—'} → \${item.toStatus || '—'}</p>
          <p>\${item.actorType || 'system'}\${item.actorId ? \` · \${item.actorId}\` : ''}</p>
        </article>\`).join('') : '<p class="empty">No events yet.</p>';
    }

    function renderNotifications(items) {
      $('#notifications-count').textContent = \`\${items.length} items\`;
      $('#notifications').innerHTML = items.length ? items.map((item) => \`
        <article class="feed-item">
          <div class="feed-meta"><strong>\${item.title}</strong><span>\${date(item.createdAt)}</span></div>
          <p>\${item.body}</p>
          <p>\${item.channel}</p>
        </article>\`).join('') : '<p class="empty">No notifications yet.</p>';
    }

    function renderActions(items) {
      $('#actions').innerHTML = items.length ? items.map((item) => \`
        <div class="action-row">
          <div>
            <strong>\${item.code}</strong>
            <p>\${item.label || item.code}</p>
          </div>
          <button type="button" data-action="\${item.code}">Run</button>
        </div>\`).join('') : '<p class="empty">No actions available.</p>';

      document.querySelectorAll('[data-action]').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await fetchJson(\`\${API}/orders/\${orderId}/actions\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action_code: button.dataset.action, actor_type: 'operator', actor_id: 'demo-operator' }),
            });
            await load();
          } catch (error) {
            notify(error.message || 'Unable to execute action');
          }
        });
      });
    }

    function renderDocuments(items) {
      $('#documents-count').textContent = \`\${items.length} docs\`;
      $('#documents').innerHTML = items.length ? items.map((item) => \`
        <article class="feed-item">
          <div class="feed-meta"><strong>\${item.documentType}</strong><span class="status \${item.status}">\${item.status}</span></div>
          <p class="mono">\${item.id}</p>
          <p>Created: \${date(item.createdAt)}</p>
          <div class="doc-actions">
            <button type="button" class="approve" data-doc="\${item.id}" data-status="approved">Approve</button>
            <button type="button" class="reject" data-doc="\${item.id}" data-status="rejected">Reject</button>
          </div>
        </article>\`).join('') : '<p class="empty">No documents uploaded.</p>';

      document.querySelectorAll('[data-doc]').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await fetchJson(\`\${API}/documents/\${button.dataset.doc}/status\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: button.dataset.status, operator_id: 'demo-operator' }),
            });
            await load();
          } catch (error) {
            notify(error.message || 'Unable to update document');
          }
        });
      });
    }

    async function load() {
      try {
        notify('');
        const data = await fetchJson(\`\${API}/orders/\${orderId}/operator-summary\`);
        const item = data.item || {};
        renderSummary(item.order);
        renderTimeline(item.timeline || []);
        renderNotifications(item.notifications || []);
        renderActions(item.actions || []);
        renderDocuments(item.documents || []);
      } catch (error) {
        console.error('operator order detail failed', error);
        notify(error.message || 'Unable to load operator detail');
      }
    }

    document.getElementById('refresh').addEventListener('click', load);
    load();
  })();<\/script>` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/operator/orders/[id].astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/operator/orders/[id].astro";
var $$url = "/operator/orders/[id]";
//#endregion
//#region \0virtual:astro:page:src/pages/operator/orders/[id]@_@astro
var page = () => _id__exports;
//#endregion
export { page };
