"use client";

import { useEffect, useRef, useState } from "react";
import { useAssistant } from "./assistant-store";
import { isSTTSupported, listen, type ListenHandle } from "./stt";

/** Mic button — only renders when the browser supports speech recognition. */
export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const { setStatus } = useAssistant();
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const handleRef = useRef<ListenHandle | null>(null);

  // Feature-detect on the client only (avoids SSR mismatch).
  useEffect(() => setSupported(isSTTSupported()), []);

  useEffect(
    () => () => {
      handleRef.current?.stop();
    },
    [],
  );

  if (!supported) return null;

  const toggle = () => {
    if (active) {
      handleRef.current?.stop();
      return;
    }
    setActive(true);
    setStatus("listening");
    handleRef.current = listen({
      onResult: (text, isFinal) => {
        if (isFinal) onTranscript(text);
      },
      onEnd: () => {
        setActive(false);
        setStatus("idle");
      },
      onError: () => {
        setActive(false);
        setStatus("idle");
      },
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={active ? "Berhenti merekam suara" : "Input suara"}
      aria-pressed={active}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${
        active
          ? "bg-red-500 text-white animate-pulse"
          : "bg-black/5 dark:bg-white/10 hover:bg-black/10"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"
          fill="currentColor"
        />
        <path
          d="M19 11a7 7 0 0 1-14 0M12 18v3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
