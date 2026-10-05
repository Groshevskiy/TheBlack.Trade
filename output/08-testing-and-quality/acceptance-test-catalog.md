# Acceptance Test Catalog — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: QA + Product + Engineering
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `test-strategy-and-qa-plan.md`
  - `release-readiness-and-rollout-plan.md`
- Related documents:
  - `contract-test-matrix.md`
  - `migration-validation-pack.md`

## 1. Purpose

This catalog translates the platform specifications into release-relevant acceptance criteria. It groups end-to-end behaviors, control flows, risk/compliance constraints, finance integrity checks and operational expectations into explicit acceptance scenarios that can be used for QA, UAT and go-live sign-off.

## 2. How to use this catalog

Each acceptance item should map to:

- one or more source specifications;
- a business objective;
- preconditions and test data;
- expected result;
- blocking severity if failed.

## 3. Severity levels

| Level | Meaning |
|---|---|
| P0 | Release blocker; financial, security or compliance risk |
| P1 | High impact; core user or operator flow broken |
| P2 | Important but tolerable temporarily with workaround |
| P3 | Non-critical polish or secondary flow |

## 4. Acceptance domains

| Domain | Primary source docs |
|---|---|
| Route/UI flow | `screen-and-route-spec.md`, `annotated-wireframe-spec.md`, `frontend-state-machine-spec.md` |
| Domain/workflow | `order-domain-model-spec.md`, `theblack-trade-order-state-machine-spec.md`, `transaction-status-state-machine-spec.md`, `enum-and-state-dictionary-spec.md` |
| Finance | `payment-provider-and-payout-integration-spec.md`, `wallet-and-exchange-provider-integration-spec.md`, `reconciliation-and-ledger-spec.md` |
| Governance | `approval-workflow-schema.md`, `action-to-control-tier-matrix.md`, `step-up-authentication-and-dual-control-policy-spec.md`, `admin-permission-hardening-spec.md` |
| Data/security | `field-dictionary-and-sensitive-data-classification-matrix.md`, `field-level-sensitivity-and-masking-matrix.md`, `data-retention-and-archival-spec.md`, `threat-model-and-security-architecture-spec.md` |
| Operations | `admin-console-ia-and-workspace-spec.md`, `operations-runbook-and-sla-spec.md`, `incident-response-playbook.md`, `business-continuity-and-dr-spec.md` |

## 5. Route and onboarding acceptance

| ID | Scenario | Severity | Expected acceptance result |
|---|---|---:|---|
| AT-001 | Visitor can reach quote flow from landing and complete primary navigation without dead-end routes | P1 | Route map and CTA flow match product spec |
| AT-002 | Auth-required cabinet routes block unauthenticated access and redirect cleanly | P1 | No protected route leaks cabinet data |
| AT-003 | Frontend state restoration after reload does not place user into impossible step | P1 | UI state stays consistent with backend order state |
| AT-004 | RU localization copy appears on required customer-facing views with no mixed-language critical CTAs | P2 | Critical labels, buttons and statuses are localized correctly |

## 6. Quote and order acceptance

| ID | Scenario | Severity | Expected acceptance result |
|---|---|---:|---|
| AT-010 | User requests quote for supported pair and sees correct quote validity window | P1 | Quote and expiration behavior match pricing spec |
| AT-011 | Expired quote cannot be used to submit an order without controlled refresh | P1 | Stale pricing is blocked or refreshed safely |
| AT-012 | Order creation from accepted quote produces valid canonical order state and references | P0 | Order, quote and pricing lock linkage is intact |
| AT-013 | Impossible order transitions are rejected at API and UI layers | P0 | State machine constraints are enforced |

## 7. Payment intake acceptance

| ID | Scenario | Severity | Expected acceptance result |
|---|---|---:|---|
| AT-020 | Payment intent creation matches order expectations and exposes correct payment instructions | P1 | Expected amount, currency and method context are correct |
| AT-021 | Provider callback updates inbound payment without duplicating finalization on replay | P0 | Idempotent callback handling is proven |
| AT-022 | Late, duplicate or out-of-order payment provider updates do not corrupt canonical payment state | P0 | Raw provider states may differ, canonical state remains valid |
| AT-023 | Missing payment confirmation drives queue/escalation behavior rather than silent stagnation | P1 | Operators can detect and act on stuck payment states |

## 8. Payout and destination acceptance

| ID | Scenario | Severity | Expected acceptance result |
|---|---|---:|---|
| AT-030 | Verified payout destination is required before payout release where policy demands it | P0 | Unsafe destination release is blocked |
| AT-031 | High-risk or high-value payout routes through correct approval and step-up controls | P0 | Control tier behavior matches governance policy |
| AT-032 | Payout execution provider replay does not create duplicate release or completion artifacts | P0 | External replay does not duplicate side effects |
| AT-033 | Destination values stay masked for unauthorized operators in list and detail contexts | P0 | Sensitive destination handling is enforced |

