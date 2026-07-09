/* ============================================================
   ESGX — MOCK PROTOTYPE DATA
   ------------------------------------------------------------
   Everything in this file is illustrative mock data assembled
   for the MVP demo. Event titles reference real-world themes
   but figures, dates and impacts are prototype placeholders.
   Structure is Supabase-ready: swap this module for a DB query
   without touching the UI or the scoring engine.
   ============================================================ */
import type { Company, EsgEvent, SectorKey } from "@/lib/types";

/** Global "as of" stamp — the single source of truth shown in the UI. */
export const DATA_AS_OF = "2026-07-08";
/** The static third-party rater snapshot date (illustrative). */
export const RATINGS_AS_OF = "2026-06-30";

const ev = (e: Omit<EsgEvent, "id">): EsgEvent => ({ ...e, id: `${e.ticker}-${e.date}-${e.title.slice(0, 18)}` });

/* ============================================================
   DEEP-COVERAGE COMPANIES (full ESGX schema)
   ============================================================ */

const FRASERS: Company = {
  ticker: "J69U",
  companyName: "Frasers Centrepoint Trust",
  sector: "REIT (Retail)",
  sectorKey: "default",
  country: "Singapore",
  market: "SGX",
  marketCap: "S$3.9B",
  environmentalScore: 74,
  socialScore: 66,
  governanceScore: 71,
  confidenceScore: 82,
  lastUpdated: DATA_AS_OF,
  scoreTrend: [
    { month: "Feb 26", score: 61 },
    { month: "Mar 26", score: 63 },
    { month: "Apr 26", score: 65 },
    { month: "May 26", score: 66 },
    { month: "Jun 26", score: 69 },
    { month: "Jul 26", score: 71 },
  ],
  keyMetrics: [
    { label: "GRESB rating", value: "5 Star (5th consecutive year)" },
    { label: "Green-certified portfolio", value: "78% of GFA" },
    { label: "Green loans", value: "S$1.2B committed" },
    { label: "2030 target", value: "Carbon neutral (Scope 1 & 2)" },
  ],
  recentEvents: [
    ev({
      ticker: "J69U", date: "2026-06-18",
      title: "Fifth consecutive GRESB 5-Star rating",
      summary: "FCT retained its GRESB 5-Star standing in the 2026 assessment, top decile among Asia-Pacific retail REITs.",
      category: "Environmental", severity: "Low", scoreImpact: 3, confidence: "High",
      source: "GRESB assessment / company disclosure", sourceType: "Official disclosure",
      humanReviewRequired: false,
    }),
    ev({
      ticker: "J69U", date: "2026-05-07",
      title: "New S$300m green loan for mall retrofit",
      summary: "Proceeds ring-fenced for energy-efficiency retrofits across three suburban malls; interest margin tied to GRESB score.",
      category: "Environmental", severity: "Low", scoreImpact: 2, confidence: "High",
      source: "SGX filing", sourceType: "Official disclosure",
      humanReviewRequired: false,
    }),
    ev({
      ticker: "J69U", date: "2026-03-24",
      title: "Scope 1 & 2 interim target validated by SBTi",
      summary: "Science Based Targets initiative validated FCT's 2030 interim decarbonisation pathway.",
      category: "Environmental", severity: "Low", scoreImpact: 2, confidence: "High",
      source: "SBTi registry", sourceType: "Index provider",
      humanReviewRequired: false,
    }),
    ev({
      ticker: "J69U", date: "2026-02-11",
      title: "Tenant dispute over service-charge allocation",
      summary: "A group of F&B tenants disputed service-charge increases at one mall; resolved via mediation with no regulatory action.",
      category: "Social", severity: "Low", scoreImpact: -1, confidence: "Medium",
      source: "The Business Times", sourceType: "Credible news",
      humanReviewRequired: false,
    }),
  ],
  sourceList: [
    { name: "SGX filings", type: "Official disclosure" },
    { name: "GRESB", type: "Index provider" },
    { name: "SBTi registry", type: "Index provider" },
    { name: "The Business Times", type: "Credible news" },
  ],
  raters: { msci: "AA", lseg: 1.8, sustainalyticsRisk: 9.9, spGlobal: 50 },
  momentum: 12.0,
  read: "Widest rater split in our universe (MSCI AA vs LSEG 1.8); five straight GRESB 5-Stars and green financing point up.",
  tagline: "Improving faster than the ratings show.",
  whyRatingsLag: "Annual rater refresh cycles haven't caught the 2025–26 green-financing and GRESB run; LSEG's last full update predates it.",
  doesVsSays: { does: 76, says: 58 },
  coverage: "deep",
};

