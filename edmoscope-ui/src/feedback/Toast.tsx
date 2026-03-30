import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Toast system — non-blocking ephemeral feedback for async operations.

   USAGE
   ─────
   1. Wrap the app root once with <ToastProvider>:
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>

   2. Call the hook in any component:
        const { toast } = useToast();
        toast.success("Asset saved", "Changes have been persisted.");
        toast.error("Upload failed", err.message);

   API
   ───
   toast.success(title, message?, duration?)
   toast.error(title, message?, duration?)
   toast.warn(title, message?, duration?)
   toast.info(title, message?, duration?)
   toast.dismiss(id)
   toast.dismissAll()

   Default duration: 5 000 ms. Pass Infinity to persist until dismissed.
───────────────────────────────────────────────────────────────────────────── */

type ToastType = "success" | "error" | "warn" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

interface ToastApi {
  success: (title: string, message?: string, duration?: number) => string;
  error:   (title: string, message?: string, duration?: number) => string;
  warn:    (title: string, message?: string, duration?: number) => string;
  info:    (title: string, message?: string, duration?: number) => string;
  dismiss:    (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TOAST_VARIANT_CLASSES: Record<ToastType, string> = {
  success: "border-l-odm-ok-bd bg-odm-ok-bg",
  error:   "border-l-odm-bad-bd bg-odm-bad-bg",
  warn:    "border-l-odm-warn-bd bg-odm-warn-bg",
  info:    "border-l-odm-info-bd bg-odm-info-bg",
};

const TOAST_TITLE_CLASSES: Record<ToastType, string> = {
  success: "text-odm-ok",
  error:   "text-odm-bad",
  warn:    "text-odm-warn",
  info:    "text-odm-info",
};

const TOAST_ICONS: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  warn:    "⚠",
  info:    "i",
};

const TOAST_ROLES: Record<ToastType, "alert" | "status"> = {
  success: "status",
  error:   "alert",
  warn:    "status",
  info:    "status",
};

// Internal: single toast item with slide-in animation
function ToastNotification({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }): React.ReactElement {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (item.duration === Infinity) return;
    const t = setTimeout(() => onDismiss(item.id), item.duration);
    return () => clearTimeout(t);
  }, [item.id, item.duration, onDismiss]);

  return (
    <div
      role={TOAST_ROLES[item.type]}
      aria-live={item.type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className={[
        "flex items-start gap-2.5",
        "border border-odm-line border-l-[4px]",
        "px-3.5 py-3",
        "shadow-lg max-w-[360px] w-full",
        "transition-all duration-200",
        TOAST_VARIANT_CLASSES[item.type],
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={["font-sans text-[13px] font-bold flex-shrink-0 w-4.5 text-center pt-px", TOAST_TITLE_CLASSES[item.type]].join(" ")}
      >
        {TOAST_ICONS[item.type]}
      </span>
      <div className="flex-1 min-w-0">
        <div className={["font-sans text-[13px] font-semibold leading-snug", TOAST_TITLE_CLASSES[item.type]].join(" ")}>
          {item.title}
        </div>
        {item.message && (
          <div className="font-sans text-xs text-odm-soft leading-relaxed mt-0.5">
            {item.message}
          </div>
        )}
      </div>
      <button
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className={[
          "bg-transparent border-0 cursor-pointer p-0 flex-shrink-0 leading-none",
          "text-base opacity-50 hover:opacity-100 transition-opacity",
          TOAST_TITLE_CLASSES[item.type],
        ].join(" ")}
      >
        ×
      </button>
    </div>
  );
}

/**
 * ToastProvider — context provider that manages the toast stack.
 *
 * Place once at the root of the application, wrapping the router.
 * Use the `useToast` hook in any descendant to fire notifications.
 *
 * @example
 * <ToastProvider>
 *   <RouterProvider router={router} />
 * </ToastProvider>
 */
export interface ToastProviderProps {
  /** Application content. */
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps): React.ReactElement {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string): void => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback((): void => {
    setToasts([]);
  }, []);

  const add = useCallback((type: ToastType, title: string, message?: string, duration = 5000): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((ts) => [...ts, { id, type, title, message, duration }]);
    return id;
  }, []);

  const toast = useMemo<ToastApi>(() => ({
    success: (title, message, duration) => add("success", title, message, duration),
    error:   (title, message, duration) => add("error",   title, message, duration),
    warn:    (title, message, duration) => add("warn",    title, message, duration),
    info:    (title, message, duration) => add("info",    title, message, duration),
    dismiss,
    dismissAll,
  }), [add, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast stack — bottom-right, above drawer strip */}
      <div
        aria-label="Notifications"
        className={[
          "fixed bottom-[60px] right-5 z-[800]",
          "flex flex-col-reverse gap-2",
          toasts.length ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        {toasts.map((item) => (
          <ToastNotification key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * useToast — hook to fire toast notifications from any component.
 *
 * Must be used within a `<ToastProvider>` ancestor.
 *
 * @example
 * const { toast } = useToast();
 * toast.success("Saved", "Your changes have been persisted.");
 * toast.error("Failed", err.message);
 */
export function useToast(): { toast: ToastApi } {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return { toast: ctx };
}
