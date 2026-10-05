# Annotated Wireframe Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Derived reference
- Owner: Design + Product
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `screen-and-route-spec.md`
  - `design-system-ui-kit-spec.md`
- Related documents:
  - `figma-ready-component-inventory-spec.md`
  - `screen-by-screen-ux-copy-spec.md`

## 1. Purpose

This document defines annotated wireframe specifications for the key screens of TheBlack.Trade. It is intended to help product designers, frontend developers, backend developers, and QA align on screen structure, information hierarchy, functional zones, state requirements, and behavior before high-fidelity UI design and implementation.

The wireframe spec focuses on:

- main customer exchange flows;
- customer account/cabinet experience;
- KYC and wallet connection flows;
- order tracking and receipt access;
- operator/admin review interfaces.

## 2. Annotation format

For each screen, the spec describes:

- objective;
- primary user action;
- layout zones;
- component composition;
- critical states;
- behavior notes;
- backend/data dependencies.

## 3. Global wireframe principles

All screens should follow these rules:

- one dominant primary action at a time;
- clear status visibility;
- transactional data grouped into summary cards;
- user guidance visible near the moment of decision;
- sensitive or irreversible actions separated from normal actions;
- mobile flow should preserve linear progression.

## 4. Customer flow screens

## 4.1 Screen: Home / Exchange Entry

### Objective

Introduce the service, build trust, and move the user into the exchange flow quickly.

### Primary action

Start quote calculation.

### Layout zones

1. **Header**
   - Logo
   - Navigation links
   - Sign in / account action
   - Optional language switcher

2. **Hero block**
   - Primary value proposition
   - Supporting trust statement
   - Primary CTA
   - Secondary CTA to learn how the process works

3. **Quick exchange widget**
   - Buy/Sell switcher
   - Amount input
   - Asset selector
   - Fiat/crypto direction display
   - CTA: continue / get quote

4. **How it works strip**
   - 3–5 simplified process steps

5. **Trust / compliance section**
   - KYC note
   - Payment / legal / receipt handling note
   - Support availability

6. **Footer**
   - Legal links
   - Contact/support links

### Critical states

- quote widget default;
- invalid amount;
- service unavailable banner;
- KYC required disclosure visible.

### Backend/data dependencies

- public asset list;
- enabled exchange directions;
- public settings;
- support contacts.

## 4.2 Screen: Quote Builder

### Objective

Allow the user to configure the exchange and receive a valid quote.

### Primary action

Generate quote or proceed with current quote.

### Layout zones

1. **Top bar / breadcrumbs**
   - Back action
   - Flow title
   - Optional auth/account shortcut

2. **Main configuration panel**
   - Buy/Sell switcher
   - You pay field
   - You receive field
   - Asset selector
   - Network selector if applicable
   - Payment or payout method selector

3. **Quote details card**
   - Rate
   - Fee
   - Approximate receive/send amount
   - Quote expiry timer

4. **Validation / info area**
   - Minimum/maximum limits
   - KYC requirement notice
   - Network warning if relevant

5. **Bottom CTA area**
   - Primary CTA: continue
   - Secondary CTA: sign in / create account if required

### Critical states

- idle before quote;
- loading quote;
- quote ready;
- quote expired;
- unsupported pair;
- KYC blocked;
- network mismatch warning.

### Backend/data dependencies

- quotes;
- assets;
- networks;
- fee/limit rules through quote service;
- public policy flags.

## 4.3 Screen: Authentication / Registration

### Objective

Authenticate the user or create an account with minimum friction before entering protected flow stages.

### Primary action

Sign in or create account.

### Layout zones

1. **Auth card container**
   - Sign in / sign up tabs
   - Email input
   - Password input
   - Optional phone field for sign up
   - Primary submit CTA
   - Forgot password link

2. **Supporting trust content**
   - Why account is needed
   - Privacy/security note

3. **Validation area**
   - Inline errors
   - General auth error block

### Critical states

- sign in;
- sign up;
- password reset prompt;
- email verification pending;
- auth failed.

### Backend/data dependencies

- auth service;
- directus users;
- optional notification triggers.

## 4.4 Screen: KYC Gate

### Objective

