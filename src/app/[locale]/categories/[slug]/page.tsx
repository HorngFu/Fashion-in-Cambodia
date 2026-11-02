import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CardGrid } from "@/components/directory/CardGrid";
import { PageHeader } from "@/components/directory/PageHeader";
import { ProductCard } from "@/components/directory/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { TagLink } from "@/components/ui/Tag";
import { alternatesFor } from "@/i18n/metadata";
import { toLocale } from "@/i18n/routing";
import {
  getCategories,
  getCategory,
  getProductsInCategory,
  getSubcategories,
  localized,
} from "@/lib/content";

// Only categories in /content exist; anything else gets the prebuilt 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getCategories()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/categories/[slug]">): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: localized(locale, category.name_en, category.name_km),
    description:
      localized(locale, category.description_en, category.description_km) ||
      undefined,
    alternates: alternatesFor(locale, `/categories/${slug}`),
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/[locale]/categories/[slug]">) {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  setRequestLocale(locale);

  const category = await getCategory(slug);
  if (!category) notFound();

  const [t, tNav, parent, children, products] = await Promise.all([
    getTranslations("Categories"),
    getTranslations("Nav"),
    category.parent ? getCategory(category.parent) : undefined,
    getSubcategories(category.slug),
    getProductsInCategory(category.slug),
  ]);
  // Sub-categories link to their siblings; top-level ones to their children.
  const related = parent ? await getSubcategories(parent.slug) : children;
  const name = (c: { name_en: string; name_km: string }) =>
    localized(locale, c.name_en, c.name_km);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
      <PageHeader
        crumbs={[
          { label: tNav("home"), href: "/" },
          { label: tNav("categories"), href: "/categories" },
          ...(parent
            ? [{ label: name(parent), href: `/categories/${parent.slug}` }]
            : []),
          { label: name(category) },
        ]}
        title={name(category)}
        intro={localized(
          locale,
          category.description_en,
          category.description_km,
        )}
      />

      {related.length > 0 && (
        <section aria-labelledby="subcategories">
          <h2 id="subcategories" className="sr-only">
            {t("subcategories")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((c) => (
              <li key={c.slug}>
                <TagLink
                  href={`/categories/${c.slug}`}
                  aria-current={c.slug === category.slug ? "page" : undefined}
                  className={
                    c.slug === category.slug
                      ? "border-primary text-primary"
                      : undefined
                  }
                >
                  {name(c)}
                </TagLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="products" className="flex flex-col gap-4">
        <h2 id="products" className="text-2xl font-semibold">
          {t("products")}
        </h2>
        {products.length > 0 ? (
          <CardGrid>
            {products.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </CardGrid>
        ) : (
          <EmptyState title={t("noProducts")} />
        )}
      </section>
    </div>
  );
}
