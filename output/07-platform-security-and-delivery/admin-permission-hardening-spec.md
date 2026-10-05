## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Security + Operations
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `field-level-sensitivity-and-masking-matrix.md`
  - `action-to-control-tier-matrix.md`
  - `step-up-authentication-and-dual-control-policy-spec.md`
- Related documents:
  - `approval-workflow-schema.md`
  - `admin-console-ia-and-workspace-spec.md`
  - `theblack-trade-directus-permissions-matrix.md`

# Admin Permission Hardening Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ определяет модель hardening для admin/backoffice permissions в TheBlack.Trade. Он задает role families, privileged action boundaries, field/data visibility constraints, separation-of-duties expectations, approval patterns, elevation rules, audit obligations и требования к сервисному enforcement, чтобы административные и операционные пользователи могли выполнять свои задачи без избыточного доступа и без возможности обходить критические business/security controls.

Документ нужен для platform/backend, Directus/internal tooling, operations, compliance, finance, support, security и QA.

## 2. Цели документа

Permission model должен обеспечивать:

- least-privilege access for admin roles;
- четкое разделение read, review, approve, release, export и configuration capabilities;
- снижение риска insider misuse, accidental overreach и workflow bypass;
- совместимость с masking, audit, retention, payout and compliance controls;
- управляемую модель temporary elevation and break-glass access;
- testable authorization behavior across admin surfaces.

## 3. Scope

Документ покрывает:

- admin role families;
- permission categories;
- field-level and projection-level access expectations;
- action-level hardening for critical workflows;
- separation-of-duties constraints;
- elevation and exception handling;
- audit and review requirements;
- implementation and QA implications.

## 4. Core principles

1. **No admin role should receive broad “edit everything” authority by default.**
2. **Critical lifecycle actions must be permissioned as explicit commands, not generic record updates.**
3. **Visibility is separate from action authority.**
4. **Sensitive-field access and money-movement authority require stricter controls than ordinary queue handling.**
5. **Temporary elevation must be rare, traceable and time-bounded.**
6. **Internal tooling permissions must not bypass service-owned policy enforcement.**

## 5. Admin role families

Recommended primary role families:

- Support Operator
- Operations Operator
- Compliance Analyst
- Compliance Approver
- Finance Operator
- Finance Approver
- Risk Analyst
- Risk Approver
- Incident Responder
- Admin Supervisor
- Platform Administrator
- Security Administrator
- Read-Only Auditor
- Reporting/Analytics User
- Break-Glass Administrator

## 6. Role family intent

| Role family | Primary purpose |
|---|---|
| Support Operator | Customer communication and low-risk case handling |
| Operations Operator | Order flow coordination and routine non-financial operations |
| Compliance Analyst | KYC/document review and hold investigation |
| Compliance Approver | Final compliance decisions and controlled releases |
| Finance Operator | Payment/payout/reconciliation handling without top-tier approvals |
| Finance Approver | High-risk financial approvals and discrepancy resolutions |
| Risk Analyst | Fraud/risk review and rule-driven investigations |
| Risk Approver | Risk overrides and high-risk release decisions |
| Incident Responder | Operational incident triage and mitigation actions |
| Admin Supervisor | Queue oversight, assignment, escalation and limited override governance |
| Platform Administrator | Platform configuration and internal tooling administration |
| Security Administrator | Security controls, access governance, secret/security workflow coordination |
| Read-Only Auditor | Sensitive but read-focused oversight with narrow export rules |
| Reporting/Analytics User | Access to curated reports and low-risk exports |
| Break-Glass Administrator | Emergency-only exceptional access with enhanced controls |

## 7. Permission categories

Recommended permission categories:

- entity read access;
- sensitive-field reveal access;
- operational queue access;
- review/decision actions;
- money-movement actions;
- hold/release actions;
- export/report access;
- configuration/change-management access;
- user/role administration;
- incident/containment actions;
- archive/restore/purge actions.

## 8. Visibility tiers

Recommended visibility tiers:

| Tier | Meaning |
|---|---|
| Tier A | Non-sensitive operational fields |
| Tier B | Sensitive business/customer fields requiring role-specific access |
| Tier C | High-sensitivity evidence, requisites, provider data or compliance details |
| Tier D | Secrets, security-critical configuration and privileged audit materials |

### Principle

A role may be allowed to view entity metadata without being allowed to reveal or export higher-tier fields.

## 9. Projection-based access model

Admin access should be enforced through explicit projection classes rather than raw table/collection exposure.

### Recommended projection classes

- support_list
- support_detail
- ops_list
- ops_detail
- compliance_detail
- finance_detail
- risk_detail
- audit_detail
- reporting_export
- archive_retrieval

