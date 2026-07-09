"use client";
import { useState } from "react";
import { COMPANIES } from "@/data/mockCompanies";
import type { ReviewAction } from "@/lib/types";
import { fmtMonthYear } from "@/lib/esgScoring";
import { ConfidenceBadge, SeverityBadge } from "./Badges";

/**
 * Human Review tab — every event with humanReviewRequired.
 * MVP: decisions live in local React state only (no DB yet).
 */
export default function HumanReviewQueue() {
  const [decisions, setDecisions] = useState<Record<string, ReviewAction>>({});

  const rows = COMPANIES.flatMap((c) =>
    c.recentEvents
      .filter((e) => e.humanReviewRequired)
      .map((e) => ({ e, company: c.companyName, ticker: c.ticker })),
  ).sort((a, b) => b.e.date.localeCompare(a.e.date));

  const pending = rows.filter(({ e }) => !decisions[e.id]).length;

  const act = (id: string, a: ReviewAction) => setDecisions((d) => ({ ...d, [id]: a }));

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-panel">
      <div className="panel-title">
        Human Review Queue
        <span className="ml-auto font-mono text-[10px] font-normal normal-case text-txt3">
          {pending} pending · {rows.length - pending} resolved
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-panel2">
            <tr className="text-[9px] uppercase tracking-wide text-txt3">
              {["Company", "Event", "Category", "Severity", "Confidence", "Summary", "Source", "Action"].map((h) => (
                <th key={h} className="border-b border-line px-3 py-2 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ e, company, ticker }, i) => {
              const decided = decisions[e.id];
              return (
                <tr key={e.id} className={`border-b border-black align-top text-[11.5px] ${i % 2 ? "bg-rowalt" : ""}`}>
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs font-bold text-white">{ticker}</span>
                    <span className="block text-[10px] text-txt3">{company}</span>
                  </td>
                  <td className="max-w-56 px-3 py-2">
                    <b className="text-txt">{e.title}</b>
                    <span className="block font-mono text-[10px] text-txt3">{fmtMonthYear(e.date)}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-txt2">{e.category}</td>
                  <td className="px-3 py-2">
                    <SeverityBadge severity={e.severity} />
                  </td>
                  <td className="px-3 py-2">
                    <ConfidenceBadge confidence={e.confidence} />
                  </td>
                  <td className="max-w-72 px-3 py-2 text-[10.5px] text-txt2">{e.summary}</td>
                  <td className="max-w-36 px-3 py-2 text-[10.5px] text-txt3">
                    {e.source}
                    <span className="block">{e.sourceType}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {decided ? (
                      <span
                        className={`badge ${
                          decided === "Approved"
                            ? "border border-[#1a5e33] bg-[#08160d] text-[#5fd98a]"
                            : decided === "Rejected"
                              ? "border border-[#7a2222] bg-[#2a0808] text-[#f26d6d]"
                              : "border border-[#6b4a12] bg-[#2a1c05] text-[#f0b94a]"
                        }`}
                      >
                        {decided}
                      </span>
                    ) : (
                      <span className="flex gap-1">
                        <button
                          onClick={() => act(e.id, "Approved")}
                          className="border border-[#1a5e33] bg-[#08160d] px-2 py-0.5 text-[10px] font-bold text-[#5fd98a] hover:bg-[#0d2416]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => act(e.id, "Rejected")}
                          className="border border-[#7a2222] bg-[#2a0808] px-2 py-0.5 text-[10px] font-bold text-[#f26d6d] hover:bg-[#3a0d0d]"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => act(e.id, "More evidence requested")}
                          className="border border-[#6b4a12] bg-[#2a1c05] px-2 py-0.5 text-[10px] font-bold text-[#f0b94a] hover:bg-[#3a2708]"
                        >
                          More evidence
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="px-3 py-3 text-[10px] italic text-txt3">
          MVP note: decisions update local state only — database persistence is the Supabase phase.
        </p>
      </div>
    </section>
  );
}
