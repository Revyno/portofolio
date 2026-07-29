"use client";

import { useToast } from "@/lib/toast";

/** Toast — absolute bottom-left, accent fill, mono, auto-hides (DESIGN §5). */
export function Toaster() {
  const t = useToast();
  if (!t) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-50">
      <div className="mono bg-accent px-4 py-3 text-[10.5px] uppercase tracking-[0.14em] text-[#0b0b0b]">
        {t.text}
      </div>
    </div>
  );
}
