# Figma-ready Component Inventory Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Derived reference
- Owner: Design + Frontend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `design-system-ui-kit-spec.md`
- Related documents:
  - `annotated-wireframe-spec.md`
  - `screen-and-route-spec.md`

## 1. Purpose

This document defines a Figma-ready component inventory for TheBlack.Trade. It translates the Design System / UI Kit into a concrete list of reusable components, variants, states, properties, and composition rules that a product designer can structure directly inside a Figma library.

The goal is to make the component system implementation-ready for both design and frontend teams, while covering customer-facing flows, cabinet screens, and operator/admin interfaces.

## 2. Structure of the Figma library

Recommended top-level library structure:

- Foundations
- Tokens
- Icons
- Primitives
- Navigation
- Status
- Forms
- Exchange Flow
- KYC
- Wallets & Requisites
- Orders & Timeline
- Notifications & Receipts
- Tables & Admin
- Layout & Templates
- Edge States

## 3. Naming convention

Recommended naming format:

`Category / Component / Variant / State`

Examples:

- `Button / Primary / Default`
- `Badge / Status / Review`
- `Input / Amount / Focused`
- `Order Tracker / Step / Current`
- `Queue Table / Row / Selected`

Rules:

- use singular component nouns;
- keep naming predictable and non-page-specific;
- do not encode temporary business copy in component names;
- use slot/property names for dynamic content instead of duplicating frames.

## 4. Component readiness levels

Each component should be tagged in Figma with one of the following readiness labels:

- `Core`
- `MVP`
- `Extended`
- `Admin`
- `Future`

Meaning:

- `Core` — foundation components required almost everywhere;
- `MVP` — required to ship first working version;
- `Extended` — important but not first-wave;
- `Admin` — primarily operational/backoffice use;
- `Future` — not required for initial release.

## 5. Foundations inventory

## 5.1 Color styles / tokens

Required token groups:

- Background
- Surface
- Text
- Border
- Action
- Status
- Overlay

Suggested Figma color style names:

- `Color / Bg / Default`
- `Color / Bg / Subtle`
- `Color / Surface / Card`
- `Color / Surface / Elevated`
- `Color / Text / Primary`
- `Color / Text / Secondary`
- `Color / Text / Inverse`
- `Color / Border / Default`
- `Color / Border / Strong`
- `Color / Action / Primary`
- `Color / Action / Primary Hover`
- `Color / Status / Success`
- `Color / Status / Warning`
- `Color / Status / Error`
- `Color / Status / Info`
- `Color / Status / Review`

## 5.2 Text styles

Required text styles:

- `Text / Display / L`
- `Text / Heading / XL`
- `Text / Heading / L`
- `Text / Heading / M`
- `Text / Body / L`
- `Text / Body / M`
- `Text / Body / S`
- `Text / Label / M`
- `Text / Label / S`
- `Text / Mono / Amount`
- `Text / Mono / Table`

## 5.3 Effects and radius tokens

Required effect tokens:

- `Effect / Elevation / 0`
- `Effect / Elevation / 1`
- `Effect / Elevation / 2`
- `Effect / Overlay / Scrim`

Required radius tokens:

- `Radius / SM`
- `Radius / MD`
- `Radius / LG`
- `Radius / XL`
- `Radius / Pill`

## 5.4 Spacing references

Spacing should be implemented through Auto Layout values matching token usage:

- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40
- 48
- 64

## 6. Primitive components

## 6.1 Button

Component name:

`Button`

Variants:

- Type: `Primary`, `Secondary`, `Ghost`, `Danger`, `Success`, `Text`
- Size: `SM`, `MD`, `LG`
- State: `Default`, `Hover`, `Pressed`, `Focus`, `Disabled`, `Loading`
- Icon: `None`, `Leading`, `Trailing`, `Only`

Properties:

- label text
- leading icon toggle
- trailing icon toggle
- full width toggle
- loading toggle

Rules:

- icon-only buttons require tooltip pairing in specs;
- loading variant must keep fixed width;
- danger buttons should never be default primary CTA on screen.

## 6.2 Link Button / Inline Action

Variants:

- Type: `Primary`, `Muted`, `Danger`
- State: `Default`, `Hover`, `Focus`, `Disabled`
- Icon: `None`, `Leading`, `Trailing`

## 6.3 Input / Text

Component name:

`Input / Text`

