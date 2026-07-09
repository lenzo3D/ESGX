# ESGX — Pitch & Feature Summary

**PolyFinTech100 API Hackathon 2026 · ESG category (CGS International)**

> “Most ESG tools rate the past. ESGX monitors what is changing now.”

---

## The idea in one paragraph

ESG ratings are **static, slow, and inconsistent** — CGS's own brief says so. ESGX
weaponises the third flaw to fix the first two: where the four big raters (MSCI, LSEG,
Sustainalytics, S&P Global) **disagree**, the market has no settled ESG view of a
company — and peer-reviewed research shows that is exactly where mispricing lives. ESGX
crosses that *disagreement* with **live news momentum** to find companies whose ESG
reality is moving before their official ratings do, and turns each one into an
actionable verdict: **Hidden improver · Proven improver · Hidden risk · Clear risk ·
No clear signal**, each with a BUY / HOLD / AVOID call.

**USP:** CGS's baseline engine finds ESG improvers *once a year* from score CAGR. ESGX
finds them *daily* — from live news flow, exactly where the raters can't agree.

## How it extends the CGS Momentum Matrix (not replaces it)

The CGS matrix asks *where is this company going?* ESGX adds: *has the market noticed?*

| ESGX verdict | On the CGS Momentum Matrix |
|---|---|
| Hidden improver | “Hidden Winners — the opportunity lives here” — before consensus forms |
| Proven improver | “Future Leaders” |
| Hidden risk | “Overrated Leaders” risk — someone still rates it highly while news deteriorates |
| Clear risk | “Value Traps” — declining, agreed rating not yet moved |

CGS baseline evidence (their brief): improver basket **55.1% vs 6.4%** MSCI ASEAN,
Sharpe **0.57 vs −0.22**; improver outperformance probability **28.9% → 46.2% → 61.5%**
over 1/3/5 years. Academic backing for our added axis: Berg, Kölbel & Rigobon (*Review
of Finance*, 2022) — rater correlations 0.38–0.71, 56% of divergence is measurement;
Gibson Brandon, Krueger & Schmidt (*Financial Analysts Journal*, 2021) — higher rater
disagreement → higher returns.

## How every piece works

**1. Data collection (free, live).** The pipeline pulls real articles per company from
the **GDELT DOC 2.0 API** (free public news index, refreshes every 15 minutes; we
respect its 1-request-per-5-seconds limit) with automatic failover to **Google News
RSS** — so a live demo cannot die on a rate limit. No paid feeds anywhere.

**2. Classification (AI labels, never generates).** Each *real* headline is classified
— E/S/G category, severity, signed impact, confidence, human-review flag — by a
priority chain: **Google Gemini free tier → Anthropic Claude → deterministic keyword
rules**. The keyword fallback needs no keys and no network, so classification always
completes. Every event displays which classifier labelled it, with a clickable source
link. Guardrails are enforced server-side: no source → no classification; severe or
low-confidence events are forced into the Human Review queue.

**3. Momentum (deterministic engine, never AI).**
`Momentum = Σ(direction × impact × source weight × recency decay)` — official/regulator
sources weigh up to 1.0, unknown outlets 0.5; a 30-day half-life makes old news fade.

**4. ESGX score (deterministic engine, never AI).** Sector-weighted pillars (banks
G-45% · tech S/G-35% · autos E-45%), controversy penalties scaled by severity and
capped, and a confidence adjustment that pulls weak-evidence scores toward neutral.
The full calculation trace is shown in the UI — auditable line by line.

**5. Rater normalisation.** All four raters mapped to one 0–100 scale (Sustainalytics
risk inverted, MSCI letters converted); the **spread** (max − min) is the disagreement
axis. Rater scores are honestly tagged *“Static snapshot · illustrative”* — the
live-vs-static contrast **is** the product story.

**6. The API (this is an API hackathon).** The dashboard is one client of a
machine-readable signal feed a portfolio system could poll every morning:
- `GET /api/signals` — ranked universe: verdict · call · momentum · rater split
- `GET /api/signal/{ticker}` — full signal + engine breakdown + live events
- `POST /api/pipeline/refresh` — trigger a live news pull
- Unknown tickers → honest 404 with the covered universe