### Principle

Projection identity should determine both visible fields and action affordances.

## 10. Read vs action separation

### Rules

- read permission does not imply edit permission;
- edit/update permission does not imply approve/release authority;
- queue assignment permission does not imply final decision permission;
- export permission is distinct from on-screen visibility;
- evidence download permission is distinct from evidence metadata access.

## 11. Critical action families

Critical action families that require explicit permission gates:

- payout release/cancel/return handling;
- payment confirmation override or mismatch resolution;
- compliance approval/rejection and hold release;
- risk override and destination re-approval;
- document reissue and high-sensitivity document access;
- permission/role changes;
- archive restore and purge operations;
- incident suppression/containment controls.

## 12. Support role hardening

### Typical allowed capabilities

- view customer-safe operational context;
- create and manage support notes;
- send approved support communications;
- request escalation;
- view limited order/payment status summaries.

### Typical restrictions

- no payout release;
- no raw KYC evidence reveal by default;
- no compliance approval;
- no provider-secret or raw provider-interaction access;
- no broad export of customer or payment data.

## 13. Operations role hardening

### Typical allowed capabilities

- manage work queues and standard order workflow handling;
- request missing customer actions;
- inspect operational blockers;
- create or resolve low-risk review tasks within scope.

### Typical restrictions

- no direct financial approval requiring finance authority;
- no unrestricted sensitive evidence access;
- no policy/config changes;
- no archive restore or purge actions.

## 14. Compliance role hardening

### Compliance Analyst

- can view compliance-scoped projections and evidence metadata;
- may request remediation, open holds, add findings and recommend outcomes;
- should not automatically have final release authority for all hold types.

### Compliance Approver

- may approve/reject KYC outcomes within policy scope;
- may release compliance-origin holds when conditions met;
- may access higher-sensitivity compliance details than support/ops;
- should still be constrained by audit, step-up and dual-control rules where policy requires.

## 15. Finance role hardening

### Finance Operator

- can inspect payment/payout/reconciliation records and operational finance queues;
- may prepare actions, annotate discrepancies and initiate allowed finance workflows;
- should not alone execute highest-risk payout release or exceptional fund-moving overrides.

### Finance Approver

- may approve high-risk finance resolutions and sensitive release actions within policy;
- should be subject to stronger step-up, anomaly monitoring and dual-control where thresholds apply.

## 16. Risk role hardening

### Risk Analyst

- can review fraud signals, risk cases and suspicious patterns;
- may recommend holds, escalations and destination restrictions;
- should not combine unrestricted risk override power with broad payout execution authority.

### Risk Approver

- may finalize risk override/release decisions within policy;
- should be tightly logged and separated from broad platform administration.

## 17. Admin supervisor role

### Typical purpose

- assignment, escalations, queue balancing, SLA oversight, operational governance.

### Restrictions

- should not automatically inherit all specialist decision powers;
- should use explicit delegated permissions, not “superuser by title” behavior.

## 18. Platform and security administrator roles

### Platform Administrator

- manages internal tooling configuration, integrations, feature flags and platform operations;
- should not automatically access all sensitive customer/compliance evidence unless explicitly required.

### Security Administrator

- manages security-relevant controls, access governance and incident hardening;
- should have strong oversight powers but not routine business-action powers like payout release by default.

## 19. Read-only auditor and reporting roles

### Read-Only Auditor

- may inspect approved audit-grade records and history;
- should have very limited mutation ability, ideally none;
- exports should be narrowly governed and logged.

### Reporting/Analytics User

- should consume curated report/export surfaces rather than raw operational records;
- no automatic access to Tier C or Tier D details.

## 20. Break-glass administrator model

### Purpose

Emergency-only access when normal roles cannot safely recover service or investigate a severe incident.

### Requirements

- explicit activation process;
- short time-bound access window;
- named approver or incident authority;
- enhanced session controls and step-up authentication;
- mandatory audit review after use.

## 21. Separation of duties principles

Recommended SoD rules:

- reviewer and final approver should differ for highest-risk compliance/finance decisions where feasible;
- role admin should be separate from routine payout authority;
- export governance should be separate from broad case handling where high-sensitivity data involved;
- platform configuration authority should not imply unrestricted financial decision authority;
- break-glass use should be reviewed by someone other than the activating actor.

## 22. Incompatible capability combinations

Avoid combining in one ordinary role by default:

- payout release + destination detail edit;
- compliance final approval + unrestricted customer communication editing for the same case without traceable controls;
- permission administration + audit-log tamper capability;
- broad raw evidence download + broad export authority;
- security administration + routine financial approval powers.

