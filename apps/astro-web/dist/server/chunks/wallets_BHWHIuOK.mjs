import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as renderScript } from "./script_DxgdGfpY.mjs";
import { t as $$BaseLayout } from "./BaseLayout_BpIUrvSy.mjs";
//#region src/pages/wallets.astro
var wallets_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Wallets,
	file: () => $$file,
	url: () => $$url
});
var $$Wallets = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Wallets",
		"data-astro-cid-stae5rd7": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="card hero" data-astro-cid-stae5rd7><div data-astro-cid-stae5rd7><p class="eyebrow" data-astro-cid-stae5rd7>Customer cabinet</p><h2 data-astro-cid-stae5rd7>Wallets & payout methods</h2><p class="lede" data-astro-cid-stae5rd7>Сохранённые криптокошельки и фиатные реквизиты для сделок клиента.</p></div><button id="refresh" type="button" data-astro-cid-stae5rd7>Refresh</button></section><div id="notice" class="notice" hidden data-astro-cid-stae5rd7></div><section class="grid stats" data-astro-cid-stae5rd7><div class="card stat" data-astro-cid-stae5rd7><span data-astro-cid-stae5rd7>Wallets</span><strong id="walletCount" data-astro-cid-stae5rd7>—</strong></div><div class="card stat" data-astro-cid-stae5rd7><span data-astro-cid-stae5rd7>Verified wallets</span><strong id="verifiedCount" data-astro-cid-stae5rd7>—</strong></div><div class="card stat" data-astro-cid-stae5rd7><span data-astro-cid-stae5rd7>Payout methods</span><strong id="payoutCount" data-astro-cid-stae5rd7>—</strong></div><div class="card stat" data-astro-cid-stae5rd7><span data-astro-cid-stae5rd7>Active orders</span><strong id="ordersCount" data-astro-cid-stae5rd7>—</strong></div></section><section class="grid panels" data-astro-cid-stae5rd7><section class="card" data-astro-cid-stae5rd7><div class="panel-head" data-astro-cid-stae5rd7><div data-astro-cid-stae5rd7><p class="eyebrow" data-astro-cid-stae5rd7>Crypto</p><h2 data-astro-cid-stae5rd7>Wallet addresses</h2></div><span id="walletLabel" class="tiny" data-astro-cid-stae5rd7>—</span></div><div id="walletsList" class="feed" data-astro-cid-stae5rd7><p class="empty" data-astro-cid-stae5rd7>Loading wallets…</p></div></section><section class="card" data-astro-cid-stae5rd7><div class="panel-head" data-astro-cid-stae5rd7><div data-astro-cid-stae5rd7><p class="eyebrow" data-astro-cid-stae5rd7>Fiat</p><h2 data-astro-cid-stae5rd7>Payout requisites</h2></div><span id="payoutLabel" class="tiny" data-astro-cid-stae5rd7>—</span></div><div id="payoutsList" class="feed" data-astro-cid-stae5rd7><p class="empty" data-astro-cid-stae5rd7>Loading payout methods…</p></div></section></section><section class="card tip" data-astro-cid-stae5rd7><p class="eyebrow" data-astro-cid-stae5rd7>How it works</p><h2 data-astro-cid-stae5rd7>Use your saved details in a new order</h2><p class="lede" data-astro-cid-stae5rd7>Выбор wallet и payout requisite происходит при создании сделки. В этом MVP экран показывает уже сохранённые безопасные данные и их связь с последними заявками.</p><a href="/orders" data-astro-cid-stae5rd7>Open orders</a></section>${renderScript($$result, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/wallets.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/wallets.astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/wallets.astro";
var $$url = "/wallets";
//#endregion
//#region \0virtual:astro:page:src/pages/wallets@_@astro
var page = () => wallets_exports;
//#endregion
export { page };
