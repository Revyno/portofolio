import type { Message } from "@/components/ai-assistant/types";

// Server-only: key never reaches the browser.
export const dynamic = "force-dynamic";

// OpenRouter chat slug ("vendor/model"). Override with AI_MODEL in .env.
// nemotron-3-nano-30b-a3b:free was retired from the free tier — OpenRouter now
// answers 404 for it — so the default has to be a slug that is free today.
const MODEL = process.env.AI_MODEL?.includes("/")
  ? process.env.AI_MODEL
  : "nvidia/nemotron-3.5-lightning:free";

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
      model: MODEL,
      messages,
      max_tokens: 400,
      // Reasoning models otherwise spend most of the budget thinking and then
      // print the chain of thought into `content` — the visitor reads "Here's a
      // thinking process: 1. Analyze user input…" instead of an answer. Only
      // the API-level switch suppresses it; a "detailed thinking off" line in
      // the system prompt does not, and `exclude: true` still generates (and
      // leaks) the tokens. Ignored by models without reasoning.
      reasoning: { enabled: false },
    }),
  });

  if (!res.ok) {
    // Surface the upstream reason (bad key, unknown model) instead of a blind 502.
    const detail = await res.text().catch(() => "");
    console.error("OpenRouter error", res.status, detail);
    return Response.json({ error: `OpenRouter ${res.status}: ${detail.slice(0, 200)}` }, { status: 502 });
  }

  const data = await res.json();
  const reply: string | undefined = data.choices?.[0]?.message?.content?.trim();
  if (!reply) return Response.json({ error: "Empty AI reply" }, { status: 502 });

  return Response.json({ reply });
}
