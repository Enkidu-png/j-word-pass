import { test, expect } from "@playwright/test";
import manifest from "../data/assety.json";

// AC F4-02 (plan/07 B, plan/03 D). Kazde pytanie ma INNA ozdobe z manifestu,
// plus jedna reakcja na hover wariantu tam, gdzie tabela ja przewiduje.

const WPUSC = () => {
  if (window.sessionStorage.getItem("jwp.v1")) return;
  window.sessionStorage.setItem(
    "jwp.v1",
    JSON.stringify({
      v: 1,
      egzamin: { odpowiedz: "x", zalaczone: [], punkty: 8, komentarz: "ok" },
      quiz: null,
      ogien: null,
    }),
  );
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(WPUSC);
});

test("15 pytan ma 15 ROZNYCH id ozdob, wszystkie z manifestu", async ({ page }) => {
  await page.goto("/quiz");
  const uzyte: string[] = [];
  for (let nr = 1; nr <= 15; nr++) {
    await page.locator(`[data-kwadrat='${nr}']`).click();
    await expect(page.locator(`[data-karta='${nr}']`)).toBeVisible();
    uzyte.push(
      (await page.locator(".karta__ozdoba .karta__gif").first().getAttribute("data-ozdoba")) ?? "",
    );
  }
  console.log(`ozdoby pytan 1-15: ${uzyte.join(", ")}`);
  expect(new Set(uzyte).size).toBe(15);
  // negatywne: zero ozdob spoza manifestu
  const znane = new Set(manifest.pozycje.map((p) => p.id));
  expect(uzyte.filter((id) => !znane.has(id))).toEqual([]);
});

test("pytanie 1: hover wariantu B skraca animation-duration ozdoby", async ({ page }) => {
  await page.goto("/quiz");
  const gif = page.locator(".karta__gif");
  const przed = await gif.evaluate((e) => getComputedStyle(e).animationDuration);
  await page.locator("[data-wariant='B']").hover();
  const po = await gif.evaluate((e) => getComputedStyle(e).animationDuration);
  console.log(`pytanie 1 animation-duration przed: ${przed}, po hover B: ${po}`);
  expect(przed).toBe("1.2s");
  expect(po).toBe("0.6s");
  // hover wariantu A nie robi nic (tabela plan/07 B ma tam pusto)
  await page.locator("[data-wariant='A']").hover();
  expect(await gif.evaluate((e) => getComputedStyle(e).animationDuration)).toBe("1.2s");
});

test("pytanie 7: hover wariantu A skraca oddech do 400 ms", async ({ page }) => {
  await page.goto("/quiz");
  await page.locator("[data-kwadrat='7']").click();
  const gif = page.locator(".karta__gif");
  await page.locator("[data-wariant='A']").hover();
  expect(await gif.evaluate((e) => getComputedStyle(e).animationDuration)).toBe("0.4s");
});

test("pytania 3, 5, 9, 12: lustro, inwersja, ramka, druga kopia", async ({ page }) => {
  await page.goto("/quiz");

  await page.locator("[data-kwadrat='3']").click();
  await page.locator("[data-wariant='A']").hover();
  expect(await page.locator(".karta__gif").evaluate((e) => getComputedStyle(e).transform))
    .toBe("matrix(-1, 0, 0, 1, 0, 0)");

  await page.locator("[data-kwadrat='5']").click();
  await page.locator("[data-wariant='D']").hover();
  expect(await page.locator(".karta__gif").evaluate((e) => getComputedStyle(e).filter))
    .toBe("invert(1)");

  await page.locator("[data-kwadrat='9']").click();
  await page.locator("[data-wariant='C']").hover();
  expect(await page.locator(".karta__gif").evaluate((e) => getComputedStyle(e).borderTopStyle))
    .toBe("dashed");

  await page.locator("[data-kwadrat='12']").click();
  const kopia = page.locator(".karta__gif--kopia");
  await expect(kopia).toBeHidden();
  await page.locator("[data-wariant='A']").hover();
  await expect(kopia).toBeVisible();
  await expect(page.locator(".karta__ozdoba [data-ozdoba='stwor-nuta']")).toHaveCount(2);
});

test("pytanie 14: poprawny wpis zmienia animation-name ozdoby", async ({ page }) => {
  await page.goto("/quiz");
  await page.locator("[data-kwadrat='14']").click();
  const gif = page.locator(".karta__gif");
  const nazwa = () => gif.evaluate((e) => getComputedStyle(e).animationName);
  const przed = await nazwa();
  await page.locator("[data-pole='otwarte']").fill("skala Mohsa");
  const po = await nazwa();
  console.log(`pytanie 14 animation-name przed: ${przed}, po wpisie: ${po}`);
  expect(po).not.toBe(przed);
  expect(await gif.evaluate((e) => getComputedStyle(e).animationDuration)).toBe("0.3s");
  // bledny wpis nie blyska
  await page.locator("[data-pole='otwarte']").fill("skala richtera");
  expect(await nazwa()).toBe(przed);
});
