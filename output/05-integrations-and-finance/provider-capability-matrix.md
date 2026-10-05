## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Finance Ops + Backend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `provider-contract-and-operations-pack.md`
- Related documents:
  - `payment-provider-and-payout-integration-spec.md`
  - `wallet-and-exchange-provider-integration-spec.md`
  - `release-readiness-and-rollout-plan.md`

# Provider Capability Matrix — TheBlack.Trade

## 1. Назначение документа

Этот документ задает единый framework для оценки и выбора внешних провайдеров TheBlack.Trade: платежных сервисов, payout-провайдеров, crypto wallet / custody / exchange integrations, KYC/verification vendors, email/document delivery services и observability providers.

Матрица не выбирает конкретного вендора автоматически. Ее задача — превратить vendor selection в проверяемое решение на основе обязательных capabilities, operational fit, compliance constraints, reliability, integration cost и safe rollout requirements.

## 2. Цели документа

Provider evaluation должна обеспечивать:

- сравнимость кандидатов по одинаковым критериям;
- соответствие business flows и manual-review-first модели;
- безопасное разделение sandbox/test и production режимов;
- возможность быстрых disable/fallback действий;
- достаточную observability and auditability;
- отсутствие vendor lock-in без осознанного решения.

## 3. Scope

Матрица покрывает следующие provider families:

- payment acceptance;
- payout/disbursement;
- wallet, custody and exchange connectivity;
- blockchain/transaction monitoring where applicable;
- KYC/identity verification;
- email/notification delivery;
- document/receipt delivery;
- observability / error monitoring.

## 4. Provider selection principles

1. **Capabilities before brand recognition.**
2. **Production reliability must be proven, not assumed.**
3. **Manual fallback must exist for money-moving critical paths.**
4. **Webhook/event integrity and idempotency are mandatory.**
5. **Sandbox behavior must be sufficiently representative for testing.**
6. **Provider integration must be observable, disableable and auditable.**
7. **Data and legal constraints must be reviewed before technical integration.**

## 5. Capability categories

| Category | Meaning |
|---|---|
| Functional fit | Can provider support required buy/sell/payment/payout/wallet flow? |
| API & integration | API quality, auth, SDK/webhook, idempotency, versioning |
| Reliability | SLA, uptime, callback delivery, operational maturity |
| Security | Credentials, signing, IP controls, access isolation |
| Compliance & legal | Contracting, data processing, regional/legal fit |
| Operations | Manual fallback, support, incident communication, reconciliation |
| Observability | Status visibility, event logs, trace identifiers, monitoring hooks |
| Testability | Sandbox, test data, deterministic test cases |
| Commercial fit | Pricing, limits, settlement, contract constraints |
| Exit / portability | Data export, migration, vendor lock-in risk |

## 6. Mandatory baseline requirements

Любой provider для критичного financial or identity flow должен соответствовать минимуму:

- documented API and webhook/event model;
- secure credential management;
- sandbox or controlled test path;
- idempotency support or implementable idempotency wrapper;
- stable external identifiers;
- monitoring/audit visibility;
- provider-specific disable capability;
- incident/support escalation route;
- documented limitation/limit model;
- usable manual fallback process.

Если один из mandatory baseline requirements отсутствует, provider cannot be used for broad automated rollout without explicit risk approval.

## 7. Provider family matrix

| Provider family | Primary use | Critical requirements | Initial rollout mode |
|---|---|---|---|
| Payment acceptance | Receiving fiat payment evidence/status | Callback reliability, status lookup, idempotency, reconciliation IDs | Manual review mandatory |
| Payout/disbursement | Sending fiat payout | Hold/release controls, duplicate payout protection, status polling/webhooks | Manual release mandatory |
| Wallet/custody/exchange | Destination/source connection, asset transfer support | Address/network validation, account identifiers, permission scope | Manual verification for early rollout |
| KYC/identity | Identity verification support | Decision evidence, retry/resubmit, data protection, review overrides | Review-gated |
| Blockchain monitoring | Transaction observation/risk support | Network coverage, confirmation tracking, stable tx identifiers | Advisory/manual-review support |
| Email delivery | Transactional communication | Delivery events, suppression/bounce handling, template support | Automated with monitoring |
| Document delivery | Receipt/document access/delivery | Access control, resend/reissue support, immutable linkage | Automated with fallback |
| Observability | Errors/logs/metrics/alerts | Data minimization, alert routing, retention/export | Continuous |

## 8. Payment acceptance provider matrix

