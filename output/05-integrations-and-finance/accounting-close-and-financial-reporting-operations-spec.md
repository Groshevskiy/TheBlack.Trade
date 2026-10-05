# Accounting Close & Financial Reporting Operations Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Finance Ops + Accounting + Backend
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Initial version created to define accounting close and financial reporting operations.
- Supersedes: none explicitly declared
- Depends on:
  - `reconciliation-and-ledger-spec.md`
  - `analytics-and-reporting-spec.md`
  - `operations-runbook-and-sla-spec.md`
- Related documents:
  - `payment-provider-and-payout-integration-spec.md`
  - `data-retention-and-archival-spec.md`
  - `migration-validation-pack.md`

## 1. Purpose

This document defines month-end and period-close financial operations for TheBlack.Trade, including reconciliation closure, reporting outputs, finance sign-off, correction policy, evidence retention and alignment between platform ledger and accounting/reporting needs.

## 2. Minimum sections

The operating model should define close calendar, source systems, reconciliation dependencies, cutoff rules, correction handling, exception tracking, reporting outputs, approvers and audit evidence retention.


## 3. Close calendar and cutoff rules

The close process should define daily, weekly and month-end checkpoints, with explicit cutoff timing for orders, payments, payouts, reversals, provider adjustments and late-arriving events.

## 4. Source systems and dependencies

Finance reporting should identify authoritative sources for:

- operational order and transaction data;
- settlement and payout provider statements;
- internal reconciliation outputs;
- fee, FX and adjustment calculations;
- exception and suspense inventories.

## 5. Exception handling and adjustments

Unreconciled items, provider timing gaps, manual corrections and post-close adjustments should follow an approval process with evidence, owner, accounting impact note and reopening rules where required.

## 6. Reporting outputs and sign-off

Minimum outputs should include close status, unresolved exceptions, fee and volume summaries, cash or wallet movement summaries, adjustment log and formal finance sign-off with retained evidence.

## 7. Audit trail and retention

All close artifacts should preserve who prepared, reviewed and approved them; which source extracts were used; what exceptions remained open; and what corrections were applied after the reporting cutoff.


## 8. RACI and roles

The close process should assign preparer, reviewer and approver responsibilities across Finance Ops, Accounting, Engineering and Operations. No material close package should be finalized without explicit owner and sign-off route.

## 9. Close checklist

Minimum checklist:

- reconcile provider and internal ledger positions;
- verify fee and FX calculations for the reporting period;
- review unresolved exceptions and suspense balances;
- capture manual adjustments and supporting evidence;
- prepare reporting outputs and obtain sign-off;
- retain close package for audit retrieval.

## 10. Control failures and reopening

If a post-close issue materially affects reporting, the process should define when to reopen, when to issue adjustment-only treatment and who must approve the final disposition.
