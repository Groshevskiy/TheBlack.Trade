# Approval Workflow Schema — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Compliance + Operations + Backend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `action-to-control-tier-matrix.md`
  - `policy-evaluation-service-contract.md`
  - `admin-permission-hardening-spec.md`
- Related documents:
  - `step-up-authentication-and-dual-control-policy-spec.md`
  - `admin-review-decision-matrix.md`
  - `contract-test-matrix.md`

## 1. Purpose

This document defines the machine-readable and workflow-level schema for approval-driven controls in TheBlack.Trade. It specifies how Tier 3 and Tier 4 actions create approval requests, how approvers are selected and constrained, how approval state transitions behave, and how execution-time revalidation interacts with approvals.

The schema is intended for backend/platform services, admin tooling, policy evaluation, finance, compliance, security, operations, QA and audit stakeholders.

## 2. Goals

The approval workflow model must:

- represent approval requests as first-class governed objects;
- enforce initiator/approver separation for dual-control actions;
- support stateful workflows for pending, approved, rejected, expired, cancelled and invalidated approvals;
- remain compatible with policy evaluation and execution-time revalidation;
- support auditability, explainability and incident linkage;
- allow machine-readable routing and expiry rules without embedding them ad hoc in business handlers.

## 3. Non-goals

This schema does not itself:

- define user roles or permission grants;
- authenticate approvers;
- execute the protected business command;
- replace the policy engine or threshold configuration model;
- define end-user customer approval concepts.

## 4. Core principles

1. Approvals are independent control objects, not UI-only confirmations.
2. A created approval request does not guarantee eventual execution.
3. Approval validity is conditional on preserved context and fresh policy evaluation.
4. Initiator and approver separation is the default for Tier 3 and Tier 4 controls.
5. Workflow state changes must be explicit, auditable and idempotent where relevant.
6. The stricter policy wins when approval rules and runtime context diverge.

## 5. Canonical entities

The model is centered around the following entities:

| Entity | Purpose |
|---|---|
| `approval_request` | Primary workflow object governing a protected action |
| `approval_decision` | Individual approver decision artifact |
| `approval_subject` | The protected action target and its business context |
| `approval_policy_snapshot` | Frozen summary of controls/policy used when request was created |
| `approval_revalidation_result` | Execution-time policy and context recheck result |
| `approval_audit_event` | Structured workflow/audit event |

## 6. Approval request lifecycle

Recommended canonical lifecycle:

```text
draft -> pending_approval -> approved -> executed
                     \-> rejected
                     \-> expired
                     \-> cancelled
                     \-> invalidated
```

### State meanings

| State | Meaning |
|---|---|
| `draft` | Request object assembled but not yet submitted for approval |
| `pending_approval` | Awaiting one or more approver decisions |
| `approved` | Required approvals completed; still requires execution-time revalidation |
| `rejected` | Denied by eligible approver or policy workflow |
| `expired` | Approval window elapsed |
| `cancelled` | Withdrawn by initiator or system before completion |
| `invalidated` | Previously valid request made unusable by state/context/policy change |
| `executed` | Protected command completed using valid approved request |

## 7. Approval request object

### Canonical schema

```yaml
approval_request:
  approval_request_id: apr_001
  workflow_version: 1.0.0
  environment: production
  status: pending_approval
  created_at: 2026-10-03T08:40:00Z
  created_by:
    actor_id: actor_finance_001
    role_families: [finance_operator]
  subject:
    action_family: payout_release
    entity_type: payout
    entity_id: pout_123
    business_domain: payouts
    scope:
      record_count: 1
      data_class: class_b
  policy_snapshot:
    policy_config_id: threshold-config-prod-2026-10-03-001
    resolved_tier: tier_3
    required_controls:
      step_up: true
      dual_control: true
      manual_review: false
      heightened_monitoring: false
    matched_rule_ids:
      - payout-release-default
      - payout-release-tier-3
  step_up_context:
    proof_id: sup_123
    assurance_level: tier_2
    issued_at: 2026-10-03T08:38:00Z
    expires_at: 2026-10-03T08:48:00Z
  approval_policy:
    min_approver_count: 1
    initiator_may_approve: false
    approver_role_families: [finance_approver]
    approval_expiry: 2026-10-03T09:10:00Z
    revalidate_on:
      - entity_state_change
      - permission_change
      - incident_mode_change
      - threshold_config_change
  routing:
    routing_key: payouts.finance.high_value_release
    candidate_approvers:
      - actor_finance_approver_002
      - actor_finance_approver_003
  justification:
    reason_code: manual_release_after_review
    comment: "Payment confirmed, risk clear, awaiting second approval."
  linked_objects:
    incident_id: null
    correlation_id: corr_001
    request_id: req_pol_001
  timestamps:
    submitted_at: 2026-10-03T08:40:05Z
    approved_at: null
    rejected_at: null
    expired_at: null
    cancelled_at: null
    invalidated_at: null
    executed_at: null
```

