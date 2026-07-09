import { NextRequest, NextResponse } from "next/server";
import { hasAnyLlmKey, llmJson } from "@/lib/ai/llm";
import { ESG_SUMMARY_SYSTEM, buildSummaryUserPrompt } from "@/lib/ai/prompts";
import type { AiEsgSummary } from "@/lib/types";

export const runtime = "nodejs";

/**
 * POST /api/ai/esg-summary
 * Body: { company, scoring, events, sources } — the ONLY data the AI sees.
 * AI summarises/explains; the final score always comes from the engine.
 */
export async function POST(req: NextRequest) {
  if (!hasAnyLlmKey()) {
    return NextResponse.json(
      {
        error:
          "AI summary needs an LLM key: set GEMINI_API_KEY (free at aistudio.google.com) or ANTHROPIC_API_KEY in esgx/.env.local (see .env.example). The rest of the dashboard works without it.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { company, scoring, events, sources } = (body ?? {}) as Record<string, unknown>;
  if (!company || !events) {
    return NextResponse.json(
      { error: "Missing required fields: company, events" },
      { status: 400 },
    );
  }

  try {
    const result = await llmJson<AiEsgSummary>(
      ESG_SUMMARY_SYSTEM,
      buildSummaryUserPrompt({ company, scoring, events, sources }),
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
