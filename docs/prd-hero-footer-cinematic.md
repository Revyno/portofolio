# PRD — Cinematic Hero & Footer (Baroque Plate + GSAP Reveal)

**Owner:** Revellio
**Status:** v2 · dibangun 31 Agustus 2026 (fase 1–3 selesai, fase 0 & 4 belum)
**Design ref:** Château de Versailles landing (lampiran 1) — diadaptasi, bukan disalin
**Sistem visual:** tetap `DESIGN.md` (Swiss / dark minimal, satu accent, 1px line, no radius)
**Induk:** `PRD.md` · **Motion yang sudah ada:** `components/site/motion.tsx`

> **Scope guard.** PRD ini hanya menyentuh **Hero**, **Footer**, **Contact**, header, dan
> **intro page-reveal**. Section Work / About / Journey, CMS, AI assistant, dan data model
> **tidak berubah**.

---

## 0. Perubahan dari draft v1

Empat keputusan diambil saat implementasi, semuanya atas permintaan langsung — dicatat di sini
karena membatalkan hal yang v1 sebut sebagai non-goal:

| # | Draft v1 bilang | Yang dibangun | Alasan |
|---|---|---|---|
| D1 | "Layout terpusat **tidak** diambil" | Hero jadi komposisi terpusat penuh mengikuti referensi: emblem → eyebrow → display type → rule → caption → CV | Diminta eksplisit ("buat agak rapi pakai layout referensinya"). Type system tetap Helvetica — O2 masih berlaku |
| D2 | Contact di luar scope | Contact & footer berbagi **satu** plate yang menyambung | Diminta ("Let's talk gabung dengan footer untuk background"). Dua plate bertumpuk menampakkan seam |
| D3 | Header tidak disebut | Nav transparan selama di puncak halaman, baru memakai bar sendiri setelah di-scroll | Diminta ("headernya dibuat nyatu"). Bar gelap memotong plate jadi dua |
| D4 | `DiagonalBreak` hanya dilepas dari hero (O4) | Dilepas dari hero **dan** Contact | Hatch cyan 45° bertabrakan dengan lukisan di kedua tempat |

Konsekuensi D2: section Contact kini dirender lewat prop `closing` di `PageChrome`, sehingga
berada **di luar `<main>`**. Trade-off yang disengaja — alternatifnya `<footer>` bersarang di
dalam `<main>`, yang lebih buruk. Lihat komentar di `PageChrome`.

Satu hal yang **belum** dikerjakan: fase 0 (baseline Lighthouse) dan fase 4 (pass a11y + mobile).
AC4, AC5, AC6 dan AC10 belum diukur.

---

## 1. Konteks & problem

Hero sekarang (`app/page.tsx:52`) adalah tipografi Swiss di atas canvas kosong: headline clamp 150px, meta strip 4 kolom, satu foto 3:4 di kolom kanan. Tegas, tapi datar — tidak ada momen "masuk ke sesuatu". Footer (`components/site/Chrome.tsx:23`) lebih datar lagi: satu border-top dan sederet link mono.

Referensi Versailles menunjukkan cara menaikkan bobot sinematik **tanpa mengorbankan tipografi**: lukisan full-bleed yang digelapkan sampai nyaris jadi tekstur, hairline kolom vertikal yang membagi bidang, micro-label mono di pinggir kanvas, dan tipe display yang tetap jadi bintang.

**Yang diambil dari referensi**

| Elemen | Adaptasi di sini |
|---|---|
| Lukisan baroque full-bleed, digelapkan berat | `ArtPlate` di belakang Hero + Footer |
| Hairline kolom vertikal di sisi kanan | Rebrand dari `.hero-rule` yang sudah ada — jadi kolom animatable |
| Micro-label mono di pojok (exhibition info, `En`, search) | Sudah ada: `Eyebrow` + `MetaStrip` — tinggal ditempel ke plate |
| Near-black surround | Sudah cocok: `--s0: #0b0b0b` |
| Perasaan "tirai dibuka" saat load | Intro page-reveal GSAP |

Diambil juga saat implementasi (lihat §0 D1): **komposisi terpusat** dan **label vertikal di kedua margin** — dua ciri paling khas referensi.

**Yang TIDAK diambil:** serif display (O2), palet hangat/emas, chrome museum (search icon, language switch). Ketiganya akan mengubah identitas site, bukan sekadar menambah lapisan.

## 2. Goal

