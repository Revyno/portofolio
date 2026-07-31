"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  useProjects,
  useProfile,
  useCvVersions,
  useMedia,
  saveProfile,
  togglePublished,
  moveProject,
  deleteProject,
  addMedia,
  deleteMedia,
  addCvVersion,
  restoreCvVersion,
  unpublishAll,
  resetToSeed,
  reindex,
} from "@/lib/store";
import { TAGS, pad, type Project } from "@/lib/data";
import { toast } from "@/lib/toast";
import { TabHead } from "./Shell";
import {
  StatCard,
  StatusPill,
  Toggle,
  CmsButton,
  Field,
  Input,
  Textarea,
  Dropzone,
} from "./ui";
import { ProjectDrawer } from "./ProjectDrawer";

function bytes(n: number): string {
  return n > 1024 ? `${(n / 1024).toFixed(0)} KB` : `${n} B`;
}

/* ---- C1 Overview ---------------------------------------------------------- */
export function OverviewTab({ go }: { go: (t: string) => void }) {
  const projects = useProjects();
  const media = useMedia();
  const cv = useCvVersions();
  const published = projects.filter((p) => p.published).length;
  const liveCv = cv.find((c) => c.isLive);
  const health = projects.filter((p) => !p.metric || !p.coverUrl);

  return (
    <div>
      <TabHead title="Overview" sub="Content at a glance." />
      <div className="grid grid-cols-2 gap-px bg-[var(--line)] md:grid-cols-4">
        <StatCard value={String(projects.length)} label="Projects" />
        <StatCard value={String(published)} label="Published" />
        <StatCard value={String(media.length)} label="Media" />
        <StatCard value={liveCv ? `v${liveCv.version}` : "—"} label="CV version" />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="border border-[var(--line)] p-6">
          <div className="meta-label mb-4">Content health</div>
          {health.length === 0 ? (
            <p className="text-positive text-[13px]">All projects have a metric and cover ✓</p>
          ) : (
            <ul className="space-y-2">
              {health.map((p) => (
                <li key={p.id} className="flex justify-between text-[13px]">
                  <span className="text-white">{p.name}</span>
                  <span className="mono text-[10px] uppercase tracking-[0.14em] text-danger">
                    {!p.metric && "no metric"} {!p.coverUrl && "no cover"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border border-[var(--line)] p-6">
          <div className="meta-label mb-4">Quick add</div>
          <div className="flex flex-wrap gap-3">
            <CmsButton onClick={() => go("projects")}>New project →</CmsButton>
            <CmsButton variant="ghost" onClick={() => go("journey")}>
              New milestone →
            </CmsButton>
            <CmsButton variant="ghost" onClick={() => go("cv")}>
              Upload CV →
            </CmsButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- C2 Projects ---------------------------------------------------------- */
export function ProjectsTab() {
  const projects = reindex(useProjects());
  const [tag, setTag] = useState("All");
  const [editing, setEditing] = useState<Project | "new" | null>(null);

  const filtered = tag === "All" ? projects : projects.filter((p) => p.tag === tag);

  return (
    <div>
      <TabHead
        title="Projects"
        sub={`${projects.length} total · ${projects.filter((p) => p.published).length} published`}
        action={<CmsButton onClick={() => setEditing("new")}>+ Add project</CmsButton>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...TAGS].map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={`mono border px-3 py-2 text-[9.5px] uppercase tracking-[0.14em] transition-colors ${
              tag === t
                ? "border-accent bg-accent text-[#0b0b0b]"
                : "border-[var(--line-box)] text-[var(--t-muted)] hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="border border-[var(--line)]">
        {/* header */}
        <div className="mono hidden grid-cols-[52px_1.6fr_128px_1.3fr_92px_120px] gap-[14px] border-b border-[var(--line)] bg-s1 px-[30px] py-3 text-[9.5px] uppercase tracking-[0.14em] text-[var(--t-muted)] md:grid">
          <span>#</span>
          <span>Name</span>
          <span>Tag</span>
          <span>Metric</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>
        {filtered.map((p) => (
          <div
            key={p.id}
            className="grid cursor-pointer grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-[var(--line)] px-4 py-4 transition-colors hover:bg-[var(--accent-hover)] md:grid-cols-[52px_1.6fr_128px_1.3fr_92px_120px] md:gap-[14px] md:px-[30px]"
            onClick={() => setEditing(p)}
          >
            <span className="mono text-[12.5px] text-[var(--t-muted)]">{pad(p.sortIndex + 1)}</span>
            <span className="truncate text-[14px] font-medium text-white">{p.name}</span>
            <span className="mono hidden text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)] md:block">
              {p.tag}
            </span>
            <span className="mono hidden truncate text-[11px] text-accent md:block">{p.metric || "—"}</span>
            <span onClick={(e) => e.stopPropagation()}>
              <StatusPill published={p.published} onClick={() => togglePublished(p.id)} />
            </span>
            <span
              className="mono hidden items-center justify-end gap-2 text-[13px] text-[var(--t-muted)] md:flex"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="hover:text-white" onClick={() => moveProject(p.id, -1)}>
                ↑
              </button>
              <button className="hover:text-white" onClick={() => moveProject(p.id, 1)}>
                ↓
              </button>
              <button
                className="hover:text-danger"
                title={`Delete ${p.name}`}
                onClick={() => {
                  if (confirm(`Delete “${p.name}”? This removes it from the site and the table.`)) {
                    deleteProject(p.id);
                    toast("Project deleted");
                  }
                }}
              >
                ✕
              </button>
            </span>
          </div>
        ))}
      </div>

      <ProjectDrawer
        key={editing === "new" ? "new" : (editing?.id ?? "closed")}
        project={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

/* ---- C3 Media ------------------------------------------------------------- */
export function MediaTab() {
  const media = useMedia();
  const profile = useProfile();

  return (
    <div>
      <TabHead title="Media" sub="Hero image, library and profile photo. Drag to upload." />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="meta-label mb-3">Hero image · 3:4</div>
          {profile.heroUrl ? (
            <div className="relative aspect-[3/4] max-w-[260px] border border-[var(--line-box)]">
              <Image src={profile.heroUrl} alt="hero" fill sizes="260px" className="object-cover" />
              <button
                className="mono absolute right-2 top-2 bg-black/70 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white"
                onClick={() => saveProfile({ heroUrl: null })}
              >
                Clear ✕
              </button>
            </div>
          ) : (
            <Dropzone
              onFile={(url) => {
                saveProfile({ heroUrl: url });
                toast("Hero image updated");
              }}
              hint="Drop hero (3:4)"
              height={300}
            />
          )}
        </div>

        <div>
          <div className="meta-label mb-3">Profile photo</div>
          {profile.photoUrl ? (
            <div className="relative aspect-[3/4] max-w-[200px] border border-[var(--line-box)]">
              <Image src={profile.photoUrl} alt="photo" fill sizes="200px" className="object-cover" />
              <button
                className="mono absolute right-2 top-2 bg-black/70 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white"
                onClick={() => saveProfile({ photoUrl: null })}
              >
                Clear ✕
              </button>
            </div>
          ) : (
            <Dropzone
              onFile={(url) => {
                saveProfile({ photoUrl: url });
                toast("Photo updated");
              }}
              hint="Drop photo"
              height={200}
            />
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="meta-label mb-3">Library · {media.length}</div>
        <div className="mb-4 max-w-[400px]">
          <Dropzone
            onFile={(url) => {
              addMedia(url);
              toast("Added to library");
            }}
            hint="Drop image to add"
            height={120}
          />
        </div>
        <div className="grid grid-cols-2 gap-px bg-[var(--line)] md:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="group relative bg-s0">
              <div className="relative h-[150px] w-full">
                <Image src={m.url} alt={m.caption} fill sizes="220px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="mono truncate text-[9.5px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
                  {m.caption || "—"}
                </span>
                <button
                  className="mono text-[10px] text-[var(--t-muted)] hover:text-danger"
                  onClick={() => deleteMedia(m.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- C4 Profile ----------------------------------------------------------- */
export function ProfileTab() {
  const profile = useProfile();
  return (
    <div>
      <TabHead title="Profile" sub="Shown across the public site." />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <Field label="Name">
            <Input value={profile.name} onChange={(e) => saveProfile({ name: e.target.value })} />
          </Field>
          <Field label="Role">
            <Input value={profile.role} onChange={(e) => saveProfile({ role: e.target.value })} />
          </Field>
          <Field label="Location">
            <Input value={profile.location} onChange={(e) => saveProfile({ location: e.target.value })} />
          </Field>
          <Field label="Bio">
            <Textarea rows={4} value={profile.bio} onChange={(e) => saveProfile({ bio: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <Input value={profile.email} onChange={(e) => saveProfile({ email: e.target.value })} />
            </Field>
            <Field label="GitHub">
              <Input value={profile.github} onChange={(e) => saveProfile({ github: e.target.value })} />
            </Field>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--line)] pt-5">
            <span className="text-[14px] text-white">Available for work</span>
            <Toggle on={profile.available} onChange={(v) => saveProfile({ available: v })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-white">Save button</span>
            <CmsButton onClick={() => toast("Profile saved")}>Save</CmsButton>
          </div>
        </div>

        {/* live preview */}
        <div>
          <div className="meta-label mb-3">Live preview</div>
          <div className="border border-[var(--line-box)] p-6">
            <div className="eyebrow mb-3">
              {profile.role} · {profile.location}
            </div>
            <div className="text-[28px] font-bold leading-[0.95] tracking-[-0.04em] text-white">
              {profile.name}
            </div>
            <p className="mt-3 text-[14px] text-[var(--t-body)]">{profile.bio}</p>
            <div className="mono mt-4 text-[10px] uppercase tracking-[0.14em] text-accent">
              {profile.available ? "● Available for work" : "○ Not available"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- C5 (placeholder — Journey tab lives in components/cms/JourneyTab.tsx) - */

/* ---- C6 CV & Files -------------------------------------------------------- */
export function CvTab() {
  const versions = useCvVersions();
  const profile = useProfile();
  const live = versions.find((v) => v.isLive);

  return (
    <div>
      <TabHead title="CV & Files" sub="Upload a new version; restore any past one." />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="meta-label mb-3">Upload new version</div>
          <Dropzone
            accept="application/pdf"
            onFile={(_url, file) => {
              addCvVersion(file.name, file.size);
              toast("CV uploaded — now live");
            }}
            hint="Drop a PDF"
            height={150}
          />
        </div>
        <div className="border border-[var(--line)] p-6">
          <div className="meta-label mb-3">Live file</div>
          {live ? (
            <>
              <div className="text-[15px] text-white">{live.name}</div>
              <div className="mono mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
                v{live.version} · {bytes(live.sizeBytes)}
              </div>
              <CmsButton className="mt-4" onClick={() => toast("Download (mock)")}>
                Download ↓
              </CmsButton>
            </>
          ) : (
            <p className="text-[13px] text-[var(--t-muted)]">No live CV.</p>
          )}
          <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-5">
            <span className="text-[14px] text-white">Show CV button on site</span>
            <Toggle on={profile.cvVisible} onChange={(v) => saveProfile({ cvVisible: v })} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="meta-label mb-3">Version history</div>
        <div className="border border-[var(--line)]">
          {versions.map((v) => (
            <div
              key={v.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--line)] px-6 py-4 md:grid-cols-[80px_1fr_120px_120px]"
            >
              <span className="mono text-[12.5px] text-[var(--t-muted)]">v{v.version}</span>
              <span className="truncate text-[14px] text-white">{v.name}</span>
              <span className="mono hidden text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)] md:block">
                {bytes(v.sizeBytes)}
              </span>
              <span className="text-right">
                {v.isLive ? (
                  <StatusPill published />
                ) : (
                  <button
                    className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)] hover:text-accent"
                    onClick={() => {
                      restoreCvVersion(v.id);
                      toast(`Restored v${v.version}`);
                    }}
                  >
                    Restore →
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- C7 Settings ---------------------------------------------------------- */
export function SettingsTab() {
  const stack = useMemo(
    () => [
      { name: "Next.js", version: "16.2.10" },
      { name: "React", version: "19.2.4" },
      { name: "TypeScript", version: "5.6" },
      { name: "Tailwind CSS", version: "4.x" },
      { name: "Neon Postgres", version: "serverless" },
    ],
    [],
  );
  const env = [
    { key: "DATABASE_URL", value: "postgres://••••••••@ep-••••.neon.tech" },
    { key: "BLOB_READ_WRITE_TOKEN", value: "vercel_blob_rw_••••••••" },
    { key: "ADMIN_EMAIL", value: "hello@••••••.dev" },
  ];

  return (
    <div>
      <TabHead title="Settings" sub="Stack, environment and danger zone." />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-[var(--line)] p-6">
          <div className="meta-label mb-4">Stack</div>
          {stack.map((s) => (
            <div key={s.name} className="flex justify-between border-b border-[var(--line)] py-2 last:border-0">
              <span className="text-[14px] text-white">{s.name}</span>
              <span className="mono text-[11px] text-[var(--t-muted)]">{s.version}</span>
            </div>
          ))}
        </div>
        <div className="border border-[var(--line)] p-6">
          <div className="meta-label mb-4">Environment (masked)</div>
          {env.map((e) => (
            <div key={e.key} className="border-b border-[var(--line)] py-2 last:border-0">
              <div className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)]">{e.key}</div>
              <div className="mono text-[12px] text-white">{e.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border border-danger/40 p-6" style={{ borderColor: "rgba(255,107,107,0.4)" }}>
        <div className="mono mb-4 text-[10px] uppercase tracking-[0.16em] text-danger">Danger zone</div>
        <div className="flex flex-wrap gap-4">
          <button
            className="mono border border-[var(--line-box)] px-[18px] py-[11px] text-[11px] uppercase tracking-[0.14em] text-white hover:border-danger hover:text-danger"
            onClick={() => {
              if (confirm("Unpublish every project?")) {
                unpublishAll();
                toast("All projects unpublished");
              }
            }}
          >
            Unpublish all
          </button>
          <button
            className="mono border border-[var(--line-box)] px-[18px] py-[11px] text-[11px] uppercase tracking-[0.14em] text-white hover:border-danger hover:text-danger"
            onClick={() => {
              if (confirm("Reset all content to seed? Local changes are lost.")) {
                resetToSeed();
                toast("Reset to seed");
              }
            }}
          >
            Reset to seed
          </button>
        </div>
      </div>
    </div>
  );
}
