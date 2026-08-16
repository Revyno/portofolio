import type { Signals } from "./types";

export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export interface SpeakHandle {
  /** Resolves when speech (or the simulated fallback) finishes. */
  done: Promise<void>;
  cancel(): void;
}

/**
 * Speak `text` via the Web Speech API and drive `signals.mouth` (0..1) so the
 * VRM's mouth moves in sync. Falls back to a timed animation when TTS is
 * unavailable, so lip movement still plays.
 */
export function speak(text: string, signals: Signals): SpeakHandle {
  const supported = isTTSSupported();
  let cancelled = false;
  let raf = 0;

  const animate = () => {
    if (cancelled) return;
    // Envelope: base open + oscillation + jitter → natural-looking talking.
    const t = performance.now();
    const open = 0.18 + 0.32 * Math.abs(Math.sin(t / 85)) + Math.random() * 0.14;
    signals.mouth = Math.min(1, open);
    raf = requestAnimationFrame(animate);
  };

  let resolveDone!: () => void;
  const done = new Promise<void>((res) => (resolveDone = res));

  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    cancelAnimationFrame(raf);
    signals.mouth = 0;
    resolveDone();
  };

  if (supported) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "id-ID";
    u.rate = 1;
    u.pitch = 1;
    u.onstart = () => (raf = requestAnimationFrame(animate));
    u.onend = finish;
    u.onerror = finish;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } else {
    raf = requestAnimationFrame(animate);
    const ms = Math.min(8000, 600 + text.length * 45);
    setTimeout(finish, ms);
  }

  return {
    done,
    cancel() {
      if (supported) window.speechSynthesis.cancel();
      finish();
    },
  };
}
