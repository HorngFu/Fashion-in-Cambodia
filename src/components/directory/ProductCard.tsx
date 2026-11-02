import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { cardLinkClasses } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { getShopCountsByProduct, localized, type Product } from "@/lib/content";

export async function ProductCard({ product }: { product: Product }) {
  const [locale, t, tBadge, counts] = await Promise.all([
    getLocale(),
    getTranslations("Product"),
    getTranslations("Badge"),
    getShopCountsByProduct(),
  ]);

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cardLinkClasses("flex h-full flex-col gap-2")}
    >
      <h3 className="text-lg font-semibold">
        {localized(locale, product.name_en, product.name_km)}
      </h3>
      <p className="text-muted text-sm">
        {t("shopCount", { count: counts.get(product.slug) ?? 0 })}
      </p>
      {product.is_cambodian_made && (
        <span>
          <Badge tone="accent">{tBadge("madeInCambodia")}</Badge>
        </span>
      )}
    </Link>
  );
}
