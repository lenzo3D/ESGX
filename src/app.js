/* ============================================================
   ESG MOMENTUM ENGINE 2.0 — Consensus Gap Scanner
   Vanilla JS. No build step. Data inlined in src/data.js.
   ============================================================ */
(function () {
  "use strict";

  const DATA = window.ESG_DATA;
  const COMPANIES = DATA.companies;
  const META = DATA.meta;

  /* ---------- verdict colour language (single source of truth) ---------- */
  const VERDICTS = {
    "DARK HORSE":       { c: "#1fbf4f", t: "#062b12", label: "Dark Horse",       blurb: "Raters split · news improving → mispriced upside, buy early", icon: "rocket" },
    "CONSENSUS RISE":   { c: "#2f81d8", t: "#ffffff", label: "Consensus Rise",   blurb: "Raters agree · news improving → likely upgrade",             icon: "trend-up" },
    "CONTESTED":        { c: "#e3c11f", t: "#2b2400", label: "Contested",        blurb: "Raters split · momentum on hold → await a catalyst",         icon: "scale" },
    "STABLE":           { c: "#7d828c", t: "#ffffff", label: "Stable",           blurb: "Raters agree · momentum flat → neutral",                     icon: "minus" },
    "RATING LAGS RISK": { c: "#f0791e", t: "#2b1600", label: "Rating Lags Risk", blurb: "Raters agree · news deteriorating → downgrade early-warning", icon: "alert" },
    "HIDDEN RISK":      { c: "#d83333", t: "#ffffff", label: "Hidden Risk",      blurb: "Raters split · news deteriorating → avoid / short",          icon: "shield" },
  };
  const VERDICT_ORDER = ["DARK HORSE", "CONSENSUS RISE", "CONTESTED", "STABLE", "RATING LAGS RISK", "HIDDEN RISK"];

  const SHORT = {
    "Wilmar International": "Wilmar", "Golden Agri-Resources": "GoldenAgri", "Seatrium": "Seatrium",
    "ST Engineering": "ST Eng", "Genting Singapore": "Genting", "Jardine Cycle & Carriage": "JC&C",
    "CapitaLand Integrated Commercial Trust": "CICT", "CapitaLand Ascendas REIT": "Ascendas",
    "Mapletree Logistics Trust": "Mapletree", "Frasers Centrepoint Trust": "Frasers",
    "NetLink NBN Trust": "NetLink", "Raffles Medical Group": "Raffles", "Sheng Siong Group": "ShengSiong",
    "DBS Group": "DBS", "OCBC": "OCBC", "United Overseas Bank": "UOB", "Singtel": "Singtel",
    "Singapore Airlines": "SIA", "Sembcorp Industries": "Sembcorp", "Thai Beverage": "ThaiBev",
  };

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const byTicker = (t) => COMPANIES.find((c) => c.ticker === t);
  const short = (c) => SHORT[c.company] || c.company;

  function hexToRgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function verdictVars(v) {
    const m = VERDICTS[v];
    return `--vc:${m.c};--vc-t:${m.t};`;
  }
  const fmtMom = (m) => (m > 0 ? "+" : "") + m.toFixed(1);
  const momColor = (m) => (m > 1 ? "var(--up)" : m < -1 ? "var(--down)" : "var(--text-2)");
  const sigColor = (s) => (s === "BUY" ? "var(--up)" : s === "SELL" ? "var(--down)" : "var(--v-contested)");
  const flagColor = (f) => (f === "HIGH" ? "var(--v-dark-horse)" : f === "MODERATE" ? "var(--v-contested)" : "var(--text-3)");

  /* ============================================================
     THE ENGINE — everything below is COMPUTED in-browser from the
     raw rater inputs + momentum. Nothing here is hand-labelled.
     (Verified to reproduce the curated dataset; see verifyEngine.)
     ============================================================ */
  // MSCI 7-grade scale as exact fractions (CCC..AAA → 0..100 in steps of 100/6)
  const MSCI_SCALE = { CCC: 0, B: 100 / 6, BB: 200 / 6, BBB: 50, A: 400 / 6, AA: 500 / 6, AAA: 100 };
  const r1 = (x) => Number(x.toFixed(1));
  const r2 = (x) => Number(x.toFixed(2));

  // Step 1 — put four raters on one 0–100 scale (higher = better).
  // Kept at full precision for the maths; rounded only at display time.
  function normaliseRaters(raw) {
    return {
      msci:           raw.msci == null ? null : MSCI_SCALE[raw.msci],
      lseg:           raw.lseg == null ? null : raw.lseg * 20,              // LSEG 0–5 ×20
      sustainalytics: raw.sustainalytics_risk == null ? null : 100 - raw.sustainalytics_risk, // risk → score
      sp_global:      raw.sp_global == null ? null : raw.sp_global,         // 0–100 as-is
    };
  }

  // Step 2 — disagreement, momentum signal, and the verdict (2×2)
  const VERDICT_MATRIX = {
    disagree: { BUY: "DARK HORSE",     HOLD: "CONTESTED", SELL: "HIDDEN RISK" },
    agree:    { BUY: "CONSENSUS RISE", HOLD: "STABLE",    SELL: "RATING LAGS RISK" },
  };
  function computeMetrics(c) {
    const n = normaliseRaters(c.raw);
    const vals = Object.values(n).filter((v) => v != null);
    const count = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / count;
    const spread = Math.max(...vals) - Math.min(...vals);
    const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / count);
    const flag = spread >= 40 ? "HIGH" : spread >= 20 ? "MODERATE" : "LOW";
    const signal = c.momentum > 5 ? "BUY" : c.momentum < -5 ? "SELL" : "HOLD";
    const disagree = spread >= 20;                       // the 20-line = agree/disagree boundary
    const verdict = VERDICT_MATRIX[disagree ? "disagree" : "agree"][signal];
    const straddle = vals.some((v) => v > META.sample_mean) && vals.some((v) => v < META.sample_mean);
    return {
      normalised: n, raters_count: count, mean: r1(mean), spread: r1(spread), std: r2(std),
      flag, signal, verdict, directional_split: straddle ? "YES" : "no",
    };
  }

  // Recompute every company from its raw inputs; warn if any field
  // diverges from the curated dataset (the dataset acts as the test oracle).
  function runEngine() {
    const diffs = [];
    COMPANIES.forEach((c) => {
      const got = computeMetrics(c);
      ["raters_count", "mean", "spread", "std", "flag", "signal", "verdict", "directional_split"].forEach((k) => {
        if (String(c[k]) !== String(got[k])) diffs.push(`${c.ticker}.${k}: dataset=${c[k]} computed=${got[k]}`);
      });
      Object.assign(c, got); // app now renders the computed values
    });
    window.__esgEngineDiffs = diffs;
    if (diffs.length) console.warn("[engine] divergences from dataset:", diffs);
    else console.info("[engine] all 20 names reproduced from raw inputs ✓");
    return diffs;
  }

  const ICONS = {
    rocket: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.7a1.9 1.9 0 0 0-3 .7ZM12 15l-3-3 1-3c1.5-4 4-6 9-6 0 5-2 7.5-6 9l-3 1 2 2Z"/><circle cx="15" cy="9" r="1.3" fill="#06121a"/>',
    "trend-up": '<path d="M3 17l6-6 4 4 8-8"/><path d="M16 7h5v5"/>',
    scale: '<path d="M12 3v18M6 21h12M5 7l-3 6h6l-3-6Zm14 0-3 6h6l-3-6ZM5 7h14"/>',
    minus: '<path d="M5 12h14"/>',
    alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
    shield: '<path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z"/><path d="M9.5 12l1.8 1.8L15 10" stroke="#06121a"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

  /* ---------- state ---------- */
  const state = {
    view: "scanner",
    selected: "J69U", // Frasers — top dark horse, opens with the hero story
    sort: "spread",
    filter: null, // verdict key or null
    search: "",
  };
  const SORTS = ["spread", "momentum", "verdict", "name"];
  const SORT_LABELS = { spread: "Spread", momentum: "Momentum", verdict: "Verdict", name: "Name" };

  /* ============================================================
     QUADRANT GEOMETRY
     ============================================================ */
  const VB = { w: 980, h: 600 };
  const M = { l: 66, r: 30, t: 30, b: 56 };
  const PX0 = M.l, PX1 = VB.w - M.r, PY0 = M.t, PY1 = VB.h - M.b;
  const XDOM = [0, 60];   // spread
  const YDOM = [-31, 20]; // momentum (headroom so extreme dots clear corner captions)
  const sx = (v) => PX0 + ((v - XDOM[0]) / (XDOM[1] - XDOM[0])) * (PX1 - PX0);
  const sy = (v) => PY1 - ((v - YDOM[0]) / (YDOM[1] - YDOM[0])) * (PY1 - PY0);

  function placeLabels(nodes) {
    // greedy de-overlap, per side
    const sides = { L: [], R: [] };
    nodes.forEach((n) => {
      n.side = n.cx > PX1 - 150 ? "L" : "R";
      sides[n.side].push(n);
    });
    Object.values(sides).forEach((arr) => {
      arr.sort((a, b) => a.cy - b.cy);
      const MIN = 14;
      for (let i = 1; i < arr.length; i++) {
        if (arr[i].ly - arr[i - 1].ly < MIN && Math.abs(arr[i].cx - arr[i - 1].cx) < 92) {
          arr[i].ly = arr[i - 1].ly + MIN;
        }
      }
    });
  }

  function buildQuadrant() {
    const wrap = $("#quad-wrap");
    const W = wrap.clientWidth, H = wrap.clientHeight;
    const svg = $("#quad-svg");
    svg.setAttribute("viewBox", `0 0 ${VB.w} ${VB.h}`);
    svg.style.height = Math.max(H, 360) + "px";

    const xGreen = sx(20), xTop = sy(5), xBot = sy(-5);
    let s = "";

    // shaded corners (match reference SVG semantics)
    s += `<rect class="q-shade-green" x="${xGreen}" y="${PY0}" width="${PX1 - xGreen}" height="${xTop - PY0}"/>`;
    s += `<rect class="q-shade-amber" x="${xGreen}" y="${xBot}" width="${PX1 - xGreen}" height="${PY1 - xBot}"/>`;

    // gridlines at divider spreads + momentum guides
    const divLabels = { 20: "← agree · disagree →", 40: "HIGH conviction →" };
    [20, 40].forEach((v) => {
      const x = sx(v);
      s += `<line class="q-div" x1="${x}" y1="${PY0}" x2="${x}" y2="${PY1}"/>`;
      s += `<text class="q-div-label" x="${x + 4}" y="${PY0 + 10}">${divLabels[v]}</text>`;
    });
    s += `<line class="q-grid" x1="${PX0}" y1="${sy(5)}" x2="${PX1}" y2="${sy(5)}"/>`;
    s += `<line class="q-grid" x1="${PX0}" y1="${sy(-5)}" x2="${PX1}" y2="${sy(-5)}"/>`;
    s += `<line class="q-grid" x1="${PX0}" y1="${sy(0)}" x2="${PX1}" y2="${sy(0)}" style="stroke:#3a445c;stroke-dasharray:none;stroke-width:1"/>`;

    // axes
    s += `<line class="q-axis" x1="${PX0}" y1="${PY0}" x2="${PX0}" y2="${PY1}"/>`;
    s += `<line class="q-axis" x1="${PX0}" y1="${PY1}" x2="${PX1}" y2="${PY1}"/>`;

    // x ticks
    [0, 20, 40, 60].forEach((v) => {
      const x = sx(v);
      s += `<text class="q-tick" x="${x}" y="${PY1 + 18}" text-anchor="middle">${v}</text>`;
    });
    // y ticks
    [-25, -15, -5, 5, 15].forEach((v) => {
      const y = sy(v);
      s += `<text class="q-tick" x="${PX0 - 10}" y="${y + 3}" text-anchor="end">${v > 0 ? "+" + v : v}</text>`;
    });
    // flag band labels under x axis
    s += `<text class="q-tick" x="${sx(10)}" y="${PY1 + 36}" text-anchor="middle" style="opacity:.7">LOW</text>`;
    s += `<text class="q-tick" x="${sx(30)}" y="${PY1 + 36}" text-anchor="middle" style="opacity:.7">MODERATE</text>`;
    s += `<text class="q-tick" x="${sx(50)}" y="${PY1 + 36}" text-anchor="middle" style="opacity:.7">HIGH</text>`;

    // axis titles
    s += `<text class="q-axis-label" x="${(PX0 + PX1) / 2}" y="${VB.h - 6}" text-anchor="middle">RATER DISAGREEMENT  —  normalised 0–100 spread  →</text>`;
    s += `<text class="q-axis-label" x="18" y="${(PY0 + PY1) / 2}" text-anchor="middle" transform="rotate(-90 18 ${(PY0 + PY1) / 2})">NEWS MOMENTUM  →</text>`;

    // corner captions
    s += `<text class="q-corner-label" x="${PX1 - 6}" y="${PY0 + 16}" text-anchor="end" fill="${VERDICTS["DARK HORSE"].c}">DARK HORSES</text>`;
    s += `<text class="q-corner-sub" x="${PX1 - 6}" y="${PY0 + 30}" text-anchor="end" fill="${VERDICTS["DARK HORSE"].c}">raters split · news improving → buy early</text>`;
    s += `<text class="q-corner-label" x="${PX1 - 6}" y="${PY1 - 18}" text-anchor="end" fill="${VERDICTS["HIDDEN RISK"].c}">HIDDEN RISKS</text>`;
    s += `<text class="q-corner-sub" x="${PX1 - 6}" y="${PY1 - 6}" text-anchor="end" fill="${VERDICTS["HIDDEN RISK"].c}">raters split · news deteriorating → avoid / short</text>`;
    s += `<text class="q-corner-label" x="${PX0 + 8}" y="${PY1 - 18}" text-anchor="start" fill="${VERDICTS["RATING LAGS RISK"].c}" style="font-size:10px">RATING LAGS RISK</text>`;
    s += `<text class="q-corner-sub" x="${PX0 + 8}" y="${PY1 - 6}" text-anchor="start" fill="${VERDICTS["RATING LAGS RISK"].c}">raters agree · downgrade warning</text>`;
    s += `<text class="q-corner-label" x="${PX0 + 8}" y="${PY0 + 16}" text-anchor="start" fill="${VERDICTS["CONSENSUS RISE"].c}" style="font-size:10px">CONSENSUS RISE</text>`;

    // nodes
    const nodes = COMPANIES.map((c) => ({
      c, cx: sx(c.spread), cy: sy(c.momentum), ly: sy(c.momentum) + 3.5,
    }));
    placeLabels(nodes);

    nodes.forEach((n) => {
      const c = n.c, col = VERDICTS[c.verdict].c;
      const dimmed = isDimmed(c) ? " dim" : "";
      const seld = c.ticker === state.selected ? " sel" : "";
      const lx = n.side === "R" ? n.cx + 11 : n.cx - 11;
      const anc = n.side === "R" ? "start" : "end";
      s += `<g class="q-node${dimmed}${seld}" data-ticker="${c.ticker}">`;
      s += `<circle class="halo" cx="${n.cx}" cy="${n.cy}" r="14" fill="none" stroke="${col}" stroke-width="1.5" opacity="0" />`;
      s += `<circle class="q-dot" cx="${n.cx}" cy="${n.cy}" r="7" fill="${col}" stroke="#0a0c12" stroke-width="2"/>`;
      s += `<text class="q-label" x="${lx}" y="${n.ly}" text-anchor="${anc}">${short(c)}</text>`;
      s += `</g>`;
    });

    svg.innerHTML = s;
    svg.querySelectorAll(".q-node").forEach((g) => {
      const t = g.dataset.ticker;
      g.addEventListener("mouseenter", (e) => showTip(t, g));
      g.addEventListener("mousemove", positionTip);
      g.addEventListener("mouseleave", hideTip);
      g.addEventListener("click", () => select(t));
    });

    // empty-state overlay when nothing matches the search/filter (audit fix)
    const visible = nodes.filter((n) => !isDimmed(n.c)).length;
    let ov = $("#quad-empty");
    if (!visible) {
      if (!ov) {
        ov = document.createElement("div");
        ov.id = "quad-empty";
        ov.className = "quad-empty";
        ov.style.cssText = "position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.55)";
        $("#quad-wrap").appendChild(ov);
      }
      const reason = state.search ? `No match for “${state.search}”` : "No companies in this filter";
      ov.innerHTML = `<div><b>${reason}</b>Clear the search or filter to plot all ${COMPANIES.length} names.</div>`;
    } else if (ov) {
      ov.remove();
    }
  }

  function isDimmed(c) {
    if (state.filter && c.verdict !== state.filter) return true;
    if (state.search && !(`${c.company} ${c.ticker}`.toLowerCase().includes(state.search))) return true;
    return false;
  }

  /* ---------- quadrant tooltip ---------- */
  const tip = $("#q-tip");
  let tipNode = null;
  function showTip(t, g) {
    const c = byTicker(t);
    tipNode = g;
    const v = VERDICTS[c.verdict];
    tip.style.cssText += verdictVars(c.verdict);
    tip.innerHTML =
      `<div class="tt-top"><b>${c.company}</b><span class="tk">${c.ticker}</span></div>` +
      `<span class="vbadge"><span class="bdot"></span>${v.label}</span>` +
      `<div class="tt-read" style="margin-top:6px">${c.read}</div>` +
      `<div class="tt-stats">` +
        `<div>Spread<b style="color:${flagColor(c.flag)}">${c.spread.toFixed(1)}</b></div>` +
        `<div>Momentum<b style="color:${momColor(c.momentum)}">${fmtMom(c.momentum)}</b></div>` +
        `<div>Signal<b style="color:${sigColor(c.signal)}">${c.signal}</b></div>` +
      `</div>`;
    tip.classList.add("show");
    const dot = g.querySelector(".q-dot");
    dot.setAttribute("r", "9");
  }
  function positionTip(e) {
    const wrap = $("#quad-wrap").getBoundingClientRect();
    let x = e.clientX - wrap.left + 16;
    let y = e.clientY - wrap.top + 14;
    if (x + 256 > wrap.width) x = e.clientX - wrap.left - 256 - 8;
    if (y + 130 > wrap.height) y = wrap.height - 134;
    tip.style.left = Math.max(6, x) + "px";
    tip.style.top = Math.max(6, y) + "px";
  }
  function hideTip() {
    tip.classList.remove("show");
    if (tipNode) { const d = tipNode.querySelector(".q-dot"); if (d && !tipNode.classList.contains("sel")) d.setAttribute("r", "7"); }
    tipNode = null;
  }

  /* ============================================================
     WATCHLIST
     ============================================================ */
  function sortedCompanies() {
    const arr = COMPANIES.slice();
    if (state.sort === "spread") arr.sort((a, b) => b.spread - a.spread);
    else if (state.sort === "momentum") arr.sort((a, b) => b.momentum - a.momentum);
    else if (state.sort === "name") arr.sort((a, b) => a.company.localeCompare(b.company));
    else if (state.sort === "verdict") arr.sort((a, b) => VERDICT_ORDER.indexOf(a.verdict) - VERDICT_ORDER.indexOf(b.verdict) || b.spread - a.spread);
    return arr;
  }

  function renderFilters() {
    const counts = {};
    COMPANIES.forEach((c) => (counts[c.verdict] = (counts[c.verdict] || 0) + 1));
    const row = $("#filter-row");
    let html = `<button class="chip ${state.filter === null ? "active" : ""}" data-filter="">All <span style="color:var(--text-3)">${COMPANIES.length}</span></button>`;
    VERDICT_ORDER.forEach((v) => {
      if (!counts[v]) return;
      html += `<button class="chip ${state.filter === v ? "active" : ""}" data-filter="${v}"><span class="cdot" style="background:${VERDICTS[v].c}"></span>${VERDICTS[v].label} ${counts[v]}</button>`;
    });
    row.innerHTML = html;
    row.querySelectorAll(".chip").forEach((b) =>
      b.addEventListener("click", () => { state.filter = b.dataset.filter || null; renderAll(); })
    );
  }

  function renderWatchlist() {
    const list = $("#watchlist");
    const rows = sortedCompanies().filter((c) => !isDimmed(c));
    $("#wl-count").textContent = rows.length === COMPANIES.length ? `${rows.length}` : `${rows.length}/${COMPANIES.length}`;
    if (!rows.length) {
      const reason = state.search ? `No match for “${state.search}”` : "No companies in this filter";
      list.innerHTML = `<div class="wl-empty"><b>${reason}</b>Clear the search or filter to see all ${COMPANIES.length} names.</div>`;
      return;
    }
    list.innerHTML = rows.map((c) => {
      const col = VERDICTS[c.verdict].c;
      const sel = c.ticker === state.selected ? " sel" : "";
      return `<div class="wl-row${sel}" data-ticker="${c.ticker}" style="--vc:${col}">
        <div class="wl-name"><b>${c.ticker}</b><span>${c.company}</span></div>
        <div class="wl-spread"><b style="color:${flagColor(c.flag)}">${c.spread.toFixed(1)}</b><small style="color:${flagColor(c.flag)}">${c.flag}</small></div>
        <div class="wl-mom num" style="color:${momColor(c.momentum)}">${fmtMom(c.momentum)}</div>
      </div>`;
    }).join("");
    list.querySelectorAll(".wl-row").forEach((r) =>
      r.addEventListener("click", () => select(r.dataset.ticker))
    );
  }

  /* ============================================================
     DETAIL / DRILL-DOWN
     ============================================================ */
  const RATERS = [
    { key: "msci", name: "MSCI", rawFmt: (c) => (c.raw.msci == null ? null : c.raw.msci), unit: "rating" },
    { key: "lseg", name: "LSEG", rawFmt: (c) => (c.raw.lseg == null ? null : c.raw.lseg.toFixed(1) + " / 5"), unit: "" },
    { key: "sustainalytics", name: "Sustainalytics", rawFmt: (c) => (c.raw.sustainalytics_risk == null ? null : c.raw.sustainalytics_risk.toFixed(1) + " risk"), unit: "" },
    { key: "sp_global", name: "S&P Global", rawFmt: (c) => (c.raw.sp_global == null ? null : c.raw.sp_global.toFixed(0) + " / 100"), unit: "" },
  ];

  function renderDetail() {
    const c = byTicker(state.selected);
    const el = $("#detail");
    if (!c) { el.innerHTML = `<div class="detail-empty">Select a company</div>`; return; }
    const v = VERDICTS[c.verdict];
    el.style.cssText = verdictVars(c.verdict);
    $("#detail-asof").textContent = "as of " + META.ratings_asof;

    // rater bars
    const ratedVals = RATERS.map((r) => c.normalised[r.key]).filter((x) => x != null);
    const minV = Math.min(...ratedVals), maxV = Math.max(...ratedVals);
    let bars = "";
    RATERS.forEach((r) => {
      const norm = c.normalised[r.key];
      const raw = r.rawFmt(c);
      if (norm == null) {
        bars += `<div class="rater na"><div class="rt-top"><span class="rt-name">${r.name}</span><span class="rt-na-tag">not rated</span><span class="rt-norm">—</span></div><div class="rt-track"></div></div>`;
      } else {
        const barCol = norm >= 66 ? "var(--up)" : norm >= 45 ? "var(--v-contested)" : "var(--down)";
        bars += `<div class="rater"><div class="rt-top"><span class="rt-name">${r.name}</span><span class="rt-raw">${raw}</span><span class="rt-norm" style="color:${barCol}">${norm.toFixed(1)}</span></div>
          <div class="rt-track"><div class="rt-fill" style="width:${norm}%;background:${barCol}"></div></div></div>`;
      }
    });

    // consensus range strip (disagreement made visible)
    const dotsOnLine = RATERS.map((r) => c.normalised[r.key]).filter((x) => x != null);
    let strip = `<div class="consensus-scale"><div class="cs-line"></div>`;
    strip += `<div class="cs-mean" style="left:${c.mean}%"></div>`;
    strip += `<div class="cs-label" style="left:${c.mean}%;top:16px;color:var(--text-2)">μ ${c.mean.toFixed(0)}</div>`;
    ["0", "50", "100"].forEach((t) => { strip += `<div class="cs-label" style="left:${t}%">${t}</div>`; });
    dotsOnLine.forEach((val) => {
      strip += `<div class="cs-tick" style="left:${val}%;background:${val >= 66 ? "var(--up)" : val >= 45 ? "var(--v-contested)" : "var(--down)"}"></div>`;
    });
    strip += `</div>`;

    const cov = c.raters_count <= 2
      ? `<div class="cov-warn">${icon("alert")}<span><b>Low coverage</b> — only ${c.raters_count} of 4 raters. Spread &amp; verdict are lower-confidence.</span></div>`
      : "";

    el.innerHTML = `
      <div class="d-hero">
        <div class="dh-top">
          <div style="flex:1;min-width:0">
            <h1>${c.company}</h1>
            <div class="dh-sub">${c.ticker} · SGX</div>
            <div class="dh-ind">${c.industry}</div>
          </div>
        </div>
        ${cov}
        <div class="verdict-banner">
          <div class="vb-icon">${icon(v.icon)}</div>
          <div class="vb-txt"><b>${v.label.toUpperCase()}</b><span>${v.blurb}</span></div>
        </div>
        <div class="signal-strip">
          <div class="sig-cell"><div class="sl">Disagreement</div><div class="sv" style="color:${flagColor(c.flag)}">${c.flag}</div></div>
          <div class="sig-cell"><div class="sl">Momentum</div><div class="sv" style="color:${momColor(c.momentum)}">${fmtMom(c.momentum)}</div></div>
          <div class="sig-cell"><div class="sl">Signal</div><div class="sv" style="color:${sigColor(c.signal)}">${c.signal}</div></div>
        </div>
      </div>

      <div class="d-section">
        <h3>PM Read</h3>
        <div class="read-quote"><span class="qm">“</span>${c.read}<span class="qm">”</span></div>
      </div>

      <div class="d-section">
        <h3>Rater Consensus <span class="sub">${c.raters_count} of 4 raters · normalised 0–100</span></h3>
        ${bars}
        ${strip}
      </div>

      <div class="d-section">
        <h3>Signal Detail <span class="sub">computed in-browser from raw inputs</span></h3>
        <div class="stat-grid">
          <div class="stat"><div class="st-l">Spread (disagreement)</div><div class="st-v" style="color:${flagColor(c.flag)}">${c.spread.toFixed(1)}</div></div>
          <div class="stat"><div class="st-l">Std deviation</div><div class="st-v">${c.std.toFixed(2)}</div></div>
          <div class="stat"><div class="st-l">Mean score</div><div class="st-v">${c.mean.toFixed(1)}</div></div>
          <div class="stat"><div class="st-l">Net momentum</div><div class="st-v" style="color:${momColor(c.momentum)}">${fmtMom(c.momentum)}</div></div>
          <div class="stat"><div class="st-l">Raters straddle μ</div><div class="st-v" style="color:${c.directional_split === "YES" ? "var(--v-contested)" : "var(--text-2)"}">${c.directional_split === "YES" ? "YES" : "no"}</div></div>
          <div class="stat"><div class="st-l">vs sample μ ${META.sample_mean}</div><div class="st-v" style="color:${momColor(c.mean - META.sample_mean)}">${(c.mean - META.sample_mean >= 0 ? "+" : "") + (c.mean - META.sample_mean).toFixed(1)}</div></div>
        </div>
      </div>`;
  }

  /* ---------- ticker header ---------- */
  function renderTicker() {
    const c = byTicker(state.selected);
    const h = $("#ticker-header");
    if (!c) { h.innerHTML = ""; return; }
    const v = VERDICTS[c.verdict];
    h.style.cssText = verdictVars(c.verdict);
    h.innerHTML =
      `<span class="sym">${c.ticker}</span>` +
      `<span class="tk">${c.company}</span>` +
      `<span class="vbadge"><span class="bdot"></span>${v.label}</span>` +
      `<span class="mom" style="color:${momColor(c.momentum)}">${fmtMom(c.momentum)}</span>` +
      `<span class="meta">spread ${c.spread.toFixed(1)} · ${c.flag}</span>`;
    h.onclick = () => { if (state.view !== "scanner") setView("scanner"); };
  }

  /* ============================================================
     SHORTLIST VIEW
     ============================================================ */
  function buildShortlist() {
    let view = $("#shortlist-view");
    if (!view) {
      view = document.createElement("div");
      view.id = "shortlist-view";
      view.className = "shortlist";
      view.style.display = "none";
      $("#workspace").after(view);
    }
    const darkHorses = COMPANIES.filter((c) => c.verdict === "DARK HORSE").sort((a, b) => b.momentum - a.momentum);
    const lags = COMPANIES.filter((c) => c.verdict === "RATING LAGS RISK").sort((a, b) => a.momentum - b.momentum);
    const hidden = COMPANIES.filter((c) => c.verdict === "HIDDEN RISK").sort((a, b) => a.momentum - b.momentum);

    const col = (title, sub, verdict, list, m1) => {
      const c = VERDICTS[verdict].c;
      const cards = list.length ? list.map((co, i) => `
        <div class="sl-card" data-ticker="${co.ticker}" style="--vc:${c}">
          <div class="sl-rank">${i + 1}</div>
          <div class="sl-body">
            <div class="slc-top"><b>${short(co)}</b><span class="tk">${co.ticker} · ${co.industry}</span></div>
            <div class="slc-read">${co.read}</div>
            <div class="sl-metrics">
              <div>Spread<br><b style="color:${flagColor(co.flag)}">${co.spread.toFixed(1)}</b></div>
              <div>Momentum<br><b style="color:${momColor(co.momentum)}">${fmtMom(co.momentum)}</b></div>
              <div>Mean<br><b>${co.mean.toFixed(1)}</b></div>
              <div>Raters<br><b>${co.raters_count}/4</b></div>
            </div>
          </div>
        </div>`).join("") : `<div class="sl-empty">No names in this bucket</div>`;
      return `<div class="sl-col" style="--vc:${c}">
        <div class="sl-col-head">
          <div class="slh-top"><h2>${title}</h2><span class="cnt">${list.length}</span></div>
          <p>${sub}</p>
        </div>${cards}</div>`;
    };

    view.innerHTML = `
      <div class="sl-intro">
        <h1>Shortlist — the actionable read</h1>
        <p>Where the four raters (${META.raters.join(", ")}) disagree, the official rating hasn't caught up to the news flow. These are the names that move first. Click any to inspect on the quadrant.</p>
      </div>
      <div class="sl-cols">
        ${col("Dark Horses", "Raters split · news improving → mispriced upside, accumulate early", "DARK HORSE", darkHorses)}
        ${col("Rating Lags Risk", "Raters agree · news deteriorating → downgrade early-warning", "RATING LAGS RISK", lags)}
        ${col("Hidden Risks", "Raters split · news deteriorating → avoid or short", "HIDDEN RISK", hidden)}
      </div>`;
    view.querySelectorAll(".sl-card").forEach((card) =>
      card.addEventListener("click", () => { state.selected = card.dataset.ticker; setView("scanner"); })
    );
  }

  /* ============================================================
     VIEW SWITCH + RENDER
     ============================================================ */
  function setView(v) {
    state.view = v;
    $("#workspace").style.display = v === "scanner" ? "grid" : "none";
    const sl = $("#shortlist-view");
    if (sl) sl.style.display = v === "shortlist" ? "flex" : "none";
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === v));
    if (v === "scanner") { requestAnimationFrame(buildQuadrant); }
    renderAll();
  }

  function select(t) {
    state.selected = t;
    renderTicker();
    renderDetail();
    renderWatchlist();
    // update quadrant selection without full rebuild
    document.querySelectorAll(".q-node").forEach((g) => {
      const on = g.dataset.ticker === t;
      g.classList.toggle("sel", on);
      const dot = g.querySelector(".q-dot");
      if (dot) dot.setAttribute("r", on ? "8.5" : "7");
    });
  }

  function renderAll() {
    renderFilters();
    renderWatchlist();
    renderTicker();
    renderDetail();
    if (state.view === "scanner") buildQuadrant();
    updateStatus();
  }

  /* ---------- status bar ---------- */
  function updateStatus() {
    const dh = COMPANIES.filter((c) => c.verdict === "DARK HORSE").length;
    const hr = COMPANIES.filter((c) => c.verdict === "HIDDEN RISK").length;
    const high = COMPANIES.filter((c) => c.flag === "HIGH").length;
    $("#sb-stats").innerHTML = `<b>${COMPANIES.length}</b> NAMES <span class="sb-sep">·</span> <b>${DATA.meta.raters.length}</b> RATERS <span class="sb-sep">·</span> μ <b>${META.sample_mean}</b> <span class="sb-sep">·</span> <span style="color:var(--up)">${dh} DARK HORSE</span> <span class="sb-sep">·</span> <span style="color:var(--down)">${hr} HIDDEN RISK</span> <span class="sb-sep">·</span> ${high} HIGH-SPREAD`;
  }
  function tick() {
    // Singapore is UTC+8 (no DST) — compute it honestly rather than show browser-local time
    const now = new Date();
    const sgt = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000);
    const p = (n) => String(n).padStart(2, "0");
    $("#sb-clock").textContent = `${p(sgt.getHours())}:${p(sgt.getMinutes())}:${p(sgt.getSeconds())} SGT`;
  }

  /* ---------- legend ---------- */
  function renderLegend() {
    $("#legend").innerHTML = VERDICT_ORDER
      .map((v) => `<span class="leg"><span class="ldot" style="background:${VERDICTS[v].c}"></span>${VERDICTS[v].label}</span>`)
      .join("");
  }

  /* ---------- methodology modal (audit: defuse the hard questions) ---------- */
  function openMethodology() {
    const cell = (v) => `<td class="vc-cell" style="color:${VERDICTS[v].c}">${VERDICTS[v].label}</td>`;
    $("#modal-root").innerHTML = `
      <div class="modal-overlay" id="meth-overlay">
        <div class="modal" role="dialog" aria-label="Methodology">
          <div class="modal-head"><h2>How the Consensus-Gap Scanner works</h2><button class="mh-close" id="meth-close" title="Close (Esc)">✕</button></div>
          <div class="modal-body">
            <h3>The one move</h3>
            <p>Surface names where the four ESG raters <b>disagree</b> while the live news flow points one way and the official ratings haven't caught up. Disagreement (x) × momentum (y) → a verdict.</p>
            <p style="background:#08160d;border:1px solid #1a5e33;color:#5fd98a;padding:9px 11px;font-size:11px;line-height:1.5">Every figure on this screen — normalisation, spread, flag, signal and the verdict — is <b>computed in your browser</b> from the raw rater inputs plus the momentum signal. Nothing is hand-labelled, and the same code runs unchanged on a live feed.</p>

            <h3>1 · Normalising four different raters</h3>
            <p>Each rater uses its own scale, so all four are mapped onto one <b>0–100</b> axis (higher = better):</p>
            <ul>
              <li><b>MSCI</b> — letter grades (CCC→AAA) mapped to 0–100</li>
              <li><b>LSEG</b> — 0–5 score ×20</li>
              <li><b>Sustainalytics</b> — a <i>risk</i> score (lower = better), inverted as <code>100 − risk</code></li>
              <li><b>S&amp;P Global</b> — 0–100, used as-is</li>
            </ul>
            <p class="muted">Because the methodologies differ, a wide spread can reflect genuine disagreement <i>and/or</i> scale-mapping differences. Always read spread alongside rater count.</p>

            <h3>2 · Disagreement (x-axis)</h3>
            <p><code>spread = max − min</code> of the normalised scores. Bands: <b>LOW</b> &lt;20 · <b>MODERATE</b> 20–39 · <b>HIGH</b> ≥40. The <b>20-line</b> is the agree/disagree boundary used for verdicts; the <b>40-line</b> marks HIGH-conviction disagreement.</p>

            <h3>3 · Coverage caveat</h3>
            <p><b>10 of 20</b> names are currently rated by only 2 of 4 raters — their spread is lower-confidence and is flagged in the company panel.</p>

            <h3>4 · Momentum (y-axis)</h3>
            <p>Net weighted score of recent ESG news flow → <b>BUY</b> / <b>HOLD</b> / <b>SELL</b>. <span class="muted">In this prototype the momentum values are a fixed demo snapshot; the live news-ingestion pipeline is out of scope.</span></p>

            <h3>5 · Verdict matrix</h3>
            <table class="mtable">
              <tr><th>Raters</th><th>News BUY</th><th>News HOLD</th><th>News SELL</th></tr>
              <tr><th>Disagree (≥20)</th>${cell("DARK HORSE")}${cell("CONTESTED")}${cell("HIDDEN RISK")}</tr>
              <tr><th>Agree (&lt;20)</th>${cell("CONSENSUS RISE")}${cell("STABLE")}${cell("RATING LAGS RISK")}</tr>
            </table>

            <div class="modal-disclaimer">Static demo dataset · 20 SGX-listed names · ratings as of ${META.ratings_asof}. For illustration only — not investment advice.</div>
          </div>
        </div>
      </div>`;
    $("#meth-close").addEventListener("click", closeMethodology);
    $("#meth-overlay").addEventListener("click", (e) => { if (e.target.id === "meth-overlay") closeMethodology(); });
    document.addEventListener("keydown", escClose);
  }
  function closeMethodology() { $("#modal-root").innerHTML = ""; document.removeEventListener("keydown", escClose); }
  function escClose(e) { if (e.key === "Escape") closeMethodology(); }

  /* ============================================================
     INIT + EVENTS
     ============================================================ */
  function init() {
    runEngine(); // compute all metrics/verdicts from raw inputs before first render
    renderLegend();
    buildShortlist();
    renderAll();

    // tabs
    document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => setView(t.dataset.view)));

    // methodology
    $("#meth-btn").addEventListener("click", openMethodology);

    // sort cycle
    $("#sort-btn").addEventListener("click", () => {
      const i = SORTS.indexOf(state.sort);
      state.sort = SORTS[(i + 1) % SORTS.length];
      $("#sort-label").textContent = SORT_LABELS[state.sort] + " ▾";
      renderWatchlist();
    });

    // search
    $("#search").addEventListener("input", (e) => {
      state.search = e.target.value.trim().toLowerCase();
      renderWatchlist();
      if (state.view === "scanner") buildQuadrant();
    });

    // initial selection paint on quadrant
    requestAnimationFrame(() => select(state.selected));

    // responsive quadrant
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (state.view === "scanner") buildQuadrant(); }, 120);
    });

    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
