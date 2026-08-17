"use client";

/**
 * Client content store, backed by Neon via /api/content + /api/mutate.
 * Same export surface as before — pages/CMS are untouched. Strategy:
 *   read  → hydrate once from /api/content, keep in memory, subscribe for updates
 *   write → optimistic local mutation (instant toast/AC6) then POST /api/mutate;
 *           server returns the affected slice and we reconcile with truth.
 * ponytail: no ISR consumer yet, so freshness across tabs relies on this fetch,
 * not revalidateTag. Convert public pages to RSC to get cross-client ISR.
 */

import { useSyncExternalStore } from "react";
import {
  seed,
  slugify,
  type Store,
  type Project,
  type Journey,
  type Certificate,
  type Profile,
  type Tag,
  type MediaItem,
  type CvVersion,
} from "./data";

// --- in-memory state + subscription ---------------------------------------
let state: Store = structuredClone(seed); // seed = SSR/first-paint fallback
const listeners = new Set<() => void>();
let hydrated = false;

function emit() {
  listeners.forEach((l) => l());
}
function set(next: Store) {
  state = next;
  emit();
}
function patch(slice: Partial<Store>) {
  set({ ...state, ...slice });
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  hydrate(); // lazy: first subscriber triggers the network read
  return () => listeners.delete(cb);
}

async function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const res = await fetch("/api/content", { cache: "no-store" });
    if (res.ok) set((await res.json()) as Store);
  } catch {
    hydrated = false; // allow retry on next subscribe
  }
}

// fire a mutation; reconcile returned slice(s) with server truth
async function mutate(action: string, args: Record<string, unknown> = {}) {
  try {
    const res = await fetch("/api/mutate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, args }),
    });
    if (res.ok) {
      const slice = (await res.json()) as Partial<Store>;
      patch(slice);
    } else {
      // server rejected the mutation: roll back optimistic state
      hydrated = false;
      hydrate();
    }
  } catch {
    // network failed: re-pull authoritative state
    hydrated = false;
    hydrate();
  }
}

// local id for optimistic inserts (replaced by server uuid on reconcile)
let idc = 0;
function tmpId(prefix: string): string {
  idc += 1;
  return `tmp-${prefix}-${idc}`;
}

// --- read hooks (unchanged signatures) -------------------------------------
function useSlice<T>(selector: (s: Store) => T, serverFallback: T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => serverFallback);
}
export function useProjects(): Project[] {
  return useSlice((s) => s.projects, seed.projects);
}
export function useJourney(): Journey[] {
  return useSlice((s) => s.journey, seed.journey);
}
export function useCertificates(): Certificate[] {
  return useSlice((s) => s.certificates, seed.certificates);
}
export function useProfile(): Profile {
  return useSlice((s) => s.profile, seed.profile);
}
export function useCvVersions(): CvVersion[] {
  return useSlice((s) => s.cvVersions, seed.cvVersions);
}
export function useMedia(): MediaItem[] {
  return useSlice((s) => s.media, seed.media);
}

export function getSeedProjectBySlug(slug: string): Project | undefined {
  return seed.projects.find((p) => p.slug === slug);
}

// --- derived (pure, unchanged) ---------------------------------------------
export function reindex(list: Project[]): Project[] {
  return [...list].sort((a, b) => a.sortIndex - b.sortIndex).map((p, i) => ({ ...p, sortIndex: i }));
}
export function publicProjects(list: Project[]): Project[] {
  return reindex(list.filter((p) => p.published));
}

// --- project actions -------------------------------------------------------
export function saveProject(input: Partial<Project> & { id?: string }): Project {
  const name = (input.name ?? "").trim() || "Untitled project"; // AC7
  const existing = input.id ? state.projects.find((p) => p.id === input.id) : undefined;

  if (existing) {
    const updated: Project = { ...existing, ...input, name, slug: slugify(name), updatedAt: new Date().toISOString() };
    patch({ projects: reindex(state.projects.map((p) => (p.id === existing.id ? updated : p))) });
    void mutate("updateProject", { ...input, id: existing.id, name });
    return updated;
  }

  const created: Project = {
    id: tmpId("proj"),
    sortIndex: state.projects.length,
    slug: slugify(name),
    name,
    tag: (input.tag as Tag) ?? "Web App",
    description: input.description ?? "",
    stack: input.stack ?? "",
    metric: input.metric ?? "",
    duration: input.duration ?? "",
    year: input.year ?? String(new Date().getFullYear()),
    published: input.published ?? false,
    coverUrl: input.coverUrl ?? null,
    liveUrl: input.liveUrl ?? null,
    repoUrl: input.repoUrl ?? null,
    media: input.media ?? [],
    updatedAt: new Date().toISOString(),
  };
  patch({ projects: reindex([...state.projects, created]) });
  void mutate("createProject", { ...input, name });
  return created;
}

export function deleteProject(id: string) {
  patch({ projects: reindex(state.projects.filter((p) => p.id !== id)) });
  void mutate("deleteProject", { id });
}

export function togglePublished(id: string) {
  patch({
    projects: state.projects.map((p) =>
      p.id === id ? { ...p, published: !p.published, updatedAt: new Date().toISOString() } : p,
    ),
  });
  void mutate("toggleProjectPublished", { id });
}

