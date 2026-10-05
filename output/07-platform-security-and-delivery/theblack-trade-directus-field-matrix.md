## Document metadata

- Status: active
- Role: Derived reference
- Owner: Platform + Data Operations
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `directus-data-model-spec.md`
  - `field-dictionary-and-sensitive-data-classification-matrix.md`
- Related documents:
  - `theblack-trade-directus-flows-and-extensions-spec.md`
  - `theblack-trade-directus-permissions-matrix.md`

# Directus Field Matrix
## TheBlack.Trade

## 1. Назначение документа

Настоящий документ фиксирует полную матрицу полей для реализации платформы **TheBlack.Trade** в **Directus**. Документ предназначен для backend-разработчиков, Directus-интеграторов, solution architect, DevOps и QA. Matrix используется как рабочий справочник для создания collections, field schemas, relations, indexes, defaults и базовых validation rules.

## 2. Правила описания

| Колонка | Описание |
|---|---|
| Collection | Название коллекции |
| Field | Поле |
| Type | Тип поля |
| Required | Обязательность |
| Nullable | Допустимость null |
| Default | Значение по умолчанию |
| Relation | Связь |
| Indexed | Наличие индекса |
| Enum / Validation | Ограничения |
| Notes | Комментарий |

## 3. Core system note

Для аутентификации используется системная коллекция `directus_users`. Бизнес-расширение пользовательских данных выносится в `user_profiles`. Для исторических, аудиторских и транзакционных сущностей hard delete не рекомендуется.

## 4. Identity & Profile

## 4.1 directus_users

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| directus_users | id | uuid | yes | no | generated | PK | yes | unique | System PK |
| directus_users | first_name | string | no | yes |  |  | no | max 50 | Optional system field |
| directus_users | last_name | string | no | yes |  |  | no | max 50 | Optional system field |
| directus_users | email | string | yes | no |  |  | yes | unique, email format | Login identity |
| directus_users | password | password | yes | no |  |  | no | system hash | Managed by Directus |
| directus_users | status | string | yes | no | active |  | yes | invited/active/suspended/archived | Access status |
| directus_users | role | uuid | yes | no |  | M2O -> directus_roles.id | yes | existing role required | Role binding |
| directus_users | last_access | datetime | no | yes |  |  | yes |  | System field |
| directus_users | date_created | datetime | yes | no | now |  | yes |  | System field |
| directus_users | created_by | uuid | no | yes |  | M2O -> directus_users.id | yes |  | System field |
| directus_users | updated_by | uuid | no | yes |  | M2O -> directus_users.id | yes |  | System field |
| directus_users | date_updated | datetime | no | yes |  |  | yes |  | System field |

## 4.2 user_profiles

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| user_profiles | id | uuid | yes | no | generated | PK | yes | unique | |
| user_profiles | user_id | uuid | yes | no |  | O2O -> directus_users.id | yes | unique relation | One profile per user |
| user_profiles | first_name | string(100) | no | yes |  |  | no | max 100 | |
| user_profiles | last_name | string(100) | no | yes |  |  | no | max 100 | |
| user_profiles | phone | string(32) | no | yes |  |  | yes | normalized phone | |
| user_profiles | locale | string(10) | yes | no | ru-RU |  | no | locale code | |
| user_profiles | timezone | string(50) | yes | no | Europe/Moscow |  | no | tz identifier | |
| user_profiles | notification_email_enabled | boolean | yes | no | true |  | no |  | |
| user_profiles | marketing_email_enabled | boolean | yes | no | false |  | no |  | |
| user_profiles | risk_level | string | yes | no | low |  | yes | low/medium/high | Internal use |
| user_profiles | created_at | datetime | yes | no | now |  | yes |  | |
| user_profiles | updated_at | datetime | yes | no | now |  | yes |  | |

## 4.3 user_consents

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| user_consents | id | uuid | yes | no | generated | PK | yes | unique | |
| user_consents | user_id | uuid | yes | no |  | M2O -> directus_users.id | yes |  | |
| user_consents | consent_type | string | yes | no |  |  | yes | offer/privacy/marketing/aml_notice | |
| user_consents | document_code | string(100) | yes | no |  |  | yes | max 100 | |
| user_consents | document_version | string(50) | yes | no |  |  | no | max 50 | |
| user_consents | accepted_at | datetime | yes | no | now |  | yes |  | |
| user_consents | ip_address | string(64) | no | yes |  |  | no | IPv4/IPv6 text | |
| user_consents | user_agent | text | no | yes |  |  | no |  | |
| user_consents | metadata | json | no | yes |  |  | no | valid json | |

