# Directus Data Model Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: Platform + Data Architecture
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `data-model-canonical-entities-spec.md`
  - `canonical-erd-and-field-dictionary-spec.md`
- Related documents:
  - `theblack-trade-directus-field-matrix.md`
  - `theblack-trade-directus-implementation-blueprint.md`

## 1. Purpose

This document defines the recommended Directus data model for TheBlack.Trade. It describes collections, field structures, relationships, indexing strategy, status modeling, permissions guidance, audit considerations, and implementation notes for operating a fiat-to-crypto exchange platform with manual-review-first workflows.

The model is designed to support:

- customer accounts;
- KYC workflow;
- buy and sell quotes;
- orders and lifecycle tracking;
- wallet and exchange connections;
- fiat payment and crypto transfer evidence;
- operator/admin review flows;
- receipt metadata;
- notifications and operational auditability.

## 2. Architectural modeling principles

### 2.1 Source of truth boundaries

Directus should be used as the operational data layer and administrative control plane for:

- master data;
- transactional records;
- review status management;
- audit-friendly operator actions;
- CMS-configurable content where appropriate.

Sensitive provider secrets, raw payment secrets, and regulated document binary storage strategy may require adjacent secure services or object storage, while Directus stores references and metadata.

### 2.2 Modeling goals

The model must:

- preserve transaction traceability;
- support manual operator review;
- keep buy/sell flows explicit;
- avoid overloaded generic tables where domain meaning matters;
- support status-driven frontend and admin UX;
- allow later automation without breaking MVP records.

## 3. Collection overview

Recommended collections:

| Collection | Type | Purpose |
|---|---|---|
| `users` | core | Customer/operator/admin accounts |
| `user_profiles` | domain | Extended customer profile data |
| `kyc_applications` | domain | KYC applications and statuses |
| `kyc_application_files` | domain | File references attached to KYC submissions |
| `assets` | reference | Supported fiat and crypto assets |
| `asset_networks` | reference | Networks per crypto asset |
| `wallet_connections` | domain | Saved wallet addresses and exchange links |
| `quotes` | transactional | Time-limited pricing snapshots |
| `orders` | transactional | Buy/sell order master record |
| `order_timeline_events` | transactional | Timeline log for state visualization |
| `payment_records` | transactional | Fiat payment or crypto transfer evidence |
| `receipts` | transactional | Receipt metadata and issue status |
| `notifications` | operational | Email/notification tracking |
| `operator_actions` | audit | Explicit operator/admin action log |
| `system_settings` | config | Runtime business configuration |
| `support_requests` | optional operational | Future support and dispute handling |

## 4. Users and profile model

## 4.1 `users`

Recommended approach:

Use Directus native `directus_users` if possible for authentication identity, roles, and permissions. Extend business data through `user_profiles` rather than overloading the auth user table with many domain fields.

### Suggested key fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | string | Unique, login identity |
| `password` | handled by Directus/auth layer | Not manually modeled |
| `status` | string | `active`, `suspended`, `invited`, etc. |
| `role` | m2o role | Directus role binding |
| `last_access` | datetime | Audit and ops use |

## 4.2 `user_profiles`

Stores extended customer information separate from auth identity.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | M2O → `users` | Yes | One profile per user |
| `first_name` | string | Yes | |
| `last_name` | string | Yes | |
| `phone` | string | No | |
| `date_of_birth` | date | No | Keep nullable until KYC sync if needed |
| `country_code` | string(2) | No | ISO country code |
| `city` | string | No | |
| `address_line` | text | No | |
| `postal_code` | string | No | |
| `kyc_status` | string | Yes | Denormalized fast-access state |
| `risk_level` | string | Yes | `low`, `medium`, `high`, `critical` |
| `marketing_email_opt_in` | boolean | No | Default false |
| `created_at` | datetime | Yes | |
| `updated_at` | datetime | Yes | |

### Notes

- `kyc_status` is denormalized for fast route guards and dashboards, but canonical history remains in `kyc_applications`.
- `risk_level` may be operator-assigned or automation-assigned later.

## 5. KYC model

## 5.1 `kyc_applications`

