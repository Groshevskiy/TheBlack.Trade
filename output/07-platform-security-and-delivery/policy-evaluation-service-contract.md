# Policy Evaluation Service Contract — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: Platform + Compliance + Backend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `action-to-control-tier-matrix.md`
  - `approval-workflow-schema.md`
- Related documents:
  - `machine-readable-threshold-configuration-schema.md`
  - `contract-test-matrix.md`

## 1. Purpose

This document defines the service-level contract for policy evaluation in TheBlack.Trade. The service resolves control decisions for sensitive actions by combining role authorization context, the Action-to-Control Tier Matrix, threshold configuration, contextual risk signals and global safety rules.

The contract is intended for backend/platform services, admin tooling, workflow orchestration, security engineering, audit, QA and incident-response stakeholders. It covers request/response schemas, endpoint behaviors, decision semantics, idempotency expectations, error taxonomy, versioning, observability and governance constraints.

## 2. Goals

The service contract must:

- provide a canonical decision API for control-tier evaluation;
- separate evaluation from command execution while supporting execution-time revalidation;
- support simulation, validation, activation and rollback workflows for policy configuration;
- provide machine-readable outputs for step-up, dual-control, manual-review and block decisions;
- preserve traceability for audits, incidents and postmortems;
- fail safely under missing or ambiguous policy inputs.

## 3. Non-goals

This service does not itself:

- execute payout, compliance, archive or permission-changing commands;
- grant roles or authenticate end users;
- replace the approval workflow engine;
- store provider secrets or operational evidence artifacts.

## 4. Core responsibilities

The policy evaluation service is responsible for:

- selecting the applicable policy configuration version;
- evaluating action context against policy rules;
- returning resolved control tier and required controls;
- producing simulation and explainability artifacts;
- validating threshold configuration before activation;
- governing activation, retirement and rollback of configuration versions;
- emitting structured audit and observability events.

## 5. Design principles

1. The service is the authoritative source of policy evaluation decisions.
2. Command handlers must not independently reimplement threshold logic.
3. Evaluation decisions must be reproducible from the same input context and configuration version.
4. Unknown or invalid state must fail safely.
5. Final control enforcement occurs at command execution time, with revalidation when needed.
6. Explainability is required for governance, debugging and audit.

## 6. Deployment and trust boundaries

The service is internal-only and should be reachable from trusted backend services and governed admin tooling. Customer-facing clients must never call it directly.

The service must authenticate callers as services or approved internal applications, attach caller identity to audit records and reject unauthenticated or out-of-scope requests.

## 7. Service capabilities

Recommended capability set:

- `evaluate` — resolve control decision for a single action context;
- `simulate` — evaluate one or more action contexts against draft or active configuration;
- `validate-config` — validate schema and semantic correctness of configuration draft;
- `activate-config` — promote approved configuration to active state;
- `rollback-config` — retire current active configuration and re-activate approved prior version;
- `get-config` — fetch redacted or full configuration metadata based on caller privileges.

## 8. API style

The contract may be implemented as REST or RPC-like HTTP endpoints, but payload semantics should remain stable. JSON is the canonical wire format.

Recommended common headers:

- `Content-Type: application/json`
- `Accept: application/json`
- `X-Correlation-Id: <uuid>`
- `Idempotency-Key: <opaque-value>` for activation/rollback and other side-effecting requests
- `X-Caller-Service: <service-name>`

## 9. Versioning model

### API versioning

Use explicit path versioning.

```text
/v1/policy/evaluate
/v1/policy/simulate
/v1/policy/configs/validate
/v1/policy/configs/activate
/v1/policy/configs/rollback
```

### Policy configuration versioning

API version is independent from policy configuration version. Each decision must identify the exact configuration version used.

## 10. Canonical decision states

| Decision state | Meaning |
|---|---|
| `allow` | Action may proceed after required controls are satisfied |
| `step_up_required` | Additional authentication proof required before proceeding |
| `approval_required` | Dual-control or manual approval workflow required |
| `manual_review_required` | Automated policy cannot safely permit execution |
| `blocked` | Action must not proceed |
| `error_safe_fail` | Evaluation failed and service returned safe-fail result |

