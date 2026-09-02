import { test, expect } from "@playwright/test";
import { wejdz } from "./pomoc";

// AC F7-07 (plan/04 D, plan/06 C werdykt). ROOT CAUSE kaskady napisow:
// `.napis { width: 100% }` z `scena.css` mial specyficznosc (0,1,0) i lezal
// w arkuszu importowanym PO arkuszach widokow, wiec bil kazda szerokosc zadana
// klasa widoku. Lekarstwo: `:where(.napis)` - ta sama wartosc domyslna,
// specyficznosc (0,0,0), zero `!important`.

const WPUSC = () => {
  window.sessionStorage.setItem(
    "jwp.v1",
    JSON.stringify({
      v: 1,
      egzamin: { odpowiedz: "x", zalaczone: [], punkty: 8, komentarz: "ok" },
      quiz: { odpowiedzi: {}, punkty: 12 },
      ogien: null,
    }),
  );
};

test("werdykt na /egzamin trzyma min(70%, 420px)", async ({ page }, info) => {
  await page.addInitScript(WPUSC);
  await wejdz(page, "/egzamin");
  await page.waitForFunction(() => document.fonts.status === "loaded");
  const napis = page.locator(".werdykt__napis");
  const miara = await napis.evaluate((e) => {
    const r = e.getBoundingClientRect();
    const p = (e.parentElement as HTMLElement).getBoundingClientRect();
    const st = getComputedStyle(e.parentElement as HTMLElement);
    const wnetrze =
      (e.parentElement as HTMLElement).clientWidth -
      parseFloat(st.paddingLeft) -
      parseFloat(st.paddingRight);
    return { w: r.width, x: r.x, srodek: r.x + r.width / 2, srodekRodzica: p.x + p.width / 2, wnetrze };
  });
  console.log(`F7-07 werdykt okno=${page.viewportSize()!.width} ${JSON.stringify(miara)}`);
  expect(miara.w).toBeLessThanOrEqual(420);
  expect(miara.w).toBeLessThanOrEqual(0.7 * miara.wnetrze + 0.5);
  // wypelnia przyznana szerokosc, nie kurczy sie do zera
  expect(miara.w).toBeGreaterThanOrEqual(Math.min(420, 0.7 * miara.wnetrze) - 0.5);
  // wysrodkowany (margin: 0 auto) i caly w oknie
  expect(Math.abs(miara.srodek - miara.srodekRodzica)).toBeLessThanOrEqual(1);
  expect(miara.x).toBeGreaterThanOrEqual(0);
  expect(miara.x + miara.w).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page
    .locator("[data-werdykt]")
    .screenshot({ path: `screenshots/F7/f7-07-werdykt-${info.project.name}.png` });
});

test("regula bazowa napisu przestaje wygrywac z klasa widoku", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await wejdz(page, "/egzamin");
  await page.waitForFunction(() => document.fonts.status === "loaded");
  // Napis `EGZAMIN JASIU` nosi tylko klasy `napis napis--chrom`, wiec jego
  // szerokosc bierze sie WYLACZNIE z reguly bazowej. Dokladamy klase o tej
  // samej specyficznosci (0,1,0) na POCZATEK <head>, czyli WCZESNIEJ niz
  // arkusz z regula bazowa - dokladnie ta przegrana, ktora zabijala
  // `.werdykt__napis`. `addStyleTag` tego nie sprawdzi, bo dokleja arkusz na
  // koncu i wygrywa kolejnoscia niezaleznie od poprawki.
  const napis = page.locator(".egzamin__plonacy .napis--chrom");
  const przed = (await napis.boundingBox())!.width;
  await page.evaluate(() => {
    const st = document.createElement("style");
    st.textContent = ".napis--chrom { width: 111px }";
    document.head.prepend(st);
  });
  const po = (await napis.boundingBox())!.width;
  console.log(`F7-07 dowod kaskady: ${przed} -> ${po}`);
  expect(po).toBeCloseTo(111, 0);
  expect(po).not.toBeCloseTo(przed, 0);
});

