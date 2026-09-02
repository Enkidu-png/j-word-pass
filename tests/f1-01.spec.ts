import { test, expect } from "@playwright/test";
import { pozycjeRoli } from "../lib/assety";

const LICZBA_OZDOB = pozycjeRoli("ozdoba").length;

// Liczymy w SIATCE, nie w calym dokumencie: plonacy napis dokłada kilkanascie
// kopii ozdoby "ogien", ktorych liczba zalezy od szerokosci okna.
test("playground renderuje po jednej Ozdobie na kazda pozycje roli ozdoba", async ({ page }) => {
  await page.goto("/dev/scena");
  await expect(page.locator(".playground-siatka img[data-ozdoba]")).toHaveCount(LICZBA_OZDOB);
  const unikalne = await page.evaluate(
    () => new Set([...document.querySelectorAll(".playground-siatka img[data-ozdoba]")].map((e) => e.getAttribute("data-ozdoba"))).size,
  );
  expect(unikalne).toBe(LICZBA_OZDOB);
  await expect(page.locator("[data-stwor] img[data-ozdoba]")).toHaveCount(4);
});

test("reduced motion podmienia KAZDA ozdobe na klatke statyczna (Z11)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dev/scena");
  // .first() nie nadaje sie: pierwsza ozdoba w DOM to plomien z warstwy, ktora
  // reduced motion chowa przez display:none. Czekamy na widoczna z siatki.
  await expect(page.locator(".playground-siatka img[data-ozdoba]").first()).toBeVisible();
  // F7-03: skan wrocil na CALY dokument. Wczesniej byl zawezony do
  // `main.tresc`, bo plakietki webringu w stopce nie mialy klatki statycznej
  // i przewracaly ten test na luce w `plan/03 D`, a nie na regresji silnika.
  // Plakietki maja juz `klatka-statyczna`, a walidator jej pilnuje, wiec
  // zawezenie tylko zmniejszalo zasieg.
  const czytajZrodla = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("img[data-ozdoba]")].map((e) => (e as HTMLImageElement).getAttribute("src") ?? ""),
    );
  // SSR oddaje wersje ANIMOWANA (plan/04 G: strona bez JS ma sie ruszac), a na
  // klatke statyczna podmienia dopiero hydracja. Bez tej bariery test czytal
  // czasem HTML sprzed hydracji i padal na /assets/statek.gif - zlapane przy
  // pelnym przebiegu na czterech workerach, nie przy uruchomieniu w izolacji.
  await expect
    .poll(async () => (await czytajZrodla()).filter((s) => !s.includes("/statyczne/")).length)
    .toBe(0);
  const zrodla = await czytajZrodla();
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
