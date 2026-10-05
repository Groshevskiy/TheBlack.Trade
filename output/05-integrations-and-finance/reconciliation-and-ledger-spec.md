## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Finance Ops + Backend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `payment-provider-and-payout-integration-spec.md`
  - `wallet-and-exchange-provider-integration-spec.md`
  - `transaction-status-state-machine-spec.md`
- Related documents:
  - `data-quality-freshness-and-data-contract-spec.md`
  - `accounting-close-and-financial-reporting-operations-spec.md`
  - `provider-contract-and-operations-pack.md`
  - `acceptance-test-catalog.md`
  - `migration-validation-pack.md`

# Reconciliation & Ledger Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает модель финансовой сверки, внутреннего ledger-слоя и auditability для платформы TheBlack.Trade. Спецификация предназначена для backend, finance/operations, solution architecture, QA, support, compliance и product-команд.

Документ определяет:

- роль reconciliation в buy/sell flows;
- внутреннюю ledger-модель;
- связь между order lifecycle, payment records, crypto transfers, exchange execution и payout records;
- правила выявления расхождений;
- модели ручного и автоматического разрешения discrepancies;
- требования к audit trail и закрытию финансовых состояний.

## 2. Контекст и цели

Для exchange-платформы недостаточно просто хранить статусы заявки. Система должна уметь доказуемо ответить на вопросы:

- был ли получен платеж;
- была ли получена криптовалюта;
- была ли произведена выплата;
- какая комиссия была удержана;
- какие записи подтверждают итоговый результат заявки;
- остались ли незакрытые расхождения.

Главная цель документа — определить модель, при которой каждое финансово значимое событие отражается во внутреннем ledger и может быть сверено с внешними источниками и order lifecycle.

## 3. Scope

Документ покрывает:

- fiat payment reconciliation;
- crypto transfer reconciliation;
- exchange execution reconciliation;
- payout reconciliation;
- внутренние ledger entries;
- discrepancy management;
- closeability criteria for an order.

Документ не описывает бухгалтерский учет в юридическом смысле и не заменяет финансовую отчетность. Он задает продуктово-техническую модель operational ledger и reconciliation.

## 4. Принципы reconciliation layer

Система должна строиться на следующих принципах:

- каждое финансово значимое событие должно иметь internal record;
- internal records должны быть связаны с order;
- external references должны храниться отдельно и стабильно;
- order status не должен считаться достаточным источником финансовой истины;
- terminal order status должен быть достижим только при согласованности критичных финансовых записей;
- discrepancies должны быть выявляемы, классифицируемы и отслеживаемы.

## 5. High-level financial object graph

Финансовая модель одной заявки обычно включает следующие объекты:

- `Order`
- `PaymentRecord` — фиатный входящий платеж пользователя
- `CryptoTransferRecord` — on-chain или off-platform входящая/исходящая криптооперация
- `ExchangeExecutionRecord` — результат обменной операции
- `SettlementRecord` — подготовка и проведение выплаты
- `LedgerEntry` — атомарная финансовая запись
- `ReconciliationRecord` — результат сверки
- `DiscrepancyCase` — зафиксированное расхождение
- `OrderTimelineEvent` — timeline/audit event

## 6. Роль ledger в системе

Ledger — это не просто лог событий и не просто timeline. Ledger должен быть внутренним слоем финансовых записей, который позволяет:

- фиксировать ожидаемые и фактические value movements;
- отделять business status от financial state;
- хранить нормализованные записи по fiat, crypto, fee, payout;
- строить сверку с провайдером, блокчейн-данными и payout-слоем;
- определять, можно ли считать order финансово закрытой.

## 7. Ledger model

## 7.1 Основная идея

Каждое финансово значимое действие должно отражаться одной или несколькими `LedgerEntry`. Ledger entries не обязаны быть бухгалтерским double-entry в строгом юридическом смысле, но должны обеспечивать внутреннюю согласованность и трассируемость.

## 7.2 Recommended LedgerEntry fields

