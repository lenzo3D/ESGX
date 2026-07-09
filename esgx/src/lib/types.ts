/* ============================================================
   ESGX — shared types
   NOTE: all data flowing through these types in the MVP is
   MOCK PROTOTYPE DATA, structured for future Supabase swap-in.
   ============================================================ */

export type EventCategory =
  | "Environmental"
  | "Social"
  | "Governance"
  | "Mixed"
  | "Not ESG relevant";

export type Severity = "Low" | "Medium" | "High";
export type Confidence = "High" | "Medium" | "Low";

export type SourceType =
  | "Official disclosure"
  | "Regulator"
  | "Index provider"
  | "Credible news"
  | "NGO report";

export interface EsgEvent {
  id: string;
  ticker: string;
  title: string;
  summary: string;
  category: EventCategory;
  severity: Severity;
  /** signed contribution to momentum, e.g. -4 .. +4 */
  scoreImpact: number;
  confidence: Confidence;
  source: string;
  sourceType: SourceType;
  /** ISO date; displayed as MMM YYYY everywhere */
  date: string;
  humanReviewRequired: boolean;
}

export interface Source {
  name: string;
  type: SourceType;
  url?: string;
}

export interface TrendPoint {
  month: string; // "Feb 26"
  score: number;
}

export interface KeyMetric {
  label: string;
  value: string;
}

/** Raw third-party rater snapshot (STATIC, illustrative). */
export interface RaterSnapshot {
  msci: string | null; // letter grade
  lseg: number | null; // 0–5
  sustainalyticsRisk: number | null; // risk score, LOWER = better
  spGlobal: number | null; // 0–100
}

/** Plain-language verdicts (lecturer vocabulary — the only vocabulary). */
export type Verdict =
  | "Hidden improver"
  | "Proven improver"
  | "Hidden risk"
  | "Clear risk"
  | "No clear signal";

export type Call = "BUY" | "HOLD" | "AVOID"; // the negative call is always AVOID (§1.5)

export type SectorKey =
  | "financials"
  | "technology"
  | "energyheavy"
  | "default";

export interface Company {
  ticker: string;
  companyName: string;
  sector: string;
  sectorKey: SectorKey;
  country: string;
  market: string; // SGX / NASDAQ / NYSE
  marketCap: string;
  /** pillar scores 0–100 (mock; deep-coverage names only) */
  environmentalScore: number | null;
  socialScore: number | null;
  governanceScore: number | null;
  /** 0–100, from source quality + data completeness */
  confidenceScore: number;
  lastUpdated: string; // ISO
  scoreTrend: TrendPoint[];
  keyMetrics: KeyMetric[];
  recentEvents: EsgEvent[];
  sourceList: Source[];
  raters: RaterSnapshot;
  /** net weighted news momentum (live-computed daily in prod; mock here) */
  momentum: number;
  /** one-line analyst read */
  read: string;
  /** plain one-line tag under the company name */
  tagline: string;
  /** one-line "why the ratings lag here" */
  whyRatingsLag: string;
  /** Does vs Says: action score vs disclosure score, 0–100 */
  doesVsSays: { does: number; says: number };
  /** deep = full dataset; signal = consensus-gap signal only */
  coverage: "deep" | "signal";
}

export interface ScoreBreakdown {
  sectorKey: SectorKey;
  weights: { e: number; s: number; g: number };
  weightedBase: number;
  controversyPenalty: number;
  confidenceAdjustment: number;
  finalScore: number;
  steps: string[]; // human-readable calculation trace
}

export interface RaterView {
  name: string;
  raw: string; // raw display, e.g. "AA", "3.2 / 5", "9.9 risk"
  normalised: number | null; // 0–100, higher = better
}

export interface ConsensusView {
  raters: RaterView[];
  ratersCount: number;
  mean: number;
  spread: number; // max − min of normalised
  verdict: Verdict;
  call: Call;
}

/* ---------- AI contracts ---------- */

export interface AiSourceBackedClaim {
  claim: string;
  source: string;
  sourceType: string;
  date: string;
  confidence: string;
}

export interface AiEsgSummary {
  summary: string;
  keyRisks: string[];
  positiveSignals: string[];
  scoreExplanation: string;
  sourceBackedClaims: AiSourceBackedClaim[];
  confidence: Confidence;
  humanReviewRequired: boolean;
}

export interface AiNewsClassification {
  category: EventCategory;
  severity: Severity;
  scoreImpact: number;
  confidence: Confidence;
  reason: string;
  humanReviewRequired: boolean;
  sourceUsed: string;
}

export type ReviewAction = "Approved" | "Rejected" | "More evidence requested";
