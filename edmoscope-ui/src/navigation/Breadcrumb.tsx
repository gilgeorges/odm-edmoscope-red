import React from "react";

/**
 * BreadcrumbItem — a single crumb in the breadcrumb trail.
 */
export interface BreadcrumbItem {
  /** Display label for the crumb. */
  label: string;
  /**
   * Optional click handler. When provided the crumb renders as a button.
   * The last crumb should have no handler (it's the current page).
   */
  onClick?: () => void;
  /** Optional short identifier shown in monospace (e.g. a dataset ID). */
  id?: string;
}

/**
 * Breadcrumb — back link + crumb chain navigating to the current page.
 *
 * Renders as a semantic `<nav><ol>` with `aria-current="page"` on the last
 * crumb. All crumbs with an `onClick` render as keyboard-accessible buttons.
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: "Datasets", onClick: () => navigate("/datasets") },
 *     { label: "DS-001", id: "DS-001", onClick: () => navigate("/datasets/DS-001") },
 *     { label: "MobiScout Count Data" },
 *   ]}
 * />
 */
export interface BreadcrumbProps {
  /**
   * Ordered array of crumbs. The last item is treated as the current page
   * (`aria-current="page"`) and rendered as plain text (no button).
   */
  items: BreadcrumbItem[];
  /** Additional CSS classes on the outer `<nav>`. */
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps): React.ReactElement {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="list-none p-0 m-0 mb-4 flex items-center gap-1.5 font-sans text-xs text-odm-muted flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="text-odm-faint">›</span>
              )}
              {item.id && (
                <span className="font-mono text-[11px]">{item.id}</span>
              )}
              {isLast ? (
                <span aria-current="page" className="text-odm-ink font-medium">
                  {!item.id && item.label}
                </span>
              ) : item.onClick ? (
                <button
                  onClick={item.onClick}
                  className={[
                    "bg-transparent border-0 cursor-pointer p-0",
                    "font-sans text-xs font-semibold text-odm-mid",
                    "hover:text-odm-ink transition-colors duration-100",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-1",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
