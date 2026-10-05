## Document metadata

- Status: active
- Role: Companion spec
- Owner: Platform Engineering
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `directus-data-model-spec.md`
  - `theblack-trade-directus-field-matrix.md`
- Related documents:
  - `theblack-trade-directus-implementation-blueprint.md`
  - `contract-test-matrix.md`

# Directus Flows & Extensions Spec
## TheBlack.Trade

## 1. Назначение документа

Настоящий документ описывает архитектуру автоматизаций, Directus Flows, custom extensions, hooks, services и integration endpoints для платформы **TheBlack.Trade**. Цель документа — зафиксировать, какие процессы можно реализовать стандартными средствами Directus, а какие необходимо выносить в custom API, event-driven services и фоновые workers.

Документ предназначен для backend team, Directus integrators, DevOps, QA и solution architect. В связке с Permissions Matrix и Field Matrix он формирует прикладную спецификацию backend-слоя платформы.

## 2. Архитектурный принцип

Для проекта рекомендуется использовать **Directus как orchestration backend и admin control layer**, а не как единственное место для сложной транзакционной логики. Directus хорошо подходит для:

- управления пользователями, ролями и правами;
- хранения бизнес-сущностей и справочников;
- административного интерфейса операторов;
- запуска Flow-процессов на CRUD-событиях;
- отправки внутренних событий в сервисный слой;
- аудита и ручных операций.

Критически важную бизнес-логику рекомендуется выносить в **custom extensions / external services**, если она связана с:

- state machine ордеров;
- расчётом курсов и комиссий;
- приёмом webhook-событий платёжных систем;
- blockchain monitoring;
- дедупликацией и идемпотентностью;
- выпуском чеков и юридически значимых документов;
- обработкой ошибок и повторными попытками.

## 3. Logical layers

Рекомендуется разделить backend на следующие логические уровни:

### 3.1 Directus Data Layer

Содержит collections, relations, permissions, field validation, admin UI и минимальные flows на уровне CRUD.

### 3.2 Directus Extension Layer

Содержит:

- custom endpoints;
- hooks (`filter`, `action`, `init`, `schedule`);
- services;
- custom operations для Flows;
- utility-модули для общих проверок.

### 3.3 Integration Layer

Содержит адаптеры к:

- payment provider;
- crypto wallet / exchange provider;
- email provider;
- receipt / fiscalization provider;
- KYC / AML / risk tooling при необходимости.

### 3.4 Worker Layer

Отдельный background processing слой для:

- повторной обработки webhook events;
- проверки истечения quote/order;
- обновления blockchain confirmations;
- отправки email;
- генерации документов;
- безопасных retries без блокировки Directus request lifecycle.

## 4. Что реализуется стандартными Directus Flows

Стандартные Flows в Directus целесообразно использовать только для простых управляемых сценариев без тяжёлой транзакционной логики.

Подходящие сценарии:

- автозаполнение служебных полей;
- создание audit-записей при изменении записей;
- постановка background task в очередь;
- отправка внутренних уведомлений операторам;
- реакция на простые CRUD-события;
- выполнение административных post-save automation;
- scheduled checks для лёгких операций.

Не рекомендуется использовать Directus Flows как основной движок для критического ордерного процесса, особенно если требуется атомарность, идемпотентность, branching logic, retries и взаимодействие с несколькими внешними провайдерами.

## 5. Что реализуется через custom extensions

Через custom extensions рекомендуется реализовать:

- quote engine;
- order creation service;
- order state transition service;
- payment webhook endpoint;
- crypto webhook endpoint;
- blockchain polling service;
- risk evaluation service;
- notification rendering and dispatch service;
- receipt generation / fiscalization service;
- document generation service;
- operator action API;
- idempotency utilities;
- secure provider signature validation.

## 6. Core flows map

Ниже приведена рекомендуемая карта backend-процессов.