## 11. Control model

Every decision should resolve at least:

- `resolved_tier`;
- required controls such as `step_up`, `dual_control`, `manual_review`, `heightened_monitoring`, `incident_link_required`;
- matched rule identifiers;
- evaluation evidence;
- audit requirements;
- revalidation requirements.

## 12. Evaluate endpoint

### Endpoint

```text
POST /v1/policy/evaluate
```

### Purpose

Evaluates one action context against a specified or automatically selected policy configuration and returns a control decision.

### Request schema

```json
{
  "request_id": "req_pol_001",
  "evaluation_mode": "execution",
  "policy_config_id": null,
  "action_context": {
    "action_family": "payout_release",
    "actor": {
      "actor_id": "actor_finance_001",
      "role_families": ["finance_operator"],
      "temporary_elevation": false,
      "break_glass_active": false
    },
    "target": {
      "entity_type": "payout",
      "entity_id": "pout_123"
    },
    "financial": {
      "action_amount": "12500.00",
      "action_currency": "EUR",
      "fx_rate": "1.08",
      "fx_rate_timestamp": "2026-10-03T08:15:00Z",
      "fx_rate_source": "approved_market_rate"
    },
    "data": {
      "data_class": "class_b",
      "record_count": 1,
      "source": "live",
      "domains": ["payouts"]
    },
    "context": {
      "incident_active": false,
      "incident_severity": null,
      "risk_score": "0.31",
      "risk_flag_present": false,
      "compliance_hold_active": false,
      "destination_recently_changed": false,
      "provider_status": "healthy",
      "provider_confidence": "0.98",
      "session_age_seconds": 480,
      "session_unusual_device": false,
      "session_unusual_geo": false,
      "action_out_of_hours": false
    }
  }
}
```

### Request fields

| Field | Required | Description |
|---|---:|---|
| `request_id` | Yes | Caller-generated id for tracing |
| `evaluation_mode` | Yes | `precheck`, `execution`, or `simulation` |
| `policy_config_id` | No | Specific config to use; active config used when omitted |
| `action_context` | Yes | Normalized action input for evaluation |

### Evaluation modes

| Mode | Purpose |
|---|---|
| `precheck` | Early UI/workflow check before final action attempt |
| `execution` | Final authoritative check immediately before execution |
| `simulation` | Non-authoritative preview/testing mode |

## 13. Evaluate response schema

```json
{
  "decision_id": "dec_001",
  "request_id": "req_pol_001",
  "decision_state": "approval_required",
  "allowed_to_continue": true,
  "resolved_tier": "tier_3",
  "policy_config": {
    "config_id": "threshold-config-prod-2026-10-03-001",
    "schema_version": "1.0.0",
    "environment": "production"
  },
  "required_controls": {
    "step_up": true,
    "dual_control": true,
    "manual_review": false,
    "heightened_monitoring": false,
    "incident_link_required": false
  },
  "matched_rule_ids": [
    "payout-release-default",
    "payout-release-tier-3"
  ],
  "evaluation_evidence": {
    "normalized_value": "13500.00",
    "normalized_currency": "USD",
    "fx_rate_evidence": {
      "rate": "1.08",
      "timestamp": "2026-10-03T08:15:00Z",
      "source": "approved_market_rate"
    },
    "data_class": "class_b",
    "record_count": 1,
    "contextual_flags": []
  },
  "approval_requirements": {
    "required": true,
    "min_approver_count": 1,
    "initiator_may_approve": false,
    "approver_min_role_family": "finance_approver",
    "approval_expiry": "PT30M"
  },
  "audit": {
    "severity": "critical",
    "correlation_id_required": true,
    "reason_required": true
  },
  "revalidation": {
    "required_at_execution": true,
    "revalidate_on": [
      "entity_state_change",
      "permission_change",
      "incident_mode_change",
      "threshold_config_change"
    ]
  },
  "explanation": {
    "summary": "Payout release exceeded Tier 3 normalized value threshold.",
    "safe_details": [
      "Step-up authentication is required.",
      "Secondary approval is required before execution."
    ]
  },
  "correlation_id": "corr_001"
}
```

