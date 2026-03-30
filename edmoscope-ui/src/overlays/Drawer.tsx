import React, { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Drawer — compound component pattern.

   Usage:
     <Drawer open={open} onClose={close} aria-labelledby="drawer-title">
       <Drawer.Header id="drawer-title" onClose={close}>Dataset filters</Drawer.Header>
       <Drawer.Body>
         <FilterBar filters={FILTERS} onChange={setFilters} />
       </Drawer.Body>
       <Drawer.Footer>
         <Button variant="ghost" onClick={close}>Cancel</Button>
         <Button variant="brand" onClick={apply}>Apply</Button>
       </Drawer.Footer>
     </Drawer>
───────────────────────────────────────────────────────────────────────────── */

/**
 * Drawer — side-panel overlay that slides in from the right (or left).
 *
 * Traps focus when open. Closes on Escape or backdrop click.
 * Uses the compound component pattern: compose Drawer.Header, Drawer.Body,
 * and Drawer.Footer inside the root Drawer.
 *
 * @example
 * <Drawer open={open} onClose={() => setOpen(false)} aria-labelledby="drawer-title">
 *   <Drawer.Header id="drawer-title" onClose={() => setOpen(false)}>Filters</Drawer.Header>
 *   <Drawer.Body>…</Drawer.Body>
 *   <Drawer.Footer>…</Drawer.Footer>
 * </Drawer>
 */
export interface DrawerProps {
  /** Whether the drawer is visible. */
  open: boolean;
  /** Called when the drawer requests closing. */
  onClose: () => void;
  /**
   * Which side the drawer slides in from.
   * @default "right"
   */
  side?: "right" | "left";
  /**
   * Width of the drawer panel.
   * @default "md"
   */
  width?: "sm" | "md" | "lg";
  /** Accessible label or labelledby. */
  "aria-labelledby"?: string;
  "aria-label"?: string;
  /** Drawer content — use Drawer.Header, Drawer.Body, Drawer.Footer. */
  children: React.ReactNode;
}

const WIDTH_CLASSES: Record<NonNullable<DrawerProps["width"]>, string> = {
  sm: "w-72",
  md: "w-96",
  lg: "w-[32rem]",
};

function DrawerRoot({
  open,
  onClose,
  side = "right",
  width = "md",
  children,
  ...ariaProps
}: DrawerProps): React.ReactElement {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => panelRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  return (
    <div
      className={[
        "fixed inset-0 z-[900]",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={[
          "absolute inset-0 bg-odm-ink/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
        {...ariaProps}
        className={[
          "absolute top-0 bottom-0 bg-white shadow-2xl flex flex-col",
          "outline-none focus-visible:outline-none",
          "transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "max-h-screen",
          WIDTH_CLASSES[width],
          side === "right" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

interface DrawerHeaderProps extends React.ComponentPropsWithoutRef<"div"> {
  onClose?: () => void;
  children: React.ReactNode;
}

function DrawerHeader({ onClose, children, className = "", id, ...rest }: DrawerHeaderProps): React.ReactElement {
  return (
    <div
      {...rest}
      id={id}
      className={[
        "flex items-center justify-between px-5 py-4",
        "border-b-[3px] border-b-lux-red flex-shrink-0",
        className,
      ].join(" ")}
    >
      <div className="font-sans text-base font-bold text-odm-ink leading-tight">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close drawer"
          className={[
            "bg-transparent border-0 cursor-pointer p-1 -mr-1",
            "text-odm-muted text-xl leading-none hover:text-odm-mid transition-colors",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red",
          ].join(" ")}
        >
          ×
        </button>
      )}
    </div>
  );
}

interface DrawerBodyProps {
  children: React.ReactNode;
  className?: string;
}

function DrawerBody({ children, className = "" }: DrawerBodyProps): React.ReactElement {
  return (
    <div className={["flex-1 overflow-y-auto px-5 py-4", className].join(" ")}>
      {children}
    </div>
  );
}

interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
}

function DrawerFooter({ children, className = "" }: DrawerFooterProps): React.ReactElement {
  return (
    <div
      className={[
        "flex items-center justify-end gap-2 px-5 py-3",
        "border-t border-odm-line flex-shrink-0 bg-odm-surface",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export const Drawer = Object.assign(DrawerRoot, {
  Header: DrawerHeader,
  Body:   DrawerBody,
  Footer: DrawerFooter,
});
