---
name: HapusJejak Product Overview
description: Standalone Indonesian privacy protection SaaS — removes phone numbers from caller ID apps, data brokers, monitors dark web exposure
type: project
---

HapusJejak ("Erase Your Trace") is a standalone B2C personal data protection service for Indonesia. Separate from PatuhIn (B2B compliance SaaS).

**Why:** Indonesia is #1 globally for spam calls (89%), 270M+ mobile users have numbers in 4-6+ leaked databases, zero consumer privacy protection services exist in Indonesia. Global TAM $1.68B → $7.99B by 2033.

**Core features (MVP):**
1. Free scan — check phone number exposure across GetContact, Truecaller, HIBP, data brokers
2. Automated removal from caller ID apps (GetContact, Truecaller, Sync.me, Eyecon, Hiya)
3. Show GetContact tags (what names people saved for your number)
4. UU PDP deletion request generator
5. Monthly re-scan + re-removal for Jaga tier
6. Breach alert notifications

**Pricing (updated 2026-04-06 — one-time per number model):**
- Scan Gratis: Rp 0 (see exposure count, details hidden)
- Hapus 1x: Rp 49K one-time per number (full details + tag names + removal + UU PDP letters)
- Jaga: Rp 149K/year (everything + monthly re-scan + re-removal + breach alerts + pinjol kit)

**Decision (2026-04-06):** User chose one-time payment per number over monthly subscription. Better fit for Indonesian prepaid/impulse-buy culture. Higher conversion rate expected (5-8% vs 2%).

**Tech stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Supabase (auth + DB), Drizzle ORM, Vercel
**Project location:** /home/frok/Documents/Project/Idea/1/hapusjejak/

**How to apply:** This is a B2C mass-market product. Prioritize viral scan flow, mobile-first UX, WhatsApp sharing. Payment via Midtrans (QRIS, GoPay, OVO, Dana).
