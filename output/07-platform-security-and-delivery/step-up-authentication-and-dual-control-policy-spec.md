## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Security + Compliance
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `action-to-control-tier-matrix.md`
  - `approval-workflow-schema.md`
  - `admin-permission-hardening-spec.md`
- Related documents:
  - `policy-evaluation-service-contract.md`
  - `acceptance-test-catalog.md`
  - `contract-test-matrix.md`

# Step-Up Authentication & Dual-Control Policy Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ определяет policy framework для step-up authentication и dual-control enforcement в TheBlack.Trade. Он задает, какие действия требуют повторного подтверждения личности, какие операции не могут выполняться единственным actor без второго контролирующего участия, какие thresholds и contextual triggers усиливают контроль, а также как эти механики должны отражаться в API, admin UI, audit records, exception handling и incident response.

Документ нужен для security, backend/platform, admin tooling, finance, compliance, risk, operations и QA.

## 2. Цели документа

Policy model должен обеспечивать:

- дополнительную защиту для high-risk actions;
- снижение вероятности credential misuse, session hijack и insider abuse;
- контролируемое выполнение fund-moving, access-changing и evidence-revealing операций;
- согласованность между UI, API и audit trail;
- понятные условия для exceptions и emergency workflows;
- testable enforcement logic across privileged surfaces.

## 3. Scope

Документ покрывает:

- step-up authentication scenarios;
- dual-control scenarios;
- threshold and context-based trigger logic;
- session and re-auth rules;
- approval choreography and evidence requirements;
- audit/observability expectations;
- exception and break-glass handling;
- implementation and QA guidance.

## 4. Core principles

1. **Not every privileged action is equal; controls scale with risk.**
2. **Session possession alone is insufficient for the most sensitive actions.**
3. **High-impact actions should require either stronger actor proof, second-party approval, or both.**
4. **Step-up and dual-control must be enforced by backend policy, not only UI prompts.**
5. **Emergency exceptions must be narrower, noisier and more reviewable than standard flows.**
6. **Friction is acceptable for rare high-risk actions, but should be proportional and intentional.**

## 5. Definitions

### Step-up authentication

Additional authentication challenge required after initial session establishment before a sensitive action may proceed.

### Dual-control

Policy requiring a second authorized actor, separate from the initiator where possible, to approve or co-authorize a sensitive action.

### Threshold trigger

Risk level activated when amount, volume, sensitivity or blast radius exceeds configured limits.

### Context trigger

Risk level activated by environment or behavioral context such as anomaly, device change, emergency mode or unusual timing.

## 6. Control objectives by action type

| Action type | Primary control objective |
|---|---|
| Fund movement | Prevent unauthorized or fraudulent release/cancel/override |
| Sensitive evidence access | Prevent unjustified viewing/downloading of regulated data |
| Permission and role change | Prevent privilege escalation or governance bypass |
| Archive restore/purge | Prevent historical sensitive-data misuse or destructive actions |
| High-impact configuration change | Prevent silent production control drift |
| Break-glass activation | Ensure exceptional access is tightly bounded |

## 7. Control building blocks

Recommended building blocks:

- step-up MFA challenge;
- password or strong re-auth challenge where appropriate;
- device/session freshness requirement;
- second approver workflow;
- time-based approval expiry;
- threshold-based policy escalation;
- enhanced audit logging and alerting.

## 8. Step-up authentication triggers

Recommended broad trigger classes:

- sensitive data reveal/download;
- money movement or release actions;
- permission/role changes;
- bulk export of sensitive records;
- archive restore and purge operations;
- break-glass activation;
- high-risk incident containment overrides.

## 9. Contextual step-up triggers

Step-up should also be required or strengthened when contextual risk increases, for example:

- unusual IP/device/browser context;
- stale session age;
- recently changed credentials or MFA factors;
- incident/emergency mode;
- high anomaly score from fraud/security signals;
- operation outside normal hours for role/team policy.

## 10. Step-up methods

Recommended method hierarchy:

- admin MFA confirmation as baseline;
- explicit re-auth confirmation for highly sensitive actions;
- second factor challenge or cryptographic factor confirmation;
- stronger challenge level for break-glass or security-sensitive configuration changes.

### Principle

