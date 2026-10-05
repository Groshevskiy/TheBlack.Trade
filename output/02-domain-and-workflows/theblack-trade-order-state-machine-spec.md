## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Product + Backend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `order-domain-model-spec.md`
  - `enum-and-state-dictionary-spec.md`
  - `transaction-status-state-machine-spec.md`
- Related documents:
  - `frontend-state-machine-spec.md`
  - `approval-workflow-schema.md`
  - `acceptance-test-catalog.md`

# Order State Machine Spec
## TheBlack.Trade

## 1. Назначение документа

Настоящий документ описывает state machine жизненного цикла заявки обмена в системе **TheBlack.Trade**. Спецификация определяет набор статусов, допустимые переходы, роли-инициаторы, guards, side effects, правила ручного и автоматического подтверждения, а также требования к реализации `OrderStateService`.

Документ предназначен для backend developers, Directus integrators, frontend team, QA, product owner и operators. Он должен использоваться как единый источник истины для логики ордеров в админке, API и интерфейсе пользователя.

## 2. Цели state machine

State machine вводится для решения следующих задач:

- исключить произвольное изменение статуса заявки;
- централизовать всю transition logic;
- сделать поведение ручного и автоматического сценария предсказуемым;
- обеспечить корректную историю статусов и аудита;
- снизить риск повторного исполнения одной и той же заявки;
- дать frontend понятную модель текущего этапа процесса;
- сделать возможной постепенную автоматизацию без ломки бизнес-логики.

## 3. Основной принцип

Поле `exchange_orders.current_status_code` не должно изменяться напрямую через CRUD update. Любое изменение статуса должно происходить только через отдельный сервис `OrderStateService`, который:

- проверяет допустимость перехода;
- проверяет guard conditions;
- пишет запись в `order_status_history`;
- обновляет `exchange_orders.current_status_code`;
- выполняет side effects;
- публикует domain events;
- защищает систему от повторного применения перехода.

## 4. High-level lifecycle

Для платформы предусмотрены два базовых сценария:

- **buy flow** — пользователь оплачивает фиат, после подтверждения платформа отправляет криптовалюту пользователю;
- **sell flow** — пользователь отправляет криптовалюту, после подтверждения платформа выплачивает фиат пользователю.

Обе ветки должны использовать общий каркас state machine, но отдельные переходы и действия могут зависеть от `direction_code`.

## 5. Suggested canonical statuses

Ниже приведён рекомендуемый канонический список статусов.

| Status Code | Category | Final | Description |
|---|---|---|---|
| created | open | no | Заявка создана, но пользователь ещё не приступил к обязательному следующему действию |
| awaiting_user_payment | open | no | Для buy flow ожидается оплата пользователем |
| awaiting_fiat_confirmation | intermediate | no | Платёж заявлен или получен, требуется подтверждение платформой/провайдером |
| fiat_confirmed | intermediate | no | Фиат подтверждён и может запускаться следующий шаг |
| awaiting_crypto_from_user | open | no | Для sell flow ожидается отправка криптовалюты пользователем |
| crypto_detected | intermediate | no | Входящая криптотранзакция обнаружена, но ещё не подтверждена полностью |
| awaiting_crypto_confirmations | intermediate | no | Ожидается достаточное число подтверждений сети |
| crypto_confirmed | intermediate | no | Криптовалюта подтверждена и может запускаться следующий шаг |
| awaiting_operator_review | intermediate | no | Требуется ручная проверка оператором или compliance |
| manual_hold | intermediate | no | Заявка удержана до ручного решения |
| approved_for_execution | intermediate | no | Оператор или сервис разрешил исполнение |
| executing_exchange | intermediate | no | Идёт обмен/резервирование/подготовка исполнения |
| executing_payout | intermediate | no | Выполняется отправка криптовалюты или фиатной выплаты |
| completed | closed | yes | Заявка успешно завершена |
| cancelled | closed | yes | Пользователь или система отменили заявку до исполнения |
| rejected | closed | yes | Заявка отклонена платформой |
| expired | closed | yes | Срок действия заявки истёк |
| failed | error | yes | Произошла техническая ошибка, требующая дальнейшего разбора |

