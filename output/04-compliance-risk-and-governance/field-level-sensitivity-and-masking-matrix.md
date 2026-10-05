## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Security + Compliance + Data Governance
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `field-dictionary-and-sensitive-data-classification-matrix.md`
- Related documents:
  - `admin-permission-hardening-spec.md`
  - `theblack-trade-api-contract-spec.md`
  - `contract-test-matrix.md`

# Field-Level Sensitivity & Masking Matrix — TheBlack.Trade

## 1. Назначение документа

Этот документ определяет field-level sensitivity model для TheBlack.Trade: какие поля считаются public/internal/restricted/highly sensitive, какие роли могут их видеть, где требуется masking или partial exposure, какие поля допустимы в support-safe/admin-safe/export-safe projections и как применять consistent data minimization across operations, support, compliance, finance, analytics and archival contexts.

Документ предназначен для product, backend, frontend, Directus integrators, compliance, finance, operations, support, security и QA.

## 2. Цели документа

Sensitivity/masking matrix должна обеспечивать:

- единые правила доступа к полям на уровне UI/API/export/archive;
- минимизацию ненужного доступа к customer and financial data;
- ясность между operational utility и confidentiality;
- основу для role-based admin projections и search results;
- согласованность между active, archived и exported data views.

## 3. Scope

Документ покрывает:

- sensitivity tiers;
- masking rules;
- role visibility principles;
- field groups by entity;
- UI/API/export/archive exposure expectations;
- implementation and QA guidance.

## 4. Core principles

1. **Not every internal user needs raw access to every field.**
2. **Mask by default when full value is not necessary for the task.**
3. **Search, list and queue views should expose less than detail workspaces.**
4. **Exported data should be more restrictive than interactive admin views by default.**
5. **Archived data does not imply broader access.**
6. **Sensitivity must be attached to fields, not assumed only from entity type.**

## 5. Sensitivity tiers

| Tier | Meaning | Typical handling |
|---|---|---|
| S0 Public/Low | Safe for broad internal visibility | Usually unmasked |
| S1 Internal | Internal-only, low harm if exposed | Show to relevant roles |
| S2 Restricted | Access only for roles with clear business need | Often partially masked |
| S3 Highly Sensitive | High-risk personal, financial or investigation data | Minimized, masked, strongly restricted |
| S4 Critical Secret | Secrets/credentials/private payload internals | Never shown in normal admin UI; service-only or tightly controlled access |

## 6. View-context exposure model

Поля должны оцениваться не только по sensitivity tier, но и по exposure context:

- queue/list view;
- detail workspace;
- global search result;
- support-safe projection;
- export/report;
- archived retrieval view;
- audit/investigation view.

### Principle

Один и тот же field может быть unmasked в compliance investigation view, но masked в queue/list и полностью скрыт в support/export contexts.

## 7. Role families

Для этой матрицы используются следующие role families:

- Support
- Operations
- Compliance
- Finance
- Admin/Supervisor
- Analytics/BI
- System/Service

Точные ACL и permission rules должны быть формализованы отдельно, но matrix задает baseline visibility intent.

## 8. Masking patterns

Рекомендуемые masking patterns:

- full hide;
- prefix/suffix reveal (например, last 4);
- partial email mask;
- partial phone mask;
- shortened wallet/address display;
- aggregated-only exposure;
- role-gated reveal on explicit action with audit.

## 9. Field group categories

Рекомендуется группировать поля минимум так:

- identity/profile fields;
- contact fields;
- KYC/compliance evidence fields;
- payment/payout financial fields;
- wallet/requisite identifiers;
- documents/notifications metadata;
- review and internal notes;
- audit and provider payload references;
- risk and investigation data.

## 10. Customer and profile fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| Customer public reference | `customer.public_ref` | S0 | None | Support, Ops, Compliance, Finance, Admin |
| Legal/full name | `legal_name` | S2 | Partial where possible | Support limited, Ops limited, Compliance yes, Finance limited, Admin yes |
| Display name | `display_name` | S1 | Optional partial | Support, Ops, Compliance, Finance, Admin |
| Email | `email` | S2 | Partial email mask in lists/search | Support masked, Ops masked, Compliance reveal if needed, Admin as policy |
| Phone | `phone` | S2 | Partial phone mask | Support masked, Ops masked, Compliance reveal if needed |
| Country/locale | `country_code`, `locale` | S1 | None | Broad internal visibility |
| Profile preferences | non-sensitive preferences | S1 | None | Role-based operational need |

## 11. Customer account and status fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| Account status | `account_status` | S1 | None | Support, Ops, Compliance, Admin |
| Eligibility flags | high-level restrictions | S2 | Summary only in support | Ops yes, Compliance yes, Support summarized, Finance limited |
| Risk level summary | `risk_level` | S2/S3 | Summary only, no raw rule detail | Compliance yes, Ops partial, Support usually hidden |
| Archive markers | `archived_at`, archive flags | S1 | None | Relevant operational/admin roles |

