## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Compliance + Security
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `fraud-signals-and-risk-rules-spec.md`
  - `threshold-catalog-by-currency-data-class-action-family.md`
- Related documents:
  - `approval-workflow-schema.md`
  - `step-up-authentication-and-dual-control-policy-spec.md`
  - `admin-permission-hardening-spec.md`

# Action-to-Control Tier Matrix — TheBlack.Trade

## 1. Назначение документа

Этот документ переводит policy-level требования из permission hardening и step-up/dual-control specs в прикладную control matrix для конкретных действий TheBlack.Trade. Матрица определяет для каждого action family required permission, control tier, step-up requirement, dual-control requirement, threshold/context escalation, audit severity, exception path и основные UI/API enforcement expectations.

Документ предназначен для backend/platform, admin tooling, security, finance, compliance, operations, QA и audit stakeholders.

## 2. Цели документа

Матрица должна обеспечивать:

- единое implementation reference для sensitive actions;
- одинаковое поведение между admin UI, APIs и internal tooling;
- прозрачное различие между low-risk, medium-risk и high-risk actions;
- снижение риска policy drift между ролями и интерфейсами;
- тестируемую основу для authorization, step-up и approval workflows.

## 3. Control tier legend

| Tier | Meaning | Typical controls |
|---|---|---|
| Tier 0 | Standard authorized action | Role check + normal audit |
| Tier 1 | Sensitive but routine privileged action | Explicit permission + elevated audit |
| Tier 2 | High-sensitivity single-actor action | Explicit permission + step-up |
| Tier 3 | High-risk action | Explicit permission + step-up + dual-control |
| Tier 4 | Exceptional/critical action | Strong step-up + dual-control + heightened monitoring/incident linkage |

## 4. Field definitions

| Column | Meaning |
|---|---|
| Action family | Business/operational action being controlled |
| Example actions | Typical concrete commands or UI actions |
| Primary roles | Roles that may normally initiate the action |
| Base tier | Default control tier |
| Step-up | Whether additional authentication is required |
| Dual-control | Whether second-party approval is required |
| Threshold/context escalation | Conditions that raise control level |
| Audit severity | Expected audit sensitivity |
| Exception path | Allowed emergency/exception handling model |
| UI/API enforcement notes | Critical enforcement expectations |

## 5. Core matrix

