/* Shared badges — one vocabulary, one palette, everywhere. */
import type { Call, Confidence, Severity, Verdict } from "@/lib/types";
import { CALL_META, VERDICT_META } from "@/lib/esgScoring";

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const m = VERDICT_META[verdict];
  return (
    <span
      className="badge"
      style={
        m.fill
          ? { background: m.color, color: "#0a0a0a" }
          : { border: `1px solid ${m.color}`, color: m.color, background: "transparent" }
      }
      title={m.blurb}
    >
      {verdict}
    </span>
  );
}

export function CallChip({ call }: { call: Call }) {
  const m = CALL_META[call];
  return (
    <span className="px-3 py-1 text-[15px] font-bold tracking-wide" style={{ background: m.bg, color: m.color }}>
      {call}
    </span>
  );
}

const SEV: Record<Severity, string> = {
  Low: "bg-panel3 text-txt2 border border-line2",
  Medium: "bg-[#2a1c05] text-[#f0b94a] border border-[#6b4a12]",
  High: "bg-[#2a0808] text-[#f26d6d] border border-[#7a2222]",
};
export function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`badge ${SEV[severity]}`}>{severity}</span>;
}

const CONF: Record<Confidence, string> = {
  High: "bg-[#08160d] text-[#5fd98a] border border-[#1a5e33]",
  Medium: "bg-[#2a1c05] text-[#f0b94a] border border-[#6b4a12]",
  Low: "bg-panel3 text-txt3 border border-line2",
};
export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return <span className={`badge ${CONF[confidence]}`}>{confidence} confidence</span>;
}

export function ReviewBadge({ required }: { required: boolean }) {
  return required ? (
    <span className="badge border border-[#6b4a12] bg-[#2a1c05] text-[#f0b94a]">Human review</span>
  ) : (
    <span className="badge border border-line2 bg-panel3 text-txt3">Auto-cleared</span>
  );
}

export function SourceBackedLabel() {
  return <span className="badge border border-[#1a3a5e] bg-[#08101a] text-[#5fa8d9]">Source-backed claim</span>;
}

export function StaticTag() {
  return <span className="badge border border-line2 bg-panel3 text-txt3">Static snapshot · illustrative</span>;
}

export function LiveTag({ label = "Updated daily" }: { label?: string }) {
  return <span className="badge border border-[#1a5e33] bg-[#08160d] text-[#5fd98a]">{label}</span>;
}

export function DataProvenanceTag() {
  return (
    <span
      className="badge border border-[#4a3a12] bg-[#1d1708] text-[#c9a94a]"
      title="LIVE: news articles (GDELT/Google News), AI classification (Gemini), and momentum (engine-computed). ILLUSTRATIVE: rater snapshot, pillar scores, snapshot events, trends — demo dataset pending paid rater feeds."
    >
      Live news · Ratings illustrative
    </span>
  );
}
