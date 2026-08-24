import type { Signals } from "./types";

export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export interface SpeakHandle {
  /** Resolves when speech (or the simulated fallback) finishes. */
  done: Promise<void>;
  cancel(): void;
}

// Keep utterances referenced until they finish — Chrome garbage-collects
// in-flight SpeechSynthesisUtterance objects, which cuts speech to silence.
const keepAlive = new Set<SpeechSynthesisUtterance>();

/** Mouth envelope: base open + oscillation + jitter → natural-looking talking. */
function talkFrame(): number {
  const t = performance.now();
  return Math.min(1, 0.18 + 0.32 * Math.abs(Math.sin(t / 85)) + Math.random() * 0.14);
}

/** Voices load asynchronously; resolve once the list is populated (or give up). */
function voicesReady(): Promise<void> {
  if (!isTTSSupported()) return Promise.resolve();
  if (window.speechSynthesis.getVoices().length) return Promise.resolve();
  return new Promise((res) => {
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      res();
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    setTimeout(done, 1000); // fallback: some engines never fire the event
  });
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("id")) ||
    voices.find((v) => v.default) ||
    voices[0] ||
    null
  );
}

/**
 * Unlock audio from inside a user gesture. Chrome blocks the first playback
 * unless it (or a warm-up) happened during a real interaction — and our real
 * speech fires after an async fetch, outside any gesture. Call on click/submit.
 */
export function unlockTTS(): void {
  if (typeof window === "undefined") return;
  if (isTTSSupported()) {
    window.speechSynthesis.resume();
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    window.speechSynthesis.speak(u);
    void voicesReady();
  }
}

/** Browser Web Speech synth — fallback when Fish Audio is unavailable. */
function speakBrowser(text: string, signals: Signals): SpeakHandle {
  const supported = isTTSSupported();
  let cancelled = false;
  let raf = 0;
  let resumeKick = 0;

  const animate = () => {
    if (cancelled) return;
    signals.mouth = talkFrame();
    raf = requestAnimationFrame(animate);
  };

  let resolveDone!: () => void;
  const done = new Promise<void>((res) => (resolveDone = res));

  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    cancelAnimationFrame(raf);
    clearInterval(resumeKick);
    signals.mouth = 0;
    resolveDone();
  };

  if (supported) {
    const synth = window.speechSynthesis;
    synth.cancel();
    voicesReady().then(() => {
      if (cancelled) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "id-ID";
      u.rate = 1;
      u.pitch = 1;
      const v = pickVoice();
      if (v) u.voice = v;
      keepAlive.add(u);
      const cleanup = () => {
        keepAlive.delete(u);
        finish();
      };
      u.onstart = () => (raf = requestAnimationFrame(animate));
      u.onend = cleanup;
      u.onerror = cleanup;
      synth.speak(u);
      resumeKick = window.setInterval(() => synth.resume(), 5000);
    });
  } else {
    raf = requestAnimationFrame(animate);
    setTimeout(finish, Math.min(8000, 600 + text.length * 45));
  }

  return {
    done,
    cancel() {
      if (supported) window.speechSynthesis.cancel();
      finish();
    },
  };
}

/**
 * Speak `text`. Tries the online Fish Audio voice (/api/tts) first for natural
 * speech; on any failure (no credit, blocked autoplay, network) it falls back
 * to the offline browser voice. Drives `signals.mouth` (0..1) for VRM lip-sync.
 * ponytail: mouth uses a talking envelope, not real audio amplitude.
 * Upgrade to a Web Audio AnalyserNode on the <audio> for true sync.
 */
export function speak(text: string, signals: Signals): SpeakHandle {
  let cancelled = false;
  let raf = 0;
  let audio: HTMLAudioElement | null = null;
  let inner: SpeakHandle | null = null; // browser fallback, if used
  let resolveDone!: () => void;
  const done = new Promise<void>((res) => (resolveDone = res));

  const settle = () => {
    if (cancelled) return;
    cancelled = true;
    resolveDone();
  };

  const finishAudio = () => {
    cancelAnimationFrame(raf);
    signals.mouth = 0;
    if (audio) {
      audio.pause();
      audio.src = "";
      audio = null;
    }
    settle();
  };

  const fallback = () => {
    if (cancelled) return;
    inner = speakBrowser(text, signals);
    inner.done.then(settle);
  };

  (async () => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`tts ${res.status}`);
      const buf = await res.arrayBuffer();
      if (cancelled) return;

      const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
      audio = new Audio(url);
      const animate = () => {
        if (cancelled) return;
        signals.mouth = talkFrame();
        raf = requestAnimationFrame(animate);
      };
      audio.onplay = () => (raf = requestAnimationFrame(animate));
      audio.onended = () => {
        URL.revokeObjectURL(url);
        finishAudio();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        finishAudio();
      };
      await audio.play(); // rejects if autoplay is blocked → fall back
    } catch {
      // Fish failed or playback blocked — use the offline browser voice.
      if (!cancelled) fallback();
    }
  })();

  return {
    done,
    cancel() {
      if (inner) inner.cancel();
      finishAudio();
    },
  };
}
