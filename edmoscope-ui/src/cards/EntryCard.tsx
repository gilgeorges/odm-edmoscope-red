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

/** EntryCard own props, independent of the card body element type. */
interface EntryCardOwnProps {
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
   * Click handler for the card body. When provided and `as` is not set,
   * the body receives `role="button"` and keyboard activation (Enter / Space).
   * When `as` is a link component, prefer passing `to` / `href` instead.
   */
  onClick?: () => void;

  /** Additional CSS classes applied to the root `<article>` element. */
  className?: string;

  /**
   * The component to render the interactive card body as. Defaults to `"div"`.
   *
   * Pass a router `Link` component (e.g. TanStack Router `Link`) to enable
   * full SPA navigation — all router-specific props (e.g. `to`) are forwarded
   * to this element. When `as` is provided, `role="button"` and keyboard
   * activation are omitted in favour of the link's native semantics.
   *
   * Omit (or leave as `undefined`) when the card acts as a static element,
   * for example as a page header on the dataset detail view.
   *
   * @example
   * // Static card body — no navigation (page header, non-interactive list)
   * <EntryCard title="My Dataset" />
   *
   * // SPA link card (TanStack Router)
   * <EntryCard as={Link} to="/datasets/occ-am" title="My Dataset" />
   */
  as?: React.ElementType;
}

/**
 * EntryCard props — own props merged with the props of the card body element (default: `"div"`).
 *
 * When `as` is set to a link component, all props accepted by that component
 * (e.g. `to`, `activeProps`) become valid on `EntryCard`.
 */
export type EntryCardProps<T extends React.ElementType = "div"> = EntryCardOwnProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof EntryCardOwnProps>;

/**
 * EntryCard — Registry-style list item card.
 *
 * The core repeating unit across Datasets, Queries, and Actors pages.
 * Each card has a left "thread" (status dot + connector line) and a body
 * that reveals a coloured left-border accent on hover.
 *
 * The card body defaults to a `<div>`. Pass `as={Link}` (from your router)
 * to make the whole body a SPA navigation link. Omit `as` entirely when the
 * card is used as a static element (e.g. a page header on the detail view).
 *
 * @example
 * // Clickable list card — legacy onClick style
 * <EntryCard
 *   status="ok"
 *   title="Occupation — Morning peak (STATEC)"
 *   onClick={() => navigate("/datasets/occ-am")}
 * />
 *
 * @example
 * // SPA link card (TanStack Router)
 * <EntryCard
 *   as={Link}
 *   to="/datasets/occ-am"
 *   status="ok"
 *   title="Occupation — Morning peak (STATEC)"
 * />
 *
 * @example
 * // Static page header — no navigation
 * <EntryCard
 *   status="ok"
 *   title="Occupation — Morning peak (STATEC)"
 *   description="Car and transit OD matrix for Luxembourg City."
 * />
 */
export function EntryCard<T extends React.ElementType = "div">({
  as,
  status = "neutral",
  header,
  title,
  description,
  footer,
  onClick,
  className = "",
  ...rest
}: EntryCardProps<T>): React.ReactElement {
  const [hovered, setHovered] = useState(false);
  const { dot, accent } = STATUS_CLASSES[status];
  const Body = (as ?? "div") as React.ElementType;

  // role="button" + keyboard activation only when body is a plain div with onClick
  const isInteractiveDiv = !as && !!onClick;

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (isInteractiveDiv && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick!();
    }
  }

  return (
    <article
      aria-label={title}
      className={["grid [grid-template-columns:10px_1fr] [gap:0_18px] mb-1.5 cursor-pointer", className].join(" ")}
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

      {/* Card body — div, router Link, or any other element via `as` prop */}
      <Body
        {...(rest as object)}
        role={isInteractiveDiv ? "button" : undefined}
        tabIndex={isInteractiveDiv ? 0 : undefined}
        onClick={onClick}
        onKeyDown={isInteractiveDiv ? handleKeyDown : undefined}
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
      </Body>
    </article>
  );
}
