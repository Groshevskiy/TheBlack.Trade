# Frontend State Machine Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: Frontend + Product
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `theblack-trade-order-state-machine-spec.md`
  - `transaction-status-state-machine-spec.md`
  - `enum-and-state-dictionary-spec.md`
- Related documents:
  - `screen-and-route-spec.md`
  - `acceptance-test-catalog.md`

## 1. Purpose

This document defines the frontend state machine model for TheBlack.Trade. It formalizes the major user-facing states, transitions, guards, side effects, and recovery paths across authentication, KYC, wallet setup, quote creation, buy flow, sell flow, order tracking, payment review, receipt issuance, and operator/admin actions.

The purpose of this document is to prevent ambiguous flow logic, reduce contradictory UI behavior, and give frontend and backend teams a shared language for state transitions.

## 2. Why a frontend state machine is required

TheBlack.Trade is not a simple form-driven website. It is a transaction platform with:

- authentication and session restoration;
- KYC gating;
- buy and sell flows with divergent steps;
- quote expiration;
- manual-review-first payment confirmation;
- asynchronous order progress;
- delayed receipt issuance;
- operator interventions.

Because of this, frontend behavior must be controlled by explicit state models rather than scattered booleans and route-local conditions.

## 3. State machine scope

This spec covers:

- application bootstrap state;
- authentication machine;
- KYC eligibility machine;
- buy flow machine;
- sell flow machine;
- wallet connection selection machine;
- order tracker machine;
- payment evidence submission machine;
- receipt panel machine;
- admin review machines.

## 4. Core principles

### 4.1 Server is source of truth

Frontend machine may represent local transient states, but business-terminal states must always be confirmed by backend resources.

Frontend may optimistically show progress for request submission, but may not mark:

- KYC as approved;
- payment as confirmed;
- crypto transfer as confirmed;
- order as completed;
- receipt as issued;

unless backend response or polling confirms it.

### 4.2 Explicit state over derived booleans

Avoid scattered flags like:

- `isLoading`
- `isSubmitted`
- `isReady`
- `hasQuote`
- `canContinue`

without a higher-order explicit machine state.

Preferred pattern:

- `authState = authenticated`
- `kycState = approved`
- `buyFlowState = payment_under_review`
- `orderTrackerState = waiting_operator_confirmation`

### 4.3 State + context model

Each machine should include:

- `state` — current finite state;
- `context` — data attached to the machine;
- `events` — user or system triggers;
- `guards` — conditions for transitions;
- `effects` — API calls, routing, polling, notifications.

## 5. Machine overview

| Machine | Owner | Scope |
|---|---|---|
| App bootstrap machine | app shell | startup and session restore |
| Auth machine | auth provider | login/logout/session refresh |
| KYC machine | account/trade gate | eligibility to proceed |
| Wallet connection machine | wallet features | wallet create/select/edit states |
| Buy flow machine | trade flow | buy-side transaction steps |
| Sell flow machine | trade flow | sell-side transaction steps |
| Order tracker machine | order page | long-lived order state sync |
| Payment evidence machine | payment proof step | evidence submission lifecycle |
| Receipt machine | receipt widget | receipt polling and availability |
| Admin review machine | admin pages | moderation actions |

## 6. App bootstrap machine

### 6.1 Purpose

Controls what the app should do on startup and refresh.

### 6.2 States

- `boot_idle`
- `boot_loading_config`
- `boot_restoring_session`
- `boot_fetching_user`
- `boot_authenticated_ready`
- `boot_guest_ready`
- `boot_error`

### 6.3 Events

- `APP_START`
- `CONFIG_LOADED`
- `SESSION_FOUND`
- `SESSION_MISSING`
- `SESSION_RESTORED`
- `SESSION_RESTORE_FAILED`
- `USER_FETCHED`
- `USER_FETCH_FAILED`
- `RETRY_BOOT`

### 6.4 Transitions

