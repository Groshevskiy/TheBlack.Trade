# Data Migration & Backfill Strategy Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Data Engineering + Backend + QA
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `data-model-canonical-entities-spec.md`
  - `canonical-erd-and-field-dictionary-spec.md`
- Related documents:
  - `migration-validation-pack.md`
  - `data-retention-and-archival-spec.md`
  - `governed-event-taxonomy-and-schema-registry-spec.md`

## 1. Purpose

This document defines the migration and backfill strategy for moving TheBlack.Trade from legacy or partially specified structures into the canonical target architecture. It covers schema evolution, data remapping, derived-field regeneration, event backfill, classification enrichment, retention metadata alignment and controlled rollout.

The goal is to make canonical entities, enums, relationships, events and field-handling policies operational without losing traceability, financial correctness, compliance evidence or operational continuity.

## 2. Scope

This strategy applies to migrations affecting:

- canonical business entities and relationship normalization;
- API-facing resources and internal service contracts;
- Directus collections/fields and related admin views;
- event taxonomy and schema-governed event production;
- field-level classification, masking and export eligibility metadata;
- archive, retention and legal-hold metadata attachment;
- analytics and reporting datasets dependent on canonical business records.

## 3. Objectives

The migration program must:

- preserve business truth for orders, payments, payouts, balances, approvals and compliance cases;
- maintain traceability between source records and target canonical records;
- support idempotent reruns and partial rollback boundaries;
- prevent silent semantic drift in enums, timestamps, amounts and references;
- create audit evidence for each executed migration wave;
- avoid production downtime where a phased or dual-read approach is possible.

## 4. Non-goals

This document does not attempt to:

- prescribe physical DDL for every table or collection;
- define every one-off fix script in full code form;
- backfill data that is knowingly invalid without a reconciliation decision;
- replace incident, DR or release runbooks.

## 5. Migration principles

### Canonical-first

Target structures must follow the canonical entity, field and relationship model rather than copying legacy shape into new names.

### Replay-safe

Every migration and backfill step should be rerunnable without duplicating business effects.

### Audit-evidenced

Each migration wave must generate evidence: inputs, filters, counts, checks, operator identity, execution time and outcome.

### Financially conservative

When financial ambiguity exists, migration should stop or quarantine rather than invent values.

### Compliance-preserving

Data classification, retention, masking and legal-hold posture must not weaken during migration.

### Progressive rollout

Prefer phased enablement, dual write, dual read or shadow validation over big-bang replacement.

## 6. Migration domains

| Domain | Primary concern | Key migration challenge |
|---|---|---|
| Commercial | orders, quotes, pricing locks, state integrity | mapping legacy state variants and references |
| Payment | intents, inbound payments, provider refs | duplicate/late provider status history |
| Payout | destination auth, approvals, execution | sensitive destination data and approval trace continuity |
| Ledger | ledger entries, balances, reconciliation | immutable financial correctness |
| Compliance | cases, holds, screening, risk alerts | sensitive free text and provider outcome mapping |
| Governance | approvals, policy snapshots, action tiers | reconstructing decision lineage |
| Documents | uploaded docs, evidence bundles, exports | storage ref continuity and archive attachment |
| Events & audit | governed events, timelines | recreating event history without fabricating business truth |
| Analytics | marts, dashboards, reporting | preserving metric continuity across model changes |

## 7. Migration object taxonomy

### 7.1 Structural migration

Changes to schemas, collections, indexes, constraints, relation tables and required fields.

### 7.2 Semantic migration

Reinterpretation of values: state renames, enum consolidation, entity splitting, ownership changes.

### 7.3 Data backfill

Population of new fields, link tables, derived summaries, hashes, classifications or policy metadata from existing data.

### 7.4 Historical reconstitution

Selective rebuild of timelines, events, snapshots and archive manifests from prior evidence.

## 8. Preconditions

Before a migration wave begins, the following must exist:

- approved canonical target model;
- enum/state dictionary for affected domains;
- field dictionary and classification policy for affected fields;
- clear source-of-truth identification per migrated field;
- reconciliation rules for ambiguous source data;
- runbook with rollback/quarantine actions;
- environment-level backup/restore readiness;
- QA/UAT scope for post-migration validation.

## 9. Source inventory and data profiling

Each migration wave starts with source inventory.

### Required inventory outputs

