/* ============================================================
   ESGX — deterministic keyword classifier (zero-cost fallback).
   Mechanical rules, no AI, no network. Used when no LLM key is
   configured or the LLM call fails, so the live pipeline always
   completes. Honest about its limits: headline-keyword matching
   is at most Medium confidence and flags itself for review.
   ============================================================ */
import type { Confidence, EventCategory, Severity } from "@/lib/types";

export interface KeywordClassification {
  id: string;
  category: EventCategory;
  severity: Severity;
  scoreImpact: number;
  confidence: Confidence;
  reason: string;
  humanReviewRequired: boolean;
}

type Cat = "Environmental" | "Social" | "Governance";

interface Rule {
  terms: string[];
  cat: Cat;
  impact: number; // signed
  severity: Severity;
}

const RULES: Rule[] = [
  // Governance — severe negatives
  { terms: ["corruption", "bribery", "fraud", "money laundering", "money-laundering", "embezzle"], cat: "Governance", impact: -4, severity: "High" },
  // Governance — medium negatives
  { terms: ["fine", "penalty", "probe", "investigation", "lawsuit", "sued", "breach", "outage", "sanction", "regulator warns", "mas penalty", "delisting", "resigns", "scandal"], cat: "Governance", impact: -2, severity: "Medium" },
  // Governance — positives
  { terms: ["independent director", "board refresh", "governance award", "transparency report"], cat: "Governance", impact: 1, severity: "Low" },
  // Environmental — negatives
  { terms: ["oil spill", "pollution", "deforestation", "haze", "toxic", "emissions scandal", "greenwash"], cat: "Environmental", impact: -3, severity: "High" },
  { terms: ["coal", "flaring", "environmental breach"], cat: "Environmental", impact: -2, severity: "Medium" },
  // Environmental — positives
  { terms: ["green bond", "green loan", "net-zero", "net zero", "carbon neutral", "carbon-neutral", "renewable", "solar", "wind farm", "sbti", "gresb", "sustainability-linked", "decarbon", "energy efficiency"], cat: "Environmental", impact: 2, severity: "Low" },
  { terms: ["sustainability report", "esg rating upgrade", "climate target"], cat: "Environmental", impact: 1, severity: "Low" },
  // Social — negatives
  { terms: ["fatal", "death", "injury", "accident", "explosion", "labour violation", "labor violation", "strike", "discrimination", "harassment", "child labour", "child labor", "forced labour", "forced labor"], cat: "Social", impact: -3, severity: "High" },
  { terms: ["layoff", "retrench", "safety probe", "recall", "data breach", "unpaid"], cat: "Social", impact: -2, severity: "Medium" },
  // Social — positives
  { terms: ["donation", "community", "diversity", "training programme", "training program", "scholarship", "worker welfare"], cat: "Social", impact: 1, severity: "Low" },
];

const SEV_RANK: Record<Severity, number> = { Low: 0, Medium: 1, High: 2 };

export function keywordClassify(id: string, title: string): KeywordClassification {
  const t = title.toLowerCase();
  const hits: { rule: Rule; term: string }[] = [];
  for (const rule of RULES) {
    for (const term of rule.terms) {
      if (t.includes(term)) {
        hits.push({ rule, term });
        break; // one hit per rule
      }
    }
  }

  if (hits.length === 0) {
    return {
      id,
      category: "Not ESG relevant",
      severity: "Low",
      scoreImpact: 0,
      confidence: "Low",
      reason: "no ESG keyword match in headline (mechanical rules)",
      humanReviewRequired: true,
    };
  }

  const cats = new Set(hits.map((h) => h.rule.cat));
  const category: EventCategory = cats.size > 1 ? "Mixed" : hits[0].rule.cat;
  const impact = Math.max(-5, Math.min(5, hits.reduce((s, h) => s + h.rule.impact, 0)));
  const severity = hits.reduce<Severity>(
    (worst, h) => (SEV_RANK[h.rule.severity] > SEV_RANK[worst] ? h.rule.severity : worst),
    "Low",
  );
  const confidence: Confidence =
    hits.length >= 2 || severity === "High" ? "Medium" : "Low";
  const humanReviewRequired = confidence === "Low" || (severity === "High" && impact < 0);

  return {
    id,
    category,
    severity,
    scoreImpact: impact,
    confidence,
    reason: `keyword match: ${hits.map((h) => h.term).join(", ")} (mechanical rules, no AI)`,
    humanReviewRequired,
  };
}
