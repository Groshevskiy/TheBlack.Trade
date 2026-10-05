# Secrets, Keys & Credential Lifecycle Spec — TheBlack.Trade

## Document metadata

- Status: active
- Role: Canonical authority
- Owner: Security + Platform Engineering
- Version: v1.0
- Last reviewed: 2026-10-03
- Change log: Metadata normalized on 2026-10-03.
- Supersedes: none explicitly declared
- Depends on:
  - `threat-model-and-security-architecture-spec.md`
  - `environment-and-deployment-spec.md`
  - `admin-permission-hardening-spec.md`
- Related documents:
  - `infrastructure-as-code-and-environment-provisioning-spec.md`
  - `provider-contract-and-operations-pack.md`
  - `webhook-verification-and-replay-defense-spec.md`

## 1. Purpose

This document defines how secrets, signing keys, provider credentials and automation identities are created, stored, rotated, used and revoked across TheBlack.Trade. Its goal is to prevent uncontrolled credential sprawl, reduce compromise impact and ensure auditability of sensitive machine access.

## 2. Secret classes

| Class | Examples |
|---|---|
| Application secrets | DB credentials, queue auth, internal service tokens |
| Provider credentials | Payment API keys, exchange secrets, webhook secrets |
| Signing keys | JWT/signature keys, callback verification material |
| Operator break-glass credentials | Emergency-only admin or platform access |
| CI/CD identities | Pipeline deploy credentials, artifact publishing keys |

## 3. Lifecycle requirements

Every secret or key should have:

- named owner;
- environment scope;
- creation source and storage location;
- rotation expectation;
- emergency revocation path;
- usage audit expectations.

## 4. Operational rules

- secrets should never be committed to source control;
- environment credentials must be isolated from one another;
- production secrets should be accessible only through governed runtime injection or secure retrieval paths;
- break-glass credentials should be sealed, access-logged and periodically validated;
- provider secret rotation should be coordinated with callback validation and failover readiness.

## 5. Rotation and revocation

Rotation should exist for:

- scheduled routine rotation;
- suspected compromise;
- provider offboarding;
- role or personnel change;
- algorithm/signing-material refresh.

## 6. Required companion artifacts

- secret inventory register;
- key rotation calendar;
- credential ownership matrix;
- emergency revocation runbook;
- CI/CD secret usage map.