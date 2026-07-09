import { NextRequest, NextResponse } from "next/server";
import { COMPANIES, DATA_AS_OF, RATINGS_AS_OF } from "@/data/mockCompanies";
import { computeFinalScore, deriveConsensus } from "@/lib/esgScoring";
import { getCached } from "@/lib/pipeline/cache";

export const runtime = "nodejs";

/* ============================================================
   ESGX public signal API — the machine-readable product.
   PolyFinTech100 is an API hackathon: this endpoint IS the
   deliverable; the dashboard is one client of it.

   GET /api/signal/{ticker}
   → verdict, call, momentum (snapshot + live if pulled),
     rater consensus, engine score — everything a fund
     manager's system needs to act, as JSON.
   ============================================================ */
export async function GET(_req: NextRequest, { params }: { params: { ticker: string } }) {
  const ticker = decodeURIComponent(params.ticker).toUpperCase();
  const company = COMPANIES.find((c) => c.ticker.toUpperCase() === ticker);

  if (!company) {
    return NextResponse.json(
      {
        error: `Not covered: ${ticker}`,
        coverage: `ESGX currently monitors ${COMPANIES.length} names. Coverage scales by adding companies to the same pipeline.`,
        covered: COMPANIES.map((c) => c.ticker),
      },
      { status: 404 },
    );
  }

  const cons = deriveConsensus(company);
  const breakdown = computeFinalScore(company);
  const live = getCached(company.ticker);

  return NextResponse.json({
    ticker: company.ticker,
    companyName: company.companyName,
    market: company.market,
    sector: company.sector,

    // the actionable signal
    verdict: cons.verdict,
    call: cons.call, // BUY | HOLD | AVOID (never SELL)
    tagline: company.tagline,

    // signal inputs — snapshot
    momentum: company.momentum,
    raterSplit: cons.spread,
    ratersCount: cons.ratersCount,
    raters: cons.raters, // raw + normalised 0–100 (higher = better)
    ratersAsOf: RATINGS_AS_OF,

    // engine score (deterministic — never AI)
    esgxScore: breakdown?.finalScore ?? null,
    scoreBreakdown: breakdown,
    confidenceScore: company.confidenceScore,
    coverage: company.coverage,

    // live pipeline (populated after POST /api/pipeline/refresh)
    live: live
      ? {
          momentum: live.liveMomentum,
          articleCount: live.articleCount,
          provider: live.provider,
          classifier: live.classifier,
          fetchedAt: live.fetchedAt,
          events: live.events,
        }
      : null,
    liveHint: live ? undefined : "POST /api/pipeline/refresh {\"ticker\"} to populate live momentum",

    meta: {
      asOf: DATA_AS_OF,
      model: "ESGX · consensus-gap v3",
      disclaimer: "Mock prototype data · not investment advice",
    },
  });
}
