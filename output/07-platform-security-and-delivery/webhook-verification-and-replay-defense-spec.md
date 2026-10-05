## Document metadata

- Status: active
- Role: Companion spec
- Owner: Security + Backend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `payment-provider-and-payout-integration-spec.md`
  - `wallet-and-exchange-provider-integration-spec.md`
  - `provider-contract-and-operations-pack.md`
- Related documents:
  - `contract-test-matrix.md`
  - `incident-response-playbook.md`

# Webhook Verification & Replay Defense Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ определяет security и processing requirements для входящих provider callbacks и других webhook-style integrations в TheBlack.Trade. Он описывает, как проверять authenticity, integrity и freshness входящих webhook requests, как защищаться от replay, duplicate delivery, out-of-order arrival, payload tampering и endpoint abuse, а также как нормализовать проверенные callbacks в canonical internal events.

Документ предназначен для backend, platform/security, DevOps/SRE, integrations, QA и incident response.

## 2. Цели документа

Webhook defense model должен обеспечивать:

- прием только верифицированных provider callbacks;
- обнаружение и блокировку replay и duplicate delivery;
- устойчивость к provider retries и callback storms;
- safe normalization из provider payloads в canonical internal events;
- traceability для audit, observability, reconciliation и incident response;
- единый processing contract для разных provider families.

## 3. Scope

Документ покрывает:

- webhook trust assumptions;
- endpoint and transport verification;
- signature and authenticity verification patterns;
- freshness/timestamp validation;
- replay detection and deduplication;
- callback normalization pipeline;
- failure handling and response semantics;
- logging, alerting and operational controls.

## 4. Core principles

1. **All inbound webhook traffic is untrusted until verified.**
2. **Signature validation alone is insufficient without replay and duplication defenses.**
3. **Provider payloads should be normalized before they are broadly consumed.**
4. **Webhook processing must be idempotent and duplicate-safe by default.**
5. **Verification decisions must be observable and auditable.**
6. **Unsafe callbacks should fail closed, not partially mutate business state.**

## 5. Webhook source families

Recommended source families:

- payment provider callbacks;
- payout provider callbacks;
- KYC/compliance provider callbacks;
- document delivery callbacks;
- notification delivery callbacks;
- internal partner/system callbacks where contractually required.

## 6. Trust assumptions

### Assumptions

- the public internet and incoming network path are untrusted;
- provider source IPs may help but are not sufficient as sole verification;
- provider payload fields are not trusted until authenticity and parsing validation succeed;
- duplicate and late deliveries are normal operational behavior for many providers;
- some providers offer weaker verification capabilities and require compensating controls.

## 7. Webhook endpoint strategy

Recommended path family:

- `/api/webhooks/v1/payments/{provider}`
- `/api/webhooks/v1/payouts/{provider}`
- `/api/webhooks/v1/kyc/{provider}`
- `/api/webhooks/v1/documents/{provider}`
- `/api/webhooks/v1/notifications/{provider}`

### Principles

- separate endpoints by callback family/provider where practical;
- avoid one generic endpoint for all webhook sources;
- maintain versioned callback contracts for internal processing;
- allow per-provider verification policy configuration.

## 8. Verification stages

Recommended inbound verification stages:

1. transport acceptance and TLS validation;
2. endpoint routing and basic request-shape checks;
3. provider identification;
4. authenticity/signature verification;
5. freshness/timestamp validation;
6. deduplication/replay checks;
7. schema parsing and contract validation;
8. normalization into internal callback record;
9. idempotent business handling and canonical event emission.

## 9. Transport and network controls

### Required controls

- HTTPS/TLS for all webhook endpoints;
- strong server certificate management;
- request size limits;
- rate limiting or surge protection where compatible with provider behavior;
- optional provider IP allow-listing where stable and contractually supported.

### Notes

IP allow-listing is a useful defense layer but must not replace cryptographic verification.

## 10. Provider identification

### Preferred sources

- dedicated endpoint path per provider;
- provider-specific headers;
- configured integration binding from endpoint to provider identity.

### Anti-pattern

Do not infer provider identity only from payload fields supplied by the sender.

## 11. Signature verification models

Recommended supported models:

- HMAC signature over raw request body plus timestamp;
- detached signature header over canonicalized payload;
- asymmetric signature verification where provider supports it;
- mutually authenticated channel only as supplemental control, not sole logic signal unless contractually designed that way.

## 12. Raw payload handling