Variants:

- Size: `SM`, `MD`, `LG`
- State: `Default`, `Hover`, `Focus`, `Filled`, `Error`, `Disabled`, `Readonly`
- Prefix: `None`, `Icon`, `Static text`
- Suffix: `None`, `Icon`, `Button`, `Text`

Slots/properties:

- label
- placeholder
- helper text
- error text
- value

## 6.4 Input / Amount

Critical for exchange flow.

Variants:

- State: `Default`, `Focus`, `Filled`, `Error`, `Disabled`
- Side: `Buy`, `Sell`
- Mode: `Fiat`, `Crypto`

Required slots:

- amount value
- asset symbol
- asset selector trigger
- secondary converted value
- helper text
- warning text

## 6.5 Textarea

Variants:

- State: `Default`, `Focus`, `Error`, `Disabled`
- Resize: `Fixed`, `Grow`

## 6.6 Select

Variants:

- Type: `Default`, `Searchable`, `Asset`, `Network`, `Method`
- State: `Closed`, `Open`, `Selected`, `Error`, `Disabled`
- Size: `SM`, `MD`, `LG`

Subcomponents:

- trigger
- option row
- search field
- empty results row
- group label

## 6.7 Checkbox

Variants:

- State: `Unchecked`, `Checked`, `Indeterminate`, `Disabled`

## 6.8 Radio

Variants:

- State: `Unchecked`, `Checked`, `Disabled`

## 6.9 Toggle / Switch

Variants:

- State: `Off`, `On`, `Disabled`

## 6.10 Tabs / Segmented Control

Variants:

- Type: `Underline Tabs`, `Pill Tabs`, `Segmented`
- State: `Default`, `Active`, `Hover`, `Disabled`
- Size: `SM`, `MD`

Use cases:

- buy/sell switch;
- cabinet sections;
- operator queue filters.

## 6.11 Badge / Status Pill

Variants:

- Type: `Neutral`, `Info`, `Review`, `Warning`, `Success`, `Error`
- Style: `Soft`, `Solid`, `Outlined`
- Size: `SM`, `MD`

Properties:

- label
- icon toggle

## 6.12 Avatar / User Chip

Variants:

- Type: `Initials`, `Image`, `Operator`
- Size: `XS`, `SM`, `MD`

## 6.13 Divider

Variants:

- Orientation: `Horizontal`, `Vertical`
- Style: `Default`, `Strong`, `Subtle`

## 6.14 Tooltip

Variants:

- Type: `Default`, `Info`, `Warning`
- Placement: `Top`, `Bottom`, `Left`, `Right`

## 6.15 Spinner / Progress Indicator

Variants:

- Type: `Inline`, `Block`, `Button`
- Size: `SM`, `MD`, `LG`

## 7. Navigation components

## 7.1 Header

Variants:

- Surface: `Marketing`, `App`, `Admin`
- State: `Default`, `Scrolled`

Slots:

- logo
- primary nav
- account actions
- theme toggle if needed

## 7.2 Sidebar

Variants:

- Context: `Cabinet`, `Admin`
- State: `Expanded`, `Collapsed`

Subcomponents:

- nav item
- nav section label
- status counter badge

## 7.3 Breadcrumbs

Variants:

- Length: `2`, `3`, `4+`

## 7.4 Mobile bottom action bar

Variants:

- Type: `Single CTA`, `Dual Action`

## 8. Feedback and messaging components

## 8.1 Alert / Inline Message

Variants:

- Type: `Info`, `Review`, `Warning`, `Success`, `Error`
- Density: `Comfortable`, `Compact`
- Action: `None`, `Single action`, `Dismissible`

Use cases:

- manual review notice;
- quote expired;
- KYC required;
- receipt issued;
- payout delayed.

## 8.2 Toast

Variants:

- Type: `Info`, `Success`, `Warning`, `Error`
- Duration: `Auto`, `Persistent`

## 8.3 Empty State

Variants:

- Context: `No orders`, `No wallets`, `No notifications`, `No search results`

Slots:

- illustration/icon
- title
- description
- primary action
- secondary action

## 8.4 Skeleton Loader

Variants:

- Type: `Text`, `Card`, `Table Row`, `Detail Panel`, `Timeline`

## 9. Form composition components

## 9.1 Field Row

Variants:

- Layout: `Single`, `Two-column`, `Label-left`

