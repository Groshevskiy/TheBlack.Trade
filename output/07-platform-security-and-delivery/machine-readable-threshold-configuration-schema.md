# Machine-Readable Threshold Configuration Schema — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: Platform + Compliance
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `action-to-control-tier-matrix.md`
  - `threshold-catalog-by-currency-data-class-action-family.md`
- Related documents:
  - `policy-evaluation-service-contract.md`
  - `approval-workflow-schema.md`

## 1. Purpose

This specification defines a machine-readable configuration model for threshold-based control-tier decisions in TheBlack.Trade. It turns the Threshold Catalog by Currency, Data Class & Action Family into a versioned, validated, auditable policy artifact that a backend policy engine can evaluate consistently.

The schema is designed for configuration storage, policy evaluation, admin governance workflows, automated validation, simulation tests and deployment review. It does not replace authorization, role checks, step-up authentication or dual-control enforcement; it supplies threshold and escalation inputs to those controls.

## 2. Goals

The configuration model must:

- represent action-family baseline tiers and threshold escalation rules;
- support currency and rail risk modifiers;
- support data-class, record-volume, velocity and blast-radius escalation;
- support contextual risk floors;
- be versioned, environment-scoped and time-bounded;
- remain auditable and safe to validate before activation;
- avoid hardcoding production policy values into service code.

## 3. Non-goals

This schema does not define:

- user roles or permission grants;
- MFA provider protocols;
- the approval workflow state machine;
- provider reconciliation rules;
- storage format for secrets or cryptographic keys.

## 4. Design principles

1. The policy engine resolves the highest applicable control tier.
2. Values must be explicit about currency, units and effective time.
3. Configuration changes are governed changes and require versioning, approval and audit.
4. Production thresholds are stored outside source code and deployed through controlled configuration workflow.
5. Sensitive anti-fraud internals should not be exposed through broad-read admin APIs.

## 5. Configuration envelope

Every threshold configuration document should use a top-level envelope.

```yaml
schema_version: 1.0.0
config_id: threshold-config-prod-2026-10-03-001
environment: production
status: draft # draft | pending_approval | approved | active | retired | superseded
base_currency: USD
effective_from: 2026-10-10T00:00:00Z
effective_to: null
created_at: 2026-10-03T08:00:00Z
created_by: actor_admin_123
change_reason: "Initial production policy baseline"
change_ticket_id: SEC-THRESH-001
supersedes_config_id: null
approval:
  required: true
  policy_tier: tier_3
  approvals: []
checksum: sha256:REPLACE_WITH_CANONICAL_CONFIG_HASH
rules: {}
```

## 6. Enumerations

### 6.1 Environment

```yaml
environment:
  enum: [development, staging, production]
```

### 6.2 Configuration lifecycle status

```yaml
status:
  enum: [draft, pending_approval, approved, active, retired, superseded]
```

### 6.3 Control tier

```yaml
control_tier:
  enum: [tier_0, tier_1, tier_2, tier_3, tier_4]
```

### 6.4 Data class

```yaml
data_class:
  enum: [class_a, class_b, class_c, class_d]
```

### 6.5 Comparator

```yaml
comparator:
  enum: [gt, gte, lt, lte, eq, neq, in, not_in, exists]
```

### 6.6 Rule effect

```yaml
rule_effect:
  enum: [set_minimum_tier, escalate_by, require_step_up, require_dual_control, block, require_manual_review]
```

## 7. Canonical domain model

A configuration contains independent but composable rule groups:

| Rule group | Purpose |
|---|---|
| `action_families` | Baseline action tier and financial thresholds |
| `currency_rails` | Currency, rail and provider modifiers |
| `data_access` | Data-class and volume-based rules |
| `blast_radius` | Scale/reversibility-based rules |
| `velocity` | Rate/pattern anomaly thresholds |
| `contextual_risk` | Incident, risk, hold, device and session floors |
| `global_safety` | Fail-safe and policy-wide defaults |

## 8. Top-level rules object

```yaml
rules:
  action_families: []
  currency_rails: []
  data_access: []
  blast_radius: []
  velocity: []
  contextual_risk: []
  global_safety: {}
```

## 9. Action-family rule schema

Each action-family rule identifies an action, its baseline tier and optional threshold-driven escalations.

