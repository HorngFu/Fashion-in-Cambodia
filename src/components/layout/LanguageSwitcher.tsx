"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

// Links to the same page in each language by swapping the first URL segment.
// It reads the real URL rather than the locale context, so copies of the
// header that Next.js keeps hidden for back/forward navigation stay correct.
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("LanguageSwitcher");
  const current = useLocale();
  const pathname = usePathname();
  const rest = pathname.replace(/^\/[^/]+/, "");

  return (
    <nav aria-label={t("label")} className={className}>
      <ul className="border-border bg-surface flex items-center rounded-full border p-0.5 text-sm">
        {routing.locales.map((locale) => {
          const active = locale === current;
          return (
            <li key={locale}>
              <NextLink
                href={`/${locale}${rest}`}
                hrefLang={locale}
                lang={locale}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center rounded-full px-3 transition-colors",
                  active
                    ? "bg-primary text-primary-fg"
                    : "text-muted hover:text-primary",
                )}
              >
                {t(locale)}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
