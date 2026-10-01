import type { Message } from "@/components/ai-assistant/types";

// Server-only: key never reaches the browser.
export const dynamic = "force-dynamic";

// OpenRouter chat slugs, tried in order (see the loop in POST). Primary from
// AI_MODEL (.env), then free fallbacks for when the primary errors or rate-limits
// — :free pools 429 a lot. Order = preference.
const PRIMARY = process.env.AI_MODEL?.includes("/")
  ? process.env.AI_MODEL
  : "qwen/qwen3.8-27b:free";
// Free slugs verified answering 2026-10-01. OpenRouter rotates :free endpoints
// often — when the loop 502s, re-check live slugs at /api/v1/models (filter
// id endsWith ":free") since dead ones 404 ("unavailable for free") and get
// skipped. The old glm-5.2/gemma/deepseek :free slugs are gone/ZDR-blocked.
const MODELS = [...new Set([
  PRIMARY,
  "qwen/qwen3.8-27b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "inclusionai/ling-3.0-flash-sante:free",
])];
// qwen3.8 is a reasoning model — `reasoning: { enabled: false }` below keeps
// the chain-of-thought out of the reply (see note there).

const SYSTEM_PROMPT =
  "Kamu adalah asisten AI berkarakter 3D di sebuah website portfolio. Jawab singkat, ramah, dan dalam Bahasa Indonesia kecuali diminta bahasa lain.";

export async function POST(req: Request) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return Response.json({ error: "AI not configured" }, { status: 503 });

  const { history, input } = (await req.json()) as { history: Message[]; input: string };
  if (!input?.trim()) return Response.json({ error: "Empty input" }, { status: 400 });

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-10).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: input },
  ];

  // Try each slug in turn. OpenRouter's own `models` array does this server-side
  // but caps at 3, and we carry more — so we loop and fall through on any failure
  // (mostly 429s from the shared :free pools).
  let lastStatus = 502;
  let lastDetail = "";
  for (const model of MODELS) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        // OpenRouter attributes traffic to your app via these (optional).
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": "Revellio Portfolio",
      },
      body: JSON.stringify({
        model,
        messages,
        // No max_tokens cap — let the model use its full output budget.
        // Reasoning models otherwise spend the budget thinking and print the
        // chain of thought into `content`. Only this API switch suppresses it;
        // a "thinking off" system-prompt line does not, and `exclude: true`
        // still generates (and leaks) the tokens. Ignored by non-reasoning models.
        reasoning: { enabled: false },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const reply: string | undefined = data.choices?.[0]?.message?.content?.trim();
      if (reply) return Response.json({ reply });
      lastDetail = "empty reply"; // rare — treat as a miss and try the next model
    } else {
      lastStatus = res.status;
      lastDetail = await res.text().catch(() => "");
      console.error("OpenRouter error", model, res.status, lastDetail.slice(0, 200));
    }
  }

  // Every model failed (all rate-limited or down). Surface the last upstream reason.
  return Response.json({ error: `OpenRouter ${lastStatus}: ${lastDetail.slice(0, 200)}` }, { status: 502 });
}
