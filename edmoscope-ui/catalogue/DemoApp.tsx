/**
 * EDMoScope Demo App
 *
 * A realistic single-page demo of the EDMoScope web app built entirely from
 * the component library. All data is static dummy data from demoData.ts.
 *
 * Routes (hash-based):
 *   /demo              → Overview dashboard
 *   /demo/datasets     → Datasets list
 *   /demo/datasets/:id → Dataset detail
 *   /demo/actors       → Actors list
 */

import React from "react";
import type { NavItem } from "../src/index.ts";
import {
  AppShell,
  IDMLogo,
  UserChip,
  ToastProvider,
} from "../src/index.ts";
import { useRouter } from "./router.ts";
import { OverviewPage } from "./pages/OverviewPage.tsx";
import { DatasetsPage } from "./pages/DatasetsPage.tsx";
import { DatasetDetailPage } from "./pages/DatasetDetailPage.tsx";
import { ActorsPage } from "./pages/ActorsPage.tsx";

/* ── Navigation ─────────────────────────────────────────────────────────── */

const DEMO_NAV: NavItem[] = [
  { id: "overview",  label: "Vue d'ensemble", short: "Overview"  },
  { id: "datasets",  label: "Datasets"                          },
  { id: "actors",    label: "Actors"                            },
];

const ROUTE_TO_NAV: Record<string, string> = {
  overview: "/demo",
  datasets: "/demo/datasets",
  actors:   "/demo/actors",
};

/** Derives the active nav section from the current hash path. */
function activeSection(path: string): string {
  if (path.startsWith("/demo/datasets")) return "datasets";
  if (path.startsWith("/demo/actors"))   return "actors";
  return "overview";
}

/* ── Page renderer ──────────────────────────────────────────────────────── */

interface PageProps {
  path: string;
  navigate: (p: string) => void;
}

function DemoPage({ path, navigate }: PageProps): React.ReactElement {
  if (path.startsWith("/demo/datasets/")) {
    const id = path.replace("/demo/datasets/", "");
    return <DatasetDetailPage datasetId={id} onNavigate={navigate} />;
  }
  if (path.startsWith("/demo/datasets")) {
    return <DatasetsPage onNavigate={navigate} />;
  }
  if (path.startsWith("/demo/actors")) {
    return <ActorsPage onNavigate={navigate} />;
  }
  return <OverviewPage onNavigate={navigate} />;
}

/* ── Shell ──────────────────────────────────────────────────────────────── */

/**
 * DemoApp — full EDMoScope app shell wired up with hash routing.
 *
 * Wraps everything in `<ToastProvider>` so demo pages can trigger toasts.
 */
export default function DemoApp(): React.ReactElement {
  const { path, navigate } = useRouter();

  return (
    <ToastProvider>
      <AppShell
        logoBar={
          <div className="max-w-[1036px] mx-auto px-7 py-3.5 flex items-center justify-between">
            <IDMLogo />
            <UserChip name="Nadine Hess" />
          </div>
        }
        navBrand={
          <a
            href="#/"
            className={[
              "font-sans text-[11px] text-white/40 hover:text-white/70",
              "transition-colors whitespace-nowrap flex-shrink-0",
              "focus-visible:outline focus-visible:outline-2",
              "focus-visible:outline-lux-red focus-visible:outline-offset-[-2px]",
            ].join(" ")}
          >
            ← Catalogue
          </a>
        }
        navigation={DEMO_NAV}
        activeNavId={activeSection(path)}
        onNavSelect={(id) => navigate(ROUTE_TO_NAV[id] ?? "/demo")}
        footer={
          <div className="max-w-[1036px] mx-auto px-7 py-4 flex items-center justify-between">
            <span className="font-sans text-[11px] text-white/50">
              EDMoScope — Observatoire digital de la Mobilité
            </span>
            <span className="font-sans text-[11px] text-white/30">
              © 2025 Institut du développement municipal
            </span>
          </div>
        }
      >
        <DemoPage path={path} navigate={navigate} />
      </AppShell>
    </ToastProvider>
  );
}
