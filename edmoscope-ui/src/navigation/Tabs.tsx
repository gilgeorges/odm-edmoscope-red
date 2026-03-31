import React, { createContext, useContext, useState, useId } from "react";

/* ── Context ────────────────────────────────────────────────────────────── */

interface TabsCtx {
  activeId: string;
  setActiveId: (id: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsCtx | null>(null);

function useTabs(): TabsCtx {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("<Tabs.Tab> and <Tabs.Panel> must be inside <Tabs>");
  return ctx;
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

/**
 * TabListProps — props for the Tabs.List container.
 */
export interface TabListProps {
  /** The tab buttons. */
  children: React.ReactNode;
  /** Additional CSS classes on the tab list element. */
  className?: string;
}

/** Horizontal row of tab buttons with an underline active indicator. */
function TabList({ children, className = "" }: TabListProps): React.ReactElement {
  return (
    <div
      role="tablist"
      className={[
        "flex border-b border-odm-line overflow-x-auto [scrollbar-width:none] shrink-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * TabProps — props for a single Tabs.Tab button.
 */
export interface TabProps {
  /** Unique identifier matching the corresponding Tabs.Panel id. */
  id: string;
  /** Tab label text. */
  children: React.ReactNode;
}

/** A single tab button. */
function Tab({ id, children }: TabProps): React.ReactElement {
  const { activeId, setActiveId, baseId } = useTabs();
  const isActive = activeId === id;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${id}`}
      aria-controls={`${baseId}-panel-${id}`}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveId(id)}
      className={[
        "font-sans text-[13px] whitespace-nowrap flex-shrink-0",
        "py-2 pr-5 -mb-px cursor-pointer bg-transparent border-0",
        "transition-colors duration-100",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-[-2px]",
        isActive
          ? "text-odm-ink font-semibold border-b-2 border-b-odm-ink"
          : "text-odm-muted font-normal border-b-2 border-b-transparent hover:text-odm-soft",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/**
 * TabPanelProps — props for a Tabs.Panel content area.
 */
export interface TabPanelProps {
  /** Must match the id of the corresponding Tabs.Tab. */
  id: string;
  /** Panel content. */
  children: React.ReactNode;
  /** Additional CSS classes on the panel element. */
  className?: string;
}

/** Content panel shown when its tab is active. */
function TabPanel({ id, children, className = "" }: TabPanelProps): React.ReactElement {
  const { activeId, baseId } = useTabs();
  if (activeId !== id) return <></>;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${id}`}
      aria-labelledby={`${baseId}-tab-${id}`}
      tabIndex={0}
      className={[
        "flex-1 min-h-0 overflow-y-auto",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* ── Root component ─────────────────────────────────────────────────────── */

/**
 * TabsProps — props for the Tabs root component.
 */
export interface TabsProps {
  /**
   * ID of the initially active tab.
   * Defaults to the first tab rendered.
   */
  defaultTab: string;
  /**
   * Controlled active tab ID. When provided, the component is controlled
   * and `onTabChange` must be used to update it.
   */
  activeTab?: string;
  /** Called when the active tab changes. */
  onTabChange?: (id: string) => void;
  /** Must contain exactly one `Tabs.List` and one or more `Tabs.Panel` children. */
  children: React.ReactNode;
  /**
   * When true the root element becomes a flex column that fills its parent's
   * height — the panel scrolls internally instead of the whole page.
   * @default false
   */
  fill?: boolean;
  /** Additional CSS classes on the root element. */
  className?: string;
}

/**
 * Tabs — tab list + content panels.
 *
 * Use `Tabs.List`, `Tabs.Tab`, and `Tabs.Panel` as sub-components.
 *
 * When `fill` is true the component stretches to fill its parent's height
 * and each panel scrolls internally — the page itself does not scroll.
 * This is useful for content areas with a fixed layout (e.g. a detail view
 * inside AppShell where the header and nav are always visible).
 *
 * @example
 * // Page-filling tab view (no page scroll)
 * <Tabs defaultTab="info" fill>
 *   <Tabs.List>
 *     <Tabs.Tab id="info">Information</Tabs.Tab>
 *     <Tabs.Tab id="schema">Schema</Tabs.Tab>
 *     <Tabs.Tab id="lineage">Lineage</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel id="info"><InformationTab /></Tabs.Panel>
 *   <Tabs.Panel id="schema"><SchemaTab /></Tabs.Panel>
 *   <Tabs.Panel id="lineage"><LineageTab /></Tabs.Panel>
 * </Tabs>
 *
 * @example
 * // Inline tabs (normal page scroll)
 * <Tabs defaultTab="overview">
 *   <Tabs.List>
 *     <Tabs.Tab id="overview">Overview</Tabs.Tab>
 *     <Tabs.Tab id="details">Details</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel id="overview" className="pt-4">…</Tabs.Panel>
 *   <Tabs.Panel id="details" className="pt-4">…</Tabs.Panel>
 * </Tabs>
 */
export function Tabs({
  defaultTab,
  activeTab,
  onTabChange,
  children,
  fill = false,
  className = "",
}: TabsProps): React.ReactElement {
  const baseId = useId();
  const [internalActive, setInternalActive] = useState(defaultTab);
  const activeId = activeTab ?? internalActive;

  function handleChange(id: string): void {
    setInternalActive(id);
    onTabChange?.(id);
  }

  return (
    <TabsContext.Provider value={{ activeId, setActiveId: handleChange, baseId }}>
      <div
        className={[
          fill ? "flex flex-col min-h-0 h-full" : "",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

Tabs.List  = TabList;
Tabs.Tab   = Tab;
Tabs.Panel = TabPanel;
