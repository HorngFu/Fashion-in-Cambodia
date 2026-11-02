"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useId, useState } from "react";

type Item = { slug: string; province: string; type: string; card: ReactNode };
type Option = { value: string; label: string };

// Filters a prerendered list of shops in the browser. The filters are kept in
// the URL (?province=…&type=…) so a filtered list can be shared, but they are
// read on the client: the page itself stays static.
export function ShopFilters({
  items,
  provinces,
  types,
}: {
  items: Item[];
  provinces: Option[];
  types: Option[];
}) {
  const t = useTranslations("Shops");
  const id = useId();
  const [province, setProvince] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Reading the URL once on load; filters are client-only state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProvince(params.get("province") ?? "");
    setType(params.get("type") ?? "");
  }, []);

  function update(next: { province?: string; type?: string }) {
    const p = next.province ?? province;
    const ty = next.type ?? type;
    setProvince(p);
    setType(ty);
    const params = new URLSearchParams();
    if (p) params.set("province", p);
    if (ty) params.set("type", ty);
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }

  const visible = items.filter(
    (item) =>
      (!province || item.province === province) &&
      (!type || item.type === type),
  );
  const selectClass =
    "border-border bg-surface text-fg min-h-11 rounded-[var(--radius-control)] border px-3";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-province`} className="text-sm font-medium">
            {t("filterProvince")}
          </label>
          <select
            id={`${id}-province`}
            value={province}
            onChange={(e) => update({ province: e.target.value })}
            className={selectClass}
          >
            <option value="">{t("allProvinces")}</option>
            {provinces.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-type`} className="text-sm font-medium">
            {t("filterType")}
          </label>
          <select
            id={`${id}-type`}
            value={type}
            onChange={(e) => update({ type: e.target.value })}
            className={selectClass}
          >
            <option value="">{t("allTypes")}</option>
            {types.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {(province || type) && (
          <button
            type="button"
            onClick={() => update({ province: "", type: "" })}
            className="text-primary min-h-11 px-2 font-medium underline"
          >
            {t("clearFilters")}
          </button>
        )}
      </div>

      <p className="text-muted" aria-live="polite">
        {t("showing", { count: visible.length })}
      </p>

      {visible.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item.slug}>{item.card}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">{t("noResults")}</p>
      )}
    </div>
  );
}