| Поле | Описание |
|---|---|
| id | Уникальный идентификатор |
| order_id | Связь с заявкой |
| entry_type | payment_expected / payment_received / crypto_expected / crypto_received / exchange_output / fee_accrued / payout_expected / payout_sent / payout_completed / adjustment |
| asset_type | fiat / crypto |
| asset_code | Например RUB, USDT, BTC |
| network_code | Для crypto, если применимо |
| amount | Сумма |
| direction | in / out / internal |
| related_entity_type | PaymentRecord / CryptoTransferRecord / ExchangeExecutionRecord / SettlementRecord / ManualAdjustment |
| related_entity_id | Идентификатор связанной сущности |
| provider_reference | Внешний reference |
| status | expected / pending / confirmed / reversed / failed |
| effective_at | Время фактического или ожидаемого эффекта |
| created_at | Время создания записи |
| metadata_json | Доп. данные |

## 7.3 Entry type semantics

### Expected entries

Создаются в момент, когда система знает, что value movement должен произойти, но он еще не подтвержден.

Примеры:

- `payment_expected`
- `crypto_expected`
- `payout_expected`

### Confirmed entries

Создаются или обновляются, когда value movement реально подтвержден.

Примеры:

- `payment_received`
- `crypto_received`
- `payout_completed`

### Internal and adjustment entries

Используются для фиксации exchange result, fees, corrections, manual adjustments.

Примеры:

- `exchange_output`
- `fee_accrued`
- `adjustment`

## 8. Order-level financial lifecycle

## 8.1 Buy-flow

В типовом buy-flow:

1. создается ожидаемый фиатный платеж;
2. подтверждается входящий fiat;
3. выполняется exchange execution;
4. создается ожидаемая crypto delivery;
5. подтверждается факт отправки или доступности криптовалюты пользователю;
6. заявка считается финансово закрытой только после reconciliation relevant records.

## 8.2 Sell-flow

В типовом sell-flow:

1. создается ожидаемый входящий crypto transfer;
2. подтверждается получение криптовалюты;
3. фиксируется exchange execution;
4. создается ожидаемая payout запись;
5. payout подтверждается;
6. order закрывается при согласованности payout, fee и exchange records.

## 9. Relationship between business statuses and ledger

Order lifecycle и ledger не должны быть одним и тем же слоем.

- lifecycle отвечает на вопрос: «на каком этапе бизнес-процесса находится заявка?»
- ledger отвечает на вопрос: «какие value movements ожидались, произошли и подтверждены?»
- reconciliation отвечает на вопрос: «согласованы ли internal и external источники?»

Следовательно, order не должна переходить в terminal `completed`, если lifecycle завершен, но ledger/reconciliation still unresolved.

## 10. Payment reconciliation

## 10.1 Payment matching objectives

Для каждого buy-order система должна уметь сопоставить:

- ожидаемый платеж;
- пользовательское подтверждение;
- provider-side payment signal;
- итоговое внутреннее решение оператора или automation rules.

## 10.2 Matching dimensions

Сопоставление платежей должно учитывать:

- сумму;
- валюту;
- provider reference;
- comment/reference from payer;
- временное окно;
- order-specific correlation fields;
- duplicate collision checks.

## 10.3 Payment discrepancy examples

- payment expected, but not received;
- payment submitted by user, but not found externally;
- provider detected payment with wrong amount;
- one payment appears linked to multiple orders;
- payment received after expiration;
- partial payment;
- overpayment.

## 11. Crypto transfer reconciliation

## 11.1 Objective

Для операций, где пользователь отправляет или получает криптовалюту, система должна уметь подтверждать факт релевантного transfer event и связывать его с order context.

## 11.2 Matching dimensions

- blockchain network;
- asset code;
- amount;
- tx hash or provider reference;
- destination/source address;
- confirmation depth or equivalent status;
- observed_at / confirmed_at.

## 11.3 Crypto discrepancies

- expected transfer not observed;
- transfer observed with wrong asset;
- transfer observed on wrong network;
- insufficient amount;
- duplicate attribution;
- transfer seen but not sufficiently confirmed;
- internal record updated, but no stable external proof captured.

