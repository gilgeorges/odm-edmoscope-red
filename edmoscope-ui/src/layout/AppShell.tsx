import React, { useState } from "react";

/**
 * AppShell — root layout shell for EDMoScope.
 *
 * Composes a sticky header (TopBar + primary navigation), a collapsible
 * sidebar, a main content area, and an optional bottom drawer slot.
 * Occupies the full viewport height.
 *
 * The sidebar collapse state is managed internally — no need to lift it.
 * Navigation items receive an `isActive` prop from the consumer; the shell
 * itself has no routing knowledge.
 *
 * Accessibility:
 * - Skip-navigation link is the first focusable element, visible on focus.
 * - Main content is `<main id="main-content">`.
 * - Sidebar is `<aside aria-label="Sidebar navigation">`.
 *
 * @example
 * <AppShell
 *   topBar={<TopBar logo={<IDMLogo />} actions={<GlobalSearch />} />}
 *   navigation={NAV_ITEMS}
 *   activeNavId="datasets"
 *   onNavSelect={id => router.navigate({ to: `/${id}` })}
 * >
 *   <Outlet />
 * </AppShell>
 */

export interface NavItem {
  /** Unique identifier used to match against `activeNavId`. */
  id: string;
  /** Full label shown on desktop. */
  label: string;
  /** Abbreviated label shown on mobile. */
  short?: string;
}

export interface AppShellProps {
  /** Content for the sticky top bar (logo, search, user chip, etc.). */
  topBar: React.ReactNode;
  /**
   * Navigation items for the primary horizontal nav bar.
   * Rendered as a dark bar below the top bar.
   */
  navigation: NavItem[];
  /** The id of the currently active navigation item. */
  activeNavId?: string;
  /** Called when a nav item is clicked. */
  onNavSelect?: (id: string) => void;
  /**
   * Additional content slot on the right side of the nav bar
   * (e.g. SQL workbench toggle button).
   */
  navRightSlot?: React.ReactNode;
  /**
   * Optional bottom-anchored overlay (e.g. DrawerPanel for SQL workbench).
   * Rendered outside the main scroll flow, fixed to the viewport bottom.
   */
  drawer?: React.ReactNode;
  /**
   * Additional bottom padding applied to `<main>` to clear the drawer tab strip.
   * Pass the height of the drawer's collapsed tab strip (default 36px).
   * @default 36
   */
  drawerClearance?: number;
  /** Page content. */
  children: React.ReactNode;
}

export function AppShell({
  topBar,
  navigation,
  activeNavId,
  onNavSelect,
  navRightSlot,
  drawer,
  drawerClearance = 36,
  children,
}: AppShellProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-odm-page text-odm-ink font-sans flex flex-col">
      {/* Skip navigation — visible on keyboard focus only */}
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

      {/* Sticky header: top bar + nav bar */}
      <header className="sticky top-0 z-[100]">
        {topBar}

        {/* Primary navigation bar */}
        <nav aria-label="Primary navigation" className="bg-odm-ink">
          <div className="max-w-[1036px] mx-auto px-7 flex overflow-x-auto [scrollbar-width:none]">
            {navigation.map((item) => {
              const isActive = activeNavId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavSelect?.(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "bg-transparent border-0 cursor-pointer font-sans text-xs tracking-[0.02em]",
                    "whitespace-nowrap flex-shrink-0 py-2.5 px-4.5 -mb-px",
                    "transition-colors duration-100",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-[-2px]",
                    isActive
                      ? "text-white/90 font-semibold border-b-2 border-b-lux-red"
                      : "text-white/40 font-normal border-b-2 border-b-transparent hover:text-white/70",
                  ].join(" ")}
                >
                  {item.short ?? item.label}
                </button>
              );
            })}
            <div className="flex-1" />
            {navRightSlot}
          </div>
        </nav>
      </header>

      {/* Main content area */}
      <main
        id="main-content"
        aria-label="Page content"
        className="flex-1"
        style={{ paddingBottom: drawerClearance + 24 }}
      >
        {children}
      </main>

      {drawer}
    </div>
  );
}
