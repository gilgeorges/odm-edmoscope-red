import React from "react";

/**
 * Heading — semantic heading element with consistent typography scale.
 *
 * Renders the appropriate `<h1>`–`<h4>` element while applying the design
 * system's typography tokens. The `level` prop controls the HTML element;
 * `size` optionally overrides the visual size (useful for visual hierarchy
 * independent of document structure).
 *
 * @example
 * <Heading level={1}>Data Assets</Heading>
 * <Heading level={2} size="h3">Overview</Heading>
 */
export interface HeadingProps extends React.ComponentPropsWithoutRef<"h1"> {
  /**
   * The HTML heading level. Determines the rendered element and, by default,
   * the visual size.
   */
  level: 1 | 2 | 3 | 4;
  /**
   * Visual size override. Use when the document structure requires a different
   * heading level than the visual hierarchy suggests.
   */
  size?: "h1" | "h2" | "h3" | "h4";
  /** Heading content. */
  children: React.ReactNode;
}

const SIZE_CLASSES: Record<string, string> = {
  h1: "text-[22px] font-bold tracking-[-0.01em] text-odm-ink",
  h2: "text-[18px] font-bold tracking-[-0.01em] text-odm-ink",
  h3: "text-[15px] font-semibold text-odm-ink",
  h4: "text-[13px] font-semibold text-odm-soft",
};

export function Heading({
  level,
  size,
  children,
  className = "",
  ...rest
}: HeadingProps): React.ReactElement {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
  const sizeKey = size ?? `h${level}`;

  return (
    <Tag
      {...rest}
      className={[
        "font-sans leading-tight m-0",
        SIZE_CLASSES[sizeKey] ?? SIZE_CLASSES["h2"],
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}

/**
 * Eyebrow — ALL-CAPS section label placed above a heading.
 *
 * Used to categorise content sections (e.g. "Datasets", "Provenance").
 * Never use as a standalone heading — it should always accompany a Heading.
 *
 * @example
 * <Eyebrow>Data Assets</Eyebrow>
 * <Heading level={2}>Overview</Heading>
 */
export interface EyebrowProps extends React.ComponentPropsWithoutRef<"div"> {
  /** The eyebrow text. Should be short (1–3 words). */
  children: React.ReactNode;
}

export function Eyebrow({ children, className = "", ...rest }: EyebrowProps): React.ReactElement {
  return (
    <div
      {...rest}
      className={[
        "font-sans text-[11px] font-bold tracking-[0.12em] uppercase",
        "text-odm-muted mb-1.5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