## 4.4 login_audit_events

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| login_audit_events | id | uuid | yes | no | generated | PK | yes | unique | |
| login_audit_events | user_id | uuid | no | yes |  | M2O -> directus_users.id | yes |  | failed login may not resolve user |
| login_audit_events | email_attempt | string(320) | no | yes |  |  | yes | email format if present | |
| login_audit_events | event_type | string | yes | no |  |  | yes | login_success/login_failed/logout/password_reset | |
| login_audit_events | ip_address | string(64) | no | yes |  |  | no |  | |
| login_audit_events | user_agent | text | no | yes |  |  | no |  | |
| login_audit_events | created_at | datetime | yes | no | now |  | yes |  | |

## 5. Reference collections

## 5.1 assets

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| assets | code | string(20) | yes | no |  | PK | yes | lowercase unique | PK business code |
| assets | symbol | string(20) | yes | no |  |  | yes | uppercase display | ex: USDT |
| assets | name | string(100) | yes | no |  |  | no | max 100 | |
| assets | asset_type | string | yes | no | crypto |  | yes | crypto/stablecoin | |
| assets | precision | integer | yes | no | 8 |  | no | min 0 max 18 | |
| assets | is_active | boolean | yes | no | true |  | yes |  | |
| assets | sort_order | integer | yes | no | 100 |  | yes |  | |
| assets | created_at | datetime | yes | no | now |  | yes |  | |

## 5.2 networks

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| networks | code | string(50) | yes | no |  | PK | yes | lowercase unique | ex: trc20 |
| networks | name | string(100) | yes | no |  |  | no | max 100 | |
| networks | protocol | string(50) | no | yes |  |  | yes | tron/ethereum/bitcoin | |
| networks | is_active | boolean | yes | no | true |  | yes |  | |
| networks | min_confirmations | integer | yes | no | 1 |  | no | min 0 | |
| networks | sort_order | integer | yes | no | 100 |  | yes |  | |
| networks | created_at | datetime | yes | no | now |  | yes |  | |

## 5.3 asset_networks

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| asset_networks | id | uuid | yes | no | generated | PK | yes | unique | |
| asset_networks | asset_code | string(20) | yes | no |  | M2O -> assets.code | yes | existing asset | |
| asset_networks | network_code | string(50) | yes | no |  | M2O -> networks.code | yes | existing network | |
| asset_networks | is_deposit_enabled | boolean | yes | no | true |  | no |  | |
| asset_networks | is_withdrawal_enabled | boolean | yes | no | true |  | no |  | |
| asset_networks | min_amount | decimal(24,8) | no | yes |  |  | no | positive if present | |
| asset_networks | max_amount | decimal(24,8) | no | yes |  |  | no | > min_amount if present | |
| asset_networks | created_at | datetime | yes | no | now |  | yes |  | |

## 5.4 fiat_currencies

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| fiat_currencies | code | string(10) | yes | no |  | PK | yes | lowercase unique | ex: rub |
| fiat_currencies | symbol | string(10) | yes | no |  |  | no | max 10 | ₽ |
| fiat_currencies | name | string(100) | yes | no |  |  | no | max 100 | |
| fiat_currencies | precision | integer | yes | no | 2 |  | no | min 0 max 6 | |
| fiat_currencies | is_active | boolean | yes | no | true |  | yes |  | |
| fiat_currencies | created_at | datetime | yes | no | now |  | yes |  | |

## 5.5 exchange_directions

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| exchange_directions | code | string(20) | yes | no |  | PK | yes | buy/sell | |
| exchange_directions | name | string(100) | yes | no |  |  | no | max 100 | |
| exchange_directions | is_active | boolean | yes | no | true |  | yes |  | |

## 5.6 exchange_pairs

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| exchange_pairs | id | uuid | yes | no | generated | PK | yes | unique | |
| exchange_pairs | direction_code | string(20) | yes | no |  | M2O -> exchange_directions.code | yes |  | |
| exchange_pairs | fiat_currency_code | string(10) | yes | no |  | M2O -> fiat_currencies.code | yes |  | |
| exchange_pairs | asset_code | string(20) | yes | no |  | M2O -> assets.code | yes |  | |
| exchange_pairs | network_code | string(50) | yes | no |  | M2O -> networks.code | yes |  | |
| exchange_pairs | is_active | boolean | yes | no | true |  | yes |  | |
| exchange_pairs | min_fiat_amount | decimal(24,8) | no | yes |  |  | no | positive if present | |
| exchange_pairs | max_fiat_amount | decimal(24,8) | no | yes |  |  | no | > min if present | |
| exchange_pairs | min_crypto_amount | decimal(24,8) | no | yes |  |  | no | positive if present | |
| exchange_pairs | max_crypto_amount | decimal(24,8) | no | yes |  |  | no | > min if present | |
| exchange_pairs | sort_order | integer | yes | no | 100 |  | yes |  | |

