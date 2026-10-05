## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Backend + Finance Ops
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `provider-capability-matrix.md`
  - `reconciliation-and-ledger-spec.md`
- Related documents:
  - `provider-contract-and-operations-pack.md`
  - `webhook-verification-and-replay-defense-spec.md`
  - `contract-test-matrix.md`

# Wallet & Exchange Provider Integration Spec — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает интеграционный слой подключения кошельков, адресов получения/отправки и биржевых аккаунтов для платформы TheBlack.Trade. Спецификация предназначена для backend, frontend, product, solution architecture, operations, support, QA и compliance-команд.

Документ определяет:

- модели подключения destination/source details;
- типы wallet/provider integrations;
- пользовательские сценарии подключения;
- verification и validation flow;
- влияние provider connections на buy/sell lifecycle;
- provider abstraction и capability model;
- fallback и risk-handling rules.

## 2. Контекст и цели

TheBlack.Trade должен позволять пользователю быстро указать, откуда будет отправлена криптовалюта или куда она будет получена. Это может происходить:

- через ручной ввод адреса кошелька;
- через подключение биржевого аккаунта или provider account;
- через выбор ранее сохраненных реквизитов;
- через повторное использование проверенных destination/source details.

Основная цель — сократить friction, уменьшить количество ошибок в реквизитах и дать платформе управляемую модель работы с destination/source information.

## 3. Scope

Документ покрывает:

- customer-facing wallet/destination flow;
- exchange/provider account connection model;
- validation of wallet and network data;
- storage and reuse of saved wallets/connections;
- verification statuses;
- interaction with order domain model;
- operator/admin handling of ambiguous or rejected details.

Документ не описывает custody-модель хранения средств платформы — только user-facing connection and destination/source data layer.

## 4. Основные сущности integration layer

Интеграционный слой опирается на следующие сущности:

- `WalletConnection`
- `OrderWalletSnapshot`
- `Order`
- `Attachment` (если требуется подтверждение)
- `OrderRiskFlag`
- `OrderTimelineEvent`
- опционально `ProviderConnection`
- опционально `WalletValidationLog`
- опционально `ProviderSyncLog`

## 5. Типы пользовательских destination/source records

Рекомендуется поддерживать единый abstraction layer для реквизитов.

| Record type | Описание |
|---|---|
| wallet_address | Обычный blockchain address |
| exchange_account | Аккаунт/субаккаунт биржи или провайдера |
| payout_requisite | Реквизиты для выплаты фиата |
| manual_identifier | Идентификатор, не являющийся wallet-address в чистом виде |

## 6. Подход к модели подключения

Система должна поддерживать два базовых типа подключения:

## 6.1 Manual details entry

Пользователь вводит данные вручную:

- адрес кошелька;
- выбор сети;
- label/название;
- дополнительные поля, если нужны memo/tag/account id.

Этот режим обязателен как baseline.

## 6.2 Provider / exchange-assisted connection

Пользователь подключает provider/exchange context, после чего система может:

- получить account metadata;
- упростить выбор реквизитов;
- предварительно заполнить destination/source details;
- повторно использовать connection в следующих заявках.

Для MVP можно реализовать abstraction и data model, но ограничиться manual + semi-managed mode, если прямые интеграции с биржами будут позже.

## 7. Capability model for providers

Каждый provider должен быть описан через capability matrix.

| Capability | Пример значения |
|---|---|
| supports_account_linking | true / false |
| supports_address_book_import | true / false |
| supports_network_discovery | true / false |
| supports_deposit_address_fetch | true / false |
| supports_withdrawal_address_fetch | true / false |
| supports_account_verification | true / false |
| supports_oauth | true / false |
| supports_api_key_mode | true / false |
| supports_webhook | true / false |
| supports_refresh_sync | true / false |

## 8. Provider abstraction

Интеграции должны идти через provider abstraction layer, а не напрямую через UI/business logic.

### 8.1 Provider adapter operations

Рекомендуемые абстрактные операции:

- `createConnectionSession()`
- `completeConnectionSession()`
- `fetchLinkedAccounts()`
- `fetchAddresses()`
- `validateAddress()`
- `refreshConnection()`
- `disconnectConnection()`
- `normalizeProviderPayload()`

### 8.2 Provider connection entity

Если используются реальные provider-integrations, рекомендуется выделить сущность `ProviderConnection`.

### Suggested fields

- `id`
- `user_id`
- `provider_code`
- `connection_type`
- `status`
- `external_account_id`
- `external_user_reference`
- `capabilities_snapshot_json`
- `connected_at`
- `last_synced_at`
- `last_sync_status`
- `revoked_at`
- `metadata_json`

## 9. WalletConnection model

`WalletConnection` является основной reusable user-level сущностью.

