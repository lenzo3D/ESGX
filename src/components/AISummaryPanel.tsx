"use client";
import { useState } from "react";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import type { AiEsgSummary, Company } from "@/lib/types";
import { computeFinalScore } from "@/lib/esgScoring";
import { ConfidenceBadge, SourceBackedLabel } from "./Badges";

/**
 * AI Analyst tab. AI summarises the provided data package only;
 * the final ESG score shown anywhere is engine-calculated.
 */
export default function AISummaryPanel({ company }: { company: Company }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiEsgSummary | null>(null);

  const deep = company.coverage === "deep";

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/esg-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            ticker: company.ticker,
            companyName: company.companyName,
            sector: company.sector,
            country: company.country,
            marketCap: company.marketCap,
            environmentalScore: company.environmentalScore,
            socialScore: company.socialScore,
            governanceScore: company.governanceScore,
            confidenceScore: company.confidenceScore,
            momentum: company.momentum,
            keyMetrics: company.keyMetrics,
          },
          scoring: computeFinalScore(company),
          events: company.recentEvents,
          sources: company.sourceList,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setResult(data as AiEsgSummary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-panel">
      <div className="panel-title">
        AI Analyst
        <span className="ml-auto font-normal normal-case text-txt3">
          AI summarises provided data only — final score is engine-calculated
        </span>
      </div>

      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <b className="text-sm text-white">{company.companyName}</b>
            <span className="ml-2 font-mono text-xs text-txt2">{company.ticker}</span>
          </div>
          <button
            onClick={generate}
            disabled={loading || !deep}
            className="ml-auto flex items-center gap-2 border border-blue bg-[#0d1b33] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#14264a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? "Analysing verified data…" : "Generate AI ESG Summary"}
          </button>
        </div>
        {!deep && (
          <p className="mt-2 border border-[#6b4a12] bg-[#2a1c05] px-3 py-2 text-[11px] text-[#f0b94a]">
            Signal-only coverage: the event feed for this name isn’t ingested yet, so there is no
            verified data package for the AI to summarise. Select a deep-coverage name (J69U, D05,
            O39, AAPL, MSFT, TSLA).
          </p>
        )}
      </div>

      {error && (
        <div className="mx-4 mt-3 flex items-start gap-2 border border-[#7a2222] bg-[#2a0808] px-3 py-2 text-[11.5px] text-[#f26d6d]">
          <AlertTriangle size={14} className="mt-0.5 flex-none" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <ConfidenceBadge confidence={result.confidence} />
            {result.humanReviewRequired && (
              <span className="badge border border-[#6b4a12] bg-[#2a1c05] text-[#f0b94a]">
                <AlertTriangle size={10} className="mr-1" /> Human review required
              </span>
            )}
          </div>

          <div className="border border-line bg-panel2 px-3 py-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wide text-txt2">Summary</h4>
            <p className="mt-1 text-[12px] leading-relaxed text-txt">{result.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-line bg-panel2 px-3 py-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-down">Key risks</h4>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-[11.5px] text-txt2">
                {result.keyRisks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="border border-line bg-panel2 px-3 py-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wide text-up">Positive signals</h4>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-[11.5px] text-txt2">
                {result.positiveSignals.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border border-line bg-panel2 px-3 py-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wide text-txt2">
              Score explanation
              <span className="ml-2 font-normal normal-case text-txt3">
                explaining the engine’s number, not producing one
              </span>
            </h4>
            <p className="mt-1 text-[12px] leading-relaxed text-txt">{result.scoreExplanation}</p>
          </div>

          <div className="border border-line bg-panel2 px-3 py-2">
            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-txt2">
              Source-backed claims <SourceBackedLabel />
            </h4>
            <table className="mt-2 w-full text-left text-[11px]">
              <thead>
                <tr className="text-[9px] uppercase text-txt3">
                  <th className="border-b border-line py-1 pr-2">Claim</th>
                  <th className="border-b border-line py-1 pr-2">Source</th>
                  <th className="border-b border-line py-1 pr-2">Type</th>
                  <th className="border-b border-line py-1 pr-2">Date</th>
                  <th className="border-b border-line py-1">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {result.sourceBackedClaims.map((c, i) => (
                  <tr key={i} className="align-top">
                    <td className="border-b border-line py-1.5 pr-2 text-txt">{c.claim}</td>
                    <td className="border-b border-line py-1.5 pr-2 text-txt2">{c.source}</td>
                    <td className="border-b border-line py-1.5 pr-2 text-txt3">{c.sourceType}</td>
                    <td className="border-b border-line py-1.5 pr-2 font-mono text-txt3">{c.date}</td>
                    <td className="border-b border-line py-1.5 text-txt2">{c.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!result && !error && !loading && deep && (
        <p className="px-4 py-6 text-center text-[11.5px] text-txt3">
          Generate a summary to see AI-assisted analysis of {company.companyName}’s verified data
          package. Requires <code className="font-mono">GEMINI_API_KEY</code> (free at
          aistudio.google.com) or <code className="font-mono">ANTHROPIC_API_KEY</code> in{" "}
          <code className="font-mono">esgx/.env.local</code> — the rest of the dashboard works
          without it.
        </p>
      )}
    </section>
  );
}
