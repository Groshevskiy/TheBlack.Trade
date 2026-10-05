## Document metadata

- Status: active
- Role: Companion spec
- Owner: Platform Engineering + Data Operations
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `directus-data-model-spec.md`
  - `theblack-trade-directus-flows-and-extensions-spec.md`
- Related documents:
  - `theblack-trade-directus-field-matrix.md`
  - `environment-and-deployment-spec.md`

# Directus Implementation Blueprint
## TheBlack.Trade

## 1. Назначение документа

Настоящий документ описывает детальную реализацию платформы **TheBlack.Trade** на базе **Directus**. Blueprint предназначен для backend-разработчиков, интеграторов Directus, DevOps, solution architect и QA-команды. Цель документа — дать практически готовую схему развертывания data model, collections, relations, permissions, flows и custom extensions.

## 2. Цели реализации на Directus

Directus в рамках проекта должен выполнять следующие функции:

- роль data platform и admin backend;
- управление core business entities;
- role-based access control;
- API layer для frontend и operator/admin interface;
- автоматизация через flows;
- точка интеграции с внешними сервисами;
- журналирование и хранение служебных сущностей.

## 3. Архитектурный подход Directus

### 3.1 Роль Directus в системе

Directus используется как:

- headless backend;
- data management layer;
- admin console foundation;
- orchestration point для базовых бизнес-процессов;
- событийный слой для flows, hooks и service operations.

### 3.2 Что должно оставаться вне Directus

Следующие компоненты рекомендуется реализовывать через custom extensions или внешние сервисы, а не как чистую no-code конфигурацию:

- quote engine;
- provider adapters;
- risk scoring;
- криптовалютная валидация адресов;
- генерация чеков и PDF-документов;
- сложная state machine логика;
- webhook signature verification;
- retry orchestration.

## 4. Структура проекта Directus

Рекомендуемая структура runtime-решения:

- Directus core
- PostgreSQL database
- Storage adapter
- Directus extensions
- Worker / job processing layer
- SMTP / Email provider
- Payment provider adapters
- Crypto provider adapters
- Monitoring stack

### 4.1 Рекомендуемая структура каталогов

```text
/directus
  /extensions
    /endpoints
    /hooks
    /operations
    /interfaces
    /modules
    /shared
  /snapshots
  /migrations
  /seed
  /templates
```

## 5. Naming conventions

### 5.1 Collections

- snake_case
- plural for entity collections
- singular запрещён для доменных таблиц
- system-like справочники также snake_case plural

Примеры:

- users
- user_profiles
- exchange_orders
- order_status_history
- payment_transactions
- crypto_transactions
- audit_logs

### 5.2 Fields

- snake_case
- для FK использовать суффикс `_id`
- для timestamp использовать `_at`
- для bool использовать `is_`, `has_`, `can_`
- для enum-полей использовать `status`, `type`, `direction`, `severity`, `channel`

### 5.3 Codes

Все справочные code-поля должны быть машинно-стабильными:

- только lowercase
- слова через underscore
- immutable после создания

## 6. Directus collections blueprint

## 6.1 Identity & profile collections

### 6.1.1 directus_users

Используется встроенная системная коллекция Directus для аутентификации.

Дополнительно используются следующие поля:

| Field | Type | Required | Notes |
|---|---|---|---|
| email | string | yes | login identity |
| password | system | yes | hashed by Directus |
| status | string | yes | invited / active / suspended / archived |
| role | relation | yes | directus_roles |
| last_access | datetime | no | system field |

### 6.1.2 user_profiles

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | uuid | yes | generated | PK |
| user_id | relation | yes |  | O2O -> directus_users |
| first_name | string(100) | no |  | |
| last_name | string(100) | no |  | |
| phone | string(32) | no |  | normalized storage |
| locale | string(10) | yes | ru-RU | |
| timezone | string(50) | yes | Europe/Moscow | |
| notification_email_enabled | boolean | yes | true | |
| marketing_email_enabled | boolean | yes | false | |
| risk_level | string | yes | low | low/medium/high |
| created_at | datetime | yes | now | |
| updated_at | datetime | yes | now | |

Relations:

- user_profiles.user_id -> directus_users.id (unique)

