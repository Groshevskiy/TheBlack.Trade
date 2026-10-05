## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Data Architecture + Backend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `data-model-canonical-entities-spec.md`
- Related documents:
  - `visual-erd-and-canonical-relationship-map.md`
  - `field-dictionary-and-sensitive-data-classification-matrix.md`
  - `data-migration-and-backfill-strategy-spec.md`

# Canonical ERD & Field Dictionary Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ разворачивает canonical entity model TheBlack.Trade в прикладной schema-level specification. Он описывает основные relationships между сущностями, рекомендуемые key fields, ownership of status fields, audit metadata, enum guidance и implementation boundaries между Directus-managed collections, service-owned records и derived projections.

Документ предназначен для backend, frontend, Directus integrators, product, analytics, compliance, operations и QA.

## 2. Цели документа

Canonical ERD & field dictionary должен обеспечивать:

- единое понимание структуры core data model;
- стандартизацию ключевых полей и naming patterns;
- ясность foreign-key and linkage strategy;
- согласованность status ownership и audit metadata;
- основу для API contracts, admin UI mapping, analytics mapping и migration planning.

## 3. Scope

Документ покрывает:

- high-level ERD description;
- core entity field dictionary;
- key relationships and cardinality expectations;
- enum/status field ownership;
- audit and archival field conventions;
- implementation guidance and anti-patterns.

## 4. Modeling conventions

### Identifier conventions

- `id` — stable internal UUID-like primary identifier;
- `public_ref` — optional customer/support-safe business reference;
- `external_ref` — provider or external system reference where applicable.

### Timestamp conventions

- `created_at` — record creation timestamp;
- `updated_at` — last material update timestamp;
- `last_state_changed_at` — lifecycle state transition timestamp where relevant;
- `archived_at` — archive marker timestamp if archival applies;
- `resolved_at` / `closed_at` — closure timestamp for issue/case-like entities.

### Actor conventions

- `created_by` — actor or system creator reference where appropriate;
- `assigned_to` — current human owner for task/case entities;
- `reviewed_by` / `resolved_by` — decision owner references where applicable.

## 5. High-level ERD summary

Recommended relationship overview:

- Customer 1→1 CustomerProfile
- Customer 1→many KYCApplications
- Customer 1→many Orders
- Customer 1→many WalletOrRequisites
- Order 0→1 QuoteSnapshot
- Order 0→many Payments
- Order 0→many Payouts
- Order 0→many Documents
- Order 0→many Notifications
- Order 0→many ReviewTasks
- Order 0→many ComplianceHolds
- Order 0→many InternalNotes
- Order 0→many AuditEvents
- Payment/Payout/KYCApplication 0→many ProviderInteractions
- Payment/Payout/KYCApplication/WalletOrRequisite 0→many EvidenceArtifacts
- ReconciliationCase many↔many with relevant financial/business entities via scoped links
- Incident 0→many linked impacted entities or provider paths

## 6. Core entity matrix

| Entity | Primary purpose | Primary status owner | Typical parent/root |
|---|---|---|---|
| Customer | Identity anchor | Customer-level eligibility flags | None |
| CustomerProfile | Profile attributes | No major workflow status | Customer |
| KYCApplication | Verification case | KYC application status | Customer |
| QuoteSnapshot | Commercial quote context | Quote validity status if needed | Order or pre-order flow |
| Order | Main trade lifecycle | Order status | Customer |
| Payment | Inbound payment leg | Payment status | Order |
| Payout | Outbound transfer leg | Payout status | Order |
| WalletOrRequisite | Destination/source data | Verification status | Customer |
| Document | Generated artifact | Generation/delivery summary | Order or Customer |
| Notification | Communication event | Delivery status | Order or Customer |
| ReviewTask | Operational work item | Task status | Target entity |
| ComplianceHold | Restriction object | Hold status | Scoped target |
| ReconciliationCase | Financial discrepancy case | Case status | Linked entity set |
| Incident | System/provider issue | Incident status | None |
| AuditEvent | Sensitive action trace | Append-only | Target entity |
| InternalNote | Collaboration context | No core lifecycle status | Target entity |
| ProviderInteraction | External exchange trace | Interaction outcome | Target entity |
| EvidenceArtifact | Uploaded/generated evidence | Validation/review relevance | Target entity |

## 7. Customer fields

### Required core fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | Canonical PK |
| `public_ref` | string | Recommended | Support-safe reference |
| `account_status` | enum | Yes | High-level eligibility/account state |
| `risk_level` | enum | Optional | Derived/high-level internal indicator |
| `created_at` | timestamp | Yes | Standard metadata |
| `updated_at` | timestamp | Yes | Standard metadata |
| `archived_at` | timestamp | Optional | For archival policy |

### Recommended links

