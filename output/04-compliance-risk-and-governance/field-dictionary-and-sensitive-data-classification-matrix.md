# Field Dictionary & Sensitive Data Classification Matrix — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Security + Compliance + Data Governance
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `data-model-canonical-entities-spec.md`
  - `canonical-erd-and-field-dictionary-spec.md`
- Related documents:
  - `field-level-sensitivity-and-masking-matrix.md`
  - `data-retention-and-archival-spec.md`
  - `contract-test-matrix.md`

## 1. Purpose

This document defines a canonical field dictionary and sensitive-data classification matrix for TheBlack.Trade. It provides a shared reference for the primary fields used in core business, governance, compliance, artifact and observability entities, including purpose, source-of-truth ownership, data type, sensitivity class, visibility expectations and downstream handling.

It is designed to align product, backend, frontend, data, security, compliance, operations, QA and audit teams around a single interpretation of what each significant field means and how it must be handled.

## 2. Goals

The matrix must:

- define canonical fields for high-value platform entities;
- identify owning domains and source-of-truth responsibilities;
- classify fields using the shared data-class scale;
- describe display, masking, export, archive and audit handling;
- distinguish canonical business fields from derived/display-only fields;
- reduce data leakage, duplicate field semantics and integration ambiguity.

## 3. Non-goals

This document does not define:

- every physical database column or internal transient value;
- encryption/key-management implementation;
- provider-specific raw payload field dictionaries;
- full legal retention schedule for every jurisdiction.

## 4. Data classification scale

| Class | Handling posture | Typical examples |
|---|---|---|
| `a` | Internal, low sensitivity | technical IDs, non-sensitive state enums, timestamps |
| `b` | Business-confidential | operational metadata, internal notes without PII, amounts where exposure is limited |
| `c` | Sensitive | customer identifiers, transaction and destination details, review content, approval context |
| `d` | Highly sensitive | government identity data, full bank/payment credentials, cryptographic secrets, raw authenticator material |

### Rules

- a field’s class represents handling sensitivity, not business importance alone;
- a derived field cannot be classified lower if it reliably reveals a higher-class source;
- aggregations may be lower-class only after documented re-identification risk review.

## 5. Handling dimensions

Every field entry should consider the following dimensions:

| Dimension | Meaning |
|---|---|
| Owner | Canonical domain responsible for definition and lifecycle |
| Source type | User input, provider data, system generated, derived projection |
| API behavior | Visible, role-gated, redacted, omitted or command-only |
| UI behavior | Full, masked, summarized, hidden or reveal-gated |
| Export behavior | Allowed, restricted, approval-gated or prohibited |
| Archive behavior | Normal archive, restricted archive, immutable audit retention or exclusion |
| Audit behavior | Access/action audited where required |

## 6. Field dictionary conventions

### Naming

- use lower snake_case for logical field names;
- prefer stable business meaning over implementation-specific names;
- do not use ambiguous labels such as `details`, `meta`, `info` or generic `status` as canonical field definitions;
- state values should reference registered enum dictionaries.

### Required metadata for future expansion

Every production field dictionary entry should ultimately include:

- entity;
- field name;
- description;
- data type;
- owner;
- source type;
- required/optional;
- data class;
- API/UI behavior;
- export/archive/audit behavior;
- related enum or validation rule;
- deprecated/replacement indicator where relevant.

## 7. Shared cross-entity fields

| Field | Type | Owner | Class | Purpose and handling |
|---|---|---|---|---|
| `id` | opaque string/UUID | Owning domain | a | Immutable canonical identifier; generally visible where entity is visible |
| `external_ref` | string | Owning domain | b | External/business reference; display according to domain policy |
| `created_at` | timestamp | Owning domain | a | Creation audit timestamp |
| `updated_at` | timestamp | Owning domain | a | Last material update timestamp |
| `version` | integer/etag | Owning domain | a | Optimistic concurrency and stale-state protection |
| `correlation_id` | opaque string | Platform/governance | b | Cross-workflow trace reference; operationally visible to authorized roles |
| `state` | registered enum | Owning domain | a/b | Canonical lifecycle state; avoid generic meaning where specialized state field is available |
| `data_class` | enum | Data governance | a | Handling classification metadata |
| `retention_profile_id` | reference | Data governance | b | Links entity/artifact to retention policy |

