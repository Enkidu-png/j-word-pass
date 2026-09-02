import { test, expect } from "@playwright/test";
import egzamin from "../data/egzamin.json";

// AC F3-02 (plan/06 B, D, E). Scena egzaminu: dane z manifestu i z JSON-a,
// dekoracja bez interakcji, licznik znakow, zero przeciagania (Z6, plan/06 E1).

test("szesc zalozen z data/egzamin.json renderuje sie jako <li> w druku", async ({ page }) => {
  await page.goto("/egzamin");
  const pozycje = page.locator(".druk--dane .dane__pozycja");
  await expect(pozycje).toHaveCount(6);
  for (const zalozenie of egzamin.zalozenia) {
    await expect(pozycje.filter({ hasText: zalozenie.tekst })).toHaveCount(1);
  }
  // kazda pozycja poprzedzona strzalka 24 px (plan/06 B punkt 6)
  await expect(page.locator(".druk--dane [data-ozdoba='stwor-strzalka']")).toHaveCount(6);
  expect(await page.locator(".dane__strzalka").first().evaluate((e) => e.clientWidth)).toBe(24);
});

test("scena kosmiczna jest wylacznie dekoracja: klik w planete nic nie trafia", async ({ page }) => {
  await page.goto("/egzamin");
  await expect(page.locator("[data-kosmos]")).toHaveCSS("pointer-events", "none");
  const cel = await page.evaluate(() => {
    const p = document.querySelector(".kosmos__planeta")!.getBoundingClientRect();
    const el = document.elementFromPoint(p.left + p.width / 2, p.top + p.height / 2);
    return el?.closest("[data-kosmos]") ? "scena" : "cos-pod-scena";
  });
  expect(cel).toBe("cos-pod-scena");
});

test("minimum 6 animowanych elementow w tresci (Z8)", async ({ page }) => {
  await page.goto("/egzamin");
  const ile = await page.evaluate(() =>
    [...document.querySelectorAll("main.tresc *")].filter((e) => {
      const cs = getComputedStyle(e);
      const src = e.getAttribute("src") ?? "";
      return cs.animationName !== "none" || src.endsWith(".gif");
    }).length,
  );
  console.log(`animowanych elementow na /egzamin: ${ile}`);
  expect(ile).toBeGreaterThanOrEqual(6);
});

test("licznik znakow zmienia kolor na --alarm powyzej 7500", async ({ page }) => {
  await page.goto("/egzamin");
  const licznik = page.locator("[data-licznik-znakow]");
  const pole = page.locator("[data-pole='odpowiedz']");

  await pole.fill("z".repeat(7500));
  await expect(licznik).toHaveAttribute("data-alarm", "nie");
  const spokojny = await licznik.evaluate((e) => getComputedStyle(e).color);

  await pole.fill("z".repeat(7501));
  await expect(licznik).toHaveAttribute("data-alarm", "tak");
  const alarmowy = await licznik.evaluate((e) => getComputedStyle(e).color);
  const token = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--alarm").trim(),
  );

  expect(alarmowy).not.toBe(spokojny);
  // rgb() z getComputedStyle kontra hex z tokena: porownujemy po skladowych
  const hexNaRgb = (h: string) =>
    `rgb(${parseInt(h.slice(1, 3), 16)}, ${parseInt(h.slice(3, 5), 16)}, ${parseInt(h.slice(5, 7), 16)})`;
  expect(alarmowy).toBe(hexNaRgb(token));
});

test("mobile 390 px: scena 200 px, planeta 120 px, szesc gwiazdek zamiast dwunastu", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "mobile", "kontrakt wariantu mobilnego");
  await page.goto("/egzamin");
  const dane = await page.evaluate(() => ({
    scena: document.querySelector(".kosmos")!.clientHeight,
    planeta: document.querySelector(".kosmos__planeta")!.clientWidth,
    widoczne: [...document.querySelectorAll(".kosmos__gwiazdka")].filter(
      (e) => getComputedStyle(e).display !== "none",
    ).length,
  }));
  expect(dane).toEqual({ scena: 200, planeta: 120, widoczne: 6 });
});

test("desktop: dwanascie gwiazdek, kazda z innym opoznieniem", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "kontrakt wariantu desktopowego");
  await page.goto("/egzamin");
  const opoznienia = await page.evaluate(() =>
    [...document.querySelectorAll(".kosmos__gwiazdka")].map(
      (e) => getComputedStyle(e).animationDelay,
    ),
  );
  expect(opoznienia).toHaveLength(12);
  expect(new Set(opoznienia).size).toBe(12);
});

test("negatywne: zero przeciagania, zero obrotu i skosu, zalozenia tylko w druku", async ({
  page,
}) => {
  await page.goto("/egzamin");
  expect(await page.locator("[draggable]").count()).toBe(0);

  const przekrzywione = await page.evaluate(() =>
    [...document.querySelectorAll("main.tresc *")].filter((e) => {
      const t = getComputedStyle(e).transform;
      if (t === "none") return false;
      // Z6 zabrania OBROTU i SKOSU, nie skalowania: scaleX(-1) stworow rogowych
      // i scaleY poswiaty plonacego napisu sa wprost w spec (plan/04 B, E).
      // W macierzy 2D obrot i skos siedza w skladowych b i c - tylko one lamia Z6.
      const m = t.match(/matrix\(([^)]+)\)/);
      if (!m) return true;
      const [, b2, c] = m[1].split(",").map(Number);
      return b2 !== 0 || c !== 0;
    }).length,
  );
  expect(przekrzywione).toBe(0);

  // tresc zalozenia nie moze wisiec w golym <p> poza drukiem (plan/06 E punkt 2)
  const golyAkapit = await page.evaluate((tekst) => {
    for (const p of document.querySelectorAll("main.tresc p")) {
      if (p.textContent?.includes(tekst) && !p.closest(".druk")) return true;
    }
    return false;
  }, egzamin.zalozenia[0].tekst);
  expect(golyAkapit).toBe(false);
});

test("bez JS druk i lista zalozen sa w HTML z serwera (SSR)", async ({ request }) => {
  const res = await request.get("/egzamin");
  const html = await res.text();
  expect(res.status()).toBe(200);
  for (const zalozenie of egzamin.zalozenia) {
    expect(html).toContain(zalozenie.tekst);
  }
  expect(html).toContain("DANE DO ZADANIA");
  expect(html).toContain("TREŚĆ PYTANIA");
  expect(html).toContain("ODDAJ PRACĘ KOMISJI");
});