const DBS: Company = {
  ticker: "D05",
  companyName: "DBS Group",
  sector: "Banks",
  sectorKey: "financials",
  country: "Singapore",
  market: "SGX",
  marketCap: "S$118B",
  environmentalScore: 62,
  socialScore: 68,
  governanceScore: 55,
  confidenceScore: 78,
  lastUpdated: DATA_AS_OF,
  scoreTrend: [
    { month: "Feb 26", score: 66 },
    { month: "Mar 26", score: 65 },
    { month: "Apr 26", score: 63 },
    { month: "May 26", score: 61 },
    { month: "Jun 26", score: 59 },
    { month: "Jul 26", score: 58 },
  ],
  keyMetrics: [
    { label: "Sustainable financing", value: "S$89B cumulative" },
    { label: "Coal exposure", value: "Phase-out by 2039 (stated)" },
    { label: "MAS penalties (24m)", value: "2 supervisory actions" },
    { label: "Net-zero target", value: "2050 (financed emissions)" },
  ],
  recentEvents: [
    ev({
      ticker: "D05", date: "2026-06-26",
      title: "MAS supervisory action over service outages",
      summary: "Additional capital requirement maintained after repeated digital-banking outages; remediation programme extended.",
      category: "Governance", severity: "High", scoreImpact: -4, confidence: "High",
      source: "MAS statement", sourceType: "Regulator",
      humanReviewRequired: true,
    }),
    ev({
      ticker: "D05", date: "2026-05-15",
      title: "NGO coalition criticises coal phase-out pace",
      summary: "Campaign groups argue transition-financing definitions allow continued thermal-coal-adjacent exposure.",
      category: "Environmental", severity: "Medium", scoreImpact: -2, confidence: "Medium",
      source: "NGO coalition report", sourceType: "NGO report",
      humanReviewRequired: true,
    }),
    ev({
      ticker: "D05", date: "2026-04-02",
      title: "Sustainable financing book hits S$89B",
      summary: "Cumulative sustainable-financing commitments grew 18% year on year.",
      category: "Environmental", severity: "Low", scoreImpact: 2, confidence: "High",
      source: "Company sustainability report", sourceType: "Official disclosure",
      humanReviewRequired: false,
    }),
    ev({
      ticker: "D05", date: "2026-02-19",
      title: "Board renewal: two independent directors appointed",
      summary: "Governance refresh adds technology-risk and climate expertise to the board.",
      category: "Governance", severity: "Low", scoreImpact: 1, confidence: "High",
      source: "SGX filing", sourceType: "Official disclosure",
      humanReviewRequired: false,
    }),
  ],
  sourceList: [
    { name: "MAS statements", type: "Regulator" },
    { name: "SGX filings", type: "Official disclosure" },
    { name: "Company sustainability report", type: "Official disclosure" },
    { name: "NGO coalition report", type: "NGO report" },
  ],
  raters: { msci: null, lseg: 3.3, sustainalyticsRisk: 20.2, spGlobal: 48 },
  momentum: -24.0,
  read: "Raters split (Sustainalytics benign vs S&P mid) while regulator actions and coal criticism accumulate — ratings lag the risk.",
  tagline: "Headline ratings haven't priced the regulator drumbeat.",
  whyRatingsLag: "Supervisory actions land between annual rater updates; controversy screens weight fines only after they close.",
  doesVsSays: { does: 54, says: 72 },
  coverage: "deep",
};

