# API Rate-Limit & Abuse-Protection Policy — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Backend Architecture + Security
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Initial version created to define quotas, throttling and abuse-protection behavior.
- Supersedes: none explicitly declared
- Depends on:
  - `theblack-trade-api-contract-spec.md`
  - `api-resource-boundaries-and-contract-spec.md`
  - `threat-model-and-security-architecture-spec.md`
- Related documents:
  - `provider-contract-and-operations-pack.md`
  - `observability-and-audit-spec.md`
  - `contract-test-matrix.md`

## 1. Purpose

This document defines how TheBlack.Trade should protect APIs and callback surfaces against abuse, excessive traffic, brute force and accidental overload while preserving legitimate platform and provider workflows.

## 2. Policy scope

The policy should cover customer APIs, admin APIs, internal service APIs, webhook endpoints and provider-facing callback or polling surfaces.

## 3. Control families

Controls should include per-identity quotas, per-IP quotas, burst limits, anomaly-based throttling, route sensitivity tiers, brute-force detection, replay-aware callback handling and emergency tightening during incidents.

## 4. Behavioral expectations

The system should return consistent throttling semantics, preserve audit signals for abuse-related decisions and avoid applying customer-facing rate behavior blindly to trusted provider replay patterns.


## 5. Identity dimensions and quota model

Rate controls should be evaluated across multiple dimensions rather than a single request counter:

- API key or client application identity;
- authenticated user identifier;
- source IP and subnet reputation group;
- route or capability tier;
- provider callback source classification.

Recommended control model:

| Surface | Primary limiter | Secondary limiter | Notes |
|---|---|---|---|
| Public customer API | API key + user | IP burst | Protect account abuse and scraping |
| Admin API | user + role | IP burst | Lower thresholds, stricter anomaly response |
| Auth-sensitive routes | user + IP | device/session | Supports brute-force protection |
| Provider callbacks | provider identity | replay fingerprint | Avoid blocking legitimate retries |
| Internal service APIs | service identity | environment budget | Prevent noisy-loop incidents |

## 6. Response behavior

When a limit is exceeded, the platform should return a stable throttling contract including status code, retry guidance, correlation identifier and audit traceability. The policy should define whether soft throttles, hard blocks or challenge escalation apply by route tier.

Minimum response rules:

- customer/admin HTTP APIs should use 429 for rate exhaustion;
- abuse or attack scenarios may escalate to temporary 403 or upstream blocking;
- responses should include retry-after guidance where deterministic retry timing exists;
- idempotent write retries must preserve idempotency behavior rather than generating duplicate side effects.

## 7. Route sensitivity tiers

Routes should be classified into control tiers:

1. low sensitivity: informational reads and low-risk reference endpoints;
2. medium sensitivity: ordinary authenticated reads/writes;
3. high sensitivity: login, password reset, quote generation, order creation, payout creation;
4. critical sensitivity: admin approvals, credential rotation, webhook verification and security-control actions.

Each tier should define default steady-state quotas, burst ceilings, detection signals and emergency tightening rules.

## 8. Abuse detection and response

Abuse protection should combine static thresholds and behavioral signals. Trigger examples:

- high-cardinality token or account probing;
- quote scraping beyond normal customer behavior;
- repeated auth or MFA failures;
- callback replay bursts with identical payload fingerprints;
- geographically inconsistent traffic spikes.

Response options should include silent shadow metering, temporary throttling, CAPTCHA or step-up challenge where applicable, credential suspension, IP/provider allow-list review and incident escalation.

## 9. Monitoring and acceptance criteria

The platform should publish dashboards for throttle rates, false-positive rates, blocked-request volume, top offending identities, provider callback rejects and retry-after usage. Before production readiness, validation should confirm that configured limits protect the service under load while preserving normal customer and provider workflows.


## 10. Numerical baseline framework

The implementation should maintain configurable thresholds by route tier, identity type and environment rather than a single global ceiling. Exact values may evolve, but a documented baseline must exist for:

- per-minute steady-state limits;
- burst allowance windows;
- concurrent request caps for sensitive routes;
- stricter admin and auth-route thresholds;
- callback-source exceptions with replay protections.

## 11. Validation and rollback

Any production rate-limit change should support staged rollout, metric observation and controlled rollback if legitimate traffic is harmed. Validation should explicitly measure false positives, customer completion impact and provider callback success rates.
