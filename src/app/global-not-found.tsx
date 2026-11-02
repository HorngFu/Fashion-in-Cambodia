import type { Metadata } from "next";
import en from "../../messages/en.json";
import km from "../../messages/km.json";
import { kantumruy } from "./fonts";
import "./globals.css";

// Shown for any URL that matches no route (e.g. /km/unknown or /unknown).
// It renders outside the [locale] layout, so it shows both languages.
export const metadata: Metadata = {
  title: `${en.NotFound.title} · ${en.Metadata.siteName}`,
};

const versions = [
  { locale: "km", messages: km },
  { locale: "en", messages: en },
] as const;

export default function GlobalNotFound() {
  return (
    <html lang="km" className={kantumruy.variable}>
      <body className="flex min-h-dvh items-center justify-center px-4 py-16">
        <main className="flex w-full max-w-lg flex-col gap-8 text-center">
          <p className="text-primary text-5xl font-bold">404</p>
          {versions.map(({ locale, messages }) => (
            <section key={locale} lang={locale}>
              <h1 className="text-2xl font-semibold">
                {messages.NotFound.title}
              </h1>
              <p className="text-muted mt-2">{messages.NotFound.text}</p>
              <a
                href={`/${locale}`}
                className="bg-primary text-primary-fg hover:bg-primary-hover mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-5 font-medium"
              >
                {messages.Common.backHome}
              </a>
            </section>
          ))}
        </main>
      </body>
    </html>
  );
}
