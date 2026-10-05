# API Versioning, OpenAPI Governance & Deprecation Policy — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Backend Architecture + Integration Engineering
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `theblack-trade-api-contract-spec.md`
  - `api-resource-boundaries-and-contract-spec.md`
  - `contract-test-matrix.md`
- Related documents:
  - `error-catalog-and-api-ui-mapping-spec.md`
  - `provider-contract-and-operations-pack.md`
  - `ci-cd-quality-gates-and-deployment-pipeline-spec.md`

## 1. Purpose

This document defines how API contracts are versioned, published, validated and deprecated across TheBlack.Trade. It covers OpenAPI governance, backward-compatibility expectations, breaking-change control and consumer communication for internal and external integrations.

## 2. Governance principles

- the API contract should have a designated source-of-truth definition;
- OpenAPI artifacts should be version-controlled and reviewable;
- breaking changes should not be introduced silently;
- consumers should receive migration and deprecation guidance with clear timelines;
- compatibility should be checked through schema and contract tests.

## 3. Change classes

| Change class | Example | Treatment |
|---|---|---|
| Non-breaking additive | Optional response field, new enum only if safe by contract | Allowed with standard review |
| Behavior-sensitive | New validation rule, pagination/default change | Needs compatibility assessment |
| Breaking | Removed field, renamed field, required-field addition, semantic inversion | Versioning or coordinated migration required |

## 4. Minimum artifacts

Maintain:

- source OpenAPI definitions;
- published version inventory;
- deprecation notice template;
- compatibility review checklist;
- consumer migration notes for breaking or behavior-sensitive changes.

## 5. Deprecation policy

A deprecated API surface should define:

- affected resource or operation;
- replacement path;
- sunset date or replacement condition;
- compatibility period expectations;
- owner responsible for consumer communication.

## 7. Versioning model

The platform should distinguish:

- externally versioned public APIs;
- provider-facing integration contracts;
- internal service contracts that may use faster evolution with controlled compatibility.

Breaking changes must never be introduced silently. Additive changes should still undergo contract review when they alter enums, defaults, validation behavior or callback expectations.

## 8. OpenAPI governance workflow

Every governed API surface should have an OpenAPI specification owned by the responsible backend team and reviewed as part of change management.

Minimum workflow:

1. update the OpenAPI contract in the same change set as implementation;
2. run schema validation and linting in CI;
3. compare against previous published contract for breaking changes;
4. obtain review from API owner and impacted consumers for material changes;
5. publish the approved contract artifact and changelog.

## 9. Breaking-change taxonomy

Breaking changes should include removed endpoints, removed fields, required-field introduction, response-shape removal, enum contraction, authentication changes, rate-limit contract changes and callback signature or retry semantics changes.

## 10. Deprecation and sunset policy

Deprecated behavior should declare effective date, migration target, consumer audience, communication channel and sunset date. Where supported, API responses or docs should expose deprecation/sunset metadata and migration guidance.

## 11. Consumer communication

Consumer-impacting API changes should be announced through release notes, provider/customer communication as applicable, updated examples and contract-test updates before enforcement.
