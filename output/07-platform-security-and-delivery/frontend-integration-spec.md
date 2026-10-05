## Document metadata

- Status: active
- Role: Companion spec
- Owner: Frontend + Backend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `theblack-trade-api-contract-spec.md`
  - `component-architecture-spec.md`
  - `screen-and-route-spec.md`
- Related documents:
  - `frontend-state-machine-spec.md`
  - `design-system-ui-kit-spec.md`

# Frontend Integration Spec — TheBlack.Trade

## 1. Document purpose

This document defines the frontend integration contract for TheBlack.Trade web application. It describes how the client application should interact with backend APIs, how user flows map to API calls, which UI states must be implemented, and how operational constraints such as manual confirmation, KYC checks, payment review, receipts, and notifications must be represented in the interface.

The specification is intended for frontend developers, frontend architects, QA engineers, product managers, and designers working on the customer-facing application and admin-adjacent operational screens.

## 2. Target frontend scope

Frontend scope includes:

- public authentication and onboarding screens;
- KYC submission flow;
- buy crypto flow;
- sell crypto flow;
- wallet / exchange connection flow;
- personal account area;
- order details and timeline;
- payment instruction and payment evidence submission screens;
- receipt and notification surfaces;
- error handling, loading states, and edge-case UX.

Recommended stack assumptions:

- Astra frontend as base frontend architecture;
- headless backend integration with Directus-backed services and custom API layer;
- token-based auth via JWT access token + refresh token;
- modular SPA or hybrid SSR/CSR architecture;
- responsive web interface optimized for desktop and mobile.

## 3. Integration principles

### 3.1 Core integration rules

Frontend must treat backend as the source of truth for:

- user status;
- KYC state;
- quote validity;
- order state;
- payment review status;
- receipt issuance state;
- wallet connection verification state.

Frontend must never infer terminal states locally if backend has not confirmed them.

All monetary values must be rendered exactly as returned by API, with frontend formatting only for presentation. Frontend must not recalculate quote totals, fees, or settlement values independently, except for purely visual previews before API response.

### 3.2 UX policy for MVP

Because the platform starts with manual confirmation in critical flows, the interface must explicitly communicate review stages. Users should always understand when the platform is waiting for operator action versus waiting for user action.

The frontend must emphasize process transparency over instant automation. “Submitted”, “Under review”, “Confirmed”, “Settling”, and “Completed” states are first-class UI states and must be visually distinct.

## 4. Environment configuration

Frontend must support at least the following environment variables:

| Variable | Description |
|---|---|
| `API_BASE_URL` | Base URL for REST API, e.g. `https://api.theblack.trade/v1` |
| `APP_ENV` | Runtime environment: `local`, `staging`, `production` |
| `APP_NAME` | Brand name for display and document title |
| `SUPPORT_EMAIL` | Support contact email |
| `SUPPORT_TELEGRAM_URL` | Optional support channel link |
| `DEFAULT_FIAT_CURRENCY` | Default fiat currency, initially `RUB` |
| `FEATURE_AUTO_CONFIRM` | Enables UI hints for auto-confirm-enabled environments |
| `FEATURE_EXCHANGE_CONNECTIONS` | Enables exchange account connection UI |
| `FEATURE_RECEIPTS` | Enables receipt-related widgets |
| `FEATURE_KYC_REQUIRED` | Forces KYC gate before quote/order |

Frontend must centralize runtime config access in a single config module.

## 5. Authentication integration

### 5.1 Endpoints

