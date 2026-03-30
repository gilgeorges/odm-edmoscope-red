/**
 * EDMoScope design tokens.
 *
 * These constants are the single source of truth for brand colours used in
 * JavaScript logic (chart series, dynamic class generation, etc.).
 *
 * IMPORTANT CONTRACT: every value here must match the corresponding entry in
 * tailwind.config.ts. When updating a colour, update both files simultaneously.
 * The Tailwind config uses `lux-*` / `odm-*` keys; this file uses camelCase.
 *
 * @example
 * // In a Recharts series:
 * <Line stroke={COLORS.luxRed} />
 *
 * // In a TierBadge:
 * const borderColor = TIER_COLORS[tier];
 */

// ── Brand colours ──────────────────────────────────────────────────────────

/** Luxembourg government identity — Pantone Red 485 (OdM brand) */
export const COLORS = {
  luxRed:      "#C7001E",
  luxRed60:    "#DF6678",
  luxRed20:    "#F4D0D5",
  luxGray:     "#5A5A59",
  luxGray60:   "#A3A3A2",
  luxGray20:   "#DEDEDE",
  /** Digital approximation of metallic Pantone special — used for bronze tier */
  luxGold:     "#9A8150",
  luxGold50:   "#CCC0A7",
  /** Digital approximation of metallic Pantone special — used for silver tier */
  luxSilver:   "#8E9091",
  luxSilver50: "#C6C8C8",
} as const;

// ── Medallion tier colours ─────────────────────────────────────────────────

/**
 * Tier colours for TierBadge and chart series.
 * OdM convention: gold tier uses brand red (highest prestige).
 */
export const TIER_COLORS = {
  bronze: COLORS.luxGold,
  silver: COLORS.luxSilver,
  gold:   COLORS.luxRed,  // OdM convention: gold tier uses brand red
} as const;

// ── Surface & typography colours ───────────────────────────────────────────

/** Page/surface/ink colours for use in JS logic (e.g. canvas rendering) */
export const SURFACE = {
  page:    "#EFEFED",
  white:   "#FFFFFF",
  card:    "#FAFAF8",
  surface: "#E8E8E5",
  ink:     "#1A1A1A",
  soft:    "#383838",
  mid:     "#606060",
  muted:   "#909090",
  faint:   "#C0C0BC",
  line:    "#D0D0CC",
  lineL:   "#E4E4E0",
  lineH:   "#909088",
} as const;

// ── Semantic colours ───────────────────────────────────────────────────────

export const SEMANTIC = {
  ok:      "#1E5C32",
  okBg:    "#EDF5F0",
  okBd:    "#8ABAA0",
  warn:    "#6B4800",
  warnBg:  "#F8F3E8",
  warnBd:  "#C8A84C",
  bad:     "#6B1C10",
  badBg:   "#F5EDEB",
  badBd:   "#C09088",
  info:    "#1A4A7A",
  infoBg:  "#EEF2FA",
  infoBd:  "#B0C4E8",
} as const;

// ── Tier definitions (for tooltips / documentation) ────────────────────────

export const TIER_DESCRIPTIONS = {
  bronze: "Bronze — raw ingestion layer; data as received from the source, unprocessed.",
  silver: "Silver — cleaned and validated; joins and transformations applied.",
  gold:   "Gold — analysis-ready; aggregated, enriched, and fit for reporting.",
} as const;

export type Tier = keyof typeof TIER_COLORS;
