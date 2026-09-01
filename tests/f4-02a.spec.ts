import { test, expect } from "@playwright/test";

// AC F4-02a: pytania 1-5 maja unikalne signature, signature 1 reaguje na hover
// wariantu B (jedno serce `paused`), budzet <= 30 linii na plik; zero emoji w DOM.

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

const NAZWY = [
  "osmiornica-trzy-serca",
  "wenus-obraca-sie-zle",
  "emu-marsz",
  "mlotek-i-piorko",
  "slimak-spi",
];

test("pytania 1-5: kazde ma swoje signature, zadne nie powtarza sasiada", async ({ page }, info) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");

  const podpisy: string[] = [];
  for (let i = 1; i <= 5; i++) {
    await page.locator(`[data-zakladka="${i}"]`).click();
    const slot = page.locator("[data-signature]");
    await expect(slot).toHaveAttribute("data-signature", NAZWY[i - 1]);
    // slot nie moze byc pusty - to ma byc element sceny, nie sama nazwa w atrybucie
    expect(await slot.locator(".sig").count()).toBe(1);
    podpisy.push((await slot.innerHTML()).replace(/\s+/g, " "));
    await page.waitForTimeout(300);
    await slot.screenshot({ path: `screenshots/F4/F4-02a-sig-${i}-${info.project.name}.png` });
  }
  expect(new Set(podpisy).size).toBe(5); // 5 roznych scen, nie 5 tych samych pudelek
});

test("signature 1: hover wariantu B zatrzymuje jedno serce, reszta bije", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  const stan = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-serce]")).map(
        (el) => getComputedStyle(el).animationPlayState,
      ),
    );
  expect(await stan()).toEqual(["running", "running", "running"]);

  await page.locator('[data-wariant-etykieta="B"]').hover();
  expect(await stan()).toEqual(["paused", "running", "running"]);

  // hover innego wariantu niczego nie zatrzymuje
  await page.locator('[data-wariant-etykieta="C"]').hover();
  expect(await stan()).toEqual(["running", "running", "running"]);
});

test("signature 5: klik budzi slimaka na 2 s", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await page.locator('[data-zakladka="5"]').click();
  const slimak = page.locator(".sig--slimak");
  await expect(slimak).toHaveAttribute("data-obudzony", "nie");
  await slimak.click();
  await expect(slimak).toHaveAttribute("data-obudzony", "tak");
  await expect(page.locator(".sig__oko")).toBeVisible();
  await expect(slimak).toHaveAttribute("data-obudzony", "nie", { timeout: 4000 });
});

test("signature 1-5: ruch skokowy i zero emoji w DOM", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  for (let i = 1; i <= 5; i++) {
    await page.locator(`[data-zakladka="${i}"]`).click();
    const kroki = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-signature] .gif-less")).map((el) => {
        const s = getComputedStyle(el);
        return { f: s.animationTimingFunction, d: s.animationDuration, n: s.animationName };
      }),
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
