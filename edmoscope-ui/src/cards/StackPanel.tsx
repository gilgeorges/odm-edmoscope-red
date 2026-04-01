import React from "react";

/**
 * StackPanelProps — props for the {@link StackPanel} component.
 */
export interface StackPanelProps {
  /**
   * Optional sticky sub-header rendered above the card list.
   * Sticks just below the top navigation bar (top: 116px) with the page
   * background colour as its backdrop.
   */
  header?: React.ReactNode;

  /**
   * Tailwind gap class controlling the spacing between cards.
   * Use any Tailwind `gap-*` class, e.g. `"gap-1.5"` (6 px, default) or
   * `"gap-3"` (12 px) for more breathing room.
   *
   * @default "gap-1.5"
   */
  gap?: string;

  /** Card items — typically {@link EntryCard} elements. */
  children: React.ReactNode;

  /** Additional CSS classes on the root element. */
  className?: string;
}

/**
 * StackPanel — vertical card stack with an optional sticky sub-header.
 *
 * Wrap a list of {@link EntryCard} components in StackPanel to get a
 * consistently spaced column with a header that sticks beneath the top nav
 * when the user scrolls.
 *
 * @example
 * <StackPanel header={<FilterBar … />}>
 *   {datasets.map(d => <EntryCard key={d.id} … />)}
 * </StackPanel>
 *
 * @example
 * // Wider gap between cards
 * <StackPanel gap="gap-3">
 *   {queries.map(q => <EntryCard key={q.id} … />)}
 * </StackPanel>
 */
export function StackPanel({
  header,
  gap = "gap-1.5",
  children,
  className = "",
}: StackPanelProps): React.ReactElement {
  return (
    <div className={["flex flex-col", className].join(" ")}>
      {header && (
        <div className="sticky top-[116px] z-10 bg-odm-page pb-2">
          {header}
        </div>
      )}
      <div className={["flex flex-col", gap].join(" ")}>{children}</div>
    </div>
  );
}