- `profile_id` if 1→1 modeled directly;
- reverse relations to KYC, orders, wallets, holds, notes and notifications.

## 8. CustomerProfile fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `customer_id` | FK | Yes | 1→1 link to Customer |
| `legal_name` | string | Policy-based | Sensitive |
| `display_name` | string | Optional | Support/admin convenience |
| `email` | string | Optional | Contact field |
| `phone` | string | Optional | Contact field |
| `country_code` | string | Optional | ISO-style country metadata |
| `locale` | string | Optional | UX/reporting use |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |

## 9. KYCApplication fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `customer_id` | FK | Yes | Parent customer |
| `status` | enum | Yes | Canonical KYC lifecycle status |
| `submission_type` | enum | Optional | Initial/remediation/etc. |
| `provider_name` | string | Optional | External verification provider |
| `decision_reason_code` | enum/string | Optional | Approval/rejection rationale |
| `submitted_at` | timestamp | Optional | Submission milestone |
| `reviewed_by` | actor ref | Optional | Human reviewer |
| `resolved_at` | timestamp | Optional | Final decision time |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |

## 10. QuoteSnapshot fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `direction` | enum | Yes | Buy/sell |
| `asset_code` | string | Yes | Asset identifier |
| `network_code` | string | Optional | Blockchain/network |
| `payment_method_code` | string | Optional | Method context |
| `amount_in` | decimal | Yes | Input amount |
| `amount_out_estimate` | decimal | Yes | Estimated output |
| `rate_value` | decimal | Yes | Price/rate snapshot |
| `fee_snapshot` | JSON/structured | Optional | Fee details |
| `valid_until` | timestamp | Optional | Expiry |
| `created_at` | timestamp | Yes | Metadata |

## 11. Order fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `public_ref` | string | Recommended | Customer/support-safe ref |
| `customer_id` | FK | Yes | Root owner |
| `quote_snapshot_id` | FK | Optional | Link to quote context |
| `status` | enum | Yes | Canonical order lifecycle state |
| `direction` | enum | Yes | Buy/sell |
| `asset_code` | string | Yes | Asset |
| `network_code` | string | Optional | Network context |
| `amount_requested` | decimal | Yes | User-requested amount |
| `amount_finalized` | decimal | Optional | Final settled/completed amount |
| `payment_method_code` | string | Optional | Payment context |
| `customer_status_projection` | enum/string | Optional | Read model field, not source of truth |
| `opened_at` | timestamp | Optional | Business start |
| `completed_at` | timestamp | Optional | Completion milestone |
| `last_state_changed_at` | timestamp | Yes | Status history anchor |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |
| `archived_at` | timestamp | Optional | Retention support |

## 12. Payment fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `order_id` | FK | Yes | Parent order |
| `public_ref` | string | Optional | Support/internal reference |
| `status` | enum | Yes | Canonical payment state |
| `provider_name` | string | Optional | Payment provider |
| `external_ref` | string | Optional | Provider reference |
| `expected_amount` | decimal | Optional | Planned inbound amount |
| `received_amount` | decimal | Optional | Actual/claimed amount |
| `currency_code` | string | Yes | Fiat/asset code per flow |
| `evidence_required` | boolean | Optional | Review hint |
| `review_result_code` | enum/string | Optional | Approval/rejection/request-more-info |
| `received_at` | timestamp | Optional | Payment arrival/evidence milestone |
| `last_state_changed_at` | timestamp | Yes | Transition metadata |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |

## 13. Payout fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `order_id` | FK | Yes | Parent order |
| `wallet_or_requisite_id` | FK | Optional | Destination |
| `status` | enum | Yes | Canonical payout state |
| `provider_name` | string | Optional | Payout/exchange provider |
| `external_ref` | string | Optional | Provider ref |
| `amount` | decimal | Yes | Outbound amount |
| `asset_code` | string | Yes | Asset or settlement currency |
| `network_code` | string | Optional | Network |
| `hold_reason_code` | enum/string | Optional | Current hold context |
| `released_at` | timestamp | Optional | Release milestone |
| `completed_at` | timestamp | Optional | Success milestone |
| `last_state_changed_at` | timestamp | Yes | Transition metadata |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |

## 14. WalletOrRequisite fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `customer_id` | FK | Yes | Owner |
| `type` | enum | Yes | Wallet/bank/requisite/etc. |
| `status` | enum | Yes | Verification state |
| `asset_code` | string | Optional | Relevant for crypto |
| `network_code` | string | Optional | Relevant for crypto |
| `normalized_value` | string | Yes | Canonical address/account value |
| `masked_value` | string | Recommended | UI-safe display |
| `label` | string | Optional | Customer/admin label |
| `verified_at` | timestamp | Optional | Verification milestone |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |
| `archived_at` | timestamp | Optional | Retention support |

