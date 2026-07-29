import Link from "next/link";
import type { ReactNode } from "react";

/* Public-site building blocks. All 1px hairlines, no radius, no shadow. */

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`eyebrow mb-6 ${className}`}>{children}</div>;
}

export function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  // page frame: 72px gutter desktop, 22px mobile
  return (
    <div className={`mx-auto max-w-[1440px] px-[22px] md:px-[72px] ${className}`}>{children}</div>
  );
}

export function Section({
  children,
  className = "",
  border = true,
}: {
  children: ReactNode;
  className?: string;
  border?: boolean;
}) {
  return (
    <section
      className={`${border ? "border-t border-[var(--line)]" : ""} py-[44px] md:py-[80px] ${className}`}
    >
      {children}
    </section>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  onClick,
  type,
}: {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const base =
    "mono inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] px-[26px] py-[15px] transition-colors";
  const styles =
    variant === "primary"
      ? "bg-accent text-[#0b0b0b] hover:bg-white"
      : "border border-[var(--line-box)] text-white hover:bg-[var(--accent-hover)]";
  const cls = `${base} ${styles} ${className}`;
  if (href) {
    const external = href.startsWith("http") || href.startsWith("mailto:");
    if (external)
      return (
        <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
          {children}
        </a>
      );
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function MetaStrip({
  items,
}: {
  items: { label: string; value: string; accent?: boolean }[];
}) {
  return (
    <div className="grid grid-cols-2 border-t border-[var(--line)] md:grid-cols-4">
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`border-b border-[var(--line)] px-4 py-5 md:border-b-0 ${
            i > 0 ? "md:border-l md:border-[var(--line)]" : ""
          } ${i % 2 === 1 ? "border-l border-[var(--line)] md:border-l" : ""}`}
        >
          <div className="meta-label mb-2">{it.label}</div>
          <div className={`text-[13.5px] ${it.accent ? "text-accent" : "text-white"}`}>
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetricTile({
  metrics,
}: {
  metrics: { value: string; label: string; caveat?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-px bg-[var(--line)]">
      {metrics.map((m, i) => (
        <div key={m.label} className="bg-s0 p-6">
          <div
            className={`mono text-[30px] font-bold leading-none tracking-[-0.04em] md:text-[44px] ${
              i === 0 ? "text-accent" : "text-white"
            }`}
          >
            {m.value}
          </div>
          <div className="meta-label mt-3">{m.label}</div>
          {m.caveat && (
            <div className="mt-2 text-[12.5px] text-[var(--t-muted)]">{m.caveat}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function SkillBar({ name, level, note }: { name: string; level: number; note: string }) {
  return (
    <div className="py-3">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[15px] text-white">{name}</span>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--t-muted)]">
          {note}
        </span>
      </div>
      <div className="h-[5px] w-full bg-[rgba(255,255,255,0.1)]">
        <div className="h-full bg-accent" style={{ width: `${Math.round(level * 100)}%` }} />
      </div>
    </div>
  );
}

export function Heatmap({ grid }: { grid: number[][] }) {
  const shade = ["rgba(255,255,255,0.06)", "var(--accent-28)", "var(--accent-60)", "var(--accent)"];
  const cols = grid[0]?.length ?? 0;
  return (
    <div
      className="grid w-max gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoFlow: "column", gridTemplateRows: "repeat(7, 1fr)" }}
    >
      {grid.map((row, r) =>
        row.map((v, c) => (
          <div
            key={`${r}-${c}`}
            className="h-[7px] w-[7px] md:h-[11px] md:w-[11px]"
            style={{ background: shade[v] }}
          />
        )),
      )}
    </div>
  );
}
