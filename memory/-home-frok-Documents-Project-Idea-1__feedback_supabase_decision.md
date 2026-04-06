---
name: Keep Supabase for MVP
description: Decision to use Supabase free tier for auth/db/storage instead of building in-house — optimize for speed to market
type: feedback
---

Keep Supabase free tier for MVP phase. Don't build auth/storage in-house.

**Why:** User has 6.5 months until Oct 2026 halal deadline. Building auth in-house = 3-5 weeks wasted. Supabase free tier covers 100 users at Rp 0/month. Revenue will cover Pro plan (Rp 400K/month) 500x over by Phase 2.

**How to apply:** Use Supabase Auth, Supabase Storage, and Supabase PostgreSQL (via Drizzle ORM). Don't suggest alternatives or migrations until the user hits free tier limits or explicitly asks. Focus dev time on revenue-generating features (certification workflow, AI doc generator).