- source systems/collections/tables/files;
- field-level completeness percentages;
- duplicate key patterns;
- enum/value cardinality maps;
- orphan reference counts;
- timestamp quality review, including timezone ambiguity;
- null/empty/default anti-pattern scan;
- free-text fields likely to contain sensitive data.

### Profiling outcomes

Every profiled issue should be labeled as:

- acceptable as-is;
- transformable by deterministic rule;
- transformable with manual mapping table;
- quarantine-only;
- blocker requiring business decision.

## 10. Mapping model

Every migrated entity should have a mapping specification.

### Mapping specification must include

- source object(s);
- target canonical entity;
- field-by-field mapping rule;
- enum translation table;
- relationship reconstruction logic;
- derivation logic for new target-only fields;
- defaulting rules and forbidden defaults;
- validation constraints;
- source-to-target trace identifier strategy.

### Example mapping rule categories

| Rule type | Description |
|---|---|
| direct | Source field copied with format normalization |
| translated | Source enum/value mapped through approved table |
| derived | Target value calculated from one or more source values |
| inferred | Target value computed from safe evidence pattern |
| unresolved | No safe mapping; record quarantined or flagged |

## 11. Migration identifiers and traceability

Each migrated record set must support traceability.

### Required trace fields

- `migration_wave_id`
- `migration_job_id`
- `migration_source_system`
- `migration_source_record_ref`
- `migration_loaded_at`
- `migration_transform_version`
- `migration_confidence` where inference was used

These fields may live in operational metadata, lineage tables or audit logs depending on the entity and storage model.

## 12. Backfill classes

### Class A: deterministic structural backfill

Examples: UUID generation, normalized references, timestamps copied unchanged, classification metadata assignment from fixed rules.

### Class B: deterministic semantic backfill

Examples: enum translation, canonical state derivation, policy tier derivation from mapped rules.

### Class C: evidence-based inferred backfill

Examples: historical approval link reconstruction from correlated operator actions, destination verification status inferred from archived provider callbacks.

### Class D: manual resolution backfill

Examples: broken financial linkage, missing compliance-case subject, conflicting payout completion evidence.

Class C and D changes must have stricter review, logging and quarantine support.

## 13. Quarantine model

Not all records should migrate directly into canonical production truth.

### Quarantine triggers

- missing source primary keys or unresolvable references;
- conflicting financial amounts across systems;
- legacy state values without approved mapping;
- suspected duplicate records with divergent payloads;
- sensitive fields failing validation, decryption or integrity checks;
- timeline histories whose ordering cannot be trusted.

### Quarantine requirements

- preserve raw source evidence;
- attach reason code and severity;
- block downstream operational use where unsafe;
- support manual decision workflow;
- emit audit event and migration metrics.

## 14. Enum and state migration

Enum/state changes are high risk because they alter workflow meaning.

### Required controls

- maintain explicit translation tables from legacy to canonical values;
- forbid silent fallback to `unknown` except where target model explicitly allows it;
- store unmapped source values for forensic review;
- separate raw provider status from canonical business state;
- validate state transition legality after migration, not just final value correctness.

### Recommended validation

- no migrated record lands in an impossible canonical state;
- no closed/completed state lacks required timestamps;
- no approval-resolved record lacks a decision artifact or justified exception;
- no payout-executed record lacks destination and provider linkage.

## 15. Relationship reconstruction

Canonical relationships must be rebuilt explicitly.

### Typical relationship tasks

- link orders to quotes, pricing locks, payments, payouts and ledger effects;
- attach compliance cases, holds and risk alerts to correct subjects;
- connect uploaded documents to customers, cases, approvals or payouts;
- link governed events and audit timeline entries to canonical subject refs;
- associate exports and archive manifests with retention profiles and approvals.

### Controls

- do not reconstruct relationships by fuzzy matching unless approved and confidence-scored;
- where heuristic linkage is used, persist confidence and source evidence;
- many-to-many joins require a dedicated lineage or bridge strategy, not embedded arrays by default.

## 16. Sensitive data migration rules

Sensitive-data posture must be preserved or strengthened.

### Required controls

- field classification must be assigned before migrated data becomes broadly queryable;
- masking policy must be active before sensitive admin surfaces point at migrated fields;
- Class D clear values must not be exposed in logs, job diagnostics or ad hoc CSVs;
- tokenized or fingerprinted replacements must not be treated as fully public;
- reveal-gated fields require access-audit support immediately at cutover.