| Action family | Example actions | Primary roles | Base tier | Step-up | Dual-control | Threshold/context escalation | Audit severity | Exception path | UI/API enforcement notes |
|---|---|---|---|---|---|---|---|---|---|
| Support note management | Add internal note, update support note, tag customer context | Support Operator, Operations Operator | Tier 0 | No | No | Escalate to Tier 1 if note changes regulated case routing or references incident/legal hold | Medium | Standard supervised override only | UI note editing allowed only within scope; API should enforce ownership and note-type policy |
| Support communication send | Send approved support communication, request customer remediation | Support Operator, Operations Operator | Tier 1 | No | No | Escalate to Tier 2 if communication exposes sensitive case outcome or triggers regulated disclosure | High | Supervisor-reviewed exception | Template and channel policy enforced server-side; no freeform bypass for restricted scenarios |
| Customer profile low-risk edit | Correct non-sensitive metadata, contact-preference update | Support Operator, Operations Operator | Tier 1 | No | No | Escalate to Tier 2 if identity-relevant fields or verified channels are changed | High | Exception with supervisor review | API must distinguish low-risk profile patch from identity-affecting changes |
| Identity/contact critical change | Change verified email/phone, identity anchor fields, account recovery details | Operations Operator, Compliance Analyst | Tier 2 | Yes | No | Escalate to Tier 3 if anomaly signals or incident mode active | High | Emergency supervised path only | Must require fresh assurance; should not be bundled with unrelated profile edits |
| Reveal masked sensitive field | Reveal requisites, partial identity docs, sensitive provider refs | Compliance Analyst, Finance Operator, Risk Analyst | Tier 2 | Yes | No | Escalate to Tier 3 for repeated reveals, broad reveal session, or incident context | High | Temporary approved exception | UI reveal should be explicit and time-bounded; API logs reason and scope |
| Download single evidence artifact | Download one KYC or payment evidence file | Compliance Analyst, Compliance Approver, Finance Operator | Tier 2 | Yes | No | Escalate to Tier 3 if artifact is top-tier sensitivity or archive-sourced | High | Case-linked exception | Metadata access and binary download must be separate permissions |
| Bulk evidence export/download | Export or batch-download multiple evidence files | Compliance Approver, Security Administrator | Tier 3 | Yes | Yes | Escalate to Tier 4 for archive-scope or unusually large volume | Critical | Emergency path with post-review | API should produce approval object; no synchronous direct export completion |
| Order workflow low-risk action | Mark customer reminded, update queue assignment, request missing action | Operations Operator | Tier 1 | No | No | Escalate to Tier 2 if state change affects money-movement readiness | High | Supervisor override | Server enforces allowed transitions by action command rather than generic status edit |
| Manual order rejection | Reject order for policy or operational reason | Operations Operator, Compliance Analyst | Tier 2 | Yes | No | Escalate to Tier 3 if rejection occurs after financial confirmation or high-value threshold | High | Supervisor-reviewed exception | Must capture reason code and current-state revalidation |
| Payment evidence acceptance override | Confirm payment despite mismatch/exception | Finance Operator, Finance Approver | Tier 3 | Yes | Yes | Escalate to Tier 4 if mismatch severity is high or fraud signals active | Critical | Emergency finance exception | API must verify mismatch context and block self-approval patterns |
| Payment mismatch resolution | Resolve mismatch case, mark discrepancy reconciled | Finance Operator, Finance Approver | Tier 2 | Yes | No | Escalate to Tier 3 when money impact exceeds threshold or linked risk hold exists | High | Supervisor/finance-approver path | Resolution must link to reconciliation case or structured reason |
| Payout release standard | Release payout within normal threshold and verified destination | Finance Operator, Finance Approver | Tier 2 | Yes | No | Escalate to Tier 3 above standard value or if anomaly signals present | Critical | Limited emergency path | Must re-check holds, destination state and session freshness at execution time |
| Payout release elevated | Release payout above threshold or after manual exception review | Finance Approver | Tier 3 | Yes | Yes | Escalate to Tier 4 during incident mode or extreme value tier | Critical | Emergency incident-linked path only | UI must show pending approval state; API returns approval_request object |
| Payout destination change | Change wallet/requisite on payout-linked flow | Compliance Analyst, Finance Operator, Risk Analyst | Tier 3 | Yes | Yes | Escalate to Tier 4 if payout already pending release or risk flags active | Critical | Rare exception with post-incident review | Destination change and payout release must remain separate actions |
| Payout cancel/return override | Cancel payout late-stage, mark returned with manual override | Finance Approver | Tier 3 | Yes | Yes | Escalate to Tier 4 if provider state uncertain or incident active | Critical | Emergency finance/security coordination | Requires strong audit linkage to provider interaction and reconciliation impact |
| Wallet/requisite verification | Approve or reject destination/source details | Compliance Analyst, Risk Analyst | Tier 2 | Yes | No | Escalate to Tier 3 for high-risk jurisdictions, fraud flags or linked pending payout | High | Supervisor-reviewed exception | Approval must not implicitly release payout |
| KYC remediation request | Request new documents/corrections | Compliance Analyst | Tier 1 | No | No | Escalate to Tier 2 if request reopens previously approved case in anomaly context | High | Standard reviewed exception | Structured remediation code required |
| KYC final approval | Approve KYC application | Compliance Approver | Tier 2 | Yes | No | Escalate to Tier 3 for high-risk case or policy-triggered enhanced due diligence | Critical | Emergency compliance path | Current evidence set and hold state revalidated at execution |
| KYC final rejection | Reject KYC application | Compliance Approver | Tier 2 | Yes | No | Escalate to Tier 3 if case previously approved or legally sensitive | Critical | Supervisor/legal-reviewed exception | Reason codes and appeal/remediation posture captured |
| Compliance hold open | Open hold on customer/order/payment/payout | Compliance Analyst, Risk Analyst | Tier 1 | No | No | Escalate to Tier 2 if hold freezes active payout or incident-linked activity | High | Standard reviewed exception | Hold type and scope required; should be explicit command |
| Compliance hold release standard | Release ordinary compliance hold | Compliance Approver | Tier 2 | Yes | No | Escalate to Tier 3 for high-risk or finance-linked hold | Critical | Emergency supervised path | Must confirm all release conditions satisfied |
| Compliance hold release elevated | Release high-risk hold affecting fund movement or severe case | Compliance Approver, Risk Approver | Tier 3 | Yes | Yes | Escalate to Tier 4 if incident/security case linked | Critical | Emergency multi-party path | Approval object required; initiator and approver separation enforced |
| Risk override | Override fraud/risk restriction, clear risky destination or actor | Risk Approver | Tier 3 | Yes | Yes | Escalate to Tier 4 for extreme risk scores or recent attempted abuse | Critical | Security-linked emergency path | Must reference signals/case context and preserve justification |
| Review-task assignment | Assign review task, rebalance queue | Admin Supervisor, Operations Operator | Tier 1 | No | No | Escalate to Tier 2 if assignment routes case to privileged lane or conflict-sensitive actor | Medium | Supervisor override | Queue/ownership rules enforced centrally |
| Review-task resolution | Resolve task with standard outcome | Operations Operator, Compliance Analyst, Finance Operator | Tier 1 | No | No | Escalate to Tier 2 if resolution closes high-risk blocker or triggers downstream release | High | Supervisor-reviewed exception | Resolution outcome codes mandatory |
| Incident creation/update | Open incident, update severity or status | Incident Responder, Admin Supervisor | Tier 1 | No | No | Escalate to Tier 2 when incident scope impacts security controls or customer communications broadly | High | Incident commander path | Incident state transitions via explicit commands |
| Incident mitigation action | Pause queue, suppress notifications, enable containment mode | Incident Responder, Security Administrator | Tier 2 | Yes | No | Escalate to Tier 3 for broad production impact or customer-facing degradation | Critical | Incident emergency path | Must link to incident ID and auto-expiry/review where possible |
| Security containment override | Emergency block/allow-list changes, forced session invalidation wave | Security Administrator | Tier 3 | Yes | Yes | Escalate to Tier 4 during active major incident or cross-system compromise | Critical | Break-glass security path | All actions specially tagged and monitored |
| Document reissue | Reissue receipt/document with business effect | Operations Operator, Finance Operator | Tier 2 | Yes | No | Escalate to Tier 3 if superseding official/regulated document | High | Supervisor/approver path | Reissue reason and prior version linkage required |
| Notification retry/suppress | Retry failed notification or suppress future send | Operations Operator, Incident Responder | Tier 1 | No | No | Escalate to Tier 2 if suppression impacts compliance/legal notice or incident-wide messaging | High | Incident/supervisor path | Suppression reason must be structured |
| Export operational report | Export low-sensitivity operational report | Reporting User, Admin Supervisor | Tier 1 | No | No | Escalate to Tier 2 if dataset contains Tier B fields or large row scope | High | Supervisor-reviewed exception | Export endpoint should be curated, not raw-table dump |
| Export sensitive dataset | Export Tier C data, finance reconciliation detail, compliance evidence metadata | Finance Approver, Compliance Approver, Read-Only Auditor | Tier 3 | Yes | Yes | Escalate to Tier 4 for bulk archive scope or cross-domain dataset | Critical | Exceptional approved path | Separate permission from screen visibility; output watermarking/logging recommended |
| Archive retrieval standard | Retrieve archived record/detail in scoped case | Compliance Approver, Finance Approver, Read-Only Auditor | Tier 2 | Yes | No | Escalate to Tier 3 if archived content includes Tier C evidence or wide-scope customer history | High | Case-linked exception | Current authorization rechecked; retrieval purpose logged |
| Archive restore elevated | Restore archived sensitive records or operational object for reuse | Platform Administrator, Compliance Approver | Tier 3 | Yes | Yes | Escalate to Tier 4 if broad restore or production incident context | Critical | Break-glass or incident-approved path | Restore should create tracked approval object and post-review requirement |
| Purge execution override | Manual purge outside ordinary automation or with exception conditions | Security Administrator, Platform Administrator | Tier 4 | Yes | Yes | N/A — already highest tier | Critical | Break-glass only | Must be incident/governance linked and separately reviewed |
| Permission grant low-risk | Grant ordinary non-privileged role or queue scope | Platform Administrator, Security Administrator | Tier 2 | Yes | No | Escalate to Tier 3 if cross-domain visibility materially expands | Critical | Supervisor-reviewed path | Self-grant prohibited; audit high severity |
| Permission grant privileged | Grant finance approver, compliance approver, security admin, break-glass eligibility | Security Administrator | Tier 3 | Yes | Yes | Escalate to Tier 4 if grant occurs during incident or to emergency role | Critical | Break-glass governance path | Self-grant forbidden; separation-of-duties required |
| Permission revoke/suspend | Remove privileged access, suspend compromised admin session | Security Administrator | Tier 2 | Yes | No | Escalate to Tier 3 if action affects many users or incident-critical responders | Critical | Emergency security path | Bulk revocations may require staged execution safeguards |
| Feature-flag high-impact change | Toggle feature affecting payouts, auth, masking, webhook behavior | Platform Administrator | Tier 3 | Yes | Yes | Escalate to Tier 4 during active incident or if blast radius is platform-wide | Critical | Emergency change path | Change must reference config scope, environment and rollback note |
| Webhook verification config change | Rotate verifier config, adjust tolerance windows, disable provider callback family | Platform Administrator, Security Administrator | Tier 3 | Yes | Yes | Escalate to Tier 4 if production callback family for fund movement affected during outage | Critical | Incident-linked emergency path | Two-person review preferred; changes heavily monitored |
| Secret rotation action | Rotate provider secret or verification key in production | Security Administrator | Tier 3 | Yes | Yes | Escalate to Tier 4 if emergency compromise response | Critical | Incident emergency path | Overlap window, rollout state and verification monitoring required |
| Break-glass activation | Activate emergency privileged access | Break-Glass Administrator, Security Administrator | Tier 4 | Yes | Yes | N/A — always highest tier | Critical | Formal emergency path only | Time-boxed access, special audit tags and mandatory review |
| Break-glass privileged action | Use emergency access to perform blocked recovery action | Break-Glass Administrator | Tier 4 | Yes | Yes | N/A — always highest tier | Critical | Formal emergency path only | Each action still separately audited; activation alone is not blanket approval |

