"use client";
import { useState } from "react";
import { Bell, Leaf } from "lucide-react";
import { ALERT_RULES, DATA_AS_OF, MOCK_ALERTS } from "@/data/mockCompanies";
import { fmtFullDate } from "@/lib/esgScoring";
import { DataProvenanceTag } from "./Badges";
import TickerSearch from "./TickerSearch";

export type TabKey =
  | "watchlist"
  | "map"
  | "events"
  | "compare"
  | "analyst"
  | "review"
  | "track"
  | "methodology";

const TABS: { key: TabKey; label: string }[] = [
  { key: "watchlist", label: "Watchlist" },
  { key: "map", label: "Map" },
  { key: "events", label: "Live ESG Events" },
  { key: "compare", label: "Comparison" },
  { key: "analyst", label: "AI Analyst" },
  { key: "review", label: "Human Review" },
  { key: "track", label: "Track record" },
  { key: "methodology", label: "Methodology" },
];

export default function TopBar({
  tab,
  onTab,
  onSelectTicker,
}: {
  tab: TabKey;
  onTab: (t: TabKey) => void;
  onSelectTicker: (t: string) => void;
}) {
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <header className="flex h-11 flex-none select-none items-center gap-3 border-b border-line bg-titlebar px-3">
      {/* brand — one name, everywhere: ESGX */}
      <div className="flex items-center gap-2 pr-1">
        <div className="grid h-6 w-6 place-items-center border border-[#15913a] bg-vHiddenImprover">
          <Leaf size={14} color="#06210e" />
        </div>
        <span className="text-[15px] font-bold tracking-wide text-white">ESGX</span>
      </div>

      <div className="h-6 w-px bg-line2" />

      <nav className="flex h-full items-stretch">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTab(t.key)}
            className={`relative border-l border-line px-3 text-xs font-bold last:border-r ${
              tab === t.key ? "bg-panel text-white" : "text-txt2 hover:bg-panel hover:text-white"
            }`}
          >
            {t.label}
            {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-blue" />}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      <TickerSearch onSelect={onSelectTicker} />

      {/* alerts bell (display-only mock, §5.1) */}
      <div className="relative">
        <button
          onClick={() => setAlertsOpen((v) => !v)}
          className="relative grid h-7 w-7 place-items-center border border-transparent text-txt2 hover:border-line2 hover:bg-panel hover:text-white"
          title="Alerts"
        >
          <Bell size={15} />
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center bg-down px-1 font-mono text-[9px] font-bold text-white">
            {MOCK_ALERTS.length}
          </span>
        </button>
        {alertsOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 w-96 border border-line2 bg-panel2 shadow-xl">
            <div className="panel-title">Alerts</div>
            {MOCK_ALERTS.map((a, i) => (
              <div key={i} className="border-b border-line px-3 py-2">
                <div className="text-xs font-bold text-white">{a.company}</div>
                <div className="text-[11px] text-txt2">{a.what}</div>
                <div className="font-mono text-[10px] text-txt3">{a.when}</div>
              </div>
            ))}
            <div className="px-3 py-2 text-[10.5px] italic text-txt3">“{ALERT_RULES}”</div>
          </div>
        )}
      </div>

      <DataProvenanceTag />
      {/* the global as-of stamp (§4.3) — single source of truth */}
      <span className="font-mono text-[10.5px] text-txt2">Data as of {fmtFullDate(DATA_AS_OF)}</span>
    </header>
  );
}
