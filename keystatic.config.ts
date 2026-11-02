import { collection, config, fields, singleton } from "@keystatic/core";

// Content model for the directory. See docs/DEVELOPMENT_PHASES.md, section 5,
// and docs/EDITOR_GUIDE.md for how editors use it.
//
// Every entry has an English and a Khmer version of its text. English is
// required (decision D2); Khmer is optional and shown when present.

// Bounding box of Cambodia, with a small margin, for map coordinates.
export const CAMBODIA = {
  lat: { min: 9.9, max: 14.8 },
  lng: { min: 102.2, max: 107.8 },
};

// "latitude, longitude" as copied from Google Maps, e.g. "11.5634, 104.9168".
// Empty is allowed (online-only shops).
const COORDINATES_PATTERN =
  /^$|^\s*\d{1,2}\.\d{3,8}\s*,\s*\d{2,3}\.\d{3,8}\s*$/;

export function parseCoordinates(value: string) {
  const match = /^\s*([\d.]+)\s*,\s*([\d.]+)\s*$/.exec(value);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  const inside =
    lat >= CAMBODIA.lat.min &&
    lat <= CAMBODIA.lat.max &&
    lng >= CAMBODIA.lng.min &&
    lng <= CAMBODIA.lng.max;
  return inside ? { lat, lng } : null;
}

// Cambodian phone numbers: +855 or 0, then 8–9 digits (spaces allowed).
const PHONE_PATTERN = /^(\+855|0)[ ]?[1-9][0-9 ]{6,11}$/;

const nameEn = (label: string) =>
  fields.slug({
    name: {
      label: `${label} (English)`,
      validation: { isRequired: true, length: { max: 100 } },
    },
    slug: {
      label: "URL name",
      description:
        "Used in the web address. Lowercase letters, numbers and dashes only.",
      validation: {
        pattern: {
          regex: /^[a-z0-9]+(-[a-z0-9]+)*$/,
          message: "Use lowercase letters, numbers and single dashes",
        },
      },
    },
  });

const nameKm = (label: string) =>
  fields.text({
    label: `${label} (Khmer)`,
    validation: { length: { max: 100 } },
  });

const descriptionEn = () =>
  fields.text({
    label: "Description (English)",
    multiline: true,
    validation: { length: { max: 1000 } },
  });

const descriptionKm = () =>
  fields.text({
    label: "Description (Khmer)",
    multiline: true,
    validation: { length: { max: 1000 } },
  });

const photo = (directory: string) =>
  fields.object(
    {
      image: fields.image({
        label: "Photo",
        description:
          "Your own photo, or shared with permission (CC BY-SA 4.0).",
        directory: `public/images/${directory}`,
        publicPath: `/images/${directory}/`,
        validation: { isRequired: true },
      }),
      alt_en: fields.text({
        label: "Describe the photo (English)",
        description:
          "For people who cannot see it, e.g. “Rolls of silk on a market stall”.",
        validation: { isRequired: true, length: { max: 200 } },
      }),
      alt_km: fields.text({ label: "Describe the photo (Khmer)" }),
    },
    { label: "Photo" },
  );

const order = () =>
  fields.integer({
    label: "Sort order",
    description: "Lower numbers are shown first.",
    defaultValue: 100,
  });

