import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CardGrid } from "@/components/directory/CardGrid";
import { PageHeader } from "@/components/directory/PageHeader";
import { cardLinkClasses } from "@/components/ui/Card";
import { alternatesFor } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import { toLocale } from "@/i18n/routing";
import {
  getProvinces,
  getShopCountsByProvince,
  localized,
} from "@/lib/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/provinces">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Provinces" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: alternatesFor(locale, "/provinces"),
  };
}

export default async function ProvincesPage({
  params,
}: PageProps<"/[locale]/provinces">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);

  const [t, tNav, provinces, counts] = await Promise.all([
    getTranslations("Provinces"),
    getTranslations("Nav"),
    getProvinces(),
    getShopCountsByProvince(),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
      <PageHeader
        crumbs={[{ label: tNav("home"), href: "/" }, { label: t("title") }]}
        title={t("title")}
        intro={t("intro")}
      />
      <CardGrid>
        {provinces.map((province) => {
          const count = counts.get(province.slug) ?? 0;
          return (
            <li key={province.slug}>
              <Link
                href={`/provinces/${province.slug}`}
                className={cardLinkClasses("flex h-full flex-col gap-1")}
              >
                <h2 className="text-lg font-semibold">
                  {localized(locale, province.name_en, province.name_km)}
                </h2>
                <p
                  className={
                    count > 0 ? "text-primary text-sm" : "text-muted text-sm"
                  }
                >
                  {t("shopCount", { count })}
                </p>
              </Link>
            </li>
          );
        })}
      </CardGrid>
    </div>
  );
}