## 5.7 order_statuses

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| order_statuses | code | string(50) | yes | no |  | PK | yes | lowercase unique | |
| order_statuses | name | string(150) | yes | no |  |  | no | max 150 | |
| order_statuses | category | string(50) | yes | no |  |  | yes | open/closed/intermediate/error | |
| order_statuses | is_final | boolean | yes | no | false |  | yes |  | |
| order_statuses | sort_order | integer | yes | no | 100 |  | yes |  | |

## 5.8 rejection_reason_codes

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| rejection_reason_codes | code | string(100) | yes | no |  | PK | yes | lowercase unique | |
| rejection_reason_codes | name | string(255) | yes | no |  |  | no | max 255 | |
| rejection_reason_codes | is_active | boolean | yes | no | true |  | yes |  | |

## 5.9 risk_flag_codes

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| risk_flag_codes | code | string(100) | yes | no |  | PK | yes | lowercase unique | |
| risk_flag_codes | name | string(255) | yes | no |  |  | no | max 255 | |
| risk_flag_codes | severity_default | string | yes | no | low |  | yes | low/medium/high/critical | |
| risk_flag_codes | is_active | boolean | yes | no | true |  | yes |  | |

## 6. User requisites

## 6.1 wallets

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| wallets | id | uuid | yes | no | generated | PK | yes | unique | |
| wallets | user_id | uuid | yes | no |  | M2O -> directus_users.id | yes |  | ownership |
| wallets | label | string(150) | yes | no |  |  | no | max 150 | |
| wallets | asset_code | string(20) | yes | no |  | M2O -> assets.code | yes |  | |
| wallets | network_code | string(50) | yes | no |  | M2O -> networks.code | yes |  | |
| wallets | address | text | yes | no |  |  | yes | provider validator | |
| wallets | destination_tag | string(128) | no | yes |  |  | no | memo/tag optional | |
| wallets | status | string | yes | no | active |  | yes | active/archived/pending_verification | |
| wallets | is_default | boolean | yes | no | false |  | yes |  | |
| wallets | created_at | datetime | yes | no | now |  | yes |  | |
| wallets | updated_at | datetime | yes | no | now |  | yes |  | |

## 6.2 payout_requisites

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| payout_requisites | id | uuid | yes | no | generated | PK | yes | unique | |
| payout_requisites | user_id | uuid | yes | no |  | M2O -> directus_users.id | yes |  | ownership |
| payout_requisites | requisite_type | string | yes | no |  |  | yes | bank_card/bank_account/sbp/other | |
| payout_requisites | label | string(150) | yes | no |  |  | no | max 150 | |
| payout_requisites | holder_name | string(200) | yes | no |  |  | no | max 200 | |
| payout_requisites | bank_name | string(200) | no | yes |  |  | no | max 200 | |
| payout_requisites | masked_value | string(128) | yes | no |  |  | yes | safe presentation | |
| payout_requisites | encrypted_payload | text | yes | no |  |  | no | encrypted only | hidden field |
| payout_requisites | status | string | yes | no | active |  | yes | active/archived/pending_verification | |
| payout_requisites | is_default | boolean | yes | no | false |  | yes |  | |
| payout_requisites | created_at | datetime | yes | no | now |  | yes |  | |
| payout_requisites | updated_at | datetime | yes | no | now |  | yes |  | |

## 6.3 requisite_verification_events

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| requisite_verification_events | id | uuid | yes | no | generated | PK | yes | unique | |
| requisite_verification_events | entity_type | string | yes | no |  |  | yes | wallet/payout_requisite | |
| requisite_verification_events | entity_id | uuid | yes | no |  |  | yes | existing entity by type | polymorphic link |
| requisite_verification_events | verification_status | string | yes | no | pending |  | yes | pending/verified/rejected | |
| requisite_verification_events | verified_by | uuid | no | yes |  | M2O -> directus_users.id | yes | staff user | |
| requisite_verification_events | comment | text | no | yes |  |  | no |  | |
| requisite_verification_events | created_at | datetime | yes | no | now |  | yes |  | |

## 7. Pricing & rules

