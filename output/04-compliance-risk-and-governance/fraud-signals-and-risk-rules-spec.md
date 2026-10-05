## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Compliance + Risk Operations
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `action-to-control-tier-matrix.md`
  - `policy-evaluation-service-contract.md`
- Related documents:
  - `sanctions-travel-rule-and-transaction-monitoring-operations-spec.md`
  - `approval-workflow-schema.md`
  - `step-up-authentication-and-dual-control-policy-spec.md`
  - `acceptance-test-catalog.md`

# Fraud Signals & Risk Rules Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает fraud/risk layer платформы TheBlack.Trade: какие сигналы считаются подозрительными, как они классифицируются, какие risk rules и decision actions применяются, как risk controls взаимодействуют с orders, payments, payouts, KYC, wallets/requisites, notifications и operational review.

Документ предназначен для product, backend, operations, compliance, finance, support, analytics и management.

## 2. Цели документа

Fraud/risk framework должен обеспечивать:

- раннее обнаружение подозрительных паттернов;
- снижение вероятности financial loss, duplicate payout, abuse и policy violations;
- единый vocabulary для risk/compliance/ops решений;
- воспроизводимость manual-review and escalation logic;
- безопасную основу для selective automation в будущем.

## 3. Scope

Документ покрывает:

- taxonomy of risk signals;
- rule model and severity model;
- risk actions and escalation;
- risk interaction with state machine and manual review;
- examples of rules by domain;
- operational handling expectations;
- governance and tuning principles.

## 4. Core principles

1. **Risk signals are indicators, not automatic guilt.**
2. **Financially dangerous actions must fail safe into review/hold when uncertainty is high.**
3. **Risk controls must be explainable to internal reviewers.**
4. **Customer-facing messaging should stay safe, neutral and non-accusatory.**
5. **Risk rules must be tunable and auditable.**
6. **Manual-review-first remains the default initial operating mode.**

## 5. Risk object model

Fraud/risk layer должна оперировать следующими logical objects:

- risk signal;
- risk rule;
- risk hit / rule match;
- risk case;
- risk score or severity summary;
- risk decision action;
- risk review note / evidence.

## 6. Risk signal taxonomy

| Category | Description |
|---|---|
| Identity risk | Suspicious or inconsistent identity/KYC patterns |
| Payment risk | Suspicious payment behavior or mismatch |
| Payout risk | Risk around outbound funds or destination |
| Wallet/requisite risk | Suspicious crypto address / bank detail behavior |
| Velocity risk | Unusual frequency, repetition or amount escalation |
| Behavioral risk | Abnormal flow behavior, retries, change patterns |
| Device/session risk | Suspicious session/access context where available |
| Provider anomaly | Conflicting or unreliable provider signals |
| Reconciliation risk | Financial inconsistencies requiring investigation |
| Incident-linked risk | Elevated caution during degraded or unstable system periods |

## 7. Severity model

| Severity | Meaning |
|---|---|
| Low | Signal recorded, no immediate block; monitor or annotate |
| Medium | Requires additional review before some sensitive action |
| High | Must trigger hold, restricted progression or specialist review |
| Critical | Immediate stop/freeze/escalation due to high loss or policy risk |

## 8. Rule model

Каждое правило должно иметь:

- rule id and name;
- description;
- signal category;
- trigger conditions;
- severity;
- scope (order/payment/payout/customer/wallet/etc.);
- action on hit;
- suppressions/exceptions if any;
- owner;
- review/tuning cadence.

## 9. Risk actions

| Action | Meaning |
|---|---|
| Flag only | Record signal without blocking flow |
| Require additional evidence | Need more documents/details before progression |
| Route to manual review | Specialized human review required |
| Open hold | Prevent sensitive progression until reviewed |
| Restrict payout/release | Stop outbound funds movement |
| Restrict provider/method/network | Disable risky path for this case |
| Escalate to compliance | Sensitive or suspicious case escalation |
| Escalate to finance | Financial integrity or payout anomaly |
| Escalate to incident path | If risk is linked to systemic instability |