Stop the flow at the correct point and clearly explain why KYC is required.

### Primary action

Start or continue KYC.

### Layout zones

1. **Status banner**
   - KYC required/in review/rejected state

2. **Reason block**
   - Short explanation of why verification is required
   - Expected processing time

3. **Requirements checklist**
   - Required document types
   - Selfie / proof of address note if needed

4. **CTA block**
   - Start KYC
   - Continue submission
   - View rejection reason / resubmit

### Critical states

- required;
- in review;
- approved;
- rejected;
- resubmission required.

### Backend/data dependencies

- user profile;
- kyc application status;
- configurable KYC policy text.

## 4.5 Screen: KYC Form & Upload

### Objective

Collect identity information and verification files.

### Primary action

Submit KYC application.

### Layout zones

1. **Stepper / section navigation**
   - Identity
   - Address
   - Document
   - Review

2. **Form section**
   - Personal data inputs
   - Address fields
   - Document details

3. **Upload section**
   - Front document tile
   - Back document tile
   - Selfie tile
   - Proof of address tile if required

4. **Review summary area**
   - Collected data summary
   - Submission acknowledgment checkbox if required

5. **Footer CTA bar**
   - Save draft if supported
   - Continue
   - Submit

### Critical states

- draft;
- section validation error;
- upload in progress;
- upload failed;
- submission loading;
- submission success.

### Backend/data dependencies

- kyc application record;
- directus file upload;
- document metadata;
- validation rules.

## 4.6 Screen: Wallet / Destination Setup

### Objective

Let the user choose or create the destination/source wallet or exchange account relevant to the flow.

### Primary action

Select or save wallet/destination.

### Layout zones

1. **Saved wallets list**
   - Wallet cards
   - Default marker
   - Verification status

2. **Add new wallet block**
   - Manual address mode
   - Exchange account mode if supported
   - Label field
   - Address/account input
   - Network selector

3. **Warnings area**
   - Network mismatch notice
   - Verification pending notice

4. **CTA area**
   - Save wallet
   - Continue with selected wallet

### Critical states

- no saved wallets;
- wallet selected;
- wallet validation error;
- verification pending;
- rejected wallet;
- duplicate wallet warning.

### Backend/data dependencies

- wallet connections;
- asset/network list;
- validation response;
- verification status.

## 4.7 Screen: Order Review / Confirmation

### Objective

Let the user confirm the final parameters before creating or advancing the order.

### Primary action

Confirm and create order.

### Layout zones

1. **Quote summary card**
   - Pay amount
   - Receive amount
   - Fee
   - Rate
   - Expiry

2. **Wallet / payout summary**
   - Selected destination/source
   - Network
   - Masked address/account

3. **KYC / account readiness block**
   - Verification state
   - Missing prerequisites if any

4. **Terms acknowledgment area**
   - Required confirmations / checkboxes

5. **Action footer**
   - Edit details
   - Confirm order

### Critical states

- ready to confirm;
- quote expired;
- missing prerequisite;
- order creation loading;
- order creation failed.

### Backend/data dependencies

- active quote;
- selected wallet connection;
- user profile;
- KYC status;
- order create endpoint.

## 4.8 Screen: Payment Instructions (Buy flow)

### Objective

Show the user how to pay and how to submit payment confirmation.

### Primary action

Submit payment evidence.

### Layout zones

1. **Order header**
   - Order ID
   - Current status badge
   - Expiry / timing note if applicable

2. **Payment instructions card**
   - Amount to pay
   - Payment method
   - Recipient requisites
   - Important transfer notes

3. **Evidence submission block**
   - Transaction reference input if needed
   - File upload / screenshot upload
   - Submit confirmation button

4. **Process tracker**
   - Current order stage

5. **Support/help block**
   - What to do if payment is delayed

### Critical states

- awaiting payment;
- payment submitted;
- under review;
- rejected evidence;
- payment expired.

### Backend/data dependencies

- order;
- payment record;
- payment record files;
- timeline events;
- notification triggers.

## 4.9 Screen: Crypto Transfer Instructions (Sell flow)

### Objective

Show the user where and how to send crypto for a sell order.

### Primary action

