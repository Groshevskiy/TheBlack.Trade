## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Security + Operations + Platform
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `observability-and-audit-spec.md`
  - `business-continuity-and-dr-spec.md`
- Related documents:
  - `observability-operations-runbook.md`
  - `incident-postmortem-and-learning-process.md`
  - `operations-runbook-and-sla-spec.md`
  - `threat-model-and-security-architecture-spec.md`
  - `release-readiness-and-rollout-plan.md`

# Incident Response Playbook — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает playbook реагирования на инциденты для платформы TheBlack.Trade: какие типы инцидентов существуют, как они классифицируются, кто участвует в response, какие первые действия обязательны, как выполняется эскалация, containment, customer communication и post-incident review.

Документ предназначен для operations, engineering, support, finance/settlement, compliance, product и руководителей операционного контура.

## 2. Цели документа

Playbook нужен для того, чтобы:

- сократить время реакции на инциденты;
- стандартизировать triage и escalation;
- минимизировать риск повторных ошибок и неконтролируемых выплат;
- снизить customer impact;
- обеспечить traceability incident decisions;
- связать observability, operations и compliance-процессы в единый response flow.

## 3. Scope

Документ покрывает:

- incident taxonomy;
- severity model;
- response lifecycle;
- incident roles;
- containment actions;
- communication rules;
- runbooks для типовых инцидентов;
- post-incident review expectations.

Документ не заменяет техническую low-level диагностику конкретных интеграций, но задает operating framework для реакции.

## 4. Incident definition

Инцидентом считается событие или цепочка событий, которые:

- создают риск некорректной финансовой операции;
- блокируют критический пользовательский путь;
- нарушают data integrity или traceability;
- приводят к задержкам payout/completion сверх допустимого окна;
- создают массовые ошибки в коммуникации, документах или статусах;
- нарушают expected behavior critical integrations.

## 5. Incident taxonomy

| Incident family | Examples |
|---|---|
| Provider / payment incident | provider outage, callback failures, inconsistent payment status |
| Wallet / payout incident | payout blocked, duplicate payout risk, destination validation failure |
| Reconciliation / ledger incident | missing records, mismatch, unresolved discrepancy spike |
| State machine / workflow incident | impossible transition, stuck orders, invalid terminal states |
| Notification / document incident | false success emails, receipt generation failure cluster |
| Security / access incident | suspicious operator action, permission misuse |
| Compliance incident | restricted case mishandled, hold bypass, missing audit trail |

## 6. Severity model

| Severity | Meaning | Typical examples |
|---|---|---|
| SEV-1 | Critical platform or financial risk | duplicate payout risk, broad payout corruption, systemic state corruption |
| SEV-2 | High user/business impact | provider outage affecting active orders, critical discrepancy cluster |
| SEV-3 | Significant but contained issue | repeated document delivery failure, queue stuck for one workflow |
| SEV-4 | Low-severity operational defect | isolated non-critical notification bug |

## 7. Incident roles

| Role | Responsibilities |
|---|---|
| Incident commander | Координация response, decision ownership, status cadence |
| Engineering lead / on-call | Техническая диагностика, rollback/fix/mitigation |
| Operations lead | Queue control, manual workarounds, operational containment |
| Finance/settlement lead | Payout / reconciliation containment |
| Compliance lead | Restriction-sensitive decisions |
| Customer communications owner | External/internal messaging consistency |
| Scribe / recorder | Timeline, decisions, evidence capture |

На MVP некоторые роли могут совмещаться, но ownership должен быть явно назначен.

## 8. Incident response lifecycle

Стандартный lifecycle:

1. Detect
2. Triage
3. Classify
4. Contain
5. Mitigate / Recover
6. Validate
7. Communicate
8. Review and follow-up

## 9. Detection sources

Инцидент может быть обнаружен через:

- system alerts and observability dashboards;
- queue backlog spikes;
- reconciliation mismatch events;
- operator reports;
- failed payout/document delivery clusters;
- user complaints / support tickets;
- provider status anomalies.

## 10. Triage checklist

При triage нужно быстро ответить на вопросы:

- affected flow(s)?
- financial risk present?
- duplicate payout / false completion risk?
- customer-visible impact?
- active workaround exists?
- scope isolated or systemic?
- provider-side, internal, or mixed?

## 11. Immediate containment principles

Приоритет response — не “исправить красиво”, а сначала остановить ущерб.

### Core containment options

- временно остановить payout release;
- перевести affected flow в manual-review-only mode;
- suppress misleading notifications;
- временно отключить integration path;
- запретить certain operator actions;
- freeze risky queue transitions.

## 12. Communication principles

### Internal

- использовать единый severity label;
- публиковать known facts separately from assumptions;
- фиксировать owners and next update time;
- не терять timeline решений.

### Customer-facing

- не скрывать user-impacting delays;
- не обещать сроки восстановления без основания;
- не сообщать “успешно”, если outcome неизвестен;
- использовать согласованный wording с operations/compliance.

## 13. Standard incident data to capture

Для каждого инцидента нужно собрать:

- incident id;
- opened_at;
- detected_by;
- severity;
- impacted systems/flows;
- suspected start time;
- incident commander;
- containment actions;
- affected orders/entities estimate;
- customer impact summary;
- current status;
- timeline of major decisions;
- recovery validation notes;
- postmortem owner.

