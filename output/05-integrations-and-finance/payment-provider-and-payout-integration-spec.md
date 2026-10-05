## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Backend + Finance Ops
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `provider-capability-matrix.md`
  - `reconciliation-and-ledger-spec.md`
- Related documents:
  - `provider-contract-and-operations-pack.md`
  - `webhook-verification-and-replay-defense-spec.md`
  - `contract-test-matrix.md`

# Payment Provider & Payout Integration Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает интеграционный слой платежного провайдера и payout-процессов для TheBlack.Trade. Спецификация предназначена для backend-разработчиков, frontend-разработчиков, solution architect, operations, finance, support, QA и compliance-команд.

Документ определяет:

- роли платежного слоя в buy/sell lifecycle;
- модель интеграции с payment provider;
- модель выплат пользователю;
- callback/webhook и polling сценарии;
- reconciliation и idempotency требования;
- ошибки и fallback-поведение;
- влияние статусов платежей на order lifecycle.

## 2. Контекст и scope

Платформа должна поддерживать:

- прием фиатных платежей от пользователя в buy-flow;
- подтверждение оплаты сначала в ручном или semi-manual режиме;
- дальнейший переход к опциональной автоматизации;
- выплаты пользователю в sell-flow;
- безопасное связывание платежного статуса со статусом заявки;
- аудитируемую историю событий и действий оператора.

В рамках MVP провайдерный слой должен поддерживать **manual-review-first model**, где автоматические сигналы провайдера могут использоваться как вспомогательные, но не обязаны быть единственным источником подтверждения.

## 3. Цели интеграции

Платежная интеграция должна обеспечивать:

- создание платежной инструкции или payment intent;
- получение статуса платежа;
- фиксацию пользовательского подтверждения оплаты;
- ручную проверку или assisted verification;
- запуск payout в sell-flow;
- контроль ошибок, дублей и расхождений;
- возможность постепенного перехода к автоматизации.

## 4. Основные сценарии

## 4.1 Buy-flow: прием платежа

Пользователь создает заявку на покупку криптовалюты, получает сумму к оплате и реквизиты/инструкцию. После оплаты пользователь отправляет подтверждение. Система либо переводит подтверждение на ручную проверку, либо использует провайдерные сигналы как один из факторов принятия решения.

## 4.2 Sell-flow: выплата пользователю

После подтверждения поступления криптовалюты и выполнения обмена система должна инициировать или подготовить payout пользователю. В зависимости от режима payout может быть:

- полностью ручным;
- полуавтоматическим с операторским подтверждением;
- автоматическим после прохождения проверок.

## 5. Payment integration modes

Рекомендуется поддерживать конфигурируемые режимы.

| Mode | Описание |
|---|---|
| manual | Платежный провайдер не подтверждает автоматически; оператор вручную принимает решение |
| assisted_manual | Система получает статусы/сигналы от провайдера, но финальное подтверждение делает оператор |
| semi_auto | Автоматические подтверждения допустимы для low-risk сценариев, с fallback в manual review |
| auto | Подтверждение и часть payout-flow выполняются автоматически по правилам |

Для MVP рекомендуется `manual` или `assisted_manual`.

## 6. Domain entities, связанные с payment layer

Интеграция должна опираться как минимум на следующие сущности:

- `Order`
- `PaymentRecord`
- `SettlementRecord`
- `OrderTimelineEvent`
- `NotificationLog`
- `OrderRiskFlag`
- `Attachment`
- опционально `ProviderCallbackLog`
- опционально `ProviderReconciliationRecord`

## 7. Payment provider abstraction

Нужно проектировать систему через provider abstraction, а не жестко под одного конкретного провайдера.

### 7.1 Provider capabilities

Рекомендуемая capability matrix:

| Capability | Обязательность |
|---|---|
| create payment intent/instruction | required |
| retrieve payment status | required |
| receive webhooks/callbacks | recommended |
| payout initiation | required for sell-flow automation |
| payout status retrieval | recommended |
| provider reference id | required |
| idempotency support | required |
| signature verification for callbacks | required |
| sandbox/test mode | required |

