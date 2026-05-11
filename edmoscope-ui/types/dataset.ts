/**
 * Dataset detail page — domain types.
 *
 * These types model a single dataset in the EDMoScope catalogue,
 * structured around the five-tab decision funnel:
 *   1. Understand  2. Rights  3. Quality  4. Provenance  5. Access
 *
 * NOTE: `ColumnDef` from this file is renamed `SchemaColumn` to avoid
 * collision with DataTable's generic `ColumnDef<T>` utility type.
 */

/** Opaque identifier for a dataset. */
export type DatasetId = string;

/** The medallion layer this dataset belongs to. */
export type DatasetLayer = 'bronze' | 'silver' | 'gold' | 'outputs';

/** Whether the user is cleared to access this dataset. */
export type RightsClearance = 'cleared' | 'requires-request' | 'denied';

/** Required OdM permission role. */
export type RequiredPermission = 'odm-read' | 'odm-admin' | 'odm-superuser';

/** Freshness quality assessment result. */
export type FreshnessTolerance = 'ok' | 'stale' | 'overdue';

/** PROV-O activity kinds used in the OdM pipeline. */
export type ActivityKind =
  | 'odm:Reception'
  | 'odm:Transformation'
  | 'odm:Dissemination';

/** Kind of lineage node in the simplified leaves graph. */
export type LineageNodeKind =
  | 'external-reception'
  | 'internal-consumer'
  | 'gold-output'
  | 'saved-query-set';

/**
 * A single schema column definition.
 *
 * Named `SchemaColumn` (not `ColumnDef`) to avoid collision with the
 * DataTable component's generic `ColumnDef<T>` utility type.
 */
export interface SchemaColumn {
  /** Column name as it appears in the catalogue table. */
  name: string;
  /** Logical data type, e.g. "date", "enum", "integer", "boolean". */
  dataType: string;
  /**
   * Allowable value set for enum columns.
   * Rendered as a smaller second line below the type cell.
   * E.g. "inbound · outbound".
   */
  valueDomain?: string;
  /** Whether the column may contain NULL values. */
  nullable: boolean;
  /** What the column means in business/analyst terms. */
  businessMeaning: string;
  /** How the column is populated in technical/engineering terms. */
  technicalDefinition: string;
}

/**
 * A meaning-level or fitness-level caveat attached to a dataset.
 *
 * `kind === 'meaning'` → shown on Understand tab (Caveats panel).
 * `kind === 'fitness'` → shown on Quality tab (Known issues).
 *
 * When `crossReferenceTab` is set, the caveat is shown on BOTH tabs
 * with a cross-reference link.
 */
export interface Caveat {
  /** Unique identifier. */
  id: string;
  /** Which register this caveat belongs to. */
  kind: 'meaning' | 'fitness';
  /** Human-readable caveat text. */
  text: string;
  /** ISO date from which this caveat applies, if relevant. */
  effectiveFrom?: string;
  /** When set, this caveat is also shown on the referenced tab. */
  crossReferenceTab?: 'understand' | 'quality';
}

/** A record of a past data dissemination (question this dataset answered). */
export interface Dissemination {
  /** Unique identifier. */
  id: string;
  /** The literal one-sentence question the dissemination answered. */
  answeredQuestion: string;
  /** Recipient organisation or team. */
  recipient: string;
  /** ISO date of dissemination. */
  date: string;
  /** What was delivered, e.g. "briefing note", "data extract". */
  kind: string;
}

/** A piece of applicable legislation. */
export interface Legislation {
  /** Human-readable law name. */
  label: string;
  /** Optional URI linking to the full text. */
  uri?: string;
  /** Why this legislation applies to the dataset. */
  note: string;
}

/** A known data quality issue (fitness-level). */
export interface KnownIssue {
  /** Unique identifier. */
  id: string;
  /** Short title. */
  title: string;
  /** Detailed description. */
  detail: string;
  /** Severity level. */
  severity: 'info' | 'warn' | 'severe';
  /** Whether the issue is still active or has been resolved. */
  status: 'active' | 'resolved';
  /** ISO date from which the issue applies. */
  affectsFrom?: string;
  /** ISO date to which the issue applies. */
  affectsTo?: string;
  /**
   * When set, this issue is also shown on the referenced tab
   * with appropriate framing.
   */
  crossReferenceTab?: 'understand' | 'quality';
}

/** Per-column quality signal — only populated for columns with something notable. */
export interface ColumnQualitySignal {
  /** Column name this signal describes. */
  columnName: string;
  /** Percentage of rows where this column is NULL. */
  nullablePct?: number;
  /** Approximate count of distinct values. */
  distinctCount?: number;
  /** Free-form quality note explaining what is notable. */
  notable: string;
}

/** A node in the simplified lineage leaf graph. */
export interface LineageNode {
  /** Unique identifier. */
  id: string;
  /** Display title of the upstream or downstream asset. */
  title: string;
  /** Kind of lineage node. */
  kind: LineageNodeKind;
  /** Short metadata note, e.g. "Daily SFTP drop". */
  meta?: string;
}

/** Simplified two-leaves lineage graph shown on the Provenance tab. */
export interface LineageGraph {
  /** External or upstream datasets from which this one derives. */
  upstreamLeaves: LineageNode[];
  /** Downstream consumers of this dataset. */
  downstreamLeaves: LineageNode[];
  /**
   * Number of intermediate transformation steps hidden from this view.
   * Shown as "N intermediate steps skipped."
   */
  intermediateCount: number;
  /**
   * True if this dataset is its own upstream leaf (a primary source
   * with no data predecessors inside OdM).
   */
  isPrimarySource: boolean;
}

