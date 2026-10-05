import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as renderScript } from "./script_DxgdGfpY.mjs";
import { t as $$BaseLayout } from "./BaseLayout__drHlUMR.mjs";
import { n as $$MetricCard, r as $$CabinetHero, t as $$SectionHead } from "./SectionHead_BaqHel2e.mjs";
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
	}, { "default": async ($$result) => renderTemplate`${renderComponent($$result, "CabinetHero", $$CabinetHero, {
		"title": "Lifecycle dashboard",
		"lede": "Единая сводка по заказам, действиям клиента, уведомлениям, кошелькам и payout requisites для ежедневного customer journey.",
		"actionHref": "/",
		"actionLabel": "Create order",
		"data-astro-cid-gopsdxsp": true
	})}${maybeRenderHead($$result)}<div id="notice" class="notice" hidden data-astro-cid-gopsdxsp></div><section class="metrics-grid" data-astro-cid-gopsdxsp>${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Open orders",
		"valueId": "ordersOpen",
		"description": "Orders still moving through draft, payment and processing states.",
		"accent": true,
		"data-astro-cid-gopsdxsp": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Need customer action",
		"valueId": "needsAction",
		"description": "Requests most likely waiting for payment or early follow-up.",
		"data-astro-cid-gopsdxsp": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Unread notifications",
		"valueId": "notificationsUnread",
		"description": "Recent customer-facing updates still not seen or reviewed.",
		"data-astro-cid-gopsdxsp": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Saved wallets",
		"valueId": "walletsTotal",
		"description": "Customer crypto destinations currently stored in the cabinet.",
		"data-astro-cid-gopsdxsp": true
	})}</section><section class="layout" data-astro-cid-gopsdxsp><div class="stack" data-astro-cid-gopsdxsp><section class="card insight-card" data-astro-cid-gopsdxsp>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Focus today",
		"title": "Preparing dashboard insight…",
		"metaId": "focusMeta",
		"metaText": "Loading",
		"data-astro-cid-gopsdxsp": true
	})}<p class="lede" id="focusCopy" data-astro-cid-gopsdxsp>The dashboard will explain the most important next step across current customer orders.</p></section><section class="card panel-wide" data-astro-cid-gopsdxsp>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Orders",
		"title": "Priority lifecycle queue",
		"linkHref": "/orders",
		"linkLabel": "Open all orders",
		"data-astro-cid-gopsdxsp": true
	})}<div id="ordersList" class="feed" data-astro-cid-gopsdxsp><p class="empty" data-astro-cid-gopsdxsp>Loading orders…</p></div></section><section class="two-col" data-astro-cid-gopsdxsp><section class="card" data-astro-cid-gopsdxsp>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Wallets",
		"title": "Saved destinations",
		"linkHref": "/wallets",
		"linkLabel": "Open wallets",
		"data-astro-cid-gopsdxsp": true
	})}<div id="walletsList" class="feed" data-astro-cid-gopsdxsp><p class="empty" data-astro-cid-gopsdxsp>Loading wallets…</p></div></section><section class="card" data-astro-cid-gopsdxsp>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Payouts",
		"title": "Customer payout methods",
		"data-astro-cid-gopsdxsp": true
	})}<div id="payoutsList" class="feed" data-astro-cid-gopsdxsp><p class="empty" data-astro-cid-gopsdxsp>Loading payout requisites…</p></div></section></section></div><aside class="stack" data-astro-cid-gopsdxsp><section class="card" data-astro-cid-gopsdxsp>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Notifications",
		"title": "Recent customer updates",
		"linkHref": "/notifications",
		"linkLabel": "Open all",
		"data-astro-cid-gopsdxsp": true
	})}<div id="notificationsList" class="feed" data-astro-cid-gopsdxsp><p class="empty" data-astro-cid-gopsdxsp>Loading notifications…</p></div></section><section class="card" data-astro-cid-gopsdxsp>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Quick links",
		"title": "Customer journey",
		"data-astro-cid-gopsdxsp": true
	})}<div class="quick-links" data-astro-cid-gopsdxsp><a href="/" data-astro-cid-gopsdxsp>Create a new order</a><a href="/orders" data-astro-cid-gopsdxsp>Track all orders</a><a href="/wallets" data-astro-cid-gopsdxsp>Manage wallets and payouts</a><a href="/account" data-astro-cid-gopsdxsp>Review customer account</a></div></section></aside></section>${renderScript($$result, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/dashboard.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/dashboard.astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/dashboard.astro";
var $$url = "/dashboard";
//#endregion
//#region \0virtual:astro:page:src/pages/dashboard@_@astro
var page = () => dashboard_exports;
//#endregion
export { page };
