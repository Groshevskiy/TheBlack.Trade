import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as renderScript } from "./script_DxgdGfpY.mjs";
import { t as $$BaseLayout } from "./BaseLayout_BpIUrvSy.mjs";
//#region src/pages/dashboard.astro
var dashboard_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Dashboard,
	file: () => $$file,
	url: () => $$url
});
var $$Dashboard = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Dashboard",
		"data-astro-cid-gopsdxsp": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="card hero" data-astro-cid-gopsdxsp><div data-astro-cid-gopsdxsp><p class="eyebrow" data-astro-cid-gopsdxsp>Control center</p><h2 data-astro-cid-gopsdxsp>Operations dashboard</h2><p class="lede" data-astro-cid-gopsdxsp>Сводка по заказам, уведомлениям, кошелькам и payout requisites в одном экране.</p></div><button id="refresh" type="button" data-astro-cid-gopsdxsp>Refresh</button></section><div id="notice" class="notice" hidden data-astro-cid-gopsdxsp></div><section class="grid stats" data-astro-cid-gopsdxsp><div class="card stat" data-astro-cid-gopsdxsp><span data-astro-cid-gopsdxsp>Total orders</span><strong id="ordersTotal" data-astro-cid-gopsdxsp>—</strong></div><div class="card stat" data-astro-cid-gopsdxsp><span data-astro-cid-gopsdxsp>Open orders</span><strong id="ordersOpen" data-astro-cid-gopsdxsp>—</strong></div><div class="card stat" data-astro-cid-gopsdxsp><span data-astro-cid-gopsdxsp>Notifications</span><strong id="notificationsTotal" data-astro-cid-gopsdxsp>—</strong></div><div class="card stat" data-astro-cid-gopsdxsp><span data-astro-cid-gopsdxsp>Wallets</span><strong id="walletsTotal" data-astro-cid-gopsdxsp>—</strong></div></section><section class="grid panels" data-astro-cid-gopsdxsp><section class="card panel-wide" data-astro-cid-gopsdxsp><div class="panel-head" data-astro-cid-gopsdxsp><div data-astro-cid-gopsdxsp><p class="eyebrow" data-astro-cid-gopsdxsp>Orders</p><h2 data-astro-cid-gopsdxsp>Recent activity</h2></div><a href="/orders" data-astro-cid-gopsdxsp>Open all</a></div><div id="ordersList" class="feed" data-astro-cid-gopsdxsp><p class="empty" data-astro-cid-gopsdxsp>Loading orders…</p></div></section><section class="card" data-astro-cid-gopsdxsp><div class="panel-head" data-astro-cid-gopsdxsp><div data-astro-cid-gopsdxsp><p class="eyebrow" data-astro-cid-gopsdxsp>Notifications</p><h2 data-astro-cid-gopsdxsp>Latest updates</h2></div></div><div id="notificationsList" class="feed" data-astro-cid-gopsdxsp><p class="empty" data-astro-cid-gopsdxsp>Loading notifications…</p></div></section><section class="card" data-astro-cid-gopsdxsp><div class="panel-head" data-astro-cid-gopsdxsp><div data-astro-cid-gopsdxsp><p class="eyebrow" data-astro-cid-gopsdxsp>Wallets</p><h2 data-astro-cid-gopsdxsp>Saved addresses</h2></div><a href="/wallets" data-astro-cid-gopsdxsp>Open wallets</a></div><div id="walletsList" class="feed" data-astro-cid-gopsdxsp><p class="empty" data-astro-cid-gopsdxsp>Loading wallets…</p></div></section><section class="card" data-astro-cid-gopsdxsp><div class="panel-head" data-astro-cid-gopsdxsp><div data-astro-cid-gopsdxsp><p class="eyebrow" data-astro-cid-gopsdxsp>Payout requisites</p><h2 data-astro-cid-gopsdxsp>Customer payout methods</h2></div></div><div id="payoutsList" class="feed" data-astro-cid-gopsdxsp><p class="empty" data-astro-cid-gopsdxsp>Loading payout requisites…</p></div></section></section>${renderScript($$result, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/dashboard.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/dashboard.astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/dashboard.astro";
var $$url = "/dashboard";
//#endregion
//#region \0virtual:astro:page:src/pages/dashboard@_@astro
var page = () => dashboard_exports;
//#endregion
export { page };
