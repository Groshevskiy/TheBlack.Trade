## Document metadata

- Status: superseded
- Role: Audit/report
- Owner: Platform + Data
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Superseded by: `governed-event-taxonomy-and-schema-registry-spec.md`
- Depends on:
  - `governed-event-taxonomy-and-schema-registry-spec.md`
- Related documents:
  - `notification-event-matrix.md`
  - `observability-and-audit-spec.md`

# Event Taxonomy & Schema Registry — TheBlack.Trade

## 1. Назначение документа

Этот документ определяет canonical event taxonomy и schema registry framework для TheBlack.Trade. Он задает, какие события считаются платформенными source-of-truth events, как они именуются, какие payload contracts должны соблюдать producers, какие consumers имеют право на использование тех или иных event families, как должны работать correlation, replay, deduplication, versioning и schema evolution.

Документ служит общей основой для backend services, provider integrations, admin automation, analytics pipelines, audit/observability, incident response и data governance.

## 2. Цели документа

Event model должен обеспечивать:

- единый словарь canonical domain events;
- предсказуемые event payload schemas;
- различие между domain, integration, audit и telemetry событиями;
- устойчивость к duplicate delivery, replay и out-of-order arrival;
- трассируемость между API commands, entity state transitions и analytics events;
- controlled schema evolution without breaking critical consumers.

## 3. Scope

Документ покрывает:

- event family taxonomy;
- canonical naming conventions;
- base event envelope;
- schema registry requirements;
- domain event catalog;
- integration/provider callback event mapping;
- audit vs telemetry distinction;
- versioning, replay and deduplication rules;
- consumer classification and governance expectations.

## 4. Core principles

1. **Canonical business state must be derived from entities and explicit domain events, not from ad hoc logs.**
2. **Events describe something that happened, not a mutable state snapshot pretending to be an event.**
3. **Schema versioning should be deliberate, observable and backward-aware.**
4. **Financial and compliance events require stronger idempotency and correlation guarantees.**
5. **Audit events, domain events and telemetry signals must remain distinct even if they are emitted from the same action.**
6. **Provider payloads should be normalized into internal canonical event families before broad downstream consumption.**

## 5. Event family taxonomy

Recommended top-level families:

- domain events
- command result events
- integration/provider events
- audit events
- notification/document delivery events
- telemetry/observability events
- analytics projection events
- retention/archive events

## 6. Family definitions

| Family | Purpose |
|---|---|
| Domain events | Business-significant facts tied to canonical entities and workflows |
| Command result events | Outcome events emitted after processing a command/action |
| Integration/provider events | Normalized representation of external provider inputs or sync outcomes |
| Audit events | Privileged actor/action trace for accountability and compliance |
| Notification/document delivery events | Communication and artifact generation lifecycle events |
| Telemetry/observability events | Technical runtime signals, failures, latency, retries, queue depth |
| Analytics projection events | Derived events optimized for reporting/warehouse pipelines |
| Retention/archive events | Archive, restore, purge, hold-application and retention execution signals |

## 7. Naming convention

Recommended canonical pattern:

`{entity_or_domain}.{fact_name}.v{major}`

### Examples

- `order.created.v1`
- `order.status_changed.v1`
- `payment.confirmed.v1`
- `payout.release_requested.v1`
- `kyc_application.remediation_requested.v1`
- `reconciliation_case.resolved.v1`
- `incident.mitigated.v1`

### Naming rules

- use lowercase snake-like tokens separated by dots;
- choose fact names that describe completed or accepted facts;
- avoid UI-specific wording;
- avoid provider-specific naming in canonical downstream events.

## 8. Base event envelope

Every emitted event should conform to a standard envelope.

### Recommended shape