Submit transfer evidence or mark transfer sent.

### Layout zones

1. **Order header**
   - Order ID
   - Current status

2. **Transfer instructions card**
   - Asset
   - Network
   - Deposit address
   - Memo/tag if required
   - Required amount

3. **Transfer confirmation block**
   - TX hash input if supported
   - Confirmation button
   - Optional proof upload

4. **Warnings panel**
   - Network mismatch warning
   - Memo missing warning

5. **Process tracker**
   - Stage progression

### Critical states

- awaiting transfer;
- transfer submitted;
- under review;
- transfer rejected;
- timeout/expired.

### Backend/data dependencies

- order;
- payment record or transfer record equivalent;
- asset network configuration;
- timeline events.

## 4.10 Screen: Order Tracking Detail

### Objective

Provide the single source of truth for a user’s order and its current stage.

### Primary action

Follow next required action or view completion artifacts.

### Layout zones

1. **Detail header**
   - Order ID
   - Buy/Sell badge
   - Main status badge
   - Secondary actions if available

2. **Status summary matrix**
   - KYC status
   - Payment/transfer status
   - Exchange status
   - Receipt status

3. **Timeline / process tracker**
   - Completed stages
   - Current stage
   - Waiting states
   - Failure/rework state if any

4. **Order financial summary**
   - Input amount
   - Output amount
   - Fees
   - Timestamp information

5. **Action block**
   - Upload missing evidence
   - View receipt
   - Contact support

6. **Documents/receipt block**
   - Receipt card
   - Related files

### Critical states

- active processing;
- manual review;
- action required;
- completed;
- rejected;
- canceled;
- expired.

### Backend/data dependencies

- orders;
- order timeline events;
- payment records;
- receipts;
- notifications or support hooks.

## 4.11 Screen: Receipt / Completion

### Objective

Show final completion state and provide access to receipt or proof documents.

### Primary action

Download/open receipt or return to cabinet.

### Layout zones

1. **Completion header**
   - Success state
   - Completion summary

2. **Final amounts card**
   - Paid / received amounts
   - Fee
   - Completion timestamp

3. **Receipt card**
   - Receipt availability
   - Download/open action
   - Pending issuance fallback state

4. **Follow-up actions**
   - Create another exchange
   - Go to order history

### Critical states

- receipt available;
- receipt pending;
- receipt failed.

### Backend/data dependencies

- order;
- receipts;
- notifications.

## 5. Customer cabinet screens

## 5.1 Screen: Cabinet Dashboard

### Objective

Provide a high-level summary of the user’s activity and shortcuts to important actions.

### Primary action

Start a new exchange or continue an active order.

### Layout zones

1. **Welcome / account summary**
2. **Active orders block**
3. **Recent orders block**
4. **KYC status card**
5. **Saved wallets block**
6. **Notifications preview**

### Critical states

- no activity;
- active order present;
- KYC missing;
- notifications unread.

### Backend/data dependencies

- user profile;
- orders;
- KYC summary;
- wallets;
- notifications.

## 5.2 Screen: Order History List

### Objective

Allow the user to browse previous and current orders.

### Primary action

Open order detail.

### Layout zones

1. **Filter bar**
   - status filter
   - side filter
   - date filter
   - asset filter if needed

2. **Orders list/table**
   - order rows with summary info

3. **Pagination / load more area**

### Critical states

- populated list;
- empty;
- filtered no results;
- loading.

### Backend/data dependencies

- orders list endpoint;
- filtering/sorting params.

## 5.3 Screen: Saved Wallets

### Objective

Manage wallet connections and payout/destination records.

### Primary action

Add or edit wallet/destination.

### Layout zones

1. **Header actions**
   - Add new wallet

2. **Wallet list**
   - Wallet cards
   - Verification status
   - Default marker

3. **Detail / edit panel**
   - opens inline or in modal/drawer

### Critical states

- empty list;
- verification pending;
- rejected wallet;
- disabled wallet.

### Backend/data dependencies

- wallet connections.

## 5.4 Screen: Profile & Verification

### Objective

Show account profile and KYC progression.

### Primary action

Update profile or continue verification.

### Layout zones

