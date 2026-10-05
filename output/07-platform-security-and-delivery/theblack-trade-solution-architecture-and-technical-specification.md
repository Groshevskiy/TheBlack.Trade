## Document metadata

- Status: active
- Role: Companion spec
- Owner: Architecture + Engineering
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `component-architecture-spec.md`
  - `environment-and-deployment-spec.md`
- Related documents:
  - `frontend-integration-spec.md`
  - `release-readiness-and-rollout-plan.md`

# Solution Architecture + Technical Specification
## TheBlack.Trade

## 1. Документ и назначение

### 1.1 Назначение документа

Настоящий документ описывает целевую архитектуру, технические требования и детальную спецификацию платформы **TheBlack.Trade**. Документ предназначен для product owner, solution architect, backend/frontend разработчиков, DevOps, QA и команды сопровождения.

### 1.2 Назначение платформы

TheBlack.Trade — это веб-платформа для покупки и продажи криптовалюты за фиатные средства с фокусом на российских клиентов. Платформа должна поддерживать контролируемый обмен, личный кабинет пользователя, ручную обработку операций на старте и поэтапный переход к автоматизации.

### 1.3 Границы MVP

В MVP должны входить:

- регистрация и авторизация пользователей;
- создание заявок на покупку и продажу криптовалюты;
- хранение пользовательских реквизитов;
- личный кабинет;
- операторская обработка заявок;
- базовая административная панель;
- email-уведомления;
- генерация и отправка чеков или подтверждающих документов;
- аудит и журналирование действий.

## 2. Бизнес-контекст

### 2.1 Ключевые сценарии

Платформа должна поддерживать два базовых пользовательских сценария:

1. **Fiat-to-Crypto** — пользователь оплачивает заявку фиатом и получает криптовалюту.
2. **Crypto-to-Fiat** — пользователь переводит криптовалюту и получает выплату в фиатной валюте.

### 2.2 Бизнес-принципы

- На старте все критичные этапы подтверждаются оператором вручную.
- Автоматизация должна включаться опционально и управляться правилами.
- Все пользовательские действия и служебные изменения статусов должны журналироваться.
- Пользователь должен видеть понятный и прозрачный маршрут заявки.
- Документы и уведомления должны поддерживать юридически значимый процесс взаимодействия.

## 3. Архитектура решения

### 3.1 Общая схема

Платформа проектируется как модульная web-система, состоящая из следующих слоёв:

1. **Client Layer** — frontend для клиентов.
2. **Operator/Admin Layer** — административный и операторский интерфейс.
3. **Core Business Layer** — логика заявок, статусов, расчётов и правил.
4. **Integration Layer** — работа с платёжными сервисами, email и crypto-провайдерами.
5. **Persistence Layer** — база данных и файловое хранилище.
6. **Audit & Monitoring Layer** — журналирование, мониторинг и служебные события.

### 3.2 Технологический стек

| Слой | Технология | Назначение |
|---|---|---|
| Frontend | Astra Frontend | Клиентский интерфейс и личный кабинет |
| Backend Core | Directus + custom extensions | API, админка, data model, workflows |
| Database | PostgreSQL | Основное хранилище данных |
| Email | SMTP / email API provider | Транзакционные письма |
| File Storage | S3-compatible storage / local object storage | Хранение документов и артефактов |
| Integrations | REST / webhook adapters | Интеграции с внешними системами |
| Observability | logs + metrics + error tracking | Контроль работы платформы |

### 3.3 Архитектурные принципы

- Разделение бизнес-логики и UI.
- Явная state machine для заявок.
- Идемпотентность интеграционных операций.
- Расширяемость через адаптеры и provider pattern.
- Отказоустойчивость при частичных сбоях интеграций.
- Возможность ручного override оператором.

## 4. Пользовательские роли и модель доступа

### 4.1 Роли

| Роль | Назначение |
|---|---|
| Guest | Неавторизованный пользователь |
| Client | Клиент платформы |
| Operator | Оператор ручной обработки |
| Compliance | Проверка спорных и рискованных операций |
| Admin | Полный административный доступ |
| Service Account | Системная роль для интеграций и фоновых процессов |

### 4.2 Принципы RBAC

- Все права должны назначаться по ролям.
- Права на чтение и изменение должны быть разделены.
- Изменение критичных настроек должно быть доступно только Admin.
- Изменение статусов операционных сущностей должно логироваться.
- Service Account не должен использоваться интерактивно.

### 4.3 Матрица доступа высокого уровня

