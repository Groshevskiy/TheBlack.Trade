# Provider Contract & Operations Pack — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: Finance Ops + Backend + Security
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `provider-capability-matrix.md`
  - `payment-provider-and-payout-integration-spec.md`
  - `wallet-and-exchange-provider-integration-spec.md`
- Related documents:
  - `api-versioning-openapi-governance-and-deprecation-policy.md`
  - `sanctions-travel-rule-and-transaction-monitoring-operations-spec.md`
  - `contract-test-matrix.md`
  - `webhook-verification-and-replay-defense-spec.md`

## 1. Purpose

This document defines the required contract and operational control model for external providers used by TheBlack.Trade, especially payment, payout, wallet, exchange, verification and messaging partners. It complements capability and integration specs by setting minimum expectations for reliability, callback behavior, reconciliation support, incident handling, escalation and controlled provider lifecycle management.

## 2. Goals

The provider pack must:

- standardize external dependency expectations;
- reduce ambiguity across multiple provider integrations;
- define operational, financial and security obligations;
- make outage and replay behavior contractually and operationally explicit;
- support onboarding, fallback and offboarding decisions.

## 3. Provider categories

| Category | Examples of responsibility |
|---|---|
| Payment provider | Inbound fiat collection, payment confirmation, settlement references |
| Payout provider | Outbound transfer execution, status callbacks, beneficiary verification |
| Wallet/custody provider | Addressing, balance, transfer execution, operational limits |
| Exchange/liquidity provider | Quote, conversion execution, liquidity depth, settlement |
| Verification/KYC provider | Identity checks, sanctions/AML screening, case references |
| Messaging provider | Email/SMS/push delivery and callback status |

## 4. Minimum contract domains

Every strategic provider relationship should document expectations in these domains:

- scope of business function;
- uptime/availability target or practical reliability expectation;
- callback/webhook semantics;
- replay/idempotency behavior;
- latency and timeout expectations;
- financial reporting and reconciliation deliverables;
- security requirements;
- data handling and retention constraints;
- escalation contacts and incident obligations;
- change notification policy;
- exit/offboarding obligations.

## 5. Functional contract checklist

| Area | Required question |
|---|---|
| Capability | What exact functions does the provider own and what is out of scope? |
| State model | Which raw provider states exist and how do they map to canonical platform states? |
| Reference model | Which provider IDs, settlement refs and trace keys are guaranteed stable? |
| Failure semantics | How are pending, failed, reversed, duplicated or timed-out actions reported? |
| Replay semantics | Can callbacks replay? Are ordering guarantees absent? |
| Consistency model | Is data strongly consistent, eventually consistent or batch reconciled? |

## 6. Webhook and callback requirements

Providers that emit callbacks must support or be normalized into the following expectations:

- stable event identifiers or replay-detection keys;
- signed or otherwise verifiable callback origin;
- timestamp availability where possible;
- documented retry/replay behavior;
- no assumption of in-order delivery;
- explicit event typing or state payloads sufficient for canonical mapping.

If a provider cannot meet these conditions natively, platform compensating controls must be documented.

## 7. Idempotency and duplicate protection

Provider operations should define:

- client-generated idempotency keys where supported;
- duplicate detection strategy where not supported;
- retry policy boundaries;
- ambiguity handling for timed-out requests;
- replay-safe callback processing expectations.

No provider integration should depend on exactly-once delivery assumptions.

## 8. Financial and reconciliation obligations

Providers affecting money movement must support:

- stable references for matching inbound/outbound events;
- statement, batch or settlement data sufficient for reconciliation;
- documented settlement timing model;
- treatment of reversals, chargebacks, rejects and manual corrections;
- dispute/escalation path for mismatched balances or statuses.

## 9. Security and data handling expectations

Providers should be assessed for:

- secret/key handling model;
- callback signature or origin verification;
- supported IP allowlisting or equivalent controls;
- data minimization support;
- retention and deletion posture for sensitive data;
- auditability of high-risk actions or identity checks.

## 10. Operational support requirements

Every critical provider should have an operational profile including:

- support channels and escalation path;
- business-hours vs 24/7 support expectations;
- severity definitions and target response times;
- maintenance notification lead time;
- emergency incident notification obligations;
- status-page or operational signal source if available.

## 11. Degraded-mode and fallback planning

Each critical provider integration must answer:

- what happens if the provider is unavailable;
- whether intake can continue in queued or evidence-only mode;
- whether payouts must freeze entirely;
- whether an alternate provider can safely take over;
- what reconciliation is required after fallback or restore.

## 12. Provider onboarding gate

Before activating a provider in production, require:

- capability fit review;
- contract and operations checklist completion;
- state mapping and callback mapping approved;
- reconciliation evidence sample reviewed;
- secret management and webhook verification configured;
- incident/escalation contacts recorded;
- test and sandbox scenarios completed;
- rollback/off switch documented.

## 13. Provider offboarding gate

Before provider retirement, require:

- settlement and reconciliation closure;
- open disputes/incidents reviewed;
- secrets and credentials revoked;
- retained evidence/export obligations satisfied;
- historical references preserved for audit;
- fallback/cutover to replacement completed safely.

## 14. Suggested provider scorecard

| Dimension | Low concern | Medium concern | High concern |
|---|---|---|---|
| Callback reliability | Stable signed callbacks, replay documented | Partial documentation | Unclear or unreliable delivery |
| Reconciliation support | Rich reference and settlement data | Limited daily exports | Poor or manual-only matching |
| Incident response | Clear escalation and SLA | Slow but workable support | Weak or undefined response path |
| Security controls | Signed callbacks, strong auth, good hygiene | Some controls missing | Major verification gaps |
| Operational fit | Clean state mapping, clear docs | Moderate complexity | High ambiguity or hidden manual steps |

## 15. Mandatory artifacts per provider

For every production provider maintain:

- integration spec;
- capability matrix entry;
- callback/state mapping;
- credential and secret ownership record;
- reconciliation method summary;
- incident escalation sheet;
- fallback/disablement procedure;
- provider-specific contract test coverage.

## 16. Recommended related documents

- `provider-capability-matrix.md`
- `payment-provider-and-payout-integration-spec.md`
- `wallet-and-exchange-provider-integration-spec.md`
- `reconciliation-and-ledger-spec.md`
- `webhook-verification-and-replay-defense-spec.md`
- `contract-test-matrix.md`