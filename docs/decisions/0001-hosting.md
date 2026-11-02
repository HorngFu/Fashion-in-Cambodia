# 0001 — Hosting on Cloudflare Workers (free plan), static-first

- **Status:** Accepted
- **Date:** 2026-11-01
- **Phase:** 1

## Context

We want to host the Next.js site and the Keystatic admin on Cloudflare at no
cost to start. The Workers free plan has two limits that matter:

- **Worker size:** 3 MiB gzipped.
- **CPU time:** 10 ms per request.

Next.js 16.4 is used with Cache Components and Partial Prefetching enabled (the
`create-next-app` defaults).

## What we measured

Spike run on Linux (Docker, `node:24-bookworm`) with the Phase 1 app: one public
page, the Keystatic admin and its API route.

| Measurement                                 | Result                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Worker bundle (`wrangler deploy --dry-run`) | **6,231 KiB raw / 1,328 KiB gzipped — 43% of the free limit**                              |
| Static assets                               | 3.3 MB                                                                                     |
| `GET /` via `opennextjs-cloudflare preview` | 200, served from the prerender cache (`x-nextjs-cache: HIT`), ~26 ms warm                  |
| `GET /keystatic`                            | 200 (admin shell)                                                                          |
| `GET /does-not-exist`                       | 404 from cache                                                                             |
| `GET /api/keystatic/*` in production        | 400 — expected, local storage mode only works in `next dev` (GitHub mode comes in Phase 7) |

### Problems found

1. **A page that is not in the prerender cache hangs the Worker.** Running the
   bundle with plain `wrangler dev` (which skips OpenNext's cache population
   step) made `GET /` hang and the runtime cancelled it. Wrangler warned that
   _"Next.js cannot guarantee that Cache Components will run as expected due to
   the current runtime's implementation of `setTimeout()`"_. Rendering Cache
   Components pages at request time on Workers is therefore **not safe** with
   the current versions.
2. **OpenNext's build cannot run natively on Windows** — it fails creating
   symlinks (`EPERM`) unless Developer Mode is on or it runs in WSL/Linux.
   Cloudflare's build servers and GitHub Actions run Linux, so production is
   not affected.

## Decision

1. **Host on Cloudflare Workers via `@opennextjs/cloudflare`, free plan.** The
   bundle is well under the size limit, with room for the full Keystatic admin.
2. **Static-first is mandatory, not just preferred.**
   - The public site's root layout exports `ensureStatic = "navigation"`, so
     `next build` fails if any public page would need rendering per request.
   - Content is read through `"use cache"` functions with the `content`
     `cacheLife` profile (1-year revalidate). Content only changes by
     redeploying, which happens on every push to `main`.
3. **Incremental cache: `staticAssetsIncrementalCache`.** Prerendered pages are
   stored as Workers static assets. No R2 bucket or KV namespace is needed, so
   no payment method is needed either.
4. **Image optimisation off** (`images.unoptimized`). Cloudflare Images is a
   paid feature; images will be compressed before committing (Phase 3).
5. **The prerender cache is copied into the assets at build time.**
   `pnpm cf:build` runs `opennextjs-cloudflare populateCache local` right after
   the build (for the static-assets cache this is a plain file copy). Any
   command that uploads `.open-next/assets` therefore ships the prerendered
   pages — including plain `wrangler dev`/`deploy` and `wrangler preview`.
6. **Pull request previews use Worker Previews with the default command.**
   Workers Builds runs the **Previews Base → Preview command** for
   non-production branches; keep Cloudflare's default `npx wrangler preview`.
   `wrangler.jsonc` has the empty `previews` block that command requires.
   `opennextjs-cloudflare upload` does **not** work there: it fails with "The
   name in your wrangler.jsonc file … must match the name of your Worker"
   (seen 2026-11-02). **Previews Base is only a template:** each branch gets
   its own preview with a copy of those settings when its first build runs, so
   changing Previews Base does not affect existing branches — edit the
   branch's own preview (Worker → branch switcher → Settings) instead. **Retry
   build** also reuses the original build's settings; push a new commit to
   test a change.
7. **No `WORKER_SELF_REFERENCE` service binding.** OpenNext only uses it for
   revalidation queues; this site never revalidates, and Worker Previews cannot
   copy service bindings.
8. **CI guards the size:** `scripts/check-worker-size.mjs` fails the build above
   2,900 KiB gzipped.

## Consequences

- Every public URL must be known at build time (`generateStaticParams` for
  dynamic routes). Search, filters and "near me" run in the browser.
- Request-time features (form submissions in Phase 8) must be route handlers
  that do not use Cache Components rendering.
- Windows contributors use `pnpm dev` normally; `pnpm preview`/`pnpm deploy`
  need WSL or Developer Mode.

## When to revisit

- Bundle passes ~2,900 KiB gzipped → upgrade to Workers Paid ($5/month, 10 MiB),
  or move the Keystatic admin to its own Worker.
- Need for per-request rendering (accounts, reviews — Phase 12+) → re-test Cache
  Components on Workers with newer Next.js/OpenNext versions, or turn off
  `cacheComponents` for those routes, and consider Workers Paid for CPU time.
- Re-run this spike after major upgrades of `next` or `@opennextjs/cloudflare`.
- Adding on-demand revalidation (ISR, `revalidateTag`) → restore the
  `WORKER_SELF_REFERENCE` binding and configure an OpenNext queue.
