"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useAssistant } from "./assistant-store";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import type { AssistantState } from "./types";

const STATE_LABEL: Record<AssistantState, string> = {
  idle: "Siap",
  thinking: "Berpikir…",
  speaking: "Berbicara…",
  listening: "Mendengarkan…",
  error: "Terjadi kesalahan",
};

const STATE_DOT: Record<AssistantState, string> = {
  idle: "bg-green-500",
  thinking: "bg-amber-500 animate-pulse",
  speaking: "bg-blue-500 animate-pulse",
  listening: "bg-red-500 animate-pulse",
  error: "bg-red-600",
};

/** The assistant panel: VRM on top, chat below. `vrmSlot` is the 3D canvas. */
export function AssistantWindow({ vrmSlot }: { vrmSlot: ReactNode }) {
  const { open, status, closeWindow, clear } = useAssistant();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes; move focus into the panel on open.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeWindow();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeWindow]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Asisten AI"
      aria-hidden={!open}
      className={`absolute bottom-0 right-0 flex flex-col overflow-hidden rounded-2xl border border-black/10 shadow-2xl dark:border-white/10 transition-all duration-300 ease-out ${
        open
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-95 opacity-0"
      }`}
      style={{ width: "min(94vw, 420px)", height: "min(88vh, 640px)" }}
    >
      {/* Full-body avatar as the backdrop (AIRI-style). */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-sky-100 via-indigo-100 to-white dark:from-neutral-800 dark:via-neutral-900 dark:to-black">
        {vrmSlot}
      </div>

      {/* Header — floating chips over the avatar. */}
      <header className="relative z-20 flex items-center justify-between p-2">
        <div className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-white backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${STATE_DOT[status]}`} aria-hidden="true" />
          <span className="text-sm font-medium">AI Assistant</span>
          <span className="text-xs opacity-70">{STATE_LABEL[status]}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clear}
            aria-label="Hapus percakapan"
            className="grid h-8 w-8 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={closeWindow}
            aria-label="Tutup asisten"
            className="grid h-8 w-8 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Avatar breathes in the gap between header and chat. */}
      <div className="pointer-events-none relative z-10 flex-1" />

      {/* Chat overlay — messages + input over a bottom scrim. */}
      <div className="relative z-20 flex max-h-[58%] flex-col bg-gradient-to-t from-black/70 via-black/45 to-transparent pt-6">
        <ChatMessages />
        <ChatInput />
      </div>
    </div>
  );
}