## 8. Customer and identity fields

### Entity: `customer`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `customer_id` | opaque string | system generated | a | Canonical customer identifier; visible to authorized roles |
| `customer_type` | enum | user/system | b | Individual/business classification; role-visible |
| `lifecycle_state` | enum | system/workflow | b | Customer account lifecycle; operationally visible |
| `risk_segment` | enum | derived risk | c | Restricted to permitted risk/compliance roles; never broadly exported |
| `created_at` | timestamp | system | a | Standard audit field |
| `source_channel` | enum | system | b | Acquisition/origin metadata; reporting use subject to access scope |

### Entity: `customer_profile`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `legal_name` | string | user/provider | c | Mask or reveal-gate outside eligible roles; export restricted |
| `display_name` | string | user/system | b | Operational display label; may be partially masked in broad views |
| `date_of_birth` | date | user/provider | d | Restricted; masked by default; no broad export |
| `country_code` | ISO code | user/provider | c | Compliance-relevant; role-gated where combined with identity fields |
| `residency_status` | enum | user/provider | c | Compliance-sensitive; restricted export |
| `tax_identifier` | string | user/provider | d | Masked/restricted; audited reveal; no default export |

### Entity: `contact_point`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `contact_type` | enum | user/system | b | Email/phone/address type; visible as needed |
| `contact_value` | string | user/provider | c | Mask by default in broad views; reveal based on role/action |
| `verification_state` | enum | system/provider | b | Verification result; operationally visible |
| `is_primary` | boolean | system/user | b | Contact preference metadata |

## 9. Commercial order and pricing fields

### Entity: `trade_intent`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `trade_intent_id` | opaque string | system | a | Canonical identifier |
| `asset_pair` | enum/string | user/system | b | Requested conversion pair; normally operationally visible |
| `requested_side` | enum | user | b | Buy/sell direction |
| `requested_amount` | decimal | user | b | Amount; restricted in broad exports where customer linkage exists |
| `requested_currency` | currency code | user | b | Currency context |
| `intent_state` | enum | system | a | Lifecycle state |

### Entity: `quote`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `quote_id` | opaque string | system | a | Canonical identifier |
| `rate` | decimal | pricing system | b | Quoted rate; operational access controlled |
| `fee_amount` | decimal | pricing system | b | Fee calculation result |
| `expires_at` | timestamp | system | a | Quote validity boundary |
| `pricing_source_ref` | reference | system | b | Provider/internal source reference; restricted operational metadata |

### Entity: `order`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `order_id` | opaque string | system | a | Canonical order identifier |
| `customer_id` | reference | system | c | Customer linkage; limited in broad views/exports |
| `order_state` | enum | system | b | Canonical commercial lifecycle state |
| `fiat_amount` | decimal | derived/confirmed | b | Financial amount; access scoped by role/domain |
| `fiat_currency` | currency code | system | b | Financial currency context |
| `asset_amount` | decimal | derived/confirmed | b | Crypto asset quantity; sensitive in customer-linked contexts |
| `asset_code` | enum | system | b | Asset identifier |
| `quote_id` | reference | system | b | Pricing traceability link |
| `pricing_lock_id` | reference | system | b | Link to pricing lock |
| `completion_at` | timestamp | system | a | Commercial completion time |

### Entity: `pricing_lock`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `pricing_lock_id` | opaque string | system | a | Canonical identifier |
| `locked_rate` | decimal | pricing system | b | Locked commercial rate |
| `locked_at` | timestamp | system | a | Lock time |
| `expires_at` | timestamp | system | a | Lock validity boundary |
| `lock_reason` | enum | system | b | Workflow/pricing reason |

## 10. Payment and settlement fields

