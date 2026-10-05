## Document metadata

- Status: active
- Role: Derived reference
- Owner: Security + Platform
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `admin-permission-hardening-spec.md`
- Related documents:
  - `theblack-trade-directus-field-matrix.md`
  - `theblack-trade-directus-implementation-blueprint.md`

# Directus Permissions Matrix

## TheBlack.Trade

## 1. Назначение документа

Настоящий документ описывает актуальную матрицу прав доступа для платформы **TheBlack.Trade** при реализации на **Directus**, приведённую в соответствие с текущей моделью данных проекта. Документ предназначен для backend-разработчиков, Directus-интеграторов, DevOps, solution architect и QA. Матрица определяет, какие роли могут выполнять операции чтения, создания, изменения, удаления и специальных действий по каждой актуальной коллекции.

## 2. Роли доступа

В системе используются следующие роли:

- **public** — неавторизованный пользователь.
- **client** — клиент платформы.
- **operator** — сотрудник, вручную обрабатывающий заявки и подтверждения.
- **compliance** — сотрудник контроля рисков, KYC и спорных операций.
- **admin** — полный административный доступ.
- **service_account** — системная роль для интеграций, background jobs, webhook handlers и внутренних процессов.

## 3. Обозначения

| Обозначение | Значение |
|---|---|
| R | Read |
| C | Create |
| U | Update |
| D | Delete |
| O | Own records only |
| A | All records |
| N | No access |
| X | Только через custom endpoint / controlled action / service layer |
| F | Ограничение по field-level permissions |

## 4. Общие принципы доступа

- Роль **client** должна видеть только собственные данные.
- Роли **operator** и **compliance** не должны иметь unrestricted update для критичных бизнес-сущностей.
- Изменение статусов заявок, KYC, подтверждений, receipt-статусов и критичных реквизитов должно выполняться через custom endpoints, Directus flows/hook logic или отдельный service layer.
- Удаление исторических, финансовых, audit- и compliance-сущностей должно быть запрещено.
- Для справочников и конфигурации предпочтителен soft-disable вместо физического удаления.
- Чувствительные поля должны быть скрыты на уровне field permissions, даже если доступ к коллекции разрешён.
- Прямой generic update из клиентского приложения для статусных полей должен быть запрещён.

## 5. Матрица по коллекциям

## 5.1 Identity & profile

### 5.1.1 `directus_users`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | Регистрация и login только через auth/custom endpoint |
| client | R/O/F | N | U/O/F | N | Только собственный аккаунт, без доступа к role/status/service fields |
| operator | R/A/F | N | N | N | Только ограниченный просмотр |
| compliance | R/A/F | N | N | N | Только просмотр |
| admin | R/A | C | U/A | D limited | Удаление лучше заменить archive/suspend |
| service_account | R/A/F | C limited | U/A/F | N | Только системные операции |

Field restrictions:

- client не видит `role`, внутренние служебные поля, технические токены и иные service-only поля;
- operator/compliance не видят password/hash-like internal fields;
- только admin/service_account могут менять `status`, `role`, service metadata.

### 5.1.2 `user_profiles`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | R/O/F | N | U/O/F | N | Только свой профиль |
| operator | R/A/F | N | U/A/X | N | Только разрешённые рабочие поля через controlled action |
| compliance | R/A/F | N | U/A/X | N | Может обновлять риск/статусные поля по процессу |
| admin | R/A | C | U/A | D limited | |
| service_account | R/A | C | U/A | N | bootstrap/sync operations |

Client update restrictions:

- нельзя менять `user_id`;
- нельзя менять `kyc_status`;
- нельзя менять `risk_level`;
- нельзя менять системные timestamps.

## 5.2 KYC domain