| Сущность / Действие | Client | Operator | Compliance | Admin | Service |
|---|---|---|---|---|---|
| Свой профиль | R/W | R | R | R/W | - |
| Свои кошельки | R/W | R | R | R/W | - |
| Свои заявки | R | R | R | R/W | R/W |
| Изменение статуса заявки | - | W | W | W | W |
| Настройки платформы | - | - | R | R/W | R |
| Audit logs | - | R limited | R | R | R/W |
| Notification queue | - | R | R | R/W | R/W |

## 5. Функциональная архитектура

### 5.1 Основные доменные модули

1. Identity & Access
2. User Profile
3. Wallets & Payment Requisites
4. Exchange Orders
5. Pricing & Fees
6. Payment Processing
7. Crypto Processing
8. Order Workflow Engine
9. Notifications & Documents
10. Operator Console
11. Admin Configuration
12. Audit & Risk Control

### 5.2 Модуль Identity & Access

Функции:

- регистрация;
- логин;
- logout;
- refresh session;
- подтверждение email;
- восстановление пароля;
- хранение согласий;
- двухэтапная аутентификация как roadmap feature.

### 5.3 Модуль User Profile

Функции:

- персональные данные;
- контакты;
- язык уведомлений;
- история действий пользователя;
- настройки уведомлений;
- привязанные реквизиты.

### 5.4 Модуль Wallets & Payment Requisites

Функции:

- хранение криптоадресов;
- хранение банковских/платёжных реквизитов;
- привязка сети и актива;
- валидация формата реквизитов;
- управление статусом реквизита: active / archived / pending_verification.

### 5.5 Модуль Exchange Orders

Функции:

- создание заявки;
- расчёт параметров сделки;
- фиксация курса и комиссии;
- хранение пользовательских реквизитов на момент заявки;
- отображение статусов и таймлайна;
- хранение ссылок на связанные транзакции.

### 5.6 Модуль Pricing & Fees

Функции:

- хранение правил комиссий;
- хранение правил лимитов;
- фиксация курса обмена на момент создания заявки;
- перерасчёт по правилам бизнеса, если заявка устарела;
- различение user-visible rate и internal settlement rate.

### 5.7 Модуль Payment Processing

Функции:

- создание платёжной инструкции;
- получение callback / webhook от платёжного провайдера;
- ручное подтверждение платежа;
- запуск выплаты;
- контроль статуса payout;
- учёт референсов провайдера.

### 5.8 Модуль Crypto Processing

Функции:

- выдача инструкции на криптоперевод;
- фиксация входящего/исходящего криптодвижения;
- привязка tx hash;
- фиксация сети, актива, суммы и подтверждений;
- ручное подтверждение оператором;
- опциональная интеграция с custody/exchange API.

### 5.9 Модуль Order Workflow Engine

Функции:

- централизованное управление статусами заявки;
- проверка допустимости переходов;
- запуск side effects на переходах;
- запись в status history;
- передача заявки в ручной или автоматический контур.

### 5.10 Модуль Notifications & Documents

Функции:

- шаблоны email;
- очередь уведомлений;
- генерация PDF/HTML документов;
- отправка чеков;
- повторная отправка документов;
- хранение истории отправок.

### 5.11 Модуль Operator Console

Функции:

- рабочая очередь заявок;
- фильтры и поиск;
- карточка заявки;
- timeline событий;
- ручной перевод статуса;
- внутренние комментарии;
- контроль платежей и криптотранзакций.

### 5.12 Модуль Admin Configuration

Функции:

- валюты и сети;
- комиссии;
- лимиты;
- риск-правила;
- шаблоны уведомлений;
- интеграционные настройки;
- флаги автоматизации.

### 5.13 Модуль Audit & Risk Control

Функции:

- audit logs;
- risk flags;
- suspicious activity markers;
- история решений по спорным операциям;
- логирование действий сотрудников.

## 6. User flows

### 6.1 Flow: Регистрация пользователя

1. Пользователь вводит email и пароль.
2. Система создаёт запись user в статусе pending_email_verification.
3. Генерируется verification token.
4. Отправляется email с подтверждением.
5. После подтверждения email статус пользователя меняется на active.
6. Создаётся профиль пользователя.
7. В audit log записывается событие регистрации и подтверждения email.

### 6.2 Flow: Покупка криптовалюты

1. Пользователь выбирает направление buy.
2. Выбирает fiat currency, crypto asset, network и сумму.
3. Система рассчитывает quote.
4. Пользователь указывает wallet address получения.
5. Пользователь подтверждает заявку.
6. Создаётся exchange order.
7. Создаётся payment instruction.
8. Пользователь оплачивает заявку.
9. Оператор подтверждает оплату.
10. Оператор подтверждает отправку криптовалюты.
11. Заявка закрывается в статусе completed.
12. Отправляются email и чек.

