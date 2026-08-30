import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * Chakra system for the public site — scoped, opt-in.
 * Swiss/dark tokens (DESIGN.md §1): accent #4CE0FF, hairlines, radius 0.
 * ponytail: only used where Chakra primitives are required (Marquee).
 *
 * preflight is scoped to a class nothing carries, which is how this file keeps
 * Chakra's reset away from the Tailwind pages. `preflight: false` is the
 * obvious way to write that and it is the one that breaks: it makes
 * createPreflight() return {}, ChakraProvider then emits a bodyless
 * `@layer reset` with no semicolon, and that swallows the `@layer base{…}`
 * block immediately after it — the block holding every Chakra keyframe. The
 * browser drops the malformed rule, `animation-name: marqueeX` resolves to
 * nothing, and the Marquee sits still. An unmatched scope keeps the reset
 * inert while giving the layer a body, so the base layer survives the parse.
 */
const PREFLIGHT_OFF = { scope: ".chakra-preflight-never-applied" } as const;

const config = defineConfig({
  preflight: PREFLIGHT_OFF,
  theme: {
    tokens: {
      colors: {
        accent: { value: "#4CE0FF" },
        s0: { value: "#0B0B0B" },
        s1: { value: "#0E0E0E" },
        line: { value: "rgba(255,255,255,0.12)" },
        lineBox: { value: "rgba(255,255,255,0.16)" },
        body: { value: "rgba(255,255,255,0.62)" },
        muted: { value: "rgba(255,255,255,0.45)" },
      },
      radii: { none: { value: "0" } },
    },
  },
  globalCss: {},
});

export const siteSystem = createSystem(defaultConfig, config);