```yaml
- rule_id: payout-release-default
  enabled: true
  action_family: payout_release
  baseline_tier: tier_2
  evaluation_order: 100
  required_controls:
    step_up: true
    dual_control: false
  financial_thresholds:
    - threshold_id: payout-release-tier-3
      normalized_currency: USD
      comparator: gte
      amount: 10000
      resulting_tier: tier_3
      required_controls:
        step_up: true
        dual_control: true
    - threshold_id: payout-release-tier-4
      normalized_currency: USD
      comparator: gte
      amount: 100000
      resulting_tier: tier_4
      required_controls:
        step_up: true
        dual_control: true
        heightened_monitoring: true
  notes: "Illustrative values only; production calibration required."
```

### Required fields

| Field | Required | Description |
|---|---:|---|
| `rule_id` | Yes | Stable unique rule identifier |
| `enabled` | Yes | Whether rule participates in evaluation |
| `action_family` | Yes | Governed action type |
| `baseline_tier` | Yes | Default action control tier |
| `evaluation_order` | Yes | Deterministic ordering for display/debug; highest tier still wins |
| `required_controls` | Yes | Default step-up/dual-control expectations |

### Action-family identifiers

Recommended initial values:

```yaml
action_family:
  enum:
    - payout_release
    - payout_cancel_override
    - payout_destination_change
    - payment_confirmation_override
    - payment_mismatch_resolution
    - reconciliation_resolution
    - kyc_final_approval
    - kyc_final_rejection
    - compliance_hold_release
    - risk_override
    - wallet_verification
    - sensitive_field_reveal
    - evidence_download
    - data_export
    - archive_retrieval
    - archive_restore
    - purge_execution_override
    - permission_grant
    - permission_revoke
    - feature_flag_change
    - webhook_verification_change
    - secret_rotation
    - break_glass_activation
    - break_glass_privileged_action
```

## 10. Financial threshold object

```yaml
financial_threshold:
  threshold_id: string
  normalized_currency: string # ISO-like code or configured reference asset code
  comparator: gte
  amount: decimal
  resulting_tier: tier_3
  required_controls:
    step_up: true
    dual_control: true
    heightened_monitoring: false
  require_fx_evidence: true
  fx_rate_source_policy: approved_market_rate
```

### Validation constraints

- `amount` must be positive;
- `normalized_currency` must equal document `base_currency` unless explicitly approved;
- a higher monetary threshold must not map to a lower tier than a preceding threshold for the same action;
- Tier 3 and Tier 4 financial thresholds must require step-up and dual-control;
- all financial thresholds must require persisted FX evidence when action currency differs from base currency.

## 11. Currency/rail modifier schema

Currency and rail rules change effective floor tier or monetary threshold behavior for a narrow, explicit scope.

```yaml
- rule_id: high-reversibility-risk-rail
  enabled: true
  currency_code: USDT
  rail_type: crypto_network
  provider_id: null
  action_family: payout_release
  risk_multiplier: 0.75
  min_control_tier: tier_3
  fx_rate_policy: conservative_latest_rate
  effective_from: 2026-10-10T00:00:00Z
  effective_to: null
  rationale: "Example only: rail-specific settlement/reversibility adjustment."
```

### Field constraints

| Field | Constraint |
|---|---|
| `risk_multiplier` | Greater than 0 and less than or equal to 1 when it lowers amount thresholds; values greater than 1 require formal approval and rationale |
| `min_control_tier` | Must not weaken action-family baseline tier |
| `currency_code` | Valid configured asset/currency code |
| `rail_type` | Controlled enum |
| `provider_id` | Optional, but must resolve to approved provider registry when present |

### Recommended rail types

```yaml
rail_type:
  enum: [fiat_bank_transfer, card, crypto_network, exchange_transfer, internal_ledger, cash_equivalent, other]
```

## 12. Data-access rule schema

```yaml
- rule_id: class-c-bulk-export
  enabled: true
  action_family: data_export
  data_class: class_c
  scope:
    source: [live, archive]
    domains: [kyc, payments, payouts]
  record_count_thresholds:
    - comparator: gte
      count: 1
      resulting_tier: tier_3
      required_controls:
        step_up: true
        dual_control: true
    - comparator: gte
      count: 5000
      resulting_tier: tier_4
      required_controls:
        step_up: true
        dual_control: true
        heightened_monitoring: true
  output_controls:
    watermark_required: true
    purpose_justification_required: true
    retention_label_required: true
```