## 14. Decision semantics

### `allow`

Returned when action can proceed and all required controls are already satisfied or not required.

### `step_up_required`

Returned when action may proceed only after valid step-up proof is obtained.

### `approval_required`

Returned when an approval workflow must be completed before execution.

### `manual_review_required`

Returned when policy cannot safely automate decision because of ambiguity, safe-fail condition or explicit rule requirement.

### `blocked`

Returned when action is prohibited by policy.

### `error_safe_fail`

Returned when evaluation logic or required dependencies fail and the service enforces safe-fail outcome.

## 15. Revalidation contract

Execution-time callers must re-evaluate when:

- entity state changed since precheck;
- actor permissions changed;
- incident mode changed;
- active policy configuration changed;
- step-up proof or approval artifact expired;
- new contextual risk signal appeared.

Callers should never assume that a successful `precheck` authorizes final command execution.

## 16. Step-up satisfaction contract

If a caller already has step-up proof, it may provide a bounded proof reference.

### Request extension

```json
{
  "step_up_proof": {
    "proof_id": "sup_123",
    "assurance_level": "tier_2",
    "issued_at": "2026-10-03T08:20:00Z",
    "expires_at": "2026-10-03T08:30:00Z",
    "scope": ["payout_release"]
  }
}
```

### Rules

- proof must be fresh and not expired;
- proof scope must include the action family or stricter governed scope;
- proof must be invalidated when policy requires revalidation after major context change;
- service may still return `step_up_required` if provided proof is insufficient.

## 17. Approval artifact contract

If an approval already exists, callers may provide an approval reference for execution-time revalidation.

```json
{
  "approval_artifact": {
    "approval_request_id": "apr_123",
    "approved_at": "2026-10-03T08:25:00Z",
    "expires_at": "2026-10-03T08:55:00Z"
  }
}
```

### Rules

- approval must not be expired;
- approval must match entity, action family and significant evaluated context;
- initiator/approver separation rules are validated outside and may also be rechecked by this service if context is supplied;
- service may require renewed approval if state changed materially.

## 18. Simulate endpoint

### Endpoint

```text
POST /v1/policy/simulate
```

### Purpose

Runs one or more action contexts against a draft or active configuration without producing authoritative execution decisions.

### Request

```json
{
  "simulation_id": "sim_001",
  "policy_config_id": "threshold-config-staging-example-001",
  "contexts": [
    {
      "action_family": "payout_release",
      "target": {"entity_type": "payout", "entity_id": "pout_123"}
    },
    {
      "action_family": "data_export",
      "target": {"entity_type": "export_job", "entity_id": "exp_456"}
    }
  ],
  "include_explanations": true
}
```

### Response

```json
{
  "simulation_id": "sim_001",
  "policy_config": {
    "config_id": "threshold-config-staging-example-001",
    "status": "draft"
  },
  "results": [
    {
      "index": 0,
      "decision_state": "approval_required",
      "resolved_tier": "tier_3",
      "matched_rule_ids": ["payout-release-default"]
    },
    {
      "index": 1,
      "decision_state": "blocked",
      "resolved_tier": "tier_4",
      "matched_rule_ids": ["class-d-export-prohibited"]
    }
  ]
}
```

## 19. Validate-config endpoint

### Endpoint

```text
POST /v1/policy/configs/validate
```

### Purpose

Validates schema and semantic correctness of a configuration draft.

### Request

```json
{
  "config": {
    "schema_version": "1.0.0",
    "config_id": "threshold-config-prod-2026-10-03-001"
  },
  "validation_mode": "strict"
}
```

### Response

```json
{
  "valid": false,
  "schema_valid": true,
  "semantic_valid": false,
  "errors": [
    {
      "code": "NON_MONOTONIC_THRESHOLD_TIER",
      "message": "Tier decreases across ordered monetary thresholds for action_family=payout_release.",
      "path": "rules.action_families[0].financial_thresholds[1]"
    }
  ],
  "warnings": [
    {
      "code": "MISSING_SIMULATION_FIXTURE",
      "message": "No simulation fixture provided for new action family rule.",
      "path": "rules.action_families[3]"
    }
  ]
}
```

