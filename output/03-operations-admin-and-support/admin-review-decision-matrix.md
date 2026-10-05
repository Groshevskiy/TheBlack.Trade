## Document metadata

- Status: active
- Role: Companion spec
- Owner: Operations + Compliance
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `approval-workflow-schema.md`
  - `admin-console-ia-and-workspace-spec.md`
- Related documents:
  - `admin-ui-control-state-map.md`
  - `acceptance-test-catalog.md`

# Admin Review Decision Matrix — TheBlack.Trade

## 1. Назначение документа

Этот документ формализует правила принятия решений оператором/администратором в ручных, спорных и risk-sensitive сценариях платформы TheBlack.Trade.

Документ нужен для того, чтобы:

- унифицировать решения разных операторов;
- уменьшить вероятность ошибочного подтверждения оплаты, payout или реквизитов;
- задать понятные escalation paths;
- обеспечить воспроизводимость решений и auditability;
- подготовить основу для дальнейшей автоматизации decision rules.

## 2. Scope

Decision matrix покрывает следующие классы кейсов:

- подтверждение входящего фиатного платежа;
- подтверждение входящего криптоперевода;
- проверка wallet/payout requisites;
- payout release или payout hold;
- discrepancy и reconciliation cases;
- order cancellation / rejection / escalation;
- operator overrides и manual adjustments.

## 3. Основные принципы ручного review

Оператор должен руководствоваться следующими принципами:

1. **Безопасность важнее скорости** — если данных недостаточно, кейс не подтверждается автоматически вручную «по ощущению».
2. **Решение должно опираться на evidence** — provider status, reference, tx hash, attachments, timeline, validation logs, reconciliation records.
3. **Каждое нетривиальное решение должно быть объяснимым** — reason code и notes обязательны.
4. **High-risk решения требуют escalation** — особенно если затрагивают payout, overrides или adjustments.
5. **История не переписывается** — исправления делаются через controlled transitions и adjustments.

## 4. Роли в review-процессе

| Роль | Полномочия |
|---|---|
| Support operator | Базовая проверка кейса, запрос недостающих данных, перевод в review queue |
| Operations reviewer | Подтверждение/отклонение стандартных кейсов, работа с payment/payout review |
| Senior operations reviewer | Разрешение ambiguous/high-risk кейсов, approval manual overrides |
| Finance/settlement reviewer | Разбор payout, settlement, reconciliation и discrepancy cases |
| Compliance reviewer | Ограничения, подозрительные кейсы, policy-driven блокировки |
| System admin | Технические действия, но не business-approval по умолчанию |

## 5. Evidence sources for decision-making

Перед принятием решения оператор должен опираться на следующие источники, если они применимы:

- `Order` summary
- order lifecycle status
- `PaymentRecord`
- `CryptoTransferRecord`
- `SettlementRecord`
- `WalletConnection` / `OrderWalletSnapshot`
- provider callback / provider reference
- attachment/proof submitted by user
- reconciliation status
- discrepancy case
- risk flags
- timeline events
- previous operator notes

## 6. Standard decision actions

| Action | Значение |
|---|---|
| confirm | Подтвердить кейс |
| reject | Отклонить кейс |
| request_more_info | Запросить дополнительные данные |
| hold | Временно остановить дальнейшее движение |
| escalate | Передать кейс на следующий уровень |
| retry_check | Повторно проверить позже или после sync/polling |
| cancel_order | Отменить заявку |
| create_adjustment | Создать корректирующее действие |
| release_payout | Разрешить выплату |
| block_payout | Заблокировать выплату |

## 7. Severity model

| Severity | Описание |
|---|---|
| low | Ошибка или недочет без немедленного финансового риска |
| medium | Нужна дополнительная проверка |
| high | Возможна финансовая ошибка или ущерб |
| critical | Нельзя продолжать без senior/finance/compliance review |

## 8. Decision matrix overview

Ниже приведены ключевые ручные сценарии.

## 8.1 Payment confirmation review

