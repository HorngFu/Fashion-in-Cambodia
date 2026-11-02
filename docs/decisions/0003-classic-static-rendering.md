# 0003 — Turn off Cache Components; classic static rendering

- **Status:** Accepted
- **Date:** 2026-11-02
- **Phase:** 2
- **Changes:** [ADR 0001](0001-hosting.md) decision 2, [ADR 0002](0002-i18n-routing.md) decisions 3–4

## Context

`create-next-app` turned on Next.js 16's **Cache Components** and **Partial
Prefetching**. We kept them in Phase 1. In Phase 2 the Cloudflare preview
showed that every page Next.js renders **at request time** fails on Workers
with error 1101 (the Worker hung or threw), while every prerendered page works:

| URL                                                      | Result on Workers   |
| -------------------------------------------------------- | ------------------- |
| `/km`, `/en/about`, … (prerendered)                      | 200 from cache      |
| `/a/b/c` (matches no route → prebuilt 404)               | 404                 |
| `/xx`, `/km/xyz` (unlisted params → rendered on request) | **500, error 1101** |

This matches the Phase 1 finding: Wrangler warns that Next.js "cannot
guarantee that Cache Components will run as expected due to the current
runtime's implementation of `setTimeout()`". With Cache Components, Next.js
also forbids `dynamicParams = false`, so URLs that were not prerendered always
reach request-time rendering.

## Decision

1. **Turn off `cacheComponents` and `partialPrefetching`** in `next.config.ts`.
2. **Every dynamic route sets `dynamicParams = false`.** URLs outside
   `generateStaticParams` get the prebuilt 404 page (`global-not-found.tsx`)
   without rendering anything.
3. **`dynamic = "error"` on the `[locale]` layout** replaces
   `ensureStatic = "navigation"`: the build fails if a public page uses
   request-time APIs (cookies, headers, search params, uncached data).
4. **Content is read directly** in `src/lib/content.ts` (no `"use cache"` /
   `cacheLife`). It runs only during the build, because every page using it
   is prerendered.
5. The in-layout `[locale]/not-found.tsx` is removed: no page renders a 404
   at request time any more, so the bilingual global 404 covers every case.

## Consequences

- Unknown URLs always return a real 404, cheaply, on the free plan.
- If something does end up rendering on request (e.g. `/keystatic`, which is
  now a dynamic route), it uses the classic renderer that OpenNext supports,
  not the one that hangs.
- We lose Partial Prefetching's lighter link prefetches. That does not matter
  for a site made of static pages.
- 404 pages show both languages instead of only the current one.

## When to revisit

- When OpenNext documents full Cache Components support on Workers, and we
  need request-time rendering (accounts, reviews — Phase 12+).
