"use client";
import { COMPANIES } from "@/data/mockCompanies";
import { fmtMonthYear } from "@/lib/esgScoring";
import { ConfidenceBadge, LiveTag, ReviewBadge, SeverityBadge } from "./Badges";

/**
 * Live ESG Events tab — all events across covered names,
 * strictly newest-first (§1.2). MMM YYYY everywhere.
 */
export default function EventsTable({ onSelect }: { onSelect: (ticker: string) => void }) {
  const rows = COMPANIES.flatMap((c) =>
    c.recentEvents.map((e) => ({ e, company: c.companyName, ticker: c.ticker })),
  ).sort((a, b) => b.e.date.localeCompare(a.e.date));

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-panel">
      <div className="panel-title">
        Live ESG Events <LiveTag />
        <span className="ml-auto font-mono text-[10px] font-normal normal-case text-txt3">
          {rows.length} events · newest first
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-panel2">
            <tr className="text-[9px] uppercase tracking-wide text-txt3">
              {["Date", "Company", "Event", "Category", "Severity", "Impact", "Confidence", "Source", "Review"].map(
                (h) => (
                  <th key={h} className="border-b border-line px-3 py-2 font-bold">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ e, company, ticker }, i) => (
              <tr
                key={e.id}
                onClick={() => onSelect(ticker)}
                className={`cursor-pointer border-b border-black align-top text-[11.5px] ${
                  i % 2 ? "bg-rowalt" : ""
                } hover:bg-hoverrow`}
              >
                <td className="whitespace-nowrap px-3 py-2 font-mono text-[10.5px] text-txt2">
                  {fmtMonthYear(e.date)}
                </td>
                <td className="px-3 py-2">
                  <span className="font-mono text-xs font-bold text-white">{ticker}</span>
                  <span className="block text-[10px] text-txt3">{company}</span>
                </td>
                <td className="max-w-md px-3 py-2">
                  <b className="text-txt">{e.title}</b>
                  <span className="block text-[10.5px] text-txt3">{e.summary}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-txt2">{e.category}</td>
                <td className="px-3 py-2">
                  <SeverityBadge severity={e.severity} />
                </td>
                <td
                  className={`px-3 py-2 font-mono font-bold ${
                    e.scoreImpact > 0 ? "text-up" : e.scoreImpact < 0 ? "text-down" : "text-txt2"
                  }`}
                >
                  {e.scoreImpact > 0 ? "+" : ""}
                  {e.scoreImpact}
                </td>
                <td className="px-3 py-2">
                  <ConfidenceBadge confidence={e.confidence} />
                </td>
                <td className="max-w-40 px-3 py-2 text-[10.5px] text-txt3">
                  {e.source}
                  <span className="block">{e.sourceType}</span>
                </td>
                <td className="px-3 py-2">
                  <ReviewBadge required={e.humanReviewRequired} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-3 py-3 text-[10px] italic text-txt3">
          Snapshot events (illustrative demo data). The live pipeline — real GDELT/RSS articles,
          AI-classified, never AI-generated — runs on each company page via “Pull live news”.
        </p>
      </div>
    </section>
  );
}
