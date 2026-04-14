import React, { useState, useRef, useMemo, useCallback } from "react";
import type { Tier } from "../../tokens.ts";

// ─── shared types ─────────────────────────────────────────────────────────────

/** Classification type for a data asset. */
export type AssetType = "dataset" | "query" | "actor";

/**
 * DataAssetOption — a data asset that can be declared as a dependency.
 *
 * Shared by `DependencySearchInput` (the search widget) and
 * `DependencyList` (the selected-items view).
 */
export interface DataAssetOption {
  /** Unique identifier (e.g. "DS-001"). */
  id: string;
  /** Human-readable display name. */
  name: string;
  /** Source organisation or system (e.g. "STATEC", "ARE"). */
  source?: string;
  /** Asset classification — dataset, query, or actor. */
  assetType: AssetType;
  /** Medallion tier, if the asset has been tiered. */
  tier?: Tier;
  /** Brief description of the asset's content or purpose. */
  description?: string;
  /**
   * ISO 8601 date string of last update (e.g. "2025-11-01").
   * Used by the "Latest" sort order.
   */
  updatedAt?: string;
}

// ─── internal filter / sort types ────────────────────────────────────────────

/** Active type filter inside the search dropdown. */
type TypeFilter = "all" | AssetType;
/** Active tier filter inside the search dropdown. */
type TierFilter = "all" | Tier;
/** Sort order applied to the result list. */
type SortKey   = "name-asc" | "name-desc" | "updated";

// ─── visual mappings ──────────────────────────────────────────────────────────

const TYPE_LABELS: Record<AssetType, string> = {
  dataset: "Dataset",
  query:   "Query",
  actor:   "Actor",
};

/** Two-letter abbreviation rendered inside the coloured type badge. */
export const TYPE_ABBREV: Record<AssetType, string> = {
  dataset: "DS",
  query:   "QR",
  actor:   "AC",
};

/** Background and text Tailwind classes for the type badge. */
export const TYPE_BADGE: Record<AssetType, { bg: string; text: string }> = {
  dataset: { bg: "bg-odm-info-bg", text: "text-odm-info" },
  query:   { bg: "bg-odm-ok-bg",   text: "text-odm-ok"   },
  actor:   { bg: "bg-odm-warn-bg", text: "text-odm-warn"  },
};

/** Background Tailwind class for the inline tier badge (mirrors TierBadge). */
export const TIER_BG: Record<Tier, string> = {
  bronze: "bg-[#9A815026]",
  silver: "bg-[#8E909126]",
  gold:   "bg-lux-red-20",
};

/** Text colour Tailwind class for the inline tier badge. */
export const TIER_TEXT: Record<Tier, string> = {
  bronze: "text-lux-gold",
  silver: "text-lux-silver",
  gold:   "text-lux-red",
};

// ─── FilterPill ───────────────────────────────────────────────────────────────

/** Props for the compact pill toggle rendered inside the dropdown filter strip. */
interface FilterPillProps {
  /** Display label. */
  label: string;
  /** Whether this pill is the currently-active selection. */
  active: boolean;
  /**
   * Called on activation. Uses `onMouseDown` (not `onClick`) so activation
   * does not blur the search input.
   */
  onClick: () => void;
}

