# ESGX

**“Most ESG tools rate the past. ESGX monitors what is changing now.”**

ESGX converts verified disclosures and live ESG events into auditable investment
signals for fund managers. Next.js (App Router) · TypeScript · Tailwind · Recharts ·
Lucide · Anthropic SDK.

> **Mock prototype data.** Every number in this MVP is clearly-labelled mock data,
> structured so the data module can be swapped for Supabase/live feeds without touching
> the UI or the scoring engine.

## Run it

Node 22 is installed locally at `~/.local/node22` (no system install was available).
Either add it to your PATH once:

```bash
export PATH="$HOME/.local/node22/bin:$PATH"   # add to ~/.zshrc to persist
cd esgx
npm run dev        # http://localhost:3000
```

…or just use the launcher script, which sets PATH itself:

```bash
./esgx/dev.sh      # http://localhost:3000
```

## Environment variables

All optional — keys are only for the LLM features and never reach the browser:

```bash
cp esgx/.env.example esgx/.env.local
```

| Key | Cost | What it unlocks |
|---|---|---|
| `GEMINI_API_KEY` | **Free** (aistudio.google.com, no card) | LLM-quality news classification + AI Analyst summaries |
| `ANTHROPIC_API_KEY` | Paid (prepaid credits) | Same features via Claude (used if no Gemini key) |
| *(no keys)* | Free | Everything else still works — live news collection runs, and a deterministic **keyword classifier** labels events (marked as such, lower confidence) |

Classification priority: **Gemini → Claude → keyword rules**. Every live event shows
which classifier labelled it.

## Live data pipeline (real, not mock)

Each company page has a **"Pull live news"** button that runs the exact pipeline the
Methodology tab describes:

1. **Collect** — real articles from **GDELT** (free public feed, 15-min refresh; falls
   back to Google News RSS automatically when GDELT rate-limits — it allows one request
   per 5 seconds per IP).
2. **Classify** — Claude labels each *real* headline (E/S/G, severity, impact,
   confidence). AI never generates facts. Requires `ANTHROPIC_API_KEY`; without it the
   real articles still display, marked "unclassified".
3. **Compute** — the deterministic engine recomputes momentum:
   `Momentum = Σ(direction × impact × source weight × recency decay)`.

Results are cached server-side for 15 minutes (GDELT's own cadence). Live events show
clickable source links and a "Live feed" badge; rater scores deliberately remain a
static illustrative snapshot — that contrast (live signal vs stale ratings) **is** the
product story.

## Product rules (what makes this defensible)

- **AI never invents ESG facts, figures, sources, or scores.** It summarises,
  classifies, explains, and flags — using only the data package sent to it.
- **The final ESG score is computed by the deterministic engine** in
  `src/lib/esgScoring.ts`: sector weights (banks G-45%, tech S/G-35%, autos E-45%),
  controversy penalties from events, confidence adjustment — with a human-readable
  calculation trace shown in the UI.
- **No source → no classification.** Severe or low-confidence events go to Human Review.
- The negative call is always **AVOID** (short-selling is restricted in several ASEAN
  markets).
- One vocabulary everywhere: **Hidden improver · Proven improver · Hidden risk ·
  Clear risk · No clear signal**.

## The ESGX API (PolyFinTech100 is an API hackathon — this is the product)

The dashboard is one client of a machine-readable signal API:

```bash
curl http://localhost:3000/api/signals          # ranked universe: verdict · call · momentum · rater split
curl http://localhost:3000/api/signal/J69U      # full company signal + engine breakdown + live events
curl -X POST http://localhost:3000/api/pipeline/refresh \
     -H 'Content-Type: application/json' -d '{"ticker":"J69U"}'   # trigger a live news pull
```

Unknown tickers return an honest 404 with the covered universe. All responses carry
`asOf`, the model tag, and the not-investment-advice disclaimer.

## Tabs

| Tab | What it shows |
|---|---|
| **Watchlist** (home) | 23 covered names (20 SGX + AAPL/MSFT/TSLA) + the company story column: verdict, call, momentum, news drivers, Does vs Says, rater snapshot, why-ratings-lag |
| **Map** | The consensus-gap quadrant, full-screen; colour + filled/outlined dual encoding; click a dot to open the company |
| **Live ESG Events** | All events, newest first, with severity/confidence/review badges |
| **Comparison** | Two deep-coverage names side by side + pillar chart |
| **AI Analyst** | Claude-generated summary of the verified data package (needs API key) |
| **Human Review** | Approve / Reject / Request more evidence on flagged events (local state) |
| **Track record** | Real official index events; flag dates pending team reconstruction |
| **Methodology** | Collection → filtering → formula → reliability → guardrails + the 0.54 divergence card |

## Demo path (on stage)

1. Open **Watchlist** — Frasers Centrepoint Trust (J69U) is pre-selected: *Hidden
   improver*, BUY, momentum +12, GRESB/green-loan events, "why the ratings lag".
2. **Map** — point at the top-right corner: raters disagree + momentum improving; click
   another dot to show navigation.
3. **Methodology** — the momentum formula and the "AI labels, never generates" line.
4. If a key is configured: **AI Analyst** → Generate AI ESG Summary on Frasers.

## What still needs the team

- **Track record flag dates** — supply your reconstructed dates in
  `src/data/mockCompanies.ts` (`TRACK_RECORD`); they are deliberately not invented.
- Rows marked **“To verify”** need the official event dates confirmed against the index
  provider's published review notices.
