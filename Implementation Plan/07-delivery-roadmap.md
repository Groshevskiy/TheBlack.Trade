# Дорожная карта реализации

## Фаза 1. Foundation

- Зафиксировать `theblack-trade-openapi-implementation-ready.yaml` как canonical API contract.[cite:3]
- Собрать repo structure, docker-compose, env management и local developer bootstrap.
- Развернуть PostgreSQL, Redis, Directus, API service, Astro, MinIO и MailHog.
- Настроить schema migrations, seed data и bootstrap Directus collections/roles.

## Фаза 2. Domain core

- Реализовать reference data, quote engine и account entities.
- Спроектировать и внедрить order domain model, timeline и state machine.
- Поднять create/list/get order flows с идемпотентностью и аудитом.[cite:4]
- Настроить operator action engine и базовый backoffice workspace.

## Фаза 3. UX and operations

- Собрать customer cabinet на Astro по screen/route и UX specs.[cite:6][cite:7]
- Собрать operator workspace по admin IA, decision matrix, UI control-state map и runbook specs.[cite:6][cite:7]
- Подключить documents, notifications, email content и localization layers.
- Настроить manual review queues, SLA views и incident workflows.

## Фаза 4. Integrations and compliance

- Подключить payment, payout, wallet/exchange adapters.
- Реализовать inbound/outbound webhooks, reconciliation и provider capability abstraction.
- Добавить fraud/risk checks, data retention, masking, privacy operations и sanctions-related controls.
- Синхронизировать event taxonomy, dashboards и observability alerts.

## Фаза 5. Hardening and release

- Добавить contract, integration и E2E tests.
- Внедрить CI/CD quality gates, API governance и versioning controls.
- Проверить backup/restore, DR сценарии и migration/backfill strategy.
- Провести dry-run полного order lifecycle и operations readiness review.

## Definition of done

План можно считать реализованным, когда все обязательные потоки из YAML и companion specs покрыты: quote → order → operator action → notification/document → webhook/audit, а roles, observability и compliance controls подтверждены тестами и локальным dry-run.[cite:3][cite:4][cite:7]
