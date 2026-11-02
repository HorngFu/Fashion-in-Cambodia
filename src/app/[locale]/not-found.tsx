import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

// Shown inside the site layout when a page calls notFound(), e.g. /km/unknown
// or an unknown language like /xx (which falls back to Khmer).
export default async function NotFound() {
  const [t, tCommon] = await Promise.all([
    getTranslations("NotFound"),
    getTranslations("Common"),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-primary mb-4 text-center text-5xl font-bold">404</p>
      <EmptyState
        title={t("title")}
        text={t("text")}
        action={
          <ButtonLink href="/" className="mt-2">
            {tCommon("backHome")}
          </ButtonLink>
        }
      />
    </div>
  );
}
