/**
 * Seed content + types. Single source of truth for the mock store.
 * Mirrors the Neon schema in PRD.md §6 (kept flat for the client store).
 * ponytail: in-memory/localStorage stand-in for Neon+Blob.
 * add real DB when DATABASE_URL/BLOB_RW_TOKEN exist (see PRD §6-7).
 */

export const TAGS = [
  "Web App",
  "3D / Motion",
  "UI Kit",
  "Backend",
  "Open source",
] as const;
export type Tag = (typeof TAGS)[number];

export type Project = {
  id: string;
  sortIndex: number;
  slug: string;
  name: string;
  tag: Tag;
  description: string;
  stack: string;
  metric: string;
  year: string;
  published: boolean;
  coverUrl: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  media: { id: string; url: string; caption: string }[];
  updatedAt: string;
};

export type Journey = {
  id: string;
  date: string; // ISO date (YYYY-MM-DD) — start
  endDate: string; // ISO date, "" if ongoing/unset
  ongoing: boolean; // true = show "Present" instead of endDate
  title: string;
  org: string;
  note: string;
  published: boolean;
};

export type Certificate = {
  id: string;
  year: string;
  title: string;
  venue: string;
  coverUrl: string | null; // uploaded image (data URL or blob URL)
  linkUrl: string | null; // GDrive/external link to view the full certificate
  published: boolean;
  sortIndex: number;
};

export type CvVersion = {
  id: string;
  version: number;
  name: string;
  url: string | null;
  sizeBytes: number;
  isLive: boolean;
  uploadedAt: string;
};

export type Profile = {
  name: string;
  role: string;
  location: string;
  bio: string;
  email: string;
  github: string;
  linkedin: string;
  heroUrl: string | null;
  photoUrl: string | null;
  available: boolean;
  cvVisible: boolean;
};

export type MediaItem = { id: string; url: string; caption: string };

export type Store = {
  projects: Project[];
  journey: Journey[];
  certificates: Certificate[];
  cvVersions: CvVersion[];
  profile: Profile;
  media: MediaItem[];
};

// --- helpers ---------------------------------------------------------------
export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled"
  );
}
export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// --- static (non-editable) content ----------------------------------------
export const timeline: { year: string; role: string; org: string; note: string }[] = [
  // {
  //   year: "2026 —",
  //   role: "Full-stack Developer",
  //   org: "Independent",
  //   note: "Product-grade web apps, self-hosted CMS, 3D case studies.",
  // },
  // {
  //   year: "2024",
  //   role: "Frontend Engineer",
  //   org: "Kanvas Studio",
  //   note: "Design-system work, shipped a configurator on R3F.",
  // },
  // {
  //   year: "2023",
  //   role: "Junior Developer",
  //   org: "Loop Labs",
  //   note: "Internal tools on Next.js + Postgres, first CI pipelines.",
  // },
  // {
  //   year: "2022",
  //   role: "Started building for the web",
  //   org: "Self-taught",
  //   note: "HTML/CSS/JS, then React. Never stopped.",
  // },
];

export const skills = [
  { name: "Problem Solving", level: 0.92, note: "strict, end-to-end logic ." },
  { name: "Comunication", level: 0.8, note: "Able to convey technical concepts clearly." },
  { name: "Teamwork", level: 0.7, note: "Collaborative and supportive team player." },
  // system design
  { name: "System Design", level: 0.9, note: "Able to design scalable and maintainable systems." },
];

// --- seed ------------------------------------------------------------------
function proj(
  i: number,
  name: string,
  tag: Tag,
  description: string,
  stack: string,
  metric: string,
  year: string,
  published: boolean,
  cover: string,
): Project {
  return {
    id: `seed-${i}`,
    sortIndex: i,
    slug: slugify(name),
    name,
    tag,
    description,
    stack,
    metric,
    year,
    published,
    coverUrl: cover,
    liveUrl: null,
    repoUrl: null,
    media: [],
    updatedAt: "2026-07-20T10:00:00.000Z",
  };
}

