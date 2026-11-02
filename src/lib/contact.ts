import { links, siteUrl } from "@/lib/site";

// "012 345 678" or "+855 12 345 678" -> "tel:+85512345678"
export function phoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  const international = digits.startsWith("+")
    ? digits
    : `+855${digits.replace(/^0/, "")}`;
  return `tel:${international}`;
}

// Telegram username ("silkhouse", "@silkhouse") or phone number.
export function telegramHref(value: string) {
  const trimmed = value.trim().replace(/^@/, "");
  if (/^[\d+\s]+$/.test(trimmed)) {
    return `https://t.me/${phoneHref(trimmed).slice("tel:".length)}`;
  }
  return `https://t.me/${trimmed}`;
}

// The shop's own Google Maps link, or a search for its map position.
export function directionsHref(shop: {
  location: { google_maps_url: string | null };
  position: { lat: number; lng: number } | null;
}) {
  if (shop.location.google_maps_url) return shop.location.google_maps_url;
  if (!shop.position) return null;
  const { lat, lng } = shop.position;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

// Opens the "Report wrong information" issue form with the page filled in.
export function reportHref(name: string, path: string) {
  const params = new URLSearchParams({
    template: "wrong-info.yml",
    title: `[Wrong info] ${name}`,
    page: `${siteUrl}${path}`,
  });
  return `${links.repo}/issues/new?${params}`;
}
