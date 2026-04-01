import React, { useState } from "react";

/**
 * Status variant for the EntryCard thread dot and hover accent.
 * Maps to the EDMoScope semantic colour system.
 *
 * - `ok`      — fresh / healthy (green)
 * - `warning` — aging / attention needed (amber)
 * - `danger`  — stale / broken (red)
 * - `info`    — informational / in-progress (blue)
 * - `neutral` — unknown / archived (muted grey)
 */
export type EntryCardStatus = "ok" | "warning" | "danger" | "info" | "neutral";

/** Classes for the status dot and the hover left-border accent. */
const STATUS_CLASSES: Record<EntryCardStatus, { dot: string; accent: string }> =
  {
    ok:      { dot: "bg-odm-ok",   accent: "border-l-odm-ok-bd"   },
    warning: { dot: "bg-odm-warn", accent: "border-l-odm-warn-bd" },
    danger:  { dot: "bg-odm-bad",  accent: "border-l-odm-bad-bd"  },
    info:    { dot: "bg-odm-info", accent: "border-l-odm-info-bd" },
    neutral: { dot: "bg-odm-muted",accent: "border-l-odm-muted"   },
  };

/**
 * EntryCardProps — props for the {@link EntryCard} component.
 */
export interface EntryCardProps {
  /**
   * Semantic status driving the thread dot colour and the hover accent border.
   * @default "neutral"
   */
  status?: EntryCardStatus;

  /**
   * Reference line rendered above the title — typically contains ID chip,
   * source badge, date, and tier/state badges.
   */
  header?: React.ReactNode;

  /**
   * Primary heading of the card. Also used as the `aria-label` of the
   * `<article>` element for screen readers.
   */
  title?: string;

  /**
   * Secondary descriptive text rendered below the title in muted style.
   */
  description?: string;

  /**
   * Footer slot separated by a hairline — typically tags, row counts, and a
   * primary CTA button.
   */
  footer?: React.ReactNode;

  /**
   * Click handler for the card body. When provided the body receives
   * `role="button"` and keyboard activation (Enter / Space).
   */
  onClick?: () => void;

  /** Additional CSS classes applied to the root `<article>` element. */
  className?: string;
}

/**
 * EntryCard — Registry-style list item card.
 *
 * The core repeating unit across Datasets, Queries, and Actors pages.
 * Each card has a left "thread" (status dot + connector line) and a body
 * that reveals a coloured left-border accent on hover.
 *
 * @example
 * <EntryCard
 *   status="ok"
 *   header={<Badge variant="info">Source</Badge>}
 *   title="Occupation — Morning peak (STATEC)"
 *   description="Car and transit OD matrix for Luxembourg City, derived from mobile probe data."
 *   footer={<><Badge>transport</Badge><Badge>OD</Badge></>}
 *   onClick={() => navigate("/datasets/occ-am")}
 * />
 */
export function EntryCard({
  status = "neutral",
  header,
  title,
  description,
  footer,
  onClick,
  className = "",
}: EntryCardProps): React.ReactElement {
  const [hovered, setHovered] = useState(false);
  const { dot, accent } = STATUS_CLASSES[status];

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <article
      aria-label={title}
      className={["grid mb-1.5 cursor-pointer", className].join(" ")}
      style={{ gridTemplateColumns: "10px 1fr", gap: "0 18px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left thread — status dot + vertical connector */}
      <div className="flex flex-col items-center pt-[18px]">
        <div
          aria-hidden="true"
          className={[
            "w-[9px] h-[9px] rounded-full shrink-0 ring-2 ring-odm-surface",
            dot,
          ].join(" ")}
        />
        <div className="w-px flex-1 mt-1.5 bg-odm-line-l" aria-hidden="true" />
      </div>

      {/* Card body */}
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={[
          "border-l-[3px] px-4 py-[14px] pl-[18px]",
          "transition-colors duration-[120ms]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red",
          hovered
            ? ["bg-white border border-odm-line-h", accent].join(" ")
            : "bg-odm-card border border-odm-line border-l-odm-line-l",
        ].join(" ")}
      >
        {header && (
          <div className="flex gap-2.5 items-center flex-wrap mb-1.5">
            {header}
          </div>
        )}

        {title && (
          <div className="font-sans text-base font-bold text-odm-ink mb-1 tracking-[-0.01em] leading-[1.3]">
            {title}
          </div>
        )}

        {description && (
          <div className="font-sans text-[13px] text-odm-mid leading-[1.65] mb-2.5">
            {description}
          </div>
        )}

        {footer && (
          <div className="flex gap-2 flex-wrap items-center pt-2.5 border-t border-t-odm-line-l">
            {footer}
          </div>
        )}
      </div>
    </article>
  );
}
