# Service Catalog & Ownership Directory — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: Platform + Engineering Management
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Initial version created to define service ownership and dependency visibility.
- Supersedes: none explicitly declared
- Depends on:
  - `theblack-trade-solution-architecture-and-technical-specification.md`
  - `environment-and-deployment-spec.md`
  - `operations-runbook-and-sla-spec.md`
- Related documents:
  - `incident-response-playbook.md`
  - `release-readiness-and-rollout-plan.md`
  - `observability-and-audit-spec.md`

## 1. Purpose

This document defines how TheBlack.Trade should maintain a service catalog and ownership directory for applications, services, jobs, integrations, repositories, data stores, runbooks, on-call routing and operational dependencies.

## 2. Minimum catalog fields

Each catalog entry should contain service name, owner, supporting team, environment scope, repo/location, critical dependencies, runbooks, observability links, escalation path and data sensitivity class where relevant.


## 3. Catalog structure

The catalog should cover customer-facing apps, admin surfaces, APIs, background workers, schedulers, integrations, data stores, dashboards and external provider dependencies.

## 4. Ownership model

Every entry should define service owner, engineering owner, product or business stakeholder, on-call route, security contact and documentation links.

## 5. Review cadence

Catalog entries should be reviewed on material architecture change, incident learning, ownership transfer and at a fixed periodic cadence.

## 6. Operational use cases

The catalog should support release readiness, incident response, access review, change impact analysis, dependency mapping and audit preparation.
