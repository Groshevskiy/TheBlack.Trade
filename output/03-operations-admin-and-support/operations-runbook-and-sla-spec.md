## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Operations + Support
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `admin-console-ia-and-workspace-spec.md`
  - `incident-response-playbook.md`
- Related documents:
  - `support-communication-guidelines.md`
  - `compliance-and-legal-operations-spec.md`
  - `business-continuity-and-dr-spec.md`

# Operations Runbook & SLA Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает операционную модель сопровождения платформы TheBlack.Trade: ежедневные operational procedures, очереди обработки, SLA/SLI-подход, escalation rules и порядок действий для ключевых ручных сценариев.

Документ предназначен для operations, support, finance/settlement reviewers, compliance, product, QA и engineering-команд.

## 2. Цели документа

Документ нужен для того, чтобы:

- стандартизировать ежедневную работу операционной команды;
- определить очереди и приоритеты обработки;
- зафиксировать target SLA/SLI для ключевых этапов;
- определить порядок эскалации и handoff между ролями;
- снизить риск зависших платежей, payout и discrepancy cases;
- подготовить основу для масштабирования ручных и semi-automated процессов.

## 3. Scope

Документ покрывает:

- operational queues;
- daily review procedures;
- payment review handling;
- wallet/requisite verification handling;
- payout hold/release handling;
- discrepancy management workflow;
- SLA/SLO guidance;
- escalation and incident handoff rules;
- backlog/aging management.

Документ не заменяет detailed incident response playbook, но задает operational baseline для day-to-day execution.

## 4. Operating model overview

Для MVP рекомендуется manual-review-first operating model с разделением на несколько типов очередей и ролей.

### Core queue families

- incoming order review queue;
- payment confirmation review queue;
- wallet/requisite verification queue;
- payout hold / payout release queue;
- discrepancy & reconciliation queue;
- compliance escalation queue;
- failed notification / failed document delivery queue.

## 5. Core roles in operations

| Role | Основные задачи |
|---|---|
| Support operator | Первая линия, triage, коммуникация с пользователем, request_more_info |
| Operations reviewer | Стандартная проверка платежей, реквизитов, базовых hold/review кейсов |
| Senior operations reviewer | High-risk кейсы, исключения, approval escalation |
| Finance/settlement reviewer | Payout, settlement, reconciliation, duplicate risk |
| Compliance reviewer | Restriction/hold/fraud-sensitive кейсы |
| Engineering on-call | Технические инциденты, системные ошибки, data integrity / provider issues |

## 6. Queue model

Каждая queue должна иметь:

- owner role;
- entry criteria;
- priority model;
- target response time;
- escalation threshold;
- resolution actions;
- aging visibility.

## 6.1 Payment review queue

### Entry criteria

- пользователь отправил payment confirmation;
- provider result ambiguous;
- mismatch по сумме;
- payment callback inconsistent;
- expired or duplicate candidate case.

### Allowed actions

- confirm;
- reject;
- request_more_info;
- hold;
- escalate.

### Owner

Operations reviewer.

### Escalation

Senior operations или finance reviewer при mismatch, duplicate risk, late payment, unresolved reconcile.

## 6.2 Wallet / requisites verification queue

### Entry criteria

- ambiguous validation result;
- payout requisite требует ручной проверки;
- provider sync inconsistent;
- restricted destination;
- recently changed payout details.

### Owner

Operations reviewer.

### Escalation

Compliance reviewer или senior ops для denied/high-risk/high-value cases.

## 6.3 Payout hold / release queue

### Entry criteria

- payout prerequisites not met;
- payout pending release;
- provider unavailable;
- duplicate payout risk;
- manual payout approval required.

### Owner

Finance/settlement reviewer.

### Escalation

Senior ops + finance, либо compliance, если есть restriction flags.

## 6.4 Reconciliation & discrepancy queue

### Entry criteria

- mismatch detected;
- closure readiness blocked;
- external/internal inconsistency;
- duplicate movement suspicion;
- ledger incomplete case.

