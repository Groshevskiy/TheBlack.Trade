## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Product + Backend + Data Architecture
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `canonical-erd-and-field-dictionary-spec.md`
  - `field-dictionary-and-sensitive-data-classification-matrix.md`
  - `api-resource-boundaries-and-contract-spec.md`
- Related documents:
  - `visual-erd-and-canonical-relationship-map.md`
  - `reconciliation-and-ledger-spec.md`
  - `canonical-documentation-governance-spec.md`

# Data Model Canonical Entities Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ фиксирует canonical data model платформы TheBlack.Trade на уровне ключевых бизнес-сущностей, их ответственности, связей и границ. Он нужен для выравнивания product, backend, Directus, admin console, analytics, risk, reconciliation, documents/notifications и audit слоев вокруг единого набора entities и shared vocabulary.

Документ предназначен для product, backend, frontend, Directus integrators, analytics, compliance, finance, support и operations.

## 2. Цели документа

Canonical data model должен обеспечивать:

- единое понимание основных бизнес-сущностей;
- ясные boundaries между похожими объектами;
- согласованность state machines, workflows и admin workspaces;
- предсказуемую основу для APIs, storage, analytics и audit;
- traceability между customer, order, payment, payout, wallet, document и incident контекстами.

## 3. Scope

Документ покрывает:

- canonical entities;
- entity responsibilities;
- entity relationships;
- identity and reference model;
- lifecycle and mutability expectations;
- derived vs source-of-truth distinctions;
- modeling guardrails.

## 4. Core modeling principles

1. **Each entity must have one primary business purpose.**
2. **Statuses belong to the entity that truly owns the lifecycle.**
3. **Derived views must not become accidental source-of-truth records.**
4. **Cross-domain traceability is a first-class requirement.**
5. **Auditability and explainability matter as much as raw normalization.**
6. **Model for operations and investigation, not only for happy-path CRUD.**

## 5. Canonical entity inventory

Рекомендуемый минимальный набор canonical entities:

- Customer
- CustomerProfile
- KYCApplication
- Order
- QuoteSnapshot
- Payment
- Payout
- WalletOrRequisite
- Document
- Notification
- ReviewTask / QueueItem
- ComplianceHold
- ReconciliationCase
- Incident
- AuditEvent
- InternalNote
- ProviderInteraction
- Attachment / EvidenceArtifact

Дополнительно могут существовать технические или integration-specific tables, но они не должны размывать canonical layer.

## 6. Entity grouping by domain

| Domain | Canonical entities |
|---|---|
| Customer identity | Customer, CustomerProfile, KYCApplication |
| Trading / transaction flow | QuoteSnapshot, Order, Payment, Payout |
| Destination and verification | WalletOrRequisite, Attachment / EvidenceArtifact |
| Communication and artifacts | Document, Notification, Attachment / EvidenceArtifact |
| Operations and review | ReviewTask / QueueItem, InternalNote, ComplianceHold |
| Financial integrity | ReconciliationCase, ProviderInteraction |
| Reliability and governance | Incident, AuditEvent |

## 7. Identity and reference principles

Каждая canonical entity должна иметь:

- stable internal identifier;
- optional public/business reference where needed;
- created_at and updated_at timestamps;
- actor/owner linkage where relevant;
- soft-delete or archival semantics if applicable.

### Additional principles

- internal IDs не должны переиспользоваться;
- public references должны быть безопасны для customer/support exposure where needed;
- linked entities должны использовать stable references, а не ambiguous text fields.

## 8. Customer entity

### Purpose

Customer представляет уникального пользователя/клиента платформы как главную identity anchor across domains.

### Owns

- customer identity key;
- account-level status or eligibility flags at high level;
- linkage to profile, KYC, orders, wallets/requisites, notes, holds and communications.

### Does not own

- detailed KYC workflow state;
- order lifecycle;
- payout/payment execution state.

## 9. CustomerProfile entity

### Purpose

CustomerProfile хранит profile-level данные клиента, которые не должны смешиваться с transactional records.

### Typical contents

- display / legal name fields as policy allows;
- contact fields;
- locale/country metadata where applicable;
- profile preferences or support-relevant metadata;
- risk-relevant profile change history linkage.

### Notes

Profile snapshotting strategy should be explicit where downstream evidence depends on historical values.

## 10. KYCApplication entity

### Purpose

KYCApplication представляет отдельную verification/remediation attempt or case, а не просто флаг на customer.

### Owns

- KYC lifecycle state;
- submission timestamps;
- decision outcome;
- reviewer linkage;
- remediation cycles;
- linkage to evidence artifacts.

### Relationships

