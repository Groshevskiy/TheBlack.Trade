## Document metadata

- Status: active
- Role: Companion spec
- Owner: Operations + Product
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `screen-by-screen-ux-copy-spec.md`
- Related documents:
  - `email-notification-content-spec.md`
  - `payment-provider-and-payout-integration-spec.md`

# Document Template & Receipt Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает модель документов, чеков и подтверждающих артефактов для платформы TheBlack.Trade: какие типы документов существуют, когда они формируются, какие данные включают, как версионируются, хранятся, переотправляются и связываются с order outcome.

Документ предназначен для product, backend, frontend, operations, finance, compliance, CRM/content и QA-команд.

## 2. Цели документа

Document layer должен обеспечивать:

- воспроизводимое формирование transaction-related документов;
- связь документов с бизнес- и финансовым итогом заявки;
- поддержку customer-facing delivery по email и/или в личном кабинете;
- сохранение версий шаблонов и snapshot данных;
- управляемый re-issuance flow;
- возможность audit-ready подтверждения, какой документ и когда был отправлен.

## 3. Scope

Документ покрывает:

- document taxonomy;
- trigger events for generation;
- template and version model;
- document data snapshot requirements;
- receipt/confirmation delivery flow;
- re-issuance / resend logic;
- audit and retention considerations;
- UI/API requirements.

Документ не определяет финальный юридический текст документа и не заменяет бухгалтерско-налоговую экспертизу.

## 4. Document taxonomy

Рекомендуется выделить несколько типов документов.

| Document type | Назначение |
|---|---|
| receipt | Чек/платежный документ по предусмотренному сценарию |
| transaction_confirmation | Подтверждение завершенной операции |
| settlement_summary | Сводка по выплате / расчету |
| payment_confirmation_snapshot | Подтверждение факта принятия платежа/пруфа |
| cancellation_summary | Подтверждение отмены или незавершения операции |
| reissue_notice | Служебный артефакт о перевыпуске/повторной отправке |

Не все типы обязательны для MVP, но модель должна поддерживать их расширение.

## 5. Core principles

1. **Документ должен базироваться на snapshot данных, а не на live mutable state.**
2. **Каждый customer-facing документ должен иметь версию шаблона.**
3. **Формирование документа должно быть привязано к бизнес-событию или операторскому действию.**
4. **Повторная отправка и повторная генерация — разные действия и должны различаться.**
5. **Документ не должен противоречить order state и financial outcome.**

## 6. Document generation triggers

## 6.1 Typical trigger events

| Trigger event | Potential document |
|---|---|
| order_completed | transaction_confirmation, receipt |
| payment_confirmed | payment_confirmation_snapshot, optional intermediate confirmation |
| payout_completed | settlement_summary |
| order_canceled | cancellation_summary |
| operator reissue action | reissue_notice and/or regenerated original-type document |

## 6.2 Generation policy

Для каждого document type должна быть зафиксирована policy:

- generated automatically;
- generated conditionally;
- generated manually by operator;
- available for download only;
- sent by email automatically or on demand.

## 7. Document entity model

Рекомендуется сущность `DocumentRecord`.

### Suggested fields

| Поле | Назначение |
|---|---|
| id | Идентификатор документа |
| document_type | Тип документа |
| order_id | Связь с заявкой |
| related_entity_type | PaymentRecord / SettlementRecord / Order / etc. |
| related_entity_id | Связанная сущность |
| template_code | Код шаблона |
| template_version | Версия шаблона |
| language | Язык документа |
| generation_trigger | Какой event/action создал документ |
| generation_mode | automatic / manual / reissued |
| generation_status | pending / generated / failed |
| file_reference | Где хранится файл/артефакт |
| payload_snapshot_json | Snapshot данных документа |
| legal_copy_version | Версия legal/policy fragments |
| created_at | Время создания |
| generated_at | Время генерации |
| created_by_actor_type | system / operator |
| created_by_actor_id | Кто инициировал |

## 8. Snapshot requirements

Каждый документ должен опираться на snapshot relevant data.

### Snapshot should include, when applicable:

- order id and order reference;
- customer-visible transaction summary;
- payment amount / payout amount / asset / network;
- timestamps значимых этапов;
- final or intermediate status basis;
- applied template version;
- related provider references in customer-safe form;
- legal copy fragments or version references.

Если order данные позже меняются, уже выпущенный документ не должен silently изменяться.

## 9. Template model

Каждый тип документа должен иметь template abstraction.

### Required template attributes

- `template_code`
- `template_version`
- `document_type`
- `language`
- `status` (draft / active / deprecated)
- `rendering_mode` (HTML/PDF/other)
- `legal_copy_dependencies`
- `field_schema`

## 9.1 Template versioning rules

- новая версия шаблона не должна переписывать старые документы;
- generated document всегда хранит `template_version`;
- deprecated templates могут оставаться в системе для historical rendering reference;
- legal copy changes должны быть version-aware.

## 10. Receipt-specific requirements

Если сценарий требует чека или близкого по смыслу документа, receipt layer должна поддерживать:

- уникальный `document_id`/номер, если policy это требует;
- привязку к итогу операции;
- дату/время генерации;
- customer-facing summary операции;
- возможность повторной отправки без потери истории;
- отображение статуса доставки.

## 11. Delivery model

Документ может доставляться несколькими способами.

| Delivery channel | Use case |
|---|---|
| email | Основной канал отправки customer-facing документа |
| in-app download | Документ доступен в личном кабинете |
| operator export | Внутренний controlled export |

