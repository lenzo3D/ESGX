window.ESG_DATA = {
  "meta": {
    "product": "ESG Momentum Engine 2.0 — Consensus Gap Scanner",
    "universe": "20 SGX-listed companies",
    "ratings_asof": "Jun 2026",
    "raters": [
      "MSCI",
      "LSEG",
      "Sustainalytics",
      "S&P Global"
    ],
    "normalisation": "absolute 0-100, higher = better (theoretical ranges, sample-independent)",
    "flag_thresholds": {
      "HIGH": ">=40 spread",
      "MODERATE": "20-39 spread",
      "LOW": "<20 spread"
    },
    "sample_mean": 58.6,
    "verdicts": {
      "DARK HORSE": "raters disagree + momentum BUY  → mispriced upside",
      "HIDDEN RISK": "raters disagree + momentum SELL → avoid / short",
      "CONTESTED": "raters disagree + momentum HOLD",
      "CONSENSUS RISE": "raters agree + momentum BUY",
      "RATING LAGS RISK": "raters agree + momentum SELL → ratings not yet caught up (downgrade early-warning)",
      "STABLE": "raters agree + momentum HOLD"
    },
    "axes": {
      "x": "spread (disagreement)",
      "y": "momentum (net weighted)"
    }
  },
  "companies": [
    {
      "company": "Wilmar International",
      "ticker": "F34",
      "industry": "Agribusiness / Palm oil",
      "raw": {
        "msci": "A",
        "lseg": 3.2,
        "sustainalytics_risk": 33.3,
        "sp_global": 68.0
      },
      "normalised": {
        "msci": 66.7,
        "lseg": 64.0,
        "sustainalytics": 66.7,
        "sp_global": 68.0
      },
      "raters_count": 4,
      "mean": 66.3,
      "spread": 4.0,
      "std": 1.45,
      "flag": "LOW",
      "directional_split": "no",
      "momentum": -20.5,
      "signal": "SELL",
      "verdict": "RATING LAGS RISK",
      "read": "Raters agree it is mid-grade (~66); corruption conviction & probes dragging — downgrade likely. Early warning."
    },
    {
      "company": "Golden Agri-Resources",
      "ticker": "E5H",
      "industry": "Agribusiness / Palm oil",
      "raw": {
        "msci": null,
        "lseg": 2.4,
        "sustainalytics_risk": null,
        "sp_global": 43.0
      },
      "normalised": {
        "msci": null,
        "lseg": 48.0,
        "sustainalytics": null,
        "sp_global": 43.0
      },
      "raters_count": 2,
      "mean": 45.5,
      "spread": 5.0,
      "std": 2.5,
      "flag": "LOW",
      "directional_split": "no",
      "momentum": -13.0,
      "signal": "SELL",
      "verdict": "RATING LAGS RISK",
      "read": "Only 2 raters, both low; NGO/deforestation pressure mounting — agreed rating looks stale."
    },
    {
      "company": "Seatrium",
      "ticker": "5E2",
      "industry": "Offshore & Marine / Energy",
      "raw": {
        "msci": null,
        "lseg": 2.7,
        "sustainalytics_risk": 25.3,
        "sp_global": 42.0
      },
      "normalised": {
        "msci": null,
        "lseg": 54.0,
        "sustainalytics": 74.7,
        "sp_global": 42.0
      },
      "raters_count": 3,
      "mean": 56.9,
      "spread": 32.7,
      "std": 13.51,
      "flag": "MODERATE",
      "directional_split": "YES",
      "momentum": -15.0,
      "signal": "SELL",
      "verdict": "HIDDEN RISK",
      "read": "Raters split on the transition story; two corruption settlements dominate the news — avoid."
    },
    {
      "company": "ST Engineering",
      "ticker": "S63",
      "industry": "Industrials / Defence",
      "raw": {
        "msci": null,
        "lseg": 2.8,
        "sustainalytics_risk": null,
        "sp_global": 46.0
      },
      "normalised": {
        "msci": null,
        "lseg": 56.0,
        "sustainalytics": null,
        "sp_global": 46.0
      },
      "raters_count": 2,
      "mean": 51.0,
      "spread": 10.0,
      "std": 5.0,
      "flag": "LOW",
      "directional_split": "no",
      "momentum": 0.5,
      "signal": "HOLD",
      "verdict": "STABLE",
      "read": "Two raters broadly agree; Myanmar-supply concern offset by SBTi/TCFD climate pledges — neutral."
    },
    {
      "company": "Genting Singapore",
      "ticker": "G13",
      "industry": "Gaming / Hospitality",
      "raw": {
        "msci": "AA",
        "lseg": 2.9,
        "sustainalytics_risk": 17.0,
        "sp_global": 49.0
      },
      "normalised": {
        "msci": 83.3,
        "lseg": 58.0,
        "sustainalytics": 83.0,
        "sp_global": 49.0
      },
      "raters_count": 4,
      "mean": 68.3,
      "spread": 34.3,
      "std": 15.17,
      "flag": "MODERATE",
      "directional_split": "YES",
      "momentum": -3.5,
      "signal": "HOLD",
      "verdict": "CONTESTED",
      "read": "Raters split (MSCI AA vs S&P 49); AML fine vs S$6.8bn RWS 2.0 — watch for a catalyst."
    },
    {
      "company": "Jardine Cycle & Carriage",
      "ticker": "C07",
      "industry": "Conglomerate",
      "raw": {
        "msci": "A",
        "lseg": 2.9,
        "sustainalytics_risk": null,
        "sp_global": 56.0
      },
      "normalised": {
        "msci": 66.7,
        "lseg": 58.0,
        "sustainalytics": null,
        "sp_global": 56.0
      },
      "raters_count": 3,
      "mean": 60.2,
      "spread": 10.7,
      "std": 4.63,
      "flag": "LOW",
      "directional_split": "YES",
      "momentum": -25.5,
      "signal": "SELL",
      "verdict": "RATING LAGS RISK",
      "read": "Raters agree ~mid; sovereign-fund exclusion & UN complaints unpriced by raters — downgrade risk."
    },
    {
      "company": "CapitaLand Integrated Commercial Trust",
      "ticker": "C38U",
      "industry": "REIT",
      "raw": {
        "msci": "AA",
        "lseg": 2.5,
        "sustainalytics_risk": 8.4,
        "sp_global": 41.0
      },
      "normalised": {
        "msci": 83.3,
        "lseg": 50.0,
        "sustainalytics": 91.6,
        "sp_global": 41.0
      },
      "raters_count": 4,
      "mean": 66.5,
      "spread": 50.6,
      "std": 21.42,
      "flag": "HIGH",
      "directional_split": "YES",
      "momentum": 13.5,
      "signal": "BUY",
      "verdict": "DARK HORSE",
      "read": "MSCI/Susta rate it a leader, S&P/LSEG mid; green-bond momentum positive — hidden winner."
    },
    {
      "company": "CapitaLand Ascendas REIT",
      "ticker": "A17U",
      "industry": "REIT",
      "raw": {
        "msci": "AA",
        "lseg": 2.1,
        "sustainalytics_risk": null,
        "sp_global": 40.0
      },
      "normalised": {
        "msci": 83.3,
        "lseg": 42.0,
        "sustainalytics": null,
        "sp_global": 40.0
      },
      "raters_count": 3,
      "mean": 55.1,
      "spread": 43.3,
      "std": 19.97,
      "flag": "HIGH",
      "directional_split": "YES",
      "momentum": 8.0,
      "signal": "BUY",
      "verdict": "DARK HORSE",
      "read": "Wide MSCI-vs-S&P gap; steady green-finance + science-based targets — un-priced upside."
    },
    {
      "company": "Mapletree Logistics Trust",
      "ticker": "M44U",
      "industry": "REIT",
      "raw": {
        "msci": null,
        "lseg": 2.3,
        "sustainalytics_risk": 11.1,
        "sp_global": 44.0
      },
      "normalised": {
        "msci": null,
        "lseg": 46.0,
        "sustainalytics": 88.9,
        "sp_global": 44.0
      },
      "raters_count": 3,
      "mean": 59.6,
      "spread": 44.9,
      "std": 20.71,
      "flag": "HIGH",
      "directional_split": "YES",
      "momentum": 7.0,
      "signal": "BUY",
      "verdict": "DARK HORSE",
      "read": "Susta low-risk vs S&P mid; maiden green bond + 2030 carbon-neutral target — dark horse."
    },
    {
      "company": "Frasers Centrepoint Trust",
      "ticker": "J69U",
      "industry": "REIT",
      "raw": {
        "msci": "AA",
        "lseg": 1.8,
        "sustainalytics_risk": 9.9,
        "sp_global": 50.0
      },
      "normalised": {
        "msci": 83.3,
        "lseg": 36.0,
        "sustainalytics": 90.1,
        "sp_global": 50.0
      },
      "raters_count": 4,
      "mean": 64.9,
      "spread": 54.1,
      "std": 22.54,
      "flag": "HIGH",
      "directional_split": "YES",
      "momentum": 12.0,
      "signal": "BUY",
      "verdict": "DARK HORSE",
      "read": "Widest split (MSCI AA vs LSEG 1.8); 5-yr GRESB 5-Star + green loans — top dark horse."
    },
    {
      "company": "NetLink NBN Trust",
      "ticker": "CJLU",
      "industry": "Infrastructure",
      "raw": {
        "msci": null,
        "lseg": 2.5,
        "sustainalytics_risk": null,
        "sp_global": 42.0
      },
      "normalised": {
        "msci": null,
        "lseg": 50.0,
        "sustainalytics": null,
        "sp_global": 42.0
      },
      "raters_count": 2,
      "mean": 46.0,
      "spread": 8.0,
      "std": 4.0,
      "flag": "LOW",
      "directional_split": "no",
      "momentum": -3.5,
      "signal": "HOLD",
      "verdict": "STABLE",
      "read": "Two raters agree; recurring third-party cable outages vs SLB financing — flat."
    },
    {
      "company": "Raffles Medical Group",
      "ticker": "BSL",
      "industry": "Healthcare",
      "raw": {
        "msci": null,
        "lseg": 2.3,
        "sustainalytics_risk": null,
        "sp_global": 33.0
      },
      "normalised": {
        "msci": null,
        "lseg": 46.0,
        "sustainalytics": null,
        "sp_global": 33.0
      },
      "raters_count": 2,
      "mean": 39.5,
      "spread": 13.0,
      "std": 6.5,
      "flag": "LOW",
      "directional_split": "no",
      "momentum": 8.0,
      "signal": "BUY",
      "verdict": "CONSENSUS RISE",
      "read": "Raters agree low-mid; China healthcare partnerships lifting the news — likely upgrade."
    },
    {
      "company": "Sheng Siong Group",
      "ticker": "OV8",
      "industry": "Consumer staples / Retail",
      "raw": {
        "msci": null,
        "lseg": 2.2,
        "sustainalytics_risk": null,
        "sp_global": 28.0
      },
      "normalised": {
        "msci": null,
        "lseg": 44.0,
        "sustainalytics": null,
        "sp_global": 28.0
      },
      "raters_count": 2,
      "mean": 36.0,
      "spread": 16.0,
      "std": 8.0,
      "flag": "LOW",
      "directional_split": "no",
      "momentum": 3.0,
      "signal": "HOLD",
      "verdict": "STABLE",
      "read": "Raters agree low; routine disclosures only — nothing actionable yet."
    },
    {
      "company": "DBS Group",
      "ticker": "D05",
      "industry": "Bank",
      "raw": {
        "msci": null,
        "lseg": 3.3,
        "sustainalytics_risk": 20.2,
        "sp_global": 48.0
      },
      "normalised": {
        "msci": null,
        "lseg": 66.0,
        "sustainalytics": 79.8,
        "sp_global": 48.0
      },
      "raters_count": 3,
      "mean": 64.6,
      "spread": 31.8,
      "std": 13.02,
      "flag": "MODERATE",
      "directional_split": "YES",
      "momentum": -24.0,
      "signal": "SELL",
      "verdict": "HIDDEN RISK",
      "read": "Susta benign vs S&P mid; repeated MAS penalties + coal criticism — raters lag the risk."
    },
    {
      "company": "OCBC",
      "ticker": "O39",
      "industry": "Bank",
      "raw": {
        "msci": null,
        "lseg": 3.0,
        "sustainalytics_risk": null,
        "sp_global": 42.0
      },
      "normalised": {
        "msci": null,
        "lseg": 60.0,
        "sustainalytics": null,
        "sp_global": 42.0
      },
      "raters_count": 2,
      "mean": 51.0,
      "spread": 18.0,
      "std": 9.0,
      "flag": "LOW",
      "directional_split": "YES",
      "momentum": -16.5,
      "signal": "SELL",
      "verdict": "RATING LAGS RISK",
      "read": "Two raters straddle the mean; AML + Great Eastern delisting saga — downgrade watch."
    },
    {
      "company": "United Overseas Bank",
      "ticker": "U11",
      "industry": "Bank",
      "raw": {
        "msci": null,
        "lseg": 2.8,
        "sustainalytics_risk": 14.8,
        "sp_global": 55.0
      },
      "normalised": {
        "msci": null,
        "lseg": 56.0,
        "sustainalytics": 85.2,
        "sp_global": 55.0
      },
      "raters_count": 3,
      "mean": 65.4,
      "spread": 30.2,
      "std": 14.01,
      "flag": "MODERATE",
      "directional_split": "YES",
      "momentum": -11.5,
      "signal": "SELL",
      "verdict": "HIDDEN RISK",
      "read": "Susta low-risk vs S&P mid; S$5.6m AML penalty + Myanmar/coal flags — hidden risk."
    },
    {
      "company": "Singtel",
      "ticker": "Z74",
      "industry": "Telecom",
      "raw": {
        "msci": null,
        "lseg": 3.0,
        "sustainalytics_risk": null,
        "sp_global": 56.0
      },
      "normalised": {
        "msci": null,
        "lseg": 60.0,
        "sustainalytics": null,
        "sp_global": 56.0
      },
      "raters_count": 2,
      "mean": 58.0,
      "spread": 4.0,
      "std": 2.0,
      "flag": "LOW",
      "directional_split": "YES",
      "momentum": -8.0,
      "signal": "SELL",
      "verdict": "RATING LAGS RISK",
      "read": "Raters agree; Optus emergency-call deaths & data-breach fallout unpriced — downgrade risk."
    },
    {
      "company": "Singapore Airlines",
      "ticker": "C6L",
      "industry": "Airline",
      "raw": {
        "msci": null,
        "lseg": 3.0,
        "sustainalytics_risk": null,
        "sp_global": 53.0
      },
      "normalised": {
        "msci": null,
        "lseg": 60.0,
        "sustainalytics": null,
        "sp_global": 53.0
      },
      "raters_count": 2,
      "mean": 56.5,
      "spread": 7.0,
      "std": 3.5,
      "flag": "LOW",
      "directional_split": "YES",
      "momentum": -9.0,
      "signal": "SELL",
      "verdict": "RATING LAGS RISK",
      "read": "Raters agree ~mid; fatal SQ321 turbulence accident dominates — rating likely to lag down."
    },
    {
      "company": "Sembcorp Industries",
      "ticker": "U96",
      "industry": "Energy / Utilities",
      "raw": {
        "msci": null,
        "lseg": 2.3,
        "sustainalytics_risk": null,
        "sp_global": 45.0
      },
      "normalised": {
        "msci": null,
        "lseg": 46.0,
        "sustainalytics": null,
        "sp_global": 45.0
      },
      "raters_count": 2,
      "mean": 45.5,
      "spread": 1.0,
      "std": 0.5,
      "flag": "LOW",
      "directional_split": "no",
      "momentum": 14.5,
      "signal": "BUY",
      "verdict": "CONSENSUS RISE",
      "read": "Two raters agree mid; strong coal-to-green execution (divestment, renewables) — likely upgrade."
    },
    {
      "company": "Thai Beverage",
      "ticker": "Y92",
      "industry": "Consumer / Alcohol",
      "raw": {
        "msci": null,
        "lseg": 3.2,
        "sustainalytics_risk": null,
        "sp_global": 92.0
      },
      "normalised": {
        "msci": null,
        "lseg": 64.0,
        "sustainalytics": null,
        "sp_global": 92.0
      },
      "raters_count": 2,
      "mean": 78.0,
      "spread": 28.0,
      "std": 14.0,
      "flag": "MODERATE",
      "directional_split": "no",
      "momentum": 11.0,
      "signal": "BUY",
      "verdict": "DARK HORSE",
      "read": "Only 2 raters but wide (S&P 92 vs LSEG 64); DJSI World + SBTi — low-confidence dark horse."
    }
  ]
};
