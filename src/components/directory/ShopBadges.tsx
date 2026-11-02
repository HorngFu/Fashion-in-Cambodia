import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import type { Shop } from "@/lib/content";

export async function ShopBadges({ shop }: { shop: Shop }) {
  const t = await getTranslations("Badge");
  return (
    <span className="flex flex-wrap gap-1.5">
      {shop.is_sample && <Badge tone="accent">{t("sample")}</Badge>}
      {shop.verified && <Badge tone="primary">✓ {t("verified")}</Badge>}
      {shop.status === "temporarily_closed" && (
        <Badge>{t("temporarilyClosed")}</Badge>
      )}
    </span>
  );
}
