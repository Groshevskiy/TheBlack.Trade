## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Product + Backend + Finance Ops
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `theblack-trade-order-state-machine-spec.md`
  - `enum-and-state-dictionary-spec.md`
  - `reconciliation-and-ledger-spec.md`
- Related documents:
  - `payment-provider-and-payout-integration-spec.md`
  - `wallet-and-exchange-provider-integration-spec.md`
  - `acceptance-test-catalog.md`

# Transaction Status State Machine Spec — TheBlack.Trade

## 1. Назначение документа

Документ описывает state machine для жизненного цикла заявок в TheBlack.Trade. Спецификация нужна для синхронизации backend, frontend, design, QA, support, operations и compliance вокруг единой модели состояний, переходов, событий, ручных проверок и автоматических сценариев.

Документ покрывает:

- основные статусы заявки;
- подстатусы оплаты, перевода, верификации и чека;
- допустимые переходы между состояниями;
- события, инициирующие переходы;
- ручные и автоматические действия;
- требования к UI и уведомлениям на каждом этапе.

## 2. Основные принципы state machine

1. **Одна заявка — один главный lifecycle status.**
2. **Подпроцессы могут иметь собственные подстатусы**, но они не должны противоречить главному статусу.
3. **Каждый переход должен быть вызван явным событием**: действием пользователя, действием оператора, системным событием или таймаутом.
4. **Каждый переход должен логироваться** в timeline/history.
5. **Ручная проверка** должна быть возможна как обязательный этап или как fallback.
6. **Автоматизация** должна включаться по конфигу и не ломать базовую state model.

## 3. Domain entities, влияющие на статус

State machine заявки зависит от следующих сущностей:

- Order / Заявка;
- Quote / Расчет;
- User / Пользователь;
- KYC Application / Верификация;
- Payment Record / Подтверждение оплаты;
- Crypto Transfer Record / Подтверждение перевода;
- Wallet / Destination details;
- Receipt;
- Operator Review Action;
- Notification events.

## 4. Главные статусы заявки

Рекомендуемый верхнеуровневый статус `order.status`:

| Код статуса | UI label | Описание |
|---|---|---|
| draft | Черновик | Заявка еще не подтверждена пользователем |
| pending_prerequisites | Требуются условия для продолжения | Не выполнены обязательные prerequisites |
| awaiting_payment | Ожидается оплата | Для buy-flow ожидается оплата от пользователя |
| payment_under_review | Оплата проверяется | Подтверждение оплаты отправлено и проверяется |
| awaiting_crypto_transfer | Ожидается перевод криптовалюты | Для sell-flow ожидается перевод от пользователя |
| crypto_transfer_under_review | Перевод проверяется | Подтверждение перевода отправлено и проверяется |
| processing_exchange | Обмен выполняется | Все входные условия выполнены, система/оператор проводит обмен |
| manual_review | Ручная проверка | Заявка передана на ручную проверку |
| settlement_pending | Завершение операции | Ожидается финализация выплаты, отправки актива или пост-обработки |
| completed | Завершено | Обмен успешно завершен |
| canceled | Отменено | Заявка отменена пользователем, оператором или системой |
| rejected | Отклонено | Заявка отклонена из-за нарушения правил или неподтвержденных данных |
| expired | Истекло | Срок действия заявки/шага истек |

## 5. Подстатусы prerequisites

Используются, когда `order.status = pending_prerequisites`.

| Поле | Значения |
|---|---|
| prerequisite_type | auth_required, kyc_required, wallet_required, quote_refresh_required, agreement_required |
| prerequisite_status | pending, submitted, approved, rejected, expired |

### Примеры

- пользователь не авторизован → `auth_required`
- KYC не пройден → `kyc_required`
- не указан кошелек → `wallet_required`
- срок действия расчета истек → `quote_refresh_required`

## 6. Подстатусы верификации

Рекомендуемое поле `order.kyc_status_snapshot` или ссылка на текущий `kyc_application.status`.

| KYC status | UI label |
|---|---|
| not_required | Не требуется |
| required | Требуется верификация |
| draft | Черновик |
| submitted | Заявка отправлена |
| in_review | Проверяется |
| approved | Пройдена |
| rejected | Отклонена |
| resubmission_required | Требуются исправления |
| expired | Истекла |

## 7. Подстатусы оплаты

Рекомендуемое поле `order.payment_status` для buy-flow.

| Payment status | UI label | Описание |
|---|---|---|
| not_applicable | Не применяется | Для sell-flow |
| pending | Ожидается оплата | Платеж еще не подтвержден пользователем |
| submitted | Подтверждение отправлено | Пользователь отправил подтверждение оплаты |
| in_review | Проверяется | Оператор/система проверяет оплату |
| confirmed | Подтверждена | Оплата принята |
| rejected | Отклонена | Подтверждение не принято |
| expired | Истекла | Срок оплаты истек |