## 7.1 fee_rules

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| fee_rules | id | uuid | yes | no | generated | PK | yes | unique | |
| fee_rules | direction_code | string(20) | yes | no |  | M2O -> exchange_directions.code | yes |  | |
| fee_rules | fiat_currency_code | string(10) | no | yes |  | M2O -> fiat_currencies.code | yes | optional filter | |
| fee_rules | asset_code | string(20) | no | yes |  | M2O -> assets.code | yes | optional filter | |
| fee_rules | network_code | string(50) | no | yes |  | M2O -> networks.code | yes | optional filter | |
| fee_rules | fee_model | string | yes | no |  |  | yes | flat/percent/mixed | |
| fee_rules | fee_percent | decimal(12,6) | no | yes |  |  | no | >=0 | |
| fee_rules | fee_flat_amount | decimal(24,8) | no | yes |  |  | no | >=0 | |
| fee_rules | min_fee_amount | decimal(24,8) | no | yes |  |  | no | >=0 | |
| fee_rules | max_fee_amount | decimal(24,8) | no | yes |  |  | no | >= min_fee | |
| fee_rules | is_active | boolean | yes | no | true |  | yes |  | |
| fee_rules | priority | integer | yes | no | 100 |  | yes | lower first | |
| fee_rules | valid_from | datetime | no | yes |  |  | yes |  | |
| fee_rules | valid_to | datetime | no | yes |  |  | yes | > valid_from | |

## 7.2 limit_rules

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| limit_rules | id | uuid | yes | no | generated | PK | yes | unique | |
| limit_rules | direction_code | string(20) | no | yes |  | M2O -> exchange_directions.code | yes |  | |
| limit_rules | asset_code | string(20) | no | yes |  | M2O -> assets.code | yes |  | |
| limit_rules | network_code | string(50) | no | yes |  | M2O -> networks.code | yes |  | |
| limit_rules | fiat_currency_code | string(10) | no | yes |  | M2O -> fiat_currencies.code | yes |  | |
| limit_rules | min_amount | decimal(24,8) | no | yes |  |  | no | >=0 | |
| limit_rules | max_amount | decimal(24,8) | no | yes |  |  | no | >= min | |
| limit_rules | period_type | string | no | yes |  |  | yes | daily/weekly/monthly/single | |
| limit_rules | applies_to | string | yes | no | order |  | yes | user/order/global | |
| limit_rules | is_active | boolean | yes | no | true |  | yes |  | |
| limit_rules | priority | integer | yes | no | 100 |  | yes | lower first | |

## 7.3 automation_rules

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| automation_rules | id | uuid | yes | no | generated | PK | yes | unique | |
| automation_rules | name | string(200) | yes | no |  |  | no | max 200 | |
| automation_rules | direction_code | string(20) | no | yes |  | M2O -> exchange_directions.code | yes |  | |
| automation_rules | asset_code | string(20) | no | yes |  | M2O -> assets.code | yes |  | |
| automation_rules | network_code | string(50) | no | yes |  | M2O -> networks.code | yes |  | |
| automation_rules | min_amount | decimal(24,8) | no | yes |  |  | no | >=0 | |
| automation_rules | max_amount | decimal(24,8) | no | yes |  |  | no | >= min | |
| automation_rules | risk_level | string | no | yes |  |  | yes | low/medium/high | |
| automation_rules | automation_mode | string | yes | no | manual |  | yes | manual/semi_auto/auto | |
| automation_rules | is_active | boolean | yes | no | true |  | yes |  | |
| automation_rules | priority | integer | yes | no | 100 |  | yes | lower first | |

## 8. Orders domain