## 23. Sensitive field reveal model

### Recommended rules

- masked-by-default display for requisites, identity documents and high-risk provider refs;
- explicit reveal action for Tier C fields;
- reveal reasons captured where policy requires;
- reveal visibility time-bounded in UI where practical;
- reveal events auditable and reviewable.

## 24. Evidence access hardening

### Distinctions

- evidence metadata view;
- evidence preview/view;
- evidence download;
- evidence export/bulk access.

### Principle

These are distinct permissions and should not be collapsed into a single generic “document access” flag.

## 25. Export and reporting hardening

### Controls

- separate permissions for ad hoc export, scheduled export and high-sensitivity export;
- row/field scoping where applicable;
- strong logging of who exported what and why;
- size/volume thresholds and anomaly monitoring;
- approval workflow for exceptional sensitive exports where policy requires.

## 26. Configuration and internal tooling hardening

### High-risk change domains

- permission changes;
- provider configuration;
- feature flags affecting payout/compliance behavior;
- webhook or secret configuration metadata;
- archival/retention job settings.

### Controls

- explicit change permissions;
- change logging and review;
- environment separation;
- no silent production configuration drift.

## 27. Temporary elevation model

### Use cases

- incident mitigation;
- exceptional case resolution;
- temporary absence of approver;
- urgent forensic investigation.

### Requirements

- request/approve/use/revoke lifecycle;
- narrow scoped permission bundle;
- automatic expiry;
- mandatory justification;
- audit and periodic review.

## 28. Step-up authentication model

Step-up authentication should be required for selected actions such as:

- payout release above threshold;
- permission/role change;
- high-sensitivity evidence download;
- archive restore;
- bulk export of sensitive data;
- break-glass activation.

## 29. Audit obligations

### Must audit at minimum

- login/logout and session anomalies;
- permission grants/revocations/role changes;
- sensitive-field reveal actions;
- evidence access and downloads;
- payout/payment approval and release actions;
- hold open/release decisions;
- export generation and archive restore actions;
- break-glass activation and use.

## 30. Service-layer enforcement

### Principle

Permission hardening must be enforced in service-owned APIs and command handlers, not only in the admin UI.

### Implications

- frontend cannot be source of truth for authorization;
- Directus/internal tooling should call governed backend actions for critical transitions;
- generic record edits must not bypass command policy.

## 31. Directus/internal tooling guidance

### Rules

- collection-level roles are not sufficient for critical workflows;
- use curated interfaces and actions rather than broad data-edit capabilities;
- restrict raw access to Tier C/Tier D fields;
- review custom flows/extensions for privilege amplification risk.

## 32. Permission review and recertification

### Recommended controls

- periodic access review for all privileged roles;
- more frequent review for finance/compliance/security/high-sensitivity access;
- immediate review after role changes or incident findings;
- removal of stale temporary elevation grants.

## 33. QA and testing requirements

### Need to validate

- each role sees only approved projections and fields;
- denied actions fail consistently through UI and API;
- sensitive reveal/download actions generate audit records;
- dual-control/step-up flows trigger where required;
- exports are field-scoped correctly;
- Directus/internal actions cannot bypass hardened command paths.

## 34. Suggested role-to-capability matrix structure

Рекомендуется отдельно поддерживать implementation matrix со столбцами:

- role family;
- projection access;
- entity read scopes;
- sensitive reveal rights;
- command/action rights;
- export rights;
- step-up required;
- dual-control required;
- audit severity;
- temporary elevation allowed or not.

## 35. Anti-patterns to avoid

- one catch-all “admin” role with broad production powers;
- equating screen visibility with action authority;
- allowing direct status-field edits instead of explicit commands;
- granting bulk export because user can view one record;
- permanent standing access for emergency-only actions;
- assuming internal users are low risk by default.

## 36. Follow-up implementation artifacts

На базе этого spec рекомендуется создать:

- admin role-to-capability matrix;
- step-up and dual-control policy sheet;
- sensitive field reveal policy;
- export governance policy;
- temporary elevation workflow/runbook;
- permission recertification checklist.

## 37. Related documents

Использовать вместе с:

- `threat-model-and-security-architecture-spec.md`
- `field-level-sensitivity-and-masking-matrix.md`
- `theblack-trade-directus-permissions-matrix.md`
- `api-resource-boundaries-and-contract-spec.md`
- `admin-console-ia-and-workspace-spec.md`
- `fraud-signals-and-risk-rules-spec.md`
- `compliance-and-legal-operations-spec.md`
- `reconciliation-and-ledger-spec.md`