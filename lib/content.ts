/**
 * All portfolio content lives here — edit this file to change
 * bio, skills, projects, and social links. No component changes needed.
 */

export const profile = {
  name: "REVELLIO CHRISTOPEL OKTUFOVIAN LUMBA",
  handle: "revellio",
  role: "WEB DEVELOPER",
  location: "INDONESIA",
  tagline: "TAKE YOUR HEART — I BUILD FOR THE WEB.",
  bio: [
    "Web developer with a taste for bold interfaces and game-inspired design.",
    "I work across the stack — from pixel-level UI polish to APIs and databases — and I like shipping things that feel alive.",
  ],
  photo: "/assets/mainm.jpeg", // photo slot — swap with your own photo
  aboutPhoto: "/assets/char1.png",
  stats: [
    { tag: "USR", value: "revellio" },
    { tag: "CLS", value: "PHANTOM DEV" },
    { tag: "LOC", value: "INDONESIA" },
    { tag: "STS", value: "OPEN TO WORK" },
  ],
};

export type Skill = { name: string; rank: "S" | "A" | "B" | "C"; note: string };

export const skillGroups: { title: string; skills: Skill[] }[] = [
  {
    title: "FRONTEND",
    skills: [
      { name: "REACT / NEXT.JS", rank: "S", note: "App Router, RSC" },
      { name: "TYPESCRIPT", rank: "A", note: "Strict mode" },
      { name: "CSS / TAILWIND", rank: "A", note: "Design systems" },
      { name: "GSAP / MOTION", rank: "B", note: "UI animation" },
    ],
  },
  {
    title: "BACKEND",
    skills: [
      { name: "NODE.JS", rank: "A", note: "REST APIs" },
      { name: "PHP / LARAVEL", rank: "B", note: "MVC apps" },
      { name: "SQL / MYSQL", rank: "B", note: "Schema design" },
      { name: "GIT / CI", rank: "A", note: "Daily driver" },
    ],
  },
];

export const timeline = [
  { year: "NOW", title: "FREELANCE WEB DEVELOPER", desc: "Building portfolio-grade web apps and UI experiments." },
  { year: "2025", title: "PERSONAL PROJECTS & STUDY", desc: "Deep-diving React, Next.js and creative front-end." },
  { year: "2024", title: "STARTED WEB DEVELOPMENT", desc: "First lines of HTML/CSS/JS — hooked ever since." },
];

export type Project = {
  code: string;
  title: string;
  desc: string;
  tags: string[];
  image: string;
  link?: string;
  isNew?: boolean;
};

export const projects: Project[] = [
  {
    code: "LOG 01",
    title: "PHANTOM PORTFOLIO",
    desc: "This site — a Persona 5 inspired portfolio built with Next.js 16, GSAP stripe transitions and a full keyboard-driven menu.",
    tags: ["NEXT.JS", "GSAP", "TYPESCRIPT"],
    image: "/assets/mainm2.jpeg",
    link: "https://github.com/revellio",
    isNew: true,
  },
  {
    code: "LOG 02",
    title: "PROJECT METAVERSE",
    desc: "Placeholder project slot — replace with your real work. Short punchy description goes here.",
    tags: ["REACT", "API"],
    image: "/assets/mainf.jpeg",
    link: "#",
  },
  {
    code: "LOG 03",
    title: "MEMENTOS TRACKER",
    desc: "Placeholder project slot — replace with your real work. Short punchy description goes here.",
    tags: ["LARAVEL", "MYSQL"],
    image: "/assets/P5MMChapter7Promo2.png",
    link: "#",
  },
];

export type Social = { label: string; handle: string; href: string };

export const socials: Social[] = [
  { label: "GITHUB", handle: "@revellio", href: "https://github.com/revellio" },
  { label: "LINKEDIN", handle: "revellio lumba", href: "https://linkedin.com/in/revellio" },
  { label: "INSTAGRAM", handle: "@revellio", href: "https://instagram.com/revellio" },
  { label: "EMAIL", handle: "reveliowalker22@gmail.com", href: "mailto:reveliowalker22@gmail.com" },
];

export const menuItems = [
  { id: "about", label: "ABOUT" },
  { id: "resume", label: "RESUME" },
  { id: "projects", label: "PROJECT LOG" },
  { id: "socials", label: "SOCIALS" },
] as const;

export type ScreenId = (typeof menuItems)[number]["id"] | "menu";