## 12. Exchange execution reconciliation

## 12.1 Role

Exchange execution — это переход между входящим value и исходящим value после применения курса, комиссии и execution logic.

## 12.2 Required reconciliation questions

Система должна уметь ответить:

- какой объем входящего value был принят;
- по какому rate он был обработан;
- какой fee применен;
- какой net result должен быть отправлен пользователю;
- соответствует ли фактический output ожидаемому settlement.

## 12.3 Exchange-related discrepancy examples

- payment confirmed, but no exchange execution record;
- exchange execution completed, but ledger output missing;
- fee differs from expected fee policy;
- exchange output amount inconsistent with payout/crypto delivery amount.

## 13. Payout reconciliation

## 13.1 Objective

Для sell-flow payout должен быть не просто отправлен, а сверяем между internal settlement, provider state и итоговым order outcome.

## 13.2 Matching dimensions

- payout amount;
- payout currency;
- payout destination;
- provider payout reference;
- initiation timestamp;
- final provider status;
- internal settlement record status.

## 13.3 Payout discrepancies

- payout expected, but not created;
- payout submitted, but no provider confirmation;
- provider reports success, but internal record not updated;
- internal completed, but no provider terminal proof;
- payout duplicated;
- payout failed after order nearly completed.

## 14. Reconciliation object model

## 14.1 ReconciliationRecord

Рекомендуется сущность `ReconciliationRecord`.

### Recommended fields

| Поле | Описание |
|---|---|
| id | Идентификатор |
| order_id | Заявка |
| reconciliation_type | payment / crypto / exchange / payout / order_closure |
| target_entity_type | Какая сущность сверяется |
| target_entity_id | Идентификатор сущности |
| internal_state_snapshot | Снимок internal данных |
| external_state_snapshot | Снимок внешних данных |
| result | matched / mismatched / pending / manual_review |
| discrepancy_code | Код расхождения |
| detected_at | Когда найдено |
| resolved_at | Когда закрыто |
| resolved_by | Кто закрыл |
| notes | Комментарий |

## 14.2 DiscrepancyCase

Для серьезных или долгоживущих расхождений рекомендуется отдельная сущность `DiscrepancyCase`.

### Recommended fields

- `id`
- `order_id`
- `case_type`
- `severity`
- `status`
- `discrepancy_code`
- `summary`
- `internal_reference`
- `external_reference`
- `owner_user_id`
- `opened_at`
- `resolved_at`
- `resolution_type`
- `resolution_notes`

## 15. Discrepancy classification

Рекомендуется классифицировать расхождения по severity.

| Severity | Значение |
|---|---|
| low | Небольшое расхождение, не блокирует order completion immediately |
| medium | Нужна ручная проверка, completion под вопросом |
| high | Order completion блокируется |
| critical | Возможен финансовый риск, нужен immediate intervention |

### Примеры discrepancy_code

- `payment_missing`
- `payment_amount_mismatch`
- `payment_duplicate_match`
- `crypto_not_confirmed`
- `crypto_network_mismatch`
- `exchange_output_mismatch`
- `fee_policy_mismatch`
- `payout_missing`
- `payout_unconfirmed`
- `payout_duplicate`
- `ledger_incomplete`

## 16. Resolution model

## 16.1 Разрешение расхождений

Расхождение может быть закрыто одним из способов:

- automatic match after retry/polling;
- operator confirmation;
- correction through adjustment record;
- cancellation/rejection of order;
- marking external proof as invalid and requesting user action.

## 16.2 Manual adjustments

Если требуется корректирующее действие, оно должно проходить через контролируемую модель `ManualAdjustment` или `adjustment` ledger entry.

### Правила для adjustment

- adjustment не должен silently переписывать историю;
- должно быть видно, кто и почему внес изменение;
- должна сохраняться связь с discrepancy case;
- adjustment должен иметь comment/reason code;
- critical adjustments могут требовать second-approval policy.

## 17. Order closure criteria

Order может считаться финансово закрытой только если выполнены все применимые условия:

