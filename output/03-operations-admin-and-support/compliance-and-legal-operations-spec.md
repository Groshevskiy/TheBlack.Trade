## Document metadata

- Status: active
- Role: Companion spec
- Owner: Compliance + Operations
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `data-retention-and-archival-spec.md`
  - `field-level-sensitivity-and-masking-matrix.md`
- Related documents:
  - `legal-terms-privacy-notice-and-customer-disclosure-pack.md`
  - `sanctions-travel-rule-and-transaction-monitoring-operations-spec.md`
  - `privacy-and-data-subject-rights-operations-spec.md`
  - `incident-response-playbook.md`
  - `operations-runbook-and-sla-spec.md`

# Compliance & Legal Operations Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает product/operations-oriented требования к compliance и legal operations для платформы TheBlack.Trade, ориентированной на клиентов из России.

Документ предназначен для product, operations, backend, frontend, QA, support, compliance, finance и legal stakeholders.

Спецификация задает не юридическое заключение, а implementation-facing рамку: какие данные и процессы должны быть предусмотрены в системе, какие действия требуют traceability, какие уведомления и документы должны формироваться, и какие операционные ограничения должны соблюдаться.

## 2. Scope

Документ покрывает:

- compliance-sensitive data handling;
- legal/operational traceability;
- manual-review-first governance;
- receipt/check issuance requirements at product level;
- consent and policy acknowledgement flows;
- retention and audit-readiness guidance;
- operator restrictions and escalation triggers.

Документ не заменяет formal legal advice и должен уточняться с профильным юристом и бухгалтерским/налоговым консультантом до production launch.

## 3. Основные цели compliance/legal layer

Платформа должна обеспечивать:

- прозрачность ключевых условий для пользователя;
- доказуемость пользовательских действий и операторских решений;
- формирование и хранение значимых артефактов по операции;
- поддержку чеков/подтверждающих документов в предусмотренных сценариях;
- управляемое хранение данных и истории изменений;
- снижение риска несанкционированных действий и непрозрачных выплат.

## 4. Compliance design principles

1. **Каждое финансово значимое действие должно быть объяснимо и трассируемо.**
2. **Нельзя опираться только на устные договоренности или неструктурированные комментарии.**
3. **Пользователь должен видеть ключевые условия до подтверждения действия.**
4. **Manual-review-first режим должен быть встроен в governance model.**
5. **Ограничения и блокировки должны иметь formal reason codes.**
6. **Документы и уведомления должны быть воспроизводимы постфактум.**

## 5. Core compliance/legal domains

| Domain | Что регулирует |
|---|---|
| Identity & customer data | Какие пользовательские данные собираются и как хранятся |
| Transaction evidence | Какие подтверждения операции сохраняются |
| Order consent | Как фиксируется согласие пользователя с условиями |
| Operator governance | Кто может принимать критичные решения |
| Receipt/document issuance | Когда и как формируются чеки/подтверждения |
| Audit & retention | Какие данные и как долго должны быть доступны |
| Restrictions & escalations | Когда операция блокируется или уходит в ручной review |

## 6. Customer-facing legal checkpoints

В пользовательском потоке должны быть явно зафиксированы ключевые legal/compliance checkpoints.

## 6.1 Pre-submit disclosure

До создания или подтверждения заявки пользователь должен видеть по крайней мере:

- направление операции;
- сумму и валюту;
- курс/механику расчета, если применимо;
- сеть/актив/реквизиты получения или отправки;
- предупреждение о рисках ошибки в адресе/сети;
- статус того, что операция может требовать ручной проверки;
- ссылки на terms/policy/consent text.

## 6.2 Explicit acknowledgement

Система должна фиксировать явное действие пользователя, подтверждающее, что он:

- согласен с условиями операции;
- подтвердил корректность введенных реквизитов;
- понимает последствия ошибки сети/адреса;
- согласен с тем, что заявка может быть отправлена в ручную проверку.

## 6.3 Proof of acceptance

Факт принятия условий должен быть доказуем.

### Recommended fields

