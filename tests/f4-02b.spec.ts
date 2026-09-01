import { test, expect } from "@playwright/test";

// AC F4-02b: signature pytan 6-10 (jak F4-02a), signature 7 reaguje na hover
// wariantu A: kropla galu kapie szybciej (krotsze `animation-duration`).

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
  6: "rosja-strefy",
  7: "gal-topnieje",
  8: "sauna-parowa",
  9: "kosc-udowa",
  10: "mysz-drewniana",
};
const NUMERY = [6, 7, 8, 9, 10];

test("pytania 6-10: kazde ma swoje signature, zadne nie powtarza sasiada", async ({ page }, info) => {
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
    await slot.screenshot({ path: `screenshots/F4/F4-02b-sig-${i}-${info.project.name}.png` });
  }
  expect(new Set(podpisy).size).toBe(5); // 5 roznych scen, nie 5 tych samych pudelek
});

test("signature 7: hover wariantu A przyspiesza kapanie galu", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await page.locator('[data-zakladka="7"]').click();
  const czas = () => page.locator(".sig__kropla").evaluate((el) => getComputedStyle(el).animationDuration);

  expect(await czas()).toBe("0.9s");
  await page.locator('[data-wariant-etykieta="A"]').hover();
  expect(await czas()).toBe("0.3s");
  await page.locator('[data-wariant-etykieta="D"]').hover();
  expect(await czas()).toBe("0.9s");
});

test("signature 9: klik kaze kosci cwiczyc", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await page.locator('[data-zakladka="9"]').click();
  const kosc = page.locator(".sig--kosc");
  await expect(kosc).toHaveAttribute("data-cwiczy", "nie");
  await kosc.click();
  await expect(kosc).toHaveAttribute("data-cwiczy", "tak");
  expect(await page.locator(".sig__kosc").evaluate((el) => getComputedStyle(el).animationName)).toBe(
    "jwp-wyciskanie",
  );
  await expect(kosc).toHaveAttribute("data-cwiczy", "nie", { timeout: 4000 });
});

test("signature 6-10: ruch skokowy i zero emoji w DOM", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  for (const i of NUMERY) {
    await page.locator(`[data-zakladka="${i}"]`).click();
    const kroki = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-signature] .gif-less")).map((el) => {
        const s = getComputedStyle(el);
        return { f: s.animationTimingFunction, d: s.animationDuration, n: s.animationName };
      }),
    );
    // 9 (kosc udowa) nie ma petli z zalozenia: rusza sie WYLACZNIE po kliknieciu
    // (spec 06 D wiersz 9), a Z8 zabrania mieszania dekoracji z ceremonia.
    if (i === 9) expect(kroki.length).toBe(0);
    else expect(kroki.length).toBeGreaterThan(0);
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
