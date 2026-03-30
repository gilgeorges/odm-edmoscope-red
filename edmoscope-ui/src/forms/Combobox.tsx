import React, { useState, useRef, useCallback } from "react";

/**
 * ComboboxOption — a single selectable option in a Combobox dropdown.
 *
 * Displayed as a two-row card: `label` on the first line, optional
 * `description` (e.g. a SKOS scopeNote or dataset source) on the second.
 */
export interface ComboboxOption {
  /** Machine-readable identifier for this option. */
  value: string;
  /** Primary display text (e.g. SKOS prefLabel, dataset name). */
  label: string;
  /**
   * Optional secondary line shown below the label in the dropdown card
   * (e.g. SKOS scopeNote / definition, dataset ID + source, date).
   */
  description?: string;
  /** When true the option is shown but cannot be selected. */
  disabled?: boolean;
}

/**
 * ComboboxTag — a selected value chip rendered above the input when
 * `multiSelect` is enabled.
 */
interface ComboboxTag {
  value: string;
  label: string;
}

/**
 * ComboboxProps — props for the Combobox component.
 */
export interface ComboboxProps {
  /**
   * Full list of options to search through.
   * Each option may carry an optional `description` displayed as a second
   * line in the dropdown card — useful for SKOS fields (prefLabel +
   * scopeNote/definition) or dataset search results (name + ID/source).
   */
  options: ComboboxOption[];
  /**
   * Currently selected value(s).
   *
   * - Single-select: pass `string | null`.
   * - Multi-select: pass `string[]` and also set `multiSelect`.
   */
  value?: string | string[] | null;
  /**
   * Called when the selection changes.
   *
   * - Single-select: receives the selected `value` string, or `null` when
   *   cleared.
   * - Multi-select: receives the full updated array of selected values.
   */
  onChange?: (value: string | null | string[]) => void;
  /**
   * Placeholder text shown inside the input when nothing is typed.
   * @default "Search…"
   */
  placeholder?: string;
  /**
   * Maximum number of options shown in the dropdown at once.
   * @default 8
   */
  maxVisible?: number;
  /**
   * When true, multiple values can be selected. Selected items are shown as
   * removable tag chips above the input.
   * @default false
   */
  multiSelect?: boolean;
  /**
   * Error state — applies error border styling to the input.
   * @default false
   */
  error?: boolean;
  /**
   * When true the input is disabled.
   * @default false
   */
  disabled?: boolean;
  /** Additional CSS classes on the root wrapper element. */
  className?: string;
}

