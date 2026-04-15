import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "../primitives/Tooltip";
import { Spinner } from "../primitives/Spinner";

/** Visual state of the SQL drawer. */
export type DrawerState = "collapsed" | "half" | "full";

/**
 * SavedQuery — a query record shown in the tab strip and save form.
 */
export interface SavedQuery {
  /** Unique identifier (e.g. "Q-001"). */
  id: string;
  /** Human-readable query name. */
  name: string;
  /**
   * Query state controlling the badge colour.
   * - `draft`       — unsaved, amber
   * - `saved`       — saved, green
   * - `implemented` — linked to a pipeline, blue
   * - `archived`    — hidden by default, grey
   */
  state: "draft" | "saved" | "implemented" | "archived";
  /** Initial SQL text. */
  sql: string;
  /** Optional description. */
  description?: string;
}

/**
 * ResultRow — a single row returned from a query execution.
 * Keys correspond to column names; values are strings or numbers.
 */
export type ResultRow = Record<string, string | number>;

/**
 * SqlWorkbenchProps — props for the SqlWorkbench bottom drawer.
 */
export interface SqlWorkbenchProps {
  /**
   * Initial drawer state.
   * @default "collapsed"
   */
  defaultState?: DrawerState;
  /**
   * The active query loaded into the editor, or null for an unsaved scratch
   * buffer. When this changes from outside the drawer syncs its SQL editor.
   */
  activeQuery?: SavedQuery | null;
  /**
   * Called when the user clicks Run. Receives the current SQL string.
   * The drawer transitions to full automatically.
   */
  onRun?: (sql: string) => void;
  /**
   * Called when the user saves a query (new or fork).
   * Receives the updated query object.
   */
  onSave?: (query: SavedQuery) => void;
  /**
   * Called when the user clicks "+ New" to start a fresh scratch buffer.
   */
  onNew?: () => void;
  /**
   * Called when the user clicks the "View [dataset]" link in the tab strip.
   * Receives the dataset identifier string passed via `linkedDatasetId`.
   */
  onNavigateDataset?: (datasetId: string) => void;
  /**
   * Dataset identifier linked to the current active query (e.g. "DS-001").
   * When provided, a "View [id] →" link appears in the collapsed tab strip.
   */
  linkedDatasetId?: string;
  /**
   * Query result rows to show in the full-state results table.
   * When undefined, the results area is hidden.
   */
  resultRows?: ResultRow[];
  /**
   * When true the workbench is shown but fully disabled while the SQL engine
   * (e.g. DuckDB) is initialising. The tab strip displays a spinner and
   * "Loading SQL playground…" instead of the query name, and all controls are
   * hidden. Once false the workbench becomes interactive as normal.
   * @default false
   */
  initializing?: boolean;
  /**
   * When true a loading message is shown instead of results.
   * @default false
   */
  loading?: boolean;
  /**
   * Error message shown in the results area instead of the table.
   */
  error?: string;
  /**
   * Additional CSS classes on the outermost fixed container.
   */
  className?: string;
}

/* ── State badge colours ────────────────────────────────────────────────── */
const STATE_BADGE: Record<
  SavedQuery["state"],
  { bg: string; border: string; text: string; label: string }
> = {
  draft:       { bg: "bg-odm-warn-bg",  border: "border-odm-warn-bd", text: "text-odm-warn",  label: "Draft" },
  saved:       { bg: "bg-odm-ok-bg",    border: "border-odm-ok-bd",   text: "text-odm-ok",    label: "Saved" },
  implemented: { bg: "bg-odm-info-bg",  border: "border-odm-info-bd", text: "text-odm-info",  label: "Implemented" },
  archived:    { bg: "bg-odm-surface",  border: "border-odm-line-l",  text: "text-odm-muted", label: "Archived" },
};