## 17. Retention, archival and legal-hold backfill

Canonical retention metadata must be added to historical records and artifacts.

### Backfill tasks

- attach `retention_profile_id` to records/artifacts based on entity class and jurisdictional/business rules;
- identify and preserve legal-hold eligible records;
- create archive manifests for historical bundles where archive scope can be reconstructed safely;
- mark exceptions where retention start point is uncertain.

### Caution

Migration must not trigger premature deletion, archive restore bypass or retention clock reset without approved policy.

## 18. Event and audit history backfill

Historical event reconstruction must be explicit about truth level.

### Event backfill categories

| Category | Meaning | Allowed use |
|---|---|---|
| original event replay | Existing trusted event copied into governed format | Preferred where source event exists |
| derived historical event | Event created from reliable persisted fact | Allowed with derivation marker |
| synthetic audit marker | Migration artifact documenting conversion step | Allowed only for audit/lineage, not business chronology |

### Rules

- do not fabricate fine-grained user journeys that were never persisted;
- mark derived events with provenance metadata;
- preserve source occurrence time and reconstruction time separately;
- avoid double-counting in analytics consumers.

## 19. Analytics and reporting continuity

Metrics and dashboards must survive model changes without hidden breaks.

### Required approach

- define old-to-new metric mapping before cutover;
- backfill dimensional keys used by dashboards and reconciliations;
- run parallel reports across legacy and canonical pipelines for comparison;
- document intentional metric changes caused by semantic correction;
- maintain a temporary compatibility layer where reporting consumers cannot switch immediately.

## 20. Migration execution patterns

### 20.1 Big-bang

Use only for small, low-risk or isolated datasets.

### 20.2 Expand-and-contract

Create new structures first, dual-read or dual-write if needed, then deprecate old structures after validation.

### 20.3 Shadow backfill

Run canonical loads in parallel without user-facing activation, compare outputs, then cut over.

### 20.4 Incremental wave migration

Migrate by date range, entity cohort, customer segment or provider partition.

Preferred default for TheBlack.Trade: expand-and-contract plus shadow validation for business-critical domains.

## 21. Wave planning

Migration should be grouped into explicit waves.

### Suggested wave order

1. reference/config foundations;
2. enums, policy sets, thresholds, masking rules and retention profiles;
3. low-risk master/reference entities;
4. customers and contact points;
5. commercial records (trade intents, quotes, orders, pricing locks);
6. payments and settlements;
7. payout and destination authorization;
8. ledger and reconciliation lineage;
9. compliance/governance records;
10. documents, exports, archive manifests;
11. governed events, audit timeline and analytics projections.

This order may be adjusted when strong dependencies require an earlier bootstrap artifact.

## 22. Dry runs and rehearsal environments

Every critical wave requires rehearsal.

### Rehearsal goals

- estimate runtime and lock/contention risk;
- validate idempotency on rerun;
- measure quarantine rate;
- verify counts, totals and state distributions;
- test rollback or compensating isolation procedures;
- capture runbook timing and human intervention steps.

## 23. Validation framework

Validation should be defined before execution.

### 23.1 Record-level validation

- field type/format checks;
- required-field completeness;
- enum translation coverage;
- reference resolvability;
- classification assignment presence.

### 23.2 Aggregate validation

- source vs target record counts by cohort;
- amount totals by currency/asset;
- state distribution comparison;
- duplicate rate comparison;
- archive/legal-hold attachment counts;
- approval linkage coverage;
- event volume comparison by type.

### 23.3 Financial validation

- ledger balance conservation;
- reconciliation parity before and after migration;
- no duplicated financial postings;
- no orphaned payout/payment records affecting books.

### 23.4 Compliance validation

- sensitive fields masked in target views;
- holds preserved;
- screening outcomes not weakened;
- document access restrictions intact;
- export restrictions unchanged or stronger.

## 24. Acceptance gates per wave

A migration wave should not be promoted unless:

- validation checks pass or approved exceptions are recorded;
- quarantine population is within threshold and triaged;
- financial parity checks are accepted;
- security/compliance sign-off is recorded where sensitive data is involved;
- monitoring and rollback hooks are live;
- downstream consumers are confirmed ready.

