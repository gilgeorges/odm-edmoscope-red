import React from "react";

/**
 * StatCard — large KPI numeral block used in overview / dashboard rows.
 *
 * Displays a headline number and a short uppercase label. The `aria-label`
 * combines both so screen readers announce the full context.
 *
 * @example
 * <StatCard n={42} label="Registered assets" />
 * <StatCard n="99.8%" label="Uptime" borderRight={false} />
 */
export interface StatCardProps {
  /** The primary value to display (number or pre-formatted string). */
  n: string | number;
  /** Short description label shown beneath the numeral. */
  label: string;
  /**
   * Whether to show a right-side divider (for use in a horizontal row).
   * Set to false for the last card in a row.
   * @default true
   */
  borderRight?: boolean;
  /** Additional CSS classes on the container. */
  className?: string;
}

export function StatCard({
  n,
  label,
  borderRight = true,
  className = "",
}: StatCardProps): React.ReactElement {
  return (
    <div
      aria-label={`${label}: ${n}`}
      className={[
        "py-4 pr-7 mr-7",
        borderRight ? "border-r border-r-odm-line-l" : "",
        className,
      ].join(" ")}
    >
      <div aria-hidden="true" className="font-sans text-[38px] font-bold text-odm-ink leading-none tracking-[-0.03em] tabular-nums mb-1.5">
        {n}
      </div>
      <div aria-hidden="true" className="font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-odm-muted">
        {label}
      </div>
    </div>
  );
}

/**
 * StatRow — horizontal row of StatCards from an array of `{ n, label }` objects.
 *
 * @example
 * <StatRow stats={[
 *   { n: 42,    label: "Registered assets" },
 *   { n: "8",  label: "Data sources" },
 *   { n: "99.8%", label: "Uptime" },
 * ]} />
 */
export interface StatRowProps {
  /** Array of stat objects. Last item has no right border. */
  stats: Array<{ n: string | number; label: string }>;
  /** Additional CSS classes on the row container. */
  className?: string;
}

export function StatRow({ stats, className = "" }: StatRowProps): React.ReactElement {
  return (
    <div className={["flex flex-wrap pb-1 border-b border-odm-line mb-8", className].join(" ")}>
      {stats.map((s, i) => (
        <StatCard
          key={i}
          n={s.n}
          label={s.label}
          borderRight={i < stats.length - 1}
        />
      ))}
    </div>
  );
}
