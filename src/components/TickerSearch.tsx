"use client";
import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { COMPANIES } from "@/data/mockCompanies";

/**
 * Ticker search with honest not-covered empty state (§5.4).
 */
export default function TickerSearch({ onSelect }: { onSelect: (ticker: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return COMPANIES.filter(
      (c) => c.ticker.toLowerCase().includes(s) || c.companyName.toLowerCase().includes(s),
    ).slice(0, 8);
  }, [q]);

  const notCovered = q.trim().length > 1 && matches.length === 0;

  return (
    <div className="relative" ref={boxRef}>
      <label className="flex w-56 items-center gap-2 border border-line2 bg-black px-2 py-1 focus-within:border-blue">
        <Search size={13} className="text-txt3" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search ticker or company…"
          className="w-full bg-transparent text-xs text-txt outline-none placeholder:text-txt3"
        />
      </label>
      {open && (matches.length > 0 || notCovered) && (
        <div className="absolute left-0 top-full z-50 mt-1 w-80 border border-line2 bg-panel2 shadow-xl">
          {matches.map((c) => (
            <button
              key={c.ticker}
              className="flex w-full items-baseline gap-2 border-b border-line px-3 py-2 text-left last:border-b-0 hover:bg-hoverrow"
              onMouseDown={() => {
                onSelect(c.ticker);
                setQ("");
                setOpen(false);
              }}
            >
              <span className="font-mono text-xs font-bold text-white">{c.ticker}</span>
              <span className="truncate text-xs text-txt2">{c.companyName}</span>
              <span className="ml-auto font-mono text-[10px] text-txt3">{c.market}</span>
            </button>
          ))}
          {notCovered && (
            <div className="px-3 py-3 text-[11px] leading-relaxed text-txt2">
              <b className="text-txt">Not covered yet</b> — ESGX currently monitors{" "}
              {COMPANIES.length} names across SGX and NASDAQ. Coverage scales by adding companies
              to the same pipeline.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