### 5.2.1 `kyc_applications`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | R/O/F | C/O/X | U/O/X | N | Создание/ресабмит только через controlled endpoint |
| operator | R/A/F | N | U/A/X | N | Review actions only |
| compliance | R/A | N | U/A/X | N | Основной владелец review-процесса |
| admin | R/A | N | U/A/X | D forbidden | Историю KYC не удалять |
| service_account | R/A | C limited | U/A/X | N | Sync/automation tasks |

Important restrictions:

- client не должен напрямую менять `status`, `reviewed_by`, `reviewed_at`, `review_comment`, `rejection_reason`;
- operator/compliance изменяют review-поля только через workflow action;
- физическое удаление KYC записей запрещено.

### 5.2.2 `kyc_application_files`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | R/O/F | C/O/X | N | N | Загрузка только своих файлов через controlled upload flow |
| operator | R/A/F | N | N | N | read-only |
| compliance | R/A/F | N | N | N | read-only |
| admin | R/A | N | U/A/F | N | Только metadata updates if needed |
| service_account | R/A | C | U/A/F | N | file processing / malware scan integration |

Field restrictions:

- доступ к `directus_file_id` должен быть ограничен по ownership/policy;
- публичный доступ отсутствует;
- operator/compliance видят только разрешённые KYC-файлы в рамках review.

## 5.3 Reference collections

### 5.3.1 `assets`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | R/A/F | N | N | N | Только активные и публичные поля |
| client | R/A/F | N | N | N | Только активные |
| operator | R/A | N | N | N | |
| compliance | R/A | N | N | N | |
| admin | R/A | C | U/A | D limited | Предпочтителен soft-disable |
| service_account | R/A | N | U/A/F | N | sync tasks if needed |

### 5.3.2 `asset_networks`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | R/A/F | N | N | N | Только активные комбинации |
| client | R/A/F | N | N | N | |
| operator | R/A | N | N | N | |
| compliance | R/A | N | N | N | |
| admin | R/A | C | U/A | D limited | |
| service_account | R/A | N | U/A/F | N | |

## 5.4 Wallet connections

### 5.4.1 `wallet_connections`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | R/O/F | C/O/X | U/O/X | N | Только свои, удаление через archive/disable |
| operator | R/A/F | N | U/A/X | N | Только verification/status actions |
| compliance | R/A/F | N | U/A/X | N | Verification/risk-related changes only |
| admin | R/A/F | C | U/A/F | D limited | Hard delete не рекомендуется |
| service_account | R/A/F | C | U/A/F | N | validation/sync |

Field restrictions:

- client не может менять `user_id`, `verification_status`, `verification_comment`, `api_key_reference`;
- operator/compliance по умолчанию видят masked values, полный raw access только по отдельной политике;
- если введено правило lock-after-usage, клиент может менять только `label` и архивный флаг.

## 5.5 Quotes & orders

### 5.5.1 `quotes`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | R limited / C limited / X | X | N | N | Только если quote доступен без логина |
| client | R/O/F | C/O/X | N | N | Create через custom endpoint |
| operator | R/A | N | N | N | |
| compliance | R/A | N | N | N | |
| admin | R/A | N | N | D limited | purge only by policy |
| service_account | R/A | C | U/A/F | D limited | statusless pricing support |

Rules:

- quote immutable после создания;
- expired quotes не должны использоваться повторно;
- прямой generic update для client/operator запрещён.

### 5.5.2 `orders`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | R/O/F | N | U/O/X | N | Create через custom endpoint, cancel через action |
| operator | R/A/F | N | U/A/X | N | Только через workflow actions |
| compliance | R/A/F | N | U/A/X | N | Только разрешённые transitions |
| admin | R/A | N | U/A/X | D forbidden | Заказы не удалять |
| service_account | R/A | C limited | U/A/X | N | system transitions |

Important restrictions:

- direct collection create/update/delete должен быть закрыт для client;
- создание заказа — только через controlled backend/service endpoint;
- смена статуса — только через transition service;
- client не видит внутренние поля: `risk_level`, internal metadata, internal review markers и иные служебные флаги.

