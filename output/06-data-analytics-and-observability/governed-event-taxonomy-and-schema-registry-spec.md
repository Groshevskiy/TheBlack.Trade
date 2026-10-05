# Governed Event Taxonomy & Schema Registry Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Platform + Data + Backend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `data-model-canonical-entities-spec.md`
  - `theblack-trade-api-contract-spec.md`
- Related documents:
  - `event-taxonomy-and-schema-registry.md`
  - `notification-event-matrix.md`
  - `contract-test-matrix.md`

## 1. Purpose

This document defines the governed event taxonomy and schema registry model for TheBlack.Trade. Its purpose is to standardize how high-sensitivity operational, policy, approval, execution and governance events are named, structured, versioned, validated and consumed across platform services, admin tooling, observability pipelines, audit systems and analytics.

The spec establishes a canonical vocabulary for governed events so that policy evaluation, threshold escalation, approval workflow, execution audit, incident response, archive access and configuration governance can all rely on the same event contracts.

## 2. Goals

The governed event model must:

- provide a canonical event taxonomy for policy and governance flows;
- define machine-readable schema contracts for governed events;
- support validation, compatibility checks and safe schema evolution;
- enable operational observability, historical audit and analytics reuse;
- preserve data minimization, redaction and role-aware consumption;
- provide traceability from business command to policy decision to execution outcome.

## 3. Non-goals

This document does not define:

- every product or growth analytics event in the platform;
- transport-specific broker implementation details;
- raw log ingestion conventions for low-value debug logs;
- user-facing telemetry unrelated to governed operational controls.

## 4. Scope

This spec applies to events emitted for:

- policy evaluation and execution-time revalidation;
- threshold escalation;
- step-up authentication lifecycle;
- approval workflow lifecycle;
- governed action execution lifecycle;
- configuration activation and rollback;
- incident-linked governance actions;
- archive retrieval and sensitive export access where governance applies;
- control-related failures, blocks, invalidations and safe-fail outcomes.

## 5. Core principles

1. Governed events are canonical contracts, not ad hoc logs.
2. Event meaning must be stable over time.
3. Schema evolution must be explicit and reviewable.
4. Sensitive payloads must be minimized and classified.
5. Consumers should rely on typed fields, not free-form parsing.
6. Correlation across decision, approval and execution is a first-class requirement.

## 6. Taxonomy overview

Recommended top-level event families:

| Event family | Purpose |
|---|---|
| `policy_decision_event` | Record policy evaluation and revalidation outcomes |
| `threshold_trigger_event` | Record why tier escalation or routing changed |
| `step_up_event` | Record strong-auth challenge lifecycle |
| `approval_event` | Record approval request and decision lifecycle |
| `governed_action_execution_event` | Record execution lifecycle of governed business commands |
| `config_lifecycle_event` | Record threshold/policy config lifecycle changes |
| `incident_control_event` | Record incident-linked and break-glass governance actions |
| `sensitive_access_event` | Record governed reveal/download/export/archive-access actions |
| `control_health_event` | Record synthetic or derived control-health signals where canonicalized |

## 7. Naming conventions

### Canonical event type naming

Use a stable dotted form:

`governance.<family>.<action>.<versioned-semantic-type>`

Examples:

- `governance.policy.decision.evaluated`
- `governance.policy.decision.revalidated`
- `governance.threshold.trigger.fired`
- `governance.step_up.challenge.completed`
- `governance.approval.request.created`
- `governance.approval.request.invalidated`
- `governance.action.execution.succeeded`
- `governance.config.thresholds.activated`
- `governance.incident.break_glass.activated`
- `governance.sensitive_access.export.requested`

### Rules

- event names describe what happened, not what should happen;
- event names must be immutable once published;
- avoid transport, UI or team-specific prefixes;
- avoid overloaded generic names such as `action.updated`.

## 8. Event class vs event type

The model should distinguish:

- **event class**: broad schema family such as `approval_event`;
- **event type**: concrete business occurrence such as `governance.approval.request.created`;
- **event version**: schema version applicable to the payload.

This separation helps preserve stable tooling around families while allowing concrete event evolution.

## 9. Required event envelope

Every governed event should include a common envelope.

### Required envelope fields

