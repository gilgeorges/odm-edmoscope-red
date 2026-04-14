import React, { useState } from "react";
import type { Tier } from "../../tokens.ts";
import {
  type DataAssetOption,
  type AssetType,
  TYPE_ABBREV,
  TYPE_BADGE,
  TIER_BG,
  TIER_TEXT,
} from "./DependencySearchInput.tsx";

// Re-export the shared type so consumers can import everything from one place.
export type { DataAssetOption, AssetType };

/**
 * DependencyListProps — props for the `DependencyList` component.
 */
export interface DependencyListProps {
  /**
   * Ordered list of data assets declared as dependencies.
   * Declaration order is preserved; drag-and-drop changes it.
   */
  items: DataAssetOption[];
  /**
   * Called whenever the list changes — an item is removed or the order is
   * updated by drag-and-drop. Receives the complete updated ordered array.
   */
  onChange: (items: DataAssetOption[]) => void;
  /** Additional CSS classes on the root wrapper element. */
  className?: string;
}

/**
 * DependencyList — ordered, editable list of declared data asset dependencies.
 *
 * Each row displays:
 * - A ☰ drag handle to reorder via the HTML5 Drag and Drop API
 * - A position index
 * - A coloured type badge (DS / QR / AC)
 * - The asset name and ID / source
 * - An optional tier badge
 * - A × delete button
 *
 * When `items` is empty, a dashed-border empty state is shown instead of the
 * list so users understand the widget is ready to receive assets.
 *
 * Pair with `DependencySearchInput` — pass `items.map(d => d.id)` as
 * `selectedIds` so already-declared assets appear disabled in the search
 * dropdown.
 *
 * @example
 * const [deps, setDeps] = useState<DataAssetOption[]>([]);
 *
 * <DependencySearchInput
 *   assets={allAssets}
 *   selectedIds={deps.map(d => d.id)}
 *   onSelect={asset => setDeps(prev => [...prev, asset])}
 * />
 * <DependencyList items={deps} onChange={setDeps} />
 */
export function DependencyList({
  items,
  onChange,
  className = "",
}: DependencyListProps): React.ReactElement {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  /* ── Drag-and-drop handlers ──────────────────────────────────────────────── */

  function handleDragStart(id: string): void {
    setDraggedId(id);
  }

  function handleDragOver(e: React.DragEvent<HTMLLIElement>, id: string): void {
    e.preventDefault();
    if (id !== draggedId) setDragOverId(id);
  }

  function handleDrop(e: React.DragEvent<HTMLLIElement>, targetId: string): void {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const fromIdx = items.findIndex((a) => a.id === draggedId);
    const toIdx   = items.findIndex((a) => a.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
    setDraggedId(null);
    setDragOverId(null);
  }

  function handleDragEnd(): void {
    setDraggedId(null);
    setDragOverId(null);
  }

  function handleRemove(id: string): void {
    onChange(items.filter((a) => a.id !== id));
  }

  /* ── Empty state ─────────────────────────────────────────────────────────── */

  if (items.length === 0) {
    return (
      <div
        className={[
          "border border-dashed border-odm-line py-6 text-center",
          className,
        ].join(" ")}
      >
        <p className="font-sans text-[12px] text-odm-faint m-0">
          No dependencies declared — search above to add assets.
        </p>
      </div>
    );
  }

  /* ── List ────────────────────────────────────────────────────────────────── */

  return (
    <ol
      aria-label="Declared dependencies"
      className={[
        "list-none m-0 p-0 border border-odm-line divide-y divide-odm-line",
        className,
      ].join(" ")}
    >
      {items.map((asset, idx) => {
        const isDragging = draggedId  === asset.id;
        const isDragOver = dragOverId === asset.id;
        const badge      = TYPE_BADGE[asset.assetType];
        const tier       = asset.tier as Tier | undefined;

        return (
          <li
            key={asset.id}
            draggable
            onDragStart={() => handleDragStart(asset.id)}
            onDragOver={(e) => handleDragOver(e, asset.id)}
            onDrop={(e) => handleDrop(e, asset.id)}
            onDragEnd={handleDragEnd}
            className={[
              "flex items-center gap-2 px-2 py-2 transition-colors duration-75",
              isDragging
                ? "opacity-40 bg-odm-surface"
                : isDragOver
                  ? "bg-odm-info-bg"
                  : "bg-odm-card",
            ].join(" ")}
          >
            {/* Drag handle */}
            <span
              aria-hidden="true"
              title="Drag to reorder"
              className="text-odm-faint cursor-grab active:cursor-grabbing shrink-0 text-[15px] leading-none select-none"
            >
              ☰
            </span>

            {/* Position index */}
            <span className="font-sans text-[10px] text-odm-faint shrink-0 w-4 text-right tabular-nums">
              {idx + 1}.
            </span>

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
              {(asset.id || asset.source) && (
                <div className="font-sans text-[11px] text-odm-muted leading-tight truncate">
                  {[asset.id, asset.source].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>

            {/* Tier badge */}
            {tier && (
              <span
                className={[
                  "inline-block font-sans text-[10px] font-bold tracking-[0.06em] uppercase",
                  "px-1.5 leading-4 shrink-0 whitespace-nowrap",
                  TIER_BG[tier],
                  TIER_TEXT[tier],
                ].join(" ")}
              >
                {tier}
              </span>
            )}

            {/* Delete button */}
            <button
              type="button"
              onClick={() => handleRemove(asset.id)}
              aria-label={`Remove ${asset.name}`}
              className={[
                "shrink-0 bg-transparent border-0 cursor-pointer p-0",
                "font-sans text-base leading-none text-odm-muted hover:text-odm-bad",
                "transition-colors duration-100",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red",
              ].join(" ")}
            >
              ×
            </button>
          </li>
        );
      })}
    </ol>
  );
}
