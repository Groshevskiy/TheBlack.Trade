## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Compliance + Security + Platform
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `field-dictionary-and-sensitive-data-classification-matrix.md`
  - `business-continuity-and-dr-spec.md`
- Related documents:
  - `observability-and-audit-spec.md`
  - `compliance-and-legal-operations-spec.md`
  - `migration-validation-pack.md`

# Data Retention & Archival Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает policy layer для хранения, архивирования, legal hold и удаления данных в TheBlack.Trade. Он определяет, какие data domains существуют в платформе, как различаются active, archived и purged states, какие retention expectations должны применяться к operational, financial, compliance, support и audit данным, и как обеспечить управляемость жизненного цикла данных без потери traceability и regulatory readiness.

Документ предназначен для product, backend, data, DevOps, compliance, finance, support, security и management.

## 2. Цели документа

Retention/archival framework должен обеспечивать:

- сохранение данных, необходимых для operations, finance, compliance и audit;
- контролируемое уменьшение объема active operational data;
- поддержку investigations, incident review и reconciliation;
- предсказуемые archive/purge processes;
- role-aware access to archived and sensitive records;
- readiness for legal hold and policy exceptions.

## 3. Scope

Документ покрывает:

- data domain classification;
- record lifecycle states;
- retention categories;
- archival rules;
- purge and deletion principles;
- legal hold behavior;
- access and restore expectations;
- governance and audit expectations.

## 4. Core principles

1. **Retention policy must follow business, audit and compliance needs, not convenience alone.**
2. **Operational systems should not stay cluttered with unnecessary active data forever.**
3. **Archival must preserve traceability between linked business records.**
4. **Deletion must be controlled, intentional and auditable.**
5. **Legal hold overrides routine archival and purge flows.**
6. **Archived data remains governed data, not forgotten storage.**

## 5. Data lifecycle states

Каждая значимая запись должна поддерживать жизненный цикл в одном из следующих logical states:

- active;
- inactive but operationally visible;
- archived;
- archived under legal hold;
- scheduled for purge;
- purged or irreversibly deleted where policy allows.

### Notes

- не все типы записей обязаны проходить через все стадии;
- purge eligibility должна определяться policy rules, а не ad hoc decision;
- business-critical references должны сохранять linkage integrity даже после archival.

## 6. Retention categories

Рекомендуется разделить данные минимум на следующие категории:

| Category | Typical content |
|---|---|
| Core transaction records | Orders, payments, payouts, status history |
| Financial integrity records | Reconciliation cases, ledger links, settlement traces |
| Compliance records | KYC files, decisions, holds, restrictions, review notes |
| Support and communication records | Tickets, internal notes, notification history, document delivery history |
| Audit and security records | Audit trail, permission-sensitive actions, incident logs |
| Configuration and reference records | Rules, templates, role mappings, integration configs |
| Derived analytics records | Aggregates, metrics snapshots, reporting extracts |

## 7. Retention policy model

Для каждого data domain policy должна фиксировать:

- record type;
- owner;
- retention rationale;
- active retention period;
- archival trigger;
- archive storage expectations;
- purge eligibility rule;
- legal hold applicability;
- restoration expectations;
- access restrictions.

## 8. Domain inventory requiring policy coverage

Retention rules должны быть определены минимум для:

- customers and profile data;
- KYC submissions and decision artifacts;
- orders and lifecycle history;
- payments and evidence;
- payouts and execution history;
- wallets/requisites and verification history;
- documents and delivery traces;
- notifications and template/version traces;
- reconciliation cases;
- support notes and escalation notes;
- incidents and postmortem materials;
- audit events and permission-sensitive actions;
- analytics/reporting extracts where persistent.

## 9. Active vs archived operational data

### Active data should optimize for

- current operations;
- customer support lookup;
- in-flight review workflows;
- reconciliation and issue handling;
- recent reporting.

### Archived data should optimize for

- traceability;
- investigation support;
- audit retrieval;
- low-frequency but reliable access;
- reduced load on primary operational surfaces.

## 10. Core transaction record expectations

Orders, payments and payouts — это foundational business records.

### Policy expectations

- they must retain linkage to each other and to customer context;
- status history should remain reconstructable;
- financial and dispute-relevant evidence should not be purged casually;
- archival should preserve public/internal identifiers and key timeline milestones.

## 11. Compliance and KYC data expectations

Compliance-related data требует наиболее осторожного lifecycle management.

### Policy expectations

- KYC evidence and decisions must remain retrievable for authorized reviewers;
- remediation history should stay linked to final decision state;
- restriction/hold history should remain traceable even after operational closure;
- purge or minimization rules must be explicit and exception-aware.

## 12. Payment, payout and requisite evidence

Evidence-bearing records требуют политики не только по retention period, но и по storage tier.

### Policy expectations

- raw evidence and its metadata should remain linked;
- repeated re-verification history should remain traceable;
- archived evidence should remain integrity-protected;
- payout/payment investigation context should not be separated from underlying artifacts.

## 13. Notification and document retention

### Policy expectations

- notification history should preserve event, channel, template/version and delivery outcome;
- document history should preserve generation trigger, entity linkage, delivery status and reissue lineage;
- operationally stale communication records may move to archive earlier than core transaction records;
- customer-visible history and internal delivery diagnostics may have different access scopes.

## 14. Support notes and collaboration records

Internal notes often contain investigation context, handoffs and sensitive operational reasoning.

### Policy expectations

- notes should remain attributable to author and timestamp;
- sensitive notes may require narrower archive access than general support history;
- deletion of notes should be highly restricted or disallowed except under explicit policy;
- archived notes must remain linked to the business entity/case they explain.

