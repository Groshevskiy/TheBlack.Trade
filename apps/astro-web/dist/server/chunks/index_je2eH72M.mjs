import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as renderScript } from "./script_DxgdGfpY.mjs";
import { t as $$BaseLayout } from "./BaseLayout_BpIUrvSy.mjs";
//#region src/pages/orders/index.astro
var orders_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Orders",
		"data-astro-cid-fp4yl3mx": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="card hero" data-astro-cid-fp4yl3mx><div data-astro-cid-fp4yl3mx><p class="eyebrow" data-astro-cid-fp4yl3mx>Customer cabinet</p><h2 data-astro-cid-fp4yl3mx>Your orders</h2><p class="lede" data-astro-cid-fp4yl3mx>Список заявок клиента со статусами, суммами и быстрым переходом в карточку заказа.</p></div><div class="hero-actions" data-astro-cid-fp4yl3mx><button id="refresh" type="button" data-astro-cid-fp4yl3mx>Refresh</button><select id="statusFilter" aria-label="Filter customer orders by status" data-astro-cid-fp4yl3mx><option value="all" data-astro-cid-fp4yl3mx>All statuses</option><option value="draft" data-astro-cid-fp4yl3mx>draft</option><option value="awaiting_payment" data-astro-cid-fp4yl3mx>awaiting_payment</option><option value="payment_confirmed" data-astro-cid-fp4yl3mx>payment_confirmed</option><option value="processing" data-astro-cid-fp4yl3mx>processing</option><option value="completed" data-astro-cid-fp4yl3mx>completed</option><option value="cancelled" data-astro-cid-fp4yl3mx>cancelled</option><option value="expired" data-astro-cid-fp4yl3mx>expired</option></select></div></section><section class="grid stats" data-astro-cid-fp4yl3mx><div class="card stat" data-astro-cid-fp4yl3mx><span data-astro-cid-fp4yl3mx>Total</span><strong id="stat-total" data-astro-cid-fp4yl3mx>—</strong></div><div class="card stat" data-astro-cid-fp4yl3mx><span data-astro-cid-fp4yl3mx>Open</span><strong id="stat-open" data-astro-cid-fp4yl3mx>—</strong></div><div class="card stat" data-astro-cid-fp4yl3mx><span data-astro-cid-fp4yl3mx>Completed</span><strong id="stat-completed" data-astro-cid-fp4yl3mx>—</strong></div><div class="card stat" data-astro-cid-fp4yl3mx><span data-astro-cid-fp4yl3mx>Needs action</span><strong id="stat-action" data-astro-cid-fp4yl3mx>—</strong></div></section><section class="card table-card" data-astro-cid-fp4yl3mx><div class="table-head" data-astro-cid-fp4yl3mx><div data-astro-cid-fp4yl3mx><p class="eyebrow" data-astro-cid-fp4yl3mx>Orders</p><h2 data-astro-cid-fp4yl3mx>Recent requests</h2></div><p id="summary" class="summary" data-astro-cid-fp4yl3mx>Loading…</p></div><div id="notice" class="notice" hidden data-astro-cid-fp4yl3mx></div><div class="table-wrap" data-astro-cid-fp4yl3mx><table data-astro-cid-fp4yl3mx><thead data-astro-cid-fp4yl3mx><tr data-astro-cid-fp4yl3mx><th data-astro-cid-fp4yl3mx>Public ID</th><th data-astro-cid-fp4yl3mx>Status</th><th data-astro-cid-fp4yl3mx>Direction</th><th data-astro-cid-fp4yl3mx>Fiat</th><th data-astro-cid-fp4yl3mx>Crypto</th><th data-astro-cid-fp4yl3mx>Updated</th><th data-astro-cid-fp4yl3mx></th></tr></thead><tbody id="ordersBody" data-astro-cid-fp4yl3mx><tr data-astro-cid-fp4yl3mx><td colspan="7" class="empty" data-astro-cid-fp4yl3mx>Loading orders…</td></tr></tbody></table></div></section>${renderScript($$result, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/orders/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/orders/index.astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/orders/index.astro";
var $$url = "/orders";
//#endregion
//#region \0virtual:astro:page:src/pages/orders/index@_@astro
var page = () => orders_exports;
//#endregion
export { page };
