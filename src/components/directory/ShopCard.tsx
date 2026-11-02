import { getLocale, getTranslations } from "next-intl/server";
import { cardLinkClasses } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { getProvinces, localized, type Shop } from "@/lib/content";
import { ShopBadges } from "./ShopBadges";

// A shop in a list: name, type, where it is, badges and an optional note
// (e.g. the shop's price for the product being viewed).
export async function ShopCard({
  shop,
  note,
  headingLevel = "h3",
}: {
  shop: Shop;
  note?: string | null;
  headingLevel?: "h2" | "h3";
}) {
  const [locale, tType, provinces] = await Promise.all([
    getLocale(),
    getTranslations("ShopType"),
    getProvinces(),
  ]);
  const province = provinces.find((p) => p.slug === shop.location.province);
  const place = [
    shop.location.market_name,
    province && localized(locale, province.name_en, province.name_km),
  ]
    .filter(Boolean)
    .join(" · ");
  const Heading = headingLevel;

  return (
    <Link
      href={`/shops/${shop.slug}`}
      className={cardLinkClasses("flex h-full flex-col gap-2")}
    >
      <Heading className="text-lg font-semibold">
        {localized(locale, shop.name_en, shop.name_km)}
      </Heading>
      <p className="text-muted text-sm">
        {tType(shop.shop_type)}
        {place && ` · ${place}`}
      </p>
      {note && <p className="text-sm font-medium">{note}</p>}
      <ShopBadges shop={shop} />
    </Link>
  );
}