### 6.1.3 user_consents

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | uuid | yes | generated | PK |
| user_id | relation | yes |  | M2O -> directus_users |
| consent_type | string | yes |  | offer/privacy/marketing/aml_notice |
| document_code | string(100) | yes |  | |
| document_version | string(50) | yes |  | |
| accepted_at | datetime | yes | now | |
| ip_address | string(64) | no |  | |
| user_agent | text | no |  | |
| metadata | json | no |  | |

### 6.1.4 login_audit_events

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| user_id | relation | no | user may be absent if failed login |
| email_attempt | string | no | |
| event_type | string | yes | login_success/login_failed/logout/password_reset |
| ip_address | string | no | |
| user_agent | text | no | |
| created_at | datetime | yes | |

## 6.2 Directory & reference collections

### 6.2.1 assets

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| code | string(20) | yes |  | PK, ex: usdt |
| symbol | string(20) | yes |  | ex: USDT |
| name | string(100) | yes |  | |
| asset_type | string | yes | crypto | crypto/stablecoin |
| precision | integer | yes | 8 | |
| is_active | boolean | yes | true | |
| sort_order | integer | yes | 100 | |
| created_at | datetime | yes | now | |

### 6.2.2 networks

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| code | string(50) | yes |  | PK, ex: trc20 |
| name | string(100) | yes |  | |
| protocol | string(50) | no |  | tron/ethereum/bitcoin |
| is_active | boolean | yes | true | |
| min_confirmations | integer | yes | 1 | |
| sort_order | integer | yes | 100 | |
| created_at | datetime | yes | now | |

### 6.2.3 asset_networks

Связующая коллекция M2M между активами и сетями.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| asset_code | relation | yes | M2O -> assets.code |
| network_code | relation | yes | M2O -> networks.code |
| is_deposit_enabled | boolean | yes | |
| is_withdrawal_enabled | boolean | yes | |
| min_amount | decimal | no | |
| max_amount | decimal | no | |
| created_at | datetime | yes | |

### 6.2.4 fiat_currencies

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| code | string(10) | yes |  | PK, ex: rub |
| symbol | string(10) | yes |  | ₽ |
| name | string(100) | yes |  | |
| precision | integer | yes | 2 | |
| is_active | boolean | yes | true | |
| created_at | datetime | yes | now | |

### 6.2.5 exchange_directions

| Field | Type | Required | Notes |
|---|---|---|---|
| code | string(20) | yes | buy / sell |
| name | string(100) | yes | |
| is_active | boolean | yes | |

### 6.2.6 exchange_pairs

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| direction_code | relation | yes | -> exchange_directions.code |
| fiat_currency_code | relation | yes | -> fiat_currencies.code |
| asset_code | relation | yes | -> assets.code |
| network_code | relation | yes | -> networks.code |
| is_active | boolean | yes | |
| min_fiat_amount | decimal | no | |
| max_fiat_amount | decimal | no | |
| min_crypto_amount | decimal | no | |
| max_crypto_amount | decimal | no | |
| sort_order | integer | yes | |

### 6.2.7 order_statuses

| Field | Type | Required | Notes |
|---|---|---|---|
| code | string(50) | yes | PK |
| name | string(150) | yes | |
| category | string(50) | yes | open/closed/intermediate/error |
| is_final | boolean | yes | |
| sort_order | integer | yes | |

### 6.2.8 rejection_reason_codes

| Field | Type | Required | Notes |
|---|---|---|---|
| code | string(100) | yes | PK |
| name | string(255) | yes | |
| is_active | boolean | yes | |

### 6.2.9 risk_flag_codes

| Field | Type | Required | Notes |
|---|---|---|---|
| code | string(100) | yes | PK |
| name | string(255) | yes | |
| severity_default | string | yes | low/medium/high/critical |
| is_active | boolean | yes | |

## 6.3 User requisites collections

### 6.3.1 wallets

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | uuid | yes | generated | PK |
| user_id | relation | yes |  | M2O -> directus_users |
| label | string(150) | yes |  | |
| asset_code | relation | yes |  | M2O -> assets.code |
| network_code | relation | yes |  | M2O -> networks.code |
| address | text | yes |  | |
| destination_tag | string(128) | no |  | memo/tag |
| status | string | yes | active | active/archived/pending_verification |
| is_default | boolean | yes | false | |
| created_at | datetime | yes | now | |
| updated_at | datetime | yes | now | |

Indexes:

- index(user_id, status)
- index(asset_code, network_code)