Each submission or resubmission should be represented as a separate application row to preserve history.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | M2O → `users` | Yes | Applicant |
| `status` | string | Yes | `pending`, `in_review`, `approved`, `rejected`, `resubmission_required` |
| `document_type` | string | Yes | `passport_rf`, `international_passport`, `residence_permit` |
| `document_number` | string | Yes | Consider masked storage/display strategy |
| `issued_country` | string(2) | Yes | ISO code |
| `residency_country` | string(2) | Yes | ISO code |
| `tax_id` | string | No | Optional |
| `full_address` | text | Yes | |
| `date_of_birth` | date | Yes | |
| `review_comment` | text | No | Internal note |
| `rejection_reason` | text | No | User-facing reason when applicable |
| `reviewed_by` | M2O → `users` | No | Operator/admin |
| `reviewed_at` | datetime | No | |
| `submitted_at` | datetime | Yes | |
| `created_at` | datetime | Yes | |
| `updated_at` | datetime | Yes | |

### Rules

- Only one current active application should be considered latest; history must remain immutable except for review fields.
- Approval should update `user_profiles.kyc_status` to `approved`.

## 5.2 `kyc_application_files`

Stores metadata and file references linked to a KYC application.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `kyc_application_id` | M2O → `kyc_applications` | Yes | |
| `directus_file_id` | M2O → `directus_files` | Yes | File reference |
| `file_type` | string | Yes | `document_front`, `document_back`, `selfie`, `proof_of_address` |
| `created_at` | datetime | Yes | |

### Notes

- Use Directus file storage or external object storage integration.
- Access to these files must be tightly restricted by role and policy.

## 6. Asset reference model

## 6.1 `assets`

Reference collection for both fiat and crypto assets.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `code` | string | Yes | Unique, e.g. `RUB`, `USDT`, `BTC` |
| `name` | string | Yes | Human-readable name |
| `type` | string | Yes | `fiat` or `crypto` |
| `enabled` | boolean | Yes | Can be traded |
| `sort_order` | integer | No | UI ordering |
| `created_at` | datetime | Yes | |
| `updated_at` | datetime | Yes | |

### Constraints

- `code` unique index.
- Only `enabled = true` assets appear in client selection lists.

## 6.2 `asset_networks`

Defines supported networks for crypto assets.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `asset_id` | M2O → `assets` | Yes | Must reference crypto asset |
| `network_code` | string | Yes | `TRON`, `ETHEREUM`, `BITCOIN`, `TON` |
| `display_name` | string | Yes | e.g. `TRC20` |
| `enabled` | boolean | Yes | |
| `memo_required` | boolean | Yes | Default false |
| `warning_text` | text | No | UI transfer warning |
| `created_at` | datetime | Yes | |
| `updated_at` | datetime | Yes | |

## 7. Wallet and exchange connection model

## 7.1 `wallet_connections`

Stores reusable customer wallet destinations or exchange-linked identifiers.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | M2O → `users` | Yes | Owner |
| `type` | string | Yes | `wallet_address`, `exchange_account` |
| `provider_name` | string | Yes | e.g. wallet name or exchange brand |
| `asset_id` | M2O → `assets` | Yes | Crypto asset |
| `asset_network_id` | M2O → `asset_networks` | No | Required for network-specific wallet address |
| `wallet_address` | string | No | Raw value should be access-controlled |
| `wallet_address_masked` | string | No | Precomputed masked display |
| `exchange_account_id` | string | No | Raw or normalized value |
| `exchange_account_id_masked` | string | No | Display-safe value |
| `api_key_reference` | string | No | Reference only, not raw secret |
| `label` | string | No | User-friendly name |
| `is_default` | boolean | Yes | Default false |
| `verification_status` | string | Yes | `pending_verification`, `verified`, `rejected` |
| `verification_comment` | text | No | Internal / support note |
| `created_at` | datetime | Yes | |
| `updated_at` | datetime | Yes | |

### Constraints

- At least one of `wallet_address` or `exchange_account_id` must be present according to `type`.
- Consider uniqueness rule by `(user_id, type, asset_id, wallet_address)` for wallet-type records.

## 8. Quote model

## 8.1 `quotes`

Quotes are immutable pricing snapshots used for order creation.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | M2O → `users` | No | Nullable if anonymous preview is allowed |
| `side` | string | Yes | `buy` or `sell` |
| `fiat_asset_id` | M2O → `assets` | Yes | Typically RUB |
| `crypto_asset_id` | M2O → `assets` | Yes | Target/source crypto |
| `asset_network_id` | M2O → `asset_networks` | No | Optional depending on asset |
| `amount_type` | string | Yes | `fiat` or `crypto` |
| `requested_amount` | decimal(24,8) | Yes | Input amount |
| `fiat_amount` | decimal(24,8) | Yes | |
| `crypto_amount` | decimal(24,8) | Yes | |
| `rate` | decimal(24,8) | Yes | |
| `fee_amount` | decimal(24,8) | Yes | |
| `total_amount` | decimal(24,8) | Yes | |
| `payment_method` | string | No | `sbp`, `bank_card`, `bank_transfer` |
| `settlement_method` | string | No | same enum family |
| `slippage_percent` | decimal(8,4) | No | Optional |
| `expires_at` | datetime | Yes | |
| `created_at` | datetime | Yes | |

