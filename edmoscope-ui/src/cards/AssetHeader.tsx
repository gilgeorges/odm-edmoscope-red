import React from "react";

/**
 * Status variant for the AssetHeader status badge.
 * Controls the badge's text and border colour on the dark background.
 */
export type AssetStatus = "active" | "draft" | "archived" | "deprecated";

const STATUS_LABEL: Record<AssetStatus, string> = {
  active:     "Actif",
  draft:      "Brouillon",
  archived:   "Archivé",
  deprecated: "Déprécié",
};

const STATUS_CLASSES: Record<AssetStatus, string> = {
  active:     "border-odm-ok-bd text-odm-ok-bd",
  draft:      "border-odm-warn-bd text-odm-warn-bd",
  archived:   "border-white/30 text-white/50",
  deprecated: "border-odm-bad-bd text-odm-bad-bd",
};

/**
 * AssetHeaderProps — props for the {@link AssetHeader} component.
 */
export interface AssetHeaderProps {
  /**
   * Icon displayed inside the dark icon box on the left.
   * Accepts any React node — typically a small SVG or Unicode character.
   */
  icon: React.ReactNode;

  /** Primary asset title (dataset, query, actor name). */
  title: string;

  /**
   * Secondary identifier shown below the title in monospace — typically
   * an S3 URI, table name, or stable slug.
   */
  subtitle?: string;

  /**
   * Lifecycle status of the asset. Drives the badge label and colour.
   * @default "active"
   */
  status?: AssetStatus;

  /**
   * Label for the primary action button rendered on the right.
   * When omitted the button is not rendered.
   */
  actionLabel?: string;

  /**
   * Icon rendered inside the action button (left of label).
   * Accepts any React node.
   */
  actionIcon?: React.ReactNode;

  /** Click handler for the primary action button. */
  onAction?: () => void;

  /** Additional CSS classes on the root element. */
  className?: string;
}

/**
 * AssetHeader — dark-background dataset / query / actor identity block.
 *
 * Used as the top section of an asset detail page. Displays a category icon
 * in a dark icon box, the asset title, an optional stable identifier subtitle,
 * a lifecycle status badge, and a primary action button.
 *
 * @example
 * <AssetHeader
 *   icon={<DatabaseIcon />}
 *   title="Comptages de trafic routier — réseau national"
 *   subtitle="s3://odm-silver/traffic/comptages-national/"
 *   status="active"
 *   actionLabel="Explorer"
 *   actionIcon={<ExploreIcon />}
 *   onAction={() => navigate("/explore")}
 * />
 */
export function AssetHeader({
  icon,
  title,
  subtitle,
  status = "active",
  actionLabel,
  actionIcon,
  onAction,
  className = "",
}: AssetHeaderProps): React.ReactElement {
  return (
    <div
      className={[
        "bg-odm-ink px-5 py-4 flex items-start gap-4",
        className,
      ].join(" ")}
    >
      {/* Icon box */}
      <div
        aria-hidden="true"
        className="shrink-0 w-11 h-11 flex items-center justify-center bg-white/10 text-white text-xl"
      >
        {icon}
      </div>

      {/* Title + subtitle */}
      <div className="flex-1 min-w-0">
        <h1 className="font-sans text-[18px] font-bold text-white leading-tight tracking-[-0.01em] mb-0.5">
          {title}
        </h1>
        {subtitle && (
          <p className="font-mono text-[11px] text-white/50 leading-none mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Status badge + action */}
      <div className="flex items-center gap-3 shrink-0 pt-0.5">
        {status && (
          <span
            className={[
              "font-sans text-[11px] font-bold tracking-[0.08em] uppercase",
              "px-1.5 py-0.5 border",
              STATUS_CLASSES[status],
            ].join(" ")}
          >
            {STATUS_LABEL[status]}
          </span>
        )}
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className={[
              "inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold",
              "px-3.5 py-2 bg-odm-info text-white",
              "hover:bg-[#1E5A92] transition-colors duration-100",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-white",
            ].join(" ")}
          >
            {actionIcon && <span aria-hidden="true" className="leading-none">{actionIcon}</span>}
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
