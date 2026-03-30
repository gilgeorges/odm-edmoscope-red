/**
 * ODM Component Library
 * Institut du développement municipal — Observatoire de la mobilité
 *
 * Design system extracted from the Data Catalogue reference implementation.
 * All components share a single token layer (TOKENS) and are fully self-contained.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EXPORTS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * TOKENS        — Design constants (colours, type, spacing)
 *
 * SHELL
 *   AppShell    — Root layout: sticky header + nav + main + footer + drawer slot
 *   TopBar      — Logo bar with search, user chip and right-slot actions
 *   NavBar      — Horizontal nav strip (dark bar, LU.red active underline)
 *   PageFooter  — Dark footer with legal copy and tech stack note
 *
 * LAYOUT
 *   PageContainer   — Max-width centred content wrapper
 *   MasterDetailShell — Router-ready two-column shell (list + <Outlet /> slot)
 *   SplitLayout       — Filter sidebar + results column
 *   StackPanel        — Vertical card stack with optional sticky header
 *   ScrollArea        — Overflow container with hidden scrollbar
 *
 * PANELS
 *   ContentPanel    — White surface with optional left-border accent
 *   SectionPanel    — Eyebrow + title + children grouping
 *   StatusPanel     — Coloured notice strip (ok / warn / danger / info)
 *   DrawerPanel     — Bottom-anchored sliding drawer (3 height states)
 *
 * PRIMITIVES — Cards
 *   EntryCard       — Registry-style list item with thread, status dot, left border
 *   StatCard        — Large KPI numeral + label (the "Stat" from Overview)
 *   MetaRow         — Label / value pair, read-only or editable
 *   ProvenanceCard  — Origin / reuse card with multi-column panels
 *
 * PRIMITIVES — Labels & Badges
 *   TypeBadge       — Coloured uppercase asset-type pill
 *   StateBadge      — Border+bg state pill (draft/saved/archived/implemented)
 *   FreshnessDot    — Coloured dot + optional label (current/ageing/outdated)
 *   InlineTag       — Minimal ok/warn/neutral tag
 *   BucketBadge     — S3 bucket tier badge (bronze/silver/gold/outputs)
 *
 * PRIMITIVES — Editable
 *   EditableLabel   — Click-to-edit single line (input or textarea)
 *   EditableSelect  — Click-to-edit dropdown
 *   FieldGroup      — Label + input + optional error wrapper
 *   FormActions     — Edit / Save / Cancel button row
 *
 * PRIMITIVES — Navigation
 *   Tabs            — Underline tab bar
 *   TypeFilter      — Asset-type quick-filter strip
 *   Breadcrumb      — Back link + id + title chain
 *
 * PRIMITIVES — Search
 *   SearchBar       — Trigger button that opens GlobalSearchModal
 *   GlobalSearchModal — Full overlay search with grouped results
 *   DatasetSearchWidget — Inline multi-select dataset picker
 *
 * PRIMITIVES — Data display
 *   SchemaTable     — Column definition table
 *   ActivityEntry   — PROV-O event row in a timeline
 *   Eyebrow         — ALL-CAPS section label
 *   PageTitle       — Section + h1 + subtitle + right-slot
 *
 * ACCESSIBILITY
 *   All components are semantically marked up:
 *   — Skip-navigation link in AppShell
 *   — <header>, <nav aria-label>, <main id>, <footer>, <aside>, <article>
 *   — NavBar buttons carry aria-current="page"
 *   — EntryCard renders as <article aria-label={title}>
 *   — ActivityEntry/ActivityList render as <li> inside <ol>
 *   — Tabs use role=tablist / role=tab / aria-selected
 *   — Badges carry aria-label; FreshnessDot colour has text equivalent
 *   — GlobalSearch has role=search and aria-live="polite" on results
 *   — WizardShell: role=dialog, aria-modal, aria-labelledby, aria-live body
 *   — DrawerPanel: role=region, aria-expanded
 *   — StatusPanel: role=alert (danger) / role=status (warn)
 *   — StatCard: aria-label="${label}: ${n}", children aria-hidden
 *   — Breadcrumb: <nav><ol><li> with aria-current="page" on last crumb
 *   — SchemaTable has a visually-hidden <caption>
 *
 * FEEDBACK
 *   SqlWorkbench           — SQL editor + results table; lives inside DrawerPanel
 *   FileUploadZone         — Multi-file upload with progress, abort, remove, retry
 *   AppProviders           — Composes all providers; place once at app root
 *   ToastProvider          — Toast context (used inside AppProviders)
 *   useToast               — Hook: toast.error/success/warn/info/dismiss
 *   ErrorBoundary          — Class component; compact or full-page fallback
 *
 * WIZARDS
 *   WizardShell            — Shared modal frame (header, step bar, footer)
 *   WizardProgressBar      — Step progress strip
 *   RegisterAssetWizard    — Declare a new data asset (4 steps)
 *   AddDistributionWizard  — Add a DCAT distribution to a dataset (3 steps)
 *   AddPersonWizard        — Register a new actor / contact (2 steps)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DEMO
 *   default export  — Interactive showcase of every component
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";

/* ── Google Fonts: Montserrat ─────────────────────────────────────────────── */
const _montserratLink = (() => {
  if (typeof document === "undefined") return null;
  const id = "odm-montserrat-font";
  if (document.getElementById(id)) return null;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(link);
  return link;
})();

/* ══════════════════════════════════════════════════════════════════════════════
   TOKENS
══════════════════════════════════════════════════════════════════════════════ */

export const TOKENS = {
  /* Brand */
  lu: { red: "#EF3340", gray: "#54565A" },

  /* Surfaces */
  page:    "#EFEFED",
  white:   "#FFFFFF",
  card:    "#FAFAF8",
  surface: "#E8E8E5",

  /* Type */
  header:  "#1A1A1A",
  ink:     "#1A1A1A",
  soft:    "#383838",
  mid:     "#606060",
  muted:   "#909090",
  faint:   "#C0C0BC",

  /* Borders */
  line:    "#D0D0CC",
  lineL:   "#E4E4E0",
  lineH:   "#909088",

  /* Semantic — ok */
  ok:    "#1E5C32",
  okBg:  "#EDF5F0",
  okBd:  "#8ABAA0",

  /* Semantic — warn */
  warn:   "#6B4800",
  warnBg: "#F8F3E8",
  warnBd: "#C8A84C",

  /* Semantic — bad */
  bad:    "#6B1C10",
  badBg:  "#F5EDEB",
  badBd:  "#C09088",

  /* Semantic — info (blue) */
  info:   "#1A4A7A",
  infoBg: "#EEF2FA",
  infoBd: "#B0C4E8",

  /* Typography — Montserrat replaces Calibri throughout */
  font: `"Montserrat", "Segoe UI", system-ui, -apple-system, sans-serif`,
  mono: `"SF Mono", "Fira Code", "Courier New", monospace`,

  /* Spacing scale */
  sp: { xs: 4, sm: 8, md: 16, lg: 24, xl: 36, xxl: 56 },
};

const T = TOKENS;
const font = T.font;
const mono = T.mono;

/* ══════════════════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════════════════ */

/** Merge inline style objects — rightmost wins */
const sx = (...styles) => Object.assign({}, ...styles.filter(Boolean));

/** Freshness config from days-since-last-received */
export const freshnessCfg = (days) =>
  days <= 7  ? { label: "Current",  c: T.ok,   bg: T.okBg,   bd: T.okBd   } :
  days <= 30 ? { label: "Ageing",   c: T.warn,  bg: T.warnBg, bd: T.warnBd } :
               { label: "Outdated", c: T.bad,   bg: T.badBg,  bd: T.badBd  };

/* ══════════════════════════════════════════════════════════════════════════════
   SHELL — AppShell
   ─────────────────────────────────────────────────────────────────────────────
   Props:
     topBar        ReactNode   — TopBar component
     navBar        ReactNode   — NavBar component
     footer        ReactNode   — PageFooter component
     drawer        ReactNode   — DrawerPanel (absolute, bottom-anchored)
     drawerHeight  number      — px height of open drawer (for main padding)
     children      ReactNode   — page content
══════════════════════════════════════════════════════════════════════════════ */

export function AppShell({ topBar, navBar, footer, drawer, drawerHeight = 36, children }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: T.page,
      color: T.ink,
      fontFamily: font,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Skip navigation — visible on focus for keyboard users */}
      <a href="#main-content" style={{
        position: "absolute", top: -40, left: 0, zIndex: 9999,
        background: T.lu.red, color: T.white,
        fontFamily: font, fontSize: 13, fontWeight: 600,
        padding: "8px 16px", textDecoration: "none",
        transition: "top 0.1s",
      }}
        onFocus={e => { e.currentTarget.style.top = "0"; }}
        onBlur={e => { e.currentTarget.style.top = "-40px"; }}
      >
        Skip to main content
      </a>

      {/* Sticky header block */}
      <header style={{ position: "sticky", top: 0, zIndex: 100 }}>
        {topBar}
        {navBar}
      </header>

      {/* Page content */}
      <main id="main-content" aria-label="Page content" style={{
        flex: 1,
        paddingBottom: drawerHeight + 24,
      }}>
        {children}
      </main>

      {footer}
      {drawer}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SHELL — TopBar
   ─────────────────────────────────────────────────────────────────────────────
   Props:
     logo          ReactNode   — Left logo / wordmark block
     actions       ReactNode   — Right-side controls (search, user chip, etc.)
     mobile        boolean
══════════════════════════════════════════════════════════════════════════════ */

export function TopBar({ logo, actions, mobile }) {
  return (
    <div style={{
      background: T.white,
      padding: mobile ? "10px 16px" : "12px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `3px solid ${T.lu.red}`,
    }}>
      {logo}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {actions}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SHELL — IDM Logo Block  (opinionated, matches the reference)
══════════════════════════════════════════════════════════════════════════════ */

/* ── Luxembourg Heraldic Lion SVG ────────────────────────────────────────────
   Inline vector — renders in any sandbox, no CDN dependency.
   color prop: "dark" (LU.red on white bg) | "light" (white/transparent for footer)
──────────────────────────────────────────────────────────────────────────── */
function LuxLion({ height = 44, color = "dark" }) {
  const lion  = color === "light" ? "rgba(255,255,255,0.55)" : T.lu.red;
  const crown = color === "light" ? "rgba(255,255,255,0.35)" : "#B8860B";
  const w = Math.round(height * 0.62);
  return (
    <svg width={w} height={height} viewBox="0 0 62 100" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-label="Luxembourg Lion">
      {/* Crown */}
      <rect x="10" y="0" width="8" height="12" rx="1" fill={crown}/>
      <rect x="27" y="0" width="8" height="16" rx="1" fill={crown}/>
      <rect x="44" y="0" width="8" height="12" rx="1" fill={crown}/>
      <rect x="6"  y="11" width="50" height="6" rx="2" fill={crown}/>
      {/* Head */}
      <ellipse cx="38" cy="30" rx="16" ry="14" fill={lion}/>
      {/* Mane / ruff */}
      <ellipse cx="26" cy="34" rx="12" ry="10" fill={lion}/>
      {/* Body */}
      <path d="M18 42 Q10 52 12 68 Q14 80 22 86 Q30 92 36 88 Q44 84 46 72 Q50 58 44 46 Q38 36 28 38 Z" fill={lion}/>
      {/* Raised foreleg */}
      <path d="M40 44 Q54 38 58 46 Q62 54 54 58 Q48 60 44 54 Z" fill={lion}/>
      {/* Hind legs */}
      <path d="M14 72 Q8  80 10 90 Q12 98 20 98 Q26 98 26 90 Q26 82 20 76 Z" fill={lion}/>
      <path d="M34 76 Q30 84 32 92 Q34 100 42 98 Q48 96 46 88 Q44 80 38 76 Z" fill={lion}/>
      {/* Tail — curling up */}
      <path d="M46 70 Q58 64 60 54 Q62 46 56 44" stroke={lion} strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="56" cy="42" r="4" fill={lion}/>
      {/* Eye */}
      <circle cx="42" cy="27" r="2.5" fill={color === "light" ? "rgba(255,255,255,0.9)" : T.white}/>
      {/* Tongue */}
      <path d="M50 34 Q54 38 52 42 Q50 46 48 42 Q46 38 50 34 Z" fill={color === "light" ? "rgba(255,200,200,0.6)" : "#C0392B"}/>
      {/* Claws on raised paw */}
      <path d="M54 57 L52 63 M57 55 L56 61 M60 53 L60 59" stroke={lion} strokeWidth="2" strokeLinecap="round"/>
      {/* Claws on hind legs */}
      <path d="M12 96 L10 100 M16 97 L15 101 M20 97 L20 101" stroke={lion} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M34 96 L32 100 M38 97 L37 101 M42 96 L43 100" stroke={lion} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IDMLogo({ mobile }) {
  const h = mobile ? 34 : 44;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: mobile ? 10 : 16, flexShrink: 0 }}>
      <LuxLion height={h} color="dark" />
      <div style={{ width: 1, height: mobile ? 34 : 44, background: T.lu.gray + "44", flexShrink: 0 }} />
      <div style={{ lineHeight: 1 }}>
        <div style={{
          fontFamily: font, fontSize: mobile ? 7 : 8.5, fontWeight: 700,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: T.lu.gray, marginBottom: 3, opacity: 0.7,
        }}>
          Le Gouvernement du Grand-Duché de Luxembourg
        </div>
        <div style={{
          fontFamily: font, fontSize: mobile ? 11 : 13, fontWeight: 600,
          color: T.lu.red, marginBottom: 2, letterSpacing: "0.01em",
        }}>
          Institut du développement municipal
        </div>
        <div style={{
          fontFamily: font, fontSize: mobile ? 9 : 11,
          color: T.lu.gray, letterSpacing: "0.01em",
        }}>
          Observatoire de la mobilité
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SHELL — UserChip
   ─────────────────────────────────────────────────────────────────────────────
   Props:  name string, showLabel boolean
══════════════════════════════════════════════════════════════════════════════ */

export function UserChip({ name, showLabel = true }) {
  const initials = name.split(" ").map(n => n[0]).join("");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: T.surface, border: `1px solid ${T.line}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: font, fontSize: 11, fontWeight: 700, color: T.mid,
      }}>
        {initials}
      </div>
      {showLabel && (
        <span style={{ fontFamily: font, fontSize: 12, color: T.muted }}>{name}</span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SHELL — NavBar
   ─────────────────────────────────────────────────────────────────────────────
   Props:
     items         { id, label, short }[]
     active        string   — active item id
     onSelect      (id) => void
     rightSlot     ReactNode   — e.g. SQL drawer toggle
     mobile        boolean
══════════════════════════════════════════════════════════════════════════════ */

export function NavBar({ items, active, onSelect, rightSlot, mobile }) {
  return (
    <nav aria-label="Primary navigation" style={{ background: T.header }}>
      <div style={{
        maxWidth: 1036,
        margin: "0 auto",
        padding: mobile ? "0 8px" : "0 28px",
        display: "flex",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {items.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
              style={{
              background: "none", border: "none",
              borderBottom: isActive ? `3px solid ${T.lu.red}` : "3px solid transparent",
              color: isActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.38)",
              padding: mobile ? "9px 12px" : "10px 18px",
              cursor: "pointer", fontFamily: font,
              fontSize: mobile ? 11 : 12,
              fontWeight: isActive ? 600 : 400,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap", flexShrink: 0,
              marginBottom: -1,
              transition: "color 0.1s, border-color 0.1s",
            }}>
              {mobile ? item.short : item.label}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        {rightSlot}
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SHELL — PageFooter
   ─────────────────────────────────────────────────────────────────────────────
   Props:  year, org, techNote, extraBottomPad (number, for drawer clearance)
══════════════════════════════════════════════════════════════════════════════ */

export function PageFooter({ year, org, techNote, extraBottomPad = 0, mobile }) {
  return (
    <footer style={{
      background: T.header,
      borderTop: `3px solid ${T.lu.red}`,
      padding: mobile ? "10px 16px" : "12px 28px",
      paddingBottom: extraBottomPad + 12,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LuxLion height={18} color="light" />
        <span style={{
          fontFamily: font, fontSize: 10, fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
        }}>
          © {year} {org}
        </span>
      </div>
      {techNote && (
        <span style={{ fontFamily: font, fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em" }}>
          {techNote}
        </span>
      )}
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LAYOUT — PageContainer
   ─────────────────────────────────────────────────────────────────────────────
   Centred, max-width wrapper for all page content.
   Props:  maxWidth (default 980), mobile, padding, children
══════════════════════════════════════════════════════════════════════════════ */

export function PageContainer({ maxWidth = 980, mobile, padding, children, style }) {
  const defaultPad = mobile ? "20px 16px" : "32px 36px";
  return (
    <div style={sx({
      maxWidth,
      width: "100%",
      boxSizing: "border-box",
      margin: "0 auto",
      padding: padding ?? defaultPad,
    }, style)}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LAYOUT — SplitLayout
   ─────────────────────────────────────────────────────────────────────────────
   Two-column layout. Sidebar collapses on mobile or when open=false.
   Props:
     sidebar       ReactNode
     sidebarWidth  number (px, default 240)
     open          boolean  — show sidebar?
     gap           number
     children      ReactNode  — main content
     mobile        boolean
══════════════════════════════════════════════════════════════════════════════ */

export function SplitLayout({ sidebar, sidebarWidth = 240, open = true, gap = 28, children, mobile }) {
  const showSidebar = open && !mobile;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: showSidebar ? `${sidebarWidth}px 1fr` : "1fr",
      gap,
      alignItems: "start",
    }}>
      {showSidebar && (
        <aside aria-label="Filters" style={{ position: "sticky", top: 20 }}>
          {sidebar}
        </aside>
      )}
      {/* Mobile: inject sidebar above main when open */}
      {mobile && open && <aside aria-label="Filters">{sidebar}</aside>}
      <div>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LAYOUT — StackPanel
   ─────────────────────────────────────────────────────────────────────────────
   Vertical card stack, optionally with a sticky sub-header.
   Props:  header ReactNode, gap number, children
══════════════════════════════════════════════════════════════════════════════ */

export function StackPanel({ header, gap = 6, children, style }) {
  return (
    <div style={sx({ display: "flex", flexDirection: "column" }, style)}>
      {header && (
        <div style={{
          position: "sticky", top: 116, zIndex: 10,
          background: T.page, paddingBottom: 8,
        }}>
          {header}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LAYOUT — ScrollArea
   ─────────────────────────────────────────────────────────────────────────────
   Horizontal or vertical scroll with hidden scrollbar.
══════════════════════════════════════════════════════════════════════════════ */

export function ScrollArea({ horizontal, vertical, maxHeight, style, children }) {
  return (
    <div style={sx({
      overflowX: horizontal ? "auto" : "visible",
      overflowY: vertical  ? "auto" : "visible",
      maxHeight,
      scrollbarWidth: "none",
    }, style)}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LAYOUT — MasterDetailShell
   ─────────────────────────────────────────────────────────────────────────────
   Pure layout shell for the master-detail pattern. Contains NO selection state
   — that belongs to the router (React Router <Outlet />, useParams, etc.).

   INTENDED USAGE WITH REACT ROUTER
   ─────────────────────────────────
   Route tree:
     /datasets            → <DatasetListPage />   (renders shell + list)
     /datasets/:id        → <DatasetDetailPage />  (renders shell + detail)
     /datasets/:id/schema → <DatasetDetailPage tab="schema" />

   Page component wires the shell like this:

     // DatasetListPage.jsx
     function DatasetListPage() {
       const { id } = useParams();           // undefined on /datasets
       const hasDetail = Boolean(id);
       const mobile = useIsMobile();
       return (
         <MasterDetailShell
           mobile={mobile}
           hasDetail={hasDetail}           // drives mobile slide
           list={<DatasetList activeId={id} />}
           detail={<Outlet />}             // Router renders detail here
           placeholder={<SelectionPrompt />}
         />
       );
     }

   The list column highlights the active item by comparing its own item ids
   against useParams().id — no prop threading needed.

   The slide animation on mobile is driven by `hasDetail` (= Boolean(useParams().id)),
   so navigating to /datasets/DS-001 triggers the slide-in; hitting the browser
   back button navigates to /datasets and slides back — all via the URL, all
   deep-linkable.

   SWIPE-BACK
   ──────────
   On mobile the detail column fires a "swipeback" CustomEvent on swipe-right
   (> 60 px). In a routed app, listen for it and call navigate(-1) or
   navigate("/datasets"):

     detailRef.current.addEventListener("swipeback", () => navigate(-1));

   Props:
     list          ReactNode   — the scrollable item list (left / base layer)
     detail        ReactNode   — <Outlet /> or detail content (right / top layer)
     hasDetail     boolean     — true when a detail route is active
     listWidth     number      — desktop list column px (default 340)
     placeholder   ReactNode   — right column content when hasDetail is false
     mobile        boolean
     headerHeight  number      — sticky header height in px (default 116)
══════════════════════════════════════════════════════════════════════════════ */

export function MasterDetailShell({
  list, detail, hasDetail = false,
  listWidth = 340, placeholder, mobile, headerHeight = 116,
}) {
  const touchStartX = useRef(null);
  const detailRef   = useRef(null);

  const handleTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = e => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    // Fire swipeback so the consuming route can call navigate(-1)
    if (dx > 60 && detailRef.current) {
      detailRef.current.dispatchEvent(new CustomEvent("swipeback", { bubbles: true }));
    }
  };

  /* ── Desktop: always two columns, router fills right slot ── */
  if (!mobile) {
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: `${listWidth}px 1fr`,
        alignItems: "start",
        minHeight: `calc(100vh - ${headerHeight}px)`,
      }}>
        {/* List column — independently scrollable, sticky */}
        <nav aria-label="Item list" style={{
          borderRight: `1px solid ${T.line}`,
          overflowY: "auto", overflowX: "hidden",
          scrollbarWidth: "none",
          padding: "24px 20px 80px 28px",
          position: "sticky", top: headerHeight,
          height: `calc(100vh - ${headerHeight}px)`,
          boxSizing: "border-box",
        }}>
          {list}
        </nav>

        {/* Detail / Outlet column */}
        <article aria-label="Item detail" style={{
          padding: "24px 28px 80px",
          minHeight: `calc(100vh - ${headerHeight}px)`,
          boxSizing: "border-box",
        }}>
          {hasDetail ? detail : (
            placeholder ?? (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                height: "100%", minHeight: 320, gap: 12,
              }}>
                <div style={{ fontSize: 32, opacity: 0.15 }}>▤</div>
                <div style={{ fontFamily: font, fontSize: 13, color: T.muted }}>
                  Select an item to view details
                </div>
              </div>
            )
          )}
        </article>
      </div>
    );
  }

  /* ── Mobile: list and detail are stacked layers, slide driven by hasDetail ── */
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* List layer — slides left when detail route is active */}
      <div style={{
        transform: hasDetail ? "translateX(-100%)" : "translateX(0)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        willChange: "transform",
        padding: "20px 16px 80px",
      }}>
        {list}
      </div>

      {/* Detail layer — slides in from the right */}
      <div
        ref={detailRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          minHeight: "100%",
          transform: hasDetail ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          willChange: "transform",
          background: T.page,
          padding: "20px 16px 80px",
          boxSizing: "border-box",
          pointerEvents: hasDetail ? "auto" : "none",
        }}
      >
        {detail}
      </div>
    </div>
  );
}

/* Backwards-compat alias — remove once routing is wired */
export const MasterDetailLayout = MasterDetailShell;

/* ══════════════════════════════════════════════════════════════════════════════
   LAYOUT — OverviewLayout
   Two-column overview page layout.

   Desktop: wide main (left) + sticky 280px sidebar (right).
   Mobile:  single column, sidebar stacks below main with a divider.

   Props:  main, sidebar, mobile, headerHeight
══════════════════════════════════════════════════════════════════════════════ */

export function OverviewLayout({ main, sidebar, mobile, headerHeight = 116 }) {
  if (mobile) {
    return (
      <div style={{ padding: "20px 16px 80px" }}>
        {main}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.line}` }}>
          {sidebar}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 280px",
      gap: 48,
      padding: "32px 36px 80px",
      maxWidth: 1200,
      margin: "0 auto",
      boxSizing: "border-box",
      alignItems: "start",
    }}>
      <div>{main}</div>
      <aside aria-label="Summary" style={{ position: "sticky", top: headerHeight + 16 }}>
        {sidebar}
      </aside>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════════════
   PANELS — ContentPanel
   ─────────────────────────────────────────────────────────────────────────────
   White surface with optional left-border accent (the core visual motif).
   Props:
     accent    string  — left-border colour (T.lu.red, T.ok, T.warn, …)
     padding   string
     hover     boolean — show hover state
     onClick   fn
