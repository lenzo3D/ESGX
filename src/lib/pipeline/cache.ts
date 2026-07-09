/* ============================================================
   Shared in-memory cache for live pipeline results.
   15-minute TTL — GDELT's own refresh cadence. Lives in lib so
   both the refresh route (writes) and the public signal API
   (reads) see the same data. Swaps for Redis/DB in production.
   ============================================================ */
import type { RefreshResult } from "./types";

export const CACHE_TTL_MS = 15 * 60 * 1000;

const store = new Map<string, { at: number; result: RefreshResult }>();

export function getCached(ticker: string): RefreshResult | null {
  const hit = store.get(ticker);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) return null;
  return hit.result;
}

export function setCached(ticker: string, result: RefreshResult): void {
  store.set(ticker, { at: Date.now(), result });
}
