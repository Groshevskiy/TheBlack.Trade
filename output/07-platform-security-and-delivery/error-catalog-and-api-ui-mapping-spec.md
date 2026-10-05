## Document metadata

- Status: active
- Role: Companion spec
- Owner: Backend + Frontend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `theblack-trade-api-contract-spec.md`
  - `api-resource-boundaries-and-contract-spec.md`
- Related documents:
  - `screen-by-screen-ux-copy-spec.md`
  - `contract-test-matrix.md`

# Error Catalog & API/UI Mapping Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ задает единую модель ошибок для TheBlack.Trade на уровне backend, API, frontend UI, operator console и интеграционных слоев.

Документ нужен для того, чтобы:

- стандартизировать error codes и error semantics;
- синхронизировать backend и frontend;
- обеспечить предсказуемое поведение UI;
- отделить internal technical errors от customer-facing messaging;
- упростить support, QA, observability и future automation.

## 2. Scope

Спецификация покрывает:

- domain errors;
- validation errors;
- state transition errors;
- provider/integration errors;
- reconciliation/discrepancy errors;
- auth/access errors;
- file/attachment errors;
- admin action errors;
- mapping ошибок в API responses и UI states.

## 3. Design principles

1. **Одна ошибка — один основной semantic code.**
2. **Customer message не равен internal diagnostic message.**
3. **Frontend не должен угадывать смысл ошибки по тексту.**
4. **Ошибки должны быть machine-readable.**
5. **Retryability и severity должны быть определимы.**
6. **Operator и customer UI могут получать разные presentation layers для одной и той же underlying ошибки.**

## 4. Error object model

Рекомендуемая базовая структура error response:

```json
{
  "error": {
    "code": "PAYMENT_NOT_FOUND",
    "category": "payment",
    "severity": "medium",
    "retryable": false,
    "user_message_key": "payment.not_found",
    "operator_message_key": "payment.not_found.operator",
    "details": {
      "order_id": "...",
      "provider_reference": "..."
    },
    "correlation_id": "...",
    "timestamp": "..."
  }
}
```

## 5. Error dimensions

Каждая ошибка должна иметь как минимум следующие измерения:

| Поле | Назначение |
|---|---|
| code | Уникальный машинный код ошибки |
| category | Домен ошибки |
| severity | low / medium / high / critical |
| retryable | Можно ли безопасно повторить действие |
| user_message_key | Ключ локализованного customer message |
| operator_message_key | Ключ более подробного operator/admin message |
| correlation_id | Идентификатор для трассировки |
| details | Машинно-читаемые параметры |

## 6. Error categories

Рекомендуемые категории:

| Category | Описание |
|---|---|
| validation | Некорректный ввод или отсутствие обязательных полей |
| order | Ошибки доменной модели заявки |
| state_transition | Недопустимый переход состояния |
| payment | Ошибки фиатных платежей |
| crypto_transfer | Ошибки криптотрансферов |
| wallet | Ошибки кошельков, сетей, реквизитов |
| payout | Ошибки выплат |
| provider | Ошибки внешнего провайдера |
| reconciliation | Ошибки сверки и discrepancy cases |
| authorization | Доступ и роли |
| attachment | Файлы и подтверждения |
| rate_quote | Котировки, окна фиксации курса |
| system | Внутренние системные ошибки |
| admin_action | Ошибки ручных действий оператора |

## 7. Severity model

| Severity | Meaning |
|---|---|
| low | Не блокирует поток полностью |
| medium | Требует пользовательского или операторского внимания |
| high | Блокирует бизнес-действие |
| critical | Создает серьезный финансовый, security или compliance риск |

## 8. HTTP mapping principles

| Error type | Typical HTTP status |
|---|---|
| Invalid input | 400 |
| Missing auth | 401 |
| Forbidden action | 403 |
| Not found | 404 |
| Conflict / invalid state | 409 |
| Unprocessable domain case | 422 |
| Rate limit | 429 |
| Provider unavailable / upstream issue | 502 / 503 |
| Internal system issue | 500 |

HTTP status не должен быть единственным источником semantics — основной смысл всегда задает `error.code`.

## 9. Validation error catalog