### 6.3 Flow: Продажа криптовалюты

1. Пользователь выбирает направление sell.
2. Указывает актив, сеть, сумму и реквизиты выплаты.
3. Система рассчитывает quote.
4. Создаётся заявка.
5. Пользователь получает криптоинструкцию.
6. Пользователь переводит криптовалюту.
7. Оператор подтверждает поступление.
8. Оператор инициирует выплату.
9. После подтверждения выплаты заявка завершается.
10. Пользователь получает уведомление и документ.

### 6.4 Flow: Ручной override

1. Заявка попадает в исключение.
2. Workflow engine ставит статус requires_manual_review.
3. Оператор или compliance открывает карточку.
4. Выполняется проверка данных.
5. Принимается решение: approve / reject / request_user_action.
6. Решение и комментарий записываются в audit trail.

## 7. State machine заявок

### 7.1 Основные статусы order

| Код статуса | Описание |
|---|---|
| draft | Черновик |
| created | Заявка создана |
| awaiting_payment | Ожидается входящий фиатный платёж |
| awaiting_crypto | Ожидается поступление криптовалюты |
| payment_received | Платёж получен |
| crypto_received | Криптовалюта получена |
| under_review | На проверке |
| confirmed | Подтверждено оператором |
| processing | Выполняется расчёт / перевод |
| payout_processing | Выполняется фиатная выплата |
| crypto_sending | Выполняется отправка криптовалюты |
| completed | Заявка завершена |
| rejected | Заявка отклонена |
| cancelled | Заявка отменена |
| expired | Истёк срок действия |
| failed | Ошибка обработки |
| requires_manual_review | Требуется ручная проверка |

### 7.2 Разрешённые переходы

| From | To |
|---|---|
| draft | created, cancelled |
| created | awaiting_payment, awaiting_crypto, cancelled, expired |
| awaiting_payment | payment_received, requires_manual_review, cancelled, expired |
| awaiting_crypto | crypto_received, requires_manual_review, cancelled, expired |
| payment_received | under_review, confirmed |
| crypto_received | under_review, confirmed |
| under_review | confirmed, rejected, requires_manual_review |
| confirmed | processing, payout_processing, crypto_sending |
| processing | completed, failed, requires_manual_review |
| payout_processing | completed, failed, requires_manual_review |
| crypto_sending | completed, failed, requires_manual_review |
| requires_manual_review | confirmed, rejected, cancelled |
| failed | requires_manual_review, cancelled |

### 7.3 Правила state machine

- Нельзя изменять статус в обход workflow engine.
- Каждый переход должен валидироваться.
- Каждый переход должен создавать запись в OrderStatusHistory.
- Каждый side effect должен быть идемпотентным.
- Повторный webhook не должен дублировать транзакцию.

## 8. Сущности и модель данных

### 8.1 Общая схема сущностей

Основные сущности:

- users
- user_profiles
- user_consents
- roles
- wallets
- payout_requisites
- assets
- networks
- fiat_currencies
- exchange_pairs
- fee_rules
- limit_rules
- exchange_orders
- order_quotes
- order_status_history
- payment_transactions
- crypto_transactions
- provider_events
- notifications
- notification_templates
- documents
- audit_logs
- risk_flags
- automation_rules
- system_settings
- internal_comments

### 8.2 users

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| email | varchar(320), unique | Email пользователя |
| password_hash | text | Хэш пароля |
| status | enum | pending_email_verification / active / suspended / deleted |
| role_id | UUID | Базовая роль |
| created_at | timestamp | Дата создания |
| updated_at | timestamp | Дата изменения |
| last_login_at | timestamp nullable | Последний логин |

### 8.3 user_profiles

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK users.id |
| first_name | varchar(100) | Имя |
| last_name | varchar(100) | Фамилия |
| phone | varchar(32) nullable | Телефон |
| locale | varchar(10) | ru-RU default |
| notification_email_enabled | boolean | Email notifications flag |
| created_at | timestamp | Создание |
| updated_at | timestamp | Обновление |

### 8.4 user_consents

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK users.id |
| consent_type | enum | offer / privacy / marketing / aml_notice |
| document_version | varchar(50) | Версия документа |
| accepted_at | timestamp | Когда принято |
| ip_address | inet nullable | IP |
| user_agent | text nullable | User agent |

