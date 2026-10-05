## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Backend + Integration Engineering
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `api-resource-boundaries-and-contract-spec.md`
  - `enum-and-state-dictionary-spec.md`
- Related documents:
  - `api-versioning-openapi-governance-and-deprecation-policy.md`
  - `api-rate-limit-and-abuse-protection-policy.md`
  - `webhook-verification-and-replay-defense-spec.md`
  - `contract-test-matrix.md`
  - `provider-contract-and-operations-pack.md`

# API Contract Spec
## TheBlack.Trade

## 1. Назначение документа

Настоящий документ описывает API-контракты для frontend, admin tools, Directus extensions и внешних интеграций платформы **TheBlack.Trade**. Спецификация задаёт единый формат запросов и ответов, основные endpoint-группы, модели данных, правила авторизации, формат ошибок и требования к идемпотентности.

Документ предназначен для frontend developers, backend developers, Directus integrators, QA и product owner. Он должен использоваться как базовый контракт до подготовки формальной OpenAPI-спецификации.

## 2. Scope

Документ покрывает:

- client API для пользовательского кабинета и exchange flow;
- operator/admin API для ручной обработки;
- provider webhook API;
- internal service API;
- response envelopes;
- error model;
- pagination and filtering conventions;
- idempotency and security rules.

Документ не заменяет OpenAPI/Swagger, но задаёт структуру, которую затем можно формализовать в machine-readable схеме.

## 3. API style

Рекомендуемый стиль:

- JSON over HTTPS;
- versioned prefix: `/api/v1`;
- resource-oriented endpoints;
- отдельный namespace для custom trade extensions;
- UTC timestamps в ISO 8601;
- decimals передавать строками;
- snake_case для transport model либо строго выбрать один стиль и не смешивать.

Для данного проекта рекомендуется использовать **snake_case** во всех JSON payload.

## 4. Base URL structure

Рекомендуемая структура:

- `/api/v1/auth/*`
- `/api/v1/trade/*`
- `/api/v1/account/*`
- `/api/v1/operator/*`
- `/api/v1/webhooks/*`
- `/api/v1/internal/*`

Если используется Directus extensions endpoint layer, можно смонтировать их внутри единого backend gateway или проксировать из Directus под тем же префиксом.

## 5. Authentication & authorization

## 5.1 Client API

Аутентификация пользователя:
- bearer token / session token;
- роль `client`;
- ownership-based access.

## 5.2 Operator API

Аутентификация:
- bearer token;
- роли `operator`, `compliance`, `admin`;
- обязательный audit trail для action endpoints.

## 5.3 Webhook API

Аутентификация:
- provider signature verification;
- IP allowlist при возможности;
- idempotent event processing.

## 5.4 Internal API

Аутентификация:
- service-to-service token;
- role `service_account`;
- доступ только из trusted network path.

## 6. Common request headers

| Header | Required | Description |
|---|---|---|
| Authorization | yes for protected endpoints | `Bearer <token>` |
| Content-Type | yes for JSON body | `application/json` |
| Idempotency-Key | required for selected POST endpoints | client-generated unique key |
| X-Request-Id | recommended | request tracing id |
| X-Signature | required for provider webhook | provider signature |
| X-Timestamp | recommended for webhook/internal | request timestamp |

## 7. Response envelope

Рекомендуется использовать единый ответный формат.

### 7.1 Success response

```json
{
  "success": true,
  "data": {},
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:18:00Z"
  }
}
```

### 7.2 Error response

```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found",
    "details": {
      "order_id": "..."
    }
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:18:00Z"
  }
}
```

## 8. Common error codes

| Code | Meaning |
|---|---|
| VALIDATION_ERROR | Request payload invalid |
| UNAUTHORIZED | Authentication required or invalid |
| FORBIDDEN | Actor has no permission |
| NOT_FOUND | Resource not found |
| CONFLICT | State conflict or duplicate action |
| RATE_UNAVAILABLE | Quote/rate unavailable |
| QUOTE_EXPIRED | Quote is no longer valid |
| ORDER_NOT_TRANSITIONABLE | Order cannot move to requested state |
| PAYMENT_NOT_CONFIRMED | Payment not confirmed yet |
| CRYPTO_NOT_CONFIRMED | Crypto confirmations not sufficient |
| IDEMPOTENCY_CONFLICT | Same idempotency key used with different payload |
| PROVIDER_SIGNATURE_INVALID | Webhook signature invalid |
| PROVIDER_ERROR | External provider failure |
| INTERNAL_ERROR | Unexpected server error |

