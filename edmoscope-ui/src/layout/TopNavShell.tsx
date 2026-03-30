import React from "react";

/**
 * TopNavShell — application shell with a full-width horizontal navigation bar.
 *
 * The top bar contains: logo (left) | nav tabs (centre-left) | search + actions (right).
 * The main content area scrolls below the fixed-height header.
 *
 * Compose the `nav` slot with `NavTab` items.
 * Compose the `search` slot with `GlobalSearch` (trigger button only —
 * GlobalSearch renders its own fullscreen overlay).
 * Compose the `actions` slot with `UserChip`, notification buttons, etc.
 *
 * @example
 * <TopNavShell
 *   logo={<IDMLogo compact />}
 *   nav={
 *     <>
 *       <NavTab label="Overview"  icon="▣" isActive onClick={() => navigate("/")} />
 *       <NavTab label="Datasets"  icon="▤" onClick={() => navigate("/datasets")} />
 *       <NavTab label="Queries"   icon="⌕" onClick={() => navigate("/queries")} />
 *       <NavTab label="Actors"    icon="◎" onClick={() => navigate("/actors")} />
 *     </>
 *   }
 *   search={
 *     <GlobalSearch
 *       open={searchOpen}
 *       onOpen={() => setSearchOpen(true)}
 *       onClose={() => setSearchOpen(false)}
 *       query={query}
 *       onQueryChange={setQuery}
 *       results={results}
 *       onSelect={r => navigate(`/datasets/${r.id}`)}
 *     />
 *   }
 *   actions={<UserChip name="Julie Schmit" />}
 * >
 *   <Outlet />
 * </TopNavShell>
 */
export interface TopNavShellProps {
  /**
   * Logo / wordmark rendered at the left of the nav bar.
   * Use `<IDMLogo compact />` or a custom element.
   */
  logo?: React.ReactNode;
  /**
   * Primary navigation tabs. Compose with `NavTab` elements.
   * Rendered in a flex row adjacent to the logo.
   */
  nav?: React.ReactNode;
  /**
   * Search control rendered in the right section of the bar.
   * Pass a `<GlobalSearch … />` — its trigger button fills this slot and its
   * overlay renders in a portal above everything else.
   * Wrap in a sized container (e.g. `<div className="w-44">`) to constrain width.
   */
  search?: React.ReactNode;
  /**
   * Right-side action controls rendered after the search slot.
   * Typical use: `<UserChip name="…" />`, notification icons, a sign-out button.
   */
  actions?: React.ReactNode;
  /**
   * Optional bottom-anchored overlay (e.g. a SQL workbench DrawerPanel).
   * Rendered outside the main scroll flow, fixed to the viewport bottom.
   */
  drawer?: React.ReactNode;
  /**
   * Tailwind bottom-padding utility class applied to `<main>` to clear the drawer
   * tab strip. Example: `"pb-24"`.
   * @default ""
   */
  drawerClearance?: string;
  /** Page content rendered in the scrollable main area below the nav bar. */
  children: React.ReactNode;
}

export function TopNavShell({
  logo,
  nav,
  search,
  actions,
  drawer,
  drawerClearance = "",
  children,
}: TopNavShellProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-odm-page text-odm-ink font-sans flex flex-col">
      {/* Skip navigation */}
      <a
        href="#main-content"
        className={[
          "absolute -top-10 left-0 z-[9999]",
          "bg-lux-red text-white font-sans text-[13px] font-semibold",
          "px-4 py-2 no-underline transition-[top] duration-100",
          "focus:top-0",
        ].join(" ")}
      >
        Skip to main content
      </a>

      {/* ── Nav bar ── */}
      <header
        role="banner"
        className="flex-shrink-0 bg-white border-b-[3px] border-b-lux-red"
      >
        <div className="flex items-stretch h-14 px-6">

          {/* Logo */}
          {logo && (
            <div className="flex items-center flex-shrink-0 pr-5 mr-2 border-r border-odm-line-l">
              {logo}
            </div>
          )}

          {/* Nav tabs */}
          {nav && (
            <nav
              aria-label="Primary navigation"
              className="flex items-stretch flex-1 min-w-0 px-2"
            >
              {nav}
            </nav>
          )}

          {/* Right slot: search + actions */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            {search}
            {actions}
          </div>

        </div>
      </header>

      {/* ── Main content ── */}
      <main
        id="main-content"
        aria-label="Page content"
        className={["flex-1", drawerClearance].filter(Boolean).join(" ")}
      >
        {children}
      </main>

      {drawer}
    </div>
  );
}
