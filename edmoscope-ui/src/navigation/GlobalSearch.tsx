import React, { useState, useEffect, useRef } from "react";
import { Spinner } from "../primitives/Spinner.tsx";

/**
 * A single search result item.
 */
export interface SearchResult {
  /** Unique identifier — passed back to `onSelect`. */
  id: string;
  /** Primary label shown in the result row. */
  title: string;
  /** Optional secondary line (source, type, description snippet). */
  subtitle?: string;
  /**
   * Optional icon character shown at the left of the row.
   * Use a Unicode symbol or a short string (e.g. "▣", "◎", "⌕").
   */
  icon?: string;
  /** Any additional data you want back in the onSelect callback. */
  meta?: unknown;
  /**
   * Pre-computed route string for this result.
   * When provided alongside `linkComponent` on GlobalSearch, the result row
   * renders as a router Link instead of a button.
   *
   * @example "/datasets/DS-001"
   */
  to?: string;
}

/**
 * A labelled group of search results (e.g. "Datasets · 4", "Actors · 2").
 */
export interface SearchResultGroup {
  /** Group heading label. */
  label: string;
  /** Results within this group. */
  results: SearchResult[];
}

/**
 * Props forwarded to the `renderInput` render prop.
 * Spread these onto the `<input>` (or compatible custom field element) inside
 * your `renderInput` callback so GlobalSearch retains focus management and
 * query binding.
 */
export interface SearchInputProps {
  /** Current query value. */
  value: string;
  /** Called on every keystroke. */
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  /** Placeholder text (forwarded from GlobalSearchProps.placeholder). */
  placeholder: string;
  /** Accessible label for the input. */
  "aria-label": string;
  /** Tailwind classes for layout and typography. */
  className: string;
  /**
   * Ref needed so GlobalSearch can auto-focus the input on open.
   * Must reach an actual `<input>` element for focus to work.
   */
  ref: React.RefObject<HTMLInputElement | null>;
}

/**
 * GlobalSearch — search trigger button + fullscreen overlay.
 *
 * The trigger button is compact enough to live inside a nav column. Clicking
 * it (or pressing ⌘K / Ctrl+K) opens a fullscreen overlay with a text input
 * and grouped results. The consumer controls query state, debouncing, and
 * result fetching — GlobalSearch is purely presentational.
 *
 * @example
 * // Basic usage
 * const [open, setOpen]   = useState(false);
 * const [query, setQuery] = useState("");
 * const results           = useSearch(query);   // your hook
 *
 * <GlobalSearch
 *   open={open}
 *   onOpen={() => setOpen(true)}
 *   onClose={() => { setOpen(false); setQuery(""); }}
 *   query={query}
 *   onQueryChange={setQuery}
 *   results={results}
 *   onSelect={result => { navigate(`/datasets/${result.id}`); setOpen(false); }}
 * />
 *
 * @example
 * // TanStack Router — result rows as Links (onSelect not needed)
 * import { Link } from "@tanstack/react-router";
 *
 * const results = [{ label: "Datasets", results: [
 *   { id: "DS-001", title: "MobiScout", icon: "▣", to: "/datasets/DS-001" },
 * ]}];
 *
 * <GlobalSearch
 *   open={open} onOpen={...} onClose={...}
 *   query={query} onQueryChange={setQuery}
 *   results={results}
 *   linkComponent={Link}
 * />
 *
 * @example
 * // TanStack Form — custom input via renderInput
 * import { useForm } from "@tanstack/react-form";
 *
 * const form = useForm({ defaultValues: { q: "" } });
 *
 * <GlobalSearch
 *   open={open} onOpen={...} onClose={...}
 *   query={form.state.values.q}
 *   onQueryChange={v => form.setFieldValue("q", v)}
 *   results={results}
 *   onSelect={r => navigate(r.to ?? "/")}
 *   renderInput={props => (
 *     <form.Field name="q">
 *       {field => (
 *         <input
 *           {...props}
 *           value={field.state.value}
 *           onChange={e => field.handleChange(e.target.value)}
 *         />
 *       )}
 *     </form.Field>
 *   )}
 * />
 */
