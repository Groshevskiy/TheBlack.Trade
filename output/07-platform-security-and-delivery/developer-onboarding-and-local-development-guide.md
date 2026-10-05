# Developer Onboarding & Local Development Guide — TheBlack.Trade

## Document metadata

- Status: active
- Role: Companion spec
- Owner: Engineering + Platform
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Initial version created to standardize local setup and developer onboarding.
- Supersedes: none explicitly declared
- Depends on:
  - `theblack-trade-solution-architecture-and-technical-specification.md`
  - `environment-and-deployment-spec.md`
  - `frontend-integration-spec.md`
- Related documents:
  - `ci-cd-quality-gates-and-deployment-pipeline-spec.md`
  - `data-migration-and-backfill-strategy-spec.md`
  - `contract-test-matrix.md`

## 1. Purpose

This guide standardizes the developer bootstrap path for TheBlack.Trade. It should help a new engineer reproduce the local stack, obtain the right access, run migrations safely, work with provider sandboxes and execute the core validation suite before opening changes.

## 2. Minimum sections

The guide should cover workstation prerequisites, repository structure, environment variables approach, seed data, provider sandboxes, local secrets handling, migrations, test commands, debugging patterns and common failure recovery steps.