export default config({
  // Local mode: edits are written straight to /content on your computer.
  // GitHub mode for the live site is set up in Phase 7.
  storage: { kind: "local" },
  ui: {
    brand: { name: "Fashion in Cambodia" },
    navigation: {
      Directory: ["shops", "products", "categories", "provinces"],
      Website: ["pages", "settings"],
    },
  },

  collections: {
    categories: collection({
      label: "Categories",
      slugField: "name_en",
      path: "content/categories/*",
      format: "yaml",
      columns: ["name_en", "name_km"],
      schema: {
        name_en: nameEn("Name"),
        name_km: nameKm("Name"),
        parent: fields.relationship({
          label: "Parent category",
          description: "Leave empty for a top-level category.",
          collection: "categories",
        }),
        description_en: descriptionEn(),
        description_km: descriptionKm(),
        icon: fields.select({
          label: "Icon",
          options: [
            { label: "Fabric", value: "fabric" },
            { label: "Clothing", value: "clothing" },
            { label: "Accessory", value: "accessory" },
            { label: "Tool", value: "tool" },
            { label: "Supplies", value: "supplies" },
            { label: "Service", value: "service" },
          ],
          defaultValue: "fabric",
        }),
        order: order(),
      },
    }),

    products: collection({
      label: "Products",
      slugField: "name_en",
      path: "content/products/*/",
      format: "yaml",
      columns: ["name_en", "name_km"],
      schema: {
        name_en: nameEn("Name"),
        name_km: nameKm("Name"),
        category: fields.relationship({
          label: "Category",
          collection: "categories",
          validation: { isRequired: true },
        }),
        description_en: descriptionEn(),
        description_km: descriptionKm(),
        photos: fields.array(photo("products"), {
          label: "Photos",
          itemLabel: (props) => props.fields.alt_en.value || "Photo",
          validation: { length: { max: 8 } },
        }),
        keywords: fields.array(fields.text({ label: "Keyword" }), {
          label: "Search keywords",
          description:
            "Other names people search for, in any language or spelling, e.g. “krama”, “kroma”, “ក្រមា”.",
          itemLabel: (props) => props.value,
        }),
        is_cambodian_made: fields.checkbox({
          label: "Made in Cambodia",
          defaultValue: false,
        }),
        typical_price: fields.text({
          label: "Typical price (optional)",
          description: "A rough guide only, e.g. “$5–15 per meter”.",
          validation: { length: { max: 80 } },
        }),
      },
    }),

    shops: collection({
      label: "Shops",
      slugField: "name_en",
      path: "content/shops/*/",
      format: "yaml",
      columns: ["name_en", "name_km"],
      schema: {
        name_en: nameEn("Shop name"),
        name_km: nameKm("Shop name"),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Open", value: "active" },
            { label: "Temporarily closed", value: "temporarily_closed" },
            { label: "Permanently closed", value: "closed" },
          ],
          defaultValue: "active",
        }),
        shop_type: fields.select({
          label: "Type of shop",
          options: [
            { label: "Shop", value: "physical" },
            { label: "Market stall", value: "market_stall" },
            { label: "Workshop / tailor", value: "workshop" },
            { label: "Online only", value: "online_only" },
          ],
          defaultValue: "physical",
        }),
        description_en: descriptionEn(),
        description_km: descriptionKm(),

        products: fields.array(
          fields.object(
            {
              product: fields.relationship({
                label: "Product",
                collection: "products",
                validation: { isRequired: true },
              }),
              price_note: fields.text({
                label: "Price note (optional)",
                description: "e.g. “from $4 per meter”",
                validation: { length: { max: 80 } },
              }),
            },
            { label: "Product" },
          ),
          {
            label: "Products sold",
            description:
              "What this shop sells. Product pages list shops from here.",
            itemLabel: (props) =>
              props.fields.product.value ?? "Choose a product",
          },
        ),

        location: fields.object(
          {
            province: fields.relationship({
              label: "Province",
              collection: "provinces",
              description: "Leave empty only for online-only shops.",
            }),
            district: fields.text({ label: "District / Khan" }),
            market_name: fields.text({
              label: "Market name",
              description: "If the shop is in a market, e.g. “Russian Market”.",
            }),
            address_en: fields.text({
              label: "Address (English)",
              multiline: true,
            }),
            address_km: fields.text({
              label: "Address (Khmer)",
              multiline: true,
            }),
            // One text field instead of two numbers: Keystatic's number input
            // rounds to 3 decimals (~100 m), and Google Maps copies both
            // numbers together. The range is checked by `pnpm check:content`.
            coordinates: fields.text({
              label: "Map position",
              description:
                "In Google Maps, right-click the shop and click the numbers at the top to copy them. Paste here, e.g. 11.5634, 104.9168",
              validation: {
                pattern: {
                  regex: COORDINATES_PATTERN,
                  message:
                    "Paste two numbers separated by a comma, e.g. 11.5634, 104.9168",
                },
              },
            }),
            google_maps_url: fields.url({ label: "Google Maps link" }),
          },
          { label: "Location" },
        ),

        contact: fields.object(
          {
            phones: fields.array(
              fields.text({
                label: "Phone",
                validation: {
                  pattern: {
                    regex: PHONE_PATTERN,
                    message:
                      "Use a Cambodian number, e.g. 012 345 678 or +855 12 345 678",
                  },
                },
              }),
              { label: "Phone numbers", itemLabel: (props) => props.value },
            ),
            telegram: fields.text({
              label: "Telegram",
              description: "Username (without @) or phone number.",
            }),
            facebook: fields.url({ label: "Facebook page" }),
            instagram: fields.url({ label: "Instagram" }),
            tiktok: fields.url({ label: "TikTok" }),
            website: fields.url({ label: "Website" }),
          },
          { label: "Contact" },
        ),

        opening_hours_en: fields.text({
          label: "Opening hours (English)",
          description: "e.g. “Every day 7:00–17:00”",
        }),
        opening_hours_km: fields.text({ label: "Opening hours (Khmer)" }),

        logo: fields.image({
          label: "Logo",
          description: "Only with the shop's permission.",
          directory: "public/images/shops",
          publicPath: "/images/shops/",
        }),
        photos: fields.array(photo("shops"), {
          label: "Photos",
          itemLabel: (props) => props.fields.alt_en.value || "Photo",
          validation: { length: { max: 8 } },
        }),

        verified: fields.checkbox({
          label: "Verified",
          description:
            "Tick only after visiting, calling, or confirming with the owner.",
          defaultValue: false,
        }),
        last_verified: fields.date({ label: "Last verified on" }),
        is_sample: fields.checkbox({
          label: "Sample entry",
          description:
            "Example data for development. Never shown as a real shop.",
          defaultValue: false,
        }),
      },
    }),

    provinces: collection({
      label: "Provinces",
      slugField: "name_en",
      path: "content/provinces/*",
      format: "yaml",
      columns: ["name_en", "name_km"],
      schema: {
        name_en: nameEn("Name"),
        name_km: nameKm("Name"),
        capital_en: fields.text({ label: "Capital (English)" }),
        capital_km: fields.text({ label: "Capital (Khmer)" }),
        center_lat: fields.number({
          label: "Map center latitude",
          step: 0.0001,
          validation: { isRequired: true, ...CAMBODIA.lat },
        }),
        center_lng: fields.number({
          label: "Map center longitude",
          step: 0.0001,
          validation: { isRequired: true, ...CAMBODIA.lng },
        }),
        zoom: fields.integer({
          label: "Map zoom",
          defaultValue: 11,
          validation: { min: 6, max: 16 },
        }),
        order: order(),
      },
    }),

    pages: collection({
      label: "Pages",
      slugField: "title_en",
      path: "content/pages/*/",
      format: "yaml",
      columns: ["title_en"],
      schema: {
        title_en: nameEn("Title"),
        title_km: nameKm("Title"),
        summary_en: fields.text({
          label: "Short summary (English)",
          multiline: true,
        }),
        summary_km: fields.text({
          label: "Short summary (Khmer)",
          multiline: true,
        }),
        body_en: fields.mdx({ label: "Text (English)" }),
        body_km: fields.mdx({ label: "Text (Khmer)" }),
      },
    }),
  },

  singletons: {
    settings: singleton({
      label: "Site settings",
      path: "content/settings/site",
      format: "yaml",
      schema: {
        contact_email: fields.text({
          label: "Contact email",
          description:
            "Public address for questions and code-of-conduct reports.",
          validation: {
            pattern: {
              regex: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          },
        }),
        social: fields.object(
          {
            facebook: fields.url({ label: "Facebook" }),
            telegram: fields.url({ label: "Telegram channel" }),
            instagram: fields.url({ label: "Instagram" }),
            tiktok: fields.url({ label: "TikTok" }),
          },
          { label: "Social media" },
        ),
        featured_categories: fields.multiRelationship({
          label: "Featured categories on the home page",
          collection: "categories",
          validation: { length: { max: 6 } },
        }),
        featured_shops: fields.multiRelationship({
          label: "Featured shops on the home page",
          collection: "shops",
          validation: { length: { max: 6 } },
        }),
      },
    }),
  },
});
