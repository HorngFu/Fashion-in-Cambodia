import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/directory/PageHeader";
import { ShopCard } from "@/components/directory/ShopCard";
import { ShopFilters } from "@/components/directory/ShopFilters";
import { alternatesFor } from "@/i18n/metadata";
import { toLocale } from "@/i18n/routing";
import {
  getProvinces,
  getShopCountsByProvince,
  getShops,
  localized,
} from "@/lib/content";

const shopTypes = [
  "physical",
  "market_stall",
  "workshop",
  "online_only",
] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/shops">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Shops" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: alternatesFor(locale, "/shops"),
  };
}

export default async function ShopsPage({
  params,
}: PageProps<"/[locale]/shops">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);

  const [t, tNav, tType, shops, provinces, counts] = await Promise.all([
    getTranslations("Shops"),
    getTranslations("Nav"),
    getTranslations("ShopType"),
    getShops(),
    getProvinces(),
    getShopCountsByProvince(),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <PageHeader
        crumbs={[{ label: tNav("home"), href: "/" }, { label: t("title") }]}
        title={t("title")}
        intro={t("intro")}
      />
      <ShopFilters
        items={shops.map((shop) => ({
          slug: shop.slug,
          province: shop.location.province ?? "",
          type: shop.shop_type,
          card: <ShopCard shop={shop} headingLevel="h2" />,
        }))}
        provinces={provinces
          .filter((p) => counts.has(p.slug))
          .map((p) => ({
            value: p.slug,
            label: localized(locale, p.name_en, p.name_km),
          }))}
        types={shopTypes.map((type) => ({ value: type, label: tType(type) }))}
      />
    </div>
  );
}