1. **Profile card**
2. **KYC status panel**
3. **Verification history / latest application card**
4. **Action area**

### Critical states

- verified;
- pending;
- rejected;
- resubmission required.

### Backend/data dependencies

- user profile;
- KYC applications.

## 5.5 Screen: Notifications Center

### Objective

Show important communication and system updates.

### Primary action

Open related order/context.

### Layout zones

1. **Notification list**
2. **Unread/read filtering**
3. **Notification detail preview**

### Critical states

- unread notifications;
- empty;
- loading.

### Backend/data dependencies

- notifications.

## 6. Operator / admin screens

## 6.1 Screen: Operator Queue Dashboard

### Objective

Give operators a fast overview of pending operational work.

### Primary action

Open a queue item for review.

### Layout zones

1. **Header summary cards**
   - orders pending review
   - KYC pending review
   - payment confirmations pending
   - high-risk items

2. **Filter bar**
   - queue type
   - status
   - side
   - risk
   - asset/network
   - date range

3. **Main queue table**
   - sortable rows
   - badges
   - timestamps
   - quick actions if allowed

4. **Split detail panel or drawer**
   - selected item preview

### Critical states

- empty queue;
- queue with SLA breaches;
- filtered results;
- loading.

### Backend/data dependencies

- orders;
- KYC applications;
- payment records;
- wallet verification statuses;
- risk metadata.

## 6.2 Screen: KYC Review Workspace

### Objective

Allow an operator or compliance user to review and decide on a KYC application.

### Primary action

Approve, reject, or request resubmission.

### Layout zones

1. **Applicant summary**
   - user basics
   - risk markers
   - submission time

2. **KYC data panel**
   - entered identity data
   - address details
   - document details

3. **File evidence panel**
   - front/back/selfie/proof tiles

4. **Internal notes block**

5. **Decision action bar**
   - approve
   - reject
   - request resubmission

### Critical states

- ready for review;
- loading files;
- decision submitting;
- conflict / already reviewed.

### Backend/data dependencies

- KYC application;
- files;
- user profile;
- operator actions.

## 6.3 Screen: Order Review Workspace

### Objective

Allow operator/compliance review of order progression and evidence.

### Primary action

Confirm or reject the relevant step.

### Layout zones

1. **Order summary header**
2. **Timeline panel**
3. **Financial summary**
4. **Payment / transfer evidence panel**
5. **Wallet / destination panel**
6. **Internal notes**
7. **Decision action bar**

### Critical states

- awaiting payment review;
- awaiting transfer review;
- under manual escalation;
- locked by another operator;
- completed.

### Backend/data dependencies

- order;
- timeline;
- payment records;
- wallet connections;
- operator actions.

## 6.4 Screen: Receipt / Notification Operations

### Objective

Allow admins or service operators to inspect failed receipts or communication attempts.

### Primary action

Retry or diagnose failure.

### Layout zones

1. **Failure list/table**
2. **Selected item details**
3. **Error metadata block**
4. **Retry action area**

### Critical states

- failed receipt;
- failed email;
- retry in progress;
- resolved.

### Backend/data dependencies

- receipts;
- notifications;
- system settings;
- provider references.

## 7. Cross-screen behavior notes

## 7.1 Status consistency

The same domain statuses must map to the same badge semantics, labels, and ordering across all customer and operator screens.

## 7.2 Action gating

Actions must be hidden or disabled based on:

- auth state;
- KYC state;
- quote validity;
- order state;
- wallet verification state;
- role permissions.

## 7.3 Error strategy

Errors should be shown:

- inline for field-level issues;
- as alert blocks for process-level issues;
- as persistent banners when the entire step is blocked.

## 7.4 Mobile adaptation

On mobile:

- complex side-by-side layouts become stacked sections;
- split view becomes sequential view or full-screen sheets;
- persistent CTA may move to sticky bottom bar;
- tables become cards or simplified rows.

## 8. Deliverables expected from this spec

Based on this wireframe spec, the design team should be able to produce:

- low-fidelity wireframes;
- mid-fidelity product flows;
- annotated Figma frames;
- edge-state coverage for critical screens;
- frontend-ready screen breakdown by zones and components.