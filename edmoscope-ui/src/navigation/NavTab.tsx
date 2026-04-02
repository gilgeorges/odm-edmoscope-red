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
   * @example
   * // TanStack Router — active state driven by the router
   * <NavTab as={Link} to="/" label="Home" isActive={isActive} />
   */
  as?: React.ElementType;

  /** Tab label text. */
  label: string;

  /**
   * Whether this tab represents the current page/route.
   * Sets `aria-current="page"` and renders the red bottom indicator.
   * When using a router `Link`, derive this from the router's active state.
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
 * // Plain button
 * <NavTab label="Home" onClick={() => navigate("/")} />
 * <NavTab label="Data" isActive onClick={() => navigate("/data")} />
 *
 * @example
 * // TanStack Router Link
 * <NavTab as={Link} to="/" label="Home" isActive={pathname === "/"} />
 * <NavTab as={Link} to="/data" label="Data" isActive={pathname === "/data"} />
 */
export function NavTab<T extends React.ElementType = "button">({
  as,
  label,
  isActive = false,
  className = "",
  ...rest
}: NavTabProps<T>): React.ReactElement {
  const Tag = (as ?? "button") as React.ElementType;
  return (
    <Tag
      {...(rest as object)}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex items-center px-4 h-full -mb-px",
        "font-sans text-xs tracking-[0.02em] whitespace-nowrap flex-shrink-0",
        "bg-transparent border-0 border-b-2 cursor-pointer",
        "transition-colors duration-100",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-[-2px]",
        isActive
          ? "text-white/90 font-semibold border-b-lux-red"
          : "text-white/40 font-normal border-b-transparent hover:text-white/70",
        className,
      ].join(" ")}
    >
      {label}
    </Tag>
  );
}
