import { test, expect } from "@playwright/test";

// AC F1-02: ceremonia demo 3 kroki + Esc do stanu koncowego, kometa wylaczona
// na dotyku i przy reduced-motion oraz bez rAF w tle, licznik 0 -> 42 <= 900 ms,
// pieczatka wbija sie w 350 ms.

test("ceremonia demo: 3 kroki po kolei, Esc skacze do stanu koncowego", async ({ page }) => {
  await page.goto("/dev/animacje");
  const stan = page.locator("[data-stan-koncowy]");
  await expect(stan).toHaveAttribute("data-stan-koncowy", "nie");

  // pelny przebieg: kroki zapalaja sie sekwencyjnie
  await page.locator("[data-odpraw]").click();
  await expect(page.locator("[data-krok='0']")).toHaveAttribute("data-osiagniety", "tak");
  await expect(page.locator("[data-krok='2']")).toHaveAttribute("data-osiagniety", "nie");
  await expect(stan).toHaveAttribute("data-stan-koncowy", "tak", { timeout: 4000 });

  // pominiecie Esc: stan koncowy NATYCHMIAST, kandydat nic nie traci
  await page.locator("[data-odpraw]").click();
  await expect(page.locator("[data-krok='0']")).toHaveAttribute("data-osiagniety", "nie");
  const start = Date.now();
  await page.keyboard.press("Escape");
  await expect(stan).toHaveAttribute("data-stan-koncowy", "tak");
  expect(Date.now() - start).toBeLessThan(600);
  // Z9: fokus konczy na sensownym elemencie
  await expect(stan).toBeFocused();
});

test("kometa: obecna na wskazniku precyzyjnym, znika na dotyku i przy reduced-motion", async ({
  page,
}) => {
  await page.goto("/dev/animacje");
  await expect(page.locator("[data-kometa]")).toHaveCount(1);
  await expect(page.locator(".kometa-kursora__kwadrat")).toHaveCount(8);

  // ogon faktycznie goni kursor (krok co 3 klatki rAF, skokowo)
  await page.mouse.move(120, 200);
  await page.waitForTimeout(200);
  const pierwszy = page.locator(".kometa-kursora__kwadrat").first();
  await expect
    .poll(() => pierwszy.evaluate((el) => (el as HTMLElement).style.transform))
    .toContain("120px, 200px");
  await page.mouse.move(300, 500);
  await page.waitForTimeout(200);
  await expect
    .poll(() => pierwszy.evaluate((el) => (el as HTMLElement).style.transform))
    .toContain("300px, 500px");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator("[data-kometa]")).toHaveCount(0);
});

test("kometa znika przy (pointer: coarse)", async ({ browser }) => {
  const kontekst = await browser.newContext({ hasTouch: true, isMobile: true });
  const strona = await kontekst.newPage();
  await strona.goto("/dev/animacje");
  expect(await strona.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
  await expect(strona.locator("[data-kometa]")).toHaveCount(0);
  await kontekst.close();
});

test("negatywne: kometa nie generuje rAF gdy karta jest ukryta", async ({ page }) => {
  await page.goto("/dev/animacje");
  await expect(page.locator("[data-kometa]")).toHaveCount(1);

  await page.evaluate(() => {
    const okno = window as unknown as { __rafy: number };
    okno.__rafy = 0;
    const oryginal = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => {
      okno.__rafy++;
      return oryginal(cb);
    };
  });

  // dzialajaca petla liczy klatki
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as { __rafy: number }).__rafy)).toBeGreaterThan(0);

  // karta w tle: petla staje
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
    (window as unknown as { __rafy: number }).__rafy = 0;
  });
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as unknown as { __rafy: number }).__rafy)).toBe(0);
});

test("licznik mechaniczny: 0 -> 42 krec sie nie dluzej niz 900 ms", async ({ page }) => {
  await page.goto("/dev/animacje");
  const licznik = page.locator("[data-licznik]");
  await expect(licznik).toHaveAttribute("data-licznik", "0");

  await page.locator("[data-na42]").click();
  await expect(licznik).toHaveAttribute("data-licznik", "42");

  const czasy = await page.locator(".licznik-mechaniczny__tasma").evaluateAll((els) =>
    els.map((el) => parseFloat(getComputedStyle(el).transitionDuration) * 1000),
  );
  expect(czasy).toHaveLength(4);
  expect(Math.max(...czasy)).toBeLessThanOrEqual(900);
  // bebny przeskakuja, nie plyna (Z7)
  const timing = await page
    .locator(".licznik-mechaniczny__tasma")
    .first()
    .evaluate((el) => getComputedStyle(el).transitionTimingFunction);
  expect(timing).toMatch(/^steps\(10(, end)?\)$/);

  // kolumny stoja na cyfrach 0,0,4,2
  const pozycje = await page.locator(".licznik-mechaniczny__tasma").evaluateAll((els) =>
    els.map((el) => (el as HTMLElement).style.transform),
  );
  // przegladarka normalizuje -0% do 0%
  expect(pozycje).toEqual([
    "translateY(0%)",
    "translateY(0%)",
    "translateY(-40%)",
    "translateY(-20%)",
  ]);
});

test("pieczatka wbija sie w 350 ms krokami", async ({ page }) => {
  await page.goto("/dev/animacje");
  await page.locator("[data-wbij]").click();

  const stemple = page.locator(".pieczatka.ceremonia");
  await expect(stemple).toHaveCount(3);
  const opis = await stemple.first().evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      nazwa: s.animationName,
      czasMs: parseFloat(s.animationDuration) * 1000,
      timing: s.animationTimingFunction,
      petle: s.animationIterationCount,
    };
  });
  expect(opis.nazwa).toBe("jwp-wbicie");
  expect(opis.czasMs).toBe(350);
  expect(opis.timing).toMatch(/^steps\(4(, end)?\)$/);
  expect(opis.petle).toBe("1");

  // tekst po luku, kolor z tonu, zero plikow graficznych
  await expect(stemple.first().locator("textPath")).toHaveText("ZALACZONO");
  await expect(stemple.first().locator("svg")).toHaveAttribute("aria-label", "ZALACZONO");
});