## 6. Status groups for UI

Для frontend рекомендуется дополнительно определить UI-группы статусов:

| UI Group | Statuses |
|---|---|
| Created | created |
| Waiting for user | awaiting_user_payment, awaiting_crypto_from_user |
| Waiting for confirmation | awaiting_fiat_confirmation, crypto_detected, awaiting_crypto_confirmations |
| Manual review | awaiting_operator_review, manual_hold |
| Processing | fiat_confirmed, crypto_confirmed, approved_for_execution, executing_exchange, executing_payout |
| Done | completed |
| Stopped | cancelled, rejected, expired, failed |

Это позволит показывать пользователю понятные этапы процесса без раскрытия внутренней технической сложности.

## 7. Direction-specific entry transitions

### 7.1 Buy flow

При создании buy order базовый маршрут обычно выглядит так:

`created -> awaiting_user_payment -> awaiting_fiat_confirmation -> fiat_confirmed -> approved_for_execution -> executing_exchange -> executing_payout -> completed`

### 7.2 Sell flow

При создании sell order базовый маршрут обычно выглядит так:

`created -> awaiting_crypto_from_user -> crypto_detected -> awaiting_crypto_confirmations -> crypto_confirmed -> approved_for_execution -> executing_exchange -> executing_payout -> completed`

### 7.3 Manual review path

Для любой ветки возможен маршрут ручной проверки:

`<any eligible non-final state> -> awaiting_operator_review -> manual_hold -> approved_for_execution / rejected / cancelled / failed`

## 8. Actors

Допустимые инициаторы переходов:

| Actor Type | Description |
|---|---|
| user | Аутентифицированный пользователь платформы |
| operator | Оператор ручной обработки |
| compliance | Сотрудник контроля/рисков |
| admin | Администратор с расширенными правами |
| service | Системный сервис, worker или trusted integration |

## 9. Transition rules overview

Ниже приведены рекомендуемые переходы верхнего уровня.

| From | To | Allowed Actors | Notes |
|---|---|---|---|
| created | awaiting_user_payment | service | buy flow initialization |
| created | awaiting_crypto_from_user | service | sell flow initialization |
| created | cancelled | user, operator, admin, service | before processing starts |
| created | expired | service | ttl exceeded |
| awaiting_user_payment | awaiting_fiat_confirmation | user, service | payment declared / provider init / payment seen |
| awaiting_user_payment | cancelled | user, operator, admin, service | before fiat confirmation |
| awaiting_user_payment | expired | service | payment not made in time |
| awaiting_user_payment | awaiting_operator_review | operator, compliance, admin, service | exception or manual routing |
| awaiting_fiat_confirmation | fiat_confirmed | operator, service | manual or automatic confirmation |
| awaiting_fiat_confirmation | manual_hold | operator, compliance, admin, service | suspicious or mismatch |
| awaiting_fiat_confirmation | rejected | operator, compliance, admin | invalid payment |
| awaiting_fiat_confirmation | failed | service, admin | provider/processing error |
| fiat_confirmed | approved_for_execution | operator, service | checks passed |
| fiat_confirmed | awaiting_operator_review | operator, compliance, admin, service | risk/compliance review |
| fiat_confirmed | failed | service, admin | downstream issue |
| awaiting_crypto_from_user | crypto_detected | service, operator | tx observed |
| awaiting_crypto_from_user | cancelled | user, operator, admin, service | before tx detection |
| awaiting_crypto_from_user | expired | service | no incoming tx |
| awaiting_crypto_from_user | awaiting_operator_review | operator, compliance, admin, service | exception path |
| crypto_detected | awaiting_crypto_confirmations | service | minimum lifecycle progression |
| crypto_detected | manual_hold | operator, compliance, admin, service | suspicious tx |
| crypto_detected | failed | service, admin | invalid tx processing |
| awaiting_crypto_confirmations | crypto_confirmed | service, operator | confirmations reached |
| awaiting_crypto_confirmations | manual_hold | operator, compliance, admin, service | anomaly or review |
| awaiting_crypto_confirmations | failed | service, admin | chain/provider issue |
| crypto_confirmed | approved_for_execution | operator, service | release approved |
| crypto_confirmed | awaiting_operator_review | operator, compliance, admin, service | extra checks required |
| approved_for_execution | executing_exchange | service, operator | execution starts |
| executing_exchange | executing_payout | service, operator | exchange completed, payout dispatch begins |
| executing_exchange | manual_hold | operator, compliance, admin, service | problem during execution |
| executing_exchange | failed | service, admin | technical failure |
| executing_payout | completed | service, operator | payout/transfer successful |
| executing_payout | manual_hold | operator, compliance, admin, service | payout issue |
| executing_payout | failed | service, admin | payout failed |
| awaiting_operator_review | manual_hold | operator, compliance, admin | explicit hold |
| awaiting_operator_review | approved_for_execution | operator, compliance, admin | review passed |
| awaiting_operator_review | rejected | operator, compliance, admin | review failed |
| awaiting_operator_review | cancelled | operator, admin | stop order |
| manual_hold | awaiting_operator_review | operator, compliance, admin | resumed review |
| manual_hold | approved_for_execution | operator, compliance, admin | manual release |
| manual_hold | rejected | operator, compliance, admin | final reject |
| manual_hold | cancelled | operator, admin | cancellation by platform |
| manual_hold | failed | admin, service | unrecoverable issue |
| any non-final | failed | service, admin | critical technical issue |

