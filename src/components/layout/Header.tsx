import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { navSections } from "@/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LogoMark } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { SearchBox } from "./SearchBox";

export async function Header() {
  const [t, tNav, tMeta] = await Promise.all([
    getTranslations("Header"),
    getTranslations("Nav"),
    getTranslations("Metadata"),
  ]);

  const navLinks = navSections.map((section) => (
    <li key={section}>
      <Link
        href={`/${section}`}
        className="text-fg hover:bg-surface-muted hover:text-primary inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-3"
      >
        {tNav(section)}
      </Link>
    </li>
  ));

  return (
    <header className="border-border bg-bg/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link
          href="/"
          aria-label={t("homeLabel")}
          className="flex shrink-0 items-center gap-2 rounded-[var(--radius-control)]"
        >
          <LogoMark className="size-9" />
          <span className="hidden font-semibold sm:inline">
            {tMeta("siteName")}
          </span>
        </Link>

        <nav aria-label={t("mainNav")} className="hidden md:block">
          <ul className="flex items-center gap-1">{navLinks}</ul>
        </nav>

        <SearchBox id="header-search" className="hidden max-w-xs lg:flex" />

        <LanguageSwitcher className="ml-auto" />

        <MobileMenu>
          <SearchBox id="mobile-search" />
          <nav aria-label={t("mainNav")} className="mt-4">
            <ul className="flex flex-col gap-1">{navLinks}</ul>
          </nav>
        </MobileMenu>
      </div>
    </header>
  );
}
