import React from "react";

/**
 * Icon — renders a Unicode symbol or text character as an accessible inline icon.
 *
 * Since this library avoids external icon font dependencies, icons are expressed
 * as Unicode characters or short strings. The component ensures consistent sizing
 * and accessibility: decorative icons are `aria-hidden`, labelled icons get
 * `role="img"` and `aria-label`.
 *
 * For SVG icons, prefer composing a dedicated component rather than passing raw
 * SVG through this one.
 *
 * @example
 * // Decorative
 * <Icon symbol="⌕" aria-hidden />
 *
 * // Labelled (screen-reader visible)
 * <Icon symbol="✓" label="Success" />
 */
export interface IconProps extends React.ComponentPropsWithoutRef<"span"> {
  /** The Unicode character or short string to render. */
  symbol: string;
  /**
   * Accessible label. When provided, adds `role="img"` and `aria-label`.
   * When omitted, the icon is aria-hidden (decorative).
   */
  label?: string;
  /**
   * Font size for the icon. Accepts any CSS font-size value.
   * @default "1em"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES: Record<NonNullable<IconProps["size"]>, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-2xl",
};

export function Icon({
  symbol,
  label,
  size = "md",
  className = "",
  ...rest
}: IconProps): React.ReactElement {
  const accessibilityProps = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const };

  return (
    <span
      {...rest}
      {...accessibilityProps}
      className={[
        "inline-flex items-center justify-center leading-none select-none",
        SIZE_CLASSES[size],
        className,
      ].join(" ")}
    >
      {symbol}
    </span>
  );
}
