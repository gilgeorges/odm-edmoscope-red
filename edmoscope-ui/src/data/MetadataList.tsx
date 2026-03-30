import React from "react";

/**
 * MetadataEntry — a single label/value pair in a metadata grid.
 */
export interface MetadataEntry {
  /** The field label (e.g. "Source organisation", "Updated"). */
  label: string;
  /**
   * The field value. Can be a string, number, or any React node
   * (e.g. a Badge, a link, or a formatted date).
   */
  value: React.ReactNode;
  /**
   * When true the field is read-only even in editing mode.
   * A "read-only" annotation is shown beside the value.
   */
  readOnly?: boolean;
  /**
   * When true the entry spans the full width of the grid
   * (useful for long text fields like Description).
   */
  span?: boolean;
}

/**
 * MetadataList — key-value grid for displaying asset metadata.
 *
 * Renders a responsive two-column grid of label/value pairs.
 * In `editing` mode, each entry with an `editNode` swaps in an edit control.
 * Read-only fields show an annotation in editing mode.
 *
 * @example
 * <MetadataList
 *   entries={[
 *     { label: "Title",       value: dataset.name },
 *     { label: "Source",      value: dataset.source },
 *     { label: "Description", value: dataset.description, span: true },
 *   ]}
 * />
 */
export interface MetadataListProps {
  /** The metadata entries to display. */
  entries: Array<MetadataEntry & { editNode?: React.ReactNode }>;
  /**
   * When true, entries with an `editNode` show the edit control instead of
   * the plain value. Read-only entries show their value with a "read-only" note.
   * @default false
   */
  editing?: boolean;
  /** Additional CSS classes on the grid container. */
  className?: string;
}

export function MetadataList({ entries, editing = false, className = "" }: MetadataListProps): React.ReactElement {
  return (
    <div
      className={[
        "grid grid-cols-1 sm:grid-cols-2 gap-x-8",
        className,
      ].join(" ")}
    >
      {entries.map((entry, i) => (
        <div
          key={i}
          className={[
            "py-3 border-b border-odm-line-l",
            entry.span ? "sm:col-span-2" : "",
          ].join(" ")}
        >
          <div className="font-sans text-[11px] font-bold tracking-[0.09em] uppercase text-odm-muted mb-1.5">
            {entry.label}
          </div>
          {editing && !entry.readOnly && entry.editNode ? (
            entry.editNode
          ) : (
            <div className={[
              "font-sans text-[14px] font-medium",
              editing && entry.readOnly ? "text-odm-muted" : "text-odm-ink",
            ].join(" ")}>
              {entry.value ?? <span className="text-odm-faint">—</span>}
              {editing && entry.readOnly && (
                <span className="font-sans text-[11px] text-odm-faint ml-1.5">read-only</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
