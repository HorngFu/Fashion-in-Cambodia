import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

// A plain GET form, so it works without JavaScript. Results arrive in Phase 5.
export async function SearchBox({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const [t, locale] = await Promise.all([
    getTranslations("Search"),
    getLocale(),
  ]);

  return (
    <form
      role="search"
      action={`/${locale}/search`}
      method="get"
      className={cn("flex w-full items-center gap-2", className)}
    >
      <label htmlFor={id} className="sr-only">
        {t("label")}
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder={t("placeholder")}
        className="border-border bg-surface text-fg placeholder:text-muted focus:border-primary min-h-11 w-full min-w-0 rounded-[var(--radius-control)] border px-3.5 text-sm"
      />
      <button
        type="submit"
        className="bg-primary text-primary-fg hover:bg-primary-hover inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] px-3"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="sr-only">{t("submit")}</span>
      </button>
    </form>
  );
}
