import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as renderScript } from "./script_DxgdGfpY.mjs";
import { t as $$BaseLayout } from "./BaseLayout_BpIUrvSy.mjs";
//#region src/pages/operator/orders/index.astro
var orders_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Operator Orders",
		"data-astro-cid-hdpi74ga": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="card hero" data-astro-cid-hdpi74ga><div data-astro-cid-hdpi74ga><p class="eyebrow" data-astro-cid-hdpi74ga>Operator workspace</p><h2 data-astro-cid-hdpi74ga>Live order queue</h2><p class="lede" data-astro-cid-hdpi74ga>Просмотр очереди, фильтр по статусу и быстрый переход в карточку заказа.</p></div><div class="hero-actions" data-astro-cid-hdpi74ga><button id="refresh" type="button" data-astro-cid-hdpi74ga>Refresh</button><select id="statusFilter" aria-label="Filter orders by status" data-astro-cid-hdpi74ga><option value="all" data-astro-cid-hdpi74ga>All statuses</option><option value="draft" data-astro-cid-hdpi74ga>draft</option><option value="awaiting_payment" data-astro-cid-hdpi74ga>awaiting_payment</option><option value="payment_confirmed" data-astro-cid-hdpi74ga>payment_confirmed</option><option value="processing" data-astro-cid-hdpi74ga>processing</option><option value="completed" data-astro-cid-hdpi74ga>completed</option><option value="cancelled" data-astro-cid-hdpi74ga>cancelled</option><option value="expired" data-astro-cid-hdpi74ga>expired</option></select></div></section><section class="grid stats" id="stats" data-astro-cid-hdpi74ga><div class="card stat" data-astro-cid-hdpi74ga><span data-astro-cid-hdpi74ga>Total</span><strong id="stat-total" data-astro-cid-hdpi74ga>—</strong></div><div class="card stat" data-astro-cid-hdpi74ga><span data-astro-cid-hdpi74ga>Active</span><strong id="stat-active" data-astro-cid-hdpi74ga>—</strong></div><div class="card stat" data-astro-cid-hdpi74ga><span data-astro-cid-hdpi74ga>Completed</span><strong id="stat-completed" data-astro-cid-hdpi74ga>—</strong></div><div class="card stat" data-astro-cid-hdpi74ga><span data-astro-cid-hdpi74ga>Needs attention</span><strong id="stat-attention" data-astro-cid-hdpi74ga>—</strong></div></section><section class="card table-card" data-astro-cid-hdpi74ga><div class="table-head" data-astro-cid-hdpi74ga><div data-astro-cid-hdpi74ga><p class="eyebrow" data-astro-cid-hdpi74ga>Queue</p><h2 data-astro-cid-hdpi74ga>Orders</h2></div><p id="summary" class="summary" data-astro-cid-hdpi74ga>Loading…</p></div><div id="notice" class="notice" hidden data-astro-cid-hdpi74ga></div><div class="table-wrap" data-astro-cid-hdpi74ga><table data-astro-cid-hdpi74ga><thead data-astro-cid-hdpi74ga><tr data-astro-cid-hdpi74ga><th data-astro-cid-hdpi74ga>Public ID</th><th data-astro-cid-hdpi74ga>Status</th><th data-astro-cid-hdpi74ga>Direction</th><th data-astro-cid-hdpi74ga>Fiat</th><th data-astro-cid-hdpi74ga>Crypto</th><th data-astro-cid-hdpi74ga>Updated</th><th data-astro-cid-hdpi74ga></th></tr></thead><tbody id="ordersBody" data-astro-cid-hdpi74ga><tr data-astro-cid-hdpi74ga><td colspan="7" class="empty" data-astro-cid-hdpi74ga>Loading orders…</td></tr></tbody></table></div></section>${renderScript($$result, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/operator/orders/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/operator/orders/index.astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/operator/orders/index.astro";
var $$url = "/operator/orders";
//#endregion
//#region \0virtual:astro:page:src/pages/operator/orders/index@_@astro
var page = () => orders_exports;
//#endregion
export { page };
