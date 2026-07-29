# PRD — Revellio Portfolio + CMS

**Owner:** Revellio (full-stack developer)
**Status:** Draft v1 · Juli 2026
**Design ref:** `Portfolio with CMS.dc.html` · sistem visual di `DESIGN.md`

---

## 1. Problem

Portfolio statis bikin setiap update jadi kerjaan developer: edit file, commit, deploy. Akibatnya konten basi — project terbaru tidak masuk, CV di site beda versi dengan yang dikirim ke recruiter, dan foto dokumentasi tidak pernah diunggah karena repot.

## 2. Goal

Portfolio dengan **CMS milik sendiri**: semua konten (project, foto, CV, profil, tulisan) bisa diubah dari browser tanpa deploy, tapi tampilannya tetap tegas satu sistem desain Swiss/dark.

**Berhasil kalau:**
- Tambah 1 project lengkap (teks + cover + 3 foto) < 3 menit, tanpa buka editor kode.
- Ganti CV = upload 1 PDF; versi lama tetap bisa di-restore.
- Publish/unpublish 1 klik dan langsung terlihat di site (≤ 60s revalidate).
- Lighthouse desktop ≥ 95, LCP < 1.5s walau ada scene 3D di case study.

**Non-goal:** multi-user/role, komentar, i18n, blog editor WYSIWYG penuh (v1 cukup markdown), analytics dashboard sendiri.

## 3. Users

| Pengguna | Kebutuhan |
|---|---|
| Revellio (admin, 1 orang) | Update cepat dari laptop maupun HP, tanpa takut merusak layout |
| Recruiter / hiring manager | Scan cepat: role, stack, hasil terukur, CV bisa diunduh |
| Engineer / calon kolaborator | Detail teknis: arsitektur, keputusan, trade-off, kode |
| Klien freelance | Bukti hasil (metrik) dan cara menghubungi |

## 4. Scope — Public site

| # | Screen | Isi wajib |
|---|---|---|
| P1 | Home | Hero (headline + hero image 3:4), meta strip 4 kolom, 3 selected work, prinsip kerja, blok terminal, tombol Download CV |
| P2 | Work | Grid 12 project, filter by tag, hanya `published = true` |
| P3 | Case study | Meta (role, durasi, stack, hasil), problem, diagram arsitektur, cuplikan kode, 4 metrik + caveat jujur, next project |
| P4 | About | Timeline 4 role, heatmap kontribusi, skill bar, talks |
| P5 | Writing | List post: tanggal, judul, dek, topik, waktu baca |
| P6 | Contact | Display type, meta kontak 4 kolom, form 3 field, "what I'm looking for" |

Semua screen wajib punya pasangan mobile 390px.

## 5. Scope — CMS

| # | Tab | Fungsi |
|---|---|---|
| C1 | Overview | 4 stat (projects, published, media, versi CV), recent activity, content health, quick add |
| C2 | Projects | Tabel 12 kolom-data, add / edit / delete, toggle Published↔Draft, filter by tag, reorder |
| C3 | Media | Hero image (3:4, dengan guidance) + library 8+ slot + foto profil, drag-and-drop |
| C4 | Profile | Nama, role, lokasi, bio, email, GitHub, toggle "available for work", live preview |
| C5 | Writing | Tabel post + tombol new/edit |
| C6 | CV & Files | Dropzone PDF, file live + Download, riwayat versi + Restore, toggle "tampilkan tombol CV di site" |
| C7 | Settings | Daftar stack + versi, env vars (masked), danger zone (unpublish, reset to seed) |

### Acceptance criteria (kritis)

- **AC1** Save project → grid public langsung memakai nilai baru; nomor urut (`n`) di-generate ulang berurutan.
- **AC2** Draft hilang dari Work grid & Selected work, tapi tetap ada di tabel CMS dengan pill "Draft".
- **AC3** Delete minta konfirmasi; project hilang dari kedua sisi.
- **AC4** Gambar yang di-drop tetap ada setelah reload (upload ke blob storage, URL disimpan di DB).
- **AC5** Toggle CV OFF → tombol Download CV hilang dari Home hero & Contact.
- **AC6** Setiap aksi simpan memunculkan toast konfirmasi < 300ms setelah klik.
- **AC7** Field wajib kosong (nama) tidak boleh membuat row tanpa judul — fallback "Untitled project".