### 5.5.3 `order_timeline_events`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | R/O/F | N | N | N | Только своя история |
| operator | R/A | C/X | N | N | append-only |
| compliance | R/A | C/X | N | N | append-only |
| admin | R/A | C/X | N | N | append-only |
| service_account | R/A | C | N | N | |

Rules:

- клиент видит только события с `visible_to_customer = true`;
- коллекция append-only;
- direct update/delete запрещены.

## 5.6 Payment & transfer evidence

### 5.6.1 `payment_records`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | R/O/F | C/O/X | N | N | submit evidence only via controlled flow |
| operator | R/A/F | N | U/A/X | N | review/status changes only |
| compliance | R/A/F | N | U/A/X | N | review and dispute handling |
| admin | R/A | N | U/A/X | N | ручные корректировки строго ограничены |
| service_account | R/A | C | U/A/X | N | provider sync / ingestion |

Field restrictions:

- client не видит внутренний provider payload и internal review metadata;
- operator/compliance не должны видеть лишние секретные provider fields без необходимости;
- `status`, `confirmed_at`, `reviewed_by`, `reviewed_at` меняются только controlled action-ами.

### 5.6.2 `payment_record_files`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | R/O/F | C/O/X | N | N | Только свои подтверждающие файлы |
| operator | R/A/F | N | N | N | read-only |
| compliance | R/A/F | N | N | N | read-only |
| admin | R/A | N | U/A/F | N | metadata-only if needed |
| service_account | R/A | C | U/A/F | N | file processing |

## 5.7 Receipts & notifications

### 5.7.1 `receipts`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | R/O/F | N | N | N | Только свои чеки/receipt metadata |
| operator | R/A/F | N | U/A/X | N | retry/mark actions only if process allows |
| compliance | R/A/F | N | N | N | Обычно read-only |
| admin | R/A | N | U/A/X | N | controlled corrections only |
| service_account | R/A | C | U/A/X | N | issuance jobs / provider sync |

Field restrictions:

- клиент видит только user-facing receipt data;
- технический provider payload, internal error details и internal retry metadata скрываются от клиента.

### 5.7.2 `notifications`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | R/O/F | N | N | N | Только свои уведомления |
| operator | R/A/F | N | N | N | |
| compliance | R/A/F | N | N | N | |
| admin | R/A | N | U/A/F | N | retry/cancel if needed |
| service_account | R/A | C | U/A | N | queue processing |

## 5.8 Audit & system

### 5.8.1 `operator_actions`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | N | N | N | N | |
| operator | R/A/F | C/X | N | N | append-only, limited visibility if needed |
| compliance | R/A | C/X | N | N | append-only |
| admin | R/A | C/X | N | N | append-only |
| service_account | R/A | C | N | N | |

Rules:

- update/delete запрещены;
- audit trail должен быть append-only;
- доступ operator может быть ограничен от просмотра чувствительных before/after snapshots.

### 5.8.2 `system_settings`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | R/A/F | N | N | N | Только публичные настройки |
| client | R/A/F | N | N | N | Только публичные |
| operator | R/A/F | N | N | N | Только нужные для UI/operations |
| compliance | R/A/F | N | N | N | |
| admin | R/A | C | U/A | D limited | |
| service_account | R/A | N | U/A/F | N | controlled sync |

Field restrictions:

- публичный доступ только к явно разрешённым значениям;
- чувствительные config values доступны только admin/service_account.

### 5.8.3 `support_requests`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| public | N | N | N | N | |
| client | R/O/F | C/O/X | U/O/X | N | Только свои обращения |
| operator | R/A/F | N | U/A/X | N | working/resolve actions only |
| compliance | R/A/F | N | U/A/X | N | dispute-related cases |
| admin | R/A | N | U/A | N | |
| service_account | R/A | C limited | U/A | N | integrations if needed |

