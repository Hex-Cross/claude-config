---
name: api-docs
description: OpenAPI spec generator — scans routes, infers schemas, detects drift, generates interactive API docs
user-invocable: true
version: 1.0.0
---

# API Documentation Generator

Generate and validate OpenAPI 3.1 specs from route handler source code.

## Phase 1 — Detect Framework & Routing

1. Scan for framework markers: `next.config.*`, `express`, `hono`, `fastify` in package.json
2. Identify routing pattern: Next.js App Router (`app/**/route.ts`), file-based, or programmatic
3. Record base path, API prefix, and middleware chain

## Phase 2 — Discover Endpoints

1. Glob for route files matching the detected pattern (e.g., `app/**/route.{ts,js}`, `routes/**/*.{ts,js}`)
2. Extract HTTP methods from named exports (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) or method calls (`.get()`, `.post()`)
3. Parse path parameters from directory names (`[id]`, `:id`) and query params from usage
4. Build an endpoint inventory: method, path, file location, middleware

## Phase 3 — Infer Schemas

1. For each endpoint, locate request/response types:
   - TypeScript interfaces and type aliases referenced in handler signatures
   - Zod schemas (`.parse()`, `.safeParse()` calls) — convert via `zod-to-json-schema`
   - `NextResponse.json()` / `Response.json()` return shapes
2. Map to OpenAPI `requestBody` and `responses` components
3. Extract status codes from explicit `new Response(_, { status })` or `NextResponse` calls
4. Flag endpoints with no inferable schema as `TODO` in the spec

## Phase 4 — Generate OpenAPI 3.1 Spec

1. Assemble `openapi.yaml` (or `.json` if user prefers) at project root
2. Populate `info`, `servers`, `paths`, `components/schemas`
3. Include authentication schemes detected from middleware (Bearer, API key, cookies)
4. Write the file and report endpoint count and schema coverage percentage

## Phase 5 — Drift Detection

1. If an existing spec file is found, diff it against discovered endpoints
2. Report: endpoints in spec but missing from code (stale), endpoints in code but missing from spec (undocumented)
3. Flag response schema mismatches between spec and inferred types
4. Output a drift summary table with actionable items

## Phase 6 — Interactive Docs Setup

1. Recommend and scaffold Swagger UI or Redoc based on framework:
   - Next.js: API route serving `swagger-ui-react` or static HTML with Redoc CDN
   - Express/Hono: middleware mount (`swagger-ui-express`, `@hono/swagger-ui`)
2. Configure to load the generated spec file
3. Provide a dev-accessible URL (e.g., `/api-docs`)

## Phase 7 — Validate Spec

1. Run Spectral or equivalent linting on the generated spec
2. Report errors (invalid refs, missing descriptions) and warnings
3. Auto-fix trivial issues (missing `operationId`, empty descriptions)
4. Print final summary: total endpoints, schemas, coverage, lint score