// Skutek uboczny tej samej naprawy: `.maszyna__napis` (`width: min(50%, 320px)`)
// byl martwy dokladnie tak jak `.werdykt__napis`. Zrzut, zeby wynik quizu
// obejrzec, a nie tylko zmierzyc.
test("wynik quizu w maszynie: napis wysrodkowany miedzy ozdobami", async ({ page }, info) => {
  await page.addInitScript(WPUSC);
  await wejdz(page, "/quiz");
  await page.waitForFunction(() => document.fonts.status === "loaded");
  const wynik = page.locator(".maszyna__wynik");
  await wynik.scrollIntoViewIfNeeded();
  const [n, w] = [await page.locator(".maszyna__napis").boundingBox(), await wynik.boundingBox()];
  console.log(`F7-07 maszyna ${JSON.stringify({ napis: n!.width, wynik: w!.width })}`);
  expect(n!.width).toBeLessThanOrEqual(320);
  expect(Math.abs(n!.x + n!.width / 2 - (w!.x + w!.width / 2))).toBeLessThanOrEqual(1);
  await wynik.screenshot({ path: `screenshots/F7/f7-07-maszyna-${info.project.name}.png` });
});

// Negatywne AC: szerokosci `[data-napis]` na pozostalych widokach.
// Wartosci zmierzone na zywej stronie PRZED poprawka. Dwie pozycje zmieniaja
// sie CELOWO - to te same martwe reguly co `.werdykt__napis`, odzyskane tym
// samym zdjeciem `.napis` z wyscigu.
// Lista uporzadkowana jak w DOM: [klasa/wariant, szerokosc].
const OCZEKIWANE: Record<string, Record<number, [string, number][]>> = {
  "/": { 1280: [["brama__napis", 720]], 390: [["brama__napis", 351]] },
  "/quiz": {
    // maszyna__napis: 663.72 -> 320 i 204.03 -> 151.13, bo `.maszyna__napis`
    // (`width: min(50%, 320px)`) byl martwy tak samo jak `.werdykt__napis`.
    1280: [["quiz__napis", 360], ["maszyna__napis", 320]],
    390: [["quiz__napis", 300], ["maszyna__napis", 151.13]],
  },
  "/proba-ognia": { 1280: [["ogien__napis", 560]], 390: [["ogien__napis", 312]] },
  "/nie-ma": { 1280: [["brak__napis", 300]], 390: [["brak__napis", 220]] },
  "/dev/scena": {
    1280: [
      ["napis--chrom", 1232],
      ["napis--chrom", 602.88],
      ["napis--chrom", 602.88],
      ["napis--chrom", 602.88],
      ["napis--neon", 602.88],
    ],
    390: [
      ["napis--chrom", 342],
      ["napis--chrom", 175.67],
      ["napis--chrom", 175.67],
      ["napis--chrom", 175.67],
      ["napis--neon", 175.67],
    ],
  },
  "/egzamin": {
    // werdykt__napis: 760 -> 420 i 334 -> 233.8 (naprawa tego issue)
    1280: [["egzamin__etap", 380], ["napis--chrom", 760], ["werdykt__napis", 420]],
    390: [["egzamin__etap", 300], ["napis--chrom", 351], ["werdykt__napis", 233.8]],
  },
};

for (const sciezka of Object.keys(OCZEKIWANE)) {
  test(`szerokosci [data-napis] na ${sciezka}`, async ({ page }, info) => {
    await page.addInitScript(WPUSC);
    await wejdz(page, sciezka);
    await page.waitForFunction(() => document.fonts.status === "loaded");
    const okno = page.viewportSize()!.width;
    const po = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-napis]")).map((e) => ({
        klasa: (e.getAttribute("class") ?? "").split(" ").pop() ?? "",
        w: e.getBoundingClientRect().width,
      })),
    );
    console.log(`F7-07 ${sciezka} okno=${okno} ${JSON.stringify(po)}`);
    const wzorce = OCZEKIWANE[sciezka]![okno]!;
    expect(po.map((n) => n.klasa)).toEqual(wzorce.map(([k]) => k));
    po.forEach((n, i) => {
      const [k, w] = wzorce[i]!;
      expect(Math.abs(n.w - w), `${k}[${i}]: ${w} -> ${n.w}`).toBeLessThanOrEqual(1);
    });
    const nazwa = sciezka === "/" ? "brama" : sciezka.replace(/\//g, "-").slice(1);
    await page.screenshot({ path: `screenshots/F7/f7-07-${nazwa}-${info.project.name}.png` });
  });
}

test("zero !important w arkuszach", async ({ page }) => {
  await wejdz(page, "/");
  const brud = await page.evaluate(() =>
    Array.from(document.styleSheets).flatMap((a) => {
      try {
        return Array.from(a.cssRules)
          .map((r) => r.cssText)
          .filter((t) => t.includes("!important"));
      } catch {
        return [];
      }
    }),
  );
  expect(brud).toEqual([]);
});
