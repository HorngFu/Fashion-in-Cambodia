// Checks every file in /content against the Keystatic schema and checks that
// references between entries point to entries that exist. Runs in CI, because
// content edited by hand or in a pull request skips the editor's validation.
//
// Usage: pnpm check:content   (Node 22.18+ runs this TypeScript file directly)
import { createReader } from "@keystatic/core/reader";
import keystaticConfig, { parseCoordinates } from "../keystatic.config.ts";

const reader = createReader(process.cwd(), keystaticConfig);
const errors: string[] = [];
const warnings: string[] = [];

type Collections = typeof reader.collections;

// Reads entries one by one, so one invalid file does not hide the others.
async function readAll<K extends keyof Collections>(name: K) {
  const collection = reader.collections[name];
  const entries = [];
  for (const slug of await collection.list()) {
    try {
      const entry = await collection.readOrThrow(slug);
      entries.push({ slug, entry } as {
        slug: string;
        entry: NonNullable<Awaited<ReturnType<Collections[K]["read"]>>>;
      });
    } catch (error) {
      errors.push(`${name}/${slug}: ${(error as Error).message}`);
    }
  }
  return entries;
}

const [provinces, categories, products, shops, pages] = await Promise.all([
  readAll("provinces"),
  readAll("categories"),
  readAll("products"),
  readAll("shops"),
  readAll("pages"),
]);
const settings = await reader.singletons.settings.read().catch((error) => {
  errors.push(`settings: ${(error as Error).message}`);
  return null;
});

const slugs = (entries: { slug: string }[]) =>
  new Set(entries.map((e) => e.slug));
const provinceSlugs = slugs(provinces);
const categorySlugs = slugs(categories);
const productSlugs = slugs(products);
const shopSlugs = slugs(shops);

if (provinces.length !== 25)
  errors.push(`provinces: expected 25, found ${provinces.length}`);

// Categories: parent exists, and only two levels deep.
for (const { slug, entry } of categories) {
  if (!entry.parent) continue;
  const parent = categories.find((c) => c.slug === entry.parent);
  if (!parent)
    errors.push(`categories/${slug}: parent "${entry.parent}" does not exist`);
  else if (parent.entry.parent)
    errors.push(
      `categories/${slug}: parent "${entry.parent}" is itself a sub-category`,
    );
}

// Products: category exists.
for (const { slug, entry } of products) {
  if (!entry.category || !categorySlugs.has(entry.category))
    errors.push(
      `products/${slug}: category "${entry.category}" does not exist`,
    );
}

// Shops: products and province exist, physical shops have a location.
const soldProducts = new Set<string>();
for (const { slug, entry } of shops) {
  const seen = new Set<string>();
  for (const { product } of entry.products) {
    if (!product || !productSlugs.has(product))
      errors.push(`shops/${slug}: product "${product}" does not exist`);
    else if (seen.has(product))
      errors.push(`shops/${slug}: product "${product}" is listed twice`);
    if (product) {
      seen.add(product);
      soldProducts.add(product);
    }
  }

  const { province, coordinates } = entry.location;
  if (province && !provinceSlugs.has(province))
    errors.push(`shops/${slug}: province "${province}" does not exist`);
  if (coordinates && !parseCoordinates(coordinates))
    errors.push(
      `shops/${slug}: map position "${coordinates}" is not inside Cambodia`,
    );
  if (entry.shop_type !== "online_only") {
    if (!province) errors.push(`shops/${slug}: province is required`);
    if (!coordinates) errors.push(`shops/${slug}: map position is required`);
  }
  if (entry.verified && !entry.last_verified)
    errors.push(`shops/${slug}: verified shops need a "last verified" date`);
  if (entry.products.length === 0)
    warnings.push(`shops/${slug}: no products listed`);
}

for (const slug of productSlugs)
  if (!soldProducts.has(slug))
    warnings.push(`products/${slug}: no shop sells this yet`);

// Settings: featured entries exist.
for (const slug of settings?.featured_categories ?? [])
  if (!categorySlugs.has(slug))
    errors.push(`settings: featured category "${slug}" does not exist`);
for (const slug of settings?.featured_shops ?? [])
  if (!shopSlugs.has(slug))
    errors.push(`settings: featured shop "${slug}" does not exist`);

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}
console.log(
  `Content OK: ${provinces.length} provinces, ${categories.length} categories, ` +
    `${products.length} products, ${shops.length} shops, ${pages.length} pages.`,
);