| Capability | Mandatory | Preferred | Test method |
|---|---|---|---|
| Payment initiation / payment reference | Yes | Configurable expiration and metadata | Create controlled payment scenario |
| Callback/webhook on status change | Yes | Signed callback + retries | Verify valid, duplicate, delayed callbacks |
| Status lookup API | Yes | Near-real-time and historical lookup | Compare callback vs pull status |
| Idempotency support | Yes | Native idempotency keys | Repeat same request/callback |
| Stable provider payment ID | Yes | Correlation metadata support | Trace end-to-end order/payment |
| Refund/cancel support if in scope | Conditional | Reason codes and status history | Sandbox scenario |
| Reconciliation export/report | Yes | API/export with settlement linkage | Compare provider vs internal ledger |
| Sandbox/test mode | Yes | Representative behavior | Execute test journey |
| Provider outage visibility | Yes | Status page/incident notifications | Simulate fallback runbook |
| Provider disable switch | Yes | Granular by method/segment | Toggle in staging |

## 9. Payout provider matrix

| Capability | Mandatory | Preferred | Test method |
|---|---|---|---|
| Payout creation API | Yes | Pre-validation and rich metadata | Create controlled payout |
| Manual hold/release compatibility | Yes | Native approval support | Verify blocked release path |
| Duplicate payout prevention | Yes | Idempotency + beneficiary validation | Retry create/release calls |
| Payout status callback/polling | Yes | Signed event and detailed reasons | Validate delayed/failure status |
| Stable payout identifier | Yes | Settlement/reference fields | Correlate with order/ledger |
| Failure/retry semantics | Yes | Explicit terminal vs retriable reason codes | Force failed scenario |
| Limits / velocity controls | Yes | Configurable by cohort | Validate limit breach behavior |
| Reconciliation/settlement reporting | Yes | Export/API with payout details | Reconcile test dataset |
| Emergency freeze / disable | Yes | Provider or method scoped switch | Run freeze drill |
| Manual fallback procedure | Yes | Documented provider support path | Tabletop + staging proof |

## 10. Wallet, custody and exchange matrix

| Capability | Mandatory | Preferred | Test method |
|---|---|---|---|
| Supported networks/assets | Yes | Clear versioned coverage list | Verify target pairs |
| Address/account identifier validation | Yes | Network-aware validation | Submit valid/invalid addresses |
| Destination/source ownership evidence | Conditional | Provider-assisted verification | Review evidence workflow |
| API scopes / least privilege | Yes | Granular read vs transfer scopes | Inspect token permissions |
| Withdrawal/deposit status visibility | Yes | Webhooks + polling | Track controlled transaction |
| Transaction identifiers | Yes | Confirmation count/history | Correlate tx to order |
| Callback/event reliability | Preferred | Signed/retried events | Duplicate/delay test |
| Limits / whitelists / allowlists | Preferred | Per-network controls | Validate restriction path |
| Manual provider disable | Yes | Segment/network scoped | Test disable/re-enable |
| Sandbox/testnet availability | Preferred | High fidelity testnet | Execute testnet flow |
| Export / exit ability | Yes | Standard export/API | Review data portability |

## 11. KYC / identity provider matrix

| Capability | Mandatory | Preferred | Test method |
|---|---|---|---|
| Applicant/session creation | Yes | Metadata/correlation fields | Create test application |
| Decision/status API | Yes | Detailed reason codes | Validate status projection |
| Webhook/event support | Preferred | Signed/retried events | Test delayed event |
| Manual override/review compatibility | Yes | Operator evidence UI/API | Verify review-gated behavior |
| Re-submit / remediation path | Yes | Partial resubmission | Test reject → resubmit |
| Evidence references | Yes | Download/export-controlled evidence | Verify audit linkage |
| Data processing/legal fit | Yes | Configurable retention/region | Legal review |
| Sandbox/test applicants | Yes | Deterministic scenarios | Run known outcomes |
| Provider disable fallback | Yes | Internal manual KYC path | Validate degraded mode |

## 12. Email and notification provider matrix

| Capability | Mandatory | Preferred | Test method |
|---|---|---|---|
| Transactional send API | Yes | Template version support | Send staging template |
| Delivery/bounce/complaint events | Yes | Webhook + historical query | Simulate/inspect events |
| Suppression control | Yes | Per-recipient reason visibility | Test suppression flow |
| Retry behavior | Yes | Configurable retry policy | Force transient error |
| Template variables | Yes | Validation/preview | Validate order copy payload |
| Environment separation | Yes | Safe staging domain/sink | Verify no real-customer send |
| Emergency pause | Yes | Category/template scoped | Test emergency mode |
| Audit/export | Preferred | Event/recipient delivery logs | Check audit mapping |

## 13. Document and receipt delivery matrix

| Capability | Mandatory | Preferred | Test method |
|---|---|---|---|
| Secure customer access | Yes | Expiring/signed access model | Verify authenticated access |
| Delivery event/status | Yes | Callback/webhook | Test success/failure |
| Resend support | Yes | Rate-limited self-service | Verify resend action |
| Re-issue compatibility | Yes | Version lineage support | Verify corrected document path |
| Immutable document linkage | Yes | Document hash/version metadata | Audit test |
| Storage/data retention fit | Yes | Export/archive support | Retention review |
| Failure fallback | Yes | Queue/retry/ops follow-up | Force delivery failure |

