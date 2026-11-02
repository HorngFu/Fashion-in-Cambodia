import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { footerSections, links, navSections } from "@/lib/site";
import { LogoMark } from "./Logo";

const linkClass = "inline-block py-1 text-muted hover:text-primary";

export async function Footer() {
  const [t, tNav, tMeta] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Nav"),
    getTranslations("Metadata"),
  ]);

  return (
    <footer className="border-border bg-surface mt-16 border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <LogoMark className="size-8" />
            {tMeta("siteName")}
          </div>
          <p className="text-muted mt-3 max-w-sm text-sm">{t("tagline")}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">{t("explore")}</h2>
          <ul className="mt-2 text-sm">
            {[...navSections, ...footerSections].map((section) => (
              <li key={section}>
                <Link href={`/${section}`} className={linkClass}>
                  {tNav(section)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">{t("helpOut")}</h2>
          <ul className="mt-2 text-sm">
            <li>
              <a href={links.suggestShop} className={linkClass}>
                {t("suggestShop")}
              </a>
            </li>
            <li>
              <a href={links.reportInfo} className={linkClass}>
                {t("reportInfo")}
              </a>
            </li>
            <li>
              <a href={links.repo} className={linkClass}>
                {t("sourceCode")}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-border text-muted border-t px-4 py-4 text-center text-xs">
        {t("license")}
      </p>
    </footer>
  );
}
