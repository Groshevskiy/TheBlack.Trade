import { tt as __exportAll } from "./errors_Co3p8A61.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
import { t as renderScript } from "./script_DxgdGfpY.mjs";
import { t as $$BaseLayout } from "./BaseLayout_BpIUrvSy.mjs";
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
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="card hero" data-astro-cid-rkcmdb3v><div data-astro-cid-rkcmdb3v><p class="eyebrow" data-astro-cid-rkcmdb3v>Customer cabinet</p><h2 data-astro-cid-rkcmdb3v>Notifications summary</h2><p class="lede" data-astro-cid-rkcmdb3v>Единый экран для unread/update feed, channel coverage и action-required уведомлений клиента.</p></div><button id="refresh" type="button" data-astro-cid-rkcmdb3v>Refresh</button></section><div id="notice" class="notice" hidden data-astro-cid-rkcmdb3v></div><section class="grid stats" data-astro-cid-rkcmdb3v><div class="card stat" data-astro-cid-rkcmdb3v><span data-astro-cid-rkcmdb3v>Total notifications</span><strong id="totalValue" data-astro-cid-rkcmdb3v>—</strong></div><div class="card stat" data-astro-cid-rkcmdb3v><span data-astro-cid-rkcmdb3v>Unread</span><strong id="unreadValue" data-astro-cid-rkcmdb3v>—</strong></div><div class="card stat" data-astro-cid-rkcmdb3v><span data-astro-cid-rkcmdb3v>Channels</span><strong id="channelsValue" data-astro-cid-rkcmdb3v>—</strong></div><div class="card stat" data-astro-cid-rkcmdb3v><span data-astro-cid-rkcmdb3v>Action required</span><strong id="actionValue" data-astro-cid-rkcmdb3v>—</strong></div></section><section class="grid panels" data-astro-cid-rkcmdb3v><section class="card panel-wide" data-astro-cid-rkcmdb3v><div class="panel-head" data-astro-cid-rkcmdb3v><div data-astro-cid-rkcmdb3v><p class="eyebrow" data-astro-cid-rkcmdb3v>Feed</p><h2 data-astro-cid-rkcmdb3v>Recent notifications</h2></div><span id="feedLabel" class="tiny" data-astro-cid-rkcmdb3v>—</span></div><div id="notificationsList" class="feed" data-astro-cid-rkcmdb3v><p class="empty" data-astro-cid-rkcmdb3v>Loading notifications…</p></div></section><section class="card" data-astro-cid-rkcmdb3v><div class="panel-head" data-astro-cid-rkcmdb3v><div data-astro-cid-rkcmdb3v><p class="eyebrow" data-astro-cid-rkcmdb3v>Coverage</p><h2 data-astro-cid-rkcmdb3v>Template & channel metrics</h2></div></div><div class="feed" data-astro-cid-rkcmdb3v><article class="feed-item" data-astro-cid-rkcmdb3v><div class="feed-meta" data-astro-cid-rkcmdb3v><strong data-astro-cid-rkcmdb3v>Read items</strong><span class="badge neutral" data-astro-cid-rkcmdb3v>state</span></div><p id="readValue" data-astro-cid-rkcmdb3v>—</p></article><article class="feed-item" data-astro-cid-rkcmdb3v><div class="feed-meta" data-astro-cid-rkcmdb3v><strong data-astro-cid-rkcmdb3v>Template codes</strong><span class="badge neutral" data-astro-cid-rkcmdb3v>catalog</span></div><p id="templatesValue" data-astro-cid-rkcmdb3v>—</p></article></div></section></section>${renderScript($$result, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/notifications.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/notifications.astro", void 0);
var $$file = "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/pages/notifications.astro";
var $$url = "/notifications";
//#endregion
//#region \0virtual:astro:page:src/pages/notifications@_@astro
var page = () => notifications_exports;
//#endregion
export { page };
