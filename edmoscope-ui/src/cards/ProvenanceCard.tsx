import React from "react";

/**
 * Semantic accent colour for the ProvenanceCard left border and header tint.
 *
 * - `info`    — blue (default, suitable for origin / reuse cards)
 * - `ok`      — green (successful lineage, certified source)
 * - `warning` — amber (pending, needs review)
 * - `danger`  — red (broken lineage, missing source)
 */
export type ProvenanceAccent = "info" | "ok" | "warning" | "danger";

/** Border and header background classes per accent variant. */
const ACCENT_CLASSES: Record<
  ProvenanceAccent,
  { outer: string; header: string }
> = {
  info: {
    outer:  "border border-odm-info-bd border-l-4 border-l-odm-info",
    header: "bg-odm-info-bg border-b border-b-odm-info-bd",
  },
  ok: {
    outer:  "border border-odm-ok-bd border-l-4 border-l-odm-ok",
    header: "bg-odm-ok-bg border-b border-b-odm-ok-bd",
  },
  warning: {
    outer:  "border border-odm-warn-bd border-l-4 border-l-odm-warn",
    header: "bg-odm-warn-bg border-b border-b-odm-warn-bd",
  },
  danger: {
    outer:  "border border-odm-bad-bd border-l-4 border-l-odm-bad",
    header: "bg-odm-bad-bg border-b border-b-odm-bad-bd",
  },
};

/**
 * A single labelled panel column inside a {@link ProvenanceCard}.
 */
export interface ProvenancePanelEntry {
  /** Short uppercase label shown above the content. */
  label: string;
  /** Arbitrary content — text, badges, links, etc. */
  content: React.ReactNode;
}

/**
 * ProvenanceCardProps — props for the {@link ProvenanceCard} component.
 */
export interface ProvenanceCardProps {
  /**
   * Semantic accent variant — controls the left border colour and header tint.
   * @default "info"
   */
  accent?: ProvenanceAccent;

  /**
   * Left slot of the card header — typically a source name, icon, or badge
   * group.
   */
  headerLeft?: React.ReactNode;

  /**
   * Right slot of the card header — typically an action button or status chip.
   */
  headerRight?: React.ReactNode;

  /**
   * Optional descriptive text rendered in a dedicated row below the header.
   */
  description?: string;

  /**
   * Ordered list of labelled panel columns shown at the bottom of the card.
   * Adjacent panels are separated by a thin vertical divider.
   */
  panels?: ProvenancePanelEntry[];

  /** Additional CSS classes on the root element. */
  className?: string;
}

/**
 * ProvenanceCard — structured origin/reuse card.
 *
 * Used on the Provenance tab of dataset and query detail pages to display
 * upstream sources, derived outputs, and lineage metadata in a multi-column
 * layout.
 *
 * The card has three optional zones stacked vertically:
 * 1. **Header** — left/right slots with a coloured background tint.
 * 2. **Description** — narrative text about the lineage relationship.
 * 3. **Panels** — a row of labelled columns (schema, owner, refresh cadence…).
 *
 * @example
 * <ProvenanceCard
 *   accent="info"
 *   headerLeft={<span className="font-bold text-odm-ink">Occupation — Morning peak</span>}
 *   headerRight={<Badge variant="info">Source</Badge>}
 *   description="Derived from mobile operator probe data via ODM pipeline v2."
 *   panels={[
 *     { label: "Owner",   content: "STATEC" },
 *     { label: "Refresh", content: "Monthly" },
 *     { label: "Format",  content: "CSV-W" },
 *   ]}
 * />
 *
 * @example
 * // Minimal — header only
 * <ProvenanceCard
 *   accent="ok"
 *   headerLeft={<span>Certified output</span>}
 * />
 */
export function ProvenanceCard({
  accent = "info",
  headerLeft,
  headerRight,
  description,
  panels = [],
  className = "",
}: ProvenanceCardProps): React.ReactElement {
  const { outer, header: headerCls } = ACCENT_CLASSES[accent];

  return (
    <div className={["bg-white mb-3", outer, className].join(" ")}>
      {/* Header */}
      {(headerLeft || headerRight) && (
        <div
          className={[
            "px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap",
            headerCls,
          ].join(" ")}
        >
          {headerLeft}
          {headerRight}
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="px-4 py-2.5 border-b border-b-odm-line-l font-sans text-[13px] text-odm-soft leading-[1.55]">
          {description}
        </div>
      )}

      {/* Panel columns */}
      {panels.length > 0 && (
        <div className="flex py-3 items-stretch flex-wrap">
          {panels.map((panel, i) => (
            <div key={i} className="flex">
              {i > 0 && (
                <div
                  aria-hidden="true"
                  className="w-px bg-odm-line-l shrink-0 mx-[18px] self-stretch"
                />
              )}
              <div className="flex-1 basis-[130px] px-4 min-w-[110px]">
                <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted mb-1">
                  {panel.label}
                </div>
                {panel.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
