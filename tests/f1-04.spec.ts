import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    ladowanieOd?: number;
    ladowanieDo?: number;
  }
}

test("szescian ma 6 scian, kazda z inna ozdoba", async ({ page }) => {
  await page.goto("/dev/scena");
  await page.locator("[data-pokaz='start']").click();
  const dane = await page.evaluate(() => {
    const sciany = [...document.querySelectorAll(".ladowanie-sciana")];
    return {
      ile: sciany.length,
      ozdoby: sciany.map((s) => s.querySelector("img")?.getAttribute("data-ozdoba") ?? ""),
    };
  });
  expect(dane.ile).toBe(6);
  expect(new Set(dane.ozdoby).size).toBe(6);
});

test("obrot szescianu uzywa steps(12)", async ({ page }) => {
  await page.goto("/dev/scena");
  await page.locator("[data-pokaz='start']").click();
  const czas = await page
    .locator(".ladowanie-szescian")
    .evaluate((e) => getComputedStyle(e).animationTimingFunction);
  expect(czas).toContain("steps(12");
});

test("wariant start znika nie wczesniej niz 1200 ms i nie pozniej niz 2600 ms", async ({ page }) => {
  await page.goto("/dev/scena");
  await page.locator("[data-pokaz='start']").click();
  await page.locator("[data-ladowanie]").waitFor({ state: "detached", timeout: 8000 });
  const trwalo = await page.evaluate(() => window.ladowanieDo! - window.ladowanieOd!);
  console.log(`ladowanie start: ${trwalo.toFixed(0)} ms`);
  expect(trwalo).toBeGreaterThanOrEqual(1200);
  expect(trwalo).toBeLessThanOrEqual(2600);
});

test("Escape zdejmuje ekran natychmiast i fokus laduje na h1", async ({ page }) => {
  await page.goto("/dev/scena");
  await page.locator("[data-pokaz='start']").click();
  await expect(page.locator("[data-ladowanie]")).toBeVisible();
  const t0 = Date.now();
  await page.keyboard.press("Escape");
  await page.locator("[data-ladowanie]").waitFor({ state: "detached", timeout: 1000 });
  const trwalo = Date.now() - t0;
  console.log(`Escape zdjal ekran w ${trwalo} ms`);
  expect(trwalo).toBeLessThan(600);
  await expect(page.locator("h1")).toBeFocused();
});

test("reduced motion: brak obrotu i znika po okolo 400 ms", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dev/scena");
  await page.locator("[data-pokaz='start']").click();
  const nazwa = await page
    .locator(".ladowanie-szescian")
    .evaluate((e) => getComputedStyle(e).animationName);
  expect(nazwa).toBe("none");
  await page.locator("[data-ladowanie]").waitFor({ state: "detached", timeout: 3000 });
  const trwalo = await page.evaluate(() => window.ladowanieDo! - window.ladowanieOd!);
  console.log(`ladowanie reduced: ${trwalo.toFixed(0)} ms`);
  expect(trwalo).toBeLessThanOrEqual(600);
});
