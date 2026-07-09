"use client";
import { SECTOR_WEIGHTS } from "@/lib/esgScoring";

const Block = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <div className="border border-line bg-panel2 p-4">
    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-blue">
      {n} · {title}
    </h3>
    <div className="space-y-2 text-[12px] leading-relaxed text-txt">{children}</div>
  </div>
);

/** Methodology tab (§5.3 + prompt §13/§14/§15). */
export default function MethodologyPanel() {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-panel">
      <div className="panel-title">Methodology</div>
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-4">
        {/* USP + positioning — exact copy required */}
        <div className="border border-line bg-panel2 p-4">
          <p className="text-[15px] font-bold text-white">
            “Most ESG tools rate the past. ESGX monitors what is changing now.”
          </p>
          <p className="mt-2 text-[12px] text-txt2">
            “ESGX converts verified disclosures and live ESG events into auditable investment
            signals for fund managers.”
          </p>
        </div>

        <Block n={1} title="How data is collected">
          <p>
            Scheduled pulls from free public sources: GDELT news (refreshes every 15 minutes),
            exchange filings, and index review notices. No paid feeds; commercial provider
            integration is listed as future work.
          </p>
        </Block>

        <Block n={2} title="How it is filtered">
          <p>
            Mechanical name/ticker matching first, then AI classification: is the article a
            material E, S or G event for this company?
          </p>
          <p className="border-l-2 border-line2 bg-panel3 px-3 py-2 italic text-txt2">
            “AI filters the stream and classifies each event as positive or negative — it labels
            real articles; it never generates facts.”
          </p>
          <p className="text-txt3">
            Classification runs on a free-tier LLM (Gemini), with Claude as an alternative and
            deterministic keyword rules as the always-available fallback — every event shows which
            classifier labelled it.
          </p>
        </Block>

        <Block n={3} title="How the score is computed">
          <p className="border border-line bg-black px-3 py-2 font-mono text-[12px] text-white">
            Momentum = Σ ( direction × impact × source weight × recency decay )
          </p>
          <ul className="list-disc space-y-1 pl-5 text-txt2">
            <li><b className="text-txt">direction</b> — positive or negative for the company’s ESG standing</li>
            <li><b className="text-txt">impact</b> — materiality of the event (severity-scaled)</li>
            <li><b className="text-txt">source weight</b> — official disclosures highest; weak sources excluded</li>
            <li><b className="text-txt">recency decay</b> — old news fades; the signal tracks what is changing now</li>
          </ul>
          <p>Refresh: daily.</p>
          <p>
            The <b>final ESG score</b> is calculated by the deterministic ESGX scoring engine —
            sector-weighted pillars, controversy penalties, and a confidence adjustment.{" "}
            <b>AI does not calculate the final ESG score.</b> AI summarises and explains provided
            data only, and every AI claim needs a source.
          </p>
          <table className="w-full border-collapse text-left text-[11.5px]">
            <thead>
              <tr className="text-[9px] uppercase text-txt3">
                <th className="border-b border-line py-1 pr-2">Sector</th>
                <th className="border-b border-line py-1 pr-2">E</th>
                <th className="border-b border-line py-1 pr-2">S</th>
                <th className="border-b border-line py-1">G</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(SECTOR_WEIGHTS).map((w) => (
                <tr key={w.label}>
                  <td className="border-b border-line py-1 pr-2 text-txt2">{w.label}</td>
                  <td className="border-b border-line py-1 pr-2 font-mono">{(w.e * 100).toFixed(0)}%</td>
                  <td className="border-b border-line py-1 pr-2 font-mono">{(w.s * 100).toFixed(0)}%</td>
                  <td className="border-b border-line py-1 font-mono">{(w.g * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Block>

        <Block n={4} title="How reliability is protected">
          <ul className="list-disc space-y-1 pl-5 text-txt2">
            <li>Source whitelist — official company disclosures carry the highest confidence</li>
            <li>Credible news is medium confidence; weak or unverified sources are low confidence or excluded</li>
            <li>Corroboration weighting — one source moves the score only slightly</li>
            <li>Classification, not generation — AI labels real articles; it never invents facts</li>
            <li>Low-confidence or severe events are sent to human review; an analyst reviews the flagged shortlist</li>
            <li>Confidence score depends on source quality and data completeness</li>
          </ul>
        </Block>

        <Block n={5} title="Guardrails and auditability">
          <ul className="list-disc space-y-1 pl-5 text-txt2">
            <li><b className="text-txt">Source-backed claim</b> — every AI statement links to a provided source</li>
            <li><b className="text-txt">Confidence level</b> — displayed on every event and summary</li>
            <li><b className="text-txt">Human review required</b> — flagged items enter the review queue</li>
            <li><b className="text-txt">Mock prototype data</b> — this MVP runs on clearly-labelled mock data</li>
            <li><b className="text-txt">Final score calculated by ESGX scoring engine</b> — deterministic and auditable</li>
          </ul>
        </Block>

        {/* CGS Momentum Matrix bridge — we extend the sponsor's framework, not replace it */}
        <div className="border border-line bg-panel2 p-4">
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-blue">
            How ESGX extends the CGS ESG Momentum Matrix
          </h3>
          <p className="text-[12px] leading-relaxed text-txt">
            The CGS Momentum Matrix asks <i>where is this company going?</i> (score today ×
            trajectory). ESGX adds the second question a price needs:{" "}
            <b>has the market noticed?</b> Rater disagreement marks exactly where consensus is
            absent — which peer-reviewed research links to mispricing. The two frameworks compose:
          </p>
          <table className="mtable mt-2">
            <thead>
              <tr>
                <th>ESGX verdict</th>
                <th>Reads on the CGS Momentum Matrix as…</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="vc-cell" style={{ color: "#1fbf4f" }}>Hidden improver</td>
                <td>“Hidden Winners” — <i>the opportunity lives here</i> — before consensus forms</td>
              </tr>
              <tr>
                <td className="vc-cell" style={{ color: "#2f81d8" }}>Proven improver</td>
                <td>“Future Leaders” — improving and already agreed on</td>
              </tr>
              <tr>
                <td className="vc-cell" style={{ color: "#d83333" }}>Hidden risk</td>
                <td>“Overrated Leaders” risk — someone still rates it highly while the news deteriorates</td>
              </tr>
              <tr>
                <td className="vc-cell" style={{ color: "#f0791e" }}>Clear risk</td>
                <td>“Value Traps” — declining, and the agreed rating hasn’t moved yet</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-[11px] leading-relaxed text-txt2">
            Baseline evidence (CGS ESG Momentum Engine 2.0 brief): the score-CAGR improver basket
            returned <b>55.1% vs 6.4%</b> for the MSCI ASEAN benchmark, Sharpe <b>0.57 vs −0.22</b>;
            improver outperformance probability rises <b>28.9% → 46.2% → 61.5%</b> over 1/3/5
            years. ESGX targets the same improvers <b>earlier</b> — from daily news flow instead of
            annual score changes.
          </p>
        </div>

        {/* Roadmap — mapped to the sponsor's four challenge pillars */}
        <Block n={6} title="Roadmap — the open frontier, same pipeline">
          <ul className="list-disc space-y-1 pl-5 text-txt2">
            <li>
              <b className="text-txt">Predict earlier</b> — ✓ shipped: live news → AI classification
              → deterministic momentum, daily.
            </li>
            <li>
              <b className="text-txt">New data sources</b> — news ✓ shipped; patents, job postings
              and satellite data are <i>planned collectors</i>: a patent filing or a hiring surge is
              just another classified event flowing through the same formula.
            </li>
            <li>
              <b className="text-txt">Redesign scoring</b> — planned classifier dimensions for AI
              adoption, digital maturity and intangible assets, scored as E/S/G-adjacent event
              streams with their own source weights.
            </li>
            <li>
              <b className="text-txt">Make it usable</b> — ✓ shipped: dashboard, ranked shortlist,
              alerts, and a public <b>signal API</b> (below).
            </li>
          </ul>
        </Block>

        {/* The API — this is an API hackathon; the endpoint is the product */}
        <Block n={7} title="The ESGX API">
          <p>
            Every signal on this dashboard is served by a machine-readable API — the dashboard is
            just one client. A portfolio system can poll it every morning:
          </p>
          <p className="border border-line bg-black px-3 py-2 font-mono text-[11.5px] text-white">
            GET /api/signals — ranked universe: verdict · call · momentum · rater split
            <br />
            GET /api/signal/J69U — full company signal + engine breakdown + live events
            <br />
            POST /api/pipeline/refresh — trigger a live news pull for a ticker
          </p>
          <p className="text-txt3">
            JSON out, deterministic scores, source-linked events, AVOID-not-SELL calls — auditable
            end to end.
          </p>
        </Block>

        {/* 0.54 correlation card — exact copy required (§ prompt 14) */}
        <div className="border border-[#1a3a5e] bg-[#08101a] p-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#5fa8d9]">
            ESG Rating Divergence Signal
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-txt">
            “A 0.54 correlation suggests only a moderate relationship between ESG rating providers.
            This means different ESG models can produce meaningfully different assessments of the
            same company. The implication is that fund managers should not rely on one static ESG
            score. ESGX addresses this by showing the underlying events, sources, confidence level,
            and score drivers behind the rating.”
          </p>
        </div>
      </div>
    </section>
  );
}
