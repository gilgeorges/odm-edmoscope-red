import React, { useState, useRef, useId } from "react";
import { Button } from "../primitives/Button.tsx";
import { Spinner } from "../primitives/Spinner.tsx";
import { DataTable } from "./DataTable.tsx";
import type { ColumnDef } from "./DataTable.tsx";

/** Visual state of the workbench panel. */
type WorkbenchState = "collapsed" | "open" | "fullscreen";

/**
 * SqlWorkbenchProps — props for the SqlWorkbench panel.
 */
export interface SqlWorkbenchProps {
  /**
   * Initial query name shown in the header.
   * @default "Untitled query"
   */
  defaultQueryName?: string;
  /**
   * Initial SQL text pre-filled in the editor.
   * @default ""
   */
  defaultSql?: string;
  /**
   * Called when the Run button is clicked. Receives the current SQL string
   * and query name. The panel transitions to fullscreen immediately.
   */
  onRun?: (sql: string, queryName: string) => void;
  /**
   * Column definitions for the results table.
   * When undefined no results area is rendered.
   */
  resultColumns?: ColumnDef<Record<string, unknown>>[];
  /**
   * Row data for the results table.
   */
  resultData?: Record<string, unknown>[];
  /**
   * When true a loading spinner is shown in the results area instead of the
   * table (useful while the caller awaits the query response).
   * @default false
   */
  loading?: boolean;
  /**
   * Error message displayed below the SQL editor when a run fails.
   * Cleared automatically when the user edits the SQL.
   */
  error?: string;
  /**
   * Initial panel state.
   * @default "collapsed"
   */
  defaultState?: WorkbenchState;
  /** Additional CSS classes on the outermost element. */
  className?: string;
}

const PANEL_BASE =
  "bg-odm-card border border-odm-line font-sans flex flex-col";

const HEADER_CLASSES =
  "flex items-center gap-2 px-3 py-2 border-b border-odm-line shrink-0";

const NAME_INPUT_CLASSES = [
  "flex-1 min-w-0 bg-transparent outline-none",
  "font-sans text-[13px] font-semibold text-odm-ink",
  "placeholder:text-odm-faint",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-1 rounded-sm",
].join(" ");

const SQL_TEXTAREA_CLASSES = [
  "w-full font-mono text-[12px] text-odm-ink leading-relaxed",
  "bg-odm-surface border border-odm-line border-b-2 border-b-odm-line-h",
  "px-3 py-2 outline-none resize-none",
  "placeholder:text-odm-faint",
  "focus:border-b-lux-red",
  "transition-colors duration-100",
].join(" ");

/** Icon-only control button used in the workbench header. */
function ControlBtn({
  label,
  symbol,
  onClick,
}: {
  label: string;
  symbol: string;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center w-6 h-6 shrink-0",
        "text-odm-muted hover:text-odm-mid hover:bg-odm-surface rounded",
        "transition-colors duration-100 cursor-pointer",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-1",
      ].join(" ")}
    >
      <span aria-hidden="true" className="text-[14px] leading-none select-none">
        {symbol}
      </span>
    </button>
  );
}

/**
 * SqlWorkbench — collapsible SQL editor panel with results table.
 *
 * Supports three visual states:
 * - **collapsed** — single-line bar; "Open" expands the editor, "Expand"
 *   jumps straight to fullscreen.
 * - **open** — floating card showing the query-name field, a monospace SQL
 *   textarea, and a Run button. Controls let the user collapse or go
 *   fullscreen.
 * - **fullscreen** — fixed overlay that fills the viewport, with the same
 *   editor layout plus the results table below.
 *
 * When Run is clicked the panel transitions to fullscreen and the `onRun`
 * callback fires with the current SQL and query name. Pass `resultColumns`,
 * `resultData`, and `loading` back in to populate the results area.
 *
 * @example
 * <SqlWorkbench
 *   defaultQueryName="Top datasets"
 *   defaultSql="SELECT * FROM datasets LIMIT 20"
 *   onRun={(sql, name) => fetchResults(sql)}
 *   resultColumns={cols}
 *   resultData={rows}
 *   loading={isLoading}
 * />
 */