### 6.3.2 payout_requisites

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | uuid | yes | generated | PK |
| user_id | relation | yes |  | M2O -> directus_users |
| requisite_type | string | yes |  | bank_card/bank_account/sbp/other |
| label | string(150) | yes |  | |
| holder_name | string(200) | yes |  | |
| bank_name | string(200) | no |  | |
| masked_value | string(128) | yes |  | visible safe view |
| encrypted_payload | text | yes |  | encrypted details |
| status | string | yes | active | active/archived/pending_verification |
| is_default | boolean | yes | false | |
| created_at | datetime | yes | now | |
| updated_at | datetime | yes | now | |

### 6.3.3 requisite_verification_events

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| entity_type | string | yes | wallet/payout_requisite |
| entity_id | uuid | yes | |
| verification_status | string | yes | pending/verified/rejected |
| verified_by | relation | no | directus_users |
| comment | text | no | |
| created_at | datetime | yes | |

## 6.4 Pricing and rules collections

### 6.4.1 fee_rules

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| direction_code | relation | yes | |
| fiat_currency_code | relation | no | optional filter |
| asset_code | relation | no | optional filter |
| network_code | relation | no | optional filter |
| fee_model | string | yes | flat/percent/mixed |
| fee_percent | decimal | no | |
| fee_flat_amount | decimal | no | |
| min_fee_amount | decimal | no | |
| max_fee_amount | decimal | no | |
| is_active | boolean | yes | |
| priority | integer | yes | lower = earlier |
| valid_from | datetime | no | |
| valid_to | datetime | no | |

### 6.4.2 limit_rules

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| direction_code | relation | no | |
| asset_code | relation | no | |
| network_code | relation | no | |
| fiat_currency_code | relation | no | |
| min_amount | decimal | no | |
| max_amount | decimal | no | |
| period_type | string | no | daily/weekly/monthly/single |
| applies_to | string | yes | user/order/global |
| is_active | boolean | yes | |
| priority | integer | yes | |

### 6.4.3 automation_rules

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| name | string(200) | yes | |
| direction_code | relation | no | |
| asset_code | relation | no | |
| network_code | relation | no | |
| min_amount | decimal | no | |
| max_amount | decimal | no | |
| risk_level | string | no | |
| automation_mode | string | yes | manual/semi_auto/auto |
| is_active | boolean | yes | |
| priority | integer | yes | |

## 6.5 Orders domain collections

### 6.5.1 exchange_orders

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| id | uuid | yes | generated | PK |
| order_no | string(50) | yes | generated | unique public number |
| user_id | relation | yes |  | M2O -> directus_users |
| direction_code | relation | yes |  | -> exchange_directions.code |
| pair_id | relation | yes |  | -> exchange_pairs.id |
| fiat_currency_code | relation | yes |  | denormalized |
| asset_code | relation | yes |  | denormalized |
| network_code | relation | yes |  | denormalized |
| wallet_id | relation | no |  | user wallet |
| payout_requisite_id | relation | no |  | user payout requisite |
| amount_fiat | decimal(24,8) | no |  | |
| amount_crypto | decimal(24,8) | no |  | |
| exchange_rate | decimal(24,12) | yes |  | |
| fee_amount_fiat | decimal(24,8) | no | 0 | |
| fee_amount_crypto | decimal(24,8) | no | 0 | |
| total_payable_fiat | decimal(24,8) | no |  | |
| total_receivable_fiat | decimal(24,8) | no |  | |
| total_receivable_crypto | decimal(24,8) | no |  | |
| current_status_code | relation | yes | created | -> order_statuses.code |
| automation_mode | string | yes | manual | manual/semi_auto/auto |
| risk_level | string | yes | low | |
| quote_id | relation | no |  | -> order_quotes.id |
| wallet_snapshot | json | no |  | immutable snapshot |
| payout_snapshot | json | no |  | immutable snapshot |
| pricing_snapshot | json | yes |  | rate/fees/totals/rules |
| expires_at | datetime | no |  | |
| completed_at | datetime | no |  | |
| cancelled_at | datetime | no |  | |
| rejection_reason_code | relation | no |  | -> rejection_reason_codes.code |
| rejection_comment | text | no |  | |
| created_at | datetime | yes | now | |
| updated_at | datetime | yes | now | |

Indexes:

- unique(order_no)
- index(user_id, created_at desc)
- index(current_status_code, created_at desc)
- index(direction_code, current_status_code)
- index(asset_code, network_code)