const OCBC: Company = {
  ticker: "O39",
  companyName: "OCBC",
  sector: "Banks",
  sectorKey: "financials",
  country: "Singapore",
  market: "SGX",
  marketCap: "S$74B",
  environmentalScore: 58,
  socialScore: 61,
  governanceScore: 57,
  confidenceScore: 71,
  lastUpdated: DATA_AS_OF,
  scoreTrend: [
    { month: "Feb 26", score: 62 },
    { month: "Mar 26", score: 61 },
    { month: "Apr 26", score: 60 },
    { month: "May 26", score: 59 },
    { month: "Jun 26", score: 58 },
    { month: "Jul 26", score: 57 },
  ],
  keyMetrics: [
    { label: "Sustainable financing", value: "S$71B cumulative" },
    { label: "AML remediation", value: "Programme ongoing" },
    { label: "Great Eastern saga", value: "Delisting offer completed" },
    { label: "Net-zero target", value: "2050 (financed emissions)" },
  ],
  recentEvents: [
    ev({
      ticker: "O39", date: "2026-06-10",
      title: "AML control remediation milestone missed",
      summary: "Internal audit flags delays in transaction-monitoring upgrades agreed with the regulator.",
      category: "Governance", severity: "Medium", scoreImpact: -3, confidence: "Medium",
      source: "The Straits Times", sourceType: "Credible news",
      humanReviewRequired: true,
    }),
    ev({
      ticker: "O39", date: "2026-04-28",
      title: "Minority-shareholder criticism over Great Eastern offer",
      summary: "Governance advocates argue the final offer undervalued minorities; SIAS sought clarifications.",
      category: "Governance", severity: "Medium", scoreImpact: -2, confidence: "High",
      source: "SIAS statement", sourceType: "Credible news",
      humanReviewRequired: true,
    }),
    ev({
      ticker: "O39", date: "2026-03-05",
      title: "Green financing framework expanded to transition loans",
      summary: "New framework adds transition-finance categories with third-party verification.",
      category: "Environmental", severity: "Low", scoreImpact: 2, confidence: "High",
      source: "Company disclosure", sourceType: "Official disclosure",
      humanReviewRequired: false,
    }),
  ],
  sourceList: [
    { name: "SGX filings", type: "Official disclosure" },
    { name: "The Straits Times", type: "Credible news" },
    { name: "SIAS statements", type: "Credible news" },
  ],
  raters: { msci: null, lseg: 3.0, sustainalyticsRisk: null, spGlobal: 42 },
  momentum: -16.5,
  read: "Two raters straddle the mean; AML remediation and the Great Eastern governance saga keep pressure on — downgrade watch.",
  tagline: "Governance questions the ratings haven't caught up with.",
  whyRatingsLag: "Only two raters cover OCBC deeply; neither has refreshed since the Great Eastern completion.",
  doesVsSays: { does: 52, says: 66 },
  coverage: "deep",
};

const AAPL: Company = {
  ticker: "AAPL",
  companyName: "Apple Inc.",
  sector: "Technology",
  sectorKey: "technology",
  country: "United States",
  market: "NASDAQ",
  marketCap: "US$3.4T",
  environmentalScore: 72,
  socialScore: 60,
  governanceScore: 70,
  confidenceScore: 88,
  lastUpdated: DATA_AS_OF,
  scoreTrend: [
    { month: "Feb 26", score: 66 },
    { month: "Mar 26", score: 67 },
    { month: "Apr 26", score: 66 },
    { month: "May 26", score: 67 },
    { month: "Jun 26", score: 68 },
    { month: "Jul 26", score: 68 },
  ],
  keyMetrics: [
    { label: "Carbon neutral target", value: "2030 (full value chain)" },
    { label: "Recycled materials", value: "24% of shipped product mass" },
    { label: "Supplier audits (2025)", value: "890 facilities" },
    { label: "EU DMA compliance", value: "Ongoing proceedings" },
  ],
  recentEvents: [
    ev({
      ticker: "AAPL", date: "2026-06-30",
      title: "Supplier responsibility report expands audit coverage",
      summary: "Annual report shows audit coverage up 8%; three suppliers removed for labour violations.",
      category: "Social", severity: "Medium", scoreImpact: 1, confidence: "High",
      source: "Company supplier report", sourceType: "Official disclosure",
      humanReviewRequired: false,
    }),
    ev({
      ticker: "AAPL", date: "2026-05-21",
      title: "EU DMA interoperability dispute continues",
      summary: "Commission pressed for further changes to messaging interoperability; potential fines under review.",
      category: "Governance", severity: "Medium", scoreImpact: -2, confidence: "High",
      source: "European Commission", sourceType: "Regulator",
      humanReviewRequired: true,
    }),
    ev({
      ticker: "AAPL", date: "2026-04-09",
      title: "2030 carbon-neutral progress update",
      summary: "Value-chain emissions down 60% vs 2015 baseline; renewable supplier commitments at 95% of direct spend.",
      category: "Environmental", severity: "Low", scoreImpact: 2, confidence: "High",
      source: "Environmental progress report", sourceType: "Official disclosure",
      humanReviewRequired: false,
    }),
  ],
  sourceList: [
    { name: "Company reports", type: "Official disclosure" },
    { name: "European Commission", type: "Regulator" },
  ],
  raters: { msci: "AA", lseg: 3.8, sustainalyticsRisk: 17.2, spGlobal: 60 },
  momentum: 2.5,
  read: "Raters broadly agree at strong-mid; DMA governance friction offsets steady environmental delivery — no decisive signal.",
  tagline: "Steady delivery, but regulators cap the upside.",
  whyRatingsLag: "Coverage is dense and current for mega-caps; gaps close fast — less consensus-gap alpha here.",
  doesVsSays: { does: 71, says: 74 },
  coverage: "deep",
};