- `consent_version`
- `consent_type`
- `accepted_at`
- `order_id`
- `user_id`
- `ip_hash_or_equivalent`, если policy разрешает
- `user_agent_snapshot`, если policy разрешает
- `ui_surface`

## 7. Customer data model guidance

Платформа должна иметь формальную модель чувствительных и операционно значимых данных.

## 7.1 Data groups

| Data group | Examples | Notes |
|---|---|---|
| Account/profile data | Email, phone, user profile | Standard customer data |
| Transaction data | Order amounts, currencies, statuses | Business-critical |
| Payment evidence | Payment references, provider refs, proofs | Financial/compliance-sensitive |
| Wallet/payout details | Addresses, requisites, networks | Sensitive operational data |
| Operator decisions | Notes, reason codes, approvals | Audit-critical |
| Generated documents | Receipts, confirmations, emails | Must be reproducible |

## 7.2 Handling principles

- собирать только необходимые данные;
- различать reusable profile data и order-specific snapshot data;
- маскировать чувствительные реквизиты в UI и логах, где полный вывод не нужен;
- хранить исторические snapshots там, где это нужно для доказуемости сделки.

## 8. Order evidence model

Для каждой заявки должен существовать достаточный evidence package.

### Evidence package should include, when applicable:

- order snapshot at confirmation time;
- payment instruction snapshot;
- user payment confirmation;
- provider references and callback results;
- wallet/payout snapshot;
- exchange execution summary;
- payout/settlement summary;
- operator review actions;
- discrepancy/resolution trail;
- emitted customer notifications;
- generated receipt or equivalent transaction document.

## 9. Manual-review-first governance

Так как для платформы предусмотрен ручной контроль на старте, compliance layer должен поддерживать это явно.

### Governance requirements

- операции не должны считаться auto-approved по умолчанию;
- manual review actions должны быть ограничены по ролям;
- каждая critical approval/rejection должна иметь reason code;
- high-risk actions могут требовать second approval;
- все overrides должны быть видимы в audit trail.

## 10. Operator restrictions and segregation of duties

Для sensitive operations нужно предусмотреть role restrictions.

### Примеры ограничений

- не каждый оператор может release payout;
- не каждый оператор может выполнять manual financial adjustment;
- compliance-blocked cases не могут быть разблокированы обычным support-operator;
- manual override terminal status не должен быть доступен без elevated role;
- high-value cases могут требовать dual control.

## 11. Legal copy and policy versioning

Все policy-sensitive тексты должны быть versioned.

### К ним относятся:

- пользовательское согласие с условиями операции;
- предупреждения о риске неправильной сети/адреса;
- формулировки по manual review;
- refund/cancellation disclaimers, если применимо;
- тексты, сопровождающие чеки/подтверждения.

### Requirements

- у каждого policy текста должна быть версия;
- заявка должна хранить snapshot relevant policy version;
- переиздание текста в будущем не должно менять прошлую сделку задним числом.

## 12. Receipt and transaction document issuance

Платформа должна поддерживать формирование чеков или иных подтверждающих документов в предусмотренных бизнесом и законодательством сценариях.

## 12.1 Product-level requirements

Система должна уметь:

- определить, требуется ли документ по сценарию;
- связать документ с order и financial outcome;
- зафиксировать время генерации/отправки;
- хранить document metadata и статус доставки;
- поддержать повторную отправку или повторную генерацию по policy.

## 12.2 Suggested receipt/document metadata

| Поле | Назначение |
|---|---|
| document_id | Идентификатор документа |
| document_type | receipt / confirmation / settlement_summary / other |
| order_id | Связь с заявкой |
| generated_at | Когда сформирован |
| delivery_channel | email / download / operator export |
| delivery_status | pending / sent / failed |
| document_version | Версия шаблона |
| related_financial_snapshot | На каком financial outcome основан |

## 12.3 Re-issuance rules

При повторной генерации/отправке документа система должна:

- логировать инициатора;
- логировать reason code;
- не терять первичную версию/след;
- различать original issuance и re-issuance.

## 13. Email and notification compliance considerations

Уведомления должны быть не только удобными, но и воспроизводимыми.

