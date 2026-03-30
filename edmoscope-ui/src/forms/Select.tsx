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
 * Select — dropdown select field.
 *
 * Styled consistently with Input. Spreads remaining props onto the underlying
 * `<select>` element.
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
    <select
      {...rest}
      className={[
        "block w-full font-sans text-[13px] text-odm-ink",
        "bg-odm-surface border border-odm-line border-b-2",
        "px-2.5 py-1.5 outline-none appearance-none cursor-pointer",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23606060' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_10px_center] bg-[length:10px_6px] pr-8",
        "transition-colors duration-100",
        error
          ? "border-b-odm-bad-bd focus:border-odm-bad-bd"
          : "border-b-odm-line-h focus:border-b-lux-red",
        "focus:border-odm-line-h",
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
  );
}