## 6. Field-level sensitive data policy

## 6.1 Никогда не показывать client

- internal metadata;
- review-only comments, если они не user-facing;
- provider raw payload;
- service credentials and secret references;
- internal risk markers and scoring details;
- internal retry metadata;
- background/system internals;
- before/after audit snapshots;
- non-public system settings.

## 6.2 Показывать operator/compliance только при необходимости

- raw wallet/requisite values, если masked version достаточно;
- часть provider payload;
- часть audit before/after payload;
- технические системные настройки;
- внутренние security/service fields в `directus_users`.

## 6.3 Только admin/service_account

- provider secrets;
- service-only config values;
- encrypted or secret references;
- sensitive integration metadata;
- privileged system internals.

## 7. Directus policy rules

### 7.1 Ownership rules

Примеры ownership filters:

- `user_profiles`: `user_id = $CURRENT_USER`
- `kyc_applications`: `user_id = $CURRENT_USER`
- `kyc_application_files`: `kyc_application_id.user_id = $CURRENT_USER`
- `wallet_connections`: `user_id = $CURRENT_USER`
- `quotes`: `user_id = $CURRENT_USER`
- `orders`: `user_id = $CURRENT_USER`
- `order_timeline_events`: `order_id.user_id = $CURRENT_USER`
- `payment_records`: `order_id.user_id = $CURRENT_USER`
- `payment_record_files`: `payment_record_id.order_id.user_id = $CURRENT_USER`
- `receipts`: `order_id.user_id = $CURRENT_USER`
- `notifications`: `user_id = $CURRENT_USER`
- `support_requests`: `user_id = $CURRENT_USER`

### 7.2 Public access rules

Public role может иметь только:

- read активных публичных справочников;
- read ограниченных публичных settings при необходимости;
- доступ к custom auth / quote endpoints при необходимости;
- никакого прямого доступа к бизнес-данным.

### 7.3 No hard delete policy

Для следующих сущностей hard delete должен быть запрещён:

- `kyc_applications`
- `kyc_application_files`
- `orders`
- `order_timeline_events`
- `payment_records`
- `payment_record_files`
- `receipts`
- `notifications`
- `operator_actions`

## 8. Recommended implementation rules

### 8.1 Через custom endpoints / service layer обязательно выполнять

- регистрацию;
- создание quote;
- создание заказа;
- смену статуса заказа;
- submission/review KYC;
- подтверждение оплаты;
- подтверждение криптопоступления;
- подтверждение выплат и отправок;
- receipt issuance/retry;
- webhook ingestion;
- file validation/processing;
- retry уведомлений.

### 8.2 Запретить прямые апдейты коллекций

Следующие действия не должны выполняться прямым generic update из Directus API для client/operator:

- `user_profiles.kyc_status`
- `user_profiles.risk_level`
- `kyc_applications.status`
- `wallet_connections.verification_status`
- `orders.status`
- `payment_records.status`
- `receipts.status`
- `notifications.delivery_status` (кроме controlled retry/cancel для admin/service_account)

## 9. QA checks for permissions

QA должен проверить минимум следующие кейсы:

- client не может прочитать чужие `orders`, `payment_records`, `wallet_connections`, `receipts`, `kyc_applications`;
- client не может изменить статус KYC, заказа, payment record, receipt или verification status кошелька;
- operator может видеть очереди review, но не может выполнять запрещённые прямые raw updates;
- compliance имеет расширенный доступ к KYC/risk-related данным, но не получает лишний доступ к системным секретам;
- admin видит весь операционный контур, но audit/history collections остаются append-only;
- service_account может выполнять системные синхронизации и ingestion, но не должен использоваться как человеко-ориентированная роль.

## 10. Итог

Настоящая матрица прав синхронизирована с актуальной моделью данных TheBlack.Trade и должна использоваться как базовый документ для настройки Directus roles, policies, field-level permissions, custom endpoints и workflow-safe state transitions.

