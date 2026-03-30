import React from "react";

/**
 * ErrorBoundary — catches JavaScript errors during rendering and shows a
 * fallback that matches the EDMoScope UI language.
 *
 * Must be a class component — React's requirement for error boundaries.
 *
 * Two fallback modes:
 * - `compact` — a single-line inline strip for wrapping panels or cards
 * - full-page — a padded page-level fallback with collapsible tech details
 *
 * The `onReset` callback is called when the user clicks "Try again", allowing
 * the parent to reset any relevant state before re-rendering the children.
 *
 * @example
 * // Around a full page
 * <ErrorBoundary label="Dataset detail">
 *   <DatasetDetailPage />
 * </ErrorBoundary>
 *
 * // Compact inline fallback
 * <ErrorBoundary label="Provenance timeline" compact>
 *   <ProvenanceTab dataset={ds} />
 * </ErrorBoundary>
 */
export interface ErrorBoundaryProps {
  /** Label describing the section that errored. Shown in the fallback message. */
  label?: string;
  /**
   * When true, renders a compact single-line fallback instead of the full page fallback.
   * @default false
   */
  compact?: boolean;
  /** Called when the user clicks "Try again". Use to reset upstream state. */
  onReset?: () => void;
  /** Content to render under normal (no-error) conditions. */
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  reset(): void {
    this.setState({ error: null, errorInfo: null });
    this.props.onReset?.();
  }

  render(): React.ReactNode {
    if (!this.state.error) return this.props.children;

    const { label = "This section", compact = false } = this.props;
    const msg = this.state.error?.message;

    if (compact) {
      return (
        <div
          role="alert"
          className="flex items-center gap-2.5 px-3.5 py-2.5 border-l-[3px] border-l-odm-bad-bd bg-odm-bad-bg font-sans"
        >
          <span className="text-[13px] font-semibold text-odm-bad">
            {label} could not be displayed.
          </span>
          {msg && (
            <span className="text-xs text-odm-soft flex-1">{msg}</span>
          )}
          <button
            onClick={() => this.reset()}
            className={[
              "bg-transparent border border-odm-bad-bd border-b-[2px]",
              "font-sans text-[11px] font-semibold text-odm-bad",
              "px-2.5 py-0.5 cursor-pointer flex-shrink-0",
              "hover:bg-odm-bad-bg/80 transition-colors",
            ].join(" ")}
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div role="alert" className="px-9 py-12 max-w-xl mx-auto">
        <div className="font-sans text-[11px] font-bold tracking-[0.12em] uppercase text-odm-bad mb-2">
          Rendering error
        </div>
        <h2 className="font-sans text-[22px] font-bold text-odm-ink m-0 mb-3 tracking-[-0.01em]">
          {label} could not be displayed
        </h2>
        <p className="font-sans text-sm text-odm-mid leading-relaxed m-0 mb-6">
          An unexpected error occurred while rendering this section.
          Your data has not been affected. You can try reloading the section,
          or go back to the previous page.
        </p>
        {msg && (
          <details className="mb-6">
            <summary className="font-sans text-xs text-odm-muted cursor-pointer select-none mb-2">
              Technical details
            </summary>
            <div
              className={[
                "font-mono text-xs text-odm-soft leading-relaxed",
                "bg-odm-surface border border-odm-line border-l-[3px] border-l-odm-bad-bd",
                "p-3",
              ].join(" ")}
            >
              {msg}
              {this.state.errorInfo?.componentStack && (
                <pre className="m-0 mt-2 text-[11px] text-odm-muted whitespace-pre-wrap overflow-wrap-anywhere">
                  {this.state.errorInfo.componentStack.trim()}
                </pre>
              )}
            </div>
          </details>
        )}
        <div className="flex gap-2.5">
          <button
            onClick={() => this.reset()}
            className={[
              "bg-odm-ink text-white border-0",
              "font-sans text-[13px] font-semibold px-5 py-2 cursor-pointer",
              "hover:bg-odm-soft transition-colors",
            ].join(" ")}
          >
            Try again
          </button>
          <button
            onClick={() => window.history.back()}
            className={[
              "bg-transparent text-odm-mid",
              "border border-odm-line border-b-[2px] border-b-odm-line-h",
              "font-sans text-[13px] font-medium px-5 py-2 cursor-pointer",
              "hover:bg-odm-surface transition-colors",
            ].join(" ")}
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }
}
