## Document metadata

- Status: active
- Role: Audit/report
- Owner: Architecture + Product + QA
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `documentation-audit-and-reorganization-report.md`
- Related documents:
  - `canonical-documentation-governance-spec.md`
  - `acceptance-test-catalog.md`

# Documentation Index + Gap Matrix — TheBlack.Trade

## 1. Назначение документа

Этот документ является обновленным индексом проектной документации TheBlack.Trade и матрицей пробелов после повторного обзора всех markdown-документов в папке `output`. Он нужен как навигационный слой для product, architecture, backend, frontend, Directus, operations, compliance, QA и delivery-команд. [cite:59][cite:60][cite:61][cite:62]

## 2. Итог ревизии

Документация проекта уже покрывает большую часть MVP/production-design perimeter: product scope, domain model, state machines, API, Directus implementation, frontend architecture, UI/UX, payments, wallets, reconciliation, admin review, observability, compliance, operations, notifications, documents, incident response и support communication. [cite:53][cite:59][cite:60][cite:61][cite:62]

По совместимости текущий набор выглядит в целом согласованным: большинство документов опираются на одну и ту же manual-review-first модель, controlled actions/service layer, append-only audit, event-driven notifications и разделение customer-facing и internal states. [cite:54][cite:57][cite:61][cite:62] Основные gaps сейчас сместились не в “отсутствие базовой архитектуры”, а в недоописанные delivery/production artifacts: rollout planning, environment strategy, testing strategy, provider capability comparison, BI/reporting layer и release governance. [cite:61][cite:62]

## 3. Совместимость и полнота

### 3.1 Что уже согласовано

| Area | Status | Evidence |
|---|---|---|
| Core business scope | Covered | Базовое ТЗ, solution architecture, domain docs согласованы вокруг buy/sell crypto, Russian market focus, personal account, notifications и receipts. [conversation_history:1][cite:62] |
| Canonical order lifecycle | Mostly aligned | `theblack-trade-order-state-machine-spec.md`, `transaction-status-state-machine-spec.md`, `order-domain-model-spec.md`, `frontend-state-machine-spec.md` и admin review docs описывают единый lifecycle с manual review и controlled transitions. [cite:60][cite:61][cite:62] |
| Directus realization | Strong | Есть data model, field matrix, flows/extensions spec, implementation blueprint и permissions matrix, включая обновленный admin role extension. [cite:53][cite:60][cite:61][cite:62] |
| Payment / payout / wallet flows | Strong | Отдельно описаны payment provider integration, wallet/exchange integrations, reconciliation/ledger и review/operations specs. [cite:61][cite:62] |
| Communications layer | Strong | Есть notification event matrix, email content spec, RU localization, screen-by-screen copy и support communication guidelines. [cite:60][cite:61] |
| Operations / control plane | Strong | Есть admin review matrix, compliance spec, observability, runbook/SLA, incident playbook, document/receipt model. [cite:60][cite:61] |

### 3.2 Где есть частичная избыточность

| Topic | Observation | Recommendation |
|---|---|---|
| State machines | Есть несколько документов: order state machine, transaction status state machine, frontend state machine, admin review matrix. [cite:60][cite:61][cite:62] | Зафиксировать `theblack-trade-order-state-machine-spec.md` как canonical backend/business lifecycle, а остальные трактовать как projections. |
| Directus model docs | Есть data model spec, field matrix, blueprint, flows/extensions и permissions matrix. [cite:60][cite:61][cite:62] | Оставить, но явно обозначить, какой документ отвечает за collections, какой за fields, какой за automation, какой за roles/policies. |
| UX copy docs | Есть RU localization, screen-by-screen copy, email content, support communication guidelines. [cite:61] | Формально разделить UI copy, email copy и live-agent wording как три разные source-of-truth зоны. |

### 3.3 Где остаются неполные зоны

