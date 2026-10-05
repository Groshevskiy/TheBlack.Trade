## Document metadata

- Status: active
- Role: Derived reference
- Owner: Product + Platform
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `governed-event-taxonomy-and-schema-registry-spec.md`
  - `email-notification-content-spec.md`
- Related documents:
  - `acceptance-test-catalog.md`
  - `contract-test-matrix.md`

# Notification Event Matrix — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает матрицу событий уведомлений для платформы TheBlack.Trade: какие события генерируют уведомления, кому они отправляются, через какие каналы, в каком контексте и при каких условиях.

Документ предназначен для product, frontend, backend, CRM/content, operations, support, QA и compliance-команд.

## 2. Цели документа

Notification layer должен обеспечивать:

- своевременное информирование пользователя о статусе операции;
- уведомления операторов о кейсах, требующих внимания;
- согласованность между order state, email content и compliance semantics;
- воспроизводимость отправленных сообщений;
- controlled multichannel strategy, даже если на MVP используется в основном email.

## 3. Scope

Документ покрывает:

- customer notifications;
- operator/internal notifications;
- event-to-template mapping;
- channel selection;
- suppression / deduplication rules;
- delivery and retry semantics;
- связь с receipts/documents.

Документ не заменяет content-spec шаблонов писем, но определяет, **когда** и **почему** уведомление должно возникать.

## 4. Notification design principles

1. **Уведомление должно быть привязано к бизнес-событию, а не к случайному техническому событию.**
2. **Нельзя обещать окончательный результат до достижения подтвержденного business state.**
3. **Customer и operator notifications имеют разную цель и могут использовать разные формулировки.**
4. **Должны существовать anti-spam и anti-duplication правила.**
5. **Каждая значимая отправка должна быть логируема и воспроизводима.**

## 5. Notification audience groups

| Audience | Назначение |
|---|---|
| Customer | Статусы заявки, действия, подтверждения, документы |
| Support operator | Новые review/reply-needed кейсы |
| Operations reviewer | Payment/wallet manual review cases |
| Finance/settlement reviewer | Payout, settlement, discrepancy events |
| Compliance reviewer | Restricted/high-risk cases |
| Admin/ops lead | Backlog, failure clusters, critical operational alerts |

## 6. Channels

Рекомендуется закладывать channel abstraction even for MVP.

| Channel | MVP status | Notes |
|---|---|---|
| Email | Primary | Основной customer channel |
| In-app status surface | Primary | Обязательный статусный канал внутри кабинета |
| Admin queue alert | Primary | Для операторов/внутренних ролей |
| SMS | Optional later | Для критичных customer cases, если понадобится |
| Push / Telegram / other | Later | Не критично для MVP |

## 7. Notification object model

Рекомендуемая сущность `NotificationLog` должна содержать:

- `id`
- `event_code`
- `audience_type`
- `recipient_reference`
- `channel`
- `template_code`
- `template_version`
- `related_order_id`
- `related_entity_type`
- `related_entity_id`
- `delivery_status`
- `attempt_count`
- `suppressed_reason`
- `sent_at`
- `correlation_id`
- `metadata_json`

## 8. Event families

Рекомендуется выделять семейства notification events.

| Family | Примеры |
|---|---|
| Order lifecycle | order_created, order_expired, order_completed, order_canceled |
| Payment | payment_instruction_created, payment_confirmation_received, payment_confirmed, payment_rejected |
| Crypto transfer | crypto_transfer_detected, crypto_transfer_confirmed |
| Wallet / requisites | wallet_verification_pending, wallet_verified, wallet_rejected |
| Payout / settlement | payout_pending_review, payout_released, payout_completed, payout_failed |
| Reconciliation / discrepancy | discrepancy_opened_internal, discrepancy_resolved_internal |
| Compliance / holds | compliance_hold_applied, additional_confirmation_required |
| Documents | receipt_generated, receipt_sent, receipt_delivery_failed |
| Operational internal alerts | queue_backlog_high, critical_provider_issue |

## 9. Customer notification matrix

