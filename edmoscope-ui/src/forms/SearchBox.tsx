import React, { useRef } from "react";

/**
 * SearchBox — inline search input with a leading search icon and optional clear button.
 *
 * A controlled, unframed search field. Not to be confused with GlobalSearch
 * (the full overlay). Use SearchBox for in-page filtering (e.g. filtering a
 * list already on screen).
 *
 * @example
 * <SearchBox
 *   value={query}
 *   onChange={setQuery}
 *   placeholder="Filter datasets…"
 * />
 */
export interface SearchBoxProps {
  /** Current search value (controlled). */
  value: string;
  /** Called when the value changes. */
  onChange: (value: string) => void;
  /**
   * Placeholder text shown when the field is empty.
   * @default "Search…"
   */
  placeholder?: string;
  /**
   * Accessible label for the search input (for screen readers).
   * @default "Search"
   */
  ariaLabel?: string;
  /** Additional CSS classes on the wrapper div. */
  className?: string;
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Search…",
  ariaLabel = "Search",
  className = "",
}: SearchBoxProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={["relative flex items-center", className].join(" ")}>
      <span
        aria-hidden="true"
        className="absolute left-2.5 text-odm-muted text-[15px] pointer-events-none leading-none"
      >
        ⌕
      </span>
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full font-sans text-[13px] text-odm-ink bg-white",
          "border border-odm-line border-b-[2px] border-b-odm-line-h",
          "pl-8 pr-8 py-1.5 outline-none appearance-none",
          "placeholder:text-odm-faint",
          "focus:border-b-lux-red transition-colors duration-100",
        ].join(" ")}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(""); inputRef.current?.focus(); }}
          aria-label="Clear search"
          className={[
            "absolute right-2.5 bg-transparent border-0 cursor-pointer p-0",
            "font-sans text-xs text-odm-muted hover:text-odm-mid",
            "transition-colors duration-100",
          ].join(" ")}
        >
          ×
        </button>
      )}
    </div>
  );
}
