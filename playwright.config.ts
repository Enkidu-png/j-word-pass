import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "list",
  // F10-02: brama wstepu zaslania kazdy widok, wiec cala istniejaca suita
  // wchodzi z GOTOWYM wpisem `jwp.wstep` w localStorage. Sama brama testuje sie
  // w tests/f10-02, gdzie ten wpis jest kasowany na starcie.
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
    storageState: {
      cookies: [],
      origins: [
        {
          origin: "http://localhost:3000",
          localStorage: [{ name: "jwp.wstep", value: "franciszek" }],
        },
      ],
    },
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: false },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