export function SqlWorkbench({
  defaultQueryName = "Untitled query",
  defaultSql = "",
  onRun,
  resultColumns,
  resultData,
  loading = false,
  error,
  defaultState = "collapsed",
  className = "",
}: SqlWorkbenchProps): React.ReactElement {
  const [state, setState] = useState<WorkbenchState>(defaultState);
  const [queryName, setQueryName] = useState(defaultQueryName);
  const [sql, setSql] = useState(defaultSql);
  const nameInputId = useId();
  const sqlRef = useRef<HTMLTextAreaElement>(null);

  function handleRun(): void {
    setState("fullscreen");
    onRun?.(sql, queryName);
  }

  const hasResults = resultData !== undefined || loading || error !== undefined;

  /* ── Collapsed ─────────────────────────────────────────────────────────── */
  if (state === "collapsed") {
    return (
      <div
        className={[
          "flex items-center gap-2 h-10 px-3",
          "bg-odm-card border border-odm-line",
          "font-sans",
          className,
        ].join(" ")}
      >
        {/* SQL chip */}
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center w-5 h-5 shrink-0 rounded bg-odm-surface border border-odm-line text-[10px] font-bold font-mono text-odm-muted select-none"
        >
          SQL
        </span>

        {/* Query name */}
        <span className="flex-1 min-w-0 truncate text-[13px] font-semibold text-odm-ink">
          {queryName}
        </span>

        {/* Actions */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setState("open")}
          aria-label="Open SQL workbench"
        >
          Open
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setState("fullscreen")}
          aria-label="Expand SQL workbench to fullscreen"
        >
          <span aria-hidden="true" className="text-[14px] leading-none">
            ⤢
          </span>
          Expand
        </Button>
      </div>
    );
  }

  /* ── Shared editor content (used in both open and fullscreen) ──────────── */
  const editorContent = (
    <>
      {/* Header row */}
      <div className={HEADER_CLASSES}>
        {/* SQL chip */}
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center w-5 h-5 shrink-0 rounded bg-odm-surface border border-odm-line text-[10px] font-bold font-mono text-odm-muted select-none"
        >
          SQL
        </span>

        {/* Query name input */}
        <label htmlFor={nameInputId} className="sr-only">
          Query name
        </label>
        <input
          id={nameInputId}
          type="text"
          value={queryName}
          onChange={(e) => setQueryName(e.target.value)}
          placeholder="Query name…"
          className={NAME_INPUT_CLASSES}
          aria-label="Query name"
        />

        {/* Controls */}
        {state === "open" && (
          <ControlBtn
            symbol="⤢"
            label="Expand to fullscreen"
            onClick={() => setState("fullscreen")}
          />
        )}
        {state === "fullscreen" && (
          <ControlBtn
            symbol="⤡"
            label="Exit fullscreen"
            onClick={() => setState("open")}
          />
        )}
        <ControlBtn
          symbol="−"
          label="Collapse workbench"
          onClick={() => setState("collapsed")}
        />
      </div>

      {/* SQL editor */}
      <div className="flex flex-col gap-2 p-3 shrink-0">
        <textarea
          ref={sqlRef}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          placeholder="SELECT * FROM datasets LIMIT 20"
          rows={state === "fullscreen" ? 8 : 5}
          spellCheck={false}
          aria-label="SQL query"
          className={SQL_TEXTAREA_CLASSES}
        />
        <div className="flex items-center justify-between gap-2">
          {error && (
            <p role="alert" className="text-[12px] text-odm-bad flex-1 truncate">
              {error}
            </p>
          )}
          <div className="ml-auto flex items-center gap-2">
            {loading && <Spinner size="sm" label="Running query…" />}
            <Button
              variant="brand"
              size="sm"
              onClick={handleRun}
              disabled={loading}
              aria-label="Run SQL query"
            >
              {/* Play triangle */}
              <span aria-hidden="true" className="text-[11px] leading-none">
                ▶
              </span>
              Run
            </Button>
          </div>
        </div>
      </div>

      {/* Results area */}
      {hasResults && (
        <div className="flex-1 min-h-0 flex flex-col border-t border-odm-line">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-odm-surface border-b border-odm-line shrink-0">
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-odm-muted">
              Results
            </span>
            {resultData && !loading && (
              <span className="text-[11px] text-odm-faint">
                {resultData.length} row{resultData.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className={[
            "p-3",
            state === "fullscreen" ? "overflow-y-auto flex-1" : "",
          ].join(" ")}>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" label="Running query…" variant="brand" />
              </div>
            )}
            {!loading && resultData && resultColumns && (
              <DataTable
                columns={resultColumns}
                data={resultData}
              />
            )}
            {!loading && !resultData && !error && (
              <p className="text-[13px] text-odm-faint py-4 text-center">
                No results yet — click Run to execute the query.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );

  /* ── Open ──────────────────────────────────────────────────────────────── */
  if (state === "open") {
    return (
      <div
        className={[PANEL_BASE, className].join(" ")}
        role="region"
        aria-label={`SQL Workbench: ${queryName}`}
      >
        {editorContent}
      </div>
    );
  }

  /* ── Fullscreen ────────────────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-odm-card"
      role="dialog"
      aria-modal="true"
      aria-label={`SQL Workbench: ${queryName}`}
    >
      {editorContent}
    </div>
  );
}