### Entity: `payment_intent`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `payment_intent_id` | opaque string | system | a | Canonical identifier |
| `order_id` | reference | system | b | Commercial linkage |
| `payer_customer_id` | reference | system | c | Customer linkage; restricted views |
| `expected_amount` | decimal | system | b | Expected inbound amount |
| `currency` | currency code | system | b | Expected currency |
| `payment_method_type` | enum | user/provider | c | Payment method metadata; restricted where sensitive |
| `payment_intent_state` | enum | system | b | Lifecycle state |
| `expires_at` | timestamp | system | a | Time boundary |

### Entity: `inbound_payment`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `inbound_payment_id` | opaque string | system | a | Canonical identifier |
| `payment_intent_id` | reference | system | b | Upstream intent link |
| `received_amount` | decimal | provider/system | b | Confirmed payment amount |
| `received_currency` | currency code | provider/system | b | Confirmed currency |
| `provider_payment_ref` | string | provider | c | Provider reference; restrict broad export |
| `payer_name` | string | provider | c | Sensitive payer identity; masked by default |
| `payment_state` | enum | system/provider mapping | b | Canonical state; raw provider state separate |
| `received_at` | timestamp | provider/system | a | Receipt timing |

### Entity: `settlement_reference`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `settlement_reference_id` | opaque string | system | a | Canonical identifier |
| `provider_ref` | string | provider | c | External settlement reference; restricted display/export |
| `settlement_state` | enum | system/provider mapping | b | Canonical settlement lifecycle |
| `settled_at` | timestamp | provider/system | a | Settlement timestamp |

## 11. Payout and destination fields

### Entity: `payout_request`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `payout_request_id` | opaque string | system | a | Canonical identifier |
| `order_id` | reference | system | b | Commercial linkage |
| `beneficiary_customer_id` | reference | system | c | Customer linkage; restricted |
| `requested_amount` | decimal | system/user | b | Requested outbound amount |
| `asset_code` | enum | system | b | Asset identifier |
| `destination_authorization_id` | reference | system | c | Destination linkage; restricted |
| `payout_state` | enum | system | b | Canonical payout lifecycle |
| `risk_context_ref` | reference | risk system | c | Restricted risk/compliance context link |
| `release_approval_id` | reference | governance | c | Approval linkage; role-gated |

### Entity: `destination_authorization`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `destination_authorization_id` | opaque string | system | a | Canonical identifier |
| `destination_type` | enum | user/provider | c | Bank/wallet destination category |
| `destination_value` | string | user/provider | d | Full account/wallet address; masked and reveal-gated |
| `destination_fingerprint` | string | system | c | Stable comparison fingerprint; never expose as secret substitute |
| `beneficiary_name` | string | user/provider | c | Masked outside eligible operations/compliance roles |
| `verification_state` | enum | system/provider | c | Destination verification state |

### Entity: `payout_execution`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `payout_execution_id` | opaque string | system | a | Canonical identifier |
| `payout_request_id` | reference | system | b | Parent payout request |
| `execution_state` | enum | system | b | Execution lifecycle |
| `provider_execution_ref` | string | provider | c | Provider reference; restricted export |
| `submitted_at` | timestamp | system/provider | a | Provider submission time |
| `completed_at` | timestamp | provider/system | a | Completion time |
| `failure_reason_category` | enum | system/provider mapping | b | Canonical failure category |

## 12. Wallet and ledger fields

### Entity: `wallet`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `wallet_id` | opaque string | system | a | Canonical identifier |
| `customer_id` | reference | system | c | Customer linkage |
| `wallet_type` | enum | system | b | Custody/operational type |
| `wallet_state` | enum | system | b | Lifecycle/availability state |
| `address` | string | provider/system | c | May be sensitive/traceable; mask according to policy |

### Entity: `asset_balance`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `asset_balance_id` | opaque string | system | a | Canonical identifier |
| `wallet_id` | reference | system | b | Parent wallet |
| `asset_code` | enum | system | b | Asset identifier |
| `available_amount` | decimal | ledger | b | Available balance |
| `reserved_amount` | decimal | ledger | b | Reserved balance |
| `as_of_at` | timestamp | ledger | a | Balance freshness |

