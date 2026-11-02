import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-border bg-surface rounded-[var(--radius-card)] border p-5",
        className,
      )}
      {...props}
    />
  );
}

// A card that is one big link. The heading inside should describe the target.
export function cardLinkClasses(className?: string) {
  return cn(
    "block rounded-[var(--radius-card)] border border-border bg-surface p-5 transition-colors hover:border-primary",
    className,
  );
}
