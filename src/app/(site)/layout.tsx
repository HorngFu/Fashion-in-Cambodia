import type { Metadata } from "next";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import "../globals.css";

// Fail the build if any public page would need rendering on every request.
// Static pages are what keep hosting on the Cloudflare free plan.
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: "Fashion in Cambodia",
  description:
    "Find fashion products, materials and tools in Cambodia — and the shops that sell them.",
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="km" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