- one customer can have multiple KYC applications over time;
- one KYC application can have many evidence artifacts and notes.

## 11. QuoteSnapshot entity

### Purpose

QuoteSnapshot фиксирует коммерческий/расчетный контекст, на основании которого пользователь принимает решение продолжить flow.

### Owns

- quoted direction (buy/sell);
- asset/network/payment method context;
- amount/rate snapshot;
- fee/estimate context;
- validity window.

### Notes

QuoteSnapshot should be immutable after issuance except for metadata that does not alter economic meaning.

## 12. Order entity

### Purpose

Order — центральная бизнес-сущность, представляющая customer intention to execute a trade flow under a specific business context.

### Owns

- order lifecycle state;
- link to customer;
- link to quote snapshot if applicable;
- high-level business direction (buy/sell);
- operational prerequisites and completion milestones;
- links to payment, payout, holds, documents, notifications and reconciliation cases.

### Does not own

- detailed provider callbacks;
- raw KYC evidence;
- notification delivery mechanics.

## 13. Payment entity

### Purpose

Payment представляет inbound money or proof-of-payment context, относящийся к order или другому sanctioned business flow.

### Owns

- payment state;
- expected vs received amount model;
- provider reference(s) where relevant;
- evidence linkage;
- review outcome;
- reconciliation-relevant attributes.

### Notes

One order may have zero, one or multiple payment records depending on flow design and correction patterns.

## 14. Payout entity

### Purpose

Payout представляет outbound release / settlement / transfer leg, связанный с order completion или customer obligation.

### Owns

- payout state;
- destination linkage;
- provider/manual execution references;
- hold/release milestones;
- finance/reconciliation hooks.

### Notes

Payout should be modeled separately from Order even if some flows make it appear as a final order step.

## 15. WalletOrRequisite entity

### Purpose

WalletOrRequisite представляет destination/source details, используемые для inbound/outbound legs и требующие отдельной verification policy.

### Owns

- type (wallet/bank/requisite/etc.);
- normalized identifying fields;
- verification state;
- customer ownership/linkage;
- change history linkage;
- allowed-use context if needed.

### Notes

This entity should exist independently from a single order to support reuse and review lineage where policy permits.

## 16. Document entity

### Purpose

Document представляет business-generated artifact, например receipt, confirmation or formal customer-facing record.

### Owns

- document type;
- generation state;
- version/reissue lineage;
- target business entity linkage;
- delivery or access summary.

### Does not own

- notification transport state;
- full audit history outside document scope.

## 17. Notification entity

### Purpose

Notification представляет attempted or completed business communication event across channels.

### Owns

- event type;
- channel;
- template/version reference;
- recipient abstraction;
- delivery state;
- retry/suppression history;
- business entity linkage.

### Notes

Notification should remain separate from Document because not every notification includes a document, and not every document implies a delivered notification.

## 18. ReviewTask / QueueItem entity

### Purpose

ReviewTask or QueueItem представляет единицу operational work, а не основную business entity.

### Owns

- queue type;
- task status;
- assignee / assignment state;
- priority/severity;
- due/SLA context;
- target entity linkage.

### Notes

This entity should reference order/payment/payout/KYC/etc., but not replace their lifecycle ownership.

## 19. ComplianceHold entity

### Purpose

ComplianceHold представляет ограничение или stop-condition, мешающий дальнейшему progression until explicitly resolved.

### Owns

- hold category;
- scope (customer/order/payment/payout/etc.);
- reason summary;
- opened/closed timestamps;
- owner/reviewer;
- resolution linkage.

### Notes

Holds should be modeled as explicit objects, not only as hidden status flags buried inside other records.

## 20. ReconciliationCase entity

### Purpose

ReconciliationCase представляет финансовую или record-consistency проблему, требующую investigation and explicit closure.

### Owns

- discrepancy type;
- open/resolved state;
- affected records linkage;
- investigation findings;
- resolution summary;
- finance ownership.

### Notes

A reconciliation issue should not be represented only as a boolean mismatch flag on payment or payout.

## 21. Incident entity

### Purpose

Incident представляет systemic degradation, provider instability or platform issue that may affect operations and customer outcomes.

### Owns

- incident severity/state;
- affected domains/providers;
- start/end timeline;
- mitigation and communication markers;
- linked operational impact.

### Notes

Incident is not the same as a support ticket or reconciliation issue, though it may link to both.

## 22. AuditEvent entity

### Purpose

AuditEvent представляет immutable-or-protected historical trace of sensitive or meaningful system/user/operator action.

### Owns

- actor;
- action type;
- target object reference;
- timestamp;
- pre/post context where appropriate;
- trace/correlation identifiers.

### Notes

