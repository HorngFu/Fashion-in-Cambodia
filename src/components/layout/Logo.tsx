// Placeholder mark: a folded silk scarf in crimson and gold (decision D10).
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M8 10c4 0 6 3 8 6s4 6 8 6"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-primary-fg"
      />
      <path
        d="M8 22c4 0 6-3 8-6s4-6 8-6"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-accent"
      />
    </svg>
  );
}
