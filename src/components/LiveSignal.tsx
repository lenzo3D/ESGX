"use client";
import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import type { LiveEvent } from "@/lib/pipeline/types";
import { fmtMonthYear } from "@/lib/esgScoring";
import { ConfidenceBadge, LiveTag, ReviewBadge, SeverityBadge } from "./Badges";

interface RefreshResult {
  ticker: string;
  fetchedAt: string;
  articleCount: number;
  provider: string;
  classified: boolean;
  classifier: string;
  events: LiveEvent[];
  liveMomentum: number | null;
  note?: string;
}

/** Client-side per-ticker cache so tab/company switches keep pulled data. */
const clientCache = new Map<string, RefreshResult>();

/**
 * Live signal — the real pipeline: GDELT collection → AI classification
 * → deterministic momentum. This is the genuinely live part of ESGX.
 */
export default function LiveSignal({
  ticker,
  onLiveMomentum,
}: {
  ticker: string;
  onLiveMomentum: (m: number | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RefreshResult | null>(clientCache.get(ticker) ?? null);

  useEffect(() => {
    const cached = clientCache.get(ticker) ?? null;
    setData(cached);
    setError(null);
    onLiveMomentum(cached?.liveMomentum ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  async function pull() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pipeline/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      clientCache.set(ticker, json);
      setData(json);
      onLiveMomentum(json.liveMomentum ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Live pull failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-b border-line px-4 py-3">
      <h3 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-txt2">
        Live signal — news pipeline
        {data && <LiveTag label={`Live feed · ${data.provider}`} />}
        <button
          onClick={pull}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 border border-blue bg-[#0d1b33] px-3 py-1 text-[10px] font-bold normal-case text-white hover:bg-[#14264a] disabled:opacity-40"
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
          {loading ? "Collecting & classifying…" : data ? "Refresh live news" : "Pull live news"}
        </button>
      </h3>

      {!data && !loading && !error && (
        <p className="text-[11px] text-txt3">
          Pulls real articles for this company from GDELT (free public feed, 15-min refresh),
          classifies each with AI, and recomputes momentum with the engine formula. Nothing is
          generated — AI only labels real headlines.
        </p>
      )}

      {error && (
        <p className="border border-[#7a2222] bg-[#2a0808] px-3 py-2 text-[11px] text-[#f26d6d]">{error}</p>
      )}

      {data && (
        <>
          <div className="mb-2 flex flex-wrap items-center gap-3 font-mono text-[10.5px] text-txt2">
            <span>
              {data.articleCount} real articles via {data.provider} · fetched{" "}
              {new Date(data.fetchedAt).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" })}
            </span>
            {data.liveMomentum != null && (
              <span>
                live momentum{" "}
                <b className={data.liveMomentum > 1 ? "text-up" : data.liveMomentum < -1 ? "text-down" : "text-txt"}>
                  {data.liveMomentum > 0 ? "+" : ""}
                  {data.liveMomentum.toFixed(1)}
                </b>
              </span>
            )}
            <span className="text-txt3">classified by {data.classifier}</span>
            {data.note && <span className="text-txt3">({data.note})</span>}
          </div>

          {data.events.length === 0 && (
            <p className="text-[11px] text-txt3">
              No ESG-relevant articles found in the last 3 months for this name.
            </p>
          )}

          {data.events.map((e) => (
            <div key={e.id} className="mb-2 border border-line bg-panel2 px-3 py-2 last:mb-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-txt3">{fmtMonthYear(e.date)}</span>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-white hover:text-[#5fa8d9] hover:underline"
                >
                  {e.title} <ExternalLink size={10} className="inline" />
                </a>
                <span
                  className={`ml-auto font-mono text-xs font-bold ${
                    e.scoreImpact > 0 ? "text-up" : e.scoreImpact < 0 ? "text-down" : "text-txt2"
                  }`}
                >
                  {e.scoreImpact > 0 ? "+" : ""}
                  {e.scoreImpact}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="badge border border-line2 bg-panel3 text-txt2">{e.category}</span>
                {e.severity && <SeverityBadge severity={e.severity} />}
                {e.confidence && <ConfidenceBadge confidence={e.confidence} />}
                <ReviewBadge required={e.humanReviewRequired} />
                <span className="ml-auto font-mono text-[10px] text-txt3">
                  {e.domain} · weight {e.sourceWeight.toFixed(2)}
                </span>
              </div>
              {e.reason && <p className="mt-1 text-[10px] italic text-txt3">{e.reason}</p>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