const INPUT_BASE = [
  "block w-full font-sans text-[13px] text-odm-ink",
  "bg-white border border-odm-line border-b-2",
  "px-2.5 py-1.5 outline-none",
  "placeholder:text-odm-faint",
  "transition-colors duration-100",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

const INPUT_NORMAL = "border-b-odm-line-h focus:border-b-lux-red";
const INPUT_ERROR  = "border-b-odm-bad-bd focus:border-b-odm-bad-bd";

/**
 * Combobox — searchable dropdown with two-row result cards.
 *
 * Supports both single-select and multi-select modes. Each dropdown option
 * is rendered as a card with a **primary label** (large) and an optional
 * **description** line (smaller, muted) — making it suitable for:
 *
 * - **SKOS concept fields**: label = `skos:prefLabel`, description =
 *   `skos:scopeNote` or `skos:definition`
 * - **Dataset search**: label = dataset name, description = `ID · source`
 * - **Any filtered list** where context helps the user choose
 *
 * In multi-select mode, selected values are shown as removable tag chips
 * above the input field.
 *
 * @example
 * // SKOS dropdown with definitions
 * <Combobox
 *   options={[
 *     { value: "cycling", label: "Cycling", description: "Movement by bicycle on roads or dedicated lanes." },
 *     { value: "ped",     label: "Pedestrian", description: "Movement on foot in public or semi-public space." },
 *   ]}
 *   placeholder="Select transport mode…"
 *   value={mode}
 *   onChange={v => setMode(v as string)}
 * />
 *
 * @example
 * // Multi-select dataset search
 * <Combobox
 *   options={datasets.map(d => ({ value: d.id, label: d.name, description: `${d.id} · ${d.source}` }))}
 *   multiSelect
 *   value={selectedIds}
 *   onChange={v => setSelectedIds(v as string[])}
 *   placeholder="Search datasets…"
 * />
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Search…",
  maxVisible = 8,
  multiSelect = false,
  error = false,
  disabled = false,
  className = "",
}: ComboboxProps): React.ReactElement {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* ── Normalise value ─────────────────────────────────────────────────── */
  const selectedValues: string[] = multiSelect
    ? Array.isArray(value) ? value : []
    : value && typeof value === "string" ? [value] : [];

  /* ── Filter options ──────────────────────────────────────────────────── */
  const q = query.trim().toLowerCase();
  const filtered = (
    q.length === 0
      ? options.filter((o) => !selectedValues.includes(o.value))
      : options.filter(
          (o) =>
            !selectedValues.includes(o.value) &&
            (o.label.toLowerCase().includes(q) ||
              (o.description?.toLowerCase().includes(q) ?? false))
        )
  ).slice(0, maxVisible);

  /* ── Selection handlers ──────────────────────────────────────────────── */
  const select = useCallback(
    (opt: ComboboxOption) => {
      if (opt.disabled) return;
      if (multiSelect) {
        const next = [...selectedValues, opt.value];
        onChange?.(next);
      } else {
        onChange?.(opt.value);
        setQuery(opt.label);
        setOpen(false);
      }
      if (multiSelect) {
        setQuery("");
        inputRef.current?.focus();
      }
    },
    [multiSelect, onChange, selectedValues]
  );

  const removeTag = useCallback(
    (val: string) => {
      if (!multiSelect) return;
      onChange?.(selectedValues.filter((v) => v !== val));
      inputRef.current?.focus();
    },
    [multiSelect, onChange, selectedValues]
  );

  /* ── Tags for multi-select ───────────────────────────────────────────── */
  const tags: ComboboxTag[] = selectedValues.map((v) => {
    const opt = options.find((o) => o.value === v);
    return { value: v, label: opt?.label ?? v };
  });

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className={["relative", className].join(" ")}>
      {/* Selected tag chips (multi-select only) */}
      {multiSelect && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag) => (
            <span
              key={tag.value}
              className={[
                "inline-flex items-center gap-1.5 font-sans text-[11px] text-odm-ink",
                "bg-odm-card border border-odm-line-h border-l-[3px] border-l-odm-ink",
                "px-2 py-0.5",
              ].join(" ")}
            >
              {tag.label}
              <button
                type="button"
                aria-label={`Remove ${tag.label}`}
                onClick={() => removeTag(tag.value)}
                className="text-odm-muted hover:text-odm-ink leading-none cursor-pointer bg-transparent border-0 p-0 font-sans text-[13px]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          value={query}
          disabled={disabled}
          placeholder={multiSelect && tags.length > 0 ? "Add more…" : placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className={[
            INPUT_BASE,
            error ? INPUT_ERROR : INPUT_NORMAL,
          ].join(" ")}
        />

        {/* Chevron indicator */}
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-odm-mid",
            "transition-transform duration-100",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
          >
            <path
              d="M1 1l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {/* Dropdown list */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Options"
          className={[
            "absolute z-50 left-0 right-0 top-full",
            "bg-white border border-odm-line-h border-t-0",
            "max-h-56 overflow-y-auto",
            "shadow-[0_4px_12px_rgba(0,0,0,0.10)]",
          ].join(" ")}
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-3 font-sans text-[12px] text-odm-faint select-none">
              {q.length > 0 ? `No results for "${query}"` : "No options available"}
            </li>
          ) : (
            filtered.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={selectedValues.includes(opt.value)}
                aria-disabled={opt.disabled}
                onMouseDown={() => select(opt)}
                className={[
                  "px-3 py-2 border-b border-odm-line-l last:border-b-0",
                  "cursor-pointer select-none",
                  opt.disabled
                    ? "opacity-40 cursor-not-allowed bg-odm-surface"
                    : "hover:bg-odm-card",
                ].join(" ")}
              >
                {/* Primary label */}
                <div className="font-sans text-[13px] font-semibold text-odm-ink leading-snug">
                  {opt.label}
                </div>
                {/* Description / SKOS scopeNote */}
                {opt.description && (
                  <div className="font-sans text-[11px] text-odm-muted mt-0.5 leading-snug">
                    {opt.description}
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
