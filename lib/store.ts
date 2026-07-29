"use client";

/**
 * Mock content store — localStorage-backed, framework-free.
 * Stands in for the Neon+Blob backend (PRD §6-7). Every CMS mutation
 * here maps to one Route Handler + revalidateTag('content') later.
 * ponytail: swap this module for fetch() calls to /api/* when the DB lands.
 */

import { useSyncExternalStore } from "react";
import {
  seed,
  slugify,
  type Store,
  type Project,
  type Post,
  type Profile,
  type Tag,
  type MediaItem,
  type CvVersion,
} from "./data";

const KEY = "revellio.store.v1";

// deterministic id (no Math.random — banned in some runtimes, and stable ids help)
let idc = 0;
function uid(prefix: string): string {
  idc += 1;
  return `${prefix}-${Date.now().toString(36)}-${idc}`;
}

function load(): Store {
  if (typeof window === "undefined") return structuredClone(seed);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(seed);
    return JSON.parse(raw) as Store;
  } catch {
    return structuredClone(seed);
  }
}

let state: Store = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
}
function emit() {
  persist();
  listeners.forEach((l) => l());
}
function set(next: Store) {
  state = next;
  emit();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// --- read hooks ------------------------------------------------------------
function useSlice<T>(selector: (s: Store) => T, serverFallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => serverFallback,
  );
}

export function useProjects(): Project[] {
  return useSlice((s) => s.projects, seed.projects);
}
export function usePosts(): Post[] {
  return useSlice((s) => s.posts, seed.posts);
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

// non-reactive reads (routing / server)
export function getSeedProjectBySlug(slug: string): Project | undefined {
  return seed.projects.find((p) => p.slug === slug);
}

// --- derived ---------------------------------------------------------------
export function reindex(list: Project[]): Project[] {
  return [...list]
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map((p, i) => ({ ...p, sortIndex: i }));
}
export function publicProjects(list: Project[]): Project[] {
  return reindex(list.filter((p) => p.published));
}

// --- project actions -------------------------------------------------------
export function saveProject(input: Partial<Project> & { id?: string }): Project {
  const name = (input.name ?? "").trim() || "Untitled project"; // AC7
  const existing = input.id ? state.projects.find((p) => p.id === input.id) : undefined;

  if (existing) {
    const updated: Project = {
      ...existing,
      ...input,
      name,
      slug: slugify(name),
      updatedAt: new Date().toISOString(),
    };
    const projects = reindex(
      state.projects.map((p) => (p.id === existing.id ? updated : p)),
    );
    set({ ...state, projects });
    return projects.find((p) => p.id === existing.id)!;
  }

  const created: Project = {
    id: uid("proj"),
    sortIndex: state.projects.length,
    slug: slugify(name),
    name,
    tag: (input.tag as Tag) ?? "Web App",
    description: input.description ?? "",
    stack: input.stack ?? "",
    metric: input.metric ?? "",
    year: input.year ?? String(new Date().getFullYear()),
    published: input.published ?? false,
    coverUrl: input.coverUrl ?? null,
    media: input.media ?? [],
    updatedAt: new Date().toISOString(),
  };
  const projects = reindex([...state.projects, created]);
  set({ ...state, projects });
  return projects.find((p) => p.id === created.id)!;
}

export function deleteProject(id: string) {
  set({ ...state, projects: reindex(state.projects.filter((p) => p.id !== id)) });
}

export function togglePublished(id: string) {
  set({
    ...state,
    projects: state.projects.map((p) =>
      p.id === id ? { ...p, published: !p.published, updatedAt: new Date().toISOString() } : p,
    ),
  });
}

export function moveProject(id: string, dir: -1 | 1) {
  const list = reindex(state.projects);
  const i = list.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i].sortIndex, list[j].sortIndex] = [list[j].sortIndex, list[i].sortIndex];
  set({ ...state, projects: reindex(list) });
}

// --- profile ---------------------------------------------------------------
export function saveProfile(patch: Partial<Profile>) {
  set({ ...state, profile: { ...state.profile, ...patch } });
}

// --- posts -----------------------------------------------------------------
export function savePost(input: Partial<Post> & { id?: string }): Post {
  const title = (input.title ?? "").trim() || "Untitled post";
  const existing = input.id ? state.posts.find((p) => p.id === input.id) : undefined;
  if (existing) {
    const updated: Post = { ...existing, ...input, title, slug: slugify(title) };
    set({ ...state, posts: state.posts.map((p) => (p.id === existing.id ? updated : p)) });
    return updated;
  }
  const created: Post = {
    id: uid("post"),
    slug: slugify(title),
    title,
    dek: input.dek ?? "",
    topic: input.topic ?? "Misc",
    readMinutes: input.readMinutes ?? 3,
    publishedAt: input.publishedAt ?? new Date().toISOString().slice(0, 10),
    published: input.published ?? false,
  };
  set({ ...state, posts: [created, ...state.posts] });
  return created;
}
export function deletePost(id: string) {
  set({ ...state, posts: state.posts.filter((p) => p.id !== id) });
}
export function togglePostPublished(id: string) {
  set({
    ...state,
    posts: state.posts.map((p) => (p.id === id ? { ...p, published: !p.published } : p)),
  });
}

// --- media -----------------------------------------------------------------
export function addMedia(url: string, caption = ""): MediaItem {
  const item: MediaItem = { id: uid("m"), url, caption };
  set({ ...state, media: [item, ...state.media] });
  return item;
}
export function deleteMedia(id: string) {
  set({ ...state, media: state.media.filter((m) => m.id !== id) });
}

// --- cv --------------------------------------------------------------------
export function addCvVersion(name: string, sizeBytes: number): CvVersion {
  const version = Math.max(0, ...state.cvVersions.map((v) => v.version)) + 1;
  const created: CvVersion = {
    id: uid("cv"),
    version,
    name,
    sizeBytes,
    isLive: true,
    uploadedAt: new Date().toISOString(),
  };
  set({
    ...state,
    cvVersions: [created, ...state.cvVersions.map((v) => ({ ...v, isLive: false }))],
  });
  return created;
}
export function restoreCvVersion(id: string) {
  set({
    ...state,
    cvVersions: state.cvVersions.map((v) => ({ ...v, isLive: v.id === id })),
  });
}

// --- settings / danger -----------------------------------------------------
export function unpublishAll() {
  set({ ...state, projects: state.projects.map((p) => ({ ...p, published: false })) });
}
export function resetToSeed() {
  set(structuredClone(seed));
}
