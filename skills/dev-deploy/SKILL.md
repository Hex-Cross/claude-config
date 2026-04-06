---
name: dev-deploy
description: Deployment preparation — generates Docker configs, CI/CD pipelines, environment configs, monitoring setup, and pre-deploy checklist.
user-invocable: true
version: 1.0.0
---

# Dev Deploy — Deployment Preparation

Prepare an application for deployment with infra, CI, and monitoring.

## Step 0: Initialize

```bash
mkdir -p .teams/dev/{specs,output}
mkdir -p .teams/reviews/dev
```

Generate ID: `deploy-{YYYYMMDD-HHMMSS}`

## Step 1: Deployment Analysis (1 agent, model: "sonnet")

Spawn **dev-devops-engineer** (model: "sonnet"):
```
Analyze the project for deployment readiness. Check:
- Existing Docker/container config
- CI/CD workflows
- Environment variable management
- Database migration strategy
- Vercel/cloud config
- Health check endpoints
- Error tracking setup

Write analysis to: .teams/dev/output/{deploy-id}-DEPLOY-ANALYSIS.md
```

## Step 2: Deployment Config (1 agent, model: "opus")

Spawn **dev-devops-engineer** (model: "opus"):
```
Create/update deployment configuration based on the analysis.

<analysis>
{content of DEPLOY-ANALYSIS.md}
</analysis>

Create:
- Dockerfile (if needed)
- docker-compose.yml (if needed)
- CI/CD workflows for staging + production
- Environment variable documentation
- Health check endpoint (if missing)
- Pre-deploy checklist

Write config doc to: .teams/dev/output/{deploy-id}-DEPLOY-CONFIG.md
Write actual config files to the project.
```

## Step 3: Pre-Deploy Test (1 agent, model: "opus")

Spawn **test-strategist** (model: "opus"):
```
Run a pre-deployment quality check:
- Verify build succeeds
- Run existing tests
- Check for hardcoded secrets
- Verify environment variables are documented
- Check security headers

Write to: .teams/dev/output/{deploy-id}-PREDEPLOY-CHECK.md
```

## Step 4: Supervisor Review

Invoke `/supervisor:review` on `.teams/dev/output/{deploy-id}-DEPLOY-CONFIG.md`

If revision requested: re-run Step 2 with feedback (max 3 loops).

## Step 5: Present Results

Show:
- Deployment configs created
- Pre-deploy checklist (pass/fail)
- Environment variables needed
- How to deploy (commands)
- Monitoring recommendations