export interface GlobalSearchProps {
  /** Whether the search overlay is open. */
  open: boolean;
  /** Called when the trigger button is clicked or ⌘K / Ctrl+K is pressed. */
  onOpen: () => void;
  /** Called when the overlay should close (Escape, backdrop, or item selected). */
  onClose: () => void;
  /** Current search query — controlled by the consumer. */
  query: string;
  /** Called on every keystroke. Debounce externally if needed. */
  onQueryChange: (query: string) => void;
  /** Grouped result sets. Pass an empty array while loading or when idle. */
  results: SearchResultGroup[];
  /**
   * Called when the user selects a result row rendered as a button.
   * Optional when all result rows use `linkComponent` + `result.to` for
   * navigation — in that case the router handles the transition.
   */
  onSelect?: (result: SearchResult) => void;
  /**
   * Placeholder shown in both the trigger button and the search input.
   * @default "Search…"
   */
  placeholder?: string;
  /**
   * When true, a spinner is shown inside the search input to indicate
   * that results are loading.
   * @default false
   */
  loading?: boolean;
  /**
   * Router Link component used to render result rows that carry a `to` field.
   * Pass the Link component from your router (e.g. TanStack Router's `Link`)
   * so the overlay integrates with your router without hard-coding it.
   *
   * When omitted, all result rows render as `<button>` elements and navigation
   * is handled by the `onSelect` callback.
   *
   * @example
   * import { Link } from "@tanstack/react-router";
   * <GlobalSearch linkComponent={Link} ... />
   */
  linkComponent?: React.ElementType;
  /**
   * Render prop for the search input element.
   *
   * When provided, GlobalSearch calls this instead of rendering its built-in
   * `<input>`. The function receives all default input props via
   * `SearchInputProps`; spread them onto your custom element so query binding
   * and auto-focus are preserved.
   *
   * @example
   * renderInput={props => (
   *   <form.Field name="q">
   *     {field => (
   *       <input
   *         {...props}
   *         value={field.state.value}
   *         onChange={e => field.handleChange(e.target.value)}
   *       />
   *     )}
   *   </form.Field>
   * )}
   */
  renderInput?: (props: SearchInputProps) => React.ReactNode;
}

