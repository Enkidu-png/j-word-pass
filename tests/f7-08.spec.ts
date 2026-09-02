import { test, expect } from "@playwright/test";

// F7-08: na etapie 1 pytanie i pole odpowiedzi lezaly pod dwoma ekranami
// dekoracji (390x844: pytanie 1040 px, textarea 1688 px od gory strony).
// Straznik pilnuje ODLEGLOSCI OD GORY, bo poprzednie AC sprawdzalo wylacznie
// istnienie elementow i gestosc ozdob.

const PROGI = {
  desktop: { pytanie: 600, textarea: 1000 },
  mobile: { pytanie: 600, textarea: 1000 },
};

test.beforeEach(async ({ page }) => {
  await page.goto("/egzamin");
  await page.waitForFunction(() => document.fonts.status === "loaded");
});

test("pytanie i pole odpowiedzi siedza wysoko na stronie", async ({ page }, info) => {
  const progi = PROGI[info.project.name as keyof typeof PROGI];
  const pomiar = await page.evaluate(() => {
    const gora = (el: Element | null) =>
      el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : -1;
    const naglowki = [...document.querySelectorAll(".druk__naglowek")];
    const pytanie = naglowki.find((e) => e.textContent?.includes("TREŚĆ PYTANIA")) ?? null;
    return {
      pytanie: gora(pytanie),
      textarea: gora(document.querySelector("textarea")),
    };
  });
  expect(pomiar.pytanie, `TRESC PYTANIA na ${pomiar.pytanie} px`).toBeLessThanOrEqual(progi.pytanie);
  expect(pomiar.textarea, `textarea na ${pomiar.textarea} px`).toBeLessThanOrEqual(progi.textarea);
});

test("scena nie zostala okrojona: gestosc Z8 i liczba ozdob", async ({ page }) => {
  const stan = await page.evaluate(() => ({
    ozdoby: document.querySelectorAll("img[data-ozdoba]").length,
    gwiazdki: document.querySelectorAll(".kosmos__gwiazdka").length,
    stwory: document.querySelectorAll("[data-stwor]").length,
    pasy: document.querySelectorAll("[data-pas]").length,
    kosmos: document.querySelectorAll("[data-kosmos]").length,
    plonacy: document.querySelectorAll("[data-plonacy]").length,
  }));
  expect(stan.gwiazdki).toBe(12);
  expect(stan.stwory).toBeGreaterThanOrEqual(2);
  expect(stan.pasy).toBeGreaterThanOrEqual(1);
  expect(stan.kosmos).toBe(1);
  // 12 gwiazdek + planeta + statek + plomienie + 2 stwory rogowe: Z8 spelnione
  expect(stan.ozdoby).toBeGreaterThanOrEqual(34);
});

test("plonacy napis EGZAMIN JASIU stoi nad trescia zadania", async ({ page }) => {
  const [napis, pytanie] = await page.evaluate(() => {
    const gora = (el: Element | null) => (el ? el.getBoundingClientRect().top + window.scrollY : -1);
    const naglowki = [...document.querySelectorAll(".druk__naglowek")];
    return [
      gora(document.querySelector("[data-plonacy]")),
      gora(naglowki.find((e) => e.textContent?.includes("TREŚĆ PYTANIA")) ?? null),
    ];
  });
  expect(napis).toBeGreaterThan(0);
  expect(napis).toBeLessThan(pytanie);
});

test("zalozenia dalej sa na stronie, jedno klikniecie od widocznosci", async ({ page }) => {
  const lista = page.locator(".dane__lista .dane__pozycja");
  await expect(lista).toHaveCount(6);
  await expect(lista.first()).toBeHidden();
  await page.locator(".dane__summary").click();
  await expect(lista.first()).toBeVisible();
});