## 9.2 Field Group

Variants:

- Type: `Default`, `Card`, `Sectioned`

Use for:

- KYC identity block;
- payout details;
- wallet details.

## 9.3 Validation Summary

Variants:

- Type: `Error`, `Warning`, `Success`

## 10. Exchange Flow components

## 10.1 Buy/Sell Switcher

Component name:

`Exchange Switcher`

Variants:

- Active side: `Buy`, `Sell`
- Style: `Segmented`, `Card tabs`

## 10.2 Quote Builder

Composite contains:

- amount input;
- asset selector;
- network selector when needed;
- payment/payout method selector;
- fee summary;
- rate display;
- primary CTA.

Variants:

- Flow: `Buy`, `Sell`
- State: `Editing`, `Ready`, `Loading`, `Error`, `KYC blocked`

## 10.3 Quote Summary Card

Variants:

- Flow: `Buy`, `Sell`
- State: `Fresh`, `Expiring`, `Expired`

Slots:

- pay amount
- receive amount
- fee
- rate
- expiry timer

## 10.4 Quote Expiry Timer

Variants:

- State: `Normal`, `Warning`, `Expired`
- Format: `Inline`, `Badge`, `Card row`

## 10.5 Order Review Summary

Variants:

- Flow: `Buy`, `Sell`
- State: `Editable`, `Locked`

## 10.6 Step Tracker

A primary product component.

Variants:

- Orientation: `Horizontal`, `Vertical`
- Density: `Compact`, `Detailed`
- Step state: `Upcoming`, `Current`, `Completed`, `Blocked`, `Needs Action`, `Failed`

Subcomponents:

- step node
- connector
- step label
- optional timestamp
- optional note

## 11. KYC components

## 11.1 KYC Gate Banner

Variants:

- State: `Required`, `In Review`, `Approved`, `Rejected`, `Resubmission Required`

## 11.2 Document Upload Tile

Variants:

- File type: `Front`, `Back`, `Selfie`, `Proof of Address`
- State: `Empty`, `Uploading`, `Uploaded`, `Error`, `Rejected`

## 11.3 KYC Form Section

Variants:

- Section: `Identity`, `Address`, `Document`, `Review`

## 11.4 Resubmission Prompt

Variants:

- Type: `Inline`, `Modal`, `Banner`

## 12. Wallets & requisites components

## 12.1 Wallet Card

Variants:

- Type: `Wallet Address`, `Exchange Account`
- State: `Default`, `Selected`, `Verification Pending`, `Verified`, `Rejected`, `Disabled`

Slots:

- provider icon
- label
- masked address/account
- asset/network badges
- default marker
- status badge

## 12.2 Wallet Selector List

Variants:

- State: `Default`, `Selection Mode`, `Empty`

## 12.3 Add Wallet Flow Block

Variants:

- Type: `Manual Address`, `Exchange Account`
- State: `Editing`, `Validation`, `Success`, `Error`

## 12.4 Network Warning Block

Variants:

- Severity: `Info`, `Warning`, `Error`

## 12.5 Payout Details Card

Variants:

- Method: `SBP`, `Bank Card`, `Bank Transfer`
- State: `Default`, `Selected`, `Invalid`, `Masked`

## 13. Orders & timeline components

## 13.1 Order Row

Variants:

- Context: `Cabinet list`, `Admin list`
- State: `Default`, `Hover`, `Selected`, `Critical`, `Completed`

Required slots:

- order id
- side
- pair
- amount
- status
- created at
- actions

## 13.2 Order Summary Card

Variants:

- Flow: `Buy`, `Sell`
- State: `Active`, `Completed`, `Rejected`, `Canceled`, `Expired`

## 13.3 Timeline Event Row

Variants:

- Type: `System`, `User`, `Operator`
- Visibility: `Public`, `Internal`
- State: `Normal`, `Highlighted`, `Problem`

## 13.4 Status Matrix Block

Purpose:

Used in detail screens to display grouped current statuses such as KYC, payment, crypto transfer, receipt, and support state.

Variants:

- Density: `Compact`, `Detailed`

## 14. Notifications & receipts components

## 14.1 Notification Row

Variants:

- Type: `Info`, `Success`, `Warning`, `Error`
- State: `Unread`, `Read`

## 14.2 Notification Center Panel

Variants:

- State: `Populated`, `Empty`, `Loading`