### Notes

- Quotes should remain immutable once issued.
- Expired quotes must not be reused for order creation.

## 9. Order model

## 9.1 `orders`

Main transactional collection representing a user exchange order.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | M2O → `users` | Yes | Customer |
| `quote_id` | M2O → `quotes` | Yes | Source quote |
| `side` | string | Yes | `buy` or `sell` |
| `status` | string | Yes | Canonical order state |
| `risk_level` | string | Yes | `low`, `medium`, `high`, `critical` |
| `wallet_connection_id` | M2O → `wallet_connections` | Yes | Source or destination depending on side |
| `fiat_asset_id` | M2O → `assets` | Yes | Usually RUB |
| `crypto_asset_id` | M2O → `assets` | Yes | |
| `asset_network_id` | M2O → `asset_networks` | No | |
| `fiat_amount` | decimal(24,8) | Yes | |
| `crypto_amount` | decimal(24,8) | Yes | |
| `fee_amount` | decimal(24,8) | Yes | |
| `payment_method` | string | No | For buy flow |
| `settlement_method` | string | No | For sell payout |
| `customer_comment` | text | No | |
| `rejection_reason` | text | No | User-facing if rejected |
| `expires_at` | datetime | No | Time-sensitive action deadline |
| `completed_at` | datetime | No | |
| `created_at` | datetime | Yes | |
| `updated_at` | datetime | Yes | |

### Status enum

Recommended values:

- `draft`
- `pending_kyc`
- `quoted`
- `pending_payment`
- `payment_submitted`
- `payment_under_review`
- `payment_confirmed`
- `pending_crypto_transfer`
- `crypto_transfer_submitted`
- `crypto_transfer_under_review`
- `crypto_transfer_confirmed`
- `processing_exchange`
- `settling`
- `completed`
- `canceled`
- `rejected`
- `expired`

### Notes

- This collection should represent the current canonical state only.
- Historical state changes should additionally be logged in `order_timeline_events`.

## 9.2 Sell payout details modeling

Recommended approaches:

### Option A — fields directly in `orders` for MVP

Add nullable fields:

- `payout_bank_name`
- `payout_card_number_masked`
- `payout_account_number_masked`
- `payout_phone_sbp`

### Option B — dedicated `order_payout_details` collection for scalability

Recommended if payout details will grow more complex. For MVP, Option A is acceptable for speed.

## 9.3 `order_timeline_events`

Tracks user-visible and operator-visible status transitions.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `order_id` | M2O → `orders` | Yes | Parent order |
| `status` | string | Yes | Related state |
| `title` | string | Yes | Timeline label |
| `description` | text | No | Optional details |
| `actor_type` | string | Yes | `system`, `user`, `operator`, `admin` |
| `actor_user_id` | M2O → `users` | No | Optional |
| `visible_to_customer` | boolean | Yes | Default true |
| `created_at` | datetime | Yes | |

### Notes

- This collection supports the visual order timeline in frontend.
- Internal-only operational events can be hidden from customer by `visible_to_customer = false`.

## 10. Payment and transfer evidence model

## 10.1 `payment_records`

Stores both fiat payment evidence and crypto transfer evidence.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `order_id` | M2O → `orders` | Yes | Parent order |
| `type` | string | Yes | `fiat_payment` or `crypto_transfer` |
| `status` | string | Yes | `created`, `submitted`, `under_review`, `confirmed`, `rejected`, `expired` |
| `amount` | decimal(24,8) | No | Optional |
| `provider_transaction_id` | string | No | For fiat side |
| `blockchain_tx_hash` | string | No | For crypto side |
| `review_comment` | text | No | Internal or customer-visible depending policy |
| `rejection_reason` | text | No | Customer-visible when applicable |
| `confirmed_at` | datetime | No | |
| `reviewed_by` | M2O → `users` | No | Operator/admin |
| `reviewed_at` | datetime | No | |
| `submitted_at` | datetime | No | |
| `created_at` | datetime | Yes | |
| `updated_at` | datetime | Yes | |

