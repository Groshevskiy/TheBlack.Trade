## Document metadata

- Status: active
- Role: Companion spec
- Owner: Compliance + Finance Ops
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `action-to-control-tier-matrix.md`
- Related documents:
  - `machine-readable-threshold-configuration-schema.md`
  - `policy-evaluation-service-contract.md`

# Threshold Catalog by Currency, Data Class & Action Family — TheBlack.Trade

## 1. Назначение документа

Этот документ задает governance framework для quantitative и qualitative thresholds, которые повышают control tier для чувствительных действий в TheBlack.Trade. Он дополняет Action-to-Control Tier Matrix, определяя как суммы, валюты, объемы, data sensitivity classes, time windows, anomaly indicators и blast-radius factors переводят действие на более высокий уровень контроля.

Документ является policy baseline, а не финальной production-конфигурацией. Конкретные значения должны быть утверждены Finance, Risk, Compliance, Security и Operations до запуска и храниться в versioned configuration registry.

## 2. Цели документа

Catalog должен обеспечивать:

- единый способ определения Tier 2, Tier 3 и Tier 4 escalation;
- предсказуемое применение control policies по currencies, data classes и action families;
- разделение baseline threshold и context-driven escalation;
- гибкость для provider, jurisdiction, product и operational-risk особенностей;
- auditability для каждой threshold-based policy decision.

## 3. Scope

Документ покрывает:

- currency/value normalization;
- financial action thresholds;
- data class and export thresholds;
- volume, velocity and blast-radius thresholds;
- contextual risk multipliers;
- action-family catalog;
- configuration governance and review;
- API/UI and QA implications.

## 4. Core principles

1. **Thresholds are policy controls, not merely numeric limits.**
2. **A threshold decision should be explainable from current action context.**
3. **Cross-currency comparisons use a governed normalized reference value.**
4. **The higher control tier wins when multiple rules apply.**
5. **Risk signals, incidents and sensitive data may escalate controls even below numeric thresholds.**
6. **No threshold catalog should create an implicit right to execute actions that role policy otherwise forbids.**

## 5. Control-tier mapping

| Resulting tier | Minimum control outcome |
|---|---|
| Tier 0 | Standard authorization and audit |
| Tier 1 | Explicit action permission and elevated audit |
| Tier 2 | Explicit permission plus step-up authentication |
| Tier 3 | Step-up plus dual-control before execution |
| Tier 4 | Strong step-up, dual-control, heightened monitoring and incident/emergency linkage |

## 6. Currency normalization model

### Reference currency

All cross-currency thresholds should be evaluated against a policy-approved reference currency, referred to here as `BASE_CURRENCY`.

### Normalized value formula

\[
normalized_value = action_amount \times approved_fx_rate(action_currency, BASE_CURRENCY, evaluation_time)
\]

### FX policy requirements

- use approved source/rate type by action family;
- record FX rate, timestamp and source used for threshold decision;
- define fallback behavior when rate unavailable;
- do not silently treat unavailable FX conversion as low-risk.

## 7. Threshold parameter naming

Recommended parameter naming:

- `payout_release_tier3_base_value`
- `payout_release_tier4_base_value`
- `payment_override_tier3_base_value`
- `payment_override_tier4_base_value`
- `bulk_export_tier3_record_count`
- `archive_restore_tier3_record_count`
- `sensitive_reveal_velocity_threshold`
- `config_change_tier4_blast_radius`

## 8. Financial threshold baseline

The following bands are **configuration placeholders** and must be calibrated before production.