| Сценарий | Условия | Recommended action | Escalation | Notes |
|---|---|---|---|---|
| User submitted proof, provider match exact | Совпадает сумма, reference, окно времени, нет конфликтов | confirm | No | Записать evidence source |
| User submitted proof, provider signal absent | Proof есть, но внешний сигнал не найден | hold / request_more_info | Ops reviewer | Не подтверждать без дополнительных данных, если policy не допускает |
| Wrong amount but still traceable | Платеж найден, сумма отличается | hold | Senior ops / finance | Нужна policy по over/underpayment |
| Partial payment | Обнаружена только часть суммы | hold / request_more_info | Ops reviewer | Нужен decision path: доплата, reject или manual adjust |
| Duplicate candidate match | Один платеж может относиться к нескольким order | escalate | Senior ops | Без уникального resolution не подтверждать |
| Payment arrived after expiration | Платеж подтвержден, но поздно | hold | Ops / finance | Решение зависит от pricing/expiration policy |
| Suspicious proof attachment | Файл/скрин вызывает сомнения | escalate | Compliance / senior ops | Не опираться только на attachment |
| Callback says success, internal mismatch exists | Внешний success есть, но internal model расходится | hold | Finance/settlement | Нужен reconcile before confirm |

## 8.2 Crypto incoming transfer review

| Сценарий | Условия | Recommended action | Escalation | Notes |
|---|---|---|---|---|
| Exact asset/network/amount and sufficient confirmations | Все совпадает | confirm | No | Зафиксировать tx reference |
| Correct tx but low confirmations | Tx найден, но confirmation depth insufficient | hold / retry_check | Ops reviewer | Подтверждение позже |
| Wrong network | Актив пришел в другой сети | escalate | Senior ops / compliance | Высокий риск потери или recovery complexity |
| Wrong asset | Пришел другой актив | escalate | Senior ops | Нужен recovery policy |
| Amount below expected | Недостаточная сумма | hold / request_more_info | Ops reviewer | Решение по доплате/partial accept |
| Duplicate attribution risk | Tx может быть привязан к нескольким order | escalate | Senior ops | Нужна уникальная привязка |
| Ambiguous source wallet | Источник вызывает risk concern | hold | Compliance | Особенно для high-risk cases |

## 8.3 Wallet / destination verification review

| Сценарий | Условия | Recommended action | Escalation | Notes |
|---|---|---|---|---|
| Valid format and no risk flags | Все валидно | confirm / verify | No | Можно auto-verify по policy |
| Missing required memo/tag | Сеть требует memo/tag, он отсутствует | reject / request_more_info | No | Не подтверждать |
| Network mismatch | Адрес не соответствует выбранной сети | reject | No | Явный invalid case |
| Ambiguous provider-linked data | Провайдер вернул неполные/противоречивые данные | hold | Ops reviewer | Требуется ручная проверка |
| Destination on deny-list | Реквизит запрещен | reject / block_payout | Compliance | Возможна блокировка order |
| Recently changed payout details before payout | Реквизиты изменены незадолго до выплаты | hold | Senior ops / compliance | Сильный fraud indicator |
| Reused previously rejected destination | Повторное использование отклоненного реквизита | escalate | Compliance | Требует отдельного решения |

## 8.4 Payout release review

| Сценарий | Условия | Recommended action | Escalation | Notes |
|---|---|---|---|---|
| Order financially closed except payout release | Payment/crypto/exchange согласованы, payout details verified | release_payout | No | Стандартный кейс |
| Payout details not verified | Не завершена проверка реквизитов | hold / block_payout | Ops reviewer | Без verified destination payout не выпускать |
| Reconciliation unresolved | Есть unresolved discrepancy | block_payout | Finance reviewer | Выплата блокируется |
| High-value payout | Сумма выше policy threshold | escalate | Senior ops / finance | Может требовать second approval |
| Manual override requested | Нужен обход обычной логики | escalate | Senior ops + finance | Обязательно notes + reason code |
| Provider unavailable | Нельзя безопасно инициировать payout | hold / retry_check | Finance/settlement | Не переводить в completed |
| Payout duplicate risk | Похоже, что payout уже запускался | block_payout | Finance reviewer | Проверить settlement и provider refs |

## 8.5 Reconciliation / discrepancy review

| Сценарий | Условия | Recommended action | Escalation | Notes |
|---|---|---|---|---|
| Low-severity mismatch with clear explanation | Несущественное расхождение, легко объяснимое | create_adjustment / resolve | Ops or finance | Только с reason code |
| Payment status mismatch unresolved | Internal/external payment states расходятся | hold | Finance reviewer | Нельзя закрывать order |
| Exchange output mismatch | Output не соответствует expected settlement | escalate | Finance / senior ops | Критично для customer outcome |
| Payout confirmation missing | Внутренне payout завершен, внешнего доказательства нет | hold | Finance reviewer | Требуется reconcile |
| Duplicate movement suspicion | Подозрение на duplicate payment/payout | escalate | Finance + compliance | High/critical severity |
| Ledger incomplete | Отсутствуют обязательные ledger entries | hold | Backend/finance | Нужна системная или manual correction |

## 8.6 Order cancellation / rejection review

