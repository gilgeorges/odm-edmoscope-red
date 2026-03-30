import React, { useState } from "react";
import { SearchBox } from "./SearchBox.tsx";
import { Select, type SelectOption } from "./Select.tsx";

/**
 * FilterDefinition — definition for a single filter control in the FilterBar.
 */
export type FilterDefinition =
  | {
      /** Unique key identifying this filter in the state object. */
      key: string;
      /** Human-readable label shown above or beside the control. */
      label: string;
      /** Renders a text search input. */
      type: "search";
      /** Placeholder text for the search input. */
      placeholder?: string;
    }
  | {
      key: string;
      label: string;
      /** Renders a dropdown select. */
      type: "select";
      /** Options available in the dropdown. */
      options: SelectOption[];
      /** Label for the "no filter" / "all" option. @default "All" */
      allLabel?: string;
    }
  | {
      key: string;
      label: string;
      /** Renders an on/off toggle button. */
      type: "toggle";
    };

/** The current state of all filters: a record of key → string | boolean. */
export type FilterState = Record<string, string | boolean>;

/**
 * FilterBar — horizontal strip of filter controls.
 *
 * Manages its own internal state by default (uncontrolled). Pass `value` and
 * `onChange` for controlled mode.
 *
 * Each filter definition produces one control. The entire filter state is
 * emitted as a single object on any change, keyed by the filter's `key` field.
 *
 * @example
 * const FILTERS: FilterDefinition[] = [
 *   { key: "q",    type: "search", label: "Search",    placeholder: "Filter…" },
 *   { key: "type", type: "select", label: "Asset type", options: TYPE_OPTIONS },
 *   { key: "fresh", type: "toggle", label: "Current only" },
 * ];
 *
 * <FilterBar
 *   filters={FILTERS}
 *   onChange={state => setFilters(state)}
 * />
 */
export interface FilterBarProps {
  /** Array of filter definitions. Order determines left-to-right rendering. */
  filters: FilterDefinition[];
  /**
   * Controlled mode: current filter state.
   * When provided, `onChange` must also be provided.
   */
  value?: FilterState;
  /**
   * Called whenever any filter changes. Receives the full current filter state.
   */
  onChange?: (state: FilterState) => void;
  /** Additional CSS classes on the outer bar container. */
  className?: string;
}

function buildInitialState(filters: FilterDefinition[]): FilterState {
  const state: FilterState = {};
  for (const f of filters) {
    state[f.key] = f.type === "toggle" ? false : "";
  }
  return state;
}

export function FilterBar({
  filters,
  value: controlledValue,
  onChange,
  className = "",
}: FilterBarProps): React.ReactElement {
  const [internalState, setInternalState] = useState<FilterState>(() =>
    buildInitialState(filters)
  );

  const isControlled = controlledValue !== undefined;
  const state = isControlled ? controlledValue : internalState;

  function handleChange(key: string, val: string | boolean): void {
    const next = { ...state, [key]: val };
    if (!isControlled) setInternalState(next);
    onChange?.(next);
  }

  return (
    <div
      className={[
        "flex items-center gap-3 flex-wrap py-2",
        className,
      ].join(" ")}
      role="search"
      aria-label="Filters"
    >
      {filters.map((f) => {
        if (f.type === "search") {
          return (
            <div key={f.key} className="flex-1 min-w-[160px] max-w-xs">
              <SearchBox
                value={String(state[f.key] ?? "")}
                onChange={(v) => handleChange(f.key, v)}
                placeholder={f.placeholder ?? `${f.label}…`}
                ariaLabel={f.label}
              />
            </div>
          );
        }

        if (f.type === "select") {
          const allOpt: SelectOption = { value: "", label: f.allLabel ?? "All" };
          return (
            <div key={f.key} className="flex-shrink-0">
              <Select
                aria-label={f.label}
                options={[allOpt, ...f.options]}
                value={String(state[f.key] ?? "")}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="text-xs py-1"
              />
            </div>
          );
        }

        if (f.type === "toggle") {
          const active = Boolean(state[f.key]);
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => handleChange(f.key, !active)}
              aria-pressed={active}
              className={[
                "font-sans text-xs font-medium px-3 py-1.5 cursor-pointer",
                "border transition-colors duration-100 flex-shrink-0",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-1",
                active
                  ? "bg-odm-ink text-white border-transparent"
                  : "bg-transparent text-odm-mid border-odm-line hover:bg-odm-surface",
              ].join(" ")}
            >
              {f.label}
            </button>
          );
        }

        return null;
      })}
    </div>
  );
}
