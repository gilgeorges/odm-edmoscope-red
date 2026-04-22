import React, { createContext, useContext } from "react";

/* ── Context ────────────────────────────────────────────────────────────── */

interface TimelineCtx {
  /** Nothing needed for now; reserved for future orientation/size variants. */
  _placeholder: true;
}

const TimelineContext = createContext<TimelineCtx | null>(null);

function useTimeline(): TimelineCtx {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error("<ActivityTimeline.Item> must be inside <ActivityTimeline>");
  return ctx;
}

/* ── Activity type ────────────────────────────────────────────────────── */

/**
 * Semantic type of a provenance activity.
 * Controls the badge label, colour, and dot colour on the timeline.
 *
 * - `transformation` — data processing step (blue)
 * - `dissemination`  — external distribution or export (red)
 * - `reception`      — data intake / ingestion (green)
 * - `validation`     — quality check or certification (amber)
 */
export type ActivityType =
  | "transformation"
  | "dissemination"
  | "reception"
  | "validation";

const TYPE_LABEL: Record<ActivityType, string> = {
  transformation: "Transformation",
  dissemination:  "Dissémination",
  reception:      "Réception",
  validation:     "Validation",
};

/** Tailwind classes for dot and badge per activity type. */
const TYPE_CLASSES: Record<
  ActivityType,
  { dot: string; badge: string }
> = {
  transformation: {
    dot:   "bg-odm-info border-odm-info-bd",
    badge: "bg-odm-info-bg text-odm-info border border-odm-info-bd",
  },
  dissemination: {
    dot:   "bg-lux-red border-lux-red-60",
    badge: "bg-lux-red-20 text-lux-red border border-lux-red-60",
  },
  reception: {
    dot:   "bg-odm-ok border-odm-ok-bd",
    badge: "bg-odm-ok-bg text-odm-ok border border-odm-ok-bd",
  },
  validation: {
    dot:   "bg-odm-warn border-odm-warn-bd",
    badge: "bg-odm-warn-bg text-odm-warn border border-odm-warn-bd",
  },
};

/* ── Item sub-component ─────────────────────────────────────────────────── */

/**
 * ActivityItemProps — props for a single {@link ActivityTimeline} entry.
 */
export interface ActivityItemProps {
  /**
   * Semantic type of this activity.
   * Controls the pearl dot colour and the event-type badge.
   */
  type: ActivityType;

  /** Short description of what occurred in this activity. */
  description: string;

  /**
   * Date or datetime string displayed at the trailing edge.
   * Pass a pre-formatted locale string (e.g. "17 avr. 2025").
   */
  date?: string;

  /** Additional CSS classes on the item row. */
  className?: string;
}

/** A single event item in an {@link ActivityTimeline}. */
function ActivityItem({
  type,
  description,
  date,
  className = "",
}: ActivityItemProps): React.ReactElement {
  useTimeline();
  const { dot, badge } = TYPE_CLASSES[type];

  return (
    <li
      className={[
        "grid [grid-template-columns:20px_1fr] gap-x-4 relative",
        className,
      ].join(" ")}
    >
      {/* Pearl dot + connector line */}
      <div className="flex flex-col items-center" aria-hidden="true">
        <div
          className={[
            "w-3 h-3 rounded-full shrink-0 mt-[3px] border-2 ring-2 ring-odm-page z-10",
            dot,
          ].join(" ")}
        />
        {/* Connector — extends down via the next item's top padding */}
        <div className="w-px flex-1 bg-odm-line-l mt-1" />
      </div>

      {/* Content */}
      <div className="pb-5 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Type badge */}
            <span
              className={[
                "font-sans text-[10px] font-bold tracking-[0.08em] uppercase",
                "px-1.5 py-0.5 leading-4 shrink-0",
                badge,
              ].join(" ")}
            >
              {TYPE_LABEL[type]}
            </span>
          </div>
          {date && (
            <span className="font-sans text-[12px] text-odm-muted shrink-0 whitespace-nowrap">
              {date}
            </span>
          )}
        </div>
        <p className="font-sans text-[13px] text-odm-soft leading-[1.55] mt-1.5">
          {description}
        </p>
      </div>
    </li>
  );
}

/* ── Root component ─────────────────────────────────────────────────────── */

/**
 * ActivityTimelineProps — props for the {@link ActivityTimeline} root component.
 */
export interface ActivityTimelineProps {
  /**
   * Optional introductory note rendered above the timeline items in italics.
   */
  note?: string;

  /** One or more `ActivityTimeline.Item` elements. */
  children: React.ReactNode;

  /** Additional CSS classes on the root element. */
  className?: string;
}

/**
 * ActivityTimeline — PROV-O pearl-chain provenance timeline.
 *
 * Displays a vertical sequence of provenance activities (transformations,
 * disseminations, receptions, validations) connected by a dotted thread.
 * Each item has a coloured dot, an event-type badge, a description, and
 * an optional date.
 *
 * Use `ActivityTimeline.Item` as the sub-component.
 *
 * @example
 * <ActivityTimeline note="Journal PROV-O complet — toutes les activités.">
 *   <ActivityTimeline.Item
 *     type="transformation"
 *     description="Consolidation hebdomadaire bronze→silver. 168 heures traitées, 0.4% imputées."
 *     date="17 avr. 2025"
 *   />
 *   <ActivityTimeline.Item
 *     type="dissemination"
 *     description="Export pour rapport mobilité T1 2025."
 *     date="8 mars 2025"
 *   />
 *   <ActivityTimeline.Item
 *     type="reception"
 *     description="Ingestion initiale des capteurs SEBES."
 *     date="3 janv. 2024"
 *   />
 * </ActivityTimeline>
 */
export function ActivityTimeline({
  note,
  children,
  className = "",
}: ActivityTimelineProps): React.ReactElement {
  return (
    <TimelineContext.Provider value={{ _placeholder: true }}>
      <div className={className}>
        {note && (
          <p className="font-sans text-[13px] italic text-odm-muted leading-[1.6] mb-5 px-1 border border-odm-line-l bg-odm-card p-3">
            {note}
          </p>
        )}
        <ul className="list-none m-0 p-0">
          {children}
        </ul>
      </div>
    </TimelineContext.Provider>
  );
}

ActivityTimeline.Item = ActivityItem;