### Требования:

- важные transaction emails должны иметь template/version control;
- отправка должна логироваться;
- failed delivery должна быть видима оператору, если письмо значимо для операции;
- уведомления не должны обещать финальный результат до достижения подтвержденного статуса;
- тексты должны быть согласованы с order state semantics.

## 14. Retention and data lifecycle guidance

Точные сроки хранения должны определяться отдельной legal policy, но архитектурно система должна поддерживать разные классы retention.

### Должны быть предусмотрены:

- durable retention для order evidence;
- durable retention для operator decisions и audit logs;
- controlled retention для raw provider payloads и attachments;
- возможность отличать active operational data от archived evidence.

## 15. Audit-readiness requirements

Система должна быть готова быстро собрать доказательную цепочку по операции.

### Для любой заявки должно быть возможно восстановить:

- что запросил пользователь;
- какие условия были показаны и приняты;
- какие реквизиты были использованы;
- какой payment/transfer/payout факт подтвержден;
- кто и на каком основании подтвердил или отклонил заявку;
- какой документ был сгенерирован и отправлен;
- были ли discrepancy, hold, escalation или override.

## 16. Restriction and escalation triggers

Certain conditions должны автоматически или полуавтоматически переводить кейс в restricted/manual mode.

### Примеры triggers

- payout details recently changed;
- payment/provider mismatch;
- wallet destination denied or ambiguous;
- high-value order above threshold;
- duplicate payout/payment suspicion;
- unresolved discrepancy;
- provider callback inconsistency;
- repeated failed customer evidence submissions.

### System response options

- `manual_review_required`
- `compliance_hold`
- `payout_blocked`
- `operator_escalation_required`
- `additional_user_confirmation_required`

## 17. Evidence for manual and exception decisions

Manual и exception-based решения должны иметь расширенный evidence standard.

### Required fields for sensitive decisions

- actor id;
- role at decision time;
- reason code;
- human-readable note;
- evidence references;
- related discrepancy case, если есть;
- approval level;
- timestamp;
- previous state / new state.

## 18. UI / product requirements

## 18.1 Customer UI

Customer-facing интерфейс должен:

- показывать legal copy в нужный момент, а не постфактум;
- фиксировать explicit acknowledgements;
- показывать, что операция может быть вручную проверена;
- давать доступ к transaction confirmations / receipts, если policy это допускает;
- не скрывать blocking compliance states за абстрактной “ошибкой системы”.

## 18.2 Admin / operator UI

Operator UI должен:

- показывать policy/consent snapshots;
- показывать evidence package;
- показывать restriction flags;
- показывать receipt/document issuance history;
- требовать reason code и note для sensitive actions;
- поддерживать escalation workflow.

## 19. API / data requirements

Implementation layer должен поддерживать:

- policy version storage;
- consent event capture;
- order snapshoting for legal evidence;
- document issuance and delivery logs;
- restrictions and hold flags;
- searchable audit-ready evidence records;
- re-issuance and resend tracking.

## 20. QA checklist

QA должна проверить:

- пользователь не может завершить critical action без required acknowledgement, если policy так требует;
- consent version сохраняется;
- order snapshots сохраняют нужный legal/evidence context;
- receipt/document generation логируется;
- повторная отправка документа оставляет audit trail;
- sensitive operator actions требуют reason code и notes;
- restricted/compliance-held states корректно отображаются в UI;
- evidence package можно собрать по завершенной или спорной заявке.

## 21. Production readiness questions

Перед production launch должны быть закрыты минимум следующие вопросы:

- какие именно виды документов/чеков обязательны и в каких сценариях;
- какие сроки хранения применяются к разным классам данных;
- какие операционные пороги считаются high-value/high-risk;
- какие cases требуют dual approval;
- какие legal/policy texts являются обязательными в user flow;
- какие поля подлежат masking в UI и exports.

## 22. Следующие документы

На базе этой спецификации рекомендуется подготовить:

- `operations-runbook-and-sla-spec.md`
- `notification-event-matrix.md`
- `incident-response-playbook.md`
- `document-template-and-receipt-spec.md`