## 10. Transition specification details

Ниже приведены детальные правила по ключевым переходам.

## 10.1 `created -> awaiting_user_payment`

**Applies to:** buy flow  
**Actors:** service

**Guards:**
- order created successfully;
- quote still valid at creation time;
- payment instructions can be generated.

**Side effects:**
- create payment intent or invoice if payment provider requires it;
- create initial `payment_transactions` record if applicable;
- notify user with payment instructions;
- set expiry timer.

## 10.2 `created -> awaiting_crypto_from_user`

**Applies to:** sell flow  
**Actors:** service

**Guards:**
- order created successfully;
- crypto deposit instructions available;
- wallet/address mapping prepared.

**Side effects:**
- create crypto deposit instruction or expected inbound reference;
- notify user with transfer instructions;
- set expiry timer.

## 10.3 `awaiting_user_payment -> awaiting_fiat_confirmation`

**Actors:** user, service

**Typical triggers:**
- user clicked “I paid”;
- payment provider reported pending/received payment;
- operator marked payment as submitted.

**Guards:**
- order not expired;
- payment context exists;
- order direction is buy.

**Side effects:**
- update payment transaction state;
- append order comment if user declared payment;
- enqueue operator queue item when manual confirmation mode enabled.

## 10.4 `awaiting_fiat_confirmation -> fiat_confirmed`

**Actors:** operator, service

**Guards:**
- confirmed amount is sufficient;
- payment source accepted;
- no blocking risk flag;
- order not already final.

**Side effects:**
- write confirmation actor and timestamp;
- create audit record;
- enqueue execution decision;
- notify user that payment is confirmed.

## 10.5 `awaiting_crypto_from_user -> crypto_detected`

**Actors:** service, operator

**Guards:**
- inbound crypto tx linked to order;
- asset/network match expected values;
- amount is not obviously invalid.

**Side effects:**
- create/update `crypto_transactions`;
- write tx hash and detection timestamp;
- move to confirmation tracking.

## 10.6 `crypto_detected -> awaiting_crypto_confirmations`

**Actors:** service

**Guards:**
- tx hash exists;
- transaction accepted for tracking;
- network requires confirmations > 0.

**Side effects:**
- schedule blockchain sync job;
- update visible status for user.

## 10.7 `awaiting_crypto_confirmations -> crypto_confirmed`

**Actors:** service, operator

**Guards:**
- confirmations >= required_confirmations;
- no compliance block;
- tx not reversed or invalidated.

**Side effects:**
- freeze confirmed crypto amount for execution;
- notify operator/service for payout release decision;
- notify user that crypto is confirmed.

## 10.8 `fiat_confirmed -> approved_for_execution`

**Actors:** operator, service

**Guards:**
- payment fully confirmed;
- order passed risk review or review not required;
- execution route available.