## 9. Pagination convention

Для списков рекомендуется offset/limit либо cursor pagination. Для админских лент и истории операций предпочтительнее cursor-based подход.

### 9.1 List response example

```json
{
  "success": true,
  "data": [
    {}
  ],
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:18:00Z",
    "pagination": {
      "next_cursor": "abc123",
      "limit": 20,
      "has_more": true
    }
  }
}
```

## 10. Domain model conventions

### 10.1 Money and decimal fields

Все денежные и крипто-значения передавать как строки.

Пример:

```json
{
  "amount_fiat": "15000.00",
  "amount_crypto": "145.25000000",
  "exchange_rate": "103.259100000000"
}
```

### 10.2 Timestamp fields

Все даты передавать в формате ISO 8601 UTC.

### 10.3 Enum fields

Enum значения всегда передавать каноническими кодами, а human-readable label строить на frontend.

## 11. Public reference endpoints

## 11.1 Get assets

### `GET /api/v1/trade/assets`

Назначение: получить список доступных crypto assets.

#### Response example

```json
{
  "success": true,
  "data": [
    {
      "code": "usdt",
      "symbol": "USDT",
      "name": "Tether",
      "asset_type": "stablecoin",
      "is_active": true
    }
  ],
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:18:00Z"
  }
}
```

## 11.2 Get networks

### `GET /api/v1/trade/networks`

Поддерживает фильтры:
- `asset_code`
- `direction_code`
- `is_active`

## 11.3 Get exchange pairs

### `GET /api/v1/trade/pairs`

Фильтры:
- `direction_code`
- `fiat_currency_code`
- `asset_code`
- `network_code`

#### Response fields

- `id`
- `direction_code`
- `fiat_currency_code`
- `asset_code`
- `network_code`
- `min_fiat_amount`
- `max_fiat_amount`
- `min_crypto_amount`
- `max_crypto_amount`
- `is_active`

## 12. Quote API

## 12.1 Calculate quote

### `POST /api/v1/trade/quotes/calculate`

#### Headers
- `Idempotency-Key`: optional

#### Request

```json
{
  "direction_code": "buy",
  "fiat_currency_code": "rub",
  "asset_code": "usdt",
  "network_code": "trc20",
  "amount_type": "fiat",
  "amount": "15000.00"
}
```

#### Validation rules

- pair must be active;
- amount must be positive;
- exactly one amount input;
- direction/network/asset combination must exist;
- amount must satisfy limits.

#### Response

```json
{
  "success": true,
  "data": {
    "quote_id": "qt_123",
    "direction_code": "buy",
    "fiat_currency_code": "rub",
    "asset_code": "usdt",
    "network_code": "trc20",
    "input_amount": "15000.00",
    "output_amount": "145.25000000",
    "exchange_rate": "103.259100000000",
    "fee": {
      "fee_model": "mixed",
      "fee_amount_fiat": "150.00",
      "fee_amount_crypto": "0.00000000"
    },
    "limits": {
      "min_amount": "1000.00",
      "max_amount": "300000.00"
    },
    "expires_at": "2026-10-03T06:23:00Z"
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:18:00Z"
  }
}
```

## 12.2 Refresh quote

### `POST /api/v1/trade/quotes/{quote_id}/refresh`

Возвращает новую котировку либо ошибку `QUOTE_EXPIRED`/`RATE_UNAVAILABLE`.

## 13. Wallet and payout requisites API

## 13.1 List wallets

### `GET /api/v1/account/wallets`

Возвращает кошельки текущего пользователя.

## 13.2 Create wallet

### `POST /api/v1/account/wallets`

#### Headers
- `Idempotency-Key`: recommended

#### Request