| Process | Trigger | Directus Flow | Custom Extension | Worker Required | Notes |
|---|---|---|---|---|---|
| User registration post-processing | user created | yes | optional | no | create profile, defaults, consents seed |
| Wallet save validation | wallet create/update | partial | yes | no | network-specific validation |
| Payout requisite save validation | create/update | partial | yes | no | encryption and masking |
| Quote calculation | API request | no | yes | no | synchronous response |
| Order creation | API request | no | yes | optional | transaction required |
| Payment request creation | order created | optional | yes | yes | provider-specific |
| Manual payment confirmation | operator action | no | yes | optional | privileged transition |
| Payment webhook processing | incoming webhook | no | yes | yes | idempotent |
| Crypto deposit detection | webhook/poller | no | yes | yes | confirmations lifecycle |
| Crypto withdrawal dispatch | order transition | no | yes | yes | integration with wallet/exchange |
| Order status history write | any state change | optional | yes | no | should be centralized |
| Notification enqueue | business event | yes | yes | yes | flow may enqueue only |
| Email send | queue event | no | yes | yes | external provider |
| Receipt generation | completion/payment event | no | yes | yes | legal output |
| Expired quotes/orders cleanup | scheduler | partial | yes | yes | batch processing |
| Risk flag creation | business event | yes | yes | optional | hybrid model |
| Admin audit logging | CRUD/operator action | yes | yes | no | dual approach |

## 7. Required custom endpoints

Ниже перечислены рекомендуемые custom API endpoints. Они могут быть реализованы как Directus endpoint extensions под namespace `/trade/*`.

## 7.1 Quote endpoints

### `POST /trade/quotes/calculate`

Назначение: расчёт котировки на покупку или продажу.

Вход:
- direction;
- fiat currency;
- asset;
- network;
- amount input;
- optional user context.

Выход:
- quote id;
- rate;
- fee breakdown;
- input amount;
- output amount;
- expiration time;
- constraints summary.

Требования:
- обязательная серверная валидация пары и лимитов;
- использование fee rules и limit rules;
- идемпотентность не обязательна;
- quote должен сохраняться в `order_quotes`.

### `POST /trade/quotes/:id/refresh`

Назначение: обновление просроченной или изменившейся котировки.

## 7.2 Order endpoints

### `POST /trade/orders`

Назначение: создание exchange order на основании quote и пользовательских реквизитов.

Основные проверки:
- quote существует и не истёк;
- пользователь имеет право использовать wallet/requisite;
- pair активна;
- реквизиты валидны;
- сумма попадает в лимиты;
- automation mode определяется правилами.

Результат:
- order id;
- order no;
- initial status;
- required next actions;
- payment instructions or crypto instructions.

### `GET /trade/orders/:id/status`

Назначение: безопасное получение статуса заказа для UI и polling frontend.

### `POST /trade/orders/:id/cancel`

Назначение: отмена заказа пользователем, если состояние это допускает.

### `POST /trade/orders/:id/recalculate`

Назначение: пересчёт или перевыпуск инструкций до перехода в необратимую стадию.

## 7.3 Operator endpoints

### `POST /trade/operator/orders/:id/confirm-payment`

Назначение: ручное подтверждение входящего фиатного платежа оператором.

### `POST /trade/operator/orders/:id/reject-payment`

Назначение: отклонение платежа с причиной.

### `POST /trade/operator/orders/:id/confirm-crypto-receipt`

Назначение: ручное подтверждение получения криптовалюты.

### `POST /trade/operator/orders/:id/approve-release`

Назначение: разрешение на отправку криптовалюты или фиатной выплаты.

### `POST /trade/operator/orders/:id/reject-order`

Назначение: отклонение заявки с reason code и comment.

### `POST /trade/operator/orders/:id/set-risk`

Назначение: установка/изменение risk level или создание risk flag.

## 7.4 Provider endpoints

### `POST /trade/webhooks/payment/:provider`

Назначение: приём webhook от платёжного провайдера.

Функции endpoint:
- signature verification;
- запись raw event в `provider_events`;
- идемпотентность;
- постановка задачи в worker;
- быстрый HTTP response.

### `POST /trade/webhooks/crypto/:provider`

Назначение: приём webhook по blockchain-транзакциям, если провайдер поддерживает push model.

## 7.5 System endpoints

### `POST /trade/internal/jobs/process/:jobId`

Внутренний endpoint для безопасного запуска worker-задач при необходимости.

### `POST /trade/internal/notifications/retry/:id`

Повторная отправка уведомления.

### `POST /trade/internal/documents/regenerate/:id`

Перегенерация документа или чека.