### 6.5.2 order_quotes

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| user_id | relation | no | optional anonymous/pre-auth support |
| direction_code | relation | yes | |
| fiat_currency_code | relation | yes | |
| asset_code | relation | yes | |
| network_code | relation | yes | |
| input_amount | decimal(24,8) | yes | |
| output_amount | decimal(24,8) | yes | |
| rate | decimal(24,12) | yes | |
| fee_amount | decimal(24,8) | yes | |
| fee_model | string | yes | |
| source_payload | json | no | optional market/provider source |
| expires_at | datetime | yes | |
| created_at | datetime | yes | |

### 6.5.3 order_status_history

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| order_id | relation | yes | M2O -> exchange_orders |
| from_status_code | relation | no | -> order_statuses.code |
| to_status_code | relation | yes | -> order_statuses.code |
| actor_type | string | yes | user/operator/admin/service |
| actor_user_id | relation | no | directus_users |
| reason_code | string | no | optional machine code |
| comment | text | no | |
| metadata | json | no | |
| created_at | datetime | yes | |

### 6.5.4 order_state_transitions

Справочник допустимых переходов.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| from_status_code | relation | yes | |
| to_status_code | relation | yes | |
| actor_type | string | yes | user/operator/admin/service |
| is_active | boolean | yes | |
| operation_code | string | no | symbolic action |

### 6.5.5 internal_comments

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| order_id | relation | yes | |
| author_user_id | relation | yes | directus_users |
| author_role_code | string | yes | operator/compliance/admin |
| comment | text | yes | |
| is_private | boolean | yes | true |
| created_at | datetime | yes | |

## 6.6 Transactions collections

### 6.6.1 payment_transactions

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| order_id | relation | yes | |
| transaction_type | string | yes | incoming/outgoing |
| provider_code | string | yes | |
| provider_reference | string(255) | no | |
| provider_status | string(100) | no | raw status |
| normalized_status | string | yes | created/pending/received/confirmed/failed/cancelled |
| amount | decimal(24,8) | yes | |
| currency_code | relation | yes | -> fiat_currencies.code |
| payment_method_type | string | no | card/sbp/bank_transfer |
| raw_payload | json | no | |
| metadata | json | no | |
| received_at | datetime | no | |
| processed_at | datetime | no | |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

### 6.6.2 crypto_transactions

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| order_id | relation | yes | |
| transaction_type | string | yes | incoming/outgoing |
| provider_code | string | no | |
| tx_hash | string(255) | no | unique when available |
| address | text | yes | |
| asset_code | relation | yes | |
| network_code | relation | yes | |
| amount | decimal(24,8) | yes | |
| confirmations | integer | yes | 0 |
| required_confirmations | integer | yes | |
| provider_status | string(100) | no | |
| normalized_status | string | yes | created/pending/detected/confirmed/sent/failed |
| raw_payload | json | no | |
| detected_at | datetime | no | |
| confirmed_at | datetime | no | |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

### 6.6.3 provider_events

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| provider_code | string(50) | yes | |
| channel_type | string | yes | payment/crypto/email |
| event_type | string(100) | yes | |
| external_event_id | string(255) | no | |
| signature_valid | boolean | no | |
| checksum | string(255) | no | |
| payload | json | yes | |
| processing_status | string | yes | new/processed/duplicate/failed |
| error_message | text | no | |
| received_at | datetime | yes | |
| processed_at | datetime | no | |

Indexes:

- index(provider_code, external_event_id)
- index(processing_status, received_at)

## 6.7 Notifications and documents collections

### 6.7.1 notification_templates

| Field | Type | Required | Notes |
|---|---|---|---|
| code | string(100) | yes | PK |
| channel | string | yes | email |
| name | string(200) | yes | |
| subject | string(255) | yes | |
| body_html | text | yes | |
| body_text | text | no | |
| variable_schema | json | no | schema of expected variables |
| is_active | boolean | yes | |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

### 6.7.2 notifications

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| user_id | relation | yes | |
| order_id | relation | no | |
| channel | string | yes | email |
| template_code | relation | yes | -> notification_templates.code |
| subject | string(255) | yes | |
| payload | json | yes | rendered variables |
| status | string | yes | queued/sent/failed/cancelled |
| provider_message_id | string(255) | no | |
| retry_count | integer | yes | 0 |
| error_message | text | no | |
| queued_at | datetime | yes | |
| sent_at | datetime | no | |
| created_at | datetime | yes | |