export function GlobalSearch({
  open,
  onOpen,
  onClose,
  query,
  onQueryChange,
  results,
  onSelect,
  placeholder = "Search…",
  loading = false,
  linkComponent,
  renderInput,
}: GlobalSearchProps): React.ReactElement {
  const inputRef   = useRef<HTMLInputElement>(null);
  const isMac      = typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent);
  const kbdHint    = isMac ? "⌘K" : "Ctrl K";

  const totalCount = results.reduce((n, g) => n + g.results.length, 0);
  const isEmpty    = query.length >= 2 && totalCount === 0 && !loading;

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        open ? onClose() : onOpen();
      }
      if (open && e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpen, onClose]);

  // Focus input when overlay opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  function handleSelect(result: SearchResult): void {
    onSelect?.(result);
    onClose();
  }

  const rowClassName = [
    "w-full flex items-center gap-3 px-4 py-2.5 text-left",
    "border-b border-odm-line-l border-0",
    "bg-transparent cursor-pointer",
    "hover:bg-odm-card transition-colors duration-75",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-[-2px]",
  ].join(" ");

  return (
    <>
      {/* ── Trigger button — lives in the nav column ── */}
      <button
        onClick={onOpen}
        aria-label={`Search (${kbdHint})`}
        aria-expanded={open}
        className={[
          "w-full flex items-center gap-2 px-3 py-2",
          "font-sans text-[13px] text-odm-muted",
          "bg-odm-surface border border-odm-line",
          "cursor-pointer transition-colors duration-100",
          "hover:bg-white hover:text-odm-mid hover:border-odm-line-h",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-1",
        ].join(" ")}
      >
        <span aria-hidden="true" className="text-[15px] leading-none flex-shrink-0">⌕</span>
        <span className="flex-1 text-left truncate">{placeholder}</span>
        <span aria-hidden="true" className="flex-shrink-0 flex items-center gap-0.5">
          {kbdHint.split(" ").map((key, i) => (
            <kbd
              key={i}
              className="font-mono text-[10px] text-odm-faint border border-odm-line-l border-b-odm-line px-1 leading-4"
            >
              {key}
            </kbd>
          ))}
        </span>
      </button>

      {/* ── Fullscreen overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-[900] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-odm-ink/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel — centered, max-width */}
          <div className="relative z-10 flex flex-col mx-auto mt-[10vh] w-full max-w-[580px] max-h-[70vh] bg-white shadow-2xl">

            {/* Input bar */}
            <div
              role="search"
              className="flex items-center gap-3 px-4 py-3 border-b-[3px] border-b-lux-red flex-shrink-0"
            >
              <span aria-hidden="true" className="text-[18px] text-odm-muted flex-shrink-0 leading-none">⌕</span>
              {renderInput
                ? renderInput({
                    ref: inputRef,
                    value: query,
                    onChange: e => onQueryChange(e.target.value),
                    placeholder,
                    "aria-label": "Search",
                    className: "flex-1 min-w-0 font-sans text-[15px] text-odm-ink bg-transparent border-0 outline-none placeholder:text-odm-faint",
                  })
                : (
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => onQueryChange(e.target.value)}
                    aria-label="Search"
                    placeholder={placeholder}
                    className="flex-1 min-w-0 font-sans text-[15px] text-odm-ink bg-transparent border-0 outline-none placeholder:text-odm-faint"
                  />
                )
              }
              {loading && <Spinner size="sm" />}
              {query && !loading && (
                <button
                  onClick={() => onQueryChange("")}
                  className="bg-transparent border-0 cursor-pointer font-sans text-xs text-odm-muted hover:text-odm-mid p-0"
                >
                  Clear
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-transparent border border-odm-line-l cursor-pointer font-sans text-xs font-semibold text-odm-muted px-1.5 py-0.5 hover:bg-odm-surface"
              >
                Esc
              </button>
            </div>

            {/* Results */}
            <div
              role="region"
              aria-live="polite"
              aria-label="Search results"
              className="flex-1 overflow-y-auto"
            >
              {/* Idle */}
              {query.length < 2 && (
                <div className="py-8 text-center font-sans text-[13px] text-odm-muted">
                  <div aria-hidden="true" className="text-3xl opacity-20 mb-3 leading-none">⌕</div>
                  Type at least 2 characters to search.
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    {kbdHint.split(" ").map((key, i) => (
                      <kbd key={i} className="font-mono text-[11px] text-odm-faint border border-odm-line-l border-b-odm-line px-1.5 leading-5">
                        {key}
                      </kbd>
                    ))}
                    <span className="text-odm-faint text-xs">to open anytime</span>
                  </div>
                </div>
              )}

              {/* No results */}
              {isEmpty && (
                <div className="py-8 text-center font-sans text-[13px] text-odm-muted">
                  No results for <strong>"{query}"</strong>
                </div>
              )}

              {/* Result groups */}
              {results.map(group => (
                <div key={group.label}>
                  {/* Group header */}
                  <div className="px-4 py-2 font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-odm-muted bg-odm-surface border-b border-odm-line-l">
                    {group.label} · {group.results.length}
                  </div>
                  {group.results.map(result => {
                    const rowContent = (
                      <>
                        {result.icon && (
                          <span aria-hidden="true" className="text-odm-faint text-sm flex-shrink-0 w-4 text-center leading-none">
                            {result.icon}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-sans text-[14px] font-semibold text-odm-ink truncate">
                            {result.title}
                          </div>
                          {result.subtitle && (
                            <div className="font-sans text-xs text-odm-muted truncate mt-0.5">
                              {result.subtitle}
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-odm-faint flex-shrink-0">
                          {result.id}
                        </span>
                      </>
                    );

                    if (linkComponent && result.to) {
                      const LinkComponent = linkComponent;
                      return (
                        <LinkComponent
                          key={result.id}
                          to={result.to}
                          onClick={onClose}
                          className={rowClassName}
                        >
                          {rowContent}
                        </LinkComponent>
                      );
                    }

                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        className={rowClassName}
                      >
                        {rowContent}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            {totalCount > 0 && (
              <div className="flex items-center px-4 py-2 border-t border-odm-line-l bg-odm-surface flex-shrink-0">
                <span className="font-sans text-[11px] text-odm-faint">
                  {totalCount} result{totalCount !== 1 ? "s" : ""}
                </span>
                <span className="font-sans text-[11px] text-odm-faint ml-auto">
                  ↵ select · Esc close
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
