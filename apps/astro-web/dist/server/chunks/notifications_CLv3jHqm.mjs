import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as renderScript } from "./script_DxgdGfpY.mjs";
import { t as $$BaseLayout } from "./BaseLayout__drHlUMR.mjs";
import { n as $$MetricCard, r as $$CabinetHero, t as $$SectionHead } from "./SectionHead_BaqHel2e.mjs";
//#region src/pages/notifications.astro
var notifications_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Notifications,
	file: () => $$file,
	url: () => $$url
});
var $$Notifications = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Notifications",
		"data-astro-cid-rkcmdb3v": true
	}, { "default": async ($$result) => renderTemplate`${renderComponent($$result, "CabinetHero", $$CabinetHero, {
		"title": "Notifications center",
		"lede": "Все customer-facing обновления по заказам в одном месте: unread queue, recent feed, фильтры и быстрые переходы в карточки сделок.",
		"actionHref": "/orders",
		"actionLabel": "Open orders",
		"data-astro-cid-rkcmdb3v": true
	})}${maybeRenderHead($$result)}<div id="notice" class="notice" hidden data-astro-cid-rkcmdb3v></div><section class="metrics-grid" data-astro-cid-rkcmdb3v>${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Unread",
		"valueId": "statUnread",
		"description": "Messages that still need customer attention.",
		"accent": true,
		"data-astro-cid-rkcmdb3v": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Total visible",
		"valueId": "statVisible",
		"description": "Notifications after the current filters are applied.",
		"data-astro-cid-rkcmdb3v": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Order-linked",
		"valueId": "statOrderLinked",
		"description": "Messages already connected to a specific order lifecycle.",
		"data-astro-cid-rkcmdb3v": true
	})}${renderComponent($$result, "MetricCard", $$MetricCard, {
		"label": "Recent 24h",
		"valueId": "statRecent",
		"description": "New updates delivered during the last day.",
		"data-astro-cid-rkcmdb3v": true
	})}</section><section class="layout" data-astro-cid-rkcmdb3v><div class="stack" data-astro-cid-rkcmdb3v><section class="card filters-card" data-astro-cid-rkcmdb3v>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Filters",
		"title": "Review notifications",
		"metaId": "summary",
		"metaText": "Loading feed…",
		"data-astro-cid-rkcmdb3v": true
	})}<div class="filters-grid" data-astro-cid-rkcmdb3v><label data-astro-cid-rkcmdb3v><span data-astro-cid-rkcmdb3v>Visibility</span><select id="visibilityFilter" data-astro-cid-rkcmdb3v><option value="all" data-astro-cid-rkcmdb3v>All notifications</option><option value="unread" data-astro-cid-rkcmdb3v>Unread only</option><option value="read" data-astro-cid-rkcmdb3v>Read only</option></select></label><label data-astro-cid-rkcmdb3v><span data-astro-cid-rkcmdb3v>Search</span><input id="searchFilter" type="search" placeholder="Title, body, order ID" data-astro-cid-rkcmdb3v></label><label data-astro-cid-rkcmdb3v><span data-astro-cid-rkcmdb3v>Sort</span><select id="sortFilter" data-astro-cid-rkcmdb3v><option value="recent_desc" data-astro-cid-rkcmdb3v>Newest first</option><option value="recent_asc" data-astro-cid-rkcmdb3v>Oldest first</option></select></label></div></section><section class="card list-card" data-astro-cid-rkcmdb3v>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Feed",
		"title": "Customer updates",
		"metaId": "visibleCount",
		"metaText": "0 shown",
		"data-astro-cid-rkcmdb3v": true
	})}<div id="notificationsList" class="notifications-list" data-astro-cid-rkcmdb3v><p class="empty" data-astro-cid-rkcmdb3v>Loading notifications…</p></div></section></div><aside class="stack" data-astro-cid-rkcmdb3v><section class="card insight-card" data-astro-cid-rkcmdb3v><p class="eyebrow" data-astro-cid-rkcmdb3v>Priority insight</p><h3 id="insightTitle" data-astro-cid-rkcmdb3v>Preparing insight…</h3><p class="lede" id="insightCopy" data-astro-cid-rkcmdb3v>The panel will highlight which notifications should be checked first.</p></section><section class="card" data-astro-cid-rkcmdb3v>${renderComponent($$result, "SectionHead", $$SectionHead, {
		"eyebrow": "Unread queue",
		"title": "Check first",
		"data-astro-cid-rkcmdb3v": true
	})}<div id="unreadQueue" class="queue-list" data-astro-cid-rkcmdb3v><p class="empty" data-astro-cid-rkcmdb3v>Loading unread queue…</p></div></section></aside></section>${renderScript($$result, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/notifications.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/notifications.astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/notifications.astro";
var $$url = "/notifications";
//#endregion
//#region \0virtual:astro:page:src/pages/notifications@_@astro
var page = () => notifications_exports;
//#endregion
export { page };
