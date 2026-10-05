## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Product + Backend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `data-model-canonical-entities-spec.md`
  - `enum-and-state-dictionary-spec.md`
- Related documents:
  - `theblack-trade-order-state-machine-spec.md`
  - `transaction-status-state-machine-spec.md`
  - `reconciliation-and-ledger-spec.md`

# Order Domain Model Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает доменную модель заявки (Order Domain Model) для TheBlack.Trade. Спецификация предназначена для backend-разработчиков, frontend-разработчиков, системных архитекторов, product-команды, QA, support, operations и compliance, чтобы все участники проекта опирались на единую структуру сущностей, связей, статусов и инвариантов.

Документ определяет:

- центральную сущность Order;
- связанные доменные сущности;
- ключевые атрибуты и связи;
- инварианты и бизнес-ограничения;
- разделение между snapshot-данными и reference-данными;
- рекомендации по хранению и эволюции модели.

## 2. Архитектурный принцип

Заявка (`Order`) является центральной агрегатной сущностью exchange-процесса. Все остальные объекты, связанные с выполнением конкретного обмена, должны либо принадлежать этой заявке, либо иметь с ней явную связь через идентификатор и тип relation.

### Ключевой принцип

- **Order** — главный агрегат для бизнес-процесса обмена.
- Все критические изменения состояния проходят через lifecycle заявки.
- Снимки ключевых данных должны сохраняться на момент создания/подтверждения заявки, даже если внешние reference-данные позже изменятся.

## 3. Основные доменные сущности

Рекомендуемый набор сущностей:

1. `User`
2. `Order`
3. `Quote`
4. `OrderPartySnapshot`
5. `WalletConnection`
6. `OrderWalletSnapshot`
7. `KycApplication`
8. `PaymentRecord`
9. `CryptoTransferRecord`
10. `ExchangeExecution`
11. `SettlementRecord`
12. `Receipt`
13. `OrderTimelineEvent`
14. `OrderNote`
15. `OrderRiskFlag`
16. `NotificationLog`
17. `Attachment`

## 4. Центральная сущность: Order

`Order` описывает одну пользовательскую заявку на покупку или продажу криптовалюты.

## 4.1 Основные поля Order

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| id | UUID | required | Внутренний идентификатор заявки |
| public_id | string | required | Публичный идентификатор / номер заявки |
| user_id | UUID | required | Владелец заявки |
| order_type | enum | required | `buy` / `sell` |
| lifecycle_status | enum | required | Верхнеуровневый статус заявки |
| prerequisite_type | enum/null | optional | Активный блокер prerequisites |
| kyc_status_snapshot | enum | required | Снимок статуса верификации на текущем шаге |
| payment_status | enum | required | Подстатус оплаты |
| crypto_transfer_status | enum | required | Подстатус перевода криптовалюты |
| execution_status | enum | required | Подстатус выполнения обмена |
| settlement_status | enum | required | Подстатус финализации |
| receipt_status | enum | required | Подстатус чека |
| quote_id | UUID/null | optional | Связанный quote |
| source_asset_code | string | required | Что пользователь отдает |
| source_network_code | string/null | optional | Сеть для source asset |
| source_amount | decimal | required | Количество исходного актива |
| source_currency_type | enum | required | `fiat` / `crypto` |
| target_asset_code | string | required | Что пользователь получает |
| target_network_code | string/null | optional | Сеть для target asset |
| target_amount | decimal | required | Количество целевого актива |
| target_currency_type | enum | required | `fiat` / `crypto` |
| rate_value | decimal | required | Курс, зафиксированный в заявке |
| fee_amount | decimal | required | Общая комиссия |
| fee_currency_code | string | required | Валюта комиссии |
| quote_expires_at | datetime/null | optional | Когда истекает расчет |
| order_confirmed_at | datetime/null | optional | Когда пользователь подтвердил заявку |
| processing_started_at | datetime/null | optional | Когда началось выполнение обмена |
| completed_at | datetime/null | optional | Когда заявка завершена |
| canceled_at | datetime/null | optional | Когда заявка отменена |
| expired_at | datetime/null | optional | Когда истекла |
| rejected_at | datetime/null | optional | Когда отклонена |
| cancel_reason_code | string/null | optional | Код причины отмены |
| reject_reason_code | string/null | optional | Код причины отклонения |
| expire_reason_code | string/null | optional | Код причины истечения |
| is_manual_review | boolean | required | Флаг ручной проверки |
| manual_review_reason_code | string/null | optional | Причина ручной проверки |
| manual_review_assignee_id | UUID/null | optional | Назначенный оператор |
| metadata_json | json | optional | Расширяемое поле для доменной метаинформации |
| created_at | datetime | required | Дата создания |
| updated_at | datetime | required | Дата обновления |

