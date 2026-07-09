"use client";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEEP_COMPANIES } from "@/data/mockCompanies";
import { computeFinalScore, deriveConsensus } from "@/lib/esgScoring";
import { VerdictBadge } from "./Badges";

/** Company Comparison tab — two deep-coverage names side by side. */
export default function CompanyComparison() {
  const [aT, setA] = useState(DEEP_COMPANIES[0].ticker);
  const [bT, setB] = useState(DEEP_COMPANIES[1].ticker);
  const a = DEEP_COMPANIES.find((c) => c.ticker === aT)!;
  const b = DEEP_COMPANIES.find((c) => c.ticker === bT)!;

  const scoreA = computeFinalScore(a)!;
  const scoreB = computeFinalScore(b)!;
  const consA = deriveConsensus(a);
  const consB = deriveConsensus(b);

  const chartData = [
    { pillar: "Environmental", [a.ticker]: a.environmentalScore, [b.ticker]: b.environmentalScore },
    { pillar: "Social", [a.ticker]: a.socialScore, [b.ticker]: b.socialScore },
    { pillar: "Governance", [a.ticker]: a.governanceScore, [b.ticker]: b.governanceScore },
  ];

  const highRisk = (c: typeof a) =>
    c.recentEvents.filter((e) => e.severity === "High" && e.scoreImpact < 0).length;
  const topRisks = (c: typeof a) =>
    c.recentEvents
      .filter((e) => e.scoreImpact < 0)
      .sort((x, y) => x.scoreImpact - y.scoreImpact)
      .slice(0, 3);

  const Select = ({ value, onChange, exclude }: { value: string; onChange: (v: string) => void; exclude: string }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-line2 bg-black px-2 py-1 text-xs text-txt outline-none focus:border-blue"
    >
      {DEEP_COMPANIES.filter((c) => c.ticker !== exclude).map((c) => (
        <option key={c.ticker} value={c.ticker}>
          {c.ticker} — {c.companyName}
        </option>
      ))}
    </select>
  );

  const col = (c: typeof a, score: number, cons: ReturnType<typeof deriveConsensus>) => (
    <div className="flex-1 border border-line bg-panel2 p-3">
      <div className="flex items-center gap-2">
        <b className="text-sm text-white">{c.companyName}</b>
        <VerdictBadge verdict={cons.verdict} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-px border border-line bg-line">
        {[
          ["ESGX score (engine)", String(score)],
          ["Confidence", `${c.confidenceScore}/100`],
          ["Rater split", cons.spread.toFixed(1)],
          ["High-risk events", String(highRisk(c))],
        ].map(([l, v]) => (
          <div key={l} className="bg-panel3 px-2 py-1.5">
            <div className="text-[8.5px] uppercase tracking-wide text-txt3">{l}</div>
            <div className="font-mono text-sm font-bold text-txt">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[9px] font-bold uppercase tracking-wide text-txt3">Top risks</div>
      <ul className="mt-1 space-y-1">
        {topRisks(c).map((e) => (
          <li key={e.id} className="text-[10.5px] leading-snug text-txt2">
            <span className="font-mono text-down">{e.scoreImpact}</span> {e.title}
          </li>
        ))}
        {topRisks(c).length === 0 && <li className="text-[10.5px] text-txt3">No negative events on file.</li>}
      </ul>
    </div>
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-panel">
      <div className="panel-title">Company Comparison</div>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Select value={aT} onChange={setA} exclude={bT} />
        <span className="text-[11px] font-bold text-txt3">vs</span>
        <Select value={bT} onChange={setB} exclude={aT} />
        <span className="ml-auto text-[10px] text-txt3">Deep-coverage names only</span>
      </div>
      <div className="flex gap-3 px-4 py-3">
        {col(a, scoreA.finalScore, consA)}
        {col(b, scoreB.finalScore, consB)}
      </div>
      <div className="px-4 pb-4">
        <div className="border border-line bg-panel2 p-3" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
              <CartesianGrid stroke="#2a2c31" strokeDasharray="2 3" vertical={false} />
              <XAxis dataKey="pillar" tick={{ fill: "#969aa3", fontSize: 11 }} axisLine={{ stroke: "#2a2c31" }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#6a6e77", fontSize: 10, fontFamily: "monospace" }} axisLine={{ stroke: "#2a2c31" }} tickLine={false} />
              <Tooltip
                cursor={{ fill: "#17191d" }}
                contentStyle={{ background: "#121316", border: "1px solid #3a3d44", borderRadius: 0, fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey={a.ticker} fill="#2f6fc9" />
              <Bar dataKey={b.ticker} fill="#7d828c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
