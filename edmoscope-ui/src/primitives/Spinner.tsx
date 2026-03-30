import React from "react";

/**
 * Spinner — animated loading indicator.
 *
 * Renders a CSS-animated ring using Tailwind's `animate-spin` class.
 * Always includes an accessible label for screen readers.
 *
 * @example
 * <Spinner />
 * <Spinner size="lg" label="Loading dataset…" />
 */
export interface SpinnerProps {
  /**
   * Size variant.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Screen-reader label describing what is loading.
   * @default "Loading…"
   */
  label?: string;
  /**
   * Colour variant. Controls the ring colour.
   * @default "default"
   */
  variant?: "default" | "brand" | "white";
}

const SIZE_CLASSES: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
};

const VARIANT_CLASSES: Record<NonNullable<SpinnerProps["variant"]>, string> = {
  default: "border-odm-line border-t-odm-mid",
  brand:   "border-lux-red-20 border-t-lux-red",
  white:   "border-white/30 border-t-white",
};

export function Spinner({
  size = "md",
  label = "Loading…",
  variant = "default",
}: SpinnerProps): React.ReactElement {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center justify-center">
      <span
        aria-hidden="true"
        className={[
          "rounded-full animate-spin",
          SIZE_CLASSES[size],
          VARIANT_CLASSES[variant],
        ].join(" ")}
      />
    </span>
  );
}
