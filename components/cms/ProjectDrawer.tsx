"use client";

import { useState } from "react";
import Image from "next/image";
import type { Project } from "@/lib/data";
import { TAGS } from "@/lib/data";
import { saveProject, deleteProject } from "@/lib/store";
import { toast } from "@/lib/toast";
import { Field, Input, Textarea, Select, Toggle, CmsButton, Dropzone } from "./ui";

/** Editor drawer — 560px, right, header/body/footer. Delete left, Cancel+Save right. */
export function ProjectDrawer({
  project,
  onClose,
}: {
  project: Project | "new" | null;
  onClose: () => void;
}) {
  const isNew = project === "new";
  const base = isNew || !project ? null : project;
  const [form, setForm] = useState({
    name: base?.name ?? "",
    tag: base?.tag ?? TAGS[0],
    description: base?.description ?? "",
    stack: base?.stack ?? "",
    metric: base?.metric ?? "",
    duration: base?.duration ?? "",
    year: base?.year ?? "2026",
    published: base?.published ?? false,
    coverUrl: base?.coverUrl ?? null,
    liveUrl: base?.liveUrl ?? "",
    repoUrl: base?.repoUrl ?? "",
    problemTitle: base?.problemTitle ?? "",
    problemBody: base?.problemBody ?? "",
    media: base?.media ?? [],
  });
  const GALLERY_MAX = 5;

  if (project === null) return null;

  function upd<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function save() {
    saveProject({
      id: base?.id,
      ...form,
      liveUrl: form.liveUrl.trim() || null,
      repoUrl: form.repoUrl.trim() || null,
    });
    toast(isNew ? "Project created" : "Project saved");
    onClose();
  }
  function remove() {
    if (!base) return;
    if (confirm(`Delete “${base.name}”? This removes it from the site and the table.`)) {
      deleteProject(base.id);
      toast("Project deleted");
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative flex h-full w-full max-w-[560px] flex-col border-l border-[var(--line-box)] bg-s1"
        style={{ boxShadow: "-40px 0 80px rgba(0,0,0,.5)" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
          <h2 className="text-[21px] font-bold tracking-[-0.03em] text-white">
            {isNew ? "New project" : "Edit project"}
          </h2>
          <button onClick={onClose} className="mono text-[13px] text-[var(--t-muted)] transition-colors hover:text-white">
            ✕
          </button>
        </div>

        <div className="scroll-thin flex-1 space-y-5 overflow-y-auto p-6">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => upd("name", e.target.value)} placeholder="Untitled project" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tag">
              <Select value={form.tag} onChange={(e) => upd("tag", e.target.value as (typeof TAGS)[number])}>
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Year">
              <Input value={form.year} onChange={(e) => upd("year", e.target.value)} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={2} value={form.description} onChange={(e) => upd("description", e.target.value)} placeholder="One sentence, ~90 chars" />
          </Field>
          <Field label="Stack">
            <Input value={form.stack} onChange={(e) => upd("stack", e.target.value)} placeholder="Next.js · Three.js · GSAP" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Metric">
              <Input value={form.metric} onChange={(e) => upd("metric", e.target.value)} placeholder="p99 2.8s → 86ms" />
            </Field>
            <Field label="Duration">
              <Input value={form.duration} onChange={(e) => upd("duration", e.target.value)} placeholder="6 weeks" />
            </Field>
          </div>
          <Field label="Live URL">
            <Input
              type="url"
              value={form.liveUrl}
              onChange={(e) => upd("liveUrl", e.target.value)}
              placeholder="https://example.com"
            />
          </Field>
          <Field label="GitHub URL">
            <Input
              type="url"
              value={form.repoUrl}
              onChange={(e) => upd("repoUrl", e.target.value)}
              placeholder="https://github.com/user/repo"
            />
          </Field>
          <Field label="Problem — heading">
            <Input value={form.problemTitle} onChange={(e) => upd("problemTitle", e.target.value)} placeholder="Updates meant a deploy." />
          </Field>
          <Field label="Problem — body">
            <Textarea
              rows={4}
              value={form.problemBody}
              onChange={(e) => upd("problemBody", e.target.value)}
              placeholder="Case-study problem text. Leave blank to use the default copy. Separate paragraphs with a blank line."
            />
          </Field>
          <Field label="Cover image">
            {form.coverUrl ? (
              <div className="relative aspect-[16/10] w-full border border-[var(--line-box)]">
                <Image src={form.coverUrl} alt="cover" fill sizes="520px" className="object-cover" />
                <button
                  onClick={() => upd("coverUrl", null)}
                  className="mono absolute right-2 top-2 bg-black/70 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-black/90"
                >
                  Replace ✕
                </button>
              </div>
            ) : (
              <Dropzone onFile={(url) => upd("coverUrl", url)} hint="Drop cover (3:2)" height={150} />
            )}
          </Field>
          <Field label={`Gallery — carousel (${form.media.length}/${GALLERY_MAX})`}>
            <div className="grid grid-cols-3 gap-2">
              {form.media.map((m, i) => (
                <div key={m.id} className="relative aspect-square border border-[var(--line-box)]">
                  <Image src={m.url} alt={m.caption || "gallery"} fill sizes="180px" className="object-cover" />
                  <button
                    onClick={() => upd("media", form.media.filter((_, j) => j !== i))}
                    className="mono absolute right-1 top-1 bg-black/70 px-1.5 py-0.5 text-[9px] text-white transition-colors hover:bg-black/90"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {form.media.length < GALLERY_MAX && (
              <div className="mt-2">
                <Dropzone
                  onFile={(url) => upd("media", [...form.media, { id: `tmp-${Date.now()}`, url, caption: "" }])}
                  hint={`Drop image to add (${GALLERY_MAX - form.media.length} left)`}
                  height={90}
                />
              </div>
            )}
          </Field>
          <div className="flex items-center justify-between border-t border-[var(--line)] pt-5">
            <span className="text-[14px] text-white">Published</span>
            <Toggle on={form.published} onChange={(v) => upd("published", v)} />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--line)] px-6 py-4">
          {isNew ? (
            <span />
          ) : (
            <CmsButton variant="danger" onClick={remove}>
              Delete
            </CmsButton>
          )}
          <div className="flex gap-3">
            <CmsButton variant="ghost" onClick={onClose}>
              Cancel
            </CmsButton>
            <CmsButton onClick={save}>Save</CmsButton>
          </div>
        </div>
      </div>
    </div>
  );
}
