import React, { useState, useRef, useEffect } from "react";

/**
 * Tooltip — lightweight hover/focus tooltip.
 *
 * Wraps any single child element and shows a tooltip label on hover or
 * keyboard focus. Uses a portal-free approach (absolute positioning within
 * a relative container) to avoid z-index conflicts in most layouts.
 *
 * @example
 * <Tooltip text="Gold tier datasets are analysis-ready">
 *   <TierBadge tier="gold" />
 * </Tooltip>
 */
export interface TooltipProps {
  /** The tooltip text to display. */
  text: string;
  /**
   * Preferred placement of the tooltip relative to the trigger.
   * @default "top"
   */
  placement?: "top" | "bottom" | "left" | "right";
  /** The element that triggers the tooltip. Must be a single React element. */
  children: React.ReactElement;
}

export function Tooltip({ text, placement = "top", children }: TooltipProps): React.ReactElement {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Hide on Escape
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setVisible(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible]);

  const placementClasses: Record<NonNullable<TooltipProps["placement"]>, string> = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left:   "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right:  "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <span
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocusCapture={() => setVisible(true)}
      onBlurCapture={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={[
            "absolute z-50 whitespace-nowrap",
            "bg-odm-ink text-white font-sans text-xs font-medium",
            "px-2.5 py-1 pointer-events-none",
            "shadow-lg",
            placementClasses[placement],
          ].join(" ")}
        >
          {text}
        </span>
      )}
    </span>
  );
}
