"use client";

export function BgmPanel({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={enabled}
      className="fixed right-3 top-4 z-50 flex cursor-pointer items-center gap-2 border-none bg-[var(--p5-ink)] px-4 pb-1 pt-1.5 text-lg text-[var(--p5-white)] transition-all duration-150 hover:bg-[var(--p5-pure-white)] hover:text-[var(--p5-ink)] hover:shadow-[4px_4px_0_var(--p5-red)] md:right-6 md:top-6"
      style={{ fontFamily: "var(--font-display)", clipPath: "var(--clip-para)" }}
    >
      <span className={enabled ? "text-[var(--p5-red)]" : "opacity-40"}>
        {enabled ? "♪" : "✕"}
      </span>
      BGM {enabled ? "ON" : "OFF"}
      {enabled && (
        <span className="flex items-end gap-[2px]" aria-hidden>
          <i className="p5-eq" style={{ height: 8, animationDuration: ".5s" }} />
          <i className="p5-eq" style={{ height: 12, animationDuration: ".4s", animationName: "p5-eq-up" }} />
          <i className="p5-eq" style={{ height: 6, animationDuration: ".6s" }} />
        </span>
      )}
    </button>
  );
}