AuditEvent should remain append-oriented and not be treated as mutable business state.

## 23. InternalNote entity

### Purpose

InternalNote хранит operational/compliance/support collaboration context that does not belong inside status fields.

### Owns

- author;
- note type/tag;
- visibility scope;
- target entity reference;
- timestamp;
- content body or structured payload.

### Notes

Notes may reference decisions, but should not replace formal decision records or audit events.

## 24. ProviderInteraction entity

### Purpose

ProviderInteraction captures exchange with external providers: callbacks, polling responses, submission attempts, status payload snapshots or failures.

### Owns

- provider identity;
- interaction type;
- request/response metadata;
- timestamps;
- correlation IDs;
- linkage to payment/payout/KYC/document flow as relevant.

### Notes

This separates provider transport/integration history from canonical business state.

## 25. Attachment / EvidenceArtifact entity

### Purpose

Attachment or EvidenceArtifact stores files or evidence objects used in KYC, payments, payouts, support or compliance investigations.

### Owns

- artifact type;
- storage reference;
- target entity linkage;
- upload/source metadata;
- verification/review relevance;
- integrity/hash metadata if required.

### Notes

Artifacts should be reusable across review processes without duplicating the binary for every linked record.

## 26. Relationship summary

Recommended high-level relationships:

- Customer 1→many Orders
- Customer 1→many WalletOrRequisites
- Customer 1→many KYCApplications
- Order 0→many Payments
- Order 0→many Payouts
- Order 0→many Documents
- Order 0→many Notifications
- Order 0→many ReviewTasks
- Order 0→many ComplianceHolds
- Payment/Payout/KYCApplication 0→many ProviderInteractions
- Multiple entities 0→many InternalNotes
- Multiple entities 0→many EvidenceArtifacts
- Multiple entities 0→many AuditEvents
- Multiple entities 0→many ReconciliationCases where policy allows scoped linkage

## 27. Source-of-truth rules

### Canonical ownership examples

- order status belongs to Order;
- payment review result belongs to Payment;
- payout release state belongs to Payout;
- KYC decision belongs to KYCApplication;
- queue assignment belongs to ReviewTask / QueueItem;
- communication delivery result belongs to Notification;
- discrepancy resolution belongs to ReconciliationCase.

### Anti-patterns to avoid

- storing the same lifecycle status independently in many tables;
- making dashboards or admin projections the source of record;
- encoding complex holds only as free-text comments.

## 28. Mutability and history principles

Entities have different mutability profiles.

### Examples

- QuoteSnapshot should be mostly immutable;
- Order/Payment/Payout state may evolve, but with history trace;
- AuditEvent should be append-only;
- Document may produce version lineage rather than silent overwrite;
- WalletOrRequisite may support verified changes through explicit history.

## 29. Canonical timestamps and metadata

Рекомендуется стандартизировать минимум:

- created_at;
- updated_at;
- created_by where applicable;
- last_state_changed_at where lifecycle matters;
- archived_at if archival policy applies;
- resolved_at/closed_at where issue-like entities exist.

## 30. Soft delete, archival and visibility

Canonical model должен заранее учитывать retention/archival policy.

### Principles

- archival is preferred over silent disappearance for core business records;
- soft delete should be heavily restricted for core entities;
- visibility flags should not replace real lifecycle semantics;
- archived records should preserve stable identity and relationships.

## 31. Derived and projection models

Поверх canonical entities допустимы derived read models:

- admin summary cards;
- queue projections;
- analytics aggregates;
- customer timeline views;
- support-safe projections.

### Principle

Derived models могут объединять и оптимизировать данные, но не должны становиться hidden source-of-truth.

## 32. Directus and implementation guidance

Если Directus используется как content/admin layer, canonical entities должны быть mapped carefully:

- not every Directus collection is automatically a canonical entity;
- some canonical entities may require service-backed logic beyond generic CRUD;
- relational naming should align with business vocabulary;
- permissions and admin IA should follow canonical ownership boundaries.

## 33. Recommended follow-up artifacts

На базе этого spec рекомендуется создать:

- entity-field dictionary;
- canonical ERD;
- lifecycle ownership matrix;
- event-to-entity mapping;
- admin projection/read-model spec;
- API resource boundary spec.

## 34. Related documents

Использовать вместе с:

- `theblack-trade-order-state-machine-spec.md`
- `transaction-status-state-machine-spec.md`
- `admin-console-ia-and-workspace-spec.md`
- `analytics-and-reporting-spec.md`
- `fraud-signals-and-risk-rules-spec.md`
- `data-retention-and-archival-spec.md`
- `observability-and-audit-spec.md`
- `reconciliation-and-ledger-spec.md`