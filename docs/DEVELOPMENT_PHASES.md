# Fashion in Cambodia — Development Phases

> An open-source, non-profit platform that helps fashion lovers in Cambodia find
> fashion products, materials and tools — and the shops across the country where
> they can buy them.

This document is the master plan. It is written so you can build the platform
**one phase at a time** by asking Claude something like:

```text
Start Phase 2 from docs/DEVELOPMENT_PHASES.md
```

Each phase lists its goal, tasks, "done when" checks and cost. When a phase is
finished, tick its boxes in the [Progress tracker](#progress-tracker) and commit.

---

## Table of contents

1. [How to use this document](#1-how-to-use-this-document)
2. [Vision and scope](#2-vision-and-scope)
3. [Recommended tech stack](#3-recommended-tech-stack)
4. [Architecture](#4-architecture)
5. [Content model](#5-content-model)
6. [Cost plan: free first, paid later](#6-cost-plan-free-first-paid-later)
7. [Decisions needed from you](#7-decisions-needed-from-you)
8. [Phases](#8-phases)
9. [Progress tracker](#progress-tracker)
10. [Future ideas backlog](#10-future-ideas-backlog)

---

## 1. How to use this document

**Asking for a phase**

| You say                  | What happens                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `Start Phase N`          | Claude reads this file, creates a branch `phase-N-<name>`, implements the tasks, runs checks, and summarizes what is done. |
| `Continue Phase N`       | Picks up unfinished tasks in that phase.                                                                                   |
| `Phase N, only task N.3` | Does a single task.                                                                                                        |
| `Review Phase N`         | Checks the "done when" list against the code and reports gaps.                                                             |
| `Update the plan: …`     | Edits this document (add/remove/reorder phases).                                                                           |

**Rules for every phase**

- One phase = one branch = one pull request into `main`.
- Each phase must leave the site **deployable** — no half-broken `main`.
- Every phase ends with: lint + type-check + build pass, and a short entry in
  `CHANGELOG.md`.
- If a phase needs a decision from [section 7](#7-decisions-needed-from-you)
  that is not answered yet, Claude asks before writing code.

---

## 2. Vision and scope

### Who uses it

| User                            | What they want                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Fashion lover / shopper**     | "Where can I buy a silk krama / a sewing machine / buttons / leather in Phnom Penh or Siem Reap?" |
| **Designer / tailor / student** | Find suppliers of fabric, thread, tools, mannequins, printing, embroidery services.               |
| **Shop owner**                  | Be listed for free so customers can find them. Later: update their own listing.                   |
| **Volunteer editor (NGO team)** | Add and verify shops and products through a simple admin UI — no coding.                          |
| **Tourist**                     | Find authentic Cambodian products (silk, krama, handmade items) and where to get them.            |

### MVP (first public launch) includes

- Browse **product categories** (e.g. Fabrics → Silk, Tools → Sewing machines).
- **Product pages** showing which shops carry them.
- **Shop pages** with address, map, phone, Telegram, Facebook, opening hours, photos.
- **Browse by province / city** (all 25 provinces).
- **Search and filters** (product, category, province, price range).
- **Map** of shops.
- **Khmer and English** language.
- **Suggest a shop / report wrong info** form.
- Admin CMS (Keystatic) for volunteer editors.

### Not in MVP (later phases)

User accounts, reviews/ratings, online ordering or payments, shop-owner
self-service dashboards, events calendar, mobile app. See
[Future ideas backlog](#10-future-ideas-backlog).

> The site is a **directory**, not a marketplace. We never handle money. This
> keeps it legally simple and cheap to run as an NGO project.

---

## 3. Recommended tech stack

| Concern                 | Choice                                                                                                                         | Why                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Framework               | **Next.js (App Router) + TypeScript**                                                                                          | Your choice; great SEO with static generation.                                                                                       |
| Styling                 | **Tailwind CSS** + small own component set                                                                                     | Fast, small CSS, no heavy UI library.                                                                                                |
| CMS                     | **Keystatic** (GitHub mode)                                                                                                    | Your choice; content lives in the Git repo as files, free, open-source friendly.                                                     |
| Hosting                 | **Cloudflare Workers** via **OpenNext** (`@opennextjs/cloudflare`)                                                             | Cloudflare's current recommended way to run Next.js. Static files are served free and unlimited.                                     |
| i18n                    | **next-intl** with `/km` and `/en` routes                                                                                      | Khmer default, English second.                                                                                                       |
| Khmer font              | **Kantumruy Pro** or **Noto Sans Khmer** (Google Fonts, self-hosted via `next/font`)                                           | Good Khmer rendering, free license.                                                                                                  |
| Search                  | **Pagefind** (static search index built at deploy)                                                                             | Free, no server, supports filters, works offline-ish, handles Khmer text reasonably. Fallback: Fuse.js / FlexSearch on a JSON index. |
| Maps                    | **MapLibre GL** or **Leaflet** + free tiles (OpenStreetMap / MapTiler free tier); later **Protomaps PMTiles on Cloudflare R2** | Free, no Google Maps billing. "Open in Google Maps" button for directions.                                                           |
| Forms / spam protection | **Cloudflare Turnstile** + a small API route that opens a **GitHub Issue**                                                     | Free, no database needed for MVP.                                                                                                    |
| Analytics               | **Cloudflare Web Analytics**                                                                                                   | Free, privacy-friendly, no cookie banner needed.                                                                                     |
| Images                  | Stored in repo (compressed on commit) → later **Cloudflare R2**                                                                | Free at first; R2 has 10 GB free and zero egress fees.                                                                               |
| Code quality            | ESLint, Prettier, TypeScript strict, Vitest (unit), Playwright (a few e2e smoke tests)                                         |                                                                                                                                      |
| CI/CD                   | **GitHub Actions** (lint/test) + **Cloudflare Workers Builds** (deploy on push)                                                | Free for public repos.                                                                                                               |
| Package manager         | **pnpm**                                                                                                                       | Fast, disk-efficient.                                                                                                                |

### Important technical note (verified in Phase 1)

Cloudflare's **free** Workers plan has two limits that matter for Next.js:

- **Worker size ≤ 3 MiB** (compressed). Measured in Phase 1: **1.3 MiB** with the Keystatic admin (43%).
- **10 ms CPU per request**. Server-rendering a page on every request can exceed it.

**Our strategy: "static-first".** Because all content lives in Git, every public
page is **pre-rendered at build time** (`generateStaticParams`). Visitors get
static HTML from Cloudflare's edge (free, unlimited, fast). The Worker only runs
for the Keystatic admin and the small form API.

**Fallback if the size limit is exceeded:** either
(a) upgrade to Workers Paid ($5/month, 10 MiB limit), or
(b) split into two deployments: the public site as a pure static export, and
the Keystatic admin as a separate small Worker / local-only tool.
Phase 1 spike result: **neither is needed** — see [ADR 0001](decisions/0001-hosting.md). It also found that
pages **must** be prerendered: rendering at request time on Workers hangs with the current
Next.js Cache Components, so the build now enforces static pages.

---

## 4. Architecture

```text
                   ┌──────────────────────────── GitHub repo (open source) ─────────────────────────────┐
                   │  /src  (Next.js code)        /content (Keystatic JSON/MDX/YAML)   /public/images      │
                   └──────────────▲──────────────────────────────┬───────────────────────────────────────┘
                                  │ commits / PRs                │ push to main triggers build
                                  │                              ▼
  Volunteer editor ──► /keystatic admin UI ──────────► Cloudflare Workers Builds
  (GitHub login)       (runs on the Worker)                       │  next build + pagefind index
                                                                  ▼
                                               ┌──────── Cloudflare (free plan) ────────┐
  Visitor (phone) ──── HTTPS ────────────────► │  Static assets: all pages, images,     │
                                               │  search index  (free, unlimited)       │
                                               │  Worker: /keystatic, /api/suggest      │
                                               └───────────────┬────────────────────────┘
                                                               │ /api/suggest (Turnstile-checked)
                                                               ▼
                                                     GitHub Issue "New shop suggestion"
                                                     → editor reviews → adds via Keystatic
```

**Proposed folder layout**

```text
/content
  /categories/<slug>.yaml
  /products/<slug>/index.yaml
  /shops/<slug>/index.yaml (+ images)
  /provinces/<slug>.yaml
  /pages/<slug>.mdx           (About, How to contribute, …)
  /settings/site.yaml         (singleton: site name, socials, contact)
/src
  /app/[locale]/...           (pages)
  /app/keystatic/...          (admin UI)
  /app/api/keystatic/...      (Keystatic API)
  /app/api/suggest/route.ts   (contribution form)
  /components  /lib  /i18n
/keystatic.config.ts
/messages/km.json  /messages/en.json   (UI text translations)
/docs                                  (this file, contributor docs)
```

---

## 5. Content model

All content types have **Khmer and English** fields for names and descriptions
(English required at first; Khmer optional, shown when present — adjust in
section 7).

### Category

`name_km`, `name_en`, `slug`, `parent` (optional, for sub-categories), `icon`, `order`.

Starter tree (editable):

- **Fabrics & Textiles** — silk, cotton, krama, denim, lace, leather
- **Clothing** — traditional (sampot, chang kben), modern, school/uniforms, second-hand
- **Accessories** — bags, jewelry, shoes, hats, scarves
- **Tools & Equipment** — sewing machines, scissors, mannequins, irons, pattern tools
- **Materials & Supplies** — thread, buttons, zippers, beads, dyes, labels
- **Services** — tailoring, alteration, embroidery, printing, dyeing, repair

### Product (a _type_ of product, not a single stock item)

`name_km`, `name_en`, `slug`, `category`, `description`, `images[]`,
`tags[]`, `is_cambodian_made` (bool), `typical_price_range` (optional, in USD/KHR).

### Shop

`name_km`, `name_en`, `slug`, `description`, `logo`, `photos[]`,
`province`, `district`, `address`, `latitude`, `longitude`, `google_maps_url`,
`phone[]`, `telegram`, `facebook`, `instagram`, `tiktok`, `website`,
`opening_hours`, `shop_type` (physical / online-only / market stall / workshop),
`market_name` (e.g. Russian Market, Orussey, Central Market),
**`products[]`** (relationship → Product, with optional `price_note`),
`categories[]`, `verified` (bool), `last_verified_date`, `status` (active / closed).

> The shop → product link is stored **only on the shop** to avoid keeping two
> lists in sync. Product pages find their shops at build time.

### Province

`name_km`, `name_en`, `slug`, `center_lat`, `center_lng`, `zoom`. Seeded with all
25 provinces of Cambodia.

### Page (MDX)

About us, Contribute, Privacy, Terms, FAQ.

### Site settings (singleton)

Site name, tagline, contact email, social links, featured categories/shops on home.

---

## 6. Cost plan: free first, paid later

### Stage A — Free ($0/month)

| Service                     | Free allowance                                        | Enough for                                                |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| Cloudflare Workers (free)   | 100,000 dynamic requests/day; static assets unlimited | Tens of thousands of visitors/day, since pages are static |
| Cloudflare Web Analytics    | Free                                                  | Analytics                                                 |
| Cloudflare Turnstile        | Free                                                  | Spam protection                                           |
| Cloudflare R2 (when needed) | 10 GB storage, zero egress                            | Images, map tiles                                         |
| GitHub (public repo)        | Free, unlimited Actions minutes for public repos      | Code + content + CI                                       |
| Keystatic (GitHub mode)     | Free, open source                                     | CMS                                                       |
| Domain                      | Use free `*.workers.dev` subdomain at first           | —                                                         |

**Only optional cost:** a custom domain, e.g. `.org` ≈ $10/year via Cloudflare
Registrar (at-cost pricing). `.com.kh` / `.org.kh` require local registration
through a Cambodian registrar — decide in section 7.

### Stage B — Light paid (~$5/month + domain)

Move here when **any** trigger happens:

- Worker bundle exceeds 3 MiB, or CPU-time errors appear.
- More than ~70,000 dynamic requests/day for several days.
- You want Workers features like longer CPU time, more cron jobs, queues.

Upgrade: **Workers Paid $5/month** (10M requests/month included, 10 MiB worker).

### Stage C — Growing platform (~$5–30/month)

Triggers: user accounts, reviews, shop owners editing their own listings,
thousands of shops, images > 1 GB in Git.

Add as needed:

- **Cloudflare D1** (SQLite database) for user-generated data — generous free tier, then pay per use.
- **Cloudflare R2** for images (move them out of Git).
- **Cloudflare Images** for resizing (paid per image) if needed.
- Keep editorial content (categories, guides) in Keystatic/Git; move high-volume
  data (shops, reviews) to D1 when Git becomes slow to manage (~2,000+ shops).

### Funding ideas for an NGO

GitHub Sponsors, Open Collective (fiscal hosting for open-source projects),
Cloudflare Project Galileo (free paid-plan features for eligible non-profits),
local sponsors (fashion schools, textile associations) credited on an About page.

---

## 7. Decisions needed from you

Please answer these (edit this section, or just tell Claude). Items marked
**(default)** will be used if you do not answer.

| #   | Question                                                                          | Default                                                                                     |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| D1  | Project / brand name and domain?                                                  | "Fashion in Cambodia", `fashion-in-cambodia.<account>.workers.dev` until a domain is bought |
| D2  | Default language: Khmer or English? Is Khmer required for every entry?            | Khmer default UI; English content required, Khmer optional                                  |
| D3  | Code license?                                                                     | **MIT**                                                                                     |
| D4  | Content/data license (shop listings, text, photos)?                               | **CC BY-SA 4.0** (others can reuse with credit)                                             |
| D5  | Who can edit content in Keystatic?                                                | GitHub accounts added as repo collaborators                                                 |
| D6  | Show prices?                                                                      | Only an optional "typical price range" note, no live prices                                 |
| D7  | Include online-only shops (Facebook/Telegram sellers)?                            | Yes, with `shop_type = online-only` and no map pin                                          |
| D8  | Include second-hand / thrift shops?                                               | Yes, as a category                                                                          |
| D9  | Where do "Suggest a shop" submissions go?                                         | GitHub Issues with label `suggestion`                                                       |
| D10 | Brand colors / logo?                                                              | Simple placeholder theme inspired by Cambodian silk colors; replace later                   |
| D11 | Is there a registered NGO / legal entity, or is this a community project for now? | Community project; About page wording kept neutral                                          |

---

## 8. Phases

Overview:

| Phase | Name                            | Result                                                   |
| ----- | ------------------------------- | -------------------------------------------------------- |
| 0     | Project foundations             | Open-source repo ready (README, license, contributing)   |
| 1     | Scaffold + deploy spike         | "Hello" Next.js site live on Cloudflare, limits verified |
| 2     | Design system & layout          | Khmer/English layout, header, footer, theme              |
| 3     | Content model in Keystatic      | Admin UI with all content types + seed data              |
| 4     | Core public pages               | Categories, products, shops, provinces browsable         |
| 5     | Search & filters                | Find products/shops by keyword, category, province       |
| 6     | Maps & "where to buy"           | Map of shops, directions, nearby shops                   |
| 7     | Production CMS for editors      | Volunteers edit in production with GitHub login          |
| 8     | Community contributions         | Suggest a shop / report wrong info                       |
| 9     | SEO, performance, accessibility | Fast, findable, accessible                               |
| 10    | Launch                          | Real data, domain, announcement                          |
| 11+   | Scale phases (paid)             | Accounts, reviews, shop owner dashboard, D1, R2          |

---

### Phase 0 — Project foundations

**Goal:** a clean, welcoming open-source repository.

Tasks

- [x] 0.1 `README.md` — what the project is, screenshots placeholder, how to run, how to contribute.
- [x] 0.2 `LICENSE` (code) and `CONTENT_LICENSE.md` (data) — per D3/D4.
- [x] 0.3 `CONTRIBUTING.md` — how to add a shop (non-coders) and how to contribute code.
- [x] 0.4 `CODE_OF_CONDUCT.md` (Contributor Covenant).
- [x] 0.5 GitHub issue templates: bug, feature, **new shop**, **wrong info**; PR template.
- [x] 0.6 `.gitignore`, `.editorconfig`, `CHANGELOG.md`.
- [x] 0.7 `CLAUDE.md` with project conventions so future phases stay consistent.

Done when: repo has all files above and renders well on GitHub.
Cost: $0.

---

### Phase 1 — Scaffold + Cloudflare deploy spike

**Goal:** a minimal Next.js + Keystatic app deployed to Cloudflare, proving the
free-tier strategy works **before** building features.

Tasks

- [x] 1.1 Create Next.js app (TypeScript strict, App Router, Tailwind, ESLint, Prettier, pnpm).
- [x] 1.2 Add `@opennextjs/cloudflare` + `wrangler` config; `pnpm preview` runs it locally in the Workers runtime.
- [x] 1.3 Install Keystatic with one test collection (local mode).
- [ ] 1.4 Connect repo to **Cloudflare Workers Builds** (auto deploy on push to `main`, preview URLs for PRs). _Config ready; you do the dashboard steps in [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)._
- [x] 1.5 **Spike:** measure Worker bundle size and CPU time; confirm static pages are served as assets. Record findings in `docs/decisions/0001-hosting.md`.
- [x] 1.6 GitHub Actions: lint, type-check, build on every PR.
- [ ] 1.7 Turn on Cloudflare Web Analytics. _Code ready (`NEXT_PUBLIC_CF_BEACON_TOKEN`); you add the token — see [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md#4-turn-on-web-analytics-free-no-cookies)._

Done when: a URL like `https://fashion-in-cambodia.<account>.workers.dev` shows
the page; `/keystatic` loads locally; CI is green; hosting decision recorded.
Cost: $0 (or decide on $5/month if the spike says so).

> What you need to do: create a free Cloudflare account and connect the GitHub
> repo (Claude will give step-by-step instructions).

---

### Phase 2 — Design system & layout

**Goal:** the look and feel, in both languages, mobile-first (most Cambodian
users browse on phones).

Tasks

- [ ] 2.1 `next-intl` setup: `/km/...` and `/en/...` routes, language switcher, `messages/km.json` and `messages/en.json`.
- [ ] 2.2 Khmer + Latin fonts via `next/font`, correct line-height for Khmer script.
- [ ] 2.3 Theme tokens (colors, spacing, radius), light mode first, dark mode optional.
- [ ] 2.4 Layout: header (logo, search box, language), mobile menu, footer (about, contribute, socials, license).
- [ ] 2.5 Base components: Button, Card, Badge, Breadcrumbs, Tag, EmptyState, Image with placeholder.
- [ ] 2.6 Placeholder Home page using the components.

Done when: home page looks good on a 360px-wide phone and desktop, in Khmer and
English; Lighthouse accessibility ≥ 95.
Cost: $0.

---

### Phase 3 — Content model in Keystatic

**Goal:** editors can manage all content from `/keystatic` (locally for now).

Tasks

- [ ] 3.1 Keystatic collections: Category, Product, Shop, Province; singletons: Site settings; collection: Pages (MDX). Fields per [section 5](#5-content-model).
- [ ] 3.2 Validation: required fields, slug format, lat/lng range inside Cambodia, phone format.
- [ ] 3.3 Seed data: 25 provinces, starter category tree, ~20 products, ~10 sample shops (clearly marked as samples).
- [ ] 3.4 Typed content reader (`src/lib/content.ts`) using Keystatic Reader API; helpers like `getShopsForProduct`, `getShopsByProvince`.
- [ ] 3.5 Image guidelines + script to compress images (`sharp`) before commit (max width 1600px, WebP).
- [ ] 3.6 Editor guide `docs/EDITOR_GUIDE.md` with screenshots: how to add a shop.

Done when: you can add a shop with products in the admin UI and see the file
appear in `/content`; build reads it without errors.
Cost: $0.

---

### Phase 4 — Core public pages

**Goal:** the site is useful: browse and discover.

Pages (all statically generated, both languages)

- [ ] 4.1 **Home** — search bar, featured categories, featured shops, browse by province.
- [ ] 4.2 **Categories index** and **Category page** — sub-categories + products.
- [ ] 4.3 **Product page** — description, photos, **"Where to buy"** list of shops (grouped by province).
- [ ] 4.4 **Shops index** — list with basic filters by province and type.
- [ ] 4.5 **Shop page** — photos, contact buttons (Call, Telegram, Facebook), opening hours, address, products carried, "Open in Google Maps", "Report wrong info" link, last verified date.
- [ ] 4.6 **Province page** — shops and popular products in that province.
- [ ] 4.7 **Static pages** — About, Contribute, Privacy, FAQ (from MDX).
- [ ] 4.8 404 page, loading states, breadcrumbs.

Done when: every seed item has a working page; no broken links (checked by a
link-check script); all pages are pre-rendered (no per-request server rendering).
Cost: $0.

---

### Phase 5 — Search & filters

**Goal:** "I want _X_ near _Y_" in seconds.

Tasks

- [ ] 5.1 Build a **Pagefind** index after `next build` (products + shops, both languages).
- [ ] 5.2 Search page `/search?q=` with results grouped into Products and Shops.
- [ ] 5.3 Filters: category, province, shop type, Cambodian-made.
- [ ] 5.4 Header search with instant suggestions.
- [ ] 5.5 Khmer search test cases (Khmer has no spaces between words — verify results; add keyword/tag fields and transliterations like "krama / ក្រមា" to improve matching).

Done when: searching "silk", "សូត្រ", "sewing machine" and "Siem Reap" returns
correct results on a phone in < 1 second.
Cost: $0 (search runs in the browser).

---

### Phase 6 — Maps & "where to buy"

**Goal:** see shops on a map and get directions.

Tasks

- [ ] 6.1 Map component (MapLibre or Leaflet), loaded only on pages that need it (lazy) to keep pages fast.
- [ ] 6.2 Map on shop page (single pin), product page (all shops that carry it), province page, and a full `/map` page with filters.
- [ ] 6.3 Marker clustering for dense areas (e.g. Phnom Penh markets).
- [ ] 6.4 "Near me" — uses browser location (with permission) to sort shops by distance, entirely in the browser (no location stored).
- [ ] 6.5 "Directions" button opening Google Maps / Apple Maps.
- [ ] 6.6 Tile provider choice documented; respect OpenStreetMap tile usage policy (use MapTiler/Stadia free tier or self-hosted PMTiles if traffic grows).

Done when: product page shows all shops selling it on a map; "near me" sorts
correctly; map does not slow down pages without maps.
Cost: $0.

---

### Phase 7 — Production CMS for editors

**Goal:** volunteers edit content on the live site, without installing anything.

Tasks

- [ ] 7.1 Switch Keystatic to **GitHub mode** in production (local mode in development).
- [ ] 7.2 Create the Keystatic GitHub App; store secrets in Cloudflare (never in Git).
- [ ] 7.3 Editor workflow: edits go to a branch → PR → preview URL → reviewer merges → auto-deploy. Document it in `EDITOR_GUIDE.md`.
- [ ] 7.4 Branch protection on `main` and a CODEOWNERS file for content review.
- [ ] 7.5 "Verified" workflow: editors set `verified` and `last_verified_date`; site shows a badge; a monthly GitHub Action lists shops not verified for 12 months (opens an issue).

Done when: a non-technical volunteer can log in at `/keystatic` on the live
site, add a shop, and it appears on the site after review.
Cost: $0.

---

### Phase 8 — Community contributions

**Goal:** anyone can suggest a shop or report mistakes, without a GitHub account.

Tasks

- [ ] 8.1 "Suggest a shop" form (name, location, products, contact, photo link, submitter email optional).
- [ ] 8.2 "Report wrong info" form on every shop page (pre-filled shop name).
- [ ] 8.3 Cloudflare **Turnstile** on both forms.
- [ ] 8.4 API route `/api/suggest` validates input and creates a **GitHub Issue** with labels (`suggestion`, `report`, province label) using a fine-grained token with only Issues permission.
- [ ] 8.5 Rate limiting (Cloudflare rate-limiting rule, free tier) and basic content filtering.
- [ ] 8.6 Thank-you page + privacy note explaining what is stored (and that issues are public — warn not to include private info).

Done when: submitting the form creates a GitHub issue; spam bots are blocked.
Cost: $0.

---

### Phase 9 — SEO, performance, accessibility

**Goal:** people find the site on Google and it is fast on 3G/4G phones.

Tasks

- [ ] 9.1 Metadata per page, Open Graph images (generated at build), `hreflang` for km/en.
- [ ] 9.2 `sitemap.xml`, `robots.txt`.
- [ ] 9.3 Structured data: `LocalBusiness`/`Store` for shops, `Product` for products, `BreadcrumbList`.
- [ ] 9.4 Performance budget: Lighthouse ≥ 90 on mobile for home, product, shop pages; JS per page under ~150 KB.
- [ ] 9.5 Accessibility pass: keyboard navigation, contrast, alt text required in CMS.
- [ ] 9.6 Playwright smoke tests for key flows (search → product → shop → directions).
- [ ] 9.7 Optional: PWA manifest + offline page.

Done when: all Lighthouse targets met; Google Search Console shows no errors.
Cost: $0.

---

### Phase 10 — Launch

**Goal:** go live with real data and people.

Tasks

- [ ] 10.1 Replace sample data with real shops (target: ≥ 50 verified shops in Phnom Penh + Siem Reap + Battambang).
- [ ] 10.2 Custom domain (D1) connected in Cloudflare; HTTPS; redirects from `workers.dev`.
- [ ] 10.3 Google Search Console + Bing Webmaster submitted.
- [ ] 10.4 Launch checklist: legal pages, contact email, social accounts, backup (the Git repo _is_ the backup).
- [ ] 10.5 Announcement kit: short post in Khmer and English, social images.
- [ ] 10.6 "good first issue" labels to welcome open-source contributors.

Done when: the site is public on its domain and the first outside contribution is merged.
Cost: domain only (~$10/year), optional.

---

### Phase 11+ — Scale phases (move to paid only when needed)

Do these only when the trigger appears. Each is its own phase.

| Phase | Feature                                                      | Needs                           | Likely cost                   |
| ----- | ------------------------------------------------------------ | ------------------------------- | ----------------------------- |
| 11    | Move images to **R2**                                        | Repo > ~1 GB or slow clones     | $0 (10 GB free)               |
| 12    | **User accounts** (email magic link / Google login)          | Reviews, favourites             | D1 free tier; Workers Paid $5 |
| 13    | **Favourites & lists** ("My fabric shops")                   | Phase 12                        | —                             |
| 14    | **Reviews & ratings** with moderation                        | Phase 12                        | —                             |
| 15    | **Shop owner claim & self-edit**                             | Phase 12; shop data moves to D1 | —                             |
| 16    | **Events & workshops calendar** (fashion weeks, markets)     | Keystatic collection            | $0                            |
| 17    | **Designers & brands directory**                             | Keystatic collection            | $0                            |
| 18    | **Guides / blog** (e.g. "Where to buy silk in Takeo")        | MDX in Keystatic                | $0                            |
| 19    | **Telegram bot** ("find buttons near me")                    | Workers                         | $0–5                          |
| 20    | **Public data API** (JSON/GeoJSON export of shops, CC BY-SA) | Static JSON at build            | $0                            |

---

## Progress tracker

| Phase                      | Status         | Branch / PR           | Notes                                                                                                       |
| -------------------------- | -------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| 0 Foundations              | ✅ Done        | `phase-0-foundations` | [#1](https://github.com/HorngFu/Fashion-in-Cambodia/pull/1)                                                 |
| 1 Scaffold + deploy spike  | 🟨 In review   | `phase-1-scaffold`    | Live at https://fashion-in-cambodia.horngfu.workers.dev; GitHub connection and analytics pending (1.4, 1.7) |
| 2 Design system & layout   | ⬜ Not started |                       |                                                                                                             |
| 3 Content model            | ⬜ Not started |                       |                                                                                                             |
| 4 Core public pages        | ⬜ Not started |                       |                                                                                                             |
| 5 Search & filters         | ⬜ Not started |                       |                                                                                                             |
| 6 Maps                     | ⬜ Not started |                       |                                                                                                             |
| 7 Production CMS           | ⬜ Not started |                       |                                                                                                             |
| 8 Community contributions  | ⬜ Not started |                       |                                                                                                             |
| 9 SEO / performance / a11y | ⬜ Not started |                       |                                                                                                             |
| 10 Launch                  | ⬜ Not started |                       |                                                                                                             |

Status legend: ⬜ Not started · 🟨 In progress · ✅ Done

---

## 10. Future ideas backlog

Capture ideas here instead of adding them to an active phase.

- Price comparison between markets (needs a reliable data source).
- "Made in Cambodia" certification badge with partner organizations.
- Sustainability tags (natural dyes, upcycled, second-hand).
- Fashion school and course directory.
- Job board for tailors and seamstresses.
- Volunteer leaderboard for contributors who verify shops.
