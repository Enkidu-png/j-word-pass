import { test, expect } from "@playwright/test";
import { wejdz } from "./pomoc";

// AC F2-02a: szkielet bramy. Kryteria dotyczace tablicy ogloszen, druku
// wstepnego i przyciskow sa w tym samym AC, ale nalezą do zakresu F2-02b
// (punkty 7-8 z plan/05 B1) - sprawdza je tests/f2-02b.spec.ts.

test("kafel tla siedzi na html, powtarza sie i nie jest skalowany (Z9)", async ({ page }) => {
  await wejdz(page);
  const tlo = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return { obraz: s.backgroundImage, powtorz: s.backgroundRepeat, rozmiar: s.backgroundSize };
  });
  expect(tlo.obraz).toContain("kafel-brama.png");
  expect(tlo.powtorz).toBe("repeat");
  expect(tlo.rozmiar).toBe("auto");
});

test("szkielet bramy: statek, napis-obrazek, podtytul, goniec ze strzalka, pas dolny, dwa stwory", async ({ page }) => {
  await wejdz(page);
  await expect(page.locator('.brama [data-ozdoba="statek"]')).toHaveCount(1);
  await expect(page.locator('.brama [data-napis="chrom"]')).toHaveAttribute("aria-label", "J-WORD PASS");
  await expect(page.locator(".brama__podtytul")).toHaveText("MIĘDZYGALAKTYCZNA KOMISJA KWALIFIKACYJNA");
  await expect(page.locator(".brama__zjazd .pas-goniec")).toContainText("PRZEWIŃ W DÓŁ, ALEKSANDRO");
  await expect(page.locator('.brama [data-ozdoba="strzalka-dol"]')).toHaveCount(1);
  await expect(page.locator('.brama [data-pas="pas-budowa"]')).toHaveCount(1);
  await expect(page.locator(".brama [data-stwor]")).toHaveCount(2);
  // Wzorzec ROGI: ta sama pozycja w przeciwleglych rogach, prawa odbita (Z6a).
  const ids = await page.locator(".brama [data-stwor] img").evaluateAll((l) => l.map((e) => e.getAttribute("data-ozdoba")));
  expect(new Set(ids).size).toBe(1);
  expect(
    await page.locator('.brama [data-stwor="prawy-dol"]').evaluate((e) => getComputedStyle(e).transform),
  ).toBe("matrix(-1, 0, 0, 1, 0, 0)");
  expect(
    await page.locator('.brama [data-stwor="lewy-dol"]').evaluate((e) => getComputedStyle(e).transform),
  ).toBe("none");
});

test("negatywne: zero rotate i skew w DOM bramy (Z6)", async ({ page }) => {
  await wejdz(page);
  const zle = await page.evaluate(() =>
    [...document.querySelectorAll(".brama, .brama *")]
      .map((e) => ({ k: e.className?.toString?.() ?? "", t: getComputedStyle(e).transform }))
      // scaleX(-1) to matrix(-1,0,0,1,0,0); obrot i skos daja niezerowe b albo c
      .filter((x) => {
        const m = x.t.match(/^matrix\(([^)]+)\)$/);
        if (!m) return x.t !== "none";
        const [, b, c] = m[1].split(",").map(Number);
        return b !== 0 || c !== 0;
      }),
  );
  expect(zle).toEqual([]);
});