### 8.5 wallets

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK users.id |
| label | varchar(150) | Название кошелька |
| asset_code | varchar(20) | BTC / ETH / USDT ... |
| network_code | varchar(50) | TRC20 / ERC20 / BTC ... |
| address | text | Адрес |
| destination_tag | varchar(128) nullable | Tag / memo / destination id |
| status | enum | active / archived / pending_verification |
| created_at | timestamp | Создание |
| updated_at | timestamp | Обновление |

### 8.6 payout_requisites

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK users.id |
| requisite_type | enum | bank_card / bank_account / sbp / other |
| label | varchar(150) | Название шаблона |
| holder_name | varchar(200) | Получатель |
| bank_name | varchar(200) nullable | Банк |
| masked_value | varchar(128) | Маскированное значение |
| encrypted_payload | text | Защищённые реквизиты |
| status | enum | active / archived / pending_verification |
| created_at | timestamp | Создание |
| updated_at | timestamp | Обновление |

### 8.7 assets

| Поле | Тип | Описание |
|---|---|---|
| code | varchar(20), PK | Код актива |
| name | varchar(100) | Название |
| is_active | boolean | Доступен ли |
| precision | integer | Точность |
| created_at | timestamp | Создание |

### 8.8 networks

| Поле | Тип | Описание |
|---|---|---|
| code | varchar(50), PK | Код сети |
| name | varchar(100) | Название сети |
| asset_code | varchar(20) | Привязка к активу |
| is_active | boolean | Доступность |
| min_confirmations | integer | Требуемые подтверждения |

### 8.9 exchange_orders

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| order_no | varchar(50), unique | Публичный номер заявки |
| user_id | UUID | FK users.id |
| direction | enum | buy / sell |
| fiat_currency | varchar(10) | RUB и др. |
| crypto_asset | varchar(20) | Код актива |
| crypto_network | varchar(50) | Сеть |
| amount_fiat | numeric(24,8) | Сумма фиата |
| amount_crypto | numeric(24,8) | Сумма крипты |
| exchange_rate | numeric(24,12) | Зафиксированный курс |
| fee_amount_fiat | numeric(24,8) | Комиссия в фиате |
| fee_amount_crypto | numeric(24,8) | Комиссия в крипте |
| total_payable_fiat | numeric(24,8) nullable | К оплате |
| total_receivable_fiat | numeric(24,8) nullable | К получению |
| total_receivable_crypto | numeric(24,8) nullable | К получению |
| wallet_snapshot | jsonb | Снимок реквизитов кошелька |
| payout_snapshot | jsonb | Снимок реквизитов выплаты |
| current_status | varchar(50) | Текущий статус |
| automation_mode | enum | manual / semi_auto / auto |
| risk_level | enum | low / medium / high |
| quote_expires_at | timestamp nullable | Срок действия котировки |
| created_at | timestamp | Создание |
| updated_at | timestamp | Обновление |
| completed_at | timestamp nullable | Завершение |

### 8.10 order_quotes

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| order_id | UUID nullable | FK exchange_orders.id |
| direction | enum | buy / sell |
| fiat_currency | varchar(10) | Валюта |
| crypto_asset | varchar(20) | Актив |
| crypto_network | varchar(50) | Сеть |
| input_amount | numeric(24,8) | Входная сумма |
| output_amount | numeric(24,8) | Выходная сумма |
| rate | numeric(24,12) | Курс |
| fee_amount | numeric(24,8) | Комиссия |
| fee_model | varchar(50) | flat / percent / mixed |
| expires_at | timestamp | Срок жизни |
| created_at | timestamp | Создание |

### 8.11 order_status_history

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| order_id | UUID | FK exchange_orders.id |
| from_status | varchar(50) nullable | Из какого статуса |
| to_status | varchar(50) | В какой статус |
| actor_type | enum | user / operator / admin / service |
| actor_id | UUID nullable | Кто изменил |
| reason_code | varchar(100) nullable | Код причины |
| comment | text nullable | Комментарий |
| metadata | jsonb | Доп.данные |
| created_at | timestamp | Время изменения |

### 8.12 payment_transactions

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| order_id | UUID | FK exchange_orders.id |
| type | enum | incoming / outgoing |
| provider_code | varchar(50) | Провайдер |
| provider_reference | varchar(255) nullable | ID у провайдера |
| amount | numeric(24,8) | Сумма |
| currency | varchar(10) | Валюта |
| status | enum | created / pending / received / confirmed / failed / cancelled |
| raw_payload | jsonb nullable | Данные провайдера |
| processed_at | timestamp nullable | Обработка |
| created_at | timestamp | Создание |
| updated_at | timestamp | Обновление |

