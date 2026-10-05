## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Platform + Security + Data
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `governed-event-taxonomy-and-schema-registry-spec.md`
  - `field-level-sensitivity-and-masking-matrix.md`
- Related documents:
  - `data-quality-freshness-and-data-contract-spec.md`
  - `observability-operations-runbook.md`
  - `incident-response-playbook.md`
  - `analytics-and-reporting-spec.md`
  - `data-retention-and-archival-spec.md`

# Observability & Audit Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает требования к observability, audit trail, event logging и operational monitoring для платформы TheBlack.Trade.

Спецификация предназначена для backend, frontend, DevOps/SRE, operations, support, QA, compliance и product-команд.

Документ определяет:

- какие события должны логироваться;
- чем отличаются application logs, audit logs и business events;
- как использовать correlation identifiers;
- какие метрики и алерты нужны;
- как trace financial and operator-critical flows;
- как обеспечивать расследуемость инцидентов и спорных кейсов.

## 2. Цели observability layer

Observability слой должен позволять:

- понимать текущее operational состояние системы;
- быстро находить причину ошибок или задержек;
- отслеживать критичные customer journeys;
- расследовать спорные или финансово значимые кейсы;
- обеспечивать auditability ручных действий и автоматизаций;
- поддерживать compliance-oriented traceability.

## 3. Scope

Документ покрывает:

- request/response tracing;
- business event logging;
- audit logging;
- provider callback logging;
- reconciliation observability;
- metrics and alerting;
- dashboard recommendations;
- data retention considerations на high level.

Документ не заменяет infrastructure runbook, но задает требования к тому, какие сигналы и следы система должна производить.

## 4. Core observability layers

Рекомендуется различать следующие слои:

| Layer | Назначение |
|---|---|
| Application logs | Технические логи выполнения кода, ошибок, retries |
| Business events | Доменный журнал ключевых событий заявки и финансовых шагов |
| Audit logs | Кто, что, когда изменил или подтвердил |
| Metrics | Числовые ряды для SLA/SLO и алертов |
| Traces | Сквозная трассировка запроса / операции |
| Reconciliation telemetry | Наблюдаемость сверки и discrepancies |

## 5. Logging principles

1. **Никаких критичных действий без traceability.**
2. **Один business event не должен растворяться только в техническом логе.**
3. **Audit log не равен обычному application log.**
4. **Каждый integration call должен быть коррелируем с order context.**
5. **PII и чувствительные данные должны маскироваться.**
6. **Логи должны быть пригодны и для real-time monitoring, и для post-incident investigation.**

## 6. Correlation and identifiers

Для трассировки нужны устойчивые идентификаторы.

## 6.1 Required identifiers

| Identifier | Назначение |
|---|---|
| `request_id` | Один HTTP/API request |
| `correlation_id` | Сквозной идентификатор бизнес-операции |
| `order_id` | Идентификатор заявки |
| `payment_record_id` | Платежный контекст |
| `crypto_transfer_record_id` | Криптоперевод |
| `settlement_record_id` | Payout/settlement |
| `provider_reference` | Внешняя привязка |
| `discrepancy_case_id` | Кейсы расхождения |
| `actor_user_id` | Клиент или оператор |
| `session_id` | Пользовательская сессия, если применимо |

## 6.2 Correlation rules

- один пользовательский order flow должен иметь общий `correlation_id`;
- provider callbacks должны прикрепляться к соответствующему `order_id` и `provider_reference`;
- manual operator decisions должны ссылаться на `order_id`, relevant record id и actor id;
- retries не должны терять связь с исходным correlation chain.

## 7. Application logs

Application logs нужны для диагностики технического поведения системы.

### Должны покрывать:

- входящие HTTP/API requests;
- background jobs;
- integration calls;
- retries/timeouts;
- validation failures;
- state transition attempts;
- exceptions and system failures.

### Recommended application log fields

- timestamp
- severity / level
- service/module
- event_name
- request_id
- correlation_id
- order_id (if applicable)
- actor_user_id (if applicable)
- provider_code (if applicable)
- provider_reference (if applicable)
- error_code (if applicable)
- message
- metadata_json

