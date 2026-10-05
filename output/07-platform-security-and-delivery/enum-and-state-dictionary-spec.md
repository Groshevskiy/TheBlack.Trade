# Enum & State Dictionary Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Product + Backend + Finance Ops
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `order-domain-model-spec.md`
  - `theblack-trade-order-state-machine-spec.md`
  - `transaction-status-state-machine-spec.md`
- Related documents:
  - `approval-workflow-schema.md`
  - `action-to-control-tier-matrix.md`
  - `step-up-authentication-and-dual-control-policy-spec.md`

## 1. Purpose

This document defines a canonical enum and state dictionary for TheBlack.Trade. It standardizes controlled vocabularies and lifecycle states used across APIs, events, workflows, admin UI, audit records, analytics and operational tooling so that the platform does not drift into conflicting labels, overloaded status fields or ambiguous transition semantics.

The dictionary is intended to be the semantic reference layer for engineers, product, operations, compliance, finance, QA, analytics, observability and governance stakeholders.

## 2. Goals

The dictionary must:

- provide canonical enums and state meanings for shared platform concepts;
- define where each enum is authoritative and where it may be projected or mapped;
- reduce semantic drift across services, UI and analytics;
- support machine-readable contracts, validation and testability;
- distinguish lifecycle state from decision outcome, reason category and visibility marker;
- provide guidance for state transitions, alias handling and deprecation.

## 3. Non-goals

This document does not define:

- every internal code constant or language-specific enum implementation;
- every provider-native status in raw form;
- free-form notes, labels or explanatory text used only for human display;
- complete state machines for every entity beyond the shared semantic layer.

## 4. Core principles

1. One concept should have one canonical enum meaning.
2. Different concepts should not share the same enum just because labels look similar.
3. Lifecycle state, decision result, reason code and visibility marker are separate dimensions.
4. Canonical enums may be mapped from provider-specific values, but provider values are not canonical by default.
5. Deprecated enum values require migration strategy, not silent replacement.
6. Analytics and dashboards must consume canonical values, not infer semantics from UI copy.

## 5. Dictionary model

Each enum entry should define:

- enum name;
- semantic category;
- authoritative owner;
- allowed values;
- value meaning;
- valid transitions or usage rules where relevant;
- related API/event/UI projections;
- deprecated aliases if any.

## 6. Semantic categories

Recommended top-level categories:

| Category | Description |
|---|---|
| Lifecycle state | Durable state of a resource or workflow |
| Decision state | Outcome of policy or evaluation logic |
| Execution result | Outcome of a command or job attempt |
| Reason category | Why a decision or failure occurred |
| Visibility marker | Whether data is visible, redacted, hidden or unavailable |
| Severity/priority | Operational importance or urgency |
| Scope/type enum | Controlled classification for resource or workflow type |
| Assurance/control enum | Required control type or achieved assurance level |

## 7. Naming conventions

### Rules

- use lowercase snake_case values;
- enum names should be domain-neutral where shared, domain-specific where needed;
- avoid generic `status` when the meaning is actually decision state, lifecycle state or execution result;
- avoid reusing same value with different semantics across dictionaries.

### Examples

- good: `approval_state`, `decision_state`, `execution_state`, `visibility_state`
- bad: `status`, `result`, `flag`

## 8. Shared dictionary governance

### Ownership

- platform architecture/governance should steward shared enums;
- domain teams own domain-specific extensions within agreed boundaries;
- analytics and QA should review changes to widely consumed enums.

### Rule

Any enum used across APIs, events and UI should be registered in this dictionary before broad adoption.

## 9. Control tier enum

### Enum name

`control_tier`

### Values

| Value | Meaning |
|---|---|
| `tier_0` | No special governance beyond normal permission and baseline audit |
| `tier_1` | Elevated permission and audit controls |
| `tier_2` | Step-up or stronger control path may be required |
| `tier_3` | Approval-governed action |
| `tier_4` | Highest-sensitivity or emergency-governed action |

### Rules

- tiers are ordinal in sensitivity/governance intensity;
- tiers are not UI colors or severity labels;
- tier value should be explicit in policy, workflow and analytics contexts.

## 10. Policy decision state enum

### Enum name

`decision_state`

### Values

| Value | Meaning |
|---|---|
| `allow` | Action/query may proceed without extra control beyond current context |
| `step_up_required` | Stronger authentication must occur before next stage |
| `approval_required` | Secondary approval workflow required |
| `manual_review_required` | Human review required before action may continue |
| `blocked` | Action/query prohibited in current state/context |
| `error_safe_fail` | Action/query denied due to ambiguity, dependency issue or unverifiable context |

