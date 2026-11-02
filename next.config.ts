import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Cache Components is deliberately off: rendering with it at request time
// hangs on Cloudflare Workers, and it does not allow `dynamicParams = false`.
// Pages are plain static pages instead (docs/decisions/0003-classic-static-rendering.md).
const nextConfig: NextConfig = {
  experimental: {
    // The root layout lives under [locale], so unmatched URLs need a 404 page
    // that does not depend on it (src/app/global-not-found.tsx).
    globalNotFound: true,
  },
  // No middleware: a plain redirect sends "/" to the default language, so no
  // code runs per request and every page stays static.
  async redirects() {
    return [{ source: "/", destination: "/km", permanent: false }];
  },
  images: {
    // Cloudflare's image resizing is a paid feature. Images are compressed
    // before they are committed instead (see Phase 3).
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);

// Makes Cloudflare bindings available to `next dev`.
initOpenNextCloudflareForDev();