/** Compact pill button used inside the search-dropdown filter strip. */
function FilterPill({ label, active, onClick }: FilterPillProps): React.ReactElement {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={[
        "font-sans text-[11px] font-medium px-2 py-0 leading-5 cursor-pointer",
        "border transition-colors duration-75",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-1",
        active
          ? "bg-odm-ink text-white border-transparent"
          : "bg-transparent text-odm-mid border-odm-line hover:bg-odm-surface",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

// ─── DependencySearchInput ────────────────────────────────────────────────────

/**
 * DependencySearchInputProps — props for the `DependencySearchInput` component.
 */
export interface DependencySearchInputProps {
  /**
   * Full pool of data assets to search through.
   * May contain hundreds of entries — results are filtered client-side and
   * only `pageSize` cards are rendered at a time, so large pools are safe.
   */
  assets: DataAssetOption[];
  /**
   * Called when the user selects a result from the dropdown.
   * Pair with `DependencyList` to accumulate the selection.
   */
  onSelect: (asset: DataAssetOption) => void;
  /**
   * IDs of assets that have already been selected.
   * Matching entries appear disabled (greyed-out, unclickable) in results,
   * giving visual feedback that they are already declared.
   */
  selectedIds?: string[];
  /**
   * Placeholder text shown inside the search input when empty.
   * @default "Search data assets…"
   */
  placeholder?: string;
  /**
   * Maximum number of result cards rendered in the dropdown at a time.
   * When the filtered total exceeds this, a footer shows
   * "Showing N of M — refine your search to see more".
   * @default 12
   */
  pageSize?: number;
  /** Additional CSS classes on the root wrapper element. */
  className?: string;
}

/**
 * DependencySearchInput — freetext search widget for declaring data asset
 * dependencies.
 *
 * Combines a search input with an in-dropdown filter strip so that type, tier,
 * and sort-order narrowing are available without a separate side panel.
 * Handles hundreds of assets safely: only `pageSize` result cards are rendered
 * at a time, and a footer count tells the user when to refine further.
 *
 * The filter controls (Type / Tier / Sort) appear inside the result panel when
 * the dropdown opens, keeping the input chrome uncluttered.
 * Keyboard navigation: ↑↓ to move focus, Enter to select, Escape to close.
 *
 * Pair with `DependencyList` — pass `selectedIds` from the list so already-
 * chosen assets appear disabled, and feed `onSelect` into your list state.
 *
 * @example
 * const [deps, setDeps] = useState<DataAssetOption[]>([]);
 *
 * <DependencySearchInput
 *   assets={allAssets}
 *   selectedIds={deps.map(d => d.id)}
 *   onSelect={asset => setDeps(prev => [...prev, asset])}
 *   placeholder="Search datasets and queries…"
 * />
 * <DependencyList items={deps} onChange={setDeps} />
 */
export function DependencySearchInput({
  assets,
  onSelect,
  selectedIds = [],
  placeholder = "Search data assets…",
  pageSize = 12,
  className = "",
}: DependencySearchInputProps): React.ReactElement {
  const [query,      setQuery]      = useState("");
  const [open,       setOpen]       = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [sortKey,    setSortKey]    = useState<SortKey>("name-asc");
  const [focusedIdx, setFocusedIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLUListElement>(null);

  const q = query.trim().toLowerCase();

  /* ── Filtered + sorted results ─────────────────────────────────────────── */
  const results = useMemo<DataAssetOption[]>(() => {
    let pool = assets;

    if (q.length > 0) {
      pool = pool.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          (a.source?.toLowerCase().includes(q) ?? false) ||
          (a.description?.toLowerCase().includes(q) ?? false)
      );
    }

    if (typeFilter !== "all") pool = pool.filter((a) => a.assetType === typeFilter);
    if (tierFilter !== "all") pool = pool.filter((a) => a.tier === tierFilter);

    return [...pool].sort((a, b) => {
      if (sortKey === "name-asc")  return a.name.localeCompare(b.name);
      if (sortKey === "name-desc") return b.name.localeCompare(a.name);
      return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
    });
  }, [assets, q, typeFilter, tierFilter, sortKey]);

  const visible = results.slice(0, pageSize);
  const total   = results.length;

  /* ── Commit a selection ─────────────────────────────────────────────────── */
  const commit = useCallback(
    (asset: DataAssetOption): void => {
      onSelect(asset);
      setQuery("");
      setOpen(false);
      setFocusedIdx(-1);
      inputRef.current?.focus();
    },
    [onSelect]
  );

  /* ── Keyboard navigation ────────────────────────────────────────────────── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (!open) { setOpen(true); return; }
      if (e.key === "Escape") { setOpen(false); setFocusedIdx(-1); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIdx((i) => Math.min(i + 1, visible.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && focusedIdx >= 0) {
        e.preventDefault();
        const asset = visible[focusedIdx];
        if (asset && !selectedIds.includes(asset.id)) commit(asset);
      }
    },
    [open, visible, focusedIdx, selectedIds, commit]
  );

  function handleResultMouseDown(asset: DataAssetOption): void {
    if (selectedIds.includes(asset.id)) return;
    commit(asset);
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className={["relative", className].join(" ")}>

      {/* Search input */}
      <div className="relative flex items-center">
        <span
          aria-hidden="true"
          className="absolute left-2.5 text-odm-muted text-[15px] pointer-events-none leading-none"
        >
          ⌕
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-label="Search data assets"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setFocusedIdx(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          className={[
            "w-full font-sans text-[13px] text-odm-ink bg-white",
            "border border-odm-line border-b-2 border-b-odm-line-h",
            "pl-8 pr-8 py-1.5 outline-none appearance-none",
            "placeholder:text-odm-faint",
            "focus:border-b-lux-red transition-colors duration-100",
          ].join(" ")}
        />
        {query && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setQuery("");
              setFocusedIdx(-1);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-2.5 bg-transparent border-0 cursor-pointer p-0 font-sans text-xs text-odm-muted hover:text-odm-mid transition-colors duration-100"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          className={[
            "absolute z-50 left-0 right-0 top-full",
            "bg-white border border-odm-line-h border-t-0",
            "shadow-[0_4px_12px_rgba(0,0,0,0.10)]",
          ].join(" ")}
        >
          {/* Filter strip — two compact rows */}
          <div className="px-2 pt-2 pb-1.5 border-b border-odm-line-l flex flex-col gap-1.5">

            {/* Row 1 — Type */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-sans text-[10px] uppercase tracking-wider text-odm-faint font-medium w-7 shrink-0">
                Type
              </span>
              {(["all", "dataset", "query", "actor"] as const).map((t) => (
                <FilterPill
                  key={t}
                  label={t === "all" ? "All" : TYPE_LABELS[t]}
                  active={typeFilter === t}
                  onClick={() => { setTypeFilter(t); setFocusedIdx(-1); }}
                />
              ))}
            </div>

            {/* Row 2 — Tier + Sort */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-sans text-[10px] uppercase tracking-wider text-odm-faint font-medium w-7 shrink-0">
                Tier
              </span>
              {(["all", "bronze", "silver", "gold"] as const).map((t) => (
                <FilterPill
                  key={t}
                  label={t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                  active={tierFilter === t}
                  onClick={() => { setTierFilter(t); setFocusedIdx(-1); }}
                />
              ))}
              <div className="ml-auto flex items-center gap-1">
                <span className="font-sans text-[10px] uppercase tracking-wider text-odm-faint font-medium">
                  Sort
                </span>
                {([
                  ["name-asc",  "A→Z"],
                  ["name-desc", "Z→A"],
                  ["updated",   "Latest"],
                ] as const).map(([key, label]) => (
                  <FilterPill
                    key={key}
                    label={label}
                    active={sortKey === key}
                    onClick={() => setSortKey(key)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Result list */}
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Data asset results"
            className="max-h-64 overflow-y-auto"
          >
            {visible.length === 0 ? (
              <li className="px-3 py-3 font-sans text-[12px] text-odm-faint select-none">
                {q.length > 0
                  ? `No results for "${query}"`
                  : "No assets match the current filters"}
              </li>
            ) : (
              visible.map((asset, idx) => {
                const isSelected = selectedIds.includes(asset.id);
                const isFocused  = focusedIdx === idx;
                const badge      = TYPE_BADGE[asset.assetType];

                return (
                  <li
                    key={asset.id}
                    role="option"
                    aria-selected={isFocused}
                    aria-disabled={isSelected}
                    onMouseDown={() => handleResultMouseDown(asset)}
                    onMouseEnter={() => setFocusedIdx(idx)}
                    className={[
                      "px-3 py-2 border-b border-odm-line-l last:border-b-0 select-none",
                      isSelected
                        ? "opacity-40 cursor-not-allowed bg-odm-surface"
                        : isFocused
                          ? "bg-odm-card cursor-pointer"
                          : "hover:bg-odm-card cursor-pointer",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      {/* Type badge */}
                      <span
                        className={[
                          "inline-flex items-center justify-center font-sans text-[10px] font-bold",
                          "px-1 leading-4 shrink-0",
                          badge.bg,
                          badge.text,
                        ].join(" ")}
                      >
                        {TYPE_ABBREV[asset.assetType]}
                      </span>

                      {/* Name + ID / source */}
                      <div className="flex-1 min-w-0">
                        <div className="font-sans text-[13px] font-semibold text-odm-ink leading-tight truncate">
                          {asset.name}
                        </div>
                        <div className="font-sans text-[11px] text-odm-muted mt-0.5 leading-tight truncate">
                          {[asset.id, asset.source].filter(Boolean).join(" · ")}
                        </div>
                      </div>

                      {/* Tier badge */}
                      {asset.tier && (
                        <span
                          className={[
                            "inline-block font-sans text-[10px] font-bold tracking-[0.06em] uppercase",
                            "px-1.5 leading-4 shrink-0 whitespace-nowrap",
                            TIER_BG[asset.tier],
                            TIER_TEXT[asset.tier],
                          ].join(" ")}
                        >
                          {asset.tier}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          {/* Result count footer */}
          {total > 0 && (
            <div className="px-3 py-1 border-t border-odm-line-l">
              <span className="font-sans text-[11px] text-odm-faint">
                {total <= pageSize
                  ? `${total} result${total !== 1 ? "s" : ""}`
                  : `Showing ${pageSize} of ${total} — refine your search to see more`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
