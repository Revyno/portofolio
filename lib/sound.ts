"use client";

let audio: HTMLAudioElement | null = null;

/** Plays public/audio/select.mp3. Reuses one element; ignores autoplay-policy rejects. */
export function playClick() {
  if (typeof window === "undefined") return;
  if (!audio) audio = new Audio("/audio/select.mp3");
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}