| Сценарий | Условия | Recommended action | Escalation | Notes |
|---|---|---|---|---|
| User canceled before financial movement | Ничего не получено и не отправлено | cancel_order | No | Стандартный safe cancel |
| User canceled after payment received | Есть payment, но exchange не завершен | hold / escalate | Finance/ops | Требуется policy по refund/adjustment |
| User unresponsive after request_more_info | Истек SLA ожидания | reject / cancel_order | Ops reviewer | По policy |
| Fraud suspicion | Есть признаки мошенничества | hold / escalate | Compliance | Не cancel silently |
| Destination invalid and not corrected | Пользователь не исправил реквизиты | reject / cancel_order | Ops reviewer | С сохранением notes |

## 9. Decision rules by action type

## 9.1 Confirm

Разрешено только если:

- есть достаточное evidence;
- нет unresolved high/critical risk flags;
- transition допустим state machine;
- решение не создает неконтролируемого финансового обязательства.

## 9.2 Reject

Используется, если:

- данные явно некорректны;
- policy запрещает continuation;
- пользователь не выполнил prerequisite;
- реквизит, proof или transfer invalid.

## 9.3 Hold

Используется, если:

- данных недостаточно;
- есть ambiguity;
- нужен reconcile;
- нельзя безопасно принять confirm/reject прямо сейчас.

## 9.4 Escalate

Обязательно, если:

- high-value case;
- compliance concern;
- duplicate movement risk;
- payout override;
- manual financial adjustment;
- exception outside normal policy.

## 10. Required reason codes

Все non-trivial actions должны сопровождаться reason code.

### Recommended reason code families

- `payment_*`
- `crypto_*`
- `wallet_*`
- `payout_*`
- `reconcile_*`
- `compliance_*`
- `manual_override_*`

### Examples

- `payment_amount_mismatch`
- `payment_not_found`
- `crypto_low_confirmations`
- `wallet_network_mismatch`
- `payout_duplicate_risk`
- `reconcile_external_internal_mismatch`
- `manual_override_approved`

## 11. Escalation paths

| Trigger | Escalate to |
|---|---|
| High-value payout | Senior ops + finance |
| Compliance red flag | Compliance reviewer |
| Duplicate payment or payout suspicion | Finance reviewer + compliance |
| Manual adjustment over threshold | Finance + senior ops |
| Policy ambiguity | Product/operations owner |
| Technical inconsistency in ledger/state | Backend owner + finance reviewer |

## 12. SLA guidance for manual review

| Queue type | Target response |
|---|---|
| Standard payment review | Fast / same operational window |
| Standard wallet verification | Fast / same operational window |
| Payout hold review | Higher priority |
| Reconciliation discrepancy | Priority based on severity |
| Compliance escalation | According to compliance queue policy |

Точные SLA могут быть вынесены в отдельный runbook или operations spec.

## 13. Auditability requirements

Каждое ручное решение должно сохранять:

- actor;
- timestamp;
- previous state;
- new state;
- action;
- reason code;
- free-text note;
- evidence references;
- escalation path, если был.

## 14. UI requirements for operator console

Operator UI должен поддерживать:

- decision panel с allowed actions;
- severity indicator;
- evidence summary;
- quick links на payment / transfer / payout / reconciliation records;
- mandatory reason code selection;
- mandatory note field для escalation, reject, manual override, adjustment;
- history of previous decisions.

## 15. Automation readiness

Decision matrix должна использоваться как основа для будущей автоматизации.

### Candidate automation-ready cases

- exact payment match with no risk flags;
- valid wallet with no ambiguity;
- low-risk payout with fully verified prerequisites;
- auto-resolution of low-severity reconcile cases.

### Cases that should remain manual longer

- high-value payout;
- duplicate movement suspicion;
- compliance restrictions;
- manual adjustments;
- mismatched network/asset scenarios.

## 16. QA checklist

QA должна проверить:

- allowed actions соответствуют роли пользователя;
- high-risk кейсы требуют escalation;
- confirm нельзя выполнить при unresolved blocking flags;
- reject/hold/escalate требуют reason code;
- operator notes и evidence references сохраняются;
- payout release блокируется без verified prerequisites;
- discrepancy cases влияют на available admin actions;
- audit trail сохраняется для всех critical decisions.

## 17. Следующие документы

На базе этой матрицы рекомендуется подготовить:

- `error-catalog-and-api-ui-mapping-spec.md`
- `observability-and-audit-spec.md`
- `compliance-and-legal-operations-spec.md`
- `operations-runbook-and-sla-spec.md`