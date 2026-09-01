import { test, expect } from "@playwright/test";

test("NapisObrazek: role img, aria-label i title rowne tekstowi", async ({ page }) => {
  await page.goto("/dev/scena");
  const svg = page.locator('svg[data-napis][aria-label="J-WORD PASS"]');
  await expect(svg).toHaveAttribute("role", "img");
  await expect(svg).toHaveAttribute("aria-label", "J-WORD PASS");
  expect(await svg.locator("title").textContent()).toBe("J-WORD PASS");
});

test("gradient chromowy ma dokladnie 6 stopni", async ({ page }) => {
  await page.goto("/dev/scena");
  const stopnie = await page
    .locator('svg[data-napis="chrom"][aria-label="J-WORD PASS"]')
    .evaluate((e) => e.querySelectorAll("stop").length);
  expect(stopnie).toBe(6);
});

test("PRÓBA OGNIA miesci sie w viewBox, zero obciecia", async ({ page }) => {
  await page.goto("/dev/scena");
  const wynik = await page.evaluate(() => {
    const svg = [...document.querySelectorAll("svg[data-napis]")].find(
      (e) => e.getAttribute("aria-label") === "PRÓBA OGNIA",
    ) as SVGSVGElement;
    const tekst = svg.querySelector("text") as SVGTextElement;
    const bb = tekst.getBBox();
    const vb = svg.viewBox.baseVal;
    return { x: bb.x, prawa: bb.x + bb.width, gora: bb.y, dol: bb.y + bb.height, vbW: vb.width, vbH: vb.height };
  });
  expect(wynik.x, "lewa krawedz napisu poza viewBox").toBeGreaterThanOrEqual(0);
  expect(wynik.prawa, "prawa krawedz napisu poza viewBox").toBeLessThanOrEqual(wynik.vbW);
  expect(wynik.gora, "gorna krawedz napisu poza viewBox").toBeGreaterThanOrEqual(0);
  expect(wynik.dol, "dolna krawedz napisu poza viewBox").toBeLessThanOrEqual(wynik.vbH);
});

test("PasGoniec przy reduced motion stoi i jest wysrodkowany", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dev/scena");
  const styl = await page
    .locator('[data-goniec="zwykly"] .pas-goniec__tresc')
    .first()
    .evaluate((e) => {
      const s = getComputedStyle(e);
      return { nazwa: s.animationName, wyrownanie: s.textAlign, wypelnienie: s.paddingLeft };
    });
  expect(styl.nazwa).toBe("none");
  expect(styl.wyrownanie).toBe("center");
  expect(styl.wypelnienie).toBe("0px");
});

test("PasGoniec bez reduced motion realnie sie przewija", async ({ page }) => {
  await page.goto("/dev/scena");
  const nazwa = await page
    .locator('[data-goniec="zwykly"] .pas-goniec__tresc')
    .first()
    .evaluate((e) => getComputedStyle(e).animationName);
  expect(nazwa).toBe("goniec");
});
