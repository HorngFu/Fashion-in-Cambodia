// Site sections shown in navigation.
export const navSections = ["categories", "shops", "provinces", "map"] as const;

// Text pages from content/pages, linked in the footer.
export const contentPages = ["about", "contribute", "faq", "privacy"] as const;

// Sections that are not built yet. They render a "coming soon" placeholder
// from src/app/[locale]/[section]/page.tsx until their phase replaces them.
export const placeholderSections = ["map", "search"] as const;

export type Section =
  | (typeof navSections)[number]
  | (typeof contentPages)[number]
  | (typeof placeholderSections)[number];

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
