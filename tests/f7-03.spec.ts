import { test, expect } from "@playwright/test";
import { wejdz } from "./pomoc";

// AC F7-03 (plan/01 E Z11; plan/03 B5, D). Plakietki webringu tez podlegaja
// Z11 - GIF-a nie zatrzyma CSS, wiec przy reduced motion ida klatki statyczne.

const PLAKIETKI = ["plakietka-html", "plakietka-css", "plakietka-przegladarka"];

const zrodla = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("footer img[data-ozdoba^='plakietka']")].map(
      (e) =>
        [e.getAttribute("data-ozdoba") ?? "", (e as HTMLImageElement).getAttribute("src") ?? ""] as [
          string,
          string,
        ],
    ),
  );

test("reduced motion podmienia wszystkie trzy plakietki na klatke statyczna", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await wejdz(page, "/");
  // Hydracja: SSR oddaje wersje animowana (plan/04 G), podmiana idzie po niej.
  await expect
    .poll(async () => (await zrodla(page)).filter(([, s]) => !s.includes("/statyczne/")).length)
    .toBe(0);
  const lista = await zrodla(page);
  expect(lista.map(([id]) => id)).toEqual(PLAKIETKI);
  for (const [id, src] of lista) {
    expect(src, `plakietka ${id}`).toContain("/assets/statyczne/");
    expect(src, `plakietka ${id}`).toMatch(/\.png$/);
  }
});

// Negatywne AC: przy normalnym ruchu plakietki wygladaja jak dotad.
test("bez reduced motion plakietki zostaja animowanymi GIF-ami", async ({ page }) => {
  await wejdz(page, "/");
  const lista = await zrodla(page);
  expect(lista.map(([id]) => id)).toEqual(PLAKIETKI);
  for (const [id, src] of lista) {
    expect(src, `plakietka ${id}`).toBe(`/assets/${id}.gif`);
  }
  const wymiary = await page.evaluate(() =>
    [...document.querySelectorAll("footer img[data-ozdoba^='plakietka']")].map((e) => {
      const r = e.getBoundingClientRect();
      return [Math.round(r.width), Math.round(r.height)];
    }),
  );
  expect(wymiary).toEqual([
    [88, 31],
    [88, 31],
    [88, 31],
  ]);
});
