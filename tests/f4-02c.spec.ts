import { test, expect } from "@playwright/test";

// AC F4-02c: signature pytan 11-15 (jak F4-02a), signature 12 reaguje na hover
// wariantu A (nutki w usmiech), signature 14 blyska przy poprawnym wpisie.

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

const NAZWY: Record<number, string> = {
  11: "rekin-starszy-od-drzew",
  12: "mozart-kanon",
  13: "mrowki-hodowcy",
  14: "skala-twardosci",
  15: "wombat-kostka",
};
const NUMERY = [11, 12, 13, 14, 15];

test("pytania 11-15: kazde ma swoje signature, zadne nie powtarza sasiada", async ({ page }, info) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");

  const podpisy: string[] = [];
  for (const i of NUMERY) {
    await page.locator(`[data-zakladka="${i}"]`).click();
    const slot = page.locator("[data-signature]");
    await expect(slot).toHaveAttribute("data-signature", NAZWY[i]);
    // slot nie moze byc pusty - to ma byc element sceny, nie sama nazwa w atrybucie
    expect(await slot.locator(".sig").count()).toBe(1);
    podpisy.push((await slot.innerHTML()).replace(/\s+/g, " "));
    await page.waitForTimeout(300);
    await slot.screenshot({ path: `screenshots/F4/F4-02c-sig-${i}-${info.project.name}.png` });
  }
  expect(new Set(podpisy).size).toBe(5); // 5 roznych scen, nie 5 tych samych pudelek
});

test("signature 12: hover wariantu A uklada nutki w usmiech", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await page.locator('[data-zakladka="12"]').click();
  const nutki = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll(".sig__nutka")).map((el) => {
        const s = getComputedStyle(el);
        return { ruch: s.animationName, y: new DOMMatrix(s.transform).f };
      }),
    );

  for (const n of await nutki()) expect(n.ruch).toBe("jwp-nutka");

  await page.locator('[data-wariant-etykieta="A"]').hover();
  const usmiech = await nutki();
  for (const n of usmiech) expect(n.ruch).toBe("none");
  // usmiech: skrajne nutki wyzej (mniejsze y), srodkowe nizej
  expect(usmiech[0].y).toBeLessThan(usmiech[1].y);
  expect(usmiech[3].y).toBeLessThan(usmiech[2].y);
  expect(usmiech[0].y).toBe(usmiech[3].y);

  await page.locator('[data-wariant-etykieta="C"]').hover();
  for (const n of await nutki()) expect(n.ruch).toBe("jwp-nutka");
});

test("signature 14: kamyk 10 blyska dopiero przy trafionym wpisie", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await page.locator('[data-zakladka="14"]').click();
  const diament = page.locator(".sig__diament");
  const ruch = () => diament.evaluate((el) => getComputedStyle(el).animationName);

  await page.locator("[data-luka]").fill("richtera");
  expect(await ruch()).toBe("none");

  await page.locator("[data-luka]").fill("skala Mohsa");
  expect(await ruch()).toBe("jwp-blink");

  await page.locator("[data-luka]").fill("");
  expect(await ruch()).toBe("none");
});

test("signature 11-15: ruch skokowy i zero emoji w DOM", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  for (const i of NUMERY) {
    await page.locator(`[data-zakladka="${i}"]`).click();
    // 14 rusza sie dopiero po trafionym wpisie (blysk kamyka 10) - wpisujemy klucz,
    // zeby bylo co mierzyc; przed wpisem slot stoi i tak ma byc.
    if (i === 14) await page.locator("[data-luka]").fill("mohsa");
    const kroki = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-signature] .gif-less"))
        .map((el) => {
          const s = getComputedStyle(el);
          return { f: s.animationTimingFunction, d: s.animationDuration, n: s.animationName };
        })
        // diament pytania 14 stoi, dopoki wpis nie trafi - to nie jest petla do sprawdzania
        .filter((k) => k.n !== "none"),
    );
    expect(kroki.length).toBeGreaterThan(0);
    for (const k of kroki) {
      expect(k.n).not.toBe("none");
      expect(k.f).toMatch(/^steps\([2-8]\)$/); // Z7: wylacznie skoki, 2-8 klatek
      const ms = Number(k.d.replace("s", "")) * 1000;
      expect(ms).toBeGreaterThanOrEqual(300);
      expect(ms).toBeLessThanOrEqual(1400);
    }
    const html = await page.content();
    expect(
      html.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu) ?? [],
    ).toEqual([]);
  }
});