## 8. Required fields

| Field | Required | Description |
|---|---:|---|
| `approval_request_id` | Yes | Stable unique request identifier |
| `workflow_version` | Yes | Approval workflow schema version |
| `environment` | Yes | Environment scope |
| `status` | Yes | Current workflow state |
| `created_at` | Yes | Creation timestamp |
| `created_by` | Yes | Initiating actor context |
| `subject` | Yes | Protected action target |
| `policy_snapshot` | Yes | Frozen policy decision evidence at creation time |
| `approval_policy` | Yes | Approval routing and expiry requirements |
| `routing` | Yes | Candidate approvers/routing key |
| `justification` | Yes | Structured reason and optional comment |
| `linked_objects` | Yes | Correlation objects for auditability |

## 9. Approval subject schema

```yaml
subject:
  action_family: payout_release
  entity_type: payout
  entity_id: pout_123
  business_domain: payouts
  scope:
    record_count: 1
    data_class: class_b
    source: live
    domains: [payouts]
  financial:
    normalized_value: 13500.00
    normalized_currency: USD
```

### Rule

`subject` must contain enough information for approvers and execution-time revalidation to determine what exactly is being approved.

## 10. Policy snapshot schema

```yaml
policy_snapshot:
  policy_config_id: threshold-config-prod-2026-10-03-001
  policy_schema_version: 1.0.0
  resolved_tier: tier_3
  decision_state: approval_required
  required_controls:
    step_up: true
    dual_control: true
    manual_review: false
    heightened_monitoring: false
    incident_link_required: false
  matched_rule_ids:
    - payout-release-default
    - payout-release-tier-3
  evaluation_evidence:
    normalized_value: 13500.00
    normalized_currency: USD
    contextual_flags: []
```

### Rule

The policy snapshot is a frozen explainability artifact. It does not remove the need for later revalidation.

## 11. Approval policy schema

```yaml
approval_policy:
  min_approver_count: 1
  max_approver_count: 2
  initiator_may_approve: false
  approver_role_families: [finance_approver]
  approver_must_be_distinct_from:
    - initiator
  approval_expiry: 2026-10-03T09:10:00Z
  approval_expiry_duration: PT30M
  decision_quorum: unanimous # unanimous | any_one | configured_quorum
  revalidate_on:
    - entity_state_change
    - permission_change
    - incident_mode_change
    - threshold_config_change
    - approval_policy_change
```

### Rules

- Tier 3 and Tier 4 actions must default `initiator_may_approve` to false;
- `approval_expiry` and/or `approval_expiry_duration` must be present;
- policy may require more than one approver for selected Tier 4 or emergency actions;
- stricter policy at runtime may invalidate the request.

## 12. Routing schema

```yaml
routing:
  routing_key: compliance.high_risk_hold_release
  routing_strategy: eligible_pool # eligible_pool | direct_assignment | escalation_chain | round_robin
  candidate_approvers:
    - actor_compliance_approver_001
    - actor_compliance_approver_004
  fallback_queue: compliance_approvers_l2
  escalation:
    escalate_after: PT10M
    escalate_to_role_families: [compliance_supervisor]
```

### Rules

- candidate approvers must be resolved from current entitlement state;
- routing metadata should be reproducible and auditable;
- routing should not bypass SoD or initiator/approver separation.

## 13. Approval decision object

Each approver action should create an immutable decision artifact.

```yaml
approval_decision:
  approval_decision_id: apd_001
  approval_request_id: apr_001
  decided_at: 2026-10-03T08:50:00Z
  decided_by:
    actor_id: actor_finance_approver_002
    role_families: [finance_approver]
  decision: approve # approve | reject | abstain
  reason_code: reviewed_and_approved
  comment: "Verified release conditions and source evidence."
  decision_context:
    session_step_up_present: true
    session_unusual_device: false
  linked_audit_event_id: aud_001
```

### Rules

- decision artifacts must be append-only;
- update means new decision artifact, not mutation of prior decision;
- rejected decisions should carry structured reason codes;
- abstain should not count toward required approval unless explicitly configured.