## 8.1 exchange_orders

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| exchange_orders | id | uuid | yes | no | generated | PK | yes | unique | |
| exchange_orders | order_no | string(50) | yes | no | generated |  | yes | unique | Public order number |
| exchange_orders | user_id | uuid | yes | no |  | M2O -> directus_users.id | yes |  | ownership |
| exchange_orders | direction_code | string(20) | yes | no |  | M2O -> exchange_directions.code | yes | buy/sell | |
| exchange_orders | pair_id | uuid | yes | no |  | M2O -> exchange_pairs.id | yes |  | |
| exchange_orders | fiat_currency_code | string(10) | yes | no |  | M2O -> fiat_currencies.code | yes |  | denormalized |
| exchange_orders | asset_code | string(20) | yes | no |  | M2O -> assets.code | yes |  | denormalized |
| exchange_orders | network_code | string(50) | yes | no |  | M2O -> networks.code | yes |  | denormalized |
| exchange_orders | wallet_id | uuid | no | yes |  | M2O -> wallets.id | yes |  | for buy |
| exchange_orders | payout_requisite_id | uuid | no | yes |  | M2O -> payout_requisites.id | yes |  | for sell |
| exchange_orders | amount_fiat | decimal(24,8) | no | yes |  |  | no | >0 if present | |
| exchange_orders | amount_crypto | decimal(24,8) | no | yes |  |  | no | >0 if present | |
| exchange_orders | exchange_rate | decimal(24,12) | yes | no |  |  | no | >0 | |
| exchange_orders | fee_amount_fiat | decimal(24,8) | no | no | 0 |  | no | >=0 | |
| exchange_orders | fee_amount_crypto | decimal(24,8) | no | no | 0 |  | no | >=0 | |
| exchange_orders | total_payable_fiat | decimal(24,8) | no | yes |  |  | no | >=0 | |
| exchange_orders | total_receivable_fiat | decimal(24,8) | no | yes |  |  | no | >=0 | |
| exchange_orders | total_receivable_crypto | decimal(24,8) | no | yes |  |  | no | >=0 | |
| exchange_orders | current_status_code | string(50) | yes | no | created | M2O -> order_statuses.code | yes | existing status | set via workflow |
| exchange_orders | automation_mode | string | yes | no | manual |  | yes | manual/semi_auto/auto | |
| exchange_orders | risk_level | string | yes | no | low |  | yes | low/medium/high | internal |
| exchange_orders | quote_id | uuid | no | yes |  | M2O -> order_quotes.id | yes |  | |
| exchange_orders | wallet_snapshot | json | no | yes |  |  | no | valid json | immutable snapshot |
| exchange_orders | payout_snapshot | json | no | yes |  |  | no | valid json | immutable snapshot |
| exchange_orders | pricing_snapshot | json | yes | no |  |  | no | valid json | immutable snapshot |
| exchange_orders | expires_at | datetime | no | yes |  |  | yes |  | quote/order ttl |
| exchange_orders | completed_at | datetime | no | yes |  |  | yes |  | |
| exchange_orders | cancelled_at | datetime | no | yes |  |  | yes |  | |
| exchange_orders | rejection_reason_code | string(100) | no | yes |  | M2O -> rejection_reason_codes.code | yes |  | |
| exchange_orders | rejection_comment | text | no | yes |  |  | no |  | |
| exchange_orders | created_at | datetime | yes | no | now |  | yes |  | |
| exchange_orders | updated_at | datetime | yes | no | now |  | yes |  | |

## 8.2 order_quotes

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| order_quotes | id | uuid | yes | no | generated | PK | yes | unique | |
| order_quotes | user_id | uuid | no | yes |  | M2O -> directus_users.id | yes |  | optional pre-auth support |
| order_quotes | direction_code | string(20) | yes | no |  | M2O -> exchange_directions.code | yes |  | |
| order_quotes | fiat_currency_code | string(10) | yes | no |  | M2O -> fiat_currencies.code | yes |  | |
| order_quotes | asset_code | string(20) | yes | no |  | M2O -> assets.code | yes |  | |
| order_quotes | network_code | string(50) | yes | no |  | M2O -> networks.code | yes |  | |
| order_quotes | input_amount | decimal(24,8) | yes | no |  |  | no | >0 | |
| order_quotes | output_amount | decimal(24,8) | yes | no |  |  | no | >0 | |
| order_quotes | rate | decimal(24,12) | yes | no |  |  | no | >0 | |
| order_quotes | fee_amount | decimal(24,8) | yes | no |  |  | no | >=0 | |
| order_quotes | fee_model | string | yes | no |  |  | yes | flat/percent/mixed | |
| order_quotes | source_payload | json | no | yes |  |  | no | valid json | optional source trace |
| order_quotes | expires_at | datetime | yes | no |  |  | yes | > created_at | |
| order_quotes | created_at | datetime | yes | no | now |  | yes |  | |

## 8.3 order_status_history

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| order_status_history | id | uuid | yes | no | generated | PK | yes | unique | |
| order_status_history | order_id | uuid | yes | no |  | M2O -> exchange_orders.id | yes |  | |
| order_status_history | from_status_code | string(50) | no | yes |  | M2O -> order_statuses.code | yes |  | |
| order_status_history | to_status_code | string(50) | yes | no |  | M2O -> order_statuses.code | yes |  | |
| order_status_history | actor_type | string | yes | no |  |  | yes | user/operator/admin/service | |
| order_status_history | actor_user_id | uuid | no | yes |  | M2O -> directus_users.id | yes |  | |
| order_status_history | reason_code | string(100) | no | yes |  |  | yes | symbolic code | |
| order_status_history | comment | text | no | yes |  |  | no |  | |
| order_status_history | metadata | json | no | yes |  |  | no | valid json | |
| order_status_history | created_at | datetime | yes | no | now |  | yes |  | |