| Action family | Tier 2 baseline | Tier 3 escalation | Tier 4 escalation | Notes |
|---|---:|---:|---:|---|
| Payout release | Any payout requires step-up | `>= PAYOUT_T3_BASE` | `>= PAYOUT_T4_BASE` or emergency/incident context | Base tier may already be Tier 2 |
| Payout cancel/return override | Any manual override requires step-up | `>= PAYOUT_OVERRIDE_T3_BASE` | `>= PAYOUT_OVERRIDE_T4_BASE` or provider uncertainty + incident | Include stage of payout execution |
| Payment confirmation override | Any override requires step-up | `>= PAYMENT_OVERRIDE_T3_BASE` | `>= PAYMENT_OVERRIDE_T4_BASE` or fraud/high mismatch severity | Do not use for ordinary automatic confirmations |
| Payment mismatch resolution | Step-up for material mismatch | `>= MISMATCH_T3_BASE` | `>= MISMATCH_T4_BASE` or linked active hold | Evaluate absolute and relative delta |
| Destination/requisite change | Step-up by default if linked to active payout | Tier 3 if linked payout value `>= DESTINATION_CHANGE_T3_BASE` | Tier 4 if payout is release-ready or high risk | Value should use linked payout/order exposure |
| Manual refund/compensation if applicable | Any manual financial exception requires step-up | `>= REFUND_T3_BASE` | `>= REFUND_T4_BASE` or emergency policy | Create separate catalog if refund domain introduced |

## 9. Financial threshold calibration model

Before numeric values are approved, thresholds should be calibrated using:

- historical transaction distribution by currency and customer segment;
- loss tolerance and reserve policy;
- provider settlement/reversibility behavior;
- jurisdiction and compliance exposure;
- fraud/risk score distribution;
- operational capacity for second-approver queues;
- incident/postmortem findings.

## 10. Relative mismatch thresholds

Absolute value alone may not capture payment risk.

### Recommended checks

\[
relative_mismatch = \frac{|received_amount - expected_amount|}{expected_amount}
\]

### Policy structure

| Condition | Recommended control response |
|---|---|
| Low absolute and low relative mismatch | Standard review or Tier 2 depending on workflow |
| High relative mismatch but low absolute value | Tier 2 with risk context check |
| High absolute mismatch | Tier 3 escalation |
| High absolute mismatch plus fraud/compliance signal | Tier 4 escalation or block/quarantine |

## 11. Currency-specific adjustment factors

Some currencies or rails may require stronger controls because of volatility, settlement reversibility, provider reliability or compliance constraints.

### Recommended configuration fields

| Field | Purpose |
|---|---|
| `currency_code` | ISO/asset code |
| `rail_type` | Fiat transfer, card, crypto network, exchange transfer, etc. |
| `risk_multiplier` | Policy factor applied to base threshold |
| `min_control_tier` | Floor tier for selected action family |
| `provider_override` | Optional provider-specific adjustment |
| `effective_from` / `effective_to` | Versioned policy validity |

### Rule

Currency/rail adjustment may lower an escalation threshold or set a higher minimum tier; it should not weaken a global safety floor without formal approval.

## 12. Illustrative currency/rail policy patterns

| Pattern | Example policy behavior |
|---|---|
| Low reversibility rail | Lower Tier 3 threshold for payout release |
| High volatility asset | Use conservative FX timestamp and lower threshold for delayed manual release |
| Provider with uncertainty | Increase minimum tier when provider status confidence is degraded |
| High-risk jurisdiction/rail | Require Tier 3 even below normal amount threshold |
| Stable, low-risk routine rail | Keep baseline threshold but never remove standard step-up for sensitive action |

## 13. Data classification model

Recommended data classes:

| Data class | Description | Examples |
|---|---|---|
| Class A | Operationally non-sensitive data | Queue metadata, generic status labels |
| Class B | Sensitive business/customer information | Contact data, order references, transaction summaries |
| Class C | Highly sensitive regulated or financial data | Requisites, identity artifacts, KYC details, detailed provider refs |
| Class D | Security-critical or secret material | Credentials, verifier secrets, encryption/key metadata, security configs |

## 14. Data-reveal thresholds

