"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * BGM (/audio/background.mp3, looped) + UI select SFX (/audio/select.mp3).
 * Sound starts OFF — browsers block autoplay — and the toggle click/keypress
 * counts as the user gesture that unlocks playback.
 */
export function useAudio() {
  const [enabled, setEnabled] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const bgm = new Audio("/audio/background.mp3");
    bgm.loop = true;
    bgm.volume = 0.35;
    bgmRef.current = bgm;

    const sfx = new Audio("/audio/select.mp3");
    sfx.volume = 0.5;
    sfxRef.current = sfx;

    return () => {
      bgm.pause();
      bgmRef.current = null;
      sfxRef.current = null;
    };
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      const bgm = bgmRef.current;
      if (bgm) {
        if (next) bgm.play().catch(() => {});
        else bgm.pause();
      }
      return next;
    });
  }, []);

  const playSelect = useCallback(() => {
    const sfx = sfxRef.current;
    if (!sfx) return;
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }, []);

  return { enabled, toggle, playSelect };
}