## 8. Подстатусы перевода криптовалюты

Рекомендуемое поле `order.crypto_transfer_status` для sell-flow.

| Transfer status | UI label | Описание |
|---|---|---|
| not_applicable | Не применяется | Для buy-flow |
| pending | Ожидается перевод | Перевод еще не подтвержден |
| submitted | Подтверждение отправлено | Пользователь подтвердил перевод |
| in_review | Проверяется | Идет проверка перевода |
| confirmed | Подтвержден | Перевод принят |
| rejected | Отклонен | Подтверждение перевода не принято |
| expired | Истек | Срок перевода истек |

## 9. Подстатусы выполнения exchange

Рекомендуемое поле `order.execution_status`.

| Execution status | UI label |
|---|---|
| not_started | Не начато |
| queued | В очереди |
| in_progress | Выполняется |
| partially_processed | Частично обработано |
| awaiting_operator | Ожидает оператора |
| completed | Выполнено |
| failed | Ошибка выполнения |

## 10. Подстатусы чека

Рекомендуемое поле `order.receipt_status`.

| Receipt status | UI label |
|---|---|
| not_available | Недоступен |
| pending | Формируется |
| issued | Доступен |
| failed | Ошибка формирования |

## 11. Основные сценарии lifecycle

## 11.1 Buy-flow lifecycle

Базовая последовательность:

1. `draft`
2. `pending_prerequisites` (если не выполнены prerequisites)
3. `awaiting_payment`
4. `payment_under_review`
5. `processing_exchange`
6. `settlement_pending`
7. `completed`

Возможные боковые переходы:

- на `manual_review`
- на `rejected`
- на `canceled`
- на `expired`

## 11.2 Sell-flow lifecycle

Базовая последовательность:

1. `draft`
2. `pending_prerequisites` (если не выполнены prerequisites)
3. `awaiting_crypto_transfer`
4. `crypto_transfer_under_review`
5. `processing_exchange`
6. `settlement_pending`
7. `completed`

Возможные боковые переходы:

- на `manual_review`
- на `rejected`
- на `canceled`
- на `expired`

## 12. Таблица переходов верхнего уровня

| From | Event | To | Trigger type | Комментарий |
|---|---|---|---|---|
| draft | order_created | pending_prerequisites | system | Если нужны prerequisites |
| draft | order_confirmed_ready | awaiting_payment | system | Buy-flow без блокеров |
| draft | order_confirmed_ready | awaiting_crypto_transfer | system | Sell-flow без блокеров |
| pending_prerequisites | prerequisites_completed_buy | awaiting_payment | system | Все условия выполнены |
| pending_prerequisites | prerequisites_completed_sell | awaiting_crypto_transfer | system | Все условия выполнены |
| pending_prerequisites | quote_expired | expired | system | Расчет истек |
| awaiting_payment | payment_confirmation_submitted | payment_under_review | user/system | Пользователь отправил подтверждение |
| payment_under_review | payment_confirmed | processing_exchange | operator/system | Оплата подтверждена |
| payment_under_review | payment_rejected_manual_fix | awaiting_payment | operator | Нужно повторное действие пользователя |
| awaiting_crypto_transfer | crypto_transfer_submitted | crypto_transfer_under_review | user/system | Пользователь подтвердил перевод |
| crypto_transfer_under_review | crypto_transfer_confirmed | processing_exchange | operator/system | Перевод подтвержден |
| crypto_transfer_under_review | crypto_transfer_rejected_manual_fix | awaiting_crypto_transfer | operator | Нужно повторное действие пользователя |
| processing_exchange | execution_requires_review | manual_review | system/operator | Автоматизация не смогла завершить шаг |
| processing_exchange | execution_completed | settlement_pending | system/operator | Основное выполнение завершено |
| manual_review | manual_review_resolved_to_processing | processing_exchange | operator | Возврат в исполнение |
| manual_review | manual_review_completed | settlement_pending | operator | Ручная обработка завершена |
| settlement_pending | settlement_completed | completed | system/operator | Финализация завершена |
| any_active | user_canceled | canceled | user | Разрешено политикой |
| any_active | operator_rejected | rejected | operator | Нарушение правил / неподтвержденность |
| any_active | timeout_expired | expired | system | Истек срок действия шага |

## 13. Логика prerequisites

Если prerequisites не выполнены, система не должна переводить заявку в статус, требующий действия, которое пока невозможно.

### Рекомендуемая проверка перед переходом в main action status:

- пользователь авторизован;
- если требуется — KYC approved;
- если требуется — wallet verified или wallet accepted;
- quote еще действителен;
- пользователь принял нужные соглашения;
- доступен платежный или payout-метод.

