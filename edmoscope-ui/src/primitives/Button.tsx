import React from "react";

/** Button own props, independent of the rendered element type. */
interface ButtonOwnProps {
  /**
   * The element type or component to render as. Defaults to `"button"`.
   *
   * Pass a router `Link` component to render the button as a navigation link
   * and forward router-specific props (e.g. `to`) directly on the element.
   *
   * @example
   * // TanStack Router
   * <Button as={Link} to="/datasets" variant="primary">View datasets</Button>
   *
   * // Native anchor
   * <Button as="a" href="/datasets" variant="secondary">View datasets</Button>
   */
  as?: React.ElementType;
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
  /** Additional CSS classes. */
  className?: string;
}

/**
 * Button props — own props merged with the props of the rendered element (default: `"button"`).
 *
 * When `as` is set to a component (e.g. TanStack Router `Link`), all props
 * accepted by that component (e.g. `to`) become valid on `Button`.
 */
export type ButtonProps<T extends React.ElementType = "button"> =
  ButtonOwnProps & Omit<React.ComponentPropsWithoutRef<T>, keyof ButtonOwnProps>;

const VARIANT_CLASSES: Record<NonNullable<ButtonOwnProps["variant"]>, string> = {
  primary:   "bg-odm-ink text-white border-transparent hover:bg-odm-soft",
  secondary: "bg-transparent text-odm-mid border-odm-line border-b-odm-line-h hover:bg-odm-surface",
  ghost:     "bg-transparent text-odm-muted border-transparent hover:text-odm-mid hover:bg-odm-surface",
  danger:    "bg-odm-bad text-white border-transparent hover:opacity-90",
  brand:     "bg-lux-red text-white border-transparent hover:opacity-90",
};

const SIZE_CLASSES: Record<NonNullable<ButtonOwnProps["size"]>, string> = {
  sm: "text-[11px] px-3 py-1",
  md: "text-xs px-3.5 py-1.5",
  lg: "text-sm px-5 py-2.5",
};

/**
 * Button — the primary interactive control.
 *
 * Uses a `variant` prop for visual styles. Spreads remaining props onto the
 * underlying element so consumers can pass `aria-*`, `data-*`, `type`,
 * `disabled`, and event handlers freely.
 *
 * By default renders as a `<button>`. Pass `as={Link}` (from your router) to
 * render as a navigation link — all router-specific props are forwarded.
 *
 * @example
 * <Button variant="primary" onClick={handleSave}>Save</Button>
 * <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
 * <Button variant="danger" type="submit">Delete asset</Button>
 * <Button as={Link} to="/datasets" variant="brand">View datasets</Button>
 */
export function Button<T extends React.ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...rest
}: ButtonProps<T>): React.ReactElement {
  const Tag = (as ?? "button") as React.ElementType;
  return (
    <Tag
      {...(rest as object)}
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
    </Tag>
  );
}
