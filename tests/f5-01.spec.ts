import { test, expect } from "@playwright/test";

// AC F5-01 (plan/08 A, B, E). Scena ogniska plus druk OGN-3/TAJ z walidacja
// stemplami. Etap 3 stoi za straza etapu, wiec kazdy test wpuszcza sie sam,
// wkladajac do sessionStorage zdany egzamin i zdany quiz.

const WPUSC = () => {
  if (window.sessionStorage.getItem("jwp.v1")) return;
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

test.beforeEach(async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/proba-ognia");
});

test("scena ogniska: piec ogni z roznymi opoznieniami, kot i dwa stwory rogowe", async ({ page }) => {
  const plomienie = page.locator(".ognisko__plomien");
  await expect(plomienie).toHaveCount(5);
  const opoznienia = await plomienie.evaluateAll((el) =>
    el.map((e) => getComputedStyle(e).animationDelay),
  );
  expect(new Set(opoznienia).size).toBe(5);
  await expect(page.locator(".ognisko [data-ozdoba='stwor-kot']")).toBeVisible();
  await expect(page.locator(".stwor-rogowy")).toHaveCount(2);
  // Z8: minimum szesc animowanych elementow na widoku.
  expect(await page.locator("[data-ozdoba]").count()).toBeGreaterThanOrEqual(6);
});

test("przycisk jest disabled dopoki klauzula niezaznaczona", async ({ page }) => {
  const cta = page.locator("[data-cta='skladam']");
  await expect(cta).toBeDisabled();
  await expect(cta).toHaveAttribute("aria-disabled", "true");
  await page.locator("[data-pokora]").check();
  await expect(cta).toBeEnabled();
});

test("bledny e-mail: stempel, drganie translateX i fokus z powrotem w polu", async ({ page }) => {
  const pole = page.locator("[data-pole='email']");
  const druk = page.locator("[data-druk-ogien]");
  const obwodkaPrzed = await pole.evaluate((e) => getComputedStyle(e).borderTopColor);

  await pole.fill("aleksandra-bez-malpy");
  await page.locator("[data-pole='but']").fill("39");
  await page.locator("[data-pole='ucho']").fill("60");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta='skladam']").click();

  // druk realnie dostaje klase drgania (a nie tylko ma ja w arkuszu)
  await expect(druk).toHaveClass(/druk--drga/);
  await expect(page.locator("[data-stempel='email']")).toHaveText("ALEKSANDRO, TO NIE JEST ADRES");
  await expect(pole).toBeFocused();
  // ceremonia NIE startuje przy bledzie (plan/08 E): druk zostaje na ekranie
  await expect(druk).toBeVisible();
  await expect(page.locator("[data-ceremonia]")).toHaveCount(0);

  // Drganie jest przesunieciem w poziomie, NIE obrotem (Z6, plan/08 B).
  // Sama klasa nie wystarczy: czytamy klatki kluczowe z CSSOM zywej strony
  // i sprawdzamy, ze kazda niesie wylacznie translateX.
  const klatki = await page.evaluate(() => {
    const wynik: string[] = [];
    for (const arkusz of Array.from(document.styleSheets)) {
      let reguly: CSSRule[] = [];
      try {
        reguly = Array.from(arkusz.cssRules);
      } catch {
        continue;
      }
      for (const r of reguly) {
        if (r instanceof CSSKeyframesRule && r.name === "druk-drganie") {
          for (const k of Array.from(r.cssRules) as CSSKeyframeRule[]) {
            wynik.push(k.style.transform);
          }
        }
      }
    }
    return wynik;
  });
  expect(klatki.length).toBeGreaterThanOrEqual(4);
  for (const t of klatki) expect(t).toMatch(/^translateX\(-?\d+px\)$/);
  expect(klatki.some((t) => t !== "translateX(0px)")).toBe(true);

  // Anty-spec plan/08 F punkt 2: bledne pole NIE dostaje czerwonej obwodki.
  expect(await pole.evaluate((e) => getComputedStyle(e).borderTopColor)).toBe(obwodkaPrzed);
});

test("but 8 dostaje stempel o skali 10-70", async ({ page }) => {
  await page.locator("[data-pole='email']").fill("aleksandra@komisja.pl");
  await page.locator("[data-pole='but']").fill("8");
  await page.locator("[data-pole='ucho']").fill("60");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta='skladam']").click();

  await expect(page.locator("[data-stempel='but']")).toHaveText("ROZMIAR POZA SKALĄ KOMISJI (10-70)");
  await expect(page.locator("[data-stempel='email']")).toHaveCount(0);
  await expect(page.locator("[data-pole='but']")).toBeFocused();
});

test("ucho 900 poza skala, ucho 200 przechodzi z dopiskiem podziwu", async ({ page }) => {
  await page.locator("[data-pole='email']").fill("aleksandra@komisja.pl");
  await page.locator("[data-pole='but']").fill("39");
  await page.locator("[data-pole='ucho']").fill("900");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta='skladam']").click();
  await expect(page.locator("[data-stempel='ucho']")).toHaveText("ŚREDNICA POZA SKALĄ KOMISJI (5-500)");
  await expect(page.locator("[data-podziw]")).toHaveCount(0);

  await page.locator("[data-pole='ucho']").fill("200");
  await expect(page.locator("[data-podziw]")).toHaveText("KOMISJA WYRAŻA PODZIW");
  await page.locator("[data-cta='skladam']").click();
  await expect(page.locator("[data-druk-ogien]")).toHaveCount(0);
  await expect(page.locator("[data-ceremonia]")).toBeVisible();
  // druk przyjety trafia do stanu kandydatki (plan/02 G)
  const ogien = await page.evaluate(
    () => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}")?.ogien,
  );
  expect(ogien).toMatchObject({ email: "aleksandra@komisja.pl", rozmiarButa: 39, srednicaUchaMm: 200 });
});

test("negatywne: zero steppera nad formularzem", async ({ page }) => {
  const tekst = (await page.locator("body").innerText()).toUpperCase();
  expect(tekst).not.toMatch(/KROK\s*\d\s*(Z|\/)\s*\d/);
});
