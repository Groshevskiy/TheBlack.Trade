# Sanctions, Travel Rule & Transaction-Monitoring Operations Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Compliance + Risk Operations
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Initial version created to define sanctions, travel-rule and transaction-monitoring operations.
- Supersedes: none explicitly declared
- Depends on:
  - `fraud-signals-and-risk-rules-spec.md`
  - `compliance-and-legal-operations-spec.md`
  - `privacy-and-data-subject-rights-operations-spec.md`
- Related documents:
  - `approval-workflow-schema.md`
  - `provider-contract-and-operations-pack.md`
  - `acceptance-test-catalog.md`

## 1. Purpose

This document defines how TheBlack.Trade should operate sanctions screening, travel-rule data handling and transaction-monitoring workflows. It covers alert generation, case review, escalation, blocking, evidence and provider or regulator-facing obligations.

## 2. Core operational domains

The operating model should cover sanctions screening, watchlist hits, travel-rule data collection/exchange, suspicious transaction review, case management, escalation thresholds, hold/block actions and evidence retention.


## 3. Screening and monitoring lifecycle

The lifecycle should cover:

- onboarding screening;
- rescreening on material profile or watchlist change;
- transaction-time screening;
- post-event monitoring and retrospective review;
- travel-rule data collection and exchange when thresholds or corridors require it.

## 4. Case states and actions

A standard case model should include new, triage, investigating, awaiting external input, escalated, dispositioned and closed states. Allowed actions should include clear, request information, hold, reject, freeze/escalate and report.

## 5. Evidence and auditability

Each case should preserve trigger source, matched attributes, analyst notes, supporting documents, decision rationale, approver when needed, outbound regulator/provider communications and closure timestamp.

## 6. SLA and escalation rules

The spec should define urgency classes for sanctions hits, travel-rule failures and transaction-monitoring alerts, including when transactions must be blocked immediately versus queued for manual review.


## 7. Jurisdiction and provider variation

The operating model should explicitly account for corridor-specific, provider-specific and jurisdiction-specific requirements for screening and travel-rule behavior. Unsupported corridors or missing provider capability should trigger blocking or fallback rules rather than ad hoc operator decisions.

## 8. False-positive handling

Analysts should follow a documented process for false-positive disposition, duplicate suppression and rescreen behavior after watchlist changes or customer profile updates.

## 9. Management reporting

The function should publish periodic reporting on alert volume, true-positive ratio, false-positive ratio, aged cases, blocked transactions and escalations.
