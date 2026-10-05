# QA Scenario Matrix by Action Tier — TheBlack.Trade

## Document metadata

- Status: active
- Role: Derived reference
- Owner: QA + Compliance
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `action-to-control-tier-matrix.md`
  - `approval-workflow-schema.md`
- Related documents:
  - `acceptance-test-catalog.md`
  - `contract-test-matrix.md`

## 1. Purpose

This document defines a QA scenario matrix for validating TheBlack.Trade control enforcement across Tier 0–Tier 4 actions. It translates the control-tier model, threshold rules, approval workflow, policy evaluation service and admin UI state map into concrete test categories and scenario expectations.

The matrix is intended for QA, backend engineering, frontend engineering, security, finance, compliance, risk, operations and release governance stakeholders.

## 2. Goals

The matrix must:

- ensure every governed action tier has test coverage;
- validate alignment between backend policy decisions and admin UI behavior;
- cover step-up, approval, revalidation, invalidation and safe-fail behavior;
- expose edge cases around thresholds, stale state, bulk actions and incident contexts;
- provide a reusable baseline for regression suites and release gates.

## 3. Non-goals

This document does not replace:

- detailed test case implementation in a test management system;
- unit-level function tests for every service;
- load/performance testing plans except where they affect control enforcement;
- provider-specific integration certification scripts.

## 4. Test dimensions

Each scenario should be evaluated across the following dimensions where relevant:

| Dimension | Examples |
|---|---|
| Action tier | Tier 0, Tier 1, Tier 2, Tier 3, Tier 4 |
| Domain | Support, operations, finance, compliance, risk, security, archive, config |
| Context | Normal, anomaly, incident, break-glass, out-of-hours |
| Interface | Backend API, admin UI, workflow service, bulk action surface |
| State volatility | Fresh, stale, changed entity, changed permission, changed policy |
| Data sensitivity | Class A, B, C, D |
| Execution mode | Precheck, approval, execution, post-execution audit |

## 5. Scenario record format

Recommended fields for each executable test case:

- scenario ID;
- action family;
- baseline tier;
- preconditions;
- trigger/input;
- expected policy decision;
- expected UI/API behavior;
- expected audit/approval artifacts;
- negative assertions;
- related defect/regression tags.

## 6. Tier coverage summary

| Tier | Core QA focus |
|---|---|
| Tier 0 | Standard allow path, correct audit, no accidental friction |
| Tier 1 | Explicit permission checks, elevated audit, correct blocked behavior |
| Tier 2 | Step-up gating, freshness/expiry, revalidation and no bypass |
| Tier 3 | Approval creation, approver eligibility, invalidation, execution-time recheck |
| Tier 4 | Emergency controls, stronger warnings, multi-approver or incident-linked governance, safe-fail rigor |

## 7. Tier 0 baseline scenarios

| Scenario family | Example checks |
|---|---|
| Standard allowed action | Action executes without unnecessary step-up/approval |
| Permission absence | Hidden or blocked correctly according to visibility policy |
| Audit baseline | Standard audit event emitted |
| UI alignment | Buttons enabled only when entity state supports action |
| Stale state | UI refresh/reload handles changed record state correctly |

### Example Tier 0 actions

- add support note;
- low-risk queue assignment;
- ordinary internal metadata update.

## 8. Tier 1 baseline scenarios

| Scenario family | Example checks |
|---|---|
| Explicit permission required | Authorized actor succeeds, unauthorized actor blocked |
| Elevated audit present | Reason codes and audit severity captured when required |
| State-dependent block | Action blocked when hold/state prevents operation |
| UI message quality | Blocked/manual path shown clearly without leaking internals |
| Bulk behavior | Mixed eligible/ineligible rows are split or blocked correctly |

### Example Tier 1 actions

- send regulated support communication;
- export low-sensitivity operational report;
- open standard compliance hold.

## 9. Tier 2 baseline scenarios

| Scenario family | Example checks |
|---|---|
| Step-up required | Policy decision returns `step_up_required` before execution |
| Step-up satisfied | Fresh proof allows next stage |
| Step-up expired | Expired proof forces re-authentication |
| Proof scope mismatch | Unrelated or insufficient proof rejected |
| Execution-time revalidation | Action rechecked immediately before execution |
| UI state handling | `Authenticate to continue` and post-auth state transitions correct |
| Safe-fail | Missing FX/risk context or evaluation error fails closed/manual review |

### Example Tier 2 actions

- reveal Class C field;
- single sensitive evidence download;
- standard payout release;
- KYC final approval.

## 10. Tier 3 baseline scenarios

