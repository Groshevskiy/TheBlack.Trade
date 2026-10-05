# Operational Dashboard for Threshold-Triggered Actions — TheBlack.Trade

## Document metadata

- Status: active
- Role: Derived reference
- Owner: Operations + Data
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `action-to-control-tier-matrix.md`
  - `analytics-and-reporting-spec.md`
- Related documents:
  - `approval-workflow-schema.md`
  - `operations-runbook-and-sla-spec.md`

## 1. Purpose

This document defines an operational and governance dashboard for threshold-triggered actions in TheBlack.Trade. The dashboard is intended to make threshold-based escalations, approvals, step-up flows, invalidations, safe-fail outcomes and emergency controls observable for operations, finance, compliance, risk, security and platform stakeholders.

The dashboard is not just a reporting surface. It is an operational control surface for monitoring whether sensitive workflows are behaving as expected, whether governance queues are healthy, and whether control mechanisms are creating abnormal friction, unexpected volume or suspicious patterns.

## 2. Goals

The dashboard must:

- expose threshold-triggered activity by action family, tier and domain;
- help teams identify operational bottlenecks in step-up and approval flows;
- surface anomalies, spikes, invalidations, safe-fails and break-glass usage;
- support daily operations, incident response, audit review and policy tuning;
- allow drill-down from high-level KPIs to actionable underlying records;
- preserve data minimization and role-based visibility.

## 3. Non-goals

This document does not define:

- customer-facing analytics;
- raw SIEM implementation details;
- full BI warehouse model for all business metrics;
- incident response playbook procedures, except where dashboard integration is required.

## 4. Users and use cases

| User group | Primary dashboard use |
|---|---|
| Operations leads | Monitor queue friction, threshold-trigger volume, blocked actions |
| Finance leads | Track payout/payment escalations and approval latency |
| Compliance leads | Review hold-release escalations, export activity, archive access |
| Security/platform | Monitor break-glass usage, safe-fail rates, config-change triggers |
| Risk/fraud | Inspect anomaly-driven tier escalation and override patterns |
| Audit/governance | Review historical control activity and control-health trends |

## 5. Core principles

1. The dashboard must distinguish operational volume from risk-significant volume.
2. It must show both control effectiveness and control friction.
3. Sensitive dashboard views must follow the same minimization principles as the underlying actions.
4. Real-time monitoring and historical analysis should coexist without conflation.
5. Drill-down should be role-aware and should not leak restricted underlying data.

## 6. Scope of observed events

The dashboard should aggregate at minimum:

- policy evaluation outcomes;
- threshold-triggered tier escalations;
- step-up requested/satisfied/expired/failed events;
- approval requested/approved/rejected/expired/invalidated/executed events;
- blocked and manual-review-required outcomes;
- break-glass activation and use;
- threshold configuration activation/rollback events;
- execution success/failure for governed actions;
- queue, latency and backlog measurements.

## 7. Canonical event families

| Event family | Examples |
|---|---|
| Policy decision | `allow`, `step_up_required`, `approval_required`, `blocked`, `manual_review_required`, `error_safe_fail` |
| Tier escalation | Tier 2 -> Tier 3, Tier 3 -> Tier 4 |
| Step-up lifecycle | requested, completed, failed, expired |
| Approval lifecycle | created, approved, rejected, expired, invalidated, executed |
| Action execution | started, succeeded, failed, conflict |
| Emergency/governance | break-glass activated, config activated, config rolled back |
| Alert/anomaly | velocity trigger, suspicious pattern, backlog breach |

## 8. Dashboard information architecture

Recommended top-level sections:

1. Executive Overview
2. Action Volume & Tier Escalation
3. Step-Up Funnel
4. Approval Workflow Health
5. Blocked / Manual Review / Safe-Fail
6. Emergency & Governance Events
7. Queue and SLA Monitoring
8. Drill-Down Explorer

## 9. Executive overview

The overview should answer within seconds:

- how many governed actions occurred today;
- how many escalated to Tier 2/3/4;
- how many are waiting on approval or review;
- whether any emergency controls were used;
- whether step-up or approval systems show abnormal failure/latency.

### Recommended KPI cards

- threshold-triggered actions today;
- Tier 3 actions today;
- Tier 4 actions today;
- approval backlog current;
- approval expired today;
- step-up failure rate today;
- safe-fail count today;
- break-glass activations today.

## 10. Action volume and tier escalation section

This section should visualize action volume by action family and resolved tier.

### Recommended cuts

- by action family;
- by business domain;
- by resolved tier;
- by source context: normal, anomaly, incident, break-glass;
- by environment where appropriate.

### Recommended charts/tables

| Widget | Purpose |
|---|---|
| Stacked bar by action family and tier | Show where Tier 2/3/4 actions concentrate |
| Trend line by hour/day | Detect spikes and unusual bursts |
| Tier escalation table | Compare baseline vs escalated volumes |
| Domain heatmap | Show which operational areas generate highest control pressure |