## 8. Required hooks

## 8.1 Collection hooks

### Wallet hooks

**Trigger:** before create / before update `wallets`

Назначение:
- нормализация адреса;
- проверка соответствия address выбранной сети;
- блокировка изменения критичных полей у уже использованных реквизитов;
- audit log при архивировании.

### Payout requisites hooks

**Trigger:** before create / before update `payout_requisites`

Назначение:
- маскирование отображаемого значения;
- шифрование чувствительных данных;
- валидация формата реквизита;
- контроль принадлежности пользователю.

### Order hooks

**Trigger:** before update `exchange_orders`

Назначение:
- запрет прямого изменения `current_status_code` вне state service;
- запрет редактирования immutable snapshots;
- контроль разрешённых полей в зависимости от роли.

### Payment transaction hooks

**Trigger:** before update `payment_transactions`

Назначение:
- блокировка ручной подмены provider-origin полей;
- изменение статуса только через transition service или trusted actor.

### Crypto transaction hooks

**Trigger:** before update `crypto_transactions`

Назначение:
- контроль tx hash uniqueness;
- защита lifecycle полей;
- недопущение неконсистентных confirmations.

## 8.2 Global audit hook

**Trigger:** after create/update/delete selected collections

Коллекции:
- exchange_orders;
- wallets;
- payout_requisites;
- payment_transactions;
- crypto_transactions;
- risk_flags;
- documents.

Функция:
- запись в `audit_logs`;
- фиксация actor, entity, action, before/after snapshot;
- редактирование больших payload при необходимости.

## 8.3 Scheduled hooks

Scheduled processes лучше запускать не как тяжёлые Directus Flow сценарии, а как cron-triggered extensions.

Примеры:
- quote expiration sweep;
- stale order detection;
- unprocessed provider events retry;
- pending notification retry;
- pending receipt generation retry;
- blockchain confirmation refresh;
- timeout-based escalation to operator queue.

## 9. Order state machine service

Ключевой компонент системы — отдельный `OrderStateService`. Он должен быть единственной точкой изменения статусов заказа.

Функции сервиса:
- проверка допустимости перехода;
- запись `order_status_history`;
- изменение `exchange_orders.current_status_code`;
- вызов side-effects;
- публикация domain events;
- логирование причин перехода;
- защита от повторного применения перехода.

### 9.1 Suggested order statuses

Рекомендуемый базовый набор:

- `created`;
- `awaiting_user_payment`;
- `awaiting_fiat_confirmation`;
- `fiat_confirmed`;
- `awaiting_crypto_from_user`;
- `crypto_detected`;
- `awaiting_crypto_confirmations`;
- `crypto_confirmed`;
- `awaiting_operator_review`;
- `approved_for_execution`;
- `executing_exchange`;
- `executing_payout`;
- `completed`;
- `cancelled`;
- `rejected`;
- `expired`;
- `failed`;
- `manual_hold`.

### 9.2 Transition ownership

| Transition type | Who can do it |
|---|---|
| User cancellation | user / service |
| Payment confirmation | operator / service |
| Crypto receipt confirmation | operator / service |
| Risk hold | operator / compliance / service |
| Final completion | service / operator |
| Rejection | operator / compliance / admin |
| Manual override | admin only |

### 9.3 Side effects per transition

Каждый переход может вызывать дополнительные действия:

- enqueue notification;
- generate receipt;
- create payment transaction;
- create crypto transaction;
- create risk flag;
- create internal comment;
- assign operator queue;
- schedule retry;
- release payout / crypto dispatch.

Эти side effects не должны быть размазаны по разным Flow-редакторам. Их следует централизовать внутри state service или связанных domain services.

## 10. Quote engine service

Требуется отдельный `QuoteService`.

Функции:
- валидация входных параметров;
- поиск активной пары;
- применение fee rules;
- применение limit rules;
- определение automation mode preview;
- вычисление rate и output;
- создание `order_quotes`;
- установка срока действия котировки.

Если курс приходит от внешнего агрегатора или биржи, интеграция должна быть инкапсулирована в adapter interface, а не зашита в endpoint.

## 11. Payment integration service

Требуется `PaymentProviderService` с adapter-подходом.