/** A single event in the PROV-O event log. */
export interface ProvenanceEvent {
  /** Unique identifier. */
  id: string;
  /** PROV-O activity kind. */
  activityKind: ActivityKind;
  /** Human-readable one-line summary of what happened. */
  summary: string;
  /** Agents attributed to this activity (Airflow DAG names, analyst emails). */
  attributedTo: string[];
  /** ISO timestamp of the event. */
  timestamp: string;
}

/** A file or API distribution of the dataset. */
export interface Distribution {
  /** S3 URI or equivalent access URL. */
  accessUrl: string;
  /** Human label for the format, e.g. "Parquet (partitioned by date)". */
  format: string;
  /** IANA media type URI. */
  mediaType: string;
  /** Approximate size in bytes. */
  byteSize: number;
  /** Approximate row count. */
  rowCount?: number;
  /** Partitioning scheme, e.g. "date". */
  partitioning?: string;
}

/** A saved SQL query against this dataset. */
export interface SavedQuery {
  /** Unique identifier. */
  id: string;
  /** Human-readable title. */
  title: string;
  /** The full SQL text of the query. */
  sql: string;
  /** Who saved this query. */
  savedBy: string;
  /** ISO date the query was saved. */
  savedDate: string;
  /**
   * When true, this is the recommended starting query shown prominently
   * on the Access tab.
   */
  isCanonical?: boolean;
  /**
   * Explanatory note shown as a caption below the canonical query block.
   * Only used when `isCanonical` is true.
   *
   * SCHEMA NOTE: This field was added to `SavedQuery` (vs `Distribution`)
   * because the note describes the query pattern, not the distribution format.
   * Flag for backend: add `saved_query_note TEXT` to the saved_queries table.
   */
  note?: string;
}

/** The full dataset detail model. */
export interface Dataset {
  /** Unique dataset identifier. */
  id: DatasetId;
  /** Full display title. */
  title: string;
  /** 1–2 sentence summary shown in the page header. */
  shortDescription: string;
  /** DCAT dataset type. */
  type: { label: string; conceptUri: string };
  /** Medallion layer. */
  layer: DatasetLayer;
  /** Semantic version string. */
  version: string;
  /** ISO timestamp of the most recent data refresh. */
  lastModified: string;
  /** Publishing organisation. */
  publisher: { name: string; uri?: string };
  /** Data steward responsible for this dataset. */
  steward: { name: string; email: string };
  /** Discovery keywords. */
  keywords: string[];
  /** Date range of the data content. */
  temporalCoverage: { start: string; end: string | 'ongoing' };
  /** Human description of spatial scope. */
  spatialCoverage?: string;

  // ── Understand ────────────────────────────────────────────────────────────
  /**
   * What this dataset represents — analyst register.
   * Must NOT contain table names, DAG names, or partition columns.
   */
  businessDefinition: string;
  /**
   * How this dataset is produced — engineering register.
   * Must NOT editorialise about meaning.
   */
  technicalDefinition: string;
  /** Meaning-level caveats (kind === 'meaning'). */
  caveats: Caveat[];
  /** Column-level schema. */
  schema: SchemaColumn[];
  /**
   * Optional free-form decision guidance, e.g. "for finer resolution use X".
   * Shown in a sidebar card on the Understand tab.
   */
  decisionShortcut?: string;
  /** Recent disseminations that cite this dataset. */
  disseminations: Dissemination[];
  /** Total count of all disseminations (disseminations[] is a recent subset). */
  totalDisseminationCount: number;

  // ── Rights ────────────────────────────────────────────────────────────────
  /** Gate verdict: cleared / requires request / denied. */
  rightsClearance: RightsClearance;
  /** Optional prose explaining the clearance decision. */
  rightsClearanceReason?: string;
  /** Applicable legislation entries. */
  applicableLegislation: Legislation[];
  /** Minimum OdM role required to access this dataset. */
  requiredPermission: RequiredPermission;
  /** Whether the currently authenticated user has the required permission. */
  userHasAccess: boolean;
  /** Licence under which the dataset may be used. */
  license: { label: string; uri?: string; scope?: string };
  /** Prose description of the retention policy. */
  retentionPolicy?: string;
  /** Sensitivity classification label. */
  sensitivity?: string;

  // ── Quality ───────────────────────────────────────────────────────────────
  /** Aggregate quality signals for the header row. */
  qualitySignals: {
    /** Hours since the last successful refresh. */
    freshnessHours: number;
    /** Analyst-facing freshness verdict. */
    freshnessTolerance: FreshnessTolerance;
    /** Percentage of expected rows present. */
    completenessPct: number;
    /** Total days of data content covered. */
    coverageDays: number;
    /** Human label for the update cadence, e.g. "Daily". */
    cadence: string;
    /** dct:accrualPeriodicity URI. */
    cadenceUri?: string;
    /** Airflow DAG name that produces this dataset. */
    rebuildJob?: string;
  };
  /** Known fitness-level issues. */
  knownIssues: KnownIssue[];
  /** Per-column quality signals (only columns with something to say). */
  columnQualitySignals: ColumnQualitySignal[];

  // ── Provenance ────────────────────────────────────────────────────────────
  /** Simplified two-leaves lineage graph. */
  lineage: LineageGraph;
  /** Recent PROV-O events shown in the log panel. */
  recentProvenanceEvents: ProvenanceEvent[];
  /** Total count of all provenance events. */
  totalProvenanceEventCount: number;

  // ── Access ────────────────────────────────────────────────────────────────
  /** Available file/API distributions. */
  distributions: Distribution[];
  /**
   * Canonical catalogue table reference, e.g. "silver.cordon_daily_flows".
   * Shown in monospace, gov-blue on the Access tab.
   */
  catalogTable?: string;
  /** Sample queries — first isCanonical entry is shown prominently. */
  sampleQueries: SavedQuery[];
}