| Scenario family | Example checks |
|---|---|
| Approval required | Policy decision returns `approval_required` |
| Approval request creation | Request object contains correct subject, policy snapshot, justification |
| Initiator/approver separation | Initiator cannot self-approve |
| Approver eligibility | Ineligible role cannot approve |
| Pending approval UI | Action shown as pending, not executable |
| Approval expiry | Expired request cannot be executed |
| Invalidation | Entity/policy/permission/context change invalidates approval |
| Execution after approval | Final command still revalidates before execution |
| Audit chain | Approval and execution events linked correctly |

### Example Tier 3 actions

- elevated payout release;
- bulk Class C export;
- privileged role grant;
- compliance hold release high-risk path.

## 11. Tier 4 baseline scenarios

| Scenario family | Example checks |
|---|---|
| Highest-tier routing | Action enters emergency or strongest governance path |
| Multi-approver requirements | Quorum and role diversity enforced where configured |
| Incident linkage | Incident ID required when policy says so |
| Break-glass warnings | UI uses strong constrained framing |
| Safe-fail under ambiguity | Unknown context or policy errors block/manual-review instead of allow |
| Post-action review | Mandatory review/audit trail created |
| Emergency rollback | Approval/config change rollback paths are governed and logged |

### Example Tier 4 actions

- break-glass activation;
- manual purge override;
- incident-linked emergency payout override;
- platform-wide sensitive config change.

## 12. Cross-tier comparison scenarios

These scenarios confirm that the same action family escalates correctly under different inputs.

| Scenario | Expected result |
|---|---|
| Payout below threshold vs above threshold | Tier 2 becomes Tier 3 at configured boundary |
| Standard export vs Class C bulk export | Tier 1/2 escalates to Tier 3 |
| Normal payout release vs incident-linked payout release | Tier raised by contextual floor |
| Single-record archive retrieval vs broad restore | Tier 2/3 escalates to Tier 4 where blast radius requires |
| Ordinary role grant vs privileged role grant | Tier 2 escalates to Tier 3/4 |

## 13. Threshold boundary scenarios

Threshold logic must be tested at exact boundaries.

### Required boundary sets

- below threshold;
- equal to threshold;
- just above threshold;
- multiple thresholds crossed;
- unknown/missing normalization input;
- currency/rail modifier lowering effective threshold.

### Validate

- monotonic escalation;
- no tier drop at higher exposure;
- correct FX normalization evidence recorded;
- correct rule IDs surfaced in evaluation result.

## 14. Currency and normalization scenarios

| Scenario family | Example checks |
|---|---|
| Cross-currency payout | Normalized value calculated deterministically |
| Missing FX rate | Safe-fail/manual review/block per policy |
| Stale FX rate | Rejected or escalated according to policy |
| Rail-specific modifier | Effective threshold lowered or min tier raised correctly |
| Provider-specific modifier | Override applies only in scoped provider context |

## 15. Data sensitivity scenarios

| Scenario family | Example checks |
|---|---|
| Class A/B/C/D handling | Correct minimum tier by data class |
| Reveal vs download vs export | Different controls applied per action mode |
| Archive source | Archive scope raises or preserves sensitivity tier |
| Cross-domain dataset | Combined domains escalate controls appropriately |
| Redaction leaks | Approval metadata/UI never exposes hidden data |

## 16. Velocity and anomaly scenarios

| Scenario family | Example checks |
|---|---|
| Repeated sensitive reveals | Velocity threshold escalates tier or requires review |
| Burst payout attempts | Additional control path triggered |
| Repeated permission changes | Escalation to higher tier or manual review |
| Unusual actor behavior | Contextual floor applied in decision |
| Alert emission | Security/ops alerts emitted where required |

## 17. Approval workflow scenarios

### Creation

- approval request created from authoritative `approval_required` decision;
- duplicate create with same correlation behaves idempotently where required;
- wrong subject or missing justification rejected.

### Resolution

- eligible approver can approve;
- ineligible approver blocked;
- initiator self-approval blocked by policy;
- rejection path ends workflow correctly;
- quorum behavior correct for single- and multi-approver policies.

### Lifecycle

- expiry transitions request to `expired`;
- cancellation allowed only where policy permits;
- invalidation triggered by state/policy/context change;
- approved state does not execute command automatically unless explicitly designed workflow does so.

## 18. Step-up authentication scenarios

### Core cases

- step-up required before Tier 2/Tier 3 execution;
- fresh proof accepted only within scope and time window;
- unrelated proof rejected;
- proof expiration during pending approval handled correctly;
- context change after proof issuance forces renewed proof when required.

### UI cases

- step-up modal/drawer keeps user context;
- failed step-up does not show success state;
- expired step-up returns CTA to auth-required state.

## 19. Revalidation scenarios

Revalidation is critical for stale or changing contexts.

