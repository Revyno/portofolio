import { defineConfig, devices } from "@playwright/test";

// Responsiveness suite. Reuses a dev server on :3000 if one is already up
// (the common case here), else boots one. Chromium only — the goal is layout
// regressions across viewports, not cross-browser parity.
const PORT = Number(process.env.PW_PORT ?? 3000);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // One test file, run three times — once per viewport. Tests branch on
  // page.viewportSize() where the layout itself changes (nav vs tab bar).
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 }, isMobile: false } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