**7. The dashboard (fund-manager workflow).** Watchlist + one-story company page
(verdict → call → momentum → live news → Does-vs-Says → rater block → why-ratings-lag),
the consensus-gap **Map**, live ESG events table, comparison, **AI Analyst** (source-
backed summaries with every claim tied to a provided source), **Human Review queue**
(approve / reject / request evidence), **Track record** (real index events; flag dates
honestly pending), **Alerts**, and a **Methodology** tab covering collection,
filtering, the formula, reliability protections, the CGS bridge, the roadmap, and the
0.54 divergence card. AVOID — never SELL (short-selling restrictions in ASEAN markets).

**8. Honesty layer (auditability as a feature).** A precise provenance badge — “Live
news · Ratings illustrative” — states exactly what is live (articles, classification,
momentum) vs illustrative (rater snapshot, pillar scores). “Live feed” tags appear only
on genuinely live elements, every event shows which classifier labelled it, “not
investment advice” in the footer, and a track record explicitly labelled *“a story,
not a backtest.”*

## Defensibility — “Why not just ChatGPT or Bloomberg?”

**The 30-second answer:** you're not paying for information, you're paying for a
defensible, repeatable process — the same universe watched daily, scored by the same
audited formula, every claim source-linked, delivered as an API your systems can act
on. ChatGPT gives you an answer; ESGX gives you a signal you can put in front of a
compliance officer.

**vs ChatGPT (structural, not cosmetic):**
1. *Determinism = auditability.* Same inputs → same score, with a printed calculation
   trace. Chat answers vary run to run and can't be defended to a compliance officer or
   investment committee under greenwashing rules (SFDR, MAS fund-labelling).
2. *No-hallucination by construction.* AI only labels real fetched articles; no source
   → no classification; every claim links to a clickable URL. That's a pipeline
   property — you cannot prompt it into ChatGPT.
3. *Monitoring vs Q&A.* Momentum is a delta; a stateless chat holds no baseline and
   can't detect change. ESGX refreshes daily and alerts on verdict flips.
4. *Comparability + workflow.* Rankings need identical measurement across the
   universe; decisions run on JSON feeds (`GET /api/signals`), not chat transcripts.

**vs Bloomberg:** it displays the static rater scores — our *inputs*, the very thing
the CGS brief calls broken — with no consensus-gap layer, at ~US$25–30k/seat/year.
ESGX runs on free public data for the mid-tier ASEAN managers who can't justify
terminal seats, in the region where global ESG coverage is thinnest.

**The judo line:** “We're not competing with the LLM — we use one, caged: whitelisted
sources in, classification-not-generation, a deterministic engine on top, human review
for anything severe. ChatGPT is an ingredient. ESGX is the dish — with the food-safety
certificate.”

**Live rebuttal (20s):** ask ChatGPT for DBS's ESG momentum score — it refuses or
invents an unverifiable number, differently each time. Then show ESGX: the number, the
formula, and the real article behind it, one click deep.

## Roadmap (maps 1:1 to CGS's four challenge pillars)

- **Predict earlier** — ✓ shipped (live news → classification → daily momentum)
- **New data sources** — news ✓; patents, job postings, satellite = *planned
  collectors: each is just another classified event through the same formula*
- **Redesign scoring** — planned classifier dimensions for AI adoption, digital
  maturity, intangibles
- **Make it usable** — ✓ shipped (dashboard + shortlist + alerts + public API)

## 60-second demo path

1. **Watchlist** opens on Frasers Centrepoint Trust: raters split 54 points (MSCI AA vs
   LSEG 1.8), momentum +12 → *Hidden improver, BUY* — "improving faster than the
   ratings show."
2. **Map** — top-right corner: “≈ CGS ‘Hidden Winners’ — the opportunity lives here.”
3. **Pull live news** — real headlines stream in, get classified, momentum updates. 
   *"Show us something the market doesn't know yet"* — this is it, live.
4. Close on **Methodology**: the formula, the guardrails, and `GET /api/signal/J69U`.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Recharts · GDELT DOC 2.0 API ·
Google News RSS · Gemini free tier / Anthropic SDK (optional) · deterministic scoring
engine · zero paid dependencies · runs locally with `npm run dev`.
