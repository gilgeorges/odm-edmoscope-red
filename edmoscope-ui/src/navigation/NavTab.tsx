import React from "react";

/**
 * NavTab — a single item in a horizontal dark navigation bar.
 *
 * Designed to live inside `TopNavShell`'s `nav` slot. The active tab renders
 * a lux-red bottom border indicator. Inactive tabs show at reduced opacity and
 * brighten on hover.
 *
 * @example
 * <NavTab label="Home"    onClick={() => navigate("/")} />
 * <NavTab label="Data"    isActive onClick={() => navigate("/data")} />
 * <NavTab label="Actors"  onClick={() => navigate("/actors")} />
 * <NavTab label="Queries" onClick={() => navigate("/queries")} />
 */
export interface NavTabProps extends React.ComponentPropsWithoutRef<"button"> {
  /** Tab label text. */
  label: string;
  /**
   * Whether this tab represents the current page/route.
   * Sets `aria-current="page"` and renders the red bottom indicator.
   * @default false
   */
  isActive?: boolean;
}

export function NavTab({
  label,
  isActive = false,
  className = "",
  ...rest
}: NavTabProps): React.ReactElement {
  return (
    <button
      {...rest}
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
    </button>
  );
}
