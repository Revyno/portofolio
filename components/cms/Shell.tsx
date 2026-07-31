"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useProjects, useMedia, useCvVersions } from "@/lib/store";

export type TabId =
  | "overview"
  | "projects"
  | "media"
  | "profile"
  | "journey"
  | "certificate"
  | "cv"
  | "settings";

const NAV: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "projects", label: "Projects" },
  { id: "media", label: "Media" },
  { id: "profile", label: "Profile" },
  { id: "journey", label: "Journey" },
  { id: "certificate", label: "Certificate" },
  { id: "cv", label: "CV & Files" },
  { id: "settings", label: "Settings" },
];

function Sidebar({ tab, setTab }: { tab: TabId; setTab: (t: TabId) => void }) {
  const projects = useProjects();
  const media = useMedia();
  const cv = useCvVersions();
  const counts: Record<TabId, string> = {
    overview: "",
    projects: String(projects.length),
    media: String(media.length),
    profile: "",
    journey: "",
    certificate: "",
    cv: String(cv.length),
    settings: "",
  };
  return (
    <aside className="flex w-[250px] flex-col border-r border-[var(--line)] bg-s1">
      <div className="border-b border-[var(--line)] px-6 py-5">
        <div className="mono text-[13px] font-medium tracking-[0.14em] text-white">
          REVELLIO CHRISTOPEL OKTUFOVIAN LUMBAA
        </div>
        <div className="mono mt-1 text-[9.5px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
          Content console
        </div>
      </div>
      <nav className="flex-1 py-3">
        {NAV.map((n) => {
          const active = tab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex w-full items-center justify-between border-l-2 px-6 py-[10px] text-left transition-colors ${
                active
                  ? "border-accent bg-[var(--accent-hover)] text-white"
                  : "border-transparent text-[var(--t-muted)] hover:text-white"
              }`}
            >
              <span className="mono text-[11px] font-medium uppercase tracking-[0.12em]">
                {n.label}
              </span>
              {counts[n.id] && (
                <span className="mono text-[10px] text-[var(--t-ghost)]">{counts[n.id]}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-[var(--line)] px-6 py-4">
        <div className="mono flex items-center gap-2 text-[9.5px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
          <span className="inline-block h-[6px] w-[6px]" style={{ background: "var(--positive)" }} />
          Neon Postgres · live
        </div>
        <Link href="/" className="mono mt-2 block text-[9.5px] uppercase tracking-[0.14em] text-[var(--t-muted)] transition-colors hover:text-accent">
          ← View site
        </Link>
      </div>
    </aside>
  );
}

function Topbar({ tab }: { tab: TabId }) {
  return (
    <header className="flex h-[70px] items-center justify-between border-b border-[var(--line)] px-8">
      <div className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
        CMS <span className="text-[var(--t-ghost)]">/</span>{" "}
        <span className="text-white">{tab}</span>
      </div>
      <div className="flex items-center gap-4">
        <input
          placeholder="Search…"
          className="mono hidden w-[220px] border border-[var(--line-box)] bg-field px-3 py-2 text-[11px] text-white placeholder:text-[var(--t-ghost)] outline-none focus:border-accent md:block"
        />
        <UserButton
          appearance={{ elements: { avatarBox: "h-[34px] w-[34px] rounded-none" } }}
        />
      </div>
    </header>
  );
}

export function CmsShell({
  tab,
  setTab,
  children,
}: {
  tab: TabId;
  setTab: (t: TabId) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-s0">
      <div className="hidden md:flex">
        <Sidebar tab={tab} setTab={setTab} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar tab={tab} />
        {/* mobile tab strip */}
        <div className="scroll-thin flex gap-1 overflow-x-auto border-b border-[var(--line)] px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`mono whitespace-nowrap px-3 py-2 text-[10px] uppercase tracking-[0.12em] transition-colors ${
                tab === n.id ? "bg-accent text-[#0b0b0b]" : "text-[var(--t-muted)] hover:text-white"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
        <main className="scroll-thin flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

/** Section header used across tabs. */
export function TabHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h1 className="text-[28px] font-bold tracking-[-0.04em] text-white">{title}</h1>
        {sub && <p className="mt-1 text-[13px] text-[var(--t-muted)]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
