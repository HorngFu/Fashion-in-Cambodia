import Script from "next/script";

// Cloudflare Web Analytics: free, cookie-free, privacy-friendly page views.
// The token is public (it ends up in the page HTML) and is set as a build
// variable in Cloudflare. Without it, nothing is loaded.
const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export function CloudflareAnalytics() {
  if (!token) return null;

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
      strategy="afterInteractive"
    />
  );
}