### 6.7.3 documents

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| user_id | relation | yes | |
| order_id | relation | no | |
| document_type | string | yes | receipt/order_confirmation/payout_confirmation |
| file_name | string(255) | yes | |
| mime_type | string(100) | yes | |
| storage_disk | string(100) | yes | |
| storage_path | text | yes | |
| generation_status | string | yes | generated/failed/pending |
| generated_by | string | yes | service/operator/system |
| metadata | json | no | |
| generated_at | datetime | no | |
| sent_at | datetime | no | |
| created_at | datetime | yes | |

## 6.8 Audit, risk and system collections

### 6.8.1 audit_logs

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| entity_type | string(100) | yes | |
| entity_id | uuid | no | |
| action | string(100) | yes | |
| actor_type | string | yes | user/operator/admin/service |
| actor_user_id | relation | no | directus_users |
| before_data | json | no | |
| after_data | json | no | |
| metadata | json | no | |
| created_at | datetime | yes | |

### 6.8.2 risk_flags

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| order_id | relation | no | |
| user_id | relation | no | |
| risk_flag_code | relation | yes | -> risk_flag_codes.code |
| severity | string | yes | |
| status | string | yes | open/reviewed/resolved/dismissed |
| comment | text | no | |
| resolved_by | relation | no | directus_users |
| resolved_at | datetime | no | |
| created_at | datetime | yes | |

### 6.8.3 system_settings

| Field | Type | Required | Notes |
|---|---|---|---|
| key | string(150) | yes | PK |
| value_json | json | yes | |
| description | text | no | |
| is_public | boolean | yes | false |
| updated_at | datetime | yes | |

### 6.8.4 background_jobs

Рекомендуемая техническая коллекция для трекинга задач.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | uuid | yes | PK |
| job_type | string | yes | |
| status | string | yes | queued/running/completed/failed |
| payload | json | no | |
| result_payload | json | no | |
| error_message | text | no | |
| scheduled_at | datetime | no | |
| started_at | datetime | no | |
| finished_at | datetime | no | |
| created_at | datetime | yes | |

## 7. Relations blueprint

### 7.1 Основные relations

- directus_users 1:1 user_profiles
- directus_users 1:N user_consents
- directus_users 1:N wallets
- directus_users 1:N payout_requisites
- directus_users 1:N exchange_orders
- exchange_orders 1:N order_status_history
- exchange_orders 1:N payment_transactions
- exchange_orders 1:N crypto_transactions
- exchange_orders 1:N internal_comments
- exchange_orders 1:N notifications
- exchange_orders 1:N documents
- assets M:N networks через asset_networks
- exchange_directions 1:N exchange_pairs
- exchange_orders N:1 order_quotes

### 7.2 Relation behavior recommendations

- Для истории и аудита запретить cascade delete.
- Для справочников использовать soft deactivation, а не удаление.
- Для пользовательских реквизитов применять archive вместо hard delete.
- Snapshot fields в orders не должны ссылаться только на живые сущности; они должны хранить json-копию критичных данных.

## 8. RBAC blueprint

### 8.1 Основные роли Directus

- public
- client
- operator
- compliance
- admin
- service_account

### 8.2 Public role permissions

Разрешить:

- create registration request;
- verify email token endpoint;
- login endpoint;
- public quote endpoint при необходимости;
- чтение только публичных системных настроек и справочников, если нужно frontend.

Запретить:

- доступ к order данным;
- доступ к admin data;
- доступ к audit, risk, integrations.

### 8.3 Client role permissions

Разрешить только ownership-scoped доступ:

| Collection | Read | Create | Update | Delete |
|---|---|---|---|---|
| user_profiles | own | no | own | no |
| user_consents | own | own | no | no |
| wallets | own | own | own active/own archive | no hard delete |
| payout_requisites | own | own | own | no hard delete |
| order_quotes | own | own | no | no |
| exchange_orders | own | own | own cancel only by rule | no |
| order_status_history | own | no | no | no |
| notifications | own | no | no | no |
| documents | own | no | no | no |

Запретить доступ:

- audit_logs
- risk_flags
- internal_comments
- provider_events
- system_settings internal
- payment_transactions чужие
- crypto_transactions чужие

### 8.4 Operator role permissions