export const seed: Store = {
  profile: {
    name: "Revellio",
    role: "Full-stack Developer",
    location: "Surabaya, Indonesia",
    bio: "I build product-grade web apps and the CMS that feeds them — so content ships from a browser, not a git commit. Swiss discipline, measured results, honest caveats.",
    email: "reveliowalker22@gmail.com",
    github: "https://github.com/Revyno",
    linkedin: "https://www.linkedin.com/in/revellio-christopel-oktufovian-lumbaa/",
    heroUrl: "/assets/hero.png",
    photoUrl: "/assets/mainm.jpeg",
    available: true,
    cvVisible: true,
  },
  projects: [
    // proj(0, "Kanvas Studio", "Web App", "Real-time product configurator with a self-hosted content layer.", "Next.js · Three.js · GSAP", "60fps · +34% add-to-cart", "2026", true, "/assets/card.png"),
    // proj(1, "Loop Ledger", "Backend", "Event-sourced ledger with idempotent APIs and audit trails.", "Node · Postgres · Redis", "p99 2.8s → 86ms", "2026", true, "/assets/mainf.jpeg"),
    // proj(2, "Halftone UI", "UI Kit", "Accessible component kit — hairline system, zero radius, dark-first.", "React · Tailwind · RTL", "0 axe violations · 41 components", "2025", true, "/assets/mainm2.jpeg"),
    // proj(3, "Orbit Configurator", "3D / Motion", "Lazy-loaded R3F scene driving a case-study scroll timeline.", "R3F · Three.js · GSAP", "LCP 1.3s · 190kB first-load", "2025", true, "/assets/char1.png"),
    // proj(4, "Neon Branch Bot", "Open source", "Spins a Postgres branch per PR and comments the migration diff.", "TypeScript · Neon API · GH Actions", "1.2k stars · used in 40 repos", "2025", true, "/assets/char2.png"),
    // proj(5, "Revalidate CMS", "Web App", "The CMS running this site — tag-based revalidate, no deploy to publish.", "Next.js · Neon · Blob", "publish → live ≤ 60s", "2025", true, "/assets/char3.png"),
    // proj(6, "Type Meter", "UI Kit", "A tracking/leading playground that exports CSS tokens.", "React · Canvas", "used on 6 shipped sites", "2024", true, "/assets/icon1.png"),
    // proj(7, "Cold Start Killer", "Backend", "Connection-pool warmer + ISR cache for serverless Postgres.", "Node · Neon · Vercel", "cold p95 900ms → 120ms", "2024", true, "/assets/icon2.png"),
    // proj(8, "Diag", "Open source", "Renders architecture diagrams from a tiny text DSL.", "TypeScript · SVG", "480 stars", "2024", true, "/assets/icon3.png"),
    // proj(9, "Heatmap Kit", "UI Kit", "Contribution-style heatmap with 4 levels and no dependencies.", "React · CSS Grid", "1.4kB gzip", "2024", true, "/assets/jokerface2.png"),
    // proj(10, "Stripe Flow", "Web App", "Checkout flow spike — abandoned-cart recovery experiments.", "Next.js · Stripe", "+18% recovery", "2023", false, "/assets/newsign.png"),
    // proj(11, "First Portfolio", "Web App", "The site before this one. Kept as a marker of how far the bar moved.", "HTML · CSS · JS", "shipped, then outgrown", "2022", false, "/assets/P5_Joker_Chain_Chronicle_1.png"),
  ],
  journey: [
    // { id: "jrny-0", date: "2026-01-01", title: "Full-stack Developer", org: "Independent", note: "Product-grade web apps, self-hosted CMS, and 3D case studies.", published: true },
    // { id: "jrny-1", date: "2024-06-01", title: "Frontend Engineer", org: "Kanvas Studio", note: "Design-system work; shipped a real-time configurator on R3F.", published: true },
    // { id: "jrny-2", date: "2023-03-01", title: "Junior Developer", org: "Loop Labs", note: "Internal tools on Next.js + Postgres; stood up the first CI pipelines.", published: true },
    // { id: "jrny-3", date: "2022-01-01", title: "Started building for the web", org: "Self-taught", note: "HTML/CSS/JS, then React. Never stopped.", published: true },
    // { id: "jrny-4", date: "2026-07-01", title: "Draft milestone", org: "—", note: "Not ready yet.", published: false },
  ],
  certificates: [

  ],
  cvVersions: [
    // { id: "cv-3", version: 3, name: "revellio-cv-2026-07.pdf", sizeBytes: 214_000, isLive: true, uploadedAt: "2026-07-18T09:00:00.000Z" },
    // { id: "cv-2", version: 2, name: "revellio-cv-2026-03.pdf", sizeBytes: 208_400, isLive: false, uploadedAt: "2026-03-11T09:00:00.000Z" },
    // { id: "cv-1", version: 1, name: "revellio-cv-2025-10.pdf", sizeBytes: 198_100, isLive: false, uploadedAt: "2025-10-02T09:00:00.000Z" },
  ],
  media: [
    // { id: "m0", url: "/assets/card.png", caption: "Kanvas — hero" },
    // { id: "m1", url: "/assets/mainf.jpeg", caption: "Ledger — dashboard" },
    // { id: "m2", url: "/assets/mainm2.jpeg", caption: "Halftone — specimen" },
    // { id: "m3", url: "/assets/char1.png", caption: "Orbit — scene" },
    // { id: "m4", url: "/assets/char2.png", caption: "Neon Bot — PR" },
    // { id: "m5", url: "/assets/char3.png", caption: "Revalidate — editor" },
    // { id: "m6", url: "/assets/icon1.png", caption: "Type Meter" },
    // { id: "m7", url: "/assets/icon2.png", caption: "Cold Start" },
  ],
};

/** derived: principles shown on Home */
export const principles: { n: string; title: string; body: string }[] = [
  { n: "01", title: "Ship the smallest thing that works", body: "The best code is the code never written. One line beats an abstraction with one caller." },
  { n: "02", title: "Separate with lines, not space", body: "A hairline carries the same meaning as a shadow, at 1px and zero elevation." },
  { n: "03", title: "Numbers carry context", body: "“Fast” means nothing. “p99 2.8s → 86ms” means something." },
  { n: "04", title: "Honest caveats over clean claims", body: "Every metric ships with the case where it doesn’t hold. Trust compounds." },
];