## 4.2 Инварианты Order

- `order_type = buy` означает, что пользователь отдает `fiat`, а получает `crypto`.
- `order_type = sell` означает, что пользователь отдает `crypto`, а получает `fiat`.
- Только один lifecycle_status может быть активным в каждый момент времени.
- `completed_at` заполняется только при `lifecycle_status = completed`.
- `canceled_at` заполняется только при `lifecycle_status = canceled`.
- `expired_at` заполняется только при `lifecycle_status = expired`.
- `rejected_at` заполняется только при `lifecycle_status = rejected`.
- При `is_manual_review = true` должен быть указан `manual_review_reason_code`.

## 5. Сущность Quote

`Quote` представляет предварительный расчет обмена и может существовать до создания заявки либо быть связанным с заявкой после подтверждения.

### Рекомендуемые поля Quote

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Идентификатор расчета |
| direction | enum | `buy` / `sell` |
| source_asset_code | string | Исходный актив |
| target_asset_code | string | Целевой актив |
| source_amount | decimal | Исходная сумма |
| target_amount | decimal | Целевая сумма |
| rate_value | decimal | Курс |
| fee_amount | decimal | Комиссия |
| fee_currency_code | string | Валюта комиссии |
| provider_reference | string/null | Ссылка на внешний pricing/provider context |
| expires_at | datetime | Срок действия |
| status | enum | active / expired / consumed |
| created_at | datetime | Создание |

### Инварианты Quote

- Quote не должен мутировать после того, как был привязан к подтвержденной заявке; изменения оформляются новым Quote.
- Order должен сохранять snapshot ключевых quote-данных, даже если Quote хранится отдельно.

## 6. Сущность User

`User` — владелец заявки.

### Ключевые поля

- `id`
- `email`
- `phone`
- `account_status`
- `default_locale`
- `created_at`

User не должен хранить order-specific данные напрямую внутри себя, кроме агрегированных представлений для ускорения чтения.

## 7. Snapshot-сущности

Для финансовых и compliance-сценариев snapshot-подход предпочтительнее, чем reliance только на reference-связи.

## 7.1 OrderPartySnapshot

Содержит снимок пользовательских данных, которые относятся к конкретной заявке.

### Поля

- `order_id`
- `full_name_snapshot`
- `email_snapshot`
- `phone_snapshot`
- `country_snapshot`
- `verification_level_snapshot`
- `legal_flags_snapshot_json`

### Зачем нужен snapshot

Если пользователь позже изменит email, номер телефона или профиль, это не должно переписывать исторический контекст уже созданной заявки.

## 7.2 OrderWalletSnapshot

Содержит снимок wallet/destination данных, используемых в заявке.

### Поля

- `order_id`
- `wallet_connection_id` (nullable)
- `wallet_label_snapshot`
- `address_snapshot`
- `network_code_snapshot`
- `account_reference_snapshot`
- `verification_status_snapshot`

## 8. WalletConnection

`WalletConnection` хранит пользовательские сохраненные адреса / реквизиты / биржевые данные.

### Рекомендуемые поля

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Идентификатор |
| user_id | UUID | Владелец |
| connection_type | enum | wallet / exchange_account / payout_requisite |
| label | string | Название |
| address_or_identifier | string | Адрес/идентификатор |
| network_code | string/null | Сеть |
| verification_status | enum | pending / verified / rejected / disabled |
| is_default | boolean | По умолчанию |
| created_at | datetime | Создание |
| updated_at | datetime | Обновление |

## 9. KycApplication

Отдельная сущность, которая может обслуживать много заявок пользователя, но snapshot KYC-status все равно должен быть сохранен в Order.

### Рекомендуемые поля

- `id`
- `user_id`
- `status`
- `review_status`
- `submitted_at`
- `reviewed_at`
- `reviewer_id`
- `rejection_reason_code`
- `resubmission_required`
- `metadata_json`