Разрешить:

- read exchange_orders all;
- read wallets and payout_requisites for orders;
- create internal_comments;
- create order_status_history via controlled action;
- read payment_transactions;
- read crypto_transactions;
- limited update exchange_orders only through custom endpoint/action;
- read notifications/documents related to orders.

Запретить:

- прямое свободное изменение pricing_snapshot;
- изменение справочников и fee_rules;
- изменение system_settings критичных.

### 8.5 Compliance role permissions

Разрешить:

- read all orders;
- read audit_logs;
- read risk_flags;
- resolve risk_flags;
- add internal comments;
- perform allowed transitions for requires_manual_review, rejected, confirmed.

### 8.6 Admin role permissions

Полный доступ ко всем бизнес-коллекциям и настройкам. При этом для критичных действий рекомендуется использовать отдельные кастомные action endpoints вместо прямого ручного редактирования записей в Studio.

### 8.7 Service account permissions

Разрешить только machine-to-machine доступ к:

- provider_events;
- payment_transactions;
- crypto_transactions;
- notifications queue;
- documents generation;
- audit_logs append;
- state transition actions.

## 9. Policies and filters

### 9.1 Ownership filters для client

Примеры policy filter:

- `user_id = $CURRENT_USER`
- для profile: `user_id.id = $CURRENT_USER`
- для documents/notifications/orders: `user_id = $CURRENT_USER`

### 9.2 Restricted fields

Client role не должна видеть:

- encrypted_payload;
- raw_payload от провайдеров;
- внутренние risk flags;
- служебные metadata, если там внутренние данные;
- internal_comments.

### 9.3 Field-level update restrictions

Client может редактировать wallet / payout_requisite только пока они не используются в locked flow, если это правило будет внедрено. Иначе при создании order всегда используется snapshot.

## 10. Flows blueprint

### 10.1 Flow: Post-registration profile bootstrap

Триггер:

- user created or user activated

Действия:

1. create user_profiles if absent;
2. create audit log event;
3. enqueue welcome/verification notification.

### 10.2 Flow: On wallet create/update

Триггер:

- wallets create/update

Действия:

1. normalize fields;
2. run validation operation;
3. set status pending_verification при необходимости;
4. create audit log.

### 10.3 Flow: On payout_requisite create/update

Действия:

1. mask visible value;
2. encrypt payload через custom hook/operation;
3. validate structure;
4. create audit log.

### 10.4 Flow: On quote create

Действия:

1. validate pair and limits;
2. set expires_at;
3. create audit event optionally;
4. return normalized quote payload.

### 10.5 Flow: On order create

Действия:

1. validate quote not expired;
2. snapshot wallet/requisite;
3. determine automation mode;
4. assign initial status created;
5. create status history row;
6. trigger instruction generation;
7. enqueue order_created notification.

### 10.6 Flow: On payment provider event

Действия:

1. store provider event;
2. verify signature через hook;
3. upsert payment transaction;
4. if payment confirmed -> create transition request;
5. create audit log.

### 10.7 Flow: On crypto provider event

Действия:

1. store provider event;
2. upsert crypto transaction;
3. update confirmations;
4. when threshold reached -> create transition request;
5. create audit log.

### 10.8 Flow: On order completed

Действия:

1. generate receipt/document job;
2. enqueue completion email;
3. update completed_at;
4. create audit log.

### 10.9 Flow: On order rejected

Действия:

1. create status history;
2. enqueue rejection notification;
3. store rejection reason;
4. create audit log.

### 10.10 Flow: On risk flag created

Действия:

1. notify operator/compliance;
2. optionally set order to requires_manual_review;
3. create audit event.

## 11. Hooks blueprint

Hooks нужны для логики, которая не должна полагаться только на declarative flows.

### 11.1 Hook: before create/update wallets

Функции:

- validate asset/network pair;
- normalize address;
- run address validation adapter if configured.

### 11.2 Hook: before create/update payout_requisites

Функции:

- normalize numbers;
- encrypt sensitive payload;
- create masked representation.

### 11.3 Hook: before create exchange_orders

Функции:

- validate quote TTL;
- validate ownership wallet/payout requisite;
- fetch automation rule;
- assemble pricing snapshot.

### 11.4 Hook: before update exchange_orders.current_status_code

Функции:

- блокировать прямую ручную смену статуса мимо state service;
- разрешать только через service account/custom endpoint.

