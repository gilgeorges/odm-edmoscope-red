import React from "react";

/**
 * SideNavShell — application shell with a vertical left-side navigation column.
 *
 * Use this instead of AppShell when you want a traditional sidebar-first
 * layout rather than a horizontal top nav bar. The TopBar still spans the
 * full width at the top; below it the viewport is split into a fixed-width
 * nav column (left) and a scrollable main content area (right).
 *
 * The nav column is sticky — it stays in place as main content scrolls.
 *
 * Compose with `Sidebar` and `SidebarItem` for the `nav` slot:
 *
 * @example
 * <SideNavShell
 *   topBar={<TopBar logo={<IDMLogo />} actions={<UserChip name="Julie Schmit" />} />}
 *   nav={
 *     <Sidebar>
 *       <SidebarItem label="Overview"  icon="▣" isActive onClick={() => navigate("/")} />
 *       <SidebarItem label="Datasets"  icon="▤" onClick={() => navigate("/datasets")} />
 *       <SidebarItem label="Queries"   icon="⌕" onClick={() => navigate("/queries")} />
 *       <SidebarItem label="Actors"    icon="◎" onClick={() => navigate("/actors")} />
 *     </Sidebar>
 *   }
 * >
 *   <Outlet />
 * </SideNavShell>
 */
export interface SideNavShellProps {
  /** Content for the sticky top bar (logo, search, user chip, etc.). */
  topBar: React.ReactNode;
  /**
   * Vertical navigation content. Compose with `<Sidebar>` and `<SidebarItem>`.
   * Rendered in a sticky left column below the top bar.
   */
  nav: React.ReactNode;
  /**
   * Width of the nav column in pixels.
   * @default 220
   */
  navWidth?: number;
  /**
   * Optional footer content rendered at the bottom of the nav column
   * (e.g. version number, help link, sign-out button).
   */
  navFooter?: React.ReactNode;
  /**
   * Optional bottom-anchored overlay (e.g. a DrawerPanel for SQL workbench).
   * Rendered outside the main scroll flow, fixed to the viewport bottom.
   */
  drawer?: React.ReactNode;
  /**
   * Additional bottom padding applied to `<main>` to clear the drawer tab strip.
   * @default 0
   */
  drawerClearance?: number;
  /** Page content rendered in the main scrollable column. */
  children: React.ReactNode;
}

export function SideNavShell({
  topBar,
  nav,
  navWidth = 220,
  navFooter,
  drawer,
  drawerClearance = 0,
  children,
}: SideNavShellProps): React.ReactElement {
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

      {/* Top bar — full width, sticky */}
      <header className="sticky top-0 z-[100]">
        {topBar}
      </header>

      {/* Body: nav column + main content */}
      <div className="flex flex-1 min-h-0">
        {/* Vertical nav column */}
        <nav
          aria-label="Primary navigation"
          className="flex-shrink-0 bg-white border-r border-odm-line flex flex-col"
          style={{ width: navWidth }}
        >
          {/* Sticky inner wrapper so nav stays visible while content scrolls */}
          <div className="sticky top-[var(--topbar-height,57px)] h-[calc(100vh-var(--topbar-height,57px))] flex flex-col overflow-y-auto [scrollbar-width:none]">
            <div className="flex-1 py-3">
              {nav}
            </div>
            {navFooter && (
              <div className="flex-shrink-0 border-t border-odm-line-l px-3 py-3">
                {navFooter}
              </div>
            )}
          </div>
        </nav>

        {/* Main content */}
        <main
          id="main-content"
          aria-label="Page content"
          className="flex-1 min-w-0 overflow-y-auto"
          style={{ paddingBottom: drawerClearance }}
        >
          {children}
        </main>
      </div>

      {drawer}
    </div>
  );
}