## 14. Observability provider matrix

| Capability | Mandatory | Preferred | Test method |
|---|---|---|---|
| Error tracking | Yes | Release/version correlation | Trigger controlled error |
| Logs/search | Yes | Structured search with correlation IDs | Trace test order |
| Metrics/dashboards | Yes | SLO/queue/provider widgets | Verify dashboard data |
| Alerts | Yes | Routing/escalation policies | Test alert delivery |
| Data minimization | Yes | Scrubbing/masking controls | Inspect payloads |
| Export/retention | Preferred | Configurable archival | Review retention path |
| Environment separation | Yes | Source tagging | Verify dev/stage/prod isolation |

## 15. Security evaluation checklist

For every candidate, verify:

- authentication methods and key rotation;
- webhook signing/verification;
- allowed IP/network controls where relevant;
- least-privilege API scopes;
- account/user role model;
- audit/event logging;
- incident notification process;
- data encryption and retention claims;
- credential revocation path.

## 16. Operational evaluation checklist

For every candidate, verify:

- support channel and escalation SLA;
- incident communication method;
- maintenance-window behavior;
- rate limits and throttling;
- manual fallback procedure;
- reconciliation/reporting availability;
- known failure modes and retry recommendations;
- launch/rollout limits;
- provider-specific runbook requirements.

## 17. Testability evaluation checklist

For every candidate, verify:

- sandbox availability;
- sandbox parity limitations;
- test credentials process;
- deterministic scenario support;
- webhook replay/test tools;
- test data reset/cleanup behavior;
- production pilot constraints;
- availability of testnet for blockchain flows where relevant.

## 18. Scoring model

Рекомендуется оценивать каждого кандидата по 0–5 для каждого критерия.

| Score | Meaning |
|---|---|
| 0 | Capability absent or unacceptable |
| 1 | Weak / heavily manual workaround required |
| 2 | Partial fit with meaningful constraints |
| 3 | Acceptable fit for controlled launch |
| 4 | Strong fit with manageable constraints |
| 5 | Excellent fit and operationally mature |

### Suggested weighting

| Dimension | Suggested weight |
|---|---|
| Functional fit | 20% |
| Reliability and operational maturity | 20% |
| Security and compliance fit | 15% |
| API / integration quality | 15% |
| Manual fallback / rollout control | 10% |
| Observability and reconciliation | 10% |
| Testability | 5% |
| Commercial / exit fit | 5% |

The weighted score supports discussion but must not override mandatory requirements or legal/compliance blockers.

## 19. Candidate evaluation template

| Field | Entry |
|---|---|
| Provider name |  |
| Provider family |  |
| Use case / flow |  |
| Regions / methods / networks supported |  |
| Sandbox verified |  |
| Production pilot constraints |  |
| Mandatory requirement gaps |  |
| Key risks |  |
| Manual fallback |  |
| Disable/containment method |  |
| Security review result |  |
| Compliance/legal review result |  |
| Weighted score |  |
| Decision | Approve / Approve with constraints / Pilot only / Reject |
| Owner and review date |  |

## 20. Provider onboarding gates

A provider should not be promoted to production use until:

1. Technical integration review passed.
2. Sandbox or controlled test journey completed.
3. Security review completed.
4. Legal/compliance fit confirmed.
5. Operational runbook and escalation route prepared.
6. Observability and audit correlation verified.
7. Disable/fallback path tested.
8. Rollout cohort and transaction limits approved.

## 21. Production pilot rules

Initial production provider rollout should:

- start with limited cohorts/methods/networks;
- use conservative limits;
- retain manual review for money movement;
- actively monitor callbacks, failures and reconciliation;
- define pause/disable conditions in advance.

## 22. Vendor lock-in and exit considerations

Before selection, assess:

- ability to export records and reports;
- portability of identifiers and historical evidence;
- migration complexity;
- contract termination constraints;
- dependence on proprietary workflow or custody model;
- availability of alternate provider / manual fallback.

## 23. Decision record requirements

Каждое решение по provider должно иметь documented decision record с:

- candidate comparison;
- mandatory requirements evidence;
- risk assessment;
- scoring and rationale;
- chosen rollout limits;
- owner and review cadence;
- exit/fallback plan.

## 24. Related documents

Использовать вместе с:

- `payment-provider-and-payout-integration-spec.md`
- `wallet-and-exchange-provider-integration-spec.md`
- `environment-and-deployment-spec.md`
- `test-strategy-and-qa-plan.md`
- `release-readiness-and-rollout-plan.md`
- `production-readiness-checklist.md`
- `operations-runbook-and-sla-spec.md`
- `reconciliation-and-ledger-spec.md`