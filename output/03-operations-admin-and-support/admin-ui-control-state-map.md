# Admin UI Control-State Map — TheBlack.Trade

## Document metadata

- Status: active
- Role: Derived reference
- Owner: Operations + Design
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `admin-console-ia-and-workspace-spec.md`
  - `admin-permission-hardening-spec.md`
  - `action-to-control-tier-matrix.md`
- Related documents:
  - `admin-review-decision-matrix.md`
  - `approval-workflow-schema.md`

## 1. Purpose

This document defines how control and decision states must appear in TheBlack.Trade backoffice UI. It maps policy outcomes such as Tier 0–4 authorization levels, step-up requirements, approval requirements, manual review states, blocked states and invalidations into concrete interface behavior across admin screens, buttons, panels, drawers, timelines and system feedback.

The map is intended for product design, frontend engineering, backend/admin API teams, security, operations, finance, compliance, QA and audit stakeholders.

## 2. Goals

The UI control-state model must:

- make privileged state visible and understandable to authorized operators;
- avoid ambiguous or misleading action affordances;
- reflect backend policy decisions without inventing UI-only authorization rules;
- distinguish precheck, pending approval, approved, blocked and execution outcomes;
- preserve sensitive-information boundaries while still being operationally useful;
- support auditability and post-action review.

## 3. Non-goals

This document does not define:

- the backend authorization model itself;
- visual brand system or full component style guide;
- customer-facing UI behavior;
- internal policy-engine implementation details beyond necessary UI contract.

## 4. Core principles

1. UI must never imply an action is allowed if backend may still block it.
2. Control state must be explicit at the action level, not hidden in generic errors.
3. A more sensitive state should look more constrained, not more convenient.
4. `Approved` is not the same as `Executed`.
5. Hidden data remains hidden unless policy explicitly allows reveal.
6. UI copy must explain required next step without exposing sensitive anti-abuse internals.

## 5. Canonical UI control states

Recommended canonical states:

| UI control state | Meaning |
|---|---|
| `available` | Action may be initiated under current visible context |
| `precheck_required` | UI needs backend precheck before showing final affordance |
| `step_up_required` | Action is visible but requires stronger authentication |
| `approval_required` | Action must create or continue approval workflow |
| `pending_approval` | Action request exists and awaits approver decision |
| `approved_pending_execution` | Approval granted, but final command not yet executed |
| `manual_review_required` | Operator cannot complete action without review workflow |
| `blocked` | Action prohibited or unavailable in current state |
| `invalidated` | Previously available/approved path became unusable |
| `executing` | Protected command in progress |
| `executed` | Protected command completed successfully |
| `failed` | Command attempt failed or safe-failed |

## 6. Source-of-truth model

UI control states are derived from backend decision artifacts, not local heuristics.

### Required sources

- role and visibility payloads;
- policy evaluation service response;
- approval workflow object state;
- execution result or job status;
- entity state/version;
- current session assurance state.

### Rule

Frontend may optimize display, but backend responses remain authoritative for allow/block/step-up/approval decisions.

## 7. Global UI regions affected

The control-state map applies to:

- record header action bar;
- section-level action groups;
- tables and row actions;
- details drawers and modals;
- reveal/download/export controls;
- approval inbox and approval detail views;
- side panels for audit/policy context;
- banners, inline status chips and timeline events.

## 8. Tier-to-UI baseline mapping

| Control tier | Baseline UI posture |
|---|---|
| Tier 0 | Normal enabled action with standard feedback |
| Tier 1 | Enabled action with explicit permission boundary and elevated audit messaging where relevant |
| Tier 2 | Action visible but often mediated by step-up gate before final execution |
| Tier 3 | Action typically routes through approval workflow after precheck/step-up |
| Tier 4 | Strongly constrained action, incident/emergency framing, additional warning and review context |

## 9. Action affordance rules

### Buttons and action menus

