import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as renderScript } from "./script_DxgdGfpY.mjs";
import { t as $$BaseLayout } from "./BaseLayout_BpIUrvSy.mjs";
//#region src/pages/account.astro
var account_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Account,
	file: () => $$file,
	url: () => $$url
});
var $$Account = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Account",
		"data-astro-cid-23ctyzld": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="card hero" data-astro-cid-23ctyzld><div data-astro-cid-23ctyzld><p class="eyebrow" data-astro-cid-23ctyzld>Customer profile</p><h2 data-astro-cid-23ctyzld>Account overview</h2><p class="lede" data-astro-cid-23ctyzld>Контактные данные, KYC-статус, связанные заказы и сохранённые платёжные данные текущего пользователя.</p></div><button id="refresh" type="button" data-astro-cid-23ctyzld>Refresh</button></section><div id="notice" class="notice" hidden data-astro-cid-23ctyzld></div><section class="grid stats" data-astro-cid-23ctyzld><div class="card stat" data-astro-cid-23ctyzld><span data-astro-cid-23ctyzld>KYC level</span><strong id="kycValue" data-astro-cid-23ctyzld>—</strong></div><div class="card stat" data-astro-cid-23ctyzld><span data-astro-cid-23ctyzld>Status</span><strong id="statusValue" data-astro-cid-23ctyzld>—</strong></div><div class="card stat" data-astro-cid-23ctyzld><span data-astro-cid-23ctyzld>Orders</span><strong id="ordersValue" data-astro-cid-23ctyzld>—</strong></div><div class="card stat" data-astro-cid-23ctyzld><span data-astro-cid-23ctyzld>Unread notifications</span><strong id="notificationsValue" data-astro-cid-23ctyzld>—</strong></div></section><section class="grid panels" data-astro-cid-23ctyzld><section class="card" data-astro-cid-23ctyzld><div class="panel-head" data-astro-cid-23ctyzld><div data-astro-cid-23ctyzld><p class="eyebrow" data-astro-cid-23ctyzld>Identity</p><h2 data-astro-cid-23ctyzld>Contact details</h2></div></div><div class="feed" id="identityCard" data-astro-cid-23ctyzld><p class="empty" data-astro-cid-23ctyzld>Loading profile…</p></div></section><section class="card" data-astro-cid-23ctyzld><div class="panel-head" data-astro-cid-23ctyzld><div data-astro-cid-23ctyzld><p class="eyebrow" data-astro-cid-23ctyzld>Assets</p><h2 data-astro-cid-23ctyzld>Saved payment data</h2></div></div><div class="feed" id="assetsCard" data-astro-cid-23ctyzld><p class="empty" data-astro-cid-23ctyzld>Loading payment data…</p></div></section><section class="card panel-wide" data-astro-cid-23ctyzld><div class="panel-head" data-astro-cid-23ctyzld><div data-astro-cid-23ctyzld><p class="eyebrow" data-astro-cid-23ctyzld>Activity</p><h2 data-astro-cid-23ctyzld>Recent customer orders</h2></div><a href="/orders" data-astro-cid-23ctyzld>Open orders</a></div><div class="feed" id="ordersCard" data-astro-cid-23ctyzld><p class="empty" data-astro-cid-23ctyzld>Loading orders…</p></div></section></section>${renderScript($$result, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/account.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/account.astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/account.astro";
var $$url = "/account";
//#endregion
//#region \0virtual:astro:page:src/pages/account@_@astro
var page = () => account_exports;
//#endregion
export { page };
