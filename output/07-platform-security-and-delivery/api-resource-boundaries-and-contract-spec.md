# API Resource Boundaries & Contract Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Backend + Platform Architecture
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `data-model-canonical-entities-spec.md`
  - `theblack-trade-api-contract-spec.md`
- Related documents:
  - `api-versioning-openapi-governance-and-deprecation-policy.md`
  - `error-catalog-and-api-ui-mapping-spec.md`
  - `contract-test-matrix.md`
  - `canonical-documentation-governance-spec.md`

## 1. Purpose

This document defines API resource boundaries and contract principles for TheBlack.Trade. It establishes how platform domains should expose resources, commands, queries, workflows and asynchronous jobs so that product, admin, compliance, finance, risk and operational use cases can evolve without unclear ownership, over-coupled endpoints or inconsistent control semantics.

The goal is not to freeze implementation style into a single framework pattern. The goal is to define canonical resource boundaries, contract expectations, command/query discipline, error semantics, idempotency and governance integration so that services remain composable and auditable.

## 2. Goals

The API contract model must:

- define bounded resource ownership across core platform domains;
- separate canonical system-of-record resources from derived or workflow views;
- establish command/query patterns for business actions and admin operations;
- integrate policy evaluation, approvals, step-up and governed event emission into resource behavior;
- standardize idempotency, versioning, pagination, filtering and error semantics;
- support synchronous and asynchronous execution models without ambiguity.

## 3. Non-goals

This document does not define:

- full OpenAPI specifications for every endpoint;
- UI-specific data shaping for every screen;
- broker or RPC transport internals behind service boundaries;
- every private intra-service method or repository abstraction.

## 4. Design principles

1. Every API resource must have a clear owning domain.
2. Commands should model business intent, not database patch mechanics.
3. Queries should expose stable read semantics and explicit projection scope.
4. Workflow and policy state must not be hidden in vague error strings.
5. Derived/admin views may aggregate across domains, but ownership remains explicit.
6. High-sensitivity actions require explicit governance contracts, not incidental middleware behavior.

## 5. Resource categories

The platform should distinguish several API surface categories.

| Category | Purpose |
|---|---|
| Canonical resources | System-of-record entities owned by a domain |
| Workflow resources | Approval, review, incident or operational flow objects |
| Derived read models | Aggregated/admin/reporting projections |
| Action/command endpoints | Explicit business operations on resources |
| Configuration resources | Policy, thresholds, templates, operational configs |
| Artifact resources | Documents, evidence, exports, archive packages |

## 6. Canonical boundary rule

A resource belongs to the domain that owns its lifecycle, invariants and primary state transitions.

### Consequences

- the owning domain defines canonical write operations;
- other domains may reference but should not directly mutate canonical state;
- cross-domain workflow should happen through commands, events or orchestrated process boundaries rather than shared write authority.

## 7. Primary domain ownership map

Recommended high-level ownership:

| Domain | Canonical resources |
|---|---|
| Customer/identity | customers, customer_profiles, KYC case linkage, contact points |
| Order/trade | quotes, orders, trade intents, pricing locks |
| Payments/inbound funds | payment_intents, inbound_payments, settlement references |
| Payouts/outbound funds | payout_requests, payout_executions, destination authorizations |
| Wallet/asset ledger | wallets, asset balances, transfer records, ledger entries |
| Compliance/risk | compliance_cases, holds, alerts, screenings, review outcomes |
| Approval/governance | approval_requests, approval_decisions, policy snapshots |
| Documents/evidence | uploaded_documents, evidence bundles, archive manifests |
| Notifications | notification_requests, delivery attempts, templates |
| Incidents/ops | incidents, incident actions, postmortem references |
| Config/policy | threshold_configs, policy_sets, routing rules, masking policies |

## 8. Canonical vs derived views

The same business object may appear in multiple API shapes.

### Rule

