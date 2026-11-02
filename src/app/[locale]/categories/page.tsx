import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/directory/PageHeader";
import { TagLink } from "@/components/ui/Tag";
import { alternatesFor } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import { toLocale } from "@/i18n/routing";
import {
  getCategories,
  getProductsInCategory,
  getTopCategories,
  localized,
} from "@/lib/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/categories">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Categories" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: alternatesFor(locale, "/categories"),
  };
}

export default async function CategoriesPage({
  params,
}: PageProps<"/[locale]/categories">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);

  const [t, tNav, tops, all] = await Promise.all([
    getTranslations("Categories"),
    getTranslations("Nav"),
    getTopCategories(),
    getCategories(),
  ]);
  const counts = new Map(
    await Promise.all(
      tops.map(
        async (c) =>
          [c.slug, (await getProductsInCategory(c.slug)).length] as const,
      ),
    ),
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
      <PageHeader
        crumbs={[{ label: tNav("home"), href: "/" }, { label: t("title") }]}
        title={t("title")}
        intro={t("intro")}
      />

      <ul className="grid gap-6 md:grid-cols-2">
        {tops.map((top) => {
          const subs = all.filter((c) => c.parent === top.slug);
          return (
            <li
              key={top.slug}
              className="border-border bg-surface flex flex-col gap-3 rounded-[var(--radius-card)] border p-5"
            >
              <h2 className="text-xl font-semibold">
                <Link
                  href={`/categories/${top.slug}`}
                  className="hover:text-primary"
                >
                  {localized(locale, top.name_en, top.name_km)}
                </Link>
              </h2>
              <p className="text-muted text-sm">
                {t("productCount", { count: counts.get(top.slug) ?? 0 })}
              </p>
              {subs.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {subs.map((sub) => (
                    <li key={sub.slug}>
                      <TagLink href={`/categories/${sub.slug}`}>
                        {localized(locale, sub.name_en, sub.name_km)}
                      </TagLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