### 8.13 crypto_transactions

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| order_id | UUID | FK exchange_orders.id |
| type | enum | incoming / outgoing |
| provider_code | varchar(50) nullable | Провайдер |
| tx_hash | varchar(255) nullable | Hash транзакции |
| asset_code | varchar(20) | Актив |
| network_code | varchar(50) | Сеть |
| address | text | Адрес |
| amount | numeric(24,8) | Сумма |
| confirmations | integer default 0 | Подтверждения |
| required_confirmations | integer | Требуемые подтверждения |
| status | enum | created / pending / detected / confirmed / sent / failed |
| raw_payload | jsonb nullable | Payload |
| created_at | timestamp | Создание |
| updated_at | timestamp | Обновление |

### 8.14 provider_events

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| provider_code | varchar(50) | Код провайдера |
| event_type | varchar(100) | Тип события |
| external_event_id | varchar(255) nullable | ID события |
| payload | jsonb | Полный payload |
| checksum | varchar(255) nullable | Контрольная подпись |
| processing_status | enum | new / processed / duplicate / failed |
| received_at | timestamp | Время получения |
| processed_at | timestamp nullable | Время обработки |

### 8.15 notifications

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK users.id |
| order_id | UUID nullable | FK exchange_orders.id |
| channel | enum | email |
| template_code | varchar(100) | Код шаблона |
| subject | varchar(255) | Subject |
| payload | jsonb | Данные шаблона |
| status | enum | queued / sent / failed / cancelled |
| retry_count | integer | Кол-во попыток |
| sent_at | timestamp nullable | Отправка |
| created_at | timestamp | Создание |

### 8.16 documents

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK users.id |
| order_id | UUID nullable | FK exchange_orders.id |
| document_type | enum | receipt / confirmation / invoice / other |
| file_name | varchar(255) | Имя файла |
| mime_type | varchar(100) | Тип |
| storage_path | text | Путь хранения |
| generated_at | timestamp | Генерация |
| sent_at | timestamp nullable | Отправка |
| metadata | jsonb nullable | Метаинформация |

### 8.17 audit_logs

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| entity_type | varchar(100) | Тип сущности |
| entity_id | UUID nullable | ID сущности |
| action | varchar(100) | Действие |
| actor_type | enum | user / operator / admin / service |
| actor_id | UUID nullable | ID актора |
| before_data | jsonb nullable | До изменения |
| after_data | jsonb nullable | После изменения |
| metadata | jsonb nullable | Доп. данные |
| created_at | timestamp | Время события |

### 8.18 risk_flags

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| order_id | UUID nullable | FK exchange_orders.id |
| user_id | UUID nullable | FK users.id |
| flag_code | varchar(100) | Код риска |
| severity | enum | low / medium / high / critical |
| status | enum | open / reviewed / resolved / dismissed |
| comment | text nullable | Комментарий |
| created_at | timestamp | Создание |
| resolved_at | timestamp nullable | Завершение |

### 8.19 internal_comments

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Primary key |
| order_id | UUID | FK exchange_orders.id |
| author_id | UUID | ID сотрудника |
| author_role | enum | operator / compliance / admin |
| comment | text | Текст |
| is_private | boolean | Только внутренняя видимость |
| created_at | timestamp | Время создания |

## 9. Коллекции Directus

### 9.1 Обязательные collections

- users
- user_profiles
- user_consents
- wallets
- payout_requisites
- assets
- networks
- exchange_orders
- order_quotes
- order_status_history
- payment_transactions
- crypto_transactions
- provider_events
- notifications
- notification_templates
- documents
- audit_logs
- risk_flags
- internal_comments
- fee_rules
- limit_rules
- automation_rules
- system_settings

### 9.2 Системные справочники

Справочники должны включать:

- список активов;
- список сетей;
- список направлений;
- список статусов;
- список риск-флагов;
- список кодов причин отказа;
- список шаблонов уведомлений.

### 9.3 Flows Directus

Предлагаемые flows:

1. On user registration → create profile + send verification email.
2. On order created → create status history + generate payment/crypto instructions.
3. On payment status changed → write audit + advance workflow if allowed.
4. On crypto transaction confirmed → write audit + advance workflow if allowed.
5. On order completed → generate document + enqueue notification.
6. On order rejected → enqueue rejection email.
7. On suspicious event → create risk flag + notify operator/compliance.

## 10. API contract

### 10.1 Общие принципы API

- REST API поверх HTTPS.
- JSON request/response.
- JWT или session-based auth.
- Идемпотентность для критичных POST операций, если операция может быть повторена.
- Версионирование API через `/api/v1/`.