## 14. Machine-readable enums

### Approval request status

```yaml
approval_status:
  enum: [draft, pending_approval, approved, rejected, expired, cancelled, invalidated, executed]
```

### Decision type

```yaml
decision_type:
  enum: [approve, reject, abstain]
```

### Routing strategy

```yaml
routing_strategy:
  enum: [eligible_pool, direct_assignment, escalation_chain, round_robin]
```

### Decision quorum

```yaml
decision_quorum:
  enum: [unanimous, any_one, configured_quorum]
```

## 15. State transition rules

### Allowed transitions

| From | To |
|---|---|
| `draft` | `pending_approval`, `cancelled` |
| `pending_approval` | `approved`, `rejected`, `expired`, `cancelled`, `invalidated` |
| `approved` | `executed`, `expired`, `cancelled`, `invalidated` |
| `rejected` | terminal |
| `expired` | terminal |
| `cancelled` | terminal |
| `invalidated` | terminal |
| `executed` | terminal |

### Rules

- terminal states are immutable except for derived audit annotations;
- `approved` does not imply business command executed;
- any material context change may transition pending/approved request to `invalidated`.

## 16. Invalidation triggers

Approval requests should be invalidated when any configured `revalidate_on` condition occurs.

### Recommended invalidation triggers

- subject entity state changed materially;
- actor permissions changed;
- approver no longer eligible;
- active incident mode changed;
- active threshold/policy configuration changed;
- required step-up proof expired before execution;
- linked destination/requisite changed;
- hold/risk/compliance flags materially changed.

## 17. Execution binding rules

A protected command may execute with an approval request only if:

- request state is `approved`;
- approval not expired or invalidated;
- execution-time policy evaluation still requires no stricter controls than satisfied controls;
- entity/action context materially matches the approved subject;
- initiator/approver separation remains valid;
- required step-up proof is still valid if policy demands fresh proof at execution.

## 18. Approval creation contract

Recommended creation input:

```yaml
approval_request_create:
  request_id: req_pol_001
  action_context_ref: dec_001
  subject:
    action_family: payout_release
    entity_type: payout
    entity_id: pout_123
  initiator:
    actor_id: actor_finance_001
  justification:
    reason_code: manual_release_after_review
    comment: "Payment confirmed, requesting final approval."
```

### Rules

- approval request should normally be created from a policy evaluation result indicating `approval_required`;
- creation should persist policy snapshot or reference immutable evaluation artifact;
- approval creation must be idempotent for same protected action and correlation context unless policy explicitly allows multiple concurrent requests.

## 19. Approval resolution contract

Recommended resolution input:

```yaml
approval_decision_submit:
  approval_request_id: apr_001
  actor_id: actor_finance_approver_002
  decision: approve
  reason_code: reviewed_and_approved
  comment: "Release conditions verified."
```

### Rules

- approver identity and current eligibility must be checked at decision time;
- initiator may not resolve as approver when prohibited;
- once decision quorum satisfied, workflow transitions to `approved` or `rejected` per policy.

## 20. Quorum and multi-approver rules

The schema should support:

- one-of-N approval (`any_one`);
- unanimous approval among assigned approvers;
- configured quorum where `min_approver_count > 1`.

### Example

```yaml
approval_policy:
  min_approver_count: 2
  max_approver_count: 3
  decision_quorum: configured_quorum
  approver_role_families: [security_administrator, platform_administrator]
```

### Rule

Tier 4 emergency or broad-blast-radius actions may require multi-approver quorum with role-family diversity.

## 21. Segregation-of-duties constraints

Recommended machine-readable SoD fields:

```yaml
segregation_of_duties:
  initiator_may_approve: false
  disallowed_actor_relationships:
    - same_actor
    - same_session
  disallowed_role_combinations:
    - [finance_operator, finance_approver]
    - [security_operator, security_auditor]
  require_independent_role_family: true
```

### Rules

- same actor must never satisfy both initiator and approver role on Tier 3/Tier 4 actions unless explicit emergency exception path is separately governed;
- if role-family diversity is required, quorum should not be satisfied by same role family alone.

## 22. Expiry model

### Required fields

```yaml
expiry:
  created_at: 2026-10-03T08:40:00Z
  expires_at: 2026-10-03T09:10:00Z
  auto_expire: true
  expire_reason_code_on_timeout: approval_timeout
```

### Rules

- expired approvals cannot be revived by editing timestamp;
- new request required after expiry unless workflow policy supports explicit resubmission;
- execution must fail closed once approval expired.

