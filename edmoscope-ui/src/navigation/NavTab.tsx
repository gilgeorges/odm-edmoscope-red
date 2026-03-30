import React from "react";

/**
 * NavTab — a single item in a horizontal navigation bar.
 *
 * Designed to live inside `TopNavShell`'s `nav` slot. The active tab
 * shows a lux-red bottom indicator that aligns with the shell header's
 * bottom border. Use `isActive` to mark the current route.
 *
 * @example
 * <NavTab label="Overview"  icon="▣" isActive onClick={() => navigate("/")} />
 * <NavTab label="Datasets"  icon="▤" onClick={() => navigate("/datasets")} />
 * <NavTab label="Queries"   icon="⌕" onClick={() => navigate("/queries")} />
 */
export interface NavTabProps extends React.ComponentPropsWithoutRef<"button"> {
  /** Tab label text. */
  label: string;
  /**
   * Optional icon character or symbol shown before the label.
   * Use a Unicode symbol, e.g. "▣", "⌕", "◎".
   */
  icon?: string;
  /**
   * Whether this tab represents the current page/route.
   * Sets `aria-current="page"` and renders the active indicator.
   * @default false
   */
  isActive?: boolean;
  /**
   * Optional badge content (e.g. a count) shown at the right of the label.
   */
  badge?: React.ReactNode;
}

export function NavTab({
  label,
  icon,
  isActive = false,
  badge,
  className = "",
  ...rest
}: NavTabProps): React.ReactElement {
  return (
    <button
      {...rest}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex items-center gap-2 px-4 h-full -mb-[3px]",
        "font-sans text-[13px] transition-colors duration-100 cursor-pointer",
        "border-0 border-b-[3px] bg-transparent",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-[-2px]",
        isActive
          ? "text-odm-ink font-semibold border-b-lux-red"
          : "text-odm-mid font-medium border-b-transparent hover:text-odm-ink hover:border-b-lux-gray-20",
        className,
      ].join(" ")}
    >
      {icon && (
        <span aria-hidden="true" className="text-sm leading-none flex-shrink-0 opacity-60">
          {icon}
        </span>
      )}
      <span>{label}</span>
      {badge && (
        <span className="flex-shrink-0 ml-1">{badge}</span>
      )}
    </button>
  );
}
