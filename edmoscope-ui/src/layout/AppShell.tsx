import React from "react";

/**
 * NavItem — a single entry in the primary horizontal navigation bar.
 */
export interface NavItem {
  /** Unique identifier used to match against `activeNavId`. */
  id: string;
  /** Full label shown on desktop. */
  label: string;
  /** Abbreviated label shown on mobile (falls back to `label` if omitted). */
  short?: string;
}

/**
 * AppShellProps — props for the AppShell layout component.
 */
export interface AppShellProps {
  /**
   * Optional logo bar rendered above the primary navigation.
   *
   * Displayed on a white background with a 3px `lux-red` bottom border —
   * the Luxembourg government identity band. Typically contains the
   * government logo, organisation name, a search button, and a user chip.
   *
   * When omitted only the dark navigation bar is rendered in the header.
   */
  logoBar?: React.ReactNode;
  /**
   * Navigation items for the primary horizontal nav bar
   * (dark `odm-ink` background, lux-red active indicator).
   */
  navigation: NavItem[];
  /** The id of the currently active navigation item. */
  activeNavId?: string;
  /** Called when a nav item is clicked. */
  onNavSelect?: (id: string) => void;
  /**
   * Optional brand/logo area rendered at the far left of the nav bar,
   * before the navigation items. Use this for an app name or logo mark
   * so the brand and tabs share one row without consuming extra height.
   */
  navBrand?: React.ReactNode;
  /**
   * Additional content rendered on the right side of the nav bar
   * (e.g. an SQL workbench toggle button).
   */
  navRightSlot?: React.ReactNode;
  /**
   * Optional footer rendered below the main content area.
   *
   * Matches the dark nav bar background with a 3px `lux-red` top border.
   * Typically shows the organisation name, copyright, and standard references.
   */
  footer?: React.ReactNode;
  /**
   * Optional fixed-bottom overlay — rendered outside the normal scroll flow.
   * Use this for the SqlWorkbench drawer.
   */
  drawer?: React.ReactNode;
  /**
   * Tailwind class(es) added to `<main>` to clear the collapsed drawer tab strip.
   * Set this to a bottom-padding class matching the drawer's collapsed height.
   * @default "pb-[60px]"
   */
  drawerClearance?: string;
  /** Page content rendered inside `<main>`. */
  children: React.ReactNode;
}

/**
 * AppShell — root layout shell for EDMoScope.
 *
 * Composes a sticky header with an optional logo bar and a primary
 * horizontal navigation bar, a main content area, an optional footer, and
 * an optional fixed-bottom drawer slot (for the SQL Workbench).
 *
 * The layout matches `observatory-catalog.jsx`:
 * - **logoBar** — white row, 3px lux-red bottom border (Luxembourg identity)
 * - **nav bar** — dark `odm-ink` background, lux-red active indicator
 * - **main** — full-width flex-1, bottom padding adjusts for drawer
 * - **footer** — dark, 3px lux-red top border, optional
 * - **drawer** — fixed-position, outside scroll flow
 *
 * Accessibility:
 * - Skip-navigation link is the first focusable element, visible on focus.
 * - Main content is `<main id="main-content">`.
 * - Primary nav is `<nav aria-label="Primary navigation">`.
 *
 * @example
 * <AppShell
 *   logoBar={
 *     <div className="flex items-center gap-4 px-7 py-3">
 *       <IDMLogo />
 *       <div className="flex-1" />
 *       <GlobalSearch />
 *       <UserChip name="Nadine Hess" />
 *     </div>
 *   }
 *   navigation={NAV_ITEMS}
 *   activeNavId="datasets"
 *   onNavSelect={id => setPage(id)}
 *   navRightSlot={<SqlToggleBtn />}
 *   footer={<AppFooter />}
 *   drawer={<SqlWorkbench … />}
 *   drawerClearance="pb-[60px]"
 * >
 *   <Outlet />
 * </AppShell>
 */
export function AppShell({
  logoBar,
  navigation,
  activeNavId,
  onNavSelect,
  navBrand,
  navRightSlot,
  footer,
  drawer,
  drawerClearance = "pb-[60px]",
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

      {/* Sticky header */}
      <header className="sticky top-0 z-[100]">
        {/* Logo bar — white, 3px lux-red bottom border */}
        {logoBar && (
          <div className="bg-white border-b-[3px] border-lux-red">
            {logoBar}
          </div>
        )}

        {/* Primary navigation bar — dark background */}
        <nav aria-label="Primary navigation" className="bg-odm-ink">
          <div className="max-w-[1036px] mx-auto px-7 flex items-stretch overflow-x-auto [scrollbar-width:none]">
            {navBrand && (
              <div className="flex items-center flex-shrink-0 pr-4 mr-2 border-r border-white/10">
                {navBrand}
              </div>
            )}
            {navigation.map((item) => {
              const isActive = activeNavId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavSelect?.(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "bg-transparent border-0 cursor-pointer font-sans text-xs tracking-[0.02em]",
                    "whitespace-nowrap flex-shrink-0 py-2.5 px-4.5 -mb-px",
                    "transition-colors duration-100",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-[-2px]",
                    isActive
                      ? "text-white/90 font-semibold border-b-[3px] border-b-lux-red"
                      : "text-white/40 font-normal border-b-[3px] border-b-transparent hover:text-white/70",
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
        className={["flex-1 w-full", drawerClearance].filter(Boolean).join(" ")}
      >
        {children}
      </main>

      {/* Footer — dark, 3px lux-red top border */}
      {footer && (
        <footer className="bg-odm-ink border-t-[3px] border-lux-red">
          {footer}
        </footer>
      )}

      {/* Fixed-bottom drawer (SQL Workbench, etc.) */}
      {drawer}
    </div>
  );
}
