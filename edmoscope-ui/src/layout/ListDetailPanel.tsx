import React from "react";

/**
 * ListDetailPanel — responsive split-view layout for list + detail browsing.
 *
 * Behaviour by breakpoint (default `contained={false}`):
 * - **mobile** (`< sm`): the detail panel is `fixed` and covers the full
 *   viewport, hiding the list behind it.
 * - **tablet** (`sm`): the panel is `absolute` and covers the right 60 % of
 *   the container; the list remains visible on the left.
 * - **desktop** (`lg+`): list and panel sit side by side — 40 % / 60 %.
 *
 * When `contained={true}` the panel uses `absolute` at every breakpoint
 * instead of `fixed` on mobile. Use this when the component is embedded inside
 * a bounded container (a modal, a page section, etc.) and you do not want the
 * panel to escape to the viewport. The parent must have `position: relative`
 * and a defined height.
 *
 * The component is **controlled**: the parent owns `panelOpen` and is
 * responsible for toggling it (e.g. on row click / back button). When
 * `contained={false}` (default) the parent should give the wrapper a defined
 * height (`h-screen`, `h-[calc(100vh-4rem)]`, etc.) so that `h-full` on the
 * panel resolves correctly at tablet breakpoint.
 *
 * @example
 * // Full-page usage (default)
 * const [open, setOpen] = useState(false);
 *
 * <ListDetailPanel
 *   panelOpen={open}
 *   list={<DatasetList onSelect={() => setOpen(true)} />}
 *   detail={<DatasetDetail onClose={() => setOpen(false)} />}
 * />
 *
 * @example
 * // Embedded in a bounded container
 * <ListDetailPanel
 *   contained
 *   panelOpen={open}
 *   list={…}
 *   detail={…}
 *   className="h-[480px]"
 * />
 */
export interface ListDetailPanelProps {
  /** Whether the detail panel is currently visible. */
  panelOpen: boolean;
  /** Content rendered in the scrollable list (left) column. */
  list: React.ReactNode;
  /** Content rendered in the sliding detail (right) panel. */
  detail: React.ReactNode;
  /**
   * When `true`, the panel uses `absolute` positioning at all breakpoints
   * instead of `fixed` on mobile. Required when the component is embedded
   * inside a bounded container rather than occupying the full page.
   * @default false
   */
  contained?: boolean;
  /** Additional CSS classes applied to the outer wrapper. */
  className?: string;
}

export function ListDetailPanel({
  panelOpen,
  list,
  detail,
  contained = false,
  className = "",
}: ListDetailPanelProps): React.ReactElement {
  const listClasses = [
    "transition-all duration-300 ease-in-out",
    panelOpen ? "w-full hidden sm:block lg:w-[40%]" : "w-full",
  ].join(" ");

  const panelClasses = [
    "transition-all duration-300 ease-in-out",
    contained ? "absolute" : "fixed sm:absolute lg:relative",
    "top-0 right-0 h-full",
    "bg-white z-10 overflow-y-auto",
    panelOpen
      ? "w-full sm:w-[60%] lg:w-[60%] translate-x-0"
      : "w-0 translate-x-full",
  ].join(" ");

  return (
    <div className={["relative flex w-full overflow-hidden", className].join(" ")}>
      <div className={listClasses}>{list}</div>
      <div className={panelClasses}>{detail}</div>
    </div>
  );
}