### 7.2 Provider adapter interface

Каждый provider adapter должен поддерживать абстрактные операции:

- `createPaymentIntent()`
- `getPaymentStatus()`
- `normalizeWebhook()`
- `verifyWebhookSignature()`
- `createPayout()`
- `getPayoutStatus()`
- `reconcilePayment()`
- `reconcilePayout()`

## 8. Buy-flow payment model

## 8.1 Payment intent / instruction generation

После того как order переходит в `awaiting_payment`, backend должен:

1. определить payment method;
2. создать internal payment record;
3. при необходимости запросить у провайдера payment intent / external reference;
4. сохранить provider reference;
5. отдать frontend payment instruction payload.

### Recommended fields in payment instruction payload

- `order_id`
- `payment_method_code`
- `provider_code`
- `provider_reference`
- `amount`
- `currency_code`
- `payment_destination_summary`
- `payment_expiration_at`
- `payment_comment_or_reference`
- `manual_confirmation_required`

## 8.2 User confirmation flow

После выполнения оплаты пользователь может:

- ввести reference/идентификатор платежа;
- загрузить подтверждающий файл;
- отправить подтверждение оплаты.

Система должна:

- обновить `PaymentRecord.status = submitted`;
- зафиксировать `submitted_at`;
- записать timeline event;
- отправить уведомление оператору или перевести запись в review queue;
- при наличии провайдерных сигналов попытаться сопоставить транзакцию.

## 8.3 Provider-assisted payment verification

В режиме `assisted_manual` backend может использовать следующие сигналы:

- наличие транзакции с совпадающей суммой;
- совпадение reference/comment;
- попадание в допустимое временное окно;
- соответствие expected recipient;
- отсутствие duplicate match.

Но даже при совпадении этих условий подтверждение может оставаться за оператором.

## 9. Sell-flow payout model

## 9.1 Preconditions для payout

Перед payout система должна проверить:

- `order.lifecycle_status` позволяет переход к settlement/payout;
- входной crypto transfer подтвержден;
- exchange execution завершен;
- payout details заданы и валидны;
- нет активных risk flags, блокирующих payout;
- не активен manual hold.

## 9.2 Payout modes

| Mode | Описание |
|---|---|
| manual_payout | Оператор инициирует выплату вручную вне или через админ-панель |
| assisted_payout | Система готовит payout payload, оператор подтверждает запуск |
| auto_payout | payout запускается автоматически по policy rules |

Для MVP рекомендуется `manual_payout` или `assisted_payout`.

## 9.3 Payout creation flow

1. order переходит в settlement phase;
2. backend создает `SettlementRecord`;
3. если payout автоматизируется — вызывается provider adapter `createPayout()`;
4. provider reference сохраняется в settlement record;
5. order timeline обновляется;
6. UI показывает статус финализации.

## 10. Internal status mapping

## 10.1 PaymentRecord status model

| Internal status | Значение |
|---|---|
| pending | Инструкция создана, пользователь еще не отправил подтверждение |
| submitted | Пользователь отправил подтверждение |
| in_review | Проверяется системой/оператором |
| provider_detected | Провайдер нашел соответствующий платеж, но он еще не финализирован |
| confirmed | Оплата принята |
| rejected | Подтверждение отклонено |
| expired | Временное окно оплаты истекло |
| canceled | Платежный контекст отменен |

## 10.2 Settlement/Payout status model

| Internal status | Значение |
|---|---|
| not_started | Выплата еще не начата |
| queued | Выплата поставлена в очередь |
| provider_submitted | Выплата отправлена провайдеру |
| in_review | Выплата проверяется / ожидает финального подтверждения |
| completed | Выплата завершена |
| failed | Выплата завершилась ошибкой |
| canceled | Выплата отменена |
| manual_hold | Выплата остановлена для ручной проверки |

## 10.3 Provider status normalization

Нужно иметь таблицу нормализации provider statuses в internal statuses.