**Side effects:**
- select execution provider;
- reserve liquidity if required;
- enqueue exchange execution.

## 10.9 `crypto_confirmed -> approved_for_execution`

**Actors:** operator, service

**Guards:**
- crypto confirmed;
- payout requisites valid;
- no unresolved risk flags.

**Side effects:**
- prepare fiat payout or internal settlement;
- enqueue execution step.

## 10.10 `approved_for_execution -> executing_exchange`

**Actors:** service, operator

**Guards:**
- order approved;
- required provider integration available;
- lock obtained for this order.

**Side effects:**
- create execution session metadata;
- write provider reference;
- start transactional execution pipeline.

## 10.11 `executing_exchange -> executing_payout`

**Actors:** service, operator

**Guards:**
- exchange step completed successfully or was not required as separate provider step;
- payout channel prepared.

**Side effects:**
- create outgoing transaction record;
- dispatch payout or crypto transfer;
- notify operator in manual send mode.

## 10.12 `executing_payout -> completed`

**Actors:** service, operator

**Guards:**
- outgoing transfer confirmed or payout acknowledged;
- no unresolved critical errors;
- completion event has not been applied before.

**Side effects:**
- mark order completed timestamp;
- generate receipt/documents;
- send completion email and receipt;
- close pending jobs;
- emit analytics event.

## 10.13 `* -> awaiting_operator_review`

**Actors:** operator, compliance, admin, service

**Guards:**
- order is not final;
- business reason exists for review routing.

**Typical reasons:**
- amount anomaly;
- provider mismatch;
- suspicious wallet;
- manual escalation;
- payout mismatch;
- repeated retry failures.

**Side effects:**
- create internal comment or risk flag;
- assign operator/compliance queue;
- notify internal staff.

## 10.14 `* -> manual_hold`

**Actors:** operator, compliance, admin, service

**Guards:**
- order is not final;
- hold reason specified.

**Side effects:**
- freeze automation;
- require explicit manual resolution;
- optionally notify user with neutral wording.

## 10.15 `* -> rejected`

**Actors:** operator, compliance, admin

**Guards:**
- rejection reason code required;
- order not final;
- rejection is legally and operationally allowed.

**Side effects:**
- persist rejection reason and comment;
- generate audit trail;
- notify user about rejection;
- trigger return/refund workflow if needed.

## 10.16 `* -> cancelled`

**Actors:** user, operator, admin, service

**Guards:**
- cancellation allowed from current state;
- no irreversible execution already performed.

**Side effects:**
- release reserved resources;
- stop queued background jobs;
- notify user;
- create refund task if applicable.

## 10.17 `* -> expired`

**Actors:** service

**Guards:**
- order ttl exceeded;
- no progress condition met before timeout;
- order not already final.

**Side effects:**
- close payment/crypto waiting instructions;
- notify user;
- release reserved quote or routing context.

## 10.18 `* -> failed`

**Actors:** service, admin

**Guards:**
- unrecoverable technical error or invariant violation;
- retry policy exhausted or manual terminal failure applied.

**Side effects:**
- log detailed technical reason;
- freeze further automatic actions;
- create operator alert;
- require investigation or compensating action.

## 11. Allowed transition matrix by status

Ниже приведена матрица разрешённых выходов из каждого статуса.

| Current Status | Allowed Next Statuses |
|---|---|
| created | awaiting_user_payment, awaiting_crypto_from_user, cancelled, expired, failed |
| awaiting_user_payment | awaiting_fiat_confirmation, awaiting_operator_review, cancelled, expired, failed |
| awaiting_fiat_confirmation | fiat_confirmed, manual_hold, awaiting_operator_review, rejected, failed |
| fiat_confirmed | approved_for_execution, awaiting_operator_review, manual_hold, failed |
| awaiting_crypto_from_user | crypto_detected, awaiting_operator_review, cancelled, expired, failed |
| crypto_detected | awaiting_crypto_confirmations, manual_hold, awaiting_operator_review, failed |
| awaiting_crypto_confirmations | crypto_confirmed, manual_hold, awaiting_operator_review, failed |
| crypto_confirmed | approved_for_execution, awaiting_operator_review, manual_hold, failed |
| awaiting_operator_review | manual_hold, approved_for_execution, rejected, cancelled, failed |
| manual_hold | awaiting_operator_review, approved_for_execution, rejected, cancelled, failed |
| approved_for_execution | executing_exchange, manual_hold, failed |
| executing_exchange | executing_payout, manual_hold, failed |
| executing_payout | completed, manual_hold, failed |
| completed | none |
| cancelled | none |
| rejected | none |
| expired | none |
| failed | none unless explicit admin recovery path is designed |

