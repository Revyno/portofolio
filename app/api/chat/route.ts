import type { Message } from "@/components/ai-assistant/types";

// Server-only: key never reaches the browser. `AI_MODEL` in .env is currently
// a TTS model name (leftover), so it's ignored unless it looks like a real
// OpenRouter slug ("vendor/model").
export const dynamic = "force-dynamic";

const MODEL = process.env.AI_MODEL?.includes("/") ? process.env.AI_MODEL : "Fish_Audio/Fish_Audio: S2.1 Pro Free";

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
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (!res.ok) {
    return Response.json({ error: `OpenRouter error ${res.status}` }, { status: 502 });
  }

  const data = await res.json();
  const reply: string | undefined = data.choices?.[0]?.message?.content?.trim();
  if (!reply) return Response.json({ error: "Empty AI reply" }, { status: 502 });

  return Response.json({ reply });
}
