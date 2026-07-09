"use client";
import { TRACK_RECORD, TRACK_RECORD_CAVEAT } from "@/data/mockCompanies";

/**
 * Track record (§5.2). Official events must be real; flag dates come
 * from the team's reconstruction and are marked pending until supplied.
 */
export default function TrackRecord() {
  return (
    <section className="flex min-h-0 flex-1 flex-col bg-panel">
      <div className="panel-title">Track record</div>
      <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-[9px] uppercase tracking-wide text-txt3">
              {["Company", "Date we flagged", "Official event", "Official date", "Lead time (months)"].map((h) => (
                <th key={h} className="border-b border-line px-3 py-2 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRACK_RECORD.map((r, i) => (
              <tr key={i} className={`border-b border-black align-top text-[11.5px] ${i % 2 ? "bg-rowalt" : ""}`}>
                <td className="px-3 py-2 font-bold text-white">{r.company}</td>
                <td className="px-3 py-2 italic text-txt3">{r.flaggedDate}</td>
                <td className="max-w-md px-3 py-2 text-txt2">
                  {r.officialEvent}
                  {!r.eventVerified && (
                    <span className="badge ml-2 border border-[#6b4a12] bg-[#2a1c05] text-[#f0b94a]">
                      To verify
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-txt2">{r.officialDate}</td>
                <td className="px-3 py-2 font-mono text-txt3">{r.leadTimeMonths}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* mandatory caveat — always visible (§5.2) */}
        <p className="mt-3 border border-[#6b4a12] bg-[#2a1c05] px-3 py-2 text-[11px] font-bold text-[#f0b94a]">
          {TRACK_RECORD_CAVEAT}
        </p>
        <p className="mt-2 text-[10.5px] text-txt3">
          Flag dates are pending the team’s reconstruction from archived signal runs — they are
          intentionally not invented. Rows marked “To verify” need the official event date confirmed
          against the index provider’s published review notices before the demo.
        </p>
      </div>
    </section>
  );
}
