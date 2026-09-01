import { test, expect } from "@playwright/test";
import { pozycjeRoli } from "../lib/assety";

const LICZBA_OZDOB = pozycjeRoli("ozdoba").length;

test("playground renderuje po jednej Ozdobie na kazda pozycje roli ozdoba", async ({ page }) => {
  await page.goto("/dev/scena");
  await expect(page.locator("img[data-ozdoba]")).toHaveCount(LICZBA_OZDOB + 4); // +4 stwory rogowe
  const unikalne = await page.evaluate(() =>
    new Set([...document.querySelectorAll("img[data-ozdoba]")].map((e) => e.getAttribute("data-ozdoba"))).size,
  );
  expect(unikalne).toBe(LICZBA_OZDOB);
});

test("reduced motion podmienia KAZDA ozdobe na klatke statyczna (Z11)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dev/scena");
  await expect(page.locator("img[data-ozdoba]").first()).toBeVisible();
  const zrodla = await page.evaluate(() =>
    [...document.querySelectorAll("img[data-ozdoba]")].map((e) => (e as HTMLImageElement).getAttribute("src") ?? ""),
  );
  expect(zrodla.length).toBeGreaterThan(0);
  for (const s of zrodla) {
    expect(s, `zrodlo ozdoby: ${s}`).toContain("/statyczne/");
    expect(s, `zrodlo ozdoby: ${s}`).toMatch(/\.png$/);
  }
});

test("stwor w prawym rogu jest odbity, w lewym nie ma zadnego transformu (Z6a)", async ({ page }) => {
  await page.goto("/dev/scena");
  const transform = (sel: string) =>
    page.locator(sel).first().evaluate((e) => getComputedStyle(e).transform);
  expect(await transform("[data-stwor='prawy-dol']")).toBe("matrix(-1, 0, 0, 1, 0, 0)");
  expect(await transform("[data-stwor='prawy-gora']")).toBe("matrix(-1, 0, 0, 1, 0, 0)");
  expect(await transform("[data-stwor='lewy-dol']")).toBe("none");
  expect(await transform("[data-stwor='lewy-gora']")).toBe("none");
});
