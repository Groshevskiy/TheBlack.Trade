## Document metadata

- Status: active
- Role: Companion spec
- Owner: Engineering + QA + Operations
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `release-readiness-and-rollout-plan.md`
  - `test-strategy-and-qa-plan.md`
- Related documents:
  - `acceptance-test-catalog.md`
  - `operations-runbook-and-sla-spec.md`

# Production Readiness Checklist — TheBlack.Trade

## 1. Назначение документа

Этот документ представляет собой операционный checklist готовности TheBlack.Trade к production launch или к значимому production expansion. Он используется как финальный контрольный лист перед go-live, soft launch, rollout expansion или включением новой automation capability.

Документ предназначен для release owner, product, engineering, QA, operations, compliance, finance, support и management.

## 2. Как использовать checklist

- каждый пункт должен иметь owner и статус;
- пункты без подтверждения должны быть явно вынесены в risk register или blocked list;
- checklist применяется перед Phase 1 launch, перед каждым major rollout expansion и перед включением high-impact automation;
- прохождение checklist не отменяет go/no-go review, а служит его основанием.

## 3. Статусы checklist

Рекомендуемые статусы:

- Ready
- Ready with accepted risk
- Not ready
- Not applicable

## 4. Release metadata block

Перед review рекомендуется зафиксировать:

- release / rollout identifier;
- target date/time;
- target environment;
- release owner;
- rollout phase;
- scope summary;
- related incidents / known issues / exceptions.

## 5. Product readiness

| Check | Status | Notes |
|---|---|---|
| MVP / release scope frozen |  |  |
| Critical user journeys approved by product |  |  |
| Buy flow UX accepted |  |  |
| Sell flow UX accepted |  |  |
| KYC-related customer decisions and screens approved |  |  |
| Customer-visible statuses aligned with business lifecycle |  |  |
| Copy for major actions/errors/review states approved |  |  |
| Unsupported edge cases explicitly documented |  |  |

## 6. Engineering readiness

| Check | Status | Notes |
|---|---|---|
| Release artifact/version identified |  |  |
| Environment-specific config prepared |  |  |
| Production deployment path validated |  |  |
| Migrations reviewed and approved |  |  |
| No critical unresolved engineering defects |  |  |
| Rollback/containment path prepared |  |  |
| Dangerous runtime flags documented |  |  |
| Background jobs expected for release identified |  |  |

## 7. Environment and deployment readiness

| Check | Status | Notes |
|---|---|---|
| Production environment accessible to authorized roles only |  |  |
| Secrets configured through approved mechanism |  |  |
| Production and non-production environments isolated |  |  |
| Storage buckets/containers mapped correctly |  |  |
| Build/deploy traceability available |  |  |
| Monitoring for deployment success/failure in place |  |  |
| Feature flag defaults verified |  |  |
| Emergency disable switches verified |  |  |

## 8. QA readiness

| Check | Status | Notes |
|---|---|---|
| Critical smoke suite passed |  |  |
| Release regression passed |  |  |
| Core E2E journeys validated |  |  |
| State machine regression validated |  |  |
| Permissions regression validated |  |  |
| Notification/document validation passed |  |  |
| Known issues reviewed and accepted |  |  |
| No release-blocking defect remains open |  |  |

## 9. Operations readiness

| Check | Status | Notes |
|---|---|---|
| Review queues validated |  |  |
| Operator roles and access confirmed |  |  |
| Manual-review-first process ready |  |  |
| Escalation and handoff rules documented |  |  |
| SLA expectations defined |  |  |
| Queue pause / degraded mode process known |  |  |
| Staffing coverage for launch window confirmed |  |  |
| Operational backlog acceptable before launch |  |  |

## 10. Compliance and legal readiness

| Check | Status | Notes |
|---|---|---|
| Required disclosures available in customer journey |  |  |
| KYC / restriction logic validated |  |  |
| Manual hold / compliance review paths ready |  |  |
| Evidence handling process confirmed |  |  |
| Legal wording approved |  |  |
| Auditability for sensitive actions confirmed |  |  |
| Escalation path for suspicious / restricted cases defined |  |  |
| Data handling constraints understood by ops/support |  |  |

## 11. Finance / payment readiness

| Check | Status | Notes |
|---|---|---|
| Payment intake path validated |  |  |
| Payout path validated |  |  |
| Manual approval/release controls active |  |  |
| Reconciliation path validated |  |  |
| Discrepancy handling process ready |  |  |
| Duplicate payout safeguards confirmed |  |  |
| Amount/limit controls configured |  |  |
| Finance escalation route confirmed |  |  |

## 12. Provider readiness

