## Document metadata

- Status: active
- Role: Canonical authority
- Owner: QA + Engineering
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `release-readiness-and-rollout-plan.md`
  - `acceptance-test-catalog.md`
  - `contract-test-matrix.md`
- Related documents:
  - `data-quality-freshness-and-data-contract-spec.md`
  - `accessibility-conformance-plan.md`
  - `qa-scenario-matrix-by-action-tier.md`
  - `migration-validation-pack.md`
  - `canonical-documentation-governance-spec.md`

# Test Strategy & QA Plan — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает общую тестовую стратегию и QA-план для платформы TheBlack.Trade. Он определяет уровни тестирования, зоны покрытия, виды тестов, ownership, test environments, acceptance gates и подход к проверке customer, admin, payment, compliance, notification, document и operational flows.

Документ предназначен для QA, backend, frontend, Directus integrators, DevOps, product, operations и release managers.

## 2. Цели документа

Тестовая стратегия должна обеспечивать:

- предсказуемую проверку критичных пользовательских и операционных сценариев;
- раннее обнаружение регрессий;
- согласованность между business rules, state machine, API, UI и operations;
- readiness платформы к staged rollout;
- проверку не только happy-path, но и review, hold, discrepancy, incident и recovery сценариев.

## 3. Scope

Документ покрывает:

- уровни тестирования;
- test pyramid / test distribution;
- domains under test;
- environment strategy for QA;
- ownership model;
- release gates;
- regression strategy;
- non-functional and operational testing;
- UAT and production validation expectations.

## 4. Testing principles

1. **Критичные финансовые и статусные переходы должны проверяться на нескольких уровнях.**
2. **Happy path недостаточен: manual review, hold, rejection и retry flows обязательны.**
3. **Сustomer-facing и operator-facing flows тестируются отдельно и вместе.**
4. **State machine и permissions — first-class test surfaces.**
5. **Проверка observability, notifications и documents обязательна для release-ready статуса.**
6. **Любой production-facing automation должен иметь test coverage и fallback validation path.**

## 5. Test scope by domain

| Domain | What must be validated |
|---|---|
| Auth & access | Registration/login/session, role access, route protection |
| KYC | Eligibility, submission, review, re-submit, status projection |
| Quote & order | Quote creation, order creation, status transitions, expiry/cancel |
| Payment | Evidence submission, provider sync, review, mismatch, reject |
| Wallet/requisites | Entry, verification, rejection, lock/update rules |
| Sell payout | Hold, review, release, completion, fail/retry paths |
| Reconciliation | Ledger events, discrepancy open/resolve, closure readiness |
| Notifications | Event mapping, delivery states, suppression/deduplication |
| Documents | Generation, delivery, resend, re-issue |
| Admin/ops | Review queues, actions, permissions, audit trails |
| Incident/degraded mode | Queue pause, manual-only mode, communication consistency |

## 6. Test levels

## 6.1 Unit tests

Unit tests должны покрывать isolated business logic such as:

- validation rules;
- state transition guards;
- amount/status mapping;
- risk/compliance decision helpers;
- notification/document trigger logic;
- formatting / localization helpers.

## 6.2 Integration tests

Integration tests должны покрывать:

- API ↔ Directus ↔ DB interaction;
- provider adapter logic;
- file upload / storage processing;
- queue/job processing;
- event emission and audit creation;
- permissions and role enforcement на boundary level.

## 6.3 End-to-end tests

E2E tests должны покрывать сквозные бизнес-флоу:

- buy flow;
- sell flow;
- KYC-required flow;
- payment review flow;
- wallet rejection/retry flow;
- payout hold/release flow;
- document and notification emission;
- support/admin review critical actions.

## 6.4 Manual exploratory tests

Обязательны для:

- UX clarity;
- admin queue usability;
- copy and localization checks;
- incident/degraded mode behavior;
- complex exception handling where scripted automation insufficient.

## 7. Recommended test distribution

Рекомендуется balanced strategy:

- много unit coverage для deterministic rules;
- достаточный integration coverage для provider/event/data boundaries;
- ограниченный, но критически подобранный E2E suite для business-critical flows;
- manual exploratory/UAT для edge UX and operations behavior.

## 8. Canonical critical user journeys

Минимальный release-ready набор должен включать end-to-end validation следующих journeys:

1. Buy flow from quote to completed order.
2. Sell flow from quote to payout completed.
3. KYC-gated order flow.
4. Payment proof submitted → manual review → approved.
5. Payment proof submitted → rejected/request more info.
6. Wallet/requisites submitted → rejected → corrected.
7. Payout hold → release after review.
8. Order completed → receipt/document available.
9. Notification flow for major state changes.
10. Support/admin action reflected in customer-safe status.

## 9. State machine testing strategy

State machine testing — отдельный приоритет.

### Нужно проверять:

- допустимые transitions;
- недопустимые transitions;
- idempotent повторные вызовы;
- direction-specific differences (buy/sell);
- review/hold/restricted branches;
- customer-visible projection vs internal status.

### Artifacts under test

- canonical order state machine;
- transaction substatus model;
- frontend state machine;
- admin review decision actions.

## 10. Permissions and role testing

Permissions testing должно включать:

- client ownership isolation;
- admin/support/ops/compliance/finance role boundaries;
- запрет forbidden actions;
- field masking;
- controlled-action-only enforcement;
- dual-control / no-self-approval scenarios where applicable.

Особенно важно протестировать обновленную роль-модель вокруг support, operations, finance, compliance и admin surfaces.

## 11. Notifications and communications testing

Нужно проверять:

- event-to-notification mapping;
- отсутствие ложных success messages;
- deduplication/suppression rules;
- email template correctness;
- in-app status consistency;
- support communication consistency with state machine.

## 12. Document and receipt testing

Нужно проверять:

- document generation trigger correctness;
- payload snapshot completeness;
- template version persistence;
- delivery success/failure behavior;
- resend vs re-issue distinction;
- customer download visibility;
- operator reissue permissions and audit trail.

## 13. Reconciliation and financial integrity testing

Критичные проверки:

- ledger entries created as expected;
- discrepancy case opens when needed;
- order closure blocked on unresolved discrepancy;
- duplicate payout safeguards;
- delayed callback/provider ambiguity handling;
- settlement/document linkage where relevant.

## 14. Operational and admin testing

Нужно проверять:

- queue routing;
- priority/aging behavior;
- review actions and reason codes;
- handoff notes requirements;
- SLA-exception labeling;
- incident flag visibility;
- document delivery failure follow-up queue behavior.

## 15. Observability and audit testing

Нужно валидировать, что система создает:

- audit records for sensitive actions;
- business events;
- notification/document logs;
- traceable correlation identifiers;
- deployment/runtime identifiers where relevant.

Тест успешен только если critical action не просто завершился, но и наблюдаем в логах/аудите правильным образом.

## 16. Non-functional testing

Минимально нужно предусмотреть:

- performance smoke for critical APIs and UI screens;
- concurrency-sensitive checks around payment/payout actions;
- resilience tests for retries and duplicate-safe behavior;
- file/document upload and generation stress checks;
- security/permission verification;
- recovery validation after controlled failures.

## 17. Incident and degraded mode testing

Нужно тестировать сценарии:

- provider outage / callback delay;
- queue pause;
- switch to manual-review-only mode;
- false notification prevention during incident;
- payout freeze path;
- incident-related support communication behavior.

Часть этих сценариев можно проводить как tabletop + controlled staging rehearsal.

## 18. Test environments

### Local

Для unit, component and isolated integration checks.

### Dev

Для integration and feature verification.

### Staging

Для release candidate validation, full regression, UAT, permissions review, incident rehearsal, document/notification validation.

Production не должен использоваться как substitute for staging validation, кроме limited post-deploy smoke checks.

## 19. Test data strategy

Test data должно покрывать:

- buy and sell orders;
- verified and unverified users;
- KYC pending/approved/rejected cases;
- successful and failed payments;
- verified, rejected and recently changed requisites;
- discrepancy and hold scenarios;
- notification/document retry scenarios;
- high-value / restricted / escalated cases.

Необходимо иметь repeatable seeded datasets или deterministic setup scripts для staging/dev.

## 20. Ownership model

| Area | Primary owner |
|---|---|
| Unit tests | Engineering |
| Integration tests | Engineering + QA |
| E2E business flows | QA + Engineering |
| UAT | Product + Operations + QA |
| Permissions/compliance verification | QA + Compliance/Operations stakeholders |
| Incident rehearsal | Engineering + Operations + QA |
| Release smoke | QA + release owner |

## 21. Regression strategy

Рекомендуется разделить regression на:

- critical smoke suite;
- release regression suite;
- domain-focused deep-dive checks;
- incident/recovery rehearsal set.

### Critical smoke should cover

- login;
- quote/order creation;
- one buy flow path;
- one sell flow path;
- payment review path;
- one admin action;
- one notification/document assertion.

## 22. UAT strategy

UAT должно включать:

- product validation of user flows;
- operations validation of review queues and admin actions;
- support validation of wording/status explanations;
- compliance validation of holds, restrictions and evidence handling;
- finance validation of payout/reconciliation logic.

## 23. Release gates

Production release не должен считаться готовым без:

- passed automated checks;
- staging validation of critical flows;
- permissions regression pass;
- notification/document checks;
- no critical unresolved defect in payment/payout/order state handling;
- observability/audit validation for sensitive actions;
- rollback/degraded-mode readiness.

## 24. Defect prioritization guidance

| Severity | Meaning |
|---|---|
| Critical | Financial loss, duplicate payout risk, broken auth/permissions, false completion |
| High | Broken key journey, wrong state transitions, missing mandatory document/notification |
| Medium | Important UX/admin issue with workaround |
| Low | Cosmetic/non-blocking issue |

Critical and high severity defects in payment, payout, permissions, state machine, audit, compliance or document generation should block release.

## 25. Traceability matrix expectations

Рекомендуется поддерживать mapping между:

- requirement/spec;
- API/state machine/Directus entity;
- test case/scenario;
- defect/report;
- release gate.

Это особенно важно для orders, payments, payouts, compliance actions, notifications и documents.

## 26. Post-deploy validation

После production deploy нужно проверить минимум:

- health of auth;
- quote/order path availability;
- critical background jobs;
- notification and document pipelines;
- provider connectivity;
- audit/observability signals;
- absence of abnormal queue growth.

## 27. Tooling expectations

QA/tooling stack должна поддерживать:

- automated API tests;
- browser E2E tests;
- environment-aware test execution;
- fixture/seed management;
- test reporting and defect traceability;
- observability-assisted debugging.

## 28. Open decisions to finalize

Перед production launch нужно определить:

- конкретный automation stack;
- scope of mandatory E2E automation;
- owners of release gate sign-off;
- cadence of full regression;
- threshold for performance/concurrency checks;
- frequency of incident simulation exercises.

## 29. Related follow-up documents

На базе этого плана рекомендуется подготовить:

- `release-readiness-and-rollout-plan.md`
- `production-readiness-checklist.md`
- `provider-capability-matrix.md`
- `business-continuity-and-dr-spec.md`