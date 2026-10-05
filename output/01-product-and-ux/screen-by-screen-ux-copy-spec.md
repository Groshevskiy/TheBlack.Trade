# Screen-by-Screen UX Copy Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: Product + Design
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `screen-and-route-spec.md`
- Related documents:
  - `accessibility-conformance-plan.md`
  - `legal-terms-privacy-notice-and-customer-disclosure-pack.md`
  - `annotated-wireframe-spec.md`
  - `ru-localization-ux-copy-spec.md`

## 1. Purpose

This document defines the recommended UX copy for the main product screens of TheBlack.Trade. It is intended to guide designers, product managers, frontend developers, backend developers, compliance reviewers, and QA in creating a consistent product language across the customer journey and operational interfaces.

The copy specification focuses on:

- trust and clarity;
- financial accuracy;
- step-by-step guidance;
- reduction of ambiguity during review and waiting states;
- consistent terminology for statuses, actions, warnings, and confirmations.

## 2. Voice and tone guidelines

The product language should be:

- clear;
- calm;
- credible;
- direct;
- process-oriented;
- never slang-heavy or overly promotional.

Avoid copy that feels:

- speculative;
- hype-driven;
- trader-jargon-heavy;
- playful in critical money moments;
- vague during verification or delay scenarios.

## 3. Terminology rules

Preferred vocabulary:

- use **“exchange”** instead of casual crypto slang;
- use **“verification”** or **“identity verification”** instead of unexplained “KYC” in customer-facing copy, while “KYC” can remain in operator/admin contexts;
- use **“wallet”**, **“destination address”**, **“network”**, **“payment confirmation”**, **“receipt”**, **“review”**, **“status”**, **“processing”** consistently;
- use **“manual review”** when operator action is involved;
- use **“action required”** when the user must do something next.

Avoid mixing synonyms unnecessarily. For example, do not alternate between “transaction,” “deal,” “request,” and “order” if **“order”** is the selected domain term.

## 4. Status label rules

Customer-facing statuses should remain short and understandable.

Recommended customer labels:

| Internal meaning | Customer label |
|---|---|
| draft | Draft |
| pending_kyc | Verification required |
| pending_payment | Awaiting payment |
| payment_submitted | Payment submitted |
| payment_under_review | Payment under review |
| payment_confirmed | Payment confirmed |
| pending_crypto_transfer | Awaiting crypto transfer |
| crypto_transfer_submitted | Transfer submitted |
| crypto_transfer_under_review | Transfer under review |
| crypto_transfer_confirmed | Transfer confirmed |
| processing_exchange | Processing exchange |
| settling | Finalizing |
| completed | Completed |
| canceled | Canceled |
| rejected | Rejected |
| expired | Expired |

## 5. Global microcopy patterns

## 5.1 Primary CTA patterns

Use action-first language.

Examples:

- `Get quote`
- `Continue`
- `Verify identity`
- `Save wallet`
- `Confirm order`
- `Submit payment`
- `I sent the transfer`
- `Download receipt`

## 5.2 Secondary CTA patterns

Examples:

- `Back`
- `Edit details`
- `Cancel order`
- `View details`
- `Try again`
- `Contact support`

## 5.3 Validation message style

Validation should be specific and local.

Examples:

- `Enter an amount greater than 0.`
- `Select a network to continue.`
- `Upload the front side of your document.`
- `This email address is already in use.`
- `Enter a valid wallet address.`

## 5.4 Waiting-state language

Use reassuring and operational language.

Examples:

- `Your payment has been submitted and is waiting for review.`
- `Your documents are being reviewed.`
- `This step may take a few minutes.`
- `We will notify you as soon as the status changes.`

## 6. Screen copy specifications

## 6.1 Screen: Home / Exchange Entry

### Hero

**Headline options:**

- `Buy and sell cryptocurrency with a clear step-by-step process`
- `Exchange fiat and crypto with transparent status tracking`
- `A simple exchange flow for buying and selling cryptocurrency`

**Supporting text:**

- `Track each stage of your exchange, from quote to confirmation.`
- `Complete verification, connect your wallet, and follow the status of your order in one place.`

**Primary CTA:**

- `Start exchange`
- `Get quote`

**Secondary CTA:**

- `How it works`

### Quick exchange widget labels

- `You pay`
- `You receive`
- `Payment method`
- `Network`
- `Exchange direction`

### Widget helper text

- `Rates are fixed for a limited time after a quote is created.`
- `Verification may be required before some exchanges can continue.`

## 6.2 Screen: Quote Builder

### Page title

- `Create exchange quote`
- `Set up your exchange`

### Section labels

- `Choose exchange direction`
- `Enter amount`
- `Select asset`
- `Select network`
- `Choose payment method`
- `Quote summary`

### Quote summary labels

- `Rate`
- `Fee`
- `You pay`
- `You receive`
- `Quote expires in`

### Quote states

**Loading:**

