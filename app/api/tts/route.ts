// Server-only TTS proxy via OpenRouter (/audio/speech). Key stays off the
// client. Returns mp3 bytes; on failure the browser falls back to Web Speech.
export const dynamic = "force-dynamic";

// OpenRouter speech slug ("vendor/model"). Override with TTS_MODEL in .env.
const MODEL = process.env.TTS_MODEL?.includes("/")
  ? process.env.TTS_MODEL
  : "fish-audio/s2.1-pro-free:free";

export async function POST(req: Request) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return Response.json({ error: "TTS not configured" }, { status: 503 });

  const { text } = (await req.json()) as { text?: string };
  const clean = text?.trim();
  if (!clean) return Response.json({ error: "Empty text" }, { status: 400 });

  const res = await fetch("https://openrouter.ai/api/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      // OpenRouter attributes traffic to your app via these (optional).
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-Title": "Revellio Portfolio",
    },
    // Must set mp3 explicitly: this model otherwise returns raw PCM, which the
    // client's audio/mpeg Blob + <audio> can't play. mp3 → audio/mpeg bytes.
    body: JSON.stringify({ model: MODEL, input: clean, response_format: "mp3" }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("OpenRouter TTS error", res.status, detail);
    return Response.json({ error: `TTS ${res.status}: ${detail.slice(0, 200)}` }, { status: 502 });
  }

  const audio = await res.arrayBuffer();
  return new Response(audio, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