| From | Event | Guard | To | Effect |
|---|---|---|---|---|
| `boot_idle` | `APP_START` | — | `boot_loading_config` | load runtime config |
| `boot_loading_config` | `CONFIG_LOADED` | session exists | `boot_restoring_session` | restore tokens |
| `boot_loading_config` | `CONFIG_LOADED` | no session | `boot_guest_ready` | render guest app |
| `boot_restoring_session` | `SESSION_RESTORED` | — | `boot_fetching_user` | fetch `/users/me` |
| `boot_restoring_session` | `SESSION_RESTORE_FAILED` | — | `boot_guest_ready` | clear invalid session |
| `boot_fetching_user` | `USER_FETCHED` | — | `boot_authenticated_ready` | hydrate app user state |
| `boot_fetching_user` | `USER_FETCH_FAILED` | unauthorized | `boot_guest_ready` | clear session |
| any | `RETRY_BOOT` | — | `boot_loading_config` | restart bootstrap |

## 7. Auth machine

### 7.1 States

- `guest`
- `login_submitting`
- `register_submitting`
- `authenticated`
- `refreshing`
- `logout_submitting`
- `session_expired`
- `auth_error`

### 7.2 Context

- current user summary;
- token presence;
- post-login redirect intent;
- last auth error.

### 7.3 Events

- `LOGIN_REQUEST`
- `LOGIN_SUCCESS`
- `LOGIN_FAILURE`
- `REGISTER_REQUEST`
- `REGISTER_SUCCESS`
- `REGISTER_FAILURE`
- `TOKEN_EXPIRED`
- `REFRESH_SUCCESS`
- `REFRESH_FAILURE`
- `LOGOUT_REQUEST`
- `LOGOUT_SUCCESS`

### 7.4 Main transitions

| From | Event | To | Effect |
|---|---|---|---|
| `guest` | `LOGIN_REQUEST` | `login_submitting` | call login API |
| `login_submitting` | `LOGIN_SUCCESS` | `authenticated` | fetch profile, redirect |
| `login_submitting` | `LOGIN_FAILURE` | `auth_error` | render message |
| `guest` | `REGISTER_REQUEST` | `register_submitting` | call register API |
| `register_submitting` | `REGISTER_SUCCESS` | `authenticated` | bootstrap account |
| `authenticated` | `TOKEN_EXPIRED` | `refreshing` | refresh token |
| `refreshing` | `REFRESH_SUCCESS` | `authenticated` | retry blocked request |
| `refreshing` | `REFRESH_FAILURE` | `session_expired` | route to re-login |
| `authenticated` | `LOGOUT_REQUEST` | `logout_submitting` | call logout API |
| `logout_submitting` | `LOGOUT_SUCCESS` | `guest` | clear state and redirect |

## 8. KYC eligibility machine

### 8.1 Purpose

Determines whether a user may proceed into quote/order steps.

### 8.2 States

- `kyc_unknown`
- `kyc_not_started`
- `kyc_pending_submission`
- `kyc_in_review`
- `kyc_approved`
- `kyc_rejected`
- `kyc_resubmission_required`

### 8.3 Inputs

Derived from backend `kycStatus` plus product feature flags.

### 8.4 Events

- `KYC_STATE_SYNC`
- `KYC_SUBMIT_REQUEST`
- `KYC_SUBMIT_SUCCESS`
- `KYC_APPROVED_SYNC`
- `KYC_REJECTED_SYNC`
- `KYC_RESUBMIT_REQUIRED_SYNC`

### 8.5 Rules

| State | Can request quote | Can create order | Primary UX action |
|---|---:|---:|---|
| `kyc_not_started` | configurable | No | start verification |
| `kyc_pending_submission` | No | No | submit KYC |
| `kyc_in_review` | configurable | No | wait |
| `kyc_approved` | Yes | Yes | unlock flows |
| `kyc_rejected` | No | No | resubmit |
| `kyc_resubmission_required` | No | No | resubmit |

## 9. Wallet connection machine

### 9.1 Purpose

Manages wallet creation, selection, edit, and in-flow return behavior.

### 9.2 States

- `wallet_idle`
- `wallet_list_loading`
- `wallet_list_ready`
- `wallet_none_available`
- `wallet_create_editing`
- `wallet_create_submitting`
- `wallet_create_success`
- `wallet_update_submitting`
- `wallet_delete_confirming`
- `wallet_delete_submitting`
- `wallet_error`