## 14.3 Receipt Card

Variants:

- State: `Pending`, `Issued`, `Failed`
- Action: `Download`, `Open`, `Retry`, `Unavailable`

## 14.4 Receipt Status Banner

Variants:

- State: `Pending`, `Available`, `Failed`

## 15. Tables & admin components

## 15.1 Queue Table

Variants:

- Context: `Orders`, `KYC`, `Payments`, `Wallet Reviews`, `Support`
- Density: `Comfortable`, `Compact`
- State: `Default`, `Filtered`, `Loading`, `Empty`

Subcomponents:

- table header row
- sortable column header
- row checkbox
- row status cell
- inline actions cell
- pagination footer

## 15.2 Filter Bar

Variants:

- Density: `Comfortable`, `Compact`
- State: `Collapsed`, `Expanded`

Required parts:

- search field
- status filter
- side filter
- risk filter
- asset filter
- date range
- reset action
- save preset action

## 15.3 Review Drawer

Variants:

- Context: `Order`, `KYC`, `Payment`, `Wallet`
- State: `Default`, `Loading`, `Decision mode`

Required sections:

- summary
- evidence
- timeline
- internal notes
- action footer

## 15.4 Detail Panel

Variants:

- Context: `Right rail`, `Bottom sheet`, `Standalone`

## 15.5 Internal Comment Block

Variants:

- State: `Empty`, `Filled`, `Adding`, `Disabled`

## 15.6 Decision Action Bar

Variants:

- Context: `KYC`, `Payment`, `Wallet`, `Order`
- State: `Idle`, `Submitting`, `Locked`

Required actions:

- approve / confirm;
- reject;
- request clarification;
- escalate.

## 16. Layout & template components

## 16.1 Page Section

Variants:

- Width: `Narrow`, `Default`, `Wide`, `Full`
- Surface: `Transparent`, `Subtle`, `Carded`

## 16.2 Detail Header

Variants:

- Context: `Order`, `Wallet`, `KYC`, `Receipt`

Slots:

- title
- id/meta
- status badges
- secondary actions

## 16.3 Split View Shell

Variants:

- Context: `Admin Queue`, `Cabinet Summary`
- Ratio: `40/60`, `50/50`, `60/40`

## 16.4 Mobile Flow Shell

Variants:

- Step mode: `Single Step`, `Stepper`, `Review`

## 17. Edge state components

## 17.1 Error State Panel

Variants:

- Type: `Network`, `Validation`, `Permission`, `Expired Quote`, `Unknown`

## 17.2 Locked State Panel

Use cases:

- action unavailable;
- awaiting manual review;
- KYC missing;
- market unavailable.

## 17.3 Maintenance Banner

Variants:

- Severity: `Info`, `Warning`, `Critical`

## 18. Required properties and variables policy

All major Figma components should use component properties where possible:

- text properties for labels and values;
- boolean properties for icon/secondary text toggles;
- instance swaps for icons and illustrations;
- variant properties for state/type/size;
- exposed nested instances for status badges and CTA rows.

Avoid creating separate duplicate components when a property-based structure is sufficient.

## 19. Auto Layout guidance

All reusable components should be built with Auto Layout.

Rules:

- text should resize predictably;
- badges and pills should hug content;
- cards should support variable content heights;
- action rows should preserve spacing consistency;
- table row components should define min heights and overflow strategy.

## 20. Figma QA checklist

Each component should be checked for:

- variant completeness;
- naming consistency;
- Auto Layout correctness;
- token usage instead of ad hoc styling;
- responsive logic where applicable;
- edge states included;
- disabled/loading/error states present;
- implementation plausibility for frontend.

## 21. MVP library priority order

Build Figma library in this order:

1. Foundations and tokens.
2. Buttons, inputs, selects, badges, alerts.
3. Quote builder, amount input, buy/sell switcher.
4. Wallet cards, wallet selectors, payout cards.
5. Step tracker, quote summary, order summary.
6. KYC upload and review components.
7. Receipt and notification components.
8. Queue table, filter bar, review drawer.
9. Layout shells and templates.
10. Edge and error states.

## 22. Deliverables from this inventory

A designer should be able to create from this spec:

- a structured Figma component library;
- a tokenized design foundations file;
- reusable flow kits for quote/KYC/order tracking;
- admin queue and review patterns;
- implementation-ready annotated mockups for frontend.