## 10. PaymentRecord

`PaymentRecord` относится к buy-flow и фиксирует подтверждение оплаты со стороны пользователя и результат проверки.

### Рекомендуемые поля

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Идентификатор |
| order_id | UUID | Связь с заявкой |
| payment_method_code | string | Метод оплаты |
| amount_expected | decimal | Ожидаемая сумма |
| amount_reported | decimal/null | Сумма по данным пользователя |
| currency_code | string | Валюта |
| payer_reference | string/null | Референс / идентификатор платежа |
| proof_attachment_id | UUID/null | Подтверждающий файл |
| status | enum | pending / submitted / in_review / confirmed / rejected / expired |
| submitted_at | datetime/null | Когда пользователь отправил подтверждение |
| reviewed_at | datetime/null | Когда проверено |
| reviewer_id | UUID/null | Кто проверил |
| reject_reason_code | string/null | Причина отклонения |
| metadata_json | json | Метаданные |

### Инварианты

- Для `order_type = buy` должен существовать максимум один активный PaymentRecord на одну заявку, если не поддерживаются повторные попытки как отдельные child-records.
- Если поддерживаются повторные попытки, должна быть модель `attempt_number` или `is_current`.

## 11. CryptoTransferRecord

`CryptoTransferRecord` относится к sell-flow и фиксирует подтверждение перевода криптовалюты.

### Рекомендуемые поля

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Идентификатор |
| order_id | UUID | Связь с заявкой |
| asset_code | string | Актив |
| network_code | string | Сеть |
| amount_expected | decimal | Ожидаемая сумма |
| amount_reported | decimal/null | Сообщенная сумма |
| tx_hash | string/null | Хеш транзакции |
| proof_attachment_id | UUID/null | Подтверждающий файл |
| status | enum | pending / submitted / in_review / confirmed / rejected / expired |
| submitted_at | datetime/null | Подтверждение пользователем |
| reviewed_at | datetime/null | Проверка |
| reviewer_id | UUID/null | Кто проверил |
| reject_reason_code | string/null | Причина отклонения |
| metadata_json | json | Метаданные |

## 12. ExchangeExecution

`ExchangeExecution` описывает фактическое выполнение обменной операции внутри платформы или через внешнего провайдера/ликвидность.

### Рекомендуемые поля

- `id`
- `order_id`
- `execution_mode` (`manual` / `semi_auto` / `auto`)
- `provider_code`
- `provider_reference`
- `status` (`not_started`, `queued`, `in_progress`, `awaiting_operator`, `completed`, `failed`)
- `started_at`
- `finished_at`
- `failure_reason_code`
- `metadata_json`

### Важное правило

Order хранит агрегированный `execution_status`, а детальный operational context хранится в ExchangeExecution.

## 13. SettlementRecord

`SettlementRecord` описывает финальную выплату / отправку / пост-обработку после основного exchange-execution.

### Примеры сценариев settlement

- отправка криптовалюты пользователю в buy-flow;
- выплата фиата пользователю в sell-flow;
- ожидание внешнего подтверждения финального шага.

### Рекомендуемые поля

- `id`
- `order_id`
- `settlement_type`
- `destination_type`
- `amount`
- `currency_code`
- `status`
- `provider_reference`
- `processed_at`
- `failure_reason_code`
- `metadata_json`

## 14. Receipt

`Receipt` хранит информацию о сформированном чеке или подтверждении операции.

### Рекомендуемые поля

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Идентификатор |
| order_id | UUID | Связь с заявкой |
| receipt_number | string | Номер чека/документа |
| receipt_type | enum | fiscal_receipt / exchange_confirmation / other |
| status | enum | pending / issued / failed |
| issued_at | datetime/null | Когда выдан |
| file_attachment_id | UUID/null | Файл документа |
| provider_reference | string/null | Идентификатор провайдера |
| metadata_json | json | Дополнительные данные |

## 15. OrderTimelineEvent

Эта сущность обязательна для аудита и UI timeline.

### Рекомендуемые поля

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Идентификатор |
| order_id | UUID | Заявка |
| event_key | string | Код события |
| from_status | string/null | Предыдущий статус |
| to_status | string/null | Новый статус |
| actor_type | enum | user / operator / system |
| actor_id | UUID/null | Кто инициировал |
| reason_code | string/null | Причина |
| reason_text | text/null | Текстовое описание |
| metadata_json | json | Данные события |
| created_at | datetime | Время события |