const MSFT: Company = {
  ticker: "MSFT",
  companyName: "Microsoft",
  sector: "Technology",
  sectorKey: "technology",
  country: "United States",
  market: "NASDAQ",
  marketCap: "US$3.8T",
  environmentalScore: 76,
  socialScore: 71,
  governanceScore: 74,
  confidenceScore: 90,
  lastUpdated: DATA_AS_OF,
  scoreTrend: [
    { month: "Feb 26", score: 71 },
    { month: "Mar 26", score: 72 },
    { month: "Apr 26", score: 72 },
    { month: "May 26", score: 73 },
    { month: "Jun 26", score: 74 },
    { month: "Jul 26", score: 74 },
  ],
  keyMetrics: [
    { label: "Carbon negative target", value: "2030" },
    { label: "Carbon removal purchased", value: "22Mt cumulative" },
    { label: "AI datacentre energy", value: "Under scrutiny — disclosure expanded" },
    { label: "Water positive target", value: "2030" },
  ],
  recentEvents: [
    ev({
      ticker: "MSFT", date: "2026-06-12",
      title: "Record carbon-removal purchase agreement",
      summary: "Multi-year offtake for engineered carbon removal; largest corporate deal to date.",
      category: "Environmental", severity: "Low", scoreImpact: 3, confidence: "High",
      source: "Company announcement", sourceType: "Official disclosure",
      humanReviewRequired: false,
    }),
    ev({
      ticker: "MSFT", date: "2026-05-03",
      title: "AI datacentre energy use draws state-level scrutiny",
      summary: "Utility commissions in two states opened reviews of datacentre grid impact; Microsoft expanded disclosure in response.",
      category: "Environmental", severity: "Medium", scoreImpact: -2, confidence: "Medium",
      source: "Reuters", sourceType: "Credible news",
      humanReviewRequired: true,
    }),
    ev({
      ticker: "MSFT", date: "2026-03-17",
      title: "Responsible-AI governance framework updated",
      summary: "Third external audit of AI governance published; expanded red-teaming disclosures.",
      category: "Governance", severity: "Low", scoreImpact: 2, confidence: "High",
      source: "Company report", sourceType: "Official disclosure",
      humanReviewRequired: false,
    }),
  ],
  sourceList: [
    { name: "Company reports", type: "Official disclosure" },
    { name: "Reuters", type: "Credible news" },
  ],
  raters: { msci: "AAA", lseg: 4.4, sustainalyticsRisk: 13.5, spGlobal: 65 },
  momentum: 6.5,
  read: "Raters agree at the top of the range and the news flow is constructive — a proven improver, already well-priced.",
  tagline: "The consensus leader — priced like one.",
  whyRatingsLag: "They don't, much: dense coverage and frequent refreshes keep ratings close to reality here.",
  doesVsSays: { does: 78, says: 80 },
  coverage: "deep",
};

