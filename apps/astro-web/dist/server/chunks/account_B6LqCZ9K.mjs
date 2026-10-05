import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as renderScript } from "./script_DxgdGfpY.mjs";
import { t as $$BaseLayout } from "./BaseLayout__drHlUMR.mjs";
import { n as $$MetricCard, r as $$CabinetHero, t as $$SectionHead } from "./SectionHead_BaqHel2e.mjs";
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
	}, { "default": async ($$result) => renderTemplate`${renderComponent($$result, "CabinetHero", $$CabinetHero, {
		"eyebrow": "Customer profile",
		"title": "Account overview",
		"lede": "Единая customer identity view: профиль, KYC, saved settlement details, recent order activity и unread updates.",
		"actionHref": "/",
		"actionLabel": "Create order",
		"data-astro-cid-23ctyzld": true
	})}${maybeRenderHead($$result)}<div id="notice" class="notice" hidden data-astro-cid-23ctyzld></div><section class="metrics-grid" data-astro-cid-23ctyzld>${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "KYC level",
		"valueId": "kycValue",
		"description": "Current verification tier used by the customer profile.",
		"accent": true,
		"data-astro-cid-23ctyzld": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Status",
		"valueId": "statusValue",
		"description": "Current account state across the cabinet.",
		"data-astro-cid-23ctyzld": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Total orders",
		"valueId": "ordersValue",
		"description": "Requests already linked to the current customer.",
		"data-astro-cid-23ctyzld": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Unread notifications",
		"valueId": "notificationsValue",
		"description": "Updates still waiting for review.",
		"data-astro-cid-23ctyzld": true
	})}</section><section class="layout" data-astro-cid-23ctyzld><div class="stack" data-astro-cid-23ctyzld><section class="card" data-astro-cid-23ctyzld>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Identity",
		"title": "Profile and contact details",
		"data-astro-cid-23ctyzld": true
	})}<div id="identityCard" class="feed" data-astro-cid-23ctyzld><p class="empty" data-astro-cid-23ctyzld>Loading profile…</p></div></section><section class="two-col" data-astro-cid-23ctyzld><section class="card" data-astro-cid-23ctyzld>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Settlement",
		"title": "Saved destinations",
		"linkHref": "/wallets",
		"linkLabel": "Open wallets",
		"data-astro-cid-23ctyzld": true
	})}<div id="assetsCard" class="feed" data-astro-cid-23ctyzld><p class="empty" data-astro-cid-23ctyzld>Loading payment data…</p></div></section><section class="card insight-card" data-astro-cid-23ctyzld><p class="eyebrow" data-astro-cid-23ctyzld>Profile insight</p><h3 id="insightTitle" data-astro-cid-23ctyzld>Preparing insight…</h3><p class="lede" id="insightCopy" data-astro-cid-23ctyzld>This panel summarizes the most important customer profile context for operations.</p></section></section><section class="card panel-wide" data-astro-cid-23ctyzld>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Activity",
		"title": "Recent customer orders",
		"linkHref": "/orders",
		"linkLabel": "Open orders",
		"data-astro-cid-23ctyzld": true
	})}<div id="ordersCard" class="feed" data-astro-cid-23ctyzld><p class="empty" data-astro-cid-23ctyzld>Loading orders…</p></div></section></div><aside class="stack" data-astro-cid-23ctyzld><section class="card" data-astro-cid-23ctyzld>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Notifications",
		"title": "Unread updates",
		"linkHref": "/notifications",
		"linkLabel": "Open all",
		"data-astro-cid-23ctyzld": true
	})}<div id="notificationsCard" class="feed" data-astro-cid-23ctyzld><p class="empty" data-astro-cid-23ctyzld>Loading notifications…</p></div></section><section class="card" data-astro-cid-23ctyzld>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Quick links",
		"title": "Customer journey",
		"data-astro-cid-23ctyzld": true
	})}<div class="quick-links" data-astro-cid-23ctyzld><a href="/" data-astro-cid-23ctyzld>Create a new order</a><a href="/orders" data-astro-cid-23ctyzld>Track all orders</a><a href="/wallets" data-astro-cid-23ctyzld>Check settlement destinations</a><a href="/notifications" data-astro-cid-23ctyzld>Review notifications</a></div></section></aside></section>${renderScript($$result, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/account.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/account.astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/account.astro";
var $$url = "/account";
//#endregion
//#region \0virtual:astro:page:src/pages/account@_@astro
var page = () => account_exports;
//#endregion
export { page };
