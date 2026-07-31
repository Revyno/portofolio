import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * Chakra system for the public site — scoped, opt-in.
 * preflight:false → doesn't touch the Tailwind reset used across public pages.
 * Swiss/dark tokens (DESIGN.md §1): accent #4CE0FF, hairlines, radius 0.
 * ponytail: only used where Chakra primitives are required (Marquee).
 */
const config = defineConfig({
  preflight: false,
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
