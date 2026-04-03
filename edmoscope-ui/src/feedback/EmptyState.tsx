import React from "react";

/**
 * EmptyState — placeholder shown when a list or table has no content.
 *
 * Used inside DataTable, StackPanel, and any list view when the data array
 * is empty. Accepts an optional call-to-action slot.
 *
 * @example
 * <EmptyState
 *   title="No datasets found"
 *   description="Try adjusting your filters or search query."
 *   action={<Button variant="brand">Register first asset</Button>}
 * />
 */
export interface EmptyStateProps {
  /**
   * Optional icon or symbol to display above the title.
   * Defaults to a subtle grid symbol.
   */
  icon?: React.ReactNode;
  /** Short title line. Should explain what is missing. */
  title: string;
  /** Optional supporting description. */
  description?: string;
  /**
   * Optional call-to-action element (e.g. a Button).
   * Placed below the description.
   */
  action?: React.ReactNode;
  /**
   * Additional CSS classes on the container.
   * To fill remaining viewport height pass `"flex-1"` — the parent chain must
   * propagate height (flex-col + min-h-0) for this to take effect.
   */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center",
        "min-h-[200px] py-12 px-6 gap-3",
        className,
      ].join(" ")}
    >
      <div aria-hidden="true" className="text-[32px] opacity-15 leading-none mb-1">
        {icon ?? "▤"}
      </div>
      <p className="font-sans text-[13px] font-semibold text-odm-mid m-0">
        {title}
      </p>
      {description && (
        <p className="font-sans text-[13px] text-odm-muted m-0 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-2">{action}</div>
      )}
    </div>
  );
}