## 15. Document fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `target_entity_type` | enum/string | Yes | Order/customer/etc. |
| `target_entity_id` | FK-like | Yes | Scoped link |
| `document_type` | enum | Yes | Receipt/confirmation/etc. |
| `status` | enum | Yes | Generation/delivery summary |
| `version_no` | integer | Optional | Reissue lineage |
| `storage_ref` | string | Optional | Blob/object reference |
| `generated_at` | timestamp | Optional | Generation milestone |
| `delivered_at` | timestamp | Optional | Access/send milestone |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |

## 16. Notification fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `target_entity_type` | enum/string | Yes | Order/customer/etc. |
| `target_entity_id` | FK-like | Yes | Scoped link |
| `event_type` | enum/string | Yes | Business event trigger |
| `channel` | enum | Yes | Email/SMS/etc. |
| `template_key` | string | Optional | Template/version family |
| `status` | enum | Yes | Delivery state |
| `recipient_ref` | string | Optional | Masked/abstracted recipient |
| `suppression_reason_code` | enum/string | Optional | Incident/policy suppression |
| `sent_at` | timestamp | Optional | Send milestone |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |

## 17. ReviewTask fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `queue_type` | enum | Yes | Payment review/KYC/etc. |
| `target_entity_type` | enum/string | Yes | Order/payment/payout/etc. |
| `target_entity_id` | FK-like | Yes | Scoped target |
| `status` | enum | Yes | Task lifecycle |
| `priority` | enum | Optional | Normal/high/critical |
| `assigned_to` | actor ref | Optional | Current owner |
| `sla_due_at` | timestamp | Optional | Review SLA marker |
| `opened_at` | timestamp | Optional | Queue entry time |
| `closed_at` | timestamp | Optional | Task closure |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |

## 18. ComplianceHold fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `target_entity_type` | enum/string | Yes | Customer/order/payment/payout |
| `target_entity_id` | FK-like | Yes | Scoped target |
| `status` | enum | Yes | Open/closed/etc. |
| `hold_type` | enum/string | Yes | Compliance/risk/finance/etc. |
| `reason_code` | enum/string | Optional | Controlled rationale |
| `opened_by` | actor ref | Optional | Creator |
| `assigned_to` | actor ref | Optional | Current reviewer |
| `opened_at` | timestamp | Yes | Start |
| `closed_at` | timestamp | Optional | Resolution |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |

## 19. ReconciliationCase fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `public_ref` | string | Optional | Internal case reference |
| `status` | enum | Yes | Open/investigating/resolved |
| `case_type` | enum/string | Yes | Mismatch/missing/ref duplication/etc. |
| `severity` | enum | Optional | Operational importance |
| `assigned_to` | actor ref | Optional | Finance owner |
| `resolution_code` | enum/string | Optional | Controlled close reason |
| `opened_at` | timestamp | Yes | Start |
| `resolved_at` | timestamp | Optional | Closure |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |

### Link table recommendation

Use a scoped link table such as `reconciliation_case_links` with:

- `id`
- `reconciliation_case_id`
- `entity_type`
- `entity_id`
- `link_role` (subject, impacted, evidence, related)

## 20. Incident fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `public_ref` | string | Recommended | Human-readable incident ref |
| `status` | enum | Yes | Open/mitigating/resolved/etc. |
| `severity` | enum | Yes | Sev level |
| `title` | string | Yes | Short summary |
| `affected_domain` | enum/string | Optional | Payments/payouts/docs/etc. |
| `provider_name` | string | Optional | External dependency if relevant |
| `owner_id` | actor ref | Optional | Incident lead |
| `started_at` | timestamp | Yes | Incident start |
| `resolved_at` | timestamp | Optional | Recovery completion |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Yes | Metadata |

## 21. AuditEvent fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `actor_type` | enum | Yes | User/operator/system/provider |
| `actor_id` | string | Optional | Scoped actor identifier |
| `action_type` | enum/string | Yes | Canonical action |
| `target_entity_type` | enum/string | Yes | Object class |
| `target_entity_id` | FK-like | Yes | Object id |
| `trace_id` | string | Optional | Correlation |
| `context_payload` | JSON | Optional | Pre/post or relevant metadata |
| `created_at` | timestamp | Yes | Event time |

## 22. InternalNote fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `target_entity_type` | enum/string | Yes | Scoped target |
| `target_entity_id` | FK-like | Yes | Scoped target id |
| `author_id` | actor ref | Yes | Note author |
| `note_type` | enum/string | Optional | Handoff/investigation/escalation |
| `visibility_scope` | enum | Optional | Ops/compliance/support/etc. |
| `body` | text | Yes | Content |
| `created_at` | timestamp | Yes | Metadata |
| `updated_at` | timestamp | Optional | If editable |

