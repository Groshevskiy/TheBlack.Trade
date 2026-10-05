# TheBlack.Trade — Implementation Plan Folder

Эта папка содержит поэтапный план реализации локального развертывания TheBlack.Trade на базе Directus и Astro.

План построен с учетом:
- трех OpenAPI YAML спецификаций, включая implementation-ready контракт с 34 path, 37 operations и 79 schemas;[cite:3]
- 94 markdown-спецификаций во вложенных подпапках `output`, покрывающих product/ux, domain workflows, operations, compliance, integrations, analytics, security и delivery.[cite:7]
- всей найденной структуры артефактов в проекте, где корневых файлов нет, а вся спецификационная база сосредоточена в папке `output`.[cite:6]

## Состав

- `01-analysis-summary.md` — сводный анализ всей папки спецификаций.
- `02-target-architecture.md` — целевая архитектура Directus + Astro + backend services.
- `03-domain-model-and-directus.md` — доменная модель, Directus collections и роли.
- `04-api-and-service-layer.md` — реализация API, BFF и state machine.
- `05-frontend-astro-plan.md` — этапы реализации клиентского и operator UI.
- `06-integrations-compliance-observability.md` — интеграции, комплаенс, мониторинг и аудит.
- `07-delivery-roadmap.md` — дорожная карта, фазы и критерии готовности.
