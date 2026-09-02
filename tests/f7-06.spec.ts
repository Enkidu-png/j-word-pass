import { test, expect } from "@playwright/test";
import { wejdz } from "./pomoc";

// AC F7-06 (plan/04 D, plan/05 B1). Napis `J-WORD PASS` na bramie ma trzymac
// szerokosc zadana przez widok: min(90vw, 720px). Mierzone `getBoundingClientRect`
// na zywej stronie, bo w kodzie ta regula wygladala na dzialajaca i nie byla.

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

const SZEROKOSCI = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-napis]")).map((e) => ({
      klasa: (e.getAttribute("class") ?? "").split(" ").pop() ?? "",
      w: Math.round(e.getBoundingClientRect().width),
    })),
  );

test("napis na bramie miesci sie w min(90vw, 720px)", async ({ page }, info) => {
  await wejdz(page, "/");
  await page.waitForFunction(() => document.fonts.status === "loaded");
  const [napis] = await SZEROKOSCI(page);
  const okno = page.viewportSize()!.width;
  console.log(`F7-06 / okno=${okno} ${JSON.stringify(napis)}`);
  expect(napis).toBeTruthy();
  expect(napis!.w).toBeLessThanOrEqual(720);
  expect(napis!.w).toBeLessThanOrEqual(Math.round(0.9 * okno));
  // pozytywne: napis WYPELNIA przyznana szerokosc, a nie kurczy sie do zera
  expect(napis!.w).toBeGreaterThanOrEqual(Math.min(720, Math.round(0.9 * okno)) - 1);
  // negatywne: napis dalej miesci sie w oknie i nie ma go po lewej poza ekranem
  const obrys = await page.locator("[data-napis]").first().boundingBox();
  expect(obrys!.x).toBeGreaterThanOrEqual(0);
  expect(obrys!.x + obrys!.width).toBeLessThanOrEqual(okno);
  await page
    .locator("h1.brama__naglowek")
    .screenshot({ path: `screenshots/F7/f7-06-brama-napis-${info.project.name}.png` });
});

// Negatywne AC: szerokosci napisow na pozostalych widokach BEZ ZMIAN.
// Wartosci wpisane recznie z pomiaru SPRZED poprawki (probe na zywej stronie).
// F7-07 przestawil DWIE z nich CELOWO (`werdykt__napis`, `maszyna__napis`):
// tamto issue zdjelo `.napis` z wyscigu specyficznosci, wiec martwe reguly
// widokow wreszcie dzialaja. Pelna tabela przed/po siedzi w `f7-07.spec.ts`.
const PRZED: Record<string, Record<number, Record<string, number>>> = {
  "/egzamin": {
    1280: { egzamin__etap: 380, "napis--chrom": 760, werdykt__napis: 420 },
    390: { egzamin__etap: 300, "napis--chrom": 351, werdykt__napis: 233.8 },
  },
  "/quiz": {
    1280: { quiz__napis: 360, maszyna__napis: 320 },
    390: { quiz__napis: 300, maszyna__napis: 151.13 },
  },
  "/proba-ognia": {
    1280: { ogien__napis: 560 },
    390: { ogien__napis: 312 },
  },
};

for (const sciezka of Object.keys(PRZED)) {
  test(`szerokosci napisow na ${sciezka} bez zmian`, async ({ page }) => {
    await page.addInitScript(WPUSC);
    await wejdz(page, sciezka);
    await page.waitForFunction(() => document.fonts.status === "loaded");
    const okno = page.viewportSize()!.width;
    const po = await SZEROKOSCI(page);
    console.log(`F7-06 ${sciezka} okno=${okno} ${JSON.stringify(po)}`);
    const oczekiwane = PRZED[sciezka]![okno]!;
    for (const n of po) {
      const wzorzec = oczekiwane[n.klasa];
      expect(wzorzec, `brak pomiaru sprzed poprawki dla ${n.klasa}`).toBeDefined();
      expect(Math.abs(n.w - wzorzec!), `${n.klasa}: ${wzorzec} -> ${n.w}`).toBeLessThanOrEqual(1);
    }
  });
}
