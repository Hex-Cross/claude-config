---
name: i18n-sync
description: Localization workflow — string extraction, Bahasa/English translation files, domain glossary, completeness validation
user-invocable: true
version: 1.0.0
---

# i18n-sync

Manages localization for bilingual Bahasa Indonesia / English applications.

## Phase 1: Detection

1. Identify i18n library in use: `next-intl`, `i18next`, `react-i18next`, or none.
2. Locate existing translation files (`id.json`, `en.json`, or locale directories).
3. Detect the project's namespace/key structure (flat vs nested).
4. If no i18n library is found, recommend `next-intl` for Next.js or `i18next` otherwise.

## Phase 2: String Extraction

1. Scan all JSX/TSX files for hardcoded user-facing strings (text content, aria-labels, placeholders, alt text).
2. Ignore non-translatable strings: CSS classes, import paths, env vars, numeric literals.
3. Generate a candidate list with file path, line number, and suggested translation key.
4. Group keys by component or route domain (e.g., `auth.loginButton`, `dashboard.title`).

## Phase 3: Translation File Generation

1. Create or update `id.json` and `en.json` in the project's locale directory.
2. Preserve existing translations — only add new keys, never overwrite.
3. For Bahasa Indonesia translations, use formal register (baku) unless context demands informal.
4. Replace hardcoded strings in source files with `t('key')` calls using the detected library API.

## Phase 4: Missing Translation Detection

1. Diff keys between `id.json` and `en.json` — flag keys present in one but not the other.
2. Detect empty-string values (key exists but translation is blank).
3. Report orphaned keys (keys in JSON that no component references).
4. Output a summary table: total keys, translated, missing, orphaned — per locale.

## Phase 5: Domain Glossary

1. Maintain `glossary.json` mapping domain/business/compliance terms to canonical translations.
2. Enforce glossary consistency — flag deviations (e.g., "kebijakan privasi" vs "privacy policy").
3. Common terms: akun (account), masuk (login), daftar (register), syarat & ketentuan (terms & conditions), kebijakan privasi (privacy policy), transaksi (transaction), saldo (balance).
4. Allow project-specific overrides via `glossary.overrides.json`.

## Phase 6: Release Validation

1. Run completeness check: every key must have a non-empty value in both locales.
2. Verify all `t()` calls reference keys that exist in translation files.
3. Check for interpolation mismatches (`{{name}}` in one locale but not the other).
4. Exit non-zero if any untranslated or mismatched strings remain — blocks CI.

## Phase 7: RTL Readiness (Future)

1. When Arabic locale is added, detect and flag RTL layout requirements.
2. Ensure CSS logical properties are used (`margin-inline-start` vs `margin-left`).
3. Add `dir="rtl"` attribute guidance for the new locale.
