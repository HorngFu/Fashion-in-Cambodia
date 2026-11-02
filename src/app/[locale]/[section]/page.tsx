import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { alternatesFor } from "@/i18n/metadata";
import { routing, toLocale } from "@/i18n/routing";
import { type Section, sections } from "@/lib/site";

// Placeholder for sections that are not built yet. Real pages added later
// (e.g. src/app/[locale]/shops/page.tsx) take priority over this route.
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    sections.map((section) => ({ locale, section })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[section]">): Promise<Metadata> {
  const { locale: rawLocale, section } = await params;
  const locale = toLocale(rawLocale);
  if (!isSection(section)) return {};
  const t = await getTranslations({ locale, namespace: "Nav" });
  return {
    title: t(section),
    alternates: alternatesFor(locale, `/${section}`),
  };
}

function isSection(value: string): value is Section {
  return (sections as readonly string[]).includes(value);
}

export default async function ComingSoonPage({
  params,
}: PageProps<"/[locale]/[section]">) {
  const { locale: rawLocale, section } = await params;
  const locale = toLocale(rawLocale);
  if (!isSection(section)) notFound();
  setRequestLocale(locale);

  const [t, tNav, tCommon] = await Promise.all([
    getTranslations("ComingSoon"),
    getTranslations("Nav"),
    getTranslations("Common"),
  ]);
  const name = tNav(section);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <Breadcrumbs
        items={[{ label: tNav("home"), href: "/" }, { label: name }]}
      />
      <div>
        <Badge tone="accent">{tCommon("comingSoon")}</Badge>
        <h1 className="mt-3 text-3xl font-bold">{name}</h1>
      </div>
      <EmptyState
        title={t("title", { section: name })}
        text={t("text")}
        action={
          <ButtonLink href="/" variant="secondary" className="mt-2">
            {tCommon("backHome")}
          </ButtonLink>
        }
      />
    </div>
  );
}
