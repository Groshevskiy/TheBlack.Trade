# API и service layer

## Внешний API

Публичный контракт должен опираться на implementation-ready OpenAPI, а не на внутренний Directus REST.[cite:3] Для этого нужен BFF/API слой, который стабилизирует payloads, авторизацию, версии API и response/error contract, даже если внутренняя модель Directus будет эволюционировать.[cite:3][cite:4]

## Приоритетные backend модули

1. Reference API: assets, networks, pairs.[cite:2][cite:3]
2. Quote service: calculate/refresh, TTL, rate providers, request dedupe.[cite:4]
3. Account API: wallets, payout requisites, documents, notifications.[cite:2][cite:4]
4. Orders API: create/list/get/cancel/status/actions, timeline aggregation.[cite:4]
5. Operator/Internal API: manual review, confirm fiat payment, reassignment, document requests, internal workflows.[cite:3][cite:4]
6. Webhook subsystem: inbound verification, outbound retries, audit trail.[cite:3][cite:4]

## Technical patterns

Каждый command endpoint должен поддерживать idempotency storage, structured audit logging и request tracing через `X-Request-Id`, потому что это уже заложено в спецификацию createOrder и operator actions.[cite:4] Для operator transitions обязателен transaction boundary с row-level lock, проверкой допустимости перехода и записью timeline event, иначе нельзя корректно реализовать 409 `OrderNotTransitionableError` поведение.[cite:4]

## Testing contract

Так как проект содержит companion документы по API governance, rate limits, versioning и quality gates, серверная реализация должна сразу включать contract tests, schema validation, backward compatibility checks и negative tests по permissions/errors.[cite:6][cite:7] Это особенно важно, потому что спецификация уже делит пространство на client/operator/internal/security domains, и ошибки совместимости ударят сразу по нескольким интерфейсам.[cite:3][cite:7]
