# Prompt — Revellio Phantom Design System

Salin prompt di bawah ini ke project kamu (Claude Code / project design lain). Taruh folder design system ini di dalam project kamu (misal di `skills/revellio-phantom-design/` atau root), lalu paste prompt-nya.

---

## Prompt (copy-paste)

```
Gunakan design system "Revellio Phantom" yang ada di folder ini sebagai satu-satunya sumber gaya visual.

Langkah wajib sebelum mendesain:
1. Baca readme.md — bagian CONTENT FUNDAMENTALS, VISUAL FOUNDATIONS, dan ICONOGRAPHY adalah aturan yang tidak boleh dilanggar.
2. Link styles.css untuk semua token (warna, tipografi, clip-path, shadow, easing). Jangan hardcode nilai baru — pakai var(--p5-red), var(--font-display), var(--clip-notch), var(--ease-p5), dst.
3. Pakai komponen React di components/ (WiggleMenu, NameTag, KeyHints, AngledPanel, Tag, StatusChip, ActionLink, RankBadge, ListCard, InfoBar, BgmPanel, StripeTransition) — jangan tulis ulang dari nol. Baca <Nama>.prompt.md untuk contoh pemakaian.
4. Contoh layar lengkap ada di ui_kits/portfolio/ dan "Revellio Portfolio.html" (menu → about/resume/projects/socials, GSAP + Three.js backdrop). Sumber asli tema ada di reference/ (ground truth).

Aturan gaya inti:
- Identitas: REVELLIO CHRISTOPEL OKTUFOVIAN LUMBA; navbar/name-tag = "revellio" (NameTag, miring 18°, kiri-atas). Tidak ada logo grafis — jangan menggambar logo.
- Warna: hitam #0d0d0d, merah #d92323, putih; cyan #0dd9ff hanya untuk highlight menu aktif.
- Tipe: Persona5Main (assets/fonts/) untuk teks besar ALL-CAPS, Bebas Neue untuk sub-teks.
- Bentuk: TANPA border-radius; semua container dipotong clip-path (notch/parallelogram), dimiringkan/di-skew; shadow keras tanpa blur.
- State aktif/hover: bar hitam → putih + shadow merah + geser 4-6px.
- Motion: GSAP dengan easing var(--ease-p5) / var(--ease-slam); transisi halaman = garis-garis miring (StripeTransition).
- Copy: label gaya menu game (ALL CAPS, "CONFIRM", "PROJECT LOG", key hints ↑↓ ↵ ESC), stat gaya tag+value (USR revellio).
- Foto: pakai foto milik user di slot yang tersedia; jangan pakai gambar pihak ketiga.

Sumber tema: https://github.com/ffaneto/persona5-website-theme
```

---

## Cara pakai di Claude Code (sebagai Agent Skill)

1. Download zip project ini, extract ke `~/.claude/skills/revellio-phantom-design/` (atau `skills/` di dalam repo kamu).
2. `SKILL.md` sudah kompatibel Agent Skills — Claude Code akan otomatis menemukannya.
3. Panggil dengan: "use the revellio-phantom-design skill" lalu jelaskan yang mau dibuat.

## Catatan asset foto

Foto yang di-drop ke slot gambar di preview tersimpan di browser (localStorage), TIDAK ikut ke dalam zip. Untuk permanen: taruh file fotonya di `assets/photos/` di project kamu dan ganti `src` slot foto ke path itu.