| Event code | Trigger | Channel | Template intent | Send rule | Suppression / notes |
|---|---|---|---|---|---|
| ORDER_CREATED | Order successfully created | Email + in-app | Подтвердить создание заявки и показать следующий шаг | Send once | Не слать повторно при refresh |
| PAYMENT_INSTRUCTION_CREATED | Payment instruction available | In-app, optional email | Дать реквизиты и дедлайн оплаты | In-app always, email by policy | Не слать дубли при одинаковом instruction payload |
| PAYMENT_CONFIRMATION_RECEIVED | User submitted proof | Email + in-app | Подтвердить, что подтверждение получено и ушло на проверку | Send once per submission | Не называть оплату подтвержденной |
| PAYMENT_CONFIRMED | Payment accepted | Email + in-app | Сообщить, что платеж подтвержден и заявка двигается дальше | Send once per order/payment cycle | Terminal for payment phase |
| PAYMENT_REJECTED | Payment proof/flow rejected | Email + in-app | Объяснить, что подтверждение не принято и что делать дальше | Send once per rejection decision | Должен быть action-oriented tone |
| ORDER_MANUAL_REVIEW | Order placed into review | In-app, optional email | Сообщить о дополнительной проверке | Send when entering review from customer-visible state | Не спамить на каждый внутренний hold |
| WALLET_VERIFICATION_PENDING | Destination/requisites need verification | In-app | Показать ожидание проверки | Send on state entry | Email optional only if action required |
| WALLET_REJECTED | Requisites rejected | Email + in-app | Попросить заменить/исправить реквизиты | Send once per rejection | Action required |
| CRYPTO_TRANSFER_DETECTED | Relevant for sell/buy tracking if surfaced | In-app | Показать, что перевод найден и проверяется | Optional | Только если улучшает UX и не создает ложной уверенности |
| CRYPTO_TRANSFER_CONFIRMED | Transfer confirmed | Email + in-app | Сообщить о подтверждении перевода | Send once | Не обещать payout раньше времени, если sell-flow |
| PAYOUT_PENDING_REVIEW | Sell payout in review/hold | In-app, optional email | Сообщить о финальной проверке выплаты | Send on entry if customer-facing | Осторожная wording |
| PAYOUT_COMPLETED | Payout completed | Email + in-app | Подтвердить, что выплата завершена | Send once | Может сопровождаться receipt/document |
| ORDER_COMPLETED | Entire order completed | Email + in-app | Финальное подтверждение операции | Send once | Может быть combined с document event by policy |
| ORDER_CANCELED | Order canceled | Email + in-app | Сообщить об отмене и статусе | Send once | Explain if user action possible |
| RECEIPT_GENERATED | Document became available | Email and/or in-app | Сообщить, что чек/документ сформирован | Send by policy | Может быть bundled with completion |
| RECEIPT_DELIVERY_FAILED | Customer document failed delivery | Internal first, customer fallback if needed | Usually internal trigger | Not direct by default | Нужен ручной follow-up |

## 10. Internal/operator notification matrix

| Event code | Trigger | Audience | Channel | Action expectation | Notes |
|---|---|---|---|---|---|
| PAYMENT_REVIEW_REQUIRED | Payment case entered manual review | Operations reviewer | Admin queue alert | Review payment | Standard queue event |
| PAYMENT_MISMATCH_DETECTED | Amount/reference mismatch | Operations + finance | Admin alert | Investigate mismatch | High-priority |
| WALLET_REVIEW_REQUIRED | Wallet/requisite verification pending | Operations reviewer | Admin queue alert | Verify or reject | |
| PAYOUT_RELEASE_REQUIRED | Payout ready for release | Finance reviewer | Admin queue alert | Release or hold | |
| PAYOUT_BLOCKED | Payout blocked by discrepancy/restriction | Finance + senior ops | Admin alert | Investigate blockers | |
| DISCREPANCY_OPENED | New discrepancy case | Finance reviewer | Admin alert | Investigate | Severity-dependent |
| DISCREPANCY_CRITICAL | Critical discrepancy | Finance + compliance + ops lead | Admin alert + escalation | Immediate handling | P1 path |
| COMPLIANCE_HOLD_APPLIED | Case restricted | Compliance reviewer | Admin alert | Review restriction | |
| DOCUMENT_DELIVERY_FAILED | Receipt/document send failed | Support / operations | Admin queue alert | Retry / manual resend | |
| PROVIDER_OUTAGE_IMPACTING_FLOW | Integration problem affecting active cases | Ops lead + engineering on-call | Internal alert | Incident response | Cross-functional |
| QUEUE_BACKLOG_HIGH | Queue above threshold | Ops lead | Internal alert | Rebalance staff / prioritize | |

