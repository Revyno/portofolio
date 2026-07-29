# Design Spec — Revellio Portfolio (Swiss / Dark Minimal)

Sistem visual untuk `Portfolio with CMS.dc.html` (public site + CMS). Semua nilai di bawah dipakai apa adanya di file. Bikin screen baru → ambil dari sini, jangan bikin warna/ukuran baru.

---

## 1. Color

Base gelap, satu accent, sisanya putih dengan opacity bertingkat.

| Nama | Nilai | Dipakai untuk |
|---|---|---|
| Canvas | `#191919` | Background di luar frame (area kerja) |
| Surface 0 | `#0B0B0B` | Background utama layar & CMS |
| Surface 1 | `#0E0E0E` | Panel sekunder: terminal, code, sidebar CMS, drawer editor |
| Field | `#111` | Background input / textarea / select |
| Accent | `#4CE0FF` | Label mono, angka metrik, garis aktif, tombol primer, toggle ON |
| Accent 60 / 28 | `rgba(76,224,255,.6)` / `.28` | Heatmap level 2 / 1, konektor diagram |
| Accent 22 | `rgba(76,224,255,.22)` | Outline diagonal 45° |
| Accent wash | `rgba(76,224,255,.06)` | Fill node highlight, status pill Published |
| Accent hover | `rgba(76,224,255,.04–.055)` | Hover row, card, tabel CMS |
| Positive | `#7CFFB2` | Output sukses di terminal, badge "live" |
| Danger | `#FF6B6B` | Delete, danger zone (hanya di CMS) |

### Teks
Primary `#fff` · Body `rgba(255,255,255,.62)` · Body soft `.55` · Muted `.45` · Label `.35` · Ghost `.28` (placeholder input).

### Garis
Hairline utama `1px solid rgba(255,255,255,.12)` · frame `.14` · input/box `.16` · border diagram `.2` · grid rule hero `rgba(255,255,255,.055)` tiap 120px · divider dashed `1px dashed rgba(255,255,255,.18–.22)` (dropzone).

**Aturan mutlak: selalu 1px, tanpa shadow, tanpa border-radius.** Satu-satunya shadow di seluruh file: `-40px 0 80px rgba(0,0,0,.5)` pada drawer editor CMS, murni untuk memisahkan layer.

---

## 2. Typography

**Display / UI** — `'Helvetica Neue', Helvetica, Arial, sans-serif`
**Technical** — `'IBM Plex Mono', monospace` (400 & 500) — HANYA untuk label, metadata, tanggal, stack, kode, nav, tombol.

### Skala desktop (1440)

| Peran | Size / LH / Weight | Tracking |
|---|---|---|
| Hero display | `150px / .86 / 700` | `-.055em` |
| Contact display | `168px / .84 / 700` | `-.06em` |
| Page title | `92px / .9 / 700` | `-.05em` |
| Case title | `96px / .9 / 700` | `-.05em` |
| Row title | `30px / 1.1 / 700` | `-.03em` |
| Card title (grid) | `24px / 1.12 / 700` | `-.028em` |
| Metric besar | `44px / 1 / 700` | `-.04em` |
| Pull quote | `21px / 1.55 / 400` | — |
| Body | `15px / 1.65 / 400` | — |
| Eyebrow mono | `11px / 1 / 500` uppercase | `.2em` |
| Meta label mono | `10px` uppercase | `.16em` |
| Nav / tombol mono | `11px / 500` uppercase | `.14em` |
| Code | `12.5px / 1.85–1.9` | — |

### Skala mobile (390)
Hero `46px` · page title `54px` · card title `16px` · metric `30px` · body `14px` · mono label `9.5–10px`. Hit target ≥44px.

### Skala CMS (1440)
Angka statistik `40px/700` · judul drawer `21px/700` · nama row tabel `14px/500` · isi cell `12.5px` · label kolom mono `9.5px` tracking `.14em` · nav sidebar mono `11px/500` tracking `.12em`.

Makin besar tipe, makin negatif tracking. Body `text-wrap: pretty`, headline `text-wrap: balance`.

---

## 3. Grid & Spacing

- Desktop 12 kolom, `gap:24px`, gutter **72px**. Mobile gutter **22px**. CMS gutter **30px**.
- Hero grid rule samar: `repeating-linear-gradient(to right, rgba(255,255,255,.055) 0 1px, transparent 1px 120px)`, offset 72px.
- Alokasi hero: headline `1 / span 9`, kolom kanan `10 / span 3` (hero image + paragraf + CTA).
- Work grid: `repeat(4,1fr)` desktop (2–4 via tweak), `repeat(2,1fr)` mobile. Cell min-height 250 / 172px.
- CMS: sidebar **250px** + main `1fr`; topbar tinggi **70px**; drawer editor **560px**.
- Tabel CMS Projects: `52px 1.5fr 128px 1.35fr 132px 62px 104px 92px`, gap 14px, padding row `16px 30px`.
- Section padding desktop 56–96px · mobile 26–44px · CMS 24–30px.

**Spacing step:** 6 · 9 · 12 · 14 · 18 · 22 · 26 · 30 · 34 · 40 · 56 · 72 · 96.

---

## 4. Komponen — Public site

