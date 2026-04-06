---
name: db-migrate
description: Database migration management — generation, safety analysis, rollback scripts, dry-run for Drizzle/Prisma/SQL
user-invocable: true
version: 1.0.0
---

# DB Migrate — Migration Management

## Step 1: Detect ORM

Check `package.json` for:
- `drizzle-orm` + `drizzle-kit` → Drizzle
- `prisma` / `@prisma/client` → Prisma
- `typeorm` → TypeORM
- None → raw SQL migrations

## Step 2: Generate Migration

Based on detected ORM:

**Drizzle:**
```bash
npx drizzle-kit generate
```
Review generated SQL in `drizzle/` directory.

**Prisma:**
```bash
npx prisma migrate dev --name <description> --create-only
```
Review generated SQL in `prisma/migrations/`.

**Raw SQL:**
Create numbered migration file in `migrations/` with UP and DOWN sections.

## Step 3: Safety Analysis

Before applying, analyze the migration SQL for:

| Check | Risk | Action |
|-------|------|--------|
| DROP TABLE / DROP COLUMN | Data loss | BLOCK — require explicit confirmation |
| ALTER TABLE on large table | Long lock | WARN — estimate row count, suggest batched approach |
| NOT NULL without DEFAULT | Breaks existing rows | BLOCK — add DEFAULT or backfill first |
| New INDEX on large table | Slow creation | WARN — suggest CONCURRENTLY if Postgres |
| RENAME COLUMN | Breaks app if deployed before code | WARN — suggest expand-contract pattern |
| Foreign key to large table | Lock during creation | WARN — suggest adding without validation first |

Use `dev-database-engineer` agent for complex analysis.

## Step 4: Generate Rollback

For each migration, auto-generate a rollback script:
- Drizzle: `drizzle-kit drop` or manual DOWN SQL
- Prisma: manual DOWN SQL (Prisma doesn't auto-generate rollbacks)
- Raw SQL: DOWN section in migration file

Write rollback to `migrations/rollbacks/` or alongside migration.

## Step 5: Dry Run

Show exactly what will execute without applying:
- Drizzle: `npx drizzle-kit push --dry-run` or read generated SQL
- Prisma: read SQL from `--create-only` output
- Raw SQL: display the migration file

Present to user for approval before applying.

## Step 6: Apply

After user confirms:
- Run the migration command
- Verify schema matches expected state
- Log migration in project's migration history
- Run app's type generation if applicable (`prisma generate`, `drizzle-kit introspect`)