Основные функции:
- создание payment intent / invoice;
- получение provider payment status;
- обработка webhook;
- нормализация provider status;
- запись `payment_transactions`;
- подтверждение/ошибка/отмена;
- безопасные retry.

### 11.1 Adapter interface

Каждый платёжный провайдер должен реализовывать единый контракт:

- `createPayment(order)`;
- `parseWebhook(request)`;
- `verifySignature(request)`;
- `normalizeStatus(payload)`;
- `getPaymentReference(payload)`;
- `fetchPaymentStatus(reference)`.

## 12. Crypto integration service

Требуется `CryptoProviderService` для работы с кошельками, кастодиальными провайдерами, биржевыми API или blockchain gateway.

Функции:
- генерация или назначение crypto deposit instructions;
- отслеживание входящих транзакций;
- мониторинг confirmations;
- отправка исходящих crypto withdrawals;
- получение tx hash и финального статуса;
- повторная сверка статуса при сетевых ошибках.

### 12.1 Adapter interface

- `createDepositInstruction(order)`;
- `parseWebhook(request)`;
- `verifySignature(request)`;
- `normalizeTxStatus(payload)`;
- `getTransactionReference(payload)`;
- `fetchTransactionStatus(reference)`;
- `createWithdrawal(order)`.

## 13. Notification service

Требуется `NotificationService`.

Функции:
- рендеринг шаблонов из `notification_templates`;
- создание записи `notifications`;
- постановка отправки в очередь;
- dispatch email provider;
- retries;
- запись provider message id;
- обработка hard failure.

### 13.1 Notification strategy

Directus Flow может инициировать только `enqueueNotification(orderEvent)` или создать очередь-запись. Реальная отправка должна выполняться вне request lifecycle.

### 13.2 Recommended triggers

- order created;
- payment instructions issued;
- payment received;
- crypto received;
- order on hold;
- order rejected;
- order completed;
- receipt generated;
- payout sent.

## 14. Receipt & document service

Требуется `DocumentService` и при необходимости отдельный `FiscalizationService`.

Функции:
- генерация PDF/HTML чеков и подтверждений;
- сохранение файлов и metadata в `documents`;
- отправка пользователю по email;
- повторная генерация;
- аудит отправки;
- интеграция с внешним сервисом фискализации, если это требуется юридической моделью проекта.

### 14.1 Suggested document types

- order confirmation;
- payment receipt;
- payout confirmation;
- exchange completion statement;
- compliance notice.

## 15. Risk & compliance service

Требуется `RiskService`.

Функции:
- присвоение `risk_level` заказу;
- создание `risk_flags`;
- помещение заявки в `manual_hold`;
- проверка лимитов и аномалий;
- возможность rule-based и external-provider проверки.

### 15.1 Trigger examples

- unusually large amount;
- repeated failed payments;
- suspicious wallet reuse;
- payout requisite mismatch;
- provider inconsistency;
- manual operator escalation.

## 16. Background jobs model

Все тяжёлые и повторяемые операции рекомендуется выполнять через job queue.

### 16.1 Job types

- `process_payment_webhook`;
- `process_crypto_webhook`;
- `send_notification`;
- `generate_document`;
- `retry_document_generation`;
- `sync_payment_status`;
- `sync_crypto_status`;
- `expire_quote`;
- `expire_order`;
- `apply_order_transition`;
- `run_risk_check`.

### 16.2 Job execution rules

- job должен быть идемпотентным;
- должна быть retry policy;
- должна быть dead-letter стратегия или failed state;
- должны логироваться started/finished/error;
- нельзя держать тяжёлую обработку внутри webhook request.

## 17. Idempotency requirements

Идемпотентность критична для:

- provider webhooks;
- повторной отправки callback;
- retried background jobs;
- operator double-click actions;
- crypto event sync;
- payment sync.

### 17.1 Recommended controls

- dedup by `external_event_id`;
- dedup by `checksum` payload;
- unique constraint on provider references where applicable;
- transition replay guard;
- locking around order state changes.

## 18. Concurrency & locking

При работе с ордерами и транзакциями необходимо предусмотреть конкурентный доступ.

Рекомендуется:
- optimistic locking на уровне updated timestamp/version при UI update;
- transactional lock в custom service при изменении order state;
- serialized processing per order id в worker;
- запрет параллельного исполнения conflicting transitions.

