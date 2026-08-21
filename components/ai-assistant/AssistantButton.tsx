"use client";

import { useAssistant } from "./assistant-store";
import { PixelRevealButton } from "@/components/ui/PixelRevealButton";

/** Floating launcher shown when the assistant window is closed. */
export function AssistantButton({ hidden }: { hidden: boolean }) {
  const { openWindow } = useAssistant();

  return (
    <PixelRevealButton
      text="Chat AI"
      onClick={openWindow}
      aria-label="Buka asisten AI"
      aria-expanded={!hidden}
      tabIndex={hidden ? -1 : 0}
      colorFrom="#0b0b0b"
      colorTo="#4ce0ff"
      textColor="#ffffff"
      pixelSize={10}
      duration={600}
      className={`font-mono text-sm transition-transform duration-100 active:scale-95 ${
        hidden ? "pointer-events-none scale-0 opacity-0" : "scale-100 opacity-100"
      }`}
    />
  );
}
