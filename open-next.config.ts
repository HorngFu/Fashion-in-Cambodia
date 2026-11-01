import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Pages are prerendered at build time and served from Workers static assets.
// No R2 bucket or KV namespace is needed, so this stays on the free plan.
// See docs/decisions/0001-hosting.md.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
