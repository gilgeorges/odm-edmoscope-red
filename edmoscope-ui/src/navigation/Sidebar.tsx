import React from "react";

/**
 * SidebarItem — a single item in the sidebar navigation list.
 *
 * Supports active state, icon, and badge slots. Keyboard-navigable.
 *
 * @example
 * <SidebarItem
 *   label="Datasets"
 *   icon="▣"
 *   isActive
 *   onClick={() => navigate("/datasets")}
 * />
 */
export interface SidebarItemProps extends React.ComponentPropsWithoutRef<"button"> {
  /** Item label. */
  label: string;
  /**
   * Optional icon character or symbol shown before the label.
   */
  icon?: string;
  /**
   * Whether this item represents the current page/route.
   * @default false
   */
  isActive?: boolean;
  /**
   * Optional badge content (e.g. a count) shown at the right edge.
   */
  badge?: React.ReactNode;
}

export function SidebarItem({
  label,
  icon,
  isActive = false,
  badge,
  className = "",
  ...rest
}: SidebarItemProps): React.ReactElement {
  return (
    <button
      {...rest}
      aria-current={isActive ? "page" : undefined}
      className={[
        "w-full flex items-center gap-2.5 px-3 py-2 text-left",
        "font-sans text-[13px] transition-colors duration-100 cursor-pointer",
        "border-0 bg-transparent",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-[-2px]",
        isActive
          ? "text-odm-ink font-semibold bg-white border-l-[3px] border-l-lux-red pl-[calc(0.75rem-3px)]"
          : "text-odm-mid font-normal hover:text-odm-ink hover:bg-white/50 border-l-[3px] border-l-transparent pl-[calc(0.75rem-3px)]",
        className,
      ].join(" ")}
    >
      {icon && (
        <span aria-hidden="true" className="text-sm leading-none flex-shrink-0 opacity-60">
          {icon}
        </span>
      )}
      <span className="flex-1 min-w-0 truncate">{label}</span>
      {badge && (
        <span className="flex-shrink-0 ml-auto">{badge}</span>
      )}
    </button>
  );
}

/**
 * Sidebar — collapsible left-side navigation panel.
 *
 * Composes SidebarItems. The collapsed state can be managed externally or
 * left to the consuming layout component (e.g. AppShell).
 *
 * @example
 * <Sidebar header="Filters">
 *   <SidebarItem label="All types" isActive onClick={...} />
 *   <SidebarItem label="Datasets" badge={<Badge>42</Badge>} onClick={...} />
 * </Sidebar>
 */
export interface SidebarProps {
  /** Optional header label shown above the item list. */
  header?: string;
  /** SidebarItem children. */
  children: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

export function Sidebar({ header, children, className = "" }: SidebarProps): React.ReactElement {
  return (
    <aside
      aria-label={header ?? "Sidebar navigation"}
      className={["flex flex-col", className].join(" ")}
    >
      {header && (
        <div className="font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-odm-muted px-3 py-2 mb-1">
          {header}
        </div>
      )}
      <nav>
        {children}
      </nav>
    </aside>
  );
}