## 23. ProviderInteraction fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `target_entity_type` | enum/string | Yes | Payment/payout/KYC/etc. |
| `target_entity_id` | FK-like | Yes | Scoped target |
| `provider_name` | string | Yes | Provider identity |
| `interaction_type` | enum/string | Yes | Submit/callback/poll/error |
| `external_ref` | string | Optional | Provider correlation |
| `request_payload_ref` | string | Optional | Stored payload pointer |
| `response_payload_ref` | string | Optional | Stored payload pointer |
| `result_code` | enum/string | Optional | Outcome class |
| `occurred_at` | timestamp | Yes | Event time |
| `created_at` | timestamp | Yes | Metadata |

## 24. EvidenceArtifact fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID/string | Yes | PK |
| `target_entity_type` | enum/string | Yes | KYC/payment/payout/wallet |
| `target_entity_id` | FK-like | Yes | Scoped target |
| `artifact_type` | enum/string | Yes | Document/screenshot/proof/etc. |
| `storage_ref` | string | Yes | Object storage pointer |
| `mime_type` | string | Optional | File type |
| `hash_value` | string | Optional | Integrity field |
| `uploaded_by` | actor ref | Optional | Customer/operator/system |
| `created_at` | timestamp | Yes | Metadata |
| `archived_at` | timestamp | Optional | Retention support |

## 25. Enum ownership guidance

### Canonical status owners

- `order.status` — only Order owns order lifecycle;
- `payment.status` — only Payment owns inbound payment lifecycle;
- `payout.status` — only Payout owns outbound lifecycle;
- `kyc_application.status` — only KYCApplication owns verification state;
- `review_task.status` — only ReviewTask owns queue work state;
- `compliance_hold.status` — only ComplianceHold owns hold lifecycle;
- `notification.status` — only Notification owns delivery lifecycle;
- `incident.status` — only Incident owns incident lifecycle.

### Anti-patterns

- duplicating the same lifecycle enum onto parent and child entities;
- storing “effective status” manually when it should be derived;
- mixing customer-facing message labels with canonical machine statuses.

## 26. Relationship implementation guidance

### Prefer direct FKs when

- parent/child ownership is clear, for example order → payment.

### Prefer polymorphic/scoped links when

- many different target entity types need shared objects, for example notes, notifications, audit events or evidence.

### Prefer explicit join tables when

- many↔many semantics carry business meaning, for example reconciliation links or incident impact links.

## 27. Indexing and query hints

Recommended indexing patterns:

- PK on every `id`;
- indexes on all parent FKs (`customer_id`, `order_id`, etc.);
- indexes on `public_ref` where lookup is expected;
- composite indexes for frequent queue access patterns, for example `(status, assigned_to)` or `(queue_type, status, priority)`;
- timestamp indexes for aging/SLA/reporting patterns;
- provider/external ref indexes where support and reconciliation search is common.

## 28. Soft delete, archival and retention fields

For core entities, prefer archival metadata over hard delete semantics.

### Recommended fields where applicable

- `archived_at`;
- `archive_reason_code`;
- `retention_hold_flag` or legal-hold linkage in governed domains.

### Principle

Do not overload `is_deleted` flags where lifecycle meaning is richer than simple hide/show logic.

## 29. Directus mapping guidance

Если сущность реализуется в Directus, важно различать:

- canonical business entity;
- Directus collection representation;
- derived admin projection;
- integration log storage.

### Practical guidance

- collections should use business names aligned with canonical entities;
- service-owned state transitions should not rely solely on generic CMS editing;
- permissions should follow entity sensitivity and ownership model;
- highly sensitive payload refs may live outside broadly accessible collections.

## 30. Validation and QA implications

Field dictionary должен поддерживать QA and migration readiness.

### Need to validate

- required vs optional field discipline;
- correct FK/link behavior;
- status ownership consistency;
- archive/legal-hold field behavior;
- admin/search/reporting usability of refs and timestamps;
- compatibility with analytics, audit and reconciliation use cases.

## 31. Recommended follow-up artifacts

На базе этого spec рекомендуется создать:

- visual ERD diagram;
- enum catalog and state dictionary;
- API contract matrix by entity;
- Directus collection mapping sheet;
- field-level sensitivity and masking matrix;
- migration plan for legacy or interim records.

## 32. Related documents

Использовать вместе с:

- `data-model-canonical-entities-spec.md`
- `theblack-trade-order-state-machine-spec.md`
- `transaction-status-state-machine-spec.md`
- `admin-console-ia-and-workspace-spec.md`
- `analytics-and-reporting-spec.md`
- `data-retention-and-archival-spec.md`
- `fraud-signals-and-risk-rules-spec.md`
- `observability-and-audit-spec.md`