- canonical resource API is the source of truth for authoritative fields and writes;
- derived/admin/read APIs may join across domains for convenience;
- derived views must clearly indicate they are projections and may lag canonical state.

### Example

A payout detail page may be served by an aggregated admin read model that combines payout, customer, hold, approval and audit summary data. However, payout release command ownership still belongs to the payout/governance boundary.

## 9. Resource identity rules

### Principles

- every canonical resource has immutable primary identifier;
- public/admin identifiers should be stable and opaque where possible;
- composite business references may exist but should not replace canonical IDs;
- references across resources should use canonical IDs, not display labels.

### Recommended identifier fields

- `id`
- `external_ref` when relevant
- `correlation_id` for multi-step workflows
- `version` or `etag` for optimistic concurrency

## 10. Query contract principles

Queries should be explicit about scope and projection.

### Expectations

- stable filtering and sorting semantics;
- paginated collection access;
- explicit include/expand behavior where allowed;
- role-aware field visibility;
- consistent representation of redacted or unavailable fields;
- machine-readable state fields rather than UI-only strings.

### Rule

Queries should not trigger business side effects.

## 11. Command contract principles

Commands should represent meaningful domain actions.

### Examples of good commands

- `POST /payout-requests/{id}:request-release`
- `POST /approval-requests/{id}:approve`
- `POST /compliance-holds/{id}:release`
- `POST /threshold-configs/{id}:activate`

### Anti-patterns

- generic `PATCH` with loosely typed status updates for high-governance actions;
- hidden workflow transitions inside broad update payloads;
- overloading `status` fields as the only control surface.

## 12. Command result model

Governed commands should return structured action outcomes.

### Recommended result envelope

- `request_id`
- `resource_id`
- `command_name`
- `result_state`: accepted, completed, blocked, approval_required, step_up_required, manual_review_required, conflict, failed
- `resolved_tier`
- `required_controls`
- `approval_request_ref` if created
- `job_ref` if async
- `messages` with safe user/operator-facing hints
- `links` to follow-up resources

## 13. Command vs workflow resource

If an action creates durable governance state, that state should become its own resource.

### Example

A payout release command may return `approval_required` and create an `approval_request` resource. That approval request is no longer just command metadata; it is a first-class workflow resource with its own lifecycle, detail query and decision commands.

## 14. Synchronous vs asynchronous contracts

### Synchronous use when

- validation and execution are short;
- no long-running provider dependency exists;
- result is known immediately.

### Asynchronous use when

- provider calls or operational workflows are long-running;
- human approval/review is involved;
- archive/export generation is involved;
- retries and eventual completion matter.

### Async contract expectation

Return a durable `job` or workflow reference and explicit current state, not an ambiguous `200 OK` with background side effects.

## 15. Job resource model

Long-running processes should have explicit job resources.

### Recommended job fields

- `job_id`
- `job_type`
- `subject_type` / `subject_id`
- `state`: queued, running, waiting_on_approval, waiting_on_review, succeeded, failed, cancelled
- `progress_summary`
- `created_at`, `updated_at`
- `linked_command`
- `linked_approval_request_id` if any
- `result_ref` or failure summary

## 16. Approval and policy integration

API contracts for governed actions must integrate with the policy and approval model.

### Requirements

- commands may return `step_up_required`, `approval_required`, `manual_review_required` or `blocked` as first-class outcomes;
- approval creation should return resource reference and safe rationale;
- execution-time revalidation conflicts should be machine-readable;
- policy/version/rule references should be included where operationally useful and safe.

## 17. Step-up integration

For step-up-gated actions:

- API should expose whether fresh stronger authentication is required;
- proof scope and freshness should be evaluated server-side;
- follow-up command after step-up should be explicit and idempotent;
- expired proof should return structured re-auth requirement, not generic auth failure.

## 18. Error model

A consistent error model is required across domains.

### Recommended top-level error classes

