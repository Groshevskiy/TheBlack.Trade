# Анализ всей папки спецификаций

## Что найдено

В корне выбранного рабочего каталога отдельных файлов не обнаружено; вся полезная спецификационная база находится внутри папки `output`.[cite:6] Внутри `output` найдено 94 markdown-документа и 3 YAML-файла OpenAPI, поэтому план разработки должен учитывать не только API-контракт, но и все companion specs по продукту, операциям, рискам, интеграциям, аналитике и безопасности.[cite:7]

## Блоки спецификаций

Структура `output` организована тематически: `00-foundation-and-brief`, `01-product-and-ux`, `02-domain-and-workflows`, `03-operations-admin-and-support`, `04-compliance-risk-and-governance`, `05-integrations-and-finance`, `06-data-analytics-and-observability`, `07-platform-security-and-delivery`.[cite:6] Это означает, что итоговый implementation plan должен быть multi-track: одновременно покрывать UX, доменную модель, операционный контур, compliance, интеграции и инженерную поставку, а не ограничиваться backend-реализацией endpoint’ов.[cite:6][cite:7]

## Canonical contract

Среди YAML-файлов главным источником реализации следует считать `theblack-trade-openapi-implementation-ready.yaml`, потому что он полнее остальных: 34 path, 37 operations, 79 schemas и две security schemes `bearerAuth` и `serviceTokenAuth`.[cite:3] Draft-файл имеет такую же ширину path/operation, но меньше schemas, а базовый `theblack-trade-openapi.yaml` заметно уже по охвату и выглядит как более ранний или упрощенный контракт.[cite:3]

## Что это меняет для разработки

Наличие отдельных спецификаций по screen/routes, UI kit, frontend state machine, order domain model, admin workspace, permissions matrix, integrations, ledger/reconciliation, analytics, observability, security policies и CI/CD означает, что разработку нельзя вести как “сначала API, потом всё остальное”.[cite:6][cite:7] Правильный подход — вести разработку потоками: platform foundation, domain implementation, frontend UX, ops/compliance tooling, integrations и release engineering, с общей опорой на canonical OpenAPI и companion markdown specs.[cite:3][cite:7]