### Rules

- `error_safe_fail` is not a technical exception class; it is a governance-preserving decision outcome;
- `blocked` means policy disallow, not transport failure.

## 11. UI control state enum

### Enum name

`ui_control_state`

### Values

| Value | Meaning |
|---|---|
| `available` | Action visibly available for initiation |
| `precheck_required` | UI must request authoritative precheck before final affordance |
| `step_up_required` | UI must route to stronger authentication |
| `approval_required` | UI must route to approval creation/continuation |
| `pending_approval` | Approval exists and is awaiting decision |
| `approved_pending_execution` | Approval granted, execution not yet complete |
| `manual_review_required` | UI must route to review workflow |
| `blocked` | UI shows unavailable action due to policy/state |
| `invalidated` | Previously valid/approved path is no longer usable |
| `executing` | Action currently in progress |
| `executed` | Action completed successfully |
| `failed` | Action attempt failed |

### Rule

`ui_control_state` is a presentation-oriented projection and must map back to authoritative backend states.

## 12. Approval state enum

### Enum name

`approval_state`

### Values

| Value | Meaning |
|---|---|
| `created` | Approval object exists but may not yet be fully routed/submitted |
| `submitted` | Approval request is active and awaiting decision |
| `approved` | Approval conditions satisfied |
| `rejected` | Approval denied by eligible approver(s) |
| `expired` | Approval request timed out before completion or use |
| `cancelled` | Approval request intentionally cancelled |
| `invalidated` | Approval no longer valid due to changed context/policy/state |
| `executed` | Approved action has been executed under this approval |

### Rules

- `approved` does not imply execution;
- `executed` is a workflow terminal state linked to underlying command completion;
- `invalidated` differs from `expired`: one is contextual invalidity, the other is time-based lapse.

## 13. Approval decision enum

### Enum name

`approval_decision`

### Values

| Value | Meaning |
|---|---|
| `approve` | Positive decision |
| `reject` | Negative decision |
| `abstain` | Explicit non-approval, non-rejection where workflow supports it |
| `cancel` | Initiator/admin cancellation decision where allowed |

### Rule

This enum models an approver/actor choice, not resulting approval object state.

## 14. Step-up challenge state enum

### Enum name

`step_up_state`

### Values

| Value | Meaning |
|---|---|
| `requested` | Challenge requested but not yet satisfied |
| `satisfied` | Challenge completed successfully within scope |
| `failed` | Challenge attempt failed |
| `expired` | Challenge validity window lapsed |
| `revoked` | Previously satisfied challenge was revoked or invalidated |

### Rule

`step_up_state` belongs to the challenge/proof lifecycle, not directly to the governed action.

## 15. Execution state enum

### Enum name

`execution_state`

### Values

| Value | Meaning |
|---|---|
| `requested` | Execution request accepted for processing |
| `started` | Execution actively running |
| `succeeded` | Execution completed successfully |
| `failed` | Execution completed unsuccessfully |
| `conflict` | Execution blocked by version/state conflict |
| `aborted` | Execution intentionally stopped before completion |

### Rule

`execution_state` applies to command/job execution lifecycle, not policy decisions.

## 16. Job state enum

### Enum name

`job_state`

### Values

| Value | Meaning |
|---|---|
| `queued` | Waiting to start |
| `running` | In progress |
| `waiting_on_approval` | Cannot continue until approval resolves |
| `waiting_on_review` | Cannot continue until manual review resolves |
| `succeeded` | Job completed successfully |
| `failed` | Job ended unsuccessfully |
| `cancelled` | Job intentionally terminated |

## 17. Resource visibility state enum

### Enum name

`visibility_state`

### Values

| Value | Meaning |
|---|---|
| `visible` | Field/resource visible in clear form |
| `redacted` | Field/resource present but masked or summarized |
| `hidden` | Field/resource intentionally not exposed |
| `unavailable` | Data not retrievable in current context |

### Rules

- `redacted` implies existence is known but value is protected;
- `hidden` may hide existence or access path where necessary;
- `unavailable` is operational or contextual, not policy masking by itself.

## 18. Data classification enum

### Enum name

`data_class`

### Values

| Value | Meaning |
|---|---|
| `a` | Lowest internal sensitivity among governed classes |
| `b` | Moderate sensitivity |
| `c` | High sensitivity |
| `d` | Highest sensitivity / strongest handling requirements |

