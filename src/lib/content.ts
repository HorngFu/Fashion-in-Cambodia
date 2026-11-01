import "server-only";

import { createReader } from "@keystatic/core/reader";
import { cacheLife } from "next/cache";
import keystaticConfig from "../../keystatic.config";

// Reads the files in /content. This only works at build time (Node.js file
// system), so every function here is cached with the "content" profile and the
// result is baked into the static pages. Content changes reach the site by
// redeploying, which happens automatically on every push to main.
const reader = createReader(process.cwd(), keystaticConfig);

export async function getCategories() {
  "use cache";
  cacheLife("content");

  const entries = await reader.collections.categories.all();
  return entries
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
