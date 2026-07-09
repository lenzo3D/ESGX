/* ============================================================
   ESGX deterministic scoring engine.
   The final ESG score is calculated HERE — never by AI.
   Transparent, auditable, and unit-testable. No AI calls.
   ============================================================ */
import type {
  Company,
  ConsensusView,
  RaterView,
  ScoreBreakdown,
  SectorKey,
  Verdict,
  Call,
} from "./types";

/* ---------- sector weights ---------- */
export const SECTOR_WEIGHTS: Record<SectorKey, { e: number; s: number; g: number; label: string }> = {
  financials: { e: 0.25, s: 0.30, g: 0.45, label: "Banks / Financials — governance-weighted" },
  technology: { e: 0.30, s: 0.35, g: 0.35, label: "Technology — social & governance-weighted" },
  energyheavy: { e: 0.45, s: 0.30, g: 0.25, label: "Automobiles / energy-heavy — environment-weighted" },
  default: { e: 0.33, s: 0.33, g: 0.34, label: "Default equal weighting" },
};

/* ---------- controversy penalty ----------
   Each recent event with negative scoreImpact contributes a penalty
   scaled by severity. Capped so one bad quarter can't zero a score. */
const SEVERITY_FACTOR: Record<string, number> = { Low: 0.5, Medium: 1.0, High: 2.0 };
const PENALTY_CAP = 15;

/* ---------- confidence adjustment ----------
   Low-confidence datasets shrink the distance from the neutral 50,
   i.e. we refuse to be extreme on weak evidence. */
function confidenceFactor(confidenceScore: number): number {
  return 0.8 + 0.2 * (confidenceScore / 100); // 0.8 .. 1.0
}

export function computeFinalScore(c: Company): ScoreBreakdown | null {
  if (c.environmentalScore == null || c.socialScore == null || c.governanceScore == null) {
    return null; // signal-only coverage — no pillar data yet
  }
  const w = SECTOR_WEIGHTS[c.sectorKey];
  const steps: string[] = [];

  const weightedBase =
    c.environmentalScore * w.e + c.socialScore * w.s + c.governanceScore * w.g;
  steps.push(
    `Weighted base = E ${c.environmentalScore} × ${w.e} + S ${c.socialScore} × ${w.s} + G ${c.governanceScore} × ${w.g} = ${weightedBase.toFixed(1)} (${w.label})`
  );

  let controversyPenalty = 0;
  for (const ev of c.recentEvents) {
    if (ev.scoreImpact < 0) {
      controversyPenalty += Math.abs(ev.scoreImpact) * (SEVERITY_FACTOR[ev.severity] ?? 1);
    }
  }
  controversyPenalty = Math.min(controversyPenalty, PENALTY_CAP);
  steps.push(
    `Controversy penalty = Σ |negative event impact| × severity factor, capped at ${PENALTY_CAP} → −${controversyPenalty.toFixed(1)}`
  );

  const cf = confidenceFactor(c.confidenceScore);
  const afterPenalty = weightedBase - controversyPenalty;
  const finalScore = 50 + (afterPenalty - 50) * cf;
  steps.push(
    `Confidence adjustment: score pulled toward neutral 50 by factor ${cf.toFixed(2)} (confidence ${c.confidenceScore}/100) → final ${finalScore.toFixed(1)}`
  );

  return {
    sectorKey: c.sectorKey,
    weights: w,
    weightedBase: r1(weightedBase),
    controversyPenalty: r1(controversyPenalty),
    confidenceAdjustment: r1(finalScore - afterPenalty),
    finalScore: r1(finalScore),
    steps,
  };
}

/* ============================================================
   Rater normalisation + consensus-gap verdict
   (same engine as the original scanner, plain-language verdicts)
   ============================================================ */
const MSCI_SCALE: Record<string, number> = {
  CCC: 0, B: 100 / 6, BB: 200 / 6, BBB: 50, A: 400 / 6, AA: 500 / 6, AAA: 100,
};

const r1 = (x: number) => Number(x.toFixed(1));

export function normaliseRaters(c: Company): RaterView[] {
  const { msci, lseg, sustainalyticsRisk, spGlobal } = c.raters;
  return [
    { name: "MSCI", raw: msci ?? "not rated", normalised: msci == null ? null : r1(MSCI_SCALE[msci] ?? 50) },
    { name: "LSEG", raw: lseg == null ? "not rated" : `${lseg.toFixed(1)} / 5`, normalised: lseg == null ? null : r1(lseg * 20) },
    {
      name: "Sustainalytics",
      raw: sustainalyticsRisk == null ? "not rated" : `${sustainalyticsRisk.toFixed(1)} risk`,
      // RISK score: lower = better → invert for the shared higher-is-better scale
      normalised: sustainalyticsRisk == null ? null : r1(100 - sustainalyticsRisk),
    },
    { name: "S&P Global", raw: spGlobal == null ? "not rated" : `${spGlobal.toFixed(0)} / 100`, normalised: spGlobal == null ? null : r1(spGlobal) },
  ];
}