## 15. Audit trail retention

Audit trail — один из самых критичных retention domains.

### Policy expectations

- permission-sensitive actions should remain historically reconstructable;
- archive must preserve actor, action, timestamp and affected object context;
- audit records should be tamper-evident or operationally protected from silent modification;
- purge of core audit history should be exceptionally controlled.

## 16. Incident and postmortem materials

### Policy expectations

- incident records should preserve severity, owner, timeline and mitigation actions;
- degraded-mode decisions and communication actions should remain reviewable;
- postmortem findings should remain accessible to authorized leads;
- archive should maintain linkage between incident and affected business domains/providers where applicable.

## 17. Analytics and reporting data

Analytics outputs often differ from source records and may be re-computable.

### Policy expectations

- derived aggregates may have a different retention window than authoritative transactional data;
- persistent reporting extracts should have owner and expiry rules;
- dashboards should preferably rebuild from governed sources where practical;
- archived analytics snapshots used for management reporting should remain version-aware.

## 18. Archival triggers

Archival should be rule-based rather than ad hoc.

### Example triggers

- order/payment/payout closed and beyond active operations window;
- KYC case finalized and outside frequent access period;
- support case resolved and outside active support horizon;
- incident closed and postmortem completed;
- notification/document logs aged beyond operational troubleshooting window.

## 19. Archive storage design principles

Archive storage should support:

- durable retention;
- integrity preservation;
- controlled retrieval;
- access logging;
- lifecycle automation;
- separation from hot operational storage where appropriate.

### Additional expectations

- archived objects should retain stable identifiers;
- related entities should remain cross-referenceable;
- archived access should be slower than active access if needed, but predictable.

## 20. Restore and retrieval expectations

Archived data is useful only if it can be found and understood.

### Requirements

- authorized users should be able to locate archived records by business identifiers;
- retrieval workflow should preserve context, not only raw blobs;
- restore should not create duplicate active business records;
- retrieval events themselves may need audit logging.

## 21. Purge and deletion principles

Deletion must be governed more strictly than archival.

### Rules

- purge should happen only after retention conditions are met;
- purge must respect legal hold and unresolved investigation constraints;
- destructive deletion should be logged;
- deletion of linked data should consider dependency graph and traceability impact;
- some records may be eligible only for minimization/anonymization, not full removal.

## 22. Legal hold behavior

Legal hold must suspend normal archival and purge automation where required.

### Policy expectations

- records under hold should be explicitly marked;
- hold scope should support entity-, customer-, incident- or case-level application;
- access to hold metadata should be controlled;
- hold release should itself be auditable.

## 23. Retention exceptions and overrides

Не все случаи укладываются в standard retention flow.

### Examples

- unresolved discrepancy or audit review;
- active complaint, dispute or chargeback-like investigation;
- compliance escalation requiring extended preservation;
- incident-linked preservation after systemic event;
- regulator, legal or management-directed preservation extension.

## 24. Access control for archived data

Archived data should not automatically be visible to everyone who can see active data.

### Principles

- support may need selective archived lookup but not full raw evidence access;
- compliance and finance may require deeper historical retrieval;
- sensitive evidence should preserve least-privilege access;
- archive exports should be tightly controlled and logged.

## 25. Data minimization and masking

Retention policy должна сочетаться с minimization and masking strategy.

### Expectations

- fields not needed in archive retrieval should be masked or minimized where feasible;
- support-facing archived views may expose less data than compliance-facing views;
- exported archived datasets should avoid unnecessary sensitive columns;
- minimization logic must not destroy required audit traceability.

## 26. Operational UI implications

Admin console and internal tools should clearly distinguish active and archived records.

### Recommended behaviors

- search should indicate when a record is archived;
- archived records should open in read-mostly mode;
- dangerous actions must be disabled for archived entities unless explicitly allowed;
- legal-hold indicators should be visible to authorized users.

## 27. Automation and scheduling expectations

Retention execution should rely on scheduled, observable processes.

### Requirements

- archival jobs should be idempotent where possible;
- failures should surface to operations/engineering;
- policy changes should not silently retro-break prior archives;
- dry-run or preview capability is preferred for high-impact purge changes.

## 28. Auditability of retention operations

Retention itself must be auditable.

### Need to record

- what was archived, minimized, restored or purged;
- when action happened;
- what policy/version applied;
- whether action was automated or manual;
- who approved exceptions where relevant.

## 29. Governance and ownership

Каждый retention domain должен иметь owner и review cadence.

### Governance model should define

- who sets baseline policy;
- who approves exceptions;
- who reviews archive/purge outcomes;
- who validates access appropriateness;
- who updates policy after incidents, audits or regulatory change.

## 30. Testing and validation expectations

Retention/archival behavior must be tested like any critical platform capability.

### Need to validate

- archive trigger correctness;
- linked-entity preservation;
- legal hold override behavior;
- restore workflow correctness;
- purge safety and dependency handling;
- archived access control correctness;
- audit logging of retention operations.

## 31. Recommended deliverables after this spec

На базе этого spec рекомендуется создать:

- retention schedule matrix by data domain;
- archive storage architecture note;
- legal hold operations runbook;
- purge approval workflow;
- archive access matrix;
- data minimization field catalog.

## 32. Related documents

Использовать вместе с:

- `observability-and-audit-spec.md`
- `compliance-and-legal-operations-spec.md`
- `reconciliation-and-ledger-spec.md`
- `analytics-and-reporting-spec.md`
- `admin-console-ia-and-workspace-spec.md`
- `incident-response-playbook.md`
- `production-readiness-checklist.md`
- `fraud-signals-and-risk-rules-spec.md`