### Rules

- `class_d` data must default to blocked except explicitly governed security workflows;
- Class C export must not resolve below Tier 3;
- archive scope must not lower a data-access control tier;
- cross-domain data composition may set a higher minimum tier.

## 13. Data-reveal and download schema

```yaml
- rule_id: class-c-field-reveal
  enabled: true
  action_family: sensitive_field_reveal
  data_class: class_c
  baseline_tier: tier_2
  reveal_scope: single_record
  velocity_rule_ref: sensitive-reveal-velocity
  required_controls:
    step_up: true
    dual_control: false
  audit:
    severity: high
    reason_required: true
```

## 14. Blast-radius rule schema

```yaml
- rule_id: production-config-broad-blast-radius
  enabled: true
  action_family: feature_flag_change
  environment: production
  dimensions:
    affected_customers:
      comparator: gte
      value: 10000
    affected_providers:
      comparator: gte
      value: 2
    reversibility: difficult
  resulting_tier: tier_4
  required_controls:
    step_up: true
    dual_control: true
    heightened_monitoring: true
    incident_link_required: true
```

### Blast-radius dimensions

```yaml
blast_radius_dimension:
  enum:
    - affected_customers
    - affected_orders
    - affected_payments
    - affected_payouts
    - affected_admin_accounts
    - affected_providers
    - affected_services
    - affected_records
    - reversibility
    - environment
```

### Reversibility enum

```yaml
reversibility:
  enum: [easy, moderate, difficult, irreversible]
```

## 15. Velocity rule schema

```yaml
- rule_id: sensitive-reveal-velocity
  enabled: true
  subject_type: actor
  action_family: sensitive_field_reveal
  data_class: class_c
  window:
    duration: PT15M
    rolling: true
  threshold:
    comparator: gte
    count: 20
  resulting_tier: tier_3
  effect: require_dual_control
  audit:
    severity: critical
    alert_required: true
```

### Supported subjects

```yaml
subject_type:
  enum: [actor, role, team, tenant, provider, system]
```

### Duration format

Use ISO 8601 durations, for example `PT15M`, `PT1H`, `P1D`.

## 16. Contextual risk rule schema

```yaml
- rule_id: incident-linked-fund-movement
  enabled: true
  action_families: [payout_release, payout_cancel_override, payment_confirmation_override]
  conditions:
    all:
      - field: incident.active
        comparator: eq
        value: true
  resulting_tier_floor: tier_4
  required_controls:
    step_up: true
    dual_control: true
    heightened_monitoring: true
    incident_link_required: true
  rationale: "High-impact financial actions during active incident require maximum controls."
```

### Recommended contextual fields

```yaml
context_field:
  enum:
    - incident.active
    - incident.severity
    - risk.score
    - risk.flag_present
    - compliance.hold_active
    - provider.status
    - provider.confidence
    - destination.recently_changed
    - session.age_seconds
    - session.unusual_device
    - session.unusual_geo
    - actor.temporary_elevation
    - actor.break_glass_active
    - action.out_of_hours
```

## 17. Global safety configuration

```yaml
global_safety:
  default_on_missing_fx_rate: require_manual_review
  default_on_unknown_currency: block
  default_on_unknown_action_family: block
  default_on_rule_evaluation_error: require_manual_review
  data_class_d_default: block
  archive_scope_minimum_tier: tier_2
  incident_mode_minimum_tier_for_fund_movement: tier_3
  production_sensitive_config_change_minimum_tier: tier_3
  require_audit_for_tier_gte: tier_1
  require_correlation_id_for_tier_gte: tier_2
```

### Safe failure rules

- missing or stale FX evidence must never lower a financial tier;
- unknown action family, unknown currency or rule evaluation failure must fail safely;
- protected data and privileged configuration changes must never silently fall back to Tier 0.

## 18. Approval configuration schema

Threshold policy may specify that an action needs approval; routing is delegated to a dedicated approval system.

```yaml
approval_policy:
  required: true
  min_approver_count: 1
  initiator_may_approve: false
  approver_min_role_family: finance_approver
  expiry: PT30M
  revalidate_on:
    - entity_state_change
    - permission_change
    - incident_mode_change
    - threshold_config_change
```

## 19. Audit configuration schema