### Rule

This enum must map to the field-level sensitivity and masking matrix; meanings must remain stable even if examples evolve.

## 19. Reason category enum family

There should not be one giant universal reason enum. Instead use scoped reason families.

### Recommended families

- `policy_reason_category`
- `block_reason_category`
- `safe_fail_reason_category`
- `invalidation_reason_category`
- `execution_failure_reason_category`

### Principle

Reason categories explain *why*, but should not replace the higher-level lifecycle or decision state.

## 20. Example policy reason category enum

### Enum name

`policy_reason_category`

### Example values

| Value | Meaning |
|---|---|
| `threshold_exceeded` | Threshold rule increased governance requirement |
| `sensitive_data_access` | Data-class or access-mode rule triggered |
| `privileged_action` | Action family intrinsically privileged |
| `incident_context` | Incident context raised minimum control |
| `velocity_anomaly` | Frequency/behavior-based control trigger |
| `provider_risk_modifier` | Provider/rail-specific rule influenced decision |

## 21. Example block reason category enum

### Enum name

`block_reason_category`

### Example values

| Value | Meaning |
|---|---|
| `active_hold` | Active compliance/risk/operations hold prevents action |
| `role_not_permitted` | Actor lacks required permission |
| `state_transition_forbidden` | Resource state does not allow action |
| `policy_floor_not_met` | Required governance floor unmet |
| `incident_restriction` | Incident mode forbids action |
| `scope_not_allowed` | Requested scope not permitted |

## 22. Example safe-fail reason category enum

### Enum name

`safe_fail_reason_category`

### Example values

| Value | Meaning |
|---|---|
| `missing_dependency` | Required dependency or upstream signal unavailable |
| `ambiguous_context` | Context insufficient to make safe allow decision |
| `stale_reference_data` | Needed normalization/reference data too stale |
| `evaluation_timeout` | Policy evaluation could not finish safely |
| `integrity_check_failed` | Input or linked state failed integrity validation |

## 23. Example invalidation reason category enum

### Enum name

`invalidation_reason_category`

### Example values

| Value | Meaning |
|---|---|
| `entity_changed` | Subject state/version changed |
| `policy_changed` | Active policy version changed materially |
| `permission_changed` | Actor or approver permissions changed |
| `approval_expired_contextually` | Approval still existed but no longer valid in current context |
| `incident_context_changed` | Incident/governance context changed |

## 24. Example execution failure reason category enum

### Enum name

`execution_failure_reason_category`

### Example values

| Value | Meaning |
|---|---|
| `provider_rejection` | Downstream provider rejected command |
| `conflict_detected` | State/version conflict detected |
| `dependency_failure` | Required service unavailable or failed |
| `idempotency_mismatch` | Duplicate key with different semantic request |
| `post_approval_revalidation_failed` | Final revalidation blocked execution |

## 25. Severity enum

### Enum name

`severity_level`

### Values

| Value | Meaning |
|---|---|
| `info` | Informational event or low-urgency state |
| `warning` | Needs attention but not immediately critical |
| `high` | Significant operational or governance concern |
| `critical` | Highest urgency / emergency significance |

### Rule

Severity is not a replacement for tier. A Tier 4 action may generate info-level lifecycle events and critical alerts depending on context.

## 26. Priority enum

### Enum name

`priority_level`

### Values

| Value | Meaning |
|---|---|
| `low` | Can wait with minimal operational consequence |
| `normal` | Standard handling urgency |
| `high` | Elevated handling urgency |
| `urgent` | Immediate attention expected |

## 27. Incident state enum

### Enum name

`incident_state`

### Values

| Value | Meaning |
|---|---|
| `declared` | Incident opened and recognized |
| `active` | Incident currently in active handling |
| `contained` | Immediate spread/risk controlled |
| `recovering` | Recovery actions in progress |
| `resolved` | Incident operationally resolved |
| `closed` | Incident fully closed administratively |

## 28. Break-glass state enum

### Enum name

`break_glass_state`

### Values

| Value | Meaning |
|---|---|
| `requested` | Break-glass requested but not active |
| `active` | Emergency privilege/control path active |
| `expired` | Temporary emergency state expired |
| `revoked` | Emergency state actively terminated |
| `reviewed` | Post-use review completed |

## 29. Configuration lifecycle enum

### Enum name

`config_lifecycle_state`

### Values

