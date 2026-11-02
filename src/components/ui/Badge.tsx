import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Tone = "primary" | "accent" | "neutral";

const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent-fg",
  neutral: "bg-surface-muted text-muted",
};

// Short status label, e.g. "Verified" or "Made in Cambodia".
export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