### 10.2 Auth API

| Method | Endpoint | Назначение |
|---|---|---|
| POST | /api/v1/auth/register | Регистрация |
| POST | /api/v1/auth/login | Логин |
| POST | /api/v1/auth/logout | Выход |
| POST | /api/v1/auth/refresh | Обновление токена/сессии |
| POST | /api/v1/auth/forgot-password | Запрос сброса пароля |
| POST | /api/v1/auth/reset-password | Сброс пароля |
| GET | /api/v1/auth/verify-email | Подтверждение email |

### 10.3 Profile API

| Method | Endpoint | Назначение |
|---|---|---|
| GET | /api/v1/profile | Получить профиль |
| PATCH | /api/v1/profile | Обновить профиль |
| GET | /api/v1/profile/consents | Список согласий |
| POST | /api/v1/profile/consents | Принять документ |

### 10.4 Wallets API

| Method | Endpoint | Назначение |
|---|---|---|
| GET | /api/v1/wallets | Список кошельков |
| POST | /api/v1/wallets | Создать кошелёк |
| PATCH | /api/v1/wallets/{id} | Обновить кошелёк |
| DELETE | /api/v1/wallets/{id} | Архивировать кошелёк |

### 10.5 Payout requisites API

| Method | Endpoint | Назначение |
|---|---|---|
| GET | /api/v1/payout-requisites | Список реквизитов |
| POST | /api/v1/payout-requisites | Добавить реквизит |
| PATCH | /api/v1/payout-requisites/{id} | Обновить реквизит |
| DELETE | /api/v1/payout-requisites/{id} | Архивировать реквизит |

### 10.6 Quote API

| Method | Endpoint | Назначение |
|---|---|---|
| POST | /api/v1/quotes | Получить котировку |

#### Request пример

```json
{
  "direction": "buy",
  "fiat_currency": "RUB",
  "crypto_asset": "USDT",
  "crypto_network": "TRC20",
  "input_amount": "100000"
}
```

#### Response пример

```json
{
  "quote_id": "uuid",
  "direction": "buy",
  "rate": "96.500000000000",
  "fee_amount": "1500.00",
  "output_amount": "1020.72",
  "expires_at": "2026-10-03T09:15:00Z"
}
```

### 10.7 Orders API

| Method | Endpoint | Назначение |
|---|---|---|
| GET | /api/v1/orders | Список своих заявок |
| POST | /api/v1/orders | Создать заявку |
| GET | /api/v1/orders/{id} | Детали заявки |
| POST | /api/v1/orders/{id}/cancel | Отменить заявку |
| GET | /api/v1/orders/{id}/timeline | Таймлайн статусов |

#### Create order request пример

```json
{
  "quote_id": "uuid",
  "wallet_id": "uuid",
  "payout_requisite_id": null,
  "accept_terms": true
}
```

### 10.8 Operator API

| Method | Endpoint | Назначение |
|---|---|---|
| GET | /api/v1/operator/orders | Очередь заявок |
| GET | /api/v1/operator/orders/{id} | Карточка заявки |
| POST | /api/v1/operator/orders/{id}/confirm-payment | Подтвердить платёж |
| POST | /api/v1/operator/orders/{id}/confirm-crypto | Подтвердить поступление крипты |
| POST | /api/v1/operator/orders/{id}/confirm-payout | Подтвердить выплату |
| POST | /api/v1/operator/orders/{id}/confirm-send | Подтвердить отправку крипты |
| POST | /api/v1/operator/orders/{id}/reject | Отклонить заявку |
| POST | /api/v1/operator/orders/{id}/comment | Добавить комментарий |
| POST | /api/v1/operator/orders/{id}/transition | Выполнить переход статуса |

### 10.9 Webhooks API

| Method | Endpoint | Назначение |
|---|---|---|
| POST | /api/v1/webhooks/payment/{provider} | Webhook платёжного провайдера |
| POST | /api/v1/webhooks/crypto/{provider} | Webhook криптопровайдера |
| POST | /api/v1/webhooks/email/{provider} | Статусы email отправки |

## 11. Бизнес-правила

### 11.1 Правила создания заявки

- Нельзя создать заявку без подтверждения оферты.
- Нельзя создать заявку без валидной котировки.
- Нельзя создать заявку с истёкшей котировкой.
- Для buy обязателен wallet address.
- Для sell обязательны payout requisites.
- Валюта, сеть и актив должны быть разрешены системой.

### 11.2 Правила расчёта