### Entity: `ledger_entry`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `ledger_entry_id` | opaque string | ledger | a | Canonical financial trace identifier |
| `account_ref` | reference | ledger | c | Account linkage; restricted operational visibility |
| `entry_type` | enum | ledger | b | Debit/credit/fee/reserve type |
| `amount` | decimal | ledger | b | Accounting amount |
| `asset_code` | enum | ledger | b | Accounting currency/asset |
| `posted_at` | timestamp | ledger | a | Posting time |
| `source_entity_ref` | polymorphic reference | system | b | Link to source order/payment/payout/transfer |

## 13. Compliance and risk fields

### Entity: `compliance_case`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `compliance_case_id` | opaque string | system | a | Canonical identifier |
| `subject_type` | enum | system | b | Subject class |
| `subject_id` | reference | system | c | Sensitive subject linkage |
| `case_state` | enum | workflow | b | Case lifecycle |
| `risk_level` | enum | risk/compliance | c | Restricted to authorized risk/compliance roles |
| `case_reason_category` | enum | system/analyst | c | Restricted reason summary; no broad export |
| `assigned_team` | enum/reference | system | b | Routing metadata |
| `opened_at` | timestamp | system | a | Audit time |
| `closed_at` | timestamp | system | a | Closure time |

### Entity: `hold`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `hold_id` | opaque string | system | a | Canonical identifier |
| `hold_type` | enum | compliance/risk/ops | c | Regulatory/risk/ops hold category; restricted |
| `hold_state` | enum | workflow | b | Active/released/etc. lifecycle |
| `subject_type` | enum | system | b | Governed subject type |
| `subject_id` | reference | system | c | Governed subject reference |
| `reason_code` | enum | workflow | c | Safe coded rationale; role-gated |
| `expires_at` | timestamp | workflow | b | Hold expiry where applicable |
| `release_approval_id` | reference | governance | c | Approval trace link |

### Entity: `risk_alert`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `risk_alert_id` | opaque string | risk system | a | Canonical identifier |
| `alert_type` | enum | risk system | c | Restricted detection category |
| `severity_level` | enum | risk system | b | Operational severity |
| `subject_ref` | polymorphic reference | system | c | Sensitive subject linkage |
| `risk_score` | numeric | risk system | c | Restricted; never exposed broadly |
| `alert_state` | enum | workflow | b | Alert lifecycle |

### Entity: `screening_result`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `screening_result_id` | opaque string | provider/system | a | Canonical identifier |
| `screening_type` | enum | provider/system | c | KYC/AML/sanctions screening class |
| `outcome` | enum | provider/system mapping | c | Restricted result |
| `provider_case_ref` | string | provider | c | External provider reference |
| `matched_attributes_summary` | structured summary | provider/system | d | Highly sensitive; role-gated and restricted archive/export |

## 14. Governance and approval fields

### Entity: `approval_request`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `approval_request_id` | opaque string | system | a | Canonical identifier |
| `approval_state` | enum | workflow | b | Lifecycle state; broadly visible only within authorized scope |
| `action_family` | enum | policy/workflow | b | Governed action type |
| `subject_type` | enum | system | b | Governed object type |
| `subject_id` | reference | system | c | Sensitive object reference when linked to customer/finance record |
| `initiator_actor_id` | reference | system | c | Operator identity; restricted audit/ops visibility |
| `routing_key` | enum/string | system | b | Approval queue/routing metadata |
| `justification` | text | initiator | c | Restricted free text; export approval-gated |
| `policy_snapshot_ref` | reference | policy | b | Reproducibility link |
| `expires_at` | timestamp | workflow | b | Approval expiry |
| `resolved_tier` | enum | policy | b | Control tier context |