## 9. Compliance and governance acceptance

| ID | Scenario | Severity | Expected acceptance result |
|---|---|---:|---|
| AT-040 | Compliance case can be opened, assigned, escalated and closed with full audit trace | P1 | Case lifecycle is operationally complete |
| AT-041 | Hold blocks prohibited action families until approved release | P0 | Hold enforcement works across relevant workflows |
| AT-042 | Approval request requires the right actor, tier and decision evidence before governed action proceeds | P0 | No governed action bypasses approval rules |
| AT-043 | Step-up authentication is required where configured and failure prevents completion | P0 | Step-up controls are binding |

## 10. Ledger and reconciliation acceptance

| ID | Scenario | Severity | Expected acceptance result |
|---|---|---:|---|
| AT-050 | Ledger postings reflect order/payment/payout truth without duplication | P0 | Financial postings are balanced and traceable |
| AT-051 | Reconciliation identifies provider/platform mismatches and exposes actionable exception state | P0 | Reconciliation coverage is complete |
| AT-052 | Manual correction workflow preserves audit trace and does not rewrite immutable financial history silently | P0 | Corrections follow approved path |

## 11. Security, permissions and data handling acceptance

| ID | Scenario | Severity | Expected acceptance result |
|---|---|---:|---|
| AT-060 | Unauthorized role cannot access admin functions outside policy scope | P0 | Permission hardening blocks overreach |
| AT-061 | Sensitive fields are masked, hidden or reveal-gated exactly per policy | P0 | Field handling matches classification matrix |
| AT-062 | Export requests for sensitive data require appropriate restriction or approval | P0 | No unrestricted sensitive export path exists |
| AT-063 | Archived or legally held data remains discoverable only via governed access | P1 | Retention and legal-hold semantics survive archive state |

## 12. Events, observability and audit acceptance

| ID | Scenario | Severity | Expected acceptance result |
|---|---|---:|---|
| AT-070 | Governed actions emit expected event type, schema version and subject linkage | P1 | Event contract integrity holds |
| AT-071 | Audit timeline reflects approval, hold, payout and operator actions with correct visibility projection | P1 | Audit and observability remain aligned |
| AT-072 | Notification events are generated for supported lifecycle transitions without false duplicates | P2 | Event-to-notification mapping behaves correctly |

## 13. Operational resilience acceptance

| ID | Scenario | Severity | Expected acceptance result |
|---|---|---:|---|
| AT-080 | Incident playbook can be followed to isolate affected workflow and preserve evidence | P1 | Operators can execute contained response |
| AT-081 | DR/degraded-mode run preserves payout safety and ledger confidence | P0 | Recovery does not create unsafe financial behavior |
| AT-082 | Emergency/manual mode actions are auditable and later reconciled back to canonical systems | P1 | Continuity controls remain governed |

## 14. Release decision use

A release should not pass if any P0 item fails. P1 failures require explicit waiver and workaround approval. P2/P3 items may be deferred only if they do not create hidden financial, governance or security risk.

## 15. Recommended next artifacts

- detailed step-by-step test procedures per acceptance ID;
- test-data pack mapped to each scenario;
- traceability matrix from acceptance IDs to release sign-off checklist.

## 16. Related documents

- `test-strategy-and-qa-plan.md`
- `qa-scenario-matrix-by-action-tier.md`
- `release-readiness-and-rollout-plan.md`
- `canonical-documentation-governance-spec.md`

## Additional cases from new governance specs

- Privacy request access/export flow returns the correct dataset, logs evidence and respects restricted records.
- Deletion/erasure request is blocked or partially fulfilled when legal hold or AML retention applies, with explicit customer notification path.
- High-sensitivity API routes throttle abusive bursts with stable 429 semantics without breaking legitimate idempotent retries.
- Feature-flag rollout for payout-affecting behavior supports staged enablement, rollback and audited change history.
- Accessibility checks confirm keyboard completion and screen-reader readability for onboarding, quote and order confirmation journeys.
- Accounting close workflow produces sign-off evidence, unresolved exception inventory and post-close adjustment traceability.


## Additional operational control test cases

- Vulnerability-management workflow blocks production readiness when open critical findings exceed approved thresholds for critical customer or payout flows.
- Data-freshness breach on reconciliation-critical datasets triggers alerting, escalation and a documented degraded-mode response.
- Feature-flag governance enforces owner, expiry and rollback metadata before a payout-impacting flag can be promoted.
- Backup restore validation proves recovery package completeness, integrity checks and documented sign-off for a representative restore exercise.
- CI/CD quality gates stop release when contract, security or migration validations fail, with override requiring approved evidence.
- Incident postmortem workflow creates corrective actions, owners, due dates and verification links to updated runbooks or tests.
