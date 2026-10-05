# Screen and Route Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Product + Design
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `design-system-ui-kit-spec.md`
  - `frontend-integration-spec.md`
- Related documents:
  - `annotated-wireframe-spec.md`
  - `screen-by-screen-ux-copy-spec.md`
  - `acceptance-test-catalog.md`

## 1. Purpose

This document defines the screen map, route structure, navigation rules, and route-level state logic for TheBlack.Trade. It is intended to align product, frontend, design, QA, and backend teams around the exact pages and flows required for MVP and near-MVP implementation.

The scope covers the customer-facing application and a lightweight operator/admin route layer needed for manual verification and settlement workflows.

## 2. Routing principles

### 2.1 General routing model

The application should use a nested route structure with clear separation between:

- public routes;
- authenticated customer routes;
- transaction flow routes;
- support routes;
- operator/admin routes.

Recommended routing architecture:

- shell layout for public pages;
- authenticated app shell for account and transaction routes;
- guarded admin shell for operator workflows;
- route-level loaders for essential bootstrap data;
- route-level permission checks;
- dedicated error boundaries for main route groups.

### 2.2 Route naming principles

Routes must be:

- human-readable;
- stable for support and QA references;
- semantically aligned with actual user jobs;
- decoupled from internal backend resource names where possible.

Preferred route style:

- lowercase;
- hyphen-separated;
- REST-like for entities;
- explicit IDs for detail pages.

## 3. Top-level route map

| Route group | Purpose |
|---|---|
| `/` | Landing and product entry |
| `/auth/*` | Registration, login, session recovery surfaces |
| `/kyc/*` | Identity verification flow |
| `/trade/*` | Buy and sell transaction flows |
| `/wallets/*` | Wallet and exchange connection management |
| `/account/*` | Personal account and history |
| `/orders/*` | Transaction detail and tracking |
| `/support/*` | Support and help entry points |
| `/admin/*` | Operator and admin operational flows |

## 4. Public routes

### 4.1 Landing

| Route | Screen name | Access | Purpose |
|---|---|---|---|
| `/` | Landing page | Public | Main product presentation, CTA entry to buy/sell |

#### Landing page content blocks

Landing page should include:

- product proposition;
- trust and process explanation;
- supported buy/sell directions;
- short KYC explanation;
- CTA to create account or start exchange;
- FAQ teaser;
- legal / compliance footer links.

#### Primary CTAs

- “Купить криптовалюту” → `/trade/buy`
- “Продать криптовалюту” → `/trade/sell`
- “Войти” → `/auth/login`
- “Создать аккаунт” → `/auth/register`

### 4.2 Auth routes

| Route | Screen name | Access | Purpose |
|---|---|---|---|
| `/auth/login` | Login | Public | User login |
| `/auth/register` | Register | Public | New account creation |
| `/auth/session-expired` | Session expired | Public | Re-auth entry after token expiration |
|

#### Route notes

- Authenticated users should be redirected away from `/auth/login` and `/auth/register` to `/account` or their last intended route.
- `/auth/session-expired` should preserve enough context to return user to intended route after successful login.

## 5. KYC routes

| Route | Screen name | Access | Purpose |
|---|---|---|---|
| `/kyc/start` | KYC intro | Authenticated | Explain why KYC is required |
| `/kyc/verify` | KYC submission | Authenticated | Identity form and document upload |
| `/kyc/status` | KYC status | Authenticated | Review status, rejection reason, resubmission path |
| `/kyc/success` | KYC submitted | Authenticated | Confirmation after submission |

### 5.1 KYC routing rules

- If user is not authenticated, redirect to `/auth/login`.
- If `kycStatus = APPROVED`, route `/kyc/start` and `/kyc/verify` may redirect to `/account` or the originally intended trade route.
- If `kycStatus = IN_REVIEW` or `PENDING`, `/kyc/status` becomes the primary route.
- If `kycStatus = REJECTED` or `RESUBMISSION_REQUIRED`, `/kyc/status` must show resubmission CTA leading to `/kyc/verify`.

