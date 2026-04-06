---
name: halal-compliance
description: BPJPH halal certification tracker — data models, compliance checklists, SIHALAL integration, expiry alerts for Indonesian apps
user-invocable: true
version: 1.0.0
---

# Halal Compliance Tracker (BPJPH / SIHALAL 2.0)

> Indonesia's JPH Law mandates halal certification for all food, beverages, cosmetics,
> pharmaceuticals, and chemical/biological products by **October 2026**. Generate code
> that keeps apps compliant with BPJPH requirements and SIHALAL 2.0 integration.

Execute the following phases in order. Each phase builds on the previous.

## Phase 1 — Data Models

Generate models for:
- **ProductRegistry**: SKU, name, category, ingredients[], halalStatus, certId, createdAt
- **IngredientAuditTrail**: ingredientId, source, supplier, halalGrade, verifiedBy, timestamp
- **HalalCertificate**: certNumber, issuedBy (LPH), validFrom, validUntil, status (pending|active|expired|revoked)
- **LPHInspectionSchedule**: lphId, lphName, inspectionDate, productId, result, notes
- **MUIFatwaTracking**: fatwaNumber, issueDate, scope, applicableCategories[], referencedBy[]

Include TypeScript interfaces and a migration/schema (Prisma or Drizzle based on project).

## Phase 2 — BPJPH Compliance Checklists

Generate a compliance module that:
- Enumerates JPH Law requirements (self-declare, LPH audit, MUI fatwa, BPJPH certificate)
- Tracks per-product checklist completion as a state machine: `draft → submitted → lph_review → fatwa_issued → certified`
- Flags products missing mandatory documentation before the Oct 2026 deadline
- Returns compliance percentage and blocking items per product

## Phase 3 — Expiry Notification Logic

Generate a scheduler/cron service that:
- Queries certificates expiring within 90, 60, and 30 days
- Sends tiered alerts (info → warning → critical) via a notification interface
- Generates renewal task entries with required documents list
- Handles grace-period logic per BPJPH renewal rules

## Phase 4 — SIHALAL 2.0 Integration Stubs

Generate API integration layer with:
- `GET /sihalal/status/:certNumber` — check certificate validity
- `POST /sihalal/apply` — submit new halal application
- `GET /sihalal/track/:applicationId` — track application progress
- `POST /sihalal/renew` — initiate renewal
- Type-safe request/response DTOs matching SIHALAL 2.0 schema
- Retry and error handling with circuit breaker pattern

## Phase 5 — Post-Market Monitoring

Generate workflow for post-certification surveillance:
- Periodic ingredient re-verification against approved halal list
- Consumer complaint intake linked to certified products
- Automatic suspension trigger if non-compliant ingredient detected
- Dashboard summary: total products, certified count, expiring soon, flagged items
- Audit log for all status transitions (who, when, why)

## Context: Oct 2026 Deadline

All generated code must include a `HALAL_DEADLINE = new Date('2026-10-17')` constant.
Compliance dashboards must show countdown to deadline. Products without active
certification after this date must be flagged as **non-distributable** per JPH Law.

## Output Expectations

- Use the project's existing ORM, router, and test framework
- Add JSDoc/TSDoc comments referencing JPH Law articles where applicable
- Generate unit tests for compliance state machine and expiry logic
- Place files under `src/modules/halal-compliance/` unless project structure differs