## 11. Step-up funnel

The dashboard should expose friction and success across the step-up flow.

### Funnel stages

1. step-up required;
2. step-up initiated;
3. step-up succeeded;
4. step-up expired before use;
5. step-up reused successfully within scope;
6. step-up failed or abandoned.

### Metrics

- step-up challenge count;
- challenge success rate;
- median time to complete;
- expired proof count;
- failed proof count;
- post-step-up execution conversion rate.

### Key questions

- Is friction too high for legitimate operators?
- Are step-up failures clustered by team, device, browser or action family?
- Are operators authenticating but failing to complete follow-up actions?

## 12. Approval workflow health

This section should be one of the primary operational views.

### Core KPIs

- approval requests created today;
- current pending approval backlog;
- median and P95 approval latency;
- rejection rate;
- expiry rate;
- invalidation rate;
- approved-but-not-executed count;
- execution after approval success rate.

### Recommended breakdowns

- by action family;
- by routing key or queue;
- by resolved tier;
- by approver role family;
- by incident-linked vs ordinary flow.

### Recommended widgets

| Widget | Purpose |
|---|---|
| Pending approvals aging table | Find stale requests and queue bottlenecks |
| Approval latency trend | Detect staffing or workflow issues |
| Approval outcome distribution | Spot abnormal rejection/expiry/invalidation patterns |
| Approved-not-executed list | Identify stranded approvals |

## 13. Blocked, manual review and safe-fail section

This section should distinguish between:

- valid policy block;
- safe-fail due to missing/ambiguous dependency or evaluation issue;
- manual review requirement;
- technical execution failure after valid policy allow/approval.

### Metrics

- blocked actions by reason category;
- manual review required count;
- safe-fail count and rate;
- repeated block attempts by action family;
- technical execution failure rate after approval.

### Rule

Policy health reviews should not treat all “not executed” outcomes as equivalent.

## 14. Emergency and governance events

This section should surface rare but high-severity controls.

### Must include

- break-glass activations and active sessions;
- Tier 4 action count by action family;
- config activation and rollback events;
- incident-linked control escalations;
- high-risk permission/configuration changes;
- post-incident review outstanding count.

### Alert posture

Any dashboard user authorized for this section should see high-visibility warnings when break-glass or Tier 4 activity is active.

## 15. Queue and SLA monitoring

Operational controls create queues; those queues need explicit SLA monitoring.

### Queues to monitor

- pending approvals;
- manual review queue;
- blocked-but-retriable items;
- approved-pending-execution items;
- invalidated approval follow-up queue.

### Recommended SLA metrics

- age buckets;
- oldest item age;
- median handling time;
- P95 handling time;
- breach count against SLA target.

## 16. Drill-down explorer

Users need to move from aggregate signals to governed operational detail.

### Drill-down dimensions

- time range;
- action family;
- tier;
- domain;
- actor role family;
- routing key;
- decision state;
- incident linkage;
- configuration version used.

### Result view should support

- row-level event history;
- linked approval request;
- linked execution result;
- policy config version;
- safe summary of reason category;
- pivot to entity detail where allowed.

## 17. Recommended data model

Suggested fact/event entities for dashboard computation:

| Entity | Description |
|---|---|
| `policy_decision_event` | Outcome of evaluate/execution-time revalidation |
| `threshold_trigger_event` | Rule causing tier escalation |
| `step_up_event` | Step-up lifecycle event |
| `approval_event` | Approval request/decision/lifecycle event |
| `governed_action_execution_event` | Business command execution lifecycle |
| `config_lifecycle_event` | Threshold config activate/rollback/change event |
| `incident_control_event` | Incident-linked governance/control event |

## 18. Minimum event fields

Dashboard ingestion should retain at minimum:

- event timestamp;
- action family;
- business domain;
- resolved tier;
- decision state;
- reason category;
- actor role family;
- approval request ID if any;
- incident ID if any;
- config ID/version;
- environment;
- success/failure outcome;
- latency measure if applicable.

## 19. Role-based dashboard visibility

The dashboard itself requires access tiers.

### Recommended visibility model

| Viewer | Allowed visibility |
|---|---|
| Operations lead | Operational KPIs and queue health, limited sensitive drill-down |
| Finance/compliance lead | Domain-specific governed action details within scope |
| Security/platform | Cross-domain governance and emergency controls |
| Auditor | Historical review with immutable event evidence, redacted where necessary |
| General admin | No access or heavily reduced aggregate-only view |

### Rule

Role access to dashboard drill-down must never exceed access to the underlying governed domain.

## 20. Time windows and freshness

The dashboard should support:

- near-real-time monitoring for active operations;
- daily operational review;
- weekly/monthly trend review for governance tuning;
- incident-specific focused window.

### Recommended freshness labels