| Check | Status | Notes |
|---|---|---|
| Payment provider credentials configured correctly |  |  |
| Wallet/exchange provider integrations scoped for rollout |  |  |
| Provider webhooks/callbacks validated |  |  |
| Provider outage fallback path defined |  |  |
| Provider-specific disable switch available |  |  |
| Sandbox/test vs production mode separation confirmed |  |  |

## 13. Notification and document readiness

| Check | Status | Notes |
|---|---|---|
| Core event notifications tested |  |  |
| Customer-facing wording verified |  |  |
| Document/receipt generation tested |  |  |
| Resend / re-issue behavior validated |  |  |
| Delivery failure handling route defined |  |  |
| Notification suppression/emergency mode available |  |  |

## 14. Support readiness

| Check | Status | Notes |
|---|---|---|
| Support scripts approved |  |  |
| Status explanation guide available |  |  |
| Escalation paths for payment/payout/KYC issues defined |  |  |
| Known launch limitations documented for support |  |  |
| Customer complaint path aligned with ops/compliance |  |  |
| Launch monitoring contact from support assigned |  |  |

## 15. Observability readiness

| Check | Status | Notes |
|---|---|---|
| Core dashboards available |  |  |
| Alerts for critical failures configured |  |  |
| Queue lag / backlog monitoring visible |  |  |
| Provider callback health observable |  |  |
| Audit logs for sensitive actions accessible to authorized roles |  |  |
| Deployment identifiers visible in logs/telemetry |  |  |
| Incident triage signals understood by team |  |  |

## 16. Security and access readiness

| Check | Status | Notes |
|---|---|---|
| Production access follows least privilege |  |  |
| Named accounts only |  |  |
| Shared admin credentials prohibited |  |  |
| Sensitive secrets access restricted |  |  |
| Break-glass access procedure defined |  |  |
| Permission model verified after final deploy candidate |  |  |

## 17. Backup and recovery readiness

| Check | Status | Notes |
|---|---|---|
| Backup policy active |  |  |
| Restore procedure documented |  |  |
| Restore path tested recently |  |  |
| Critical file/document recovery expectations known |  |  |
| Recovery ownership assigned |  |  |

## 18. Incident readiness

| Check | Status | Notes |
|---|---|---|
| Incident response contacts confirmed |  |  |
| On-call / launch-watch coverage confirmed |  |  |
| Incident severity model understood |  |  |
| Production freeze policy known |  |  |
| Degraded mode / manual-only fallback ready |  |  |
| Incident communication path defined |  |  |

## 19. Rollout control readiness

| Check | Status | Notes |
|---|---|---|
| Launch cohort definition approved |  |  |
| Transaction caps by phase configured |  |  |
| Feature flags for rollout prepared |  |  |
| Public intake can be throttled/disabled |  |  |
| Automation remains disabled unless explicitly approved |  |  |
| Next-phase expansion criteria documented |  |  |

## 20. Known issues and risk acceptance

| Check | Status | Notes |
|---|---|---|
| Known issues register attached |  |  |
| Each known issue has owner |  |  |
| Each accepted risk has approver |  |  |
| Non-blocking defects reviewed for launch impact |  |  |
| Risk acceptance documented in go/no-go materials |  |  |

## 21. Final go / no-go confirmation

| Check | Status | Notes |
|---|---|---|
| Product sign-off obtained |  |  |
| Engineering sign-off obtained |  |  |
| QA sign-off obtained |  |  |
| Operations sign-off obtained |  |  |
| Compliance/legal sign-off obtained |  |  |
| Finance/payment sign-off obtained |  |  |
| Support sign-off obtained |  |  |
| Release owner final decision recorded |  |  |

## 22. Immediate post-release validation checklist

После production launch или expansion нужно проверить минимум:

- auth health;
- quote/order path availability;
- payment review queue behavior;
- payout hold/release behavior;
- provider callback activity;
- document and notification generation;
- alert noise and incident indicators;
- abnormal queue growth;
- customer confusion / support spike.

## 23. Launch watch window notes

Рекомендуется зафиксировать:

- start/end of watch window;
- people on active monitoring duty;
- dashboards to watch;
- escalation room/channel;
- criteria for extending watch window;
- criteria for rollback or narrowing cohort.

## 24. Completion rule

Checklist считается пройденным только если:

- все critical sections marked Ready;
- accepted risks explicitly approved;
- no unresolved launch-blocking issue remains;
- rollback and degraded-mode path confirmed;
- final go/no-go decision documented.

## 25. Related documents

Использовать вместе с:

- `environment-and-deployment-spec.md`
- `test-strategy-and-qa-plan.md`
- `release-readiness-and-rollout-plan.md`
- `operations-runbook-and-sla-spec.md`
- `incident-response-playbook.md`