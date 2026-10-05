## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Operations + Product + Design
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `admin-permission-hardening-spec.md`
  - `admin-ui-control-state-map.md`
- Related documents:
  - `admin-review-decision-matrix.md`
  - `operations-runbook-and-sla-spec.md`
  - `support-communication-guidelines.md`

# Admin Console IA & Workspace Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает информационную архитектуру (IA) и рабочие пространства (workspaces) административной консоли TheBlack.Trade. Он определяет, как должны быть организованы backoffice-разделы, очереди, карточки сущностей, действия операторов, маршруты навигации, фильтры, escalation surfaces и cross-domain context для operations, support, compliance, finance и admin-команд.

Документ предназначен для product, UX, frontend, backend, Directus integrators, operations, compliance, finance и support.

## 2. Цели документа

Admin console должна обеспечивать:

- быстрый доступ к очередям и сущностям с высоким операционным приоритетом;
- безопасное выполнение role-bound действий;
- достаточный контекст для принятия решения без лишних переключений;
- единый pattern для review, hold, approve, reject, escalate, reissue и investigate действий;
- прозрачность audit trail, notification history, document history и финансового статуса;
- масштабируемую IA при росте команд и объема операций.

## 3. Scope

Документ покрывает:

- top-level navigation;
- workspace model;
- queue model;
- entity detail workspaces;
- search/filter/saved views;
- action surfaces and guardrails;
- role-based workspace visibility;
- cross-linking between orders, payments, documents, users and incidents.

## 4. Core IA principles

1. **Queues first, entities second.** Пользователь админки обычно приходит для выполнения работы, а не для “просмотра базы”.
2. **Decision context must be assembled in one place.**
3. **Sensitive actions must be explicit, gated and auditable.**
4. **Each role sees a purposeful workspace, not generic system clutter.**
5. **Statuses, evidence and next actions must be visible above the fold.**
6. **Cross-domain traceability is mandatory for orders, payments, payouts, KYC and documents.**

## 5. Primary admin personas

| Persona | Main goals |
|---|---|
| Operations agent | Process payment/order/requisite queues quickly and safely |
| Support agent | Explain statuses, handle customer issues, escalate correctly |
| Compliance reviewer | Review KYC, restrictions, suspicious patterns, holds |
| Finance/settlement operator | Validate payout/payment correctness and reconciliation issues |
| Admin lead / supervisor | Monitor workload, SLA exceptions, escalations, quality |
| Platform admin | Manage configuration, roles, feature controls, system state |

## 6. Top-level navigation model

Рекомендуемая top-level навигация:

- Dashboard
- Queues
- Orders
- Payments
- Payouts
- Customers
- Wallets & Requisites
- KYC & Compliance
- Documents
- Notifications
- Reconciliation
- Incidents
- Reports
- Settings / Admin

Точный состав пунктов может зависеть от role visibility и rollout stage.

## 7. Recommended workspace architecture

Admin console рекомендуется строить по модели из трех слоев:

1. **Operational dashboards** — high-level состояние системы и workload.
2. **Queues / worklists** — место, где выполняется основная обработка.
3. **Entity workspaces** — подробные карточки order/payment/payout/customer/document/etc.

## 8. Dashboard workspace

### Purpose

Показать текущее состояние операций и быстро направить пользователя в нужную очередь.

### Recommended sections

- queue health summary;
- pending reviews by type;
- SLA risk / aging blocks;
- payout/payment anomalies;
- incidents / degraded mode banners;
- notification/document failures;
- reconciliation discrepancy counters;
- recent critical events.

### Dashboard behavior

- должен быть role-aware;
- приоритетные блоки зависят от persona;
- все counters должны кликаться и вести в filtered queue/view.

## 9. Queues workspace

### Purpose

Queues — главный operational workspace системы.

### Recommended queue families

- payment review queue;
- payout release queue;
- wallet / requisites verification queue;
- KYC review queue;
- discrepancy / reconciliation queue;
- notification/document failure queue;
- support escalation queue;
- compliance hold queue;
- incident follow-up queue.

### Queue layout

Каждая queue screen должна иметь:

- summary counters;
- tabs or segmented views by state/priority;
- advanced filters;
- sort options;
- saved views;
- bulk-safe actions only where policy permits;
- row-level indicators for severity, age, risk, escalation, notes.

## 10. Queue row design

Каждая строка queue должна показывать минимум:

- entity id / public reference;
- current state;
- reason / queue cause;
- age and SLA proximity;
- customer name / masked identity where appropriate;
- amount / asset / method where relevant;
- risk/escalation markers;
- last action / assignee summary.

