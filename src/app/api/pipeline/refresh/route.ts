import { NextRequest, NextResponse } from "next/server";
import { collectNews, type GdeltArticle } from "@/lib/pipeline/gdelt";
import { hasAnyLlmKey, llmJson, llmProviderName } from "@/lib/ai/llm";
import { keywordClassify } from "@/lib/pipeline/keywordClassify";
import { getCached, setCached } from "@/lib/pipeline/cache";
import type { LiveEvent, RefreshResult } from "@/lib/pipeline/types";
import { BATCH_CLASSIFY_SYSTEM, buildBatchClassifyPrompt } from "@/lib/ai/prompts";
import { computeMomentumFromEvents, sourceWeight } from "@/lib/esgScoring";
import { COMPANIES } from "@/data/mockCompanies";
import type { Confidence, EventCategory, Severity } from "@/lib/types";

export const runtime = "nodejs";

/* ============================================================
   POST /api/pipeline/refresh  { ticker }
   The live pipeline, exactly as the Methodology tab describes:
   1. Collect — real articles from GDELT (free public source)
   2. Filter/classify — AI labels each REAL headline (never generates)
   3. Compute — deterministic momentum from the engine formula
   Results cached in-memory for 15 minutes (GDELT's own cadence).
   ============================================================ */

interface ClassifiedItem {
  id: string;
  category: EventCategory;
  severity: Severity;
  scoreImpact: number;
  confidence: Confidence;
  reason: string;
  humanReviewRequired: boolean;
}

export async function POST(req: NextRequest) {
  let ticker: string;
  try {
    ({ ticker } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const company = COMPANIES.find((c) => c.ticker === ticker);
  if (!company) {
    return NextResponse.json({ error: `Unknown ticker: ${ticker}` }, { status: 404 });
  }

  const hit = getCached(ticker);
  if (hit) {
    return NextResponse.json({ ...hit, note: "served from 15-min cache" });
  }

  // 1 · Collect real articles (GDELT first, Google News RSS fallback)
  let articles: GdeltArticle[];
  let provider: string;
  try {
    ({ articles, provider } = await collectNews(company.companyName));
  } catch (err) {
    const message = err instanceof Error ? err.message : "collection failed";
    return NextResponse.json(
      { error: `Live collection failed on both providers: ${message}. Try again in ~10 seconds.` },
      { status: 502 },
    );
  }

  // 2 · Classification — LLM (Gemini free tier → Claude) labels real
  //     articles; mechanical keyword rules guarantee completion with
  //     no keys at all. Nothing is ever generated.
  const toEvent = (a: GdeltArticle, c: ClassifiedItem | undefined, fallbackReason: string): LiveEvent => {
    const review =
      !c || c.confidence === "Low" || (c.severity === "High" && c.scoreImpact < 0)
        ? true
        : c.humanReviewRequired;
    return {
      ...a,
      category: c?.category ?? "Unclassified",
      severity: c?.severity ?? null,
      scoreImpact: c?.scoreImpact ?? 0,
      confidence: c?.confidence ?? null,
      reason: c?.reason ?? fallbackReason,
      humanReviewRequired: review,
      sourceWeight: sourceWeight(a.domain),
    };
  };

  let events: LiveEvent[] = [];
  let classifier = "Keyword rules (no AI)";
  if (articles.length > 0) {
    let llmDone = false;
    if (hasAnyLlmKey()) {
      try {
        const { items } = await llmJson<{ items: ClassifiedItem[] }>(
          BATCH_CLASSIFY_SYSTEM,
          buildBatchClassifyPrompt(
            company.companyName,
            articles.map((a) => ({ id: a.id, title: a.title, domain: a.domain, date: a.date })),
          ),
          6000,
        );
        const byId = new Map(items.map((i) => [i.id, i]));
        events = articles.map((a) => toEvent(a, byId.get(a.id), "classification missing"));
        classifier = llmProviderName() ?? "LLM";
        llmDone = true;
      } catch {
        /* fall through to keyword rules */
      }
    }
    if (!llmDone) {
      events = articles.map((a) => toEvent(a, keywordClassify(a.id, a.title), ""));
    }
  }

  // 3 · Deterministic momentum — engine formula, ESG-relevant items only
  const relevant = events.filter((e) => e.category !== "Not ESG relevant" && e.category !== "Unclassified");
  const liveMomentum = computeMomentumFromEvents(relevant);

  const result: RefreshResult = {
    ticker,
    fetchedAt: new Date().toISOString(),
    articleCount: articles.length,
    provider,
    classified: true,
    classifier,
    events,
    liveMomentum,
  };
  setCached(ticker, result);
  return NextResponse.json(result);
}
