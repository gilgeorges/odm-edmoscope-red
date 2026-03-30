import type { Config } from "tailwindcss";

/**
 * EDMoScope Tailwind configuration.
 *
 * Extends (does NOT replace) the default Tailwind palette with Luxembourg
 * government identity colours and the Montserrat brand typeface.
 *
 * IMPORTANT: All `lux-*` colour values here must match the constants in
 * tokens.ts exactly. When updating a colour, update both files.
 */
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./catalogue/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Luxembourg government identity — Pantone Red 485 (OdM brand) ──
        "lux-red":       "#C7001E",
        "lux-red-60":    "#DF6678",
        "lux-red-20":    "#F4D0D5",
        // ── Luxembourg government identity — Pantone Cool Gray 11 ──
        "lux-gray":      "#5A5A59",
        "lux-gray-60":   "#A3A3A2",
        "lux-gray-20":   "#DEDEDE",
        // ── Alternative colours — digital approximations of metallic Pantone specials ──
        "lux-gold":      "#9A8150",
        "lux-gold-50":   "#CCC0A7",
        "lux-silver":    "#8E9091",
        "lux-silver-50": "#C6C8C8",
        // ── Semantic / surface colours (keep in sync with tokens.ts) ──
        "odm-page":      "#EFEFED",
        "odm-card":      "#FAFAF8",
        "odm-surface":   "#E8E8E5",
        "odm-line":      "#D0D0CC",
        "odm-line-l":    "#E4E4E0",
        "odm-line-h":    "#909088",
        "odm-ink":       "#1A1A1A",
        "odm-soft":      "#383838",
        "odm-mid":       "#606060",
        "odm-muted":     "#909090",
        "odm-faint":     "#C0C0BC",
        // Semantic — ok (green)
        "odm-ok":        "#1E5C32",
        "odm-ok-bg":     "#EDF5F0",
        "odm-ok-bd":     "#8ABAA0",
        // Semantic — warn (amber)
        "odm-warn":      "#6B4800",
        "odm-warn-bg":   "#F8F3E8",
        "odm-warn-bd":   "#C8A84C",
        // Semantic — bad (red)
        "odm-bad":       "#6B1C10",
        "odm-bad-bg":    "#F5EDEB",
        "odm-bad-bd":    "#C09088",
        // Semantic — info (blue)
        "odm-info":      "#1A4A7A",
        "odm-info-bg":   "#EEF2FA",
        "odm-info-bd":   "#B0C4E8",
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        mono: ["SF Mono", "Fira Code", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
