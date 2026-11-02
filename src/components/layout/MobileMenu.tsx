"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useId, useState } from "react";
import { usePathname } from "@/i18n/navigation";

// Menu button for small screens. The panel content (nav, search) is rendered
// on the server and passed in as children.
export function MobileMenu({ children }: { children: ReactNode }) {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const panelId = useId();

  // Close after navigating to another page.
  if (open && openedAt !== pathname) {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpenedAt(pathname);
          setOpen((value) => !value);
        }}
        className="text-fg hover:bg-surface-muted inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-control)]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M6 6l12 12M18 6 6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
        <span className="sr-only">{open ? t("closeMenu") : t("menu")}</span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="border-border bg-bg absolute inset-x-0 top-full border-b px-4 pt-4 pb-6 shadow-lg"
      >
        {children}
      </div>
    </div>
  );
}