## 10. State machine interaction

Risk layer должна уметь влиять на lifecycle, но не ломать canonical state machine semantics.

### Principles

- risk flags могут открывать prerequisite hold states;
- high/critical hits могут блокировать progression to payout or completion;
- risk resolution должна быть explicit and auditable;
- customer-facing status должен оставаться безопасным и не раскрывать внутреннюю fraud logic.

## 11. Identity and KYC risk signals

Examples:

- repeated failed KYC attempts by the same customer;
- conflicting identity/profile data across submissions;
- rapid profile edits near payout-sensitive steps;
- suspicious remediation loop patterns;
- mismatch between provided data and expected records where applicable.

### Typical actions

- request additional evidence;
- route to compliance review;
- open temporary hold on progression;
- mark customer for enhanced monitoring.

## 12. Payment risk signals

Examples:

- expected vs received amount mismatch beyond tolerance;
- repeated submission of unclear or inconsistent payment evidence;
- duplicate or conflicting payment references;
- payment evidence timing inconsistent with order timeline;
- suspicious burst of failed/retried payment submissions;
- provider callback status conflicts with evidence submitted.

### Typical actions

- flag for payment review;
- request additional proof;
- open discrepancy case;
- prevent auto-confirmation;
- escalate to finance/compliance depending on context.

## 13. Payout risk signals

Examples:

- payout requested shortly after sensitive profile or requisite change;
- repeated payout retries to same or changing destination;
- amount/rhythm unusual for customer history or phase limits;
- payout target linked to unresolved discrepancy or hold;
- provider reports ambiguous or unstable payout state.

### Typical actions

- enforce manual release;
- place payout hold;
- require higher-level approval;
- escalate to finance/compliance;
- disable payout path pending verification.

## 14. Wallet / requisite risk signals

Examples:

- frequent changes of wallet address or bank details;
- destination/source data fails validation repeatedly;
- same destination reused across suspiciously unrelated profiles where detectable by policy;
- last-minute destination change before release/transfer;
- unsupported/inconsistent network or format pattern.

### Typical actions

- require re-verification;
- hold linked order progression;
- route to wallet/requisites review queue;
- restrict payout/transfer until cleared.

## 15. Velocity and amount risk signals

Examples:

- unusual burst of order creation attempts;
- rapid increase in order size;
- multiple similar operations in compressed time window;
- repeated cancellation/recreation loops;
- repeated attempts just below configured manual thresholds.

### Typical actions

- flag customer/account for manual review;
- apply tighter limits;
- require compliance approval for progression;
- slow down or temporarily restrict specific paths.

## 16. Behavioral and workflow risk signals

Examples:

- repeated status-friction loops (submit → reject → resubmit);
- unusual support/escalation patterns linked to one customer/order cluster;
- excessive retries across payment, wallet, KYC and payout steps;
- conflicting operator notes or repeated reopen patterns;
- attempt to force workflow progression through multiple channels.

### Typical actions

- open investigation case;
- supervisor review;
- enhanced notes requirement;
- no automation allowed for this case.

## 17. Provider anomaly signals

Examples:

- provider callback delays beyond expected threshold;
- conflicting provider statuses;
- provider incident or degraded-state warning;
- missing reconciliation identifiers;
- repeated transport failures causing uncertain state.

### Typical actions

- disable auto progression for affected provider path;
- force manual review;
- open incident-linked risk cases;
- restrict rollout scope temporarily.

## 18. Reconciliation-linked signals

Examples:

- order appears completed but ledger linkage incomplete;
- payment/payout amount mismatch in reconciliation layer;
- missing settlement evidence;
- duplicate financial records or ambiguous matching candidate.

### Typical actions

- open discrepancy case;
- block completion/closure;
- finance review mandatory;
- pause downstream actions like receipts or expanded payouts when relevant.

## 19. Incident-linked dynamic risk rules

Во время active incident или degraded mode risk posture должен становиться строже.

### Examples

