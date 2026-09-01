import { test, expect } from "@playwright/test";

// AC F6-03: /nieistnieje daje stylizowane 404 (zrzut), `og:title` i `og:image`
// w naglowku, GET /opengraph-image = 200 image/png, favicon widoczny.

test("404 w stylu Komisji zamiast domyslnej strony Next", async ({ page }, info) => {
  const odpowiedz = await page.goto("/nieistnieje");
  expect(odpowiedz?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("AKTA ZAGINĘŁY. NISZCZARKA BYŁA SZYBSZA.");
  await expect(page.locator(".brak-akt .pieczatka svg")).toHaveAttribute("aria-label", "BRAK AKT");
  // zero domyslnego druku Next
  await expect(page.getByText("This page could not be found")).toHaveCount(0);
  // stopka i shell zostaja spojne z reszta serwisu (plan/04 A)
  await expect(page.locator(".webring-stopki")).toBeVisible();
  await expect(page.locator("[data-pasek-krawedzi]")).toBeVisible();
  await page.screenshot({ path: `screenshots/F6/F6-03-404-${info.project.name}.png`, fullPage: true });

  await page.locator("[data-do-bramy]").click();
  await expect(page).toHaveURL(/\/$/);
});

test("metadata OG: og:title i og:image w naglowku, obraz 200 image/png", async ({ page, request }) => {
  await page.goto("/");
  const tytul = page.locator('meta[property="og:title"]');
  await expect(tytul).toHaveAttribute("content", /J-WORD PASS/);
  const obraz = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(obraz).toBeTruthy();
  const res = await request.get(obraz!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/png");
  expect((await res.body()).length).toBeGreaterThan(5000);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
});

test("favicon: link w naglowku i plik SVG pod adresem", async ({ page, request }) => {
  await page.goto("/");
  const ikona = page.locator('link[rel="icon"]');
  await expect(ikona).toHaveCount(1);
  const href = await ikona.getAttribute("href");
  expect(href).toContain("icon.svg");
  const res = await request.get(href!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/svg+xml");
});
