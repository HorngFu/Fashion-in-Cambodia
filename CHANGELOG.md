# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Entries are grouped by development phase (see
[docs/DEVELOPMENT_PHASES.md](docs/DEVELOPMENT_PHASES.md)).

## [Unreleased]

### Phase 2 — Design system & layout

#### Added

- Khmer and English versions of every page under `/km` and `/en` (next-intl,
  no middleware); `/` redirects to `/km`. See ADR 0002.
- Translations in `messages/km.json` and `messages/en.json`, with a CI check
  that both have the same keys (`pnpm check:messages`).
- Kantumruy Pro font for Khmer and Latin, with extra line height for Khmer.
- Silk-inspired color tokens with light and dark mode; all text meets WCAG AA.
- Header (logo, navigation, search box, language switcher), mobile menu and footer.
- UI components: Button, Card, Badge, Tag, Breadcrumbs, EmptyState, SmartImage.
- Placeholder home page and "coming soon" pages for sections not built yet.
- Translated 404 page inside the site layout, plus a bilingual global 404.
- Canonical and language-alternate links on every page (`NEXT_PUBLIC_SITE_URL`).

### Phase 1 — Scaffold + Cloudflare deploy spike

#### Added

- Next.js 16 app (App Router, TypeScript strict, Tailwind CSS 4, ESLint, Prettier, pnpm).
- Cloudflare Workers hosting via `@opennextjs/cloudflare` with a free-plan
  configuration (static-assets incremental cache, no R2/KV, image optimisation off).
- Keystatic CMS in local mode with a test `categories` collection and one sample entry.
- Placeholder home page that reads categories from Keystatic at build time.
- `ensureStatic = "navigation"` on the public site so the build fails if a page
  would need per-request rendering.
- Cloudflare Web Analytics, enabled by the `NEXT_PUBLIC_CF_BEACON_TOKEN` build variable.
- GitHub Actions CI: format, lint, type-check, Cloudflare build and Worker size check.
- `docs/CLOUDFLARE_SETUP.md` — step-by-step Cloudflare dashboard setup.
- First deploy to <https://fashion-in-cambodia.horngfu.workers.dev> (from the terminal, built in a Linux container).
- `docs/decisions/0001-hosting.md` — hosting spike results (Worker 1.3 MiB
  gzipped, 43% of the free limit).

### Phase 0 — Project foundations

#### Added

- Development phases plan (`docs/DEVELOPMENT_PHASES.md`).
- `README.md` in English with a Khmer summary.
- `LICENSE` (MIT) for code and `CONTENT_LICENSE.md` (CC BY-SA 4.0) for content and data.
- `CONTRIBUTING.md` covering non-coding and code contributions.
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1).
- GitHub issue forms: suggest a shop, report wrong information, bug report, feature request.
- Pull request template.
- `.gitignore`, `.gitattributes`, `.editorconfig`.
- `CLAUDE.md` with project conventions.
