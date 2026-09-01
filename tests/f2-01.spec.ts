import { test, expect } from "@playwright/test";

// AC F2-01: piec elementow shella, druk strazy bez redirectu, PassOMetr blokuje
// przyszle etapy dymkiem, :focus-visible daje dashed outline, mobile chowa
// PassOMetr nad stopke; negatywne: zero sticky headera, zero hamburgera.

test("shell: piec elementow na kazdej stronie", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-pasek-krawedzi]")).toBeVisible();
  await expect(page.locator("[data-pass-o-metr]")).toBeVisible();
  await expect(page.locator("[data-webring]")).toBeVisible();
  await expect(page.locator("[data-licznik-odwiedzin]")).toBeVisible();

  // kursor-komisji: wlasny SVG na html i wariant przechylony na klikalnych
  const kursorStrony = await page.evaluate(
    () => getComputedStyle(document.documentElement).cursor,
  );
  expect(kursorStrony).toContain("data:image/svg+xml");
  const kursorLinku = await page
    .locator("[data-webring] a")
    .first()
    .evaluate((el) => getComputedStyle(el).cursor);
  expect(kursorLinku).toContain("rotate(20 16 16)");

  // marquee: rwany przesuw, duzo krokow (DECISIONS #4)
  const marquee = await page
    .locator(".pasek-krawedzi__marquee")
    .evaluate((el) => {
      const s = getComputedStyle(el);
      return { nazwa: s.animationName, timing: s.animationTimingFunction, czas: s.animationDuration };
    });
  expect(marquee.nazwa).toBe("jwp-marquee");
  expect(marquee.timing).toMatch(/^steps\(24(, end)?\)$/);
  expect(marquee.czas).toBe("3.8s");

  // licznik odwiedzin dolicza po hydracji, ale nigdy nie schodzi ponizej bazy
  const odwiedziny = Number(
    await page.locator("[data-licznik-odwiedzin] [data-licznik]").getAttribute("data-licznik"),
  );
  expect(odwiedziny).toBeGreaterThanOrEqual(1545013);
  expect(odwiedziny).toBeLessThan(1545013 + 997);
});

test("wejscie z URL na /quiz bez egzaminu: druk strazy, ZERO redirectu", async ({ page }) => {
  await page.goto("/quiz");
  await expect(page).toHaveURL(/\/quiz$/); // Z15: nie odbieramy kontroli, brak przekierowania
  const straz = page.locator("[data-straz]");
  await expect(straz).toBeVisible();
  await expect(straz).toContainText("KOMISJA ZABRANIA. NAJPIERW ETAP 1.");
  // tresc etapu renderuje sie normalnie pod drukiem
  await expect(page.locator("h1")).toBeVisible();

  await page.goto("/proba-ognia");
  await expect(page).toHaveURL(/\/proba-ognia$/);
  await expect(page.locator("[data-straz]")).toContainText("KOMISJA ZABRANIA. NAJPIERW ETAP 2.");

  // po ukonczeniu egzaminu druk na /quiz znika
  await page.goto("/");
  await page.evaluate(() => {
    sessionStorage.setItem(
      "jwp.v1",
      JSON.stringify({
        v: 1,
        egzamin: { odpowiedz: "x", zalaczone: [], punkty: 7, komentarz: null },
        quiz: null,
        ogien: null,
      }),
    );
  });
  await page.goto("/quiz");
  await expect(page.locator("[data-straz]")).toHaveCount(0);
});

test("PassOMetr: przyszly etap nie nawiguje, pokazuje dymek", async ({ page }) => {
  await page.goto("/");
  const quiz = page.locator("[data-segment='quiz']");
  await expect(quiz).toHaveAttribute("data-stan", "zablokowany");
  await expect(quiz).toHaveAttribute("title", "KOMISJA ZABRANIA");

  await quiz.click();
  await expect(page.locator("[data-dymek]")).toHaveText("KOMISJA ZABRANIA");
  await expect(page).toHaveURL(/\/$/); // nawigacji nie bylo
  // dymek gasnie sam po ~1,2 s
  await expect(page.locator("[data-dymek]")).toHaveCount(0, { timeout: 3000 });

  // etap dostepny nawiguje normalnie
  await page.locator("[data-segment='egzamin']").click();
  await expect(page).toHaveURL(/\/egzamin$/);
});

test("focus-visible: dashed outline, nigdy outline none", async ({ page }, info) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const opis = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return { styl: s.outlineStyle, szerokosc: s.outlineWidth, znacznik: el.tagName };
  });
  expect(opis.styl).toBe("dashed");
  expect(parseFloat(opis.szerokosc)).toBeGreaterThan(0);
  await page.screenshot({ path: `screenshots/F2/F2-01-fokus-${info.project.name}.png` });
});

test("negatywne: zero sticky headera, zero hamburgera", async ({ page }) => {
  await page.goto("/");
  const lepkie = await page.evaluate(() =>
    [...document.querySelectorAll("body *")].filter((el) => {
      const p = getComputedStyle(el).position;
      return p === "sticky" || (p === "fixed" && el.tagName === "HEADER");
    }).length,
  );
  expect(lepkie).toBe(0);
  await expect(page.locator("header")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /menu|hamburger/i })).toHaveCount(0);
});

test("mobile 390: pasek chudszy, PassOMetr schodzi nad stopke", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "dotyczy wylacznie viewportu 390 px");
  await page.goto("/");
  const pasek = page.locator("[data-pasek-krawedzi]");
  expect((await pasek.boundingBox())!.height).toBe(32);

  const metr = page.locator("[data-pass-o-metr]");
  expect(await metr.evaluate((el) => getComputedStyle(el).position)).toBe("static");
  const pudloMetra = (await metr.boundingBox())!;
  const pudloStopki = (await page.locator("[data-webring]").boundingBox())!;
  const pudloTresci = (await page.locator("h1").boundingBox())!;
  expect(Math.round(pudloMetra.width)).toBe(390); // pasek na pelna szerokosc
  // "nad stopka" znaczy NA DOLE strony: pod trescia etapu i tuz nad stopka,
  // a nie gdziekolwiek wyzej niz stopka
  expect(pudloMetra.y).toBeGreaterThan(pudloTresci.y);
  expect(pudloMetra.y).toBeLessThan(pudloStopki.y);
  expect(pudloStopki.y - (pudloMetra.y + pudloMetra.height)).toBeLessThan(8);

  // przestawiona jest tylko kolejnosc WIZUALNA - Tab nadal idzie wg DOM
  const domPrzedTrescia = await page.evaluate(() => {
    const metr = document.querySelector("[data-pass-o-metr]")!;
    const naglowek = document.querySelector("h1")!;
    const stopka = document.querySelector("[data-webring]")!;
    return {
      // Node.DOCUMENT_POSITION_FOLLOWING = 4
      przedTrescia: !!(metr.compareDocumentPosition(naglowek) & 4),
      przedStopka: !!(metr.compareDocumentPosition(stopka) & 4),
    };
  });
  expect(domPrzedTrescia).toEqual({ przedTrescia: true, przedStopka: true });
});
