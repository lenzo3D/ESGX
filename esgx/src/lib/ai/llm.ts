/* ============================================================
   ESGX — LLM orchestrator (SERVER-SIDE ONLY).
   Priority chain for JSON tasks:
     1. Google Gemini (free tier — hackathon default)
     2. Anthropic Claude (if ANTHROPIC_API_KEY is set)
   Callers decide what happens when neither is available (the
   news pipeline falls back to mechanical keyword rules).
   Keys live in process.env and never reach the browser.
   ============================================================ */
import { AI_MODEL, askClaudeJson, hasApiKey as hasClaudeKey } from "./claudeClient";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function hasAnyLlmKey(): boolean {
  return hasGeminiKey() || hasClaudeKey();
}

/** Which provider will serve LLM calls right now (for UI labels). */
export function llmProviderName(): string | null {
  if (hasGeminiKey()) return `Gemini (${GEMINI_MODEL})`;
  if (hasClaudeKey()) return `Claude (${AI_MODEL})`;
  return null;
}

async function askGeminiJson<T>(system: string, user: string, maxTokens: number): Promise<T> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const generationConfig: Record<string, unknown> = {
    responseMimeType: "application/json",
    maxOutputTokens: maxTokens,
    temperature: 0.2,
  };
  // Gemini 2.5 models spend "thinking" tokens that count against
  // maxOutputTokens and can starve the JSON output. Our tasks are
  // structured labelling/summarising — disable thinking for them.
  if (GEMINI_MODEL.includes("2.5")) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }
  const res = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY!,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini request failed (${res.status}): ${body.slice(0, 160)}`);
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Gemini response did not contain a JSON object");
  return JSON.parse(text.slice(start, end + 1)) as T;
}

/**
 * Ask whichever LLM is configured for a JSON answer.
 * Tries Gemini first (free tier), then Claude. Throws if neither
 * key is set or all configured providers fail.
 */
export async function llmJson<T>(system: string, user: string, maxTokens = 2000): Promise<T> {
  let lastErr: Error | null = null;
  if (hasGeminiKey()) {
    try {
      return await askGeminiJson<T>(system, user, maxTokens);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  if (hasClaudeKey()) {
    try {
      return await askClaudeJson<T>(system, user, maxTokens);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastErr ?? new Error("No LLM key configured (GEMINI_API_KEY or ANTHROPIC_API_KEY)");
}
