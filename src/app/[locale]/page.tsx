import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchBox } from "@/components/layout/SearchBox";
import { buttonClasses } from "@/components/ui/Button";
import { Card, cardLinkClasses } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TagLink } from "@/components/ui/Tag";
import { alternatesFor } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import { toLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { getCategories } from "@/lib/content";
import { links } from "@/lib/site";

// Featured provinces until province pages arrive in Phase 4.
const featuredProvinces = [
  "phnom-penh",
  "siem-reap",
  "battambang",
  "kampong-cham",
  "takeo",
  "kampot",
] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  return { alternates: alternatesFor(toLocale((await params).locale)) };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);

  const [t, tProvinces, categories] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Provinces"),
    getCategories(),
  ]);

  const steps = [
    { title: t("step1Title"), text: t("step1Text") },
    { title: t("step2Title"), text: t("step2Text") },
    { title: t("step3Title"), text: t("step3Text") },
  ];

  return (
    <>
      <section className="border-border bg-surface border-b">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-accent-fg text-sm font-medium">{t("eyebrow")}</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-bold sm:text-4xl">
            {t("title")}
          </h1>
          <p className="text-muted mt-4 max-w-2xl text-lg">{t("intro")}</p>
          <SearchBox id="home-search" className="mt-6 max-w-xl" />
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-12">
        <section aria-labelledby="categories-title">
          <h2 id="categories-title" className="text-2xl font-semibold">
            {t("categoriesTitle")}
          </h2>
          {categories.length > 0 ? (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const name =
                  locale === "km" && category.name_km
                    ? category.name_km
                    : category.name_en;
                return (
                  <li key={category.slug}>
                    <Link href="/categories" className={cardLinkClasses()}>
                      <h3 className="text-lg font-semibold">{name}</h3>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-5">
              <EmptyState title={t("categoriesEmpty")} />
            </div>
          )}
        </section>

        <section aria-labelledby="how-title">
          <h2 id="how-title" className="text-2xl font-semibold">
            {t("howTitle")}
          </h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full">
                  <span
                    aria-hidden="true"
                    className="bg-primary-soft text-primary inline-flex size-9 items-center justify-center rounded-full font-semibold"
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="text-muted mt-1">{step.text}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="provinces-title">
          <h2 id="provinces-title" className="text-2xl font-semibold">
            {t("provincesTitle")}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {featuredProvinces.map((province) => (
              <li key={province}>
                <TagLink href="/provinces">{tProvinces(province)}</TagLink>
              </li>
            ))}
            <li>
              <TagLink href="/provinces" className="text-primary font-medium">
                {t("provincesAll")} →
              </TagLink>
            </li>
          </ul>
        </section>

        <section
          aria-labelledby="contribute-title"
          className="bg-primary-soft rounded-[var(--radius-card)] p-6 sm:p-8"
        >
          <h2 id="contribute-title" className="text-2xl font-semibold">
            {t("contributeTitle")}
          </h2>
          <p className="mt-2 max-w-2xl">{t("contributeText")}</p>
          <a
            href={links.suggestShop}
            className={cn(buttonClasses({ size: "lg" }), "mt-5")}
          >
            {t("contributeCta")}
          </a>
        </section>
      </div>
    </>
  );
}
