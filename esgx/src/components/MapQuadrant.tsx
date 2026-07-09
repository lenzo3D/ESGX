"use client";
import { useMemo, useState } from "react";
import { COMPANIES } from "@/data/mockCompanies";
import { deriveConsensus, VERDICT_META } from "@/lib/esgScoring";
import type { Verdict } from "@/lib/types";

const VB = { w: 1060, h: 640 };
const M = { l: 64, r: 26, t: 30, b: 52 };
const X0 = M.l, X1 = VB.w - M.r, Y0 = M.t, Y1 = VB.h - M.b;
const XD: [number, number] = [0, 60];
const YD: [number, number] = [-31, 20];
const sx = (v: number) => X0 + ((v - XD[0]) / (XD[1] - XD[0])) * (X1 - X0);
const sy = (v: number) => Y1 - ((v - YD[0]) / (YD[1] - YD[0])) * (Y1 - Y0);

const LEGEND: Verdict[] = [
  "Hidden improver",
  "Proven improver",
  "Hidden risk",
  "Clear risk",
  "No clear signal",
];

/**
 * Map tab (§3.1/§3.4): the quadrant, rendered large.
 * Dual encoding: colour + filled-vs-outlined dots.
 * Clicking any dot navigates to that company.
 */
export default function MapQuadrant({ onSelect }: { onSelect: (ticker: string) => void }) {
  const [hover, setHover] = useState<string | null>(null);

  const nodes = useMemo(
    () =>
      COMPANIES.map((c) => {
        const cons = deriveConsensus(c);
        return { c, cons, x: sx(Math.min(cons.spread, 60)), y: sy(Math.max(Math.min(c.momentum, 20), -31)) };
      }),
    [],
  );

  const hovered = nodes.find((n) => n.c.ticker === hover);

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-panel">
      <div className="panel-title">
        Map — consensus gap
        <span className="ml-2 font-normal normal-case text-txt3">
          Across: how much the raters disagree. Up: our momentum.
        </span>
        <span className="ml-auto flex items-center gap-3 font-normal normal-case">
          {LEGEND.map((v) => {
            const m = VERDICT_META[v];
            return (
              <span key={v} className="flex items-center gap-1.5 text-[10px] text-txt2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={
                    m.fill
                      ? { background: m.color }
                      : { border: `2px solid ${m.color}`, background: "transparent" }
                  }
                />
                {v}
              </span>
            );
          })}
        </span>
      </div>

      <div className="relative min-h-0 flex-1 p-3">
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          {/* quadrant shading */}
          <rect x={sx(20)} y={Y0} width={X1 - sx(20)} height={sy(5) - Y0} fill="#08160d" />
          <rect x={sx(20)} y={sy(-5)} width={X1 - sx(20)} height={Y1 - sy(-5)} fill="#170a0a" />
          {/* dividers */}
          {[20, 40].map((v) => (
            <line key={v} x1={sx(v)} y1={Y0} x2={sx(v)} y2={Y1} stroke="#4a4d55" strokeDasharray="4 3" />
          ))}
          <text x={sx(20) + 4} y={Y0 + 11} fontSize={8.5} fill="#6a6e77" fontFamily="monospace">
            ← agree · disagree →
          </text>
          {[5, -5].map((v) => (
            <line key={v} x1={X0} y1={sy(v)} x2={X1} y2={sy(v)} stroke="#2a2c31" strokeDasharray="2 3" />
          ))}
          <line x1={X0} y1={sy(0)} x2={X1} y2={sy(0)} stroke="#3a445c" />
          {/* axes */}
          <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="#3a3d44" strokeWidth={1.2} />
          <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="#3a3d44" strokeWidth={1.2} />
          {[0, 20, 40, 60].map((v) => (
            <text key={v} x={sx(v)} y={Y1 + 16} fontSize={9.5} fill="#6a6e77" textAnchor="middle" fontFamily="monospace">
              {v}
            </text>
          ))}
          {[-25, -15, -5, 5, 15].map((v) => (
            <text key={v} x={X0 - 8} y={sy(v) + 3} fontSize={9.5} fill="#6a6e77" textAnchor="end" fontFamily="monospace">
              {v > 0 ? `+${v}` : v}
            </text>
          ))}
          <text x={(X0 + X1) / 2} y={VB.h - 8} fontSize={11} fill="#969aa3" fontWeight={700} textAnchor="middle">
            How much the raters disagree →
          </text>
          <text
            x={16}
            y={(Y0 + Y1) / 2}
            fontSize={11}
            fill="#969aa3"
            fontWeight={700}
            textAnchor="middle"
            transform={`rotate(-90 16 ${(Y0 + Y1) / 2})`}
          >
            Our momentum →
          </text>
          {/* corner labels — plain names (§2.1) */}
          <text x={X1 - 6} y={Y0 + 16} fontSize={12} fontWeight={700} fill="#1fbf4f" textAnchor="end">
            HIDDEN IMPROVERS
          </text>
          <text x={X1 - 6} y={Y0 + 29} fontSize={9} fill="#1fbf4f" textAnchor="end">
            raters split · momentum improving → buy early
          </text>
          <text x={X1 - 6} y={Y0 + 41} fontSize={8.5} fill="#5a8f6d" textAnchor="end" fontStyle="italic">
            ≈ CGS Momentum Matrix “Hidden Winners” — the opportunity lives here
          </text>
          <text x={X1 - 6} y={Y1 - 20} fontSize={12} fontWeight={700} fill="#d83333" textAnchor="end">
            HIDDEN RISKS
          </text>
          <text x={X1 - 6} y={Y1 - 8} fontSize={9} fill="#d83333" textAnchor="end">
            raters split · momentum deteriorating → avoid
          </text>
          <text x={X0 + 8} y={Y0 + 16} fontSize={10} fontWeight={700} fill="#1fbf4f">
            PROVEN IMPROVERS
          </text>
          <text x={X0 + 8} y={Y1 - 20} fontSize={10} fontWeight={700} fill="#f0791e">
            CLEAR RISKS
          </text>
          <text x={X0 + 8} y={Y1 - 8} fontSize={9} fill="#f0791e">
            raters agree · momentum deteriorating → downgrade warning
          </text>

          {/* dots — colour + fill/outline dual encoding (§3.4) */}
          {nodes.map(({ c, cons, x, y }) => {
            const m = VERDICT_META[cons.verdict];
            const isHover = hover === c.ticker;
            return (
              <g
                key={c.ticker}
                className="cursor-pointer"
                onMouseEnter={() => setHover(c.ticker)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(c.ticker)}
              >
                {m.fill ? (
                  <circle cx={x} cy={y} r={isHover ? 9 : 7} fill={m.color} stroke="#000" strokeWidth={2} />
                ) : (
                  <circle
                    cx={x}
                    cy={y}
                    r={isHover ? 8 : 6}
                    fill="#0d0e10"
                    stroke={m.color}
                    strokeWidth={2.5}
                  />
                )}
                <text
                  x={x + 11}
                  y={y + 3.5}
                  fontSize={10}
                  fontWeight={700}
                  fill={isHover ? "#fff" : "#969aa3"}
                >
                  {c.ticker}
                </text>
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div className="pointer-events-none absolute left-4 top-4 w-72 border border-line2 bg-panel2 px-3 py-2 shadow-xl">
            <div className="flex items-baseline gap-2">
              <b className="text-sm text-white">{hovered.c.companyName}</b>
              <span className="ml-auto font-mono text-[10px] text-txt3">{hovered.c.ticker}</span>
            </div>
            <div className="mt-1 text-[11px] text-txt2">{hovered.c.tagline}</div>
            <div className="mt-1.5 flex gap-4 font-mono text-[11px]">
              <span className="text-txt2">
                split <b className="text-txt">{hovered.cons.spread.toFixed(1)}</b>
              </span>
              <span className={hovered.c.momentum > 0 ? "text-up" : "text-down"}>
                momentum {hovered.c.momentum > 0 ? "+" : ""}
                {hovered.c.momentum.toFixed(1)}
              </span>
              <span className="text-txt2">{hovered.cons.call}</span>
            </div>
            <div className="mt-1 text-[10px] italic text-txt3">Click to open company</div>
          </div>
        )}
      </div>
    </section>
  );
}