/** Small toolbar button used inside the drawer. */
function DrawerBtn({
  children,
  onClick,
  primary = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "font-sans text-[11px] font-semibold px-2.5 py-0.5 cursor-pointer",
        "whitespace-nowrap border border-b border-b-odm-line-h",
        "transition-colors duration-100",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        primary
          ? "bg-odm-ink border-odm-ink text-white"
          : "bg-white border-odm-line text-odm-mid hover:text-odm-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/** Inline state badge shown in the tab strip. */
function StateBadge({ state }: { state: SavedQuery["state"] }): React.ReactElement {
  const s = STATE_BADGE[state];
  return (
    <span
      className={[
        "inline-block font-sans text-[10px] font-bold tracking-[0.04em] uppercase",
        "px-1.5 py-px border",
        s.bg, s.border, s.text,
      ].join(" ")}
    >
      {s.label}
    </span>
  );
}

/**
 * SqlWorkbench — persistent fixed-bottom SQL drawer.
 *
 * Matches the design of `observatory-catalog.jsx` — a warm off-white editor
 * docked to the bottom of the viewport. Has three height states:
 *
 * - **collapsed** (36px) — only the tab strip is visible.
 * - **half** (~35vh) — SQL editor visible, results hidden.
 * - **full** (viewport minus header) — editor + results table split view.
 *
 * The tab strip shows the active query name, its state badge, a "View
 * dataset →" link, and toolbar controls (+ New, Save, ▶ Run, expand/collapse).
 *
 * A save form slides in above the editor when "Save" is clicked, allowing
 * the user to name and describe the query inline.
 *
 * The results table appears in full mode after Run is clicked. Column headers
 * are derived automatically from the first row's keys.
 *
 * @example
 * <SqlWorkbench
 *   activeQuery={currentQuery}
 *   onRun={sql => executeSql(sql)}
 *   onSave={q => saveQuery(q)}
 *   onNew={() => setCurrentQuery(null)}
 *   resultRows={results}
 *   loading={isRunning}
 *   linkedDatasetId={currentQuery?.datasets?.[0]}
 *   onNavigateDataset={id => navigate(`/datasets/${id}`)}
 * />
 */
export function SqlWorkbench({
  defaultState = "collapsed",
  activeQuery = null,
  onRun,
  onSave,
  onNew,
  onNavigateDataset,
  linkedDatasetId,
  resultRows,
  initializing = false,
  loading = false,
  error,
  className = "",
}: SqlWorkbenchProps): React.ReactElement {
  const [drawerState, setDrawerState] = useState<DrawerState>(defaultState);
  /**
   * Remembers the last expanded size chosen by the ↑/↓ button.
   * The ▲/▼ button (and tab strip click) toggle between collapsed and this value.
   */
  const [expandedState, setExpandedState] = useState<"half" | "full">(
    defaultState === "full" ? "full" : "half",
  );
  const [sql, setSql] = useState(activeQuery?.sql ?? "-- Start writing SQL\n");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [hasResults, setHasResults] = useState(false);

  /* Sync editor when active query changes from outside */
  useEffect(() => {
    if (activeQuery) {
      setSql(activeQuery.sql);
      setHasResults(false);
      if (drawerState === "collapsed") setDrawerState(expandedState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuery?.id]);

  /* ── Heights (collapsed / half only — full uses inset-0) ───────────── */
  const windowH =
    typeof window !== "undefined" ? window.innerHeight : 600;
  const partialH: Record<"collapsed" | "half", number> = {
    collapsed: 36,
    half:      Math.min(300, Math.floor(windowH * 0.35)),
  };
  const h = drawerState === "full" ? windowH : partialH[drawerState as "collapsed" | "half"] ?? 36;

  /* ── Split heights in full mode ─────────────────────────────────────── */
  const editorH  = drawerState === "full" ? Math.floor(windowH * 0.4) : h - 36;
  const resultsH = drawerState === "full" ? h - editorH - 36 - 1 : 0;

  /* ── Actions ────────────────────────────────────────────────────────── */
  const isDirty = activeQuery ? sql !== activeQuery.sql : sql.trim().length > 3;

  const queryName = activeQuery
    ? activeQuery.name + (isDirty ? " *" : "")
    : sql.trim().length > 3
    ? "Unsaved query"
    : "SQL Workbench";

  function handleRun(): void {
    setHasResults(true);
    setDrawerState("full");
    onRun?.(sql);
  }

  function handleSave(): void {
    const record: SavedQuery = activeQuery
      ? { ...activeQuery, sql }
      : { id: `Q-${Date.now()}`, name: "Untitled query", sql, state: "draft" };
    onSave?.(record);
  }

  function handleFork(): void {
    const forked: SavedQuery = {
      id: `Q-${Date.now()}`,
      name: saveName || (activeQuery ? `${activeQuery.name} (fork)` : "Untitled query"),
      description: saveDesc || activeQuery?.description || "",
      sql,
      state: "saved",
    };
    onSave?.(forked);
    setShowSaveForm(false);
    setSaveName("");
    setSaveDesc("");
  }

  function handleToggle(): void {
    if (initializing) return;
    setDrawerState((s) => (s === "collapsed" ? expandedState : "collapsed"));
  }

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div
      role="region"
      aria-label="SQL Workbench"
      className={[
        "fixed left-0 right-0 z-[300]",
        "flex flex-col bg-white",
        "border-t-[3px] border-lux-red",
        "shadow-[0_-2px_16px_rgba(0,0,0,0.10)]",
        drawerState === "full"
          ? "top-0 bottom-0"
          : "bottom-0 transition-[height] duration-200 ease-in-out",
        className,
      ].join(" ")}
      style={drawerState === "full" ? undefined : { height: h }}
    >
      {/* ── Tab / toolbar strip ─────────────────────────────────────────── */}
      <div
        className={[
          "h-9 shrink-0 flex items-center justify-between px-4",
          "bg-odm-surface select-none",
          initializing ? "cursor-default" : "cursor-pointer",
          drawerState !== "collapsed" ? "border-b border-odm-line" : "",
        ].join(" ")}
        onClick={handleToggle}
        role={initializing ? undefined : "button"}
        aria-busy={initializing}
        aria-expanded={initializing ? undefined : drawerState !== "collapsed"}
        aria-label={
          initializing
            ? "SQL Workbench loading"
            : drawerState === "collapsed"
            ? "Open SQL Workbench"
            : "Collapse SQL Workbench"
        }
      >
        {/* Left: label + name + state badge + dataset link */}
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="font-sans text-[11px] font-bold tracking-[0.12em] uppercase text-lux-red shrink-0">
            SQL
          </span>
          {initializing ? (
            <>
              <Spinner size="sm" label="Loading SQL playground…" />
              <span className="font-mono text-[12px] text-odm-muted truncate">
                Loading SQL playground…
              </span>
            </>
          ) : (
            <>
              <span className="font-mono text-[12px] text-odm-mid truncate">
                {queryName}
              </span>
              {activeQuery && <StateBadge state={activeQuery.state} />}
              {linkedDatasetId && drawerState !== "collapsed" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateDataset?.(linkedDatasetId);
                  }}
                  className="font-sans text-[11px] text-odm-muted underline cursor-pointer bg-transparent border-0 p-0 shrink-0 hover:text-odm-mid"
                >
                  View {linkedDatasetId} →
                </button>
              )}
            </>
          )}
        </div>

        {/* Right: controls */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {!initializing && drawerState !== "collapsed" && (
            <>
              <Tooltip text="New scratch buffer" placement="top">
                <DrawerBtn onClick={() => { onNew?.(); setSql("-- New query\n"); setHasResults(false); setDrawerState("half"); }}>
                  + New
                </DrawerBtn>
              </Tooltip>
              <Tooltip text="Save changes to this query" placement="top">
                <DrawerBtn onClick={handleSave}>
                  Save
                </DrawerBtn>
              </Tooltip>
              <Tooltip text="Fork into a new named query" placement="top">
                <DrawerBtn onClick={() => setShowSaveForm((s) => !s)}>
                  Fork
                </DrawerBtn>
              </Tooltip>
              <Tooltip text="Execute the query" placement="top">
                <DrawerBtn primary onClick={handleRun}>
                  ▶ Run
                </DrawerBtn>
              </Tooltip>
              <Tooltip
                text={drawerState === "full" ? "Shrink to half height" : "Expand to full screen"}
                placement="top"
              >
                <DrawerBtn
                  onClick={() => {
                    const next: "half" | "full" = drawerState === "full" ? "half" : "full";
                    setExpandedState(next);
                    setDrawerState(next);
                  }}
                >
                  {drawerState === "full" ? "↓" : "↑"}
                </DrawerBtn>
              </Tooltip>
            </>
          )}
          {!initializing && (
            <Tooltip
              text={drawerState === "collapsed" ? "Open workbench" : "Collapse workbench"}
              placement="top"
            >
              <DrawerBtn onClick={handleToggle}>
                {drawerState === "collapsed" ? "▲" : "▼"}
              </DrawerBtn>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ── Expanded content ────────────────────────────────────────────── */}
      {drawerState !== "collapsed" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Save form */}
          {showSaveForm && (
            <div className="bg-odm-card border-b border-odm-line px-4 py-2.5 flex gap-2 items-center flex-wrap shrink-0">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Query name…"
                className={[
                  "font-sans text-[13px] text-odm-ink bg-white",
                  "border border-odm-line border-b-2 border-b-odm-line-h",
                  "px-2.5 py-1 outline-none flex-[1_1_180px]",
                  "focus:border-b-lux-red transition-colors duration-100",
                ].join(" ")}
              />
              <input
                type="text"
                value={saveDesc}
                onChange={(e) => setSaveDesc(e.target.value)}
                placeholder="Description (optional)…"
                className={[
                  "font-sans text-[13px] text-odm-ink bg-white",
                  "border border-odm-line border-b-2 border-b-odm-line-h",
                  "px-2.5 py-1 outline-none flex-[2_1_240px]",
                  "focus:border-b-lux-red transition-colors duration-100",
                ].join(" ")}
              />
              <Tooltip text="Create fork" placement="top">
                <DrawerBtn primary onClick={handleFork}>Fork</DrawerBtn>
              </Tooltip>
              <Tooltip text="Discard and close" placement="top">
                <DrawerBtn onClick={() => setShowSaveForm(false)}>Cancel</DrawerBtn>
              </Tooltip>
            </div>
          )}

          {/* SQL editor */}
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            spellCheck={false}
            aria-label="SQL query editor"
            placeholder="-- Start writing SQL"
            className={[
              "block w-full font-mono text-[13px] text-odm-ink leading-[1.9]",
              "bg-odm-page border-0 border-b border-odm-line",
              "px-4 py-3.5 outline-none resize-none box-border shrink-0",
              "focus:outline-none",
            ].join(" ")}
            style={{ height: editorH }}
          />

          {/* Results — full mode only */}
          {drawerState === "full" && (
            <div
              className="flex-1 overflow-y-auto overflow-x-auto bg-white"
              style={{ height: resultsH }}
            >
              {/* Results header */}
              <div className="sticky top-0 bg-white z-[1] px-4 py-2.5 border-b border-odm-line flex justify-between items-center">
                <span className="font-sans text-[11px] font-bold tracking-[0.08em] uppercase text-odm-muted">
                  Query results
                </span>
                {resultRows && !loading && !error && (
                  <span className="font-sans text-[11px] font-semibold text-odm-ok">
                    {resultRows.length} row{resultRows.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-10">
                  <span className="font-sans text-[13px] text-odm-muted">Running query…</span>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="px-4 py-4 border-l-[3px] border-odm-bad-bd ml-4 mt-4">
                  <p className="font-sans text-[13px] text-odm-bad">{error}</p>
                </div>
              )}

              {/* No results yet */}
              {!loading && !error && !hasResults && (
                <div className="flex items-center justify-center flex-1 py-10">
                  <span className="font-sans text-[13px] text-odm-faint">
                    Press Run to execute the query
                  </span>
                </div>
              )}

              {/* Results table */}
              {!loading && !error && hasResults && resultRows && resultRows.length > 0 && (
                <div className="px-4 pb-6">
                  <table className="w-full border-collapse font-sans text-[13px]">
                    <thead>
                      <tr className="border-b-2 border-odm-line">
                        {Object.keys(resultRows[0]).map((col) => (
                          <th
                            key={col}
                            className="py-2 pr-3.5 text-left font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-odm-muted"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultRows.map((row, i) => (
                        <tr key={i} className="border-b border-odm-line-l">
                          {Object.values(row).map((v, j) => (
                            <td
                              key={j}
                              className={[
                                "py-2 pr-3.5 text-odm-ink",
                                typeof v === "number"
                                  ? "font-mono font-semibold"
                                  : "font-sans",
                              ].join(" ")}
                            >
                              {typeof v === "number" ? v.toLocaleString() : v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* No rows returned */}
              {!loading && !error && hasResults && resultRows && resultRows.length === 0 && (
                <div className="flex items-center justify-center py-10">
                  <span className="font-sans text-[13px] text-odm-faint">
                    Query returned 0 rows.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