### 9.3 Events

- `LOAD_WALLETS`
- `WALLETS_LOADED`
- `WALLETS_EMPTY`
- `CREATE_WALLET_START`
- `CREATE_WALLET_SUBMIT`
- `CREATE_WALLET_SUCCESS`
- `CREATE_WALLET_FAILURE`
- `SELECT_WALLET`
- `EDIT_WALLET_SUBMIT`
- `DELETE_WALLET_REQUEST`
- `DELETE_WALLET_CONFIRM`
- `DELETE_WALLET_SUCCESS`

### 9.4 Special flow rule

If wallet creation starts from a trade step, successful creation should emit a return event with created `connectionId` so trade flow context can auto-select it.

## 10. Quote machine

A quote machine is shared as the foundation for both buy and sell flows.

### 10.1 States

- `quote_idle`
- `quote_editing`
- `quote_requesting`
- `quote_ready`
- `quote_expired`
- `quote_unavailable`
- `quote_error`

### 10.2 Context

- direction;
- amount input;
- selected asset;
- selected network;
- selected payment/settlement method;
- latest quote object;
- expiration timestamp;
- last error.

### 10.3 Events

- `QUOTE_FORM_UPDATED`
- `REQUEST_QUOTE`
- `QUOTE_SUCCESS`
- `QUOTE_FAILURE`
- `QUOTE_EXPIRED`
- `REFRESH_QUOTE`
- `RESET_QUOTE`

### 10.4 Transitions

| From | Event | To | Effect |
|---|---|---|---|
| `quote_idle` | `QUOTE_FORM_UPDATED` | `quote_editing` | update context |
| `quote_editing` | `REQUEST_QUOTE` | `quote_requesting` | call `/quotes` |
| `quote_requesting` | `QUOTE_SUCCESS` | `quote_ready` | store quote and start expiry timer |
| `quote_requesting` | `QUOTE_FAILURE` | `quote_error` or `quote_unavailable` | show message |
| `quote_ready` | `QUOTE_EXPIRED` | `quote_expired` | disable continue |
| `quote_expired` | `REFRESH_QUOTE` | `quote_requesting` | request new quote |
| `quote_ready` | `QUOTE_FORM_UPDATED` | `quote_editing` | invalidate old quote |

## 11. Buy flow machine

### 11.1 Purpose

Models user progression for buy flow from initial input to order tracking handoff.

### 11.2 States

- `buy_idle`
- `buy_building_quote`
- `buy_quote_ready`
- `buy_wallet_required`
- `buy_confirming_order`
- `buy_order_creating`
- `buy_payment_instructions_loading`
- `buy_payment_pending_user_action`
- `buy_payment_proof_editing`
- `buy_payment_proof_submitting`
- `buy_payment_under_review`
- `buy_tracking_redirect_ready`
- `buy_completed_handoff`
- `buy_canceled`
- `buy_blocked`
- `buy_error`

### 11.3 Context

- quote;
- selected destination wallet;
- created order;
- payment instructions;
- payment record;
- return URL intent;
- block reason;
- latest API error.

### 11.4 Events

- `BUY_START`
- `BUY_QUOTE_READY`
- `BUY_CONTINUE_FROM_QUOTE`
- `BUY_WALLET_SELECTED`
- `BUY_CONFIRM_ORDER`
- `BUY_ORDER_CREATED`
- `BUY_ORDER_CREATE_FAILED`
- `BUY_PAYMENT_INSTRUCTIONS_LOADED`
- `BUY_PAYMENT_MARK_SENT`
- `BUY_PAYMENT_PROOF_SUBMIT`
- `BUY_PAYMENT_PROOF_SUCCESS`
- `BUY_PAYMENT_REVIEW_SYNC`
- `BUY_TRACK_ORDER`
- `BUY_CANCEL`
- `BUY_BLOCKED_BY_KYC`

### 11.5 Main transition path

```text
buy_idle
→ buy_building_quote
→ buy_quote_ready
→ buy_wallet_required
→ buy_confirming_order
→ buy_order_creating
→ buy_payment_instructions_loading
→ buy_payment_pending_user_action
→ buy_payment_proof_editing
→ buy_payment_proof_submitting
→ buy_payment_under_review
→ buy_tracking_redirect_ready
→ buy_completed_handoff
```