| Error class | Meaning |
|---|---|
| `validation_error` | Input shape or business validation invalid |
| `auth_error` | Authentication missing/invalid |
| `permission_denied` | Actor lacks permission/visibility |
| `step_up_required` | Stronger authentication required |
| `approval_required` | Secondary approval required |
| `manual_review_required` | Human review flow required |
| `blocked_by_policy` | Action disallowed in current governance state |
| `conflict` | Version/state changed or transition invalid |
| `rate_limited` | Request exceeds allowed rate |
| `dependency_failure` | External/internal dependency unavailable |
| `safe_fail` | Governance-preserving failure due to ambiguity/unverified context |

### Rule

Errors for governed commands should be typed and structured, not inferred from prose.

## 19. Conflict and concurrency semantics

### Required behavior

- canonical write resources should support optimistic concurrency where stale writes matter;
- governed commands should detect changed entity state before execution;
- approvals bound to old state should fail or invalidate cleanly;
- bulk commands should report partial conflicts explicitly.

### Recommended fields

- `version` or `etag`
- `conflict_reason`
- `current_state_ref`

## 20. Idempotency rules

Idempotency is mandatory for sensitive or retry-prone commands.

### Commands that should be idempotent

- payout release request;
- approval decision commands;
- export/archive generation requests;
- config activation where retried by client/orchestrator;
- notification send requests where duplicate delivery matters.

### Recommended approach

- accept explicit `idempotency_key` for relevant commands;
- bind response replay to actor + command scope + request semantics;
- reject unsafe semantic reuse of same key with different payload.

## 21. Pagination, filtering and sorting

Collection APIs should use predictable semantics.

### Expectations

- cursor-based pagination for large volatile collections;
- stable ordering guarantees documented;
- filter dimensions named consistently across domains;
- range filters explicit for time, amount and risk dimensions.

### Common filters for governed resources

- `state`
- `resolved_tier`
- `action_family`
- `created_after` / `created_before`
- `incident_id`
- `approval_status`
- `domain`

## 22. Field visibility and redaction

Contracts must account for restricted visibility.

### Rules

- hidden fields should either be omitted or represented through consistent redaction markers;
- APIs should not leak sensitive policy logic through verbose helper text;
- reveal/download/export may require separate governed command even if resource metadata is readable;
- field visibility should be role-aware but predictable.

### Principle

Contract consumers must be able to distinguish `not present`, `redacted`, and `not applicable`.

## 23. Resource state modeling

State machines should be explicit in APIs.

### Expectations

- resource state fields use constrained enums;
- allowed transitions documented;
- terminal vs transient states distinguishable;
- workflow state not overloaded into multiple unrelated booleans.

### Example

An approval request should not require clients to infer state from combinations like `approved_at != null && invalidated_at == null && executed_at == null`; it should expose explicit lifecycle state.

## 24. Read-model aggregation APIs

Admin portals often need aggregated data.

### Rules

- aggregated read models may compose data across domains;
- aggregated endpoints are query-only and should not become hidden write surfaces;
- response must identify canonical sub-resource references;
- stale/lagged projection semantics should be documented where eventual consistency applies.

### Example categories

- admin customer 360 view;
- payout operations console list/detail;
- approval inbox read model;
- governance dashboard projections.

## 25. Artifact and export resources

Documents, evidence bundles, exports and archive packages require their own contract discipline.

### Required patterns

- metadata resource distinct from binary retrieval action;
- governed access checks before signed retrieval or streaming;
- lifecycle states for generated artifacts;
- retention/classification labels included in metadata;
- bulk export and archive restore modeled as jobs where needed.

## 26. Configuration resource contracts

Configuration resources are governed resources, not informal admin toggles.

### Expectations

- draft/validated/approved/active/superseded lifecycle;
- activation and rollback as explicit commands;
- diff or change summary support;
- version selection explicit;
- approval/policy linkage where required.

## 27. Event and audit linkage