## 6. General implementation rules

### Tier 0

- normal role authorization;
- standard audit trail;
- no extra challenge unless contextual anomaly raises control level.

### Tier 1

- explicit action permission;
- elevated audit detail;
- structured reason codes where action materially affects workflow.

### Tier 2

- explicit action permission;
- valid fresh step-up proof;
- action-scoped or short-lived proof reuse only.

### Tier 3

- explicit action permission;
- valid fresh step-up proof;
- second approver required;
- backend-issued pending approval object before execution.

### Tier 4

- strongest available step-up;
- second approver or emergency authority path;
- heightened alerting/monitoring;
- mandatory post-action review.

## 7. Cross-cutting escalation rules

Escalate one tier upward when one or more of the following apply unless already at Tier 4:

- entity linked to active incident;
- high anomaly/fraud/security score;
- archive-sourced sensitive data involved;
- unusually large volume or blast radius;
- action performed outside expected context/window;
- actor operating under temporary elevation or near permission boundary.

## 8. API/UI enforcement expectations

### API

- backend is source of truth for tier resolution;
- API returns `STEP_UP_REQUIRED` or approval-request pattern where applicable;
- tier decision should consider current entity state and context at execution time.

### UI

- UI must communicate why stronger control is required;
- actions pending approval must not appear complete;
- elevated actions should surface structured justification requirements.

## 9. QA expectations

### Need to validate

- every matrix action maps to explicit permission and control tier;
- tier escalation occurs on thresholds/context triggers;
- stale step-up proof fails correctly;
- self-approval is blocked for Tier 3/Tier 4 actions;
- exports/downloads/reveals generate proper audit severity;
- internal tooling cannot bypass matrix-driven policy enforcement.

## 10. Recommended follow-up artifacts

На базе этой матрицы рекомендуется создать:

- machine-readable action policy registry;
- threshold catalog by currency/data class/action family;
- approval-routing rules by role family;
- admin UI control-state map;
- QA scenario matrix by action tier.

## 11. Related documents

Использовать вместе с:

- `step-up-authentication-and-dual-control-policy-spec.md`
- `admin-permission-hardening-spec.md`
- `threat-model-and-security-architecture-spec.md`
- `api-resource-boundaries-and-contract-spec.md`
- `field-level-sensitivity-and-masking-matrix.md`
- `reconciliation-and-ledger-spec.md`
- `incident-response-playbook.md`