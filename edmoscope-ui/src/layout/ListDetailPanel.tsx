import React from "react";

/**
 * ListDetailPanel — responsive split-view layout for list + detail browsing.
 *
 * Behaviour by breakpoint:
 * - **mobile** (`< sm`): the detail panel slides over the full screen, hiding
 *   the list behind it.
 * - **tablet** (`sm`): the panel is absolutely positioned and covers the right
 *   60 % of the container; the list remains visible behind it on the left.
 * - **desktop** (`lg+`): list and panel sit side by side — 40 % / 60 % — with
 *   no overlap.
 *
 * The component is **controlled**: the parent owns `panelOpen` and is
 * responsible for toggling it (e.g. on row click / back button). The parent
 * should give the wrapper a defined height (`h-screen`, `h-[calc(100vh-4rem)]`,
 * etc.) so that `h-full` on the panel resolves correctly.
 *
 * @example
 * const [open, setOpen] = useState(false);
 *
 * <ListDetailPanel
 *   panelOpen={open}
 *   list={<DatasetList onSelect={() => setOpen(true)} />}
 *   detail={<DatasetDetail onClose={() => setOpen(false)} />}
 * />
 */
export interface ListDetailPanelProps {
  /** Whether the detail panel is currently visible. */
  panelOpen: boolean;
  /** Content rendered in the scrollable list (left) column. */
  list: React.ReactNode;
  /** Content rendered in the sliding detail (right) panel. */
  detail: React.ReactNode;
  /** Additional CSS classes applied to the outer wrapper. */
  className?: string;
}

export function ListDetailPanel({
  panelOpen,
  list,
  detail,
  className = "",
}: ListDetailPanelProps): React.ReactElement {
  const listClasses = [
    "transition-all duration-300 ease-in-out",
    panelOpen ? "w-full hidden sm:block lg:w-[40%]" : "w-full",
  ].join(" ");

  const panelClasses = [
    "transition-all duration-300 ease-in-out",
    "fixed sm:absolute lg:relative",
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
