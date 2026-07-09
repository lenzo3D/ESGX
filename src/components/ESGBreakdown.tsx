"use client";
import type { Company, ScoreBreakdown } from "@/lib/types";
import { SECTOR_WEIGHTS } from "@/lib/esgScoring";

function PillarBar({ label, value, weight }: { label: string; value: number; weight: number }) {
  const color = value >= 66 ? "#2bbb46" : value >= 45 ? "#e3c11f" : "#e23b3b";
  return (
    <div className="mb-2 last:mb-0">
      <div className="mb-1 flex items-baseline gap-2">
        <span className="w-28 text-[11.5px] font-bold text-txt">{label}</span>
        <span className="font-mono text-[10px] text-txt3">weight {(weight * 100).toFixed(0)}%</span>
        <span className="ml-auto font-mono text-xs font-bold" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="relative h-2 border border-line bg-black">
        <div className="absolute inset-y-0 left-0" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

/** Pillar breakdown + transparent engine calculation (§ prompt 4/5). */
export default function ESGBreakdown({ company, breakdown }: { company: Company; breakdown: ScoreBreakdown }) {
  const w = SECTOR_WEIGHTS[company.sectorKey];
  return (
    <div>
      <PillarBar label="Environmental" value={company.environmentalScore!} weight={w.e} />
      <PillarBar label="Social" value={company.socialScore!} weight={w.s} />
      <PillarBar label="Governance" value={company.governanceScore!} weight={w.g} />
      <details className="mt-2 border border-line bg-panel2 px-3 py-2">
        <summary className="cursor-pointer text-[10.5px] font-bold uppercase tracking-wide text-txt2">
          Calculation breakdown — ESGX scoring engine
        </summary>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-txt2">
          {breakdown.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        <p className="mt-2 text-[10px] italic text-txt3">
          Final score calculated by the ESGX deterministic scoring engine — never by AI.
        </p>
      </details>
    </div>
  );
}