const TSLA: Company = {
  ticker: "TSLA",
  companyName: "Tesla, Inc.",
  sector: "Automobiles",
  sectorKey: "energyheavy",
  country: "United States",
  market: "NASDAQ",
  marketCap: "US$1.1T",
  environmentalScore: 78,
  socialScore: 42,
  governanceScore: 45,
  confidenceScore: 74,
  lastUpdated: DATA_AS_OF,
  scoreTrend: [
    { month: "Feb 26", score: 58 },
    { month: "Mar 26", score: 57 },
    { month: "Apr 26", score: 55 },
    { month: "May 26", score: 56 },
    { month: "Jun 26", score: 54 },
    { month: "Jul 26", score: 53 },
  ],
  keyMetrics: [
    { label: "EVs delivered (2025)", value: "1.9M units" },
    { label: "Battery recycling", value: "92% materials recovery (stated)" },
    { label: "NHTSA investigations", value: "2 open" },
    { label: "Board independence", value: "Challenged by proxy advisors" },
  ],
  recentEvents: [
    ev({
      ticker: "TSLA", date: "2026-06-22",
      title: "NHTSA expands driver-assist investigation",
      summary: "Probe widened to additional model years after new incident reports.",
      category: "Social", severity: "High", scoreImpact: -4, confidence: "High",
      source: "NHTSA filing", sourceType: "Regulator",
      humanReviewRequired: true,
    }),
    ev({
      ticker: "TSLA", date: "2026-05-29",
      title: "Proxy advisors oppose pay package again",
      summary: "Two major advisors recommended against the compensation plan citing independence concerns.",
      category: "Governance", severity: "Medium", scoreImpact: -3, confidence: "High",
      source: "Proxy advisor reports", sourceType: "Credible news",
      humanReviewRequired: true,
    }),
    ev({
      ticker: "TSLA", date: "2026-04-14",
      title: "Battery materials recovery milestone",
      summary: "Recycling loop reports 92% materials recovery at scale across two gigafactories.",
      category: "Environmental", severity: "Low", scoreImpact: 2, confidence: "Medium",
      source: "Company impact report", sourceType: "Official disclosure",
      humanReviewRequired: false,
    }),
  ],
  sourceList: [
    { name: "NHTSA filings", type: "Regulator" },
    { name: "Company impact report", type: "Official disclosure" },
    { name: "Proxy advisor reports", type: "Credible news" },
  ],
  raters: { msci: "A", lseg: 3.4, sustainalyticsRisk: 24.7, spGlobal: 37 },
  momentum: -9.5,
  read: "Raters split hard on the E-vs-S&G trade-off; regulator and governance news flow is deteriorating — hidden risk.",
  tagline: "Environmental strength, but the raters disagree on everything else.",
  whyRatingsLag: "Raters weight the EV mission differently; controversy screens update slower than the news cycle.",
  doesVsSays: { does: 63, says: 48 },
  coverage: "deep",
};

/* ============================================================
   SIGNAL-ONLY COVERAGE (consensus-gap signal, deep data pending)
   Ratings snapshot Jun 2026 — static, illustrative.
   ============================================================ */
const sig = (
  ticker: string, companyName: string, sector: string, sectorKey: SectorKey, marketCap: string,
  raters: Company["raters"], momentum: number, read: string, tagline: string, whyRatingsLag: string,
): Company => ({
  ticker, companyName, sector, sectorKey, country: "Singapore", market: "SGX", marketCap,
  environmentalScore: null, socialScore: null, governanceScore: null,
  confidenceScore: 55, lastUpdated: DATA_AS_OF,
  scoreTrend: [], keyMetrics: [], recentEvents: [], sourceList: [],
  raters, momentum, read, tagline, whyRatingsLag,
  doesVsSays: { does: 50, says: 50 },
  coverage: "signal",
});

