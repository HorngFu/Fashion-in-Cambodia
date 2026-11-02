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

// Pages: turns the [locale] URL segment into a Locale, or shows the 404 page.
export function toLocale(value: string): Locale {
  if (!hasLocale(routing.locales, value)) notFound();
  return value;
}

// Layouts: falls back to the default locale for unknown values, so the page
// below can render the translated 404 inside the normal site layout.
export function resolveLocale(value: string): Locale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}