## 6. Data model (Neon Postgres)

```sql
create table projects (
  id          uuid primary key default gen_random_uuid(),
  sort_index  int  not null,
  slug        text unique not null,
  name        text not null,
  tag         text not null check (tag in ('Web App','3D / Motion','UI Kit','Backend','Open source')),
  description text not null,
  stack       text not null,
  metric      text not null,
  year        text not null,
  published   boolean not null default false,
  cover_url   text,
  updated_at  timestamptz not null default now()
);

create table project_media (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  url         text not null,
  caption     text,
  sort_index  int not null default 0
);

create table posts (
  id      uuid primary key default gen_random_uuid(),
  slug    text unique not null,
  title   text not null,
  dek     text,
  topic   text,
  body_md text,
  read_minutes int,
  published_at date
);

create table cv_versions (
  id          uuid primary key default gen_random_uuid(),
  version     int not null,
  url         text not null,
  size_bytes  int,
  is_live     boolean not null default false,
  uploaded_at timestamptz not null default now()
);

create table profile (
  id        int primary key default 1,
  name      text, role text, location text, bio text,
  email     text, github text, linkedin text,
  hero_url  text,
  available boolean default true,
  cv_visible boolean default true
);
```

**Aturan:** satu row `profile`. `sort_index` yang menentukan urutan tampil, bukan `year`. Hanya satu `cv_versions.is_live`.

## 7. API (Next.js Route Handlers)

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/projects?published=true` | Data Work grid (edge, cached 60s) |
| POST / PATCH / DELETE | `/api/projects[/:id]` | CRUD, admin only |
| PATCH | `/api/projects/:id/publish` | Toggle published |
| POST | `/api/upload` | Upload gambar/PDF → blob, balikkan URL |
| GET / PATCH | `/api/profile` | Baca / update profil |
| GET / POST | `/api/cv` | Riwayat versi / upload versi baru |
| POST | `/api/cv/:version/restore` | Set versi jadi live |

Mutasi memicu `revalidateTag('content')`.

## 8. Tech stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 15** App Router | RSC + ISR: konten dari DB tanpa loading spinner |
| UI runtime | **React 19** | — |
| Bahasa | **TypeScript 5.6** strict | Skema konten aman dari ujung ke ujung |
| Database | **Neon Postgres** serverless | Scale-to-zero, branch per PR untuk uji migrasi |
| Styling | **Tailwind CSS 4** | Grid, spacing scale, hairline utilities |
| Komponen CMS | **Chakra UI 3** | Form, drawer, toast, toggle sudah aksesibel |
| Motion | **GSAP 3** | Scroll timeline & camera move case study |
| 3D | **Three.js r170** via R3F | Scene configurator, lazy-loaded |
| Storage | Vercel Blob | Gambar & PDF |
| Auth | Single-admin (magic link / passkey) | Hanya 1 pengguna |

**Aturan performa:** Three.js dan GSAP hanya `dynamic import` di route yang butuh; budget JS first-load ≤ 220 kB, dicek di CI.

## 9. Milestone

| Fase | Isi | Durasi |
|---|---|---|
| M1 | Skema Neon + seed 12 project + public site P1–P6 statis | 1 minggu |
| M2 | Auth + CMS C2 (Projects CRUD) + revalidate | 1 minggu |
| M3 | Upload gambar (C3) + hero image + C4 Profile | 4 hari |
| M4 | C6 CV versioning + toggle · C5 Writing · C1 Overview | 4 hari |
| M5 | Case study 3D (Three.js + GSAP) + budget CI + polish mobile | 1 minggu |

## 10. Risiko

| Risiko | Mitigasi |
|---|---|
| Scene 3D menghancurkan LCP | Lazy import, fallback 2D duluan, budget byte di CI |
| Cold start Neon terasa | Cache 60s + ISR; halaman publik tidak query per request |
| Konten tanpa metrik → portfolio lemah | Content health di Overview menandai project tanpa metrik/foto |
| Upload gambar besar | Resize di client sebelum upload, batas 5 MB |
| CMS jadi proyek tanpa ujung | Scope beku di 7 tab; sisanya masuk backlog |

## 11. Backlog (setelah v1)

Drag-reorder project · markdown editor + preview untuk Writing · OG image otomatis per project · dark/light toggle (default tetap dark) · export PDF portfolio · log aktivitas nyata dari DB.
