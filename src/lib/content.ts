import "server-only";

import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

// Reads the files in /content. This only works at build time (Node.js file
// system): every page that uses it is prerendered, so the content is baked
// into static HTML. Content changes reach the site by redeploying, which
// happens automatically on every push to main.
const reader = createReader(process.cwd(), keystaticConfig);

export async function getCategories() {
  const entries = await reader.collections.categories.all();
  return entries
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
