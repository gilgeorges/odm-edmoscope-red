import React from "react";

/** NavTab own props, independent of the rendered element type. */
interface NavTabOwnProps {
  /**
   * The element type or component to render as. Defaults to `"button"`.
   *
   * Pass a router `Link` component to render NavTab as a navigation link and
   * forward router-specific props (e.g. `to`, `activeProps`, `inactiveProps`)
   * directly on the element.
   *
   * When using a router `Link` that natively sets `data-status="active"` on
   * the DOM element (e.g. TanStack Router), you do not need `isActive` — the
   * router's own `data-status` drives both styling and `aria-current`.
   *
   * @example
   * // TanStack Router — active state driven by the router, no isActive needed
   * <NavTab as={Link} to="/" label="Home" />
   */
  as?: React.ElementType;

  /** Tab label text. */
  label: string;

  /**
   * Whether this tab represents the current page/route.
   *
   * Used as a fallback `data-status="active"` value when the rendered `Tag`
   * does not set its own `data-status` (e.g. when `as` is a plain `"button"`).
   * When using a router `Link` that natively sets `data-status`, omit this prop.
   *
   * @default false
   */
  isActive?: boolean;

  /** Additional CSS classes. */
  className?: string;
}

/**
 * NavTab props — own props merged with the props of the rendered element (default: `"button"`).
 *
 * When `as` is set to a component (e.g. TanStack Router `Link`), all props
 * accepted by that component (e.g. `to`, `activeProps`) become valid on `NavTab`.
 */
export type NavTabProps<T extends React.ElementType = "button"> = NavTabOwnProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof NavTabOwnProps>;

/**
 * NavTab — a single item in a horizontal dark navigation bar.
 *
 * Designed to live inside `TopNavShell`'s `nav` slot. The active tab renders
 * a lux-red bottom border indicator. Inactive tabs show at reduced opacity and
 * brighten on hover.
 *
 * By default renders as a `<button>`. Pass `as={Link}` (from your router) to
 * render as a navigation link — all router-specific props are forwarded.
 *
 * @example
 * // Plain button — isActive controls data-status
 * <NavTab label="Home" onClick={() => navigate("/")} />
 * <NavTab label="Data" isActive onClick={() => navigate("/data")} />
 *
 * @example
 * // TanStack Router Link — router sets data-status, no isActive needed
 * <NavTab as={Link} to="/" label="Home" />
 * <NavTab as={Link} to="/data" label="Data" />
 */
export function NavTab<T extends React.ElementType = "button">({
  as,
  label,
  isActive = false,
  className = "",
  ...rest
}: NavTabProps<T>): React.ReactElement {
  const Tag = (as ?? "button") as React.ElementType;

  // Use the caller-supplied data-status if present (e.g. router sets it), otherwise
  // fall back to deriving it from the isActive prop (e.g. plain button usage).
  const restRecord = rest as Record<string, unknown>;
  const dataStatus =
    "data-status" in restRecord
      ? (restRecord["data-status"] as string | undefined)
      : isActive
        ? "active"
        : undefined;

  return (
    <Tag
      {...(rest as object)}
      data-status={dataStatus}
      aria-current={dataStatus === "active" ? "page" : undefined}
      className={[
        "flex items-center px-4 h-full -mb-px",
        "font-sans text-xs tracking-[0.02em] whitespace-nowrap flex-shrink-0",
        "bg-transparent border-0 border-b-2 cursor-pointer",
        "transition-colors duration-100",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-[-2px]",
        // Inactive defaults — overridden by data-[status=active]: variants below
        "text-white/40 font-normal border-b-transparent hover:text-white/70",
        "data-[status=active]:text-white/90 data-[status=active]:font-semibold data-[status=active]:border-b-lux-red",
        className,
      ].join(" ")}
    >
      {label}
    </Tag>
  );
}