| Value | Meaning |
|---|---|
| `draft` | Editable but not yet approved/active |
| `validated` | Passed schema/semantic validation |
| `approved` | Governance approval obtained |
| `active` | Currently authoritative config version |
| `rolled_back` | Deactivated in favor of prior/other config |
| `superseded` | Replaced by newer active config |
| `retired` | No longer used and not activatable |

## 30. Artifact state enum

### Enum name

`artifact_state`

### Values

| Value | Meaning |
|---|---|
| `pending_generation` | Artifact requested but not yet generated |
| `available` | Artifact ready for governed access |
| `expired` | Access or generated artifact expired |
| `archived` | Artifact stored in archive tier |
| `deleted` | Artifact no longer available due to policy-approved deletion |

## 31. Archive retrieval state enum

### Enum name

`archive_retrieval_state`

### Values

| Value | Meaning |
|---|---|
| `requested` | Retrieval requested |
| `queued` | Retrieval accepted and queued |
| `restoring` | Archive material being restored |
| `available` | Restored data/artifact available |
| `expired` | Restored access window expired |
| `failed` | Retrieval failed |
| `cancelled` | Retrieval cancelled |

## 32. Actor type enum

### Enum name

`actor_type`

### Values

| Value | Meaning |
|---|---|
| `user` | Human operator or customer |
| `service` | Backend or automation service identity |
| `scheduled_job` | Time-based automation actor |
| `provider_callback` | External provider-originated system actor |
| `system` | Internal system-generated actor with no direct human initiator |

## 33. Assurance level enum

### Enum name

`assurance_level`

### Values

| Value | Meaning |
|---|---|
| `baseline` | Normal authenticated context |
| `elevated` | Stronger session or recent authentication proof |
| `strong` | Highest supported assurance for governed action path |

### Rule

Assurance level describes session/auth strength, not business authorization.

## 34. Mapping and alias rules

### Principles
n
- provider-specific statuses must map into canonical enums through documented translation layers;
- deprecated aliases should remain readable during migration windows but not emitted as canonical new values;
- analytics and reporting pipelines should normalize historical aliases to canonical values where safe.

### Example

Provider payout statuses such as `processing`, `submitted_to_bank`, `awaiting_partner` may all map to canonical `running` or domain-specific payout state while preserving raw provider status separately.

## 35. Transition guidance

Not every enum is transitional. For those that are, transition rules should be explicit.

### Transitional examples

- `approval_state`
- `step_up_state`
- `execution_state`
- `job_state`
- `config_lifecycle_state`
- `archive_retrieval_state`

### Rule

If invalid transitions are possible, APIs and workflows should return typed conflict/validation outcomes rather than silently coercing values.

## 36. Deprecation policy

When deprecating enum values:

- mark value as deprecated in registry/dictionary;
- document replacement value or migration path;
- preserve consumer compatibility window where needed;
- avoid semantic overloading of remaining values to “absorb” old meaning without review.

## 37. Implementation guidance

### Contracts

- expose canonical enum values in APIs and events;
- keep display text separate from enum values;
- avoid serializing language-specific enum names that may drift by codebase.

### Storage

- persist canonical values where domain-shared semantics matter;
- raw provider status may be stored separately as untrusted/native status.

### UI

- UI may map canonical enums to localized labels, colors and icons;
- UI must not invent additional semantic states without backend contract review.

## 38. QA and validation expectations

Need to verify:

- same concept uses same canonical enum across services;
- different concepts are not collapsed into one overloaded `status` field;
- transition validation rejects illegal state changes;
- deprecated values are not emitted by new producers;
- dashboards and analytics consume canonical enums rather than text parsing;
- redaction/visibility semantics remain distinct in client behavior.

## 39. Anti-patterns to avoid

- one universal `status` enum used everywhere;
- mixing lifecycle and reason values in the same field;
- using UI display text as analytical source of truth;
- silently renaming enum values across services without compatibility plan;
- making provider-native values canonical by accident;
- treating severity, priority and control tier as interchangeable.

## 40. Related documents

Use together with:

- `api-resource-boundaries-and-contract-spec.md`
- `governed-event-taxonomy-and-schema-registry-spec.md`
- `approval-workflow-schema.md`
- `admin-ui-control-state-map.md`
- `policy-evaluation-service-contract.md`
- `machine-readable-threshold-configuration-schema.md`
- `field-level-sensitivity-and-masking-matrix.md`
- `qa-scenario-matrix-by-action-tier.md`