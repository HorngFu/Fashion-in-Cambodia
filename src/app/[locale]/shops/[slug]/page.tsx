import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/directory/PageHeader";
import { ShopBadges } from "@/components/directory/ShopBadges";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SmartImage } from "@/components/ui/SmartImage";
import { alternatesFor } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import { toLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import {
  directionsHref,
  phoneHref,
  reportHref,
  telegramHref,
} from "@/lib/contact";
import {
  getProductsForShop,
  getProvince,
  getShop,
  getShops,
  localized,
} from "@/lib/content";

// Only shops in /content exist; anything else gets the prebuilt 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getShops()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/shops/[slug]">): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const shop = await getShop(slug);
  if (!shop) return {};
  return {
    title: localized(locale, shop.name_en, shop.name_km),
    description:
      localized(locale, shop.description_en, shop.description_km) || undefined,
    alternates: alternatesFor(locale, `/shops/${slug}`),
    // Example data must never appear in search results.
    robots: shop.is_sample ? { index: false } : undefined,
  };
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </Card>
  );
}

export default async function ShopPage({
  params,
}: PageProps<"/[locale]/shops/[slug]">) {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  setRequestLocale(locale);

  const shop = await getShop(slug);
  if (!shop) notFound();

  const [t, tNav, tType, format, province, items] = await Promise.all([
    getTranslations("Shop"),
    getTranslations("Nav"),
    getTranslations("ShopType"),
    getFormatter(),
    shop.location.province ? getProvince(shop.location.province) : undefined,
    getProductsForShop(shop),
  ]);

  const name = localized(locale, shop.name_en, shop.name_km);
  const provinceName =
    province && localized(locale, province.name_en, province.name_km);
  const { contact, location } = shop;
  const directions = directionsHref(shop);
  const address = localized(locale, location.address_en, location.address_km);
  const hours = localized(locale, shop.opening_hours_en, shop.opening_hours_km);
  const linkButton = cn(buttonClasses({ variant: "secondary" }), "w-full");

  const socials = [
    contact.telegram && {
      label: t("telegram"),
      href: telegramHref(contact.telegram),
    },
    contact.facebook && { label: t("facebook"), href: contact.facebook },
    contact.instagram && { label: t("instagram"), href: contact.instagram },
    contact.tiktok && { label: t("tiktok"), href: contact.tiktok },
    contact.website && { label: t("website"), href: contact.website },
  ].filter((link): link is { label: string; href: string } => !!link);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <PageHeader
        crumbs={[
          { label: tNav("home"), href: "/" },
          { label: tNav("shops"), href: "/shops" },
          ...(province && provinceName
            ? [{ label: provinceName, href: `/provinces/${province.slug}` }]
            : []),
          { label: name },
        ]}
        title={name}
        intro={localized(locale, shop.description_en, shop.description_km)}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-muted">{tType(shop.shop_type)}</span>
          <ShopBadges shop={shop} />
        </div>
      </PageHeader>

      {shop.is_sample && (
        <p className="bg-accent-soft text-accent-fg rounded-[var(--radius-card)] p-4">
          {t("sampleNotice")}
        </p>
      )}
      {shop.status === "temporarily_closed" && (
        <p className="bg-surface-muted rounded-[var(--radius-card)] p-4 font-medium">
          {t("temporarilyClosed")}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="sells" className="flex flex-col gap-3">
            <h2 id="sells" className="text-2xl font-semibold">
              {t("sells")}
            </h2>
            <ul className="divide-border border-border bg-surface divide-y rounded-[var(--radius-card)] border">
              {items.map(({ product, priceNote }) => (
                <li key={product.slug}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="hover:bg-surface-muted flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3"
                  >
                    <span className="font-medium">
                      {localized(locale, product.name_en, product.name_km)}
                    </span>
                    {priceNote && (
                      <span className="text-muted text-sm">{priceNote}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {shop.photos.length > 0 && (
            <section aria-labelledby="photos" className="flex flex-col gap-3">
              <h2 id="photos" className="text-2xl font-semibold">
                {t("photos")}
              </h2>
              <ul className="grid grid-cols-2 gap-3">
                {shop.photos.map((photo, index) => (
                  <li key={index}>
                    <SmartImage
                      src={photo.image}
                      alt={localized(locale, photo.alt_en, photo.alt_km)}
                      sizes="(min-width: 1024px) 33vw, 50vw"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          {(contact.phones.length > 0 || socials.length > 0) && (
            <InfoCard title={t("contact")}>
              {contact.phones.map((phone) => (
                <a
                  key={phone}
                  href={phoneHref(phone)}
                  className={cn(buttonClasses(), "w-full")}
                >
                  {t("call", { phone })}
                </a>
              ))}
              {socials.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  rel="noopener"
                  className={linkButton}
                >
                  {link.label}
                </a>
              ))}
            </InfoCard>
          )}

          <InfoCard title={t("location")}>
            {shop.shop_type === "online_only" ? (
              <p className="text-muted">{t("onlineOnly")}</p>
            ) : (
              <dl className="flex flex-col gap-2 text-sm">
                {location.market_name && (
                  <div>
                    <dt className="text-muted">{t("market")}</dt>
                    <dd>{location.market_name}</dd>
                  </div>
                )}
                {address && (
                  <div>
                    <dt className="sr-only">{t("location")}</dt>
                    <dd className="whitespace-pre-line">{address}</dd>
                  </div>
                )}
                {(location.district || provinceName) && (
                  <div>
                    <dt className="text-muted">{t("district")}</dt>
                    <dd>
                      {[location.district, provinceName]
                        .filter(Boolean)
                        .join(", ")}
                    </dd>
                  </div>
                )}
              </dl>
            )}
            {directions && (
              <a href={directions} rel="noopener" className={linkButton}>
                {t("directions")}
              </a>
            )}
          </InfoCard>

          {hours && (
            <InfoCard title={t("openingHours")}>
              <p>{hours}</p>
            </InfoCard>
          )}

          <div className="text-muted flex flex-col gap-2 px-1 text-sm">
            <p>
              {shop.verified && shop.last_verified
                ? t("lastVerified", {
                    date: format.dateTime(new Date(shop.last_verified), {
                      dateStyle: "long",
                    }),
                  })
                : t("notVerified")}
            </p>
            <a
              href={reportHref(shop.name_en, `/${locale}/shops/${shop.slug}`)}
              className="text-primary underline"
            >
              {t("report")}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
