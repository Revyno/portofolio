import "server-only";
import { neon } from "@neondatabase/serverless";
import type {
  Store,
  Project,
  Journey,
  Certificate,
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
 *
 * Lazy init: `neon()` must not run at module scope — `next build` evaluates
 * this module before Vercel injects env vars.  We defer via a getter so the
 * connection is created on first real query, never during build.
 */
let _sql: ReturnType<typeof neon> | undefined;
function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql(strings, ...values);
}

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
    duration: r.duration ?? "",
    year: r.year ?? "",
    published: r.published,
    coverUrl: r.cover_url ?? null,
    liveUrl: r.live_url ?? null,
    repoUrl: r.repo_url ?? null,
    problemTitle: r.problem_title ?? "",
    problemBody: r.problem_body ?? "",
    media,
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}
// Neon parses `date` columns into JS Date objects at LOCAL midnight (pg-types
// `new Date(y,m-1,d)`). String(date) gives "Mon Apr 27 2026" and toISOString()
// is off-by-one in +TZ, so read Y-M-D off the local components. Strings (already
// "YYYY-MM-DD") pass through untouched.
function ymd(v: unknown): string {
  if (!v) return "";
  if (v instanceof Date) {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
  }
  return String(v).slice(0, 10);
}
function toJourney(r: any): Journey {
  return {
    id: r.id,
    date: ymd(r.date),
    endDate: ymd(r.end_date),
    ongoing: r.ongoing ?? false,
    title: r.title,
    org: r.org ?? "",
    note: r.note ?? "",
    published: r.published,
  };
}
function toCertificate(r: any): Certificate {
  return {
    id: r.id,
    sortIndex: r.sort_index ?? 0,
    year: r.year ?? "",
    title: r.title,
    venue: r.venue ?? "",
    coverUrl: r.cover_url ?? null,
    linkUrl: r.link_url ?? null,
    published: r.published,
  };
}
function toCv(r: any): CvVersion {
  return {
    id: r.id,
    version: r.version,
    name: r.name,
    url: r.url ?? null,
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
  const [projects, journey, certificates, cv, media, profileRows] = await Promise.all([
    getProjects(),
    sql`select * from journey order by date desc`,
    sql`select * from certificates order by sort_index`,
    sql`select * from cv_versions order by version desc`,
    sql`select * from media order by created_at desc`,
    sql`select * from profile where id = 1`,
  ]);
  return {
    projects,
    journey: (journey as any[]).map(toJourney),
    certificates: (certificates as any[]).map(toCertificate),
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

// Gallery is fully replaced on save (matches the drawer's single-form UX) —
// capped at 5 to match the carousel's design budget.
async function syncProjectMedia(projectId: string, media: MediaItem[] | undefined) {
  if (media === undefined) return;
  await sql`delete from project_media where project_id=${projectId}`;
  let i = 0;
  for (const m of media.slice(0, 5)) {
    await sql`insert into project_media (project_id,url,caption,sort_index) values (${projectId},${m.url},${m.caption ?? ""},${i++})`;
  }
}

// --- project mutations -----------------------------------------------------
export async function createProject(input: Partial<Project>): Promise<Project[]> {
  const name = (input.name ?? "").trim() || "Untitled project"; // AC7
  const slug = await uniqueSlug(slugify(name));
  const next = await sql`select coalesce(max(sort_index)+1, 0) as n from projects`;
  const rows = await sql`insert into projects
    (sort_index,slug,name,tag,description,stack,metric,duration,year,published,cover_url,live_url,repo_url,problem_title,problem_body)
    values (${(next as any)[0].n},${slug},${name},${input.tag ?? "Web App"},
            ${input.description ?? ""},${input.stack ?? ""},${input.metric ?? ""},${input.duration ?? ""},
            ${input.year ?? String(new Date().getFullYear())},${input.published ?? false},
            ${input.coverUrl ?? null},${input.liveUrl ?? null},${input.repoUrl ?? null},
            ${input.problemTitle ?? ""},${input.problemBody ?? ""})
    returning id`;
  await syncProjectMedia((rows as any)[0].id, input.media);
  await reindexProjects();
  return getProjects();
}

export async function updateProject(id: string, input: Partial<Project>): Promise<Project[]> {
  const name = (input.name ?? "").trim() || "Untitled project"; // AC7
  const slug = await uniqueSlug(slugify(name), id);
  await sql`update projects set
    name=${name}, slug=${slug}, tag=${input.tag ?? "Web App"},
    description=${input.description ?? ""}, stack=${input.stack ?? ""},
    metric=${input.metric ?? ""}, duration=${input.duration ?? ""}, year=${input.year ?? ""},
    published=${input.published ?? false}, cover_url=${input.coverUrl ?? null},
    live_url=${input.liveUrl ?? null}, repo_url=${input.repoUrl ?? null},
    problem_title=${input.problemTitle ?? ""}, problem_body=${input.problemBody ?? ""},
    updated_at=now()
    where id=${id}`;
  await syncProjectMedia(id, input.media);
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

// --- journey ---------------------------------------------------------------
export async function saveJourney(input: Partial<Journey> & { id?: string }): Promise<Journey[]> {
  const title = (input.title ?? "").trim() || "Untitled milestone";
  const ongoing = input.ongoing ?? false;
  const date = input.date || new Date().toISOString().slice(0, 10);
  const endDate = ongoing ? null : input.endDate || null;
  if (input.id) {
    await sql`update journey set title=${title}, date=${date},
      end_date=${endDate}, ongoing=${ongoing},
      org=${input.org ?? ""}, note=${input.note ?? ""},
      published=${input.published ?? false} where id=${input.id}`;
  } else {
    await sql`insert into journey (date,end_date,ongoing,title,org,note,published)
      values (${date},${endDate},${ongoing},${title},${input.org ?? ""},
              ${input.note ?? ""},${input.published ?? false})`;
  }
  return ((await sql`select * from journey order by date desc`) as any[]).map(toJourney as any);
}
export async function deleteJourney(id: string): Promise<Journey[]> {
  await sql`delete from journey where id=${id}`;
  return ((await sql`select * from journey order by date desc`) as any[]).map(toJourney as any);
}
export async function toggleJourneyPublished(id: string): Promise<Journey[]> {
  await sql`update journey set published = not published where id=${id}`;
  return ((await sql`select * from journey order by date desc`) as any[]).map(toJourney as any);
}

// --- certificates ----------------------------------------------------------
export async function saveCertificate(input: Partial<Certificate> & { id?: string }): Promise<Certificate[]> {
  const title = (input.title ?? "").trim() || "Untitled certificate";
  if (input.id) {
    await sql`update certificates set title=${title}, year=${input.year ?? ""},
      venue=${input.venue ?? ""}, cover_url=${input.coverUrl ?? null}, link_url=${input.linkUrl ?? null},
      published=${input.published ?? false} where id=${input.id}`;
  } else {
    const next = (await sql`select coalesce(max(sort_index)+1,0) as n from certificates`) as any[];
    await sql`insert into certificates (sort_index,year,title,venue,cover_url,link_url,published)
      values (${next[0].n},${input.year ?? ""},${title},${input.venue ?? ""},
              ${input.coverUrl ?? null},${input.linkUrl ?? null},${input.published ?? false})`;
  }
  return ((await sql`select * from certificates order by sort_index`) as any[]).map(toCertificate as any);
}
export async function deleteCertificate(id: string): Promise<Certificate[]> {
  await sql`delete from certificates where id=${id}`;
  return ((await sql`select * from certificates order by sort_index`) as any[]).map(toCertificate as any);
}
export async function toggleCertificatePublished(id: string): Promise<Certificate[]> {
  await sql`update certificates set published = not published where id=${id}`;
  return ((await sql`select * from certificates order by sort_index`) as any[]).map(toCertificate as any);
}

// --- media -----------------------------------------------------------------
export async function addMedia(url: string, caption = ""): Promise<MediaItem[]> {
  await sql`insert into media (url,caption) values (${url},${caption})`;
  return ((await sql`select * from media order by created_at desc`) as any[]).map((m: any) => ({
    id: m.id, url: m.url, caption: m.caption ?? "",
  }));
}
export async function deleteMedia(id: string): Promise<MediaItem[]> {
  await sql`delete from media where id=${id}`;
  return ((await sql`select * from media order by created_at desc`) as any[]).map((m: any) => ({
    id: m.id, url: m.url, caption: m.caption ?? "",
  }));
}

// --- cv --------------------------------------------------------------------
export async function addCvVersion(name: string, sizeBytes: number, url: string | null = null): Promise<CvVersion[]> {
  const next = (await sql`select coalesce(max(version)+1,1) as v from cv_versions`) as any[];
  await sql`update cv_versions set is_live=false`;
  await sql`insert into cv_versions (version,name,url,size_bytes,is_live)
    values (${next[0].v},${name},${url},${sizeBytes},true)`;
  return ((await sql`select * from cv_versions order by version desc`) as any[]).map(toCv as any);
}
export async function restoreCvVersion(id: string): Promise<CvVersion[]> {
  await sql`update cv_versions set is_live = (id = ${id})`;
  return ((await sql`select * from cv_versions order by version desc`) as any[]).map(toCv as any);
}
export async function deleteCvVersion(id: string): Promise<CvVersion[]> {
  await sql`delete from cv_versions where id=${id}`;
  // If the live file was just deleted, promote the newest remaining version.
  const rows = (await sql`select * from cv_versions order by version desc`) as any[];
  if (rows.length > 0 && !rows.some((r) => r.is_live)) {
    await sql`update cv_versions set is_live = true where id=${rows[0].id}`;
  }
  return ((await sql`select * from cv_versions order by version desc`) as any[]).map(toCv as any);
}

// --- danger zone -----------------------------------------------------------
export async function unpublishAll(): Promise<Project[]> {
  await sql`update projects set published=false, updated_at=now()`;
  return getProjects();
}

export async function resetToSeed(): Promise<Store> {
  await sql`truncate project_media, media, projects, journey, certificates, cv_versions restart identity cascade`;
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
  for (const j of seed.journey)
    await sql`insert into journey (date,title,org,note,published)
      values (${j.date},${j.title},${j.org},${j.note},${j.published})`;
  for (const c of seed.certificates)
    await sql`insert into certificates (sort_index,year,title,venue,cover_url,link_url,published)
      values (${c.sortIndex},${c.year},${c.title},${c.venue},${c.coverUrl},${c.linkUrl},${c.published})`;
  for (const v of seed.cvVersions)
    await sql`insert into cv_versions (version,name,size_bytes,is_live,uploaded_at)
      values (${v.version},${v.name},${v.sizeBytes},${v.isLive},${v.uploadedAt})`;
  return getStore();
}
