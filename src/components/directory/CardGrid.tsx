import type { ReactNode } from "react";

// Responsive grid for cards: 1 column on phones, up to 3 on desktop.
export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
  );
}