## 12. KYC fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| KYC status | `kyc.status` | S1 | None | Support summary, Ops yes, Compliance yes |
| Decision reason code | approval/rejection reason | S2 | Abstracted for support | Compliance yes, Ops partial |
| Submitted identity docs | images/files/IDs | S3 | Hidden except authorized views | Compliance primary, limited Ops if policy allows |
| KYC provider refs | provider identifiers | S2 | Usually hidden in support | Compliance/Ops/Admin as needed |
| Remediation notes | KYC investigation notes | S3 | Hidden or tightly limited | Compliance primary |
| Reviewer identity | `reviewed_by` | S1/S2 | None or limited | Internal review roles |

## 13. Order fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| Order public ref | `order.public_ref` | S0 | None | Broad internal visibility |
| Direction/asset/network | `direction`, `asset_code`, `network_code` | S1 | None | Support, Ops, Compliance, Finance |
| Requested/finalized amount | `amount_requested`, `amount_finalized` | S2 | Visible where operationally needed | Ops yes, Finance yes, Compliance as needed, Support often yes for case handling |
| Customer-facing status projection | support-safe status | S1 | None | Broad internal visibility |
| Internal order status | canonical machine state | S1 | None | Ops, Compliance, Finance, Admin |
| Hold/escalation markers | hold present, escalation flags | S2 | Summary in support | Ops yes, Compliance yes, Finance partial |

## 14. Payment fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| Payment status | `payment.status` | S1 | None | Support summary, Ops, Finance, Compliance |
| Expected/received amount | amounts/currency | S2 | None in detail; reduced in list if needed | Ops, Finance, Compliance, support where case-related |
| Provider name | `provider_name` | S1 | None | Ops, Finance, Admin |
| External payment ref | `external_ref` | S2 | Truncated in lists | Ops, Finance, Compliance |
| Payment evidence metadata | artifact refs, timestamps | S2 | Summary only outside detail | Ops, Compliance, Finance |
| Raw payment evidence | screenshots/files | S3 | Hidden except authorized detail | Ops limited, Compliance/Finance as needed |
| Review result codes | approve/reject/request info | S1/S2 | None | Ops, Compliance, Finance |

## 15. Payout fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| Payout status | `payout.status` | S1 | None | Support summary, Ops, Finance, Compliance |
| Payout amount | `amount` | S2 | None in detail | Ops, Finance, Compliance |
| Destination reference | wallet/requisite masked value | S2/S3 | Short masked display | Ops yes masked, Finance yes masked, Compliance reveal if needed |
| External payout ref | provider payout ref | S2 | Truncated by default | Ops, Finance |
| Hold/release reasons | hold codes | S2 | Abstract in support | Ops, Finance, Compliance |
| Execution timestamps | release/completion times | S1 | None | Ops, Finance, Compliance |

## 16. Wallet and requisite fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| Asset/network type | `asset_code`, `network_code` | S1 | None | Broad internal visibility |
| Normalized wallet/address/account value | `normalized_value` | S3 | Masked, show fragment only | Ops masked, Compliance reveal if needed, Support hidden or masked |
| Masked display value | `masked_value` | S1/S2 | Already masked | Support, Ops, Finance |
| Verification status | `wallet.status` | S1 | None | Support summary, Ops, Compliance |
| Verification timestamps/history | `verified_at`, change history | S2 | Summary outside detail | Ops, Compliance |

## 17. Document fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| Document type/status | `document_type`, `status` | S1 | None | Support, Ops, Compliance |
| Storage reference | `storage_ref` | S3/S4 | Hidden in normal UI | System primary, Ops/Admin limited |
| Delivery state | delivery/access summary | S1 | None | Support, Ops |
| Version/reissue lineage | `version_no` etc. | S1 | None | Ops, Compliance, Support as needed |
| Document content | generated formal file | S2/S3 | Role-gated open/download | Support limited, Ops yes, Compliance yes |

## 18. Notification fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| Event/channel/status | `event_type`, `channel`, `status` | S1 | None | Broad internal visibility |
| Template key/version | `template_key` | S1 | None | Ops, Support, Admin |
| Recipient reference | email/phone abstraction | S2 | Masked by default | Support masked, Ops masked, Compliance/Admin as needed |
| Suppression reason | policy/incident suppression | S2 | Summary in support | Ops, Compliance, Admin |
| Raw delivery provider payload | transport diagnostics | S3/S4 | Hidden or service-only | Admin/System/limited Ops |