## 16. OrderNote

Нужна для внутренних комментариев support / operations / compliance.

### Поля

- `id`
- `order_id`
- `author_id`
- `author_role`
- `note_type`
- `body`
- `is_internal`
- `created_at`

## 17. OrderRiskFlag

Фиксирует риск-сигналы по заявке.

### Поля

- `id`
- `order_id`
- `flag_code`
- `severity`
- `source_type` (`system`, `operator`, `provider`)
- `is_active`
- `created_at`
- `resolved_at`
- `metadata_json`

## 18. NotificationLog

Хранит факт отправки пользовательских уведомлений.

### Поля

- `id`
- `order_id`
- `user_id`
- `channel` (`email`, `sms`, `telegram`, `in_app`)
- `template_key`
- `event_key`
- `delivery_status`
- `provider_reference`
- `sent_at`
- `delivered_at`
- `failed_at`
- `metadata_json`

## 19. Attachment

Единая сущность файловых вложений.

### Сценарии использования

- документы KYC;
- подтверждение оплаты;
- подтверждение перевода;
- файл чека;
- внутренние служебные материалы.

### Поля

- `id`
- `owner_type`
- `owner_id`
- `attachment_type`
- `storage_provider`
- `file_name`
- `mime_type`
- `file_size`
- `file_url_or_storage_key`
- `created_at`
- `metadata_json`

## 20. Snapshot vs reference strategy

Рекомендуется использовать оба подхода:

### Reference-данные

Нужны для связей и повторного использования:

- `user_id`
- `quote_id`
- `wallet_connection_id`
- `kyc_application_id`

### Snapshot-данные

Нужны для исторической точности:

- email / phone / user identity snapshot;
- wallet address snapshot;
- quote rate / amount snapshot;
- verification level snapshot;
- compliance outcome snapshot при необходимости.

## 21. Инварианты и бизнес-ограничения модели

1. У заявки не может быть одновременно `payment_status = confirmed` и `crypto_transfer_status = confirmed`, если бизнес-процесс предполагает только один входной leg в зависимости от типа заявки.
2. Для `buy` заявок `payment_status` обязателен, а `crypto_transfer_status` должен быть `not_applicable`.
3. Для `sell` заявок `crypto_transfer_status` обязателен, а `payment_status` должен быть `not_applicable`.
4. `completed` возможен только после успешного `processing_exchange` и `settlement`.
5. Receipt может быть `issued` после `completed` или на строго определенном позднем этапе post-processing.
6. Все terminal-состояния (`completed`, `canceled`, `rejected`, `expired`) должны быть иммутабельны без отдельного административного recovery-process.

## 22. Рекомендации по хранению в Directus

Если Directus используется как operational backend layer, рекомендуется:

- вынести `orders` в отдельную коллекцию;
- хранить timeline, payment records, transfer records, receipts, notes и attachments в отдельных связанных коллекциях;
- использовать enum-like controlled values через select/interfaces или dictionary collections;
- не перегружать одну коллекцию чрезмерным количеством mixed-responsibility полей;
- продумать permissions отдельно для customer, operator, admin, compliance, support.

## 23. Рекомендации по API-представлению

Для frontend удобно разделить:

- `OrderListItemDTO`
- `OrderDetailDTO`
- `OrderTimelineDTO`
- `OrderStatusDTO`
- `OrderReceiptDTO`

Не обязательно отдавать frontend всю внутреннюю модель 1:1. Domain model и API DTO не должны жестко совпадать.

## 24. QA checklist по доменной модели

Команда QA и backend должны проверить:

- каждая связь между сущностями явно определена;
- snapshot-данные не теряются после изменения reference-сущностей;
- buy/sell инварианты соблюдаются;
- terminal statuses не допускают случайного редактирования;
- timeline строится для всех критических событий;
- receipt/payment/transfer сущности корректно связаны с order;
- manual review reason и risk flags не теряются в lifecycle.

## 25. Следующие артефакты

На базе этой спецификации рекомендуется подготовить:

- API Status Contract Spec;
- Order API Endpoints Spec;
- Directus Collections Schema Draft;
- Permissions & Roles Matrix;
- Event & Webhook Spec.