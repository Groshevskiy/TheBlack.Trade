# Component Architecture Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Frontend + Backend Architecture
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `api-resource-boundaries-and-contract-spec.md`
  - `data-model-canonical-entities-spec.md`
- Related documents:
  - `frontend-integration-spec.md`
  - `design-system-ui-kit-spec.md`
  - `theblack-trade-solution-architecture-and-technical-specification.md`

## 1. Purpose

This document defines the frontend component architecture for TheBlack.Trade. It describes the recommended UI composition model, domain-driven component boundaries, shared component taxonomy, state ownership, container/presentation separation, and implementation guidelines for the customer-facing application and the operator/admin workflows.

The goal is to give frontend engineers, product designers, and architects a shared implementation model so screens, routes, API integration, and business states remain consistent as the platform grows.

## 2. Architectural principles

### 2.1 Component architecture goals

Frontend component architecture must:

- support modular growth;
- isolate business domains;
- prevent duplicated transaction logic across buy and sell flows;
- allow consistent UX across public, account, and admin areas;
- keep API orchestration outside presentational components;
- enable testability for complex stateful flows;
- make manual-review-first UX easy to express.

### 2.2 Design constraints

The UI must reflect an operational product where:

- KYC gates trading capability;
- quote validity is time-sensitive;
- order statuses drive screen state;
- payment and transfer evidence may wait for manual review;
- receipt issuance may lag completion;
- wallet and exchange connections are reusable account resources.

This means component architecture must be state-aware and domain-driven rather than page-only.

## 3. Recommended architecture layers

Recommended layers:

1. **App shell layer** — layouts, navigation, route wrappers, guard wrappers.
2. **Domain container layer** — business-aware smart components bound to routes and API data.
3. **Feature component layer** — reusable domain-specific interactive blocks.
4. **Shared UI layer** — generic reusable UI primitives and composite UI patterns.
5. **Data/service layer** — API client, type bindings, polling, state synchronization, caching.

### 3.1 Separation rule

- Route screens own orchestration and layout composition.
- Domain containers own data fetching, mutations, and business state derivation.
- Feature components own domain-specific rendering and user input behavior.
- Shared UI components own pure presentation and generic interactions.

## 4. Suggested project structure

```text
src/
  app/
    providers/
    router/
    layouts/
    guards/
  shared/
    api/
    config/
    lib/
    hooks/
    ui/
    forms/
    feedback/
    formatting/
    icons/
    types/
  entities/
    user/
    kyc/
    asset/
    wallet-connection/
    quote/
    order/
    payment/
    receipt/
  features/
    auth/
    profile/
    kyc-submit/
    kyc-status/
    quote-builder/
    buy-flow/
    sell-flow/
    wallet-connection-create/
    wallet-connection-edit/
    payout-details/
    payment-evidence-submit/
    order-cancel/
    receipt-view/
    support-entry/
  widgets/
    header/
    footer/
    account-sidebar/
    account-dashboard/
    trade-stepper/
    order-tracker/
    order-summary/
    order-timeline/
    active-orders-panel/
    wallet-list/
    quote-panel/
    receipt-panel/
    support-panel/
    admin-order-queue/
    admin-payment-review/
    admin-kyc-queue/
  pages/
    landing/
    auth/
    kyc/
    trade/
    wallets/
    account/
    orders/
    support/
    admin/
```

This structure follows a domain-first approach with an explicit distinction between entities, features, widgets, and pages.

## 5. Component taxonomy

### 5.1 Component levels

Recommended taxonomy:

| Level | Role | Examples |
|---|---|---|
| `shared/ui` | Generic UI primitives | Button, Input, Modal, Tabs, Badge |
| `entities/*` | Entity-specific display blocks | UserBadge, OrderStatusBadge, WalletConnectionCard |
| `features/*` | User tasks and business actions | QuoteBuilderForm, PaymentEvidenceForm, CancelOrderAction |
| `widgets/*` | Large composed screen sections | OrderTrackerWidget, DashboardOverviewWidget |
| `pages/*` | Route-level composition | BuyQuotePage, OrderDetailsPage |

### 5.2 Reuse policy

- Shared UI must remain business-agnostic.
- Entity components may know entity shape but not API orchestration.
- Features may own forms, actions, validation, and mutation flows.
- Widgets may compose multiple entities and features into route sections.
- Pages should mostly compose widgets and route-specific containers rather than implement low-level UI directly.

## 6. Shared UI layer

Shared UI layer should be the design-system-backed foundation.

### 6.1 Required UI primitives

Minimum primitives:

- `Button`
- `IconButton`
- `Input`
- `MaskedInput`
- `Textarea`
- `Select`
- `RadioGroup`
- `Checkbox`
- `Switch`
- `FormField`
- `FormError`
- `Card`
- `Modal`
- `Drawer`
- `Sheet`
- `Tooltip`
- `Tabs`
- `Accordion`
- `Badge`
- `Alert`
- `Toast`
- `Table`
- `Pagination`
- `Skeleton`
- `EmptyState`
- `Timeline`
- `StepIndicator`
- `Countdown`
- `FileUploader`
- `CopyButton`
- `Divider`

### 6.2 Required UI conventions

Shared UI must support:

- loading states;
- disabled states;
- destructive states;
- mobile responsiveness;
- keyboard accessibility;
- Russian copy lengths;
- icon + text combinations;
- deterministic class/token variants.

## 7. Domain entity components

Domain entity components provide reusable visual representation of core business objects.

### 7.1 User entity

Suggested components:

- `UserAvatarPlaceholder`
- `UserSummaryCard`
- `UserKycBadge`
- `ProfileSummaryBlock`

### 7.2 KYC entity

Suggested components:

- `KycStatusBadge`
- `KycStatusPanel`
- `KycRequirementList`
- `KycRejectionReason`
- `KycApplicationSummary`

### 7.3 Wallet connection entity

Suggested components:

- `WalletConnectionCard`
- `WalletConnectionListItem`
- `WalletConnectionTypeBadge`
- `WalletConnectionVerificationBadge`
- `WalletAddressMasked`

### 7.4 Quote entity

Suggested components:

- `QuoteSummaryCard`
- `QuoteAmountBlock`
- `QuoteRateRow`
- `QuoteFeeRow`
- `QuoteExpiryCountdown`
- `QuoteDirectionBadge`

### 7.5 Order entity

Suggested components:

- `OrderStatusBadge`
- `OrderSideBadge`
- `OrderCard`
- `OrderListRow`
- `OrderAmountSummary`
- `OrderMetaBlock`
- `OrderTimelineEventItem`
- `OrderRiskBadge` for admin-only surfaces

### 7.6 Payment entity

Suggested components:

- `PaymentStatusBadge`
- `PaymentMethodBadge`
- `PaymentRecordSummary`
- `BlockchainTxHashRow`
- `ProviderTransactionRow`

### 7.7 Receipt entity

Suggested components:

- `ReceiptStatusBadge`
- `ReceiptSummaryCard`
- `ReceiptLinkAction`

## 8. Feature components by domain

## 8.1 Auth features

Suggested components:

- `LoginFormFeature`
- `RegisterFormFeature`
- `SessionExpiredPanel`
- `LogoutAction`

Responsibilities:

- validation;
- submission;
- auth mutation state handling;
- redirect callback handling.

## 8.2 KYC features

Suggested components:

- `KycSubmissionFormFeature`
- `KycDocumentUploadFeature`
- `KycStatusFeature`
- `KycResubmissionAction`

Responsibilities:

- collect personal data;
- manage document uploads;
- submit application;
- render review state and rejection handling.

## 8.3 Quote features

Suggested components:

- `QuoteBuilderFormFeature`
- `TradeDirectionSwitcher`
- `AssetSelector`
- `NetworkSelector`
- `AmountEntry`
- `QuoteRequestAction`
- `QuoteRefreshAction`

Responsibilities:

- input handling;
- debounce/cancel stale quote requests;
- normalize API request payload;
- expose quote success/error/loading state.

## 8.4 Wallet connection features

Suggested components:

- `WalletConnectionCreateFeature`
- `WalletConnectionEditFeature`
- `WalletConnectionDeleteAction`
- `WalletConnectionPickerFeature`
- `ExchangeConnectionCreateFeature`

Responsibilities:

- create/edit/delete connections;
- return selected connection back to flows;
- handle default selection;
- render empty state when no connections exist.

## 8.5 Buy flow features

Suggested components:

- `BuyQuoteReviewFeature`
- `BuyWalletSelectionFeature`
- `BuyOrderConfirmFeature`
- `PaymentInstructionsFeature`
- `FiatPaymentEvidenceSubmitFeature`

Responsibilities:

- progress through buy-specific flow;
- create order from quote;
- fetch payment instructions;
- submit payment evidence;
- route user to order tracking.

## 8.6 Sell flow features

Suggested components:

- `SellQuoteReviewFeature`
- `PayoutDetailsFeature`
- `SellSourceSelectionFeature`
- `SellOrderConfirmFeature`
- `CryptoTransferInstructionsFeature`
- `CryptoTransferEvidenceSubmitFeature`

Responsibilities:

- collect payout destination;
- select source wallet/exchange;
- create order;
- present receiving wallet details;
- submit tx evidence.

## 8.7 Order lifecycle features

Suggested components:

- `OrderTrackerFeature`
- `OrderCancelFeature`
- `OrderNextActionPanel`
- `OrderPollingController`
- `OrderStatusTransitionNotice`

Responsibilities:

- derive current actionable step;
- coordinate polling;
- expose cancel action when allowed;
- switch between pending/review/completed terminal widgets.

## 8.8 Receipt features

Suggested components:

- `ReceiptPanelFeature`
- `ReceiptFetchFeature`
- `ReceiptDownloadAction`

Responsibilities:

- poll/fetch receipt state;
- render pending/issued/failed behavior;
- expose receipt URL action.

## 8.9 Support features

Suggested components:

- `SupportEntryFeature`
- `OrderSupportContextFeature`
- `SupportChannelsList`

Responsibilities:

- contextual support hints;
- support links;
- support message prefill for order-linked help.

## 8.10 Admin/operator features

Suggested components:

- `AdminOrderQueueFeature`
- `AdminOrderReviewFeature`
- `AdminPaymentReviewFeature`
- `AdminKycQueueFeature`
- `AdminKycReviewFeature`
- `AdminSettlementAction`

Responsibilities:

- render queues;
- approve/reject actions;
- manual settlement action handling;
- moderate evidence and KYC submissions.

## 9. Widget layer

Widgets are large assembled areas used across pages.

### 9.1 Public widgets

Suggested widgets:

- `LandingHeroWidget`
- `HowItWorksWidget`
- `BuySellDirectionsWidget`
- `ComplianceInfoWidget`
- `FaqPreviewWidget`

### 9.2 Account widgets

Suggested widgets:

- `AccountDashboardWidget`
- `ProfileOverviewWidget`
- `ActiveOrdersWidget`
- `RecentOrdersWidget`
- `WalletConnectionsWidget`
- `KycOverviewWidget`

### 9.3 Trade widgets

Suggested widgets:

- `TradeFlowShellWidget`
- `TradeStepSidebarWidget`
- `QuotePanelWidget`
- `TradeSummarySidebarWidget`
- `InstructionPanelWidget`

### 9.4 Order widgets

Suggested widgets:

- `OrderTrackerWidget`
- `OrderSummaryWidget`
- `OrderTimelineWidget`
- `OrderCurrentActionWidget`
- `ReceiptPanelWidget`
- `OrderSupportWidget`

### 9.5 Admin widgets

Suggested widgets:

- `AdminQueueFiltersWidget`
- `AdminOrderSummaryWidget`
- `AdminReviewActionWidget`
- `AdminEvidenceViewerWidget`
- `AdminKycSummaryWidget`

## 10. Page composition model

Pages should be thin route-level compositions.

### 10.1 Page responsibilities

Pages may:

- bind route params;
- call route-level loaders;
- compose widgets/features;
- attach page metadata;
- define route-local empty/error wrappers.

Pages should not:

- contain low-level form controls inline;
- embed raw fetch logic repeatedly;
- duplicate domain derivation rules;
- manually reimplement status-to-UI mapping in multiple places.

### 10.2 Example page composition

`OrderDetailsPage` might compose:

- `AccountAppShell`
- `OrderTrackerFeature`
  - `OrderSummaryWidget`
  - `OrderTimelineWidget`
  - `OrderCurrentActionWidget`
  - `ReceiptPanelFeature`
  - `OrderSupportWidget`

## 11. Container vs presentational split

### 11.1 Smart containers

Smart containers should own:

- API data fetching;
- mutation triggers;
- polling;
- derived view-state calculation;
- permission and route checks;
- mapping API responses into UI-friendly props.

Examples:

- `OrderTrackerContainer`
- `BuyFlowContainer`
- `SellFlowContainer`
- `WalletConnectionsContainer`
- `AdminOrderReviewContainer`

### 11.2 Presentational components

Presentational components should receive ready props and emit UI-level callbacks.

Examples:

- `OrderSummaryCard`
- `QuoteSummaryCard`
- `WalletConnectionCard`
- `KycStatusPanel`
- `ReceiptSummaryCard`

### 11.3 Split rule

If a component needs knowledge of both API lifecycle and page navigation, it is usually a container or feature, not a shared or pure entity component.

## 12. State ownership model

### 12.1 State categories

Recommended state ownership split:

| State type | Owner |
|---|---|
| app config state | app provider |
| auth session state | auth provider/store |
| route params state | router |
| API cache state | query/data layer |
| temporary form state | local feature component |
| trade flow step state | feature-level store or route-scoped store |
| modal open/close state | nearest owning screen/widget |
| filter/search state | widget or route-scoped store |