| Field | Purpose |
|---|---|
| `event_id` | Globally unique immutable event identifier |
| `event_type` | Canonical concrete event type |
| `event_class` | Canonical schema family |
| `schema_id` | Registry schema identifier |
| `schema_version` | Payload schema version |
| `occurred_at` | Business occurrence timestamp |
| `emitted_at` | Emission timestamp |
| `producer_service` | Canonical producer identity |
| `environment` | prod, staging, etc. |
| `correlation_id` | Cross-step correlation chain |
| `causation_id` | Immediate prior trigger/event/command |
| `trace_id` | Distributed tracing link where available |
| `tenant_scope` | Tenant or business partition scope if applicable |
| `payload` | Typed event payload |
| `classification` | Sensitivity/classification metadata |

## 10. Classification and handling metadata

Governed events require explicit handling metadata.

### Recommended classification subfields

- `data_class`: A/B/C/D or equivalent platform sensitivity scale;
- `contains_pii`: boolean;
- `contains_secret_material`: boolean;
- `redaction_profile`: reference to allowed consumer view;
- `retention_profile_id`: link to retention policy;
- `legal_hold_eligible`: boolean.

### Rule

Classification metadata is part of the event contract, not an optional downstream annotation.

## 11. Canonical subject and actor model

Every governed event should describe who acted, on what, and in what governance context.

### Recommended envelope-linked references

- `actor.actor_id`;
- `actor.actor_type` such as user, service, scheduled_job;
- `actor.role_family`;
- `subject.subject_type`;
- `subject.subject_id`;
- `subject.parent_context` where applicable;
- `governance_context.resolved_tier`;
- `governance_context.incident_id` if any;
- `governance_context.break_glass` boolean.

## 12. Policy decision event

### Purpose

Represents outcome of policy evaluation or execution-time revalidation.

### Required payload fields

- `evaluation_mode`: precheck, approval-time, execution-time, read-access;
- `decision_state`: allow, step_up_required, approval_required, manual_review_required, blocked, error_safe_fail;
- `action_family`;
- `resolved_tier`;
- `policy_version`;
- `matched_rule_ids` array;
- `reason_categories` array;
- `required_controls` object;
- `approval_required` boolean;
- `step_up_required` boolean;
- `evaluation_latency_ms`.

### Notes

Use structured reason categories rather than free-form operational text as the canonical decision basis.

## 13. Threshold trigger event

### Purpose

Explains why threshold logic changed required governance level.

### Required payload fields

- `action_family`;
- `threshold_catalog_id`;
- `threshold_rule_id`;
- `threshold_dimension` such as amount, count, velocity, archive_scope;
- `input_value_normalized`;
- `comparison_operator`;
- `threshold_value_normalized`;
- `baseline_tier`;
- `resolved_tier`;
- `normalization_context` including currency/rail/provider if relevant;
- `trigger_reason_category`.

## 14. Step-up event

### Purpose

Tracks strong-authentication challenge lifecycle for governed actions.

### Required payload fields

- `challenge_id`;
- `challenge_state`: requested, satisfied, failed, expired, revoked;
- `assurance_level`;
- `action_family`;
- `proof_scope`;
- `expires_at`;
- `result_reason_category`;
- `linked_policy_decision_event_id`.

### Rule

Do not store sensitive authenticator secrets or raw challenge material in event payloads.

## 15. Approval event

### Purpose

Tracks approval-request lifecycle and decisions.

### Required payload fields

- `approval_request_id`;
- `approval_state`: created, submitted, approved, rejected, expired, cancelled, invalidated, executed;
- `action_family`;
- `subject_snapshot_ref`;
- `policy_snapshot_ref`;
- `initiator_actor_id`;
- `approver_actor_id` when applicable;
- `routing_key`;
- `quorum_requirements` summary;
- `decision_reason_code`;
- `expires_at`;
- `linked_policy_decision_event_id`;
- `linked_execution_event_id` when applicable.

### Rule

Payload should contain references and safe summaries, not full sensitive business snapshots, unless explicitly classified and justified.

## 16. Governed action execution event

### Purpose

Tracks the execution lifecycle of a governed business command.

### Required payload fields

- `execution_id`;
- `execution_state`: requested, started, succeeded, failed, conflict, aborted;
- `action_family`;
- `command_name`;
- `subject_version` or entity version;
- `execution_mode`: immediate, async_job, post_approval, incident_emergency;
- `linked_policy_decision_event_id`;
- `linked_approval_request_id` if any;
- `result_reason_category`;
- `execution_latency_ms`;
- `idempotency_key` when applicable.

