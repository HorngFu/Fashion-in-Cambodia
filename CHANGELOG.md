# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Entries are grouped by development phase (see
[docs/DEVELOPMENT_PHASES.md](docs/DEVELOPMENT_PHASES.md)).

## [Unreleased]

### Phase 4 — Core public pages

#### Added

- Category index and category pages (sub-categories and products).
- Product pages with **Where to buy**: shops grouped by province, online
  sellers last, with each shop's price note.
- Shops index with province and type filters (in the browser, kept in the URL).
- Shop pages: what they sell, call / Telegram / social buttons, location with
  Google Maps directions, opening hours, last-checked date and a pre-filled
  "Report wrong information" link. Sample shops show a notice and are `noindex`.
- Province index (shop counts) and province pages (shops, popular products).
- Text pages About, Contribute, FAQ and Privacy from `content/pages`,
  rendered from Markdoc at build time.
- Home page: featured categories and shops from Site settings, provinces with
  shops, all linked to their pages. Footer "About" column.
- `pnpm check:links` crawls the built site for broken internal links (in CI).

#### Changed

- Page bodies use Keystatic's Markdoc field (`.md` files) instead of MDX, so
  they can be rendered with the Markdoc library Keystatic already includes.

### Phase 3 — Content model in Keystatic

#### Added

- Keystatic collections for shops, products, categories, provinces and pages,
  plus a site-settings singleton, with English (required) and Khmer fields.
- Validation in the editor: required fields, URL-name format, Cambodian phone
  numbers, and map positions pasted from Google Maps.
- Seed data: all 25 provinces with map centers, 37 categories in two levels,
  22 products with search keywords, 10 sample shops (marked as samples) and an
  About page.
- Typed content reader (`src/lib/content.ts`) with helpers such as
  `getShopsForProduct`, `getShopsByProvince`, `getProductsInCategory` and
  `localized()`.
- `pnpm check:content`: checks every entry against the schema, references
  between entries, map positions inside Cambodia and verified dates (in CI).
- `pnpm images` / `pnpm images:check`: convert photos to WebP at most
  1600 px wide and 500 KB, updating paths in `/content` (check runs in CI).
- `docs/EDITOR_GUIDE.md` with screenshots: how to add and update a shop.

#### Changed

- Home page shows the six top-level categories with descriptions.

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
- Bilingual 404 page, served prebuilt for any unknown URL.
- Canonical and language-alternate links on every page (`NEXT_PUBLIC_SITE_URL`).

#### Changed

- Turned off Next.js Cache Components and Partial Prefetching: pages rendered
  on request with them failed on Cloudflare Workers (error 1101). Pages are
  plain static pages with `dynamic = "error"` and `dynamicParams = false`
  (ADR 0003).
- Cloudflare preview builds keep the default `npx wrangler preview` command;
  documented that each branch's preview keeps its own copy of the settings.

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
