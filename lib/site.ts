// Canonical site identity — shared by metadata, sitemap, robots and OG image.
// Set NEXT_PUBLIC_SITE_URL to the real production origin before deploy; without
// it, absolute URLs fall back to localhost and Google indexes the wrong host.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const SITE_NAME = "Revellio Christopel Oktufovian Lumbaa";
export const SITE_ROLE = "Full-stack Developer";
export const SITE_DESCRIPTION =
  "Portfolio of Revellio Christopel Oktufovian Lumbaa — full-stack developer. Selected projects, journey and contact. Built with Next.js, React and TypeScript.";