## 8.4 order_state_transitions

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| order_state_transitions | id | uuid | yes | no | generated | PK | yes | unique | |
| order_state_transitions | from_status_code | string(50) | yes | no |  | M2O -> order_statuses.code | yes |  | |
| order_state_transitions | to_status_code | string(50) | yes | no |  | M2O -> order_statuses.code | yes |  | |
| order_state_transitions | actor_type | string | yes | no |  |  | yes | user/operator/admin/service | |
| order_state_transitions | is_active | boolean | yes | no | true |  | yes |  | |
| order_state_transitions | operation_code | string(100) | no | yes |  |  | yes | symbolic action | |

## 8.5 internal_comments

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| internal_comments | id | uuid | yes | no | generated | PK | yes | unique | |
| internal_comments | order_id | uuid | yes | no |  | M2O -> exchange_orders.id | yes |  | |
| internal_comments | author_user_id | uuid | yes | no |  | M2O -> directus_users.id | yes |  | |
| internal_comments | author_role_code | string | yes | no |  |  | yes | operator/compliance/admin | |
| internal_comments | comment | text | yes | no |  |  | no | non-empty | |
| internal_comments | is_private | boolean | yes | no | true |  | no |  | |
| internal_comments | created_at | datetime | yes | no | now |  | yes |  | |

## 9. Transactions

## 9.1 payment_transactions

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| payment_transactions | id | uuid | yes | no | generated | PK | yes | unique | |
| payment_transactions | order_id | uuid | yes | no |  | M2O -> exchange_orders.id | yes |  | |
| payment_transactions | transaction_type | string | yes | no |  |  | yes | incoming/outgoing | |
| payment_transactions | provider_code | string(50) | yes | no |  |  | yes | lowercase code | |
| payment_transactions | provider_reference | string(255) | no | yes |  |  | yes |  | provider payment id |
| payment_transactions | provider_status | string(100) | no | yes |  |  | yes | raw status | |
| payment_transactions | normalized_status | string | yes | no | created |  | yes | created/pending/received/confirmed/failed/cancelled | workflow controlled |
| payment_transactions | amount | decimal(24,8) | yes | no |  |  | no | >0 | |
| payment_transactions | currency_code | string(10) | yes | no |  | M2O -> fiat_currencies.code | yes |  | |
| payment_transactions | payment_method_type | string | no | yes |  |  | yes | card/sbp/bank_transfer | |
| payment_transactions | raw_payload | json | no | yes |  |  | no | valid json | sensitive |
| payment_transactions | metadata | json | no | yes |  |  | no | valid json | |
| payment_transactions | received_at | datetime | no | yes |  |  | yes |  | |
| payment_transactions | processed_at | datetime | no | yes |  |  | yes |  | |
| payment_transactions | created_at | datetime | yes | no | now |  | yes |  | |
| payment_transactions | updated_at | datetime | yes | no | now |  | yes |  | |

## 9.2 crypto_transactions

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| crypto_transactions | id | uuid | yes | no | generated | PK | yes | unique | |
| crypto_transactions | order_id | uuid | yes | no |  | M2O -> exchange_orders.id | yes |  | |
| crypto_transactions | transaction_type | string | yes | no |  |  | yes | incoming/outgoing | |
| crypto_transactions | provider_code | string(50) | no | yes |  |  | yes | lowercase code | |
| crypto_transactions | tx_hash | string(255) | no | yes |  |  | yes | unique when present | |
| crypto_transactions | address | text | yes | no |  |  | yes | non-empty | |
| crypto_transactions | asset_code | string(20) | yes | no |  | M2O -> assets.code | yes |  | |
| crypto_transactions | network_code | string(50) | yes | no |  | M2O -> networks.code | yes |  | |
| crypto_transactions | amount | decimal(24,8) | yes | no |  |  | no | >0 | |
| crypto_transactions | confirmations | integer | yes | no | 0 |  | no | >=0 | |
| crypto_transactions | required_confirmations | integer | yes | no | 1 |  | no | >=0 | |
| crypto_transactions | provider_status | string(100) | no | yes |  |  | yes | raw provider status | |
| crypto_transactions | normalized_status | string | yes | no | created |  | yes | created/pending/detected/confirmed/sent/failed | |
| crypto_transactions | raw_payload | json | no | yes |  |  | no | valid json | sensitive |
| crypto_transactions | detected_at | datetime | no | yes |  |  | yes |  | |
| crypto_transactions | confirmed_at | datetime | no | yes |  |  | yes |  | |
| crypto_transactions | created_at | datetime | yes | no | now |  | yes |  | |
| crypto_transactions | updated_at | datetime | yes | no | now |  | yes |  | |