| Code | Severity | Retryable | Description | UI behavior |
|---|---|---|---|---|
| VALIDATION_REQUIRED_FIELD_MISSING | low | true | Обязательное поле не заполнено | Inline field error |
| VALIDATION_INVALID_FORMAT | low | true | Неверный формат значения | Inline field error |
| VALIDATION_INVALID_AMOUNT | medium | true | Недопустимая сумма | Inline + disable submit |
| VALIDATION_UNSUPPORTED_CURRENCY | medium | false | Валюта не поддерживается | Blocking form error |
| VALIDATION_UNSUPPORTED_NETWORK | medium | false | Сеть не поддерживается | Blocking field/group error |
| VALIDATION_MEMO_REQUIRED | medium | true | Для сети требуется memo/tag | Inline blocking error |
| VALIDATION_ATTACHMENT_REQUIRED | medium | true | Требуется файл-подтверждение | Inline / form-level error |

## 10. Order and state transition errors

| Code | Severity | Retryable | Description | UI behavior |
|---|---|---|---|---|
| ORDER_NOT_FOUND | medium | false | Заявка не найдена | Error page / redirect |
| ORDER_ALREADY_CANCELED | low | false | Заявка уже отменена | Show current state |
| ORDER_ALREADY_COMPLETED | low | false | Заявка уже завершена | Show final status |
| ORDER_EXPIRED | medium | false | Истекло окно действия заявки | Show expiration state |
| ORDER_ACTION_NOT_ALLOWED | medium | false | Действие не разрешено | Disable action + explanation |
| STATE_TRANSITION_NOT_ALLOWED | high | false | Переход состояния недопустим | Blocking error |
| STATE_PREREQUISITE_NOT_MET | high | false | Не выполнен prerequisite | Blocking + explain next step |

## 11. Payment errors

| Code | Severity | Retryable | Description | UI behavior |
|---|---|---|---|---|
| PAYMENT_INSTRUCTION_UNAVAILABLE | high | true | Не удалось получить payment instruction | Retry / support CTA |
| PAYMENT_CONFIRMATION_ALREADY_SUBMITTED | low | false | Подтверждение уже отправлено | Show review state |
| PAYMENT_NOT_FOUND | medium | false | Платеж не найден | Request more info |
| PAYMENT_AMOUNT_MISMATCH | high | false | Сумма платежа не совпадает | Hold / operator review |
| PAYMENT_DUPLICATE_MATCH | high | false | Платеж совпадает с несколькими кейсами | Manual review state |
| PAYMENT_EXPIRED_RECEIVED | high | false | Платеж получен после expiration | Manual review state |
| PAYMENT_PROVIDER_AMBIGUOUS | high | true | Провайдер дал неоднозначный результат | Review / retry poll |
| PAYMENT_PROVIDER_UNAVAILABLE | high | true | Провайдер недоступен | Neutral delay state |

## 12. Crypto transfer errors

| Code | Severity | Retryable | Description | UI behavior |
|---|---|---|---|---|
| CRYPTO_TRANSFER_NOT_FOUND | medium | true | Трансфер не найден | Waiting / retry check |
| CRYPTO_TRANSFER_LOW_CONFIRMATIONS | medium | true | Недостаточно подтверждений | Waiting state |
| CRYPTO_TRANSFER_AMOUNT_MISMATCH | high | false | Сумма не совпадает | Manual review state |
| CRYPTO_TRANSFER_WRONG_NETWORK | critical | false | Трансфер пришел не в той сети | Blocking + operator escalation |
| CRYPTO_TRANSFER_WRONG_ASSET | critical | false | Пришел другой актив | Blocking + operator escalation |
| CRYPTO_TRANSFER_DUPLICATE_MATCH | high | false | Один tx candidate для нескольких order | Manual review |
| CRYPTO_TRANSFER_AMBIGUOUS | high | true | Недостаточно данных для однозначного матчинга | Waiting / review |

## 13. Wallet / requisites errors

| Code | Severity | Retryable | Description | UI behavior |
|---|---|---|---|---|
| WALLET_INVALID_FORMAT | low | true | Некорректный формат адреса | Inline field error |
| WALLET_NETWORK_MISMATCH | high | false | Адрес не соответствует сети | Blocking error |
| WALLET_MEMO_MISSING | medium | true | Не указан required memo/tag | Inline blocking error |
| WALLET_REJECTED | high | false | Реквизит отклонен | Ask user to replace |
| WALLET_DISABLED | medium | false | Реквизит временно или постоянно отключен | Disable selection |
| WALLET_PROVIDER_SYNC_FAILED | medium | true | Не удалось синхронизировать provider-linked data | Retry or fallback manual |
| WALLET_PROVIDER_CONNECTION_REVOKED | medium | false | Provider connection отозвана | Reconnect required |
| WALLET_RISK_RESTRICTED | high | false | Использование ограничено risk/compliance policy | Manual review |