Menambah satu lapis sinematik ke dua titik paling "kosong" di site — pembuka dan penutup — sehingga halaman punya **framing**: tirai buka → lukisan → nama, dan di ujung bawah lukisan lagi → kontak.

**Berhasil kalau:**

- G1 Hero dan Footer terbaca sebagai satu "plate" sinematik, tapi diff-nya ≤ 6 file dan tidak menyentuh section lain.
- G2 Motion terasa mahal (slow push-in, mask reveal, stagger), bukan bouncy.
- G3 Tidak ada regresi performa: LCP tetap < 1.5s desktop, CLS ≤ 0.02 (batas dari `PRD.md`).
- G4 `prefers-reduced-motion` dan mobile 390px punya jalur sendiri yang mulus, bukan versi patah.

**Non-goal (eksplisit tidak berubah):**

- Font stack (tetap Helvetica Neue + IBM Plex Mono) — sinematiknya datang dari art + motion, bukan dari ganti tipe.
- Palet & token warna. Accent tetap `#4ce0ff`, tetap satu-satunya warna.
- Struktur single-page + anchor nav + scroll-spy.
- Section Work, About, Journey, halaman `/projects/[slug]`, CMS, AI assistant. (Contact ikut berubah — §0 D2.)
- Data model / API / store. Plate adalah aset statis, **bukan** field CMS baru.
- Rule "no radius / no shadow / 1px line" di `app/globals.css`.

## 3. Scope

Tiga workstream, bisa di-review terpisah:

| # | Workstream | Isi |
|---|---|---|
| **H** | Hero plate | Komposisi terpusat + art layer full-bleed + scrim radial + hairline kolom + label margin + scrub parallax |
| **F** | Closing plate | Satu art layer untuk Contact + footer, clip-path mask reveal, stagger link, rule draw |
| **R** | Page reveal | Tirai intro GSAP sekali per sesi, meng-orkestrasi H |
| **N** | Header | Nav transparan di puncak, bar penuh setelah scroll (§0 D3) |

Opsional fase lanjutan: **T** — route transition ke `/projects/[slug]` pakai React `<ViewTransition>` (lihat §11 O3).

## 4. Aset

Dua lukisan dari lampiran, sudah terpasang.

| Slot | Sumber | File | Ukuran |
|---|---|---|---|
| Hero | Lampiran 2 — *Creation of Adam* (parodi kucing) | `public/assets/art/hero-plate.jpg` | 1200×800, 153 KB |
| Footer + Contact | Lampiran 3 — fresco langit-langit baroque | `public/assets/art/footer-plate.jpg` | 1200×675, 142 KB |

Aturan aset:

- **A1** Statis di `/public`, bukan lewat CMS. Alasan: plate ini bagian dari layout, bukan konten — dan file lokal + `priority` menjaga LCP. `profile.heroUrl` tetap CMS-managed, sekarang dipakai sebagai emblem kecil di puncak hero.
- **A2** Sumber JPG; `next/image` yang mengurus AVIF/WebP, sizing dan cache. Tidak perlu mengonversi manual — itu revisi dari v1 yang menyebut AVIF pre-encoded.
- **A3** Art direction mobile lewat `object-position` per breakpoint (`--focal` / `--focal-m`, lihat `plates.ts`), bukan dua file terpisah. Satu file berarti tidak ada risiko browser mengunduh dua-duanya, dan crop phone hero tetap memegang dua tangan yang hampir bersentuhan.
- **A4** Keduanya karya public domain yang diolah; provenance dicatat di komentar `plates.ts`.
- **A5** Resolusi sumber (1200px) di bawah ideal untuk plate full-bleed di layar ≥ 1440px. Di balik scrim 0.86–0.94 ini tidak kelihatan, tapi kalau nanti scrim diturunkan, ganti dengan sumber ~2400px lebih dulu.

## 5. File yang disentuh