### Notes

- Multiple payment records can exist over time for retries/resubmissions.
- Current active one may be derived by latest nonterminal or latest created policy.

## 10.2 `payment_record_files`

Recommended additional collection if proof uploads are needed.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `payment_record_id` | M2O → `payment_records` | Yes | |
| `directus_file_id` | M2O → `directus_files` | Yes | |
| `created_at` | datetime | Yes | |

## 11. Receipt model

## 11.1 `receipts`

Stores fiscal receipt or compliance receipt metadata.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `order_id` | M2O → `orders` | Yes | One active receipt record per order preferred |
| `status` | string | Yes | `pending`, `issued`, `failed` |
| `provider_name` | string | No | Fiscal provider identifier |
| `receipt_url` | string | No | Hosted URL if available |
| `fiscal_document_number` | string | No | |
| `provider_payload_reference` | string | No | Link to external payload record if needed |
| `issued_at` | datetime | No | |
| `created_at` | datetime | Yes | |
| `updated_at` | datetime | Yes | |

### Notes

- If regulation or provider requirements evolve, extend with fiscal fields rather than overloading orders.

## 12. Notification model

## 12.1 `notifications`

Tracks user communication attempts and outcomes.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `user_id` | M2O → `users` | Yes | Recipient |
| `order_id` | M2O → `orders` | No | Optional context |
| `channel` | string | Yes | `email`, future `sms`, `telegram` |
| `template_code` | string | Yes | e.g. `order_created`, `receipt_issued` |
| `subject` | string | No | For email log |
| `delivery_status` | string | Yes | `pending`, `sent`, `failed` |
| `provider_message_id` | string | No | External provider ref |
| `error_message` | text | No | |
| `sent_at` | datetime | No | |
| `created_at` | datetime | Yes | |

### Purpose

Enables operational visibility for user notifications and future communication history surfaces.

## 13. Operator audit model

## 13.1 `operator_actions`

Explicit audit trail for operator/admin decisions.

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `actor_user_id` | M2O → `users` | Yes | Operator/admin actor |
| `action_type` | string | Yes | e.g. `order_review_approve`, `payment_confirm`, `kyc_reject` |
| `target_collection` | string | Yes | e.g. `orders`, `payment_records` |
| `target_id` | UUID/string | Yes | Target entity ID |
| `comment` | text | No | Optional operator reason |
| `before_snapshot` | JSON | No | Optional, limited usage |
| `after_snapshot` | JSON | No | Optional, limited usage |
| `created_at` | datetime | Yes | |

### Notes

- This collection is valuable for compliance, dispute resolution, and internal QA.
- Avoid storing oversensitive raw payloads when not required.

## 14. System settings model

## 14.1 `system_settings`

Runtime-adjustable business flags and values.

### Suggested fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | UUID | Yes | Primary key |
| `code` | string | Yes | Unique key |
| `value_json` | JSON | Yes | Flexible payload |
| `description` | text | No | |
| `updated_by` | M2O → `users` | No | |
| `updated_at` | datetime | Yes | |

### Example settings

- `feature_auto_confirm`
- `feature_exchange_connections`
- `default_fiat_currency`
- `kyc_required_before_quote`
- `quote_ttl_seconds`
- `support_contact_config`

## 15. Optional support model

## 15.1 `support_requests`

Optional for MVP, useful if support tickets will live in-platform.

### Suggested fields

- `id`
- `user_id`
- `order_id`
- `status`
- `category`
- `message`
- `assigned_to`
- `created_at`
- `updated_at`

## 16. Relationship summary

Recommended main relationships:

- `users` 1→1 `user_profiles`
- `users` 1→N `kyc_applications`
- `kyc_applications` 1→N `kyc_application_files`
- `assets` 1→N `asset_networks`
- `users` 1→N `wallet_connections`
- `users` 1→N `quotes`
- `users` 1→N `orders`
- `quotes` 1→N `orders` or practical 1→1 expected usage
- `orders` 1→N `order_timeline_events`
- `orders` 1→N `payment_records`
- `payment_records` 1→N `payment_record_files`
- `orders` 1→1 or 1→N `receipts` depending provider policy
- `users` 1→N `notifications`
- `users` 1→N `operator_actions` as actor

## 17. Status normalization guidance

Status-heavy domains should use consistent lower_snake_case text enums in Directus.

