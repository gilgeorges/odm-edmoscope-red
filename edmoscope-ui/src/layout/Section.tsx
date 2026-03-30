import React from "react";
import { Eyebrow } from "../typography/Heading.tsx";

/**
 * Section — content grouping with optional eyebrow label and right-slot action.
 *
 * The standard section wrapper used throughout EDMoScope pages. Renders an
 * eyebrow category label above the section, a border below it, and a
 * right-slot for actions (e.g. an "Edit" button).
 *
 * @example
 * <Section eyebrow="Schema" right={<Button variant="ghost">Edit</Button>}>
 *   <SchemaTable fields={fields} />
 * </Section>
 */
export interface SectionProps {
  /** Optional ALL-CAPS category label shown above the section content. */
  eyebrow?: string;
  /** Optional right-aligned content in the section header (e.g. action buttons). */
  right?: React.ReactNode;
  /** Section body content. */
  children: React.ReactNode;
  /** Additional CSS classes for the outer container. */
  className?: string;
}

export function Section({ eyebrow, right, children, className = "" }: SectionProps): React.ReactElement {
  return (
    <section className={["mb-8", className].join(" ")}>
      {(eyebrow || right) && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-odm-line-l">
          {eyebrow && <Eyebrow className="mb-0">{eyebrow}</Eyebrow>}
          {right && <div>{right}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