### Owner

Finance/settlement reviewer.

### Escalation

Engineering on-call — если suspected system fault; compliance — если suspicious pattern; senior ops — если нужен manual override.

## 6.5 Compliance queue

### Entry criteria

- restricted destination;
- fraud suspicion;
- repeated suspicious proofs;
- high-value case needing additional review;
- denied/blocked scenario needing decision.

### Owner

Compliance reviewer.

## 7. Priority model

Рекомендуется минимум четыре уровня приоритета.

| Priority | Meaning | Typical examples |
|---|---|---|
| P1 | Critical operational risk | duplicate payout risk, data integrity issue, critical discrepancy |
| P2 | High business impact | payout blocked, payment mismatch on active order |
| P3 | Standard operational review | обычный payment review, wallet review |
| P4 | Low urgency / backlog | non-blocking retry, low-severity cleanup |

## 8. SLA / SLI framework

На MVP лучше фиксировать не “абсолютные внешние обещания”, а внутренние operational target windows.

## 8.1 Core SLA/SLI dimensions

- time to first review;
- time to decision;
- time in hold state;
- payout release delay;
- discrepancy resolution time;
- failed notification/document follow-up time.

## 8.2 Suggested operational targets

| Queue / event | Target |
|---|---|
| Standard payment review first touch | within same operational window |
| High-priority payment mismatch | expedited / elevated priority |
| Wallet verification first touch | within same operational window |
| Payout hold review | faster than standard order queue |
| Critical discrepancy response | immediate / P1 response path |
| Failed payout follow-up | priority handling |
| Failed receipt/document delivery follow-up | within defined operational follow-up window |

Точные численные SLA можно зафиксировать после моделирования фактической нагрузки, штатного состава и provider behavior.

## 9. Daily operating procedures

## 9.1 Start-of-day checklist

Операционная команда должна:

1. проверить backlog всех queues;
2. выделить aged/high-priority cases;
3. проверить payout holds и unresolved discrepancies;
4. проверить failed provider interactions / callback anomalies;
5. проверить failed notification/document delivery queue;
6. зафиксировать, есть ли blocked completion or payout clusters.

## 9.2 Continuous queue handling

В течение операционного окна команда должна:

- triage новые кейсы;
- соблюдать priority order;
- эскалировать блокирующие кейсы без лишней задержки;
- не оставлять payout/discrepancy critical cases без owner;
- обновлять reason codes и notes по каждому manual decision.

## 9.3 End-of-day checklist

Команда должна:

- проверить незакрытые high/critical queues;
- назначить owners на перенесенные cases;
- выделить cases, требующие engineering/compliance follow-up;
- сверить stuck orders / payouts / discrepancies;
- зафиксировать operational notes для следующей смены/дня.

## 10. Runbook: payment review

### Procedure

1. Открыть order context.
2. Проверить payment record, provider reference и user proof.
3. Проверить reconciliation status.
4. Проверить risk flags.
5. Принять одно из allowed actions.
6. Зафиксировать reason code и notes.
7. Если нужно — инициировать request_more_info или escalation.

### Escalate when

- amount mismatch;
- duplicate match risk;
- provider success but internal inconsistency;
- late-arriving payment with unclear policy outcome.

## 11. Runbook: wallet / payout requisites verification

### Procedure

1. Проверить реквизит, сеть, memo/tag requirement.
2. Проверить validation status и provider sync context.
3. Проверить deny/risk flags.
4. Принять решение verify / reject / hold / escalate.
5. Зафиксировать decision metadata.

### Escalate when

- recently changed payout details near payout release;
- denied or suspicious destination;
- provider-linked details inconsistent.

## 12. Runbook: payout release

### Procedure

1. Проверить closure readiness summary.
2. Проверить reconciliation/discrepancy state.
3. Проверить payout destination verification.
4. Проверить duplicate payout risk.
5. Выполнить release / hold / escalate.
6. Логировать решение.

### Never release payout when