```json
{
  "event_id": "evt_...",
  "event_name": "order.created.v1",
  "event_family": "domain",
  "schema_version": 1,
  "occurred_at": "2026-10-03T10:00:00Z",
  "produced_at": "2026-10-03T10:00:01Z",
  "producer": {
    "service": "order-service",
    "environment": "production"
  },
  "correlation": {
    "correlation_id": "corr_...",
    "causation_id": "cmd_...",
    "trace_id": "trace_..."
  },
  "subject": {
    "entity_type": "order",
    "entity_id": "ord_...",
    "public_ref": "..."
  },
  "actor": {
    "actor_type": "customer",
    "actor_id": "cus_..."
  },
  "payload": { },
  "meta": {
    "idempotency_key": "...",
    "source_channel": "web"
  }
}
```

## 9. Envelope field guidance

| Field | Meaning |
|---|---|
| `event_id` | Globally unique immutable event identifier |
| `event_name` | Canonical event name including major schema version |
| `event_family` | One of the approved top-level families |
| `schema_version` | Registry-tracked major schema version |
| `occurred_at` | Business occurrence timestamp |
| `produced_at` | Time event emitted by producer |
| `producer` | Producing service/job name and environment |
| `correlation` | End-to-end linkage for command/request/trace chains |
| `subject` | Primary affected entity or domain subject |
| `actor` | Customer/admin/system/provider actor when applicable |
| `payload` | Event-specific structured body |
| `meta` | Supplemental safe metadata |

## 10. Subject and actor rules

### Subject rules

- every event should have one primary subject;
- related entities may appear in payload or related_subjects arrays when needed;
- subject identity should use canonical entity types.

### Actor rules

- actor may be `customer`, `admin`, `system`, `provider`, or `scheduled_job`;
- when actor is unknown, record `system` with best available origin metadata;
- provider-triggered events should preserve provider identity in normalized fields.

## 11. Schema registry model

Registry should store at least:

- canonical event name;
- family;
- owning producer/service;
- schema version;
- payload schema definition;
- compatibility notes;
- required vs optional fields;
- sample payload;
- approved consumers;
- deprecation/supersession status.

## 12. Registry entry template

| Field | Description |
|---|---|
| Event name | Canonical event identifier |
| Family | Taxonomy family |
| Owner | Responsible service/team |
| Subject type | Primary entity/domain subject |
| Trigger | What causes emission |
| Payload schema | Structured field contract |
| Required fields | Fields mandatory for valid emission |
| Consumers | Approved downstream systems |
| Idempotency key strategy | Deduplication mechanism |
| Ordering expectations | Per entity or per stream assumptions |
| Replay policy | Whether/how event may be replayed |
| Status | Active, deprecated, replaced |

## 13. Domain event catalog overview

Recommended core domain families:

- customer
- kyc_application
- quote
- order
- payment
- payout
- wallet_or_requisite
- document
- notification
- review_task
- compliance_hold
- reconciliation_case
- incident

## 14. Customer domain events

### Recommended events

- `customer.created.v1`
- `customer.account_status_changed.v1`
- `customer.restricted.v1`
- `customer.suspended.v1`
- `customer.closed.v1`
- `customer.archived.v1`

### Notes

Do not emit separate canonical events for every UI profile edit unless the change is operationally significant or governed by audit-only tracking.

## 15. KYC application domain events

### Recommended events

- `kyc_application.created.v1`
- `kyc_application.submitted.v1`
- `kyc_application.review_started.v1`
- `kyc_application.remediation_requested.v1`
- `kyc_application.approved.v1`
- `kyc_application.rejected.v1`
- `kyc_application.expired.v1`
- `kyc_application.archived.v1`

### Key payload fields

- `application_id`
- `customer_id`
- `status`
- `previous_status` when status-change event
- `provider_case_ref` when applicable
- `remediation_reason_code` when applicable

## 16. Quote domain events

### Recommended events

- `quote.generated.v1`
- `quote.expired.v1`
- `quote.accepted.v1`

### Notes

Quotes are typically short-lived and may not require broad downstream fan-out beyond conversion and analytics consumers.

## 17. Order domain events

### Recommended events

- `order.created.v1`
- `order.customer_action_requested.v1`
- `order.review_requested.v1`
- `order.hold_opened.v1`
- `order.processing_started.v1`
- `order.partially_completed.v1`
- `order.completed.v1`
- `order.failed.v1`
- `order.rejected.v1`
- `order.canceled.v1`
- `order.expired.v1`
- `order.archived.v1`

