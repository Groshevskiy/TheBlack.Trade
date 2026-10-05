import { C as createAstro, d as maybeRenderHead, p as addAttribute, u as renderTemplate } from "./server_4uPAlPSy.mjs";
import { t as createComponent } from "./compiler_DNiS3Csg.mjs";
//#region src/components/CabinetHero.astro
createAstro("https://astro.build");
var $$CabinetHero = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$CabinetHero;
	const { eyebrow = "Customer cabinet", title, lede = "", actionHref, actionLabel, buttonId = "refresh", buttonLabel = "Refresh" } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<section class="card hero-block" data-astro-cid-deemixfu><div data-astro-cid-deemixfu><p class="eyebrow" data-astro-cid-deemixfu>${eyebrow}</p><h2 data-astro-cid-deemixfu>${title}</h2>${lede && renderTemplate`<p class="lede" data-astro-cid-deemixfu>${lede}</p>`}</div><div class="hero-actions" data-astro-cid-deemixfu>${actionHref && actionLabel && renderTemplate`<a class="primary-link"${addAttribute(actionHref, "href")} data-astro-cid-deemixfu>${actionLabel}</a>`}<button${addAttribute(buttonId, "id")} type="button" data-astro-cid-deemixfu>${buttonLabel}</button></div></section>`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/components/CabinetHero.astro", void 0);
//#endregion
//#region src/components/MetricCard.astro
createAstro("https://astro.build");
var $$MetricCard = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$MetricCard;
	const { label, valueId, description, accent = false } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<article${addAttribute(`card metric-card ${accent ? "accent" : ""}`, "class")} data-astro-cid-p5buzfly><span data-astro-cid-p5buzfly>${label}</span><strong${addAttribute(valueId, "id")} data-astro-cid-p5buzfly>—</strong><p data-astro-cid-p5buzfly>${description}</p></article>`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/components/MetricCard.astro", void 0);
//#endregion
//#region src/components/SectionHead.astro
createAstro("https://astro.build");
var $$SectionHead = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$SectionHead;
	const { eyebrow, title, linkHref, linkLabel, metaText, metaId } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<div class="section-head" data-astro-cid-sjgajsms><div data-astro-cid-sjgajsms><p class="eyebrow" data-astro-cid-sjgajsms>${eyebrow}</p><h3 data-astro-cid-sjgajsms>${title}</h3></div>${linkHref && linkLabel ? renderTemplate`<a class="text-link"${addAttribute(linkHref, "href")} data-astro-cid-sjgajsms>${linkLabel}</a>` : metaId ? renderTemplate`<span${addAttribute(metaId, "id")} class="tiny" data-astro-cid-sjgajsms>${metaText}</span>` : metaText ? renderTemplate`<span class="tiny" data-astro-cid-sjgajsms>${metaText}</span>` : null}</div>`;
}, "/Users/egorgroshevskiy/Documents/TheLuna.One/TheBlack.Trade/apps/astro-web/src/components/SectionHead.astro", void 0);
//#endregion
export { $$MetricCard as n, $$CabinetHero as r, $$SectionHead as t };
