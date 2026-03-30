import React from "react";
import { Tooltip } from "../primitives/Tooltip.tsx";
import { TIER_COLORS, TIER_DESCRIPTIONS, type Tier } from "../../tokens.ts";

/**
 * TierBadge — medallion tier indicator for datasets and distributions.
 *
 * Displays the bronze / silver / gold classification tier of a data asset.
 * Tier colours are defined in tokens.ts and must stay in sync with
 * tailwind.config.ts. Composes Tooltip to surface tier definitions on hover.
 *
 * OdM medallion convention:
 * - Bronze — raw ingestion layer (lux-gold colour)
 * - Silver — cleaned and validated (lux-silver colour)
 * - Gold   — analysis-ready (lux-red — OdM brand colour, highest prestige)
 *
 * @example
 * <TierBadge tier="gold" />
 * <TierBadge tier="silver" tooltipText="Custom tooltip override" />
 */
export interface TierBadgeProps {
  /** The medallion tier to display. Determines colour and label. */
  tier: Tier;
  /**
   * Optional override for the tooltip description.
   * Defaults to the canonical tier definition from tokens.ts.
   */
  tooltipText?: string;
  /** Additional CSS classes on the badge span. */
  className?: string;
}

const TIER_LABELS: Record<Tier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold:   "Gold",
};

// Background tints (15% opacity approximation using hex alpha)
const TIER_BG: Record<Tier, string> = {
  bronze: "bg-[#9A815026]",
  silver: "bg-[#8E909126]",
  gold:   "bg-lux-red-20",
};

export function TierBadge({ tier, tooltipText, className = "" }: TierBadgeProps): React.ReactElement {
  const label = TIER_LABELS[tier];
  const tooltip = tooltipText ?? TIER_DESCRIPTIONS[tier];

  return (
    <Tooltip text={tooltip}>
      <span
        aria-label={`Tier: ${label}`}
        className={[
          "inline-block font-sans text-[11px] font-bold tracking-[0.06em] uppercase",
          "px-2 py-0.5 leading-4 whitespace-nowrap cursor-default",
          TIER_BG[tier],
          className,
        ].join(" ")}
        style={{ color: TIER_COLORS[tier] }}
      >
        {label}
      </span>
    </Tooltip>
  );
}