### 11.5 Hook: before create provider_events

Функции:

- calculate checksum;
- check duplicate event;
- verify origin metadata if available.

### 11.6 Hook: after transition execution

Функции:

- write status history;
- emit notification event;
- append audit log;
- schedule downstream jobs.

## 12. Custom endpoints

Для безопасной работы платформы часть действий должна быть вынесена в custom endpoints.

### 12.1 Required custom endpoints

| Endpoint | Назначение |
|---|---|
| POST /custom/auth/register | Регистрация с доп.логикой |
| POST /custom/quotes/create | Расчёт quote через engine |
| POST /custom/orders/create | Создание заявки с полной валидацией |
| POST /custom/orders/{id}/cancel | Отмена заявки по правилам |
| POST /custom/orders/{id}/transition | Единственная точка смены статуса |
| POST /custom/orders/{id}/confirm-payment | Операторское подтверждение оплаты |
| POST /custom/orders/{id}/confirm-crypto | Операторское подтверждение крипты |
| POST /custom/orders/{id}/confirm-send | Подтверждение отправки крипты |
| POST /custom/orders/{id}/confirm-payout | Подтверждение выплаты |
| POST /custom/providers/payment/{provider}/webhook | Webhook |
| POST /custom/providers/crypto/{provider}/webhook | Webhook |
| POST /custom/documents/{orderId}/generate | Генерация документа |

### 12.2 Почему custom endpoints обязательны

Они нужны чтобы:

- инкапсулировать бизнес-логику;
- избежать прямого редактирования коллекций клиентом;
- централизовать state machine;
- обеспечить идемпотентность и auditability;
- упростить тестирование и контроль side effects.

## 13. Custom operations

Рекомендуемые operations для Directus flows:

- validate_wallet_address
- encrypt_sensitive_payload
- mask_requisite_payload
- calculate_quote
- resolve_automation_mode
- validate_order_transition
- generate_receipt_document
- enqueue_notification
- append_audit_log
- create_risk_flag
- retry_failed_notification

## 14. Custom interfaces

Для Directus Studio могут понадобиться кастомные интерфейсы:

- order timeline viewer;
- risk badge renderer;
- masked requisites viewer;
- transaction status badge;
- JSON snapshot inspector;
- workflow action panel.

## 15. State management implementation in Directus

### 15.1 Рекомендуемый подход

State machine должна храниться в двух слоях:

1. справочник `order_statuses`;
2. справочник `order_state_transitions`.

Исполнение перехода должно идти через custom service:

- validate current state;
- validate actor rights;
- validate transition rule;
- update order current_status_code;
- create order_status_history;
- create audit log;
- emit events for notifications and downstream actions.

### 15.2 Почему не только flows

Flows удобны для side effects, но не являются лучшим местом для хранения единственной бизнес-правды о state transitions. Основная state logic должна быть в extension/service code.

## 16. Encryption and secrets

### 16.1 Что должно шифроваться

- payout_requisites.encrypted_payload;
- чувствительные provider credentials;
- возможно, приватные integration tokens;
- иные PII-поля по policy.

### 16.2 Как организовать

- использовать env secret key;
- encryption/decryption только в hooks/services;
- клиенту возвращать только masked_value;
- избегать хранения чувствительных данных в открытых JSON snapshots.

## 17. Snapshot strategy

Для устойчивости бизнес-данных order должна хранить snapshot-поля:

- wallet_snapshot;
- payout_snapshot;
- pricing_snapshot;
- optional compliance_snapshot.

В snapshot нужно сохранять значения, актуальные на момент сделки, даже если пользователь потом изменит свои реквизиты.

## 18. Seed data blueprint

### 18.1 Обязательный seed

- roles;
- order_statuses;
- order_state_transitions;
- exchange_directions;
- fiat currencies;
- assets;
- networks;
- exchange_pairs;
- rejection reasons;
- risk flag codes;
- notification templates;
- system settings базового уровня.

### 18.2 Начальные order statuses

- draft
- created
- awaiting_payment
- awaiting_crypto
- payment_received
- crypto_received
- under_review
- confirmed
- processing
- payout_processing
- crypto_sending
- completed
- rejected
- cancelled
- expired
- failed
- requires_manual_review

## 19. Migration strategy

### 19.1 Подход