- do not fully hide every unavailable action; where operationally useful, show disabled action with safe explanation;
- use explicit labels like “Authenticate to continue” or “Request approval,” not generic “Continue” when a stronger control applies;
- action menus must not imply immediacy for Tier 3/Tier 4 commands;
- destructive/high-risk actions should be visually separated from routine actions.

### Recommended label patterns

| Decision outcome | Recommended label |
|---|---|
| Step-up required | `Authenticate to continue` |
| Approval required | `Request approval` |
| Pending approval | `Approval pending` |
| Approved pending execution | `Execute approved action` |
| Manual review required | `Send to review` |
| Blocked | `Unavailable` |

## 10. Availability vs visibility

The UI should distinguish:

- action not visible because role lacks even awareness;
- action visible but unavailable because state/policy blocks it;
- action visible and available to request precheck/approval;
- action approved but not yet executable due to revalidation requirement.

### Principle

Use visibility suppression only when mere awareness of the action or data would leak unnecessary sensitive information.

## 11. Header action bar mapping

The record header action bar should summarize highest-priority action states.

### Rules

- primary CTA reflects most relevant next secure step;
- if multiple high-risk actions exist, prefer one primary CTA and move others to grouped secondary actions;
- show policy/result badge near high-risk CTA when useful, such as `Step-up required`, `Approval pending`, `Blocked by hold`;
- do not let stale header buttons survive entity state changes without refresh/revalidation.

## 12. Row-level action mapping

In lists and queues:

- row actions may show compact status icons/chips for control state;
- approval-required or blocked rows should remain sortable/filterable;
- bulk-select should exclude ineligible rows or split them by required control path;
- hovering or opening overflow menu should expose concise safe rationale.

### Example row indicators

- key icon for step-up requirement;
- two-person/approval icon for approval required or pending;
- shield/warning icon for blocked or incident-governed state;
- clock icon for expiring approval.

## 13. Detail view control panel

Each entity detail page should have a dedicated control-state area for privileged actions.

### Recommended contents

- current resolved state for each sensitive action;
- current approval request summary if one exists;
- step-up freshness indicator where relevant;
- latest audit event snippet;
- revalidation warnings when state changed since last approval.

### Principle

Operators should not need to search multiple tabs to understand why an action is unavailable.

## 14. Step-up authentication UI behavior

When backend returns `step_up_required`:

- keep user anchored on current record/context;
- open step-up flow in modal/drawer rather than dropping user to ambiguous full-page flow where possible;
- after successful step-up, re-run authoritative precheck/evaluation;
- show time-bounded success state, for example “Authentication confirmed for this action.”

### UI states

| Step-up state | UI behavior |
|---|---|
| Not started | Action CTA invites authentication |
| In progress | Button/loading state and locked background action |
| Satisfied | CTA updates to next step or execution action |
| Expired | Prior satisfied state removed; prompt re-authentication |
| Failed | Error state with retry path, no false success |

## 15. Approval-required UI behavior

When backend returns `approval_required`:

- action should transition into approval creation path rather than direct execution;
- initiator must provide required reason/justification fields;
- UI should show who can approve at a role-family level when safe;
- after submission, action area must switch to `pending_approval` state.

### Minimum approval panel fields

- approval request ID;
- created by;
- created at;
- status;
- reason code;
- expiry time;
- latest approver activity summary;
- safe policy summary.

## 16. Pending approval UI behavior

Pending approvals must be explicit and persistent.

### Rules

- action buttons should not still appear as directly executable;
- initiator sees current status and can cancel only if policy allows;
- approvers see approve/reject actions only if currently eligible;
- related entity timeline should include approval request creation and updates.

### Visual guidance

Use a neutral-but-prominent pending treatment, not success styling.

## 17. Approved pending execution UI behavior

`Approved` means authorization conditions were met at approval time, not that command already ran.

### Rules

- approved state should still display “Awaiting final execution” or equivalent;
- if execution is user-triggered, CTA should reflect revalidation step if needed;
- if execution is automatic job-driven, show job state and final outcome separately;
- stale or changed entity context should visibly warn that approval may be invalidated.

