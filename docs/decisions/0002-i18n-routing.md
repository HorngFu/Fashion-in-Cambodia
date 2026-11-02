# 0002 — Khmer/English routing without middleware

- **Status:** Accepted
- **Date:** 2026-11-02
- **Phase:** 2

## Context

The site is in Khmer (default) and English. The usual next-intl setup uses
middleware (called "proxy" in Next.js 16) to detect the language and rewrite
URLs. Middleware runs on **every request**, which works against our
static-first hosting ([ADR 0001](0001-hosting.md)). Next.js 16 with Cache
Components also does not allow `dynamicParams = false`, so URLs that were not
prerendered are rendered on request instead of being rejected up front.

## Decision

1. **Locale in every URL:** `/km/...` and `/en/...` (`localePrefix: "always"`),
   one prerendered page per language. Configured in `src/i18n/routing.ts`.
2. **No middleware.** `/` redirects to `/km` with a `redirects()` rule in
   `next.config.ts`. No language detection from the browser for now.
3. **Static rendering with next-intl:** every layout and page calls
   `setRequestLocale(locale)` before using translations, so next-intl never
   reads request headers. The `[locale]` layout keeps
   `ensureStatic = "navigation"`, which fails the build if this is missed.
4. **Unknown URLs:**
   - Pages call `toLocale()`, which calls `notFound()` for unknown languages.
   - The layout uses `resolveLocale()`, which falls back to Khmer, so
     `[locale]/not-found.tsx` can show a translated 404 inside the normal
     layout (e.g. `/xx`, `/km/unknown`).
   - `global-not-found.tsx` (bilingual) covers URLs that match no route at all
     (e.g. `/a/b/c`).
5. **Placeholder sections:** `[locale]/[section]/page.tsx` renders "coming
   soon" for nav targets that are not built yet. A real folder such as
   `[locale]/shops/` takes priority, so phases replace it one section at a time.
6. **Translations** live in `messages/km.json` and `messages/en.json`, typed
   from `en.json` (`src/global.d.ts`). `pnpm check:messages` (run in CI) fails
   if the two files do not have the same keys.
7. **Language switcher** swaps the first URL segment of the real pathname
   rather than using next-intl's locale-aware `usePathname`. Next.js 16 keeps
   the previous page mounted but hidden for back/forward navigation, and the
   hidden copy otherwise produced wrong links such as `/km/en/shops`.

## Consequences

- Visitors who land on `/` always get Khmer first; the switcher is in the header.
- Requests for unknown languages or sections render a 404 on request. This is
  cheap (no content is read), but it is request-time rendering, so it must be
  checked on Workers whenever routing changes.
- Adding a language means adding it to `routing.locales` and a new
  `messages/<locale>.json`.

## When to revisit

- If many visitors arrive at `/` and want English → consider a tiny
  `Accept-Language` redirect, measuring its CPU cost on the free plan.