const SIGNAL_ONLY: Company[] = [
  sig("C38U", "CapitaLand Integrated Commercial Trust", "REIT", "default", "S$14B",
    { msci: "AA", lseg: 2.5, sustainalyticsRisk: 8.4, spGlobal: 41 }, 13.5,
    "MSCI/Sustainalytics rate it a leader, S&P/LSEG mid; green-bond momentum positive — hidden winner.",
    "Improving faster than the ratings show.",
    "Green-bond programme post-dates the last full rater refresh."),
  sig("A17U", "CapitaLand Ascendas REIT", "REIT", "default", "S$12B",
    { msci: "AA", lseg: 2.1, sustainalyticsRisk: null, spGlobal: 40 }, 8.0,
    "Wide MSCI-vs-S&P gap; steady green finance and science-based targets — unpriced upside.",
    "Improving faster than the ratings show.",
    "Three-rater coverage with stale LSEG input."),
  sig("M44U", "Mapletree Logistics Trust", "REIT", "default", "S$9B",
    { msci: null, lseg: 2.3, sustainalyticsRisk: 11.1, spGlobal: 44 }, 7.0,
    "Sustainalytics low-risk vs S&P mid; maiden green bond and 2030 carbon-neutral target.",
    "Improving faster than the ratings show.",
    "Maiden green bond not yet reflected in annual scores."),
  sig("Y92", "Thai Beverage", "Consumer / Alcohol", "default", "S$13B",
    { msci: null, lseg: 3.2, sustainalyticsRisk: null, spGlobal: 92 }, 11.0,
    "Only 2 raters but wide (S&P 92 vs LSEG 64); DJSI World + SBTi — low-confidence improver.",
    "Two raters, one big disagreement.",
    "Thin coverage: two raters with very different methodologies."),
  sig("U96", "Sembcorp Industries", "Energy / Utilities", "energyheavy", "S$12B",
    { msci: null, lseg: 2.3, sustainalyticsRisk: null, spGlobal: 45 }, 14.5,
    "Two raters agree mid; strong coal-to-green execution — likely upgrade.",
    "The transition story the scores haven't caught.",
    "Divestment-led transition runs ahead of annual rating cycles."),
  sig("BSL", "Raffles Medical Group", "Healthcare", "default", "S$2B",
    { msci: null, lseg: 2.3, sustainalyticsRisk: null, spGlobal: 33 }, 8.0,
    "Raters agree low-mid; China healthcare partnerships lifting the news — likely upgrade.",
    "Quietly improving on thin coverage.",
    "Small-cap coverage refreshes least often."),
  sig("5E2", "Seatrium", "Offshore & Marine / Energy", "energyheavy", "S$8B",
    { msci: null, lseg: 2.7, sustainalyticsRisk: 25.3, spGlobal: 42 }, -15.0,
    "Raters split on the transition story; two corruption settlements dominate the news — avoid.",
    "The transition story the settlements keep interrupting.",
    "Raters disagree on whether the O&M transition offsets legacy conduct issues."),
  sig("U11", "United Overseas Bank", "Banks", "financials", "S$58B",
    { msci: null, lseg: 2.8, sustainalyticsRisk: 14.8, spGlobal: 55 }, -11.5,
    "Sustainalytics low-risk vs S&P mid; AML penalty and Myanmar/coal flags — hidden risk.",
    "Benign headline scores, busy controversy tail.",
    "Controversy screens lag regulator actions by one refresh cycle."),
  sig("G13", "Genting Singapore", "Gaming / Hospitality", "default", "S$11B",
    { msci: "AA", lseg: 2.9, sustainalyticsRisk: 17.0, spGlobal: 49 }, -3.5,
    "Raters split (MSCI AA vs S&P 49); AML fine vs S$6.8bn RWS 2.0 — watch for a catalyst.",
    "Big rater split, no direction yet.",
    "Raters weight the AML fine and the expansion pipeline very differently."),
  sig("F34", "Wilmar International", "Agribusiness / Palm oil", "default", "S$19B",
    { msci: "A", lseg: 3.2, sustainalyticsRisk: 33.3, spGlobal: 68 }, -20.5,
    "Raters agree mid-grade (~66); corruption conviction and probes dragging — downgrade likely.",
    "Agreement today, downgrade pressure tomorrow.",
    "Conviction post-dates every rater's last refresh."),
  sig("E5H", "Golden Agri-Resources", "Agribusiness / Palm oil", "default", "S$3B",
    { msci: null, lseg: 2.4, sustainalyticsRisk: null, spGlobal: 43 }, -13.0,
    "Only 2 raters, both low; NGO/deforestation pressure mounting — agreed rating looks stale.",
    "Thin coverage, mounting pressure.",
    "Two-rater coverage means slow reaction to NGO evidence."),
  sig("C07", "Jardine Cycle & Carriage", "Conglomerate", "default", "S$10B",
    { msci: "A", lseg: 2.9, sustainalyticsRisk: null, spGlobal: 56 }, -25.5,
    "Raters agree ~mid; sovereign-fund exclusion and UN complaints unpriced — downgrade risk.",
    "The exclusion the scores haven't priced.",
    "Sovereign-fund exclusion isn't an input to any rater's model."),
  sig("Z74", "Singtel", "Telecom", "default", "S$68B",
    { msci: null, lseg: 3.0, sustainalyticsRisk: null, spGlobal: 56 }, -8.0,
    "Raters agree; Optus emergency-call failures and data-breach fallout unpriced — downgrade risk.",
    "Agreement built on last year's news.",
    "Optus incidents sit in subsidiary reporting that raters weight lightly."),
  sig("C6L", "Singapore Airlines", "Airline", "default", "S$21B",
    { msci: null, lseg: 3.0, sustainalyticsRisk: null, spGlobal: 53 }, -9.0,
    "Raters agree ~mid; fatal SQ321 turbulence accident dominates — rating likely to lag down.",
    "One accident, two unmoved ratings.",
    "Safety events flow into S ratings only at annual refresh."),
  sig("S63", "ST Engineering", "Industrials / Defence", "default", "S$14B",
    { msci: null, lseg: 2.8, sustainalyticsRisk: null, spGlobal: 46 }, 0.5,
    "Two raters broadly agree; Myanmar-supply concern offset by SBTi/TCFD pledges — neutral.",
    "Offsetting stories, flat signal.",
    "Defence-sector screens differ by rater; the offsets cancel."),
  sig("CJLU", "NetLink NBN Trust", "Infrastructure", "default", "S$3B",
    { msci: null, lseg: 2.5, sustainalyticsRisk: null, spGlobal: 42 }, -3.5,
    "Two raters agree; recurring third-party cable outages vs SLB financing — flat.",
    "Steady, and rated that way.",
    "Little news flow; ratings and reality stay close."),
  sig("OV8", "Sheng Siong Group", "Consumer staples / Retail", "default", "S$2B",
    { msci: null, lseg: 2.2, sustainalyticsRisk: null, spGlobal: 28 }, 3.0,
    "Raters agree low; routine disclosures only — nothing actionable yet.",
    "Low scores, low drama.",
    "Minimal disclosure surface; raters have little to disagree about."),
];

