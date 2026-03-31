---
name: PatuhIn Project Overview
description: Indonesian regulatory compliance SaaS platform (halal, BPOM, TKDN, PDP) - current state and what's built
type: project
---

PatuhIn is a regulatory compliance platform for Indonesian businesses, targeting halal certification (Oct 2026 deadline), BPOM registration, TKDN, and UU PDP compliance.

**Why:** 64M MSMEs need mandatory halal certification by Oct 2026. Consultants charge Rp 30 juta. No tech solution exists. PatuhIn = "TurboTax for Indonesian compliance" at Rp 299K/month.

**Tech stack:** Next.js 16.2.1, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, tRPC 11, Drizzle ORM, Supabase (auth + DB), next-intl (id/en).

**What's built (as of 2026-03-31):**
- Full DB schema (orgs, users, products, certifications, workflow steps, documents, alerts, regulations, audit log)
- tRPC routers (product CRUD, certification lifecycle, dashboard summary)
- Mock auth system with demo accounts
- Dashboard, products, certifications (list + detail with workflow), marketing pages (landing, pricing)
- Responsive layout (sidebar desktop, bottom-nav mobile)
- i18n (Indonesian + English)
- Only 2 git commits — very early stage

**What's NOT built yet:**
- Document upload functionality
- Real Supabase auth integration (currently mock)
- Regulations, Settings, Documents, Alerts pages (placeholders)
- Email (Resend), WhatsApp (Wati), Payment (Midtrans) integrations
- AI features (document generation, ingredient analysis)
- Consultant marketplace

**How to apply:** This is a Phase 1 startup product. Priority should be completing the core compliance workflow before adding AI or marketplace features.