```yaml
audit_policy:
  severity: critical # medium | high | critical
  reason_required: true
  include_inputs:
    - resolved_tier
    - matched_rule_ids
    - normalized_value
    - fx_rate_evidence
    - contextual_flags
    - required_controls
    - approval_request_id
  emit_security_alert: true
```

## 20. JSON Schema draft

The following JSON Schema excerpt provides a validation-oriented representation. It is intentionally concise; implementation should extend it while preserving the core constraints in this document.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://theblack.trade/schemas/threshold-configuration/v1",
  "title": "TheBlack.Trade Threshold Configuration",
  "type": "object",
  "required": [
    "schema_version",
    "config_id",
    "environment",
    "status",
    "base_currency",
    "effective_from",
    "created_at",
    "created_by",
    "change_reason",
    "approval",
    "rules"
  ],
  "properties": {
    "schema_version": {"type": "string", "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$"},
    "config_id": {"type": "string", "minLength": 8},
    "environment": {"enum": ["development", "staging", "production"]},
    "status": {"enum": ["draft", "pending_approval", "approved", "active", "retired", "superseded"]},
    "base_currency": {"type": "string", "minLength": 3, "maxLength": 16},
    "effective_from": {"type": "string", "format": "date-time"},
    "effective_to": {"type": ["string", "null"], "format": "date-time"},
    "rules": {
      "type": "object",
      "required": ["action_families", "currency_rails", "data_access", "blast_radius", "velocity", "contextual_risk", "global_safety"],
      "properties": {
        "action_families": {"type": "array"},
        "currency_rails": {"type": "array"},
        "data_access": {"type": "array"},
        "blast_radius": {"type": "array"},
        "velocity": {"type": "array"},
        "contextual_risk": {"type": "array"},
        "global_safety": {"type": "object"}
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

## 21. Example configuration

The example below is illustrative only and must not be copied as production policy without calibration and approval.

```yaml
schema_version: 1.0.0
config_id: threshold-config-staging-example-001
environment: staging
status: draft
base_currency: USD
effective_from: 2026-10-10T00:00:00Z
effective_to: null
created_at: 2026-10-03T08:10:00Z
created_by: actor_security_admin_001
change_reason: "Staging policy simulation baseline"
change_ticket_id: SEC-THRESH-STG-001
supersedes_config_id: null
approval:
  required: true
  policy_tier: tier_3
  approvals: []
checksum: sha256:REPLACE_WITH_CANONICAL_CONFIG_HASH
rules:
  action_families:
    - rule_id: payout-release-default
      enabled: true
      action_family: payout_release
      baseline_tier: tier_2
      evaluation_order: 100
      required_controls:
        step_up: true
        dual_control: false
      financial_thresholds:
        - threshold_id: payout-release-tier-3
          normalized_currency: USD
          comparator: gte
          amount: 10000
          resulting_tier: tier_3
          required_controls:
            step_up: true
            dual_control: true
        - threshold_id: payout-release-tier-4
          normalized_currency: USD
          comparator: gte
          amount: 100000
          resulting_tier: tier_4
          required_controls:
            step_up: true
            dual_control: true
            heightened_monitoring: true
  currency_rails:
    - rule_id: crypto-rail-minimum
      enabled: true
      currency_code: USDT
      rail_type: crypto_network
      provider_id: null
      action_family: payout_release
      risk_multiplier: 0.75
      min_control_tier: tier_3
      fx_rate_policy: conservative_latest_rate
      effective_from: 2026-10-10T00:00:00Z
      effective_to: null
      rationale: "Illustrative staging configuration."
  data_access:
    - rule_id: class-c-bulk-export
      enabled: true
      action_family: data_export
      data_class: class_c
      scope:
        source: [live, archive]
        domains: [kyc, payments, payouts]
      record_count_thresholds:
        - comparator: gte
          count: 1
          resulting_tier: tier_3
          required_controls:
            step_up: true
            dual_control: true
      output_controls:
        watermark_required: true
        purpose_justification_required: true
        retention_label_required: true
  blast_radius: []
  velocity: []
  contextual_risk:
    - rule_id: incident-linked-fund-movement
      enabled: true
      action_families: [payout_release, payment_confirmation_override]
      conditions:
        all:
          - field: incident.active
            comparator: eq
            value: true
      resulting_tier_floor: tier_4
      required_controls:
        step_up: true
        dual_control: true
        heightened_monitoring: true
        incident_link_required: true
  global_safety:
    default_on_missing_fx_rate: require_manual_review
    default_on_unknown_currency: block
    default_on_unknown_action_family: block
    default_on_rule_evaluation_error: require_manual_review
    data_class_d_default: block
    archive_scope_minimum_tier: tier_2
    incident_mode_minimum_tier_for_fund_movement: tier_3
    production_sensitive_config_change_minimum_tier: tier_3
    require_audit_for_tier_gte: tier_1
    require_correlation_id_for_tier_gte: tier_2
```

## 22. Evaluation contract

The policy engine should accept a normalized action context and return a decision object.

### Input shape

```yaml
action_context:
  action_family: payout_release
  actor_id: actor_finance_001
  actor_role_families: [finance_operator]
  environment: production
  target:
    entity_type: payout
    entity_id: pout_123
  financial:
    action_amount: 12500
    action_currency: EUR
    fx_rate: 1.08
    fx_rate_timestamp: 2026-10-03T08:15:00Z
    fx_rate_source: approved_market_rate
  data:
    data_class: class_b
    record_count: 1
    source: live
    domains: [payouts]
  context:
    incident_active: false
    risk_score: 0.31
    compliance_hold_active: false
    destination_recently_changed: false
    unusual_device: false
```

### Output shape

```yaml
control_decision:
  allowed_to_continue: true
  resolved_tier: tier_3
  required_controls:
    step_up: true
    dual_control: true
    heightened_monitoring: false
  matched_rule_ids:
    - payout-release-default
    - payout-release-tier-3
  evaluation_evidence:
    normalized_value: 13500
    normalized_currency: USD
    fx_rate_evidence_id: fxevt_456
  audit:
    severity: critical
    correlation_id_required: true
```

## 23. Validation rules

Configuration validation must include:

- schema validation;
- unique `rule_id` validation across document;
- action family validation against approved registry;
- monotonic tier checks for comparable thresholds;
- timestamp/effective-window validation;
- no production configuration can become `active` without recorded approval;
- no rule may weaken global safety defaults without a documented exception;
- referenced provider IDs, roles and data domains resolve against canonical registries.

## 24. Change management

### Workflow

1. Create draft configuration version.
2. Validate schema and semantic policy constraints.
3. Run policy simulations against representative action contexts.
4. Create change request with owner, rationale, expected impact and rollback plan.
5. Obtain required approval tier.
6. Activate only within declared effective window.
7. Monitor matched-rule and escalation metrics.
8. Retire/supersede old configuration without deleting historical versions.

## 25. Access model

- Read access to non-sensitive policy metadata may be provided to governance/audit roles.
- Write access must be limited to designated security/platform policy administrators.
- Production activation must require dual-control where configuration affects fund movement, authentication, permissions, masking, retention or webhook security.
- Raw anti-fraud thresholds should be redacted or aggregated for broad-read interfaces.

## 26. QA and simulation requirements

### Required test categories

- valid/invalid schema fixtures;
- boundary tests at each threshold;
- currency conversion and missing-FX tests;
- modifier precedence and highest-tier-wins tests;
- archive/data class/volume combinations;
- velocity window boundary tests;
- incident and break-glass context escalation;
- configuration lifecycle and approval gating;
- backward compatibility across schema versions.

## 27. Observability requirements

Track at minimum:

- configuration version used for every Tier 2+ decision;
- matched rule IDs;
- threshold escalation count by action family;
- step-up and approval conversion/failure rates;
- policy evaluation errors and safe-fail outcomes;
- attempted use of retired/superseded configuration.

## 28. Anti-patterns to avoid

- hardcoding thresholds in UI code, API handlers or background jobs;
- allowing config changes without effective timestamps and audit trail;
- storing production secrets in the threshold document;
- exposing exact fraud thresholds in public or low-privilege views;
- silently selecting the first matching rule rather than resolving strongest control;
- treating schema validity as sufficient without semantic and simulation validation.

## 29. Related documents

Use together with:

- `threshold-catalog-by-currency-data-class-action-family.md`
- `action-to-control-tier-matrix.md`
- `step-up-authentication-and-dual-control-policy-spec.md`
- `admin-permission-hardening-spec.md`
- `api-resource-boundaries-and-contract-spec.md`
- `field-level-sensitivity-and-masking-matrix.md`
- `threat-model-and-security-architecture-spec.md`