| File | Perubahan |
|---|---|
| `components/site/ArtPlate.tsx` | **Baru.** Art layer + scrim + kolom, mode `scrub` (hero) / `reveal` (penutup). Empat elemen transform bertingkat supaya animasi load dan scrub tidak berebut matrix yang sama. |
| `components/site/PageVeil.tsx` | **Baru.** Tirai intro 5 panel + boot script inline. |
| `components/site/veil.ts` | **Baru.** Koordinasi tirai: `VEIL_BOOT`, `veilPending()`, `onVeilDone()`. Dipisah dari `PageVeil` supaya `motion.tsx` bisa ikut menunggu tanpa import melingkar. |
| `components/site/plates.ts` | **Baru.** Path + focal point dua lukisan. Satu-satunya tempat nama file disebut (tukar hero↔footer = satu baris). |
| `components/site/motion.tsx` | Tambah `MaskReveal` + `RuleDraw`; `SplitReveal`/`Reveal` dapat prop `hold`; `SplitReveal` pindah dari inline opacity ke class `.sr-hold`/`.sr-shown`. |
| `app/page.tsx` | Hero dirombak jadi komposisi terpusat + `ArtPlate` + `PageVeil`; Contact dilewatkan sebagai `closing`; `DiagonalBreak` dilepas dari keduanya. |
| `components/site/Chrome.tsx` | `PageChrome` dapat prop `closing` (satu plate untuk Contact + footer); `Footer` dapat prop `plate` untuk halaman yang berdiri sendiri. |
| `components/site/Nav.tsx` | `useAtTop()` — nav transparan di puncak, bar penuh setelah scroll. |
| `app/globals.css` | Token `--plate-*`; class `.veil`/`.veil-panel`, `.plate-scrim`(+`-even`), `.plate-col`, `.plate-img`, `.plate-fallback`, `.v-label`, `.mr-mask`, `.sr-hold`/`.sr-shown`. |

**Yang sengaja TIDAK disentuh:** `app/layout.tsx` (veil di-mount dari `app/page.tsx` saja, supaya CMS, sign-in, dan `/projects/[slug]` bersih), `lib/*`, semua route API, dan section Work / About / Journey.

## 6. Motion spec

Semua pakai GSAP yang sudah terpasang (`gsap@3.15`, ScrollTrigger + SplitText sudah diregistrasi di `components/site/gsap.ts`) dan wrapper `useGSAP` yang sudah ada — **tidak ada dependency baru**.

### 6.1 Loading screen (workstream R)

Mengadopsi konsep dari PRD *Loading Screen & Page Transition* (Feast ID), **Arah A** —
sambutan brand di kunjungan pertama. Palet: latar **hitam**, wordmark **putih**.

Wordmark: "Revellio" dengan face script (**Yesteryear**, sudah ada di dependensi lewat
`next/font/google` — sebelumnya di-import tapi tidak terpakai), **ditulis**, bukan di-wipe.

Mekanismenya — ini yang membedakan "sedang digambar" dari "tirai geser":

- Satu path (`WRITE_PATH`) menyusuri kata seperti gerak tangan: naik-turun, monoton ke kanan.
- Path itu di-stroke setebal 340 unit dan dipakai sebagai **SVG mask** untuk `<text>`-nya. Jadi huruf muncul mengikuti gerak pena, dan tepi reveal-nya miring/berombak — bukan garis vertikal lurus.
- Mata penanya adalah **path yang sama**, digambar sebagai satu dash pendek (`stroke-dasharray: 0.005 1`) yang berjalan sepanjangnya. Path sama, easing sama → pena selalu persis di ujung goresan, tanpa timeline kedua yang harus disinkronkan.
- `pathLength="1"` menormalkan panjang path, jadi seluruh animasi cuma satu nilai `1 → 0` dan tidak ada JS yang perlu mengukur path.
- `<text>` dikunci `textLength="560"` + `lengthAdjust="spacingAndGlyphs"` di dalam viewBox 680×340. Lebar natural font di ukuran ini 543, jadi regangannya **1,03×** — tidak kelihatan mata. `textLength` dipasang bukan untuk mengubah bentuk huruf, tapi supaya geometrinya deterministik: mask tetap sejajar dengan huruf walau yang ter-render font fallback, bukan Yesteryear. Nilai yang jauh dari lebar natural akan mendistorsi letterform.

**Pembagian tanggung jawab — ini inti desainnya:**

| Bagian | Dijalankan oleh | Alasan |
|---|---|---|
| Keputusan "tampil atau tidak" | Boot script inline, saat HTML di-parse | Sebelum paint pertama; kunjungan ulang & reduce-motion tidak pernah berkedip hitam |
| Goresan wordmark | **CSS `@keyframes`** | **FR-1.** Mulai saat parse, bukan saat hidrasi. Kalau ini dipegang JS, "loading screen" berubah jadi layar hitam kosong yang panjangnya ditentukan koneksi pengunjung — persis cacat F2 yang mau dihindari |
| Keluarnya tirai | GSAP, setelah hidrasi | Pada titik ini JS sudah pasti jalan |

