# Incident Postmortem & Learning Process — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: Operations + Security + Engineering
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Initial version created to define the post-incident learning and action-tracking process.
- Supersedes: none explicitly declared
- Depends on:
  - `incident-response-playbook.md`
  - `observability-operations-runbook.md`
  - `operations-runbook-and-sla-spec.md`
- Related documents:
  - `business-continuity-and-dr-spec.md`
  - `release-readiness-and-rollout-plan.md`
  - `adr-policy-and-architecture-decision-register.md`

## 1. Purpose

This document defines the post-incident review process for TheBlack.Trade, including timeline reconstruction, root-cause analysis, corrective and preventive action tracking, ownership assignment, communication expectations and closure verification.

## 2. Process requirements

The process should be blameless, evidence-based, time-bounded and linked to concrete remediation owners, due dates and validation of completed fixes.


## 3. Triggering criteria

A formal postmortem should be required for sev1/sev2 incidents, security incidents, financial misstatement risk, reconciliation breaks, prolonged customer-impacting outages and any event mandated by compliance or leadership.

## 4. Required template sections

Each postmortem should include summary, impact window, detection path, full timeline, contributing factors, root cause, mitigations used, corrective/preventive actions, owner list and due dates.

## 5. Closure and follow-through

Actions should not be considered complete until implemented, validated and linked back to affected runbooks, specs, alerts, tests or architecture decisions.