## 14. Payout errors

| Code | Severity | Retryable | Description | UI behavior |
|---|---|---|---|---|
| PAYOUT_NOT_ALLOWED | high | false | Выплата не может быть инициирована | Block payout action |
| PAYOUT_PREREQUISITES_NOT_MET | high | false | Не выполнены prerequisite для payout | Explain missing prerequisites |
| PAYOUT_DUPLICATE_RISK | critical | false | Есть риск двойной выплаты | Hard block + escalation |
| PAYOUT_PROVIDER_UNAVAILABLE | high | true | Провайдер выплаты недоступен | Delay state |
| PAYOUT_SUBMISSION_FAILED | high | true | Не удалось отправить payout | Retry / hold |
| PAYOUT_STATUS_AMBIGUOUS | high | true | Неясный финальный статус payout | Hold / reconcile |
| PAYOUT_DESTINATION_NOT_VERIFIED | high | false | Реквизиты выплаты не verified | Block release |

## 15. Provider / integration errors

| Code | Severity | Retryable | Description | UI behavior |
|---|---|---|---|---|
| PROVIDER_SIGNATURE_INVALID | critical | false | Callback signature invalid | Internal hold, no customer detail |
| PROVIDER_TIMEOUT | medium | true | Внешний провайдер не ответил вовремя | Retryable neutral state |
| PROVIDER_RATE_LIMITED | medium | true | Превышен лимит внешнего API | Retry later |
| PROVIDER_BAD_RESPONSE | high | true | Некорректный ответ провайдера | Neutral delay / manual review |
| PROVIDER_UNSUPPORTED_OPERATION | medium | false | Провайдер не поддерживает нужную операцию | Fallback flow |
| PROVIDER_REFERENCE_NOT_FOUND | medium | false | Внешний reference не найден | Review |

## 16. Reconciliation errors

| Code | Severity | Retryable | Description | UI behavior |
|---|---|---|---|---|
| RECONCILIATION_PENDING | low | true | Сверка еще не завершена | Waiting / under review |
| RECONCILIATION_PAYMENT_MISMATCH | high | false | Internal/external payment mismatch | Manual review |
| RECONCILIATION_CRYPTO_MISMATCH | high | false | Crypto mismatch | Manual review |
| RECONCILIATION_PAYOUT_MISMATCH | high | false | Payout mismatch | Block completion |
| RECONCILIATION_LEDGER_INCOMPLETE | high | false | Неполные ledger entries | Internal hold |
| RECONCILIATION_DUPLICATE_MOVEMENT | critical | false | Подозрение на duplicate movement | Hard block + escalation |

## 17. Authorization and admin action errors

| Code | Severity | Retryable | Description | UI behavior |
|---|---|---|---|---|
| AUTHENTICATION_REQUIRED | medium | true | Требуется вход | Redirect to login |
| AUTHORIZATION_FORBIDDEN | medium | false | Недостаточно прав | Forbidden screen/message |
| ADMIN_ACTION_NOT_ALLOWED | medium | false | Оператору нельзя выполнять действие | Disable action |
| ADMIN_REASON_CODE_REQUIRED | low | true | Не выбран reason code | Inline modal/form error |
| ADMIN_NOTE_REQUIRED | low | true | Нужен комментарий | Inline modal/form error |
| ADMIN_ESCALATION_REQUIRED | high | false | Нужна эскалация на другой уровень | Show escalation path |

## 18. Attachment errors

| Code | Severity | Retryable | Description | UI behavior |
|---|---|---|---|---|
| ATTACHMENT_TOO_LARGE | low | true | Файл слишком большой | Inline upload error |
| ATTACHMENT_UNSUPPORTED_TYPE | low | true | Неподдерживаемый тип файла | Inline upload error |
| ATTACHMENT_UPLOAD_FAILED | medium | true | Не удалось загрузить файл | Retry upload |
| ATTACHMENT_MISSING | medium | true | Ожидаемый файл отсутствует | Prompt upload |
| ATTACHMENT_SUSPICIOUS | high | false | Файл подозрительный или некорректный | Manual review |

## 19. System errors