Если хотя бы одно условие не выполнено:

- `order.status = pending_prerequisites`
- `prerequisite_type` = соответствующий блокер
- frontend должен показывать один основной CTA на снятие этого блокера.

## 14. Логика ручной проверки

Статус `manual_review` должен использоваться как верхнеуровневый статус, если заявка временно выходит из штатного автоматического процесса и требует явного решения сотрудника.

### Причины перевода в manual_review

- риск-флаг по пользователю или заявке;
- несоответствие суммы или реквизитов;
- спорное подтверждение оплаты;
- неподтвержденный перевод криптовалюты;
- ошибка автопроцессинга;
- необходимость compliance-check.

### Полезные дополнительные поля

- `manual_review_reason_code`
- `manual_review_reason_text`
- `manual_review_assignee`
- `manual_review_started_at`
- `manual_review_resolution`

## 15. Логика отмены, отклонения и истечения

## 15.1 canceled

Используется, когда:

- пользователь отменил заявку;
- оператор отменил заявку по сервисной причине;
- заявка остановлена до выполнения обмена.

## 15.2 rejected

Используется, когда:

- заявка нарушает правила;
- подтверждение не может быть принято в рамках процесса;
- пользователь не прошел compliance/verification-check;
- выполнение операции запрещено политикой риска.

## 15.3 expired

Используется, когда:

- истек срок действия расчета;
- истек срок оплаты;
- истек срок перевода криптовалюты;
- истек SLA или временное окно шага.

Важно различать:

- **canceled** = процесс остановлен решением;
- **rejected** = процесс отклонен по правилам;
- **expired** = процесс завершился по времени.

## 16. UI-требования по status machine

Frontend должен:

- отображать главный статус и подстатусы согласованно;
- показывать пользователю только релевантное следующее действие;
- различать waiting states и action-required states;
- строить timeline на основе event history, а не только текущего статуса;
- уметь показывать manual review как отдельный объясняемый этап.

### Примеры mapping для customer UI

| Main status | Основной экран / CTA |
|---|---|
| pending_prerequisites | Экран блокера / CTA на устранение проблемы |
| awaiting_payment | Инструкция по оплате / CTA отправить подтверждение |
| payment_under_review | Статус ожидания / CTA открыть заявку |
| awaiting_crypto_transfer | Инструкция по переводу / CTA подтвердить перевод |
| crypto_transfer_under_review | Статус ожидания / CTA открыть заявку |
| processing_exchange | Экран обработки / без лишних CTA |
| manual_review | Экран ручной проверки / CTA открыть заявку или поддержку |
| settlement_pending | Финализация / ожидание |
| completed | Экран завершения / CTA скачать чек |
| rejected | Экран результата / CTA в зависимости от политики |
| expired | Экран истечения / CTA создать новую заявку |
| canceled | Экран отмены / CTA создать новую заявку |

## 17. Notification / email event mapping

Рекомендуется строить нотификации не только по статусу, а по конкретному transition event.

### Примеры

| Event | Email template |
|---|---|
| order_created | order_created |
| payment_confirmation_submitted | payment_submitted |
| payment_confirmed | payment_confirmed |
| payment_rejected_manual_fix | payment_rejected |
| crypto_transfer_submitted | crypto_transfer_submitted |
| crypto_transfer_confirmed | crypto_transfer_confirmed |
| crypto_transfer_rejected_manual_fix | crypto_transfer_rejected |
| execution_requires_review | order_manual_review |
| order_action_required | order_action_required |
| execution_completed + receipt pending | receipt_pending |
| receipt_issued | receipt_issued |
| settlement_completed | order_completed |

## 18. Timeline / audit requirements

Каждый переход должен создавать timeline event с минимумом полей:

- `event_key`
- `from_status`
- `to_status`
- `actor_type` (user / operator / system)
- `actor_id` (если применимо)
- `reason_code`
- `reason_text`
- `created_at`
- `metadata_json`

Это требуется для:

- customer timeline;
- operator audit;
- support debugging;
- compliance review;
- notification triggering.

## 19. QA checklist для state machine

Команда QA должна проверить:

- каждый верхнеуровневый статус достижим только допустимыми переходами;
- buy-flow и sell-flow не используют несовместимые подстатусы;
- manual_review корректно ставится и снимается;
- expired/canceled/rejected не смешиваются по логике;
- timeline события создаются на каждом переходе;
- email/notification events не теряются при ключевых переходах;
- UI показывает корректный CTA для каждого основного состояния.

## 20. Рекомендуемые следующие артефакты

На базе этой спецификации рекомендуется подготовить:

- Order Domain Model Spec;
- API Status Contract Spec;
- Event & Webhook Spec;
- Notification Event Matrix;
- Admin Review Decision Matrix.