### 5.2 Screen breakdown

#### `/kyc/start`

Purpose:

- explain legal/compliance need;
- explain approximate review time;
- define required document list;
- start KYC action.

Primary CTA:

- “Пройти верификацию” → `/kyc/verify`

#### `/kyc/verify`

Purpose:

- capture identity data;
- upload files;
- validate fields;
- submit application.

Possible exits:

- success → `/kyc/success`
- backend validation errors → remain on page
- unauthorized → `/auth/session-expired`

#### `/kyc/status`

Purpose:

- show current KYC state;
- display rejection reasons if present;
- provide next available action.

Possible CTAs:

- “Повторно отправить данные” → `/kyc/verify`
- “Перейти в кабинет” → `/account`
- “Связаться с поддержкой” → `/support`

## 6. Trade routes

Trade routes are split by side: buy and sell.

### 6.1 Shared route structure

| Route | Screen name | Access | Purpose |
|---|---|---|---|
| `/trade/buy` | Buy entry | Public/Auth | Buy form and initial quote flow |
| `/trade/buy/quote` | Buy quote | Public/Auth | Quote review and next step |
| `/trade/buy/wallet` | Buy destination setup | Authenticated | Select or create destination wallet |
| `/trade/buy/confirm` | Buy order confirmation | Authenticated | Confirm order creation |
| `/trade/buy/payment` | Buy payment instructions | Authenticated | Show fiat payment data |
| `/trade/buy/payment-proof` | Buy payment proof | Authenticated | Submit evidence for review |
| `/trade/buy/success` | Buy flow transition | Authenticated | Entry point to tracking screen |
| `/trade/sell` | Sell entry | Public/Auth | Sell form and initial quote flow |
| `/trade/sell/quote` | Sell quote | Public/Auth | Quote review and next step |
| `/trade/sell/payout` | Sell payout setup | Authenticated | Enter fiat payout details |
| `/trade/sell/source` | Sell source setup | Authenticated | Select source wallet/exchange connection |
| `/trade/sell/confirm` | Sell order confirmation | Authenticated | Confirm order creation |
| `/trade/sell/transfer` | Sell transfer instructions | Authenticated | Show crypto transfer details |
| `/trade/sell/transfer-proof` | Sell transfer proof | Authenticated | Submit tx hash/evidence |
| `/trade/sell/success` | Sell flow transition | Authenticated | Entry point to tracking screen |

### 6.2 Trade route rules

- Public user may access `/trade/buy` and `/trade/sell` for form exploration.
- If quote or order creation requires authentication, user must be redirected to login and then back to the intended trade step.
- If KYC is required for progression, user must be redirected to `/kyc/start` or `/kyc/status` with a return intent.
- Quote pages must not be directly usable without the required quote state in memory or route loader fallback.

### 6.3 Buy screens

#### `/trade/buy`

Purpose:

- collect amount, asset, network, payment method;
- provide initial trade estimate;
- drive quote request.

Primary CTA:

- “Получить курс” → `/trade/buy/quote`

Alternate outcomes:

- insufficient form data → CTA disabled;
- KYC gating after auth if product policy demands it.

#### `/trade/buy/quote`

Purpose:

- present quote details;
- show fee and expiration;
- allow user to proceed or go back.

Primary CTAs:

- “Продолжить” → `/trade/buy/wallet`
- “Обновить курс” → refresh quote

#### `/trade/buy/wallet`

Purpose:

- choose destination wallet connection;
- create new wallet if needed.

Primary CTA:

- “Продолжить” → `/trade/buy/confirm`

#### `/trade/buy/confirm`

Purpose:

- final user confirmation before creating order;
- summary of quote + wallet destination.

Primary CTA:

- “Создать заявку” → `/trade/buy/payment`

#### `/trade/buy/payment`

Purpose:

- display payment instructions;
- display amount and reference;
- explain manual confirmation policy.

Primary CTA:

- “Я оплатил” → `/trade/buy/payment-proof`