| Code | Severity | Retryable | Description | UI behavior |
|---|---|---|---|---|
| SYSTEM_INTERNAL_ERROR | high | true | Внутренняя ошибка системы | Generic error state |
| SYSTEM_DEPENDENCY_UNAVAILABLE | high | true | Критичная зависимость недоступна | Neutral degraded mode |
| SYSTEM_CONCURRENCY_CONFLICT | medium | true | Конфликт параллельных изменений | Retry action |
| SYSTEM_IDEMPOTENCY_CONFLICT | medium | false | Конфликт идемпотентности | Show current action state |
| SYSTEM_DATA_INTEGRITY_ERROR | critical | false | Нарушение целостности данных | Internal block + escalation |

## 20. API response patterns

## 20.1 Standard error response

```json
{
  "error": {
    "code": "STATE_PREREQUISITE_NOT_MET",
    "category": "state_transition",
    "severity": "high",
    "retryable": false,
    "user_message_key": "order.prerequisite_not_met",
    "operator_message_key": "order.prerequisite_not_met.operator",
    "details": {
      "missing_prerequisite": "wallet_verification"
    },
    "correlation_id": "req_123",
    "timestamp": "2026-10-03T10:00:00Z"
  }
}
```

## 20.2 Validation error response with field-level hints

```json
{
  "error": {
    "code": "VALIDATION_INVALID_FORMAT",
    "category": "validation",
    "severity": "low",
    "retryable": true,
    "user_message_key": "validation.invalid_format",
    "operator_message_key": "validation.invalid_format.operator",
    "details": {
      "field": "wallet_address"
    },
    "field_errors": [
      {
        "field": "wallet_address",
        "code": "WALLET_INVALID_FORMAT"
      }
    ],
    "correlation_id": "req_456",
    "timestamp": "2026-10-03T10:00:00Z"
  }
}
```

## 21. UI mapping principles

Frontend должен маппить ошибку по `error.code`, а не по raw тексту.

### Customer UI principles

- validation errors → inline;
- recoverable request errors → form-level retryable alerts;
- review/ambiguity errors → neutral waiting/review state;
- critical operational issues → generic safe message, без internal tech detail;
- already submitted/completed cases → state-based message instead of “error panic”.

### Operator UI principles

- показывать semantic code;
- показывать operator-friendly explanation;
- показывать severity and retryability;
- позволять quick navigation к related records;
- предлагать allowed next actions.

## 22. Suggested UI state mapping

| Error code pattern | Customer UI state | Operator UI state |
|---|---|---|
| `VALIDATION_*` | Inline validation | Field diagnostics |
| `ORDER_*` | Status / blocking page | Domain issue explanation |
| `STATE_*` | Prerequisite or invalid action state | Transition diagnostics |
| `PAYMENT_*` | Review / retry / support state | Payment investigation state |
| `CRYPTO_TRANSFER_*` | Waiting / under review | Transfer investigation state |
| `WALLET_*` | Fix requisites | Wallet validation/review state |
| `PAYOUT_*` | Settlement delayed | Payout hold/review state |
| `RECONCILIATION_*` | Neutral processing delay | Reconcile discrepancy state |
| `PROVIDER_*` | Temporary delay | Integration diagnostics |
| `SYSTEM_*` | Generic safe failure | Technical escalation |

## 23. Localization approach

Тексты ошибок не должны хардкодиться в backend. Backend возвращает `user_message_key` и `operator_message_key`, а frontend/localization layer резолвит их в RU/другие языки.

Это позволяет:

- менять copy без переписывания backend;
- разделять customer и operator wording;
- согласовать ошибки с UX copy spec и RU localization spec.

## 24. Logging and observability requirements

Каждая ошибка должна быть пригодна для мониторинга.

### Нужно логировать:

- `error.code`
- `category`
- `severity`
- `correlation_id`
- route / endpoint / action
- user_id или operator_id, если допустимо
- provider reference, если применимо
- order_id, если применимо
- retryability

### Метрики по ошибкам

- error rate by code;
- critical error count;
- provider error rate;
- reconciliation mismatch rate;
- payout blocking error frequency;
- validation error distribution.

## 25. QA checklist

QA должна проверить:

- backend возвращает стабильные machine-readable codes;
- frontend не зависит от raw error text;
- field-level validation корректно маппится в UI;
- retryable и non-retryable errors различаются корректно;
- operator UI показывает semantic diagnostics;
- provider/system errors не раскрывают лишние internal детали customer-facing слою;
- correlation_id пробрасывается и логируется;
- completed/review/pending states не отображаются как generic fatal errors.

## 26. Следующие документы

На базе этой спецификации рекомендуется подготовить:

- `observability-and-audit-spec.md`
- `compliance-and-legal-operations-spec.md`
- `operations-runbook-and-sla-spec.md`
- `notification-event-matrix.md`