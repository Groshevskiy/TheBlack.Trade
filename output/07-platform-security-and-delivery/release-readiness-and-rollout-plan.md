## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Engineering + QA + Operations
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `test-strategy-and-qa-plan.md`
  - `production-readiness-checklist.md`
- Related documents:
  - `service-catalog-and-ownership-directory.md`
  - `feature-flag-operations-spec.md`
  - `acceptance-test-catalog.md`
  - `contract-test-matrix.md`
  - `environment-and-deployment-spec.md`

# Release Readiness & Rollout Plan — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает подход к release readiness и phased rollout платформы TheBlack.Trade. Он определяет, когда продукт считается готовым к выпуску, какие условия должны быть выполнены до запуска, как проходит staged launch, какие guardrails действуют в production и как принимается решение о переходе от controlled/manual mode к более автоматизированной эксплуатации.

Документ предназначен для product, engineering, QA, operations, compliance, finance, support, release owner и management.

## 2. Цели документа

Release and rollout model должен обеспечивать:

- безопасный и управляемый запуск платформы;
- минимизацию операционных и финансовых рисков;
- возможность поэтапного наращивания нагрузки и автоматизации;
- прозрачные go / no-go критерии;
- быстрый переход в safe mode при нестабильности;
- измеримую post-launch validation.

## 3. Scope

Документ покрывает:

- release readiness criteria;
- pre-launch control gates;
- phased rollout model;
- feature flags and launch guardrails;
- go/no-go governance;
- success metrics for each rollout stage;
- rollback/containment triggers;
- transition plan from manual-review-first to selective automation.

## 4. Core rollout principles

1. **Launch is a controlled risk decision, not a date-only milestone.**
2. **Manual-review-first is the default initial operational mode.**
3. **Automation is enabled only after evidence of stable behavior.**
4. **Rollout should expand by cohort, flow and capability — not all at once.**
5. **Every phase must have explicit entry and exit criteria.**
6. **Unsafe growth without observability and rollback readiness is forbidden.**

## 5. Release readiness dimensions

Готовность к запуску должна оцениваться минимум по следующим осям:

- product readiness;
- engineering readiness;
- QA readiness;
- operations readiness;
- compliance/legal readiness;
- finance/payment readiness;
- support readiness;
- observability/incident readiness.

## 6. Readiness checklist by domain

| Domain | Must be true before launch |
|---|---|
| Product | Critical flows approved, copy/statuses aligned, launch scope frozen |
| Engineering | Release candidate stable, env/deploy path validated, critical defects resolved |
| QA | Regression passed, critical E2E journeys validated, known issues assessed |
| Operations | Queues, roles, handoffs, SLAs and runbooks validated |
| Compliance | Required legal copy, restrictions, holds and review paths validated |
| Finance/Payments | Payment/payout provider path tested, discrepancy handling ready |
| Support | Support scripts and escalation routes ready |
| Observability | Dashboards, alerts, audit and incident handling operational |

## 7. Minimum launch baseline

Платформа не должна выходить в public or real-money rollout без следующего минимального baseline:

- buy and sell flows implemented;
- KYC gating available where required;
- manual payment review path available;
- payout hold/release controls available;
- order state machine stabilized;
- notifications/documents working for core flows;
- auditability for sensitive actions;
- production support/ops coverage defined.

## 8. Go / No-Go governance

### 8.1 Go / No-Go meeting participants

Рекомендуемый состав:

- release owner;
- product owner;
- engineering lead;
- QA lead;
- operations lead;
- compliance/legal representative;
- finance/payment representative;
- support representative.

### 8.2 Decision rule

Go decision возможен только при:

- отсутствии unresolved critical defects;
- приемлемом наборе known issues;
- готовности rollback/containment plan;
- подтвержденной production supportability;
- согласованной launch cohort and scope.

## 9. Rollout model overview

Рекомендуется phased rollout в несколько стадий.

| Phase | Description |
|---|---|
| Phase 0 | Internal validation / controlled production readiness |
| Phase 1 | Soft launch with small trusted cohort |
| Phase 2 | Limited public rollout with manual-review-first controls |
| Phase 3 | Expanded rollout with selective automation |
| Phase 4 | Broad scale-up with controlled optimization |

## 10. Phase 0 — Internal validation

### Goal

Подтвердить, что production environment operationally ready before exposing meaningful traffic.

### Conditions

- production deployment path validated;
- observability/alerts enabled;
- operator access and queues validated;
- support and escalation channels tested;
- document and notification path smoke-checked;
- finance/compliance sign-off on operating model.

### Exit criteria

- no blocking production misconfiguration;
- critical smoke suite passed;
- incident contacts and on-call routes confirmed.

## 11. Phase 1 — Soft launch / trusted cohort

### Goal

Проверить end-to-end platform behavior на ограниченном наборе пользователей и заявок.

### Cohort examples

- internal users;
- invited trusted testers;
- known low-volume pilot clients.

### Rules

- manual-review-first on all critical decision points;
- limited transaction volume;
- higher human monitoring;
- fast incident escalation threshold.

### Success criteria

- stable order progression;
- no severe payment/payout mismatches;
- notifications/documents behave correctly;
- operations can process queues within target expectations.

## 12. Phase 2 — Limited public rollout

### Goal

Запустить controlled public access при сохранении жестких operational guardrails.

### Controls

- limited eligible cohort/geo/payment methods/asset pairs;
- caps on transaction amount and volume;
- manual review for payments and payouts;
- stricter queue monitoring;
- conservative SLA promises externally.

### Exit criteria

- defect rate acceptable;
- no recurring critical incident pattern;
- reconciliation stable;
- support load manageable;
- compliance exceptions controlled.