### Entity: `approval_decision`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `approval_decision_id` | opaque string | system | a | Canonical identifier |
| `approval_request_id` | reference | system | b | Parent workflow link |
| `approver_actor_id` | reference | system | c | Restricted operator identity |
| `decision` | enum | approver | b | Approve/reject/abstain/cancel |
| `decision_reason_code` | enum | approver/system | b | Coded decision rationale |
| `decision_note` | text | approver | c | Restricted free text |
| `decided_at` | timestamp | system | a | Decision audit time |

### Entity: `policy_snapshot`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `policy_snapshot_id` | opaque string | policy | a | Canonical identifier |
| `policy_version` | string | policy | b | Evaluated policy version |
| `matched_rule_ids` | array | policy | c | Rule trace; restricted where leakage risk exists |
| `required_controls` | structured object | policy | b | Step-up/approval/quorum requirements |
| `decision_context_summary` | structured summary | policy | c | Safe decision context; no hidden detection logic |

## 15. Documents, evidence, exports and archive fields

### Entity: `uploaded_document`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `uploaded_document_id` | opaque string | system | a | Canonical identifier |
| `document_type` | enum | user/system | c | Identity/evidence document category |
| `file_name` | string | user | c | May contain PII; mask in broad lists |
| `content_type` | string | system | b | MIME/type metadata |
| `storage_ref` | opaque reference | system | d | Internal storage location; never client-visible |
| `checksum` | string | system | c | Integrity metadata; role-restricted |
| `uploaded_at` | timestamp | system | a | Audit time |
| `document_state` | enum | workflow | b | Verification/availability lifecycle |

### Entity: `evidence_bundle`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `evidence_bundle_id` | opaque string | system | a | Canonical identifier |
| `bundle_purpose` | enum | system | c | Case/audit/review usage classification |
| `subject_ref` | polymorphic reference | system | c | Sensitive linkage |
| `included_document_ids` | array of references | system | c | Restricted evidence membership |
| `created_by_actor_id` | reference | system | c | Restricted audit identity |

### Entity: `export_artifact`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `export_artifact_id` | opaque string | system | a | Canonical identifier |
| `export_scope` | structured descriptor | user/system | c | Scope of data requested/exported |
| `data_class_max` | enum | system | b | Highest included classification |
| `artifact_state` | enum | job/system | b | Generation/access lifecycle |
| `download_url_ref` | opaque reference | system | d | Ephemeral retrieval reference; never broadly exposed |
| `expires_at` | timestamp | system | b | Retrieval expiry |
| `approval_request_id` | reference | governance | c | Required for governed export |

### Entity: `archive_manifest`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `archive_manifest_id` | opaque string | archive service | a | Canonical identifier |
| `archive_scope` | structured descriptor | system | c | What is archived |
| `storage_tier` | enum | archive service | b | Archive class/tier |
| `retention_profile_id` | reference | data governance | b | Retention policy link |
| `legal_hold_state` | enum | legal/governance | c | Restricted legal hold indicator |
| `archived_at` | timestamp | archive service | a | Archive timestamp |

## 16. Notification fields

### Entity: `notification_request`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `notification_request_id` | opaque string | system | a | Canonical identifier |
| `notification_type` | enum | system | b | Transactional/operational/compliance type |
| `recipient_ref` | reference | system | c | Recipient identity/contact reference |
| `template_id` | reference | system | b | Template linkage |
| `subject_entity_ref` | polymorphic reference | system | b/c | Business context reference |
| `request_state` | enum | system | b | Lifecycle state |
| `requested_at` | timestamp | system | a | Audit time |

### Entity: `notification_delivery_attempt`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `delivery_attempt_id` | opaque string | system | a | Canonical identifier |
| `notification_request_id` | reference | system | b | Parent notification link |
| `channel` | enum | system | b | Email/SMS/push/etc. channel |
| `delivery_state` | enum | provider/system | b | Canonical delivery outcome |
| `provider_message_ref` | string | provider | c | Provider trace reference |
| `attempted_at` | timestamp | system | a | Delivery timing |

## 17. Incident and operational fields

