import React from "react";
import { EmptyState } from "../feedback/EmptyState.tsx";

/**
 * ColumnDef — definition for a single column in a DataTable.
 */
export interface ColumnDef<T> {
  /** Unique identifier for the column. */
  key: string;
  /** Column header label. */
  header: string;
  /**
   * Optional render function. Receives the row record and its index.
   * When omitted the cell renders `String(row[key])`.
   */
  render?: (row: T, index: number) => React.ReactNode;
  /** Optional CSS class applied to every cell in this column (th and td). */
  cellClassName?: string;
}

/**
 * DataTable — generic, typed table component.
 *
 * Accepts typed column definitions and a data array. Supports optional row
 * click handling and an empty state fallback (composes EmptyState).
 *
 * Pagination is intentionally excluded — it is the consumer's responsibility,
 * keeping this component simple and composable.
 *
 * @example
 * const COLUMNS: ColumnDef<Dataset>[] = [
 *   { key: "name",   header: "Name",   render: (d) => <strong>{d.name}</strong> },
 *   { key: "source", header: "Source" },
 *   { key: "tier",   header: "Tier",   render: (d) => <TierBadge tier={d.tier} /> },
 * ];
 *
 * <DataTable
 *   columns={COLUMNS}
 *   data={datasets}
 *   onRowClick={(row) => navigate(`/datasets/${row.id}`)}
 *   emptyState={<EmptyState title="No datasets" description="Register the first one." />}
 * />
 */
export interface DataTableProps<T> {
  /** Column definitions in display order. */
  columns: ColumnDef<T>[];
  /** Array of row data records. */
  data: T[];
  /**
   * Called when a row is clicked. When provided, rows get a pointer cursor
   * and hover highlight.
   */
  onRowClick?: (row: T, index: number) => void;
  /**
   * Fallback shown when `data` is empty.
   * Defaults to a generic EmptyState if not provided.
   */
  emptyState?: React.ReactNode;
  /** Additional CSS classes on the outer container div. */
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyState,
  className = "",
}: DataTableProps<T>): React.ReactElement {
  if (data.length === 0) {
    return (
      <div className={className}>
        {emptyState ?? (
          <EmptyState
            title="No records found"
            description="Try adjusting your filters."
          />
        )}
      </div>
    );
  }

  return (
    <div className={["overflow-x-auto", className].join(" ")}>
      <table className="w-full border-collapse font-sans min-w-[480px]">
        <thead>
          <tr className="border-b-2 border-odm-line">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={[
                  "pb-2 pt-0 px-0 pr-3.5 text-left",
                  "font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-odm-muted",
                  col.cellClassName ?? "",
                ].join(" ")}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
              className={[
                "border-b border-odm-line-l transition-colors duration-100",
                onRowClick ? "cursor-pointer hover:bg-odm-card" : "",
              ].join(" ")}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[
                    "py-2.5 pr-3.5 font-sans text-[13px] text-odm-ink",
                    col.cellClassName ?? "",
                  ].join(" ")}
                >
                  {col.render
                    ? col.render(row, rowIndex)
                    : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