### 11.6 Guard examples

- cannot enter `buy_wallet_required` without valid non-expired quote;
- cannot create order without approved or policy-allowed KYC state;
- cannot submit payment proof without created order;
- cannot continue once quote is expired until refreshed.

### 11.7 Side effects

- create order via `POST /orders`;
- fetch payment instructions via `GET /orders/{orderId}/payment-instructions`;
- submit payment evidence via `POST /payments`;
- route to `/orders/{orderId}` after successful user-side completion.

## 12. Sell flow machine

### 12.1 Purpose

Models sell-side flow with payout details and crypto transfer evidence.

### 12.2 States

- `sell_idle`
- `sell_building_quote`
- `sell_quote_ready`
- `sell_payout_required`
- `sell_source_required`
- `sell_confirming_order`
- `sell_order_creating`
- `sell_transfer_instructions_loading`
- `sell_transfer_pending_user_action`
- `sell_transfer_proof_editing`
- `sell_transfer_proof_submitting`
- `sell_transfer_under_review`
- `sell_tracking_redirect_ready`
- `sell_completed_handoff`
- `sell_canceled`
- `sell_blocked`
- `sell_error`

### 12.3 Context

- quote;
- payout details;
- selected source wallet/exchange;
- created order;
- transfer instructions;
- payment/transfer record;
- block reason;
- latest API error.

### 12.4 Events

- `SELL_START`
- `SELL_QUOTE_READY`
- `SELL_CONTINUE_FROM_QUOTE`
- `SELL_PAYOUT_SET`
- `SELL_SOURCE_SELECTED`
- `SELL_CONFIRM_ORDER`
- `SELL_ORDER_CREATED`
- `SELL_TRANSFER_INSTRUCTIONS_LOADED`
- `SELL_TRANSFER_MARK_SENT`
- `SELL_TRANSFER_PROOF_SUBMIT`
- `SELL_TRANSFER_PROOF_SUCCESS`
- `SELL_TRANSFER_REVIEW_SYNC`
- `SELL_TRACK_ORDER`
- `SELL_BLOCKED_BY_KYC`

### 12.5 Main transition path

```text
sell_idle
→ sell_building_quote
→ sell_quote_ready
→ sell_payout_required
→ sell_source_required
→ sell_confirming_order
→ sell_order_creating
→ sell_transfer_instructions_loading
→ sell_transfer_pending_user_action
→ sell_transfer_proof_editing
→ sell_transfer_proof_submitting
→ sell_transfer_under_review
→ sell_tracking_redirect_ready
→ sell_completed_handoff
```

### 12.6 Sell-specific guards

- cannot proceed without payout details;
- cannot proceed without valid source selection if flow requires one;
- cannot submit transfer proof without order and tx hash;
- must show network warning confirmation before evidence submission if network-sensitive asset.

## 13. Payment evidence submission machine

This machine can be reused for both buy and sell proof submission.

### 13.1 States

- `evidence_idle`
- `evidence_editing`
- `evidence_validating`
- `evidence_submitting`
- `evidence_submitted`
- `evidence_rejected`
- `evidence_resubmission_allowed`
- `evidence_error`

### 13.2 Context

- evidence type;
- linked order id;
- input values;
- uploaded files;
- last payment record;
- rejection reason.

### 13.3 Events

- `EVIDENCE_START`
- `EVIDENCE_CHANGE`
- `EVIDENCE_VALIDATE`
- `EVIDENCE_SUBMIT`
- `EVIDENCE_SUCCESS`
- `EVIDENCE_REJECTED_SYNC`
- `EVIDENCE_RESUBMIT`
- `EVIDENCE_FAILURE`

### 13.4 Notes

This machine should be embedded as a submachine of buy or sell flow, not implemented independently as a detached global state.

## 14. Order tracker machine

### 14.1 Purpose

Controls persistent tracking UI after order exists.

### 14.2 States