**Eyebrow** mono 11px uppercase `.2em` accent, margin-bottom 24–34px, selalu di atas headline.
**Meta strip** grid 4 kolom, hairline vertikal, label mono 10px + value 13.5–15px; satu value boleh accent.
**Hero image** slot 3:4 di kolom 10–12, border `rgba(255,255,255,.16)`, tinggi 330px desktop / 210px mobile. Isi default = `assets/hero-dummy.png`, diganti dari CMS → Media → Hero image.
**Project row** grid `80px 3.2fr 1.6fr 1.3fr 120px`, hover accent 5%.
**Project cell** border kanan+bawah, `space-between`: nomor + tag / nama + desc / metrik + baris hairline (stack · tahun).
**Chip filter** border 1px, mono 9.5–10px; aktif = fill accent, teks `#0B0B0B`.
**Tombol primer** fill accent, teks `#0B0B0B`, padding `15px 26px` (site) / `11px 18px` (CMS); hover → `#fff`.
**Metric tile** grid 2×2 dengan `gap:1px` di atas `rgba(255,255,255,.12)`; tile `#0B0B0B`, angka pertama accent.
**Code / terminal** Surface 1, mono 12.5px, prompt `$` accent, komentar `.28`, string & hasil positif `#7CFFB2`, kursor `▌` animasi `cur 1.1s steps(1) infinite`.
**Diagram** kotak hairline + konektor 1px accent 50% + panah border-trick; node highlight = border accent + wash 6%.
**Heatmap** 7 baris, `grid-auto-flow:column`, cell 11px (7px mobile), gap 3px, 4 level.
**Skill bar** track `rgba(255,255,255,.1)` 5px, fill accent.
**Nav** desktop 4 item mono, aktif = underline 2px accent, item terakhir = tombol fill. Mobile tab bar 5 kolom sticky, indikator 2px di atas.

## 5. Komponen — CMS

**Sidebar** Surface 1, brand block + nav; item aktif = bar 2px accent di kiri + teks `#fff`; count mono `.3` di kanan. Footer sidebar: status database + deploy (dot 6px `#7CFFB2`).
**Topbar** 70px: breadcrumb `CMS / Section`, search box hairline, tombol primer, avatar 34px kotak berinisial.
**Tabel** header row Surface 1 dengan label mono; row hairline bawah; hover accent 4%.
**Status pill** padding `6px 10px`, mono 9px uppercase. Published = border+teks accent, wash 12%. Draft = border `.2`, teks `.45`. Klik = toggle.
**Toggle switch** 46×24px kotak, border + fill accent saat ON, knob 16px (`#0B0B0B` di ON, `rgba(255,255,255,.4)` di OFF), `justify-content` flip.
**Input / textarea / select** `#111`, border `.16`, padding `11px 12px`, teks 13px, tanpa radius, tanpa focus ring warna — label mono di atasnya.
**Drawer editor** 560px, absolute kanan, header + body scroll + footer aksi. Delete di kiri (muted → `#FF6B6B`), Cancel + Save di kanan.
**Dropzone** border dashed, padding 44px, glyph `↓` accent 24px, hover border accent.
**Image slot** kotak hairline; tinggi 150px (media grid), 190px (cover), 104px (dokumentasi), 300px (hero), 200px (foto profil). Drag-drop, isi persist.
**Toast** absolute kiri-bawah, fill accent, teks `#0B0B0B` mono 10.5px uppercase, hilang setelah 2.2s.

---

## 6. Motion & State

Hover row/card → background accent 4–5%. Hover tombol → fill `#fff`. Hover teks → `#fff` atau accent. Satu-satunya animasi: kursor kedip. Tanpa parallax, tanpa fade-in on scroll, tanpa easing dramatis. GSAP di produksi hanya untuk scroll timeline case study 3D — bukan untuk UI chrome.

## 7. Expressive break

Satu per halaman, hanya di Home & Contact: kotak outline 45° (260–620px, border accent 20–22%) keluar dari tepi frame, plus display type 150–168px. Sisanya patuh grid 100%.

## 8. Rules

1. Tanpa radius, shadow (kecuali drawer), gradient (kecuali grid rule).
2. Satu accent. Butuh "warna lain" → pakai opacity putih.
3. Mono untuk data & label saja, bukan paragraf.
4. Pemisah = hairline, bukan ruang kosong.
5. Rata kiri. Rata tengah hanya tab bar mobile & tombol full-width mobile.
6. Angka selalu bawa konteks (`p99 2.8s → 86ms`).
7. Tanpa ikon dekoratif — arah pakai glyph `→ ← ↗ ↓ + − ✕ ⌕`.
8. Draft tidak pernah tampil di public grid.

## 9. Data shape

```js
{
  n: '01',                       // urutan 2 digit, di-generate ulang saat save
  name: 'Kanvas Studio',
  tag: 'Web App',                // Web App | 3D / Motion | UI Kit | Backend | Open source
  desc: 'satu kalimat, ±90 karakter',
  stack: 'Next.js · Three.js · GSAP',
  metric: '60fps · +34% add-to-cart',
  year: '2026',
  published: true
}
```

Filter chip dibangun otomatis dari `tag` (count ikut jalan). Tambah project = tambah 1 objek; layout tidak disentuh.
