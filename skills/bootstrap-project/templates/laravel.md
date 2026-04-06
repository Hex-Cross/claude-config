# Laravel Project Bootstrap Template

## Framework-Specific CLAUDE.md Rules

```markdown
## Tech Stack Rules

### Laravel [VERSION]
- Follow Laravel conventions — Eloquent models in `app/Models/`, controllers in `app/Http/Controllers/`
- Use Form Requests for validation — never validate in controllers
- Use Resource Controllers for CRUD — `php artisan make:controller --resource`
- Policies for authorization — `php artisan make:policy`
- Events and Listeners for side effects — never put email/notification logic in controllers
- Use Laravel queues for heavy processing
- Migrations: one migration per schema change, never edit existing migrations

### Eloquent ORM
- Define relationships in models (hasMany, belongsTo, etc.)
- Use eager loading (`with()`) to prevent N+1 queries
- Scopes for reusable query logic
- Observers for model lifecycle hooks
- Always use mass assignment protection ($fillable or $guarded)

### Authentication
- Laravel Sanctum for API auth (SPA + mobile)
- Laravel Breeze/Jetstream for web auth scaffolding
- Middleware-based route protection
- Gate/Policy for fine-grained authorization

### API Design
- API Resources for response transformation
- Versioned routes: `routes/api/v1/`
- Rate limiting via middleware
- Consistent error response format with proper HTTP status codes

### Frontend (Blade/Livewire/Inertia)
- Blade components for reusable UI pieces
- Livewire for reactive UI without SPA complexity
- Inertia.js if using React/Vue frontend

### Testing
- Feature tests for API endpoints and user flows
- Unit tests for service classes and business logic
- `php artisan test --parallel` for fast feedback
- Database factories for test data generation
```

## Agent Subset for Laravel

### Always Include
- dev-fullstack-engineer
- dev-architect
- dev-database-engineer
- dev-devops-engineer (deployment, queues, caching)
- test-strategist
- test-api-tester
- test-security-scanner
- gsd-executor, gsd-planner, gsd-verifier, gsd-debugger

### Conditional
- test-e2e-engineer (if Blade/Livewire/Inertia UI)
- marketing-* agents (if business strategy exists)
- sales-* agents (if business strategy exists)

## MCP Servers for Laravel

### Always
- context7 (docs lookup)
- sequential-thinking
- github

### Conditional
- playwright (if has UI)
- canva (if marketing needs)
- atlassian (if Jira workflow)

## Knowledge Base Templates

### architecture.md
Auto-generate from:
- `routes/` files → route map
- `app/Http/Controllers/` → controller inventory
- `app/Models/` → model relationships
- `database/migrations/` → schema evolution

### conventions.md
Auto-generate from:
- PSR-12 compliance patterns
- Laravel naming conventions in use
- Service class patterns
- Repository patterns (if used)

### api-reference.md
Auto-generate from:
- `php artisan route:list` output (if artisan available)
- Route files → endpoint documentation
- Form Request files → input validation rules

### database-schema.md
Auto-generate from:
- Migration files → table definitions
- Model relationships → entity relationships