### Key payload fields

- `order_id`
- `customer_id`
- `quote_id` when applicable
- `status`
- `previous_status`
- `reason_code` when applicable
- `hold_ids` when relevant

## 18. Payment domain events

### Recommended events

- `payment.expected.v1`
- `payment.evidence_submitted.v1`
- `payment.confirmation_pending.v1`
- `payment.review_started.v1`
- `payment.more_info_requested.v1`
- `payment.confirmed.v1`
- `payment.mismatch_detected.v1`
- `payment.rejected.v1`
- `payment.failed.v1`
- `payment.canceled.v1`
- `payment.archived.v1`

### Key payload fields

- `payment_id`
- `order_id`
- `amount`
- `currency`
- `status`
- `provider_ref` when applicable
- `mismatch_type` when applicable
- `evidence_artifact_ids` when applicable

## 19. Payout domain events

### Recommended events

- `payout.planned.v1`
- `payout.release_requested.v1`
- `payout.hold_opened.v1`
- `payout.releasing.v1`
- `payout.in_transit.v1`
- `payout.completed.v1`
- `payout.failed.v1`
- `payout.returned.v1`
- `payout.canceled.v1`
- `payout.archived.v1`

### Key payload fields

- `payout_id`
- `order_id`
- `destination_id`
- `status`
- `previous_status`
- `provider_ref` when applicable
- `failure_reason_code` when applicable

## 20. Wallet or requisite domain events

### Recommended events

- `wallet_or_requisite.created.v1`
- `wallet_or_requisite.submitted.v1`
- `wallet_or_requisite.review_started.v1`
- `wallet_or_requisite.verified.v1`
- `wallet_or_requisite.rejected.v1`
- `wallet_or_requisite.locked.v1`
- `wallet_or_requisite.superseded.v1`
- `wallet_or_requisite.archived.v1`

## 21. Document and notification domain events

### Documents

- `document.generation_requested.v1`
- `document.generated.v1`
- `document.issued.v1`
- `document.delivery_pending.v1`
- `document.delivered.v1`
- `document.delivery_failed.v1`
- `document.superseded.v1`

### Notifications

- `notification.queued.v1`
- `notification.send_started.v1`
- `notification.sent.v1`
- `notification.delivered.v1`
- `notification.suppressed.v1`
- `notification.failed.v1`
- `notification.canceled.v1`

## 22. Review, hold and case domain events

### Review tasks

- `review_task.opened.v1`
- `review_task.assigned.v1`
- `review_task.in_progress.v1`
- `review_task.escalated.v1`
- `review_task.resolved.v1`
- `review_task.canceled.v1`

### Compliance holds

- `compliance_hold.opened.v1`
- `compliance_hold.review_started.v1`
- `compliance_hold.partially_released.v1`
- `compliance_hold.released.v1`
- `compliance_hold.expired.v1`

### Reconciliation cases

- `reconciliation_case.opened.v1`
- `reconciliation_case.investigation_started.v1`
- `reconciliation_case.waiting_external.v1`
- `reconciliation_case.waiting_internal.v1`
- `reconciliation_case.resolved.v1`
- `reconciliation_case.reopened.v1`
- `reconciliation_case.canceled.v1`

## 23. Incident domain events

### Recommended events

- `incident.detected.v1`
- `incident.investigation_started.v1`
- `incident.mitigation_started.v1`
- `incident.monitoring_started.v1`
- `incident.resolved.v1`
- `incident.postmortem_required.v1`
- `incident.closed.v1`

### Notes

Technical signals that merely suggest an incident should remain telemetry until an incident object is actually created.

## 24. Command result events

Command-result events should be used when downstream systems need to know outcome of explicit commands without inferring from transport responses alone.

### Examples

- `command.order_create.accepted.v1`
- `command.payout_release.accepted.v1`
- `command.payout_release.rejected.v1`
- `command.document_reissue.accepted.v1`
- `command.review_task_assign.accepted.v1`

