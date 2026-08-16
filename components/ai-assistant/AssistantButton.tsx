"use client";

import { useAssistant } from "./assistant-store";

/** Floating launcher shown when the assistant window is closed. */
export function AssistantButton({ hidden }: { hidden: boolean }) {
  const { openWindow } = useAssistant();

  return (
    <button
      type="button"
      onClick={openWindow}
      aria-label="Buka asisten AI"
      aria-expanded={!hidden}
      tabIndex={hidden ? -1 : 0}
      className={`grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-105 hover:bg-blue-700 ${
        hidden ? "pointer-events-none scale-0 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <span className="text-sm font-semibold">AI</span>
    </button>
  );
}
