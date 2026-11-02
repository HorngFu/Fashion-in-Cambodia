import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { resolveLocale, routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";
import { kantumruy } from "../fonts";
import "../globals.css";

// Fail the build if any public page would need rendering on every request.
// Static pages are what keep hosting on the Cloudflare free plan.
export const ensureStatic = "navigation";

// Only /km and /en are prerendered. For any other value the layout renders in
// Khmer and the page calls notFound() (see [locale]/not-found.tsx).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("siteName"), template: `%s · ${t("siteName")}` },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);

  const t = await getTranslations("Common");

  return (
    <html lang={locale} className={kantumruy.variable}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="bg-primary text-primary-fg sr-only z-50 rounded-[var(--radius-control)] px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {t("skipToContent")}
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
