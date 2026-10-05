# Canonical Documentation Governance Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Audit/report
- Owner: Architecture + Product + QA
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `documentation-audit-and-reorganization-report.md`
- Related documents:
  - `documentation-index-gap-matrix.md`
  - `acceptance-test-catalog.md`

## 1. Purpose

This document defines how TheBlack.Trade documentation is governed as a portfolio of authoritative specifications. It establishes which documents may serve as canonical authority, how overlapping documents relate to one another, how changes are reviewed, how superseded material is marked and how documentation quality is kept compatible across product, domain, compliance, finance, data, platform and QA layers.

## 2. Goals

The governance model must:

- define document authority and scope boundaries;
- reduce parallel truths across overlapping specs;
- require explicit relationships between dependent documents;
- make updates reviewable and auditable;
- support release readiness, onboarding and implementation traceability.

## 3. Document roles

| Role | Meaning |
|---|---|
| Canonical authority | Primary source of truth for a domain, entity, workflow or contract |
| Companion spec | Adds depth, examples, mappings or implementation details without replacing canonical truth |
| Derived reference | Visual, indexed or operational representation generated from or dependent on canonical truth |
| Legacy/superseded | Kept for history but not to be used as current authority |
| Audit/report | Cross-document analysis, gap tracking or governance review |

## 4. Mandatory metadata for every major document

Each major specification should include or eventually adopt a standard metadata block near the top or bottom containing:

- document title;
- status (`draft`, `active`, `superseded`, `archived`);
- role (`canonical authority`, `companion spec`, `derived reference`, `audit/report`);
- primary owner;
- supporting owners;
- last reviewed date;
- supersedes / superseded by;
- depends on;
- related documents.

## 5. Canonical authority rules

A document may be canonical only when:

- it clearly defines its ownership boundary;
- it is maintained by a named owner;
- it avoids duplicating full truth maintained elsewhere;
- companion documents reference it rather than restating its normative sections;
- change review includes affected adjacent domains.

If two documents appear canonical for the same subject, one must be designated the authority and the other recast as companion or legacy.

## 6. Relationship types between documents

| Relationship | Meaning |
|---|---|
| Depends on | The document assumes definitions or constraints from another doc |
| Constrains | The document sets rules another doc must follow |
| Extends | The document adds details to a canonical authority |
| Visualizes | The document presents diagrams or views of another authority |
| Implements | The document translates policy/model into platform/config behavior |
| Validates | The document defines tests, checks or release criteria |
| Supersedes | The document replaces older authority |

## 7. Portfolio-level canonical map

### Product and UX

- Canonical authority: `screen-and-route-spec.md`
- Companion specs: `annotated-wireframe-spec.md`, `screen-by-screen-ux-copy-spec.md`, `ru-localization-ux-copy-spec.md`, `design-system-ui-kit-spec.md`, `figma-ready-component-inventory-spec.md`, `email-notification-content-spec.md`
- Validation/operational companion: `production-readiness-checklist.md`

### Domain and workflow

- Canonical authorities: `order-domain-model-spec.md`, `theblack-trade-order-state-machine-spec.md`, `transaction-status-state-machine-spec.md`, `enum-and-state-dictionary-spec.md`
- Companion/implementation docs: `frontend-state-machine-spec.md`

### Operations and admin

- Canonical authorities: `admin-console-ia-and-workspace-spec.md`, `operations-runbook-and-sla-spec.md`, `incident-response-playbook.md`
- Companion specs: `admin-review-decision-matrix.md`, `admin-ui-control-state-map.md`, `support-communication-guidelines.md`, `document-template-and-receipt-spec.md`, `compliance-and-legal-operations-spec.md`

### Compliance, governance and risk

- Canonical authorities: `field-dictionary-and-sensitive-data-classification-matrix.md`, `field-level-sensitivity-and-masking-matrix.md`, `data-retention-and-archival-spec.md`, `fraud-signals-and-risk-rules-spec.md`, `admin-permission-hardening-spec.md`, `action-to-control-tier-matrix.md`, `approval-workflow-schema.md`, `step-up-authentication-and-dual-control-policy-spec.md`
- Companion specs: `theblack-trade-directus-permissions-matrix.md`, `threshold-catalog-by-currency-data-class-action-family.md`, `machine-readable-threshold-configuration-schema.md`, `policy-evaluation-service-contract.md`

### Finance and providers

- Canonical authorities: `payment-provider-and-payout-integration-spec.md`, `wallet-and-exchange-provider-integration-spec.md`, `reconciliation-and-ledger-spec.md`, `provider-capability-matrix.md`
- Companion/operational docs: `provider-contract-and-operations-pack.md`

### Data, events and observability