```json
{
  "label": "My TRC20 Wallet",
  "asset_code": "usdt",
  "network_code": "trc20",
  "address": "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "destination_tag": null,
  "is_default": true
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "wal_123",
    "label": "My TRC20 Wallet",
    "asset_code": "usdt",
    "network_code": "trc20",
    "address_masked": "TXXXX...XXXX",
    "status": "active",
    "is_default": true,
    "created_at": "2026-10-03T06:18:00Z"
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:18:00Z"
  }
}
```

## 13.3 Update wallet

### `PATCH /api/v1/account/wallets/{wallet_id}`

Правила:
- только owner;
- запрещено менять критичные поля, если wallet уже использовался в completed/in-flight order;
- response содержит masked representation.

## 13.4 List payout requisites

### `GET /api/v1/account/payout-requisites`

## 13.5 Create payout requisite

### `POST /api/v1/account/payout-requisites`

#### Request

```json
{
  "requisite_type": "bank_card",
  "label": "Main Card",
  "holder_name": "IVAN IVANOV",
  "bank_name": "Example Bank",
  "value": "2200123412341234",
  "is_default": true
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "req_123",
    "requisite_type": "bank_card",
    "label": "Main Card",
    "holder_name": "IVAN IVANOV",
    "bank_name": "Example Bank",
    "masked_value": "2200********1234",
    "status": "active",
    "is_default": true,
    "created_at": "2026-10-03T06:18:00Z"
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:18:00Z"
  }
}
```

## 14. Order API

## 14.1 Create order

### `POST /api/v1/trade/orders`

#### Headers
- `Idempotency-Key`: required

#### Buy flow request example

```json
{
  "quote_id": "qt_123",
  "wallet_id": "wal_123",
  "client_comment": "optional"
}
```

#### Sell flow request example

```json
{
  "quote_id": "qt_456",
  "payout_requisite_id": "req_123",
  "client_comment": "optional"
}
```

#### Response example

```json
{
  "success": true,
  "data": {
    "order_id": "ord_123",
    "order_no": "TBT-20261003-0001",
    "direction_code": "buy",
    "current_status_code": "awaiting_user_payment",
    "ui_status_label": "Ожидается оплата",
    "amount_fiat": "15000.00",
    "amount_crypto": "145.25000000",
    "exchange_rate": "103.259100000000",
    "expires_at": "2026-10-03T06:33:00Z",
    "next_action": {
      "code": "pay_fiat",
      "label": "Оплатите заявку"
    },
    "payment_instructions": {
      "provider_code": "provider_x",
      "payment_reference": "pay_123",
      "payment_url": "https://example.com/pay/123"
    }
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:18:00Z"
  }
}
```

## 14.2 Get order details

### `GET /api/v1/trade/orders/{order_id}`

Возвращает:
- summary order data;
- user-safe status history;
- payment/crypto instructions if applicable;
- document links if available;
- current next action;
- expiry info.

## 14.3 List user orders

### `GET /api/v1/trade/orders`

Фильтры:
- `status`
- `direction_code`
- `cursor`
- `limit`

#### Response item example

```json
{
  "id": "ord_123",
  "order_no": "TBT-20261003-0001",
  "direction_code": "buy",
  "amount_fiat": "15000.00",
  "amount_crypto": "145.25000000",
  "asset_code": "usdt",
  "network_code": "trc20",
  "current_status_code": "completed",
  "ui_status_label": "Заявка завершена",
  "created_at": "2026-10-03T06:18:00Z",
  "completed_at": "2026-10-03T06:25:00Z"
}
```

## 14.4 Cancel order

### `POST /api/v1/trade/orders/{order_id}/cancel`

#### Headers
- `Idempotency-Key`: required

#### Request

```json
{
  "reason": "user_cancelled"
}
```

#### Success response

```json
{
  "success": true,
  "data": {
    "order_id": "ord_123",
    "current_status_code": "cancelled",
    "ui_status_label": "Заявка отменена",
    "cancelled_at": "2026-10-03T06:19:00Z"
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:19:00Z"
  }
}
```

#### Error cases
- `ORDER_NOT_TRANSITIONABLE`
- `FORBIDDEN`
- `NOT_FOUND`

## 14.5 Order status polling

### `GET /api/v1/trade/orders/{order_id}/status`

Упрощённый endpoint для polling UI.

#### Response