### Delivery status model

- `pending`
- `sent`
- `delivered` (if trackable)
- `failed`
- `suppressed`
- `download_only`

## 12. Relationship with notifications

Document generation и document delivery не тождественны.

### Recommended model

1. Сначала создается `DocumentRecord`.
2. Затем, по policy, генерируется file artifact.
3. Затем создается notification event о доступности/отправке документа.
4. Потом логируется фактическая доставка.

Это позволяет различать:

- документ создан, но еще не отправлен;
- документ отправлен, но доставка не подтверждена;
- документ доступен только для скачивания;
- документ надо перевыпустить.

## 13. Re-send vs re-issue

Нужно четко различать два действия.

## 13.1 Re-send

Повторная отправка **того же самого документа** без изменения его содержимого.

### Примеры

- email delivery failed;
- пользователь просит отправить тот же чек еще раз;
- оператор повторно инициирует отправку уже существующего документа.

## 13.2 Re-issue

Создание **нового документа/новой версии экземпляра**, потому что:

- исходный документ был сформирован по неверным данным;
- изменились допустимые основания по policy;
- требуется corrected version;
- compliance/operations одобрили перевыпуск.

Re-issue должен оставлять полную историчность.

## 14. Re-issuance rules

При re-issue система должна:

- сохранять связь с original document;
- логировать инициатора;
- логировать reason code;
- создавать новый `DocumentRecord`, а не silently редактировать старый;
- различать original и superseding document;
- при необходимости генерировать `reissue_notice`.

### Suggested re-issue reason codes

- `document_delivery_failed_reissue_not_required` (для resend обычно не нужно)
- `document_data_correction`
- `operator_error_correction`
- `policy_required_reissue`
- `customer_request_approved`

## 15. Rendering requirements

Document template layer должна поддерживать deterministic rendering.

### Требования

- один и тот же snapshot + template version → один и тот же customer-visible результат;
- рендеринг не должен зависеть от случайных live-запросов к mutable данным;
- fail-safe generation status должен логироваться;
- document generation failure должна быть наблюдаема операционно.

## 16. File and storage guidance

Document storage layer должна поддерживать:

- file reference or artifact id;
- access control;
- distinction between active accessible file and archived historical record;
- linkage between document metadata and stored artifact;
- safe operator download/export path.

## 17. Customer UI requirements

Customer UI должен:

- показывать список доступных документов по order, если policy это допускает;
- различать “документ формируется”, “документ доступен”, “отправка не удалась”; 
- позволять скачать актуальный документ;
- не показывать deprecated/internal-only артефакты пользователю;
- корректно отображать repeated send availability, если policy это допускает.

## 18. Operator/admin UI requirements

Operator UI должен:

- показывать document history по order;
- показывать template/version и generation mode;
- показывать delivery attempts и статус;
- поддерживать resend и, для уполномоченных ролей, re-issue;
- требовать reason code для re-issue;
- показывать связь original ↔ superseding document.

## 19. API requirements

Implementation layer должен поддерживать:

- создать document generation task;
- получить document metadata;
- получить список документов по order;
- инициировать resend;
- инициировать re-issue;
- получить delivery history;
- получить status generation/delivery.

### Example endpoint groups

- `/orders/{id}/documents`
- `/documents/{id}`
- `/documents/{id}/resend`
- `/documents/{id}/reissue`
- `/documents/{id}/delivery-history`

## 20. Audit and compliance requirements

Каждое значимое документное действие должно логироваться.

### Обязательно логировать

- кто инициировал re-send/re-issue;
- какой template/version был использован;
- на каком snapshot основан документ;
- какой канал доставки использовался;
- была ли delivery failure;
- какой документ superseded какой, если был re-issue.

## 21. Failure scenarios

### Typical generation failures

- missing required payload fields;
- template not active or incompatible;
- rendering engine failure;
- storage upload failure;
- legal copy dependency missing.

### Typical delivery failures

- email send failed;
- attachment generation timeout;
- file inaccessible to customer;
- incorrect delivery channel mapping.

### Response principles

- generation failure должна переводить документ в visible failed state;
- delivery failure должна попадать в follow-up queue;
- customer не должен видеть ложное “документ отправлен”, если отправка не произошла.

## 22. Metrics and observability

Нужно отслеживать:

- generation success/failure rate by document type;
- delivery success/failure rate;
- resend count;
- re-issue count;
- time from trigger event to document availability;
- failed receipt/document delivery backlog.

## 23. QA checklist

QA должна проверить:

- document generation основана на snapshot, а не на live mutable state;
- template version сохраняется;
- receipt/document появляется на правильных business events;
- resend не создает новый document instance, если не нужен re-issue;
- re-issue создает новый документ и сохраняет связь с original;
- delivery status корректно отражается в UI;
- failed generation/delivery cases видимы оператору;
- customer download доступен только для разрешенных документов.

## 24. Production readiness questions

Перед production launch нужно уточнить:

- какие типы документов обязательны в MVP;
- какие именно поля обязательны для receipt/document payload;
- в каком формате документы должны храниться и отдаваться пользователю;
- какие re-issue scenarios допустимы;
- кто может делать re-issue;
- нужен ли отдельный human-readable transaction summary document помимо чека.

## 25. Следующие документы

На базе этой спецификации рекомендуется подготовить:

- `incident-response-playbook.md`
- `support-communication-guidelines.md`
- `provider-capability-matrix.md`
- `production-readiness-checklist.md`