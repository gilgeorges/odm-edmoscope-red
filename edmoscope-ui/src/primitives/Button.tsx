import React from "react";

/**
 * Button — the primary interactive control.
 *
 * Uses a `variant` prop for visual styles. Spreads remaining props onto the
 * underlying `<button>` so consumers can pass `aria-*`, `data-*`, `type`,
 * `disabled`, and event handlers freely.
 *
 * @example
 * <Button variant="primary" onClick={handleSave}>Save</Button>
 * <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
 * <Button variant="danger" type="submit">Delete asset</Button>
 */
export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  /**
   * Visual style variant.
   * - `primary` — dark fill, used for the main action
   * - `secondary` — bordered, used for secondary actions
   * - `ghost` — no border, minimal chrome, used for tertiary / cancel
   * - `danger` — red fill, used for destructive actions
   * - `brand` — lux-red fill, used sparingly for brand-accent CTAs
   */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "brand";
  /**
   * Size variant.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /** Button content. */
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:   "bg-odm-ink text-white border-transparent hover:bg-odm-soft",
  secondary: "bg-transparent text-odm-mid border-odm-line border-b-odm-line-h hover:bg-odm-surface",
  ghost:     "bg-transparent text-odm-muted border-transparent hover:text-odm-mid hover:bg-odm-surface",
  danger:    "bg-odm-bad text-white border-transparent hover:opacity-90",
  brand:     "bg-lux-red text-white border-transparent hover:opacity-90",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "text-[11px] px-3 py-1",
  md: "text-xs px-3.5 py-1.5",
  lg: "text-sm px-5 py-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps): React.ReactElement {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-1.5",
        "font-sans font-semibold tracking-[0.02em]",
        "border transition-colors duration-100 cursor-pointer",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