- Canonical authorities: `data-model-canonical-entities-spec.md`, `canonical-erd-and-field-dictionary-spec.md`, `governed-event-taxonomy-and-schema-registry-spec.md`, `observability-and-audit-spec.md`, `analytics-and-reporting-spec.md`
- Derived references: `visual-erd-and-canonical-relationship-map.md`, `notification-event-matrix.md`, `operational-dashboard-for-threshold-triggered-actions.md`
- Legacy or candidate for consolidation: `event-taxonomy-and-schema-registry.md`

### Platform, delivery and architecture

- Canonical authorities: `api-resource-boundaries-and-contract-spec.md`, `theblack-trade-api-contract-spec.md`, `component-architecture-spec.md`, `environment-and-deployment-spec.md`, `threat-model-and-security-architecture-spec.md`, `business-continuity-and-dr-spec.md`, `data-migration-and-backfill-strategy-spec.md`, `release-readiness-and-rollout-plan.md`
- Companion specs: `error-catalog-and-api-ui-mapping-spec.md`, `frontend-integration-spec.md`, `webhook-verification-and-replay-defense-spec.md`, `theblack-trade-directus-field-matrix.md`, `theblack-trade-directus-flows-and-extensions-spec.md`, `theblack-trade-directus-implementation-blueprint.md`, `theblack-trade-solution-architecture-and-technical-specification.md`

### Testing and quality

- Canonical authorities: `test-strategy-and-qa-plan.md`, `acceptance-test-catalog.md`, `migration-validation-pack.md`, `contract-test-matrix.md`
- Companion reference: `qa-scenario-matrix-by-action-tier.md`

## 8. Known overlap resolutions

### API authority

`api-resource-boundaries-and-contract-spec.md` should own resource boundaries, ownership, object surfaces and segmentation rules. `theblack-trade-api-contract-spec.md` should own endpoint-level contract detail, payload patterns and integration-facing API shape. If conflicts appear, the boundaries spec wins on resource ownership, while the API contract spec wins on endpoint payload grammar.

### Event authority

`governed-event-taxonomy-and-schema-registry-spec.md` should be treated as the canonical event-governance authority. `event-taxonomy-and-schema-registry.md` should be marked legacy or companion unless actively narrowed to a distinct scope.

### Data authority

`data-model-canonical-entities-spec.md` owns entity meaning and ownership boundaries. `canonical-erd-and-field-dictionary-spec.md` extends it with structural and relationship detail. `visual-erd-and-canonical-relationship-map.md` visualizes but does not redefine. `field-dictionary-and-sensitive-data-classification-matrix.md` owns handling/classification semantics.

### Directus authority

`directus-data-model-spec.md` owns collection-level model shape. `theblack-trade-directus-field-matrix.md` owns field-by-field configuration reference. `theblack-trade-directus-flows-and-extensions-spec.md` owns automation behavior. `theblack-trade-directus-implementation-blueprint.md` owns rollout/implementation guidance.

## 9. Change management process

All significant documentation updates should follow a lightweight governance flow:

1. identify whether the changed document is canonical or companion;
2. list impacted related documents;
3. review for semantic conflicts, not only wording;
4. update `supersedes`, `depends on` and `related documents` metadata where needed;
5. record whether QA, platform, finance, compliance or operations sign-off is required;
6. update derived references if canonical truth changes.

## 10. Update triggers

A document review should be triggered when any of the following occurs:

- entity or field ownership changes;
- new provider or integration mode is introduced;
- workflow state or enum changes;
- retention/masking/export rules change;
- approval tiers or thresholds change;
- incident/continuity policy changes;
- release or migration strategy changes;
- audit finds parallel truth or outdated references.

## 11. Quality bar for document compatibility

A document is considered compatible only if:

- terms match canonical definitions;
- states and enums align with the enum/state dictionary;
- field names and meanings align with the field dictionary;
- linked workflows respect approval, permissions and retention rules;
- companion docs do not silently redefine canonical behavior.

## 12. Supersession and deprecation rules

When a document is replaced:

- set status to `superseded`;
- state the replacement document explicitly;
- remove it from active implementation checklists where relevant;
- preserve it only for history, audit or migration context.

Legacy documents should never remain implicitly active.

## 13. Review cadence

| Document type | Suggested review cadence |
|---|---|
| Canonical authority | quarterly or on major domain change |
| Companion spec | on dependency change or at least semiannually |
| Derived reference | after every canonical change affecting it |
| Audit/report | after major structural reorganization |

## 14. Missing governance improvements still recommended

- add standard metadata blocks to existing major docs;
- mark `event-taxonomy-and-schema-registry.md` as legacy or narrow its scope;
- explicitly annotate `theblack-trade-api-contract-spec.md` and `api-resource-boundaries-and-contract-spec.md` with their non-overlapping authority zones;
- add portfolio change log or review ledger for major spec updates.

## 15. Related documents

- `documentation-audit-and-reorganization-report.md`
- `documentation-index-gap-matrix.md`
- `release-readiness-and-rollout-plan.md`
- `test-strategy-and-qa-plan.md`