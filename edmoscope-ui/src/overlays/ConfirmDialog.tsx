import React from "react";
import { Modal } from "./Modal.tsx";
import { Button } from "../primitives/Button.tsx";

/**
 * ConfirmDialog — a pre-composed Modal for confirmation prompts.
 *
 * Wraps Modal with a standardised layout: title, description, and two
 * action buttons (confirm + cancel). Suitable for deletion confirmations,
 * irreversible operations, and similar two-path decisions.
 *
 * For anything more complex (multi-step, forms inside), use Modal directly.
 *
 * @example
 * <ConfirmDialog
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete dataset?"
 *   description="This will permanently remove MobiScout Count Data and all its distributions."
 *   variant="danger"
 *   confirmLabel="Delete"
 * />
 */
export interface ConfirmDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog is dismissed (Cancel or Escape). */
  onClose: () => void;
  /** Called when the user clicks the confirm button. */
  onConfirm: () => void;
  /** Dialog title rendered in the header. */
  title: string;
  /** Optional longer description rendered in the body. */
  description?: string;
  /**
   * Visual variant for the confirm button. Use `"danger"` for destructive actions.
   * @default "primary"
   */
  variant?: "primary" | "danger" | "brand";
  /**
   * Label for the confirm button.
   * @default "Confirm"
   */
  confirmLabel?: string;
  /**
   * Label for the cancel button.
   * @default "Cancel"
   */
  cancelLabel?: string;
  /**
   * Whether the confirm button is in a loading state (disabled + spinner label).
   * @default false
   */
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  variant = "primary",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
}: ConfirmDialogProps): React.ReactElement {
  const titleId = "confirm-dialog-title";
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      size="sm"
    >
      <Modal.Header id={titleId} onClose={onClose}>
        {title}
      </Modal.Header>
      {description && (
        <Modal.Body>
          <p className="font-sans text-[14px] text-odm-mid leading-relaxed m-0">
            {description}
          </p>
        </Modal.Body>
      )}
      <Modal.Footer>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Please wait…" : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