## 11. Event-to-template mapping rules

Каждый customer-facing event должен маппиться на:

- `template_code`
- `template_version`
- `audience_type`
- `channel`
- `language`
- `send_policy`

### Example

- `PAYMENT_CONFIRMED` → `email_payment_confirmed_v1`
- `PAYOUT_COMPLETED` → `email_payout_completed_v1`
- `ORDER_COMPLETED` → `email_order_completed_v1`
- `RECEIPT_GENERATED` → `email_receipt_available_v1`

## 12. Send rules and deduplication

Notification engine должен иметь deduplication policy.

### Recommended rules

- не слать один и тот же terminal customer event повторно без explicit re-send reason;
- не слать email на каждый internal status hop, если customer-visible state не изменился;
- повторные submission/review cycles должны различаться attempt-aware логикой;
- internal alerts могут агрегироваться по threshold вместо one-event-per-message для backlog/infrastructure cases.

## 13. Suppression rules

Уведомление может быть suppressed, если:

- аналогичное уведомление уже отправлено в том же state window;
- пользователь уже находится на актуальном in-app screen и policy допускает silent state update;
- событие заменено более финальным событием в коротком окне;
- notification неуместен из-за compliance restriction.

Каждый suppression должен логироваться в `NotificationLog.suppressed_reason`.

## 14. Delivery and retry semantics

Для email/document-related отправок нужно предусмотреть:

- delivery status;
- retry attempts;
- terminal delivery failure state;
- manual resend path;
- связь с document/receipt issuance.

### Recommended delivery statuses

- `pending`
- `sent`
- `delivered` (если trackable)
- `failed`
- `suppressed`
- `canceled`

## 15. Relationship with receipts/documents

Некоторые события должны быть связаны с document lifecycle.

### Typical patterns

- `ORDER_COMPLETED` может триггерить `RECEIPT_GENERATED`;
- `RECEIPT_GENERATED` может триггерить `RECEIPT_SENT`;
- `RECEIPT_DELIVERY_FAILED` должен идти во внутреннюю queue;
- re-issuance документа может запускать новый notification event с audit trail.

## 16. Customer wording guardrails

Customer notifications должны:

- быть согласованы с state machine semantics;
- не говорить “успешно”, если status еще review/pending;
- не обещать payout/completion до confirmed outcome;
- использовать понятный action-oriented tone для rejected/needs-action events;
- ссылаться на личный кабинет как primary source of truth.

## 17. Internal alert guardrails

Internal alerts должны:

- содержать semantic event code;
- показывать severity/priority;
- иметь deep-link в admin context;
- не дублировать alerts бесконечно;
- различать queue item creation и critical escalation.

## 18. Localization and versioning

Notification templates должны поддерживать:

- language-specific content;
- versioning;
- linkage to policy/legal copy when needed;
- reproducibility for past sends.

Для каждой отправки должен сохраняться `template_version`.

## 19. Metrics and observability

Нужно измерять:

- notification send rate by event/channel;
- failure rate by template/channel;
- suppressed notification rate;
- duplicate-prevented count;
- time from business event to notification send;
- failed receipt/document delivery count.

## 20. QA checklist

QA должна проверить:

- customer notifications отправляются только на правильных business events;
- review/pending states не оформляются как completed/success;
- deduplication работает на повторных статусовках;
- suppression логируется;
- internal alerts приходят правильным ролям;
- receipt/document notifications правильно связаны с document lifecycle;
- failed sends попадают в follow-up queue;
- template version сохраняется в notification log.

## 21. Production readiness questions

Перед production launch нужно уточнить:

- какие customer events обязаны дублироваться email + in-app;
- какие internal alerts должны быть real-time, а какие queue-only;
- нужна ли SMS/escalation channel для критичных customer событий;
- какие backlog thresholds запускают aggregate alerts;
- какие document events являются обязательными по policy;
- какие resend rules допустимы для customer notifications и receipts.

## 22. Следующие документы

На базе этой спецификации рекомендуется подготовить:

- `document-template-and-receipt-spec.md`
- `incident-response-playbook.md`
- `support-communication-guidelines.md`
- `provider-capability-matrix.md`