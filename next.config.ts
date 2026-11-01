import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const ONE_YEAR = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    // Content from /content only changes when the site is rebuilt and
    // redeployed, so cached content never needs to revalidate on the server.
    content: {
      stale: 60 * 5,
      revalidate: ONE_YEAR,
      expire: ONE_YEAR,
    },
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

export default nextConfig;

// Makes Cloudflare bindings available to `next dev`.
initOpenNextCloudflareForDev();