Secondary CTA:

- “Открыть заявку” → `/orders/{orderId}`

#### `/trade/buy/payment-proof`

Purpose:

- submit transaction ID and optional files;
- finalize user-side payment action.

Primary CTA:

- “Отправить на проверку” → `/trade/buy/success`

#### `/trade/buy/success`

Purpose:

- confirm evidence submission;
- guide user into persistent tracking.

Primary CTA:

- “Отслеживать заявку” → `/orders/{orderId}`

### 6.4 Sell screens

#### `/trade/sell`

Purpose:

- collect sell-side parameters;
- request quote.

Primary CTA:

- “Получить курс” → `/trade/sell/quote`

#### `/trade/sell/quote`

Purpose:

- show expected RUB payout and fees;
- allow continuation.

Primary CTA:

- “Продолжить” → `/trade/sell/payout`

#### `/trade/sell/payout`

Purpose:

- collect payout destination details for fiat settlement.

Primary CTA:

- “Продолжить” → `/trade/sell/source`

#### `/trade/sell/source`

Purpose:

- select or create source wallet / exchange connection.

Primary CTA:

- “Продолжить” → `/trade/sell/confirm`

#### `/trade/sell/confirm`

Purpose:

- show full sell order summary before create.

Primary CTA:

- “Создать заявку” → `/trade/sell/transfer`

#### `/trade/sell/transfer`

Purpose:

- present platform receiving wallet details and amount;
- emphasize network correctness warnings.

Primary CTA:

- “Я отправил криптовалюту” → `/trade/sell/transfer-proof`

#### `/trade/sell/transfer-proof`

Purpose:

- submit tx hash or proof.

Primary CTA:

- “Отправить на проверку” → `/trade/sell/success`

#### `/trade/sell/success`

Purpose:

- confirm submission and route user to tracking.

Primary CTA:

- “Отслеживать заявку” → `/orders/{orderId}`

## 7. Wallet management routes

| Route | Screen name | Access | Purpose |
|---|---|---|---|
| `/wallets` | Wallet connections list | Authenticated | Manage saved wallets and exchange links |
| `/wallets/new` | New wallet connection | Authenticated | Create wallet or exchange connection |
| `/wallets/:connectionId` | Wallet connection details | Authenticated | View connection details |
| `/wallets/:connectionId/edit` | Edit wallet connection | Authenticated | Update label/default status |

### 7.1 Wallet route rules

- `/wallets/new` may be used standalone from account navigation or in-flow from trade routes.
- After successful creation from a trade flow, user should return to the originating trade step with the created connection preselected.
- Delete action should never be a dedicated route; it should be handled by action dialog from list/detail screen.

## 8. Account routes

| Route | Screen name | Access | Purpose |
|---|---|---|---|
| `/account` | Dashboard | Authenticated | Main personal cabinet landing |
| `/account/profile` | Profile settings | Authenticated | Personal info management |
| `/account/security` | Security settings | Authenticated | Password/session/security placeholders for future scope |
| `/account/orders` | Orders history | Authenticated | User order list with filters |
| `/account/notifications` | Notification center | Authenticated | Communication preferences or future inbox |

### 8.1 Dashboard purpose

`/account` should summarize:

- KYC state;
- active orders;
- latest completed orders;
- wallet connection shortcuts;
- CTA to buy and sell;
- support access.

### 8.2 Orders history route

`/account/orders` should support:

- filters by side and status;
- pagination;
- linking to `/orders/{orderId}`;
- empty state for first transaction.

## 9. Order detail routes

| Route | Screen name | Access | Purpose |
|---|---|---|---|
| `/orders/:orderId` | Order detail / tracker | Authenticated | Full timeline and next action |
| `/orders/:orderId/receipt` | Order receipt view | Authenticated | Receipt-focused surface if separate |

### 9.1 `/orders/:orderId`

This is the most important persistent transactional route.

It should contain:

- top summary card;
- status badge;
- visual timeline;
- amount breakdown;
- instruction / review / completion widget depending on state;
- payment or transfer evidence status;
- payout details or destination wallet block;
- support/help widget;
- receipt preview or pending state.

### 9.2 Order route rules

- User must only access orders belonging to their account.
- `404` state must be shown for unknown or inaccessible order IDs.
- Terminal states must remain fully readable.
- Polling is active here for non-terminal states.

## 10. Support routes

| Route | Screen name | Access | Purpose |
|---|---|---|---|
| `/support` | Support center | Public/Auth | Entry page for support options |
| `/support/faq` | FAQ | Public/Auth | Common questions and answers |
| `/support/order-help` | Order help | Authenticated | Guided help linked to active orders |

### 10.1 Support route role

Support routes should be available from:

- header/footer;
- KYC status page;
- payment / transfer steps;
- order detail page;
- rejected / failed states.

## 11. Admin and operator routes

These routes may live inside the same app behind role guards or in a separate admin frontend. This spec describes their logical structure.

| Route | Screen name | Access | Purpose |
|---|---|---|---|
| `/admin` | Admin dashboard | Operator/Admin | Operational summary |
| `/admin/orders` | Orders queue | Operator/Admin | Filterable order work queue |
| `/admin/orders/:orderId` | Admin order detail | Operator/Admin | Deep review and actions |
| `/admin/payments/:paymentId` | Admin payment review | Operator/Admin | Manual payment confirmation/rejection |
| `/admin/kyc` | KYC queue | Operator/Admin | KYC review list |
| `/admin/kyc/:applicationId` | KYC application review | Operator/Admin | Review and decision |

### 11.1 Admin route purpose

#### `/admin`

Purpose:

- show volumes and backlog;
- show pending manual reviews;
- shortcut into queues.

#### `/admin/orders`

Purpose:

- operational list of orders;
- filter by status, risk, search query;
- sort by urgency.

#### `/admin/orders/:orderId`

Purpose:

- inspect order;
- see customer profile summary;
- view timeline;
- trigger review, settlement, or escalation actions.

#### `/admin/payments/:paymentId`

Purpose:

- review submitted payment or transfer evidence;
- approve or reject;
- write comment.

### 11.2 Admin route rules

- All admin routes require role-aware guards.
- Customer role must never access `/admin/*`.
- Direct linking from notification systems into admin detail routes should be supported.

## 12. Layout map by route group

| Route group | Layout |
|---|---|
| `/` and `/support/faq` | Public marketing layout |
| `/auth/*` | Minimal auth layout |
| `/kyc/*` | Authenticated step layout |
| `/trade/*` | Transaction step layout |
| `/wallets/*` | Account app shell |
| `/account/*` | Account app shell |
| `/orders/*` | Account app shell with tracking emphasis |
| `/support/*` | Shared support layout |
| `/admin/*` | Admin shell |

## 13. Navigation model

### 13.1 Primary navigation for public users

Suggested items:

- Купить
- Продать
- FAQ
- Войти
- Регистрация

### 13.2 Primary navigation for authenticated users

Suggested items:

- Кабинет
- Заявки
- Кошельки
- Купить
- Продать
- Поддержка
- Профиль

### 13.3 Primary navigation for operator/admin

Suggested items:

- Dashboard
- Orders
- Payments
- KYC
- Support cases (future)
- Settings (future)

## 14. Route guards

### 14.1 Guard types

Frontend should implement at least these guard layers:

- `GuestOnlyGuard`
- `AuthGuard`
- `KycGateGuard`
- `RoleGuard`
- `TradeFlowStateGuard`

### 14.2 Guard behavior

| Guard | Protects | Redirect behavior |
|---|---|---|
| `GuestOnlyGuard` | Login/Register | Redirect auth users to `/account` |
| `AuthGuard` | Account, order, wallet routes | Redirect to login with return intent |
| `KycGateGuard` | Quote/order progression routes | Redirect to `/kyc/start` or `/kyc/status` |
| `RoleGuard` | Admin routes | Redirect unauthorized users to `/account` or 403 page |
| `TradeFlowStateGuard` | Mid-flow routes | Redirect to first valid flow step |