### Пример абстрактного mapping

| Provider status | Internal payment status | Internal payout status |
|---|---|---|
| created | pending | not_started |
| processing | in_review | in_review |
| succeeded | confirmed | completed |
| failed | rejected | failed |
| canceled | canceled | canceled |
| pending_review | in_review | manual_hold |

## 11. Webhook / callback architecture

## 11.1 Общие принципы

Все входящие callbacks/webhooks должны:

- проходить signature verification;
- логироваться как raw payload + normalized payload;
- быть idempotent;
- не менять terminal states неконтролируемо;
- обновлять timeline;
- запускать retry-safe processing.

## 11.2 Recommended callback processing flow

1. Получить callback.
2. Верифицировать подпись.
3. Сохранить raw payload в `ProviderCallbackLog`.
4. Выполнить normalization.
5. Найти internal entity по provider reference.
6. Проверить idempotency.
7. Выполнить transition, если он разрешен.
8. Записать timeline event.
9. При необходимости отправить notification event.

## 11.3 Callback log fields

Рекомендуемые поля:

- `id`
- `provider_code`
- `provider_event_id`
- `provider_reference`
- `callback_type`
- `signature_valid`
- `raw_payload_json`
- `normalized_payload_json`
- `processing_status`
- `processed_at`
- `error_code`
- `error_message`

## 12. Polling strategy

Если webhook недоступен или ненадежен, система должна уметь делать controlled polling.

### Polling нужен для:

- проверки платежа после user submission;
- сверки payout статуса;
- recovery после callback failure;
- reconciliation задач по расписанию.

### Правила polling

- polling должен быть rate-limited;
- polling не должен бесконечно крутиться;
- polling должен иметь timeout strategy и escalation path;
- polling должен быть idempotent;
- polling результаты должны логироваться.

## 13. Idempotency requirements

Идемпотентность обязательна на нескольких уровнях.

## 13.1 Incoming callbacks

Повторный callback не должен повторно переводить заявку в новый статус, если transition уже выполнен.

## 13.2 Payment confirmation submission

Повторная отправка пользователем одного и того же подтверждения должна корректно обрабатываться как duplicate или new attempt в зависимости от политики.

## 13.3 Payout creation

Повторный вызов `createPayout()` не должен создавать двойную выплату. Для этого нужен internal idempotency key и provider reference strategy.

## 13.4 Recommended idempotency keys

- `order_id + payment_attempt_number`
- `provider_reference`
- `provider_event_id`
- `settlement_record_id + payout_attempt_number`

## 14. Reconciliation requirements

Reconciliation должен существовать как отдельный operational capability.

## 14.1 Payment reconciliation

Система должна уметь находить случаи, когда:

- пользователь сообщил оплату, но провайдер не подтверждает платеж;
- провайдер видит платеж, но order/payment record не обновился;
- сумма не совпадает;
- дублирующий платеж сопоставлен нескольким заявкам;
- платеж пришел после expiration.

## 14.2 Payout reconciliation

Система должна уметь проверять:

- payout отправлен провайдеру, но internal status не обновлен;
- internal status = completed, но provider final confirmation отсутствует;
- payout failed и требует retry/manual action;
- payout duplicated или partially processed.

## 14.3 Reconciliation record

Рекомендуется ввести сущность `ProviderReconciliationRecord`:

- `id`
- `provider_code`
- `reconciliation_type` (`payment`, `payout`)
- `entity_reference`
- `internal_status`
- `provider_status`
- `is_matched`
- `discrepancy_code`
- `resolved_by`
- `resolved_at`
- `notes`

## 15. Error and fallback scenarios

## 15.1 Typical payment-side failures

- payment intent creation failed;
- provider unavailable;
- callback signature invalid;
- duplicate callback;
- user submitted invalid proof;
- provider status ambiguous;
- payment detected after expiration;
- wrong amount detected.

## 15.2 Typical payout-side failures

- payout initiation failed;
- payout provider unavailable;
- payout stuck in processing;
- payout canceled by provider;
- payout needs additional verification;
- payout destination invalid;
- duplicate payout attempt blocked.