| Gap area | Why incomplete | Impact |
|---|---|---|
| Environment & deployment strategy | Нет отдельного spec по envs, secrets, staging, production topology, release promotion. [cite:62] | Высокий: без этого реализация и rollout будут неуправляемыми. |
| Testing strategy | Нет единого QA/test strategy по unit/integration/e2e/UAT/non-functional/incident simulation. [cite:59][cite:61][cite:62] | Высокий: сложно превратить набор specs в acceptance-ready delivery plan. |
| Provider capability matrix | Есть integration specs, но нет отдельной сравнительной матрицы требований к платежным/кошельковым/биржевым провайдерам. [cite:61][cite:62] | Средний/высокий: затрудняет vendor selection и phased rollout. |
| BI / analytics / reporting | Нет отдельного analytics instrumentation / KPI / admin reporting spec. [cite:61] | Средний: не хватает продуктовой и операционной отчетности. |
| Backoffice information architecture | Есть permissions и runbooks, но нет отдельного admin console IA / queue layout / operator workspace spec. [cite:48][cite:58] | Средний: может привести к фрагментарной реализации админки. |
| Release readiness & rollout governance | Нет отдельного production readiness checklist и phased rollout plan. [cite:61] | Высокий: критично перед launch. |
| Data retention / archival execution | Compliance и observability задают принципы, но нет отдельного archival/purge execution spec. [cite:46][cite:47] | Средний. |
| Fraud/risk rulebook | Есть compliance holds и review governance, но нет явного risk scoring / fraud signals catalog. [cite:47][cite:48][cite:51] | Средний/высокий при росте объема операций. |

## 4. Documentation index

### 4.1 Foundation and scope

| File | Purpose | Status | Source-of-truth role |
|---|---|---|---|
| `tz-dlya-razrabotki-theblack-trade.md` | Базовое ТЗ | Active | Business scope baseline [cite:62] |
| `theblack-trade-solution-architecture-and-technical-specification.md` | High-level architecture | Active | Master overview / executive architecture [cite:62] |
| `documentation-audit-and-reorganization-report.md` | Навигация и gaps | Active | Documentation governance [cite:60][cite:61][cite:62] |

### 4.2 Domain and lifecycle

| File | Purpose | Status | Source-of-truth role |
|---|---|---|---|
| `order-domain-model-spec.md` | Canonical business entities | Active | Domain model [cite:61] |
| `theblack-trade-order-state-machine-spec.md` | Order lifecycle | Active | Canonical backend/business state machine [cite:62] |
| `transaction-status-state-machine-spec.md` | Detailed transactional status decomposition | Active | Supporting substatus model [cite:62] |
| `admin-review-decision-matrix.md` | Review decisions and evidence | Active | Manual decision logic [cite:60] |
| `reconciliation-and-ledger-spec.md` | Financial consistency layer | Active | Ledger/reconciliation SoT [cite:61] |

### 4.3 Integrations and API

| File | Purpose | Status | Source-of-truth role |
|---|---|---|---|
| `theblack-trade-api-contract-spec.md` | API surface | Active | External/internal API contract [cite:61] |
| `payment-provider-and-payout-integration-spec.md` | Fiat payment/payout logic | Active | Payment/payout integration SoT [cite:61] |
| `wallet-and-exchange-provider-integration-spec.md` | Wallet/exchange connection model | Active | Wallet/provider integration SoT [cite:62] |
| `frontend-integration-spec.md` | Frontend-to-backend bindings | Active | UI integration contract projection [cite:60] |
| `error-catalog-and-api-ui-mapping-spec.md` | Error semantics across API/UI | Active | Error handling SoT [cite:60] |

### 4.4 Directus implementation

| File | Purpose | Status | Source-of-truth role |
|---|---|---|---|
| `directus-data-model-spec.md` | Collection-level data model | Active | Directus collection structure [cite:60] |
| `theblack-trade-directus-field-matrix.md` | Field-level schema | Active | Directus field SoT [cite:61] |
| `theblack-trade-directus-flows-and-extensions-spec.md` | Automation and extensions | Active | Directus automation/runtime behavior [cite:61] |
| `theblack-trade-directus-implementation-blueprint.md` | Directus realization guide | Active | Delivery/implementation blueprint [cite:62] |
| `theblack-trade-directus-permissions-matrix.md` | Roles and policies | Active | Access-control SoT [cite:53][cite:54][cite:58] |

### 4.5 Frontend, UX and design