## 20. Activate-config endpoint

### Endpoint

```text
POST /v1/policy/configs/activate
```

### Purpose

Activates an approved configuration version for a target environment.

### Request

```json
{
  "config_id": "threshold-config-prod-2026-10-03-001",
  "environment": "production",
  "activate_at": "2026-10-10T00:00:00Z",
  "change_reason": "Approved production threshold baseline",
  "approval_artifact": {
    "approval_request_id": "apr_cfg_001"
  }
}
```

### Response

```json
{
  "activation_id": "act_001",
  "config_id": "threshold-config-prod-2026-10-03-001",
  "previous_active_config_id": "threshold-config-prod-2026-09-15-004",
  "status": "scheduled",
  "effective_from": "2026-10-10T00:00:00Z",
  "correlation_id": "corr_cfg_001"
}
```

### Rules

- activation is idempotent by `Idempotency-Key` + request body fingerprint;
- production activation requires approved configuration and required approval artifact;
- only one active configuration per environment at a time;
- activation must be rejected if effective windows overlap incompatibly.

## 21. Rollback-config endpoint

### Endpoint

```text
POST /v1/policy/configs/rollback
```

### Purpose

Rolls back to a previously approved configuration version.

### Request

```json
{
  "target_config_id": "threshold-config-prod-2026-09-15-004",
  "environment": "production",
  "rollback_reason": "Unexpected escalation regression in active policy",
  "reference_incident_id": "inc_789",
  "approval_artifact": {
    "approval_request_id": "apr_cfg_rollback_001"
  }
}
```

### Response

```json
{
  "rollback_id": "rbk_001",
  "restored_config_id": "threshold-config-prod-2026-09-15-004",
  "superseded_config_id": "threshold-config-prod-2026-10-03-001",
  "status": "completed",
  "correlation_id": "corr_cfg_rollback_001"
}
```

### Rules

- rollback target must be approved and compatible with current schema/runtime support;
- rollback of production-sensitive policy requires governed approval;
- rollback must emit high-severity audit events;
- rollback should support emergency path but never skip audit and post-review.

## 22. Get-config endpoint

### Endpoint

```text
GET /v1/policy/configs/{config_id}
```

### Behavior

Returns configuration metadata and content, optionally redacted according to caller privileges.

### Query parameters

- `view=metadata|full|redacted`
- `environment=production|staging|development`

### Rules

- low-privilege governance roles may receive metadata or redacted content;
- high-sensitivity fraud thresholds and internals may be omitted in redacted view;
- response must clearly indicate whether redaction occurred.

## 23. Common response envelope

Recommended response shape for all endpoints:

```json
{
  "data": {},
  "meta": {
    "api_version": "v1",
    "timestamp": "2026-10-03T08:30:00Z",
    "correlation_id": "corr_001"
  },
  "error": null
}
```

## 24. Error taxonomy

Errors should be structured and stable.

### Common error object

```json
{
  "error": {
    "code": "STEP_UP_REQUIRED",
    "message": "Additional authentication is required for this action.",
    "category": "authorization",
    "retryable": true,
    "details": {
      "resolved_tier": "tier_2"
    }
  }
}
```

### Recommended error codes

| Code | Category | Meaning |
|---|---|---|
| `INVALID_REQUEST` | validation | Malformed or incomplete request |
| `UNKNOWN_ACTION_FAMILY` | validation | Action family not recognized |
| `POLICY_CONFIG_NOT_FOUND` | configuration | Referenced config absent |
| `POLICY_CONFIG_NOT_ACTIVE` | configuration | Referenced config not active where active required |
| `POLICY_CONFIG_NOT_APPROVED` | configuration | Activation attempted without approved config |
| `STEP_UP_REQUIRED` | authorization | Additional proof required |
| `APPROVAL_REQUIRED` | authorization | Secondary approval required |
| `MANUAL_REVIEW_REQUIRED` | authorization | Policy requires human review |
| `POLICY_BLOCKED` | authorization | Action prohibited by policy |
| `RULE_EVALUATION_FAILED` | system | Safe-fail evaluation error |
| `MISSING_FX_EVIDENCE` | validation | Required FX evidence absent or stale |
| `IDEMPOTENCY_CONFLICT` | request_state | Same key with incompatible payload |
| `CONCURRENT_ACTIVATION_CONFLICT` | request_state | Competing config activation attempt |
| `INSUFFICIENT_CALLER_SCOPE` | authentication | Caller lacks service/application privilege |