## 14. Runbook: provider outage / callback failure cluster

### Indicators

- резкий рост failed callbacks;
- provider success not reflected internally;
- callback latency spike;
- growing payment review backlog.

### Immediate actions

1. Confirm scope and provider path affected.
2. Mark incident severity.
3. Switch affected flow to protected/manual mode if needed.
4. Pause misleading customer automations.
5. Route active cases to review queues.
6. Start provider escalation.

### Do not

- auto-complete affected orders without verified evidence;
- release payout where callback ambiguity can create duplicate outcome.

## 15. Runbook: duplicate payout risk

### Indicators

- conflicting payout statuses;
- replayed payout attempts;
- unclear provider timeout vs success;
- reconciliation anomaly near payout completion.

### Immediate actions

1. Freeze payout release path for affected cohort or order.
2. Assign finance/settlement lead.
3. Collect payout references and audit trail.
4. Verify whether any payout actually settled.
5. Block retries until disposition is clear.
6. Escalate as SEV-1 or SEV-2 depending on scope.

### Recovery criteria

- definitive disposition established for each affected payout;
- duplicate-risk orders protected;
- future retry logic controlled.

## 16. Runbook: stuck order / invalid state transition

### Indicators

- orders accumulating in intermediate state;
- impossible transition errors;
- order cannot move despite prerequisites being met;
- state mismatch between UI/admin/internal records.

### Immediate actions

1. Determine whether issue is isolated or systemic.
2. Stop unsafe automated transitions if necessary.
3. Preserve evidence of broken state.
4. Escalate to engineering.
5. Define manual workaround for live orders where safe.

### Recovery criteria

- fixed transition path validated;
- backlog triaged;
- unsafe states reconciled.

## 17. Runbook: reconciliation / discrepancy spike

### Indicators

- many new discrepancy cases in short window;
- closure readiness blocked for many orders;
- unexplained internal vs external mismatch.

### Immediate actions

1. Pause risky completion or payout steps if needed.
2. Quantify affected population.
3. Separate provider-origin vs internal-origin anomalies.
4. Escalate finance + engineering + compliance as needed.
5. Prioritize by financial exposure.

## 18. Runbook: false customer communications / document incident

### Indicators

- customer received misleading “success” email;
- receipt generated with wrong status basis;
- bulk document delivery failure.

### Immediate actions

1. Stop affected template or send flow.
2. Identify affected audience and scope.
3. Freeze repeated sends.
4. Determine if corrective communication is required.
5. Log document/notification evidence.

### Recovery criteria

- affected template fixed or disabled;
- impacted users identified;
- corrected messaging strategy approved.

## 19. Runbook: compliance control bypass / audit gap

### Indicators

- restricted case moved forward without review;
- missing audit trail for sensitive action;
- policy-required hold not enforced.

### Immediate actions

1. Freeze similar actions/flows.
2. Preserve audit evidence.
3. Identify whether bypass is isolated or systemic.
4. Escalate compliance + engineering + ops lead.
5. Prevent further progression of affected cases.

## 20. Recovery validation

Перед закрытием инцидента нужно подтвердить:

- containment removed only when safe;
- affected flows behave correctly;
- no hidden duplicate-risk remains;
- communication/document issues resolved;
- monitoring/alerts reflect restored state;
- open follow-up tasks explicitly tracked.

## 21. Customer communication states

Рекомендуется разделять как минимум:

- investigation ongoing;
- degraded processing;
- temporary manual handling;
- partial recovery;
- resolved.

Customer wording должен быть привязан к фактам и не должен раскрывать внутренние security/compliance heuristics.

## 22. Evidence and traceability

Во время инцидента нужно сохранять:

- relevant logs/traces/metrics references;
- affected order lists or search criteria;
- incident decisions with timestamps;
- who approved containment/rollback/manual override;
- customer communication versions;
- recovery verification evidence.

## 23. Post-incident review

После значимого инцидента должен выполняться review.

### Review must include

- incident summary;
- impact assessment;
- timeline;
- root cause;
- what worked / what failed in response;
- containment effectiveness;
- detection gaps;
- action items with owners and deadlines.

## 24. Action item categories

Follow-up actions обычно делятся на:

- code fixes;
- alerting improvements;
- queue / runbook changes;
- permissions / governance changes;
- UX / messaging corrections;
- provider escalation / contract follow-up;
- documentation updates.

## 25. Production readiness checklist

Перед production launch should be defined:

- who is incident commander by default;
- on-call ownership model;
- severity thresholds and examples;
- which flows can be paused independently;
- how payout freeze is executed operationally;
- who approves corrective customer communication;
- which incidents require mandatory postmortem.

## 26. QA / simulation recommendations

Нужно проводить tabletop или controlled simulation минимум для:

- provider outage;
- duplicate payout risk;
- stuck orders in manual-review-heavy flow;
- false success notification;
- missing receipt/document delivery cluster;
- compliance hold bypass scenario.

## 27. Следующие документы

На базе этого playbook рекомендуется подготовить:

- `support-communication-guidelines.md`
- `provider-capability-matrix.md`
- `production-readiness-checklist.md`
- `release-readiness-and-rollout-plan.md`