"use client";
import { useState } from "react";
import type { Company } from "@/lib/types";
import { RATINGS_AS_OF } from "@/data/mockCompanies";
import {
  computeFinalScore,
  daysToNextIndexReview,
  deriveConsensus,
  fmtMonthYear,
} from "@/lib/esgScoring";
import {
  CallChip,
  ConfidenceBadge,
  LiveTag,
  ReviewBadge,
  SeverityBadge,
  StaticTag,
  VerdictBadge,
} from "./Badges";
import ESGBreakdown from "./ESGBreakdown";
import LiveSignal from "./LiveSignal";
import TrendChart from "./TrendChart";

/**
 * Company detail — ONE story, top to bottom, fixed order (§3.3):
 * 1 header · 2 the call · 3 momentum + trend · 4 what is moving the
 * signal · 5 Does vs Says · 6 where the raters stand · 7 why the
 * ratings lag. No detached side-boxes.
 */
export default function CompanyDetail({ company }: { company: Company }) {
  const [liveMomentum, setLiveMomentum] = useState<number | null>(null);
  const cons = deriveConsensus(company);
  const breakdown = computeFinalScore(company);
  const events = [...company.recentEvents].sort((a, b) => b.date.localeCompare(a.date));
  const conviction =
    company.confidenceScore >= 80 ? "High" : company.confidenceScore >= 65 ? "Medium" : "Low";

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-panel">
      {/* 1 · header */}
      <div className="border-b border-line bg-panel2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-white">{company.companyName}</h1>
          <span className="font-mono text-xs text-txt2">
            {company.ticker} · {company.market}
          </span>
          <VerdictBadge verdict={cons.verdict} />
        </div>
        <p className="mt-1 text-[12.5px] text-txt2">{company.tagline}</p>
        <p className="mt-0.5 font-mono text-[10px] text-txt3">
          {company.sector} · {company.country} · Mkt cap {company.marketCap} · Updated{" "}
          {fmtMonthYear(company.lastUpdated)}
        </p>
      </div>

      {/* 2 · the call */}
      <div className="flex flex-wrap items-center gap-4 border-b border-line px-4 py-3">
        <CallChip call={cons.call} />
        <div className="text-[11px] leading-tight text-txt2">
          <div>
            Conviction: <b className="text-txt">{conviction}</b>
          </div>
          <div>
            Next index review in <b className="font-mono text-txt">{daysToNextIndexReview()}</b> days
          </div>
        </div>
        {breakdown && (
          <div className="ml-auto border border-line bg-panel2 px-3 py-1.5 text-right">
            <div className="text-[9px] uppercase tracking-wide text-txt3">
              ESGX score · engine-calculated
            </div>
            <div className="font-mono text-xl font-bold text-white">{breakdown.finalScore}</div>
          </div>
        )}
      </div>

      {/* 3 · momentum + trend */}
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wide text-txt2">Momentum</span>
          <span
            className={`font-mono text-2xl font-bold ${
              company.momentum > 1 ? "text-up" : company.momentum < -1 ? "text-down" : "text-txt2"
            }`}
          >
            {company.momentum > 0 ? "+" : ""}
            {company.momentum.toFixed(1)}
          </span>
          {liveMomentum != null ? (
            <>
              <span className="font-mono text-[10px] text-txt3">snapshot</span>
              <span
                className={`font-mono text-2xl font-bold ${
                  liveMomentum > 1 ? "text-up" : liveMomentum < -1 ? "text-down" : "text-txt2"
                }`}
              >
                {liveMomentum > 0 ? "+" : ""}
                {liveMomentum.toFixed(1)}
              </span>
              <LiveTag label="Live feed · GDELT" />
            </>
          ) : (
            <LiveTag />
          )}
        </div>
        {company.scoreTrend.length > 0 && <TrendChart data={company.scoreTrend} />}
      </div>

      {/* live pipeline: real GDELT articles → AI labels → engine momentum */}
      <LiveSignal ticker={company.ticker} onLiveMomentum={setLiveMomentum} />

      {/* deep coverage: engine score breakdown */}
      {breakdown ? (
        <div className="border-b border-line px-4 py-3">
          <h3 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-txt2">
            Pillar scores &amp; engine calculation
            <span className="ml-auto font-normal normal-case text-txt3">
              Confidence <b className="font-mono text-txt">{company.confidenceScore}/100</b>
            </span>
          </h3>
          <ESGBreakdown company={company} breakdown={breakdown} />
        </div>
      ) : (
        <div className="border-b border-line px-4 py-3">
          <div className="border border-[#6b4a12] bg-[#2a1c05] px-3 py-2 text-[11px] text-[#f0b94a]">
            <b>Signal coverage only.</b> Pillar scores and the event feed are not yet ingested for
            this name — the consensus-gap signal below is live; deep coverage scales by adding this
            company to the same pipeline.
          </div>
        </div>
      )}

      {/* 4 · what is moving the signal */}
      {events.length > 0 && (
        <div className="border-b border-line px-4 py-3">
          <h3 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-txt2">
            What is moving the signal
            <span className="badge border border-line2 bg-panel3 text-txt3">Snapshot events · mock</span>
          </h3>
          {events.map((e) => (
            <div key={e.id} className="mb-2 border border-line bg-panel2 px-3 py-2 last:mb-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-txt3">{fmtMonthYear(e.date)}</span>
                <b className="text-xs text-white">{e.title}</b>
                <span
                  className={`ml-auto font-mono text-xs font-bold ${
                    e.scoreImpact > 0 ? "text-up" : e.scoreImpact < 0 ? "text-down" : "text-txt2"
                  }`}
                >
                  {e.scoreImpact > 0 ? "+" : ""}
                  {e.scoreImpact}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-txt2">{e.summary}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="badge border border-line2 bg-panel3 text-txt2">{e.category}</span>
                <SeverityBadge severity={e.severity} />
                <ConfidenceBadge confidence={e.confidence} />
                <ReviewBadge required={e.humanReviewRequired} />
                <span className="ml-auto text-[10px] text-txt3">
                  {e.source} · {e.sourceType}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5 · Does vs Says */}
      <div className="border-b border-line px-4 py-3">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-txt2">
          Does vs Says
          <span className="ml-2 font-normal normal-case text-txt3">
            action score vs disclosure score
          </span>
        </h3>
        {(["does", "says"] as const).map((k) => (
          <div key={k} className="mb-1.5 flex items-center gap-2 last:mb-0">
            <span className="w-10 text-[11px] font-bold capitalize text-txt">{k}</span>
            <div className="relative h-3 flex-1 border border-line bg-black">
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${company.doesVsSays[k]}%`,
                  background: k === "does" ? "#2f6fc9" : "#7d828c",
                }}
              />
            </div>
            <span className="w-8 text-right font-mono text-xs font-bold text-txt">
              {company.doesVsSays[k]}
            </span>
          </div>
        ))}
        <p className="mt-1.5 text-[10px] text-txt3">
          {company.doesVsSays.does >= company.doesVsSays.says
            ? "Actions run ahead of disclosure — under-told story."
            : "Disclosure runs ahead of action — watch for greenwash risk."}
        </p>
      </div>

      {/* 6 · where the raters stand (STATIC, §1.4/§4.2) */}
      <div className="border-b border-line px-4 py-3">
        <h3 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-txt2">
          Where the raters stand
          <StaticTag />
          <span className="ml-auto font-mono font-normal normal-case text-txt3">
            snapshot {fmtMonthYear(RATINGS_AS_OF)} · rater split {cons.spread.toFixed(1)}
          </span>
        </h3>
        {cons.raters.map((r) => (
          <div key={r.name} className="mb-2 last:mb-0">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="w-28 text-[11.5px] font-bold text-txt">{r.name}</span>
              <span className="font-mono text-[10px] text-txt3">{r.raw}</span>
              <span
                className="ml-auto font-mono text-xs font-bold"
                style={{
                  color:
                    r.normalised == null
                      ? "#6a6e77"
                      : r.normalised >= 66
                        ? "#2bbb46"
                        : r.normalised >= 45
                          ? "#e3c11f"
                          : "#e23b3b",
                }}
              >
                {r.normalised == null ? "—" : r.normalised.toFixed(1)}
              </span>
            </div>
            <div className="relative h-2 border border-line bg-black">
              {r.normalised != null && (
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: `${r.normalised}%`,
                    background:
                      r.normalised >= 66 ? "#2bbb46" : r.normalised >= 45 ? "#e3c11f" : "#e23b3b",
                  }}
                />
              )}
            </div>
          </div>
        ))}
        <p className="mt-2 text-[10px] italic text-txt3">
          All rater scores normalised to a common 0–100 scale (higher = better).
        </p>
      </div>

      {/* 7 · why the ratings lag here */}
      <div className="px-4 py-3">
        <h3 className="mb-1 text-[10px] font-bold uppercase tracking-wide text-txt2">
          Why the ratings lag here
        </h3>
        <p className="text-[12px] leading-relaxed text-txt">{company.whyRatingsLag}</p>
        <p className="mt-2 border-l-2 border-line2 bg-panel2 px-3 py-2 text-[12px] italic text-txt2">
          The read: {company.read}
        </p>
      </div>
    </section>
  );
}