## 17. Config lifecycle event

### Purpose

Tracks creation, validation, approval, activation and rollback of governed configuration.

### Required payload fields

- `config_family`;
- `config_id`;
- `config_version`;
- `lifecycle_state`: drafted, validated, approved, activated, rolled_back, superseded;
- `change_summary`;
- `linked_approval_request_id` if any;
- `supersedes_config_version` when applicable;
- `activation_scope`.

## 18. Incident control event

### Purpose

Tracks incident-linked escalations and emergency governance actions.

### Required payload fields

- `incident_id`;
- `incident_control_type`: break_glass, emergency_override, emergency_approval, emergency_rollback;
- `control_state`;
- `action_family` where applicable;
- `linked_approval_request_id` if any;
- `linked_execution_event_id` if any;
- `expires_at` if temporary;
- `review_required` boolean.

## 19. Sensitive access event

### Purpose

Tracks governed access to reveal, download, export, archive-restore or historical evidence retrieval.

### Required payload fields

- `access_mode`: reveal, download, export, archive_restore, evidence_view;
- `resource_scope`;
- `resource_classification`;
- `volume_indicator` such as single, bulk, archive-wide;
- `linked_policy_decision_event_id`;
- `linked_approval_request_id` if any;
- `outcome_state`.

## 20. Control health event

### Purpose

Used only where a derived control-health signal becomes a canonical event rather than a dashboard-only metric.

### Example cases

- approval backlog SLA breach;
- step-up failure spike;
- safe-fail anomaly;
- invalidation spike.

### Rule

Do not emit control-health events for every dashboard point; only emit when the derived condition is itself governance-significant.

## 21. Schema registry model

The platform should maintain a central schema registry for governed events.

### Registry responsibilities

- assign `schema_id` and `schema_version`;
- store canonical JSON Schema or equivalent machine-readable schema;
- validate producer submissions;
- expose compatibility checks for consumers;
- retain schema history and changelog;
- record ownership and approval metadata.

## 22. Registry metadata

Each registered schema should include:

- schema ID;
- canonical event class;
- concrete event types covered;
- current version;
- compatibility mode;
- owner team;
- steward/reviewer roles;
- classification defaults;
- retention profile;
- changelog;
- status: draft, approved, active, deprecated, retired.

## 23. Compatibility policy

Recommended compatibility posture:

| Change type | Default policy |
|---|---|
| Add optional field | Backward-compatible |
| Add required field | Breaking change |
| Rename field | Breaking change |
| Remove field | Breaking change |
| Widen enum with consumer-safe handling | Review-required, often backward-compatible |
| Narrow enum | Breaking change |
| Change semantic meaning of field | Breaking change even if structure unchanged |

### Rule

Semantic compatibility matters as much as structural compatibility.

## 24. Versioning strategy

### Recommended strategy

- increment minor-compatible versions for optional additive changes;
- increment major version for breaking changes;
- keep event type stable when semantics remain same and schema evolves compatibly;
- create a new event type when semantics materially change.

### Example

If `approval.request.created` later includes optional routing metadata, keep event type and bump schema version. If meaning changes from single approval request to multi-stage approval object with incompatible semantics, consider a new event type.

## 25. Producer obligations

Every governed-event producer must:

- register schema before production emission;
- validate payload before emit;
- include required envelope and classification fields;
- preserve idempotent event identity semantics where needed;
- document event emission triggers;
- emit through approved production path, not ad hoc side logging.

## 26. Consumer obligations

Every governed-event consumer must:

- bind to known schema versions or compatible ranges;
- fail safely on unknown required semantics;
- avoid parsing human-readable text for canonical meaning;
- respect classification/redaction profile;
- avoid assuming ordering beyond documented guarantees.

## 27. Redaction and projection model

Different consumers may need different views of the same event.

### Recommended model

- canonical stored event payload;
- one or more approved projection profiles for observability, admin UI, audit and analytics;
- registry-linked redaction rules by role family or data product.

### Rule

Redacted projections must preserve enough semantics for governance analysis without leaking restricted details.

## 28. Event lifecycle and retention

Governed events must integrate with retention and archival policy.

### Required alignment

- retention profile reference on event or schema family;
- archive eligibility by class and event family;
- legal-hold compatibility;
- immutable audit preservation rules for high-severity governance events;
- clear purge constraints for derived projections vs canonical audit events.