- Quote должен иметь ограниченный TTL.
- Комиссия может быть flat, percent или mixed.
- При изменении рыночных параметров старый quote не должен silently mutate.
- В order всегда должен храниться snapshot расчёта.

### 11.3 Правила ручного подтверждения

- На MVP автоподтверждение отключено по умолчанию.
- Каждый операторский transition должен требовать авторизованную сессию сотрудника.
- Критичные переходы должны сопровождаться записью причины или комментария.

### 11.4 Правила отказа

Причины отказа должны быть формализованы кодами:

- payment_not_received
- crypto_not_received
- invalid_requisites
- quote_expired
- compliance_restriction
- suspicious_activity
- operator_rejection
- user_cancelled
- technical_failure

## 12. Валидации

### 12.1 Валидаторы frontend

- обязательность полей;
- формат email;
- формат суммы;
- формат адреса кошелька по сети;
- запрет отправки пустых форм;
- подтверждение критичных действий.

### 12.2 Валидаторы backend

- проверка роли доступа;
- проверка существования связанных сущностей;
- проверка ownership сущностей пользователя;
- проверка статуса перед transition;
- проверка TTL котировки;
- проверка supported asset/network;
- проверка дубликатов provider events.

## 13. Интеграционная архитектура

### 13.1 Provider pattern

Интеграции должны реализовываться через унифицированный adapter layer:

- payment provider adapter;
- crypto provider adapter;
- email provider adapter;
- document generator adapter.

Каждый адаптер должен поддерживать:

- create request;
- parse response;
- parse webhook;
- normalize statuses;
- map provider errors to internal errors.

### 13.2 Webhook processing

Алгоритм:

1. Принять webhook.
2. Проверить подпись / checksum.
3. Сохранить raw payload в provider_events.
4. Проверить duplicate по external_event_id и checksum.
5. Обработать через provider adapter.
6. Выполнить идемпотентное изменение внутренних сущностей.
7. Записать результат обработки.

### 13.3 Retry strategy

- Ошибки отправки email должны ретраиться по backoff policy.
- Ошибки внешних API должны логироваться и переводить сущность в безопасный статус.
- Неуспешные webhook обработки должны попадать в очередь повторной обработки.

## 14. Уведомления и документы

### 14.1 События для отправки email

- user_registered
- email_verified
- order_created
- payment_instruction_generated
- payment_confirmed
- crypto_instruction_generated
- crypto_confirmed
- order_completed
- order_rejected
- action_required
- receipt_generated

### 14.2 Шаблоны уведомлений

Каждый шаблон должен содержать:

- code;
- subject;
- body_html;
- body_text;
- variable schema;
- is_active.

### 14.3 Документы

Минимальные типы документов:

- receipt;
- order_confirmation;
- payout_confirmation;
- crypto_transfer_confirmation.

Документ должен содержать:

- номер заявки;
- дату;
- сумму;
- направление сделки;
- реквизиты операции;
- служебный идентификатор;
- юридический текст при необходимости.

## 15. Логирование и аудит

### 15.1 Обязательные события audit log

- регистрация пользователя;
- логин;
- смена пароля;
- принятие оферты;
- создание кошелька;
- создание реквизита выплаты;
- создание заявки;
- каждый transition статуса;
- создание / подтверждение платёжной транзакции;
- создание / подтверждение криптотранзакции;
- отправка уведомления;
- генерация документа;
- любое операторское или администраторское изменение.

### 15.2 Формат audit event

Каждое событие должно содержать:

- entity_type;
- entity_id;
- action;
- actor_type;
- actor_id;
- before_data;
- after_data;
- metadata;
- timestamp.

## 16. Обработка ошибок

### 16.1 Категории ошибок

- validation_error
- auth_error
- permission_error
- integration_error
- business_rule_error
- system_error

### 16.2 Принципы обработки

- Пользователь должен получать человекопонятную ошибку без раскрытия внутренних деталей.
- Сотрудник должен видеть расширенный контекст ошибки в operator/admin UI.
- Критичные ошибки должны логироваться в error tracking.
- Ошибки интеграции не должны ломать консистентность заказа.

## 17. Безопасность

### 17.1 Основные требования

- HTTPS only.
- Хранение паролей только в виде стойких hash.
- Чувствительные реквизиты должны храниться в зашифрованном виде.
- Доступ к админке должен быть ограничен по ролям.
- Все чувствительные изменения должны записываться в audit trail.
- Необходимо предусмотреть rate limiting для auth endpoints.

### 17.2 Защита интеграций

- Проверка подписи webhook.
- IP allowlist, если поддерживается провайдером.
- Secret rotation policy.
- Разделение sandbox и production credentials.

