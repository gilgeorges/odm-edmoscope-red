import React from "react";

/** A single option in a ToggleRow. */
export interface ToggleRowOption {
  /** Unique value used for selection state. */
  value: string;
  /** Human-readable label displayed in the button. */
  label: string;
  /** Optional count shown after the label (e.g. number of items in that category). */
  count?: number;
}

/** Props for the ToggleRow component. */
export interface ToggleRowProps {
  /** The selectable options. */
  options: ToggleRowOption[];
  /** The currently selected value (controlled). */
  value: string;
  /** Called with the new value when the user selects a different option. */
  onChange: (value: string) => void;
  /** Accessible label for the button group. @default "View filter" */
  "aria-label"?: string;
  /** Additional CSS classes on the root element. */
  className?: string;
}

/**
 * ToggleRow — Pill-shaped segmented control for switching between named views.
 *
 * Commonly used to filter a list by status (All / Draft / Published / Archived).
 * The active option is shown with a solid dark fill; inactive options are ghost-style.
 *
 * @example
 * const [filter, setFilter] = useState("all");
 *
 * <ToggleRow
 *   value={filter}
 *   onChange={setFilter}
 *   options={[
 *     { value: "all",       label: "All",       count: 6 },
 *     { value: "draft",     label: "Draft",     count: 2 },
 *     { value: "published", label: "Published", count: 3 },
 *     { value: "archived",  label: "Archived",  count: 1 },
 *   ]}
 * />
 */
export function ToggleRow({
  options,
  value,
  onChange,
  "aria-label": ariaLabel = "View filter",
  className = "",
}: ToggleRowProps): React.ReactElement {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={[
        "inline-flex items-center gap-0.5 p-1 bg-odm-surface rounded-lg border border-odm-line",
        className,
      ].join(" ")}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium",
              "transition-colors duration-[120ms]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red",
              isActive
                ? "bg-odm-ink text-white shadow-sm"
                : "text-odm-mid hover:text-odm-ink hover:bg-odm-card",
            ].join(" ")}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={[
                  "tabular-nums",
                  isActive ? "text-white/70" : "text-odm-muted",
                ].join(" ")}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