## 19. Security requirements for extensions

Все custom extensions должны соблюдать следующие правила:

- endpoint authorization через role + explicit business checks;
- verify ownership для пользовательских реквизитов и ордеров;
- verify provider signatures;
- не логировать plaintext чувствительные реквизиты;
- маскировать payout data в response;
- шифровать чувствительные поля до записи;
- ограничить admin override отдельным action и audit trail;
- все operator/admin actions должны писать audit record.

## 20. Recommended Directus Flow catalog

Ниже — рекомендуемый минимальный каталог Flows.

| Flow Name | Trigger | Action |
|---|---|---|
| create-user-profile | directus_users item.create | create `user_profiles` if absent |
| enqueue-order-created-notification | exchange_orders item.create | enqueue notification job |
| enqueue-order-status-notification | exchange_orders item.update | enqueue notification if status changed |
| create-audit-log-for-wallet-change | wallets item.update | create audit log entry |
| create-audit-log-for-payout-change | payout_requisites item.update | create audit log entry |
| create-risk-flag-audit | risk_flags item.create | create audit entry + optional operator notification |
| retry-stuck-notifications | schedule | enqueue retries |
| retry-unprocessed-provider-events | schedule | enqueue failed/new provider event processing |
| expire-old-quotes | schedule | enqueue quote expiration jobs |
| escalate-stale-manual-orders | schedule | notify operator queue |

Важно: эти Flows должны оставаться тонкими orchestration-level механизмами, а не местом сложной domain logic.

## 21. Suggested project structure for Directus extensions

```text
extensions/
  endpoints/
    trade-quotes/
    trade-orders/
    trade-operator/
    trade-webhooks-payment/
    trade-webhooks-crypto/
    trade-internal/
  hooks/
    wallets-validation/
    payout-requisites-validation/
    exchange-orders-guard/
    payment-transactions-guard/
    crypto-transactions-guard/
    audit-log-hook/
  operations/
    enqueue-job/
    render-notification/
  modules/
    services/
      QuoteService.ts
      OrderService.ts
      OrderStateService.ts
      PaymentProviderService.ts
      CryptoProviderService.ts
      NotificationService.ts
      DocumentService.ts
      RiskService.ts
    providers/
      payment/
      crypto/
      email/
      fiscalization/
    repositories/
    utils/
      idempotency.ts
      crypto-address.ts
      masking.ts
      encryption.ts
      signatures.ts
      money.ts
      audit.ts
```

## 22. QA checklist for flows and extensions

Перед production-ready запуском необходимо проверить:

- нельзя напрямую поменять order status через item update;
- webhooks идемпотентны;
- provider events не дублируют transitions;
- operator action фиксируется в audit log;
- failed notification может быть безопасно retried;
- quote expiration корректно срабатывает;
- completed order не может быть повторно исполнен;
- payout and wallet data не возвращаются в полном виде неавторизованным ролям;
- invalid provider signature отклоняется;
- manual and auto transition logic дают одинаково консистентный результат.

## 23. Recommended implementation priority

### Phase 1 — MVP Manual Control

- collections + permissions;
- field schema + guards;
- quote endpoint;
- order creation endpoint;
- operator endpoints;
- payment webhook;
- basic crypto transaction intake;
- order state service;
- notification queue;
- document generation baseline;
- audit logs.

### Phase 2 — Controlled Automation

- partial auto-confirmation rules;
- blockchain confirmation sync;
- payout automation for selected scenarios;
- risk automation;
- retries and reconciliation jobs;
- receipt/fiscal integration hardening.

### Phase 3 — Advanced Automation

- multi-provider routing;
- smart fallback providers;
- auto-risk scoring;
- semi-auto compliance queues;
- analytics and SLA monitoring.

## 24. Итоговая рекомендация

Для TheBlack.Trade рекомендуется использовать гибридную модель: **Directus управляет данными, правами, admin UI и lightweight orchestration**, а вся критическая транзакционная логика реализуется в custom extensions и worker-сервисах. Такой подход минимизирует риски неконсистентности, упрощает контроль ручных операций на MVP-этапе и позволяет постепенно включать автоматизацию без переделки базовой архитектуры.