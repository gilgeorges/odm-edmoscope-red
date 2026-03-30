import React from "react";

/**
 * TopBar — application top bar with logo area, action slot, and brand accent border.
 *
 * Renders a white bar with a 3px lux-red bottom border. The left slot holds
 * the logo/wordmark; the right slot holds actions (search, user chip, etc.).
 *
 * @example
 * <TopBar
 *   logo={<IDMLogo />}
 *   actions={
 *     <>
 *       <GlobalSearch datasets={datasets} onNavigate={nav} />
 *       <UserChip name="Julie Schmit" />
 *     </>
 *   }
 * />
 */
export interface TopBarProps {
  /** Left-side logo/wordmark block. */
  logo: React.ReactNode;
  /** Right-side action controls (search, user chip, notifications, etc.). */
  actions?: React.ReactNode;
}

export function TopBar({ logo, actions }: TopBarProps): React.ReactElement {
  return (
    <div className="bg-white px-7 py-3 flex items-center justify-between border-b-[3px] border-b-lux-red">
      <div className="flex-shrink-0">{logo}</div>
      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   IDMLogo — Luxembourg Lion + Institut du développement municipal wordmark.

   Renders the inline SVG heraldic lion alongside the three-line government
   identity text block. No external assets required — fully self-contained.
───────────────────────────────────────────────────────────────────────────── */

/**
 * IDMLogo — Official IDM / OdM logo block.
 *
 * Renders the Luxembourg heraldic lion SVG alongside the government identity
 * text. Self-contained, no external assets.
 *
 * @example
 * <IDMLogo />
 * <IDMLogo compact />
 */
export interface IDMLogoProps {
  /**
   * Compact mode reduces the logo size for use in smaller spaces.
   * @default false
   */
  compact?: boolean;
}

export function IDMLogo({ compact = false }: IDMLogoProps): React.ReactElement {
  const h = compact ? 34 : 44;
  const w = Math.round(h * 0.62);

  return (
    <div className={["flex items-center flex-shrink-0", compact ? "gap-2.5" : "gap-4"].join(" ")}>
      <LuxLion height={h} variant="dark" />
      <div className="w-px self-stretch bg-lux-gray/25 flex-shrink-0" />
      <div className="leading-none">
        <div
          className={[
            "font-sans font-bold tracking-[0.14em] uppercase text-lux-gray/70",
            compact ? "text-[7px]" : "text-[8.5px]",
            "mb-0.5",
          ].join(" ")}
        >
          Le Gouvernement du Grand-Duché de Luxembourg
        </div>
        <div
          className={[
            "font-sans font-semibold text-lux-red tracking-[0.01em]",
            compact ? "text-[11px]" : "text-[13px]",
            "mb-0.5",
          ].join(" ")}
        >
          Institut du développement municipal
        </div>
        <div
          className={[
            "font-sans text-lux-gray tracking-[0.01em]",
            compact ? "text-[9px]" : "text-[11px]",
          ].join(" ")}
        >
          Observatoire de la mobilité
        </div>
      </div>
    </div>
  );
}

/**
 * LuxLion — Inline SVG of the Luxembourg heraldic lion.
 *
 * @example
 * <LuxLion height={44} variant="dark" />
 * <LuxLion height={18} variant="light" />  // for dark backgrounds
 */
export interface LuxLionProps {
  /** Height in pixels. Width is derived automatically. */
  height?: number;
  /**
   * Colour variant.
   * - `dark`  — lux-red lion on white/light background
   * - `light` — translucent white lion for dark backgrounds (footer)
   */
  variant?: "dark" | "light";
}

export function LuxLion({ height = 44, variant = "dark" }: LuxLionProps): React.ReactElement {
  const lion  = variant === "light" ? "rgba(255,255,255,0.55)" : "#C7001E";
  const crown = variant === "light" ? "rgba(255,255,255,0.35)" : "#B8860B";
  const w = Math.round(height * 0.62);

  return (
    <svg width={w} height={height} viewBox="0 0 62 100" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-label="Luxembourg Lion">
      <rect x="10" y="0" width="8" height="12" rx="1" fill={crown}/>
      <rect x="27" y="0" width="8" height="16" rx="1" fill={crown}/>
      <rect x="44" y="0" width="8" height="12" rx="1" fill={crown}/>
      <rect x="6"  y="11" width="50" height="6" rx="2" fill={crown}/>
      <ellipse cx="38" cy="30" rx="16" ry="14" fill={lion}/>
      <ellipse cx="26" cy="34" rx="12" ry="10" fill={lion}/>
      <path d="M18 42 Q10 52 12 68 Q14 80 22 86 Q30 92 36 88 Q44 84 46 72 Q50 58 44 46 Q38 36 28 38 Z" fill={lion}/>
      <path d="M40 44 Q54 38 58 46 Q62 54 54 58 Q48 60 44 54 Z" fill={lion}/>
      <path d="M14 72 Q8  80 10 90 Q12 98 20 98 Q26 98 26 90 Q26 82 20 76 Z" fill={lion}/>
      <path d="M34 76 Q30 84 32 92 Q34 100 42 98 Q48 96 46 88 Q44 80 38 76 Z" fill={lion}/>
      <path d="M46 70 Q58 64 60 54 Q62 46 56 44" stroke={lion} strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="56" cy="42" r="4" fill={lion}/>
      <circle cx="42" cy="27" r="2.5" fill={variant === "light" ? "rgba(255,255,255,0.9)" : "#ffffff"}/>
      <path d="M50 34 Q54 38 52 42 Q50 46 48 42 Q46 38 50 34 Z" fill={variant === "light" ? "rgba(255,200,200,0.6)" : "#C0392B"}/>
      <path d="M54 57 L52 63 M57 55 L56 61 M60 53 L60 59" stroke={lion} strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 96 L10 100 M16 97 L15 101 M20 97 L20 101" stroke={lion} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M34 96 L32 100 M38 97 L37 101 M42 96 L43 100" stroke={lion} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/**
 * UserChip — compact user identity display (avatar initials + name).
 *
 * @example
 * <UserChip name="Julie Schmit" />
 * <UserChip name="Julie Schmit" showLabel={false} />
 */
export interface UserChipProps {
  /** Full name. First character of each word becomes the avatar initials. */
  name: string;
  /**
   * Whether to show the full name label beside the avatar.
   * @default true
   */
  showLabel?: boolean;
}

export function UserChip({ name, showLabel = true }: UserChipProps): React.ReactElement {
  const initials = name.split(" ").map((n) => n[0] ?? "").join("").slice(0, 2);
  return (
    <div className="flex items-center gap-1.5">
      <div
        aria-hidden="true"
        className={[
          "w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0",
          "bg-odm-surface border border-odm-line",
          "font-sans text-[11px] font-bold text-odm-mid",
        ].join(" ")}
      >
        {initials}
      </div>
      {showLabel && (
        <span className="font-sans text-xs text-odm-muted">{name}</span>
      )}
    </div>
  );
}