Recommended groups:

- `kyc_status`
- `order_status`
- `payment_status`
- `receipt_status`
- `risk_level`
- `verification_status`

Avoid mixing display labels with canonical stored values. Store normalized values and map presentation labels in frontend/backoffice.

## 18. Indexing strategy

Minimum recommended indexes:

### `user_profiles`

- unique on `user_id`
- index on `kyc_status`
- index on `risk_level`

### `kyc_applications`

- index on `user_id`
- index on `status`
- index on `submitted_at`
- composite on `(user_id, created_at desc)` if supported

### `wallet_connections`

- index on `user_id`
- index on `asset_id`
- index on `verification_status`

### `quotes`

- index on `user_id`
- index on `expires_at`
- index on `created_at`

### `orders`

- index on `user_id`
- index on `status`
- index on `side`
- index on `risk_level`
- index on `created_at`
- composite `(status, created_at)` for operator queue

### `order_timeline_events`

- index on `order_id`
- index on `created_at`

### `payment_records`

- index on `order_id`
- index on `status`
- index on `type`
- index on `submitted_at`
- index on `reviewed_at`

### `receipts`

- unique or near-unique on `order_id` for active receipt policy
- index on `status`

### `notifications`

- index on `user_id`
- index on `order_id`
- index on `delivery_status`
- index on `template_code`

### `operator_actions`

- index on `actor_user_id`
- composite `(target_collection, target_id)`
- index on `created_at`

## 19. Permissions guidance

## 19.1 Customer role

Customer should typically be able to:

- read own `user_profiles`;
- read own `kyc_applications` and associated files according to policy;
- read/write own `wallet_connections`;
- read own `quotes` if needed;
- read/create own `orders` subject to service-layer rules;
- read/create own `payment_records`;
- read own `receipts`;
- read own `notifications`.

Customer should not directly manipulate:

- status fields that require operator decision;
- internal review comments;
- operator actions;
- system settings.

## 19.2 Operator role

Operator should typically be able to:

- read all transactional collections needed for review;
- update review-related fields on KYC, payment, and order lifecycle;
- create `operator_actions`;
- view restricted files where policy permits.

## 19.3 Admin role

Admin should have broader access to:

- settings;
- all records;
- user role management via Directus governance.

### Important note

Business-critical state transitions should preferably be executed through validated custom endpoints / flows / hooks rather than unrestricted raw collection edits from the panel.

## 20. Hooks, flows, and automation recommendations

Recommended Directus hooks or custom service logic:

- on KYC approval/rejection → sync `user_profiles.kyc_status`
- on order status change → append `order_timeline_events`
- on payment record confirmation → advance related order state
- on payment record rejection → update order review state if required
- on receipt issuance → update order/customer notifications
- on operator action mutation → write `operator_actions`

Directus flows can support simple orchestration, but complex exchange/payment business rules may be better handled in a dedicated application service.

## 21. Data retention and audit considerations

The platform should define explicit policy for:

- KYC file retention;
- payment proof retention;
- notification log retention;
- operator action retention;
- masked vs raw financial identifiers;
- anonymization or deletion policy where legally permitted.

Directus collections should be designed so historical records are preserved even when customer-facing status changes.

## 22. Recommended MVP implementation order

1. `assets` and `asset_networks`
2. Directus auth roles and `user_profiles`
3. `kyc_applications` and `kyc_application_files`
4. `wallet_connections`
5. `quotes`
6. `orders`
7. `order_timeline_events`
8. `payment_records` and `payment_record_files`
9. `receipts`
10. `notifications`
11. `operator_actions`
12. `system_settings`

## 23. Open design questions

The following should be finalized before implementation freeze:

- whether anonymous quotes are allowed and therefore `quotes.user_id` can remain nullable;
- whether payout details should be embedded in `orders` or split into separate collection;
- whether one receipt per order is guaranteed or multiple provider attempts are possible;
- how KYC documents are stored, encrypted, and accessed operationally;
- whether exchange API credential references are needed in MVP or only account identifiers;
- whether support requests are in Directus from MVP or externalized;
- what fields must be masked at rest vs only masked in UI.

## 24. Deliverables expected from implementation

Based on this spec, the implementation team should produce:

- Directus collection schema definitions;
- field configuration and interfaces in Directus;
- relation definitions;
- role and permission matrices;
- hooks/flows for synchronization;
- index migration scripts;
- data seeding for assets, networks, and settings.