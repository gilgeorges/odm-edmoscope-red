import React from "react";

/**
 * PageHeader — section label + h1 + subtitle + optional right-slot action area.
 *
 * Placed at the top of every page (or detail view) to establish context.
 * The `section` eyebrow provides breadcrumb-level context; `sub` gives a
 * one-liner description below the title.
 *
 * @example
 * <PageHeader
 *   section="Data Assets"
 *   title="MobiScout Count Data"
 *   sub="Urban mobility measurement — source layer"
 *   right={<Button variant="brand">Register asset</Button>}
 * />
 */
export interface PageHeaderProps {
  /** ALL-CAPS category label above the title (e.g. the section or asset type). */
  section?: string;
  /** Main page title — rendered as an `<h1>`. */
  title: string;
  /** Short descriptive subtitle beneath the title. */
  sub?: string;
  /** Optional right-aligned content (e.g. primary action button). */
  right?: React.ReactNode;
  /** Additional CSS classes for the outer container. */
  className?: string;
}

export function PageHeader({ section, title, sub, right, className = "" }: PageHeaderProps): React.ReactElement {
  return (
    <div className={["mb-6 pb-3.5 border-b border-odm-line", className].join(" ")}>
      {section && (
        <div className="font-sans text-[11px] font-bold tracking-[0.12em] uppercase text-odm-muted mb-1.5">
          {section}
        </div>
      )}
      <div className="flex justify-between items-end gap-3.5 flex-wrap">
        <div>
          <h1 className="font-sans text-[22px] font-bold text-odm-ink m-0 mb-0.5 tracking-[-0.01em] leading-tight">
            {title}
          </h1>
          {sub && (
            <p className="font-sans text-[13px] text-odm-muted m-0 mt-0.5">
              {sub}
            </p>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </div>
  );
}
