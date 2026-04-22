import React from "react";

/**
 * Semantic colour variant for a {@link SectionCard}.
 *
 * - `ok`      — green (permissions, certified, success)
 * - `warn`    — amber (restrictions, attention, draft)
 * - `danger`  — red (prohibitions, forbidden, critical)
 * - `info`    — blue (informational, neutral policy, reference)
 * - `neutral` — muted gray (archived, unknown, default)
 */
export type SectionCardVariant = "ok" | "warn" | "danger" | "info" | "neutral";

const VARIANT_CLASSES: Record<
  SectionCardVariant,
  { outer: string; header: string; title: string }
> = {
  ok: {
    outer:  "border border-odm-ok-bd",
    header: "border-b border-odm-ok-bd bg-odm-ok-bg",
    title:  "text-odm-ok",
  },
  warn: {
    outer:  "border border-odm-warn-bd",
    header: "border-b border-odm-warn-bd bg-odm-warn-bg",
    title:  "text-odm-warn",
  },
  danger: {
    outer:  "border border-odm-bad-bd",
    header: "border-b border-odm-bad-bd bg-odm-bad-bg",
    title:  "text-odm-bad",
  },
  info: {
    outer:  "border border-odm-info-bd",
    header: "border-b border-odm-info-bd bg-odm-info-bg",
    title:  "text-odm-info",
  },
  neutral: {
    outer:  "border border-odm-line",
    header: "border-b border-odm-line bg-odm-surface",
    title:  "text-odm-mid",
  },
};

/**
 * SectionCardProps — props for the {@link SectionCard} component.
 */
export interface SectionCardProps {
  /**
   * Semantic colour variant — controls border, header background, and
   * title text colour.
   * @default "neutral"
   */
  variant?: SectionCardVariant;

  /**
   * Bold uppercase label shown in the coloured header band.
   */
  title: string;

  /**
   * Optional icon rendered to the left of the title in the header.
   */
  titleIcon?: React.ReactNode;

  /**
   * Optional right-side slot in the header (e.g. a badge or action button).
   */
  headerRight?: React.ReactNode;

  /** Card body content. */
  children: React.ReactNode;

  /** Additional CSS classes on the root element. */
  className?: string;
}

/**
 * SectionCard — boxy KPI / policy card with a colour-coded header band.
 *
 * Used for permission/prohibition blocks, policy statements, KPI summaries,
 * and any content that needs a clearly colour-coded section header without
 * the thick left-border of {@link ProvenanceCard}.
 *
 * @example
 * // Governance policy cards
 * <SectionCard variant="ok" title="Permissions">
 *   dct:rights — usage interne ODM autorisé
 * </SectionCard>
 *
 * <SectionCard variant="danger" title="Interdictions">
 *   Interdiction de publication externe sans accord MDDI.
 * </SectionCard>
 *
 * @example
 * // KPI with icon
 * <SectionCard
 *   variant="info"
 *   title="Couverture temporelle"
 *   titleIcon={<CalendarIcon />}
 *   headerRight={<Badge variant="info">2019–2025</Badge>}
 * >
 *   168 heures par semaine · mise à jour hebdomadaire
 * </SectionCard>
 */
export function SectionCard({
  variant = "neutral",
  title,
  titleIcon,
  headerRight,
  children,
  className = "",
}: SectionCardProps): React.ReactElement {
  const { outer, header, title: titleCls } = VARIANT_CLASSES[variant];

  return (
    <div className={["bg-odm-card mb-3", outer, className].join(" ")}>
      {/* Header band */}
      <div
        className={[
          "px-4 py-2 flex items-center justify-between gap-2 flex-wrap",
          header,
        ].join(" ")}
      >
        <div className="flex items-center gap-1.5">
          {titleIcon && (
            <span aria-hidden="true" className={["leading-none text-sm", titleCls].join(" ")}>
              {titleIcon}
            </span>
          )}
          <span
            className={[
              "font-sans text-[11px] font-bold tracking-[0.08em] uppercase leading-4",
              titleCls,
            ].join(" ")}
          >
            {title}
          </span>
        </div>
        {headerRight && (
          <div className="shrink-0">
            {headerRight}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3 font-sans text-[13px] text-odm-soft leading-[1.6]">
        {children}
      </div>
    </div>
  );
}
