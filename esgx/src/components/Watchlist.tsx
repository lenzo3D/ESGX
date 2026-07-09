"use client";
import { COMPANIES } from "@/data/mockCompanies";
import { deriveConsensus } from "@/lib/esgScoring";
import { VerdictBadge } from "./Badges";

/**
 * Watchlist — home-screen left column (~1/3 width, §3.2).
 * Columns renamed per §2.2: "Rater split", "Momentum".
 */
export default function Watchlist({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (ticker: string) => void;
}) {
  const rows = COMPANIES.map((c) => ({ c, cons: deriveConsensus(c) })).sort(
    (a, b) => b.cons.spread - a.cons.spread,
  );

  return (
    <section className="flex min-h-0 flex-col border-r border-line bg-panel">
      <div className="panel-title">
        Watchlist <span className="font-mono text-[10px] font-normal text-txt3">{rows.length} names</span>
        <span className="ml-auto font-mono text-[9px] font-normal normal-case text-txt3">sorted by rater split</span>
      </div>
      <div className="grid flex-none grid-cols-[1fr_64px_62px] gap-2 border-b border-line bg-panel2 px-3 py-1 text-[9px] uppercase tracking-wide text-txt3">
        <span>Company</span>
        <span className="text-right">Rater split</span>
        <span className="text-right">Momentum</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {rows.map(({ c, cons }, i) => (
          <button
            key={c.ticker}
            onClick={() => onSelect(c.ticker)}
            className={`grid w-full grid-cols-[1fr_64px_62px] items-center gap-2 border-b border-black px-3 py-1.5 text-left ${
              selected === c.ticker ? "bg-selrow" : i % 2 ? "bg-rowalt hover:bg-hoverrow" : "hover:bg-hoverrow"
            }`}
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white">{c.ticker}</span>
                <VerdictBadge verdict={cons.verdict} />
              </span>
              <span className="block truncate text-[10px] text-txt3">{c.companyName}</span>
            </span>
            <span className="text-right font-mono text-xs font-bold text-txt">{cons.spread.toFixed(1)}</span>
            <span
              className={`text-right font-mono text-xs font-bold ${
                c.momentum > 1 ? "text-up" : c.momentum < -1 ? "text-down" : "text-txt2"
              }`}
            >
              {c.momentum > 0 ? "+" : ""}
              {c.momentum.toFixed(1)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