| File | Purpose | Status | Source-of-truth role |
|---|---|---|---|
| `screen-and-route-spec.md` | App route map | Active | Routing SoT [cite:61] |
| `annotated-wireframe-spec.md` | Wireframe annotations | Active | UX structure reference [cite:60] |
| `design-system-ui-kit-spec.md` | Visual system | Active | Design foundations [cite:60] |
| `figma-ready-component-inventory-spec.md` | Design inventory | Active | Figma handoff planning [cite:60] |
| `component-architecture-spec.md` | Frontend component decomposition | Active | UI architecture [cite:60] |
| `frontend-state-machine-spec.md` | Client runtime states | Active | Frontend state projection [cite:60] |
| `screen-by-screen-ux-copy-spec.md` | UI microcopy | Active | UI copy SoT [cite:61] |
| `ru-localization-ux-copy-spec.md` | Russian localization rules | Active | RU terminology/translation SoT [cite:61] |

### 4.6 Notifications, documents and communication

| File | Purpose | Status | Source-of-truth role |
|---|---|---|---|
| `notification-event-matrix.md` | Business event → notification mapping | Active | Notification trigger SoT [cite:61] |
| `email-notification-content-spec.md` | Email templates/content rules | Active | Email copy SoT [cite:60] |
| `document-template-and-receipt-spec.md` | Documents/receipts lifecycle | Active | Document model SoT [cite:60] |
| `support-communication-guidelines.md` | Human support wording | Active | Live support communication SoT [cite:61] |

### 4.7 Controls, operations and resilience

| File | Purpose | Status | Source-of-truth role |
|---|---|---|---|
| `compliance-and-legal-operations-spec.md` | Compliance/legal operations | Active | Compliance operations SoT [cite:60] |
| `observability-and-audit-spec.md` | Logs, metrics, traces, auditability | Active | Observability/Audit SoT [cite:61] |
| `operations-runbook-and-sla-spec.md` | Day-to-day queue operations | Active | Operations runbook SoT [cite:61] |
| `incident-response-playbook.md` | Incident handling | Active | Incident response SoT [cite:61] |

## 5. Recommended source-of-truth map

### 5.1 Canonical hierarchy

1. **Business scope** → `tz-dlya-razrabotki-theblack-trade.md` + `theblack-trade-solution-architecture-and-technical-specification.md`. [cite:62]
2. **Canonical domain and lifecycle** → `order-domain-model-spec.md` + `theblack-trade-order-state-machine-spec.md`. [cite:61][cite:62]
3. **Transactional detail** → `transaction-status-state-machine-spec.md` + `reconciliation-and-ledger-spec.md`. [cite:61][cite:62]
4. **API and integration behavior** → `theblack-trade-api-contract-spec.md`, integration specs and error catalog. [cite:60][cite:61][cite:62]
5. **Directus implementation** → data model + field matrix + flows/extensions + permissions matrix. [cite:60][cite:61][cite:62]
6. **Frontend projection** → route spec + wireframes + component architecture + frontend integration/state machine + copy docs. [cite:60][cite:61]
7. **Operational control plane** → admin review, compliance, observability, runbook, incident playbook, notifications, documents, support communication. [cite:60][cite:61]

### 5.2 Interpretation rules

- Если статусы в UI-документе расходятся с backend lifecycle, приоритет у `theblack-trade-order-state-machine-spec.md`. [cite:62]
- Если поле существует в нескольких Directus-документах, field-level priority у `theblack-trade-directus-field-matrix.md`, а collection-level behavior — у `directus-data-model-spec.md`. [cite:60][cite:61]
- Если wording расходится между email, UI и support, каждый канал должен использовать собственный copy document, но business event source остается в `notification-event-matrix.md`. [cite:60][cite:61]
- Если operational action спорит с generic collection access, приоритет у controlled actions, permissions matrix и runbook/compliance specs. [cite:54][cite:58] |

## 6. Updated gap matrix

