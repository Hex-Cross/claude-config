---
name: promo-video
description: Fully autonomous 19-second promo video pipeline. Agents decide all creative choices — theme, copy, animations, icons, CTA. User only reviews final output. Auto-triggers on "make a video", "promo video", etc. Usage: /promo-video [product name or project path]
user-invocable: true
auto-trigger: true
version: 3.0.0
---

# Promo Video — Autonomous 19-Second Video Pipeline

Creates a polished 19-second promo video **fully autonomously**. Agents make all creative decisions — theme, copy, hook, animations, icons, CTA. User only reviews the final rendered output.

**Template:** `/home/frok/Documents/Project/promo-video/`
**Auto-triggers on:** "make a video", "promo video", "video for my app", "product video", etc.

## Autonomy Principle

**Agents decide. User reviews.** Do NOT ask the user to choose themes, copy, icons, or styles. The creative agents make those decisions based on the product context. The user's only role is reviewing the final output and requesting changes if needed.

## Video Structure (8 visual beats in 19 seconds)

| Scene | Time | Content |
|-------|------|---------|
| Hook | 0-2s | Pattern interrupt — bold question/stat |
| Intro | 2-4.5s | Product name + tagline pop-in |
| Features | 4.5-13.5s | 1-5 feature cards with alternating slides |
| Social Proof | ~13.5-15s | Counter animation |
| CTA | 15-19s | Action text + pulsing button + fade out |

## Step 0: Auto-Setup

```bash
mkdir -p .promo-video/{concepts,output}
```

Generate video ID: `promo-{YYYYMMDD-HHMMSS}`

Check template exists and has node_modules:
```bash
cd /home/frok/Documents/Project/promo-video
[ -d node_modules ] || npm install
```

## Step 1: Auto-Gather Brief (NO questions to user)

**If user provided a project path or is in a project directory:**
Scan automatically — NO questions asked:
- `package.json` → name, description, keywords
- `README.md` → features, tagline, what it does
- `src/` or `app/` → detect tech stack for icon/theme choices
- Any landing page / marketing files → CTA, branding
- `.env.example` → detect integrations for feature ideas

**If user just said "make a video for X":**
Use "X" as product name. Generate everything else:
- Tagline — agent writes it
- Features — agent invents 3 based on product name + any context
- CTA — agent decides (verb-first: "Start building free", "Try it now", etc.)
- Theme — agent picks from: techy, corporate, playful, minimal, cyber
- Hook — agent writes a scroll-stopping question or stat

**If user said just "make a promo video" with no product:**
Ask ONE question only: "What product/app is this for?" Then auto-generate everything.

## Step 2: Creative Agents (2 IN PARALLEL, fully autonomous)

### Agent 1: Creative Director (model: "opus")
Spawn **general-purpose** agent:
```
You are an autonomous video creative director. Make ALL creative decisions — do NOT defer to the user.

Product: {product_name}
Context: {any scanned info from project}

You must decide:
1. HOOK (0-2s): Write a scroll-stopping question or stat. Style: "question"|"stat"|"bold"
2. THEME: Pick from techy/corporate/playful/minimal/cyber based on product type
3. SOCIAL PROOF: Write a credibility line (e.g., "Trusted by 10,000+ developers") or disable if not appropriate
4. ANIMATION SPEED: Pick 0.8-1.2 based on content density
5. CTA BUTTON STYLE: gradient/outline/solid — pick what fits the theme
6. MOOD: 3 keywords describing the video feel

Output ONLY this JSON (no markdown, no explanation):
{
  "hook": { "text": "...", "style": "question|stat|bold" },
  "themePreset": "techy|corporate|playful|minimal|cyber",
  "socialProof": { "enabled": true|false, "text": "..." },
  "animationSpeed": 0.8-1.2,
  "cta": { "buttonStyle": "gradient|outline|solid" },
  "mood": ["word1", "word2", "word3"]
}

Write to: .promo-video/concepts/{video-id}-CONCEPT.md
```