## 15. Route state and deep-link rules

### 15.1 Stateful flow pages

The following routes depend on previous step state and should not assume valid direct access without fallback or recovery logic:

- `/trade/buy/quote`
- `/trade/buy/wallet`
- `/trade/buy/confirm`
- `/trade/buy/payment`
- `/trade/buy/payment-proof`
- `/trade/sell/quote`
- `/trade/sell/payout`
- `/trade/sell/source`
- `/trade/sell/confirm`
- `/trade/sell/transfer`
- `/trade/sell/transfer-proof`

### 15.2 Recovery rules

If a user opens a deep link without required state:

- recover from persisted safe route params if available;
- recover from server-side order resource when order already exists;
- otherwise redirect to the first valid flow step.

### 15.3 Stable deep-link targets

The following routes are safe to use in email links, support references, and saved bookmarks:

- `/account`
- `/account/orders`
- `/wallets`
- `/orders/:orderId`
- `/kyc/status`
- `/support`
- `/support/faq`
- `/admin/orders/:orderId` for internal operator use

## 16. Error and fallback screens

Recommended dedicated screens or route-level fallbacks:

| Route / pattern | Screen |
|---|---|
| `*` | Global 404 |
| protected routes with expired session | Session expired screen |
| `/orders/:orderId` not found | Order not found state |
| `/admin/*` forbidden | Admin access denied |
| route loader failure | Route-level error boundary |

### 16.1 Required error experiences

- graceful 404 page;
- expired quote fallback inside trade routes;
- broken order reference support handoff;
- retry patterns for transient API failures;
- “start again” path for corrupted in-memory transaction flows.

## 17. Mobile route considerations

On mobile:

- account shell navigation may collapse into bottom nav or drawer;
- trade routes should preserve step context with visible progress indicator;
- order detail should prioritize current status and next action above long timeline;
- admin routes may be desktop-first unless mobile operator support is explicitly required.

## 18. Recommended route implementation tree

```text
/
├─ /
├─ /auth
│  ├─ /login
│  ├─ /register
│  └─ /session-expired
├─ /kyc
│  ├─ /start
│  ├─ /verify
│  ├─ /status
│  └─ /success
├─ /trade
│  ├─ /buy
│  │  ├─ /quote
│  │  ├─ /wallet
│  │  ├─ /confirm
│  │  ├─ /payment
│  │  ├─ /payment-proof
│  │  └─ /success
│  └─ /sell
│     ├─ /quote
│     ├─ /payout
│     ├─ /source
│     ├─ /confirm
│     ├─ /transfer
│     ├─ /transfer-proof
│     └─ /success
├─ /wallets
│  ├─ /
│  ├─ /new
│  ├─ /:connectionId
│  └─ /:connectionId/edit
├─ /account
│  ├─ /
│  ├─ /profile
│  ├─ /security
│  ├─ /orders
│  └─ /notifications
├─ /orders
│  ├─ /:orderId
│  └─ /:orderId/receipt
├─ /support
│  ├─ /
│  ├─ /faq
│  └─ /order-help
└─ /admin
   ├─ /
   ├─ /orders
   ├─ /orders/:orderId
   ├─ /payments/:paymentId
   ├─ /kyc
   └─ /kyc/:applicationId
```

## 19. Recommended implementation order

1. Public and auth routes.
2. Account shell and dashboard.
3. KYC route group.
4. Wallet route group.
5. Buy trade flow routes.
6. Sell trade flow routes.
7. Order detail and order history routes.
8. Support routes.
9. Admin route group.
10. Error boundaries and deep-link recovery hardening.

## 20. Deliverables expected from frontend team

Based on this route spec, frontend team should produce:

- route configuration file(s);
- route guards;
- route layouts;
- screen-level containers;
- step-state persistence strategy;
- navigation config;
- breadcrumb and page title mapping;
- analytics event map by route;
- QA matrix for route access and redirects.