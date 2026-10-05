# Migration Validation Pack — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: QA + Data Engineering + Platform
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `data-migration-and-backfill-strategy-spec.md`
  - `reconciliation-and-ledger-spec.md`
- Related documents:
  - `acceptance-test-catalog.md`
  - `contract-test-matrix.md`

## 1. Purpose

This document turns the migration strategy into an executable validation and sign-off pack. It defines what must be checked before, during and after each migration or backfill wave so that data remapping, event reconstruction, classification enrichment and rollout do not introduce silent financial, governance or integrity defects.

## 2. Validation layers

| Layer | Purpose |
|---|---|
| Pre-migration validation | Ensure source profiling, mapping and prerequisites are complete |
| In-flight validation | Detect transform drift or quarantine spikes while jobs run |
| Post-load validation | Confirm record correctness, linkage, state validity and totals |
| Sign-off validation | Formal acceptance by relevant owners before production cutover |

## 3. Pre-migration checklist

Before running a wave, confirm:

- approved mapping spec exists;
- source profile and anomaly summary are attached;
- enum/state translation table is approved;
- quarantine reason catalog is ready;
- rollback or compensating path is documented;
- target permissions/masking/retention controls are already prepared;
- test data or rehearsal evidence exists for the wave.

## 4. In-flight validation controls

Track during execution:

- processed record count vs expected cohort;
- error rate by transform step;
- duplicate detection count;
- quarantine count and top reason codes;
- state translation misses;
- reference resolution failures;
- unexpected null/default output creation.

## 5. Post-load validation matrix

| Check area | Required validation |
|---|---|
| Counts | Source vs target counts by cohort and entity |
| References | Parent/child links and polymorphic refs resolve correctly |
| States | Canonical state values are valid and transitions remain legal |
| Financials | Amount totals, postings and reconciliation parity hold |
| Governance | Holds, approvals and control-tier artifacts still bind correctly |
| Sensitive data | Classification, masking and export controls are active |
| Events | Backfilled/replayed events have valid provenance and no duplicate business meaning |
| Archive/retention | Profiles and legal-hold semantics are attached as expected |

## 6. Sign-off model

| Area | Required sign-off |
|---|---|
| Domain correctness | Domain owner |
| Financial correctness | Finance/reconciliation owner |
| Sensitive-data handling | Security/data governance |
| Regulated workflow integrity | Compliance |
| Runtime/platform readiness | Platform/engineering |
| Test evidence completeness | QA |

## 7. Required wave artifacts

For each migration wave keep:

- wave charter;
- source cohort definition;
- mapping version;
- dry-run results;
- exception and quarantine report;
- validation result summary;
- sign-off sheet;
- post-cutover monitoring notes.

## 8. Blocking conditions

A migration wave must not pass if:

- unmapped states remain without explicit waiver;
- financial totals diverge beyond approved tolerance;
- target access controls are weaker than source handling rules;
- event replay/backfill creates ambiguous duplicate business effects;
- quarantine volume exceeds approved threshold with no triage plan.

## 9. Recommended relationship to test packs

This pack should be used together with:

- `data-migration-and-backfill-strategy-spec.md`
- `acceptance-test-catalog.md`
- `contract-test-matrix.md`
- `test-strategy-and-qa-plan.md`