## 11. Update 2026-10-03 — Admin Role & Permission Matrix Extension

Этот раздел обновляет исходную Directus Permissions Matrix с учетом operational, compliance, observability, notification, document и incident-response требований. Базовый принцип остается прежним: прямые generic updates критичных сущностей запрещены; sensitive actions выполняются только через controlled actions/service layer с audit trail.

## 11.1 Refined admin/operations roles

Для production operating model рекомендуется разделить прежнюю широкую роль `operator` на least-privilege рабочие роли. В Directus это могут быть отдельные roles или policies поверх общих групп.

| Role | Назначение | Ключевые ограничения |
|---|---|---|
| support_operator | Первая линия: просмотр заказов, support requests, запрос дополнительных данных | Не подтверждает payment, не меняет payout, не снимает compliance hold |
| operations_reviewer | Стандартный payment/wallet review | Не выпускает payout, не меняет policy/configuration |
| senior_operations_reviewer | Исключения и эскалации review | Не выполняет финансовые корректировки без отдельного approval path |
| finance_settlement_reviewer | Payout release, reconciliation, discrepancy handling | Не снимает compliance hold, не редактирует evidence history |
| compliance_reviewer | Risk, restrictions, KYC, compliance hold | Не выполняет payout release без dual-control policy |
| admin | Конфигурация, управление ролями и контролируемые operational actions | Не может изменять append-only history; sensitive overrides требуют reason code |
| service_account | Webhooks, jobs, provider sync, issuance and notification processing | Не используется человеком; scoped credentials only |

Роль `operator` из разделов 5-10 следует интерпретировать как legacy umbrella role и заменить на наименьшую достаточную специализированную роль при настройке production.

## 11.2 Sensitive-action matrix

| Action | Support operator | Operations reviewer | Senior ops | Finance/settlement | Compliance | Admin | Service account |
|---|---|---|---|---|---|---|---|
| View customer-visible order context | R | R | R | R | R | R | R/X |
| Request more information | X | X | X | N | X | X | N |
| Confirm/reject payment evidence | N | X | X | N | X for dispute cases | X controlled | X automated ingestion only |
| Verify/reject wallet/requisites | N | X | X | N | X risk cases | X controlled | X validation/sync only |
| Apply compliance hold | N | N | X limited | N | X | X controlled | X rules-based only |
| Remove compliance hold | N | N | N | N | X with reason/evidence | X only by policy | N |
| Release payout | N | N | N | X controlled | N | X emergency path only | X provider execution only |
| Apply payout hold | N | X limited | X | X | X | X | X rules-based only |
| Resolve discrepancy | N | X limited | X | X | X if restricted | X controlled | X reconciliation jobs only |
| Manual status override | N | N | X restricted | N | X restricted | X controlled | N |
| Re-send existing document | X | X | X | X limited | R only | X | X queue job only |
| Re-issue/correct document | N | N | X with approval | N | X policy case | X controlled | X generation only |
| Change template/policy/config | N | N | N | N | R only | X | N |
| View raw provider payload | N | R masked/default | R masked/default | R/F | R/F | R/F | R scoped |
| View audit snapshots | N | R limited | R limited | R/F | R/F | R/F | R scoped |

Legend: `R` = read; `X` = controlled action/custom endpoint; `F` = field-restricted; `N` = no access.

## 11.3 Dual-control requirements

Следующие действия должны поддерживать maker-checker или equivalent dual-control workflow для high-risk/high-value cases согласно configured thresholds:

- payout release after manual override;
- снятие compliance hold;
- manual финансовая корректировка;
- re-issue документа, который исправляет financial/legal evidence;
- terminal state override;
- изменение critical provider configuration;
- emergency retry после ambiguous payout/provider outcome.