### Agent 2: Copywriter (model: "sonnet")
Spawn **general-purpose** agent:
```
You are an autonomous video copywriter. Write ALL copy — do NOT ask the user for input.

Product: {product_name}
Context: {any scanned info from project}

Write copy optimized for 3-second reading speed:
- Product name display: max 2 words (abbreviate if needed)
- Tagline: max 8 words
- 3 feature titles: max 3 words EACH
- 3 feature descriptions: max 6 words EACH  
- CTA text: max 5 words, MUST start with a verb
- CTA URL/action: the product URL or "Get Started"

Pick an icon for each feature from: bolt, shield, rocket, star, zap, chart, users, clock, lock, globe, code, heart, check, trending, cpu

Output ONLY this JSON:
{
  "productName": "...",
  "tagline": "...",
  "features": [
    { "title": "...", "description": "...", "icon": "..." },
    { "title": "...", "description": "...", "icon": "..." },
    { "title": "...", "description": "...", "icon": "..." }
  ],
  "cta": { "text": "...", "url": "..." }
}

Write to: .promo-video/concepts/{video-id}-COPY.md
```

## Step 3: Build Config (automated, no user input)

Read both agent outputs. Merge into config:

```bash
cp -r /home/frok/Documents/Project/promo-video /tmp/promo-{video-id}
cd /tmp/promo-{video-id}
```

Edit `src/config.ts`:
- `productName` ← copy agent
- `tagline` ← copy agent
- `hook` ← concept agent
- `features` ← copy agent (with icons)
- `cta.text`, `cta.url` ← copy agent
- `cta.buttonStyle` ← concept agent
- `themePreset` ← concept agent
- `theme` ← apply: `{ ...THEME_PRESETS[preset] }`
- `socialProof` ← concept agent
- `animationSpeed` ← concept agent
- `aspectRatio` ← "9:16" default (render all 3 in batch)

Auto-adjust typography if product name > 12 chars: reduce `titleSize` to 72.

## Step 4: Pre-flight & Render (automated)

```bash
npm run preflight
npm run build:all   # renders 9:16, 16:9, 1:1
```

Copy outputs:
```bash
cp out/*.mp4 {original-dir}/.promo-video/output/
```

## Step 5: Supervisor Review (automated quality gate)

Invoke `/supervisor-review` scoring against:
1. Hook is a pattern interrupt (not gentle fade) — PASS/FAIL
2. All 8 visual beats present — PASS/FAIL
3. CTA starts with a verb — PASS/FAIL
4. Feature count matches config — PASS/FAIL
5. No text overflow — PASS/FAIL
6. Theme is consistent — PASS/FAIL
7. Copy is punchy (no word > 6 words per line) — PASS/FAIL

If score < 9/10: auto-revise (agents re-generate failing elements, max 2 loops).
If score >= 9/10: proceed to delivery.

## Step 6: Present to User (the ONLY user interaction)

Show a clean summary:

```
Video Ready

Product: {name}
Hook: "{hook text}"
Theme: {preset}
Features: {feat1} | {feat2} | {feat3}
CTA: "{cta text}" → {url}

Output files:
  .promo-video/output/promo-vertical.mp4  (9:16, 1080x1920)
  .promo-video/output/promo-horizontal.mp4 (16:9, 1920x1080)
  .promo-video/output/promo-square.mp4    (1:1, 1080x1080)

To customize: edit src/config.ts → npm run build
To preview: npm start (opens browser)
```

User can then:
- Accept as-is
- Request changes ("make the hook more aggressive", "switch to cyber theme", "change CTA to...")
- Changes loop back to Step 3 with the specific adjustment

## Config Reference

### Theme Presets (agent picks automatically)
| Preset | Best For |
|--------|----------|
| `techy` | Developer tools, SaaS, APIs |
| `corporate` | Enterprise, B2B, consulting |
| `playful` | Consumer apps, games, social |
| `minimal` | Design tools, premium products |
| `cyber` | Security, crypto, AI products |

### Icons (15 — agent picks per feature)
`bolt` `shield` `rocket` `star` `zap` `chart` `users` `clock` `lock` `globe` `code` `heart` `check` `trending` `cpu`

### Animation Entrances
`spring` `slide-up` `slide-left` `fade` `scale-pop`

### Aspect Ratios (all rendered by default)
| Platform | Ratio | File |
|----------|-------|------|
| TikTok / Reels / Shorts | 9:16 | promo-vertical.mp4 |
| YouTube / Twitter | 16:9 | promo-horizontal.mp4 |
| Instagram Feed | 1:1 | promo-square.mp4 |
