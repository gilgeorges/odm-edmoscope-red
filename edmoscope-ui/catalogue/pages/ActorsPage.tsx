import React from "react";
import {
  PageHeader,
  EntryCard,
  Badge,
  Button,
} from "../../src/index.ts";
import { DEMO_ACTORS, type DemoActor } from "../demoData.ts";

/** Props for the ActorsPage. */
export interface ActorsPageProps {
  /** Navigate to a demo sub-route. */
  onNavigate: (path: string) => void;
}

/** Badge variant per actor type. */
const ACTOR_TYPE_VARIANT: Record<DemoActor["type"], "info" | "default"> = {
  internal: "info",
  external: "default",
};

/**
 * ActorsPage — list of data providers, consumers, and automated systems.
 */
export function ActorsPage({ onNavigate: _navigate }: ActorsPageProps): React.ReactElement {
  return (
    <div className="max-w-[960px] mx-auto px-7 py-8">
      <PageHeader
        section="Registry"
        title="Actors"
        sub={`${DEMO_ACTORS.length} registered participants`}
        right={
          <Button variant="brand" size="sm">
            Add person
          </Button>
        }
      />

      <div className="flex flex-col gap-0">
        {DEMO_ACTORS.map((actor) => (
          <EntryCard
            key={actor.id}
            status="neutral"
            showThread={false}
            header={
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-odm-muted">{actor.id}</span>
                <Badge variant={ACTOR_TYPE_VARIANT[actor.type]}>{actor.type}</Badge>
              </div>
            }
            title={actor.name}
            description={actor.role}
            footer={
              actor.email ? (
                <span className="font-sans text-[11px] text-odm-muted">{actor.email}</span>
              ) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