### Quick actions

Quick actions допустимы только для безопасных действий, например:

- assign to me;
- open detail;
- add note;
- acknowledge;
- move to review.

Approve/reject/release actions should normally happen in entity detail context, not from the list row, если policy не разрешает иначе.

## 11. Entity workspace model

Каждая ключевая сущность должна иметь полноценную detail workspace/card.

### Core entity workspaces

- Order workspace
- Payment workspace
- Payout workspace
- Customer workspace
- Wallet/Requisite workspace
- KYC application workspace
- Document workspace
- Notification workspace
- Discrepancy case workspace
- Incident workspace

## 12. Universal entity page structure

Рекомендуемая структура detail workspace:

1. Header summary
2. Current state and next actions
3. Core facts panel
4. Evidence / attachments / linked artifacts
5. Timeline / audit trail
6. Related entities
7. Action panel
8. Internal notes / collaboration

### Header summary should include

- entity reference;
- customer reference where applicable;
- current status;
- severity/risk badge;
- last update timestamp;
- current assignee or queue state.

## 13. Order workspace

Order workspace должен быть центральным узлом для бизнеса.

### Must show

- order type (buy/sell);
- quote summary;
- amount/asset/rate context;
- payment status;
- payout/transfer status;
- prerequisite flags (KYC, wallet verification, compliance hold);
- customer-facing status projection;
- linked documents/notifications;
- linked discrepancy or incident markers.

### Actions

- move to next allowed state;
- request info;
- approve/reject review step;
- place/remove hold where permitted;
- escalate to compliance/finance/support;
- re-trigger allowed side effects (document/notification) under policy.

## 14. Payment workspace

### Must show

- internal payment record;
- provider reference;
- expected vs received amount;
- submitted evidence;
- callback/polling status history;
- review notes;
- reconciliation linkage;
- fraud/risk/compliance flags.

### Actions

- approve payment evidence;
- reject with reason;
- request additional evidence;
- escalate discrepancy;
- mark for finance/compliance follow-up.

## 15. Payout workspace

### Must show

- payout target/requisites;
- payout amount and method;
- hold/release state;
- provider or manual execution details;
- duplicate-risk signals;
- operator and finance notes;
- reconciliation status.

### Actions

- prepare for release;
- approve/release where allowed;
- pause/freeze;
- reject/return to investigation;
- escalate payout anomaly.

## 16. Customer workspace

### Must show

- identity and profile summary;
- KYC status;
- active/recent orders;
- saved wallets/requisites;
- support history;
- restrictions/holds;
- document and notification history;
- suspicious or escalated markers.

### Purpose

Customer workspace должен собирать контекст across all customer-affecting domains, не требуя ручного поиска по разным разделам.

## 17. Wallet & Requisites workspace

### Must show

- type of destination/source;
- linked customer;
- verification state;
- validation results;
- change history;
- linked orders;
- rejection reasons if any.

### Actions

- verify;
- reject with reason;
- request correction;
- lock/unlock where policy allows.

## 18. KYC & Compliance workspace

### KYC section should show

- application status;
- provider/manual evidence;
- submitted documents;
- decision reasons;
- remediation / resubmission history.

### Compliance section should show

- active restrictions and holds;
- reason category;
- review owner;
- linked orders/payments/payouts;
- case notes;
- required next steps.

### Actions

- approve/reject KYC where allowed;
- request remediation;
- open/close hold;
- escalate suspicious case;
- mark case for enhanced monitoring.

## 19. Documents workspace

### Must show

- document type;
- generation trigger;
- entity/customer linkage;
- delivery state;
- version or reissue lineage;
- download/access state;
- failure reason if any.

### Actions

- re-send;
- re-issue where policy allows;
- inspect payload snapshot;
- escalate delivery failure.

## 20. Notifications workspace

### Must show

- notification event;
- channel;
- template/version;
- delivery state;
- recipient summary;
- retry/suppression history;
- linked business entity.

### Actions

- retry send where allowed;
- suppress/freeze category in incident mode;
- inspect payload and reason.

## 21. Reconciliation workspace

### Must show

- discrepancy type;
- related order/payment/payout/provider refs;
- ledger impact;
- open owner;
- aging;
- resolution attempts;
- closure blockers.

### Actions

- mark under investigation;
- assign owner;
- attach findings;
- resolve with reason;
- reopen if re-triggered by policy.

## 22. Incidents workspace

### Must show

- incident severity and state;
- affected domains/providers;
- start time / current owner;
- mitigation status;
- linked queues and customer impact;
- communication actions taken.

