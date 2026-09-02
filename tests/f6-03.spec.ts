import { test, expect } from "@playwright/test";

// AC F6-03 (plan/02 A, plan/01 D). 404 Komisji, favicon, obrazek OG.

test("/nie-ma zwraca 404 i pokazuje strone Komisji", async ({ page }) => {
  const odpowiedz = await page.goto("/nie-ma");
  expect(odpowiedz?.status()).toBe(404);
  await expect(page.locator("[data-widok='404']")).toBeVisible();
  // Z16: copy mowi do Aleksandry po imieniu.
  await expect(page.locator("[data-widok='404']")).toContainText("ALEKSANDRO");
  // wyjscie awaryjne z powrotem na brame
  await page.locator("[data-cta='do-bramy']").click();
  await expect(page).toHaveURL(/\/$/);
});

test("404 ma wlasny kafel `kafel-404` (Z9)", async ({ page }) => {
  await page.goto("/nie-ma");
  const tlo = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return { obraz: s.backgroundImage, powtorzenie: s.backgroundRepeat, rozmiar: s.backgroundSize };
  });
  expect(tlo.obraz).toContain("kafel-404.png");
  expect(tlo.powtorzenie).toBe("repeat");
  expect(tlo.rozmiar).toBe("auto"); // Z9: BEZ background-size
});

test("favicon istnieje i wraca 200", async ({ page, request }) => {
  await page.goto("/");
  const link = await page.evaluate(
    () => document.querySelector<HTMLLinkElement>("link[rel~='icon']")?.getAttribute("href") ?? "",
  );
  expect(link).not.toBe("");
  expect((await request.get(link)).status()).toBe(200);
});

test("og:image jest absolutny i wraca obrazek", async ({ page, request }) => {
  await page.goto("/");
  const og = await page.evaluate(
    () =>
      document
        .querySelector<HTMLMetaElement>("meta[property='og:image']")
        ?.getAttribute("content") ?? "",
  );
  expect(og).toMatch(/^https?:\/\//); // absolutny, nie sciezka wzgledna
  const obraz = await request.get(og);
  expect(obraz.status()).toBe(200);
  expect(obraz.headers()["content-type"]).toContain("image/png");
});
