## Document metadata

- Status: active
- Role: Companion spec
- Owner: Support + Operations
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `admin-console-ia-and-workspace-spec.md`
  - `compliance-and-legal-operations-spec.md`
- Related documents:
  - `operations-runbook-and-sla-spec.md`
  - `incident-response-playbook.md`

# Support Communication Guidelines — TheBlack.Trade

## 1. Назначение документа

Этот документ описывает правила коммуникации support и operations-команд с пользователями TheBlack.Trade: как объяснять статусы заявок, ручную проверку, задержки, отклонения, проблемы с документами и incident-related ситуации без расхождения с product state machine, compliance и notification semantics.

Документ предназначен для support, operations, compliance, product, CRM/content и QA-команд.

## 2. Цели документа

Guidelines нужны для того, чтобы:

- унифицировать customer-facing коммуникацию;
- исключить ложные обещания и несогласованные формулировки;
- сделать ответы понятными и action-oriented;
- уменьшить риск конфликтов между support wording и реальным статусом заявки;
- поддержать traceability и compliance-sensitive сценарии.

## 3. Scope

Документ покрывает:

- tone and principles;
- state-based communication rules;
- manual review wording;
- payout / wallet / payment issue communication;
- incident and delay communication;
- document/receipt communication;
- do/don’t rules;
- примерные message patterns.

## 4. Communication principles

1. **Support должен говорить только то, что подтверждено системой или уполномоченным reviewer.**
2. **Нельзя использовать “успешно”, если операция еще не дошла до подтвержденного завершения.**
3. **Каждый ответ должен либо информировать о статусе, либо объяснять следующее действие.**
4. **Customer wording должен быть понятным, но не раскрывать внутренние anti-fraud/compliance heuristics.**
5. **Формулировки должны быть согласованы с state machine и notification events.**

## 5. Tone of voice

Support tone должен быть:

- спокойным;
- конкретным;
- уважительным;
- без лишней юридической или технической перегрузки;
- без обвинительного или оборонительного тона.

### Communication style

- короткие и ясные предложения;
- сначала статус, затем причина/контекст, затем next step;
- без двусмысленных формулировок;
- без обещаний времени, если SLA/owner их не подтвердил.

## 6. Golden response structure

Рекомендуемая структура ответа:

1. Что сейчас происходит.
2. Почему заявка/операция находится в этом состоянии.
3. Что нужно от пользователя или команды дальше.
4. Что пользователь увидит следующим шагом.

## 7. State-based communication rules

Support communication должна опираться на реальные business states.

| State family | How to communicate |
|---|---|
| Created / pending next step | Заявка создана, нужно выполнить следующий шаг |
| Waiting for payment / transfer | Объяснить, что ожидается подтверждение действия пользователя/сети/провайдера |
| Review / verification | Объяснить, что операция находится на проверке |
| Hold / restricted | Объяснить, что требуется дополнительная проверка/действие без раскрытия внутренних причин |
| Completed | Подтвердить завершение только после final confirmed state |
| Rejected / canceled | Объяснить результат и, если возможно, дальнейший путь |

## 8. Approved wording for manual review

### Acceptable examples

- “Заявка находится на дополнительной проверке.”
- “Сейчас операция проверяется командой.”
- “Мы получили ваши данные и проводим проверку перед следующим этапом.”

### Avoid

- “Все уже успешно, просто подождите.”
- “Это стандартная формальность, точно скоро завершится.”
- “Система ошиблась, но все в порядке.”

Manual review wording должно быть нейтральным и не обещать outcome.

## 9. Payment-related communication

### When payment confirmation is received but not verified

Support должен говорить, что:

- подтверждение оплаты получено;
- оно находится на проверке;
- следующий статус появится после завершения проверки.

### Avoid

- подтверждать прием платежа как окончательно успешный, если payment еще review/pending;
- обещать completion до фактического подтверждения.

### If payment mismatch exists

Support должен:

- сообщить, что требуется дополнительная проверка;
- при необходимости запросить конкретные данные;
- не формулировать догадки как факт.

## 10. Wallet / requisites communication

### If requisites are under verification

- объяснить, что реквизиты/адрес проверяются;
- при необходимости указать, что до завершения проверки следующий этап недоступен.

### If requisites are rejected

- вежливо сообщить, что указанные данные не могут быть использованы;
- попросить предоставить обновленные/корректные реквизиты;
- не раскрывать внутренние risk rules, если они sensitive.

## 11. Payout communication

### Before payout completion

Support не должен писать, что выплата отправлена или завершена, если это не подтвержденный final state.

### If payout is in hold/review

Использовать wording вроде:

- “Выплата находится на завершающей проверке.”
- “Операция требует дополнительного подтверждения перед выплатой.”

### If payout delayed

- признать задержку;
- описать, что заявка находится в обработке;
- указать следующий ожидаемый communication point, если он известен.

