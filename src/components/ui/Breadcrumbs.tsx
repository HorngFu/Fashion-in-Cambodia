import { getTranslations } from "next-intl/server";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

type Crumb = { label: string; href?: ComponentProps<typeof Link>["href"] };

// The last crumb is the current page and is not a link.
export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = await getTranslations("Breadcrumbs");

  return (
    <nav aria-label={t("label")} className="text-muted text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
