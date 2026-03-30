import React from "react";

/**
 * TopNavShell — application shell with a single dark horizontal navigation bar.
 *
 * The bar sits sticky at the top and contains: logo (optional, left) |
 * nav tabs (left-to-centre) | search + actions (right). Page content
 * scrolls below.
 *
 * Compose the `nav` slot with `NavTab` items.
 * Compose the `search` slot with `GlobalSearch`.
 * Compose the `actions` slot with `UserChip`, a SQL workbench toggle, etc.
 *
 * @example
 * <TopNavShell
 *   nav={
 *     <>
 *       <NavTab label="Home"    onClick={() => navigate("/")} />
 *       <NavTab label="Data"    isActive onClick={() => navigate("/data")} />
 *       <NavTab label="Actors"  onClick={() => navigate("/actors")} />
 *       <NavTab label="Queries" onClick={() => navigate("/queries")} />
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
 *   actions={<SqlWorkbenchToggle />}
 * >
 *   <Outlet />
 * </TopNavShell>
 */
export interface TopNavShellProps {
  /**
   * Logo / wordmark rendered at the left of the nav bar.
   * Use `<IDMLogo compact />` or a custom element.
   * When omitted the nav tabs start immediately from the left.
   */
  logo?: React.ReactNode;
  /**
   * Primary navigation tabs. Compose with `NavTab` elements.
   * Rendered in a flex row filling the available horizontal space.
   */
  nav?: React.ReactNode;
  /**
   * Search control rendered in the right section of the bar.
   * Pass a `<GlobalSearch … />`. Wrap in a sized container (e.g.
   * `<div className="w-44">`) to constrain the trigger button width.
   */
  search?: React.ReactNode;
  /**
   * Right-side action controls rendered after the search slot.
   * Typical use: SQL workbench toggle, `<UserChip />`, notification icons.
   */
  actions?: React.ReactNode;
  /**
   * Optional bottom-anchored overlay (e.g. a SQL workbench DrawerPanel).
   * Rendered outside the main scroll flow, fixed to the viewport bottom.
   */
  drawer?: React.ReactNode;
  /**
   * Tailwind bottom-padding utility class applied to `<main>` to clear the
   * drawer tab strip. Example: `"pb-24"`.
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
        className="sticky top-0 z-[100] flex-shrink-0 bg-odm-ink"
      >
        <div className="flex items-stretch h-11 px-7 overflow-x-auto [scrollbar-width:none]">

          {/* Logo */}
          {logo && (
            <div className="flex items-center flex-shrink-0 pr-5 mr-1">
              {logo}
            </div>
          )}

          {/* Nav tabs */}
          {nav && (
            <nav aria-label="Primary navigation" className="flex items-stretch">
              {nav}
            </nav>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right slot: search + actions */}
          {(search || actions) && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {search}
              {actions}
            </div>
          )}

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
