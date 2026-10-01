"use client";

import { useRef, useState, type ReactNode } from "react";
import { toast } from "@/lib/toast";

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

/** Dropzone — dashed border, ↓ glyph. Uploads to S3 and calls onFile(publicUrl, file). */
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
  const [busy, setBusy] = useState(false);

  // Presigned S3 upload: ask our server for a short-lived PUT URL, send the file
  // straight to S3, then hand the public URL to the caller. No base64 — that
  // bloated Neon and failed on anything large.
  async function handle(file: File | undefined) {
    if (!file || busy) return;
    setBusy(true);
    try {
      const ct = file.type || "application/octet-stream";
      const sign = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: ct, size: file.size }),
      });
      if (!sign.ok) {
        const { error } = (await sign.json().catch(() => ({}))) as { error?: string };
        throw new Error(error || `presign failed (${sign.status})`);
      }
      const { uploadUrl, publicUrl } = (await sign.json()) as { uploadUrl: string; publicUrl: string };
      const put = await fetch(uploadUrl, { method: "PUT", headers: { "content-type": ct }, body: file });
      if (!put.ok) throw new Error(`S3 upload failed (${put.status})`);
      onFile(publicUrl, file);
    } catch (e) {
      toast(`Upload failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={() => !busy && ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!busy) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!busy) handle(e.dataTransfer.files[0]);
      }}
      className={`flex flex-col items-center justify-center border border-dashed p-11 text-center transition-colors ${
        busy ? "cursor-wait opacity-60" : "cursor-pointer"
      } ${over ? "border-accent bg-[var(--accent-hover)]" : "border-[rgba(255,255,255,0.2)]"}`}
      style={height ? { minHeight: height } : undefined}
    >
      <div className="mono text-[24px] text-accent">{busy ? "…" : "↓"}</div>
      <div className="mono mt-3 text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
        {busy ? "Uploading…" : hint}
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
