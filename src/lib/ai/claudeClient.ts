/* ============================================================
   ESGX — Anthropic client wrapper (SERVER-SIDE ONLY).
   The API key lives in process.env and never reaches the browser.
   AI summarises / classifies / explains provided data only — it
   never calculates the final ESG score (see esgScoring.ts).
   ============================================================ */
import Anthropic from "@anthropic-ai/sdk";

export const AI_MODEL = "claude-sonnet-5";
/** Cheap, fast model for high-volume classification. */
export const AI_CLASSIFIER_MODEL = "claude-haiku-4-5-20251001";

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!hasApiKey()) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/** Call Claude and parse a JSON object out of the response text. */
export async function askClaudeJson<T>(
  system: string,
  user: string,
  maxTokens = 2000,
  model: string = AI_MODEL,
): Promise<T> {
  const anthropic = getClient();
  const msg = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  // Tolerate accidental prose/code fences around the JSON object.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("AI response did not contain a JSON object");
  }
  return JSON.parse(text.slice(start, end + 1)) as T;
}
