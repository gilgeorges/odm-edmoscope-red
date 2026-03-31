import React from "react";

/** Visual variant of the notice, mapping to semantic colour. */
type NoticeVariant = "info" | "warning" | "danger" | "ok";

const VARIANT_CLASSES: Record<
  NoticeVariant,
  { border: string; title: string; text: string }
> = {
  info:    { border: "border-l-odm-line-h", title: "text-odm-mid",  text: "text-odm-soft" },
  warning: { border: "border-l-odm-warn-bd", title: "text-odm-warn", text: "text-odm-soft" },
  danger:  { border: "border-l-odm-bad-bd",  title: "text-odm-bad",  text: "text-odm-soft" },
  ok:      { border: "border-l-odm-ok-bd",   title: "text-odm-ok",   text: "text-odm-soft" },
};

/**
 * NoticeProps — props for the Notice component.
 */
export interface NoticeProps {
  /**
   * Visual variant that controls the left-border and title colour.
   * @default "info"
   */
  variant?: NoticeVariant;
  /**
   * Optional bold title shown above the body text.
   * Coloured according to the variant.
   */
  title?: string;
  /** Body content of the notice. May be a string or inline JSX. */
  children: React.ReactNode;
  /** Additional CSS classes on the root element. */
  className?: string;
}

/**
 * Notice — inline left-border callout block.
 *
 * Use for in-page alerts, warnings, and status messages that live in the
 * document flow (as opposed to Toast, which is ephemeral and fixed-position).
 *
 * Variants: `info` (default) · `warning` · `danger` · `ok`
 *
 * @example
 * <Notice variant="warning" title="Schema not defined">
 *   No CSVW schema has been registered for this asset.
 * </Notice>
 *
 * @example
 * <Notice variant="danger">
 *   3 sources have not been refreshed in over 30 days.
 * </Notice>
 */
export function Notice({
  variant = "info",
  title,
  children,
  className = "",
}: NoticeProps): React.ReactElement {
  const v = VARIANT_CLASSES[variant];
  return (
    <div
      role="note"
      className={[
        "border-l-[3px] pl-3.5 mb-5",
        v.border,
        className,
      ].join(" ")}
    >
      {title && (
        <div
          className={[
            "font-sans text-[13px] font-semibold mb-0.5",
            v.title,
          ].join(" ")}
        >
          {title}
        </div>
      )}
      <div className={["font-sans text-[13px] leading-relaxed", v.text].join(" ")}>
        {children}
      </div>
    </div>
  );
}