## 29. Correlation model

Cross-event traceability is mandatory.

### Required correlation patterns

- policy decision -> threshold trigger(s);
- policy decision -> step-up challenge;
- policy decision -> approval request;
- approval request -> approval decision;
- approval request -> execution event;
- incident control -> approval/execution/config events;
- config activation -> later policy decisions referencing active config version.

### Rule

A reviewer should be able to reconstruct the lifecycle of a governed action from linked events.

## 30. Ordering and idempotency considerations

### Ordering

- global total order should not be assumed;
- local order within a subject or correlation chain may be available but must be documented;
- consumers should tolerate delayed or out-of-order arrival.

### Idempotency

- duplicate delivery must be assumed possible;
- `event_id` and producer semantics must support deduplication;
- repeated emissions for retry must not create ambiguous state transitions.

## 31. Validation and CI policy

Schema changes should be validated through automated checks.

### Required checks

- schema syntax validation;
- compatibility validation;
- required metadata presence;
- enum and classification consistency;
- example payload validation;
- owner/reviewer approval workflow.

## 32. Example envelope

```json
{
  "event_id": "evt_01JXYZ...",
  "event_type": "governance.approval.request.created",
  "event_class": "approval_event",
  "schema_id": "approval_event.created",
  "schema_version": "1.2.0",
  "occurred_at": "2026-10-03T08:21:10Z",
  "emitted_at": "2026-10-03T08:21:11Z",
  "producer_service": "approval-service",
  "environment": "prod",
  "correlation_id": "corr_abc123",
  "causation_id": "evt_prev123",
  "trace_id": "trace_xyz789",
  "tenant_scope": "global",
  "classification": {
    "data_class": "C",
    "contains_pii": false,
    "contains_secret_material": false,
    "redaction_profile": "approval_ops_summary_v1",
    "retention_profile_id": "ret_gov_audit_long",
    "legal_hold_eligible": true
  },
  "actor": {
    "actor_id": "usr_123",
    "actor_type": "user",
    "role_family": "operations"
  },
  "subject": {
    "subject_type": "payout",
    "subject_id": "po_456"
  },
  "governance_context": {
    "resolved_tier": "tier_3",
    "incident_id": null,
    "break_glass": false
  },
  "payload": {
    "approval_request_id": "apr_789",
    "approval_state": "created",
    "action_family": "payout_release",
    "subject_snapshot_ref": "snap_001",
    "policy_snapshot_ref": "polsnap_001",
    "initiator_actor_id": "usr_123",
    "approver_actor_id": null,
    "routing_key": "finance.high_value",
    "quorum_requirements": {"mode": "single"},
    "decision_reason_code": "threshold_high_value",
    "expires_at": "2026-10-03T10:21:10Z",
    "linked_policy_decision_event_id": "evt_555",
    "linked_execution_event_id": null
  }
}
```

## 33. Recommended registry governance

### Ownership

- each schema family has an owning team;
- governance/security and data platform act as review stakeholders for governed families;
- no anonymous or orphaned schemas.

### Change process

- propose schema change with rationale and compatibility assessment;
- include sample payloads and consumer impact notes;
- secure required reviewers before activation;
- publish changelog and deprecation notice where needed.

## 34. QA and test expectations

Need to verify:

- producers emit valid schema-conformant events;
- consumers handle compatible schema evolution safely;
- redacted projections remain consistent with canonical events;
- correlation chains are reconstructable;
- delayed, duplicate and out-of-order events do not break downstream control analysis;
- registry metadata and status are correct.

## 35. Anti-patterns to avoid

- using free-form logs as substitute for governed event contracts;
- encoding critical meaning only in human-readable message strings;
- storing unbounded sensitive snapshots in every event payload;
- changing event semantics without new version/review;
- letting dashboards invent metric meanings not grounded in canonical events;
- omitting classification and retention metadata from high-sensitivity event families.

## 36. Related documents

Use together with:

- `operational-dashboard-for-threshold-triggered-actions.md`
- `qa-scenario-matrix-by-action-tier.md`
- `approval-workflow-schema.md`
- `policy-evaluation-service-contract.md`
- `machine-readable-threshold-configuration-schema.md`
- `data-retention-and-archival-spec.md`
- `field-level-sensitivity-and-masking-matrix.md`
- `incident-response-playbook.md`