- data delayed by X minutes;
- metrics updated at timestamp;
- partial data warning during ingestion lag or outage.

## 21. Recommended filters

Global filters should include:

- time range;
- environment;
- action family;
- domain;
- resolved tier;
- decision state;
- role family;
- routing key;
- incident linked yes/no;
- config version.

### Optional advanced filters

- break-glass yes/no;
- safe-fail reason category;
- archive scope yes/no;
- provider or rail type;
- data class.

## 22. Recommended alerts and thresholds

The dashboard should support operational alerting for abnormal patterns.

### Recommended alerts

| Alert | Example trigger idea |
|---|---|
| Approval backlog spike | Backlog above baseline or SLA breach rate rising |
| Approval expiry spike | Sudden increase in expired approvals |
| Step-up failure spike | Failure rate above baseline for a role/team/action family |
| Safe-fail spike | Evaluation errors or missing dependency rate above threshold |
| Tier 4 event alert | Any Tier 4 activity outside planned window |
| Break-glass active alert | Any active break-glass session |
| Invalidated approval spike | Indicates excessive stale workflows or volatile entity state |
| Blocked action burst | May signal abuse, confusion or workflow breakage |

## 23. Derived health indicators

In addition to raw metrics, the dashboard should compute health indicators.

### Suggested indicators

- control friction index;
- approval queue health score;
- step-up reliability score;
- policy safe-fail rate;
- emergency control activity score;
- stale-approval volatility score.

### Principle

Derived scores should support triage, not replace underlying raw metrics.

## 24. Control friction analysis

This dashboard must help detect when good controls become bad operations.

### Recommended friction views

- approval latency vs action family;
- step-up success rate vs team/action family;
- manual review volume trend;
- approved-but-never-executed rate;
- repeated block attempts by workflow step.

### Interpretation goal

Separate legitimate protective friction from misconfigured or operator-hostile friction.

## 25. Governance review views

For weekly/monthly governance review, the dashboard should support:

- trend of Tier 3/Tier 4 actions over time;
- top action families by escalations;
- top reasons for manual review or invalidation;
- policy config changes and before/after effect;
- break-glass and incident-linked activity history.

## 26. Incident support views

During incident response, dashboard should provide a focused mode.

### Must support

- filter by incident ID;
- show all incident-linked escalations;
- show emergency approvals and break-glass use;
- show blocked/safe-fail growth during incident window;
- show config activation/rollback events linked to incident.

## 27. Export and audit support

The dashboard should allow governed export of summary data for audit/review.

### Rules

- export should be aggregate-first by default;
- row-level export of sensitive governance events may itself require higher-tier control;
- exported data should include config version and filter context used;
- audit views should prefer immutable snapshots or point-in-time reports.

## 28. Data quality and reconciliation checks

Because this dashboard drives governance decisions, data quality is critical.

### Required checks

- event ingestion completeness monitoring;
- duplicate event detection;
- late-arriving event handling;
- reconciliation between policy decision events and approval/execution events;
- explicit missing-data indicators on dashboard widgets.

## 29. Performance and usability expectations

### Performance

- overview should load quickly enough for daily operational use;
- common filters should respond interactively;
- heavy historical queries may use async/report mode.

### Usability

- most urgent exceptions should be visible without deep navigation;
- drill-down paths should be short and role-appropriate;
- no single widget should require expert knowledge to interpret.

## 30. Implementation guidance

### Recommended delivery layers

- event ingestion pipeline from policy, approval, execution and incident systems;
- curated observability mart or analytics model;
- dashboard application or BI layer with role-based access;
- alerting integration for key thresholds and emergency conditions.

### Principle

The dashboard should be derived from canonical events, not scraped UI behavior.

## 31. QA and validation requirements

### Need to validate

- every displayed KPI reconciles with canonical event definitions;
- filters return scoped and role-appropriate data;
- backlog/latency metrics handle expired and invalidated items correctly;
- Tier 4 and break-glass events always appear in emergency section;
- delayed/missing data is clearly labeled;
- aggregate counts and drill-down rows are consistent.

## 32. Anti-patterns to avoid

- mixing policy-denied outcomes with technical failures in one undifferentiated metric;
- showing only raw counts without latency and backlog context;
- exposing sensitive reason details to broad audiences;
- letting dashboard drill-down exceed domain access boundaries;
- measuring control activity without measuring completion or queue health;
- relying on manually curated spreadsheets instead of canonical events.

## 33. Related documents

Use together with:

- `qa-scenario-matrix-by-action-tier.md`
- `admin-ui-control-state-map.md`
- `approval-workflow-schema.md`
- `policy-evaluation-service-contract.md`
- `machine-readable-threshold-configuration-schema.md`
- `threshold-catalog-by-currency-data-class-action-family.md`
- `action-to-control-tier-matrix.md`
- `incident-response-playbook.md`