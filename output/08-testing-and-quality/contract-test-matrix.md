# Contract Test Matrix — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: QA + Backend + Platform
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `theblack-trade-api-contract-spec.md`
  - `governed-event-taxonomy-and-schema-registry-spec.md`
  - `provider-contract-and-operations-pack.md`
- Related documents:
  - `api-versioning-openapi-governance-and-deprecation-policy.md`
  - `acceptance-test-catalog.md`
  - `webhook-verification-and-replay-defense-spec.md`

## 1. Purpose

This matrix defines contract-level compatibility checks across APIs, governed events, provider callbacks, Directus automation and cross-service integration points. Its purpose is to ensure that independently evolving components remain compatible with agreed schemas, state models, field handling rules and side-effect expectations.

## 2. Contract layers

| Layer | Contract focus |
|---|---|
| Public/internal API | Resource shape, validation, status codes, enum semantics |
| Governed events | Event type, schema version, subject link, payload contract |
| Provider callbacks | Signature, event identity, replay behavior, mapping correctness |
| Directus flows/extensions | Trigger conditions, field expectations, side-effect rules |
| Internal policy/approval services | Request/response schema, control-tier behavior, decision semantics |

## 3. Matrix

| CT ID | Interface | Source authority | What must stay compatible | Severity |
|---|---|---|---|---:|
| CT-001 | Order API create/read/update flow | `theblack-trade-api-contract-spec.md`, `api-resource-boundaries-and-contract-spec.md` | Required fields, validation errors, state projection, idempotency expectations | P0 |
| CT-002 | Payment intent and inbound payment API | `theblack-trade-api-contract-spec.md`, `payment-provider-and-payout-integration-spec.md` | Canonical payment fields and callback-safe update semantics | P0 |
| CT-003 | Payout request and execution API | `theblack-trade-api-contract-spec.md`, `wallet-and-exchange-provider-integration-spec.md` | Approval gating, destination handling, execution-state projection | P0 |
| CT-004 | Approval workflow service contract | `approval-workflow-schema.md`, `policy-evaluation-service-contract.md` | Required approval inputs, tier resolution and decision artifact shape | P0 |
| CT-005 | Policy evaluation service | `policy-evaluation-service-contract.md`, `action-to-control-tier-matrix.md` | Action-family, threshold and response semantics | P1 |
| CT-006 | Governed event emission for order/payment/payout actions | `governed-event-taxonomy-and-schema-registry-spec.md` | Event type, schema version, subject linkage and provenance | P1 |
| CT-007 | Notification event production | `notification-event-matrix.md`, `governed-event-taxonomy-and-schema-registry-spec.md` | Correct event-to-notification eligibility and deduplication | P2 |
| CT-008 | Provider callback verification and replay handling | `webhook-verification-and-replay-defense-spec.md`, provider integration specs | Signature, duplicate detection and order-insensitive processing | P0 |
| CT-009 | Directus flows and extensions side effects | `theblack-trade-directus-flows-and-extensions-spec.md`, `theblack-trade-directus-field-matrix.md` | Trigger assumptions, field presence and action safety | P1 |
| CT-010 | Sensitive field projections in API/admin responses | `field-dictionary-and-sensitive-data-classification-matrix.md`, `field-level-sensitivity-and-masking-matrix.md` | Masking, visibility markers and restricted export behavior | P0 |

## 4. Execution rules

- contract tests should run on every interface where an upstream or downstream schema may drift;
- breaking changes require explicit versioning or approved coordinated rollout;
- event and callback contracts must be tested with duplicate, delayed and out-of-order payloads;
- Directus automation contracts must verify no unintended side effects occur when fields are missing or partially populated.

## 5. Recommended next additions

- provider-by-provider callback fixtures;
- schema snapshot storage for major API and event payloads;
- contract drift alerting integrated into CI/CD.

## 6. Related documents

- `theblack-trade-api-contract-spec.md`
- `api-resource-boundaries-and-contract-spec.md`
- `governed-event-taxonomy-and-schema-registry-spec.md`
- `webhook-verification-and-replay-defense-spec.md`
- `test-strategy-and-qa-plan.md`
- `provider-contract-and-operations-pack.md`

## Additional contract/governance test cases

- API rate-limit headers and throttling responses remain contractually consistent across protected customer endpoints.
- Provider callback replay handling rejects invalid signatures while permitting documented retry semantics for trusted sources.
- Data contracts preserve required fields, enums and backward-compatibility guarantees for governed events and analytical extracts.
- Travel-rule or sanctions-related provider exchanges preserve mandatory fields and failure-state handling where corridors require them.
- Privacy/export payload contracts exclude prohibited internal-only fields while keeping required subject-visible data intact.


## Additional operational contract cases

- OpenAPI artifacts fail CI when breaking contract changes are introduced without approved versioning or deprecation handling.
- Security scanning outputs map to a tracked vulnerability record with preserved severity, owner and remediation evidence fields.
- Data-contract validation fails when required fields, enum compatibility or freshness metadata violate producer-consumer agreement.
- Feature-flag control APIs or config schemas require owner, expiry and environment scope metadata for governed flags.
- Backup or restore job artifacts preserve expected manifest fields, integrity markers and execution outcome states where automation interfaces exist.