### Principle
n
These events complement but do not replace canonical domain events.

## 25. Provider/integration events

Provider-originated inputs should first be normalized.

### Raw input handling

Raw payloads may be stored in `provider_interaction` records, but downstream consumers should generally rely on normalized events.

### Recommended normalized examples

- `provider.payment_callback.received.v1`
- `provider.payout_callback.received.v1`
- `provider.kyc_callback.received.v1`
- `provider.document_delivery_callback.received.v1`
- `provider.notification_delivery_callback.received.v1`

### Canonical follow-up examples

- `payment.confirmed.v1`
- `payout.completed.v1`
- `kyc_application.approved.v1`
- `notification.delivered.v1`

## 26. Audit event family

Audit events are not substitutes for domain events.

### Typical audit events

- `audit.admin_login.v1`
- `audit.permission_changed.v1`
- `audit.review_decision_recorded.v1`
- `audit.hold_opened.v1`
- `audit.payout_released.v1`
- `audit.document_download_requested.v1`

### Requirements

- append-only semantics;
- actor identity and authorization context;
- no silent deletion or mutation;
- stronger retention/access rules.

## 27. Telemetry and observability events

Telemetry events represent technical behavior and platform health.

### Examples

- `telemetry.provider_request_failed.v1`
- `telemetry.webhook_signature_invalid.v1`
- `telemetry.queue_backlog_high.v1`
- `telemetry.retry_scheduled.v1`
- `telemetry.job_dead_lettered.v1`
- `telemetry.api_latency_threshold_exceeded.v1`

### Principle

Telemetry should not be confused with canonical business state changes.

## 28. Analytics projection events

These are derived, warehouse-friendly or reporting-oriented events.

### Examples

- `analytics.order_funnel_progressed.v1`
- `analytics.payment_confirmation_sla_breached.v1`
- `analytics.review_queue_aging_snapshot.v1`
- `analytics.notification_delivery_summary_generated.v1`

### Principle

Analytics projection events may be generated downstream and should never become the source of truth for canonical entity state.

## 29. Retention and archive events

### Recommended events

- `retention.hold_applied.v1`
- `retention.hold_released.v1`
- `archive.entity_archived.v1`
- `archive.entity_restored.v1`
- `retention.purge_executed.v1`
- `retention.purge_blocked.v1`

### Notes

These events help connect governance controls with audit and observability pipelines.

## 30. Ordering guarantees

### Recommended ordering model

- no assumption of global ordering;
- per-entity or per-stream ordering only where infrastructure supports it;
- consumers must tolerate out-of-order arrival;
- events should carry enough context to reconcile ordering ambiguities.

### Practical implication

Consumers should rely on event timestamps, versioning and current canonical reads when necessary instead of assuming perfect stream order.

## 31. Deduplication and idempotency

### Requirements

- `event_id` must be unique and immutable;
- provider-originated events should also preserve provider delivery/reference IDs;
- consumers should deduplicate on `event_id` and, where appropriate, producer/provider unique keys;
- handlers for financial/compliance events must be replay-safe.

## 32. Replay policy

### Replay categories

| Category | Recommended policy |
|---|---|
| Domain events | Replayable for downstream rebuild where retention allows |
| Command result events | Replayable with caution; not for re-executing commands |
| Provider events | Replayable only with duplicate-safe normalization rules |
| Audit events | Replayable for analysis/export, never mutable |
| Telemetry events | Usually retained for operational analysis, not authoritative rebuild |
| Analytics projection events | Rebuildable from canonical sources when possible |

## 33. Schema evolution rules

### Non-breaking changes

- adding optional fields;
- adding payload substructures that consumers may ignore;
- clarifying metadata fields without semantic change.

### Breaking changes

- removing required fields;
- changing meaning/type of existing fields;
- renaming event names or fields without version bump;
- changing enum semantics in incompatible ways.

### Rule

Breaking changes require new major version in event name and registry entry.

