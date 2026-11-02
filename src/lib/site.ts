// Site sections shown in navigation. Pages that are not built yet render a
// "coming soon" placeholder from src/app/[locale]/[section]/page.tsx.
export const navSections = ["categories", "shops", "provinces", "map"] as const;
export const footerSections = ["about", "contribute"] as const;
export const sections = [...navSections, ...footerSections, "search"] as const;

export type Section = (typeof sections)[number];

// Public URL of the live site, used for absolute links in metadata.
// Set NEXT_PUBLIC_SITE_URL once a custom domain is connected (Phase 10).
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://fashion-in-cambodia.horngfu.workers.dev";

const repo = "https://github.com/HorngFu/Fashion-in-Cambodia";

export const links = {
  repo,
  suggestShop: `${repo}/issues/new?template=new-shop.yml`,
  reportInfo: `${repo}/issues/new?template=wrong-info.yml`,
};
