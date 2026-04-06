# Next.js Project Bootstrap Template

## Framework-Specific CLAUDE.md Rules

```markdown
## Tech Stack Rules

### Next.js [VERSION]
- Use App Router exclusively — no pages/ directory
- Server Components by default; add "use client" only when needed (hooks, interactivity, browser APIs)
- Use Server Actions for mutations; avoid API routes for internal data mutations
- Dynamic routes use `[param]` folders; catch-all uses `[...param]`
- Layouts are shared across siblings — use for persistent UI (sidebars, nav)
- Loading states: use `loading.tsx` per route segment
- Error boundaries: use `error.tsx` per route segment
- Read `node_modules/next/dist/docs/` before writing any Next.js code — APIs may differ from training data

### React [VERSION]
- Functional components only, no class components
- Use React Server Components where possible
- Hooks: useState, useEffect, useMemo, useCallback — avoid unnecessary memoization
- Prefer server-side data fetching over client-side useEffect

### TypeScript
- Strict mode enabled — no `any` types except at API boundaries with explicit casting
- Use Zod for runtime validation at boundaries (API input, form data, env vars)
- Prefer `interface` for object shapes, `type` for unions/intersections
- Export types from schema files, don't duplicate type definitions

### Styling
- Tailwind CSS utility-first — no custom CSS unless Tailwind can't express it
- Use `cn()` utility (clsx + twMerge) for conditional classes
- Component variants via class-variance-authority (cva)
- shadcn/ui for standard UI patterns — don't rebuild what shadcn provides

### Database (Drizzle ORM)
- Schema definitions in `src/server/db/schema/`
- One file per domain entity (users.ts, products.ts, etc.)
- Relations defined in separate `relations.ts`
- Migrations via `drizzle-kit generate` then `drizzle-kit migrate`
- Always use parameterized queries — never string interpolation

### API (tRPC)
- Routers in `src/server/trpc/routers/` — one per domain
- Use `publicProcedure` for public endpoints, `protectedProcedure` for authenticated
- Input validation with Zod schemas on every procedure
- Keep procedure logic thin — delegate to service layer in `src/server/services/`

### Authentication
- Supabase Auth (or Clerk/NextAuth — adapt per project)
- Middleware-based route protection
- Server-side session validation for all protected routes
- Never trust client-side auth state for data access decisions
```

## Agent Subset for Next.js

### Always Include
- dev-fullstack-engineer (primary implementation)
- dev-architect (architecture decisions)
- dev-database-engineer (if DB present)
- test-strategist (test planning)
- test-e2e-engineer (UI testing)
- test-api-tester (API testing)
- test-security-scanner (always)
- gsd-executor, gsd-planner, gsd-verifier, gsd-debugger (core workflow)

### Include If Business Strategy Exists
- marketing-content-strategist
- marketing-visual-designer (Canva)
- marketing-social-manager
- sales-proposal-generator
- exec-strategist
- exec-financial-analyst

### Include If Has AI Features
- research-market-researcher
- research-trend-spotter

## MCP Servers for Next.js

### Always
- context7 (docs lookup for Next.js, React, Tailwind, etc.)
- sequential-thinking (complex architecture decisions)
- github (version control)
- playwright (e2e testing, UI verification)

### Conditional
- canva (if marketing/business strategy exists)
- exa (if content/research features)
- firecrawl (if web scraping features)
- atlassian (if Jira/Confluence workflow)

## Knowledge Base Templates

### architecture.md
Auto-generate from:
- `src/app/` directory structure → route map
- `src/server/` structure → API architecture
- `src/components/` structure → component hierarchy
- Database schema files → entity relationship overview

### conventions.md
Auto-generate from:
- Import patterns found in existing files
- Naming conventions (kebab-case files, PascalCase components, camelCase functions)
- File organization patterns
- Error handling patterns found in code

### api-reference.md
Auto-generate from:
- tRPC router definitions → endpoint list with input/output types
- API route handlers → REST endpoint documentation

### database-schema.md
Auto-generate from:
- Drizzle/Prisma schema files → table definitions, relations, indexes
