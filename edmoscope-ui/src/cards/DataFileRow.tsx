import React from "react";

/**
 * Known file format types for dataset artefacts.
 * Controls the format badge colour/label.
 */
export type DataFileFormat =
  | "csv"
  | "parquet"
  | "duckdb"
  | "json"
  | "geojson"
  | "xlsx"
  | "xml"
  | "other";

const FORMAT_LABEL: Record<DataFileFormat, string> = {
  csv:     "CSV",
  parquet: "Parquet",
  duckdb:  "DuckDB",
  json:    "JSON",
  geojson: "GeoJSON",
  xlsx:    "XLSX",
  xml:     "XML",
  other:   "File",
};

const FORMAT_CLASSES: Record<DataFileFormat, string> = {
  csv:     "bg-odm-ok-bg text-odm-ok border border-odm-ok-bd",
  parquet: "bg-odm-info-bg text-odm-info border border-odm-info-bd",
  duckdb:  "bg-odm-surface text-odm-mid border border-odm-line",
  json:    "bg-odm-warn-bg text-odm-warn border border-odm-warn-bd",
  geojson: "bg-odm-warn-bg text-odm-warn border border-odm-warn-bd",
  xlsx:    "bg-odm-ok-bg text-odm-ok border border-odm-ok-bd",
  xml:     "bg-odm-surface text-odm-mid border border-odm-line",
  other:   "bg-odm-surface text-odm-muted border border-odm-line-l",
};

/**
 * DataFileRowProps — props for the {@link DataFileRow} component.
 */
export interface DataFileRowProps {
  /** Display name of the file or artefact. */
  filename: string;

  /**
   * File format — controls the badge label and colour.
   * @default "other"
   */
  format?: DataFileFormat;

  /** MIME type string, displayed in muted text (e.g. "text/csv"). */
  mimeType?: string;

  /**
   * Human-readable file size (e.g. "312 MB", "2.1 MB").
   * When omitted the size column is empty.
   */
  size?: string;

  /**
   * Checksum or hash digest displayed in truncated monospace
   * (e.g. "sha256:e3b0c4…"). Only the first ~16 chars are shown.
   */
  hash?: string;

  /**
   * Download or detail URL. When provided the filename becomes an anchor link.
   */
  href?: string;

  /** Additional CSS classes on the root `<li>` element. */
  className?: string;
}

/**
 * DataFileRow — single file/artefact entry in a dataset file list.
 *
 * Renders a horizontal row showing the file format badge, filename,
 * MIME type, size, and truncated hash. Typically used inside a `<ul>`
 * alongside other `DataFileRow` instances.
 *
 * @example
 * <ul>
 *   <DataFileRow
 *     format="duckdb"
 *     filename="comptages_national_silver.duckdb"
 *     mimeType="application/vnd.duckdb"
 *     size="1.4 GB"
 *     hash="sha256:e3b0c44298fc1c14"
 *   />
 *   <DataFileRow
 *     format="parquet"
 *     filename="comptages_national_2024.parquet"
 *     mimeType="application/vnd.apache.parquet"
 *     size="312 MB"
 *     hash="sha256:a87ff679a2f3e71d"
 *   />
 *   <DataFileRow
 *     format="csv"
 *     filename="comptages_national_sample.csv"
 *     mimeType="text/csv"
 *     size="2.1 MB"
 *     hash="sha256:1679091c5a880fc"
 *   />
 * </ul>
 */
export function DataFileRow({
  filename,
  format = "other",
  mimeType,
  size,
  hash,
  href,
  className = "",
}: DataFileRowProps): React.ReactElement {
  const nameEl = href ? (
    <a
      href={href}
      className="font-sans text-[13px] font-medium text-odm-ink hover:underline hover:text-lux-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red"
    >
      {filename}
    </a>
  ) : (
    <span className="font-sans text-[13px] font-medium text-odm-ink">
      {filename}
    </span>
  );

  return (
    <li
      className={[
        "flex items-center gap-3 px-0 py-3",
        "border-b border-odm-line-l last:border-b-0",
        className,
      ].join(" ")}
    >
      {/* Format badge */}
      <span
        className={[
          "shrink-0 font-sans text-[10px] font-bold tracking-[0.06em] uppercase",
          "px-1.5 py-0.5 leading-4",
          FORMAT_CLASSES[format],
        ].join(" ")}
      >
        {FORMAT_LABEL[format]}
      </span>

      {/* Filename */}
      <span className="flex-1 min-w-0 truncate">
        {nameEl}
      </span>

      {/* MIME type */}
      {mimeType && (
        <span className="hidden sm:block font-mono text-[11px] text-odm-muted shrink-0 max-w-[180px] truncate">
          {mimeType}
        </span>
      )}

      {/* Size */}
      {size && (
        <span className="font-sans text-[12px] text-odm-mid shrink-0 tabular-nums min-w-[52px] text-right">
          {size}
        </span>
      )}

      {/* Hash */}
      {hash && (
        <span
          className="hidden md:block font-mono text-[10px] text-odm-faint shrink-0"
          title={hash}
        >
          {hash.slice(0, 18)}…
        </span>
      )}
    </li>
  );
}