- `Calculating quote...`

**Expired:**

- `This quote has expired.`
- `Get a new quote to continue.`

**Unsupported pair:**

- `This exchange direction is currently unavailable.`

**KYC blocked:**

- `Identity verification is required before you can continue.`

### CTA copy

- `Continue`
- `Sign in to continue`
- `Verify identity to continue`

## 6.3 Screen: Sign in / Sign up

### Sign in tab

- Title: `Sign in`
- Subtitle: `Access your account to continue your exchange and track orders.`
- Email label: `Email`
- Password label: `Password`
- Primary CTA: `Sign in`
- Secondary link: `Forgot password?`

### Sign up tab

- Title: `Create account`
- Subtitle: `Create an account to manage exchanges, wallets, receipts, and notifications.`
- Email label: `Email`
- Password label: `Password`
- Phone label: `Phone number`
- Primary CTA: `Create account`

### Error states

- `Incorrect email or password.`
- `This account is not available right now.`
- `Check your email to continue verification.`

## 6.4 Screen: Verification Gate

### Title options

- `Identity verification required`
- `Complete verification to continue`

### Body copy

- `To continue this exchange, identity verification is required.`
- `Verification helps protect payments, transfers, and account security.`

### Checklist intro

- `Prepare the following before you start:`

### Checklist items

- `A valid identity document`
- `A clear photo or scan of the document`
- `A selfie or additional proof if requested`

### CTA copy by state

- Required: `Start verification`
- In review: `View verification status`
- Rejected: `Review and resubmit`
- Approved: `Continue`

## 6.5 Screen: Verification Form & Upload

### Step labels

- `Identity details`
- `Address`
- `Document`
- `Review`

### Field labels

- `First name`
- `Last name`
- `Date of birth`
- `Country of residence`
- `Address`
- `Document type`
- `Document number`

### Upload tile labels

- `Front side of document`
- `Back side of document`
- `Selfie`
- `Proof of address`

### Upload helper text

- `Upload a clear image with all details visible.`
- `Supported formats: JPG, PNG, PDF.`

### Submission copy

- `Review your information before submitting.`
- `By submitting, you confirm that the information is accurate.`

### CTA copy

- `Continue`
- `Submit verification`

### Success message

- `Your verification has been submitted.`
- `We will notify you when the review is complete.`

## 6.6 Screen: Wallet / Destination Setup

### Titles

- `Select wallet`
- `Add wallet`
- `Choose destination details`

### Labels

- `Wallet label`
- `Wallet address`
- `Exchange account`
- `Network`
- `Set as default`

### Helper text

- `Make sure the selected network matches the destination address.`
- `Incorrect network details may lead to loss of funds.`

### Validation and warning copy

- `Enter a valid wallet address.`
- `This wallet is already saved.`
- `This wallet is waiting for verification.`
- `This wallet was rejected. Review the details and try again.`

### CTA copy

- `Save wallet`
- `Continue with this wallet`

## 6.7 Screen: Order Review / Confirmation

### Title

- `Review your exchange`

### Section headings

- `Exchange summary`
- `Destination details`
- `Verification status`
- `Confirm and continue`

### Checkbox / acknowledgment text

- `I confirm that the destination details are correct.`
- `I understand that exchange rates may change if the quote expires before confirmation.`

### CTA copy

- `Confirm order`
- `Edit details`

### Error states

- `The quote expired before the order was confirmed.`
- `Complete verification before continuing.`

## 6.8 Screen: Payment Instructions (Buy flow)

### Title

- `Complete payment`

### Instruction labels

- `Amount to pay`
- `Payment method`
- `Recipient details`
- `Reference`

### Helper text

- `Send the exact amount shown below.`
- `After payment, submit confirmation so the order can be reviewed.`
- `Manual review may be required before the next step begins.`

### Evidence section

- Title: `Submit payment confirmation`
- Input label: `Payment reference`
- Upload label: `Upload payment proof`

### CTA copy

- `Submit payment`
- `I completed the payment`

### State copy

- `Awaiting your payment`
- `Payment submitted`
- `Payment under review`
- `Payment confirmation was rejected`

### Rejection message

- `We could not confirm this payment with the submitted details.`
- `Review the information and submit confirmation again.`

## 6.9 Screen: Crypto Transfer Instructions (Sell flow)

### Title

- `Send cryptocurrency`

### Instruction labels

- `Asset`
- `Network`
- `Destination address`
- `Required amount`
- `Memo / tag`

### Helper text

- `Send the exact asset and amount shown below.`
- `Use the correct network before confirming the transfer.`

### Confirmation block

- Input label: `Transaction hash`
- CTA: `I sent the transfer`
- Secondary CTA: `Upload proof`

### Warnings

- `Use only the network shown here.`
- `If a memo or tag is required, include it in the transfer.`

### State copy

- `Awaiting crypto transfer`
- `Transfer submitted`
- `Transfer under review`
- `Transfer confirmation was rejected`

