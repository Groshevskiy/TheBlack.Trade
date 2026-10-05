## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Platform Engineering
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `threat-model-and-security-architecture-spec.md`
  - `release-readiness-and-rollout-plan.md`
- Related documents:
  - `developer-onboarding-and-local-development-guide.md`
  - `finops-capacity-and-cost-governance-spec.md`
  - `service-catalog-and-ownership-directory.md`
  - `business-continuity-and-dr-spec.md`
  - `production-readiness-checklist.md`
  - `theblack-trade-directus-implementation-blueprint.md`

# Environment & Deployment Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает environment strategy и deployment model для платформы TheBlack.Trade: какие среды существуют, как они отличаются, как продвигаются изменения между ними, как управляются secrets и конфигурация, как организованы release, rollback, background jobs, observability и operational safeguards.

Документ предназначен для DevOps, backend, frontend, Directus integrators, solution architect, QA, security и operations-команд.

## 2. Цели документа

Environment/deployment layer должен обеспечивать:

- предсказуемый путь изменений от разработки к production;
- безопасное хранение и использование secrets;
- разделение сред по уровню риска и назначению;
- повторяемый release process;
- возможность rollback и incident containment;
- согласованность с manual-review-first operating model.

## 3. Scope

Документ покрывает:

- environment model;
- deployment topology;
- configuration and secrets strategy;
- CI/CD principles;
- database and storage considerations;
- background jobs and scheduler deployment;
- release and rollback model;
- observability and operations hooks;
- production access model.

## 4. Core deployment principles

1. **Production must be isolated from lower environments.**
2. **Configuration must be environment-specific and centrally managed.**
3. **Secrets must never live in source code or ad hoc operator notes.**
4. **State-changing production actions must be auditable.**
5. **Release must be reversible or containable.**
6. **Provider integrations must support safe test vs production separation.**
7. **Operationally dangerous automations should default to controlled/manual mode until proven safe.**

## 5. Environment model

Рекомендуется использовать минимум следующие среды.

| Environment | Purpose |
|---|---|
| Local | Разработка и изолированная отладка |
| Dev | Интеграционная среда команды разработки |
| Staging | Pre-production validation, UAT, end-to-end verification |
| Production | Реальная клиентская и операционная среда |

При необходимости можно добавить `sandbox` для провайдерских интеграций или `demo` для non-production product showcases.

## 6. Environment responsibilities

### 6.1 Local

Используется для:

- frontend/backend/Directus feature development;
- schema iteration;
- local mocks/stubs;
- isolated debugging.

Local environment не должен иметь доступ к production secrets или production integrations.

### 6.2 Dev

Используется для:

- shared feature testing;
- integration between frontend, API, Directus, jobs;
- early verification of flows and permissions;
- QA smoke before staging.

Dev допускает synthetic test data, unstable branches и частые deployments.

### 6.3 Staging

Используется для:

- release candidate validation;
- realistic E2E regression;
- UAT;
- permissions review;
- incident/playbook rehearsal;
- document/notification testing on near-production config.

Staging должна быть максимально близка к production по topology и config shape, но без real customer traffic и без необратимых реальных финансовых действий.

### 6.4 Production

Используется для:

- live customer operations;
- live operator workflows;
- real payment/payout/provider interactions;
- authoritative business data and audit trail.

Любые изменения в production должны идти только через controlled deployment process.

## 7. High-level deployment topology

Рекомендуемая логическая topology:

- frontend application;
- backend/API layer;
- Directus instance;
- relational database;
- object/file storage;
- background workers / job runners;
- scheduler / queue processing;
- observability stack;
- secret/config management layer.

## 8. Component-by-component deployment notes

## 8.1 Frontend

Frontend должен деплоиться как отдельный artifact с environment-specific configuration.

### Requirements

- отдельные env values для API base URLs, auth config, feature flags, observability DSN, document URLs;
- build artifacts должны быть versioned;
- production deploy должен быть traceable to commit/release id;
- rollback должен быть быстрым.

## 8.2 Backend / API layer

Backend должен:

- использовать environment-specific config;
- быть stateless where possible;
- поддерживать horizontal replacement/restart без потери critical queue state;
- иметь controlled migration strategy;
- логировать deployment version/build id.

## 8.3 Directus

Directus environment должен быть разворачиваемым repeatably.

### Requirements

- schema, permissions, flows and extensions должны быть version-controlled;
- manual hotfixes в production Directus configuration должны быть исключением и аудироваться;
- policies, roles and flows changes должны проходить staging verification;
- custom extensions должны деплоиться как managed artifacts.

## 8.4 Database

Database strategy должна учитывать:

- environment isolation;
- migrations discipline;
- backup and restore procedures;
- access restriction by role;
- no shared production database access from lower environments.

## 8.5 Object storage / files

Storage должен поддерживать:

- separate buckets/containers per environment;
- controlled retention for uploads/documents/logical artifacts;
- protected access to KYC/payment/document files;
- non-production isolation от production customer files.

## 8.6 Background workers / jobs

Jobs layer должен быть выделен логически или физически так, чтобы:

- retries and processing were controllable;
- jobs could be paused during incidents;
- job version matched application/backend release where needed;
- queue lag and failures were observable.

## 9. Configuration strategy

### 9.1 Configuration classes

Рекомендуется разделить configuration на классы:

- public frontend config;
- application runtime config;
- provider integration config;
- security-sensitive secrets;
- operational feature flags;
- observability config.

### 9.2 Rules

- configuration values must be environment-scoped;
- production values должны управляться централизованно;
- default fallback values не должны silently включать dangerous behavior;
- critical runtime mode switches должны быть explicit.

## 10. Secrets management

Секреты включают:

- provider API keys;
- webhook signing secrets;
- Directus/admin credentials;
- database credentials;
- object storage credentials;
- email delivery credentials;
- observability ingestion tokens.

### Requirements

- secrets хранятся только в approved secrets manager / protected deployment system;
- secrets не коммитятся в repository;
- secrets не передаются через чат/таблицы/заметки;
- rotation path должен быть определен;
- доступ к production secrets — по least privilege;
- service accounts и humans не должны использовать общие credentials.

## 11. Data strategy by environment

### Dev / staging data principles

- использовать synthetic/anonymized data по умолчанию;
- не копировать production-sensitive files без formal process;
- KYC/payment evidence в lower environments должны быть тестовыми или sanitized;
- document/receipt generation в staging должна использовать test templates or safe watermarks if needed.

### Production data principles

- authoritative audit and business records only in production;
- direct bulk export access должен быть ограничен;
- support/ops tools должны respect field masking and role restrictions.

## 12. CI/CD principles

Pipeline должен обеспечивать:

- lint/test/build before deploy;
- migration review;
- environment-targeted deployments;
- artifact immutability where possible;
- release traceability;
- deploy approvals for staging/prod.

### Recommended flow

1. Commit / PR checks.
2. Build artifacts.
3. Deploy to dev.
4. Validate.
5. Promote release candidate to staging.
6. Execute regression/UAT/ops checks.
7. Controlled production deployment.

## 13. Migration strategy

Schema/data migrations должны:

- быть versioned;
- быть repeatable and reviewable;
- сначала проходить lower environments;
- иметь rollback/containment plan when possible;
- избегать unsafe production-time destructive changes без explicit plan.

### Special caution

Изменения, влияющие на orders, payments, documents, audit trails, permissions и queue processing, требуют повышенного review.

## 14. Feature flags and runtime modes

Feature flags особенно важны для manual-review-first модели.

### Recommended flags / switches

- manual vs automatic payment confirmation;
- manual vs automatic payout release;
- wallet provider integrations enabled/disabled;
- notification channel toggles;
- document auto-send toggles;
- queue processing pause/resume;
- incident/degraded mode banner;
- restricted rollout by cohort/segment.

### Rules

- критичные флаги должны быть documented;
- production flag changes должны быть auditable;
- dangerous flags не должны переключаться неуполномоченными ролями.

## 15. Release strategy

Рекомендуется использовать staged release model.

### Release steps

- validate artifact integrity;
- verify migrations plan;
- confirm environment config;
- deploy application/services;
- run smoke checks;
- verify queue processing and critical integrations;
- confirm observability signals;
- hand over to operations monitoring window.

## 16. Rollback and containment

Rollback strategy должна учитывать, что не все изменения можно откатить одинаково.

### Types of rollback/containment

- frontend rollback;
- backend artifact rollback;
- config rollback;
- feature-flag rollback;
- job pause/disable;
- provider integration disablement;
- transition to manual-review-only mode.

### Principle

Если code rollback опасен или insufficient, система должна уметь переходить в safe degraded mode.

## 17. Background processing and schedulers

Система должна явно выделять jobs such as:

- webhook ingestion follow-up;
- reconciliation jobs;
- notification delivery jobs;
- document generation/delivery jobs;
- timeout/expiration jobs;
- cleanup/archival tasks.

### Requirements

- каждый job должен иметь owner and observability;
- schedule должен быть documented;
- failed/retried state должен быть видим;
- critical jobs должны быть pausable.

## 18. Observability requirements for deployment

Каждый deployment должен быть видим в observability layer.

### Нужно логировать

- release id / build id;
- environment;
- deployed services/components;
- migration execution result;
- feature flag state for critical switches;
- deploy initiator or pipeline reference.

После deployment команда должна проверять:

- error rate;
- queue lag;
- provider callback health;
- document/notification failures;
- reconciliation anomalies.

## 19. Production access model

Production access должен быть строго ограничен.

### Principles

- least privilege;
- named accounts only;
- no shared admin users;
- separate access for humans vs service accounts;
- audited production changes;
- emergency access path documented separately.

### Recommended access classes

- read-only operational access;
- restricted deploy access;
- restricted database/admin access;
- break-glass emergency access with logging.

## 20. Backup and restore expectations

Backup strategy должна покрывать:

- database backups;
- document/file storage backup or redundancy model;
- restore testing;
- recovery ownership;
- retention by environment.

### Requirements

- restore procedure должна быть tested periodically;
- backup existence без restore validation недостаточна;
- production restore actions должны быть tightly controlled.

## 21. Incident / degraded mode deployment rules

Во время инцидента deployment policy может становиться строже.

### Examples

- freeze non-essential releases;
- disable risky automations;
- allow only incident-related hotfixes;
- require additional approver for prod changes;
- keep operations in manual-review-first mode until validation complete.

## 22. QA / staging expectations before production

Перед production release staging должна подтвердить минимум:

- auth and role flows;
- order creation and transitions;
- payment evidence path;
- wallet/requisites flow;
- payout hold/release path;
- notifications and document generation;
- permissions/policy behavior;
- observability and audit events;
- rollback/feature-flag safety for critical flows.

## 23. Open decisions to finalize

Перед production launch нужно утвердить:

- конкретную hosting topology;
- CI/CD platform/tooling choice;
- secrets manager choice;
- queue/job infrastructure choice;
- production change approval model;
- backup retention and restore RTO/RPO targets;
- exact degraded-mode feature flags.

## 24. Deliverables related to this spec

На базе этого документа рекомендуется подготовить:

- `test-strategy-and-qa-plan.md`
- `release-readiness-and-rollout-plan.md`
- `production-readiness-checklist.md`
- `business-continuity-and-dr-spec.md`
- `provider-capability-matrix.md`