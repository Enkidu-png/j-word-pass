import { test, expect } from "@playwright/test";

const ROZSTAW = 60;

test("liczba plomieni rowna ceil(szerokosc napisu / 60)", async ({ page }) => {
  await page.goto("/dev/scena");
  await expect(page.locator(".plonacy__plomien").first()).toBeVisible();
  const wynik = await page.evaluate((rozstaw) => {
    const el = document.querySelector("[data-plonacy]") as HTMLElement;
    const szerokosc = el.getBoundingClientRect().width;
    return {
      szerokosc,
      oczekiwane: Math.ceil(szerokosc / rozstaw),
      realne: el.querySelectorAll(".plonacy__plomien").length,
    };
  }, ROZSTAW);
  console.log(`plonacy: szerokosc ${wynik.szerokosc.toFixed(1)} px, ceil/60 = ${wynik.oczekiwane}, plomieni ${wynik.realne}`);
  expect(wynik.realne).toBe(wynik.oczekiwane);
  expect(wynik.realne).toBeGreaterThan(3);
});

test("plomienie maja rozne animation-delay (zbior >= 4 wartosci)", async ({ page }) => {
  await page.goto("/dev/scena");
  await expect(page.locator(".plonacy__plomien").first()).toBeVisible();
  const ile = await page.evaluate(
    () => new Set([...document.querySelectorAll(".plonacy__plomien")].map((e) => getComputedStyle(e).animationDelay)).size,
  );
  expect(ile).toBeGreaterThanOrEqual(4);
});

test("reduced motion: ogien i poswiata znikaja, napis zostaje widoczny", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dev/scena");
  const svg = page.locator("[data-plonacy] svg[data-napis]");
  await expect(svg).toBeVisible();
  for (const warstwa of ["ogien", "poswiata"]) {
    const wyswietlanie = await page
      .locator(`[data-plonacy-warstwa='${warstwa}']`)
      .evaluate((e) => getComputedStyle(e).display);
    expect(wyswietlanie, `warstwa ${warstwa}`).toBe("none");
  }
});