- Все schema changes вести через versioned migrations.
- Seed-данные разбивать на deterministic scripts.
- Продакшен-изменения сначала применять в staging.
- Любые изменения permissions должны быть снапшотированы.

### 19.2 Порядок миграций

1. base reference collections;
2. identity-related collections;
3. requisites;
4. pricing and rules;
5. orders;
6. transactions;
7. notifications/documents;
8. audit/risk/system;
9. roles and permissions;
10. flows and extensions registration.

## 20. Environment configuration

### 20.1 Обязательные env variables

```env
DIRECTUS_APP_URL=
DIRECTUS_API_URL=
KEY=
SECRET=
DB_CLIENT=pg
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USER=
DB_PASSWORD=
STORAGE_LOCATIONS=
STORAGE_S3_DRIVER=
STORAGE_S3_KEY=
STORAGE_S3_SECRET=
STORAGE_S3_BUCKET=
STORAGE_S3_REGION=
EMAIL_TRANSPORT=
EMAIL_FROM=
EMAIL_SMTP_HOST=
EMAIL_SMTP_PORT=
EMAIL_SMTP_USER=
EMAIL_SMTP_PASSWORD=
PAYMENT_PROVIDER_BASE_URL=
PAYMENT_PROVIDER_API_KEY=
PAYMENT_PROVIDER_WEBHOOK_SECRET=
CRYPTO_PROVIDER_BASE_URL=
CRYPTO_PROVIDER_API_KEY=
CRYPTO_PROVIDER_WEBHOOK_SECRET=
ENCRYPTION_KEY=
ERROR_TRACKING_DSN=
```

### 20.2 Конфигурационные system settings

В `system_settings` рекомендуется хранить:

- platform_name;
- frontend_url;
- support_email;
- quote_ttl_seconds;
- default_automation_mode;
- receipt_template_version;
- risk_review_enabled;
- manual_review_thresholds;
- notification_retry_policy.

## 21. Deployment blueprint

### 21.1 Среды

Минимальный набор сред:

- local
- dev
- staging
- production

### 21.2 Разделение окружений

Для каждой среды должны быть раздельные:

- БД;
- storage bucket;
- email credentials;
- payment provider credentials;
- crypto provider credentials;
- error tracking project;
- webhook endpoints.

### 21.3 Release process

1. apply migrations;
2. apply seed changes;
3. deploy extensions;
4. run smoke tests;
5. verify Directus health;
6. verify permissions snapshot;
7. verify webhook endpoints.

## 22. Monitoring and observability

### 22.1 Что мониторить

- количество новых заявок;
- количество заявок в requires_manual_review;
- количество stuck orders;
- количество failed notifications;
- количество failed webhooks;
- время прохождения заявки по статусам;
- число failed document generations.

### 22.2 Alert conditions

- рост failed provider events;
- backlog queued notifications;
- заявки без движения дольше SLA;
- repeated failed transitions;
- рост risk flags критичного уровня.

## 23. QA checklist for Directus setup

Перед передачей в разработку и тестирование необходимо проверить:

- все collections созданы;
- relations корректны;
- permissions ограничены по ролям;
- client не видит внутренние поля;
- operator не может обойти state machine;
- webhooks сохраняются идемпотентно;
- snapshots создаются корректно;
- audit logs записываются для всех критичных действий;
- документы и уведомления регистрируются в системе;
- seed-данные воспроизводимы.

## 24. Recommended implementation order

### Phase 1

- справочники;
- роли и permissions;
- user_profiles и consents;
- wallets и payout_requisites.

### Phase 2

- quotes;
- exchange_orders;
- order_status_history;
- state transition service.

### Phase 3

- payment_transactions;
- crypto_transactions;
- provider_events;
- webhook endpoints.

### Phase 4

- notifications;
- documents;
- audit_logs;
- risk_flags.

### Phase 5

- advanced automation rules;
- custom interfaces;
- observability hardening.

## 25. Рекомендуемые следующие артефакты

После данного Blueprint целесообразно подготовить следующие документы:

1. **Directus Field Matrix** — таблица всех полей с типами, nullable, defaults, indexes.
2. **Permissions Matrix** — подробная матрица прав по ролям и коллекциям.
3. **Flows & Extensions Spec** — точное ТЗ на hooks, endpoints и operations.
4. **OpenAPI Contract** — внешний API для frontend и интеграций.
5. **Seed & Migration Plan** — поэтапный план инициализации среды.