══════════════════════════════════════════════════════════════════════════════ */

export function ContentPanel({ accent, padding = "16px 20px", hover = false, onClick, children, style }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={sx({
        background: hov ? T.white : T.card,
        border: `1px solid ${hov ? T.lineH : T.line}`,
        borderLeft: accent ? `3px solid ${hov ? accent : accent + "99"}` : `1px solid ${T.line}`,
        padding,
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.12s, border-color 0.12s",
      }, style)}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PANELS — SectionPanel
   ─────────────────────────────────────────────────────────────────────────────
   Eyebrow label + content block with consistent spacing.
   Props:  eyebrow string, right ReactNode, children
══════════════════════════════════════════════════════════════════════════════ */

export function SectionPanel({ eyebrow, right, children, style }) {
  return (
    <div style={sx({ marginBottom: 32 }, style)}>
      {eyebrow && (
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12, paddingBottom: 8,
          borderBottom: `1px solid ${T.lineL}`,
        }}>
          <Eyebrow style={{ margin: 0 }}>{eyebrow}</Eyebrow>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PANELS — StatusPanel  (the "Notice" component from the reference)
   ─────────────────────────────────────────────────────────────────────────────
   Props:  type ("ok"|"warn"|"danger"|"info"), title, children
══════════════════════════════════════════════════════════════════════════════ */

export function StatusPanel({ type = "info", title, children, style }) {
  const cfg = {
    ok:      { bd: T.okBd,   tc: T.ok   },
    warn:    { bd: T.warnBd, tc: T.warn  },
    danger:  { bd: T.badBd,  tc: T.bad   },
    info:    { bd: T.lineH,  tc: T.mid   },
  }[type] ?? { bd: T.lineH, tc: T.mid };

  const role = type === "danger" ? "alert" : type === "warn" ? "status" : undefined;
  return (
    <div role={role} style={sx({
      borderLeft: `3px solid ${cfg.bd}`,
      paddingLeft: 14,
      marginBottom: 20,
    }, style)}>
      {title && (
        <div style={{
          fontFamily: font, fontSize: 13, fontWeight: 600,
          color: cfg.tc, marginBottom: 3,
        }}>{title}</div>
      )}
      <div style={{ fontFamily: font, fontSize: 13, color: T.soft, lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PANELS — DrawerPanel
   ─────────────────────────────────────────────────────────────────────────────
   Bottom-anchored sliding drawer — three height states.
   Props:
     state         "collapsed"|"half"|"full"
     onStateChange (state) => void
     tabLabel      ReactNode   — content of the 36px tab strip
     children      ReactNode   — body content (hidden when collapsed)
══════════════════════════════════════════════════════════════════════════════ */

export const DRAWER_STATES = { COLLAPSED: "collapsed", HALF: "half", FULL: "full" };

/**
 * DrawerPanel — Bottom-anchored sliding drawer with built-in controls.
 *
 * Props:
 *   state           "collapsed"|"half"|"full"
 *   onStateChange   (state) => void
 *   tabLabel        ReactNode  — identity slot: SQL label + query name (left side)
 *   accentColor     string     — top border colour (default LU red)
 *   children        ReactNode  — body content (hidden when collapsed)
 *
 * Built-in controls (right side of tab strip):
 *   ↑ / ↓   — toggle between half and full
 *   ▼ / ▲   — collapse to tab / restore to half
 */
export function DrawerPanel({ state, onStateChange, tabLabel, actions, accentColor = T.lu.red, children }) {
  const heights = {
    collapsed: 36,
    half:      Math.min(300, window.innerHeight * 0.35),
    full:      window.innerHeight - 116,
  };
  const h = heights[state] ?? 36;

  /* ── Ctrl+Q / ⌘Q — toggle drawer and focus the editor ── */
  const editorRef = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (e.key === "q" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onStateChange(state === "collapsed" ? "half" : "collapsed");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state, onStateChange]);

  /* Focus the editor whenever the drawer opens */
  useEffect(() => {
    if (state !== "collapsed") {
      /* Small delay so the CSS height transition has started */
      const t = setTimeout(() => editorRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [state]);

  /* Icon-only control button — label hidden, title for accessibility */
  const ctrlBtn = (icon, title, onClick) => (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      title={title}
      aria-label={title}
      style={{
        background: "none",
        border: `1px solid ${T.line}`,
        borderBottom: `1px solid ${T.lineH}`,
        fontFamily: mono, fontSize: 13, fontWeight: 400,
        color: T.mid, padding: "2px 7px",
        cursor: "pointer", lineHeight: "18px",
        flexShrink: 0, display: "flex", alignItems: "center",
      }}
    >{icon}</button>
  );

  return (
    <div
      role="region"
      aria-label="SQL workbench"
      aria-expanded={state !== "collapsed"}
      style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
      height: h, transition: "height 0.2s ease",
      display: "flex", flexDirection: "column",
      background: T.white,
      borderTop: `2px solid ${accentColor}`,
      boxShadow: "0 -2px 16px rgba(0,0,0,0.10)",
    }}>
      {/* ── Tab strip ── */}
      <div
        onClick={() => onStateChange(state === "collapsed" ? "half" : "collapsed")}
        style={{
          height: 36, flexShrink: 0,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px 0 16px",
          borderBottom: state !== "collapsed" ? `1px solid ${T.line}` : "none",
          background: T.surface,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Left: caller-supplied identity (SQL label + query name) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, overflow: "hidden" }}>
          {tabLabel}
        </div>

        {/* Right: caller-supplied actions (Run/Abort/Clear) + built-in window controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 12 }}
          onClick={e => e.stopPropagation()}>
          {/* Injected actions from SqlWorkbench (or any other consumer) */}
          {actions && state !== "collapsed" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6,
              paddingRight: 6, marginRight: 2,
              borderRight: `1px solid ${T.lineL}` }}>
              {actions}
            </div>
          )}
          {/* Expand / contract — only when not collapsed */}
          {state !== "collapsed" && ctrlBtn(
            state === "full" ? "↙" : "↗",
            state === "full" ? "Contract" : "Expand",
            () => onStateChange(state === "full" ? "half" : "full")
          )}
          {/* Collapse / restore */}
          {ctrlBtn(
            state === "collapsed" ? "▲" : "▼",
            state === "collapsed" ? "Open SQL workbench" : "Collapse",
            () => onStateChange(state === "collapsed" ? "half" : "collapsed")
          )}
        </div>
      </div>

      {state !== "collapsed" && (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Inject editorRef into the first child that accepts a ref (e.g. <textarea>).
              If the child doesn't forward refs this is a no-op. */}
          {React.Children.map(children, (child, i) =>
            i === 0 && React.isValidElement(child)
              ? React.cloneElement(child, { ref: editorRef })
              : child
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PRIMITIVES — CARDS
══════════════════════════════════════════════════════════════════════════════ */

/**
 * EntryCard — Registry-style list item.
 * The core repeating unit across Datasets, Queries, Actors pages.
 *
 * Props:
 *   statusColor   string   — dot colour (from freshness or state)
 *   statusBg      string   — dot glow colour
 *   accentColor   string   — left border colour (same as statusColor usually)
 *   header        ReactNode — reference line (id, source, date, badges)
 *   title         string
 *   description   string
 *   footer        ReactNode — tags, counts, CTA button
 *   onClick       fn
 */
export function EntryCard({ statusColor = T.muted, statusBg = T.surface, accentColor, header, title, description, footer, onClick, style }) {
  const [hov, setHov] = useState(false);
  const accent = accentColor ?? statusColor;
  return (
    <article
      aria-label={title}
      style={sx({ display: "grid", gridTemplateColumns: "10px 1fr", gap: "0 18px", marginBottom: 6, cursor: "pointer" }, style)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Left thread */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 18 }}>
        <div style={{
          width: 9, height: 9, borderRadius: "50%",
          background: statusColor, flexShrink: 0,
          boxShadow: `0 0 0 2px ${statusBg}`,
        }} />
        <div style={{ width: 1, flex: 1, background: T.lineL, marginTop: 6 }} />
      </div>

      {/* Card body */}
      <div
        onClick={onClick}
        style={{
          background: hov ? T.white : T.card,
          border: `1px solid ${hov ? T.lineH : T.line}`,
          borderLeft: `3px solid ${hov ? accent : T.lineL}`,
          padding: "14px 16px 14px 18px",
          transition: "background 0.12s, border-color 0.12s",
        }}
      >
        {header && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
            {header}
          </div>
        )}
        {title && (
          <div style={{
            fontFamily: font, fontSize: 16, fontWeight: 700, color: T.ink,
            marginBottom: 5, letterSpacing: "-0.01em", lineHeight: 1.3,
          }}>{title}</div>
        )}
        {description && (
          <div style={{ fontFamily: font, fontSize: 13, color: T.mid, lineHeight: 1.65, marginBottom: 10 }}>
            {description}
          </div>
        )}
        {footer && (
          <div style={{
            display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
            paddingTop: 10, borderTop: `1px solid ${T.lineL}`,
          }}>
            {footer}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * StatCard — Large KPI numeral block.
 * Used in rows: <StatCard n={42} label="Registered assets" />
 *
 * Props:  n (string|number), label, borderRight (boolean, default true)
 */
export function StatCard({ n, label, borderRight = true, style }) {
  return (
    <div aria-label={`${label}: ${n}`} style={sx({
      padding: "16px 28px 16px 0",
      borderRight: borderRight ? `1px solid ${T.lineL}` : "none",
      marginRight: 28,
    }, style)}>
      <div aria-hidden="true" style={{
        fontFamily: font, fontSize: 38, fontWeight: 700, color: T.ink,
        lineHeight: 1, letterSpacing: "-0.03em",
        fontVariantNumeric: "tabular-nums", marginBottom: 5,
      }}>{n}</div>
      <div aria-hidden="true" style={{
        fontFamily: font, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted,
      }}>{label}</div>
    </div>
  );
}

/**
 * StatRow — Horizontal row of StatCards.
 * Wraps an array of { n, label } objects.
 */
export function StatRow({ stats, style }) {
  return (
    <div style={sx({
      display: "flex", flexWrap: "wrap",
      paddingBottom: 4, borderBottom: `1px solid ${T.line}`, marginBottom: 32,
    }, style)}>
      {stats.map((s, i) => (
        <StatCard key={i} n={s.n} label={s.label} borderRight={i < stats.length - 1} />
      ))}
    </div>
  );
}

/**
 * MetaRow — Single label/value field in an information grid.
 *
 * Props:  label, value, editing, editNode, readOnly, span (grid span)
 */
export function MetaRow({ label, value, editing, editNode, readOnly, span, style }) {
  return (
    <div style={sx({
      padding: "12px 0",
      borderBottom: `1px solid ${T.lineL}`,
      paddingRight: 28,
      gridColumn: span ? "1 / -1" : undefined,
    }, style)}>
      <div style={{
        fontFamily: font, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.09em", textTransform: "uppercase",
        color: T.muted, marginBottom: 5,
      }}>{label}</div>
      {editing && !readOnly ? (
        editNode
      ) : (
        <div style={{ fontFamily: font, fontSize: 14, color: readOnly && editing ? T.muted : T.ink, fontWeight: 500 }}>
          {value}
          {readOnly && editing && (
            <span style={{ fontFamily: font, fontSize: 11, color: T.faint, marginLeft: 6 }}>read-only</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ProvenanceCard — The structured origin/reuse card from the Provenance tab.
 * Multi-column layout with vertical dividers.
 *
 * Props:
 *   accent        string   — left border colour
 *   headerLeft    ReactNode
 *   headerRight   ReactNode
 *   description   string
 *   panels        { label, content }[]  — each becomes a column
 */
export function ProvenanceCard({ accent = T.info, headerLeft, headerRight, description, panels = [], style }) {
  const VDiv = () => (
    <div style={{ width: 1, background: T.lineL, flexShrink: 0, margin: "0 18px", alignSelf: "stretch" }} />
  );
  return (
    <div style={sx({
      border: `1px solid ${accent}`,
      borderLeft: `4px solid ${accent}`,
      background: T.white,
      marginBottom: 12,
    }, style)}>
      {/* Header */}
      <div style={{
        padding: "10px 16px",
        background: accent + "18",
        borderBottom: `1px solid ${accent}`,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      }}>
        {headerLeft}
        {headerRight}
      </div>
      {/* Description */}
      {description && (
        <div style={{
          padding: "10px 16px",
          borderBottom: `1px solid ${T.lineL}`,
          fontFamily: font, fontSize: 13, color: T.soft, lineHeight: 1.55,
        }}>
          {description}
        </div>
      )}
      {/* Panel columns */}
      {panels.length > 0 && (
        <div style={{ display: "flex", padding: "12px 0", alignItems: "stretch", flexWrap: "wrap" }}>
          {panels.map((p, i) => (
            <div key={i} style={{ display: "flex" }}>
              {i > 0 && <VDiv />}
              <div style={{ flex: "1 1 130px", padding: "0 16px", minWidth: 110 }}>
                <div style={{
                  fontFamily: font, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: T.muted, marginBottom: 5,
                }}>{p.label}</div>
                {p.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PRIMITIVES — BADGES & LABELS
══════════════════════════════════════════════════════════════════════════════ */

const ASSET_TYPE_CFG = {
  source:    { label: "Source",    color: "#1A4A7A", bg: "#EEF2FA" },
  output:    { label: "Output",    color: "#1E5C32", bg: "#EDF5F0" },
  dashboard: { label: "Dashboard", color: "#5C3A00", bg: "#FBF4E6" },
  pipeline:  { label: "Pipeline",  color: "#4A2A6A", bg: "#F3EEF9" },
  geodata:   { label: "Geodata",   color: "#1A5050", bg: "#EEF5F5" },
};

export function TypeBadge({ type, style }) {
  const cfg = ASSET_TYPE_CFG[type] ?? { label: type, color: T.mid, bg: T.surface };
  return (
    <span aria-label={`Asset type: ${cfg.label}`} style={sx({
      fontFamily: font, fontSize: 11, fontWeight: 600,
      letterSpacing: "0.04em", textTransform: "uppercase",
      color: cfg.color, background: cfg.bg,
      padding: "2px 7px", display: "inline-block",
      whiteSpace: "nowrap", lineHeight: "16px",
    }, style)}>
      {cfg.label}
    </span>
  );
}

const QUERY_STATE_CFG = {
  draft:       { label: "Draft",       color: T.warn,  bg: T.warnBg, bd: T.warnBd },
  saved:       { label: "Saved",       color: T.ok,    bg: T.okBg,   bd: T.okBd   },
  archived:    { label: "Archived",    color: T.muted, bg: T.surface, bd: T.lineL  },
  implemented: { label: "Implemented", color: "#1A4A7A", bg: "#EEF2FA", bd: "#B0C4E8" },
};

export function StateBadge({ state, style }) {
  const s = QUERY_STATE_CFG[state] ?? QUERY_STATE_CFG.draft;
  return (
    <span aria-label={`Status: ${s.label}`} style={sx({
      fontFamily: font, fontSize: 11, fontWeight: 600,
      letterSpacing: "0.04em", textTransform: "uppercase",
      color: s.color, background: s.bg,
      border: `1px solid ${s.bd}`,
      padding: "2px 7px", display: "inline-block",
      whiteSpace: "nowrap", lineHeight: "16px",
    }, style)}>
      {s.label}
    </span>
  );
}

export function FreshnessDot({ days, showLabel = false, style }) {
  const cfg = freshnessCfg(days);
  const ariaLabel = days != null
    ? `Freshness: ${cfg.label} — last received ${days} day${days !== 1 ? "s" : ""} ago`
    : `Freshness: ${cfg.label}`;
  return (
    <span aria-label={ariaLabel} title={ariaLabel}
      style={sx({ display: "inline-flex", alignItems: "center", gap: 5 }, style)}>
      <span aria-hidden="true" style={{
        width: 8, height: 8, borderRadius: "50%",
        background: cfg.c, display: "inline-block", flexShrink: 0,
        boxShadow: `0 0 0 2px ${cfg.bg}`,
      }} />
      {showLabel && (
        <span aria-hidden="true" style={{ fontFamily: font, fontSize: 12, fontWeight: 500, color: cfg.c }}>
          {cfg.label}
        </span>
      )}
    </span>
  );
}

export function InlineTag({ children, ok, warn, style }) {
  const c  = ok ? T.ok  : warn ? T.warn  : T.muted;
  const bd = ok ? T.okBd : warn ? T.warnBd : T.lineL;
  return (
    <span style={sx({
      fontFamily: font, fontSize: 11, fontWeight: 500, color: c,
      border: `1px solid ${bd}`, padding: "1px 6px",
      display: "inline-block", whiteSpace: "nowrap", lineHeight: "16px",
    }, style)}>
      {children}
    </span>
  );
}

const BUCKET_CFG = {
  bronze:    { label: "Bronze",  color: "#7A4A1A", bg: "#FBF0E6" },
  silver:    { label: "Silver",  color: "#4A4A5A", bg: "#F0F0F5" },
  gold:      { label: "Gold",    color: "#6A5A00", bg: "#FAF5E0" },
  outputs:   { label: "Outputs", color: T.ok,      bg: T.okBg    },
  "s3-other":{ label: "S3",      color: T.mid,     bg: T.surface },
};

export function BucketBadge({ bucket, style }) {
  const cfg = BUCKET_CFG[bucket] ?? { label: bucket, color: T.mid, bg: T.surface };
  return (
    <span style={sx({
      fontFamily: font, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.06em", textTransform: "uppercase",
      color: cfg.color, background: cfg.bg,
      padding: "2px 8px", display: "inline-block",
    }, style)}>
      {cfg.label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PRIMITIVES — EDITABLE COMPONENTS
══════════════════════════════════════════════════════════════════════════════ */

const inputBase = {
  fontFamily: font, fontSize: 13, color: T.ink,
  background: T.white, border: `1px solid ${T.line}`,
  borderBottom: `2px solid ${T.lineH}`,
  padding: "6px 10px", outline: "none",
  width: "100%", boxSizing: "border-box",
  borderRadius: 0,
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

/**
 * EditableLabel
 * Displays as plain text in view mode; becomes an input on click when editing=true.
 * Props: value, onChange, editing, multiline, rows, placeholder
 */
export function EditableLabel({ value, onChange, editing, multiline, rows = 3, placeholder, style }) {
  if (!editing) {
    return (
      <div style={sx({ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: 500 }, style)}>
        {value || <span style={{ color: T.faint }}>—</span>}
      </div>
    );
  }
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={sx(inputBase, { resize: "vertical", lineHeight: 1.5 }, style)}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={sx(inputBase, style)}
    />
  );
}

/**
 * EditableSelect
 * Displays as plain text in view; becomes a <select> when editing=true.
 * Props: value, onChange, options [{id, label}], editing
 */
export function EditableSelect({ value, onChange, options = [], editing, style }) {
  const label = options.find(o => o.id === value)?.label ?? value;
  if (!editing) {
    return (
      <div style={sx({ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: 500 }, style)}>
        {label || <span style={{ color: T.faint }}>—</span>}
      </div>
    );
  }
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={sx(inputBase, {
        cursor: "pointer",
        paddingRight: 32,
        background: `${T.surface} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23606060'/%3E%3C/svg%3E") no-repeat right 10px center`,
        backgroundSize: "10px 6px",
        fontWeight: 500,
      }, style)}
    >
      {options.map(o => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  );
}

/**
 * FieldGroup — Label wrapper with optional required marker and error.
 * Props:  label, required, error, children
 */
export function FieldGroup({ label, required, error, children, style }) {
  return (
    <div style={sx({ marginBottom: 14 }, style)}>
      <div style={{
        fontFamily: font, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.09em", textTransform: "uppercase",
        color: error ? T.bad : T.muted, marginBottom: 5,
      }}>
        {label}
        {required && <span style={{ color: T.bad }}> *</span>}
      </div>
      {children}
      {error && (
        <div style={{ fontFamily: font, fontSize: 12, color: T.bad, marginTop: 3 }}>
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * FormActions — Standardised Edit / Save / Cancel button row.
 * Props:  editing, onEdit, onSave, onCancel
 */
export function FormActions({ editing, onEdit, onSave, onCancel }) {
  const btnBase = {
    fontFamily: font, fontSize: 12, fontWeight: 600,
    padding: "5px 14px", cursor: "pointer",
    border: `1px solid ${T.line}`,
    borderBottom: `2px solid ${T.lineH}`,
  };
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
      {!editing ? (
        <button onClick={onEdit} style={{ ...btnBase, background: "none", color: T.mid }}>
          Edit
        </button>
      ) : (
        <>
          <button onClick={onCancel} style={{ ...btnBase, background: "none", color: T.muted, fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={onSave} style={{ ...btnBase, background: T.ink, border: "none", borderBottom: "none", color: T.white }}>
            Save
          </button>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PRIMITIVES — NAVIGATION
══════════════════════════════════════════════════════════════════════════════ */

/**
 * Tabs — Underline tab bar.
 * Props:  tabs [{id, label}], active, onChange
 */
export function Tabs({ tabs, active, onChange, style }) {
  return (
    <div role="tablist" style={sx({
      display: "flex",
      borderBottom: `1px solid ${T.line}`,
      marginBottom: 22,
      overflowX: "auto",
      scrollbarWidth: "none",
    }, style)}>
      {tabs.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          aria-controls={`tabpanel-${t.id}`}
          id={`tab-${t.id}`}
          onClick={() => onChange(t.id)}
          style={{
            background: "none", border: "none",
            borderBottom: active === t.id ? `2px solid ${T.ink}` : "2px solid transparent",
            color: active === t.id ? T.ink : T.muted,
            padding: "9px 20px 9px 0", marginRight: 4, marginBottom: -1,
            cursor: "pointer", fontFamily: font,
            fontSize: 13, fontWeight: active === t.id ? 600 : 400,
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/**
 * TypeFilter — Asset-type quick-filter strip.
 * Props:  types [{id, label}], value, onChange
 */
export function TypeFilter({ types, value, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 0, marginBottom: 20,
      borderBottom: `1px solid ${T.line}`,
      overflowX: "auto", scrollbarWidth: "none",
    }}>
      {types.map(t => {
        const active = value === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            background: "none", border: "none",
            borderBottom: active ? `2px solid ${T.ink}` : "2px solid transparent",
            color: active ? T.ink : T.muted,
            fontFamily: font, fontSize: 13,
            fontWeight: active ? 600 : 400,
            padding: "8px 16px 8px 0", marginRight: 4, marginBottom: -1,
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Breadcrumb — Back link + id crumb + title.
 * Props:  backLabel, backOnClick, id, title
 */
export function Breadcrumb({ backLabel, backOnClick, id, title }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol style={{
        listStyle: "none", padding: 0, margin: "0 0 18px 0",
        display: "flex", alignItems: "center", gap: 6,
        fontFamily: font, fontSize: 12, color: T.muted,
      }}>
        <li>
          <button onClick={backOnClick} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: font, fontSize: 12, fontWeight: 600, color: T.mid, padding: 0,
          }}>
            {backLabel}
          </button>
        </li>
        {id && (
          <li style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden="true">›</span>
            <span style={{ fontFamily: mono, fontSize: 11 }}>{id}</span>
          </li>
        )}
        {title && (
          <li style={{ display: "flex", alignItems: "center", gap: 6 }} aria-current="page">
            <span aria-hidden="true">›</span>
            <span style={{ color: T.ink }}>{title}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PRIMITIVES — SEARCH
   ─────────────────────────────────────────────────────────────────────────────
   GlobalSearch  — self-contained trigger + panel in one component.

   • Mobile  (width < 680px): fullscreen overlay, slides up from bottom of
     the TopBar, covers the entire viewport. Close with Esc or the × button.

   • Desktop: dropdown panel anchored to the trigger button, max-width 560px,
     max-height 70vh. Closes on outside click or Esc.

   Props:
     datasets   { id, name, source, assetType, tags, updated }[]
     actors     { id, name, role, type }[]
     queries    { id, name, description, sql, state, authorName, datasets[] }[]
     onNavigate (type: "dataset"|"actor"|"query", id: string) => void
     mobile     boolean
══════════════════════════════════════════════════════════════════════════════ */

/* ── Stable sub-components defined at module level (never redefined on render) ── */

function _SearchGroupHeader({ label }) {
  return (
    <div style={{
      padding: "9px 18px 5px",
      fontFamily: font, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.12em", textTransform: "uppercase",
      color: T.muted, background: T.surface,
      borderBottom: `1px solid ${T.lineL}`,
    }}>{label}</div>
  );
}

function _SearchHl({ text, ql }) {
  if (!ql || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(ql);
  if (idx === -1) return <>{text}</>;
  return <>
    {text.slice(0, idx)}
    <mark style={{ background: T.warnBg, color: T.warn, padding: 0 }}>
      {text.slice(idx, idx + ql.length)}
    </mark>
    {text.slice(idx + ql.length)}
  </>;
}

const _rowBase = {
  padding: "10px 18px", cursor: "pointer",
  borderBottom: `1px solid ${T.lineL}`,
  display: "flex", alignItems: "center", gap: 12,
};

export function GlobalSearch({ datasets = [], actors = [], queries = [], onNavigate, mobile }) {
  const [open, setOpen] = useState(false);
  const [q, setQ]       = useState("");
  const inputRef        = useRef(null);
  const triggerRef      = useRef(null);
  const panelRef        = useRef(null);

  const openSearch  = useCallback(() => { setOpen(true);  setQ(""); }, []);
  const closeSearch = useCallback(() => { setOpen(false); setQ(""); }, []);

  /* ── Keyboard shortcut: / or ⌘K ── */
  useEffect(() => {
    const h = e => {
      if (!open && e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); openSearch();
      }
      if (open && e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, openSearch, closeSearch]);

  /* ── Focus input when panel opens ── */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  /* ── Desktop: close on outside click ── */
  useEffect(() => {
    if (!open || mobile) return;
    const h = e => {
      if (
        panelRef.current   && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) closeSearch();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, mobile, closeSearch]);

  /* ── Derived search results ── */
  const ql     = q.toLowerCase().trim();
  const hasQ   = ql.length >= 2;

  const dsResults = !hasQ ? [] : datasets.filter(d =>
    d.name.toLowerCase().includes(ql) ||
    d.source?.toLowerCase().includes(ql) ||
    d.id.toLowerCase().includes(ql) ||
    d.tags?.some(t => t.toLowerCase().includes(ql))
  ).slice(0, 6);

  const acResults = !hasQ ? [] : actors.filter(a =>
    a.name.toLowerCase().includes(ql) ||
    a.role?.toLowerCase().includes(ql) ||
    a.id.toLowerCase().includes(ql)
  ).slice(0, 4);

  const qResults = !hasQ ? [] : queries.filter(qr =>
    qr.name.toLowerCase().includes(ql) ||
    qr.description?.toLowerCase().includes(ql) ||
    qr.authorName?.toLowerCase().includes(ql) ||
    qr.sql?.toLowerCase().includes(ql)
  ).slice(0, 4);

  const empty       = hasQ && dsResults.length === 0 && acResults.length === 0 && qResults.length === 0;
  const totalCount  = dsResults.length + acResults.length + qResults.length;

  const go = (type, id) => { onNavigate?.(type, id); closeSearch(); };

  /* ── Platform-aware keyboard hint ── */
  const isMac = typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  const kbdHint = isMac ? "⌘K" : "Ctrl K";

  /* ── Trigger button (plain JSX, not a sub-component) ── */
  const triggerJsx = (
    <button
      ref={triggerRef}
      onClick={openSearch}
      aria-label={`Search (${kbdHint})`}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: open && !mobile ? T.ink : T.surface,
        border: `1px solid ${open && !mobile ? T.ink : T.line}`,
        padding: mobile ? "6px 10px" : "7px 14px",
        cursor: "pointer", fontFamily: font,
        fontSize: mobile ? 11 : 12,
        color: open && !mobile ? T.white : T.muted,
        transition: "background 0.1s, color 0.1s",
        whiteSpace: "nowrap",
      }}
    >
      {/* Search icon */}
      <span aria-hidden="true" style={{ fontSize: 15 }}>⌕</span>

      {/* "Search" label — hidden on mobile */}
      {!mobile && <span>Search</span>}

      {/* Keyboard shortcut hint — shown on desktop only, renders as two
          small keycap-style tokens separated by a thin space.
          Uses aria-hidden since the aria-label on the button covers it. */}
      {!mobile && (
        <span aria-hidden="true" style={{
          display: "inline-flex", alignItems: "center", gap: 2,
          marginLeft: 2,
        }}>
          {kbdHint.split(" ").map((key, i) => (
            <kbd key={i} style={{
              fontFamily: mono,
              fontSize: 10,
              lineHeight: "16px",
              padding: "0 4px",
              color: open ? "rgba(255,255,255,0.45)" : T.faint,
              background: open ? "rgba(255,255,255,0.08)" : "transparent",
              border: `1px solid ${open ? "rgba(255,255,255,0.18)" : T.lineL}`,
              borderBottom: `2px solid ${open ? "rgba(255,255,255,0.12)" : T.line}`,
              borderRadius: 0,
              display: "inline-block",
            }}>{key}</kbd>
          ))}
        </span>
      )}
    </button>
  );

  /* ── Panel (plain JSX inline — no wrapper function component) ── */
  const panelJsx = open ? (
    <div
      ref={panelRef}
      style={{
        background: T.white,
        display: "flex", flexDirection: "column",
        ...(mobile ? {
          position: "fixed", inset: 0, zIndex: 500,
        } : {
          position: "absolute", top: "calc(100% + 6px)",
          right: 0, width: 540, maxWidth: "calc(100vw - 32px)",
          maxHeight: "70vh", zIndex: 500,
          border: `1px solid ${T.lineH}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
        }),
      }}
    >
      {/* Input bar */}
      <div role="search" style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px",
        borderBottom: `3px solid ${T.lu.red}`,
        background: T.white, flexShrink: 0,
      }}>
        <span aria-hidden="true" style={{ fontSize: 18, color: T.muted, flexShrink: 0 }}>⌕</span>
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Search datasets, actors and queries"
          placeholder="Search datasets, actors, queries…"
          style={{
            flex: 1, fontFamily: font, fontSize: mobile ? 16 : 14,
            color: T.ink, border: "none", outline: "none",
            background: "none", minWidth: 0,
          }}
        />
        {q && (
          <button onClick={() => { setQ(""); inputRef.current?.focus(); }} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: font, fontSize: 12, color: T.muted, padding: 0,
          }}>Clear</button>
        )}
        <button onClick={closeSearch} style={{
          background: "none", cursor: "pointer",
          fontFamily: font, fontSize: 12, fontWeight: 600,
          color: T.muted, padding: "3px 6px",
          border: `1px solid ${T.lineL}`,
        }}>Esc</button>
      </div>

      {/* Results scroll area */}
      <div role="region" aria-live="polite" aria-label="Search results" style={{ overflowY: "auto", flex: 1 }}>

        {/* Idle state */}
        {!hasQ && (
          <div style={{
            padding: "28px 18px", textAlign: "center",
            fontFamily: font, fontSize: 13, color: T.muted,
          }}>
            <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>⌕</div>
            Type at least 2 characters to search datasets, actors and queries.
            <div style={{ marginTop: 12, display: "flex", gap: 4, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              {kbdHint.split(" ").map((key, i) => (
                <kbd key={i} style={{ fontFamily: mono, fontSize: 11, color: T.faint,
                  border: `1px solid ${T.lineL}`, borderBottom: `2px solid ${T.line}`,
                  borderRadius: 0, padding: "0 5px", lineHeight: "18px" }}>{key}</kbd>
              ))}
              <span style={{ fontFamily: font, fontSize: 12, color: T.faint }}>to open anytime</span>
            </div>
          </div>
        )}

        {/* No results */}
        {empty && (
          <div style={{ padding: "28px 18px", textAlign: "center", fontFamily: font, fontSize: 13, color: T.muted }}>
            No results for <strong>"{q}"</strong>
          </div>
        )}

        {/* ── Datasets ── */}
        {dsResults.length > 0 && (
          <>
            <_SearchGroupHeader label={`Data Assets · ${dsResults.length}`} />
            {dsResults.map(ds => {
              const f = freshnessCfg(ds.lastReceived ?? 999);
              return (
                <div key={ds.id} onClick={() => go("dataset", ds.id)}
                  style={_rowBase}
                  onMouseEnter={e => e.currentTarget.style.background = T.card}
                  onMouseLeave={e => e.currentTarget.style.background = T.white}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: f.c, flexShrink: 0, boxShadow: `0 0 0 2px ${f.bg}` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: font, fontSize: 14, fontWeight: 600, color: T.ink }}>
                      <_SearchHl text={ds.name} ql={ql} />
                    </div>
                    <div style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 1, display: "flex", alignItems: "center", gap: 6 }}>
                      <_SearchHl text={ds.source} ql={ql} />
                      <span>·</span>
                      <TypeBadge type={ds.assetType} />
                    </div>
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 11, color: T.faint, flexShrink: 0 }}>{ds.id}</span>
                </div>
              );
            })}
          </>
        )}

        {/* ── Actors ── */}
        {acResults.length > 0 && (
          <>
            <_SearchGroupHeader label={`Actors · ${acResults.length}`} />
            {acResults.map(ac => (
              <div key={ac.id} onClick={() => go("actor", ac.id)}
                style={_rowBase}
                onMouseEnter={e => e.currentTarget.style.background = T.card}
                onMouseLeave={e => e.currentTarget.style.background = T.white}
              >
                <span style={{ fontFamily: font, fontSize: 14, color: T.faint, width: 18, textAlign: "center", flexShrink: 0 }}>
                  {ac.type === "internal" ? "◎" : "○"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 14, fontWeight: 600, color: T.ink }}>
                    <_SearchHl text={ac.name} ql={ql} />
                  </div>
                  <div style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 1 }}>
                    <_SearchHl text={ac.role} ql={ql} />
                  </div>
                </div>
                <span style={{ fontFamily: mono, fontSize: 11, color: T.faint, flexShrink: 0 }}>{ac.id}</span>
              </div>
            ))}
          </>
        )}

        {/* ── Queries ── */}
        {qResults.length > 0 && (
          <>
            <_SearchGroupHeader label={`Saved Queries · ${qResults.length}`} />
            {qResults.map(qr => (
              <div key={qr.id} onClick={() => go("query", qr.id)}
                style={_rowBase}
                onMouseEnter={e => e.currentTarget.style.background = T.card}
                onMouseLeave={e => e.currentTarget.style.background = T.white}
              >
                <span style={{ fontFamily: font, fontSize: 14, color: T.faint, flexShrink: 0 }}>⌕</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 14, fontWeight: 600, color: T.ink }}>
                    <_SearchHl text={qr.name} ql={ql} />
                  </div>
                  <div style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 1, display: "flex", gap: 8, alignItems: "center" }}>
                    <_SearchHl text={qr.authorName} ql={ql} />
                    <StateBadge state={qr.state} />
                  </div>
                </div>
                <span style={{ fontFamily: mono, fontSize: 11, color: T.faint, flexShrink: 0 }}>{qr.id}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      {hasQ && !empty && (
        <div style={{
          padding: "8px 18px", flexShrink: 0,
          borderTop: `1px solid ${T.lineL}`, background: T.surface,
          display: "flex", alignItems: "center",
        }}>
          <span style={{ fontFamily: font, fontSize: 11, color: T.faint }}>{totalCount} result{totalCount !== 1 ? "s" : ""}</span>
          <span style={{ fontFamily: font, fontSize: 11, color: T.faint, marginLeft: "auto" }}>↵ select · Esc close</span>
        </div>
      )}
    </div>
  ) : null;

  /* ── Render ── */
  if (mobile) {
    return (
      <>
        {triggerJsx}
        {panelJsx}
      </>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {triggerJsx}
      {panelJsx}
    </div>
  );
}

/**
 * SearchBar — Alias kept for backwards compatibility.
 * For new code prefer <GlobalSearch />.
 */
export function SearchBar({ onOpen, mobile }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 8,
      background: T.surface, border: `1px solid ${T.line}`,
      padding: mobile ? "6px 10px" : "7px 14px",
      cursor: "pointer", fontFamily: font,
      fontSize: mobile ? 11 : 12, color: T.muted,
    }}>
      <span style={{ fontSize: 15 }}>⌕</span>
      {!mobile && <span>Search</span>}
      {!mobile && <span style={{ fontFamily: mono, fontSize: 11, color: T.faint, marginLeft: 4 }}>/</span>}
    </button>
  );
}

/**
 * DatasetSearchWidget — Inline multi-select dataset picker.
 * Used in wizards and filter panels.
 *
 * Props:
 *   datasets    { id, name, source, assetType }[]
 *   selected    string[]  — selected ids
 *   onChange    (ids) => void
 *   placeholder string
 */
export function DatasetSearchWidget({ datasets = [], selected = [], onChange, placeholder = "Search datasets…" }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const pool = q.trim().length < 1
    ? datasets.slice(0, 8)
    : datasets.filter(d =>
        d.name.toLowerCase().includes(q.toLowerCase()) ||
        d.id.toLowerCase().includes(q.toLowerCase()) ||
        d.source.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 10);

  const add = id => {
    if (!selected.includes(id)) onChange([...selected, id]);
    setQ(""); setOpen(false);
    inputRef.current?.focus();
  };
  const remove = id => onChange(selected.filter(x => x !== id));

  return (
    <div>
      {selected.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {selected.map(id => {
            const ds = datasets.find(d => d.id === id);
            if (!ds) return null;
            return (
              <div key={id} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: T.card, border: `1px solid ${T.lineH}`,
                borderLeft: `3px solid ${T.ink}`,
                padding: "4px 8px 4px 10px",
              }}>
                <div>
                  <div style={{ fontFamily: font, fontSize: 12, fontWeight: 600, color: T.ink }}>{ds.name}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: T.muted }}>{ds.id}</div>
                </div>
                <button onClick={() => remove(id)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: T.muted, fontSize: 15, lineHeight: 1, padding: "0 2px",
                }}>×</button>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          style={inputBase}
        />
        {open && pool.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: T.white, border: `1px solid ${T.lineH}`, borderTop: "none",
            zIndex: 50, maxHeight: 220, overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}>
            {pool.map(ds => {
              const already = selected.includes(ds.id);
              return (
                <div key={ds.id}
                  onMouseDown={() => !already && add(ds.id)}
                  style={{
                    padding: "9px 12px", cursor: already ? "default" : "pointer",
                    background: already ? T.surface : T.white,
                    borderBottom: `1px solid ${T.lineL}`,
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                  onMouseEnter={e => { if (!already) e.currentTarget.style.background = T.card; }}
                  onMouseLeave={e => { if (!already) e.currentTarget.style.background = T.white; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: already ? T.muted : T.ink }}>{ds.name}</div>
                    <div style={{ fontFamily: font, fontSize: 11, color: T.muted }}>{ds.id} · {ds.source}</div>
                  </div>
                  <TypeBadge type={ds.assetType} />
                  {already && <span style={{ fontFamily: font, fontSize: 11, color: T.faint }}>added</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PRIMITIVES — DATA DISPLAY
══════════════════════════════════════════════════════════════════════════════ */

/**
 * Eyebrow — ALL-CAPS section label
 */
export function Eyebrow({ children, style }) {
  return (
    <div style={sx({
      fontFamily: font, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.09em", textTransform: "uppercase",
      color: T.muted, marginBottom: 10, marginTop: 24,
    }, style)}>
      {children}
    </div>
  );
}

/**
 * PageTitle — Section label + h1 + subtitle + optional right-slot.
 * Props:  section, title, sub, right
 */
export function PageTitle({ section, title, sub, right }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 14, borderBottom: `1px solid ${T.line}` }}>
      {section && (
        <div style={{
          fontFamily: font, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: T.muted, marginBottom: 6,
        }}>
          {section}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
        <div>
          <h1 style={{
            fontFamily: font, fontSize: 22, fontWeight: 700, color: T.ink,
            margin: "0 0 3px 0", letterSpacing: "-0.01em",
          }}>{title}</h1>
          {sub && <div style={{ fontFamily: font, fontSize: 13, color: T.muted }}>{sub}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}

/**
 * SchemaTable — Column definition table.
 * Props:  fields [{ field, type, nullable, description }]
 */
export function SchemaTable({ fields = [] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480, fontFamily: font }}>
        <caption style={{ display: "none" }}>Dataset schema — field definitions</caption>
        <thead>
          <tr style={{ borderBottom: `2px solid ${T.line}` }}>
            {["Field", "Type", "Nullable", "Description"].map(h => (
              <th key={h} style={{
                padding: "8px 14px 8px 0", textAlign: "left",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: T.muted,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map(r => (
            <tr key={r.field} style={{ borderBottom: `1px solid ${T.lineL}` }}>
              <td style={{ padding: "9px 14px 9px 0", fontFamily: mono, fontSize: 12, fontWeight: 600, color: T.ink }}>{r.field}</td>
              <td style={{ padding: "9px 14px 9px 0", fontFamily: mono, fontSize: 11, color: T.mid }}>{r.type}</td>
              <td style={{ padding: "9px 14px 9px 0", fontSize: 12, fontWeight: 600, color: r.nullable ? T.warn : T.faint }}>
                {r.nullable ? "Yes" : "—"}
              </td>
              <td style={{ padding: "9px 0", fontSize: 12, color: T.mid, lineHeight: 1.5 }}>{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * ActivityEntry — PROV-O event row in a timeline.
 * Props:  ev { id, date, type, actor, description, inputs, outputs, tags }, last, onDataset
 */
const ACT_META = {
  reception: { label: "Reception", symbol: "↓" },
  delivery:  { label: "Delivery",  symbol: "↑" },
  pipeline:  { label: "Pipeline",  symbol: "⚙" },
  manual:    { label: "Manual",    symbol: "✎" },
  dashboard: { label: "Dashboard", symbol: "▣" },
};

export function ActivityEntry({ ev, last, onDataset }) {
  const a = ACT_META[ev.type] ?? { label: ev.type, symbol: "·" };
  return (
    <li style={{
      listStyle: "none",
      display: "grid", gridTemplateColumns: "60px 1fr", gap: "0 16px",
      padding: "14px 0", borderBottom: last ? "none" : `1px solid ${T.lineL}`,
    }}>
      <div style={{ paddingTop: 2 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: T.muted, lineHeight: 1.4 }}>{ev.date}</div>
        <div style={{ fontFamily: font, fontSize: 14, color: T.faint, marginTop: 5, lineHeight: 1 }}>{a.symbol}</div>
      </div>
      <div>
        <div style={{
          fontFamily: font, fontSize: 12, fontWeight: 600, color: T.mid,
          marginBottom: 4, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
        }}>
          <span>{a.label}</span>
          {ev.tags?.includes("mobility-planning") && (
            <span style={{ fontWeight: 400, fontStyle: "italic", color: T.warn }}>legal mandate</span>
          )}
        </div>
        <div style={{ fontFamily: font, fontSize: 13, color: T.soft, lineHeight: 1.6, marginBottom: 5 }}>
          {ev.description}
        </div>
        <div style={{ fontFamily: font, fontSize: 12, color: T.muted }}>
          {ev.actor}
          {ev.inputs?.map((inp, i) => (
            <span key={i}> · <em
              style={{ cursor: onDataset ? "pointer" : "default" }}
              onClick={() => { if (!onDataset) return; onDataset("input", inp); }}
            >from: {inp}</em></span>
          ))}
          {ev.outputs?.filter(Boolean).map((out, i) => (
            <span key={i}> · <em
              style={{ cursor: onDataset ? "pointer" : "default" }}
              onClick={() => { if (!onDataset) return; onDataset("output", out); }}
            >to: {out}</em></span>
          ))}
        </div>
      </div>
    </li>
  );
}

/**
 * ActivityList — semantic <ol> wrapper for a sequence of ActivityEntry items.
 * Usage: <ActivityList>{activities.map(ev => <ActivityEntry key={ev.id} ev={ev} />)}</ActivityList>
 */
export function ActivityList({ children, label = "Activity timeline", style }) {
  return (
    <ol aria-label={label} style={{ listStyle: "none", padding: 0, margin: 0, ...style }}>
      {children}
    </ol>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   TOAST SYSTEM
   ─────────────────────────────────────────────────────────────────────────────
   Non-blocking ephemeral feedback for async operations (API failures, saves,
   warnings, informational messages). Positioned bottom-right.

   USAGE
   ─────
   1. Wrap your app once with <ToastProvider>:

        <ToastProvider>
          <AppShell ... />
        </ToastProvider>

   2. Call the hook anywhere in the tree:

        const { toast } = useToast();

        // In an async handler:
        try {
          await registerAsset(data);
          toast.success("Asset registered", "MobiScout Count Data was added to the catalogue.");
        } catch (err) {
          toast.error("Registration failed", err.message);
        }

   API
   ───
   toast.error(title, message?, duration?)     — red,  role=alert (immediate)
   toast.success(title, message?, duration?)   — green, role=status
   toast.warn(title, message?, duration?)      — amber, role=status
   toast.info(title, message?, duration?)      — blue,  role=status
   toast.dismiss(id)                           — remove one toast
   toast.dismissAll()                          — clear all

   Default duration: 5000ms. Pass Infinity to persist until dismissed.
══════════════════════════════════════════════════════════════════════════════ */

const ToastContext = createContext(null);

/* Internal: single toast item */
function _Toast({ id, type, title, message, onDismiss }) {
  const [visible, setVisible] = useState(false);

  /* Slide in on mount */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const cfg = {
    error:   { c: T.bad,  bg: T.badBg,  bd: T.badBd,  icon: "✕", role: "alert"  },
    success: { c: T.ok,   bg: T.okBg,   bd: T.okBd,   icon: "✓", role: "status" },
    warn:    { c: T.warn, bg: T.warnBg, bd: T.warnBd, icon: "⚠", role: "status" },
    info:    { c: T.info, bg: T.infoBg, bd: T.infoBd, icon: "i", role: "status" },
  }[type] ?? { c: T.mid, bg: T.surface, bd: T.line, icon: "·", role: "status" };

  return (
    <div
      role={cfg.role}
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        background: cfg.bg,
        border: `1px solid ${cfg.bd}`,
        borderLeft: `4px solid ${cfg.c}`,
        padding: "12px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        maxWidth: 360, width: "100%",
        /* Slide-in from right */
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(24px)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}
    >
      {/* Icon */}
      <span aria-hidden="true" style={{
        fontFamily: font, fontSize: 13, fontWeight: 700,
        color: cfg.c, flexShrink: 0,
        width: 18, textAlign: "center", paddingTop: 1,
      }}>
        {cfg.icon}
      </span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: font, fontSize: 13, fontWeight: 600,
          color: cfg.c, lineHeight: 1.4,
        }}>{title}</div>
        {message && (
          <div style={{
            fontFamily: font, fontSize: 12, color: T.soft,
            lineHeight: 1.55, marginTop: 3,
          }}>{message}</div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: font, fontSize: 16, color: cfg.c,
          opacity: 0.5, padding: "0 2px", flexShrink: 0,
          lineHeight: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; }}
      >×</button>
    </div>
  );
}

/* Timer-managed toast entry */
function _ToastEntry({ item, onDismiss }) {
  useEffect(() => {
    if (item.duration === Infinity) return;
    const t = setTimeout(() => onDismiss(item.id), item.duration);
    return () => clearTimeout(t);
  }, [item.id, item.duration, onDismiss]);

  return <_Toast {...item} onDismiss={onDismiss} />;
}

/* Provider — place once near the top of your component tree */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(id => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  const add = useCallback((type, title, message, duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(ts => [...ts, { id, type, title, message, duration }]);
    return id;
  }, []);

  const toast = useMemo(() => ({
    error:   (title, message, duration) => add("error",   title, message, duration),
    success: (title, message, duration) => add("success", title, message, duration),
    warn:    (title, message, duration) => add("warn",    title, message, duration),
    info:    (title, message, duration) => add("info",    title, message, duration),
    dismiss,
    dismissAll,
  }), [add, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast stack — bottom right, above drawer */}
      <div
        aria-label="Notifications"
        style={{
          position: "fixed",
          bottom: 60,   /* clears the DrawerPanel tab strip */
          right: 20,
          zIndex: 800,  /* below wizards (900) but above everything else */
          display: "flex",
          flexDirection: "column-reverse", /* newest at bottom */
          gap: 8,
          pointerEvents: toasts.length ? "auto" : "none",
        }}
      >
        {toasts.map(item => (
          <_ToastEntry key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * useToast — hook to fire toasts from any component.
 * Must be used inside <ToastProvider>.
 *
 * const { toast } = useToast();
 * toast.error("Title", "Optional detail message");
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return { toast: ctx };
}

/* ══════════════════════════════════════════════════════════════════════════════
   AppProviders
   ─────────────────────────────────────────────────────────────────────────────
   Single wrapper that composes all context providers.
   Place this once at the root of your app — above your router and AppShell.

   Add future providers (QueryClient, AuthContext, ThemeContext…) here
   so the rest of the app never needs to know about provider nesting.

   Usage:
     <AppProviders>
       <RouterProvider router={router} />
     </AppProviders>

   Props:
     children   ReactNode
══════════════════════════════════════════════════════════════════════════════ */

export function AppProviders({ children }) {
  return (
    <ToastProvider>
      {/* Add future providers here, e.g.:
          <QueryClientProvider client={queryClient}>
          <AuthProvider>
          etc. */}
      {children}
    </ToastProvider>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ERROR BOUNDARY
   ─────────────────────────────────────────════════════════════════════════════
   Catches JavaScript errors during rendering. Shows a fallback that matches
   the existing UI language instead of a blank screen.

   Must be a class component — React's requirement for error boundaries.

   USAGE
   ─────
   Wrap any subtree that might receive malformed data:

     // Around an entire page:
     <ErrorBoundary label="Dataset detail">
       <DatasetDetailPage />
     </ErrorBoundary>

     // Around a single panel:
     <ErrorBoundary label="Provenance timeline" compact>
       <ProvenanceTab dataset={ds} />
     </ErrorBoundary>

   Props:
     label     string    — shown in the fallback ("Dataset detail could not be displayed")
     compact   boolean   — inline fallback (single line) vs full panel
     onReset   fn        — optional callback when user clicks "Try again"
     children  ReactNode
══════════════════════════════════════════════════════════════════════════════ */

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    /* In production: forward to your error reporting service here
       e.g. Sentry.captureException(error, { extra: errorInfo }) */
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  reset() {
    this.setState({ error: null, errorInfo: null });
    this.props.onReset?.();
  }

  render() {
    if (!this.state.error) return this.props.children;

    const { label = "This section", compact = false } = this.props;
    const msg = this.state.error?.message;

    /* Compact — inline single-line fallback for panels/cards */
    if (compact) {
      return (
        <div role="alert" style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px",
          borderLeft: `3px solid ${T.badBd}`,
          background: T.badBg,
          fontFamily: font,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.bad }}>
            {label} could not be displayed.
          </span>
          {msg && (
            <span style={{ fontSize: 12, color: T.soft, flex: 1 }}>{msg}</span>
          )}
          <button
            onClick={() => this.reset()}
            style={{
              background: "none",
              border: `1px solid ${T.badBd}`,
              borderBottom: `2px solid ${T.badBd}`,
              fontFamily: font, fontSize: 11, fontWeight: 600,
              color: T.bad, padding: "2px 10px", cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    /* Full — page-level fallback */
    return (
      <div role="alert" style={{
        padding: "48px 36px",
        maxWidth: 560, margin: "0 auto",
      }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: font, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: T.bad, marginBottom: 8,
        }}>
          Rendering error
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: font, fontSize: 22, fontWeight: 700,
          color: T.ink, margin: "0 0 12px 0", letterSpacing: "-0.01em",
        }}>
          {label} could not be displayed
        </h2>

        {/* Description */}
        <p style={{
          fontFamily: font, fontSize: 14, color: T.mid,
          lineHeight: 1.7, margin: "0 0 24px 0",
        }}>
          An unexpected error occurred while rendering this section.
          Your data has not been affected. You can try reloading
          the section, or go back to the previous page.
        </p>

        {/* Error detail — collapsible, for developers */}
        {msg && (
          <details style={{ marginBottom: 24 }}>
            <summary style={{
              fontFamily: font, fontSize: 12, color: T.muted,
              cursor: "pointer", userSelect: "none", marginBottom: 8,
            }}>
              Technical details
            </summary>
            <div style={{
              fontFamily: "monospace", fontSize: 12,
              color: T.soft, lineHeight: 1.7,
              background: T.surface,
              border: `1px solid ${T.line}`,
              borderLeft: `3px solid ${T.badBd}`,
              padding: "10px 14px",
            }}>
              {msg}
              {this.state.errorInfo?.componentStack && (
                <pre style={{
                  margin: "8px 0 0 0", fontSize: 11,
                  color: T.muted, whiteSpace: "pre-wrap",
                  overflowWrap: "break-word",
                }}>
                  {this.state.errorInfo.componentStack.trim()}
                </pre>
              )}
            </div>
          </details>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => this.reset()}
            style={{
              background: T.ink, border: "none",
              color: T.white, fontFamily: font,
              fontSize: 13, fontWeight: 600,
              padding: "8px 20px", cursor: "pointer",
            }}
          >
            Try again
          </button>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "none",
              border: `1px solid ${T.line}`,
              borderBottom: `2px solid ${T.lineH}`,
              color: T.mid, fontFamily: font,
              fontSize: 13, fontWeight: 500,
              padding: "8px 20px", cursor: "pointer",
            }}
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }
}



/* ══════════════════════════════════════════════════════════════════════════════
   FILE UPLOAD
   ─────────────────────────────────────────────────────────────────────────────
   FileUploadZone — drag-and-drop / click-to-browse upload widget that manages
   multiple files through a state machine:

     idle        → drop zone shown, "Browse…" button
     uploading   → progress bar + filename + abort button (per file)
     done        → filename pill + remove button; "Upload another file" below
     error       → inline error with retry button

   Each file is tracked independently so multiple uploads can run and complete
   at different times.

   REAL UPLOAD INTEGRATION
   ───────────────────────
   Pass an `onUpload` async function that receives a File and an
   `onProgress(pct)` callback. Return the S3 key or URL on success:

     async function uploadToS3(file, onProgress) {
       const form = new FormData();
       form.append("file", file);
       // XHR so we get progress events — fetch doesn't support them yet
       return new Promise((resolve, reject) => {
         const xhr = new XMLHttpRequest();
         xhr.upload.onprogress = e => onProgress(Math.round(e.loaded / e.total * 100));
         xhr.onload  = () => resolve(JSON.parse(xhr.response).key);
         xhr.onerror = () => reject(new Error("Upload failed"));
         xhr.open("POST", "/api/upload");
         xhr.send(form);
       });
     }

     <FileUploadZone onUpload={uploadToS3} onComplete={keys => setUploadedKeys(keys)} />

   If no `onUpload` prop is passed the component simulates progress (demo mode).

   Props:
     onUpload    async (file, onProgress) => string   — returns S3 key / URL
     onComplete  (results: {file, key}[]) => void     — called when any file finishes
     accept      string    — MIME type filter, e.g. "text/csv,application/json"
     maxSizeMb   number    — max file size in MB (default 200)
     destination string    — label shown in the drop zone, e.g. "s3://odm-outputs/"
══════════════════════════════════════════════════════════════════════════════ */

/* File states */
const _FS = { IDLE: "idle", UPLOADING: "uploading", DONE: "done", ERROR: "error" };

/* Format bytes as human-readable */
function _fmtBytes(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* Single file row — uploading / done / error */
function _FileRow({ entry, onAbort, onRemove, onRetry }) {
  const { id, file, state, progress, error, key } = entry;

  /* Colour scheme by state */
  const accent = state === _FS.DONE  ? T.ok
               : state === _FS.ERROR ? T.bad
               : T.info;
  const accentBg = state === _FS.DONE  ? T.okBg
                 : state === _FS.ERROR ? T.badBg
                 : T.infoBg;
  const accentBd = state === _FS.DONE  ? T.okBd
                 : state === _FS.ERROR ? T.badBd
                 : T.infoBd;

  return (
    <div style={{
      border: `1px solid ${accentBd}`,
      borderLeft: `3px solid ${accent}`,
      background: accentBg,
      padding: "10px 12px",
      marginBottom: 6,
    }}>
      {/* Filename + size + right-side action */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: state === _FS.UPLOADING ? 8 : 0 }}>
        {/* File icon */}
        <span aria-hidden="true" style={{ fontFamily: font, fontSize: 15, color: accent, flexShrink: 0, lineHeight: 1 }}>
          {state === _FS.DONE ? "✓" : state === _FS.ERROR ? "✕" : "↑"}
        </span>

        {/* Name + size */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "monospace", fontSize: 12, fontWeight: 600,
            color: T.ink, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {file.name}
          </div>
          <div style={{ fontFamily: font, fontSize: 11, color: T.muted, marginTop: 1 }}>
            {_fmtBytes(file.size)}
            {state === _FS.DONE && key && (
              <span style={{ marginLeft: 8, color: T.ok }}>→ {key}</span>
            )}
            {state === _FS.ERROR && error && (
              <span style={{ marginLeft: 8, color: T.bad }}>{error}</span>
            )}
          </div>
        </div>

        {/* Action button */}
        {state === _FS.UPLOADING && (
          <button
            onClick={() => onAbort(id)}
            aria-label={`Abort upload of ${file.name}`}
            style={{
              background: "none",
              border: `1px solid ${T.infoBd}`,
              borderBottom: `2px solid ${T.info}`,
              fontFamily: font, fontSize: 11, fontWeight: 600,
              color: T.info, padding: "3px 10px",
              cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
            }}
          >
            Abort
          </button>
        )}
        {state === _FS.DONE && (
          <button
            onClick={() => onRemove(id)}
            aria-label={`Remove ${file.name}`}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: font, fontSize: 16, color: T.ok,
              opacity: 0.6, padding: "0 4px", flexShrink: 0,
              lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; }}
          >
            ×
          </button>
        )}
        {state === _FS.ERROR && (
          <button
            onClick={() => onRetry(id)}
            aria-label={`Retry upload of ${file.name}`}
            style={{
              background: "none",
              border: `1px solid ${T.badBd}`,
              borderBottom: `2px solid ${T.bad}`,
              fontFamily: font, fontSize: 11, fontWeight: 600,
              color: T.bad, padding: "3px 10px",
              cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
            }}
          >
            Retry
          </button>
        )}
      </div>

      {/* Progress bar — only during upload */}
      {state === _FS.UPLOADING && (
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Uploading ${file.name}: ${progress}%`}
          style={{
            height: 3,
            background: T.lineL,
            overflow: "hidden",
          }}
        >
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: T.info,
            transition: "width 0.15s ease",
          }} />
        </div>
      )}
    </div>
  );
}

/* Simulate progressive upload for demo mode */
function _simulateUpload(file, onProgress, signal) {
  return new Promise((resolve, reject) => {
    let pct = 0;
    const step = () => {
      if (signal?.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
      pct = Math.min(100, pct + Math.floor(Math.random() * 18) + 6);
      onProgress(pct);
      if (pct >= 100) {
        setTimeout(() => resolve(`s3://odm-outputs/${file.name}`), 200);
      } else {
        setTimeout(step, 120 + Math.random() * 180);
      }
    };
    setTimeout(step, 80);
  });
}

export function FileUploadZone({
  onUpload,
  onComplete,
  accept,
  maxSizeMb = 200,
  destination = "s3://odm-outputs/",
}) {
  const [files, setFiles]   = useState([]);   // _FileRow entries
  const [dragOver, setDragOver] = useState(false);
  const inputRef   = useRef(null);
  const abortRefs  = useRef({});  // id → AbortController

  /* Update a single file entry by id */
  const patch = useCallback((id, updates) => {
    setFiles(fs => fs.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  /* Start uploading one File object */
  const startUpload = useCallback(async (file) => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      const id = `f-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setFiles(fs => [...fs, {
        id, file, state: _FS.ERROR, progress: 0, key: null,
        error: `File exceeds ${maxSizeMb} MB limit`,
      }]);
      return;
    }

    const id  = `f-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ctrl = new AbortController();
    abortRefs.current[id] = ctrl;

    setFiles(fs => [...fs, { id, file, state: _FS.UPLOADING, progress: 0, key: null, error: null }]);

    const uploadFn = onUpload ?? ((f, onProg) => _simulateUpload(f, onProg, ctrl.signal));

    try {
      const key = await uploadFn(file, pct => patch(id, { progress: pct }), ctrl.signal);
      patch(id, { state: _FS.DONE, progress: 100, key });
      onComplete?.([{ file, key }]);
    } catch (err) {
      if (err.name === "AbortError") {
        /* Remove aborted file from the list cleanly */
        setFiles(fs => fs.filter(f => f.id !== id));
      } else {
        patch(id, { state: _FS.ERROR, error: err.message ?? "Upload failed" });
      }
    } finally {
      delete abortRefs.current[id];
    }
  }, [onUpload, onComplete, maxSizeMb, patch]);

  /* Handle file selection — from input or drop */
  const handleFiles = useCallback((fileList) => {
    Array.from(fileList).forEach(startUpload);
  }, [startUpload]);

  const handleDrop = e => {
    e.preventDefault(); setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAbort  = id => { abortRefs.current[id]?.abort(); };
  const handleRemove = id => { setFiles(fs => fs.filter(f => f.id !== id)); };
  const handleRetry  = id => {
    const entry = files.find(f => f.id === id);
    if (!entry) return;
    setFiles(fs => fs.filter(f => f.id !== id));
    startUpload(entry.file);
  };

  const anyUploading = files.some(f => f.state === _FS.UPLOADING);
  const allDone      = files.length > 0 && files.every(f => f.state === _FS.DONE);
  const hasDone      = files.some(f => f.state === _FS.DONE);

  return (
    <div>
      {/* Existing file rows */}
      {files.length > 0 && (
        <div style={{ marginBottom: 8 }} role="list" aria-label="Uploaded files">
          {files.map(entry => (
            <div key={entry.id} role="listitem">
              <_FileRow
                entry={entry}
                onAbort={handleAbort}
                onRemove={handleRemove}
                onRetry={handleRetry}
              />
            </div>
          ))}
        </div>
      )}

      {/* Drop zone — always shown unless all uploads are in flight */}
      {!anyUploading && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            padding: hasDone ? "10px 16px" : "24px 16px",
            border: `2px dashed ${dragOver ? T.ink : T.lineH}`,
            background: dragOver ? T.card : T.white,
            textAlign: "center",
            transition: "background 0.1s, border-color 0.1s",
            cursor: "pointer",
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={hasDone ? "Upload another file" : "Upload a file — click or drag and drop"}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        >
          {/* Compact "add another" state */}
          {hasDone ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ fontFamily: font, fontSize: 13, color: T.mid, fontWeight: 500 }}>
                + Upload another file
              </span>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: font, fontSize: 13, color: T.muted, marginBottom: 10 }}>
                {dragOver ? "Release to upload" : "Drop a file here or click to browse"}
              </div>
              <button
                onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                style={{
                  background: "none",
                  border: `1px solid ${T.line}`,
                  borderBottom: `2px solid ${T.lineH}`,
                  fontFamily: font, fontSize: 12, fontWeight: 600,
                  color: T.mid, padding: "5px 14px", cursor: "pointer",
                }}
              >
                Browse…
              </button>
              <div style={{ fontFamily: font, fontSize: 11, color: T.faint, marginTop: 10 }}>
                {destination} · max {maxSizeMb} MB
              </div>
            </>
          )}

          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
            style={{ display: "none" }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* While uploading: drop zone is replaced by a subtle "queuing" note */}
      {anyUploading && (
        <div style={{
          padding: "10px 14px",
          border: `1px solid ${T.infoBd}`,
          background: T.infoBg,
          fontFamily: font, fontSize: 12, color: T.info,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span aria-hidden="true">↑</span>
          Upload in progress — additional files can be queued after current uploads complete.
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════════════
   SQL WORKBENCH
   ─────────────────────────────────────────────────────────────────────────────
   SqlWorkbench — full SQL editor + results panel, designed to live inside
   a DrawerPanel. Manages its own query state machine.

   LAYOUT
   ──────
   • half state  : editor fills the pane, results hidden (no space)
   • full state  : editor occupies ~38% of height, results the rest
     The split is a fixed ratio — draggable divider is a future enhancement.

   QUERY STATE MACHINE
   ───────────────────
   idle      → no query run yet
   running   → executing, shows spinner row + abort button
   success   → results table with row count + execution time
   empty     → query returned zero rows
   error     → DuckDB/API error message, formatted clearly

   REAL DUCKDB WASM INTEGRATION
   ────────────────────────────
   Pass a `runQuery` async function:

     async function runQuery(sql, signal) {
       const conn = await db.connect();           // duckdb-wasm connection
       const result = await conn.query(sql);      // Arrow Table
       return {
         columns: result.schema.fields.map(f => ({ name: f.name, type: f.type.toString() })),
         rows:    result.toArray().map(r => r.toJSON()),
         rowCount: result.numRows,
       };
     }

     <SqlWorkbench drawerState={drawerState} runQuery={runQuery} />

   Without a `runQuery` prop the component uses built-in mock data (demo mode).

   Props:
     drawerState   "collapsed"|"half"|"full"
     runQuery      async (sql, signal) => { columns, rows, rowCount }
     initialSql    string        — starting SQL text
     maxRows       number        — display cap (default 500)
     onSqlChange   (sql) => void — called on every edit (for saving)
══════════════════════════════════════════════════════════════════════════════ */

/* Query result states */
const _QS = { IDLE: "idle", RUNNING: "running", SUCCESS: "success", EMPTY: "empty", ERROR: "error" };

/* Infer a rough column display width from the DuckDB type string */
function _colWidth(type = "", name = "") {
  const t = type.toLowerCase();
  if (t.includes("bool"))                    return 60;
  if (t.includes("int") || t.includes("float") || t.includes("double")) return 100;
  if (t.includes("date") || t.includes("time")) return 140;
  if (name.toLowerCase().includes("id"))     return 100;
  return 200;  /* default for VARCHAR / BLOB / unknown */
}

/* Format a cell value for display */
function _fmtCell(v) {
  if (v === null || v === undefined) return { text: "NULL", isNull: true };
  if (typeof v === "boolean")        return { text: v ? "true" : "false", isBool: true };
  if (typeof v === "number")         return { text: v.toLocaleString("en-CH"), isNum: true };
  if (v instanceof Date)             return { text: v.toISOString().replace("T", " ").slice(0, 19), isDate: true };
  const s = String(v);
  return { text: s, isTrunc: s.length > 80, display: s.length > 80 ? s.slice(0, 80) + "…" : s };
}

/* ── Mock data for demo mode ── */
const _MOCK_RESULT = {
  columns: [
    { name: "station_id", type: "VARCHAR" },
    { name: "mode",       type: "VARCHAR" },
    { name: "total",      type: "INTEGER" },
    { name: "updated",    type: "TIMESTAMP" },
    { name: "quality_flag", type: "VARCHAR" },
  ],
  rows: [
    { station_id: "ZH-048", mode: "BIKE",     total: 18340, updated: new Date("2025-03-18T03:12:00"), quality_flag: "OK" },
    { station_id: "ZH-012", mode: "PED",      total: 15920, updated: new Date("2025-03-18T03:12:00"), quality_flag: "OK" },
    { station_id: "ZH-031", mode: "BIKE",     total: 14200, updated: new Date("2025-03-18T03:12:00"), quality_flag: "IMPUTED" },
    { station_id: "ZH-048", mode: "PED",      total: 13780, updated: new Date("2025-03-18T03:12:00"), quality_flag: "OK" },
    { station_id: "ZH-019", mode: "ESCOOTER", total:  4320, updated: new Date("2025-03-18T03:12:00"), quality_flag: "SUSPECT" },
    { station_id: "ZH-007", mode: "BIKE",     total:  3910, updated: new Date("2025-03-17T03:12:00"), quality_flag: "OK" },
    { station_id: "ZH-033", mode: "PED",      total:  null, updated: null,                            quality_flag: null },
  ],
  rowCount: 7,
};

async function _mockRun(sql, signal) {
  await new Promise((res, rej) => {
    const t = setTimeout(res, 800 + Math.random() * 400);
    signal?.addEventListener("abort", () => { clearTimeout(t); rej(new DOMException("Aborted", "AbortError")); });
  });
  if (sql.toLowerCase().includes("error")) throw new Error("column \"nonexistent\" does not exist");
  if (sql.toLowerCase().includes("empty")) return { columns: _MOCK_RESULT.columns, rows: [], rowCount: 0 };
  return { ..._MOCK_RESULT, elapsed: (0.08 + Math.random() * 0.3).toFixed(3) };
}

/* ── Results table ─────────────────────────────────────────────────────────── */
function _ResultsTable({ columns, rows, totalRows, maxRows }) {
  const capped   = rows.length < totalRows;
  const firstNum = columns.findIndex(c => {
    const t = c.type?.toLowerCase() ?? "";
    return t.includes("int") || t.includes("float") || t.includes("double");
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Cap notice */}
      {capped && (
        <div style={{
          flexShrink: 0, padding: "5px 14px",
          background: T.warnBg, borderBottom: `1px solid ${T.warnBd}`,
          fontFamily: font, fontSize: 11, color: T.warn, fontWeight: 500,
        }}>
          Showing first {maxRows.toLocaleString()} of {totalRows.toLocaleString()} rows
          — add LIMIT to your query to fetch a specific slice.
        </div>
      )}

      {/* Table scroll area */}
      <div style={{ flex: 1, overflow: "auto", scrollbarWidth: "thin" }}>
        <table style={{
          borderCollapse: "collapse",
          tableLayout: "fixed",
          fontFamily: font, fontSize: 12,
          minWidth: "100%",
        }}>
          <colgroup>
            {/* Row number gutter */}
            <col style={{ width: 44 }} />
            {columns.map((col, i) => (
              <col key={i} style={{ width: _colWidth(col.type, col.name) }} />
            ))}
          </colgroup>

          <thead>
            <tr style={{ position: "sticky", top: 0, zIndex: 2 }}>
              {/* Row number gutter header */}
              <th style={{
                background: T.surface, borderBottom: `2px solid ${T.line}`,
                borderRight: `1px solid ${T.lineL}`,
                padding: "6px 8px", textAlign: "right",
                color: T.faint, fontSize: 10, fontWeight: 400,
                userSelect: "none",
              }}>#</th>
              {columns.map((col, i) => (
                <th key={i} style={{
                  background: T.surface,
                  borderBottom: `2px solid ${T.line}`,
                  borderRight: i < columns.length - 1 ? `1px solid ${T.lineL}` : "none",
                  padding: "6px 10px",
                  textAlign: "left",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  <div style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: T.ink }}>
                    {col.name}
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: T.muted, fontWeight: 400, marginTop: 1 }}>
                    {col.type}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? T.white : T.card }}>
                {/* Row number */}
                <td style={{
                  padding: "5px 8px", textAlign: "right",
                  borderRight: `1px solid ${T.lineL}`,
                  color: T.faint, fontSize: 10, fontFamily: mono,
                  userSelect: "none", borderBottom: `1px solid ${T.lineL}`,
                }}>{ri + 1}</td>

                {columns.map((col, ci) => {
                  const raw  = row[col.name];
                  const cell = _fmtCell(raw);
                  return (
                    <td
                      key={ci}
                      title={cell.isTrunc ? cell.text : undefined}
                      style={{
                        padding: "5px 10px",
                        borderRight: ci < columns.length - 1 ? `1px solid ${T.lineL}` : "none",
                        borderBottom: `1px solid ${T.lineL}`,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        maxWidth: _colWidth(col.type, col.name),
                        /* Semantically colour different value types */
                        fontFamily: (cell.isNum || cell.isDate) ? mono : font,
                        color: cell.isNull  ? T.faint
                             : cell.isNum   ? T.ink
                             : cell.isBool  ? T.info
                             : T.soft,
                        fontStyle: cell.isNull ? "italic" : "normal",
                        textAlign: cell.isNum ? "right" : "left",
                      }}
                    >
                      {cell.isNull ? "NULL" : (cell.display ?? cell.text)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── SqlWorkbench ──────────────────────────────────────────────────────────── */
export function SqlWorkbench({
  drawerState,
  runQuery,
  initialSql = "SELECT *\nFROM   ds_001\nLIMIT  50;",
  maxRows = 500,
  onSqlChange,
  onActionsChange,   /* (ReactNode) => void — lets DrawerPanel host Run/Abort/Clear */
}) {
  const [sql, setSql]       = useState(initialSql);
  const [qState, setQState] = useState(_QS.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState(null);
  const abortRef            = useRef(null);
  const editorRef           = useRef(null);

  /* Results panel height — animates open when results arrive */
  const hasResults = qState !== _QS.IDLE;
  /* Results get ~55% of full height, nothing in half (auto-expand fires) */
  const RESULTS_H  = drawerState === "full"
    ? `${Math.floor((window.innerHeight - 116) * 0.55)}px`
    : "0px";

  const handleSqlChange = e => {
    setSql(e.target.value);
    onSqlChange?.(e.target.value);
  };

  const handleRun = async () => {
    if (qState === _QS.RUNNING) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setQState(_QS.RUNNING);
    setError(null);
    setResult(null);
    const t0 = performance.now();

    const fn = runQuery ?? _mockRun;
    try {
      const res = await fn(sql, ctrl.signal);
      const ms  = ((performance.now() - t0) / 1000).toFixed(3);
      const displayRows = res.rows.slice(0, maxRows);
      if (displayRows.length === 0) {
        setQState(_QS.EMPTY);
      } else {
        setResult({ ...res, rows: displayRows, elapsed: res.elapsed ?? ms });
        setQState(_QS.SUCCESS);
        /* Auto-expand to full so results table is visible */
        window.dispatchEvent(new CustomEvent("odm:drawer:expand"));
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setQState(_QS.IDLE);
      } else {
        setError(err.message ?? "Query failed");
        setQState(_QS.ERROR);
      }
    }
  };

  const handleAbort = () => { abortRef.current?.abort(); };

  const handleClear = () => {
    setQState(_QS.IDLE);
    setResult(null);
    setError(null);
    editorRef.current?.focus();
  };

  /* Ctrl+Enter to run */
  const handleKeyDown = e => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRun();
    }
  };

  /* ── Shared button style for tab-strip actions ── */
  const actionBtn = (label, onClick, opts = {}) => (
    <button
      onClick={onClick}
      title={opts.title ?? label}
      aria-label={opts.title ?? label}
      style={{
        background: opts.primary ? T.ink : opts.danger ? T.badBg : "none",
        border: `1px solid ${opts.primary ? T.ink : opts.danger ? T.badBd : T.line}`,
        borderBottom: `2px solid ${opts.primary ? T.ink : opts.danger ? T.bad : T.lineH}`,
        color: opts.primary ? T.white : opts.danger ? T.bad : T.mid,
        fontFamily: font, fontSize: 11, fontWeight: 600,
        padding: "2px 10px", cursor: "pointer",
        whiteSpace: "nowrap", flexShrink: 0,
      }}
    >{label}</button>
  );

  /* Push current actions up to DrawerPanel whenever query state changes */
  useEffect(() => {
    if (!onActionsChange) return;
    const kbdStyle = {
      fontFamily: mono, fontSize: 10,
      color: T.faint,
      border: `1px solid ${T.lineL}`,
      borderBottom: `2px solid ${T.line}`,
      borderRadius: 0, padding: "0 4px",
      lineHeight: "15px", background: T.surface,
    };
    const node = (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {qState === _QS.RUNNING
          ? actionBtn("■ Abort", handleAbort, { danger: true, title: "Abort query" })
          : actionBtn("▶ Run", handleRun, { primary: true, title: "Run query (⌘↵)" })
        }
        {qState === _QS.RUNNING
          ? null
          : <kbd style={kbdStyle}>⌘↵</kbd>
        }
        {qState !== _QS.IDLE && (
          actionBtn("✕ Clear", handleClear, { title: "Clear results" })
        )}
        {result?.elapsed && (
          <span style={{ fontFamily: mono, fontSize: 11, color: T.muted }}>
            {result.rowCount.toLocaleString()} rows · {result.elapsed}s
          </span>
        )}
      </div>
    );
    onActionsChange(node);
  }, [qState, result, onActionsChange]);  // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── Editor — always fills available space above results ── */}
      <textarea
        ref={editorRef}
        value={sql}
        onChange={handleSqlChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        aria-label="SQL editor"
        style={{
          flex: 1,
          fontFamily: mono, fontSize: 13, color: T.ink,
          background: T.page, border: "none", outline: "none",
          padding: "12px 16px", resize: "none",
          lineHeight: 1.9, boxSizing: "border-box",
          minHeight: 0,
        }}
      />

      {/* ── Results pane — slides in via max-height transition ── */}
      {(
        <div style={{
          maxHeight: hasResults ? RESULTS_H : "0px",
          transition: "max-height 0.25s ease",
          borderTop: hasResults ? `2px solid ${T.line}` : "none",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          background: T.white,
        }}>

          {/* idle */}
          {qState === _QS.IDLE && (
            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 8,
            }}>
              <span style={{ fontFamily: font, fontSize: 13, color: T.faint }}>
                Press <kbd style={{ fontFamily: mono, fontSize: 11, border: `1px solid ${T.lineL}`, borderBottom: `2px solid ${T.line}`, padding: "0 5px", borderRadius: 0, background: T.surface }}>⌘↵</kbd> to run the query
              </span>
            </div>
          )}

          {/* running — animated shimmer rows */}
          {qState === _QS.RUNNING && (
            <div style={{ flex: 1, padding: "16px 14px" }}>
              {[100, 72, 88, 60, 94].map((w, i) => (
                <div key={i} style={{
                  height: 14, marginBottom: 10,
                  background: `linear-gradient(90deg, ${T.lineL} 25%, ${T.surface} 50%, ${T.lineL} 75%)`,
                  backgroundSize: "400% 100%",
                  animation: "odm-shimmer 1.4s ease infinite",
                  width: `${w}%`, borderRadius: 0,
                }} />
              ))}
              <style>{`@keyframes odm-shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }`}</style>
            </div>
          )}

          {/* error */}
          {qState === _QS.ERROR && (
            <div style={{
              flex: 1, padding: "16px 18px",
              borderLeft: `3px solid ${T.badBd}`,
            }}>
              <div style={{ fontFamily: font, fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: T.bad, marginBottom: 6 }}>
                Query error
              </div>
              <div style={{ fontFamily: mono, fontSize: 12, color: T.bad, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {error}
              </div>
            </div>
          )}

          {/* empty */}
          {qState === _QS.EMPTY && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: font, fontSize: 13, color: T.muted }}>
                Query returned 0 rows.
              </span>
            </div>
          )}

          {/* success — results table */}
          {qState === _QS.SUCCESS && result && (
            <_ResultsTable
              columns={result.columns}
              rows={result.rows}
              totalRows={result.rowCount}
              maxRows={maxRows}
            />
          )}
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════════════
   DIALOG / WIZARD SYSTEM
   ─────────────────────────────────────────────────────────────────────────────
   Three self-contained wizards, all sharing the same shell primitives:

   WizardShell        — Modal overlay + card chrome (header, step bar, footer)
   WizardStep         — Renders one step's content with scroll
   WizardProgressBar  — Numbered step strip with done/active/pending states

   RegisterAssetWizard  — Declare a new data asset (4 steps)
                          Step 1: Entry type (upload / S3 URL / Qlik)
                          Step 2: Basic metadata (name, description, tags)
                          Step 3: Provenance (varies by path)
                          Step 4: Review & confirm

   AddDistributionWizard — Add a distribution (file / API / service) to an
                           existing dataset (3 steps)
                           Step 1: Distribution type
                           Step 2: Access details (URL, format, licence)
                           Step 3: Review & confirm

   AddPersonWizard      — Register a new actor / contact (2 steps)
                          Step 1: Identity (name, org, role, type)
                          Step 2: Contact & confirm

   useWizard            — Shared state hook (step, errors, field values)
══════════════════════════════════════════════════════════════════════════════ */

/* ── Shared wizard primitives ──────────────────────────────────────────────── */

const _wiz = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 900,
    background: "rgba(26,26,26,0.55)",
    display: "flex", alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 48, paddingBottom: 48,
    overflowY: "auto",
  },
  card: {
    background: T.white,
    width: "100%", maxWidth: 560,
    margin: "0 16px 48px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    display: "flex", flexDirection: "column",
  },
  header: {
    padding: "16px 20px",
    borderBottom: `3px solid ${T.lu.red}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  body: {
    padding: "22px 20px",
    overflowY: "auto",
    maxHeight: "calc(100vh - 280px)",
  },
  footer: {
    padding: "14px 20px",
    borderTop: `1px solid ${T.line}`,
    background: T.surface,
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
};

const _wizInput = {
  fontFamily: font, fontSize: 13, color: T.ink,
  background: T.white, border: `1px solid ${T.line}`,
  borderBottom: `2px solid ${T.lineH}`,
  padding: "7px 10px", outline: "none",
  width: "100%", boxSizing: "border-box",
  borderRadius: 0,
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

function _WizField({ label, required, error, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontFamily: font, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.09em", textTransform: "uppercase",
        color: error ? T.bad : T.muted, marginBottom: 5,
      }}>
        {label}{required && <span style={{ color: T.bad }}> *</span>}
      </div>
      {children}
      {hint && !error && <div style={{ fontFamily: font, fontSize: 11, color: T.faint, marginTop: 3 }}>{hint}</div>}
      {error && <div style={{ fontFamily: font, fontSize: 12, color: T.bad, marginTop: 3 }}>{error}</div>}
    </div>
  );
}

function _WizInput({ value, onChange, placeholder, style }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} style={{ ..._wizInput, ...style }} />
  );
}

function _WizTextarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      style={{ ..._wizInput, resize: "vertical", lineHeight: 1.55 }} />
  );
}

function _WizSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        ..._wizInput,
        cursor: "pointer",
        paddingRight: 32,
        background: `${T.surface} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23606060'/%3E%3C/svg%3E") no-repeat right 10px center`,
        backgroundSize: "10px 6px",
        fontWeight: 500,
      }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function _WizOptionCard({ id, title, sub, selected, onSelect }) {
  return (
    <div onClick={() => onSelect(id)}
      style={{
        padding: "14px 16px", marginBottom: 8, cursor: "pointer",
        border: `1px solid ${selected ? T.lineH : T.line}`,
        borderLeft: `3px solid ${selected ? T.ink : T.lineL}`,
        background: selected ? T.card : T.white,
        transition: "all 0.1s",
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = T.card; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = T.white; }}
    >
      <div style={{ fontFamily: font, fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 3 }}>
        {title}
      </div>
      {sub && <div style={{ fontFamily: font, fontSize: 12, color: T.muted }}>{sub}</div>}
    </div>
  );
}

function _WizReviewRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 6, alignItems: "baseline" }}>
      <span style={{
        fontFamily: font, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: T.muted, width: 100, flexShrink: 0,
      }}>{label}</span>
      <span style={{ fontFamily: font, fontSize: 13, color: T.ink }}>{value}</span>
    </div>
  );
}

function _WizReviewSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontFamily: font, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: T.muted, marginBottom: 8,
        paddingBottom: 6, borderBottom: `1px solid ${T.lineL}`,
      }}>{title}</div>
      {children}
    </div>
  );
}

/* ── WizardProgressBar ──────────────────────────────────────────────────────── */

function WizardProgressBar({ steps, current }) {
  return (
    <div style={{ display: "flex", borderBottom: `1px solid ${T.line}` }}>
      {steps.map((label, i) => {
        const n     = i + 1;
        const done  = n < current;
        const active = n === current;
        return (
          <div key={label} style={{
            flex: 1, padding: "8px 4px", textAlign: "center",
            borderBottom: active ? `2px solid ${T.ink}` : "2px solid transparent",
            background: done ? T.surface : "transparent",
          }}>
            <span style={{
              fontFamily: font, fontSize: 11,
              fontWeight: active ? 700 : 400,
              letterSpacing: "0.07em", textTransform: "uppercase",
              color: done ? T.ok : active ? T.ink : T.faint,
            }}>
              {done ? "✓ " : ""}{label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── WizardShell ────────────────────────────────────────────────────────────── */
/* Shared modal frame used by all three wizards.
   Props:
     title        string       — e.g. "Register asset"
     stepLabel    string       — current step name shown in header
     steps        string[]     — all step names for the progress bar
     currentStep  number       — 1-based
     totalSteps   number
     onClose      fn
     onBack       fn | null
     onNext       fn           — validate + advance
     nextLabel    string       — button label (default "Continue →")
     nextDisabled boolean
     confirmColor string       — confirm button colour (default T.lu.red)
     children     ReactNode    — step body
*/
export function WizardShell({
  title, stepLabel, steps, currentStep, totalSteps,
  onClose, onBack, onNext, nextLabel = "Continue →",
  nextDisabled = false, confirmColor = T.lu.red,
  children,
}) {
  /* Stop body scroll while open */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isFinal = currentStep === totalSteps;

  return (
    <div style={_wiz.overlay} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
        style={_wiz.card}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={_wiz.header}>
          <div>
            <div style={{
              fontFamily: font, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: T.muted, marginBottom: 3,
            }}>{title}</div>
            <div id="wizard-title" style={{ fontFamily: font, fontSize: 17, fontWeight: 700, color: T.ink }}>
              {stepLabel}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close dialog" style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: font, fontSize: 22, color: T.muted,
            lineHeight: 1, padding: "0 4px",
          }}>×</button>
        </div>

        {/* Progress bar */}
        <WizardProgressBar steps={steps} current={currentStep} />

        {/* Body — aria-live so screen readers announce step changes */}
        <div style={_wiz.body} aria-live="polite" aria-atomic="true">{children}</div>

        {/* Footer */}
        <div style={_wiz.footer}>
          <div>
            {onBack && (
              <button onClick={onBack} aria-label="Go to previous step" style={{
                background: "none",
                border: `1px solid ${T.line}`, borderBottom: `2px solid ${T.lineH}`,
                fontFamily: font, fontSize: 12, fontWeight: 500,
                color: T.muted, padding: "5px 14px", cursor: "pointer",
              }}>← Back</button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: font, fontSize: 11, color: T.faint }}>
              Step {currentStep} of {totalSteps}
            </span>
            <button onClick={onNext} disabled={nextDisabled} style={{
              background: nextDisabled ? T.surface : (isFinal ? confirmColor : T.ink),
              border: "none", color: nextDisabled ? T.muted : T.white,
              fontFamily: font, fontSize: 12, fontWeight: 600,
              padding: "6px 18px", cursor: nextDisabled ? "default" : "pointer",
              transition: "background 0.1s",
            }}>
              {isFinal ? "Confirm & register" : nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   RegisterAssetWizard
   Declare a brand-new data asset in the catalogue.

   Props:
     onClose     fn
     onRegister  ({ name, description, tags, assetType, provenance }) => void
     datasets    { id, name, source, assetType }[]   — for upstream search
     mobile      boolean
══════════════════════════════════════════════════════════════════════════════ */

export function RegisterAssetWizard({ onClose, onRegister, datasets = [], mobile }) {
  const STEPS = ["Entry", "Metadata", "Provenance", "Review"];

  const [step, setStep]               = useState(1);
  const [errors, setErrors]           = useState({});

  /* Step 1 */
  const [entryType, setEntryType]     = useState("");   // "upload"|"s3"|"qlik"
  const [s3Url, setS3Url]             = useState("");
  const [qlikUrl, setQlikUrl]         = useState("");

  /* Step 2 */
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags]               = useState("");

  /* Step 3 */
  const [outputsPath, setOutputsPath] = useState("");   // "derived"|"scratch"|"received"
  const [upstreams, setUpstreams]     = useState([]);   // dataset ids
  const [receptionOrg, setReceptionOrg] = useState("");
  const [channel, setChannel]         = useState("MFT");
  const [servedDs, setServedDs]       = useState([]);
  const [audience, setAudience]       = useState("");

  /* Bucket classification */
  const bucket = (() => {
    if (!s3Url) return null;
    if (s3Url.startsWith("s3://odm-bronze/")) return "bronze";
    if (s3Url.startsWith("s3://odm-silver/")) return "silver";
    if (s3Url.startsWith("s3://odm-gold/"))   return "gold";
    if (s3Url.startsWith("s3://odm-outputs/")) return "outputs";
    if (s3Url.startsWith("s3://"))             return "s3-other";
    return null;
  })();

  const pipelineBucket = bucket === "bronze" || bucket === "silver" || bucket === "gold";

  /* Derived asset type */
  const assetType = entryType === "qlik" ? "dashboard"
    : bucket === "outputs" && outputsPath === "received" ? "source"
    : "output";

  /* Validate each step */
  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!entryType) e.entryType = "Please choose an entry type.";
      if (entryType === "s3" && !s3Url.trim()) e.s3Url = "S3 URL is required.";
      if (entryType === "qlik" && !qlikUrl.trim()) e.qlikUrl = "Qlik URL is required.";
    }
    if (step === 2) {
      if (!name.trim()) e.name = "Name is required.";
    }
    if (step === 3) {
      if (entryType === "qlik" && servedDs.length === 0)
        e.served = "Select at least one dataset this dashboard serves.";
      if (bucket === "outputs" && !outputsPath)
        e.outputsPath = "Please select how this dataset came to exist.";
      if (bucket === "outputs" && outputsPath === "received" && !receptionOrg.trim())
        e.receptionOrg = "Source organisation is required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const advance = () => { if (validate()) setStep(s => s + 1); };
  const back    = () => { setErrors({}); setStep(s => s - 1); };

  const confirm = () => {
    onRegister?.({ name, description, tags, assetType,
      provenance: { entryType, bucket, outputsPath, upstreams, receptionOrg, channel } });
    onClose();
  };

  /* Step 1 body */
  const step1 = (
    <>
      {errors.entryType && <StatusPanel type="danger">{errors.entryType}</StatusPanel>}
      <_WizOptionCard id="upload" title="Upload a file"
        sub="Upload directly — stored in s3://odm-outputs/ and registered."
        selected={entryType === "upload"} onSelect={setEntryType} />
      <_WizOptionCard id="s3" title="Paste an S3 URL"
        sub="Register an existing file already in the bronze, silver, gold or outputs bucket."
        selected={entryType === "s3"} onSelect={setEntryType} />
      <_WizOptionCard id="qlik" title="Qlik dashboard URL"
        sub="Register a Qlik dashboard as a data service in the catalogue."
        selected={entryType === "qlik"} onSelect={setEntryType} />

      {entryType === "upload" && (
        <div style={{ marginTop: 14 }}>
          <FileUploadZone
            destination="s3://odm-outputs/"
            onComplete={results => {
              /* Auto-populate the S3 URL field from the first completed upload */
              if (results[0]?.key) setS3Url(results[0].key);
            }}
          />
        </div>
      )}
      {entryType === "s3" && (
        <_WizField label="S3 URL" error={errors.s3Url}>
          <_WizInput value={s3Url} onChange={setS3Url}
            placeholder="s3://odm-gold/modal-split/2025-q1.parquet" />
          {bucket && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: font, fontSize: 12, color: T.muted }}>Bucket:</span>
              <BucketBadge bucket={bucket} />
              {pipelineBucket && (
                <span style={{ fontFamily: font, fontSize: 12, color: T.ok }}>
                  Airflow metadata extracted automatically
                </span>
              )}
            </div>
          )}
        </_WizField>
      )}
      {entryType === "qlik" && (
        <_WizField label="Qlik dashboard URL" error={errors.qlikUrl}>
          <_WizInput value={qlikUrl} onChange={setQlikUrl}
            placeholder="https://qlik.idm.lu/sense/app/abc123/sheet/def456" />
        </_WizField>
      )}
    </>
  );

  /* Step 2 body */
  const step2 = (
    <>
      <_WizField label="Name" required error={errors.name}>
        <_WizInput value={name} onChange={setName} placeholder="e.g. Modal Split ZH 2025–Q2" />
      </_WizField>
      <_WizField label="Description"
        hint="What does this dataset contain? Who produced it?">
        <_WizTextarea value={description} onChange={setDescription}
          placeholder="Concise description of the dataset and its contents." />
      </_WizField>
      <_WizField label="Tags" hint="Comma-separated — e.g. modal-split, cycling, ZH">
        <_WizInput value={tags} onChange={setTags}
          placeholder="modal-split, cycling, ZH" />
      </_WizField>
      {bucket && (
        <div style={{ display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", background: T.surface,
          borderLeft: `3px solid ${T.lineH}` }}>
          <span style={{ fontFamily: font, fontSize: 12, color: T.muted }}>Bucket:</span>
          <BucketBadge bucket={bucket} />
        </div>
      )}
    </>
  );

  /* Step 3 body — branches by path */
  const step3 = (() => {
    if (entryType === "qlik") return (
      <>
        <div style={{ fontFamily: font, fontSize: 13, color: T.soft, lineHeight: 1.65, marginBottom: 14 }}>
          Which ODM datasets does this dashboard serve?
        </div>
        <DatasetSearchWidget datasets={datasets} selected={servedDs} onChange={setServedDs}
          placeholder="Search datasets served by this dashboard…" />
        {errors.served && <div style={{ fontFamily: font, fontSize: 12, color: T.bad, marginTop: 6 }}>{errors.served}</div>}
        <_WizField label="Intended audience" hint="e.g. IDM internal, ARE, public" style={{ marginTop: 14 }}>
          <_WizInput value={audience} onChange={setAudience} placeholder="IDM internal, ARE, public" />
        </_WizField>
      </>
    );

    if (pipelineBucket) return (
      <StatusPanel type="ok" title="Provenance extracted from Airflow">
        The pipeline metadata (DAG, upstream datasets, schedule) for this{" "}
        <BucketBadge bucket={bucket} /> asset will be pulled automatically from
        the Airflow API when you confirm. You can review and adjust in the
        Provenance tab after registration.
      </StatusPanel>
    );

    if (bucket === "outputs" && !outputsPath) return (
      <>
        {errors.outputsPath && <StatusPanel type="danger">{errors.outputsPath}</StatusPanel>}
        <div style={{ fontFamily: font, fontSize: 13, color: T.soft, lineHeight: 1.65, marginBottom: 14 }}>
          How did this dataset come to exist?
        </div>
        <_WizOptionCard id="derived"  title="We derived this"
          sub="Produced from other ODM datasets — a transformation, query or manual analysis."
          selected={outputsPath === "derived"}  onSelect={setOutputsPath} />
        <_WizOptionCard id="scratch"  title="We created this from scratch"
          sub="An original reference file, document or dataset with no ODM upstream."
          selected={outputsPath === "scratch"}  onSelect={setOutputsPath} />
        <_WizOptionCard id="received" title="We received this"
          sub="Delivered from outside — a new source arriving in our outputs bucket."
          selected={outputsPath === "received"} onSelect={setOutputsPath} />
      </>
    );

    if (bucket === "outputs" && outputsPath === "derived") return (
      <>
        <div style={{ fontFamily: font, fontSize: 13, color: T.soft, lineHeight: 1.65, marginBottom: 14 }}>
          Search for the ODM datasets this was derived from.
        </div>
        <DatasetSearchWidget datasets={datasets} selected={upstreams} onChange={setUpstreams} />
        {upstreams.length === 0 && (
          <div style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 8,
            borderLeft: `3px solid ${T.lineL}`, paddingLeft: 10 }}>
            No upstream selected — will be recorded as manual creation with no tracked lineage.
          </div>
        )}
      </>
    );

    if (bucket === "outputs" && outputsPath === "scratch") return (
      <StatusPanel type="info" title="Created from scratch">
        This dataset will be registered as an original creation with no upstream ODM
        dependencies. A Manual activity will be recorded as its provenance origin.
      </StatusPanel>
    );

    if (bucket === "outputs" && outputsPath === "received") return (
      <>
        <div style={{ fontFamily: font, fontSize: 13, color: T.soft, lineHeight: 1.65, marginBottom: 14 }}>
          Record the reception details for this external delivery.
        </div>
        <_WizField label="Source organisation" required error={errors.receptionOrg}>
          <_WizInput value={receptionOrg} onChange={setReceptionOrg}
            placeholder="e.g. Statec, MDDI, Canton GE" />
        </_WizField>
        <_WizField label="Channel">
          <_WizSelect value={channel} onChange={setChannel} options={[
            { value: "MFT",         label: "MFT — Automated transfer" },
            { value: "OTX",         label: "OTX — Manual transfer" },
            { value: "Email",       label: "Email" },
            { value: "API",         label: "API / direct query" },
            { value: "Publication", label: "Report / publication" },
          ]} />
        </_WizField>
      </>
    );

    /* upload with no further classification */
    return (
      <StatusPanel type="info">
        Provenance will be recorded as a manual upload by the current user.
        You can add upstream dependencies in the Provenance tab after registration.
      </StatusPanel>
    );
  })();

  /* Step 4 — review */
  const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);
  const upDs    = upstreams.map(id => datasets.find(d => d.id === id)).filter(Boolean);
  const srvDs   = servedDs.map(id => datasets.find(d => d.id === id)).filter(Boolean);

  const step4 = (
    <>
      <_WizReviewSection title="Asset">
        <_WizReviewRow label="Name"        value={name} />
        <_WizReviewRow label="Type"        value={assetType} />
        <_WizReviewRow label="Description" value={description} />
        {tagList.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
            {tagList.map(t => (
              <span key={t} style={{ fontFamily: font, fontSize: 11, color: T.mid,
                background: T.surface, border: `1px solid ${T.lineL}`, padding: "1px 6px" }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </_WizReviewSection>

      <_WizReviewSection title="Provenance">
        {entryType === "s3"    && <_WizReviewRow label="S3 URL"  value={s3Url} />}
        {entryType === "qlik"  && <_WizReviewRow label="Qlik URL" value={qlikUrl} />}
        {bucket               && <_WizReviewRow label="Bucket"   value={bucket} />}
        {outputsPath          && <_WizReviewRow label="Origin"   value={outputsPath} />}
        {receptionOrg         && <_WizReviewRow label="From"     value={receptionOrg} />}
        {channel && outputsPath === "received" && <_WizReviewRow label="Channel" value={channel} />}
        {upDs.map(d  => <_WizReviewRow key={d.id} label="Upstream" value={`${d.name} (${d.id})`} />)}
        {srvDs.map(d => <_WizReviewRow key={d.id} label="Serves"   value={`${d.name} (${d.id})`} />)}
        {audience             && <_WizReviewRow label="Audience" value={audience} />}
      </_WizReviewSection>

      <StatusPanel type="info">
        This will create a new dataset record and a provenance activity in the
        catalogue. All fields can be edited after registration.
      </StatusPanel>
    </>
  );

  const bodies = [step1, step2, step3, step4];

  return (
    <WizardShell
      title="Register asset"
      stepLabel={STEPS[step - 1]}
      steps={STEPS}
      currentStep={step}
      totalSteps={4}
      onClose={onClose}
      onBack={step > 1 ? back : null}
      onNext={step < 4 ? advance : confirm}
      nextLabel={step === 3 && pipelineBucket ? "Confirm provenance →" : "Continue →"}
    >
      {bodies[step - 1]}
    </WizardShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   AddDistributionWizard
   Add a distribution (file, API endpoint, or service) to an existing dataset.

   A DCAT distribution describes *how* a dataset can be accessed — a download
   file, a WFS endpoint, a REST API, a dashboard link, etc.

   Props:
     onClose      fn
     onAdd        ({ type, url, format, licence, description }) => void
     datasetName  string   — name of the parent dataset (shown in header)
     mobile       boolean
══════════════════════════════════════════════════════════════════════════════ */

export function AddDistributionWizard({ onClose, onAdd, datasetName = "Dataset", mobile }) {
  const STEPS = ["Type", "Access", "Review"];

  const [step, setStep]         = useState(1);
  const [errors, setErrors]     = useState({});

  /* Step 1 */
  const [distType, setDistType] = useState(""); // "file"|"api"|"service"|"dashboard"

  /* Step 2 */
  const [url, setUrl]           = useState("");
  const [format, setFormat]     = useState("CSV");
  const [licence, setLicence]   = useState("CC-BY-4.0");
  const [distDesc, setDistDesc] = useState("");
  const [mediaType, setMediaType] = useState("");

  const validate = () => {
    const e = {};
    if (step === 1 && !distType) e.distType = "Please choose a distribution type.";
    if (step === 2 && !url.trim()) e.url = "URL or access point is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const advance = () => { if (validate()) setStep(s => s + 1); };
  const back    = () => { setErrors({}); setStep(s => s - 1); };
  const confirm = () => { onAdd?.({ distType, url, format, licence, distDesc, mediaType }); onClose(); };

  const DIST_OPTIONS = [
    { id: "file",      title: "Downloadable file",   sub: "CSV, Parquet, GeoJSON, Shapefile, XLSX, PDF…" },
    { id: "api",       title: "API / endpoint",       sub: "REST, OGC WFS/WMS, OData, SPARQL, GraphQL…" },
    { id: "service",   title: "Data service",         sub: "Streaming feed, MFT automated transfer, SFTP…" },
    { id: "dashboard", title: "Dashboard / viewer",   sub: "Qlik, Power BI, ArcGIS Online, Observable…" },
  ];

  const FORMATS = ["CSV","Parquet","GeoJSON","GeoPackage","Shapefile","XLSX","JSON","XML","RDF","PDF","Other"];
  const LICENCES = ["CC-BY-4.0","CC-BY-SA-4.0","CC0-1.0","OGL-LU","Proprietary","To be confirmed"];

  const step1 = (
    <>
      {errors.distType && <StatusPanel type="danger">{errors.distType}</StatusPanel>}
      {DIST_OPTIONS.map(o => (
        <_WizOptionCard key={o.id} id={o.id} title={o.title} sub={o.sub}
          selected={distType === o.id} onSelect={setDistType} />
      ))}
    </>
  );

  const step2 = (
    <>
      <_WizField
        label={distType === "file" ? "Download URL" : distType === "dashboard" ? "Dashboard URL" : "Access URL / endpoint"}
        required error={errors.url}
        hint={distType === "file" ? "Direct link to the file or S3 presigned URL." : distType === "api" ? "Base URL of the API endpoint." : undefined}
      >
        <_WizInput value={url} onChange={setUrl}
          placeholder={
            distType === "file"      ? "https://data.idm.lu/files/modal-split-q1.csv" :
            distType === "api"       ? "https://api.idm.lu/v1/modal-split" :
            distType === "service"   ? "sftp://transfer.idm.lu/modal-split/" :
                                       "https://qlik.idm.lu/sense/app/abc123"
          } />
      </_WizField>

      {(distType === "file" || distType === "api") && (
        <_WizField label="Format">
          <_WizSelect value={format} onChange={setFormat}
            options={FORMATS.map(f => ({ value: f, label: f }))} />
        </_WizField>
      )}

      {distType === "file" && (
        <_WizField label="Media type (MIME)" hint="e.g. text/csv, application/geo+json">
          <_WizInput value={mediaType} onChange={setMediaType} placeholder="text/csv" />
        </_WizField>
      )}

      <_WizField label="Licence / access rights">
        <_WizSelect value={licence} onChange={setLicence}
          options={LICENCES.map(l => ({ value: l, label: l }))} />
      </_WizField>

      <_WizField label="Description" hint="Optional — describe this specific access point.">
        <_WizTextarea value={distDesc} onChange={setDistDesc}
          placeholder="e.g. Monthly snapshot, refreshed on the 1st of each month." rows={2} />
      </_WizField>
    </>
  );

  const step3 = (
    <>
      <_WizReviewSection title="Distribution">
        <_WizReviewRow label="Type"    value={DIST_OPTIONS.find(o => o.id === distType)?.title ?? distType} />
        <_WizReviewRow label="URL"     value={url} />
        <_WizReviewRow label="Format"  value={format} />
        {mediaType && <_WizReviewRow label="Media type" value={mediaType} />}
        <_WizReviewRow label="Licence" value={licence} />
        <_WizReviewRow label="Notes"   value={distDesc} />
      </_WizReviewSection>
      <_WizReviewSection title="Parent dataset">
        <_WizReviewRow label="Dataset" value={datasetName} />
      </_WizReviewSection>
      <StatusPanel type="info">
        A new DCAT distribution will be added to <strong>{datasetName}</strong>.
        URL and format can be updated at any time in the dataset detail view.
      </StatusPanel>
    </>
  );

  return (
    <WizardShell
      title={`Add distribution · ${datasetName}`}
      stepLabel={STEPS[step - 1]}
      steps={STEPS}
      currentStep={step}
      totalSteps={3}
      onClose={onClose}
      onBack={step > 1 ? back : null}
      onNext={step < 3 ? advance : confirm}
    >
      {[step1, step2, step3][step - 1]}
    </WizardShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   AddPersonWizard
   Register a new actor (person or organisation) in the catalogue.

   Actors can be:
     • Internal staff  (IDM analysts, engineers, systems)
     • External orgs   (data providers, recipients)
     • Automated agents (pipelines, APIs)

   Props:
     onClose   fn
     onAdd     ({ name, org, role, type, email, provUri }) => void
     mobile    boolean
══════════════════════════════════════════════════════════════════════════════ */

export function AddPersonWizard({ onClose, onAdd, mobile }) {
  const STEPS = ["Identity", "Contact & confirm"];

  const [step, setStep]         = useState(1);
  const [errors, setErrors]     = useState({});

  /* Step 1 */
  const [actorType, setActorType] = useState(""); // "internal"|"external"|"agent"
  const [personName, setPersonName] = useState("");
  const [org, setOrg]           = useState("");
  const [role, setRole]         = useState("");

  /* Step 2 */
  const [email, setEmail]       = useState("");
  const [provUri, setProvUri]   = useState("");
  const [notes, setNotes]       = useState("");

  const ACTOR_TYPES = [
    { id: "internal", title: "IDM staff / internal",
      sub: "An IDM analyst, data engineer or internal system." },
    { id: "external", title: "External organisation",
      sub: "A data provider, federal office, cantonal authority or recipient." },
    { id: "agent",    title: "Automated agent / system",
      sub: "A pipeline, API, scheduled job or other non-human actor." },
  ];

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!actorType)         e.actorType  = "Please choose an actor type.";
      if (!personName.trim()) e.personName = "Name is required.";
      if (!role.trim())       e.role       = "Role or function is required.";
      if (actorType !== "agent" && !org.trim()) e.org = "Organisation is required.";
    }
    if (step === 2) {
      if (actorType !== "agent" && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        e.email = "Please enter a valid email address.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const advance = () => { if (validate()) setStep(s => s + 1); };
  const back    = () => { setErrors({}); setStep(s => s - 1); };
  const confirm = () => { onAdd?.({ name: personName, org, role, type: actorType, email, provUri, notes }); onClose(); };

  const step1 = (
    <>
      <div style={{ fontFamily: font, fontSize: 13, color: T.soft, lineHeight: 1.65, marginBottom: 14 }}>
        Choose the type of actor, then fill in their identity details.
      </div>
      {ACTOR_TYPES.map(o => (
        <_WizOptionCard key={o.id} id={o.id} title={o.title} sub={o.sub}
          selected={actorType === o.id} onSelect={setActorType} />
      ))}
      {actorType && (
        <div style={{ marginTop: 20, borderTop: `1px solid ${T.lineL}`, paddingTop: 16 }}>
          <_WizField label={actorType === "agent" ? "System / agent name" : "Full name"} required error={errors.personName}>
            <_WizInput value={personName} onChange={setPersonName}
              placeholder={
                actorType === "internal" ? "e.g. Nadine Hess" :
                actorType === "external" ? "e.g. ARE — Federal Roads Office" :
                "e.g. Airflow Pipeline System"
              } />
          </_WizField>

          {actorType !== "agent" && (
            <_WizField label="Organisation" required error={errors.org}>
              <_WizInput value={org} onChange={setOrg}
                placeholder={actorType === "internal" ? "Institut du développement municipal" : "e.g. OFROU / ASTRA"} />
            </_WizField>
          )}

          <_WizField label="Role / function" required error={errors.role}
            hint="e.g. Data Provider, Data Analyst, Automated System">
            <_WizInput value={role} onChange={setRole} placeholder="Data Provider" />
          </_WizField>
        </div>
      )}
    </>
  );

  const step2 = (
    <>
      {actorType !== "agent" && (
        <_WizField label="Email address" error={errors.email}
          hint="Used for PROV-O agent identification (mailto: URI).">
          <_WizInput value={email} onChange={setEmail} placeholder="nadine@idm.lu" />
        </_WizField>
      )}

      <_WizField label="PROV-O agent URI"
        hint="Optional — canonical identifier (ORCID, ROR, WebID, system URL…).">
        <_WizInput value={provUri} onChange={setProvUri}
          placeholder={
            actorType === "internal" ? "https://orcid.org/0000-…" :
            actorType === "external" ? "https://ror.org/…" :
            "https://airflow.idm.lu/home"
          } />
      </_WizField>

      <_WizField label="Notes" hint="Any additional context about this actor.">
        <_WizTextarea value={notes} onChange={setNotes} rows={2}
          placeholder="e.g. Primary contact for NPVM data deliveries." />
      </_WizField>

      <_WizReviewSection title="Summary">
        <_WizReviewRow label="Name"  value={personName} />
        {org   && <_WizReviewRow label="Org"   value={org} />}
        <_WizReviewRow label="Role"  value={role} />
        <_WizReviewRow label="Type"  value={ACTOR_TYPES.find(t => t.id === actorType)?.title ?? actorType} />
        {email    && <_WizReviewRow label="Email"    value={email} />}
        {provUri  && <_WizReviewRow label="PROV URI" value={provUri} />}
      </_WizReviewSection>

      <StatusPanel type="info">
        A new actor record will be created. They can immediately be assigned to
        reception, delivery and pipeline activities.
      </StatusPanel>
    </>
  );

  return (
    <WizardShell
      title="Add person / actor"
      stepLabel={STEPS[step - 1]}
      steps={STEPS}
      currentStep={step}
      totalSteps={2}
      onClose={onClose}
      onBack={step > 1 ? back : null}
      onNext={step < 2 ? advance : confirm}
    >
      {[step1, step2][step - 1]}
    </WizardShell>
  );
}



/* ══════════════════════════════════════════════════════════════════════════════
   DEMO — interactive showcase
══════════════════════════════════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { id: "shell",      label: "App Shell",     short: "Shell" },
  { id: "layout",     label: "Layout",        short: "Layout" },
  { id: "panels",     label: "Panels",        short: "Panels" },
  { id: "cards",      label: "Cards",         short: "Cards" },
  { id: "badges",     label: "Badges",        short: "Badges" },
  { id: "editable",   label: "Editable",      short: "Edit" },
  { id: "navigation", label: "Navigation",    short: "Nav" },
  { id: "data",       label: "Data Display",  short: "Data" },
  { id: "wizards",    label: "Wizards",       short: "Wizards" },
  { id: "feedback",   label: "Feedback",      short: "Feedback" },
];

const SAMPLE_DATASETS = [
  { id: "DS-001", name: "MobiScout Count Data",   source: "Canton ZH", assetType: "source",    tags: ["counts","cycling"], lastReceived: 3,  updated: "2025-03-18" },
  { id: "DS-002", name: "NPVM Demand Matrix",      source: "ARE",       assetType: "source",    tags: ["demand","OD"],     lastReceived: 18, updated: "2025-03-03" },
  { id: "DS-003", name: "SBB Passenger Flows",     source: "SBB",       assetType: "source",    tags: ["rail"],            lastReceived: 42, updated: "2025-02-07" },
  { id: "DS-007", name: "Modal Split ZH 2025–Q1", source: "IDM",       assetType: "output",    tags: ["modal-split"],     lastReceived: 5,  updated: "2025-03-17" },
  { id: "DS-008", name: "Motorway Dashboard",      source: "IDM",       assetType: "dashboard", tags: ["motorway","live"], lastReceived: 1,  updated: "2025-03-20" },
];

const SAMPLE_ACTORS = [
  { id: "AC-001", name: "Canton ZH",                 role: "Data Provider",       type: "external" },
  { id: "AC-002", name: "ARE — Federal Roads Office", role: "Provider & Recipient", type: "external" },
  { id: "AC-006", name: "Nadine Hess",                role: "Data Analyst",         type: "internal" },
  { id: "AC-008", name: "Airflow Pipeline System",    role: "Automated System",     type: "internal" },
];

const SAMPLE_QUERIES = [
  { id: "Q-001", name: "Monthly modal split by station", state: "implemented", authorName: "Nadine Hess",  description: "Aggregates MobiScout counts by station and mode.", sql: "SELECT station_id, mode, SUM(count) FROM ds_001 GROUP BY 1,2;" },
  { id: "Q-002", name: "Accident severity distribution",  state: "saved",       authorName: "Thomas Brun",   description: "Distribution of accident severity classifications.", sql: "SELECT severity, COUNT(*) FROM ds_004 GROUP BY severity;" },
  { id: "Q-004", name: "SBB flows quick check",           state: "draft",       authorName: "Nadine Hess",  description: "", sql: "SELECT * FROM ds_003 LIMIT 100;" },
];

const SAMPLE_FIELDS = [
  { field: "station_id",   type: "VARCHAR",   nullable: false, description: "Unique station identifier" },
  { field: "timestamp",    type: "TIMESTAMP", nullable: false, description: "Observation start time (ISO 8601)" },
  { field: "mode",         type: "VARCHAR",   nullable: false, description: "Transport mode: PED / BIKE / ESCOOTER" },
  { field: "count",        type: "INTEGER",   nullable: false, description: "Observed passage count" },
  { field: "quality_flag", type: "VARCHAR",   nullable: true,  description: "QA classification: OK / IMPUTED / SUSPECT" },
];

const SAMPLE_ACTIVITY = {
  id: "EV-002", date: "2025-03-18", type: "pipeline",
  actor: "Airflow Pipeline System",
  description: "Raw ingestion: validation, type casting, date partitioning.",
  inputs: ["MobiScout Count Data"], outputs: ["MobiScout Bronze"],
  tags: [],
};

function DemoSection({ title, sub, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ fontFamily: font, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, marginBottom: 4 }}>Component</div>
        <h2 style={{ fontFamily: font, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 4px 0" }}>{title}</h2>
        {sub && <div style={{ fontFamily: font, fontSize: 13, color: T.muted }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function DemoBox({ label, children, bg }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <div style={{ fontFamily: mono, fontSize: 10, color: T.faint, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>}
      <div style={{ background: bg ?? T.page, padding: 20, border: `1px solid ${T.lineL}` }}>
        {children}
      </div>
    </div>
  );
}

function _DemoInner() {
  const [activePage, setActivePage] = useState("shell");
  const [drawerState, setDrawerState] = useState("collapsed");
  const [activeTab, setActiveTab] = useState("info");
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [openWizard, setOpenWizard]     = useState(null);
  const [sqlActions, setSqlActions]     = useState(null);
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState("all");
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState("MobiScout Count Data");
  const [editDesc, setEditDesc] = useState("Automated pedestrian and cyclist counts at 48 monitoring stations.");
  const [selectedDs, setSelectedDs] = useState([]);

  const drawerHeights = { collapsed: 36, half: 180, full: 400 };

  /* Auto-expand drawer when SqlWorkbench fires odm:drawer:expand */
  useEffect(() => {
    const h = () => setDrawerState("full");
    window.addEventListener("odm:drawer:expand", h);
    return () => window.removeEventListener("odm:drawer:expand", h);
  }, []);
  const drawerH = drawerHeights[drawerState];

  const mobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <>
    <AppShell
      drawerHeight={drawerH}
      topBar={
        <TopBar
          mobile={mobile}
          logo={<IDMLogo mobile={mobile} />}
          actions={<>
            <GlobalSearch
              datasets={SAMPLE_DATASETS}
              actors={SAMPLE_ACTORS}
              queries={SAMPLE_QUERIES}
              onNavigate={(type, id) => console.log("navigate", type, id)}
              mobile={mobile}
            />
            <UserChip name="Nadine Hess" showLabel={!mobile} />
          </>}
        />
      }
      navBar={
        <NavBar
          items={NAV_ITEMS}
          active={activePage}
          onSelect={setActivePage}
          mobile={mobile}
          rightSlot={
            <button
              onClick={() => setDrawerState(s => s === "collapsed" ? "half" : "collapsed")}
              style={{
                background: drawerState !== "collapsed" ? "rgba(239,51,64,0.15)" : "none",
                border: "none",
                borderBottom: drawerState !== "collapsed" ? `3px solid ${T.lu.red}` : "3px solid transparent",
                color: drawerState !== "collapsed" ? "rgba(239,180,180,0.9)" : "rgba(255,255,255,0.38)",
                padding: mobile ? "9px 12px" : "10px 18px",
                cursor: "pointer", fontFamily: font,
                fontSize: mobile ? 11 : 12, fontWeight: 600,
                letterSpacing: "0.02em", whiteSpace: "nowrap",
                flexShrink: 0, marginBottom: -1,
              }}
            >
              <span>SQL</span>
              <span aria-hidden="true" style={{
                display: "inline-flex", alignItems: "center", gap: 2, marginLeft: 6,
              }}>
                {(typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)
                  ? ["⌘", "Q"] : ["Ctrl", "Q"]
                ).map((key, i) => (
                  <kbd key={i} style={{
                    fontFamily: mono, fontSize: 10, lineHeight: "15px",
                    padding: "0 3px",
                    color: drawerState !== "collapsed" ? "rgba(239,180,180,0.7)" : "rgba(255,255,255,0.25)",
                    border: `1px solid ${drawerState !== "collapsed" ? "rgba(239,120,120,0.3)" : "rgba(255,255,255,0.12)"}`,
                    borderBottom: `2px solid ${drawerState !== "collapsed" ? "rgba(239,120,120,0.2)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 0,
                  }}>{key}</kbd>
                ))}
              </span>
              {drawerState !== "collapsed" ? " ▼" : " ▲"}
            </button>
          }
        />
      }
      footer={
        <PageFooter
          year={new Date().getFullYear()}
          org="Institut du développement municipal"
          techNote="DCAT-AP · PROV-O · DuckDB WASM"
          extraBottomPad={drawerH}
          mobile={mobile}
        />
      }
      drawer={
        <DrawerPanel
          state={drawerState}
          onStateChange={setDrawerState}
          actions={sqlActions}
          tabLabel={
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span style={{ fontFamily: font, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.lu.red, flexShrink: 0 }}>SQL</span>
              <span style={{ fontFamily: mono, fontSize: 12, color: T.mid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Component Library Demo</span>
            </div>
          }
        >
          <SqlWorkbench
            drawerState={drawerState}
            onActionsChange={setSqlActions}
            initialSql={"-- SqlWorkbench demo\nSELECT *\nFROM   ds_001\nLIMIT  50;\n\n-- Tip: type 'error' or 'empty' to test those states"}
          />
        </DrawerPanel>
      }
    >
      <PageContainer mobile={mobile}>

        {/* ── SHELL ── */}
        {activePage === "shell" && (
          <div>
            <PageTitle
              section="ODM Component Library · v1.0"
              title="App Shell"
              sub="AppShell · TopBar · IDMLogo · UserChip · NavBar · PageFooter · DrawerPanel"
            />
            <StatusPanel type="ok" title="You are looking at the shell">
              The full AppShell, TopBar, NavBar, DrawerPanel, and PageFooter are live around this content. Toggle the SQL drawer with the button in the nav bar. Navigate between sections using the nav.
            </StatusPanel>
            <DemoSection title="TopBar" sub="Logo block, search trigger, user chip">
              <DemoBox label="default (rendered above)">
                <div style={{ fontFamily: font, fontSize: 13, color: T.muted }}>The TopBar is the sticky white header above, separated from the NavBar by the 3px LU.red border. It hosts the IDMLogo, SearchBar, and UserChip.</div>
              </DemoBox>
            </DemoSection>
            <DemoSection title="NavBar" sub="Dark bar with LU.red active underline + right slot">
              <DemoBox label="rendered above — click items to switch sections">
                <div style={{ fontFamily: font, fontSize: 13, color: T.muted }}>Active items get a 3px LU.red underline. The SQL toggle lives in the right slot and activates the DrawerPanel.</div>
              </DemoBox>
            </DemoSection>
            <DemoSection title="DrawerPanel" sub="3 height states: collapsed · half · full">
              <DemoBox label="toggle via the SQL button in the nav">
                <div style={{ display: "flex", gap: 8 }}>
                  {["collapsed", "half", "full"].map(s => (
                    <button key={s} onClick={() => setDrawerState(s)} style={{
                      background: drawerState === s ? T.ink : T.white,
                      color: drawerState === s ? T.white : T.mid,
                      border: `1px solid ${T.line}`, borderBottom: `2px solid ${T.lineH}`,
                      fontFamily: font, fontSize: 12, fontWeight: 600, padding: "5px 14px", cursor: "pointer",
                    }}>{s}</button>
                  ))}
                </div>
              </DemoBox>
            </DemoSection>
          </div>
        )}

        {/* ── LAYOUT ── */}
        {activePage === "layout" && (
          <div>
            <PageTitle section="ODM Component Library" title="Layout"
              sub="PageContainer · MasterDetailShell · OverviewLayout · SplitLayout · StackPanel" />

            <DemoSection title="MasterDetailShell"
              sub="Router-ready two-column shell. Layout only — selection state lives in the URL.">

              <DemoBox label="how it maps to React Router routes">
                <div style={{ fontFamily: "monospace", fontSize: 12, color: T.mid, lineHeight: 2.2, background: T.surface, padding: 16 }}>
                  <div><span style={{color:T.muted}}>/datasets</span>{"       → "}<span style={{color:T.ok}}>{"<DatasetListPage />"}</span><span style={{color:T.faint}}>{"  // list + placeholder"}</span></div>
                  <div><span style={{color:T.muted}}>/datasets/:id</span>{"   → "}<span style={{color:T.ok}}>{"<DatasetDetailPage />"}</span><span style={{color:T.faint}}>{"  // list + detail"}</span></div>
                  <div style={{marginTop:8,color:T.mid,fontFamily:font,fontSize:12}}>
                    <code style={{fontFamily:"monospace",background:T.white,padding:"1px 5px"}}>hasDetail</code>
                    {" = Boolean(useParams().id)"}. The shell never owns selection state.
                    Deep links and browser back work for free.
                  </div>
                </div>
              </DemoBox>

              <DemoBox label="interactive preview — local state simulates navigate('/datasets/:id')">
                <div style={{ border: `1px solid ${T.line}`, overflow: "hidden", minHeight: 260 }}>
                  <MasterDetailShell
                    mobile={mobile}
                    listWidth={260}
                    hasDetail={!!selectedDemo}
                    list={
                      <div>
                        <div style={{ fontFamily: font, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 12 }}>
                          /datasets
                        </div>
                        {SAMPLE_DATASETS.map(ds => {
                          const f = freshnessCfg(ds.lastReceived);
                          const isActive = selectedDemo?.id === ds.id;
                          return (
                            <div key={ds.id} onClick={() => setSelectedDemo(ds)}
                              style={{
                                padding: "10px 12px", marginBottom: 4, cursor: "pointer",
                                background: isActive ? T.white : T.card,
                                border: `1px solid ${isActive ? T.lineH : T.line}`,
                                borderLeft: `3px solid ${isActive ? f.c : T.lineL}`,
                                display: "flex", alignItems: "center", gap: 10,
                              }}
                              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.white; }}
                              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = T.card; }}
                            >
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: f.c, flexShrink: 0, boxShadow: `0 0 0 2px ${f.bg}` }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ds.name}</div>
                                <div style={{ fontFamily: font, fontSize: 11, color: T.muted }}>{ds.source}</div>
                              </div>
                              <TypeBadge type={ds.assetType} />
                            </div>
                          );
                        })}
                      </div>
                    }
                    detail={selectedDemo ? (
                      <div>
                        <Breadcrumb backLabel="Data Assets" backOnClick={() => setSelectedDemo(null)} id={selectedDemo.id} title={selectedDemo.name} />
                        <div style={{ fontFamily: mono, fontSize: 10, color: T.faint, marginBottom: 14 }}>
                          /datasets/{selectedDemo.id}{"  — "}useParams().id = "{selectedDemo.id}"
                        </div>
                        <ContentPanel accent={freshnessCfg(selectedDemo.lastReceived).c}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
                            <TypeBadge type={selectedDemo.assetType} />
                            <FreshnessDot days={selectedDemo.lastReceived} showLabel />
                            <span style={{ fontFamily: mono, fontSize: 11, color: T.faint }}>{selectedDemo.id}</span>
                          </div>
                          <div style={{ fontFamily: font, fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{selectedDemo.name}</div>
                          <div style={{ fontFamily: font, fontSize: 13, color: T.mid, lineHeight: 1.65 }}>
                            {selectedDemo.source} · {selectedDemo.updated}
                          </div>
                        </ContentPanel>
                        <Tabs tabs={[{id:"info",label:"Information"},{id:"schema",label:"Schema"},{id:"lineage",label:"Lineage"}]} active={activeTab} onChange={setActiveTab} />
                        <div style={{ fontFamily: font, fontSize: 12, color: T.muted }}>
                          Nested routes: /datasets/{selectedDemo.id}/schema → {"<SchemaTab />"}
                        </div>
                      </div>
                    ) : null}
                  />
                </div>
              </DemoBox>
            </DemoSection>

            <DemoSection title="OverviewLayout" sub="Wide main + sticky 280px sidebar on desktop. Stacked on mobile.">
              <DemoBox label="desktop two-column layout (simulated at reduced scale)">
                <div style={{ border: `1px solid ${T.line}` }}>
                  <OverviewLayout
                    mobile={mobile}
                    headerHeight={0}
                    main={
                      <div>
                        <StatRow stats={[{n:13,label:"Assets"},{n:2,label:"Outdated"},{n:9,label:"Deliveries"},{n:3,label:"Mandates"}]} />
                        <Eyebrow style={{ marginTop: 0 }}>Source freshness</Eyebrow>
                        {SAMPLE_DATASETS.slice(0,3).map(ds => {
                          const f = freshnessCfg(ds.lastReceived);
                          return (
                            <div key={ds.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.lineL}` }}>
                              <FreshnessDot days={ds.lastReceived} />
                              <span style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: T.ink, flex: 1 }}>{ds.name}</span>
                              <span style={{ fontFamily: font, fontSize: 12, color: f.c, fontWeight: 500 }}>{f.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    }
                    sidebar={
                      <div style={{ background: T.white, border: `1px solid ${T.line}`, padding: 16 }}>
                        <Eyebrow style={{ marginTop: 0 }}>Recent activity</Eyebrow>
                        {[{date:"2025-03-20",label:"Reception",actor:"ASTRA"},{date:"2025-03-18",label:"Pipeline",actor:"Airflow"},{date:"2025-03-15",label:"Delivery",actor:"ARE"}].map((ev,i) => (
                          <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${T.lineL}`, fontFamily: font, fontSize: 12 }}>
                            <span style={{ color: T.muted, fontFamily: "monospace", marginRight: 8 }}>{ev.date}</span>
                            <span style={{ fontWeight: 600, color: T.ink }}>{ev.label}</span>
                            <span style={{ color: T.muted }}> · {ev.actor}</span>
                          </div>
                        ))}
                      </div>
                    }
                  />
                </div>
              </DemoBox>
            </DemoSection>

            <DemoSection title="SplitLayout" sub="Filter sidebar (240px) + results list. Sidebar collapses on mobile.">
              <DemoBox label="open=true, sidebar visible">
                <SplitLayout open={true} sidebarWidth={180}
                  sidebar={<div style={{ background: T.white, border: `1px solid ${T.line}`, padding: 16 }}><Eyebrow style={{ marginTop: 0 }}>Filters</Eyebrow><div style={{ fontFamily: font, fontSize: 13, color: T.muted }}>Asset type, freshness, source…</div></div>}>
                  <div style={{ background: T.white, border: `1px solid ${T.line}`, padding: 16 }}>
                    <div style={{ fontFamily: font, fontSize: 13, color: T.muted }}>Dataset list, query results…</div>
                  </div>
                </SplitLayout>
              </DemoBox>
            </DemoSection>

            <DemoSection title="StatRow" sub="KPI row — large tabular numerals, used on Overview and Actor detail pages">
              <DemoBox>
                <StatRow stats={[{n:13,label:"Registered assets"},{n:2,label:"Outdated sources"},{n:9,label:"Deliveries made"},{n:3,label:"Mandate activities"}]} />
              </DemoBox>
            </DemoSection>
          </div>
        )}

        {/* ── PANELS ── */}
        {activePage === "panels" && (
          <div>
            <PageTitle section="ODM Component Library" title="Panels" sub="ContentPanel · SectionPanel · StatusPanel" />
            <DemoSection title="ContentPanel" sub="White surface with optional left-border accent">
              <DemoBox label="with accent colours">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[[T.lu.red, "LU Red — register asset, primary CTA"], [T.ok, "Green — ok / current / origin"], [T.warn, "Amber — ageing / dissemination"], [T.bad, "Red — outdated / error"], [T.info, "Blue — pipeline / derivation"]].map(([color, label]) => (
                    <ContentPanel key={color} accent={color} hover>
                      <div style={{ fontFamily: font, fontSize: 13, color: T.ink }}>{label}</div>
                    </ContentPanel>
                  ))}
                </div>
              </DemoBox>
            </DemoSection>
            <DemoSection title="StatusPanel" sub="Left-border notice strip">
              <DemoBox>
                <StatusPanel type="ok" title="Source freshness: current">All monitored sources refreshed within 7 days.</StatusPanel>
                <StatusPanel type="warn" title="3 sources approaching 30 days">NPVM Demand Matrix · SBB Passenger Flows · Cycling Routes BS</StatusPanel>
                <StatusPanel type="danger" title="2 sources require attention">SBB Passenger Flows · Cycling Routes BS — last received more than 30 days ago.</StatusPanel>
                <StatusPanel type="info">Select a dataset to view its full provenance chain.</StatusPanel>
              </DemoBox>
            </DemoSection>
            <DemoSection title="SectionPanel" sub="Eyebrow + optional right-slot + content">
              <DemoBox>
                <SectionPanel eyebrow="Source freshness" right={<button style={{ fontFamily: font, fontSize: 11, color: T.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>View all →</button>}>
                  <div style={{ fontFamily: font, fontSize: 13, color: T.mid }}>Section content goes here…</div>
                </SectionPanel>
              </DemoBox>
            </DemoSection>
            <DemoSection title="ProvenanceCard" sub="Origin / reuse card with vertical-divider column panels">
              <DemoBox>
                <ProvenanceCard
                  accent={T.ok}
                  headerLeft={<span style={{ fontFamily: font, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.ok }}>Reception — primary source</span>}
                  headerRight={<span style={{ fontFamily: mono, fontSize: 10, color: T.ok, opacity: 0.7 }}>EV-001 · 2025-03-18</span>}
                  description="Monthly count data delivery received via secure SFTP transfer from Canton ZH."
                  panels={[
                    { label: "Agent", content: <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: T.ink }}>Canton ZH</div> },
                    { label: "Source", content: <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: T.ink }}>Canton ZH<span style={{ fontFamily: mono, fontSize: 10, color: T.faint, marginLeft: 6 }}>external</span></div> },
                    { label: "Channel", content: <div style={{ fontFamily: mono, fontSize: 12, color: T.mid }}>MFT</div> },
                  ]}
                />
                <ProvenanceCard
                  accent={T.info}
                  headerLeft={<span style={{ fontFamily: font, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.info }}>Derivation — derived asset</span>}
                  headerRight={<span style={{ fontFamily: mono, fontSize: 10, color: T.info, opacity: 0.7 }}>EV-004 · 2025-03-17</span>}
                  description="Monthly modal split aggregation joined with zone reference file."
                  panels={[
                    { label: "Agent", content: <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: T.ink }}>Airflow Pipeline</div> },
                    { label: "Derived from", content: <div><div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: T.ink }}>MobiScout Silver</div><div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: T.ink }}>Traffic Reference Zones</div></div> },
                    { label: "Plan", content: <div style={{ fontFamily: mono, fontSize: 11, color: T.mid }}>DAG modal-split-monthly</div> },
                  ]}
                />
              </DemoBox>
            </DemoSection>
          </div>
        )}

        {/* ── CARDS ── */}
        {activePage === "cards" && (
          <div>
            <PageTitle section="ODM Component Library" title="Cards" sub="EntryCard · StatCard · MetaRow" />
            <DemoSection title="EntryCard" sub="The core registry list item — used for datasets, queries, actors">
              <DemoBox>
                <EntryCard
                  statusColor={T.ok} statusBg={T.okBg} accentColor={T.ok}
                  header={<>
                    <span style={{ fontFamily: mono, fontSize: 11, color: T.muted }}>DS-001</span>
                    <span style={{ fontFamily: font, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.muted }}>Canton ZH</span>
                    <span style={{ fontFamily: mono, fontSize: 11, color: T.faint }}>2025-03-18</span>
                    <TypeBadge type="source" />
                    <FreshnessDot days={3} showLabel />
                  </>}
                  title="MobiScout Count Data"
                  description="Automated pedestrian and cyclist counts at 48 monitoring stations across the canton."
                  footer={<>
                    <InlineTag ok>Schema</InlineTag>
                    <span style={{ fontFamily: font, fontSize: 11, color: T.faint }}>5 outputs</span>
                    <span style={{ fontFamily: font, fontSize: 11, color: T.faint }}>counts · pedestrian · cycling</span>
                    <span style={{ marginLeft: "auto", fontFamily: font, fontSize: 12, fontWeight: 600, color: T.mid }}>View →</span>
                  </>}
                />
                <EntryCard
                  statusColor={T.bad} statusBg={T.badBg} accentColor={T.bad}
                  header={<>
                    <span style={{ fontFamily: mono, fontSize: 11, color: T.muted }}>DS-003</span>
                    <span style={{ fontFamily: font, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.muted }}>SBB</span>
                    <TypeBadge type="source" />
                    <FreshnessDot days={42} showLabel />
                  </>}
                  title="SBB Passenger Flows"
                  description="Station entry and exit counts from the SBB Railnet monitoring system."
                  footer={<>
                    <InlineTag warn>No schema</InlineTag>
                    <span style={{ marginLeft: "auto", fontFamily: font, fontSize: 12, fontWeight: 600, color: T.mid }}>View →</span>
                  </>}
                />
              </DemoBox>
            </DemoSection>
            <DemoSection title="MetaRow" sub="Label/value field in the Information grid — supports view and edit modes">
              <DemoBox>
                <FormActions editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} onCancel={() => { setEditing(false); setEditVal("MobiScout Count Data"); }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  <MetaRow label="Name" span editing={editing}
                    value={editVal}
                    editNode={<EditableLabel value={editVal} onChange={setEditVal} editing={editing} placeholder="Dataset name" />}
                  />
                  <MetaRow label="Description" span editing={editing}
                    value={editDesc}
                    editNode={<EditableLabel value={editDesc} onChange={setEditDesc} editing={editing} multiline placeholder="What does this dataset contain?" />}
                  />
                  <MetaRow label="Dataset identifier" value="DS-001" readOnly editing={editing} />
                  <MetaRow label="Asset type" value="source" readOnly editing={editing} />
                  <MetaRow label="Schema (CSVW)" value="Available" readOnly editing={editing} />
                  <MetaRow label="Derived outputs" value="5 registered" readOnly editing={editing} />
                </div>
              </DemoBox>
            </DemoSection>
          </div>
        )}

        {/* ── BADGES ── */}
        {activePage === "badges" && (
          <div>
            <PageTitle section="ODM Component Library" title="Badges & Labels" sub="TypeBadge · StateBadge · FreshnessDot · InlineTag · BucketBadge" />
            <DemoSection title="TypeBadge" sub="Coloured uppercase pill for asset type">
              <DemoBox>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["source", "output", "dashboard", "pipeline", "geodata"].map(t => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </div>
              </DemoBox>
            </DemoSection>
            <DemoSection title="StateBadge" sub="Query lifecycle state">
              <DemoBox>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["draft", "saved", "implemented", "archived"].map(s => (
                    <StateBadge key={s} state={s} />
                  ))}
                </div>
              </DemoBox>
            </DemoSection>
            <DemoSection title="FreshnessDot" sub="Coloured dot with optional label — from days-since-received">
              <DemoBox>
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  {[3, 18, 45].map(d => (
                    <FreshnessDot key={d} days={d} showLabel />
                  ))}
                </div>
              </DemoBox>
            </DemoSection>
            <DemoSection title="InlineTag" sub="Minimal semantic tag">
              <DemoBox>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <InlineTag ok>Schema defined</InlineTag>
                  <InlineTag warn>No schema</InlineTag>
                  <InlineTag>Neutral</InlineTag>
                </div>
              </DemoBox>
            </DemoSection>
            <DemoSection title="BucketBadge" sub="S3 storage tier indicator">
              <DemoBox>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["bronze", "silver", "gold", "outputs", "s3-other"].map(b => (
                    <BucketBadge key={b} bucket={b} />
                  ))}
                </div>
              </DemoBox>
            </DemoSection>
          </div>
        )}

        {/* ── EDITABLE ── */}
        {activePage === "editable" && (
          <div>
            <PageTitle section="ODM Component Library" title="Editable Components" sub="EditableLabel · EditableSelect · FieldGroup · FormActions · DatasetSearchWidget" />
            <DemoSection title="EditableLabel" sub="Seamless view→edit transition. Click 'Edit' to activate.">
              <DemoBox>
                <FormActions editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} onCancel={() => setEditing(false)} />
                <FieldGroup label="Dataset name" required>
                  <EditableLabel value={editVal} onChange={setEditVal} editing={editing} placeholder="Name…" />
                </FieldGroup>
                <FieldGroup label="Description">
                  <EditableLabel value={editDesc} onChange={setEditDesc} editing={editing} multiline placeholder="Description…" />
                </FieldGroup>
              </DemoBox>
            </DemoSection>
            <DemoSection title="EditableSelect" sub="Dropdown that renders as plain text in view mode">
              <DemoBox>
                <EditableSelect
                  value="MFT"
                  options={[
                    { id: "MFT", label: "MFT — Automated transfer" },
                    { id: "OTX", label: "OTX — Manual transfer" },
                    { id: "Email", label: "Email" },
                    { id: "API", label: "API / direct query" },
                  ]}
                  editing={editing}
                />
              </DemoBox>
            </DemoSection>
            <DemoSection title="FieldGroup" sub="Label + input + error helper">
              <DemoBox>
                <FieldGroup label="Source organisation" required error="Source organisation is required.">
                  <input placeholder="e.g. Statec, MDDI, Canton GE" style={{ ...inputBase, display: "block" }} />
                </FieldGroup>
                <FieldGroup label="Description">
                  <input placeholder="Free text" style={{ ...inputBase, display: "block" }} />
                </FieldGroup>
              </DemoBox>
            </DemoSection>
            <DemoSection title="DatasetSearchWidget" sub="Multi-select dataset picker with type-to-filter dropdown">
              <DemoBox>
                <DatasetSearchWidget
                  datasets={SAMPLE_DATASETS}
                  selected={selectedDs}
                  onChange={setSelectedDs}
                  placeholder="Search datasets by name, ID, or source…"
                />
              </DemoBox>
            </DemoSection>
          </div>
        )}

        {/* ── NAVIGATION ── */}
        {activePage === "navigation" && (
          <div>
            <PageTitle section="ODM Component Library" title="Navigation" sub="Tabs · TypeFilter · Breadcrumb" />
            <DemoSection title="Tabs" sub="Underline tab bar — used in Dataset detail">
              <DemoBox>
                <Tabs
                  tabs={[{ id: "info", label: "Information" }, { id: "schema", label: "Schema" }, { id: "lineage", label: "Lineage" }, { id: "provenance", label: "Provenance" }]}
                  active={activeTab}
                  onChange={setActiveTab}
                />
                <div style={{ fontFamily: font, fontSize: 13, color: T.muted }}>Active tab: <strong>{activeTab}</strong></div>
              </DemoBox>
            </DemoSection>
            <DemoSection title="TypeFilter" sub="Asset-type quick-filter — used on Datasets page">
              <DemoBox>
                <TypeFilter
                  types={[
                    { id: "all", label: "All assets" }, { id: "source", label: "Sources" },
                    { id: "output", label: "Outputs" }, { id: "dashboard", label: "Dashboards" },
                    { id: "pipeline", label: "Pipelines" }, { id: "geodata", label: "Geodata" },
                  ]}
                  value={typeFilter}
                  onChange={setTypeFilter}
                />
                <div style={{ fontFamily: font, fontSize: 13, color: T.muted }}>Active filter: <strong>{typeFilter}</strong></div>
              </DemoBox>
            </DemoSection>
            <DemoSection title="Breadcrumb" sub="Back link + id crumb + page title">
              <DemoBox>
                <Breadcrumb backLabel="Data Assets" backOnClick={() => {}} id="DS-001" title="MobiScout Count Data" />
              </DemoBox>
            </DemoSection>
          </div>
        )}

        {/* ── DATA DISPLAY ── */}
        {activePage === "data" && (
          <div>
            <PageTitle section="ODM Component Library" title="Data Display" sub="Eyebrow · PageTitle · SchemaTable · ActivityEntry · StatRow" />
            <DemoSection title="PageTitle" sub="Section label + h1 + subtitle + right slot">
              <DemoBox>
                <PageTitle
                  section="Data Catalogue · DCAT-AP"
                  title="Data Assets"
                  sub="13 of 13 assets"
                  right={
                    <button style={{ background: T.ink, border: "none", color: T.white, fontFamily: font, fontSize: 12, fontWeight: 600, padding: "7px 16px", cursor: "pointer" }}>
                      + Register asset
                    </button>
                  }
                />
              </DemoBox>
            </DemoSection>
            <DemoSection title="SchemaTable" sub="CSVW column definitions — used in Dataset detail → Schema tab">
              <DemoBox bg={T.white}>
                <SchemaTable fields={SAMPLE_FIELDS} />
              </DemoBox>
            </DemoSection>
            <DemoSection title="ActivityEntry" sub="PROV-O event row in a timeline">
              <DemoBox bg={T.white}>
                <ActivityEntry ev={SAMPLE_ACTIVITY} />
                <ActivityEntry
                  ev={{ id: "EV-005", date: "2025-03-15", type: "delivery", actor: "ARE — Federal Roads Office", description: "Quarterly modal split report delivered for national monitoring programme.", inputs: ["Modal Split ZH 2025–Q1"], outputs: [], tags: ["mobility-planning"] }}
                  last
                />
              </DemoBox>
            </DemoSection>
            <DemoSection title="Eyebrow" sub="ALL-CAPS section label">
              <DemoBox bg={T.white}>
                <Eyebrow style={{ marginTop: 0 }}>Source freshness</Eyebrow>
                <Eyebrow>Recent activity</Eyebrow>
                <Eyebrow>Original sources · 2 sources</Eyebrow>
              </DemoBox>
            </DemoSection>
          </div>
        )}

        {/* ── WIZARDS ── */}
        {activePage === "wizards" && (
          <div>
            <PageTitle section="ODM Component Library" title="Wizards & Dialogs"
              sub="RegisterAssetWizard · AddDistributionWizard · AddPersonWizard" />

            <StatusPanel type="info">
              Wizards are modal overlays rendered outside the AppShell so they cover
              the full viewport. On mobile the card expands to fill the screen. Click
              any button below to open a live wizard.
            </StatusPanel>

            <DemoSection title="RegisterAssetWizard"
              sub="4-step wizard to declare a new data asset. Entry type → metadata → provenance → review.">
              <DemoBox label="click to open">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setOpenWizard("asset")} style={{
                    background: T.ink, border: "none", color: T.white,
                    fontFamily: font, fontSize: 13, fontWeight: 600,
                    padding: "8px 20px", cursor: "pointer",
                  }}>+ Register asset</button>
                </div>
                <div style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 10, lineHeight: 1.65 }}>
                  Three entry paths: <strong>Upload a file</strong>, <strong>Paste an S3 URL</strong> (auto-detects
                  bronze/silver/gold bucket and offers Airflow extraction), or <strong>Qlik dashboard URL</strong>.
                  Step 3 branches based on the chosen path and bucket tier.
                </div>
              </DemoBox>
            </DemoSection>

            <DemoSection title="AddDistributionWizard"
              sub="3-step wizard to attach a DCAT distribution (file, API, service, dashboard) to an existing dataset.">
              <DemoBox label="click to open">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setOpenWizard("distribution")} style={{
                    background: T.white, border: `1px solid ${T.line}`,
                    borderBottom: `2px solid ${T.lineH}`,
                    color: T.ink, fontFamily: font, fontSize: 13, fontWeight: 600,
                    padding: "8px 20px", cursor: "pointer",
                  }}>+ Add distribution</button>
                </div>
                <div style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 10, lineHeight: 1.65 }}>
                  Distribution types: downloadable file, API/endpoint, data service (SFTP/MFT), or dashboard viewer.
                  Captures URL, format, media type and licence. Parent dataset name shown in header.
                </div>
              </DemoBox>
            </DemoSection>

            <DemoSection title="AddPersonWizard"
              sub="2-step wizard to register a new actor — internal staff, external organisation, or automated agent.">
              <DemoBox label="click to open">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setOpenWizard("person")} style={{
                    background: T.white, border: `1px solid ${T.line}`,
                    borderBottom: `2px solid ${T.lineH}`,
                    color: T.ink, fontFamily: font, fontSize: 13, fontWeight: 600,
                    padding: "8px 20px", cursor: "pointer",
                  }}>+ Add person / actor</button>
                </div>
                <div style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 10, lineHeight: 1.65 }}>
                  Actor types: IDM staff / internal, external organisation, or automated agent.
                  Identity fields adapt per type (agents have no email or org). Captures PROV-O agent URI
                  (ORCID, ROR, WebID…).
                </div>
              </DemoBox>
            </DemoSection>

            <DemoSection title="FileUploadZone"
              sub="Drag-and-drop / click-to-browse upload with per-file progress bars, abort, remove and retry. Multiple files run concurrently.">
              <DemoBox label="interactive — uses simulated upload progress">
                <FileUploadZone destination="s3://odm-outputs/" />
              </DemoBox>
            </DemoSection>

            <DemoSection title="WizardShell" sub="Shared modal frame — use directly for custom wizards.">
              <DemoBox label="props">
                <div style={{ fontFamily: "monospace", fontSize: 12, color: T.mid, lineHeight: 2 }}>
                  title · stepLabel · steps[] · currentStep · totalSteps<br/>
                  onClose · onBack · onNext · nextLabel · nextDisabled · confirmColor<br/>
                  children (step body)
                </div>
              </DemoBox>
            </DemoSection>
          </div>
        )}


        {/* ── FEEDBACK ── */}
        {activePage === "feedback" && (
          <div>
            <PageTitle section="ODM Component Library" title="Feedback"
              sub="ToastProvider · useToast · ErrorBoundary" />

            <StatusPanel type="info">
              Wrap your app once with <code style={{fontFamily:"monospace"}}>{"<ToastProvider>"}</code>{" "}
              then call <code style={{fontFamily:"monospace"}}>useToast()</code> anywhere in the tree.
              The <code style={{fontFamily:"monospace"}}>ErrorBoundary</code> is a class component — wrap
              any subtree that might receive malformed data.
            </StatusPanel>

            <DemoSection title="Toast — all four types"
              sub="Click each button to fire a toast. They auto-dismiss after 5 seconds.">
              <DemoBox>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => toast.error("Registration failed", "POST /datasets returned 503 — please try again.")}
                    style={{ background: T.bad, border: "none", color: T.white, fontFamily: font, fontSize: 12, fontWeight: 600, padding: "7px 16px", cursor: "pointer" }}>
                    ✕ Error
                  </button>
                  <button onClick={() => toast.success("Asset registered", "MobiScout Count Data was added to the catalogue.")}
                    style={{ background: T.ok, border: "none", color: T.white, fontFamily: font, fontSize: 12, fontWeight: 600, padding: "7px 16px", cursor: "pointer" }}>
                    ✓ Success
                  </button>
                  <button onClick={() => toast.warn("Stale data", "SBB Passenger Flows was last received 42 days ago.")}
                    style={{ background: T.warn, border: "none", color: T.white, fontFamily: font, fontSize: 12, fontWeight: 600, padding: "7px 16px", cursor: "pointer" }}>
                    ⚠ Warning
                  </button>
                  <button onClick={() => toast.info("Airflow extraction", "Pipeline metadata is being extracted in the background.")}
                    style={{ background: T.info, border: "none", color: T.white, fontFamily: font, fontSize: 12, fontWeight: 600, padding: "7px 16px", cursor: "pointer" }}>
                    i Info
                  </button>
                  <button onClick={() => toast.error("Persistent error", "This one won\'t auto-dismiss.", Infinity)}
                    style={{ background: "none", border: `1px solid ${T.line}`, borderBottom: `2px solid ${T.lineH}`, color: T.mid, fontFamily: font, fontSize: 12, fontWeight: 600, padding: "7px 16px", cursor: "pointer" }}>
                    Persistent (Infinity)
                  </button>
                </div>
              </DemoBox>
            </DemoSection>

            <DemoSection title="ErrorBoundary — compact"
              sub="Inline single-line fallback for panels and cards.">
              <DemoBox label="simulated render error inside a panel">
                <ErrorBoundary label="Provenance timeline" compact>
                  <div style={{ padding: "12px 16px", background: T.white, border: `1px solid ${T.line}` }}>
                    This content renders fine until an error is thrown.
                    In production, a bad API response or null dataset would trigger this.
                  </div>
                </ErrorBoundary>
              </DemoBox>
            </DemoSection>

            <DemoSection title="ErrorBoundary — full page"
              sub="Full fallback for page-level failures. Includes collapsible technical details.">
              <DemoBox label="what a user sees when a page crashes">
                <div style={{ border: `1px solid ${T.line}` }}>
                  <div role="alert" style={{ padding: "48px 36px", maxWidth: 560 }}>
                    <div style={{ fontFamily: font, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.bad, marginBottom: 8 }}>
                      Rendering error
                    </div>
                    <h2 style={{ fontFamily: font, fontSize: 22, fontWeight: 700, color: T.ink, margin: "0 0 12px 0", letterSpacing: "-0.01em" }}>
                      Dataset detail could not be displayed
                    </h2>
                    <p style={{ fontFamily: font, fontSize: 14, color: T.mid, lineHeight: 1.7, margin: "0 0 24px 0" }}>
                      An unexpected error occurred while rendering this section.
                      Your data has not been affected.
                    </p>
                    <details style={{ marginBottom: 24 }}>
                      <summary style={{ fontFamily: font, fontSize: 12, color: T.muted, cursor: "pointer", marginBottom: 8 }}>Technical details</summary>
                      <div style={{ fontFamily: "monospace", fontSize: 12, color: T.soft, background: T.surface, border: `1px solid ${T.line}`, borderLeft: `3px solid ${T.badBd}`, padding: "10px 14px" }}>
                        Cannot read properties of undefined (reading \'name\')
                      </div>
                    </details>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button style={{ background: T.ink, border: "none", color: T.white, fontFamily: font, fontSize: 13, fontWeight: 600, padding: "8px 20px", cursor: "pointer" }}>Try again</button>
                      <button style={{ background: "none", border: `1px solid ${T.line}`, borderBottom: `2px solid ${T.lineH}`, color: T.mid, fontFamily: font, fontSize: 13, padding: "8px 20px", cursor: "pointer" }}>← Go back</button>
                    </div>
                  </div>
                </div>
              </DemoBox>
            </DemoSection>

            <DemoSection title="Usage pattern" sub="How these two work together in practice">
              <DemoBox>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: T.mid, lineHeight: 2, background: T.surface, padding: 16 }}>
                  <div style={{ color: T.muted }}>{"// 1. Wrap once at the app root"}</div>
                  <div>{`<ToastProvider>`}</div>
                  <div style={{ paddingLeft: 16 }}>{`<ErrorBoundary label="App">`}</div>
                  <div style={{ paddingLeft: 32 }}>{`<AppShell ... />`}</div>
                  <div style={{ paddingLeft: 16 }}>{`</ErrorBoundary>`}</div>
                  <div>{`</ToastProvider>`}</div>
                  <div style={{ marginTop: 12, color: T.muted }}>{"// 2. Fire toasts from async handlers"}</div>
                  <div>{`const { toast } = useToast();`}</div>
                  <div style={{ color: T.muted }}>{"// catch (err) {"}</div>
                  <div>{`toast.error("Save failed", err.message);`}</div>
                  <div style={{ color: T.muted }}>{"// }"}</div>
                </div>
              </DemoBox>
            </DemoSection>
          </div>
        )}

      </PageContainer>
    </AppShell>

      {/* ── Wizard modals — rendered outside AppShell so they overlay everything ── */}
      {openWizard === "asset" && (
        <RegisterAssetWizard
          onClose={() => setOpenWizard(null)}
          onRegister={data => { console.log("Registered:", data); }}
          datasets={SAMPLE_DATASETS}
          mobile={mobile}
        />
      )}
      {openWizard === "distribution" && (
        <AddDistributionWizard
          onClose={() => setOpenWizard(null)}
          onAdd={data => { console.log("Distribution added:", data); }}
          datasetName="MobiScout Count Data"
          mobile={mobile}
        />
      )}
      {openWizard === "person" && (
        <AddPersonWizard
          onClose={() => setOpenWizard(null)}
          onAdd={data => { console.log("Actor added:", data); }}
          mobile={mobile}
        />
      )}
    </>
  );
}

export default function ComponentLibraryDemo() {
  return (
    <AppProviders>
      <_DemoInner />
    </AppProviders>
  );
}