# Интеграции, compliance и observability

## Интеграции

Папка `05-integrations-and-finance` содержит отдельные спецификации по payment provider/payout integration, wallet/exchange provider integration, provider capability matrix, reconciliation и accounting close.[cite:6] Следовательно, provider layer должен проектироваться как набор адаптеров с общими портами: payments in, payouts out, exchange execution, wallet monitoring, reconciliation exports и provider health tracking.[cite:6][cite:7]

## Compliance и governance

Папка `04-compliance-risk-and-governance` охватывает data retention, sensitive-field classification, fraud rules, privacy operations, sanctions/travel rule operations и Directus permissions matrix.[cite:6] Это требует сразу заложить masking, storage segregation, retention jobs, legal disclosure flows, operator review rules и auditability в первую версию data model и backoffice, а не добавлять их после MVP.[cite:6][cite:7]

## Analytics и audit

Папка `06-data-analytics-and-observability` покрывает analytics/reporting, canonical ERD, event taxonomy, data contracts, observability, audit и operational dashboards.[cite:6] Поэтому каждая важная доменная операция должна порождать стандартизованные события, писать trace/audit контекст и кормить dashboard-метрики по order funnel, SLA, provider failures, webhook lag, manual review backlog и data freshness.[cite:6][cite:7]

## Security и delivery

Папка `07-platform-security-and-delivery` добавляет требования к permission hardening, abuse protection, API boundaries, versioning, backup/recovery, business continuity, CI/CD, migration strategy и local development guide.[cite:6] Это означает, что локальный implementation plan должен включать не только код, но и миграции, disaster-recovery drills, backup restore validation, security baselines, CI quality gates и нормализованный dev onboarding.[cite:6][cite:7]
