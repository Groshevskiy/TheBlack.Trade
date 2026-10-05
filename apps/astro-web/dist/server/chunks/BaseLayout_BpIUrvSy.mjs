import { C as createAstro, f as renderHead, s as renderSlot, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
//#region src/layouts/BaseLayout.astro
createAstro("https://astro.build");
var $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BaseLayout;
	const { title = "TheBlack.Trade" } = Astro.props;
	return renderTemplate`<html lang="ru" data-astro-cid-z4jru4n3><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>${renderHead($$result)}</head><body data-astro-cid-z4jru4n3><header data-astro-cid-z4jru4n3><h1 data-astro-cid-z4jru4n3>TheBlack.Trade</h1><nav data-astro-cid-z4jru4n3><a href="/" data-astro-cid-z4jru4n3>Home</a><a href="/dashboard" data-astro-cid-z4jru4n3>Dashboard</a><a href="/orders" data-astro-cid-z4jru4n3>Orders</a><a href="/wallets" data-astro-cid-z4jru4n3>Wallets</a><a href="/notifications" data-astro-cid-z4jru4n3>Notifications</a><a href="/account" data-astro-cid-z4jru4n3>Account</a><a href="/operator/orders" data-astro-cid-z4jru4n3>Operator</a></nav></header><main data-astro-cid-z4jru4n3>${renderSlot($$result, $$slots["default"])}</main></body></html>`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/layouts/BaseLayout.astro", void 0);
//#endregion
export { $$BaseLayout as t };
