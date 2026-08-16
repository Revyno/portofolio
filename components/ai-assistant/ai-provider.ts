import { AI_ENABLED } from "./config";
import type { AIProvider, Message } from "./types";

// Calls our own /api/chat route — the OpenRouter key stays server-side.
class RealProvider implements AIProvider {
  readonly name = "openrouter";

  async send(history: Message[], input: string): Promise<string> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, input }),
    });
    if (!res.ok) throw new Error(`AI request failed (${res.status})`);
    const data = (await res.json()) as { reply?: string };
    if (!data.reply) throw new Error("Empty AI reply");
    return data.reply;
  }
}

// Frontend-only mock provider. Real LLM belongs behind a server route (never
// call a secret-keyed API from the browser) — swap this out via createProvider().
class MockProvider implements AIProvider {
  readonly name = "mock";

  async send(history: Message[], input: string): Promise<string> {
    // Simulate network + thinking latency so the `thinking` state is visible.
    await delay(500 + Math.min(1500, input.length * 25));

    const q = input.trim().toLowerCase();
    if (/\b(hi|halo|hai|hello|hey)\b/.test(q)) {
      return "Halo! Aku asistennya mas Revel. Ada yang bisa kubantu?  ";  
    }
    if (q.includes("nama")) {
      return "Aku asisten virtual berbasis karakter 3D. Kamu bisa panggil aku Dimaz.";
    }
    if (q.endsWith("?")) {
      return `Pertanyaan bagus soal "${input.trim()}". Ini masih demo frontend, jadi jawabanku belum tersambung ke LLM sungguhan.`;
    }
    return `Kamu bilang: "${input.trim()}". Aku dengar kok.`;
  }
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function createProvider(): AIProvider {
  return AI_ENABLED ? new RealProvider() : new MockProvider();
}