export function deriveConsensus(c: Company): ConsensusView {
  const raters = normaliseRaters(c);
  const vals = raters.map((r) => r.normalised).filter((v): v is number => v != null);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const spread = Math.max(...vals) - Math.min(...vals);

  const split = spread >= 20; // raters disagree
  const up = c.momentum > 5;
  const downM = c.momentum < -5;

  let verdict: Verdict = "No clear signal";
  if (split && up) verdict = "Hidden improver";
  else if (!split && up) verdict = "Proven improver";
  else if (split && downM) verdict = "Hidden risk";
  else if (!split && downM) verdict = "Clear risk";

  const call: Call = up ? "BUY" : downM ? "AVOID" : "HOLD";

  return { raters, ratersCount: vals.length, mean: r1(mean), spread: r1(spread), verdict, call };
}

/* ---------- presentation helpers (single vocabulary, single palette) ---------- */
export const VERDICT_META: Record<
  Verdict,
  { color: string; fill: boolean; blurb: string }
> = {
  "Hidden improver": { color: "#1fbf4f", fill: true, blurb: "Raters split · momentum improving → mispriced upside" },
  "Proven improver": { color: "#1fbf4f", fill: false, blurb: "Raters agree · momentum improving → upgrade likely" },
  "Hidden risk": { color: "#d83333", fill: true, blurb: "Raters split · momentum deteriorating → avoid" },
  "Clear risk": { color: "#f0791e", fill: true, blurb: "Raters agree · momentum deteriorating → downgrade warning" },
  "No clear signal": { color: "#7d828c", fill: false, blurb: "No decisive combination of split and momentum" },
};

export const CALL_META: Record<Call, { color: string; bg: string }> = {
  BUY: { color: "#06210e", bg: "#1fbf4f" },
  HOLD: { color: "#2b2400", bg: "#e3c11f" },
  AVOID: { color: "#ffffff", bg: "#d83333" },
};

/** Display all event / update dates the same way everywhere: MMM YYYY. */
export function fmtMonthYear(iso: string): string {
  const d = new Date(iso + (iso.length === 7 ? "-01" : ""));
  return d.toLocaleDateString("en-SG", { month: "short", year: "numeric" });
}

export function fmtFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-SG", { day: "2-digit", month: "short", year: "numeric" });
}

/* ============================================================
   Live momentum — the Methodology-tab formula, deterministic:
   Momentum = Σ ( direction × impact × source weight × recency decay )
   direction+impact arrive combined as the signed scoreImpact.
   ============================================================ */
/** Source weight by domain credibility. Official/regulator highest; unknown outlets lowest. */
const SOURCE_WEIGHT_TIERS: { pattern: RegExp; weight: number }[] = [
  { pattern: /(\.gov|mas\.gov\.sg|nhtsa\.gov|europa\.eu|sgx\.com|sec\.gov)/i, weight: 1.0 },
  { pattern: /(reuters|bloomberg|ft\.com|wsj|straitstimes|businesstimes|channelnewsasia|nikkei|scmp|cnbc|theedge)/i, weight: 0.9 },
  { pattern: /(yahoo|marketwatch|barrons|forbes|guardian|bbc|apnews|theStar|todayonline)/i, weight: 0.75 },
];
export function sourceWeight(domain: string): number {
  for (const t of SOURCE_WEIGHT_TIERS) if (t.pattern.test(domain)) return t.weight;
  return 0.5; // unverified outlets move the score only slightly
}

/** Half-life recency decay: an event's weight halves every 30 days. */
export function recencyDecay(eventIso: string, asOf: Date): number {
  const days = Math.max(0, (asOf.getTime() - new Date(eventIso).getTime()) / 86_400_000);
  return Math.pow(0.5, days / 30);
}

export interface LiveEventInput {
  scoreImpact: number; // signed: direction × impact (from AI classification)
  date: string; // ISO
  domain: string;
}

/** Deterministic momentum from classified live events. Never calls AI. */
export function computeMomentumFromEvents(events: LiveEventInput[], asOf = new Date()): number {
  const m = events.reduce(
    (sum, e) => sum + e.scoreImpact * sourceWeight(e.domain) * recencyDecay(e.date, asOf),
    0,
  );
  return r1(m);
}

/** Days until the next semi-annual index review (Jun / Dec cycles). */
export function daysToNextIndexReview(from = new Date()): number {
  const year = from.getFullYear();
  const reviews = [new Date(year, 5, 20), new Date(year, 11, 18), new Date(year + 1, 5, 20)];
  const next = reviews.find((d) => d.getTime() > from.getTime())!;
  return Math.ceil((next.getTime() - from.getTime()) / 86_400_000);
}