| t (s) | Elemen | Dari → ke | Durasi |
|---|---|---|---|
| 0.00 | `html.veil-on` | scroll di-lock, layar hitam | — |
| 0.15 | `.veil-write` (mask) | `stroke-dashoffset 1 → 0` | 1.25 |
| 0.15 | `.veil-pen` | dash pendek berjalan `0 → -1`, muncul di 6% lalu lepas di 100% | 1.25 |
| ≥1.48 | `.veil-stage` | `y 0 → -20`, `opacity 1 → 0` | 0.35 |
| +0.25 | 5 × `.veil-panel` | `yPercent 0 → -100`, stagger 0.05 | 0.80 |

Keluar mengikuti **kesiapan halaman**, bukan timer tetap (**FR-3**): begitu `load` selesai,
ditahan lantai `MIN_MS` 1480 ms supaya goresan tidak terpotong di tengah, dan plafon `MAX_MS`
3000 ms supaya satu aset lambat tidak menyandera halaman. Failsafe keras 5 s untuk tab yang
di-background, tempat rAF dan animasi di-throttle. Total di koneksi cepat ≈ **2,5 s**.

Guard:

- **R1** Sekali per sesi (`sessionStorage`). Reload / balik dari case study → tidak render sama sekali.
- **R2** Default CSS-nya `display: none`; boot script yang meng-opt-in. Navigasi client-side yang me-mount ulang `PageVeil` tidak menjalankan script itu, jadi tidak bisa berkedip hitam.
- **R3 (FR-4)** `pointer-events` dimatikan begitu tirai mulai keluar, dan komponennya di-unmount di akhir — tidak ada overlay tak terlihat yang menelan klik.
- **R4** `SplitReveal`/`Reveal` hero pakai prop `hold` → menunggu event `veil:done`, supaya headline tidak naik di balik tirai. Ada failsafe 3 s di `onVeilDone`.
- **R5 (FR-5)** Wordmark satu text node di dalam `role="status"`, jadi pembaca layar membacanya sebagai satu kata, bukan mengeja per-span.
- **R6 (FR-2)** Reduce-motion: boot script tidak memasang class, plus `@media` yang mem-`display:none`-kan `.veil` — dua lapis, karena satu lapisnya CSS dan satunya JS.
- **R7** `z-index: 10000` — di atas launcher AI assistant (`z-9999`), supaya tombol "Chat AI" tidak melayang di atas loading screen.

**Yang tidak diadopsi dari PRD sumber:** transisi antar-route (situs ini single-page dengan
anchor, jadi tidak ada perpindahan route untuk dianimasikan kecuali ke `/projects/[slug]` —
lihat O3), dan `loading.tsx` per segmen.

### 6.2 Hero scrub (workstream H)

Saat user scroll keluar dari hero, plate ikut bergerak — ini yang bikin terasa "kamera", bukan wallpaper.

```
ScrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: 0.6 }
  img          : yPercent  0    → -12
  img          : scale     1    →  1.06
  .plate-scrim : opacity   0.62 →  0.94   // section berikutnya balik ke canvas bersih
```

`Parallax` yang sudah ada dipakai apa adanya untuk foto 3:4 di kolom kanan — tidak diubah.

### 6.3 Footer reveal (workstream F)

Trigger `start: "top 90%"`, `once: true`.

| Urutan | Elemen | Dari → ke | Durasi | Ease |
|---|---|---|---|---|
| 0.00 | rule atas footer | `scaleX 0 → 1`, origin left | 0.80 | `power3.inOut` |
| 0.10 | plate | `clip-path: inset(100% 0 0 0) → inset(0%)` | 1.20 | `expo.out` |
| 0.10 | plate img | `scale 1.10 → 1` | 1.60 | `power2.out` |
| 0.55 | baris copyright + 4 link | mask reveal `yPercent 115 → 0`, stagger 0.07 | 0.75 | `expo.out` |

Ditambah scrub halus (`scrub: 0.8`, `yPercent -8 → 0`) supaya fresco-nya "turun" pelan saat footer masuk viewport.

### 6.4 Reduced motion & mobile

| Kondisi | Perilaku |
|---|---|
| `prefers-reduced-motion: reduce` | Veil tidak render. Tidak ada scrub, tidak ada SplitText. Plate tampil statis dengan scrim final (0.62 hero / 0.70 footer). Semua konten visible di first paint. |
| `< 768px` (`isMobile()` yang sudah ada) | Veil = **satu** panel fade-out 0.5s (bukan 5 panel). Headline pakai jalur fade yang sudah ada di `SplitReveal` (SplitText di-skip — reflow-nya sudah pernah jadi bug). Scrub parallax **off**, plate statis. Pakai varian `*-portrait.avif`. |
| Tab tidak aktif saat load | Fail-safe `setTimeout` 3s yang force-remove veil, supaya tidak ada kasus layar tertutup permanen saat tab di-restore. |