```json
{
  "success": true,
  "data": {
    "order_id": "ord_123",
    "current_status_code": "awaiting_fiat_confirmation",
    "ui_status_label": "Проверяем оплату",
    "progress_step": 2,
    "progress_total_steps": 5,
    "updated_at": "2026-10-03T06:20:00Z"
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:20:00Z"
  }
}
```

## 15. User document API

## 15.1 List documents

### `GET /api/v1/account/documents`

Фильтры:
- `order_id`
- `document_type`
- `cursor`
- `limit`

## 15.2 Get document download link

### `GET /api/v1/account/documents/{document_id}`

Возвращает user-safe metadata и временную ссылку на скачивание.

## 16. Notification API

## 16.1 List notifications

### `GET /api/v1/account/notifications`

#### Response item example

```json
{
  "id": "not_123",
  "channel": "email",
  "template_code": "order_completed",
  "subject": "Ваша заявка завершена",
  "status": "sent",
  "created_at": "2026-10-03T06:25:00Z",
  "sent_at": "2026-10-03T06:25:30Z"
}
```

## 17. Operator API

Все operator endpoints должны:
- требовать role-based authorization;
- писать audit record;
- использовать idempotency там, где действие может быть повторно отправлено;
- возвращать обновлённый статус заявки.

## 17.1 List operator orders

### `GET /api/v1/operator/orders`

Фильтры:
- `current_status_code`
- `risk_level`
- `direction_code`
- `created_from`
- `created_to`
- `cursor`
- `limit`

## 17.2 Get operator order details

### `GET /api/v1/operator/orders/{order_id}`

Дополнительно к клиентскому view возвращает:
- internal comments;
- risk flags;
- full status history;
- payment/crypto technical data;
- masked requisites;
- available actions.

## 17.3 Confirm fiat payment

### `POST /api/v1/operator/orders/{order_id}/confirm-fiat-payment`

#### Headers
- `Idempotency-Key`: required

#### Request

```json
{
  "comment": "Payment verified manually",
  "provider_reference": "pay_123"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "order_id": "ord_123",
    "previous_status_code": "awaiting_fiat_confirmation",
    "current_status_code": "fiat_confirmed",
    "ui_status_label": "Оплата подтверждена",
    "available_actions": [
      "approve_execution",
      "hold",
      "reject"
    ]
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:21:00Z"
  }
}
```

## 17.4 Confirm crypto receipt

### `POST /api/v1/operator/orders/{order_id}/confirm-crypto-receipt`

Используется для ручного подтверждения крипто-поступления в исключительных сценариях.

## 17.5 Approve execution

### `POST /api/v1/operator/orders/{order_id}/approve-execution`

#### Request

```json
{
  "comment": "Approved after review"
}
```

#### Success
Возвращает новый статус `approved_for_execution`.

## 17.6 Put on hold

### `POST /api/v1/operator/orders/{order_id}/hold`

#### Request

```json
{
  "reason_code": "suspicious_payment",
  "comment": "Source mismatch requires review"
}
```

#### Success
Возвращает статус `manual_hold`.

## 17.7 Reject order

### `POST /api/v1/operator/orders/{order_id}/reject`

#### Request

```json
{
  "reason_code": "invalid_payment",
  "comment": "Payment amount does not match order"
}
```

#### Success
Возвращает статус `rejected`.

## 17.8 Cancel by operator

### `POST /api/v1/operator/orders/{order_id}/cancel`

Используется, если платформа останавливает заказ до исполнения.

## 17.9 Add internal comment

### `POST /api/v1/operator/orders/{order_id}/comments`

#### Request

```json
{
  "comment": "Waiting for provider callback",
  "is_private": true
}
```

## 17.10 Set risk flag

### `POST /api/v1/operator/orders/{order_id}/risk-flags`

#### Request

```json
{
  "risk_flag_code": "wallet_mismatch",
  "severity": "medium",
  "comment": "Destination wallet differs from usual pattern"
}
```

## 18. Webhook API

Webhook endpoints должны отвечать быстро и передавать тяжёлую обработку в worker queue.

## 18.1 Payment webhook

### `POST /api/v1/webhooks/payment/{provider_code}`

#### Request
- raw provider payload;
- provider-specific signature headers.

#### Success response