## 12. Rejected / canceled case communication

Когда заявка отклонена или отменена, сообщение должно:

- ясно обозначить результат;
- указать, требуется ли действие пользователя;
- не обвинять пользователя;
- не использовать неопределенное “что-то пошло не так”, если есть более точный approved reason.

### Better phrasing

- “Мы не смогли подтвердить операцию на текущем этапе.”
- “Для продолжения требуется обновить реквизиты.”
- “Заявка была отменена, потому что срок действия шага истек.”

## 13. Request-more-info communication

Если команде нужны дополнительные данные, запрос должен быть:

- конкретным;
- ограниченным по объему;
- понятным для пользователя;
- без лишних внутренних терминов.

### Good example

“Пожалуйста, отправьте подтверждение перевода, где видны сумма, дата и реквизиты операции.”

### Avoid

- “Пришлите все, что у вас есть.”
- “У нас что-то не сходится.”

## 14. Delay and backlog communication

Если операция задерживается, support должен:

- признать факт задержки;
- не скрывать, что заявка еще не завершена;
- объяснить, что операция обрабатывается командой;
- не придумывать точный ETA без подтверждения.

### Safe wording

- “Обработка заявки занимает больше времени, чем обычно.”
- “Заявка остается в работе, команда продолжает проверку.”

## 15. Incident-related communication

При инцидентах customer-facing сообщения должны:

- признавать наличие технической или операционной задержки, если impact user-visible;
- не раскрывать внутренние security/compliance details;
- не объявлять полное восстановление до валидации recovery;
- быть согласованы с incident commander / approved messaging owner.

### Avoid

- “Проблема уже точно решена”, если recovery не подтвержден;
- “Это проблема провайдера, не наша”, если пользователь impacted сейчас;
- противоречивые статусы в разных каналах.

## 16. Document / receipt communication

### If document generated

Сообщение должно объяснить:

- что документ сформирован;
- где он доступен или как будет отправлен;
- требуется ли действие пользователя.

### If delivery failed

Support не должен говорить, что документ уже доставлен, если доставка не подтверждена.

### If re-send initiated

Нужно различать:

- повторную отправку того же документа;
- перевыпуск документа с новой версией/исправлением.

## 17. Prohibited wording

Support и operations не должны использовать:

- “Все точно уже завершено”, если state не final;
- “Сейчас вручную все поправим”, если override не согласован;
- “Это просто ошибка системы, игнорируйте”; 
- “Мы не знаем, что произошло” без follow-up structure;
- внутренние anti-fraud/compliance формулировки в customer reply.

## 18. Escalation rules for communication

Support обязан эскалировать кейс, если:

- customer wording может повлиять на payout/compliance outcome;
- нет уверенности в корректном status interpretation;
- есть incident-related массовый impact;
- требуется sensitive explanation по restricted/rejected кейсу;
- есть риск противоречия между сообщением и admin state.

## 19. Message pattern examples

## 19.1 Payment received, under review

“Мы получили подтверждение оплаты. Сейчас заявка находится на проверке, после завершения проверки статус обновится в личном кабинете.”

## 19.2 Manual review

“Заявка находится на дополнительной проверке. После завершения этого этапа мы обновим статус операции.”

## 19.3 Requisites need update

“Указанные реквизиты не удалось подтвердить. Пожалуйста, отправьте корректные данные, чтобы мы могли продолжить обработку заявки.”

## 19.4 Delayed processing

“Обработка заявки занимает больше времени, чем обычно. Операция остается в работе, и статус будет обновлен после завершения проверки.”

## 19.5 Document available

“Документ по операции сформирован и доступен в личном кабинете. Если требуется повторная отправка, сообщите об этом в поддержку.”

## 20. Agent tooling expectations

Support tooling should help avoid wording mistakes.

### Желательно поддержать:

- status-aware macros/templates;
- approved phrasing library;
- visibility of real order/payment/payout state;
- flags for compliance-sensitive cases;
- indicators for incident-affected cohorts;
- audit log of outbound support messages, если это поддерживается каналом.

## 21. QA checklist

QA должна проверить:

- support templates не называют pending/review операции completed;
- rejected/hold/review cases имеют отдельные approved patterns;
- request-more-info тексты понятны и конкретны;
- incident messaging не противоречит official incident status;
- document-related communication согласована с delivery state;
- escalation rules отражены в tooling/process.

## 22. Training recommendations

Support and operations team should be trained on:

- state machine basics;
- difference between payment confirmed vs order completed;
- hold/review/restricted semantics;
- re-send vs re-issue for documents;
- incident communication approval path;
- prohibited wording examples.

## 23. Следующие документы

На базе этих guidelines рекомендуется подготовить:

- `provider-capability-matrix.md`
- `production-readiness-checklist.md`
- `release-readiness-and-rollout-plan.md`
- `admin-permission-hardening-spec.md`