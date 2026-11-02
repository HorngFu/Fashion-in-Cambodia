import type { ReactNode } from "react";

// Friendly placeholder for lists with no items or sections not built yet.
export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-border bg-surface flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed px-6 py-12 text-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="text-accent size-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M6 3h12l3 6-9 12L3 9z" />
        <path d="M3 9h18M9 3l3 18 3-18" />
      </svg>
      <p className="text-lg font-semibold">{title}</p>
      {text && <p className="text-muted max-w-md">{text}</p>}
      {action}
    </div>
  );
}