## 9.3 provider_events

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| provider_events | id | uuid | yes | no | generated | PK | yes | unique | |
| provider_events | provider_code | string(50) | yes | no |  |  | yes | lowercase code | |
| provider_events | channel_type | string | yes | no |  |  | yes | payment/crypto/email | |
| provider_events | event_type | string(100) | yes | no |  |  | yes | provider event name | |
| provider_events | external_event_id | string(255) | no | yes |  |  | yes |  | dedup target |
| provider_events | signature_valid | boolean | no | yes |  |  | yes |  | |
| provider_events | checksum | string(255) | no | yes |  |  | yes |  | dedup target |
| provider_events | payload | json | yes | no |  |  | no | valid json | raw event |
| provider_events | processing_status | string | yes | no | new |  | yes | new/processed/duplicate/failed | |
| provider_events | error_message | text | no | yes |  |  | no |  | |
| provider_events | received_at | datetime | yes | no | now |  | yes |  | |
| provider_events | processed_at | datetime | no | yes |  |  | yes |  | |

## 10. Notifications & documents

## 10.1 notification_templates

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| notification_templates | code | string(100) | yes | no |  | PK | yes | lowercase unique | |
| notification_templates | channel | string | yes | no | email |  | yes | email | |
| notification_templates | name | string(200) | yes | no |  |  | no | max 200 | |
| notification_templates | subject | string(255) | yes | no |  |  | no | max 255 | |
| notification_templates | body_html | text | yes | no |  |  | no | template html | |
| notification_templates | body_text | text | no | yes |  |  | no |  | |
| notification_templates | variable_schema | json | no | yes |  |  | no | json schema | |
| notification_templates | is_active | boolean | yes | no | true |  | yes |  | |
| notification_templates | created_at | datetime | yes | no | now |  | yes |  | |
| notification_templates | updated_at | datetime | yes | no | now |  | yes |  | |

## 10.2 notifications

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| notifications | id | uuid | yes | no | generated | PK | yes | unique | |
| notifications | user_id | uuid | yes | no |  | M2O -> directus_users.id | yes |  | |
| notifications | order_id | uuid | no | yes |  | M2O -> exchange_orders.id | yes |  | |
| notifications | channel | string | yes | no | email |  | yes | email | |
| notifications | template_code | string(100) | yes | no |  | M2O -> notification_templates.code | yes |  | |
| notifications | subject | string(255) | yes | no |  |  | no | max 255 | |
| notifications | payload | json | yes | no |  |  | no | valid json | rendered vars |
| notifications | status | string | yes | no | queued |  | yes | queued/sent/failed/cancelled | |
| notifications | provider_message_id | string(255) | no | yes |  |  | yes |  | |
| notifications | retry_count | integer | yes | no | 0 |  | no | >=0 | |
| notifications | error_message | text | no | yes |  |  | no |  | |
| notifications | queued_at | datetime | yes | no | now |  | yes |  | |
| notifications | sent_at | datetime | no | yes |  |  | yes |  | |
| notifications | created_at | datetime | yes | no | now |  | yes |  | |

## 10.3 documents

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| documents | id | uuid | yes | no | generated | PK | yes | unique | |
| documents | user_id | uuid | yes | no |  | M2O -> directus_users.id | yes |  | |
| documents | order_id | uuid | no | yes |  | M2O -> exchange_orders.id | yes |  | |
| documents | document_type | string | yes | no |  |  | yes | receipt/order_confirmation/payout_confirmation/other | |
| documents | file_name | string(255) | yes | no |  |  | no | max 255 | |
| documents | mime_type | string(100) | yes | no |  |  | no | valid mime | |
| documents | storage_disk | string(100) | yes | no |  |  | no | disk code | |
| documents | storage_path | text | yes | no |  |  | yes | non-empty | |
| documents | generation_status | string | yes | no | generated |  | yes | generated/failed/pending | |
| documents | generated_by | string | yes | no | service |  | yes | service/operator/system | |
| documents | metadata | json | no | yes |  |  | no | valid json | |
| documents | generated_at | datetime | no | yes |  |  | yes |  | |
| documents | sent_at | datetime | no | yes |  |  | yes |  | |
| documents | created_at | datetime | yes | no | now |  | yes |  | |

## 11. Audit, risk & system

## 11.1 audit_logs

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| audit_logs | id | uuid | yes | no | generated | PK | yes | unique | |
| audit_logs | entity_type | string(100) | yes | no |  |  | yes | lowercase recommended | |
| audit_logs | entity_id | uuid | no | yes |  |  | yes |  | |
| audit_logs | action | string(100) | yes | no |  |  | yes | action code | |
| audit_logs | actor_type | string | yes | no |  |  | yes | user/operator/admin/service | |
| audit_logs | actor_user_id | uuid | no | yes |  | M2O -> directus_users.id | yes |  | |
| audit_logs | before_data | json | no | yes |  |  | no | valid json | |
| audit_logs | after_data | json | no | yes |  |  | no | valid json | |
| audit_logs | metadata | json | no | yes |  |  | no | valid json | |
| audit_logs | created_at | datetime | yes | no | now |  | yes |  | |

