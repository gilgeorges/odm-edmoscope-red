import React from "react";

/**
 * Divider — horizontal rule separating content sections.
 *
 * @example
 * <Divider />
 * <Divider spacing="lg" />
 */
export interface DividerProps extends React.ComponentPropsWithoutRef<"hr"> {
  /**
   * Vertical spacing above and below the divider.
   * @default "md"
   */
  spacing?: "none" | "sm" | "md" | "lg";
}

const SPACING_CLASSES: Record<NonNullable<DividerProps["spacing"]>, string> = {
  none: "my-0",
  sm:   "my-2",
  md:   "my-4",
  lg:   "my-8",
};

export function Divider({ spacing = "md", className = "", ...rest }: DividerProps): React.ReactElement {
  return (
    <hr
      {...rest}
      className={[
        "border-0 border-t border-odm-line-l",
        SPACING_CLASSES[spacing],
        className,
      ].join(" ")}
    />
  );
}