Maker не должен быть единственным approver собственной sensitive action. Система должна сохранять `requested_by`, `approved_by`, `reason_code`, `evidence_references`, `requested_at`, `approved_at` и связанный `correlation_id`.

## 11.4 New/expanded collections and permission policy

### 11.4.1 `document_records`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| client | R/O/F | N | N | N | Только user-facing documents по своим orders |
| support_operator | R/A/F | N | N | N | Может инициировать resend only through action |
| operations_reviewer | R/A/F | N | U/A/X limited | N | Только resend/status follow-up per workflow |
| senior_operations_reviewer | R/A/F | N | U/A/X | N | Re-issue request path, no silent edits |
| finance_settlement_reviewer | R/A/F | N | U/A/X limited | N | Settlement-related documents only |
| compliance_reviewer | R/A/F | N | U/A/X limited | N | Policy/restriction cases only |
| admin | R/A | N | U/A/X | N | Controlled re-issue/configuration only |
| service_account | R/A | C | U/A/X | N | Generation, storage and delivery workflow |

Rules: generated payload snapshot, template version, original/superseding relationship and delivery history are immutable after generation. Re-send does not create a new document; re-issue creates a new linked record.

### 11.4.2 `notification_logs`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| client | R/O/F | N | N | N | Customer-visible subset only |
| support_operator | R/A/F | N | N | N | Delivery view, no raw provider payload |
| operations_reviewer | R/A/F | N | N | N | Context view only |
| senior_operations_reviewer | R/A/F | N | U/A/X limited | N | Controlled resend request only |
| finance_settlement_reviewer | R/A/F | N | N | N | Context view only |
| compliance_reviewer | R/A/F | N | N | N | Context view only |
| admin | R/A | N | U/A/X limited | N | Controlled cancel/retry according to policy |
| service_account | R/A | C | U/A/X | N | Delivery and retry processing |

Rules: delivery attempts are append-only; historical template version and recipient reference cannot be changed.

### 11.4.3 `discrepancy_cases` and `reconciliation_records`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| client | N | N | N | N | Internal operational data |
| support_operator | R/A/F limited | N | N | N | Only customer-safe status context if required |
| operations_reviewer | R/A/F | C/X limited | U/A/X limited | N | Can open/escalate, not finalize high severity |
| senior_operations_reviewer | R/A/F | C/X | U/A/X | N | Exception workflow |
| finance_settlement_reviewer | R/A/F | C/X | U/A/X | N | Primary owner for resolution |
| compliance_reviewer | R/A/F | C/X | U/A/X | N | Restricted/suspicious cases |
| admin | R/A | C/X | U/A/X | N | Controlled escalation only |
| service_account | R/A | C | U/A/X | N | Automated detection/reconciliation |

Rules: severity, resolution, manual adjustment and closure actions require controlled endpoint, reason code and append-only audit event.

### 11.4.4 `compliance_cases` / `compliance_holds`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| client | N | N | N | N | Customer gets only approved status messaging |
| support_operator | R/A/F limited | N | N | N | No internal reasons or heuristics |
| operations_reviewer | R/A/F limited | C/X limited | U/A/X limited | N | Can refer/escalate, cannot remove hold |
| senior_operations_reviewer | R/A/F | C/X | U/A/X limited | N | May apply limited temporary hold by policy |
| finance_settlement_reviewer | R/A/F limited | N | U/A/X hold only | N | Can apply payout hold, not remove compliance hold |
| compliance_reviewer | R/A | C/X | U/A/X | N | Primary owner |
| admin | R/A/F | C/X | U/A/X | N | Controlled emergency/support actions |
| service_account | R/A/F | C/X | U/A/X | N | Rules-based flags only |

Rules: no hard delete; hold removal requires reason code, evidence references and role/policy validation; customer-visible status must be sourced from approved external-safe fields.