### 12.2 Important rule for trade flows

Buy and sell flows require explicit route-scoped state management so:

- quote data is recoverable while user moves between steps;
- stale quote data can be invalidated centrally;
- selected wallet/source/payout details survive screen transitions;
- user can go back one step without losing all progress.

### 12.3 Suggested flow stores

Recommended dedicated stores:

- `useBuyFlowStore`
- `useSellFlowStore`
- `useAuthStore`
- `useOrderTrackerState`
- `useAdminQueueFilters`

## 13. Status-driven rendering system

A large part of UI complexity comes from status handling. This should not be spread ad hoc across components.

### 13.1 Central mapping modules

Create centralized mapping modules for:

- KYC status → badge variant, CTA, explanatory text;
- order status → next action, color, timeline label, polling need;
- payment status → evidence review UI state;
- receipt status → receipt panel state.

Suggested modules:

- `order-status.model.ts`
- `kyc-status.model.ts`
- `payment-status.model.ts`
- `receipt-status.model.ts`

### 13.2 Status rendering helpers

Suggested helpers:

- `getOrderStatusPresentation(status)`
- `getOrderNextAction(order)`
- `getKycStatusPresentation(status)`
- `canCancelOrder(order)`
- `shouldPollOrder(order)`
- `shouldPollReceipt(receipt)`

## 14. Forms architecture

### 14.1 Form strategy

All critical forms should use a consistent form architecture with:

- typed schema validation;
- reusable field wrappers;
- async submit handling;
- backend field error mapping;
- inline and summary errors.

### 14.2 High-priority forms

- login form;
- registration form;
- KYC submission form;
- quote builder form;
- wallet connection create/edit form;
- payout details form;
- payment evidence form;
- tx evidence form;
- admin review forms.

### 14.3 Form component conventions

A form feature should be composed of:

- validation schema;
- default values resolver;
- API mutation adapter;
- field components;
- submit button with loading/disabled rules;
- error presentation layer.

## 15. Data fetching and integration components

### 15.1 Query layer

Recommended query hooks or service adapters:

- `useCurrentUserQuery`
- `useAssetsQuery`
- `useWalletConnectionsQuery`
- `useQuoteMutation`
- `useOrdersQuery`
- `useOrderQuery(orderId)`
- `useCreateOrderMutation`
- `usePaymentRecordQuery(paymentId)`
- `useSubmitPaymentEvidenceMutation`
- `useReceiptQuery(orderId)`
- `useAdminOrdersQuery`

### 15.2 Integration rules

- Route screens should not call raw fetch directly.
- Use typed query/mutation wrappers.
- Entity and shared UI components should never call API directly.
- Polling behavior should be encapsulated in query options or a dedicated controller hook.

## 16. Cross-cutting infrastructure components

Suggested cross-cutting components:

- `AppProviders`
- `AuthBootstrap`
- `ProtectedRouteBoundary`
- `RoleProtectedBoundary`
- `KycProtectedBoundary`
- `RouteErrorBoundary`
- `ApiErrorNotice`
- `GlobalToastHost`
- `PageTitleManager`
- `SupportShortcut`
- `CopyToClipboardAction`
- `SensitiveValueMask`

These provide platform-level consistency across all route groups.

## 17. Timeline and process visualization components

Because process transparency is core to the product, timeline components are strategic rather than decorative.

### 17.1 Required timeline components

- `ProcessStepIndicator`
- `OrderTimeline`
- `OrderTimelineEvent`
- `CurrentStepHighlight`
- `NextExpectedActionPanel`

### 17.2 Timeline rules

Timeline system must:

- support pending/current/completed/failed states;
- clearly distinguish user action vs operator review vs system action;
- support mobile collapse behavior;
- handle long-running review states gracefully.

## 18. Account dashboard composition

Suggested account dashboard composition:

- `AccountDashboardPage`
  - `ProfileOverviewWidget`
  - `KycOverviewWidget`
  - `ActiveOrdersWidget`
  - `WalletConnectionsWidget`
  - `TradeQuickActionsWidget`
  - `SupportPanelWidget`

The dashboard should be a summary and action launcher, not a dense admin panel.

## 19. Buy flow composition reference

Suggested buy flow composition:

- `BuyEntryPage`
  - `TradeFlowShellWidget`
  - `QuoteBuilderFormFeature`
  - `QuotePanelWidget`

- `BuyQuotePage`
  - `BuyFlowContainer`
  - `BuyQuoteReviewFeature`
  - `TradeSummarySidebarWidget`

