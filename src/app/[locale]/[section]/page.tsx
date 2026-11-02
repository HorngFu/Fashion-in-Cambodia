import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/directory/PageHeader";
import { Prose } from "@/components/Prose";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { alternatesFor } from "@/i18n/metadata";
import { toLocale } from "@/i18n/routing";
import { getPage, localized } from "@/lib/content";
import { contentPages, placeholderSections } from "@/lib/site";

// One-segment pages under /km and /en that have no folder of their own:
// - text pages from content/pages (About, Contribute, FAQ, Privacy)
// - "coming soon" placeholders for sections a later phase builds (Map, Search)
// Unknown values get the prebuilt 404 page.
export const dynamicParams = false;

const sections = [...contentPages, ...placeholderSections];
type PageSection = (typeof sections)[number];

function isSection(value: string): value is PageSection {
  return (sections as readonly string[]).includes(value);
}

function isContentPage(value: string): value is (typeof contentPages)[number] {
  return (contentPages as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[section]">): Promise<Metadata> {
  const { locale: raw, section } = await params;
  const locale = toLocale(raw);
  if (!isSection(section)) return {};
  const alternates = alternatesFor(locale, `/${section}`);
  if (isContentPage(section)) {
    const page = await getPage(section);
    if (!page) return {};
    return {
      title: localized(locale, page.title_en, page.title_km),
      description:
        localized(locale, page.summary_en, page.summary_km) || undefined,
      alternates,
    };
  }
  const t = await getTranslations({ locale, namespace: "Nav" });
  return { title: t(section), alternates };
}

export default async function SectionPage({
  params,
}: PageProps<"/[locale]/[section]">) {
  const { locale: raw, section } = await params;
  const locale = toLocale(raw);
  if (!isSection(section)) notFound();
  setRequestLocale(locale);

  const [t, tNav, tCommon] = await Promise.all([
    getTranslations("ComingSoon"),
    getTranslations("Nav"),
    getTranslations("Common"),
  ]);

  if (isContentPage(section)) {
    const page = await getPage(section);
    if (!page) notFound();
    const title = localized(locale, page.title_en, page.title_km);
    // Khmer text when written, otherwise English.
    const body =
      locale === "km" && page.body_km.node.children.length > 0
        ? page.body_km
        : page.body_en;
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
        <PageHeader
          crumbs={[{ label: tNav("home"), href: "/" }, { label: title }]}
          title={title}
          intro={localized(locale, page.summary_en, page.summary_km)}
        />
        <Prose node={body.node} />
      </div>
    );
  }

  const name = tNav(section);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <PageHeader
        crumbs={[{ label: tNav("home"), href: "/" }, { label: name }]}
        title={name}
      >
        <span>
          <Badge tone="accent">{tCommon("comingSoon")}</Badge>
        </span>
      </PageHeader>
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