## 19. Notes and review fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| General handoff notes | operational notes | S2 | None within allowed roles | Ops, Support, Admin |
| Compliance investigation notes | restricted notes | S3 | Hidden outside compliance | Compliance primary |
| Finance investigation notes | reconciliation/payout notes | S3 | Hidden outside finance/compliance | Finance primary |
| Queue assignment info | assignee/SLA/priority | S1 | None | Ops, Admin, Supervisors |
| Escalation tags | compliance/finance/support tags | S2 | Summary only where needed | Ops, Compliance, Finance |

## 20. Audit and provider interaction fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| Audit action type and timestamp | `action_type`, `created_at` | S1 | None | Admin, Ops, Compliance |
| Actor identifiers | `actor_id`, reviewer ids | S2 | Sometimes abstracted in broad views | Admin, Compliance, Supervisors |
| Context payload summary | non-secret audit context | S2 | Summary only | Admin, Compliance |
| Raw request/response payload refs | payload pointers | S4 | Hidden from standard admin views | System/service; exceptional admin access |
| Provider correlation IDs | `external_ref`, `trace_id` | S2 | Truncated if broadly shown | Ops, Finance, Compliance |

## 21. Risk and compliance investigation fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| High-level hold present | boolean/summary | S2 | Summary only | Support partial, Ops yes, Compliance yes |
| Detailed risk rule hits | internal fraud logic | S3 | Hidden outside compliance/risk | Compliance primary |
| Suspicion rationale detail | case reasoning | S3 | Hidden or abstracted | Compliance primary |
| Temporary restriction actions | hold/release limits | S2 | Abstract summary in support | Ops, Compliance, Finance as relevant |
| Investigation evidence links | linked artifacts | S3 | Hidden except authorized detail | Compliance, Finance where needed |

## 22. Financial integrity and reconciliation fields

| Field group | Examples | Tier | Default masking | Typical visibility |
|---|---|---|---|---|
| Reconciliation case status | `reconciliation.status` | S1 | None | Finance, Ops, Admin |
| Case severity and age | severity, opened_at | S1 | None | Finance, Ops, Admin |
| Resolution codes/findings | finance findings | S2/S3 | Summary in non-finance views | Finance primary, Compliance as needed |
| Linked financial refs | payment/payout/provider refs | S2 | Truncated in broad views | Finance, Ops |
| Settlement artifacts | reports/attachments | S3 | Restricted open/download | Finance primary |

## 23. Export rules

### Default export principles

- exports should be more restrictive than detail UI;
- S3/S4 fields should be excluded by default;
- masked values should be preferred over raw values;
- exports containing S2+ data should be role-gated and auditable;
- ad hoc exports for support should use support-safe projections only.

### Typical export posture by role

- Support: summary-level only;
- Operations: operationally necessary fields, usually masked where raw value not needed;
- Compliance/Finance: deeper export scope with explicit reason and logging;
- Analytics/BI: aggregated or pseudonymized where possible.

## 24. Search and queue exposure rules

### Search results should prefer

- public refs;
- masked customer identifiers;
- summarized statuses;
- abbreviated wallet/contact fragments;
- no raw S3/S4 content.

### Queue/list views should avoid

- raw document links;
- full email/phone/address/account numbers;
- full investigation notes;
- raw payload references.

## 25. Archived data exposure

Archived retrieval must follow the same or stricter rules than active data.

### Principles

- archival is not a justification for broader field visibility;
- support-safe archived views should remain masked;
- compliance/finance may require deeper historical access;
- archive export and restore actions should be logged.

## 26. Implementation guidance

### Recommended implementation controls

- field-level serializers / transformers for each projection type;
- role-aware API response shaping;
- explicit admin collection/view configuration for masked fields;
- reveal-on-demand flows for select fields with audit logging;
- separate export schemas instead of raw table dumps.

## 27. QA checklist

Need to validate:

- list/search views never expose raw S3/S4 fields accidentally;
- support-safe projections remain support-safe after schema changes;
- reveal actions are correctly permission-gated and logged;
- exports exclude restricted fields by default;
- archive retrieval follows the same masking policy;
- Directus/admin config changes do not bypass masking rules.

## 28. Recommended follow-up artifacts

На базе этой матрицы рекомендуется создать:

- role-to-projection mapping sheet;
- API response masking policy;
- export schema catalog;
- reveal-action audit policy;
- field sensitivity tags in schema registry.

## 29. Related documents

Использовать вместе с:

- `canonical-erd-and-field-dictionary-spec.md`
- `data-model-canonical-entities-spec.md`
- `theblack-trade-directus-permissions-matrix.md`
- `admin-console-ia-and-workspace-spec.md`
- `data-retention-and-archival-spec.md`
- `fraud-signals-and-risk-rules-spec.md`
- `observability-and-audit-spec.md`