## 25. HTTP status guidance

| Situation | Recommended HTTP status |
|---|---|
| Successful evaluation/simulation | 200 |
| Accepted scheduled activation | 202 |
| Validation error | 400 |
| Unauthenticated caller | 401 |
| Authenticated but out of scope | 403 |
| Missing config/resource | 404 |
| Idempotency or concurrent state conflict | 409 |
| Safe-fail system/dependency issue | 422 or 503 depending on semantics |

## 26. Idempotency rules

Idempotency is required for side-effecting endpoints:

- `activate-config`
- `rollback-config`
- any future endpoint that mutates configuration lifecycle state

### Rules

- repeated request with same `Idempotency-Key` and same semantic payload must return same logical result;
- repeated request with same key but materially different payload must return `IDEMPOTENCY_CONFLICT`;
- idempotency retention window should be explicitly configured.

## 27. Consistency and execution model

The service should prefer strongly consistent reads for active policy selection in execution mode. Eventual consistency may be tolerated for non-authoritative simulation or metadata browsing where documented.

Where caching is used, cache invalidation must be tied to configuration activation/rollback events. Execution-time calls must never use stale policy beyond accepted bounded staleness for the environment.

## 28. Audit event contract

Every Tier 2+ evaluation and all configuration lifecycle changes should emit structured audit events.

### Required audit attributes

- `event_id`
- `event_type`
- `timestamp`
- `caller_service`
- `actor_id` if present in action context
- `action_family`
- `decision_state`
- `resolved_tier`
- `matched_rule_ids`
- `config_id`
- `correlation_id`
- `request_id`
- `incident_id` if applicable

## 29. Observability and metrics

Track at minimum:

- decision count by action family and resolved tier;
- rate of `step_up_required`, `approval_required`, `manual_review_required`, `blocked`;
- safe-fail error rate;
- evaluation latency percentiles;
- configuration activation and rollback counts;
- redacted vs full config fetches;
- simulation usage by environment and caller.

## 30. Security requirements

- mutual service authentication or equivalent internal auth;
- caller scoping by service/application identity;
- request/response logging must avoid raw sensitive data and secrets;
- high-sensitivity threshold internals should be redacted from non-essential consumers;
- production configuration changes require governed approval and strong audit trail.

## 31. Backward compatibility

- additive fields may be introduced in minor API changes;
- breaking wire-format changes require new API version;
- policy configuration schema version support matrix must be documented by runtime;
- deprecated fields must have migration window and clear replacement.

## 32. QA expectations

### Required test coverage

- endpoint schema validation;
- threshold boundary evaluation;
- highest-tier-wins precedence;
- stale approval and stale step-up proof handling;
- activation overlap and rollback conflict handling;
- idempotency conflict detection;
- redacted config fetch authorization;
- safe-fail outcomes on missing FX or rule evaluation failures.

## 33. Anti-patterns to avoid

- executing sensitive business commands inside the evaluation service;
- duplicating threshold logic across command handlers;
- exposing exact anti-fraud thresholds to broad internal audiences;
- treating precheck result as execution authorization;
- activating config without semantic validation and simulation;
- allowing side-effecting endpoints without idempotency.

## 34. Related documents

Use together with:

- `machine-readable-threshold-configuration-schema.md`
- `threshold-catalog-by-currency-data-class-action-family.md`
- `action-to-control-tier-matrix.md`
- `step-up-authentication-and-dual-control-policy-spec.md`
- `admin-permission-hardening-spec.md`
- `api-resource-boundaries-and-contract-spec.md`
- `incident-response-playbook.md`