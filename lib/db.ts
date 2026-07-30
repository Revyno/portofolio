import "server-only";
import { neon } from "@neondatabase/serverless";
import type {
  Store,
  Project,
  Post,
  Profile,
  CvVersion,
  MediaItem,
  Tag,
} from "./data";
import { slugify, seed } from "./data";

/**
 * Neon data layer. All SQL lives here; Route Handlers call these.
 * Maps snake_case rows -> the camelCase types the UI already uses (lib/data.ts),
 * so pages/CMS stay untouched.
 */
const sql = neon(process.env.DATABASE_URL!);

// deterministic-ish id fallback not needed: Postgres generates uuids.

// --- row mappers -----------------------------------------------------------
/* eslint-disable @typescript-eslint/no-explicit-any */
function toProject(r: any, media: MediaItem[]): Project {
  return {
    id: r.id,
    sortIndex: r.sort_index,
    slug: r.slug,
    name: r.name,
    tag: r.tag as Tag,
    description: r.description ?? "",
    stack: r.stack ?? "",
    metric: r.metric ?? "",
    year: r.year ?? "",
    published: r.published,
    coverUrl: r.cover_url ?? null,
    media,
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}
function toPost(r: any): Post {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    dek: r.dek ?? "",
    topic: r.topic ?? "",
    readMinutes: r.read_minutes ?? 3,
    publishedAt: r.published_at ? String(r.published_at).slice(0, 10) : "",
    published: r.published,
  };
}
function toCv(r: any): CvVersion {
  return {
    id: r.id,
    version: r.version,
    name: r.name,
    sizeBytes: r.size_bytes ?? 0,
    isLive: r.is_live,
    uploadedAt: new Date(r.uploaded_at).toISOString(),
  };
}
function toProfile(r: any): Profile {
  return {
    name: r.name,
    role: r.role,
    location: r.location,
    bio: r.bio,
    email: r.email,
    github: r.github,
    linkedin: r.linkedin,
    heroUrl: r.hero_url ?? null,
    photoUrl: r.photo_url ?? null,
    available: r.available,
    cvVisible: r.cv_visible,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// --- reads -----------------------------------------------------------------
export async function getProjects(): Promise<Project[]> {
  const [projects, mediaRows] = await Promise.all([
    sql`select * from projects order by sort_index`,
    sql`select * from project_media order by sort_index`,
  ]);
  const byProject = new Map<string, MediaItem[]>();
  for (const m of mediaRows as any[]) {
    const list = byProject.get(m.project_id) ?? [];
    list.push({ id: m.id, url: m.url, caption: m.caption ?? "" });
    byProject.set(m.project_id, list);
  }
  return (projects as any[]).map((p) => toProject(p, byProject.get(p.id) ?? []));
}

export async function getStore(): Promise<Store> {
  const [projects, posts, cv, media, profileRows] = await Promise.all([
    getProjects(),
    sql`select * from posts order by published_at desc nulls last`,
    sql`select * from cv_versions order by version desc`,
    sql`select * from media order by created_at desc`,
    sql`select * from profile where id = 1`,
  ]);
  return {
    projects,
    posts: (posts as any[]).map(toPost),
    cvVersions: (cv as any[]).map(toCv),
    media: (media as any[]).map((m: any) => ({ id: m.id, url: m.url, caption: m.caption ?? "" })),
    profile: toProfile((profileRows as any[])[0]),
  };
}

// --- helpers ---------------------------------------------------------------
async function reindexProjects() {
  // Renumber sort_index 0..n-1 by current order. AC1.
  await sql`
    with ranked as (
      select id, row_number() over (order by sort_index, updated_at) - 1 as rn
      from projects
    )
    update projects p set sort_index = ranked.rn from ranked where p.id = ranked.id`;
}

// --- project mutations -----------------------------------------------------
export async function createProject(input: Partial<Project>): Promise<Project[]> {
  const name = (input.name ?? "").trim() || "Untitled project"; // AC7
  const slug = await uniqueSlug(slugify(name));
  const next = await sql`select coalesce(max(sort_index)+1, 0) as n from projects`;
  await sql`insert into projects
    (sort_index,slug,name,tag,description,stack,metric,year,published,cover_url)
    values (${(next as any)[0].n},${slug},${name},${input.tag ?? "Web App"},
            ${input.description ?? ""},${input.stack ?? ""},${input.metric ?? ""},
            ${input.year ?? String(new Date().getFullYear())},${input.published ?? false},
            ${input.coverUrl ?? null})`;
  await reindexProjects();
  return getProjects();
}

export async function updateProject(id: string, input: Partial<Project>): Promise<Project[]> {
  const name = (input.name ?? "").trim() || "Untitled project"; // AC7
  const slug = await uniqueSlug(slugify(name), id);
  await sql`update projects set
    name=${name}, slug=${slug}, tag=${input.tag ?? "Web App"},
    description=${input.description ?? ""}, stack=${input.stack ?? ""},
    metric=${input.metric ?? ""}, year=${input.year ?? ""},
    published=${input.published ?? false}, cover_url=${input.coverUrl ?? null},
    updated_at=now()
    where id=${id}`;
  await reindexProjects();
  return getProjects();
}

export async function deleteProject(id: string): Promise<Project[]> {
  await sql`delete from projects where id=${id}`;
  await reindexProjects();
  return getProjects();
}

export async function toggleProjectPublished(id: string): Promise<Project[]> {
  await sql`update projects set published = not published, updated_at=now() where id=${id}`;
  return getProjects();
}

export async function moveProject(id: string, dir: -1 | 1): Promise<Project[]> {
  const rows = (await sql`select id, sort_index from projects order by sort_index`) as any[];
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return getProjects();
  await sql`update projects set sort_index=${rows[j].sort_index} where id=${rows[i].id}`;
  await sql`update projects set sort_index=${rows[i].sort_index} where id=${rows[j].id}`;
  return getProjects();
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = ignoreId
      ? await sql`select 1 from projects where slug=${slug} and id<>${ignoreId} limit 1`
      : await sql`select 1 from projects where slug=${slug} limit 1`;
    if ((clash as any[]).length === 0) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// --- profile ---------------------------------------------------------------
export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const cur = toProfile(((await sql`select * from profile where id=1`) as any[])[0]);
  const p = { ...cur, ...patch };
  await sql`update profile set
    name=${p.name}, role=${p.role}, location=${p.location}, bio=${p.bio},
    email=${p.email}, github=${p.github}, linkedin=${p.linkedin},
    hero_url=${p.heroUrl}, photo_url=${p.photoUrl},
    available=${p.available}, cv_visible=${p.cvVisible}
    where id=1`;
  return p;
}

// --- posts -----------------------------------------------------------------
export async function savePost(input: Partial<Post> & { id?: string }): Promise<Post[]> {
  const title = (input.title ?? "").trim() || "Untitled post";
  const slug = slugify(title);
  if (input.id) {
    await sql`update posts set title=${title}, slug=${slug}, dek=${input.dek ?? ""},
      topic=${input.topic ?? ""}, read_minutes=${input.readMinutes ?? 3},
      published=${input.published ?? false},
      published_at=${input.publishedAt || null} where id=${input.id}`;
  } else {
    await sql`insert into posts (slug,title,dek,topic,read_minutes,published,published_at)
      values (${slug},${title},${input.dek ?? ""},${input.topic ?? ""},
              ${input.readMinutes ?? 3},${input.published ?? false},
              ${input.publishedAt || null})`;
  }
  return (await sql`select * from posts order by published_at desc nulls last`).map(toPost as any);
}
export async function deletePost(id: string): Promise<Post[]> {
  await sql`delete from posts where id=${id}`;
  return (await sql`select * from posts order by published_at desc nulls last`).map(toPost as any);
}
export async function togglePostPublished(id: string): Promise<Post[]> {
  await sql`update posts set published = not published where id=${id}`;
  return (await sql`select * from posts order by published_at desc nulls last`).map(toPost as any);
}

// --- media -----------------------------------------------------------------
export async function addMedia(url: string, caption = ""): Promise<MediaItem[]> {
  await sql`insert into media (url,caption) values (${url},${caption})`;
  return (await sql`select * from media order by created_at desc`).map((m: any) => ({
    id: m.id, url: m.url, caption: m.caption ?? "",
  }));
}
export async function deleteMedia(id: string): Promise<MediaItem[]> {
  await sql`delete from media where id=${id}`;
  return (await sql`select * from media order by created_at desc`).map((m: any) => ({
    id: m.id, url: m.url, caption: m.caption ?? "",
  }));
}

// --- cv --------------------------------------------------------------------
export async function addCvVersion(name: string, sizeBytes: number, url: string | null = null): Promise<CvVersion[]> {
  const next = (await sql`select coalesce(max(version)+1,1) as v from cv_versions`) as any[];
  await sql`update cv_versions set is_live=false`;
  await sql`insert into cv_versions (version,name,url,size_bytes,is_live)
    values (${next[0].v},${name},${url},${sizeBytes},true)`;
  return (await sql`select * from cv_versions order by version desc`).map(toCv as any);
}
export async function restoreCvVersion(id: string): Promise<CvVersion[]> {
  await sql`update cv_versions set is_live = (id = ${id})`;
  return (await sql`select * from cv_versions order by version desc`).map(toCv as any);
}

// --- danger zone -----------------------------------------------------------
export async function unpublishAll(): Promise<Project[]> {
  await sql`update projects set published=false, updated_at=now()`;
  return getProjects();
}

export async function resetToSeed(): Promise<Store> {
  await sql`truncate project_media, media, projects, posts, cv_versions restart identity cascade`;
  await sql`delete from profile`;
  const p = seed.profile;
  await sql`insert into profile (id,name,role,location,bio,email,github,linkedin,hero_url,photo_url,available,cv_visible)
    values (1,${p.name},${p.role},${p.location},${p.bio},${p.email},${p.github},${p.linkedin},${p.heroUrl},${p.photoUrl},${p.available},${p.cvVisible})`;
  for (const pr of seed.projects) {
    const rows = (await sql`insert into projects
      (sort_index,slug,name,tag,description,stack,metric,year,published,cover_url,updated_at)
      values (${pr.sortIndex},${pr.slug},${pr.name},${pr.tag},${pr.description},${pr.stack},${pr.metric},${pr.year},${pr.published},${pr.coverUrl},${pr.updatedAt})
      returning id`) as any[];
    let i = 0;
    for (const m of pr.media ?? []) {
      await sql`insert into project_media (project_id,url,caption,sort_index) values (${rows[0].id},${m.url},${m.caption ?? ""},${i++})`;
    }
  }
  for (const m of seed.media) await sql`insert into media (url,caption) values (${m.url},${m.caption})`;
  for (const post of seed.posts)
    await sql`insert into posts (slug,title,dek,topic,read_minutes,published,published_at)
      values (${post.slug},${post.title},${post.dek},${post.topic},${post.readMinutes},${post.published},${post.publishedAt})`;
  for (const v of seed.cvVersions)
    await sql`insert into cv_versions (version,name,size_bytes,is_live,uploaded_at)
      values (${v.version},${v.name},${v.sizeBytes},${v.isLive},${v.uploadedAt})`;
  return getStore();
}
