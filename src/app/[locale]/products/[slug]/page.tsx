import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CardGrid } from "@/components/directory/CardGrid";
import { PageHeader } from "@/components/directory/PageHeader";
import { ProductCard } from "@/components/directory/ProductCard";
import { ShopCard } from "@/components/directory/ShopCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SmartImage } from "@/components/ui/SmartImage";
import { alternatesFor } from "@/i18n/metadata";
import { toLocale } from "@/i18n/routing";
import {
  getCategory,
  getProduct,
  getProducts,
  getProvinces,
  getShopsForProduct,
  localized,
} from "@/lib/content";
import { links } from "@/lib/site";

// Only products in /content exist; anything else gets the prebuilt 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProducts()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: localized(locale, product.name_en, product.name_km),
    description:
      localized(locale, product.description_en, product.description_km) ||
      undefined,
    alternates: alternatesFor(locale, `/products/${slug}`),
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/[locale]/products/[slug]">) {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  setRequestLocale(locale);

  const product = await getProduct(slug);
  if (!product) notFound();

  const category = product.category
    ? await getCategory(product.category)
    : undefined;
  const [t, tNav, tBadge, parent, sellers, provinces, products] =
    await Promise.all([
      getTranslations("Product"),
      getTranslations("Nav"),
      getTranslations("Badge"),
      category?.parent ? getCategory(category.parent) : undefined,
      getShopsForProduct(product.slug),
      getProvinces(),
      getProducts(),
    ]);
  const name = (c: { name_en: string; name_km: string }) =>
    localized(locale, c.name_en, c.name_km);

  // Group shops by province, in province order; online-only sellers last.
  const groups = [
    ...provinces.map((province) => ({
      key: province.slug,
      title: name(province),
      sellers: sellers.filter(
        (s) => s.shop.location.province === province.slug,
      ),
    })),
    {
      key: "online",
      title: t("onlineShops"),
      sellers: sellers.filter((s) => !s.shop.location.province),
    },
  ].filter((group) => group.sellers.length > 0);

  const others = products.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
      <PageHeader
        crumbs={[
          { label: tNav("home"), href: "/" },
          { label: tNav("categories"), href: "/categories" },
          ...(parent
            ? [{ label: name(parent), href: `/categories/${parent.slug}` }]
            : []),
          ...(category
            ? [{ label: name(category), href: `/categories/${category.slug}` }]
            : []),
          { label: name(product) },
        ]}
        title={name(product)}
        intro={localized(
          locale,
          product.description_en,
          product.description_km,
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          {product.is_cambodian_made && (
            <Badge tone="accent">{tBadge("madeInCambodia")}</Badge>
          )}
          {product.typical_price && (
            <p className="text-sm">
              <span className="text-muted">{t("typicalPrice")}: </span>
              <span className="font-medium">{product.typical_price}</span>
            </p>
          )}
        </div>
      </PageHeader>

      {product.photos.length > 0 && (
        <section aria-label={t("photos")}>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {product.photos.map((photo, index) => (
              <li key={index}>
                <SmartImage
                  src={photo.image}
                  alt={localized(locale, photo.alt_en, photo.alt_km)}
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="where-to-buy" className="flex flex-col gap-6">
        <div>
          <h2 id="where-to-buy" className="text-2xl font-semibold">
            {t("whereToBuy")}
          </h2>
          <p className="text-muted mt-1">
            {t("shopCount", { count: sellers.length })}
          </p>
        </div>
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">{group.title}</h3>
              <CardGrid>
                {group.sellers.map(({ shop, priceNote }) => (
                  <li key={shop.slug}>
                    <ShopCard shop={shop} note={priceNote} headingLevel="h3" />
                  </li>
                ))}
              </CardGrid>
            </div>
          ))
        ) : (
          <EmptyState
            title={t("noShops")}
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

      {category && others.length > 0 && (
        <section aria-labelledby="more" className="flex flex-col gap-4">
          <h2 id="more" className="text-2xl font-semibold">
            {t("moreInCategory", { category: name(category) })}
          </h2>
          <CardGrid>
            {others.map((other) => (
              <li key={other.slug}>
                <ProductCard product={other} />
              </li>
            ))}
          </CardGrid>
        </section>
      )}
    </div>
  );
}
