import React from "react";

/**
 * SideNavShell — application shell with a vertical navigation column.
 *
 * The left column contains everything: logo, search, nav items, and an
 * optional footer (user chip, version, sign-out). No separate full-width
 * TopBar is needed — the column is the only chrome.
 *
 * Compose the `nav` slot with `Sidebar` + `SidebarItem`.
 * Compose the `search` slot with `GlobalSearch` (trigger button only —
 * GlobalSearch renders its own fullscreen overlay).
 *
 * @example
 * <SideNavShell
 *   logo={<IDMLogo compact />}
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
 *   nav={
 *     <Sidebar>
 *       <SidebarItem label="Overview"  icon="▣" isActive onClick={() => navigate("/")} />
 *       <SidebarItem label="Datasets"  icon="▤" onClick={() => navigate("/datasets")} />
 *       <SidebarItem label="Queries"   icon="⌕" onClick={() => navigate("/queries")} />
 *       <SidebarItem label="Actors"    icon="◎" onClick={() => navigate("/actors")} />
 *     </Sidebar>
 *   }
 *   navFooter={<UserChip name="Julie Schmit" />}
 * >
 *   <Outlet />
 * </SideNavShell>
 */
export interface SideNavShellProps {
  /**
   * Logo / wordmark rendered at the top of the nav column.
   * Use `<IDMLogo compact />` or a custom element.
   */
  logo?: React.ReactNode;
  /**
   * Search control rendered below the logo.
   * Pass a `<GlobalSearch … />` — its trigger button fills this slot and its
   * overlay renders in a portal above everything else.
   */
  search?: React.ReactNode;
  /**
   * Primary navigation items. Compose with `<Sidebar>` + `<SidebarItem>`.
   */
  nav: React.ReactNode;
  /**
   * Width of the nav column in pixels.
   * @default 220
   */
  navWidth?: number;
  /**
   * Content pinned to the bottom of the nav column.
   * Typical use: `<UserChip name="…" />`, a sign-out button, or a version label.
   */
  navFooter?: React.ReactNode;
  /**
   * Optional bottom-anchored overlay (e.g. a SQL workbench DrawerPanel).
   * Rendered outside the main scroll flow, fixed to the viewport bottom.
   */
  drawer?: React.ReactNode;
  /**
   * Additional bottom padding on `<main>` to clear the drawer tab strip.
   * @default 0
   */
  drawerClearance?: number;
  /** Page content rendered in the scrollable main area to the right. */
  children: React.ReactNode;
}

export function SideNavShell({
  logo,
  search,
  nav,
  navWidth = 220,
  navFooter,
  drawer,
  drawerClearance = 0,
  children,
}: SideNavShellProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-odm-page text-odm-ink font-sans flex">
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

      {/* ── Nav column ── */}
      <nav
        aria-label="Primary navigation"
        className="flex-shrink-0 bg-white border-r-[3px] border-r-lux-red flex flex-col"
        style={{ width: navWidth }}
      >
        {/* Sticky inner wrapper */}
        <div className="sticky top-0 h-screen flex flex-col overflow-y-auto [scrollbar-width:none]">

          {/* Logo */}
          {logo && (
            <div className="flex-shrink-0 px-3 py-4 border-b border-odm-line-l">
              {logo}
            </div>
          )}

          {/* Search */}
          {search && (
            <div className="flex-shrink-0 px-3 py-2 border-b border-odm-line-l">
              {search}
            </div>
          )}

          {/* Nav items */}
          <div className="flex-1 py-2 min-h-0 overflow-y-auto [scrollbar-width:none]">
            {nav}
          </div>

          {/* Footer */}
          {navFooter && (
            <div className="flex-shrink-0 border-t border-odm-line-l px-3 py-3">
              {navFooter}
            </div>
          )}
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main
          id="main-content"
          aria-label="Page content"
          className="flex-1"
          style={{ paddingBottom: drawerClearance }}
        >
          {children}
        </main>
      </div>

      {drawer}
    </div>
  );
}
