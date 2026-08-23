"use client";

import { useEffect, useState } from "react";
import { useAssistant } from "./assistant-store";
import SpecularButton from "@/components/ui/SpecularButton";

/** Floating launcher shown when the assistant window is closed. */
export function AssistantButton({ hidden }: { hidden: boolean }) {
  const { openWindow } = useAssistant();
  // Touch devices never fire pointermove, so the specular shine would stay dark.
  // Detect no-hover and let the rim light auto-sweep instead.
  const [noHover, setNoHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setNoHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <SpecularButton
      size="md"
      radius={18}
      autoAnimate={noHover}
      onClick={openWindow}
      aria-label="Buka asisten AI"
      aria-expanded={!hidden}
      tabIndex={hidden ? -1 : 0}
      lineColor="#4ce0ff"
      baseColor="#0b0b0b"
      tint="#0b0b0b"
      tintOpacity={0.5}
      blur={8}
      textColor="#ffffff"
      className={`rb-round-lg font-mono text-sm ${
        hidden ? "pointer-events-none scale-0 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      Chat AI
    </SpecularButton>
  );
}