Frontend auth module integrates with:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /users/me`
- `PATCH /users/me`

### 5.2 Token handling

Frontend must:

- store access token only in secure in-memory store or secure cookie strategy defined by app architecture;
- handle refresh token according to security policy selected by implementation team;
- automatically refresh expired access tokens before retrying protected requests;
- force logout when refresh fails or returns unauthorized.

### 5.3 Required auth states

Frontend must support these auth states:

- anonymous;
- authenticating;
- authenticated;
- refreshing session;
- session expired;
- account partially onboarded.

### 5.4 Profile bootstrap

After successful login or refresh, frontend must fetch `GET /users/me` and populate:

- full name;
- email;
- phone;
- role;
- KYC status;
- email verification state if exposed.

Application routing must depend on `kycStatus` and account readiness.

## 6. KYC integration

### 6.1 Endpoints

Frontend KYC flow integrates with:

- `POST /kyc/applications`
- `GET /kyc/applications`
- `GET /kyc/applications/{applicationId}`

### 6.2 Frontend requirements

KYC flow must support:

- first-time submission;
- resubmission after rejection;
- read-only view of submitted application status;
- rejection reason rendering;
- informative waiting state for manual review.

### 6.3 KYC gate rules

If backend returns one of the restricted KYC states, frontend must gate trading actions as follows:

| KYC status | Quote allowed | Order creation allowed | UI behavior |
|---|---:|---:|---|
| `NOT_STARTED` | Optional by product policy | No | Prompt KYC start |
| `PENDING` | Optional by product policy | No | Show pending status |
| `IN_REVIEW` | Optional by product policy | No | Show review state |
| `APPROVED` | Yes | Yes | Unlock flows |
| `REJECTED` | No | No | Show rejection and resubmit CTA |
| `RESUBMISSION_REQUIRED` | No | No | Force resubmission |

### 6.4 KYC form UX

KYC form must include:

- draft-friendly stepper UX;
- client validation before submit;
- server validation rendering per field;
- upload progress if file upload module is separate;
- final confirmation screen.

## 7. Asset and wallet connection integration

### 7.1 Endpoints

Frontend integrates with:

- `GET /assets`
- `GET /wallet-connections`
- `POST /wallet-connections`
- `GET /wallet-connections/{connectionId}`
- `PATCH /wallet-connections/{connectionId}`
- `DELETE /wallet-connections/{connectionId}`

### 7.2 Asset usage

`GET /assets` must be called during app bootstrap or flow initialization to build:

- supported crypto list;
- supported fiat list;
- available networks by asset;
- asset availability UI.

Disabled assets must not be selectable.

### 7.3 Wallet connection UX

Frontend must support two connection types:

- wallet address connection;
- exchange account connection.

Each connection card must display:

- provider name;
- asset;
- network if applicable;
- masked identifier;
- label;
- default flag;
- verification state.

### 7.4 Form behavior

Connection form must dynamically adapt based on `type`:

- for `WALLET_ADDRESS`, show wallet address + network;
- for `EXCHANGE_ACCOUNT`, show exchange account ID and provider-specific metadata area if enabled later.

Frontend must not expose raw secrets after save. If exchange integration later includes API credentials, frontend should only send them to a dedicated secure flow and then display masked status returned by backend.

## 8. Quote integration

### 8.1 Endpoint

Frontend integrates with:

- `POST /quotes`

### 8.2 Quote request policy

Quote should be requested when user has selected enough parameters to price a transaction:

- side (`BUY` or `SELL`);
- fiat currency;
- crypto currency;
- amount type;
- amount;
- optionally network;
- optionally payment/settlement method.

### 8.3 Quote UX states

Frontend must render:

- empty state before enough input;
- loading state while quote is being calculated;
- success state with expiration timer;
- expired quote state;
- validation error state;
- temporarily unavailable state.

### 8.4 Quote presentation

Quote block must show:

- fiat amount;
- crypto amount;
- rate;
- fee;
- total;
- expiration timestamp or countdown;
- selected direction (`buy` or `sell`).

Countdown expiration should never be the only source of truth. Once countdown reaches zero, frontend must disable order submission until a new quote is requested.

## 9. Order creation and lifecycle integration

### 9.1 Endpoints

Frontend integrates with:

- `GET /orders`
- `POST /orders`
- `GET /orders/{orderId}`
- `POST /orders/{orderId}/cancel`
- `GET /orders/{orderId}/payment-instructions`
- `GET /orders/{orderId}/transfer-instructions`

### 9.2 Create order behavior

When user accepts a quote, frontend creates an order using:

- `quoteId`;
- `walletConnectionId`;
- payout details if required for sell flow;
- optional user comment.

If order creation fails due to business conflict, frontend must force quote refresh and communicate the reason clearly.

### 9.3 Order detail screen

Order detail page is a critical integration surface and must include:

- order summary;
- current status badge;
- amount blocks;
- selected wallet / exchange destination or source;
- payout details if applicable;
- timeline of state changes;
- next required action block;
- receipt block;
- support escalation block.

### 9.4 Required list filters

Personal account order history must support:

- status filter;
- side filter;
- pagination;
- empty state for first-time users.

### 9.5 Order status mapping to UI

Minimum frontend mapping:

| Backend status | Primary UI meaning | CTA / block |
|---|---|---|
| `DRAFT` | Draft created | Resume or discard |
| `PENDING_KYC` | Waiting for verification | Complete KYC |
| `QUOTED` | Quote accepted, next step pending | Continue |
| `PENDING_PAYMENT` | User must pay fiat | Show payment instructions |
| `PAYMENT_SUBMITTED` | Evidence submitted | Await review |
| `PAYMENT_UNDER_REVIEW` | Manual payment review | No destructive actions |
| `PAYMENT_CONFIRMED` | Payment confirmed | Await crypto settlement |
| `PENDING_CRYPTO_TRANSFER` | User must transfer crypto | Show transfer instructions |
| `CRYPTO_TRANSFER_SUBMITTED` | Tx submitted | Await review |
| `CRYPTO_TRANSFER_UNDER_REVIEW` | Manual transfer review | No destructive actions |
| `CRYPTO_TRANSFER_CONFIRMED` | Transfer confirmed | Await settlement |
| `PROCESSING_EXCHANGE` | Platform executes exchange | Show processing state |
| `SETTLING` | Outbound funds are being delivered | Show finalization state |
| `COMPLETED` | Order finalized | Show receipt / summary |
| `CANCELED` | User or operator canceled order | Show reason if available |
| `REJECTED` | Compliance or operations rejection | Show reason and support path |
| `EXPIRED` | User missed time window | Offer new quote |

## 10. Buy flow integration

### 10.1 Functional sequence

Recommended client flow:

1. User chooses buy direction.
2. User selects asset, network, and amount.
3. Frontend requests quote.
4. User selects or creates destination wallet connection.
5. User confirms order creation.
6. Frontend fetches payment instructions.
7. User pays using provided details.
8. User submits payment evidence.
9. User waits for manual review / optional automated confirmation.
10. Frontend polls order or payment state until settlement completes.
11. User receives completion state and receipt metadata.

### 10.2 Buy flow screens

Frontend should implement at least:

- buy form;
- quote confirmation panel;
- wallet selection modal or step;
- payment instructions screen;
- payment evidence submission form;
- order tracking screen;
- completion / receipt screen.

## 11. Sell flow integration

### 11.1 Functional sequence

Recommended client flow:

1. User chooses sell direction.
2. User selects asset, network, and amount.
3. Frontend requests quote.
4. User provides payout details.
5. User selects source wallet / exchange connection if required for convenience.
6. Frontend creates order.
7. Frontend fetches crypto transfer instructions.
8. User sends crypto.
9. User submits blockchain transaction hash or evidence.
10. User waits for review / confirmation.
11. Backend processes exchange and fiat payout.
12. Frontend shows completion state and receipt / payout confirmation.

### 11.2 Sell-specific UX rules

Sell flow must clearly separate:

- crypto source information;
- platform receiving wallet details;
- fiat payout destination;
- review state after tx submission.

Frontend must show network warnings prominently to reduce transfer errors.

## 12. Payment and evidence submission integration

### 12.1 Endpoints

Frontend integrates with:

- `POST /payments`
- `GET /payments/{paymentId}`

### 12.2 Evidence submission forms

Form must adapt by payment evidence type:

| Type | Required UI fields |
|---|---|
| `FIAT_PAYMENT` | provider transaction ID, optional amount, proof files |
| `CRYPTO_TRANSFER` | blockchain tx hash, optional amount, proof files |

### 12.3 Evidence UX requirements

Frontend must:

- prevent duplicate rapid submissions;
- show “submitted for review” confirmation;
- display latest payment record status on order page;
- render rejection reason if evidence is rejected;
- allow resubmission when backend policy allows it.

## 13. Receipt integration

### 13.1 Endpoint

Frontend integrates with:

- `GET /receipts/{orderId}`

### 13.2 Receipt UI behavior

Receipt widget must support these states:

- hidden when feature disabled;
- pending issuance;
- issued with action to open/download external receipt URL;
- failed issuance with support message.

Receipt block should show:

- fiscal status;
- issued timestamp;
- provider if available;
- link to receipt if URL exists.

## 14. Notifications and email-related UI behavior

Although email sending is backend-owned, frontend must reflect notification outcomes where surfaced by backend status changes.

Frontend should display lightweight informational messages for:

- registration success;
- KYC submitted;
- order created;
- payment evidence submitted;
- payment confirmed;
- crypto transfer confirmed;
- order completed;
- receipt issued.

Frontend should not claim an email was sent unless backend explicitly exposes that status in a future endpoint or event stream.

## 15. Polling and state synchronization strategy

### 15.1 MVP synchronization model

Until realtime channels are introduced, frontend should use polling on critical screens.

Recommended polling targets:

- `GET /orders/{orderId}` on order tracking page;
- `GET /payments/{paymentId}` when latest payment record exists;
- `GET /receipts/{orderId}` after order reaches settlement or completion stages.

### 15.2 Polling intervals

Suggested defaults:

| Screen / state | Poll interval |
|---|---|
| Review / processing screens | 10–15 seconds |
| Completion waiting for receipt | 15–30 seconds |
| Background lists | manual refresh or 30–60 seconds |

Polling must stop when:

- order reaches terminal state;
- receipt reaches terminal state;
- user leaves screen;
- tab inactivity policy requires pause.

### 15.3 Future-compatible abstraction

Frontend data layer should abstract state synchronization so polling can later be replaced or augmented by:

- websocket updates;
- SSE;
- webhook-triggered backend pushes to a frontend subscription service.

## 16. Error handling contract

### 16.1 Error model

Frontend must handle at least these backend response classes:

- `401 Unauthorized`;
- `404 Not Found`;
- `409 Conflict`;
- `422 Validation Error`;
- `5xx` service or provider failures.

### 16.2 UX rules

| Error type | Frontend behavior |
|---|---|
| `401` | Refresh session or force re-login |
| `404` | Show missing resource screen |
| `409` | Keep context, explain business conflict, offer recovery |
| `422` | Map field-level errors to form controls |
| `5xx` | Show retry UI and support path |

### 16.3 Conflict examples

Frontend must be prepared for business conflicts such as:

- quote expired;
- order no longer cancelable;
- wallet connection invalid for selected asset;
- KYC no longer valid for requested action;
- payment already confirmed or already rejected.

## 17. Required frontend modules

Recommended module structure:

- `auth`;
- `profile`;
- `kyc`;
- `assets`;
- `walletConnections`;
- `quotes`;
- `orders`;
- `payments`;
- `receipts`;
- `notifications`;
- `support`;
- `shared/api`;
- `shared/config`;
- `shared/types`.

Each module should expose:

- typed API client functions;
- request / response mappers if needed;
- UI hooks / composables / stores;
- loading and error selectors;
- test fixtures.

## 18. Suggested client-side types

Frontend codebase should define strongly typed models mirroring backend schemas for at least:

- `UserProfile`;
- `KycApplication`;
- `Asset`;
- `WalletConnection`;
- `Quote`;
- `Order`;
- `OrderTimelineEvent`;
- `PaymentRecord`;
- `Receipt`;
- `ApiError`.

One source of truth for API types is recommended. Best practice is generation from OpenAPI into typed frontend SDK or schema types.

## 19. API client requirements

API client must support:

- bearer token injection;
- request timeout handling;
- retry policy for idempotent GET requests only;
- cancellation for stale quote requests;
- normalized error parsing;
- correlation ID propagation if introduced later;
- pluggable logging for staging/debug environments.

For quote forms, client must cancel stale in-flight quote requests when user rapidly changes amount or asset inputs.

## 20. Loading, empty, and disabled states

Frontend must not ship only happy-path screens. The following states are mandatory:

- skeleton loading for account dashboard and order details;
- empty order history state;
- empty wallet connection state;
- disabled trade actions when KYC is blocked;
- disabled submit buttons during request execution;
- expired quote state;
- no receipt yet state.

Buttons must have deterministic disabled logic and inline explanation where disabled state may be unclear.

## 21. Analytics and audit-ready UI hooks

If analytics is added, events should be emitted for:

- registration completed;
- login completed;
- KYC submission started and completed;
- quote requested;
- order created;
- payment evidence submitted;
- order canceled;
- receipt opened.

Analytics events must never include raw sensitive document values, full wallet addresses, full card numbers, or raw payment secrets.

## 22. Security requirements for frontend

Frontend must:

- avoid persisting sensitive raw financial or document values unnecessarily;
- mask wallet identifiers and payout data in UI wherever possible;
- sanitize all user-provided text rendered back into the UI;
- prevent duplicate submission on critical actions;
- protect operator-only screens through role-aware routing if role data is exposed;
- never expose internal rejection heuristics or fraud rules in user-facing text.

## 23. Accessibility and localization requirements

Frontend must provide:

- fully usable mobile and desktop layouts;
- keyboard-accessible forms and modals;
- readable status communication for timelines;
- clear validation copy in Russian;
- formatting for RUB values and localized date/time display;
- terminology consistency for buy / sell / payment / transfer / receipt states.

Primary UI language should be Russian. Architecture should allow future i18n expansion.

## 24. QA integration checklist

Before frontend release, QA must verify:

- auth bootstrap and token refresh;
- KYC gating behavior;
- quote creation success and expiration behavior;
- buy flow completion with manual review wait states;
- sell flow completion with manual review wait states;
- order polling updates;
- payment evidence rejection and resubmission;
- receipt rendering across pending / issued / failed states;
- order cancel behavior;
- error rendering for 401 / 404 / 409 / 422 / 500;
- responsive behavior on mobile;
- masking of sensitive values.

## 25. Recommended implementation sequence

Recommended frontend delivery order:

1. API client, auth, config, and shared types.
2. User bootstrap and personal account shell.
3. KYC module.
4. Assets and wallet connections.
5. Quote widget.
6. Buy flow.
7. Sell flow.
8. Order tracking and timeline.
9. Receipt widget and post-completion UX.
10. Hardening: error states, analytics, accessibility, QA fixes.

## 26. Open issues for alignment

The following points should be confirmed before implementation freeze:

- whether quotes are allowed before KYC approval;
- exact storage strategy for access/refresh tokens;
- whether file upload API is separate from current OpenAPI surface;
- whether admin/operator screens live in same frontend app or separate app;
- exact provider-specific UX for exchange connections;
- whether receipt download opens external hosted URL or proxied route;
- whether polling is sufficient for MVP or SSE should be introduced immediately.

## 27. Deliverables expected from frontend team

Frontend team should produce:

- typed API integration layer;
- production-ready screens for buy, sell, KYC, account, and orders;
- reusable status components and timeline components;
- wallet connection components;
- polling/state sync utilities;
- validation and error handling layer;
- test coverage for main flows;
- handoff notes for QA and backend teams.