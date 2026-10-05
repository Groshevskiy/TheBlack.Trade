## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Data + Product + Finance Ops
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `data-model-canonical-entities-spec.md`
  - `governed-event-taxonomy-and-schema-registry-spec.md`
- Related documents:
  - `operational-dashboard-for-threshold-triggered-actions.md`
  - `reconciliation-and-ledger-spec.md`
  - `data-retention-and-archival-spec.md`

# Analytics & Reporting Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает analytics and reporting layer для TheBlack.Trade. Он определяет, какие продуктовые, операционные, финансовые и compliance-ориентированные данные должны собираться, как должны строиться KPI, dashboards и reporting views, какие события нужно трекать и как обеспечить согласованность между customer funnel, operational queues, payout/payment quality, reconciliation, incidents и management reporting.

Документ предназначен для product, engineering, data/BI, operations, finance, compliance, support и management.

## 2. Цели документа

Analytics/reporting layer должен обеспечивать:

- измеримость customer funnel и conversion;
- прозрачность operational throughput и SLA;
- контроль payout/payment quality и discrepancy dynamics;
- понимание причин friction, rejection и customer drop-off;
- основу для rollout decisions и automation readiness;
- управленческую отчетность по ключевым метрикам платформы.

## 3. Scope

Документ покрывает:

- event instrumentation principles;
- KPI model;
- dashboard families;
- reporting dimensions;
- operational and finance metrics;
- support and incident analytics;
- data quality and governance expectations.

## 4. Core analytics principles

1. **Metrics must map to business decisions, not vanity reporting.**
2. **One event should have one meaning across teams.**
3. **Customer funnel and operational queue analytics must be linked.**
4. **Money movement metrics must reconcile with authoritative business records.**
5. **Automation decisions require evidence from analytics, not intuition alone.**
6. **Sensitive data usage in reporting must respect access boundaries.**

## 5. Analytics layers

Рекомендуется разделить аналитику на слои:

- product funnel analytics;
- operational analytics;
- financial / reconciliation analytics;
- support / communication analytics;
- compliance / risk analytics;
- incident / reliability analytics;
- executive / management reporting.

## 6. KPI families

| KPI family | Purpose |
|---|---|
| Acquisition & activation | Понять, как пользователь доходит до первой заявки |
| Order conversion | Понять, где заявки теряются или задерживаются |
| KYC & verification | Понять влияние verification на throughput |
| Payment & payout quality | Контролировать quality money movement |
| Queue & SLA | Контролировать operational latency |
| Support & communication | Измерять customer confusion and service load |
| Reconciliation & discrepancy | Контролировать financial integrity |
| Incident & reliability | Оценивать platform stability |
| Automation readiness | Понимать, что готово к partial automation |

## 7. Event instrumentation model

Каждое аналитическое событие должно иметь:

- event name;
- event timestamp;
- environment;
- actor type (customer/operator/system/provider);
- related order/customer/payment/payout ids where relevant;
- lifecycle status snapshot;
- source system / channel;
- correlation identifiers.

### Principles

- события должны быть versioned if schema evolves;
- business events и technical events нужно разделять;
- analytics не должна ломать primary business flow;
- event naming должно быть canonical and documented.

## 8. Core business events to track

### Customer / funnel events

- landing viewed;
- quote started;
- quote calculated;
- signup started/completed;
- login completed;
- KYC started/submitted/completed/rejected;
- wallet/requisite added/verified/rejected;
- order created;
- order canceled/expired/completed.

### Operations / review events

- payment evidence submitted;
- payment approved/rejected/requested-more-info;
- payout prepared/released/completed/failed;
- hold opened/closed;
- discrepancy opened/resolved;
- document generated/delivered/failed;
- notification queued/sent/failed/suppressed;
- incident opened/updated/resolved.

## 9. Funnel model

Recommended top-level customer funnel:

1. Visitor reaches product entry.
2. Quote initiated.
3. Quote accepted / proceed intent.
4. Auth completed.
5. KYC completed if required.
6. Order created.
7. Payment or crypto prerequisite satisfied.
8. Review passed.
9. Payout/transfer completed.
10. Order completed and documented.

### Funnel goals

Нужно уметь видеть conversion and drop-off между каждым шагом, включая различия между buy и sell flows.

## 10. Product funnel KPIs

| Metric | Meaning |
|---|---|
| Quote start rate | How many visitors start calculation |
| Quote-to-order conversion | How many calculated quotes become orders |
| Auth completion rate | How many users finish required auth |
| KYC completion rate | How many required KYC flows finish successfully |
| Wallet/requisite completion rate | How many users successfully provide valid destination/source data |
| Order completion rate | How many orders reach completed |
| Drop-off by stage | Where users abandon or fail |
| Time-to-complete order | End-to-end user journey duration |

## 11. Operational KPIs

| Metric | Meaning |
|---|---|
| Orders awaiting review | Current queue load |
| Payment review turnaround time | Speed of payment decision |
| Payout release turnaround time | Speed of payout handling |
| Queue aging by type | Operational delay pressure |
| Rejection/request-more-info rates | Friction and quality signals |
| Escalation volume | Complexity/risk indicator |
| Reopen/rework rate | Operational quality indicator |

## 12. Payment and payout quality KPIs

| Metric | Meaning |
|---|---|
| Payment mismatch rate | Share of payments requiring discrepancy handling |
| Payment approval rate | Share of payment submissions approved |
| Payout failure rate | Failed payouts over initiated payouts |
| Payout retry rate | Frequency of reprocessing |
| Duplicate-risk interventions | Count of prevented risky actions |
| Provider callback delay | Latency/risk indicator |
| Money-movement completion time | Core service quality metric |

## 13. KYC and compliance KPIs

| Metric | Meaning |
|---|---|
| KYC submission rate | Users reaching KYC submit stage |
| KYC approval rate | Share of successful reviews |
| KYC rejection/remediation rate | Friction and policy signal |
| Compliance hold volume | Number of active restricted cases |
| Compliance review turnaround | Time to decision |
| Restricted/flagged order share | Risk signal |
| Escalated suspicious cases | Enhanced monitoring load |

## 14. Reconciliation and finance KPIs

| Metric | Meaning |
|---|---|
| Open discrepancies | Current unresolved financial issues |
| Discrepancy aging | Resolution pressure |
| Reconciliation success rate | Cleanly matched flows |
| Orders blocked by discrepancy | Operational/financial blockage |
| Settlement/report completeness | Reporting quality |
| Manual finance intervention rate | Operational efficiency indicator |

## 15. Notification and document KPIs

| Metric | Meaning |
|---|---|
| Notification send success rate | Reliability of customer communication |
| Notification suppression rate | Incident/degraded mode indicator |
| Email bounce/complaint rate | Deliverability quality |
| Document generation success rate | Reliability of receipt/document service |
| Document delivery failure rate | Customer-facing risk |
| Re-send / re-issue volume | Clarity/quality indicator |

## 16. Support KPIs

| Metric | Meaning |
|---|---|
| Contact rate per completed order | Customer friction signal |
| Top contact reasons | Main confusion/problem categories |
| Status explanation contacts | Signal of unclear UX/status design |
| Escalation-to-resolution time | Support operational quality |
| Complaint rate | Trust/risk signal |
| Repeat contact rate | Service quality indicator |

## 17. Incident and reliability KPIs

| Metric | Meaning |
|---|---|
| Incident count by severity | Stability picture |
| Provider-linked incident share | Dependency risk |
| Mean time to detect | Detection quality |
| Mean time to mitigate | Response quality |
| Queue disruption during incident | Operational impact |
| Degraded-mode activation frequency | Platform resilience indicator |

## 18. Automation readiness metrics

Automation decisions should rely on evidence such as:

- low exception rate in target flow;
- stable turnaround times;
- low discrepancy rate;
- low false-positive/false-completion risk;
- strong observability completeness;
- low manual override rate.

