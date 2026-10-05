# Design System / UI Kit Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Design + Frontend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `screen-and-route-spec.md`
- Related documents:
  - `figma-ready-component-inventory-spec.md`
  - `annotated-wireframe-spec.md`
  - `frontend-integration-spec.md`

## 1. Purpose

This document defines the Design System and UI Kit specification for TheBlack.Trade. Its purpose is to ensure a consistent, scalable, and implementation-ready visual language for the customer-facing product, operator/admin interfaces, and reusable frontend components across web and responsive views.

The system must support:

- a trustworthy financial product aesthetic;
- clear step-by-step exchange flows;
- excellent readability for transactional and status-heavy screens;
- efficient implementation in Astra frontend;
- consistency between client cabinet, exchange flow, and operational backoffice surfaces.

## 2. Design principles

The design system should follow these principles:

### 2.1 Trust before novelty

The interface must look credible, calm, and financially reliable. Visual decisions should reduce anxiety and help users understand what is happening with their money and crypto.

### 2.2 State clarity

Because the product is driven by quotes, review stages, KYC gating, confirmations, and status transitions, every state must be visually distinct and easy to interpret.

### 2.3 Action hierarchy

Each screen should make the primary next action obvious. Secondary actions must remain accessible without visually competing with the main action.

### 2.4 Reusability

Components must be designed as reusable building blocks rather than one-off page-specific solutions.

### 2.5 Operator efficiency

Although the customer UI should feel polished and simple, operational interfaces should prioritize density, readability, fast scanning, and error prevention.

## 3. Product surfaces

The design system must support three main surfaces:

| Surface | Purpose | Tone |
|---|---|---|
| Customer marketing/product UI | Landing, quote flow, auth, KYC, wallet linking, order tracking | Trustworthy, calm, guided |
| Customer cabinet | History, saved wallets, receipts, notifications, profile | Clean, structured, transparent |
| Operator/admin UI | Review queues, order processing, compliance actions, settings | Dense, efficient, controlled |

## 4. Brand direction

## 4.1 Visual character

Recommended brand direction:

- modern fintech;
- premium but restrained;
- calm rather than aggressive;
- transparent and process-oriented;
- minimal decorative noise.

The visual language should avoid:

- neon crypto aesthetics;
- speculative trader visuals;
- gaming-like gradients;
- excessive glassmorphism;
- dark-only interfaces.

## 4.2 Core emotional goals

The user should feel:

- safe;
- informed;
- in control;
- guided through the process;
- reassured when waiting for confirmation.

## 5. Color system

## 5.1 Semantic color roles

The color system must be semantic-first, not page-first.

Core semantic roles:

- `bg/default`
- `bg/subtle`
- `bg/elevated`
- `bg/brand`
- `text/default`
- `text/muted`
- `text/inverse`
- `border/default`
- `border/strong`
- `action/primary`
- `action/primary-hover`
- `action/secondary`
- `state/success`
- `state/warning`
- `state/error`
- `state/info`
- `state/review`

## 5.2 Recommended palette direction

Suggested palette family:

- neutral warm or cool-gray foundation;
- one primary accent in teal, blue-teal, or deep cyan range;
- restrained semantic colors for success, warning, error, and info;
- no reliance on vibrant purple-magenta crypto gradients.

## 5.3 Example palette tokens

### Neutral tokens

- `neutral-0` — page background
- `neutral-25` — subtle background sections
- `neutral-50` — cards / elevated backgrounds
- `neutral-100` — borders
- `neutral-500` — muted text
- `neutral-700` — body text
- `neutral-900` — headings / high-emphasis text

### Brand tokens

- `brand-500` — primary CTA
- `brand-600` — hover CTA
- `brand-700` — pressed CTA
- `brand-50` — highlighted background

### State tokens

- `success-500`
- `warning-500`
- `error-500`
- `info-500`
- `review-500`

## 5.4 Status color mapping

