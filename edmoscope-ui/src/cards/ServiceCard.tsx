import React from "react";

/**
 * Service protocol / spec badge variant for {@link ServiceCard}.
 */
export type ServiceProtocol =
  | "openapi3"
  | "graphql"
  | "grpc"
  | "websocket"
  | "odata"
  | "sparql"
  | "other";

const PROTOCOL_LABEL: Record<ServiceProtocol, string> = {
  openapi3:  "OpenAPI 3.0",
  graphql:   "GraphQL",
  grpc:      "gRPC",
  websocket: "WebSocket",
  odata:     "OData 4.0",
  sparql:    "SPARQL",
  other:     "API",
};

const PROTOCOL_CLASSES: Record<ServiceProtocol, string> = {
  openapi3:  "bg-odm-info-bg text-odm-info border border-odm-info-bd",
  graphql:   "bg-lux-red-20 text-lux-red border border-lux-red-60",
  grpc:      "bg-odm-surface text-odm-mid border border-odm-line",
  websocket: "bg-odm-warn-bg text-odm-warn border border-odm-warn-bd",
  odata:     "bg-odm-ok-bg text-odm-ok border border-odm-ok-bd",
  sparql:    "bg-odm-surface text-odm-mid border border-odm-line",
  other:     "bg-odm-surface text-odm-muted border border-odm-line-l",
};

/**
 * ServiceCardProps — props for the {@link ServiceCard} component.
 */
export interface ServiceCardProps {
  /**
   * Icon rendered in the icon box on the left.
   * Accepts any React node — defaults to a link/chain symbol when omitted.
   */
  icon?: React.ReactNode;

  /** Service or endpoint display name. */
  name: string;

  /**
   * Endpoint URL displayed below the name in muted monospace.
   * When provided the URL is also used as the `href` on the card's link.
   */
  url?: string;

  /**
   * API specification / protocol variant controlling the badge label and colour.
   * @default "other"
   */
  protocol?: ServiceProtocol;

  /**
   * When true the entire card is rendered as an `<a>` linking to `url`.
   * @default false
   */
  asLink?: boolean;

  /** Additional CSS classes on the root element. */
  className?: string;
}

/**
 * ServiceCard — data-service calling card.
 *
 * Used in the "Services de données" section of a dataset technical tab to
 * surface API endpoints and their specification badges.
 *
 * @example
 * <ServiceCard
 *   name="PostgREST API — silver layer"
 *   url="https://api.odm.lu/rest/comptages_national"
 *   protocol="openapi3"
 *   asLink
 * />
 *
 * @example
 * <ServiceCard
 *   icon={<GraphIcon />}
 *   name="SPARQL endpoint — gold layer"
 *   url="https://data.odm.lu/sparql"
 *   protocol="sparql"
 * />
 */
export function ServiceCard({
  icon,
  name,
  url,
  protocol = "other",
  asLink = false,
  className = "",
}: ServiceCardProps): React.ReactElement {
  const Root = asLink && url ? "a" : "div";
  const rootProps = asLink && url
    ? { href: url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Root
      {...(rootProps as object)}
      className={[
        "flex items-center gap-3 px-4 py-3",
        "bg-odm-card border border-odm-line",
        asLink
          ? "hover:bg-white hover:border-odm-line-h transition-colors duration-100 cursor-pointer group"
          : "",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red",
        className,
      ].join(" ")}
    >
      {/* Icon box */}
      <div
        aria-hidden="true"
        className="shrink-0 w-9 h-9 flex items-center justify-center bg-odm-surface text-odm-mid text-base"
      >
        {icon ?? (
          /* default chain-link symbol */
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6.5 9.5a3.536 3.536 0 0 0 5 0l2-2a3.536 3.536 0 0 0-5-5L7.25 3.75"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 6.5a3.536 3.536 0 0 0-5 0l-2 2a3.536 3.536 0 0 0 5 5L8.75 12.25"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Name + URL */}
      <div className="flex-1 min-w-0">
        <div className="font-sans text-[13px] font-semibold text-odm-ink leading-tight">
          {name}
        </div>
        {url && (
          <div className="font-mono text-[11px] text-odm-muted mt-0.5 truncate">
            {url}
          </div>
        )}
      </div>

      {/* Protocol badge */}
      <span
        className={[
          "shrink-0 font-sans text-[10px] font-bold tracking-[0.06em] uppercase",
          "px-1.5 py-0.5 leading-4",
          PROTOCOL_CLASSES[protocol],
        ].join(" ")}
      >
        {PROTOCOL_LABEL[protocol]}
      </span>
    </Root>
  );
}
