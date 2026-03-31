import React from "react";

/**
 * SelectOption — a single option in a Select dropdown.
 */
export interface SelectOption {
  /** Machine-readable value submitted with the form. */
  value: string;
  /** Human-readable label shown in the dropdown. */
  label: string;
}

/**
 * Select — dropdown select field with visible chevron indicator.
 *
 * Styled consistently with Input. Spreads remaining props onto the underlying
 * `<select>` element. Wraps the native select in a relative container so the
 * downward chevron SVG can be positioned absolutely and is always visible.
 *
 * @example
 * <Label htmlFor="type">Asset type</Label>
 * <Select
 *   id="type"
 *   options={[
 *     { value: "source", label: "Source" },
 *     { value: "output", label: "Output" },
 *   ]}
 *   value={type}
 *   onChange={e => setType(e.target.value)}
 * />
 */
export interface SelectProps extends Omit<React.ComponentPropsWithoutRef<"select">, "children"> {
  /** The list of options to render. */
  options: SelectOption[];
  /**
   * Optional placeholder shown when no value is selected.
   * Renders as a disabled, hidden-by-default option.
   */
  placeholder?: string;
  /**
   * Error state — applies error border styling.
   * @default false
   */
  error?: boolean;
}

export function Select({
  options,
  placeholder,
  error = false,
  className = "",
  ...rest
}: SelectProps): React.ReactElement {
  return (
    <div className="relative">
      <select
        {...rest}
        className={[
          "block w-full font-sans text-[13px] text-odm-ink",
          "bg-white border border-odm-line border-b-2",
          "px-2.5 py-1.5 pr-8 outline-none appearance-none cursor-pointer",
          "transition-colors duration-100",
          error
            ? "border-b-odm-bad-bd focus:border-b-odm-bad-bd"
            : "border-b-odm-line-h focus:border-b-lux-red",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        ].join(" ")}
      >
        {placeholder && (
          <option value="" disabled hidden>{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Downward chevron — pointer-events-none so clicks pass through */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-odm-mid"
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
  );
}
