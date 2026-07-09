"use client";
import { useState } from "react";
import { COMPANIES } from "@/data/mockCompanies";
import AISummaryPanel from "@/components/AISummaryPanel";
import CompanyComparison from "@/components/CompanyComparison";
import CompanyDetail from "@/components/CompanyDetail";
import EventsTable from "@/components/EventsTable";
import HumanReviewQueue from "@/components/HumanReviewQueue";
import MapQuadrant from "@/components/MapQuadrant";
import MethodologyPanel from "@/components/MethodologyPanel";
import TopBar, { type TabKey } from "@/components/TopBar";
import TrackRecord from "@/components/TrackRecord";
import Watchlist from "@/components/Watchlist";

/**
 * ESGX — single-page dashboard shell.
 * Home = Watchlist (1/3) + company detail story column (2/3), §3.2.
 * The Map lives on its own tab; clicking a dot opens the company.
 */
export default function Home() {
  const [tab, setTab] = useState<TabKey>("watchlist");
  // Frasers is the on-stage demo path (§6.4) — default selection.
  const [selected, setSelected] = useState("J69U");

  const company = COMPANIES.find((c) => c.ticker === selected) ?? COMPANIES[0];

  function openCompany(ticker: string) {
    setSelected(ticker);
    setTab("watchlist"); // company detail lives on the home screen
  }

  return (
    <div className="grid h-screen grid-rows-[44px_1fr_24px]">
      <TopBar tab={tab} onTab={setTab} onSelectTicker={openCompany} />

      <main className="min-h-0 overflow-hidden">
        {tab === "watchlist" && (
          <div className="grid h-full grid-cols-[minmax(300px,1fr)_2fr]">
            <Watchlist selected={selected} onSelect={setSelected} />
            <CompanyDetail company={company} />
          </div>
        )}
        {tab === "map" && <MapQuadrant onSelect={openCompany} />}
        {tab === "events" && <EventsTable onSelect={openCompany} />}
        {tab === "compare" && <CompanyComparison />}
        {tab === "analyst" && <AISummaryPanel company={company} />}
        {tab === "review" && <HumanReviewQueue />}
        {tab === "track" && <TrackRecord />}
        {tab === "methodology" && <MethodologyPanel />}
      </main>

      <footer className="flex items-center gap-4 border-t border-line bg-black px-3 font-mono text-[10px] text-txt3">
        <span className="text-up">■ DEMO · LIVE NEWS PIPELINE · RATINGS ILLUSTRATIVE</span>
        <span className="text-line2">|</span>
        <span>ESGX</span>
        <span className="flex-1" />
        <span>
          Model <b className="text-txt2">ESGX · consensus-gap v3</b>
        </span>
        <span className="text-line2">|</span>
        <span>Not investment advice</span>
      </footer>
    </div>
  );
}