| Action family | Class A | Class B | Class C | Class D |
|---|---|---|---|---|
| On-screen single-record view | Tier 0/1 | Tier 1 | Tier 2 with explicit reveal | Not available through ordinary admin UI |
| Single-record download | Tier 1 | Tier 1/2 | Tier 2 | Prohibited except governed security tooling |
| Bulk export | Tier 1 | Tier 2 | Tier 3 | Prohibited except approved secret-management workflow |
| Archive retrieval | Tier 1 | Tier 2 | Tier 2/3 depending on scope | Prohibited except governed security workflow |
| Archive restore | Tier 1/2 | Tier 2 | Tier 3 | Tier 4 or prohibited by default |

## 15. Data volume thresholds

These placeholders define scale-based escalation, subject to final calibration.

| Action family | Tier 2 threshold | Tier 3 threshold | Tier 4 threshold |
|---|---:|---:|---:|
| Class B export | `>= EXPORT_B_T2_ROWS` | `>= EXPORT_B_T3_ROWS` | `>= EXPORT_B_T4_ROWS` or cross-domain scope |
| Class C export | Any export starts Tier 3 | `>= EXPORT_C_T3_ROWS` plus dual-control | `>= EXPORT_C_T4_ROWS` or archive-wide scope |
| Evidence download | Repeated single downloads beyond `EVIDENCE_REVEAL_VELOCITY` | Batch beyond `EVIDENCE_BATCH_T3` | Broad historical/archive extraction |
| Archive retrieval | `>= ARCHIVE_T2_RECORDS` | `>= ARCHIVE_T3_RECORDS` | `>= ARCHIVE_T4_RECORDS` or multi-domain restore |
| Permission change batch | `>= ROLE_CHANGE_T2_COUNT` | `>= ROLE_CHANGE_T3_COUNT` | `>= ROLE_CHANGE_T4_COUNT` or privileged role family affected |

## 16. Data sensitivity escalation rules

Escalate at least one tier when:

- data includes Class C fields and action is export or archive retrieval;
- data combines multiple sensitive domains, such as KYC + payouts + provider refs;
- request scope crosses ordinary team/queue ownership;
- repeated reveal/download pattern exceeds velocity baseline;
- request is made under break-glass or incident context.

## 17. Action-family threshold catalog

### A. Fund movement

| Action | Baseline tier | Tier 3 trigger | Tier 4 trigger |
|---|---|---|---|
| Payout release | Tier 2 | Normalized value >= `PAYOUT_T3_BASE`, high-risk rail, active risk flag | Normalized value >= `PAYOUT_T4_BASE`, incident context, severe anomaly, emergency override |
| Payout destination change | Tier 3 when payout-linked | Linked exposure >= `DESTINATION_CHANGE_T3_BASE` or elevated risk | Release-ready payout, active fraud signal, incident/emergency context |
| Payout cancel/return override | Tier 3 | Value >= `PAYOUT_OVERRIDE_T3_BASE` or provider conflict | Value >= `PAYOUT_OVERRIDE_T4_BASE`, settlement uncertainty + active incident |
| Payment acceptance override | Tier 3 | Value >= `PAYMENT_OVERRIDE_T3_BASE`, mismatch ratio >= `MISMATCH_RATIO_T3` | Value >= `PAYMENT_OVERRIDE_T4_BASE`, fraud/compliance hold or suspected manipulation |
| Reconciliation resolution | Tier 2 | Exposure >= `RECON_T3_BASE` or unresolved provider conflict | Exposure >= `RECON_T4_BASE`, linked multiple payouts or incident |

### B. Compliance and risk

| Action | Baseline tier | Tier 3 trigger | Tier 4 trigger |
|---|---|---|---|
| KYC final approval | Tier 2 | Enhanced due diligence, high-risk policy category | Active security/fraud incident or exception review requirement |
| KYC final rejection | Tier 2 | Previously approved case, legal/escalated category | Incident-linked mass impact or emergency legal directive |
| Compliance hold release | Tier 2 | Hold affects payout/fund movement or case severity >= `HOLD_SEVERITY_T3` | Hold linked to active severe incident or high-risk override |
| Risk override | Tier 3 | Baseline Tier 3 by design | Tier 4 if risk score >= `RISK_SCORE_T4` or recent abuse signals |
| Wallet/requisite verification | Tier 2 | Linked payout exposure >= `WALLET_VERIFY_T3_BASE` or risk flag | Destination linked to attempted fraud/incident |

