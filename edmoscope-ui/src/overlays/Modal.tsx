import React, { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Modal — compound component pattern.

   Usage:
     <Modal open={open} onClose={close} aria-labelledby="modal-title">
       <Modal.Header id="modal-title">Register Asset</Modal.Header>
       <Modal.Body>
         <p>Form content…</p>
       </Modal.Body>
       <Modal.Footer>
         <Button variant="ghost" onClick={close}>Cancel</Button>
         <Button variant="brand" onClick={submit}>Submit</Button>
       </Modal.Footer>
     </Modal>
───────────────────────────────────────────────────────────────────────────── */

/**
 * Modal — accessible full-screen overlay dialog.
 *
 * Traps focus when open. Closes on Escape or backdrop click.
 * Uses the compound component pattern: compose Modal.Header, Modal.Body,
 * and Modal.Footer inside the root Modal.
 *
 * @example
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} aria-labelledby="modal-title">
 *   <Modal.Header id="modal-title">Confirm deletion</Modal.Header>
 *   <Modal.Body>This action cannot be undone.</Modal.Body>
 *   <Modal.Footer>
 *     <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
 *     <Button variant="danger" onClick={handleDelete}>Delete</Button>
 *   </Modal.Footer>
 * </Modal>
 */
export interface ModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the modal requests closing (Escape key or backdrop click). */
  onClose: () => void;
  /**
   * Accessible label for the dialog. Pass either `aria-labelledby` pointing
   * to a Modal.Header `id`, or `aria-label` directly.
   */
  "aria-labelledby"?: string;
  "aria-label"?: string;
  /**
   * Dialog width. Controls max-width of the panel.
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | "xl";
  /** Dialog content — use Modal.Header, Modal.Body, Modal.Footer. */
  children: React.ReactNode;
}

const SIZE_CLASSES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

function ModalRoot({
  open,
  onClose,
  size = "md",
  children,
  ...ariaProps
}: ModalProps): React.ReactElement | null {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus trap: focus the panel on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => panelRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-odm-ink/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
        {...ariaProps}
        className={[
          "relative z-10 w-full bg-white shadow-2xl flex flex-col",
          "outline-none focus-visible:outline-none",
          "max-h-[90vh]",
          SIZE_CLASSES[size],
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Modal.Header — title bar of the modal with close button.
 */
interface ModalHeaderProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Called when the × close button is clicked. Must match parent Modal's onClose. */
  onClose?: () => void;
  children: React.ReactNode;
}

function ModalHeader({ onClose, children, className = "", id, ...rest }: ModalHeaderProps): React.ReactElement {
  return (
    <div
      {...rest}
      id={id}
      className={[
        "flex items-center justify-between px-5 py-4",
        "border-b border-odm-line flex-shrink-0",
        className,
      ].join(" ")}
    >
      <div className="font-sans text-base font-bold text-odm-ink leading-tight">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close dialog"
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

/**
 * Modal.Body — scrollable content area of the modal.
 */
interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

function ModalBody({ children, className = "" }: ModalBodyProps): React.ReactElement {
  return (
    <div className={["flex-1 overflow-y-auto px-5 py-4", className].join(" ")}>
      {children}
    </div>
  );
}

/**
 * Modal.Footer — action button row at the bottom of the modal.
 */
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

function ModalFooter({ children, className = "" }: ModalFooterProps): React.ReactElement {
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

// Attach sub-components via dot notation
export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body:   ModalBody,
  Footer: ModalFooter,
});