## 25. Rollback and compensating strategy

True rollback may not always be possible once external effects or mutable operational state are involved.

### Therefore define per wave

- reversible rollback path for structural-only changes;
- target isolation/deactivation path where data cannot be fully rolled back;
- compensating correction flow for partially migrated records;
- clear cut line for dual-write disablement;
- operator and stakeholder communication path.

## 26. Idempotency requirements

Migration jobs must be idempotent by design.

### Controls

- stable natural or synthetic deduplication keys;
- upsert semantics with version checks where appropriate;
- append-only audit evidence for reruns;
- no side-effecting business actions from backfill jobs;
- separation between data repair and external notification/job triggering.

## 27. Operational safety controls

### Required runtime protections

- feature flags around canonical readers/writers;
- throttling and batch-size control;
- checkpointing and resumability;
- explicit maintenance windows where necessary;
- migration metrics dashboard;
- alerting on validation drift, error spikes, job lag and quarantine bursts.

## 28. Documentation and evidence pack

Each wave should produce a migration evidence pack.

### Evidence pack contents

- approved mapping spec version;
- source cohort definition;
- execution timestamps;
- operator/reviewer identities;
- job versions/checksums;
- record and amount comparisons;
- quarantine summary;
- exception list;
- sign-off decisions;
- rollback/compensation note if invoked.

## 29. Ownership and decision model

| Responsibility | Primary owner | Supporting owners |
|---|---|---|
| canonical mapping correctness | domain owner | backend, data |
| financial parity | finance/ledger owner | backend, reconciliation |
| classification and masking | data governance/security | compliance, platform |
| retention and hold handling | governance/compliance | platform, ops |
| execution tooling | platform/data engineering | backend |
| validation and acceptance | QA + domain owner | finance, compliance, ops |

## 30. Wave-specific playbook template

Each migration wave should instantiate the following template:

- wave name and scope;
- source cohort and filters;
- target entities and contracts affected;
- mapping versions;
- dry-run results;
- execution plan and batch size;
- validation checklist;
- quarantine handling path;
- rollback/compensating path;
- sign-off owners;
- post-cutover monitoring window.

## 31. Domain-specific cautions

### Orders and pricing

Beware of legacy records where quote, pricing lock and order timestamps disagree; preserve original evidence and avoid inventing a new sequence.

### Payments

Provider callback order may differ from canonical payment lifecycle; retain raw provider status history separately from mapped state.

### Payouts

Do not expose full destination values during migration review; rely on masked display plus secure reveal procedures.

### Ledger

No mutation of posted accounting truth without explicit finance-approved correction model.

### Compliance and approvals

Free text from analysts/operators may contain high-sensitivity data and should not be copied into broad observability tooling.

### Events and analytics

Historical synthetic markers must be excluded or specially handled in business KPI calculations.

## 32. Recommended deliverables following this spec

The following artifacts should be created or refined per wave:

- source-to-target mapping workbook;
- enum translation registry;
- migration validation checklist;
- quarantine reason catalog;
- migration metrics dashboard;
- migration evidence pack template;
- compatibility-view deprecation plan.

## 33. Anti-patterns to avoid

- renaming legacy structures and calling them canonical without semantic cleanup;
- backfilling inferred values without provenance markers;
- allowing migration scripts to emit business notifications or customer communications;
- mixing schema change, data repair and feature release with no independent rollback line;
- dropping legacy data before reconciliation and audit sign-off;
- using ad hoc analyst spreadsheets as undocumented mapping authority;
- counting synthetic migration events as customer/business activity.

## 34. Related documents

Use together with:

- `data-model-canonical-entities-spec.md`
- `visual-erd-and-canonical-relationship-map.md`
- `field-dictionary-and-sensitive-data-classification-matrix.md`
- `field-level-sensitivity-and-masking-matrix.md`
- `enum-and-state-dictionary-spec.md`
- `governed-event-taxonomy-and-schema-registry-spec.md`
- `api-resource-boundaries-and-contract-spec.md`
- `data-retention-and-archival-spec.md`
- `reconciliation-and-ledger-spec.md`
- `admin-permission-hardening-spec.md`
- `release-readiness-and-rollout-plan.md`
- `test-strategy-and-qa-plan.md`
- `threat-model-and-security-architecture-spec.md`