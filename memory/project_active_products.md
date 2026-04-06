---
name: Active product initiatives
description: PatuhIn (Indonesian compliance SaaS) and Niaga (Indonesian business management) — current projects with key context
type: project
last_verified: 2026-04-01
---

## PatuhIn — Indonesian Regulatory Compliance SaaS
"TurboTax for Indonesian compliance" — halal, BPOM, TKDN, UU PDP.

**Key deadline:** October 17, 2026 — mandatory halal certification for all products in Indonesia.

**Tech stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, tRPC 11, Drizzle ORM, Supabase (auth + DB + storage), next-intl (id/en).

**What's built:** DB schema, tRPC routers, mock auth, dashboard, products, certifications, marketing pages, i18n. Very early stage (2 commits).

**What's NOT built:** Document upload, real Supabase auth, regulations/settings/documents/alerts pages, email/WhatsApp/payment integrations, AI features, consultant marketplace.

**Business model:** SaaS subscription primary (Rp 299K-15Juta/month). Target 100 paying customers by month 6. LTV:CAC 9.6:1.

**Decision:** Keep Supabase free tier for MVP. Don't build auth in-house — focus dev time on revenue-generating features.

## Niaga — Indonesian Business Management Platform
Unified, mobile-first, offline-capable platform for 20-200 employee SMEs (finance, inventory, tax, HR, POS).

**Tech stack:** Next.js 16, Vercel, Neon Postgres, Clerk, AI SDK v6, Chat SDK, Workflow DevKit. Bahasa Indonesia primary UI.

**Key differentiator:** Genuine cross-module integration (sale -> inventory -> journal -> tax invoice in one flow). Indonesian tax compliance as moat (Coretax, e-Faktur, PPh 21 TER).

**Design priorities:** Mobile-first (80%+ users on Android), WhatsApp as primary notification channel, offline capability.

**Why:** 500K-1M addressable businesses, only 5-8% SaaS penetration in Indonesian mid-market.