- unresolved high/critical discrepancy exists;
- destination not verified;
- provider status ambiguous enough to risk duplicate payout;
- compliance restriction active.

## 13. Runbook: discrepancy resolution

### Procedure

1. Открыть discrepancy case.
2. Сравнить internal/external evidence.
3. Проверить ledger completeness.
4. Определить severity and root cause class.
5. Решить: resolve, hold, adjust, escalate, reopen review.
6. Задокументировать решение.

### Escalate to engineering when

- missing system records;
- impossible state transition;
- idempotency/data integrity issue;
- suspicious repeated system inconsistency.

## 14. Backlog and aging management

Queues должны контролироваться не только по количеству, но и по age.

### Нужно отслеживать:

- aged payment reviews;
- aged payout holds;
- aged discrepancies;
- repeated retry cases without decision;
- orders blocked from completion beyond target window.

### Aging actions

- auto-highlight in admin UI;
- priority bump;
- forced escalation after threshold;
- shift handoff note requirement.

## 15. Handoff rules

При передаче кейса между ролями или сменами необходимо фиксировать:

- current state;
- why case is blocked;
- what evidence already checked;
- what next action is expected;
- urgency/priority;
- who is new owner.

Кейс без handoff note не должен считаться корректно переданным.

## 16. Communication rules

### With customers

- не обещать мгновенное подтверждение, если case в manual review;
- использовать state-accurate wording;
- не раскрывать внутренние compliance или fraud heuristics;
- при request_more_info clearly explain what is missing.

### Internal communications

- использовать reason codes и semantic labels;
- отделять confirmed facts от assumptions;
- не передавать payout-sensitive instructions вне approved systems.

## 17. Escalation matrix

| Trigger | Escalate to |
|---|---|
| Duplicate payout risk | Finance reviewer + senior ops |
| Critical discrepancy | Finance reviewer + engineering or compliance depending on root cause |
| Compliance restriction | Compliance reviewer |
| Data integrity / impossible state | Engineering on-call |
| High-value manual override | Senior ops + finance |
| Provider outage affecting active queue | Engineering on-call + ops lead |

## 18. Operational metrics

Команда operations должна регулярно смотреть:

- queue size by type;
- queue aging;
- average first-touch time;
- average resolution time;
- payout hold volume;
- discrepancy backlog;
- percent of orders entering manual review;
- failed document/receipt delivery count.

## 19. SLA exception handling

Иногда SLA target не может быть выдержан из-за provider outage, compliance hold или engineering issue.

### В таких случаях нужно:

- отметить case как SLA-exception;
- указать exception reason;
- указать owner;
- иметь customer communication policy, если это user-impacting delay;
- не маскировать operational issue под “обычную обработку”.

## 20. Tooling requirements

Operational tooling должно поддерживать:

- queue filtering by priority, age, risk, status;
- owner assignment;
- handoff notes;
- escalation actions;
- closure readiness and reconcile summaries;
- links to audit log, business events, provider callbacks;
- document/receipt delivery status visibility.

## 21. QA checklist

QA должна проверить:

- queue entry criteria срабатывают корректно;
- приоритет и aging logic отражаются в UI;
- payout release нельзя выполнить при blocking conditions;
- handoff notes сохраняются при передаче кейса;
- SLA-exception cases маркируются отдельно;
- reconciliation/discrepancy queue корректно связана с admin actions;
- failed document delivery queue работает для значимых customer documents;
- escalation routes доступны только нужным ролям.

## 22. Production readiness questions

Перед production launch должны быть уточнены:

- конкретные численные SLA по каждой queue;
- staffing model по operational windows;
- режим работы payout approvals;
- кто является owner для weekend/after-hours issues;
- какие thresholds считаются P1/P2;
- какие кейсы требуют dual approval;
- как обрабатываются массовые provider outages.

## 23. Следующие документы

На базе этой спецификации рекомендуется подготовить:

- `notification-event-matrix.md`
- `incident-response-playbook.md`
- `document-template-and-receipt-spec.md`
- `support-communication-guidelines.md`