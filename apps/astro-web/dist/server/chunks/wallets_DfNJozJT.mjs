import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as renderScript } from "./script_DxgdGfpY.mjs";
import { t as $$BaseLayout } from "./BaseLayout__drHlUMR.mjs";
import { n as $$MetricCard, r as $$CabinetHero, t as $$SectionHead } from "./SectionHead_BaqHel2e.mjs";
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
	}, { "default": async ($$result) => renderTemplate`${renderComponent($$result, "CabinetHero", $$CabinetHero, {
		"title": "Settlement destinations",
		"lede": "Единый экран для crypto wallets и fiat payout methods, связанных с customer lifecycle, order creation и последующим settlement flow.",
		"actionHref": "/",
		"actionLabel": "Create order",
		"data-astro-cid-stae5rd7": true
	})}${maybeRenderHead($$result)}<div id="notice" class="notice" hidden data-astro-cid-stae5rd7></div><section class="metrics-grid" data-astro-cid-stae5rd7>${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Saved wallets",
		"valueId": "walletCount",
		"description": "Crypto destinations available for future payout or settlement steps.",
		"accent": true,
		"data-astro-cid-stae5rd7": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Verified wallets",
		"valueId": "verifiedCount",
		"description": "Wallets already marked as verified inside the cabinet.",
		"data-astro-cid-stae5rd7": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Payout methods",
		"valueId": "payoutCount",
		"description": "Saved fiat requisites that can be used in exchange flow.",
		"data-astro-cid-stae5rd7": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Active orders",
		"valueId": "ordersCount",
		"description": "Open customer orders that may depend on settlement details.",
		"data-astro-cid-stae5rd7": true
	})}</section><section class="layout" data-astro-cid-stae5rd7><div class="stack" data-astro-cid-stae5rd7><section class="card filters-card" data-astro-cid-stae5rd7>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Wallets",
		"title": "Crypto destinations",
		"metaId": "walletLabel",
		"metaText": "Loading wallets…",
		"data-astro-cid-stae5rd7": true
	})}<div id="walletsList" class="feed" data-astro-cid-stae5rd7><p class="empty" data-astro-cid-stae5rd7>Loading wallets…</p></div></section><section class="card filters-card" data-astro-cid-stae5rd7>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Payouts",
		"title": "Fiat requisites",
		"metaId": "payoutLabel",
		"metaText": "Loading payout methods…",
		"data-astro-cid-stae5rd7": true
	})}<div id="payoutsList" class="feed" data-astro-cid-stae5rd7><p class="empty" data-astro-cid-stae5rd7>Loading payout methods…</p></div></section></div><aside class="stack" data-astro-cid-stae5rd7><section class="card insight-card" data-astro-cid-stae5rd7><p class="eyebrow" data-astro-cid-stae5rd7>Settlement insight</p><h3 id="insightTitle" data-astro-cid-stae5rd7>Preparing insight…</h3><p class="lede" id="insightCopy" data-astro-cid-stae5rd7>This panel highlights whether the customer already has enough saved settlement details for active orders.</p></section><section class="card" data-astro-cid-stae5rd7>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Recent usage",
		"title": "Lifecycle context",
		"linkHref": "/orders",
		"linkLabel": "Open orders",
		"data-astro-cid-stae5rd7": true
	})}<div id="ordersList" class="feed" data-astro-cid-stae5rd7><p class="empty" data-astro-cid-stae5rd7>Loading orders…</p></div></section><section class="card tip-card" data-astro-cid-stae5rd7><p class="eyebrow" data-astro-cid-stae5rd7>How to use</p><h3 data-astro-cid-stae5rd7>From setup to execution</h3><p class="lede" data-astro-cid-stae5rd7>Создание сделки начинается с quote и order, а этот экран помогает быстро проверить, есть ли у клиента подходящие wallet и payout details до начала settlement stage.</p><div class="quick-links" data-astro-cid-stae5rd7><a href="/" data-astro-cid-stae5rd7>Create a new order</a><a href="/orders" data-astro-cid-stae5rd7>Open order list</a><a href="/account" data-astro-cid-stae5rd7>Review customer account</a></div></section></aside></section>${renderScript($$result, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/wallets.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/wallets.astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/wallets.astro";
var $$url = "/wallets";
//#endregion
//#region \0virtual:astro:page:src/pages/wallets@_@astro
var page = () => wallets_exports;
//#endregion
export { page };
