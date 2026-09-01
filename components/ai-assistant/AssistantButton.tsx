"use client";

import { useEffect, useState } from "react";
import { useAssistant } from "./assistant-store";
import { PixelButton } from "@/components/ui/PixelButton";

/** Floating launcher shown when the assistant window is closed. */
export function AssistantButton({ hidden }: { hidden: boolean }) {
  const { openWindow } = useAssistant();
  // Touch devices never fire hover, so keep the pixel fill flooded there.
  const [noHover, setNoHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setNoHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <PixelButton
      size="md"
      radius={18}
      variant="dark"
      active={noHover}
      onClick={openWindow}
      aria-label="Buka asisten AI"
      aria-expanded={!hidden}
      tabIndex={hidden ? -1 : 0}
      className={`text-sm transition-[opacity,transform] ${
        hidden ? "pointer-events-none scale-0 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      Chat AI
    </PixelButton>
  );
}
