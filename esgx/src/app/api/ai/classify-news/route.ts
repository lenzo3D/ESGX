import { NextRequest, NextResponse } from "next/server";
import { hasAnyLlmKey, llmJson } from "@/lib/ai/llm";
import { keywordClassify } from "@/lib/pipeline/keywordClassify";
import { CLASSIFY_NEWS_SYSTEM, buildClassifyUserPrompt } from "@/lib/ai/prompts";
import type { AiNewsClassification } from "@/lib/types";

export const runtime = "nodejs";

/**
 * POST /api/ai/classify-news
 * Body: { ticker, headline, summary, source, date }
 * No source → no classification (guardrail enforced server-side too).
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { ticker, headline, summary, source, date } = (body ?? {}) as Record<string, string>;
  if (!ticker || !headline) {
    return NextResponse.json({ error: "Missing required fields: ticker, headline" }, { status: 400 });
  }

  // Guardrail: no source means no classification — return the refusal
  // shape directly without spending an AI call (works even without a key).
  if (!source) {
    const refusal: AiNewsClassification = {
      category: "Not ESG relevant",
      severity: "Low",
      scoreImpact: 0,
      confidence: "Low",
      reason: "no source provided — cannot classify",
      humanReviewRequired: true,
      sourceUsed: "",
    };
    return NextResponse.json(refusal);
  }

  // No LLM key → deterministic keyword rules (mechanical, honest about limits)
  if (!hasAnyLlmKey()) {
    const kc = keywordClassify("single", headline);
    const result: AiNewsClassification = {
      category: kc.category,
      severity: kc.severity,
      scoreImpact: kc.scoreImpact,
      confidence: kc.confidence,
      reason: kc.reason,
      humanReviewRequired: kc.humanReviewRequired,
      sourceUsed: source,
    };
    return NextResponse.json(result);
  }

  try {
    const result = await llmJson<AiNewsClassification>(
      CLASSIFY_NEWS_SYSTEM,
      buildClassifyUserPrompt({ ticker, headline, summary, source, date }),
      1000,
    );
    // Server-side enforcement of the review guardrails, independent of the model.
    if ((result.severity === "High" && result.scoreImpact < 0) || result.confidence === "Low") {
      result.humanReviewRequired = true;
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