API contracts should align with governed event taxonomy.

### Recommended linkage fields

- `correlation_id`
- `linked_event_ids`
- `approval_request_id`
- `job_id`
- `policy_version`
- `matched_rule_ids` where safe and useful

### Rule

Every governance-significant command should emit reconstructable audit/event chains.

## 28. Resource discoverability and links

Responses should help clients continue workflows safely.

### Recommended hypermedia-lite fields

- `links.self`
- `links.subject`
- `links.approval_request`
- `links.job`
- `links.audit_timeline`
- `next_actions` with typed action hints

This does not require full HATEOAS, but it reduces ambiguity in multi-step governed flows.

## 29. Versioning strategy

### Recommended approach

- API versioning at bounded-surface level when breaking changes cannot be evolved compatibly;
- additive field changes preferred where safe;
- enum narrowing or semantic repurposing treated as breaking;
- workflow/result-state changes require strong compatibility review.

### Rule

Avoid silent semantic changes to existing fields, especially around governance outcomes.

## 30. Admin vs public API boundary

The platform should keep public/customer-facing API contracts distinct from admin/governance API contracts.

### Principles

- admin APIs may expose richer operational context and governance state;
- public APIs should reveal only customer-appropriate state and reasons;
- internal admin workflow semantics should not leak into public contracts without deliberate design.

## 31. Cross-domain orchestration model

When a workflow spans domains, orchestration should be explicit.

### Patterns

- command in owning domain emits event and spawns job/workflow;
- governance domain owns approval resource;
- admin read model aggregates status across domains;
- downstream provider integration updates canonical execution resource.

### Rule

Cross-domain orchestration must not blur which domain owns final state transitions.

## 32. Example governed command response

```json
{
  "request_id": "req_01JXYZ...",
  "resource_id": "payout_123",
  "command_name": "request_release",
  "result_state": "approval_required",
  "resolved_tier": "tier_3",
  "required_controls": {
    "step_up": true,
    "dual_control": true
  },
  "approval_request_ref": {
    "id": "apr_456",
    "state": "created"
  },
  "job_ref": null,
  "messages": {
    "title": "Approval required",
    "body": "Secondary approval is required before this payout can be released."
  },
  "links": {
    "self": "/payout-requests/payout_123",
    "approval_request": "/approval-requests/apr_456"
  },
  "next_actions": [
    {
      "type": "open_approval_request",
      "label": "View approval request"
    }
  ]
}
```

## 33. Minimal resource checklist

Every resource/command contract should answer:

- who owns this resource;
- what is the canonical ID;
- what are the explicit states;
- what commands are allowed;
- what governance outcomes can occur;
- whether response is sync or async;
- how conflicts and retries behave;
- what audit/event resources link to it;
- what fields may be redacted.

## 34. QA and contract testing expectations

Need to validate:

- ownership boundaries are preserved;
- command outcomes map correctly to policy/approval states;
- idempotency and concurrency protections work under retry and stale data;
- aggregated read models do not become hidden write channels;
- redaction semantics are stable and non-leaky;
- async jobs and approval flows remain queryable and linkable throughout lifecycle.

## 35. Anti-patterns to avoid

- one giant admin endpoint that directly mutates multiple canonical domains;
- generic `PATCH status` for high-risk business operations;
- returning only `200`/`400` without typed governance outcomes;
- embedding long-running workflow state only in logs or UI memory;
- coupling public API contracts to internal admin workflow details;
- letting derived read models masquerade as canonical write resources.

## 36. Related documents

Use together with:

- `governed-event-taxonomy-and-schema-registry-spec.md`
- `approval-workflow-schema.md`
- `policy-evaluation-service-contract.md`
- `admin-ui-control-state-map.md`
- `machine-readable-threshold-configuration-schema.md`
- `data-model-canonical-entities-spec.md`
- `action-to-control-tier-matrix.md`
- `admin-permission-hardening-spec.md`