### C. Data access and export

| Action | Baseline tier | Tier 3 trigger | Tier 4 trigger |
|---|---|---|---|
| Class C field reveal | Tier 2 | Reveal velocity >= `SENSITIVE_REVEAL_T3_RATE` or cross-case investigation | Break-glass, incident-forensics scope, repeated anomalous access |
| Single evidence download | Tier 2 | Archive source or repeated download velocity | Incident-wide or broad historical extraction |
| Class B export | Tier 1/2 | Row count >= `EXPORT_B_T3_ROWS` or multi-domain join | Large-scale/cross-domain/incident-driven export |
| Class C export | Tier 3 | Any broad multi-record scope | Tier 4 if archive-wide or high-volume threshold crossed |
| Archive restore | Tier 3 for sensitive records | Multi-entity/domain restore | Production incident restore with broad blast radius |

### D. Access and configuration governance

| Action | Baseline tier | Tier 3 trigger | Tier 4 trigger |
|---|---|---|---|
| Ordinary role grant | Tier 2 | Cross-domain scope expansion or batch size >= `ROLE_CHANGE_T3_COUNT` | High-risk role family or incident-driven bulk grant |
| Privileged role grant | Tier 3 | Baseline Tier 3 by design | Break-glass eligibility, broad emergency grant or active incident |
| Permission revoke/suspend | Tier 2 | Batch revocation >= `ROLE_REVOKE_T3_COUNT` | Broad incident containment affecting essential operators |
| Feature flag change | Tier 3 if payout/auth/masking affected | Production cross-domain blast radius >= `CONFIG_BLAST_T3` | Platform-wide or incident critical control change |
| Webhook verification config | Tier 3 | Fund-movement provider scope or production change | Emergency disable/tolerance change during provider/security incident |
| Secret rotation | Tier 3 | Multi-provider/service rotation | Emergency compromise response or broad trust-root change |

## 18. Blast-radius model

Blast radius should influence control tiers even when no currency/data threshold applies.

### Recommended dimensions

- number of affected customers;
- number of affected orders/payments/payouts;
- number of providers or services affected;
- number of permissions/configurations changed;
- reversibility of the action;
- production vs non-production environment.

### Illustrative catalog

| Blast radius | Typical policy impact |
|---|---|
| Single record, reversible | Baseline tier usually sufficient |
| Multiple records in one queue/team | Escalate one tier if sensitive/high-impact |
| Multi-domain or multiple providers | Tier 3 minimum for material configuration/exports |
| Platform-wide or difficult-to-reverse | Tier 4 or formal incident change path |

## 19. Velocity and anomaly thresholds

### Purpose

Velocity controls detect unusual patterns even when individual requests remain below thresholds.

### Recommended patterns

| Pattern | Suggested reaction |
|---|---|
| Repeated Class C reveals by one actor | Escalate reveal tier, create audit alert |
| Repeated evidence downloads across unrelated cases | Tier 3 review/dual-control or block pending review |
| Burst of payout actions by actor/team | Require additional risk check and possibly raise tier |
| Large number of permission changes | Escalate to Tier 3 or Tier 4 based on privileged impact |
| Spike in webhook config/secret changes | Security alert and change freeze consideration |

## 20. Contextual risk multipliers

A contextual multiplier can reduce effective threshold or raise floor tier.

### Recommended contexts

- active fraud/risk signal;
- active compliance hold;
- provider degradation/uncertainty;
- active incident;
- recently changed destination/wallet;
- new or unusual actor device/session;
- temporary elevation/break-glass mode;
- out-of-hours or unusual geographic/organizational context.

