/**
 * RightsTab — Tab 2 of the dataset detail decision funnel.
 *
 * Answers: "Am I allowed to use it?"
 *
 * Content order:
 *   1. Clearance banner (full width, gate verdict)
 *   2. Two cards side-by-side: Applicable legislation / Access & permissions
 *   3. Full-width editorial card "Operational purpose ≠ legal basis"
 */

import React from "react";
import { Badge } from "../../src/index.ts";
import type { Dataset, RightsClearance, RequiredPermission } from "../../types/dataset.ts";

/* ── Props ───────────────────────────────────────────────────────────────── */

/** Props for the RightsTab component. */
export interface RightsTabProps {
  /** The fully loaded dataset. */
  dataset: Dataset;
  /** Called when the user clicks the cross-reference link to the Understand tab. */
  onNavigateToUnderstand: () => void;
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */

/** Skeleton placeholder shown while data is loading. */
export function RightsTabSkeleton(): React.ReactElement {
  return (
    <div className="pt-6 animate-pulse">
      <div className="bg-odm-surface rounded h-16 mb-6" />
      <div className="grid grid-cols-2 gap-4 mb-6 max-[900px]:grid-cols-1">
        <div className="bg-odm-surface rounded h-64" />
        <div className="bg-odm-surface rounded h-64" />
      </div>
      <div className="bg-odm-surface rounded h-32" />
    </div>
  );
}

/* ── Clearance banner ─────────────────────────────────────────────────────── */

const CLEARANCE_CONFIG: Record<
  RightsClearance,
  { outer: string; icon: string; message: string }
> = {
  cleared: {
    outer: "bg-odm-ok-bg border border-odm-ok-bd text-odm-ok",
    icon: "✓",
    message: "cleared",
  },
  "requires-request": {
    outer: "bg-odm-warn-bg border border-odm-warn-bd text-odm-warn",
    icon: "!",
    message: "requires-request",
  },
  denied: {
    outer: "bg-odm-bad-bg border border-odm-bad-bd text-odm-bad",
    icon: "✕",
    message: "denied",
  },
};

function clearanceSentence(
  clearance: RightsClearance,
  licenseScope: string | undefined,
  reason: string | undefined
): string {
  if (clearance === "cleared") {
    const scope = licenseScope !== undefined ? ` for ${licenseScope}` : "";
    return `You may use this dataset${scope}.`;
  }
  if (clearance === "requires-request") {
    return "Access requires a request — contact the steward to obtain clearance.";
  }
  return reason ?? "You are not cleared to use this dataset.";
}

function ClearanceBanner({ dataset }: { dataset: Dataset }): React.ReactElement {
  const cfg = CLEARANCE_CONFIG[dataset.rightsClearance];
  return (
    <div className={["rounded p-4 mb-6 flex items-start gap-3", cfg.outer].join(" ")}>
      <div className="font-sans text-[18px] font-bold leading-none shrink-0">{cfg.icon}</div>
      <div>
        <div className="font-sans text-[13px] font-semibold mb-0.5">
          {clearanceSentence(
            dataset.rightsClearance,
            dataset.license.scope,
            dataset.rightsClearanceReason
          )}
        </div>
        {dataset.rightsClearanceReason !== undefined &&
          dataset.rightsClearance === "cleared" && (
            <div className="font-sans text-[12px] opacity-80">
              {dataset.rightsClearanceReason}
            </div>
          )}
      </div>
    </div>
  );
}

/* ── Permission label map ─────────────────────────────────────────────────── */

const PERMISSION_LABELS: Record<RequiredPermission, string> = {
  "odm-read": "odm-read",
  "odm-admin": "odm-admin",
  "odm-superuser": "odm-superuser",
};

/* ── Legislation card ─────────────────────────────────────────────────────── */

function LegislationCard({ dataset }: { dataset: Dataset }): React.ReactElement {
  return (
    <div className="bg-odm-card border border-odm-line rounded p-5">
      <div className="font-sans text-[13px] font-semibold text-odm-ink mb-4">
        Applicable legislation
      </div>
      <ul className="space-y-0">
        {dataset.applicableLegislation.map((leg, i) => (
          <li
            key={i}
            className={[
              "py-3",
              i < dataset.applicableLegislation.length - 1
                ? "border-b border-odm-line-l"
                : "",
            ].join(" ")}
          >
            <div className="font-sans text-[12px] font-semibold text-odm-ink mb-1">
              {leg.uri !== undefined ? (
                <a
                  href={leg.uri}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:underline text-odm-info"
                >
                  {leg.label}
                </a>
              ) : (
                leg.label
              )}
            </div>
            <div className="font-serif text-[12px] italic text-odm-soft leading-snug">
              {leg.note}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Access & permissions card ────────────────────────────────────────────── */

function AccessCard({ dataset }: { dataset: Dataset }): React.ReactElement {
  const rows: Array<{ label: string; content: React.ReactNode }> = [
    {
      label: "Required permission",
      content: (
        <Badge variant="info">{PERMISSION_LABELS[dataset.requiredPermission]}</Badge>
      ),
    },
    {
      label: "Your access",
      content: dataset.userHasAccess ? (
        <Badge variant="ok">✓ Granted</Badge>
      ) : (
        <Badge variant="danger">Blocked</Badge>
      ),
    },
    {
      label: "Licence",
      content: (
        <div>
          <span className="font-sans text-[12px] text-odm-soft">
            {dataset.license.label}
          </span>
          {dataset.license.scope !== undefined && (
            <span className="font-sans text-[11px] italic text-odm-muted ml-1.5">
              ({dataset.license.scope})
            </span>
          )}
        </div>
      ),
    },
  ];

  if (dataset.retentionPolicy !== undefined) {
    rows.push({
      label: "Retention",
      content: (
        <span className="font-sans text-[12px] text-odm-soft">
          {dataset.retentionPolicy}
        </span>
      ),
    });
  }
  if (dataset.sensitivity !== undefined) {
    rows.push({
      label: "Sensitivity",
      content: (
        <span className="font-sans text-[12px] text-odm-soft">
          {dataset.sensitivity}
        </span>
      ),
    });
  }

  return (
    <div className="bg-odm-card border border-odm-line rounded p-5">
      <div className="font-sans text-[13px] font-semibold text-odm-ink mb-4">
        Access &amp; permissions
      </div>
      <ul className="space-y-0">
        {rows.map((row, i) => (
          <li
            key={i}
            className={[
              "py-2.5 flex gap-3 items-start",
              i < rows.length - 1 ? "border-b border-odm-line-l" : "",
            ].join(" ")}
          >
            <div className="font-sans text-[10px] font-bold tracking-[0.08em] uppercase text-odm-muted w-28 shrink-0 pt-0.5">
              {row.label}
            </div>
            <div>{row.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Editorial prose card ─────────────────────────────────────────────────── */

function EditorialCard({
  onNavigateToUnderstand,
}: {
  onNavigateToUnderstand: () => void;
}): React.ReactElement {
  return (
    <div className="bg-odm-card border border-odm-line rounded p-5 mt-4">
      <div className="font-sans text-[13px] font-semibold text-odm-ink mb-3">
        Operational purpose ≠ legal basis
      </div>
      <p className="font-serif text-[13px] leading-relaxed text-odm-soft">
        The fact that OdM collects and manages this dataset under a statutory mandate — and
        that you hold the <span className="font-mono text-[11px] bg-odm-surface border border-odm-line-l px-1 py-px rounded">odm-read</span> permission — does not by itself constitute a legal basis
        for every conceivable use. The clearance above covers the operational purposes
        for which OdM originally collected the data, as described in the{" "}
        <button
          type="button"
          onClick={onNavigateToUnderstand}
          className="text-odm-info underline cursor-pointer bg-transparent border-0 font-serif text-[13px] p-0 hover:text-odm-ink transition-colors"
        >
          business definition (Understand tab)
        </button>
        . If you intend to use this dataset for a materially different purpose — for example,
        combining it with individual-level travel data for research — you must seek a
        fresh legal assessment from the DPO and, where required, obtain separate consent
        or a new statutory basis. The disseminations log{" "}
        <button
          type="button"
          onClick={onNavigateToUnderstand}
          className="text-odm-info underline cursor-pointer bg-transparent border-0 font-serif text-[13px] p-0 hover:text-odm-ink transition-colors"
        >
          (see Understand)
        </button>{" "}
        shows precedents for how this dataset has been used before.
      </p>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */

/**
 * RightsTab — "Am I allowed to use it?"
 *
 * Tab ii of the five-tab dataset detail decision funnel.
 * Disqualifying gate: the clearance banner states the verdict.
 * The page may dismiss the user if clearance is denied.
 */
export function RightsTab({
  dataset,
  onNavigateToUnderstand,
}: RightsTabProps): React.ReactElement {
  return (
    <div className="pt-6">
      <ClearanceBanner dataset={dataset} />
      <div className="grid grid-cols-2 gap-4 mb-0 max-[900px]:grid-cols-1">
        <LegislationCard dataset={dataset} />
        <AccessCard dataset={dataset} />
      </div>
      <EditorialCard onNavigateToUnderstand={onNavigateToUnderstand} />
    </div>
  );
}