### Recommended fields

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Идентификатор |
| user_id | UUID | Пользователь |
| provider_connection_id | UUID/null | Связь с provider connection |
| connection_type | enum | wallet_address / exchange_account / payout_requisite / manual_identifier |
| asset_code | string/null | Актив, если привязка asset-specific |
| network_code | string/null | Сеть |
| label | string | Пользовательское название |
| address_or_identifier | string | Адрес или идентификатор |
| destination_tag_or_memo | string/null | Memo/tag |
| verification_status | enum | pending / verified / rejected / disabled |
| validation_status | enum | unchecked / valid / invalid / ambiguous |
| source_of_truth | enum | manual / provider_sync / operator_created |
| is_default | boolean | По умолчанию |
| last_validated_at | datetime/null | Последняя валидация |
| created_at | datetime | Создание |
| updated_at | datetime | Обновление |
| metadata_json | json | Метаданные |

## 10. Customer connection scenarios

## 10.1 Buy-flow destination setup

Пользователь покупает криптовалюту и должен указать, куда ее получить.

### Возможные варианты:

- выбрать сохраненный кошелек;
- ввести новый адрес вручную;
- подключить provider/exchange account и выбрать destination;
- использовать ранее проверенные реквизиты.

### Обязательные поля:

- актив;
- сеть;
- адрес получения;
- memo/tag, если требуется.

## 10.2 Sell-flow source and payout setup

В sell-flow возможны два реквизитных блока:

1. **Источник криптовалюты** — откуда пользователь отправляет актив.
2. **Реквизиты для выплаты фиата** — куда отправлять payout.

В MVP можно считать, что source address не всегда нужно верифицировать заранее как ownership-proof, но payout requisites требуют управляемой валидации и подтверждения.

## 10.3 Reuse flow

Если пользователь уже использовал и подтвердил реквизиты, система должна позволять повторно использовать их без лишнего friction, если policy не требует повторной валидации.

## 11. Validation model

Validation должен быть многоуровневым.

## 11.1 Syntactic validation

Проверяется:

- формат адреса;
- допустимость символов;
- соответствие expected pattern;
- обязательность memo/tag для определенных сетей;
- совместимость типа реквизита и выбранной сети.

## 11.2 Semantic validation

Проверяется:

- соответствует ли адрес выбранной сети;
- не является ли адрес явно некорректным;
- не является ли реквизит запрещенным/blacklisted;
- не совпадает ли с внутренними запрещенными адресами;
- не вызывает ли risk rules.

## 11.3 Provider-backed validation

Если доступно, provider adapter может:

- подтвердить существование linked account;
- вернуть доступные адреса;
- подтвердить supported networks;
- сообщить ambiguous/unsupported state.

## 11.4 Validation result model

Рекомендуемое поле `validation_status`:

| Status | Значение |
|---|---|
| unchecked | Еще не валидирован |
| valid | Валидация успешна |
| invalid | Некорректный реквизит |
| ambiguous | Нужна ручная проверка |

## 12. Verification model

Validation и verification — не одно и то же.

- **Validation** отвечает на вопрос: «выглядит ли реквизит корректным?»
- **Verification** отвечает на вопрос: «разрешает ли платформа использовать этот реквизит в процессе?»

### Recommended verification_status

| Status | Значение |
|---|---|
| pending | Ожидает проверки |
| verified | Разрешен к использованию |
| rejected | Отклонен |
| disabled | Временно или постоянно недоступен |

### Когда verification может понадобиться

- payout requisites в sell-flow;
- подозрительные wallet details;
- provider-linked account с incomplete sync;
- high-risk user/order context.

## 13. Wallet verification flow

### Recommended flow

1. Пользователь создает или выбирает реквизит.
2. Система проводит syntactic и semantic validation.
3. Если policy разрешает, реквизит переводится в `verified` автоматически.
4. Если есть неоднозначность или повышенный риск — `pending` и queue на operator review.
5. Оператор принимает решение: `verified` / `rejected` / `disabled`.

### Recommended reasons for rejection

- invalid_network_mismatch
- invalid_format
- missing_required_memo
- blacklisted_destination
- unsupported_provider_account
- duplicate_suspicious
- compliance_restriction

## 14. Provider sync model

Если есть provider-linked connections, нужен controlled sync.

### Sync use cases

- первичное получение данных при подключении;
- обновление списка доступных адресов/аккаунтов;
- refresh capability snapshot;
- detection of revoked connection.

### ProviderSyncLog fields

- `id`
- `provider_connection_id`
- `sync_type`
- `status`
- `started_at`
- `finished_at`
- `error_code`
- `error_message`
- `metadata_json`

## 15. Snapshot strategy in order lifecycle

На момент подтверждения заявки order должен сохранять `OrderWalletSnapshot`.

### Snapshot должен содержать:

- тип connection;
- label;
- address/identifier;
- network;
- memo/tag;
- verification_status_snapshot;
- validation_status_snapshot;
- source_of_truth_snapshot.

Это необходимо, чтобы исторический контекст заявки не менялся, даже если пользователь позже отредактирует или удалит reusable connection.