## 23. Cancellation model

Cancellation may be initiated by:

- request initiator before resolution, where allowed;
- system due to duplicated or superseded approval flow;
- supervisor/workflow controller for governance reasons.

### Recommended cancellation fields

```yaml
cancellation:
  cancelled_by: actor_finance_001
  cancelled_at: 2026-10-03T08:55:00Z
  reason_code: superseded_request
  comment: "Replaced by corrected approval request with updated amount."
```

## 24. Audit and event schema

Every workflow transition and decision should emit structured events.

```yaml
approval_audit_event:
  event_id: aud_001
  event_type: approval_request_approved
  approval_request_id: apr_001
  timestamp: 2026-10-03T08:50:01Z
  actor_id: actor_finance_approver_002
  correlation_id: corr_001
  request_id: req_pol_001
  action_family: payout_release
  subject_entity_id: pout_123
  from_status: pending_approval
  to_status: approved
  metadata:
    resolved_tier: tier_3
    matched_rule_ids:
      - payout-release-default
      - payout-release-tier-3
```

### Required event types

Recommended event types:

- `approval_request_created`
- `approval_request_submitted`
- `approval_request_approved`
- `approval_request_rejected`
- `approval_request_expired`
- `approval_request_cancelled`
- `approval_request_invalidated`
- `approval_request_executed`
- `approval_request_revalidation_failed`

## 25. JSON Schema excerpt

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://theblack.trade/schemas/approval-workflow/v1",
  "title": "TheBlack.Trade Approval Workflow",
  "type": "object",
  "required": [
    "approval_request_id",
    "workflow_version",
    "environment",
    "status",
    "created_at",
    "created_by",
    "subject",
    "policy_snapshot",
    "approval_policy",
    "routing",
    "justification",
    "linked_objects"
  ],
  "properties": {
    "approval_request_id": {"type": "string", "minLength": 6},
    "workflow_version": {"type": "string", "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$"},
    "environment": {"enum": ["development", "staging", "production"]},
    "status": {"enum": ["draft", "pending_approval", "approved", "rejected", "expired", "cancelled", "invalidated", "executed"]},
    "created_at": {"type": "string", "format": "date-time"},
    "linked_objects": {"type": "object"}
  },
  "additionalProperties": true
}
```

## 26. API integration expectations

Approval workflow should integrate with the Policy Evaluation Service as follows:

1. policy evaluation returns `approval_required`;
2. approval request created from decision artifact;
3. approver decision(s) collected through workflow service;
4. execution-time revalidation performed;
5. protected business command executes or fails closed;
6. execution result linked back to approval request.

### Required linkage fields

- `policy_decision_id`
- `approval_request_id`
- `correlation_id`
- `subject.entity_id`
- `action_family`

## 27. Redaction and visibility rules

Different actors may see different views of approval requests.

### Recommended visibility principles

- initiator sees request status and safe summary;
- approver sees justification, policy snapshot summary and required business evidence;
- auditor sees immutable history and linked decisions;
- low-privilege viewers must not gain access to hidden data purely through approval metadata.

## 28. Observability and metrics

Track at minimum:

- approval requests created by action family and resolved tier;
- approval latency by routing key and role family;
- rejection rate by reason code;
- invalidation and expiry rates;
- execution success rate after approval;
- self-approval attempt rate;
- emergency/Tier 4 approval frequency.

## 29. QA requirements

### Need to validate

- allowed state transitions only;
- initiator/approver separation enforced;
- expired approvals cannot execute actions;
- invalidation occurs on configured context changes;
- multi-approver quorum behaves correctly;
- immutable decision history preserved;
- execution-time revalidation blocks stale approvals;
- visibility/redaction does not leak sensitive hidden data.

## 30. Anti-patterns to avoid

- using modal confirmation as substitute for approval object;
- mutating approval history in place;
- approving a generic entity rather than a concrete governed action;
- skipping revalidation after approval;
- allowing same actor to initiate and approve Tier 3/Tier 4 actions by default;
- keeping approvals valid after material subject change or policy change.

## 31. Related documents

Use together with:

- `policy-evaluation-service-contract.md`
- `machine-readable-threshold-configuration-schema.md`
- `threshold-catalog-by-currency-data-class-action-family.md`
- `step-up-authentication-and-dual-control-policy-spec.md`
- `action-to-control-tier-matrix.md`
- `admin-permission-hardening-spec.md`
- `incident-response-playbook.md`