## 7. Token & CSS baru

Tambahan di `app/globals.css` — tidak ada token lama yang diubah nilainya.

```css
:root {
  --plate-ink: #0b0b0b;                    /* = --s0, dinamai ulang untuk scrim */
  --plate-scrim-hero: 0.62;                /* opacity akhir setelah intro */
  --plate-scrim-footer: 0.70;
  --plate-col: rgba(255, 255, 255, 0.09);  /* hairline kolom, di atas --line-rule */
}
```

- `.plate-scrim` — dua lapis: flat `rgba(11,11,11,var(--plate-scrim-hero))` + `linear-gradient(180deg, rgba(11,11,11,.86) 0%, rgba(11,11,11,.55) 45%, rgba(11,11,11,.95) 100%)`. Lapis gradient menjamin sudut atas (tempat Nav) dan sudut bawah (tempat MetaStrip) selalu pekat.
- `.plate-col` — kolom hairline 1px tiap 120px di ≥ md, hilang di mobile. Ini versi animatable dari `.hero-rule` yang sekarang statis; `.hero-rule` dipertahankan sebagai fallback reduced-motion.
- `.veil-panel` — `position: fixed; inset: 0; background: var(--plate-ink); will-change: transform;`
- Rule `* { border-radius: 0 !important }` tetap berlaku; plate tidak minta pengecualian.

## 8. Acceptance criteria

- **AC1** First load (sesi baru): tirai naik, plate push-in, headline naik per kata — satu gerakan yang nyambung, bukan tiga animasi yang kebetulan barengan.
- **AC2** Reload di sesi yang sama: **tidak ada tirai sama sekali**, hero langsung terbaca, tidak ada flash hitam.
- **AC3** `prefers-reduced-motion: reduce`: semua konten visible di first paint, nol animasi, nol layout shift.
- **AC4** Kontras headline putih di atas plate ≥ 4.5:1, diukur di 3 titik paling terang lukisan (mobile & desktop terpisah).
- **AC5** Lighthouse desktop: LCP ≤ 1.5s, CLS ≤ 0.02, skor performa tidak turun > 3 poin dari baseline. Baseline diukur dan dicatat **sebelum** fase 1 dimulai.
- **AC6** Mobile 390px: tidak ada horizontal overflow, plate tidak menutupi teks, tab bar bawah tetap terbaca di atas footer plate.
- **AC7** Section Work / About / Journey / Contact **identik piksel** dengan sebelumnya. Diff hanya menyentuh 6 file di §5.
- **AC8** Link footer tetap fokusable via keyboard selama plate beranimasi; focus ring terlihat di atas lukisan.
- **AC9** Setelah intro selesai, scroll-spy Nav dan anchor `/#work` dst tetap akurat — `ScrollTrigger.refresh()` dipanggil di akhir timeline.
- **AC10** Navigasi ke `/projects/[slug]` lalu back: tidak ada veil kedua, tidak ada ScrollTrigger yatim (`ScrollTrigger.getAll().length` stabil).

## 9. Performance & a11y budget

- **P1** Tambahan payload ≤ **420 KB** (4 file AVIF). Tidak ada JS library baru — GSAP sudah ada di bundle.
- **P2 (risiko utama)** Tirai opaque **menunda LCP**: elemen LCP hero baru "terlihat" saat veil lewat. Karena itu veil wajib bersih di **≤ 900ms**. Kalau pengukuran fase 2 menunjukkan LCP > 1.5s, mitigasi berurutan: (a) stagger panel 0.06 → 0.04, (b) mulai lift di 0.05s, (c) turunkan veil jadi satu panel fade 0.4s di semua breakpoint.
- **P3** Hero plate: `priority`, `sizes="100vw"`, `fetchPriority="high"`. Footer plate: lazy, tidak boleh ikut antre di critical path.
- **P4** Animasi hanya `transform`, `opacity`, `clip-path`. Tidak ada animasi `width/height/top/left`.
- **P5** `will-change: transform` hanya di veil panel dan plate img, dilepas setelah timeline selesai.
- **P6** Lukisan murni dekoratif → `alt=""` + `aria-hidden`, tidak masuk urutan baca screen reader.