## 11.2 risk_flags

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| risk_flags | id | uuid | yes | no | generated | PK | yes | unique | |
| risk_flags | order_id | uuid | no | yes |  | M2O -> exchange_orders.id | yes |  | |
| risk_flags | user_id | uuid | no | yes |  | M2O -> directus_users.id | yes |  | |
| risk_flags | risk_flag_code | string(100) | yes | no |  | M2O -> risk_flag_codes.code | yes |  | |
| risk_flags | severity | string | yes | no | low |  | yes | low/medium/high/critical | |
| risk_flags | status | string | yes | no | open |  | yes | open/reviewed/resolved/dismissed | |
| risk_flags | comment | text | no | yes |  |  | no |  | |
| risk_flags | resolved_by | uuid | no | yes |  | M2O -> directus_users.id | yes |  | |
| risk_flags | resolved_at | datetime | no | yes |  |  | yes |  | |
| risk_flags | created_at | datetime | yes | no | now |  | yes |  | |

## 11.3 system_settings

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| system_settings | key | string(150) | yes | no |  | PK | yes | lowercase unique | |
| system_settings | value_json | json | yes | no |  |  | no | valid json | |
| system_settings | description | text | no | yes |  |  | no |  | |
| system_settings | is_public | boolean | yes | no | false |  | yes |  | |
| system_settings | updated_at | datetime | yes | no | now |  | yes |  | |

## 11.4 background_jobs

| Collection | Field | Type | Required | Nullable | Default | Relation | Indexed | Enum / Validation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| background_jobs | id | uuid | yes | no | generated | PK | yes | unique | |
| background_jobs | job_type | string(100) | yes | no |  |  | yes | job code | |
| background_jobs | status | string | yes | no | queued |  | yes | queued/running/completed/failed | |
| background_jobs | payload | json | no | yes |  |  | no | valid json | |
| background_jobs | result_payload | json | no | yes |  |  | no | valid json | |
| background_jobs | error_message | text | no | yes |  |  | no |  | |
| background_jobs | scheduled_at | datetime | no | yes |  |  | yes |  | |
| background_jobs | started_at | datetime | no | yes |  |  | yes |  | |
| background_jobs | finished_at | datetime | no | yes |  |  | yes |  | |
| background_jobs | created_at | datetime | yes | no | now |  | yes |  | |

## 12. Recommended compound indexes

Рекомендуемые составные индексы:

| Collection | Index |
|---|---|
| wallets | (user_id, status) |
| payout_requisites | (user_id, status) |
| exchange_orders | (user_id, created_at desc) |
| exchange_orders | (current_status_code, created_at desc) |
| exchange_orders | (direction_code, current_status_code) |
| exchange_orders | (asset_code, network_code) |
| order_quotes | (user_id, created_at desc) |
| order_status_history | (order_id, created_at desc) |
| payment_transactions | (order_id, normalized_status) |
| payment_transactions | (provider_code, provider_reference) |
| crypto_transactions | (order_id, normalized_status) |
| crypto_transactions | (tx_hash) |
| provider_events | (provider_code, external_event_id) |
| provider_events | (processing_status, received_at) |
| notifications | (user_id, created_at desc) |
| notifications | (status, queued_at) |
| documents | (user_id, created_at desc) |
| risk_flags | (status, severity, created_at desc) |
| audit_logs | (entity_type, entity_id, created_at desc) |

## 13. Minimum validation rules

Базовые валидации, которые рекомендуется дополнительно реализовать в hooks/services:

- `wallets.address` — валидация по типу сети;
- `payout_requisites.encrypted_payload` — обязательное шифрование;
- `exchange_orders.current_status_code` — изменение только через state service;
- `exchange_orders.pricing_snapshot` — обязательное заполнение при создании;
- `payment_transactions.normalized_status` — только через provider/transition workflow;
- `crypto_transactions.normalized_status` — только через provider/transition workflow;
- `provider_events` — дедупликация по checksum и/или external_event_id;
- `documents.storage_path` — непустой путь к файлу;
- `risk_flags.status` — ограниченный набор разрешённых переходов.

## 14. Recommended next artifact

После этой матрицы наиболее практичный следующий документ — **Flows & Extensions Spec**. В нём нужно точно описать:

- custom endpoints;
- hooks;
- custom operations;
- services;
- state transition logic;
- webhook processing lifecycle;
- notification and document generation pipeline.