- `BuyWalletPage`
  - `WalletConnectionPickerFeature`
  - `WalletConnectionCreateFeature` (modal/drawer variant)

- `BuyConfirmPage`
  - `BuyOrderConfirmFeature`
  - `QuoteSummaryCard`
  - `WalletConnectionCard`

- `BuyPaymentPage`
  - `PaymentInstructionsFeature`
  - `InstructionPanelWidget`
  - `SupportPanelWidget`

- `BuyPaymentProofPage`
  - `FiatPaymentEvidenceSubmitFeature`

## 20. Sell flow composition reference

Suggested sell flow composition:

- `SellEntryPage`
  - `TradeFlowShellWidget`
  - `QuoteBuilderFormFeature`
  - `QuotePanelWidget`

- `SellQuotePage`
  - `SellQuoteReviewFeature`

- `SellPayoutPage`
  - `PayoutDetailsFeature`

- `SellSourcePage`
  - `WalletConnectionPickerFeature`
  - `ExchangeConnectionCreateFeature` or `WalletConnectionCreateFeature`

- `SellConfirmPage`
  - `SellOrderConfirmFeature`
  - `PayoutSummaryBlock`
  - `QuoteSummaryCard`

- `SellTransferPage`
  - `CryptoTransferInstructionsFeature`
  - `NetworkWarningPanel`

- `SellTransferProofPage`
  - `CryptoTransferEvidenceSubmitFeature`

## 21. Admin composition reference

Suggested admin page composition:

- `AdminOrdersPage`
  - `AdminQueueFiltersWidget`
  - `AdminOrderQueueFeature`

- `AdminOrderDetailsPage`
  - `AdminOrderReviewContainer`
  - `AdminOrderSummaryWidget`
  - `OrderTimelineWidget`
  - `AdminReviewActionWidget`
  - `ReceiptPanelWidget`

- `AdminPaymentReviewPage`
  - `AdminPaymentReviewFeature`
  - `AdminEvidenceViewerWidget`
  - `PaymentRecordSummary`

- `AdminKycReviewPage`
  - `AdminKycReviewFeature`
  - `KycApplicationSummary`
  - `AdminReviewActionWidget`

## 22. Loading, empty, and failure architecture

These states should be modeled as dedicated components, not ad hoc conditionals scattered through JSX/templates.

### 22.1 Required state components

- `PageSkeleton`
- `SectionSkeleton`
- `OrderTrackerSkeleton`
- `WalletListEmptyState`
- `OrdersEmptyState`
- `QuoteUnavailableState`
- `ReceiptPendingState`
- `ReceiptFailedState`
- `KycBlockedState`
- `InlineFormErrorSummary`
- `RetryPanel`

### 22.2 State composition rule

Feature components should delegate visual fallback rendering to explicit state components wherever possible.

## 23. Accessibility and content architecture

Components must support:

- proper labels and descriptions for financial fields;
- accessible step navigation;
- accessible timeline semantics;
- readable error summaries;
- keyboard-friendly modal and drawer usage;
- localized and comprehensible status language in Russian.

Status-heavy components must avoid color-only communication. Badge, label, icon, and descriptive text should work together.

## 24. Testing strategy by component level

### 24.1 Shared UI tests

Test:

- rendering variants;
- accessibility states;
- keyboard behavior;
- loading/disabled behavior.

### 24.2 Feature tests

Test:

- happy path submission;
- validation path;
- API error mapping;
- duplicate submit prevention;
- route transition callback behavior.

### 24.3 Widget/page tests

Test:

- correct composition by route state;
- conditional rendering by entity status;
- polling behavior;
- mobile/desktop differences for critical areas.

## 25. Anti-patterns to avoid

Do not:

- put API calls directly inside shared UI primitives;
- duplicate order-status mapping across pages;
- create separate conflicting quote components for buy and sell without shared core;
- mix admin and customer display logic in the same low-level components unless explicitly role-variant;
- hide manual review complexity behind misleading “instant” UI language;
- let pages become giant stateful files.

## 26. Recommended implementation phases

1. Shared UI foundation and app shell.
2. Entity display components.
3. Auth and profile features.
4. KYC features.
5. Quote builder feature.
6. Wallet connection features.
7. Buy flow features.
8. Sell flow features.
9. Order tracking widgets and receipt features.
10. Admin/operator features.
11. Hardening: accessibility, loading states, analytics hooks, tests.

## 27. Deliverables expected from frontend architecture work

This component architecture should produce:

- component inventory;
- file/folder blueprint;
- feature ownership map;
- shared UI foundation;
- route-to-widget composition map;
- state ownership model;
- testing strategy by component layer.