- `tracker_loading`
- `tracker_ready_action_required`
- `tracker_ready_under_review`
- `tracker_ready_processing`
- `tracker_ready_settling`
- `tracker_ready_completed`
- `tracker_ready_canceled`
- `tracker_ready_rejected`
- `tracker_ready_expired`
- `tracker_polling`
- `tracker_error`

### 14.3 Context

- order resource;
- latest payment record;
- receipt state;
- last synced timestamp;
- polling enabled flag.

### 14.4 Input mapping from backend order status

| Backend order status | Tracker state |
|---|---|
| `PENDING_PAYMENT` | `tracker_ready_action_required` |
| `PAYMENT_SUBMITTED` | `tracker_ready_under_review` |
| `PAYMENT_UNDER_REVIEW` | `tracker_ready_under_review` |
| `PAYMENT_CONFIRMED` | `tracker_ready_processing` |
| `PENDING_CRYPTO_TRANSFER` | `tracker_ready_action_required` |
| `CRYPTO_TRANSFER_SUBMITTED` | `tracker_ready_under_review` |
| `CRYPTO_TRANSFER_UNDER_REVIEW` | `tracker_ready_under_review` |
| `CRYPTO_TRANSFER_CONFIRMED` | `tracker_ready_processing` |
| `PROCESSING_EXCHANGE` | `tracker_ready_processing` |
| `SETTLING` | `tracker_ready_settling` |
| `COMPLETED` | `tracker_ready_completed` |
| `CANCELED` | `tracker_ready_canceled` |
| `REJECTED` | `tracker_ready_rejected` |
| `EXPIRED` | `tracker_ready_expired` |

### 14.5 Events

- `TRACKER_LOAD`
- `TRACKER_SYNC_SUCCESS`
- `TRACKER_SYNC_FAILURE`
- `TRACKER_POLL_TICK`
- `ORDER_STATUS_CHANGED`
- `STOP_POLLING`
- `RETRY_TRACKER`

### 14.6 Polling rules

Polling starts when:

- tracker is in review/processing/settling states;
- order is not terminal.

Polling stops when:

- order enters terminal state;
- route unmounts;
- session becomes invalid.

## 15. Receipt machine

### 15.1 States

- `receipt_hidden`
- `receipt_idle`
- `receipt_loading`
- `receipt_pending`
- `receipt_issued`
- `receipt_failed`
- `receipt_error`

### 15.2 Events

- `RECEIPT_FEATURE_DISABLED`
- `RECEIPT_LOAD`
- `RECEIPT_SUCCESS_PENDING`
- `RECEIPT_SUCCESS_ISSUED`
- `RECEIPT_SUCCESS_FAILED`
- `RECEIPT_POLL`
- `RECEIPT_RETRY`

### 15.3 Rules

- if feature disabled → `receipt_hidden`;
- if order not yet relevant for receipt → `receipt_idle`;
- if receipt status pending → `receipt_pending` with optional polling;
- if issued → show receipt action;
- if failed → show support escalation message.

## 16. Admin order review machine

### 16.1 States

- `admin_order_idle`
- `admin_order_loading`
- `admin_order_ready`
- `admin_review_submitting`
- `admin_review_success`
- `admin_review_error`
- `admin_settlement_submitting`
- `admin_settlement_success`

### 16.2 Events

- `ADMIN_ORDER_LOAD`
- `ADMIN_ORDER_LOADED`
- `ADMIN_REVIEW_APPROVE`
- `ADMIN_REVIEW_REJECT`
- `ADMIN_REVIEW_SUCCESS`
- `ADMIN_REVIEW_FAILURE`
- `ADMIN_SETTLE_REQUEST`
- `ADMIN_SETTLE_SUCCESS`
- `ADMIN_SETTLE_FAILURE`

### 16.3 Key behavior

Admin order review actions should lock buttons while submission is in progress and refresh the order resource after every successful mutation.

## 17. Admin payment review machine

### 17.1 States

- `admin_payment_idle`
- `admin_payment_loading`
- `admin_payment_ready`
- `admin_payment_confirming`
- `admin_payment_rejecting`
- `admin_payment_success`
- `admin_payment_error`

### 17.2 Events