These metrics should be segmented by provider, asset, payment method, amount band and customer cohort.

## 19. Dashboard families

### Recommended dashboards

- Executive overview dashboard;
- Product funnel dashboard;
- Operations command dashboard;
- Payment/payout quality dashboard;
- KYC/compliance dashboard;
- Reconciliation dashboard;
- Support and communication dashboard;
- Incident/reliability dashboard;
- Automation readiness dashboard.

## 20. Executive overview dashboard

Should include:

- order volume;
- completion rate;
- pending review load;
- payout/payment health;
- discrepancy count;
- support pressure;
- incident status;
- top risks / blockers.

## 21. Operations command dashboard

Should include:

- queue sizes by type;
- aging and SLA breach risk;
- pending high-value cases;
- holds and escalations;
- document/notification failures;
- provider callback anomalies;
- staffing / workload indicators if available.

## 22. Reporting dimensions and segmentations

Отчеты и dashboards должны уметь сегментироваться минимум по:

- date/time;
- buy vs sell direction;
- asset / network / payment method;
- provider;
- KYC required / not required;
- order size band;
- new vs repeat customer;
- manual vs automated handling path;
- incident-affected vs normal periods.

## 23. Source-of-truth rules for analytics

- authoritative counts for orders/payments/payouts должны опираться на business records, а не только frontend events;
- financial reporting must reconcile with ledger/reconciliation records;
- support metrics должны опираться на operational/support systems;
- incident metrics должны опираться на incident records, а не ad hoc notes.

## 24. Reporting cadence

Recommended cadence:

- real-time or near-real-time dashboards for operations;
- daily summaries for operations/finance/support;
- weekly trend reviews for product and management;
- phase review reporting for rollout decisions;
- monthly executive summary for platform health and improvement priorities.

## 25. Alert-oriented metrics

Некоторые аналитические метрики должны использоваться как alert inputs:

- sudden drop in order completion;
- spike in payment mismatches;
- spike in payout failures;
- growth in queue aging;
- notification/document failure spike;
- rise in support contact rate;
- elevated discrepancy backlog.

## 26. Data quality and governance

Analytics/reporting layer должен иметь правила качества:

- canonical metric definitions documented;
- event dictionary maintained;
- duplicate event handling defined;
- missing/late event handling understood;
- timezone/reporting cut-off rules standardized;
- metric ownership assigned.

## 27. Sensitive data and access control

Reporting access должен быть role-aware.

### Principles

- customer-sensitive data должна маскироваться where not needed;
- finance/compliance/support should not automatically see all raw fields;
- exported reports должны respect least privilege;
- management dashboards should prefer aggregated views.

## 28. Analytics QA expectations

Analytics itself needs validation.

### Need to verify

- event firing correctness;
- event payload completeness;
- ID correlation consistency;
- dashboard metric calculations;
- reconciliation between analytics views and source systems;
- alert threshold correctness.

## 29. Reporting use cases for decisions

### Product decisions

- where users drop before first order;
- what steps create confusion;
- whether copy/UX changes improve completion.

### Operations decisions

- where queues stall;
- which review steps overload team;
- where SLA pressure grows.

### Rollout decisions

- which providers/methods/cohorts are stable enough to expand;
- which capabilities remain manual-only;
- when selective automation can safely increase.

## 30. Recommended follow-up artifacts

На базе этого spec рекомендуется создать:

- KPI dictionary / metric catalog;
- event taxonomy and schema registry;
- dashboard inventory;
- reporting access matrix;
- automation readiness scorecard.

## 31. Related documents

Использовать вместе с:

- `notification-event-matrix.md`
- `reconciliation-and-ledger-spec.md`
- `observability-and-audit-spec.md`
- `operations-runbook-and-sla-spec.md`
- `incident-response-playbook.md`
- `release-readiness-and-rollout-plan.md`
- `production-readiness-checklist.md`
- `admin-console-ia-and-workspace-spec.md`