## 12. Admin recovery policy

По умолчанию `failed` следует считать финальным состоянием. Если бизнес решит поддержать recovery path, он должен быть реализован отдельно и строго ограничен.

Рекомендуемый подход:
- recovery path выключен в MVP;
- при необходимости допускается только `failed -> manual_hold`;
- переход должен быть доступен только `admin`;
- обязательны reason, comment и audit trail;
- восстановление должно запускать отдельный investigation workflow.

## 13. Guard conditions catalog

Ниже приведён рекомендуемый каталог guard checks, которые должны быть доступны `OrderStateService`.

| Guard Code | Description |
|---|---|
| order_not_final | Заказ ещё не находится в финальном статусе |
| direction_is_buy | Применимо только к buy flow |
| direction_is_sell | Применимо только к sell flow |
| quote_valid | Quote существует и не истёк |
| payment_context_exists | Есть связанный payment context |
| payment_confirmed | Платёж подтверждён |
| crypto_tx_detected | Входящая crypto tx обнаружена |
| crypto_confirmed | Подтверждения сети достаточны |
| no_blocking_risk_flags | Нет открытых блокирующих risk flags |
| requisites_valid | Реквизиты корректны и принадлежат пользователю |
| provider_available | Провайдер доступен для исполнения |
| order_locked | Получена блокировка на исполнение |
| not_expired | Заявка не истекла |
| cancellation_allowed | Текущий статус допускает отмену |
| rejection_reason_present | При отклонении указан reason code |
| hold_reason_present | При hold указан reason/comment |
| actor_permitted | Текущий actor может выполнить переход |
| idempotency_passed | Переход ещё не был применён повторно |

## 14. Side effects catalog

Каждый переход может запускать один или несколько side effects.

| Side Effect Code | Description |
|---|---|
| create_payment_intent | Создать payment request / invoice |
| create_crypto_instruction | Выдать реквизиты для перевода криптовалюты |
| update_payment_transaction | Обновить payment transaction |
| update_crypto_transaction | Обновить crypto transaction |
| write_status_history | Записать историю перехода |
| enqueue_notification | Поставить email/notification в очередь |
| enqueue_document_generation | Поставить генерацию документа |
| enqueue_execution | Поставить заявку на исполнение |
| enqueue_payout | Поставить выплату/отправку в очередь |
| assign_manual_queue | Отправить в очередь оператора/compliance |
| create_risk_flag | Создать risk flag |
| create_internal_comment | Создать внутренний комментарий |
| release_resources | Освободить резерв/провайдерный контекст |
| freeze_automation | Заблокировать автоматические шаги |
| stop_pending_jobs | Остановить дальнейшие автоматические джобы |
| emit_analytics_event | Отправить аналитическое событие |

## 15. Idempotency rules for transitions

Для каждого перехода state service должен защищаться от повторного применения.

Рекомендуемые методы:
- уникальный transition key на основе `(order_id, from_status, to_status, business_event_reference)`;
- проверка уже существующего статуса;
- блокировка конкурентной обработки по `order_id`;
- dedup webhook reference;
- safe retry without double completion.

Особенно важно предотвратить повторный вызов:
- `fiat_confirmed`;
- `crypto_confirmed`;
- `executing_payout -> completed`;
- любых operator manual actions.

## 16. Concurrency model

State transitions должны выполняться в транзакции.

Рекомендуемая модель:
- read current order state with lock;
- validate actor + guard set;
- update status;
- write history;
- persist side-effect commands or jobs;
- commit transaction;
- process async actions after commit where applicable.

Не рекомендуется отправлять email, дёргать внешние API или генерировать документы до завершения транзакции изменения состояния.

