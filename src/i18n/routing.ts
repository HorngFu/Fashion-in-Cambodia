import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { defineRouting } from "next-intl/routing";

// Khmer first (decision D2), English second. Every URL carries its locale
// (/km/..., /en/...) so each page can be prerendered once per language.
export const routing = defineRouting({
  locales: ["km", "en"],
  defaultLocale: "km",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

// Turns the [locale] URL segment into a typed Locale. Unknown values never
// reach a page (dynamicParams = false), but this keeps the types honest.
export function toLocale(value: string): Locale {
  if (!hasLocale(routing.locales, value)) notFound();
  return value;
}