### Entity: `incident`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `incident_id` | opaque string | ops | a | Canonical identifier |
| `incident_state` | enum | ops workflow | b | Declared/active/contained/etc. |
| `severity_level` | enum | ops | b | Operational severity |
| `title` | string | ops | b | Safe incident heading |
| `summary` | text | ops | c | Restricted operational context |
| `started_at` | timestamp | ops | a | Incident timing |
| `resolved_at` | timestamp | ops | a | Resolution timing |
| `commander_actor_id` | reference | ops | c | Restricted responder identity |

### Entity: `incident_action`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `incident_action_id` | opaque string | ops | a | Canonical identifier |
| `incident_id` | reference | ops | b | Parent incident link |
| `action_type` | enum | ops | c | Emergency/config/remediation action class |
| `action_state` | enum | ops | b | Action workflow status |
| `approval_request_id` | reference | governance | c | Governance linkage |
| `execution_ref` | reference | system | c | Command/job linkage |
| `performed_at` | timestamp | ops | a | Audit timing |

## 18. Config and policy fields

### Entity: `policy_set`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `policy_set_id` | opaque string | policy | a | Canonical identifier |
| `policy_set_name` | string | policy | b | Administrative display name |
| `policy_version` | string | policy | b | Version identifier |
| `config_lifecycle_state` | enum | policy | b | Draft/active/etc. lifecycle |
| `owner_team` | enum/reference | policy | b | Governance accountability |

### Entity: `threshold_config`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `threshold_config_id` | opaque string | policy | a | Canonical identifier |
| `threshold_dimension` | enum | policy | b | Amount/velocity/data scope/etc. |
| `threshold_value` | decimal/structured | policy | c | Restricted policy parameter where disclosure can weaken controls |
| `comparison_operator` | enum | policy | b | Rule comparison semantics |
| `action_family` | enum | policy | b | Governed action class |
| `minimum_control_tier` | enum | policy | b | Baseline governance requirement |
| `config_lifecycle_state` | enum | policy | b | Draft/validated/active/etc. |
| `effective_from` | timestamp | policy | b | Activation time |

### Entity: `masking_policy`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `masking_policy_id` | opaque string | data governance | a | Canonical identifier |
| `field_selector` | structured rule | data governance | c | Field targeting rule; restricted config detail |
| `visibility_rule` | enum/structured rule | data governance | c | Role/context-based masking logic |
| `masking_strategy` | enum | data governance | b | Partial/full/tokenized/redacted strategy |
| `config_lifecycle_state` | enum | policy | b | Governed configuration lifecycle |

## 19. Governed event and audit fields

### Entity: `governed_event`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `event_id` | opaque string | producer | a | Immutable event identifier |
| `event_type` | enum/string | producer | b | Canonical taxonomy event type |
| `event_class` | enum | producer | b | Schema family |
| `schema_id` | string | registry | b | Schema registry reference |
| `schema_version` | string | registry | b | Contract version |
| `occurred_at` | timestamp | producer | a | Business occurrence time |
| `correlation_id` | opaque string | producer | b | Cross-flow trace correlation |
| `causation_id` | opaque string | producer | b | Immediate source link |
| `actor_ref` | reference | producer | c | Restricted actor identity/context |
| `subject_ref` | polymorphic reference | producer | c | Restricted governed subject linkage |
| `resolved_tier` | enum | policy | b | Governance level resolved |
| `decision_state` | enum | policy | b | Policy outcome where applicable |
| `classification` | structured metadata | governance | b | Data handling metadata |
| `payload` | structured | producer | c/d | Event-specific payload; projected/redacted per consumer |

### Entity: `audit_timeline_entry`

| Field | Type | Source | Class | API/UI/handling |
|---|---|---|---|---|
| `audit_timeline_entry_id` | opaque string | audit service | a | Canonical identifier |
| `event_id` | reference | audit service | b | Underlying governed event link |
| `subject_ref` | polymorphic reference | audit service | c | Subject linkage |
| `display_summary` | text | derived | b/c | Safe human-readable projection |
| `visibility_state` | enum | audit service | b | Full/redacted/hidden availability indicator |
| `recorded_at` | timestamp | audit service | a | Timeline timing |