## 18. Manual review required UI behavior

When backend returns `manual_review_required`:

- UI should route to explicit review workflow or queue, not generic error toast;
- action control should explain that automatic completion is unavailable;
- user should see what metadata/reason is required to hand off or escalate;
- review routing must preserve entity/action context.

## 19. Blocked state UI behavior

Blocked states need clarity without exposing abusive-rule detail.

### Rules

- show blocked action with safe explanation where operationally useful, for example “Unavailable while compliance hold is active”;
- do not reveal internal fraud scores, threshold values or detection logic;
- if a follow-up path exists, surface it, for example “View hold details” or “Request supervisor review”;
- blocked state must override stale local assumptions and cached action enablement.

## 20. Invalidated state UI behavior

An approval or previously valid path may become invalidated by state or policy changes.

### Required behavior

- replace prior success/pending affordance with explicit invalidated message;
- indicate broad invalidation reason category such as `Entity changed`, `Approval expired`, `Policy changed`, `Permission changed`;
- provide next safe step: re-authenticate, request fresh approval, refresh record, or contact approver/supervisor;
- include timeline event for invalidation.

## 21. Executing and executed states

### Executing

- show irreversible actions as in-progress with locked controls;
- avoid duplicate submissions through disabled controls and idempotent client behavior;
- reflect asynchronous job states where execution is not immediate.

### Executed

- show final success state only after authoritative backend confirmation;
- link success to resulting entity status change and audit trail/timeline;
- if action had approval, preserve evidence of which request authorized it.

## 22. Failed and safe-fail states

When execution or evaluation fails:

- distinguish command failure from policy denial;
- safe-fail should state that action was not completed;
- allow retry only when policy and idempotency semantics make retry safe;
- provide operator-relevant next step rather than raw backend diagnostics.

### Examples

| Failure class | UI message style |
|---|---|
| Evaluation safe-fail | `Action could not be verified. Review is required before retry.` |
| Expired approval | `Approval expired. Request a new approval to continue.` |
| Step-up expired | `Authentication expired for this action. Authenticate again.` |
| Execution conflict | `Record changed before execution. Refresh and review current status.` |

## 23. Reveal, mask and download controls

Sensitive data controls need especially explicit state handling.

### Rules

- masked values remain masked until reveal permission and policy gate pass;
- reveal action should be local and explicit, not triggered by opening page;
- download/export buttons should display class/scope cues where appropriate;
- if export/download requires approval, UI must not imply file generation already began.

### Recommended patterns

- `Reveal` -> `Authenticate to reveal` -> visible timer/ephemeral reveal -> optional auto-remask;
- `Download evidence` -> `Request approval` for Class C/bulk/archive-sensitive cases;
- persistent log/timeline entries for reveals/downloads when policy requires.

## 24. Bulk action mapping

Bulk actions need per-item control awareness.

### Rules

- bulk toolbar should display eligibility counts, such as `8 ready`, `3 require approval`, `2 blocked`;
- do not silently drop blocked/high-tier rows from action result;
- mixed-control selections should split into separate flow or force narrower subset;
- final confirmation must summarize counts by control path.

## 25. Approval inbox UI

Approval inbox is a first-class operational surface.

### Required columns/filters

- request ID;
- action family;
- entity type/id;
- initiator;
- routing key or queue;
- age;
- expiry;
- resolved tier;
- status;
- incident linkage indicator if applicable.

### Required filters

- status;
- action family;
- domain;
- tier;
- assigned-to-me / eligible-for-me;
- expiring soon;
- incident-linked.

## 26. Approval detail view

Approvers and auditors need a focused approval detail page/drawer.

### Must show

- subject summary;
- justification;
- policy snapshot summary;
- current entity snapshot;
- latest revalidation warnings;
- decision history;
- audit timeline;
- approve/reject controls if eligible.

### Must not show by default

- hidden secrets or unrelated sensitive internals not required for decision;
- raw anti-fraud thresholds or detection logic.

