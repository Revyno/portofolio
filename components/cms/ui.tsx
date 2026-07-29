"use client";

import { useRef, useState, type ReactNode } from "react";

/* CMS primitives — hairline, no radius. */

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className={`flex h-6 w-[46px] items-center border p-[3px] transition-colors ${
        on ? "justify-end border-accent bg-accent" : "justify-start border-[var(--line-diagram)]"
      }`}
    >
      <span
        className="h-4 w-4"
        style={{ background: on ? "#0b0b0b" : "rgba(255,255,255,0.4)" }}
      />
    </button>
  );
}

export function StatusPill({
  published,
  onClick,
}: {
  published: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mono px-[10px] py-[6px] text-[9px] uppercase tracking-[0.1em] transition-colors ${
        published
          ? "border border-accent bg-[var(--accent-wash)] text-accent"
          : "border border-[var(--line-diagram)] text-[var(--t-muted)]"
      }`}
    >
      {published ? "Published" : "Draft"}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="meta-label mb-2 block">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full border border-[var(--line-box)] bg-field px-3 py-[11px] text-[13px] text-white placeholder:text-[var(--t-ghost)] outline-none focus:border-accent";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputCls} appearance-none ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}

export function CmsButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  className?: string;
}) {
  const map = {
    primary: "bg-accent text-[#0b0b0b] hover:bg-white",
    ghost: "border border-[var(--line-box)] text-white hover:bg-[var(--accent-hover)]",
    danger: "text-[var(--t-muted)] hover:text-danger",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`mono px-[18px] py-[11px] text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${map[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/** Dropzone — dashed border, ↓ glyph. Reads file as data URL and calls onFile. */
export function Dropzone({
  onFile,
  accept = "image/*",
  hint = "Drop a file or click to browse",
  height = 0,
}: {
  onFile: (dataUrl: string, file: File) => void;
  accept?: string;
  hint?: string;
  height?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function handle(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onFile(String(reader.result), file);
    reader.readAsDataURL(file);
  }

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(e.dataTransfer.files[0]);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center border border-dashed p-11 text-center transition-colors ${
        over ? "border-accent bg-[var(--accent-hover)]" : "border-[rgba(255,255,255,0.2)]"
      }`}
      style={height ? { minHeight: height } : undefined}
    >
      <div className="mono text-[24px] text-accent">↓</div>
      <div className="mono mt-3 text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
        {hint}
      </div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </div>
  );
}

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-s0 p-6">
      <div className="mono text-[40px] font-bold leading-none tracking-[-0.04em] text-accent">
        {value}
      </div>
      <div className="meta-label mt-3">{label}</div>
    </div>
  );
}
