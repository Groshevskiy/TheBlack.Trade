# Доменная модель и Directus

## Доменное ядро

Из OpenAPI и companion specs видно, что основная сущность платформы — order, окруженный wallet, payout requisite, quote, document, notification, operator action и webhook event.[cite:3][cite:4] Теги с самым большим числом операций — `Operator Actions` и `Orders`, поэтому backoffice и workflow-история должны считаться частью core domain, а не дополнительным модулем.[cite:3]

## Recommended Directus collections

Минимальный набор collections:
- `tb_users`, `tb_assets`, `tb_networks`, `tb_fiat_currencies`, `tb_pairs`;
- `tb_quotes`, `tb_wallets`, `tb_payout_requisites`, `tb_orders`;
- `tb_order_timeline`, `tb_order_actions`, `tb_documents`, `tb_notifications`;
- `tb_webhook_events`, `tb_webhook_attempts`, `tb_idempotency_keys`, `tb_audit_logs`.

Такой состав согласуется со структурой implementation-ready endpoints по account data, orders, operator actions, webhooks и internal API.[cite:3][cite:4]

## Роли и permissions

Permissions matrix и admin/security companion specs из подпапок `04-*` и `07-*` требуют сразу проектировать роли `client`, `operator`, `supervisor`, `service` и `admin`, а не одну общую админскую роль.[cite:6][cite:7] В Directus нужно закрыть прямое редактирование критичных status-полей и разрешить их изменение только через action-driven backend handlers и контролируемые workflow-кнопки в backoffice.[cite:4][cite:7]

## State management

Order status не должен жить только как одиночное поле в `tb_orders`, потому что companion specs отдельно выделяют order state machine, transaction status machine и frontend state machine.[cite:6][cite:7] Правильная реализация — current snapshot в `tb_orders` плюс полная история переходов в `tb_order_timeline`, включая actor, request id, payload и причину перехода.[cite:4]
