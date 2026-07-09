/* Shared pipeline result types (used by API routes and the UI). */
import type { Confidence, EventCategory, Severity } from "@/lib/types";

export interface LiveEvent {
  id: string;
  title: string;
  url: string;
  domain: string;
  date: string;
  category: EventCategory | "Unclassified";
  severity: Severity | null;
  scoreImpact: number;
  confidence: Confidence | null;
  reason: string;
  humanReviewRequired: boolean;
  sourceWeight: number;
}

export interface RefreshResult {
  ticker: string;
  fetchedAt: string;
  articleCount: number;
  provider: string;
  classified: boolean;
  classifier: string;
  events: LiveEvent[];
  liveMomentum: number | null;
  note?: string;
}
