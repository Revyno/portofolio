// Server-only Fish Audio TTS proxy. Key stays off the client. Returns mp3 bytes.
// On failure (no credit, bad key) the browser falls back to Web Speech synth.
export const dynamic = "force-dynamic";

// Fish backend model id (header), NOT the OpenRouter display name. "s1" = latest.
const FISH_MODEL = process.env.FISH_TTS_MODEL || "s1";
// Optional voice clone/reference id from the Fish Audio playground.
const VOICE_ID = process.env.FISH_VOICE_ID || undefined;

export async function POST(req: Request) {
  const key = process.env.FISH_AUDIO_API_KEY;
  if (!key) return Response.json({ error: "TTS not configured" }, { status: 503 });

  const { text } = (await req.json()) as { text?: string };
  const clean = text?.trim();
  if (!clean) return Response.json({ error: "Empty text" }, { status: 400 });

  const res = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      model: FISH_MODEL,
    },
    body: JSON.stringify({
      text: clean,
      format: "mp3",
      ...(VOICE_ID ? { reference_id: VOICE_ID } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Fish Audio error", res.status, detail);
    return Response.json({ error: `Fish ${res.status}: ${detail.slice(0, 200)}` }, { status: 502 });
  }

  const audio = await res.arrayBuffer();
  return new Response(audio, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