## 8. Business events

Business events — это нормализованные доменные события, пригодные для timeline, dashboards и расследования.

## 8.1 Typical business events

| Event | Meaning |
|---|---|
| order_created | Пользователь создал заявку |
| rate_locked | Зафиксирован курс/квота |
| payment_instruction_created | Создана инструкция на оплату |
| payment_confirmation_submitted | Пользователь сообщил об оплате |
| payment_confirmed | Оплата подтверждена |
| payment_rejected | Оплата отклонена |
| crypto_transfer_detected | Обнаружен криптотрансфер |
| crypto_transfer_confirmed | Трансфер подтвержден |
| wallet_verified | Реквизит подтвержден |
| exchange_execution_completed | Обмен выполнен |
| payout_created | Создан payout context |
| payout_released | Выплата отправлена |
| payout_completed | Выплата завершена |
| discrepancy_opened | Открыто расхождение |
| discrepancy_resolved | Расхождение закрыто |
| order_completed | Заявка завершена |
| order_canceled | Заявка отменена |

## 8.2 Business event payload guidance

Каждое business event должно содержать:

- event_name;
- occurred_at;
- order_id;
- actor_type (customer / operator / system / provider);
- actor_id, если применимо;
- related entity type/id;
- event outcome;
- correlation_id;
- metadata snapshot.

## 9. Audit logs

Audit logs используются для фиксирования значимых изменений и ручных решений.

## 9.1 Что обязательно должно попадать в audit log

- ручное подтверждение payment;
- ручное подтверждение/отклонение wallet details;
- payout release/block decisions;
- manual override;
- manual adjustment;
- role-sensitive admin actions;
- изменение critical statuses;
- закрытие discrepancy case;
- изменение permissions-sensitive данных.

## 9.2 Recommended audit log fields

| Поле | Назначение |
|---|---|
| id | Идентификатор записи |
| occurred_at | Когда произошло |
| actor_type | user / operator / system |
| actor_id | Кто выполнил |
| action | Например `payment_confirm_manual` |
| target_entity_type | Что изменили |
| target_entity_id | Идентификатор сущности |
| old_state_snapshot | До |
| new_state_snapshot | После |
| reason_code | Причина |
| note | Комментарий |
| correlation_id | Связь с цепочкой |
| evidence_references | На какие данные опирались |

## 10. Provider callback observability

Внешние callbacks критичны для финансовых сценариев и должны быть полностью наблюдаемы.

### Нужно логировать:

- получение callback;
- результат signature verification;
- provider event id;
- provider reference;
- normalized callback type;
- найденный internal target;
- processing result;
- retry count;
- final applied transition или отказ в переходе.

### Required callback outcomes

- accepted_and_applied
- accepted_no_transition
- rejected_invalid_signature
- rejected_unknown_reference
- duplicate_ignored
- processing_failed

## 11. Reconciliation observability

Система должна быть наблюдаема не только на уровне request logs, но и на уровне финансовой сверки.

### Нужны сигналы по:

- созданию reconciliation record;
- pending reconciliation;
- mismatch detection;
- discrepancy opening;
- discrepancy resolution;
- closure readiness blocked;
- manual adjustment creation.

### Key fields

- reconciliation_type
- target_entity_type
- target_entity_id
- internal_status
- external_status
- discrepancy_code
- severity
- resolved_by

## 12. Metrics model

Нужны как системные, так и business/operational metrics.

## 12.1 System metrics

- API latency
- error rate
- provider timeout rate
- queue/job processing duration
- callback processing success rate
- retry counts

## 12.2 Business metrics

- orders created
- orders completed
- orders canceled
- average order completion time
- payment confirmation lead time
- payout completion lead time
- manual review rate
- wallet verification pending count

## 12.3 Financial operations metrics

- payment mismatch rate
- crypto transfer mismatch rate
- payout failure rate
- unresolved discrepancy count
- average discrepancy resolution time
- duplicate movement incidents
- manual adjustment count
- blocked payout count

## 13. Alerting model

Алерты должны строиться по severity и operational impact.

## 13.1 Critical alerts