The exact method may vary by channel and tooling, but assurance level must be policy-driven and testable.

## 11. Session freshness rules

### Recommended rules

- step-up grant should be short-lived and scoped to a narrow set of actions;
- grant should expire after time window, logout, major session change or role change;
- step-up proof should not silently persist across unrelated high-risk actions for long periods;
- new device or suspicious session context should invalidate prior step-up grants.

## 12. Dual-control triggers

Recommended default dual-control action families:

- high-value payout release or override;
- exceptional payment confirmation override;
- hold release when significant risk/compliance conditions exist;
- high-sensitivity bulk export;
- permission/role grant to privileged roles;
- break-glass approval where pre-authorization is possible;
- destructive archive purge beyond routine policy automation.

## 13. Threshold-based escalation model

Controls should become stronger based on thresholds such as:

- payout amount/value;
- number of records impacted;
- sensitivity tier of data exposed/exported;
- number of permissions changed;
- blast radius of configuration change;
- incident severity level.

### Principle

A lower-risk action may require only step-up, while a higher-threshold variant of the same action requires both step-up and dual-control.

## 14. Recommended policy tiers

| Tier | Typical control model |
|---|---|
| Tier 0 | Standard session and role check only |
| Tier 1 | Explicit permission + audit |
| Tier 2 | Permission + step-up authentication |
| Tier 3 | Permission + step-up + second approver |
| Tier 4 | Permission + strong step-up + second approver + heightened monitoring/incident linkage |

## 15. Example action classification

### Tier 2 candidates

- reveal masked Tier C field;
- download single high-sensitivity evidence artifact;
- reissue high-impact document;
- manual notification resend affecting sensitive flow.

### Tier 3 candidates

- payout release above standard threshold;
- compliance hold release for high-risk case;
- privileged role assignment;
- archive restore containing sensitive historical records.

### Tier 4 candidates

- break-glass activation during severe incident;
- emergency payout override outside standard policy;
- security-critical configuration change during active incident.

## 16. Fund movement policy

### Recommended rules

- all payout release actions require explicit action permission;
- payouts above threshold require step-up authentication;
- higher threshold or exception payouts require dual-control;
- destination change plus release should never be approvable as a single low-friction action;
- retried or resumed payout actions should re-check control policy at execution time.

## 17. Compliance and risk policy

### Recommended rules

- sensitive hold release or risk override may require step-up even when performed by authorized approver;
- cases with elevated fraud/compliance severity may require second approver;
- remediation-request actions usually require audit but not necessarily dual-control unless policy threshold hit;
- approval and release should remain distinguishable actions where process separation matters.

## 18. Sensitive data access policy

### Recommended rules

- single-record reveal may require step-up for Tier C fields;
- bulk evidence download/export should require stronger control tier;
- archive retrieval of sensitive historical evidence should be treated as at least equivalent risk to live evidence access;
- support roles should not gain sensitive reveal power through generic export tools.

## 19. Permission and role change policy

### Recommended rules

- assignment of privileged roles requires step-up;
- grant of highest-risk roles or capability bundles requires dual-control;
- self-grant of elevated permissions must be prohibited by default;
- permission changes must emit high-severity audit records and alerting where appropriate.

## 20. Configuration and security change policy

### Recommended rules

- provider/webhook verification config changes require step-up;
- changes affecting payout, retention, masking or auth behavior may require dual-control depending on blast radius;
- emergency security suppressions or allow-list changes during incident should be tightly time-bounded and reviewed afterward.

## 21. Break-glass policy

### Requirements

- break-glass activation requires strong step-up;
- where feasible, activation requires second-party acknowledgment or immediate supervisory review;
- activation should be time-bounded, scope-bounded and highly visible;
- all actions under break-glass mode must be specially tagged in audit trails.

## 22. Approval choreography

Recommended dual-control choreography:

1. initiator requests action;
2. system records pending approval object;
3. initiator justification captured;
4. eligible approver pool determined;
5. second approver reviews context and approves/rejects;
6. final command execution re-checks state and policy;
7. audit and observability artifacts emitted.

## 23. Approver independence rules

### Principles

- approver should not be the initiator;
- approver should have equal or higher authority appropriate to action type;
- dual-control should avoid routing to an actor with direct conflict of interest where feasible;
- approval should expire if underlying entity state changes materially.