- disable low-confidence automations;
- force manual payment confirmation;
- force payout manual release on affected methods/providers;
- suppress risky customer promises in notifications;
- require supervisor approval for sensitive actions.

## 20. Example rule table

| Rule ID | Trigger | Severity | Action |
|---|---|---|---|
| RISK-PAY-001 | Payment amount mismatch beyond tolerance | Medium | Payment review + possible discrepancy |
| RISK-PAY-002 | Conflicting provider callback vs submitted evidence | High | Hold + finance/compliance review |
| RISK-PAYOUT-001 | Payout target changed near release | High | Payout hold + re-verification |
| RISK-WALLET-001 | Repeated invalid wallet/network combinations | Medium | Wallet review required |
| RISK-KYC-001 | Repeated failed KYC with conflicting profile edits | High | Compliance review + hold |
| RISK-VEL-001 | Rapid burst of orders under threshold band | Medium | Manual review flag |
| RISK-REC-001 | Completion attempted with unresolved discrepancy | Critical | Block completion |
| RISK-INC-001 | Provider instability during payout processing | High | Disable automation + manual release only |

## 21. Customer-facing communication principles

При срабатывании risk controls customer messaging должно:

- быть нейтральным;
- не раскрывать internal fraud logic;
- объяснять next step безопасным языком;
- избегать обвиняющих формулировок;
- сохранять consistency со статусной моделью и support scripts.

### Examples of safe explanations

- “Требуется дополнительная проверка.”
- “Для завершения операции нужны дополнительные данные.”
- “Выплата временно ожидает подтверждения.”

## 22. Manual review expectations

Каждый high or critical risk case должен позволять reviewer увидеть:

- triggered signals/rules;
- timeline of relevant events;
- linked customer/order/payment/payout context;
- prior similar hits if policy allows;
- current holds/restrictions;
- recommended next actions.

## 23. False positives and tuning

Risk framework должен учитывать, что часть сигналов будет ложноположительной.

### Governance principles

- rules must be reviewed periodically;
- false positive patterns should be measured;
- severe rules require stricter evidence before automation;
- tuning changes must be documented.

## 24. Metrics for risk quality

Следует измерять:

- risk hit volume by rule;
- false positive rate where determinable;
- manual override rate;
- hold-to-clear time;
- payout/payment incidents prevented;
- rules causing excessive friction;
- correlation between rule hits and confirmed discrepancy/issue outcomes.

## 25. Ownership and governance

Каждое правило должно иметь owner, а вся fraud/risk library — governance model.

### Governance responsibilities

- approve new rules;
- retire obsolete rules;
- tune thresholds;
- assess rollout implications;
- review incident-driven temporary rules;
- coordinate with analytics, compliance, finance and operations.

## 26. Access and sensitivity

Risk data — чувствительный внутренний слой.

### Principles

- customer-facing teams видят only what they need;
- support не должен автоматически видеть всю внутреннюю risk logic;
- finance/compliance/operations access определяется role model;
- exported reports with raw risk signals should be restricted.

## 27. Testing expectations for risk rules

Risk rules themselves require testing.

### Need to validate

- rule trigger correctness;
- severity mapping;
- no unsafe auto-progression after hit;
- correct hold/review routing;
- correct customer-safe messaging projection;
- correct audit/event generation.

## 28. Rollout policy for new rules

Новые rules should not be enabled blindly in broad production scope.

### Recommended rollout path

1. Document rule and intent.
2. Validate in test/staging.
3. Enable as flag-only or shadow mode if possible.
4. Review hit quality.
5. Promote to active enforcement for limited cohort.
6. Expand after evidence review.

## 29. Related documents

Использовать вместе с:

- `compliance-and-legal-operations-spec.md`
- `admin-review-decision-matrix.md`
- `theblack-trade-order-state-machine-spec.md`
- `transaction-status-state-machine-spec.md`
- `payment-provider-and-payout-integration-spec.md`
- `wallet-and-exchange-provider-integration-spec.md`
- `reconciliation-and-ledger-spec.md`
- `analytics-and-reporting-spec.md`
- `operations-runbook-and-sla-spec.md`