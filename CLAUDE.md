# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Fashion in Cambodia** — an open-source, non-profit directory where people find
fashion products, materials, tools and services, and the shops in Cambodia that
sell them. It is a directory, **not** a marketplace: no payments, no orders.

The master plan is [docs/DEVELOPMENT_PHASES.md](docs/DEVELOPMENT_PHASES.md).
When the user says "Start Phase N", read that file, follow the phase's tasks,
and respect the open decisions in its section 7 (ask if one blocks the work).

## Working on a phase

- One phase = one branch named `phase-N-<short-name>` = one pull request into `main`.
- `main` must always stay deployable.
- Finish every phase by: running lint, type-check and build (once the app exists);
  adding an entry to `CHANGELOG.md`; ticking the tasks and updating the
  progress tracker in `docs/DEVELOPMENT_PHASES.md`.
- Record significant technical decisions as short ADRs in `docs/decisions/NNNN-title.md`.

## Stack

- Next.js 16 (App Router, Cache Components, Partial Prefetching), TypeScript
  (strict) and Tailwind CSS 4, managed with **pnpm**. This Next.js is newer than
  most training data — read the bundled docs in `node_modules/next/dist/docs/`
  (see `AGENTS.md`).
- Keystatic CMS — content lives as files in `/content` (GitHub mode in production, local mode in dev).
- Hosted on Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`).
- next-intl with `/km` (default) and `/en` routes.
- Pagefind for search, MapLibre/Leaflet + OpenStreetMap for maps.

## Rules that keep hosting free

- **Static-first:** every public page is pre-rendered at build time
  (`generateStaticParams`). Do not add per-request server rendering, middleware
  that runs on every page, or server-side data fetching for public pages
  without asking. Rendering Cache Components pages at request time **hangs on
  Workers** — see [ADR 0001](docs/decisions/0001-hosting.md).
- The `(site)` root layout exports `ensureStatic = "navigation"`; keep it. Read
  content only through `src/lib/content.ts`, whose functions use `"use cache"` +
  `cacheLife("content")`.
- Run the Worker only through OpenNext (`pnpm preview` / `pnpm deploy`), never
  plain `wrangler dev`/`wrangler deploy` — they skip the prerender cache.
- OpenNext's build fails on native Windows (symlinks). Verify Cloudflare builds
  in CI, WSL or a Linux container (`node:24-bookworm`).
- The Worker only serves `/keystatic`, `/api/keystatic/*` and small form APIs.
- Do not add a paid service or a dependency that bloats the Worker bundle
  (free limit: 3 MiB compressed) without asking.
- Never commit secrets. Use `.dev.vars` locally and Cloudflare secrets in production.

## Conventions

- **All user-facing text must be translatable** — no hard-coded strings in
  components; use `messages/km.json` and `messages/en.json`.
- Content fields come in pairs: `name_km` / `name_en`, `description_km` / `description_en`.
- The shop → product relationship is stored **only on the shop** (`products[]`).
- Mobile first: design for a 360px-wide screen and slow connections.
- Accessibility: semantic HTML, alt text required, keyboard navigable, WCAG AA contrast.
- Lazy-load heavy components (maps) only on pages that need them.
- Keep images compressed (WebP, max width 1600px).

## Licenses

- Code: MIT (`LICENSE`). Content in `/content` and `/public/images`: CC BY-SA 4.0
  (`CONTENT_LICENSE.md`). Do not add photos or text copied from third parties.
