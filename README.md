# Fashion in Cambodia

**Find fashion products, materials and tools in Cambodia — and the shops that sell them.**

ស្វែងរកផលិតផលម៉ូដ សម្ភារៈ និងឧបករណ៍ — និងហាងដែលលក់វានៅទូទាំងប្រទេសកម្ពុជា។

Fashion in Cambodia is a free, open-source, non-profit directory for fashion
lovers, designers, tailors, students, shop owners and tourists. Search for a
product (silk, krama, buttons, a sewing machine…) and see which shops carry it,
where they are on the map, and how to contact them.

> 🌐 **Preview:** <https://fashion-in-cambodia.horngfu.workers.dev>
>
> 🚧 **Status:** early development. See the
> [development plan](docs/DEVELOPMENT_PHASES.md) for what is being built.

<!-- Screenshots will be added after Phase 4. -->

## Features (planned)

- Browse fashion **categories** and **products** — fabrics, clothing, accessories,
  tools, supplies and services.
- **"Where to buy"** — every product lists the shops that sell it.
- **Shop pages** with address, map, phone, Telegram, Facebook and opening hours.
- **Browse by province** — all 25 provinces of Cambodia.
- **Search and filters**, plus a **map** with "near me".
- **Khmer and English**.
- **Suggest a shop** or **report wrong information** — no account needed.

## Tech stack

|           |                                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------- |
| Framework | [Next.js](https://nextjs.org/) (App Router) + TypeScript                                                 |
| Styling   | [Tailwind CSS](https://tailwindcss.com/)                                                                 |
| CMS       | [Keystatic](https://keystatic.com/) — content stored as files in this repo                               |
| Hosting   | [Cloudflare Workers](https://workers.cloudflare.com/) via [OpenNext](https://opennext.js.org/cloudflare) |
| Search    | [Pagefind](https://pagefind.app/)                                                                        |
| Maps      | [OpenStreetMap](https://www.openstreetmap.org/) data                                                     |

The whole platform is designed to run on **free tiers** at first. See
[the cost plan](docs/DEVELOPMENT_PHASES.md#6-cost-plan-free-first-paid-later).

## Getting started

Requirements: **Node.js 20.9+** (24 recommended) and **pnpm**
(`corepack enable` installs the right version).

```bash
pnpm install
pnpm dev          # http://localhost:3000
                  # Content editor: http://localhost:3000/keystatic
```

| Command                                        | What it does                                                      |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `pnpm dev`                                     | Development server                                                |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | Code checks and formatting                                        |
| `pnpm build`                                   | Next.js production build                                          |
| `pnpm preview`                                 | Build for Cloudflare and run it locally in the Workers runtime \* |
| `pnpm deploy`                                  | Build and deploy to Cloudflare \*                                 |

\* Needs Linux, macOS, WSL or Windows Developer Mode. Deploys normally happen
automatically on push to `main` — see
[docs/CLOUDFLARE_SETUP.md](docs/CLOUDFLARE_SETUP.md).

## Contributing

Everyone is welcome — you do **not** need to be a programmer.

- 🏪 **Know a shop?** [Suggest a shop](https://github.com/HorngFu/Fashion-in-Cambodia/issues/new?template=new-shop.yml)
- ✏️ **Found a mistake?** [Report wrong information](https://github.com/HorngFu/Fashion-in-Cambodia/issues/new?template=wrong-info.yml)
- 💻 **Developer or designer?** Read [CONTRIBUTING.md](CONTRIBUTING.md)

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

- **Code:** [MIT](LICENSE)
- **Content and data** (shop listings, descriptions, photos):
  [CC BY-SA 4.0](CONTENT_LICENSE.md)