### 11.4.5 `incident_records` and `incident_timeline_events`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| client | N | N | N | N | Customer communication is externalized via approved channels |
| support_operator | R/A/F limited | C/X report only | N | N | Can report but not manage incident |
| operations_reviewer | R/A/F | C/X | U/A/X limited | N | Operational evidence and updates |
| senior_operations_reviewer | R/A/F | C/X | U/A/X | N | May act as incident coordinator if assigned |
| finance_settlement_reviewer | R/A/F | C/X | U/A/X limited | N | Financial-impact updates |
| compliance_reviewer | R/A/F | C/X | U/A/X limited | N | Compliance-impact updates |
| admin | R/A | C/X | U/A/X | N | Incident command/configuration |
| service_account | R/A | C | U/A/X | N | Alert/event ingestion |

Rules: timeline events are append-only; severity changes, closure and post-incident resolution require controlled actions and actor attribution.

### 11.4.6 `audit_logs`, `business_events`, `integration_events`

| Role | Read | Create | Update | Delete | Notes |
|---|---|---|---|---|---|
| client | N | N | N | N | Customer timeline is a separately filtered projection |
| support_operator | R/F very limited | N | N | N | Only safe diagnostic context when approved |
| operations_reviewer | R/F limited | C/X controlled | N | N | No raw secrets or broad historical export |
| senior_operations_reviewer | R/F limited | C/X controlled | N | N | |
| finance_settlement_reviewer | R/F limited | C/X controlled | N | N | |
| compliance_reviewer | R/F limited | C/X controlled | N | N | |
| admin | R/F | C/X controlled | N | N | No mutation/deletion |
| service_account | R/F | C | N | N | Append-only producer |

Rules: audit and event collections are immutable/append-only. Search/export is role-scoped and must mask secrets, PII not needed for purpose, and raw provider credentials.

## 11.5 Required action-level controls

Для следующих actions custom endpoint/flow должен обязательно проверять role, ownership/context, allowed state transition, reason code, evidence requirements и audit emission:

- `request_more_info`
- `confirm_payment`
- `reject_payment`
- `verify_wallet`
- `reject_wallet`
- `apply_payout_hold`
- `release_payout`
- `apply_compliance_hold`
- `remove_compliance_hold`
- `open_discrepancy`
- `resolve_discrepancy`
- `resend_document`
- `reissue_document`
- `retry_notification`
- `cancel_notification`
- `manual_state_override`
- `incident_open`
- `incident_update`
- `incident_close`

## 11.6 Field-level masking and export policy

- Raw wallet addresses, bank/payment requisites and provider references должны быть masked by default for support and standard operations roles.
- Full values разрешаются только при operational need and only to role/policy combinations defined above.
- Provider payloads, callbacks, request signatures, secrets and token references are never exposed to customer/support roles.
- CSV/export actions for sensitive collections должны быть disabled by default and exposed only to approved admin/compliance/finance roles through a controlled export path with audit log.
- Document files доступны клиенту только через order ownership checks; internal-only artifacts and failed drafts must never be customer-accessible.

## 11.7 Permission QA additions

QA должен дополнительно проверить:

- support_operator не может approve/reject payment, release payout, remove compliance hold, reissue document или change incident severity;
- operations_reviewer не может release payout или remove compliance hold;
- finance_settlement_reviewer не может снять compliance restriction без compliance-approved controlled action;
- compliance_reviewer не может silently менять settlement/payment factual evidence;
- re-send и re-issue имеют разные permission paths и audit events;
- dual-control actions нельзя self-approve;
- document, notification, discrepancy, incident и audit collections имеют no-hard-delete policy;
- masked fields и export restrictions работают для каждой роли;
- service_account credentials и permissions ограничены конкретными integration/job scopes.

## 11.8 Implementation note

Этот update является authoritative extension к исходной матрице. При конфликте между legacy umbrella ролью `operator` и настоящим разделением обязанностей приоритет имеют least-privilege roles и action-level controls из раздела 11.