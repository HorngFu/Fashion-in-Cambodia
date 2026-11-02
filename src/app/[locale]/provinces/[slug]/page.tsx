import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CardGrid } from "@/components/directory/CardGrid";
import { PageHeader } from "@/components/directory/PageHeader";
import { ShopCard } from "@/components/directory/ShopCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { TagLink } from "@/components/ui/Tag";
import { alternatesFor } from "@/i18n/metadata";
import { toLocale } from "@/i18n/routing";
import {
  getProducts,
  getProvince,
  getProvinces,
  getShopsByProvince,
  localized,
} from "@/lib/content";
import { links } from "@/lib/site";

// Only the 25 provinces in /content exist.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProvinces()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/provinces/[slug]">): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const province = await getProvince(slug);
  if (!province) return {};
  const t = await getTranslations({ locale, namespace: "Provinces" });
  const name = localized(locale, province.name_en, province.name_km);
  return {
    title: name,
    description: t("shops", { province: name }),
    alternates: alternatesFor(locale, `/provinces/${slug}`),
  };
}

// How many shops in this province sell each product, most common first.
function popularProducts(
  shops: Awaited<ReturnType<typeof getShopsByProvince>>,
) {
  const counts = new Map<string, number>();
  for (const shop of shops)
    for (const { product } of shop.products)
      if (product) counts.set(product, (counts.get(product) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
}

export default async function ProvincePage({
  params,
}: PageProps<"/[locale]/provinces/[slug]">) {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  setRequestLocale(locale);

  const province = await getProvince(slug);
  if (!province) notFound();

  const [t, tNav, shops, products] = await Promise.all([
    getTranslations("Provinces"),
    getTranslations("Nav"),
    getShopsByProvince(slug),
    getProducts(),
  ]);
  const name = localized(locale, province.name_en, province.name_km);
  const capital = localized(locale, province.capital_en, province.capital_km);
  const popular = popularProducts(shops).flatMap(([productSlug]) => {
    const product = products.find((p) => p.slug === productSlug);
    return product ? [product] : [];
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
      <PageHeader
        crumbs={[
          { label: tNav("home"), href: "/" },
          { label: tNav("provinces"), href: "/provinces" },
          { label: name },
        ]}
        title={name}
        intro={
          capital && capital !== name ? t("capital", { name: capital }) : null
        }
      />

      {popular.length > 0 && (
        <section aria-labelledby="popular" className="flex flex-col gap-3">
          <h2 id="popular" className="text-xl font-semibold">
            {t("popularProducts")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {popular.map((product) => (
              <li key={product.slug}>
                <TagLink href={`/products/${product.slug}`}>
                  {localized(locale, product.name_en, product.name_km)}
                </TagLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="shops" className="flex flex-col gap-4">
        <h2 id="shops" className="text-2xl font-semibold">
          {t("shops", { province: name })}
        </h2>
        {shops.length > 0 ? (
          <CardGrid>
            {shops.map((shop) => (
              <li key={shop.slug}>
                <ShopCard shop={shop} />
              </li>
            ))}
          </CardGrid>
        ) : (
          <EmptyState
            title={t("noShops", { province: name })}
            action={
              <a
                href={links.suggestShop}
                className="text-primary font-medium underline"
              >
                {t("noShopsCta")}
              </a>
            }
          />
        )}
      </section>
    </div>
  );
}