## 10. Fase kerja

| Fase | Isi | Selesai kalau |
|---|---|---|
| **0** | Ukur baseline Lighthouse. Siapkan & optimasi 4 aset. | Angka baseline tercatat; aset masuk budget §4. |
| **1** | `ArtPlate` statis di hero (tanpa motion). Uji kontras + LCP. | AC4, AC5 lulus tanpa motion. |
| **2** | Hero scrub + `PageVeil` intro. | AC1, AC2, AC3, AC9 lulus. |
| **3** | Footer plate + mask reveal. | AC6, AC8 lulus. |
| **4** | Pass a11y + mobile + review diff. | AC7, AC10 lulus. |

Fase 1 punya nilai sendiri: kalau motion ditunda, plate statis saja sudah menaikkan hero.

## 11. Open decisions

- **O1 — Pemetaan gambar. _(terpasang: lampiran 2 → hero, lampiran 3 → penutup)_** Masih layak dicoba versi tukarnya: fresco langit-langit komposisinya paling dekat ke referensi, dan dua tangan yang hampir bersentuhan di *Creation of Adam* justru kuat sebagai penutup, tepat di atas link kontak. Tukar = tukar dua baris di `components/site/plates.ts`, tidak ada file lain yang menyebut nama gambar.
- **O2 — Serif display untuk headline.** Referensi pakai serif. Rekomendasi: **tidak**. Ganti font = ganti identitas, melanggar scope guard. Kalau tetap ingin nuansa itu, batasi ke `Eyebrow` hero saja sebagai eksperimen terpisah.
- **O3 — Route transition ke case study.** Next 16 punya `experimental.viewTransition` + React `<ViewTransition>` (`node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`). Menarik untuk morph cover project → hero case study, tapi menyentuh `next.config.ts` + `ProjectRow` + `/projects/[slug]` — di luar scope guard, taruh di PRD terpisah. Kalau dikerjakan: **jangan** campur curtain GSAP dengan View Transition di navigasi yang sama; keduanya rebut kontrol frame yang sama.
- **O4 — `DiagonalBreak`. _(selesai: dilepas dari hero dan Contact)_** Komponennya masih diekspor dari `Chrome.tsx` tapi kini tidak dipakai di mana pun. Keputusan yang tersisa: hapus, atau simpan untuk section lain. `DESIGN.md` masih menyebutnya sebagai elemen "expressive break", jadi salah satunya perlu diperbarui.
- **O5 — Foto hero. _(selesai: dihapus dari hero)_** Sempat dicoba jadi emblem terpusat, lalu dilepas — hero sekarang murni lukisan + tipe. **Konsekuensi yang perlu diputuskan:** `profile.heroUrl` kini tidak dirender di mana pun di site publik; yang tersisa hanya slot upload-nya di CMS (`components/cms/tabs.tsx:201`). Jadi CMS masih menawarkan "hero image" yang tidak muncul di halaman mana pun. Pilihannya: hapus slotnya dari CMS, atau pakai ulang field-nya untuk sesuatu yang lain (mis. OG image).
- **O6 — Panjang bio di hero.** Sekarang `line-clamp-3`; bio penuh tetap di About. Kalau bio diperpendek dari CMS, clamp bisa dilepas.

## 12. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Veil menunda LCP lewat 1.5s | Melanggar goal produk induk | §9 P2, tangga mitigasi bertingkat |
| Lukisan terlalu ramai → headline tidak terbaca | Hero gagal fungsi | Scrim dua lapis; AC4 wajib lulus sebelum motion dikerjakan |
| Baroque + accent cyan saling tabrak | Identitas kabur | Accent hanya di eyebrow & status dot; tidak ada elemen cyan besar di atas lukisan |
| SplitText di hero reflow lagi (bug lama) | Flash teks di kiri-atas | Jalur mobile tetap fade; timeline menunggu `veil:done` (R4) |
| Scrub parallax jank di HP mid-range | Scroll patah | Scrub off di < 768px (§6.4) |
| Aset lukisan besar bikin repo bengkak | Clone lambat | Hanya AVIF final yang di-commit, sumber mentah tidak |

---

**Ringkas satu kalimat:** dua lukisan baroque yang digelapkan jadi *plate* di pembuka dan penutup, satu tirai GSAP yang mengangkat halaman sekali per sesi, dan gerak scrub yang membuat lukisan terasa seperti kamera — tanpa menyentuh satu piksel pun di luar hero dan footer.
