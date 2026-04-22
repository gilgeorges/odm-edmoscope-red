import React from "react";

/**
 * CodeBlock size variant — controls font size and padding.
 */
export type CodeBlockSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<CodeBlockSize, string> = {
  sm: "text-[11px] px-3 py-2",
  md: "text-[12px] px-4 py-3",
  lg: "text-[13px] px-5 py-4",
};

/**
 * CodeBlockProps — props for the {@link CodeBlock} component.
 */
export interface CodeBlockProps {
  /**
   * The code or text content to display.
   * Rendered verbatim inside a `<code>` element (whitespace preserved).
   */
  children: string;

  /**
   * Optional language label displayed in the top-right corner of the block
   * (e.g. "SQL", "S3 URI", "JSON"). Purely decorative — no syntax colouring.
   */
  language?: string;

  /**
   * Size variant controlling font size and padding.
   * @default "md"
   */
  size?: CodeBlockSize;

  /**
   * When true the content does not wrap and overflows horizontally with a
   * scrollbar. When false the content wraps to multiple lines.
   * @default false
   */
  nowrap?: boolean;

  /** Additional CSS classes on the root `<pre>` element. */
  className?: string;
}

/**
 * CodeBlock — dark-background monospace display for code, URIs, and snippets.
 *
 * Renders content on the standard dark surface (`bg-odm-ink`) with
 * muted white text. Optionally shows a language label in the top-right corner.
 *
 * @example
 * // S3 URI identifier block
 * <CodeBlock language="S3 URI">
 *   s3://odm-silver/traffic/comptages-national/
 * </CodeBlock>
 *
 * @example
 * // Multiline SQL snippet
 * <CodeBlock language="SQL" nowrap>
 *   SELECT sensor_id, AVG(avg_speed_kmh) FROM comptages_national GROUP BY 1;
 * </CodeBlock>
 */
export function CodeBlock({
  children,
  language,
  size = "md",
  nowrap = false,
  className = "",
}: CodeBlockProps): React.ReactElement {
  return (
    <pre
      className={[
        "bg-odm-ink font-mono leading-[1.6] text-white/70 m-0",
        "relative",
        nowrap ? "overflow-x-auto whitespace-pre" : "whitespace-pre-wrap break-all",
        SIZE_CLASSES[size],
        className,
      ].join(" ")}
    >
      {language && (
        <span
          aria-hidden="true"
          className="absolute top-2 right-3 font-sans text-[10px] font-bold tracking-[0.08em] uppercase text-white/30 select-none"
        >
          {language}
        </span>
      )}
      <code className="font-mono">{children.trim()}</code>
    </pre>
  );
}
