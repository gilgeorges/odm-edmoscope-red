import React from "react";

/**
 * Badge — small inline label pill used for status, type, and state indicators.
 *
 * Uses a `variant` prop rather than boolean flags. Variant-to-class mappings
 * are defined as a const object so they are easy to locate and modify.
 *
 * @example
 * <Badge variant="ok">Saved</Badge>
 * <Badge variant="warn">Draft</Badge>
 * <Badge variant="danger">Archived</Badge>
 */
export interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  /**
   * Visual style variant. Controls background, border, and text colour.
   * - `default`  — neutral gray
   * - `ok`       — green (success / valid)
   * - `warn`     — amber (warning / draft)
   * - `danger`   — red (error / critical)
   * - `info`     — blue (informational)
   * - `brand`    — OdM lux-red accent
   */
  variant?: "default" | "ok" | "warn" | "danger" | "info" | "brand";
  /** Badge content — typically a short string. */
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-odm-surface text-odm-mid border border-odm-line-l",
  ok:      "bg-odm-ok-bg text-odm-ok border border-odm-ok-bd",
  warn:    "bg-odm-warn-bg text-odm-warn border border-odm-warn-bd",
  danger:  "bg-odm-bad-bg text-odm-bad border border-odm-bad-bd",
  info:    "bg-odm-info-bg text-odm-info border border-odm-info-bd",
  brand:   "bg-lux-red-20 text-lux-red border border-lux-red-60",
};

export function Badge({
  variant = "default",
  children,
  className = "",
  ...rest
}: BadgeProps): React.ReactElement {
  return (
    <span
      {...rest}
      className={[
        "inline-block font-sans text-[11px] font-semibold",
        "tracking-[0.04em] uppercase leading-4 px-1.5 py-0.5",
        "whitespace-nowrap",
        VARIANT_CLASSES[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