export const COMPANIES: Company[] = [FRASERS, DBS, OCBC, AAPL, MSFT, TSLA, ...SIGNAL_ONLY];

export const DEEP_COMPANIES = COMPANIES.filter((c) => c.coverage === "deep");

export function findCompany(q: string): Company | undefined {
  const s = q.trim().toLowerCase();
  if (!s) return undefined;
  return (
    COMPANIES.find((c) => c.ticker.toLowerCase() === s) ??
    COMPANIES.find((c) => c.companyName.toLowerCase().includes(s))
  );
}

/* ---------- Alerts (display-only mock, §5.1) ---------- */
export interface MockAlert {
  company: string;
  what: string;
  when: string; // MMM YYYY-consistent display
}
export const MOCK_ALERTS: MockAlert[] = [
  { company: "Frasers Centrepoint Trust", what: "Momentum crossed +10 (Hidden improver)", when: "Jul 2026" },
  { company: "DBS Group", what: "Verdict changed to Clear risk", when: "Jun 2026" },
  { company: "Tesla, Inc.", what: "New High-severity event: NHTSA probe expanded", when: "Jun 2026" },
  { company: "Sembcorp Industries", what: "Momentum crossed +10 (Proven improver)", when: "Jun 2026" },
];
export const ALERT_RULES = "Alert me when momentum crosses ±10 or a verdict changes";

/* ---------- Track record (§5.2) ----------
   Official events must be REAL; flag dates come from the team's
   reconstruction and are marked pending until supplied. */
export interface TrackRecordRow {
  company: string;
  flaggedDate: string; // "pending team input" until supplied
  officialEvent: string;
  officialDate: string;
  leadTimeMonths: string;
  eventVerified: boolean;
}
export const TRACK_RECORD: TrackRecordRow[] = [
  {
    company: "Seatrium",
    flaggedDate: "Pending team reconstruction",
    officialEvent: "FTSE4Good Index Series inclusion (cited in company investor materials)",
    officialDate: "H1 2024",
    leadTimeMonths: "—",
    eventVerified: true,
  },
  {
    company: "Sembcorp Industries",
    flaggedDate: "Pending team reconstruction",
    officialEvent: "Rating upgrades following coal-divestment execution",
    officialDate: "To verify",
    leadTimeMonths: "—",
    eventVerified: false,
  },
  {
    company: "Wilmar International",
    flaggedDate: "Pending team reconstruction",
    officialEvent: "Rating pressure following 2025 corruption conviction news cycle",
    officialDate: "To verify",
    leadTimeMonths: "—",
    eventVerified: false,
  },
];
export const TRACK_RECORD_CAVEAT =
  "Small illustrative sample reconstructed from public data — a story, not a backtest.";
