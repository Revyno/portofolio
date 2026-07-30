// Apply schema + seed Neon from lib/data.ts. Run: node scripts/seed.mjs
// Idempotent-ish: truncates content tables, re-inserts seed. Safe to re-run.
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

// Node 22 strips TS types (run with --experimental-strip-types), so we import
// the single source of truth directly instead of re-declaring the seed here.
const { seed } = await import("../lib/data.ts");

const sql = neon(process.env.DATABASE_URL);

// --- schema --------------------------------------------------------------
const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
for (const stmt of schema.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) {
  await sql.query(stmt);
}
console.log("schema applied");

// --- reset content -------------------------------------------------------
await sql`truncate project_media, media, projects, posts, cv_versions restart identity cascade`;
await sql`delete from profile`;

// --- profile -------------------------------------------------------------
const p = seed.profile;
await sql`insert into profile (id,name,role,location,bio,email,github,linkedin,hero_url,photo_url,available,cv_visible)
  values (1,${p.name},${p.role},${p.location},${p.bio},${p.email},${p.github},${p.linkedin},${p.heroUrl},${p.photoUrl},${p.available},${p.cvVisible})`;

// --- projects (+ media) --------------------------------------------------
for (const pr of seed.projects) {
  const rows = await sql`insert into projects
    (sort_index,slug,name,tag,description,stack,metric,year,published,cover_url,updated_at)
    values (${pr.sortIndex},${pr.slug},${pr.name},${pr.tag},${pr.description},${pr.stack},${pr.metric},${pr.year},${pr.published},${pr.coverUrl},${pr.updatedAt})
    returning id`;
  const id = rows[0].id;
  let i = 0;
  for (const m of pr.media ?? []) {
    await sql`insert into project_media (project_id,url,caption,sort_index) values (${id},${m.url},${m.caption ?? ""},${i++})`;
  }
}

// --- media library -------------------------------------------------------
for (const m of seed.media) {
  await sql`insert into media (url,caption) values (${m.url},${m.caption})`;
}

// --- posts ---------------------------------------------------------------
for (const post of seed.posts) {
  await sql`insert into posts (slug,title,dek,topic,read_minutes,published,published_at)
    values (${post.slug},${post.title},${post.dek},${post.topic},${post.readMinutes},${post.published},${post.publishedAt})`;
}

// --- cv ------------------------------------------------------------------
for (const v of seed.cvVersions) {
  await sql`insert into cv_versions (version,name,url,size_bytes,is_live,uploaded_at)
    values (${v.version},${v.name},${null},${v.sizeBytes},${v.isLive},${v.uploadedAt})`;
}

const counts = await sql`select
  (select count(*) from projects)::int projects,
  (select count(*) from posts)::int posts,
  (select count(*) from media)::int media,
  (select count(*) from cv_versions)::int cv,
  (select count(*) from profile)::int profile`;
console.log("seeded:", counts[0]);