- duplicate payout risk detected;
- repeated provider signature invalid events;
- data integrity errors;
- payout mismatch in completed-like orders;
- unresolved critical discrepancies beyond SLA;
- массовые provider callback failures.

## 13.2 High-priority alerts

- рост payment mismatch rate;
- queue of payout holds above threshold;
- provider timeout spike;
- wallet verification review queue backlog;
- reconciliation job failures.

## 13.3 Medium-priority alerts

- elevated validation failures;
- repeated customer attachment upload errors;
- increased retry volume on provider calls.

## 14. Dashboard recommendations

Нужны разные dashboard views для разных ролей.

## 14.1 Operations dashboard

Показывает:

- orders in manual review;
- payment review queue;
- payout hold queue;
- unresolved discrepancies;
- aging cases;
- blocked completion count.

## 14.2 Technical / engineering dashboard

Показывает:

- API latency and error rate;
- provider uptime/error profile;
- callback ingestion results;
- background job health;
- idempotency conflicts;
- system integrity alerts.

## 14.3 Finance / settlement dashboard

Показывает:

- payments pending reconcile;
- payouts pending reconcile;
- duplicate risk incidents;
- mismatch categories;
- adjustments created;
- closure readiness blockers.

## 15. Traceability of critical journeys

Следующие customer/business flows должны быть полностью трассируемы end-to-end:

- order creation → payment instruction → payment confirmation → payment confirm/reject;
- sell order creation → crypto transfer detection → exchange execution → payout release/completion;
- wallet creation/verification → order binding → payout decision;
- discrepancy opening → investigation → resolution → order closure.

Для каждого такого journey нужно иметь возможность собрать цепочку событий по `correlation_id`.

## 16. Data masking and privacy

Observability не должна нарушать требования безопасности.

### Требования:

- маскировать payout requisites, wallet addresses и provider tokens там, где полный вывод не нужен;
- не логировать секреты и credentials;
- ограничивать доступ к audit logs и provider debug payloads;
- разделять customer-visible и operator/internal diagnostic data.

## 17. Retention guidance

Точные сроки retention могут регулироваться отдельным compliance/document retention spec, но на уровне архитектуры нужно предусмотреть разные уровни хранения:

- short-term application logs;
- longer-term audit logs;
- durable business event timeline;
- durable reconciliation/discrepancy traces;
- controlled retention of raw provider callback payloads.

## 18. Admin and support tooling requirements

Operator/support tooling должно позволять:

- искать по order_id / provider_reference / correlation_id;
- видеть последовательность business events;
- видеть audit history;
- видеть причину блокировки payout/completion;
- видеть связанные discrepancy cases;
- запускать controlled diagnostic actions, если policy разрешает.

## 19. API and implementation requirements

Implementation layer должен поддерживать:

- генерацию correlation_id для request chain;
- structured logging;
- event emission for business events;
- immutable audit record creation for critical actions;
- instrumentation of background jobs;
- metric emission;
- dashboards/queries for operational teams.

## 20. Incident investigation workflow

При инциденте команда должна иметь возможность:

1. Найти order / payout / payment / provider reference.
2. Получить correlation chain.
3. Просмотреть business timeline.
4. Просмотреть audit decisions.
5. Сопоставить external provider events.
6. Найти discrepancy/reconcile status.
7. Определить точку сбоя или неоднозначности.

Если этот путь невозможно пройти за разумное время, observability реализована недостаточно.

## 21. QA checklist

QA должна проверить:

- critical requests и jobs получают correlation identifiers;
- business events создаются для ключевых lifecycle steps;
- manual admin actions пишутся в audit log;
- callback outcomes логируются детерминированно;
- discrepancy creation/resolution наблюдаемы;
- dashboards могут показывать blocked/aging cases;
- sensitive data не утекает в логи;
- технические и customer-facing ошибки можно сопоставить через correlation_id.

## 22. Следующие документы

На базе этой спецификации рекомендуется подготовить:

- `compliance-and-legal-operations-spec.md`
- `operations-runbook-and-sla-spec.md`
- `notification-event-matrix.md`
- `incident-response-playbook.md`