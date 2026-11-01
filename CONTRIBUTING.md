# Contributing to Fashion in Cambodia

Thank you for helping fashion lovers in Cambodia find what they need! 🙏

There are several ways to help. Pick the one that fits you:

| I want to…                                  | Skills needed         | Go to                                                             |
| ------------------------------------------- | --------------------- | ----------------------------------------------------------------- |
| Add a shop I know                           | None                  | [Suggest a shop](#1-suggest-a-shop-no-coding)                     |
| Fix wrong information                       | None                  | [Report wrong information](#2-report-wrong-information-no-coding) |
| Translate into Khmer or English             | Language              | [Translate](#3-translate)                                         |
| Edit content directly as a volunteer editor | Basic computer skills | [Become an editor](#4-become-a-volunteer-editor)                  |
| Write code or design                        | Developer / designer  | [Code contributions](#5-code-contributions)                       |

Everyone taking part must follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 1. Suggest a shop (no coding)

1. Open a [New shop issue](https://github.com/HorngFu/Fashion-in-Cambodia/issues/new?template=new-shop.yml) (you need a free GitHub account).
2. Fill in what you know: name, location, what they sell, how to contact them.
3. An editor checks the details and adds the shop to the site.

A form on the website itself that works without a GitHub account is coming in
Phase 8.

**Please do not** include private personal information (home addresses, personal
phone numbers) — issues are public.

## 2. Report wrong information (no coding)

Shop closed? Phone number changed? Open a
[Wrong information issue](https://github.com/HorngFu/Fashion-in-Cambodia/issues/new?template=wrong-info.yml) and tell us
the page and what is wrong.

## 3. Translate

The site is in **Khmer (ខ្មែរ)** and **English**. Many entries may only have one
language at first. You can help by:

- Commenting on an issue with the missing translation, or
- Editing the text directly once you are a volunteer editor.

Interface text (buttons, menus) lives in `messages/km.json` and
`messages/en.json` (from Phase 2).

## 4. Become a volunteer editor

Editors add and verify shops using a simple web editor (Keystatic) — no code.

1. Create a free GitHub account.
2. Open an issue titled "I want to be an editor" and tell us a little about
   yourself and which area of Cambodia you know.
3. A maintainer adds you to the project and sends you the editor guide
   (`docs/EDITOR_GUIDE.md`, coming in Phase 3).

### Content rules

- **Only real, currently operating shops.** Mark closed shops as closed instead of deleting them.
- **Facts, not advertising.** Describe what a shop sells; avoid "best shop in Phnom Penh!".
- **Photos must be your own** or shared with permission — see [CONTENT_LICENSE.md](CONTENT_LICENSE.md).
- **Check before marking a shop "verified"** — by visiting, calling, or confirming with the owner.
- All content is published under [CC BY-SA 4.0](CONTENT_LICENSE.md).

## 5. Code contributions

### Before you start

- Look for issues labelled [`good first issue`](https://github.com/HorngFu/Fashion-in-Cambodia/labels/good%20first%20issue) or [`help wanted`](https://github.com/HorngFu/Fashion-in-Cambodia/labels/help%20wanted).
- For bigger changes, open an issue first so we can agree on the approach.
- The roadmap is in [docs/DEVELOPMENT_PHASES.md](docs/DEVELOPMENT_PHASES.md).

### Local setup

Requirements: **Node.js 20.9+** (24 recommended), **pnpm** (`corepack enable`), **Git**.

```bash
git clone https://github.com/HorngFu/Fashion-in-Cambodia.git
cd Fashion-in-Cambodia
pnpm install
pnpm dev
```

Open <http://localhost:3000> for the site and <http://localhost:3000/keystatic>
for the content editor.

### Workflow

1. Fork the repository and create a branch from `main`:
   `feat/short-description`, `fix/short-description` or `content/short-description`.
2. Make your change. Keep pull requests small and focused.
3. Run the checks: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`.
   CI also builds for Cloudflare and checks the Worker size.
4. Open a pull request and fill in the template.
5. A maintainer reviews it. Cloudflare creates a preview link so everyone can see the change.

### Commit messages

Use short, clear messages in the imperative mood, e.g.
`Add province filter to shop list`, `Fix Khmer line height on product cards`.

### Guidelines

- TypeScript strict mode; no `any` without a good reason.
- **Mobile first** — most visitors use phones, often on slow connections.
- **Both languages** — never hard-code user-facing text; use the translation files.
- **Accessibility** — semantic HTML, alt text, keyboard navigation, good contrast.
- **Keep it free to host** — public pages must be statically generated. Ask before
  adding anything that runs on the server per request or needs a paid service.

## Questions?

Open a [discussion or issue](https://github.com/HorngFu/Fashion-in-Cambodia/issues). We are happy to help first-time
contributors.
