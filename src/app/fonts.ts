import { Kantumruy_Pro } from "next/font/google";

// One variable font that covers both Khmer and Latin, designed so the two
// scripts sit well together. Self-hosted by next/font at build time.
export const kantumruy = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  display: "swap",
  variable: "--font-kantumruy",
});