| Gap / missing deliverable | Priority | Why needed now | Recommended artifact |
|---|---|---|---|
| Environment & Deployment Spec | Critical | Нужны dev/stage/prod topology, secrets, release promotion, backups, DR, job scheduling | `environment-and-deployment-spec.md` |
| Test Strategy & QA Plan | Critical | Нужен единый test model: unit, integration, e2e, UAT, non-functional, regression, incident simulations | `test-strategy-and-qa-plan.md` |
| Release Readiness & Rollout Plan | Critical | Нужен phased launch plan с feature flags, pilot cohorts, rollback conditions, success metrics | `release-readiness-and-rollout-plan.md` |
| Provider Capability Matrix | High | Нужна формальная матрица требований и сравнения payment/wallet/exchange providers | `provider-capability-matrix.md` |
| Production Readiness Checklist | High | Нужен go-live checklist across product, ops, support, compliance, finance, engineering | `production-readiness-checklist.md` |
| Admin Console IA / Backoffice Workspace Spec | High | Админ-потоки описаны, но не собраны в единый UX/information architecture spec | `admin-console-ia-and-workspace-spec.md` |
| Analytics & Reporting Spec | High | Не хватает KPI events, funnel model, admin reporting, ops dashboards, finance BI requirements | `analytics-and-reporting-spec.md` |
| Fraud Signals & Risk Rules Spec | High | Compliance есть, но нет формальной модели risk signals, scoring and action thresholds | `fraud-signals-and-risk-rules-spec.md` |
| Data Retention & Archival Execution Spec | Medium | Принципы retention есть, но нет исполнимой модели archive/purge/export/legal hold | `data-retention-and-archival-spec.md` |
| Business Continuity / DR Spec | Medium | Для payout/payment platform полезно описать degraded modes and recovery objectives | `business-continuity-and-dr-spec.md` |

## 7. Recommended update actions for existing docs

| Existing file | Update needed | Reason |
|---|---|---|
| `theblack-trade-order-state-machine-spec.md` | Minor | Явно отметить canonical status names и mapping на customer/internal/projection layers. [cite:62] |
| `transaction-status-state-machine-spec.md` | Minor | Добавить explicit mapping to canonical order states to reduce overlap. [cite:62] |
| `directus-data-model-spec.md` | Medium | Проверить, что новые сущности (`document_records`, `notification_logs`, `incident_records`, `compliance_holds`, `discrepancy_cases`) зафиксированы как first-class collections или projections. [cite:58][cite:60] |
| `theblack-trade-directus-field-matrix.md` | Medium | Добавить поля новых operational collections и maker-checker metadata. [cite:58][cite:61] |
| `theblack-trade-api-contract-spec.md` | Medium | Проверить наличие endpoints для document resend/reissue, incidents, compliance holds, discrepancy actions и operational queues. [cite:47][cite:50][cite:51][cite:58][cite:61] |
| `screen-and-route-spec.md` | Medium | Добавить admin/backoffice route coverage, если админка в scope того же frontend perimeter. [cite:61] |
| `annotated-wireframe-spec.md` | Medium | Добавить backoffice/workbench screens или явно отметить, что документ covers only customer UI. [cite:60] |
| `email-notification-content-spec.md` | Minor | Проверить полное покрытие событий из `notification-event-matrix.md`. [cite:49][cite:60] |

## 8. Delivery sequence recommendation

### 8.1 Следующие документы в первую очередь

1. `environment-and-deployment-spec.md` [cite:62]
2. `test-strategy-and-qa-plan.md` [cite:59][cite:62]
3. `release-readiness-and-rollout-plan.md` [cite:61]
4. `provider-capability-matrix.md` [cite:61][cite:62]
5. `production-readiness-checklist.md` [cite:61]

### 8.2 После этого

- `admin-console-ia-and-workspace-spec.md`; [cite:48][cite:58]
- `analytics-and-reporting-spec.md`; [cite:61]
- `fraud-signals-and-risk-rules-spec.md`; [cite:47][cite:51]
- `data-retention-and-archival-spec.md`. [cite:46][cite:47]

## 9. Вывод

Повторный обзор показывает, что документационный пакет TheBlack.Trade уже перешел из стадии “набора разрозненных требований” в стадию почти полного implementation program для MVP+operations-ready платформы. [cite:59][cite:60][cite:61][cite:62] Главные оставшиеся пробелы находятся в productionization, testing, rollout governance, provider evaluation и admin/backoffice consolidation, а не в core product/domain architecture. [cite:61][cite:62]