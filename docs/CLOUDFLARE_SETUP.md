# Cloudflare setup (one time, ~15 minutes)

This connects the GitHub repository to Cloudflare so that:

- every push to `main` deploys the live site automatically, and
- every pull request gets its own preview link.

Everything here is on the **free plan**. No credit card is needed.

> **Current status (2026-11-01):** the Worker `fashion-in-cambodia` was first
> deployed from the terminal and is live at
> <https://fashion-in-cambodia.horngfu.workers.dev>. Steps 1 and the "create"
> part of step 2 are already done — use **step 2b** to connect GitHub.

---

## 1. Create a Cloudflare account

1. Go to <https://dash.cloudflare.com/sign-up> and sign up (free).
2. Verify your email address.

## 2. Create the Worker from the GitHub repository

### 2b. If the Worker already exists (deployed from the terminal)

1. Open **Workers & Pages → `fashion-in-cambodia` → Settings → Build**.
2. Under **Git repository**, click **Connect**, choose **GitHub**, and when
   GitHub asks, choose **Only select repositories → `Fashion-in-Cambodia`**.
3. Fill in the build settings from the table in step 4 below and save.

### 2a. Starting from nothing

1. In the dashboard, open **Compute (Workers) → Workers & Pages**.
2. Click **Create** → **Import a repository** (sometimes shown as **Connect to Git**).
3. Click **Connect GitHub**. When GitHub asks, choose
   **Only select repositories → `Fashion-in-Cambodia`** and approve.
4. Select the `Fashion-in-Cambodia` repository and fill in:

   | Setting                              | Value                                                         |
   | ------------------------------------ | ------------------------------------------------------------- |
   | Project name                         | `fashion-in-cambodia` (must match `name` in `wrangler.jsonc`) |
   | Production branch                    | `main`                                                        |
   | Build command                        | `pnpm cf:build`                                               |
   | Deploy command                       | `pnpm exec opennextjs-cloudflare deploy`                      |
   | Non-production branch deploy command | `pnpm exec opennextjs-cloudflare upload`                      |
   | Root directory                       | `/` (leave empty)                                             |

5. Leave **Advanced settings → Build variables** empty for now (the analytics
   token is added in step 4). Node.js 24 is picked up from `.node-version` and
   pnpm from `package.json`.

6. Click **Create and deploy**. The first build takes 2–4 minutes.

When it finishes, the site is live at:

```text
https://fashion-in-cambodia.<your-account-subdomain>.workers.dev
```

### Deploying from the terminal (Windows)

OpenNext cannot build on native Windows, so a manual deploy is built in a Linux
container that reuses your local Wrangler login (`pnpm exec wrangler login`
first, if needed). From the repo folder in Git Bash:

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd -W):/src:ro" -v "$(cygpath -w "$APPDATA")/xdg.config/.wrangler:/root/.config/.wrangler" node:24-bookworm bash -c "mkdir /app && tar -C /src --exclude=./node_modules --exclude=./.next --exclude=./.open-next --exclude=./.git -cf - . | tar -C /app -xf - && cd /app && corepack enable && CI=true pnpm install --frozen-lockfile && pnpm deploy"
```

Normally you do not need this: pushes to `main` deploy automatically once
GitHub is connected.

## 3. Turn on preview links for pull requests

1. Open the Worker → **Settings → Build → Branch control**.
2. Enable **Builds for non-production branches**.

Each pull request now gets a comment from Cloudflare with a preview URL.

## 4. Turn on Web Analytics (free, no cookies)

1. Dashboard → **Analytics & Logs → Web Analytics → Add a site**.
2. Enter the hostname `fashion-in-cambodia.<your-account-subdomain>.workers.dev`
   and choose the **manual JS snippet** option.
3. Copy only the **token** value from the snippet (the long string after `"token":`).
4. Worker → **Settings → Build → Build variables** → add
   `NEXT_PUBLIC_CF_BEACON_TOKEN` = _the token_.
5. Re-run the latest build (Worker → **Deployments → Retry build**), or push any commit.

The token is not a secret — it is visible in the page HTML — so it is fine as a
build variable.

## 5. Check it worked

- [ ] The `workers.dev` URL shows "Fashion in Cambodia" and the sample category.
- [ ] A test pull request gets a Cloudflare preview link.
- [ ] Web Analytics shows a visit a few minutes after you open the site.

---

## Local commands

| Command        | What it does                                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`     | Normal development server at <http://localhost:3000>. Content editor at `/keystatic`.                                                        |
| `pnpm preview` | Builds for Cloudflare and runs it locally in the real Workers runtime.                                                                       |
| `pnpm deploy`  | Builds and deploys from your computer (needs `pnpm exec wrangler login` first). Normally not needed — pushes to `main` deploy automatically. |

> **Windows note:** `pnpm preview` and `pnpm deploy` need permission to create
> symlinks. Either turn on **Settings → System → For developers → Developer
> Mode**, or run them inside WSL. `pnpm dev` works without this.
