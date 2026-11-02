import type { Metadata } from "next";
import { type Locale, routing } from "./routing";

// Canonical URL and language alternates for one page, e.g. path "/shops".
export function alternatesFor(
  locale: Locale,
  path = "",
): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${routing.defaultLocale}${path}`,
    },
  };
}
