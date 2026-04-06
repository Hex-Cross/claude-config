---
name: dev-scaffold
description: Project scaffolding — sets up a new project or module with architecture, database, CI/CD, monitoring, and development environment from scratch.
user-invocable: true
version: 1.0.0
---

# Dev Scaffold — New Project Setup

Scaffold a new project with architecture, database, CI, and dev environment.

## Step 0: Initialize

```bash
mkdir -p .teams/dev/{specs,output,adrs}
mkdir -p .teams/reviews/dev
mkdir -p .teams/requests
```

Generate ID: `scaffold-{YYYYMMDD-HHMMSS}`

## Step 1: Architecture Design (1 agent, model: "opus")

Spawn **dev-architect** (model: "opus"):
```
Design the architecture for a new project: {user's project description}

Include:
- Tech stack recommendation with justification
- Project structure (files/folders)
- API design (if applicable)
- Database schema (if applicable)
- Auth model
- Deployment strategy

Write to: .teams/dev/specs/{scaffold-id}-ARCHITECTURE.md
```

## Step 2: Parallel Setup (3 agents IN PARALLEL, model: "opus")

### Agent 1: Database
Spawn **dev-database-engineer** (model: "opus"):
```
Set up the database for this project.
<architecture>{content of ARCHITECTURE.md}</architecture>

Create: schema, initial migration, seed script, connection config.
Write schema doc to: .teams/dev/output/{scaffold-id}-SCHEMA.md
```

### Agent 2: DevOps
Spawn **dev-devops-engineer** (model: "opus"):
```
Set up the development and deployment infrastructure.
<architecture>{content of ARCHITECTURE.md}</architecture>

Create: Dockerfile, docker-compose.yml, CI/CD workflows, environment configs.
Write devops doc to: .teams/dev/output/{scaffold-id}-DEVOPS.md
```

### Agent 3: App Skeleton
Spawn **dev-fullstack-engineer** (model: "opus"):
```
Scaffold the application based on the architecture.
<architecture>{content of ARCHITECTURE.md}</architecture>

Create: project structure, key files, base components, API routes, middleware, auth setup.
Write implementation doc to: .teams/dev/output/{scaffold-id}-SCAFFOLD.md
```

## Step 3: Test Setup (1 agent, model: "opus")

Spawn **test-ci-generator** (model: "opus"):
```
Generate CI/CD test pipelines for this new project.
Read the project structure and generate appropriate GitHub Actions workflows.
Write to: .github/workflows/
Write report to: .teams/dev/output/{scaffold-id}-CI.md
```

## Step 4: Code Review

Spawn **dev-code-reviewer** (model: "opus"):
```
Review the entire scaffold for consistency, security, and best practices.
Write to: .teams/dev/output/{scaffold-id}-REVIEW.md
```

## Step 5: Supervisor Review

Invoke `/supervisor:review` on `.teams/dev/output/{scaffold-id}-REVIEW.md`

If revision requested: re-run the relevant step with feedback (max 3 loops).

## Step 6: Present to User

Show:
- Architecture summary
- Project structure
- How to run locally (docker compose up or npm run dev)
- CI/CD pipeline summary
- Next steps to start building features