## 17. UI mapping recommendations

Frontend должен отображать не внутренний technical status code, а user-friendly labels.

Пример:

| Technical Status | UI Label |
|---|---|
| created | Заявка создана |
| awaiting_user_payment | Ожидается оплата |
| awaiting_fiat_confirmation | Проверяем оплату |
| fiat_confirmed | Оплата подтверждена |
| awaiting_crypto_from_user | Ожидается перевод криптовалюты |
| crypto_detected | Перевод обнаружен |
| awaiting_crypto_confirmations | Ожидаются подтверждения сети |
| crypto_confirmed | Криптовалюта подтверждена |
| awaiting_operator_review | Заявка на проверке |
| manual_hold | Требуется дополнительная проверка |
| approved_for_execution | Заявка принята к исполнению |
| executing_exchange | Выполняем обмен |
| executing_payout | Выполняем отправку |
| completed | Заявка завершена |
| cancelled | Заявка отменена |
| rejected | Заявка отклонена |
| expired | Время заявки истекло |
| failed | Техническая ошибка обработки |

## 18. Audit requirements

Каждый переход должен фиксировать:
- order id;
- from status;
- to status;
- actor type;
- actor user id if exists;
- reason code if exists;
- comment if exists;
- metadata with provider/webhook/job context;
- timestamp.

Особое внимание:
- manual actions всегда должны иметь actor identity;
- rejection и hold всегда должны иметь reason/comment;
- auto transitions должны хранить event source.

## 19. Notifications by status

Рекомендуемая базовая таблица уведомлений:

| Transition / Status | Notify User | Notify Operator | Notes |
|---|---|---|---|
| created | optional | no | only if needed |
| awaiting_user_payment | yes | no | payment instructions |
| awaiting_crypto_from_user | yes | no | crypto transfer instructions |
| awaiting_fiat_confirmation | yes | optional | user knows payment is under review |
| fiat_confirmed | yes | no | payment confirmed |
| crypto_detected | optional | optional | depends on UX |
| awaiting_crypto_confirmations | yes | no | network confirmation message |
| crypto_confirmed | yes | optional | crypto confirmed |
| awaiting_operator_review | optional | yes | internal queue routing |
| manual_hold | yes, carefully worded | yes | avoid disclosing internal risk details |
| approved_for_execution | optional | optional | internal or user-facing depending UX |
| executing_payout | optional | optional | user can see progress |
| completed | yes | optional | final receipt |
| rejected | yes | yes | operator aware |
| cancelled | yes | optional | |
| expired | yes | optional | |
| failed | neutral message | yes | internal incident handling |

## 20. QA checklist

Перед вводом в эксплуатацию необходимо проверить:

- нельзя перейти в статус, который не указан в матрице;
- нельзя поменять статус напрямую через обычный item update;
- cancelled/rejected/completed/expired не допускают дальнейших переходов;
- buy и sell flow корректно расходятся уже на старте;
- order history всегда создаётся вместе с переходом;
- повторный webhook не приводит к двойному завершению;
- при manual hold автоматические шаги не продолжаются;
- failed корректно останавливает все последующие automation jobs;
- UI label корректно соответствует technical status;
- notification rules соблюдаются для ключевых статусов.

## 21. Recommended implementation notes

Рекомендуется реализовать в коде:

- enum `OrderStatusCode`;
- declarative transition map;
- actor policy map;
- guard resolver registry;
- side-effect handler registry;
- centralized transaction wrapper;
- explicit transition command object.

Пример логической структуры:

```text
OrderStateService
  - transition(orderId, targetStatus, actor, context)
  - assertAllowedTransition(current, target)
  - assertActorAllowed(actor, transition)
  - runGuards(transition, context)
  - persistStatusChange(...)
  - emitSideEffects(...)
```

## 22. Итоговая рекомендация

Для TheBlack.Trade state machine должна быть реализована как строго централизованный сервис с единым transition map и жёстким контролем actor permissions, guards и idempotency. Это особенно важно для MVP с ручным подтверждением платежей и последующим переходом к опциональной автоматизации: одна и та же модель должна одинаково надёжно поддерживать и manual flow, и semi-auto/auto сценарии.