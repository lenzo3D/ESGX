# ESG Momentum Engine 2.0 — Consensus Gap Scanner

A trading-terminal-style ESG dashboard for fund managers. It plots 20 SGX-listed
companies on a **disagreement × momentum** quadrant to surface names that are
*mispriced* because the four big raters (MSCI, LSEG, Sustainalytics, S&P Global)
disagree while the news flow points one way and the official rating hasn't caught up.

The whole pitch is one move: **disagreement × momentum → a verdict.**

## Run it

No build step, no install. Two options:

**A. Just open it** — double-click `index.html`.

**B. Serve it** (recommended, avoids any browser file:// quirks):
```bash
cd "Hackathon Prototype"
python3 -m http.server 8123
# then open http://127.0.0.1:8123
```

## The three screens

1. **Scanner (home)** — the Consensus-Gap Quadrant is the hero. X = rater
   disagreement (spread), Y = news momentum. Dark-horse corner (top-right) shaded
   green, hidden-risk corner (bottom-right) shaded red. Every dot is coloured by
   verdict. Hover a dot for the read; click to drill down. The left **watchlist**
   and right **company detail** panel stay in sync with the chart.
2. **Company detail (right panel)** — the four rater scores side by side so the
   disagreement is *visible*, the spread + flag, momentum, the verdict badge, and
   the one-line PM read.
3. **Shortlist** — Dark Horses (buy early), Rating Lags Risk (downgrade warning),
   and Hidden Risks (avoid) as three ranked, clickable lists.

## Verdict colour language (consistent everywhere)

| Verdict | Meaning | Colour |
|---|---|---|
| **Dark Horse** | raters split + momentum BUY → mispriced upside | green |
| **Consensus Rise** | raters agree + momentum BUY | blue |
| **Contested** | raters split + HOLD | yellow |
| **Stable** | raters agree + HOLD | grey |
| **Rating Lags Risk** | raters agree + momentum SELL → downgrade early-warning | orange |
| **Hidden Risk** | raters split + momentum SELL → avoid / short | red |

Each verdict has a distinct hue (no two greens / two ambers) and all six appear in the
chart legend. Click **METHODOLOGY** in the quadrant header for the full scoring logic
(rater normalisation, thresholds, coverage caveat, momentum, verdict matrix).

## Design notes

Modelled on Interactive Brokers' Trader Workstation (Mosaic): flat, hard-edged, dense,
true-black panels with solid colour cells — no gradients, glows, or translucent buttons.
Type is standard and system-safe: **Times New Roman** for titles/headings, **Arial** for
data and UI. Layout reflows responsively (3-column → narrower → stacked) down to phone width.

## Files

- `index.html` — app shell
- `src/styles.css` — design system (dark trading-terminal theme)
- `src/app.js` — rendering + interactions (vanilla JS, no framework)
- `src/data.js` — the 20-company dataset, inlined (generated from `esg_scanner_data.json`)

All data is precomputed — the app only loads and renders it. No backend, no API.