## 13. Phase 3 — Selective automation enablement

### Goal

Включать automation постепенно только для безопасных и хорошо изученных участков.

### Candidate automation areas

- low-risk payment confirmation cases;
- selected notification/document auto-processing;
- selected provider-assisted wallet verification;
- low-risk queue auto-routing.

### Preconditions

- enough stable operational history;
- explicit risk approval;
- feature-flag control in production;
- audit visibility preserved;
- fallback to manual path available.

## 14. Phase 4 — Controlled scale-up

### Goal

Увеличивать traffic, volumes и automation coverage without losing control.

### Focus

- optimize queue throughput;
- refine alert thresholds;
- expand supported cohorts/providers/assets;
- reduce unnecessary manual friction where proven safe.

## 15. Feature flags and rollout controls

Критичные launch controls должны быть доступны через documented runtime flags.

### Required controls

- enable/disable public order intake;
- cohort-based access restriction;
- payment manual-review enforcement;
- payout manual-release enforcement;
- provider-specific disable switch;
- document auto-send toggle;
- notification suppression / emergency mode;
- queue pause / degraded mode;
- automation enablement by segment.

## 16. Launch metrics by phase

Для каждой rollout phase нужно измерять минимум:

- order creation success rate;
- payment review turnaround;
- payout completion success;
- error/incident rate;
- queue backlog and aging;
- discrepancy/reconciliation rate;
- notification/document failure rate;
- support contact volume per order;
- false-positive/false-completion risk indicators.

## 17. Guardrail thresholds

Перед launch нужно определить operational thresholds, при превышении которых rollout замораживается или откатывается.

### Example guardrails

- abnormal queue growth;
- repeated payout failures;
- notification/document systemic failures;
- reconciliation discrepancies above threshold;
- critical incident recurrence;
- support overload beyond planned capacity.

## 18. Rollback and containment triggers

Rollout should pause, roll back or narrow scope when:

- critical defect affects money movement or permissions;
- false completion / duplicate payout risk detected;
- unresolved provider instability appears;
- observability becomes insufficient;
- queue backlog creates unsafe SLA breach;
- compliance-critical behavior deviates from expected process.

### Possible actions

- stop new intake;
- narrow cohort;
- disable provider/asset/payment method;
- revert release;
- switch to fully manual-review mode;
- freeze payout automation;
- activate incident communication path.

## 19. Manual-to-automation transition policy

Автоматизация не должна включаться одномоментно.

### Recommended rule

Каждая automation capability проходит путь:

1. manual-only baseline;
2. monitored pilot with feature flag;
3. limited safe cohort automation;
4. broader enablement after evidence review.

### Evidence required

- stable metrics over agreed observation period;
- low incident/error/discrepancy rate;
- clear rollback path;
- ops/compliance acceptance.

## 20. Launch communications plan

Перед каждым rollout phase должны быть готовы:

- internal go-live briefing;
- incident escalation channel confirmation;
- support-facing guidance;
- customer-facing restrictions wording;
- change log / release notes for internal stakeholders.

## 21. Known issues policy

Не все defects обязаны блокировать release, но каждый known issue должен быть:

- documented;
- severity-rated;
- assigned an owner;
- assessed for customer/financial/operational impact;
- accepted explicitly if launch proceeds.

## 22. Production monitoring window

После каждого production release рекомендуется усиленный monitoring window.

### During this window

- engineering/ops remain on high attention;
- critical dashboards and alerts actively watched;
- queue health and provider callbacks checked more frequently;
- support escalation path shortened;
- go/no-go for next rollout expansion delayed until window closes cleanly.

## 23. Pilot review and phase advancement

Переход между фазами должен оформляться отдельным review.

### Review topics

- metrics vs targets;
- incidents and near-misses;
- support/ops load;
- compliance exceptions;
- reconciliation quality;
- customer confusion signals;
- recommendation: proceed / hold / narrow / rollback.

## 24. Roles and responsibilities during rollout

| Role | Responsibility |
|---|---|
| Release owner | Coordinates decision and execution |
| Engineering | Deploys, monitors technical behavior, fixes defects |
| QA | Validates release health and regression |
| Operations | Monitors queues and manual processing viability |
| Compliance | Monitors exceptions/restrictions/holds |
| Finance/Payments | Monitors payout/payment correctness |
| Support | Tracks customer confusion and escalation load |
| Product | Evaluates experience, scope and rollout progression |

## 25. Pre-expansion checklist

Перед расширением cohort/traffic/automation нужно подтвердить:

- previous phase metrics are stable;
- no unresolved critical operational pain;
- support and ops capacity sufficient;
- alert noise acceptable;
- rollback still practical at next scale;
- stakeholders approve expansion.

## 26. Post-launch review expectations

После каждой значимой launch phase нужно провести review с фиксацией:

- what worked;
- what failed or nearly failed;
- what manual steps were overloaded;
- what automation is now safe or still unsafe;
- what documentation/runbooks need update.

## 27. Deliverables linked to this plan

Этот документ должен использоваться совместно с:

- `environment-and-deployment-spec.md`
- `test-strategy-and-qa-plan.md`
- `production-readiness-checklist.md`
- `operations-runbook-and-sla-spec.md`
- `incident-response-playbook.md`
- `provider-capability-matrix.md`

## 28. Open decisions to finalize

Перед финальным launch необходимо утвердить:

- exact launch cohort definition;
- maximum transaction caps by phase;
- phase duration / observation windows;
- exact guardrail thresholds;
- final go/no-go approver list;
- automation candidates allowed for Phase 3;
- success criteria for moving to broader rollout.