### Rule

When multiplier is active, the resulting control tier is the maximum of baseline tier, threshold tier and contextual floor tier.

## 21. Tier resolution algorithm

Recommended policy resolution sequence:

1. identify action family;
2. verify role/action authorization;
3. compute baseline tier from Action-to-Control Tier Matrix;
4. calculate normalized financial exposure where applicable;
5. determine data class, volume and blast radius;
6. apply currency/rail/provider adjustment;
7. apply contextual risk floors and velocity rules;
8. choose highest resulting tier;
9. record decision inputs and enforce required controls.

### Pseudocode

```text
resolved_tier = max(
  action_baseline_tier,
  financial_threshold_tier,
  data_volume_tier,
  blast_radius_tier,
  currency_rail_minimum_tier,
  contextual_risk_floor,
  velocity_anomaly_tier
)
```

## 22. Decision audit record

Every Tier 2+ decision should retain at minimum:

- action type;
- target entity/subject;
- actor identity and role;
- resolved tier;
- threshold parameters evaluated;
- normalized value and FX evidence where applicable;
- data class/volume inputs;
- contextual flags;
- required/obtained step-up and approval artifacts;
- correlation and audit IDs.

## 23. Configuration governance

### Requirements

- threshold values versioned and environment-scoped;
- changes have owner, effective date and rationale;
- sensitive threshold changes require Tier 3 control at minimum;
- production changes use dual-control when affecting money, authentication, masking, retention or webhook policy;
- prior values and approvals remain auditable.

## 24. Review cadence

Recommended review cadence:

| Threshold domain | Suggested review cadence |
|---|---|
| Payout/payment thresholds | Monthly and after material loss/incident/provider change |
| Fraud/risk thresholds | Monthly or risk-model cadence |
| Data/export thresholds | Quarterly and after access incident |
| Configuration/permission thresholds | Quarterly and after privilege incident |
| Currency/rail modifiers | On provider/jurisdiction change and scheduled monthly review |

## 25. API and UI implications

### API

- API must evaluate thresholds server-side at final execution;
- response should explain only safe, action-relevant control requirement;
- threshold configuration values should not be exposed broadly if doing so increases abuse risk.

### UI

- UI should tell authorized users when step-up or approval is required;
- UI should collect reason/justification where policy requires;
- UI should not promise action completion before final tier controls pass.

## 26. QA requirements

### Need to validate

- conversion/normalization is deterministic and auditable;
- each threshold boundary moves action to expected tier;
- currency/rail/context modifiers raise tier correctly;
- combined rules select highest tier;
- unavailable FX/provider data fails safely;
- threshold configuration changes are versioned and approval-controlled;
- API and UI do not diverge from server-side decision.

## 27. Anti-patterns to avoid

- embedding hardcoded threshold amounts across multiple services/UI clients;
- using only amount while ignoring data class, context and blast radius;
- treating unavailable FX rate as zero or below threshold;
- exposing exact anti-fraud thresholds to customer-facing channels;
- allowing lower-tier control because one dimension appears low-risk when another is high-risk;
- changing production thresholds without audit, approval and rollback awareness.

## 28. Follow-up implementation artifacts

На базе этого catalog рекомендуется создать:

- machine-readable threshold configuration schema;
- currency/rail risk modifier registry;
- action-policy evaluation service contract;
- threshold-change approval workflow;
- control-tier simulation test cases;
- operational dashboard for threshold-triggered actions.

## 29. Related documents

Использовать вместе с:

- `action-to-control-tier-matrix.md`
- `step-up-authentication-and-dual-control-policy-spec.md`
- `admin-permission-hardening-spec.md`
- `threat-model-and-security-architecture-spec.md`
- `fraud-signals-and-risk-rules-spec.md`
- `reconciliation-and-ledger-spec.md`
- `field-level-sensitivity-and-masking-matrix.md`
- `webhook-verification-and-replay-defense-spec.md`