### Purpose

Позволить operations/support/compliance быстро понимать, что происходит, какие функции ограничены и какие очереди должны обрабатываться в special mode.

## 23. Reports workspace

Reports section рекомендуется строить вокруг practical operational insights, а не generic BI menu.

### Suggested report groups

- queue throughput and aging;
- approval/rejection reasons;
- payout/payment operational quality;
- discrepancy/reconciliation trends;
- support and incident trends;
- notification/document delivery quality.

## 24. Search and global discovery

Global search должна поддерживать поиск по:

- order id / public reference;
- payment / payout provider reference;
- customer id / email / phone where allowed;
- wallet/address fragment where policy allows;
- document reference;
- incident id;
- note/comment keywords where appropriate.

### Search behavior

- результаты должны быть grouped by entity type;
- privileged data должна маскироваться согласно роли;
- search results должны позволять fast jump в entity workspace.

## 25. Filters and saved views

### Mandatory filter types

- status/state;
- age / SLA risk;
- provider / payment method / asset / network;
- assigned/unassigned;
- escalation/risk/compliance flags;
- date range;
- issue category / rejection reason.

### Saved views

Нужны для повторяемой operational работы, например:

- “My queue”;
- “Aging > SLA threshold”;
- “High-value sell payouts awaiting release”;
- “Document delivery failures”;
- “Compliance holds opened today”.

## 26. Action design and guardrails

Sensitive actions должны выполняться через явные action panels/modals.

### Required action safeguards

- clear action label;
- visible consequences;
- required reason code where applicable;
- optional/required note field;
- validation of preconditions;
- audit logging;
- role/permission enforcement;
- second-step confirmation for irreversible or risky actions.

## 27. Notes, collaboration and handoffs

Каждая сущность с review workflow должна поддерживать internal notes.

### Notes model should support

- structured handoff notes;
- freeform investigation context;
- tagged escalation notes;
- visibility rules by role if needed;
- timestamp and author traceability.

## 28. Role-based workspace visibility

### Operations

Видит queues, order/payment/payout detail, wallet/requisite review, operational dashboards.

### Support

Видит customer-safe statuses, support history, document/notification state, ограниченный operational context, но не обязательно все sensitive finance/compliance fields.

### Compliance

Видит KYC, restrictions, evidence, holds, escalations, linked business records.

### Finance

Видит payout/payment/reconciliation context и ограниченно customer/legal context, необходимый для финансовых решений.

### Admin / supervisor

Видит cross-domain workload, quality, escalations, config surfaces по своей зоне ответственности.

## 29. Workspace routing model

Recommended routing structure:

- `/admin/dashboard`
- `/admin/queues/:queueType`
- `/admin/orders/:id`
- `/admin/payments/:id`
- `/admin/payouts/:id`
- `/admin/customers/:id`
- `/admin/wallets/:id`
- `/admin/kyc/:id`
- `/admin/documents/:id`
- `/admin/notifications/:id`
- `/admin/reconciliation/:id`
- `/admin/incidents/:id`
- `/admin/reports/:reportKey`
- `/admin/settings/:area`

## 30. Mobile and responsive expectations

Admin console primary target — desktop/tablet. Однако минимальная responsive support нужна для:

- supervisor review of queue health;
- support lookup during incident;
- urgent incident banner visibility;
- basic approve/assign/escalate actions where policy permits.

Complex financial/compliance actions should prefer desktop-optimized workspace.

## 31. Integration with Directus and custom surfaces

Если Directus используется как administrative foundation, нужно явно разделить:

- direct collection management surfaces;
- curated operational workspaces;
- controlled action endpoints/services;
- reporting and incident overlays.

### Principle

Generic CRUD screens alone недостаточны для production operations. Для ключевых очередей и review actions нужны task-oriented custom workspaces.

## 32. Open decisions to finalize

Перед детальным UI design / build нужно утвердить:

- какие admin workspaces реализуются в custom frontend, а какие в Directus-native surfaces;
- нужна ли единая админка или несколько role-focused entry points;
- какие actions требуют dual control;
- какие поля должны быть masked for support/ops;
- какие queues допускают bulk actions;
- какие reports обязательны в MVP.

## 33. Related documents

Использовать вместе с:

- `theblack-trade-directus-permissions-matrix.md`
- `admin-review-decision-matrix.md`
- `operations-runbook-and-sla-spec.md`
- `compliance-and-legal-operations-spec.md`
- `reconciliation-and-ledger-spec.md`
- `incident-response-playbook.md`
- `screen-and-route-spec.md`
- `annotated-wireframe-spec.md`