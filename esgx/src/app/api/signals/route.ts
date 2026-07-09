import { NextResponse } from "next/server";
import { COMPANIES, DATA_AS_OF } from "@/data/mockCompanies";
import { deriveConsensus } from "@/lib/esgScoring";
import { getCached } from "@/lib/pipeline/cache";

export const runtime = "nodejs";

/**
 * GET /api/signals — the whole universe as a ranked JSON feed.
 * Sorted by rater split (largest consensus gap first). This is
 * the "screen" a portfolio system would poll every morning.
 */
export async function GET() {
  const rows = COMPANIES.map((c) => {
    const cons = deriveConsensus(c);
    const live = getCached(c.ticker);
    return {
      ticker: c.ticker,
      companyName: c.companyName,
      market: c.market,
      verdict: cons.verdict,
      call: cons.call,
      momentum: c.momentum,
      liveMomentum: live?.liveMomentum ?? null,
      raterSplit: cons.spread,
      ratersCount: cons.ratersCount,
      coverage: c.coverage,
    };
  }).sort((a, b) => b.raterSplit - a.raterSplit);

  return NextResponse.json({
    count: rows.length,
    asOf: DATA_AS_OF,
    model: "ESGX · consensus-gap v3",
    disclaimer: "Mock prototype data · not investment advice",
    signals: rows,
  });
}