## 16. Risk and manual review handling

Использование wallet/provider details может триггерить risk flags.

### Примеры risk cases

- адрес не соответствует выбранной сети;
- provider connection потеряла актуальность;
- destination ранее был отклонен;
- реквизиты входят в deny-list;
- payout requisites изменены непосредственно перед выплатой;
- connection создана незадолго до high-value order.

### Реакция системы

- перевод connection в `pending` или `disabled`;
- постановка order в `manual_review`;
- создание `OrderRiskFlag`;
- ограничение автоматического payout/exchange execution.

## 17. UI/UX implications

## 17.1 Customer UI

Frontend должен:

- поддерживать быстрый выбор сохраненных реквизитов;
- четко показывать сеть и memo/tag requirements;
- различать validation errors и verification waiting states;
- показывать, когда реквизит ожидает ручной проверки;
- предупреждать о риске ошибки сети/адреса;
- не скрывать источник реквизита (manual/provider/saved).

## 17.2 Operator/Admin UI

Operator UI должен:

- показывать details connection и source_of_truth;
- показывать validation log и provider sync context;
- поддерживать verify / reject / disable actions;
- отображать risk flags и usage history;
- показывать orders, использующие конкретный connection.

## 18. API requirements

Интеграционный слой требует следующие API-capabilities:

- создать wallet/requisite record;
- валидировать wallet/requisite;
- получить список сохраненных records;
- выбрать/привязать record к order;
- создать provider connection session;
- завершить provider connection;
- получить provider-linked records;
- refresh provider connection;
- disable/disconnect connection;
- выполнить operator verification action.

### Example endpoint groups

- `/wallet-connections`
- `/wallet-connections/{id}`
- `/wallet-connections/{id}/validate`
- `/wallet-connections/{id}/verify`
- `/provider-connections/session`
- `/provider-connections/complete`
- `/provider-connections/{id}/refresh`
- `/orders/{id}/wallet-snapshot`

## 19. Error and fallback scenarios

## 19.1 Typical customer-side failures

- invalid wallet format;
- network mismatch;
- missing memo/tag;
- provider connection failed;
- provider account sync incomplete;
- saved connection disabled;
- payout requisite rejected.

## 19.2 Typical provider-side failures

- OAuth/session failed;
- refresh token invalid;
- provider unavailable;
- address list not returned;
- provider returned inconsistent network metadata.

## 19.3 Fallback principles

При ошибках система должна:

- позволять fallback на manual entry, если policy это допускает;
- не блокировать весь order flow без объяснимого reason;
- переводить неоднозначные кейсы в manual review;
- логировать provider-side inconsistencies;
- явно разделять retryable и non-retryable cases.

## 20. Security requirements

Интеграционный слой должен обеспечивать:

- безопасное хранение provider tokens/secrets;
- masking wallet details в логах и UI, где это необходимо;
- role-restricted access к payout requisites;
- audit trail изменений connection статусов;
- защиту от mass assignment / unauthorized connection reuse;
- корректную очистку/revocation provider connections.

## 21. Lifecycle impact mapping

| Event | Order / connection impact |
|---|---|
| wallet_created | Создан reusable реквизит |
| wallet_validated_valid | Может быть использован дальше |
| wallet_validated_ambiguous | Возможен manual review |
| wallet_verification_pending | Order может остаться в prerequisites |
| wallet_verified | prerequisite может быть снят |
| wallet_rejected | Нужно повторное действие пользователя |
| provider_connection_linked | Доступны provider-backed реквизиты |
| provider_connection_revoked | Existing saved records may be disabled/restricted |

## 22. Suggested implementation phases

## Phase 1 — MVP baseline

- manual wallet/requisite entry;
- syntactic + semantic validation;
- saved wallet connections;
- operator verification for ambiguous/high-risk cases;
- wallet snapshoting in order.

## Phase 2 — Managed integrations

- provider/exchange account abstraction;
- connection session flow;
- provider sync logs;
- semi-managed destination selection.

## Phase 3 — Mature provider ecosystem

- richer exchange integrations;
- auto-refresh of linked accounts;
- provider capability-based routing;
- advanced risk scoring around connection history.

## 23. QA checklist

Команда QA должна проверить:

- manual wallet entry проходит корректную validation;
- network/memo constraints отображаются корректно;
- rejected/disabled connections не могут быть выбраны без policy override;
- snapshot данных реквизита сохраняется в order;
- provider connection failure не ломает весь customer flow;
- operator verification actions корректно меняют availability реквизита;
- risk cases приводят к ожидаемому lifecycle impact;
- provider revocation корректно отражается в UI и backend status model.

## 24. Следующие документы

На базе этой спецификации рекомендуется подготовить:

- `reconciliation-and-ledger-spec.md`
- `admin-review-decision-matrix.md`
- `error-catalog-and-api-ui-mapping-spec.md`
- `observability-and-audit-spec.md`
- `provider-capability-matrix.md`