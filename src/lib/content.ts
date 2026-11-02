import "server-only";

import { createReader } from "@keystatic/core/reader";
import type { Locale } from "@/i18n/routing";
import keystaticConfig, { parseCoordinates } from "../../keystatic.config";

// Reads the files in /content. This only works at build time (Node.js file
// system): every page that uses it is prerendered, so the content is baked
// into static HTML. Content changes reach the site by redeploying, which
// happens automatically on every push to main.
const reader = createReader(process.cwd(), keystaticConfig);

// Each collection is read once per build process and shared by all pages.
function once<T>(load: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return () => (promise ??= load());
}

const byOrderThenName = (
  a: { order: number | null; name_en: string },
  b: { order: number | null; name_en: string },
) => (a.order ?? 100) - (b.order ?? 100) || a.name_en.localeCompare(b.name_en);

// Khmer text when the page is Khmer and a translation exists, else English.
export function localized(locale: Locale, en: string, km?: string | null) {
  return locale === "km" && km ? km : en;
}

// --- Provinces ---------------------------------------------------------------

export const getProvinces = once(async () => {
  const entries = await reader.collections.provinces.all();
  return entries
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort(byOrderThenName);
});
export type Province = Awaited<ReturnType<typeof getProvinces>>[number];

export async function getProvince(slug: string) {
  return (await getProvinces()).find((p) => p.slug === slug);
}

// --- Categories --------------------------------------------------------------

export const getCategories = once(async () => {
  const entries = await reader.collections.categories.all();
  return entries
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort(byOrderThenName);
});
export type Category = Awaited<ReturnType<typeof getCategories>>[number];

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function getTopCategories() {
  return (await getCategories()).filter((c) => !c.parent);
}

export async function getSubcategories(parent: string) {
  return (await getCategories()).filter((c) => c.parent === parent);
}

// --- Products ----------------------------------------------------------------

export const getProducts = once(async () => {
  const entries = await reader.collections.products.all();
  return entries
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => a.name_en.localeCompare(b.name_en));
});
export type Product = Awaited<ReturnType<typeof getProducts>>[number];

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

// Products in a category and, for a top-level category, its sub-categories.
export async function getProductsInCategory(slug: string) {
  const childSlugs = (await getSubcategories(slug)).map((c) => c.slug);
  const slugs = new Set([slug, ...childSlugs]);
  return (await getProducts()).filter(
    (p) => p.category && slugs.has(p.category),
  );
}

// --- Shops -------------------------------------------------------------------

// Permanently closed shops are kept in /content (so they are not re-added by
// mistake) but are not listed on the site.
export const getShops = once(async () => {
  const entries = await reader.collections.shops.all();
  return entries
    .map(({ slug, entry }) => ({
      slug,
      ...entry,
      // { lat, lng } for maps, or null for online-only shops.
      position: parseCoordinates(entry.location.coordinates),
    }))
    .filter((shop) => shop.status !== "closed")
    .sort((a, b) => a.name_en.localeCompare(b.name_en));
});
export type Shop = Awaited<ReturnType<typeof getShops>>[number];

export async function getShop(slug: string) {
  return (await getShops()).find((s) => s.slug === slug);
}

// Shops that sell a product, with that shop's price note for it.
export async function getShopsForProduct(productSlug: string) {
  return (await getShops()).flatMap((shop) => {
    const item = shop.products.find((p) => p.product === productSlug);
    return item ? [{ shop, priceNote: item.price_note }] : [];
  });
}

export async function getShopsByProvince(provinceSlug: string) {
  return (await getShops()).filter(
    (shop) => shop.location.province === provinceSlug,
  );
}

// How many shops sell each product, by product slug.
export const getShopCountsByProduct = once(async () => {
  const counts = new Map<string, number>();
  for (const shop of await getShops())
    for (const { product } of shop.products)
      if (product) counts.set(product, (counts.get(product) ?? 0) + 1);
  return counts;
});

// How many shops are in each province, by province slug.
export const getShopCountsByProvince = once(async () => {
  const counts = new Map<string, number>();
  for (const shop of await getShops()) {
    const province = shop.location.province;
    if (province) counts.set(province, (counts.get(province) ?? 0) + 1);
  }
  return counts;
});

// Products a shop sells, resolved to full product entries.
export async function getProductsForShop(shop: Shop) {
  const products = await getProducts();
  return shop.products.flatMap((item) => {
    const product = products.find((p) => p.slug === item.product);
    return product ? [{ product, priceNote: item.price_note }] : [];
  });
}

// --- Pages and settings ------------------------------------------------------

export async function getPage(slug: string) {
  const entry = await reader.collections.pages.read(slug, {
    resolveLinkedFiles: true,
  });
  return entry ? { slug, ...entry } : undefined;
}

export const getSettings = once(async () => {
  return reader.singletons.settings.readOrThrow();
});