| Trigger | Expected result |
|---|---|
| Entity state changed after approval | Approval invalidated or execution blocked |
| Permission changed after approval | Revalidation fails or requires new approval |
| Policy config changed | Action re-evaluated against active config |
| Incident mode activated | Tier raised or execution paused |
| Destination changed after step-up | Re-auth and/or new approval required |

## 20. Admin UI state scenarios

| UI state | Core assertions |
|---|---|
| `available` | Correct CTA, no hidden friction |
| `step_up_required` | Authentication CTA shown, direct execution hidden |
| `approval_required` | Request approval CTA shown, reason fields available |
| `pending_approval` | Non-executable state clearly displayed |
| `approved_pending_execution` | Not styled as final success, revalidation possible |
| `manual_review_required` | Routed to review path, not generic error |
| `blocked` | Safe explanation present, no sensitive leakage |
| `invalidated` | Prior approval state cleared and next step shown |
| `executing` | Duplicate submit prevented |
| `executed` | Success shown only after backend confirmation |
| `failed` | Failure distinct from blocked/manual review |

## 21. Bulk action scenarios

### Required cases

- all rows eligible and same tier;
- mixed Tier 1/Tier 2/Tier 3 rows;
- some rows blocked, some approval-required;
- selection changes after refresh/revalidation;
- bulk export with mixed data classes;
- partial backend conflict during execution.

### Validate

- summary counts by control path are correct;
- blocked rows are not silently ignored;
- user sees per-group outcome where mixed states exist.

## 22. Audit and observability scenarios

| Scenario family | Example checks |
|---|---|
| Tier 2+ evaluation | Correct audit event fields emitted |
| Approval creation/decision/execution | Correlation chain complete |
| Blocked/safe-fail outcomes | Audit still emitted |
| Config activation/rollback | High-severity audit events present |
| Metrics | Counters/latency/decision state metrics updated correctly |

## 23. Negative/security scenarios

### Must test

- forged UI state cannot bypass backend block;
- hidden button via DOM manipulation still blocked by backend;
- stale approval ID reused on changed entity fails;
- reused step-up proof outside scope fails;
- redacted config view does not expose exact thresholds;
- direct API call with unauthorized role blocked even if UI hid action.

## 24. Incident and break-glass scenarios

| Scenario family | Example checks |
|---|---|
| Incident activation | Context raises minimum tier |
| Break-glass action request | Strongest controls and warnings applied |
| Emergency approval routing | Correct special queue/role family used |
| Incident-linked config rollback | Approval/audit path enforced |
| Post-incident review artifact | Created and linked correctly |

## 25. Configuration lifecycle scenarios

### Validate

- invalid config rejected by schema validation;
- semantically invalid threshold ordering rejected;
- approved config activates only with required approval;
- concurrent activation conflict handled correctly;
- rollback switches to approved prior config;
- evaluation uses correct active config version after activation/rollback.

## 26. Regression suite grouping

Recommended suite grouping:

| Suite | Includes |
|---|---|
| Smoke | One representative scenario per tier and one safe-fail case |
| Critical money movement | Payout/payment/reconciliation high-risk flows |
| Sensitive data access | Reveal/download/export/archive controls |
| Approval workflow | Create/approve/reject/expire/invalidate/execute |
| Config governance | Validate/activate/rollback/version selection |
| Admin UI control states | UI mapping for core control outcomes |
| Incident and emergency | Incident floors, break-glass, emergency rollback |

## 27. Release gate recommendations

Before release, require at minimum:

- smoke suite pass;
- no failing Tier 3/Tier 4 money movement or permission-governance scenarios;
- no failing invalidation/revalidation scenarios;
- no failing hidden-data leakage scenarios;
- explicit signoff for known deviations in policy/UI alignment.

## 28. Traceability matrix recommendations

Link every scenario back to:

- action family;
- control tier;
- policy spec section;
- UI state mapping section;
- service contract endpoint;
- approval workflow state if applicable.

### Principle

A failing test should immediately tell which control contract was violated.

## 29. Anti-patterns to avoid

- testing only happy-path approval flows;
- validating UI labels without validating backend decision artifacts;
- skipping exact threshold-boundary cases;
- treating `approved` as equivalent to `executed` in tests;
- ignoring stale-tab and state-change revalidation scenarios;
- omitting audit assertions for blocked/safe-fail outcomes.

## 30. Related documents

Use together with:

- `admin-ui-control-state-map.md`
- `approval-workflow-schema.md`
- `policy-evaluation-service-contract.md`
- `machine-readable-threshold-configuration-schema.md`
- `threshold-catalog-by-currency-data-class-action-family.md`
- `action-to-control-tier-matrix.md`
- `step-up-authentication-and-dual-control-policy-spec.md`