## 24. Approval object requirements

Pending approval records should store at minimum:

- action type;
- target entity and identifiers;
- initiating actor;
- required control tier;
- threshold/context factors;
- justification text or structured reason;
- created_at / expires_at;
- approver decision outcome;
- linked audit/correlation identifiers.

## 25. Expiry and revalidation rules

### Requirements

- step-up proof expires after short policy window;
- pending approvals expire after configured TTL;
- entity state change, permission change or incident mode change may force re-approval;
- no approval object should guarantee execution if current policy conditions changed.

## 26. UX and API behavior

### UI expectations

- user should know why stronger control is required;
- pending approval state should be explicit and traceable;
- action should not appear complete before final policy clearance.

### API expectations

- APIs should return structured response indicating step-up or approval requirement;
- command should not be silently downgraded or bypassed;
- correlation IDs should connect initial request, approval object and final execution.

## 27. Recommended API response patterns

### Step-up required

```json
{
  "error": {
    "code": "STEP_UP_REQUIRED",
    "message": "Additional authentication is required for this action.",
    "category": "authorization",
    "retryable": true,
    "details": {
      "required_assurance_level": "tier_2"
    }
  }
}
```

### Dual-control pending

```json
{
  "data": {
    "type": "approval_request",
    "attributes": {
      "state": "pending_approval",
      "approval_id": "apr_123"
    }
  },
  "meta": {
    "control_tier": "tier_3"
  }
}
```

## 28. Audit and monitoring obligations

### Must capture

- action attempted;
- reason step-up/dual-control triggered;
- auth assurance achieved;
- initiator and approver identities;
- timestamps and expiry;
- final outcome;
- bypass/exception usage;
- anomalies such as repeated failed step-up or unusual approval chains.

## 29. Alerting and anomaly detection

Recommended alerts:

- repeated failed step-up attempts;
- unusual cluster of high-tier actions by one actor;
- approval loops or self-approval attempts;
- surge in break-glass activations;
- high-risk approvals outside expected working patterns;
- approval granted but execution later blocked by changed state.

## 30. Exception handling

### Standard exception model

- exceptions should be policy-defined, not ad hoc;
- exception use must be rare and reviewable;
- exception path should never disable audit capture;
- compensating controls required where normal dual-control cannot be achieved immediately.

## 31. Incident-mode behavior

During active incidents:

- some controls may tighten due to elevated threat;
- some approvals may use emergency paths with stronger logging and post-review;
- incident ID should link to emergency step-up/dual-control events;
- emergency mode must not become a blanket bypass for privileged controls.

## 32. Implementation guidance

### Enforcement layers

- service/API policy engine for authoritative decisions;
- admin UI for prompting and workflow visibility;
- approval store/workflow service for dual-control state;
- audit/observability pipeline for tracking and alerting.

### Principle

Final execution authority must remain in governed backend paths.

## 33. QA and test scenarios

### Need to validate

- step-up required actions cannot proceed with stale or absent proof;
- dual-control actions cannot self-approve;
- approval expiry and entity state changes correctly invalidate pending actions;
- thresholds correctly escalate control tiers;
- break-glass actions are specially tagged and reviewed;
- API and UI stay consistent on pending/approved/rejected states.

## 34. Anti-patterns to avoid

- permanently cached step-up proof for unrelated actions;
- one-click payout release after destination edit;
- same actor initiating and approving high-risk action;
- frontend-only step-up prompts without backend enforcement;
- global “emergency mode” that disables all approvals;
- no expiry on pending approvals.

## 35. Follow-up implementation artifacts

На базе этого spec рекомендуется создать:

- action-to-control-tier matrix;
- approval workflow schema;
- step-up assurance-level catalog;
- threshold policy sheet by role and action family;
- emergency exception runbook;
- QA test pack for step-up and dual-control enforcement.

## 36. Related documents

Использовать вместе с:

- `admin-permission-hardening-spec.md`
- `threat-model-and-security-architecture-spec.md`
- `api-resource-boundaries-and-contract-spec.md`
- `fraud-signals-and-risk-rules-spec.md`
- `compliance-and-legal-operations-spec.md`
- `reconciliation-and-ledger-spec.md`
- `incident-response-playbook.md`