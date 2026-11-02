import type { ComponentProps, ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

type Crumbs = ComponentProps<typeof Breadcrumbs>["items"];

// Breadcrumbs, title and an optional intro line, used at the top of pages.
export function PageHeader({
  crumbs,
  title,
  intro,
  children,
}: {
  crumbs: Crumbs;
  title: string;
  intro?: string | null;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold">{title}</h1>
      {children}
      {intro && <p className="text-muted max-w-2xl text-lg">{intro}</p>}
    </header>
  );
}
