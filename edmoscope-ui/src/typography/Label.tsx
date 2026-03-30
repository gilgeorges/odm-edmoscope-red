import React from "react";

/**
 * Label — form field label and metadata key display.
 *
 * Used above form inputs (with `htmlFor`) and in metadata grids as the key
 * portion of a key-value pair. Renders as an uppercase, spaced-out label
 * matching the design system's field label style.
 *
 * @example
 * // Form label
 * <Label htmlFor="title-input" required>Asset title</Label>
 * <Input id="title-input" ... />
 *
 * // Metadata key
 * <Label as="div">Source organisation</Label>
 */
export interface LabelProps extends React.ComponentPropsWithoutRef<"label"> {
  /**
   * Marks the field as required by appending a red asterisk.
   * Only meaningful when used as a form label with `htmlFor`.
   * @default false
   */
  required?: boolean;
  /**
   * Error state — renders the label in the error colour.
   * @default false
   */
  error?: boolean;
  /** The element to render as. Pass "div" when not labelling a form control. */
  as?: "label" | "div";
  /** Label text content. */
  children: React.ReactNode;
}

export function Label({
  required = false,
  error = false,
  as: Tag = "label",
  children,
  className = "",
  ...rest
}: LabelProps): React.ReactElement {
  return (
    <Tag
      {...(rest as React.ComponentPropsWithoutRef<"label">)}
      className={[
        "font-sans text-[11px] font-bold tracking-[0.09em] uppercase block mb-1",
        error ? "text-odm-bad" : "text-odm-muted",
        className,
      ].join(" ")}
    >
      {children}
      {required && (
        <span className="text-odm-bad ml-0.5" aria-hidden="true"> *</span>
      )}
    </Tag>
  );
}
