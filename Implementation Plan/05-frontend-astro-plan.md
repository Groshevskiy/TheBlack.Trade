# Frontend план на Astro

## UI surfaces

Подпапка `01-product-and-ux` содержит screen-and-route spec, wireframes, UI kit, component inventory, UX copy и RU localization specs, а подпапка `02-domain-and-workflows` содержит frontend state machine spec.[cite:6][cite:7] Поэтому Astro-приложение должно проектироваться не как “несколько страниц”, а как три связанные поверхности: public site, customer cabinet и operator workspace, каждая со своей навигацией, route-guard логикой и состояниями.[cite:6][cite:7]

## Astro strategy

Astro стоит использовать как основной app shell и routing framework, а сложные интерактивные участки делать islands-компонентами.[cite:7] Особенно это касается quote calculator, create-order flow, order timeline, notifications center, document upload/review и operator action drawers, где нужен живой client state и асинхронные transition states.[cite:4][cite:7]

## Frontend phases

1. Public pages: landing, FAQ, legal, contacts, auth entry.
2. Customer cabinet: quote, wallets, payout requisites, orders list, order details, documents, notifications.
3. Operator workspace: queue, filters, SLA views, incident/review panels, document review, status actions.
4. Localization and copy hardening: внедрение RU copy spec и screen-specific content rules.[cite:6][cite:7]

## Frontend non-functional scope

Из companion specs следует, что UI должен учитывать production readiness checklist, component inventory, email/notification content alignment и admin UI control-state mapping.[cite:6][cite:7] Это означает обязательные loading/error/empty states, role-aware actions, mask/sensitivity rules и точное соответствие action availability доменному state machine, а не только красивый интерфейс.[cite:7]