## 27. Timeline and audit presentation

Sensitive control activity should appear in timeline/audit surfaces.

### Recommended event types

- step-up requested;
- step-up satisfied/expired;
- approval requested;
- approval approved/rejected/expired/invalidated;
- execution attempted;
- execution succeeded/failed;
- blocked by policy;
- manual review routed.

### Rule

Timeline language should be operationally clear and immutable in meaning.

## 28. Banners, chips and inline messaging

Use lightweight persistent UI for contextual control state.

### Recommended mappings

| Context | Pattern |
|---|---|
| Active hold blocking action | Warning banner or inline chip near affected action |
| Pending approval | Status chip + detail link |
| Approval expiring soon | Time-sensitive warning chip |
| Break-glass / incident mode | Strong banner in header and action panel |
| Revalidation needed | Inline warning attached to execution CTA |

## 29. Refresh and staleness handling

Because privileged states depend on volatile context, UI must handle staleness explicitly.

### Rules

- entity version change should invalidate stale local action assumptions;
- approval and step-up freshness timers should update live where feasible;
- long-open admin tabs should refresh control-state context before execution;
- if data is stale, UI should prefer refresh/revalidation over optimistic execution.

## 30. Accessibility and usability rules

- disabled controls need accessible explanation via text or tooltip, not color alone;
- status chips/icons require text label or accessible name;
- warning banners must be keyboard/screen-reader reachable;
- modal step-up or approval flows must preserve focus management and return path;
- operator should not lose context after completing high-friction control steps.

## 31. Screen-by-screen mapping

### Customer/Order/Payment/Payout detail pages

- header CTA reflects highest-priority available secure step;
- action panel shows payout, hold, evidence and approval states;
- timeline shows all policy/approval/execution transitions.

### Queue tables

- row state chips/icons for approval/blocked/manual review;
- bulk actions split by eligibility and tier;
- filters for blocked/pending approval/manual review.

### Approval inbox

- optimized for triage, age and expiry awareness;
- direct route into approval detail and current entity context.

### Config/security admin pages

- Tier 3/Tier 4 actions should show strong warning framing;
- draft vs active config states must be visually distinct;
- activation/rollback actions must surface approval and audit expectations.

## 32. API contract expectations for frontend

Frontend should receive explicit machine-readable fields wherever possible, for example:

```json
{
  "action": "payout_release",
  "ui_control_state": "approval_required",
  "resolved_tier": "tier_3",
  "required_controls": {
    "step_up": true,
    "dual_control": true
  },
  "messages": {
    "title": "Approval required",
    "body": "Secondary approval is required before this payout can be released."
  },
  "next_actions": [
    {"type": "request_approval", "label": "Request approval"}
  ],
  "approval_request": null
}
```

### Rule

Avoid forcing frontend to infer state from loosely structured error strings.

## 33. QA requirements

### Need to validate

- buttons/menus reflect backend state transitions correctly;
- stale approved state does not survive invalidation;
- blocked and manual-review paths are distinct and comprehensible;
- approval and execution states are never conflated;
- mixed bulk actions split correctly by control path;
- timeline and audit surfaces render all critical transitions;
- accessibility support exists for disabled and warning states.

## 34. Anti-patterns to avoid

- hiding every restricted action and leaving operator without explanation;
- showing success styling for merely `approved` states;
- enabling action after step-up without rechecking backend policy;
- using generic “Something went wrong” for blocked/manual-review/safe-fail outcomes;
- storing authorization truth only in frontend state;
- leaking fraud thresholds or sensitive internals through helper text.

## 35. Related documents

Use together with:

- `approval-workflow-schema.md`
- `policy-evaluation-service-contract.md`
- `step-up-authentication-and-dual-control-policy-spec.md`
- `action-to-control-tier-matrix.md`
- `admin-permission-hardening-spec.md`
- `field-level-sensitivity-and-masking-matrix.md`
- `admin-console-ia-and-workspace-spec.md`
- `admin-console-ia-and-workspace-spec.md`