### Requirements

- verify against raw request body bytes when provider algorithm requires it;
- do not parse and reserialize body before signature verification if provider contract depends on original byte sequence;
- preserve signed headers and verification metadata for audit/troubleshooting;
- avoid logging full sensitive raw payloads to broad logs.

## 13. Signature verification policy

For each provider contract, document at minimum:

- signature header names;
- signed components (body, timestamp, delivery ID, method, path);
- algorithm;
- secret/public-key lookup strategy;
- tolerance for missing or malformed signature data;
- rotation and overlap behavior for old/new secrets.

## 14. Secret and key management for webhooks

### Requirements

- secrets/verification keys stored in managed secret system;
- environment-specific credentials;
- explicit owner for rotation;
- support overlapping active secrets during provider rotation windows;
- no secrets in application logs, support tickets or static config files.

## 15. Timestamp and freshness validation

### Purpose

Freshness validation reduces replay window even when signatures are valid.

### Recommended checks

- require provider timestamp when supported;
- validate clock skew against configured tolerance window;
- reject requests outside policy window unless explicitly placed into quarantine/manual review flow;
- record observed timestamp, arrival time and skew.

### Typical policy

A short acceptance window is preferred for high-risk money movement callbacks, with provider-specific override only when necessary.

## 16. Delivery identity model

Every provider callback should have a stable delivery identity for deduplication.

### Preferred fields

- provider delivery ID;
- provider event ID;
- provider transaction/case reference where unique enough;
- signature timestamp + digest fallback only when stronger IDs unavailable.

### Rule

Delivery identity must be stored independently from business entity state.

## 17. Replay defense strategy

### Required capabilities

- store recent verified delivery identities in replay-defense storage;
- reject or safely no-op repeated deliveries based on policy;
- distinguish benign provider retry from malicious replay where possible;
- include timestamp-window logic plus delivery identity checks.

### Principle

Replay defense should use both **freshness** and **deduplication identity**, not only one of them.

## 18. Deduplication states

Recommended callback-receipt states:

| State | Meaning |
|---|---|
| `received_unverified` | Request accepted by edge/app but not yet verified |
| `rejected_verification` | Failed authenticity or contract checks |
| `verified_pending_processing` | Authenticated and queued for handling |
| `processed` | Successfully normalized and handled |
| `duplicate_ignored` | Duplicate delivery recognized and safely ignored/no-op |
| `quarantined` | Suspicious or malformed callback isolated for review |
| `processing_failed` | Verified callback could not complete business handling |

## 19. Recommended replay-defense storage fields

Store at minimum:

- provider name;
- webhook family;
- delivery identity;
- signature timestamp if present;
- request digest/hash;
- first_seen_at;
- last_seen_at;
- verification result;
- processing result;
- linked provider interaction ID;
- linked canonical event IDs if emitted.

## 20. Schema and contract validation

### Requirements

- after verification, payload must still pass schema validation;
- required fields and enums must be checked;
- unknown fields should not automatically break ingestion unless provider contract demands strictness;
- malformed but authenticated callbacks may be quarantined instead of blindly retried.

## 21. Normalization pipeline

Recommended processing pipeline:

1. receive raw callback;
2. verify signature/authenticity;
3. validate freshness;
4. deduplicate/replay-check;
5. persist provider interaction / callback receipt;
6. parse and validate provider schema;
7. normalize into internal provider-interaction representation;
8. map to canonical domain action/event;
9. execute idempotent business handling;
10. emit canonical internal event and audit/telemetry records.

## 22. Provider interaction record

Each verified callback should produce a `provider_interaction` or equivalent record that stores:

- provider identity;
- callback type;
- external references;
- verification outcome;
- payload classification;
- normalized status/result;
- processing linkage to payment/payout/KYC/document/notification entities.

## 23. Business handling rules

### Requirements

- business mutation must be idempotent;
- callback should never directly bypass domain preconditions;
- canonical state changes should happen through service-owned business logic;
- duplicate callbacks must not trigger duplicate payouts, duplicate confirmations or duplicate notifications.

## 24. Out-of-order delivery handling

### Problem

Providers may deliver callbacks late or in non-sequential order.

### Required controls

- compare incoming provider fact against current canonical state;
- ignore or quarantine stale regressions unless business rules explicitly allow backtracking;
- record conflict telemetry for unexpected order inversion;
- rely on canonical transition rules, not callback recency alone.

## 25. Error response semantics

