import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const tagClasses =
  "inline-flex min-h-9 items-center rounded-full border border-border bg-surface px-3.5 text-sm text-fg transition-colors hover:border-primary hover:text-primary";

// A pill-shaped link used for filters and quick links (provinces, tags).
export function TagLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn(tagClasses, className)} {...props} />;
}