| State family | Usage |
|---|---|
| Neutral | Draft, inactive, archived |
| Info | New, submitted, processing start |
| Review | Manual review, waiting operator, compliance review |
| Warning | Needs action, expiring, missing confirmation |
| Success | Confirmed, completed, approved |
| Error | Failed, rejected, blocked |

## 6. Typography system

## 6.1 Goals

Typography must optimize:

- financial readability;
- high scanning speed;
- strong label-value relationships;
- clarity of statuses and next actions.

## 6.2 Font pairing recommendation

Recommended font strategy:

- **Primary UI font:** clean modern sans-serif;
- **Optional display accent:** subtle serif or distinctive sans only for marketing hero moments;
- dashboard/cabinet/admin should rely almost entirely on the primary UI sans.

Recommended type candidates:

- Inter;
- Geist;
- General Sans;
- Satoshi.

## 6.3 Type scale

Recommended scale:

| Token | Usage |
|---|---|
| `text-xs` | Meta labels, helper text |
| `text-sm` | Secondary UI text, buttons |
| `text-md` | Body text |
| `text-lg` | Section headers |
| `text-xl` | Page titles |
| `text-2xl` | Hero / major headers |

## 6.4 Numeric typography

Numeric values must be treated carefully because the product is transaction-heavy.

Rules:

- use tabular numerals for balances, rates, amounts, timestamps, IDs, and status tables;
- distinguish label and numeric value with weight and spacing;
- avoid ambiguous formatting of decimal places;
- align amounts by decimal logic where tables are used.

## 7. Spacing and layout system

## 7.1 Base spacing

Use a 4px spacing scale.

Suggested token set:

- `space-1 = 4px`
- `space-2 = 8px`
- `space-3 = 12px`
- `space-4 = 16px`
- `space-5 = 20px`
- `space-6 = 24px`
- `space-8 = 32px`
- `space-10 = 40px`
- `space-12 = 48px`
- `space-16 = 64px`

## 7.2 Layout rules

Customer-facing product screens:

- moderate whitespace;
- large enough form controls;
- one clear primary action per section;
- card-based grouping for exchange steps.

Operator/admin surfaces:

- tighter density;
- information-first layout;
- persistent filters and status summaries;
- efficient tables and side panels.

## 7.3 Grid rules

- 12-column grid for desktop application layouts;
- 8-column simplified structure for tablet where needed;
- single-column guided flow on mobile;
- exchange flow should prioritize vertical progression on mobile.

## 8. Border radius, borders, elevation

## 8.1 Radius

Recommended radius strategy:

- small radius for inputs, chips, compact admin surfaces;
- medium radius for cards and panels;
- large radius only for hero or marketing accents.

Token example:

- `radius-sm = 6px`
- `radius-md = 10px`
- `radius-lg = 14px`
- `radius-xl = 20px`
- `radius-pill = 999px`

## 8.2 Borders

Use soft neutral borders for structure.

Rules:

- borders should separate, not decorate;
- prefer subtle borders on data containers;
- use stronger borders only on active/focused/error states.

## 8.3 Elevation

Use shallow elevation.

Recommended levels:

- `elevation-0` — flat surface;
- `elevation-1` — card;
- `elevation-2` — dropdown / modal / floating panel.

Heavy shadow stacks should be avoided in transactional interfaces.

## 9. Iconography

## 9.1 Style

Icons should be:

- simple;
- geometric;
- readable at small sizes;
- consistent across customer and operator UI.

Recommended icon families:

- Lucide;
- Phosphor;
- Heroicons.

## 9.2 Usage rules

- never use icons as the only status signal;
- pair icons with labels in critical flows;
- keep status icons semantically stable across the app;
- use network and asset logos only where they add recognition value.

## 10. Component architecture

Components should be defined on four levels:

| Level | Meaning |
|---|---|
| Token | Color, typography, spacing, radius, elevation |
| Primitive | Button, input, badge, card, divider, icon wrapper |
| Composite | Quote card, wallet selector, status tracker, order row |
| Template | Quote page, order detail page, KYC form, admin queue layout |

## 11. Core UI primitives

## 11.1 Buttons

Variants:

- Primary
- Secondary
- Tertiary / ghost
- Danger
- Success action where needed
- Inline text action

States:

- default;
- hover;
- active;
- focus;
- disabled;
- loading.

Rules:

- every loading button must preserve width to prevent layout jumps;
- primary action must be singular within a local action group;
- destructive actions must require stronger confirmation patterns.

## 11.2 Inputs

Input family:

- text input;
- number input;
- amount input with currency/asset slot;
- search input;
- textarea;
- masked input;
- OTP / confirmation code input if needed.

States:

- default;
- hover;
- focus;
- filled;
- error;
- disabled;
- readonly.

## 11.3 Selectors

Required selector patterns:

- dropdown select;
- searchable select;
- asset selector;
- network selector;
- payment method selector;
- segmented selector for buy/sell direction.

## 11.4 Badges and status pills

Badge families:

- neutral;
- info;
- review;
- warning;
- success;
- error.

Use cases:

- KYC status;
- order status;
- wallet verification status;
- receipt status;
- payment review status.

## 11.5 Cards and panels

Required card types:

- quote summary card;
- order summary card;
- step card;
- receipt card;
- wallet connection card;
- admin queue item card.

Rules:

- cards should emphasize grouping and progression;
- avoid over-nesting cards inside cards;
- summary cards must clearly distinguish labels, values, and states.

## 11.6 Tables and lists

Admin/operator UI requires robust data presentation patterns.

Required table capabilities:

- sortable headers;
- sticky header where useful;
- row status indicator;
- bulk selection where needed;
- expandable detail row or side drawer;
- empty state;
- loading skeleton;
- inline filters.

## 11.7 Modals, drawers, and overlays

Use patterns based on complexity:

- modal for confirmation and short forms;
- drawer for side-context review;
- full-screen step view on mobile for complex tasks.

Critical actions requiring overlays:

- cancel order;
- reject KYC;
- reject payment evidence;
- confirm payout or transfer;
- edit sensitive requisites.

## 11.8 Notifications and alerts

Notification patterns:

- inline alert;
- toast;
- persistent banner;
- status callout block.

Rules:

- critical issues must not rely only on ephemeral toasts;
- success toasts should be short and non-blocking;
- review-required messages should be persistent until resolved.

## 12. Flow-specific components

## 12.1 Exchange flow components

Must include:

- buy/sell switcher;
- quote builder;
- quote expiry timer;
- amount entry module;
- payment method selection block;
- payout / wallet destination block;
- summary and confirmation block.

## 12.2 Process tracker

A core component for this product.

Requirements:

- horizontal or vertical step tracker depending viewport;
- explicit current stage;
- completed vs upcoming vs blocked states;
- optional timestamp per step;
- ability to show manual review state clearly;
- ability to show “action required from user”.

Core stages may include:

- Quote created;
- Awaiting payment or transfer;
- Submitted by user;
- Under review;
- Confirmed;
- Exchange processing;
- Completed.

## 12.3 KYC components

Required components:

- KYC eligibility gate;
- document upload block;
- upload status tile;
- identity data form;
- KYC review banner;
- resubmission prompt.

## 12.4 Wallet connection components

Required components:

- wallet list;
- add wallet flow;
- address validation indicator;
- network mismatch warning;
- exchange account connector state;
- default wallet marker.

## 12.5 Receipt and document components

Required components:

- receipt availability card;
- download/open receipt action row;
- pending issuance notice;
- failed issuance alert with retry state if applicable.

## 13. Admin / operator patterns

## 13.1 Queue design

Operator queues should support:

- filtering by status;
- filtering by side (buy/sell);
- filtering by risk level;
- filtering by asset/network;
- saved queue presets;
- bulk scanning of high-priority items.

## 13.2 Review workspace

The review workspace should include:

- entity summary block;
- timeline block;
- attached evidence panel;
- decision actions;
- internal comments area;
- audit snippet;
- adjacent related records if necessary.

## 13.3 Decision actions

Operator actions must be visually safe:

- positive and negative decisions clearly separated;
- dangerous decisions require confirmation;
- reason code selector for rejection;
- optional note box;
- action loading/locked state to prevent duplicate submissions.

## 14. Responsive behavior

## 14.1 Mobile

Mobile priorities:

- guided linear exchange flow;
- sticky bottom primary CTA where useful;
- simplified step tracker;
- full-width inputs and actions;
- reduced table complexity;
- side drawers may become full-screen sheets.

## 14.2 Tablet

Tablet should support:

- split layouts for summary + form;
- compact step tracker;
- cabinet pages with two-column balance/detail logic where appropriate.

## 14.3 Desktop

Desktop should support:

- richer comparison and summary sidebars;
- queue + detail split view for operators;
- denser data layouts without harming readability.

## 15. Motion and interaction

## 15.1 Motion goals

Motion should:

- reinforce state transitions;
- reduce ambiguity;
- provide confirmation for user actions;
- avoid ornamental distraction.

## 15.2 Motion rules

Use subtle motion for:

- step progression;
- loading states;
- dropdowns;
- drawers;
- toast appearance;
- section validation feedback.

Avoid:

- flashy crypto animations;
- constant pulsing on important actions;
- excessive transitions that slow transactional flows.

## 16. Accessibility requirements

The UI kit must enforce:

- WCAG AA contrast minimum;
- visible focus states;
- keyboard navigability;
- error messaging tied to fields;
- non-color status communication;
- accessible labels for icons and controls;
- semantic headings and landmarks;
- sufficient hit targets on mobile.

## 17. Design token structure

Recommended token groups:

- `color.*`
- `text.*`
- `font.*`
- `space.*`
- `radius.*`
- `shadow.*`
- `border.*`
- `motion.*`
- `zIndex.*`
- `size.*`

Example token naming:

- `color.bg.default`
- `color.text.default`
- `color.action.primary`
- `color.state.success`
- `space.4`
- `radius.medium` -> replace with radius token names such as `radius.sm`, `radius.medium`, `radius.lg`
- `shadow.panel`

## 18. Figma structure recommendation

Recommended Figma library organization:

### Pages

- Foundations
- Tokens
- Components
- Patterns
- Templates
- Admin patterns
- QA / edge states

### Component sections

- Buttons
- Inputs
- Selects
- Badges
- Cards
- Tables
- Modals
- Navigation
- Status tracking
- KYC kit
- Wallet connection kit
- Receipt / notification kit

## 19. Required screen states for every important component

Each key component should define at minimum:

- default;
- hover;
- focus;
- active;
- disabled;
- loading;
- error;
- success where relevant;
- empty where relevant;
- mobile adaptation.

## 20. Implementation notes for Astra frontend

The design system should be mapped to Astra frontend via:

- token-driven theme layer;
- reusable React/Vue primitives depending frontend implementation;
- consistent form abstractions;
- shared status badge map;
- shared order state renderer;
- shared responsive layout primitives.

Recommended implementation packages/modules:

- `tokens/`
- `primitives/`
- `composites/`
- `flows/`
- `admin/`
- `icons/`
- `utils/ui/`

## 21. MVP component priority

Recommended first implementation batch:

1. Typography, color, spacing, radius, elevation tokens.
2. Buttons, inputs, amount fields, selects.
3. Status badges and alerts.
4. Cards and summary panels.
5. Step tracker.
6. Quote builder UI components.
7. Order tracker components.
8. KYC form and upload kit.
9. Wallet connection components.
10. Admin queue table + detail drawer.

## 22. Acceptance criteria

The design system should be considered ready when:

- major user flows can be built without inventing ad hoc visual rules;
- all transactional states have semantic visual representation;
- customer and operator surfaces feel related but appropriately different in density;
- the system includes mobile, tablet, and desktop guidance;
- designers and developers can map components directly into implementation work.

## 23. Deliverables expected from this spec

Based on this document, the next design artifacts should be:

- visual token palette;
- component inventory;
- Figma component library;
- screen-level UI patterns;
- design QA checklist;
- implementation-ready frontend component backlog.