# Целевая архитектура

## Архитектурный принцип

Лучший вариант локального развертывания — гибридная архитектура, где Directus служит operational backend и backoffice-платформой, Astro — web/UI слоем, а критичная бизнес-логика вынесена в отдельный API/domain service.[cite:3][cite:4] Такой подход нужен потому, что спецификация включает не только справочники и CRUD-сущности, но и quote calculation, order transitions, operator actions, internal endpoints и webhooks.[cite:3][cite:4]

## Компоненты

- Directus: users, roles, collections, files, admin workspace, permissions, dashboards.
- PostgreSQL: основная бизнес-БД, timeline, audit, ledger-like snapshots, idempotency.
- Redis: quote TTL, locks, retries, short-lived state, queues.
- API/domain service: BFF, auth gateway, order state machine, operator actions, webhooks, provider adapters.
- Astro: public site, customer cabinet, operator portal shell.
- MinIO: локальное S3-хранилище для документов и артефактов.
- MailHog: тестовая почта для notification flows.

## Почему не Directus-only

Implementation-ready API использует command-style endpoints, обязательные `Idempotency-Key`, `X-Request-Id` и отдельные transition handlers для operator workflows.[cite:4] Это плохо соответствует модели “открыть наружу auto-generated CMS REST”, поэтому внешний API обязательно должен проходить через свой backend-слой с контролем контрактов, прав и состояния.[cite:3][cite:4]