### Principles

- do not leak sensitive verification logic details in public responses;
- use provider-appropriate HTTP responses based on whether retry is desired;
- reject permanently invalid signatures distinctly from transient internal failures;
- preserve diagnostic detail internally.

### General guidance

- authentication/verification failures usually return non-success;
- verified but transient internal failures may return retriable error codes/statuses depending on provider contract;
- successfully deduplicated duplicates may return success to suppress unnecessary retries when safe.

## 26. Quarantine flow

Quarantine should be used for callbacks that are suspicious, contract-breaking, or operationally unsafe to process automatically.

### Typical quarantine reasons

- valid signature but impossible schema combination;
- stale yet previously unseen delivery;
- unknown event subtype from a trusted provider;
- payload/entity mapping ambiguity;
- potential malicious replay pattern.

### Requirements

- quarantined callbacks must not mutate business state automatically;
- operations/security should have review visibility;
- quarantine actions should emit telemetry/audit records.

## 27. Logging and audit requirements

### Log/record at minimum

- provider identity;
- endpoint family;
- verification outcome;
- replay/deduplication outcome;
- callback receipt IDs and external refs;
- linked business entity IDs;
- processing latency and retries;
- correlation ID/trace ID.

### Restrictions

- avoid broad plaintext logging of full KYC or secret-bearing payloads;
- preserve enough forensic data for verification disputes and provider escalations.

## 28. Alerting and detection

Recommended alerts:

- surge in invalid signature failures;
- replay/duplicate spike beyond normal baseline;
- timestamp skew anomalies;
- schema-validation failure spike for one provider;
- quarantine spike;
- callback backlog or processing delay on critical money movement flows;
- repeated provider identity mismatch attempts.

## 29. Availability and surge handling

### Risks

- provider retry storms;
- callback floods during incidents;
- expensive synchronous verification creating bottlenecks.

### Controls

- lightweight early rejection before deep processing when possible;
- asynchronous processing after verification/persistence where compatible;
- queue buffering and backpressure;
- per-provider throttling strategies that do not break legitimate retry behavior.

## 30. Provider capability matrix linkage

For each provider, maintain a concrete capability record covering:

- signature method;
- timestamp availability;
- delivery ID field;
- retry policy;
- ordering guarantee level;
- IP allow-list availability;
- test/sandbox verification behavior;
- secret rotation process.

### Principle

Verification logic should be configuration-driven by provider capability, not hardcoded ad hoc everywhere.

## 31. Testing requirements

### Mandatory scenarios

- valid callback accepted;
- invalid signature rejected;
- old timestamp rejected or quarantined per policy;
- same delivery replayed multiple times;
- duplicate callback during in-progress processing;
- out-of-order callback arriving after terminal state;
- malformed but signed payload quarantined;
- secret rotation overlap handling;
- provider retry after transient internal failure.

## 32. Security hardening guidelines

### Recommended controls

- isolate webhook ingress from general admin/customer traffic where practical;
- minimize synchronous side effects during request thread;
- use dedicated service identity for downstream processing;
- protect replay-defense store with strict access control and retention policy;
- periodically review dead-letter and quarantine stores for sensitive data handling.

## 33. Incident response considerations

### Need to support

- rapid secret rotation;
- provider endpoint disable/suppress switch;
- replay window tightening during active abuse;
- targeted queue pause for compromised provider family;
- forensic access to verification metadata and receipt history.

## 34. Anti-patterns to avoid

- trusting provider name from request body without endpoint binding or signature context;
- parsing and mutating payload before raw-signature verification;
- treating duplicate delivery as always malicious instead of normal retry behavior;
- executing direct domain mutations before dedup/replay checks;
- broad success responses for unverified callbacks;
- using only IP allow-listing as webhook authenticity control.

## 35. Follow-up implementation artifacts

На базе этого документа рекомендуется создать:

- provider-specific webhook verification matrix;
- callback receipt schema;
- replay-defense storage schema;
- quarantine review runbook;
- provider retry-response decision table;
- automated test suite for verification and replay scenarios.

## 36. Related documents

Использовать вместе с:

- `threat-model-and-security-architecture-spec.md`
- `api-resource-boundaries-and-contract-spec.md`
- `event-taxonomy-and-schema-registry.md`
- `payment-provider-and-payout-integration-spec.md`
- `provider-capability-matrix.md`
- `observability-and-audit-spec.md`
- `incident-response-playbook.md`