## 34. Consumer classes

Recommended consumer classes:

- transactional service consumers;
- admin automation consumers;
- analytics/warehouse consumers;
- audit/compliance consumers;
- incident/alerting consumers;
- archive/retention consumers.

### Principle

Registry should record which consumers are approved for each event and whether the event is internal-only, restricted or broadly consumable.

## 35. Governance and ownership

### Recommended ownership model

- each event family has a documented owner;
- schema changes require review by affected consumers;
- critical financial/compliance events require stricter change approval;
- deprecated events need sunset plan and successor mapping.

## 36. Minimal schema examples

### Example: `order.completed.v1`

```json
{
  "event_id": "evt_123",
  "event_name": "order.completed.v1",
  "event_family": "domain",
  "schema_version": 1,
  "occurred_at": "2026-10-03T10:00:00Z",
  "produced_at": "2026-10-03T10:00:01Z",
  "producer": {"service": "order-service", "environment": "production"},
  "correlation": {"correlation_id": "corr_1", "causation_id": "cmd_1", "trace_id": "trace_1"},
  "subject": {"entity_type": "order", "entity_id": "ord_1", "public_ref": "TB-1001"},
  "actor": {"actor_type": "system", "actor_id": "svc_order"},
  "payload": {
    "order_id": "ord_1",
    "customer_id": "cus_1",
    "status": "completed",
    "previous_status": "processing",
    "completed_at": "2026-10-03T10:00:00Z"
  },
  "meta": {"source_channel": "web"}
}
```

### Example: `payment.mismatch_detected.v1`

```json
{
  "event_id": "evt_456",
  "event_name": "payment.mismatch_detected.v1",
  "event_family": "domain",
  "schema_version": 1,
  "occurred_at": "2026-10-03T10:05:00Z",
  "produced_at": "2026-10-03T10:05:02Z",
  "producer": {"service": "payment-service", "environment": "production"},
  "correlation": {"correlation_id": "corr_2", "causation_id": "prov_evt_9", "trace_id": "trace_2"},
  "subject": {"entity_type": "payment", "entity_id": "pay_1", "public_ref": "PAY-1001"},
  "actor": {"actor_type": "provider", "actor_id": "provider_x"},
  "payload": {
    "payment_id": "pay_1",
    "order_id": "ord_1",
    "status": "mismatch",
    "previous_status": "pending_confirmation",
    "mismatch_type": "amount_mismatch",
    "expected_amount": "1000.00",
    "received_amount": "950.00",
    "currency": "EUR"
  },
  "meta": {"provider_delivery_id": "cb_100"}
}
```

## 37. Anti-patterns to avoid

- treating raw provider payloads as enterprise-wide canonical events;
- emitting snapshot dumps as fake domain events on every read;
- reusing one generic `entity.updated` event for materially different business facts;
- coupling analytics-only events to operational decision logic;
- omitting correlation IDs on financially or operationally significant flows;
- changing payload meaning without versioning.

## 38. QA and implementation checks

### Need to validate

- every critical state transition has a corresponding canonical event;
- event names and payloads map cleanly to enum/state dictionary and API commands;
- replay and duplicate delivery do not create double-processing;
- sensitive payload fields are not over-shared to broad consumers;
- provider callbacks normalize into internal canonical families consistently;
- registry documentation stays synchronized with production emission.

## 39. Recommended follow-up artifacts

На базе этого документа рекомендуется создать:

- machine-readable schema registry catalog;
- event-to-command mapping sheet;
- event-to-analytics metric mapping table;
- provider callback normalization matrix;
- replay and deduplication test suite;
- consumer access classification matrix.

## 40. Related documents

Использовать вместе с:

- `visual-erd-and-enum-state-dictionary.md`
- `api-resource-boundaries-and-contract-spec.md`
- `canonical-erd-and-field-dictionary-spec.md`
- `observability-and-audit-spec.md`
- `analytics-and-reporting-spec.md`
- `reconciliation-and-ledger-spec.md`
- `field-level-sensitivity-and-masking-matrix.md`