## 18. Нефункциональные требования

### 18.1 Производительность

- Время ответа основных API до 500 мс без учёта внешних провайдеров для типового сценария.
- Длинные операции должны выполняться асинхронно.
- Списки в админке должны поддерживать пагинацию, фильтрацию и сортировку.

### 18.2 Наблюдаемость

- Структурированные логи.
- Метрики по статусам заявок.
- Метрики по отказам интеграций.
- Метрики по времени прохождения заявки.
- Alerting по stuck orders и failed payouts.

### 18.3 Масштабируемость

- Возможность добавить новые активы и сети без переработки доменной модели.
- Возможность подключать нескольких провайдеров по одному типу интеграции.
- Возможность включать автоматизацию постепенно.

## 19. Frontend specification

### 19.1 Клиентские экраны

Минимальный набор экранов:

- landing / entry;
- registration;
- login;
- forgot/reset password;
- dashboard;
- create buy order;
- create sell order;
- order details;
- wallets management;
- payout requisites management;
- notifications center;
- documents / receipts;
- profile settings.

### 19.2 Операторские экраны

- очередь заявок;
- карточка заявки;
- список платежей;
- список криптотранзакций;
- риск-флаги;
- журнал событий;
- настройки фильтров.

### 19.3 UI/UX правила

- Пошаговый wizard для создания заявки.
- Видимый status tracker по каждой заявке.
- Понятные call-to-action и empty states.
- Копирование реквизитов в один клик.
- Mobile-first адаптация.
- Разделение пользовательских и внутренних комментариев.

## 20. Backlog реализации

### 20.1 Sprint 0 — Foundation

- Поднять Directus и PostgreSQL.
- Настроить environments.
- Настроить базовую auth модель.
- Создать collections.
- Настроить roles & permissions.
- Настроить базовый audit log.

### 20.2 Sprint 1 — Identity & Profile

- Регистрация и авторизация.
- Подтверждение email.
- Профиль пользователя.
- Согласия и документы оферты.

### 20.3 Sprint 2 — Requisites

- Кошельки.
- Реквизиты выплат.
- Валидации форматов.
- Управление шаблонами реквизитов.

### 20.4 Sprint 3 — Quotes & Orders

- Quote engine.
- Создание buy/sell order.
- Timeline и история статусов.
- Order detail view.

### 20.5 Sprint 4 — Operator workflow

- Очередь заявок.
- Ручные переходы статусов.
- Внутренние комментарии.
- Payment and crypto transaction views.

### 20.6 Sprint 5 — Notifications & Documents

- Email templates.
- Очередь отправки email.
- Генерация чеков и документов.
- Архив документов.

### 20.7 Sprint 6 — Integrations

- Payment webhook adapter.
- Crypto webhook adapter.
- Retry/reprocessing flow.
- Error handling improvements.

### 20.8 Sprint 7 — Hardening

- Риск-флаги.
- Наблюдаемость.
- Производительность.
- Security review.
- QA regression.

## 21. Тестирование

### 21.1 Виды тестирования

- unit tests для бизнес-правил;
- integration tests для адаптеров;
- API tests;
- UI tests для ключевых пользовательских сценариев;
- regression tests;
- security tests для auth и admin зон.

### 21.2 Критические test cases

- создание buy order;
- создание sell order;
- quote expired;
- duplicate webhook;
- invalid wallet address;
- ручное подтверждение платежа;
- ручное подтверждение криптопоступления;
- генерация чека;
- повторная отправка email;
- отказ заявки по риску.

## 22. Критерии готовности

Функция считается готовой, если:

- реализована бизнес-логика;
- есть UI сценарий, если он требуется;
- выполнены валидации;
- события логируются;
- покрыты основные позитивные и негативные сценарии;
- подготовлены тест-кейсы;
- отсутствуют критические дефекты.

## 23. Открытые проектные решения

Требуют отдельного подтверждения до начала полной реализации:

- список активов и сетей для MVP;
- модель поставщика курсов;
- конкретный платёжный провайдер;
- конкретный email provider;
- формат чеков и юридическая модель документов;
- необходимость KYC/AML в MVP;
- критерии перехода от manual к semi-auto/auto;
- правила risk scoring;
- требования к SLA операторской обработки.

## 24. Рекомендуемый следующий документ

После утверждения данной техспецификации рекомендуется подготовить отдельный документ **Directus Implementation Blueprint**, в котором будут перечислены:

- точные collections;
- field schemas;
- relations;
- permissions по ролям;
- flows;
- hooks/extensions;
- environment variables;
- deployment topology.