```json
{
  "success": true,
  "data": {
    "accepted": true
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:22:00Z"
  }
}
```

#### Rules
- verify signature before accepting as valid;
- persist raw event;
- deduplicate by provider event id/checksum;
- enqueue async processing.

## 18.2 Crypto webhook

### `POST /api/v1/webhooks/crypto/{provider_code}`

Аналогично payment webhook, но для blockchain provider / custodial API.

## 19. Internal API

## 19.1 Process job

### `POST /api/v1/internal/jobs/{job_id}/process`

Используется worker-процессами или trusted internal automation.

## 19.2 Retry notification

### `POST /api/v1/internal/notifications/{notification_id}/retry`

## 19.3 Regenerate document

### `POST /api/v1/internal/documents/{document_id}/regenerate`

## 19.4 Sync payment status

### `POST /api/v1/internal/payments/{payment_transaction_id}/sync`

## 19.5 Sync crypto status

### `POST /api/v1/internal/crypto/{crypto_transaction_id}/sync`

## 20. Available actions endpoint

Для frontend и operator UI рекомендуется отдельный endpoint с server-calculated actions.

### `GET /api/v1/trade/orders/{order_id}/available-actions`

#### Client response example

```json
{
  "success": true,
  "data": {
    "actions": [
      {
        "code": "cancel_order",
        "label": "Отменить заявку",
        "kind": "destructive"
      }
    ]
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:22:00Z"
  }
}
```

### `GET /api/v1/operator/orders/{order_id}/available-actions`

#### Operator actions example

```json
{
  "success": true,
  "data": {
    "actions": [
      {
        "code": "confirm_fiat_payment",
        "label": "Подтвердить оплату",
        "kind": "primary"
      },
      {
        "code": "hold",
        "label": "Удержать заявку",
        "kind": "warning"
      },
      {
        "code": "reject",
        "label": "Отклонить заявку",
        "kind": "destructive"
      }
    ]
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-10-03T06:22:00Z"
  }
}
```

## 21. Idempotency policy

Обязательная идемпотентность рекомендуется для:

- `POST /trade/orders`
- `POST /trade/orders/{id}/cancel`
- operator action endpoints
- selected wallet/requisite create endpoints if duplicate requests are possible
- internal retry-sensitive actions

### 21.1 Rules

- сервер хранит `Idempotency-Key` вместе с request fingerprint;
- повтор того же ключа с тем же payload возвращает исходный ответ;
- повтор того же ключа с другим payload возвращает `IDEMPOTENCY_CONFLICT`;
- срок хранения idempotency record определяется SLA, например 24 часа.

## 22. Security rules

- ownership enforced server-side for all user resources;
- sensitive requisites never returned in plaintext;
- provider raw payload not exposed to client API;
- operator API separated from client API;
- manual actions require audit trail;
- webhook endpoints must not expose processing details;
- signed temporary URLs for document downloads;
- rate limits on auth, quote and order creation endpoints.

## 23. Suggested frontend integration sequence

### Buy flow

1. Load assets/networks/pairs.
2. Calculate quote.
3. Select wallet.
4. Create order.
5. Show payment instructions.
6. Poll order status.
7. Show completion and documents.

### Sell flow

1. Load assets/networks/pairs.
2. Calculate quote.
3. Select payout requisite.
4. Create order.
5. Show crypto transfer instructions.
6. Poll order status.
7. Show payout/completion state and documents.

## 24. QA checklist for API contract

Перед формализацией OpenAPI необходимо проверить:

- все monetary values передаются строками;
- error codes консистентны между endpoint-группами;
- idempotency policy отражена в чувствительных POST endpoint;
- operator and client payloads разделены по уровню детализации;
- available actions рассчитываются сервером;
- webhook endpoints асинхронны и безопасны;
- final statuses не допускают запрещённых action responses;
- response envelope единый для всех групп API.

## 25. Recommended next step

Следующий практический артефакт после этого документа — **OpenAPI Draft** или **Frontend Integration Spec**. Наиболее полезный вариант:

- если в приоритете backend implementation — сделать OpenAPI Draft;
- если в приоритете UI/UX разработка — сделать Frontend Integration Spec с page-by-page mapping, queries, mutations и polling strategy.