- все required expected records либо confirmed, либо корректно canceled/reversed;
- нет unresolved high/critical discrepancy cases;
- payout/crypto delivery достиг terminal согласованного состояния;
- fees и net result согласованы;
- reconciliation records для ключевых этапов не находятся в `pending` без допущенного SLA exception.

## 18. Reconciliation execution model

Reconciliation должен запускаться несколькими способами.

## 18.1 Event-driven reconciliation

Запускается при:

- payment callback;
- payment confirmation submission;
- crypto transfer detection;
- exchange execution finalization;
- payout callback;
- operator manual action.

## 18.2 Scheduled reconciliation

Запускается по расписанию для:

- поиска зависших payment records;
- сверки payout records;
- поиска late-arriving external confirmations;
- контроля closure readiness.

## 18.3 On-demand reconciliation

Оператор или support должны иметь возможность принудительно запустить reconcile по order.

## 19. Audit trail requirements

Любое финансово значимое решение должно оставлять audit trail.

### Обязательно логировать:

- кто подтвердил payment;
- кто выполнил manual override;
- кто закрыл discrepancy;
- когда был создан adjustment;
- какие external данные использовались для reconcile;
- какая версия policy/rule set была применена, если это важно.

## 20. Metrics and observability requirements

Reconciliation layer должен отдавать метрики для operations.

### Recommended metrics

- количество orders с unresolved discrepancies;
- среднее время закрытия discrepancy;
- количество duplicate match incidents;
- payment mismatch rate;
- payout reconciliation lag;
- count of manual adjustments;
- orders blocked from completion due to reconciliation.

## 21. API and admin requirements

Admin/backend capability set должен включать:

- просмотр ledger entries по order;
- просмотр reconciliation records;
- просмотр discrepancy cases;
- запуск reconcile;
- создание manual adjustment;
- закрытие discrepancy case с reason;
- просмотр closure readiness summary.

### Example admin endpoint groups

- `/admin/orders/{id}/ledger`
- `/admin/orders/{id}/reconciliation`
- `/admin/orders/{id}/discrepancies`
- `/admin/orders/{id}/reconcile`
- `/admin/discrepancies/{id}/resolve`
- `/admin/ledger-adjustments`

## 22. UI implications

### Для operator/admin UI

Нужны следующие блоки:

- ledger tab;
- reconciliation tab;
- discrepancy list;
- closure readiness widget;
- adjustment history;
- external proof references.

### Для customer UI

Customer-facing интерфейс не обязан раскрывать все детали ledger, но должен уметь показывать нейтральные статусы вроде:

- payment under review;
- transfer being confirmed;
- settlement in progress;
- completion delayed due to verification.

## 23. Suggested implementation phases

## Phase 1 — MVP reconciliation baseline

- basic payment/crypto/payout reconciliation records;
- ledger entries for expected and confirmed movements;
- manual discrepancy handling;
- closure readiness check.

## Phase 2 — Structured discrepancy management

- discrepancy cases;
- adjustment workflow;
- scheduled reconciliation jobs;
- admin UI views for ledger/reconcile.

## Phase 3 — Mature operational finance layer

- richer auto-matching rules;
- anomaly detection;
- SLA monitoring;
- advanced metrics and resolution workflows.

## 24. QA checklist

QA должна проверить:

- expected ledger entries создаются при старте relevant flow;
- confirmed records корректно отражаются в ledger;
- mismatches correctly generate reconciliation/discrepancy records;
- order completion блокируется при unresolved critical discrepancy;
- manual adjustment не стирает историю и правильно логируется;
- duplicate payout/payment scenarios корректно отражаются в discrepancy model;
- scheduled reconciliation может закрыть pending case после появления external proof;
- closure readiness summary корректно отражает финансовую готовность order.

## 25. Следующие документы

На базе этой спецификации рекомендуется подготовить:

- `admin-review-decision-matrix.md`
- `error-catalog-and-api-ui-mapping-spec.md`
- `observability-and-audit-spec.md`
- `compliance-and-legal-operations-spec.md`