## 20. Field treatment matrix by class

| Handling dimension | Class a | Class b | Class c | Class d |
|---|---|---|---|---|
| Standard authorized UI | Full | Full or contextual | Masked/role-gated | Hidden or strongly gated |
| Broad admin list | Full | Summary | Masked/reference-only | Omitted/never shown |
| API projection | Generally visible | Scope-aware | Redacted unless eligible | Omitted or reveal-command only |
| Export | Usually allowed | Scoped | Approval-gated/restricted | Prohibited by default |
| Audit access | Normal | Normal | Access events often audited | Reveal/access always high-audit |
| Archive | Normal policy | Normal/restricted policy | Restricted archive | Strongly restricted/immutable where required |

## 21. Redaction markers and representation

APIs and UI should distinguish field handling state.

### Recommended representation

| State | Meaning |
|---|---|
| `visible` | Value available in clear form |
| `redacted` | Value exists but displayed in masked/summarized form |
| `hidden` | Value intentionally omitted from current view |
| `unavailable` | Value could not be retrieved in current context |

### Example projection

```json
{
  "destination_value": null,
  "destination_value_visibility": "redacted",
  "destination_value_masked": "0x12ab...78ef"
}
```

## 22. Export and download rules

### Baseline rules

- field class must be evaluated together with export scope and volume;
- Class C exports should normally require explicit entitlement and may require approval;
- Class D fields are prohibited from ordinary exports unless a narrowly governed exception exists;
- all governed exports must carry scope, requester and artifact-trace metadata.

## 23. Archive and retention linkage

Field classification should be used with the data retention policy.

### Required alignment

- entity/artifact level retention profile must be compatible with contained field class;
- legal-hold eligible data must remain discoverable despite archive transition;
- archival projection should avoid adding lower-class replicas of higher-class clear data;
- retrieval from archive remains governed access, not an automatic visibility reset.

## 24. Derived and analytical data rules

Derived datasets must preserve classification semantics.

### Rules

- a dashboard metric may omit direct identifiers but still be Class C if segmentation can reveal sensitive behavior;
- aggregation and pseudonymization must be assessed, not assumed to eliminate sensitivity;
- analytics data products should store source class and approved consumer scope.

## 25. Validation and stewardship

### Required checks

- new high-sensitivity fields are classified before production use;
- API schemas and UI projections use dictionary field names/definitions;
- exports enforce field-level eligibility;
- schema/event changes update classifications where needed;
- field owners review changes to purpose, source or exposure.

### Stewardship roles

- domain owner: business definition and correctness;
- data governance/security: classification and handling;
- compliance: regulated-data interpretation;
- platform/API: contract enforcement;
- QA: behavior and leakage validation.

## 26. QA scenario guidance

Test at minimum:

- Class C/D masking in list, detail, export and archive-retrieval contexts;
- reveal flows that verify permission, step-up and audit event creation;
- omissions vs redaction markers versus unavailable state;
- derived dashboards/exports that do not leak protected source values;
- API response consistency with canonical field type and enum definitions;
- data retention and legal-hold behavior for sensitive artifacts/events.

## 27. Anti-patterns to avoid

- using generic JSON `metadata` blobs for canonical sensitive fields;
- classifying fields only after they reach analytics or exports;
- presenting redacted value as if it were empty or missing;
- treating tokenized/fingerprinted data as automatically low sensitivity;
- allowing archive restore to bypass current field-level access rules;
- exposing policy thresholds, risk scores or raw provider identity material in broad admin views.

## 28. Related documents

Use together with:

- `field-level-sensitivity-and-masking-matrix.md`
- `data-retention-and-archival-spec.md`
- `enum-and-state-dictionary-spec.md`
- `data-model-canonical-entities-spec.md`
- `visual-erd-and-canonical-relationship-map.md`
- `api-resource-boundaries-and-contract-spec.md`
- `governed-event-taxonomy-and-schema-registry-spec.md`
- `admin-permission-hardening-spec.md`