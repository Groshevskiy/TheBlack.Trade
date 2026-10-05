import { C as createAstro, f as renderHead, p as addAttribute, s as renderSlot, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
//#region src/layouts/BaseLayout.astro
createAstro("https://astro.build");
var $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BaseLayout;
	const { title = "TheBlack.Trade" } = Astro.props;
	const path = Astro.url.pathname;
	return renderTemplate`<html lang="ru" data-astro-cid-z4jru4n3><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>${renderHead($$result)}</head><body data-astro-cid-z4jru4n3><div class="shell" data-astro-cid-z4jru4n3><aside class="sidebar" data-astro-cid-z4jru4n3><div class="brand" data-astro-cid-z4jru4n3><div class="brand-mark" data-astro-cid-z4jru4n3></div><div data-astro-cid-z4jru4n3><h1 data-astro-cid-z4jru4n3>TheBlack.Trade</h1><p data-astro-cid-z4jru4n3>Customer cabinet for quote, order lifecycle, notifications and settlement management.</p></div></div><div class="nav-group" data-astro-cid-z4jru4n3><span class="nav-label" data-astro-cid-z4jru4n3>Cabinet</span><nav data-astro-cid-z4jru4n3>${[
		{
			href: "/",
			label: "Create"
		},
		{
			href: "/dashboard",
			label: "Dashboard"
		},
		{
			href: "/orders",
			label: "Orders"
		},
		{
			href: "/wallets",
			label: "Settlement"
		},
		{
			href: "/notifications",
			label: "Notifications"
		},
		{
			href: "/account",
			label: "Account"
		},
		{
			href: "/operator/orders",
			label: "Operator"
		}
	].map((item) => {
		const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
		return renderTemplate`<a${addAttribute(`nav-link ${active ? "active" : ""}`, "class")}${addAttribute(item.href, "href")} data-astro-cid-z4jru4n3><span data-astro-cid-z4jru4n3>${item.label}</span><span data-astro-cid-z4jru4n3>${active ? "Open" : "Go"}</span></a>`;
	})}</nav></div><div class="sidebar-card" data-astro-cid-z4jru4n3><strong data-astro-cid-z4jru4n3>Live customer flow</strong><p data-astro-cid-z4jru4n3>Start with a quote, create an order, then track settlement and communication from one cabinet.</p><a href="/" data-astro-cid-z4jru4n3>Create new order</a></div></aside><main class="content" data-astro-cid-z4jru4n3><div class="page-frame" data-astro-cid-z4jru4n3><div class="page-top" data-astro-cid-z4jru4n3><h2 data-astro-cid-z4jru4n3>${title}</h2><span class="page-pill" data-astro-cid-z4jru4n3><span class="dot" data-astro-cid-z4jru4n3></span> Cabinet experience</span></div>${renderSlot($$result, $$slots["default"])}</div></main></div></body></html>`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/layouts/BaseLayout.astro", void 0);
//#endregion
export { $$BaseLayout as t };
