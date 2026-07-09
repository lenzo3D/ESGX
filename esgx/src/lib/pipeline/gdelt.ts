/* ============================================================
   ESGX pipeline — step 1: collection.
   Live article pull from the GDELT DOC 2.0 API (free public
   source, refreshes every 15 minutes, no key required).
   Mechanical name matching happens here; AI classification is a
   separate step and never generates facts.
   ============================================================ */

export interface GdeltArticle {
  id: string;
  title: string;
  url: string;
  domain: string;
  /** ISO date derived from GDELT seendate */
  date: string;
}

/** ESG-relevance qualifiers appended to the company-name query. */
const ESG_TERMS =
  "(ESG OR sustainability OR emissions OR climate OR governance OR labour OR labor OR regulator OR fine OR penalty OR probe OR lawsuit OR corruption OR safety OR pollution OR renewable)";

function parseSeenDate(seendate: string): string {
  // GDELT format: 20260705T081500Z → 2026-07-05
  const m = seendate.match(/^(\d{4})(\d{2})(\d{2})T/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : new Date().toISOString().slice(0, 10);
}

/* GDELT allows ONE request per 5 seconds per IP — enforce it globally. */
let lastGdeltCall = 0;
async function gdeltRateGate(): Promise<void> {
  const wait = lastGdeltCall + 5500 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastGdeltCall = Date.now();
}

export async function fetchGdeltNews(companyName: string, maxRecords = 12): Promise<GdeltArticle[]> {
  const query = `"${companyName}" ${ESG_TERMS} sourcelang:english`;
  const url =
    "https://api.gdeltproject.org/api/v2/doc/doc?" +
    new URLSearchParams({
      query,
      mode: "ArtList",
      maxrecords: String(maxRecords),
      timespan: "3months",
      sort: "DateDesc",
      format: "json",
    }).toString();

  await gdeltRateGate();
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": "ESGX-prototype/0.1 (hackathon demo)" },
  });
  if (!res.ok) throw new Error(`GDELT request failed (${res.status})`);

  const text = await res.text();
  let data: { articles?: Array<{ title?: string; url?: string; domain?: string; seendate?: string }> };
  try {
    data = JSON.parse(text);
  } catch {
    // GDELT returns plain-text errors for malformed queries
    throw new Error(`GDELT returned a non-JSON response: ${text.slice(0, 120)}`);
  }

  const seen = new Set<string>();
  const out: GdeltArticle[] = [];
  for (const a of data.articles ?? []) {
    if (!a.title || !a.url || !a.domain) continue; // no source → excluded at collection
    const key = a.title.toLowerCase().replace(/\W+/g, " ").trim();
    if (seen.has(key)) continue; // dedupe syndicated copies
    seen.add(key);
    out.push({
      id: `${a.domain}-${out.length}-${a.seendate ?? ""}`,
      title: a.title,
      url: a.url,
      domain: a.domain,
      date: parseSeenDate(a.seendate ?? ""),
    });
  }
  return out;
}

/* ============================================================
   Fallback collector — Google News RSS (free, XML). Used when
   GDELT throttles so the live demo never dies on a 429.
   ============================================================ */
export async function fetchGoogleNewsRss(companyName: string, max = 12): Promise<GdeltArticle[]> {
  const q = encodeURIComponent(`"${companyName}" ESG OR sustainability OR governance OR regulator`);
  const url = `https://news.google.com/rss/search?q=${q}&hl=en-SG&gl=SG&ceid=SG:en`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": "ESGX-prototype/0.1 (hackathon demo)" },
  });
  if (!res.ok) throw new Error(`Google News RSS failed (${res.status})`);
  const xml = await res.text();

  const items = xml.split("<item>").slice(1);
  const seen = new Set<string>();
  const out: GdeltArticle[] = [];
  for (const raw of items) {
    if (out.length >= max) break;
    const title = raw.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim();
    const link = raw.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim();
    const pub = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
    const srcUrl = raw.match(/<source url="([^"]+)"/)?.[1];
    if (!title || !link) continue;
    // Google News titles end with " - Publisher"
    const cleanTitle = title.replace(/\s+-\s+[^-]+$/, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const key = cleanTitle.toLowerCase().replace(/\W+/g, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    let domain = "news.google.com";
    try {
      if (srcUrl) domain = new URL(srcUrl).hostname.replace(/^www\./, "");
    } catch {
      /* keep default */
    }
    out.push({
      id: `rss-${domain}-${out.length}`,
      title: cleanTitle,
      url: link,
      domain,
      date: pub ? new Date(pub).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    });
  }
  return out;
}

export interface CollectedNews {
  articles: GdeltArticle[];
  provider: "GDELT" | "Google News RSS";
}

/** Collection with graceful degradation: GDELT first, RSS on failure. */
export async function collectNews(companyName: string): Promise<CollectedNews> {
  try {
    const articles = await fetchGdeltNews(companyName);
    if (articles.length > 0) return { articles, provider: "GDELT" };
    // GDELT can return 0 for niche names — try the fallback before giving up
    const rss = await fetchGoogleNewsRss(companyName);
    return rss.length > 0 ? { articles: rss, provider: "Google News RSS" } : { articles, provider: "GDELT" };
  } catch {
    const articles = await fetchGoogleNewsRss(companyName);
    return { articles, provider: "Google News RSS" };
  }
}
