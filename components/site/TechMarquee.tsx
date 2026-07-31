"use client";

import Image from "next/image";
import { ChakraProvider, Marquee, Stack } from "@chakra-ui/react";
import { siteSystem } from "./chakra-system";

/** public/icons filenames, minus the two duplicate bare marks (next.svg, vercel.svg). */
const STACK = [
  "typescript-logo",
  "react-logo",
  "next.js-logo",
  "nuxt-logo",
  "vue.js-logo",
  "javascript-logo",
  "html-logo",
  "css-logo",
  "node.js-logo",
  "expressjs-logo",
  "fastapi-logo",
  "laravel-logo",
  "php-logo",
  "java-logo",
  "golang-logo",
  "mysql-logo",
  "postgresql-logo",
  "mongodb-logo",
  "docker-logo",
  "jenkins-logo",
  "cloudflare-logo",
  "vercel-logo",
  "firebase-logo",
  "cloudinary-logo",
  "n8n-logo",
  "github-logo",
  "gitlab-logo",
  "visual-studio-code-logo",
  "figma-logo",
  "adobe-photoshop-logo",
  "notion-logo",
  "android-logo",
  "claude-ai-logo",
  "google-antigravity-logo",
  "windsurf-logo",
] as const;

function label(name: string): string {
  return name
    .replace(/-logo$/, "")
    .split("-")
    .map((w) => (w === "js" ? "JS" : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

// Split into two roughly-equal rows so they can scroll in opposite directions.
const mid = Math.ceil(STACK.length / 2);
const ROW_A = STACK.slice(0, mid);
const ROW_B = STACK.slice(mid);

/**
 * Full-bleed tech-stack marquee — two rows scrolling in opposite directions,
 * Chakra UI Marquee (Ark-based) with autoFill. Icons run grayscale/dim; hover
 * reveals full color. Deliberate expressive break vs. DESIGN.md §6.
 */
export function TechMarquee() {
  return (
    <ChakraProvider value={siteSystem}>
      <Stack gap="0">
        <MarqueeRow items={ROW_A} />
        <MarqueeRow items={ROW_B} reverse />
      </Stack>
    </ChakraProvider>
  );
}

function MarqueeRow({ items, reverse = false }: { items: readonly string[]; reverse?: boolean }) {
  return (
    <Marquee.Root reverse={reverse} autoFill speed={35} pauseOnInteraction>
      <Marquee.Viewport
        css={{
          borderTop: reverse ? "1px solid var(--line)" : undefined,
        }}
      >
        <Marquee.Content>
          {items.map((name) => (
            <Marquee.Item
              key={name}
              className="group flex h-[72px] w-[112px] shrink-0 flex-col items-center justify-center gap-2 border-r border-[var(--line)] transition-colors hover:bg-[var(--accent-hover)] md:h-[96px] md:w-[144px]"
            >
              <Image
                src={`/icons/${name}.svg`}
                alt={label(name)}
                width={32}
                height={32}
                className="h-[26px] w-[26px] opacity-45 grayscale brightness-150 transition-all duration-200 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 md:h-[34px] md:w-[34px]"
              />
              <span className="mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--t-label)] group-hover:text-accent md:text-[9px]">
                {label(name)}
              </span>
            </Marquee.Item>
          ))}
        </Marquee.Content>
      </Marquee.Viewport>
    </Marquee.Root>
  );
}
