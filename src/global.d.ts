import type { Locale } from "@/i18n/routing";
import type messages from "../messages/en.json";

// Type-checks translation keys and locales across the app.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
