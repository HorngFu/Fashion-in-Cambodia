import { collection, config, fields } from "@keystatic/core";

// Phase 1: a single test collection to prove Keystatic works end to end.
// The full content model (products, shops, provinces…) is added in Phase 3.
export default config({
  // Local mode: edits are written straight to /content on your computer.
  // GitHub mode for the live site is set up in Phase 7.
  storage: { kind: "local" },
  ui: {
    brand: { name: "Fashion in Cambodia" },
  },
  collections: {
    categories: collection({
      label: "Categories",
      slugField: "name_en",
      path: "content/categories/*",
      format: "yaml",
      schema: {
        name_en: fields.slug({
          name: { label: "Name (English)", validation: { isRequired: true } },
        }),
        name_km: fields.text({ label: "Name (Khmer)" }),
        order: fields.integer({ label: "Sort order", defaultValue: 0 }),
      },
    }),
  },
});
