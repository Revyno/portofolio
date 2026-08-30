import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * Chakra system scoped to the CMS Journey tab only.
 * - Swiss/dark tokens (DESIGN.md): accent #4CE0FF, hairline surfaces, radius 0.
 * ponytail: single-tab styling. If Chakra spreads to more tabs, lift the
 * <JourneyProvider> up to app/cms and share this system.
 *
 * preflight is scoped to a class nothing carries, which keeps Chakra's reset
 * off the Tailwind pages. `preflight: false` reads better but breaks the
 * stylesheet: it emits a bodyless `@layer reset` that swallows the following
 * `@layer base{…}`, so every Chakra keyframe is dropped and dialog/drawer
 * transitions never play. See components/site/chakra-system.ts.
 */
const config = defineConfig({
  preflight: { scope: ".chakra-preflight-never-applied" },
  theme: {
    tokens: {
      colors: {
        accent: { value: "#4CE0FF" },
        s0: { value: "#0B0B0B" },
        s1: { value: "#0E0E0E" },
        field: { value: "#111111" },
        line: { value: "rgba(255,255,255,0.08)" },
        lineBox: { value: "rgba(255,255,255,0.14)" },
        body: { value: "rgba(255,255,255,0.72)" },
        muted: { value: "rgba(255,255,255,0.48)" },
      },
      radii: { none: { value: "0" } },
    },
  },
  globalCss: {},
});

export const journeySystem = createSystem(defaultConfig, config);