- `PAYMENT_RECORD_LOAD`
- `PAYMENT_RECORD_LOADED`
- `PAYMENT_CONFIRM_REQUEST`
- `PAYMENT_REJECT_REQUEST`
- `PAYMENT_REVIEW_SUCCESS`
- `PAYMENT_REVIEW_FAILURE`

## 18. Route-machine integration model

### 18.1 Route as machine host

Each major route should host or subscribe to the relevant state machine:

| Route group | Primary machine |
|---|---|
| app bootstrap | app bootstrap machine |
| `/auth/*` | auth machine |
| `/kyc/*` | KYC machine |
| `/trade/buy/*` | buy flow machine + quote submachine + wallet submachine |
| `/trade/sell/*` | sell flow machine + quote submachine + wallet submachine |
| `/orders/:orderId` | order tracker machine + receipt submachine |
| `/wallets/*` | wallet connection machine |
| `/admin/orders/:orderId` | admin order review machine |
| `/admin/payments/:paymentId` | admin payment review machine |

### 18.2 Route guards and machine states

Route guards should read from machine states rather than duplicated data booleans wherever possible.

Examples:

- buy/sell step route guard checks `buyFlowState` / `sellFlowState`;
- account route guard checks `authState`;
- KYC gate reads `kycState`.

## 19. Event naming convention

Use explicit domain-oriented event names:

- `BUY_ORDER_CREATED`
- `SELL_TRANSFER_PROOF_SUCCESS`
- `TOKEN_EXPIRED`
- `KYC_APPROVED_SYNC`
- `ORDER_STATUS_CHANGED`

Avoid vague names like:

- `NEXT`
- `DONE`
- `FAIL`
- `SET_DATA`

## 20. Recovery and fallback rules

### 20.1 Session recovery

When protected request returns unauthorized:

1. emit `TOKEN_EXPIRED`;
2. enter `refreshing`;
3. retry once after refresh success;
4. if refresh fails, route to session expired flow.

### 20.2 Quote recovery

If quote expires during route progression:

- transition to `quote_expired`;
- block order creation;
- route user back to quote review or quote builder;
- preserve input context so requote is simple.

### 20.3 Order recovery

If in-memory buy/sell state is lost but order already exists:

- recover flow from `/orders/{orderId}`;
- do not force user to rebuild trade form;
- route to tracker state.

### 20.4 Evidence rejection recovery

If payment or transfer evidence is rejected:

- sync to rejected record;
- show rejection reason;
- if backend allows retry, transition to resubmission-enabled editing state.

## 21. Suggested implementation approach

### 21.1 Machine implementation options

Implementation may use:

- explicit reducer + discriminated unions;
- XState or similar finite state machine library;
- store-based machine modeling if transitions remain explicit and testable.

### 21.2 Recommendation

For TheBlack.Trade, the best approach is:

- centralized typed transition logic for auth and app bootstrap;
- dedicated explicit flow stores for buy and sell;
- derived order tracker machine driven by backend order status;
- receipt and polling implemented as submachines/hooks.

## 22. Testing requirements

Each machine must have transition-level tests.

### 22.1 Minimum tests

- auth success/failure/refresh/logout;
- KYC gating transitions;
- quote success/expiry/refresh;
- buy flow happy path and blocked path;
- sell flow happy path and blocked path;
- order tracker polling stop/start rules;
- evidence rejection and resubmission;
- receipt pending to issued transition;
- admin review action locks and refreshes.

### 22.2 Contract testing

Machine tests should validate mapping from backend payloads to UI machine states, especially for:

- `OrderStatus`;
- `KycStatus`;
- `PaymentStatus`;
- `ReceiptStatus`.

## 23. Anti-patterns to avoid

Do not:

- implement flow logic only through route presence;
- rely on button disabled flags as the primary control mechanism;
- duplicate buy/sell transition logic in unrelated screens;
- mix backend resource statuses with unrelated local pseudo-statuses without mapping;
- stop polling only because UI tab changes internally while order is still mounted;
- show terminal success before backend confirms terminal state.

## 24. Deliverables expected from implementation

Based on this spec, frontend team should produce:

- typed machine state definitions;
- event definitions;
- transition maps;
- guards and side-effect services;
- route integration hooks;
- machine tests;
- state-to-UI mapping utilities.