export function moveProject(id: string, dir: -1 | 1) {
  const list = reindex(state.projects);
  const i = list.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i].sortIndex, list[j].sortIndex] = [list[j].sortIndex, list[i].sortIndex];
  patch({ projects: reindex(list) });
  void mutate("moveProject", { id, dir });
}

// --- profile ---------------------------------------------------------------
export function saveProfile(patchInput: Partial<Profile>) {
  patch({ profile: { ...state.profile, ...patchInput } });
  void mutate("updateProfile", patchInput);
}

// --- journey ---------------------------------------------------------------
export function saveJourney(input: Partial<Journey> & { id?: string }): Journey {
  const title = (input.title ?? "").trim() || "Untitled milestone";
  const existing = input.id ? state.journey.find((j) => j.id === input.id) : undefined;
  if (existing) {
    const updated: Journey = { ...existing, ...input, title };
    patch({ journey: state.journey.map((j) => (j.id === existing.id ? updated : j)) });
    void mutate("saveJourney", { ...input, id: existing.id });
    return updated;
  }
  const today = new Date().toISOString().slice(0, 10);
  const created: Journey = {
    id: tmpId("jrny"),
    date: input.date || today,
    endDate: input.ongoing ? "" : (input.endDate || ""),
    ongoing: input.ongoing ?? false,
    title,
    org: input.org ?? "",
    note: input.note ?? "",
    published: input.published ?? false,
  };
  patch({ journey: [created, ...state.journey] });
  void mutate("saveJourney", { ...input, date: created.date, endDate: created.endDate });
  return created;
}
export function deleteJourney(id: string) {
  patch({ journey: state.journey.filter((j) => j.id !== id) });
  void mutate("deleteJourney", { id });
}
export function toggleJourneyPublished(id: string) {
  patch({ journey: state.journey.map((j) => (j.id === id ? { ...j, published: !j.published } : j)) });
  void mutate("toggleJourneyPublished", { id });
}

// --- certificates ----------------------------------------------------------
export function saveCertificate(input: Partial<Certificate> & { id?: string }): Certificate {
  const title = (input.title ?? "").trim() || "Untitled certificate";
  const existing = input.id ? state.certificates.find((c) => c.id === input.id) : undefined;
  if (existing) {
    const updated: Certificate = { ...existing, ...input, title };
    patch({ certificates: state.certificates.map((c) => (c.id === existing.id ? updated : c)) });
    void mutate("saveCertificate", { ...input, id: existing.id });
    return updated;
  }
  const created: Certificate = {
    id: tmpId("cert"),
    sortIndex: state.certificates.length,
    year: input.year ?? "",
    title,
    venue: input.venue ?? "",
    coverUrl: input.coverUrl ?? null,
    linkUrl: input.linkUrl ?? null,
    published: input.published ?? false,
  };
  patch({ certificates: [...state.certificates, created] });
  void mutate("saveCertificate", input);
  return created;
}
export function deleteCertificate(id: string) {
  patch({ certificates: state.certificates.filter((c) => c.id !== id) });
  void mutate("deleteCertificate", { id });
}
export function toggleCertificatePublished(id: string) {
  patch({ certificates: state.certificates.map((c) => (c.id === id ? { ...c, published: !c.published } : c)) });
  void mutate("toggleCertificatePublished", { id });
}

// --- media -----------------------------------------------------------------
export function addMedia(url: string, caption = ""): MediaItem {
  const item: MediaItem = { id: tmpId("m"), url, caption };
  patch({ media: [item, ...state.media] });
  void mutate("addMedia", { url, caption });
  return item;
}
export function deleteMedia(id: string) {
  patch({ media: state.media.filter((m) => m.id !== id) });
  void mutate("deleteMedia", { id });
}

// --- cv --------------------------------------------------------------------
export function addCvVersion(name: string, sizeBytes: number, url: string | null = null): CvVersion {
  const version = Math.max(0, ...state.cvVersions.map((v) => v.version)) + 1;
  const created: CvVersion = {
    id: tmpId("cv"),
    version,
    name,
    url,
    sizeBytes,
    isLive: true,
    uploadedAt: new Date().toISOString(),
  };
  patch({ cvVersions: [created, ...state.cvVersions.map((v) => ({ ...v, isLive: false }))] });
  void mutate("addCvVersion", { name, sizeBytes, url });
  return created;
}
export function restoreCvVersion(id: string) {
  patch({ cvVersions: state.cvVersions.map((v) => ({ ...v, isLive: v.id === id })) });
  void mutate("restoreCvVersion", { id });
}
export function deleteCvVersion(id: string) {
  patch({ cvVersions: state.cvVersions.filter((v) => v.id !== id) });
  void mutate("deleteCvVersion", { id });
}

// --- settings / danger -----------------------------------------------------
export function unpublishAll() {
  patch({ projects: state.projects.map((p) => ({ ...p, published: false })) });
  void mutate("unpublishAll");
}
export function resetToSeed() {
  set(structuredClone(seed)); // optimistic; server returns authoritative store
  void mutate("resetToSeed");
}