## 6.10 Screen: Order Tracking Detail

### Title

- `Order details`

### Core labels

- `Order ID`
- `Exchange direction`
- `Current status`
- `Verification`
- `Payment status`
- `Transfer status`
- `Receipt`

### Timeline title

- `Exchange progress`

### Empty/Waiting timeline notes

- `Waiting for your action`
- `Waiting for review`
- `Waiting for confirmation`
- `Completed`

### Action block CTAs

- `Upload proof`
- `View receipt`
- `Contact support`
- `Start a new exchange`

## 6.11 Screen: Receipt / Completion

### Success title options

- `Exchange completed`
- `Your exchange is complete`

### Supporting text

- `The exchange has been completed successfully.`
- `You can download your receipt or return to your account.`

### Receipt block labels

- `Receipt status`
- `Receipt number`
- `Issued at`

### CTA copy

- `Download receipt`
- `Open receipt`
- `Go to order history`
- `Start another exchange`

### Pending receipt copy

- `Your receipt is being prepared.`
- `We will notify you when it becomes available.`

## 7. Customer cabinet copy specifications

## 7.1 Cabinet Dashboard

### Title

- `Account overview`

### Block titles

- `Active orders`
- `Recent orders`
- `Verification status`
- `Saved wallets`
- `Notifications`

### Empty states

- `You do not have any active orders yet.`
- `Your saved wallets will appear here.`
- `No new notifications.`

### Primary CTA

- `Start exchange`

## 7.2 Order History

### Title

- `Order history`

### Filters

- `Status`
- `Direction`
- `Date`
- `Asset`

### Empty state

- `No orders found.`
- `Try changing the filters or start a new exchange.`

## 7.3 Saved Wallets

### Title

- `Saved wallets`

### Empty state

- `You have not added any wallets yet.`
- `Add a wallet to speed up future exchanges.`

### CTA copy

- `Add wallet`
- `Edit wallet`
- `Set as default`

## 7.4 Profile & Verification

### Title

- `Profile and verification`

### Section headings

- `Profile details`
- `Verification status`
- `Latest verification request`

### Status messages

- `Your identity has been verified.`
- `Your verification is under review.`
- `Your verification requires changes.`

## 7.5 Notifications Center

### Title

- `Notifications`

### Empty state

- `There are no notifications right now.`

### Actions

- `View details`
- `Open order`
- `Mark as read`

## 8. Operator / admin copy specifications

## 8.1 Operator Queue Dashboard

### Page title

- `Operations queue`
- `Review queue`

### Summary cards

- `Orders awaiting review`
- `Verification requests`
- `Payments awaiting confirmation`
- `High-risk items`

### Filter labels

- `Queue type`
- `Status`
- `Direction`
- `Risk level`
- `Asset`
- `Date range`

### Empty state

- `No items match the selected filters.`

## 8.2 KYC Review Workspace

### Titles and labels

- `Verification review`
- `Applicant details`
- `Submitted information`
- `Uploaded files`
- `Internal notes`
- `Decision`

### Decision actions

- `Approve verification`
- `Reject verification`
- `Request resubmission`

### Review notes placeholders

- `Add an internal note`
- `Select a rejection reason`

## 8.3 Order Review Workspace

### Titles and labels

- `Order review`
- `Order summary`
- `Timeline`
- `Payment evidence`
- `Transfer evidence`
- `Wallet details`
- `Internal notes`

### Decision actions

- `Confirm payment`
- `Reject payment`
- `Confirm transfer`
- `Reject transfer`
- `Escalate`

### Locking / concurrency copy

- `This item is currently being reviewed by another operator.`
- `Refresh to load the latest status.`

## 8.4 Receipt / Notification Operations

### Titles and labels

- `Receipt operations`
- `Notification operations`
- `Failed items`
- `Delivery status`
- `Error details`

### Action copy

- `Retry`
- `Open related order`
- `View provider reference`

## 9. Error, warning, and support language patterns

## 9.1 Generic process-level errors

- `Something went wrong. Try again.`
- `The request could not be completed right now.`
- `Refresh the page and try again.`

## 9.2 Delays and review messages

- `This step is taking longer than usual.`
- `The order is still being reviewed.`
- `We will notify you when the status changes.`

## 9.3 Support prompts

- `Need help? Contact support.`
- `If this issue continues, contact support and include your order ID.`

## 10. Copy consistency checklist

The product team should verify that:

- the same status always uses the same label;
- customer-facing copy avoids unexplained internal jargon;
- warnings are clear and actionable;
- review states reduce uncertainty rather than create it;
- primary CTAs are concise and action-led;
- rejection and failure messages explain the next step whenever possible.

## 11. Deliverables expected from this spec

Based on this copy spec, the next artifacts can include:

- final UX writing pass for Figma screens;
- localized RU copy adaptation;
- error message catalog;
- notification template catalog;
- operator/admin internal language guide.