## 15.3 Fallback principles

При ошибках интеграции система должна:

- переводить кейс в `manual_review` или `manual_hold`, если автоматическое решение небезопасно;
- не подтверждать оплату/выплату только на основании неполных данных;
- сохранять recoverable operational trail;
- показывать пользователю понятный neutral status, не раскрывающий внутренний техконтекст.

## 16. Security requirements

Интеграционный слой должен обеспечивать:

- подпись и проверку webhook payloads;
- secret management через environment/secret storage;
- ограничение логирования чувствительных данных;
- masking реквизитов в UI/logs;
- role-based access для payout operations;
- audit trail для ручного подтверждения и отмены.

## 17. UI and frontend impact

Frontend должен уметь работать с payment integration как с domain-driven процессом.

### В customer UI

- отображать payment instruction payload;
- давать форму подтверждения оплаты;
- показывать промежуточные статусы проверки;
- показывать, когда требуется ручная проверка;
- не обещать автоматическое подтверждение, если система работает в manual-first mode.

### В operator/admin UI

- отображать provider reference;
- показывать normalized provider status;
- показывать reconciliation flags;
- поддерживать confirm / reject / hold / retry actions;
- показывать callback/polling history для диагностики.

## 18. API requirements

Интеграционный слой требует как минимум следующие API-capabilities:

- создать/получить payment instruction по order;
- отправить payment confirmation;
- получить payment status;
- инициировать payout;
- получить payout status;
- обработать provider callback;
- запустить reconciliation job/manual reconcile action.

Примеры endpoint groups:

- `/orders/{id}/payment-instruction`
- `/orders/{id}/payment-confirmation`
- `/orders/{id}/payment-status`
- `/orders/{id}/payout`
- `/orders/{id}/settlement-status`
- `/provider/webhooks/{provider}`
- `/admin/reconciliation/...`

## 19. Event mapping to order lifecycle

| Payment/payout event | Order impact |
|---|---|
| payment_instruction_created | Order stays `awaiting_payment` |
| payment_confirmation_submitted | Order -> `payment_under_review` |
| payment_provider_detected | No обязательный lifecycle transition, но useful internal signal |
| payment_confirmed | Order -> `processing_exchange` |
| payment_rejected | Order -> back to `awaiting_payment` или `rejected` по policy |
| payout_created | Order stays `settlement_pending` |
| payout_submitted_to_provider | Order stays `settlement_pending` |
| payout_completed | Order -> `completed` |
| payout_failed | Order stays `settlement_pending` или -> `manual_review` |

## 20. Suggested implementation phases

## Phase 1 — MVP manual-first

- manual or assisted_manual payment verification;
- manual payout or assisted payout;
- operator queue for confirmations;
- provider callback logging;
- basic reconciliation reports.

## Phase 2 — Controlled automation

- rule-based low-risk auto-confirmation;
- payout automation for approved scenarios;
- discrepancy detection;
- auto-escalation into manual review.

## Phase 3 — Mature payment operations

- advanced reconciliation;
- provider failover strategy;
- SLA-based retry orchestration;
- deeper audit and observability integration.

## 21. QA checklist

Команда QA должна проверить:

- payment instruction создается корректно;
- user confirmation создает правильный PaymentRecord transition;
- duplicate confirmations обрабатываются безопасно;
- callback signature validation работает;
- repeated callbacks не ломают статусы;
- payout не может быть создан дважды без специального recovery-flow;
- reconciliation находит расхождения;
- UI показывает корректные статусы для manual-first mode;
- ambiguous provider statuses не приводят к unsafe automatic transitions.

## 22. Следующие документы

На базе этой спецификации рекомендуется подготовить:

- `wallet-and-exchange-provider-integration-spec.md`
- `reconciliation-and-ledger-spec.md`
- `admin-review-decision-matrix.md`
- `error-catalog-and-api-ui-mapping-spec.md`
- `observability-and-audit-spec.md`