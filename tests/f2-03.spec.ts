import { test, expect } from "@playwright/test";

// AC F2-03: przycisk-uciekinier (plan/05 B2).

const DALEKO = { x: 5, y: 5 };

async function najedz(page: import("@playwright/test").Page) {
  const p = page.locator('[data-cta="wole-nie"]');
  // `hover()`, nie `mouse.move` po `boundingBox()`: przycisk stoi ponizej
  // pierwszego ekranu (y ~1000 przy oknie 800), wiec surowy ruch myszy trafial
  // poza viewport i mouseenter nie padal wcale. `hover()` sam dowija strone.
  await p.hover();
  // kursor musi OPUSCIC przycisk, zeby kolejne najechanie sie liczylo
  await page.mouse.move(DALEKO.x, DALEKO.y);
}

test("ucieka dokladnie 3 razy, przy czwartym kapituluje", async ({ page }) => {
  await page.goto("/");
  const przycisk = page.locator('[data-cta="wole-nie"]');
  await expect(przycisk).toHaveText("WOLĘ NIE");

  // Pozycja mierzona wzgledem KONTENERA. `hover()` dowija strone, wiec
  // wspolrzedne ekranowe zmieniaja sie takze wtedy, gdy przycisk stoi w miejscu.
  const gdzie = () => przycisk.evaluate((e: HTMLElement) => `${Math.round(e.offsetLeft)},${Math.round(e.offsetTop)}`);
  const pozycje: string[] = [await gdzie()];
  for (let i = 0; i < 4; i += 1) {
    await najedz(page);
    pozycje.push(await gdzie());
  }
  console.log(`pozycje uciekiniera: ${pozycje.join(" -> ")}`);
  // 3 skoki: pozycja po 3. najechaniu = pozycja po 4. najechaniu
  await expect(przycisk).toHaveAttribute("data-skoki", "3");
  expect(pozycje[3]).toBe(pozycje[4]);
  await expect(przycisk).toHaveText("DOBRZE, ALEKSANDRO, NIECH BĘDZIE");
});

test("klik po kapitulacji prowadzi na /egzamin", async ({ page }) => {
  await page.goto("/");
  for (let i = 0; i < 4; i += 1) await najedz(page);
  await page.locator('[data-cta="wole-nie"]').click();
  await page.waitForURL("**/egzamin");
  expect(new URL(page.url()).pathname).toBe("/egzamin");
});

test("Enter na sfokusowanym przycisku NIE powoduje ucieczki", async ({ page }) => {
  await page.goto("/");
  const przycisk = page.locator('[data-cta="wole-nie"]');
  // pozycja mierzona wzgledem KONTENERA, nie viewportu: `focus()` dowija strone,
  // wiec wspolrzedne ekranowe zmienilyby sie takze bez zadnego skoku
  const gdzie = () => przycisk.evaluate((e: HTMLElement) => `${e.offsetLeft},${e.offsetTop}`);
  const przed = await gdzie();
  await przycisk.focus();
  // sam fokus klawiatura nie rusza przyciskiem
  await expect(przycisk).toHaveAttribute("data-skoki", "0");
  expect(await gdzie()).toBe(przed);
  // Enter aktywuje przycisk (nawigacja na etap 1), a NIE ucieczke
  await page.keyboard.press("Enter");
  await page.waitForURL("**/egzamin");
  expect(new URL(page.url()).pathname).toBe("/egzamin");
});

// Oba projekty z playwright.config.ts to Desktop Chrome (`isMobile: false`),
// wiec `pointer: coarse` nie wystepuje w zadnym z nich. Kontekst dotykowy
// budujemy tu recznie, zamiast ruszac konfiguracje (plan/02 B: bez zmian).
test("przy pointer: coarse ucieczka jest wylaczona", async ({ browser, baseURL }) => {
  const kontekst = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await kontekst.newPage();
  await page.goto(`${baseURL}/`);
  expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
  const przycisk = page.locator('[data-cta="wole-nie"]');
  const gdzie = () => przycisk.evaluate((e: HTMLElement) => `${e.offsetLeft},${e.offsetTop}`);
  const przed = await gdzie();
  await najedz(page);
  await najedz(page);
  await expect(przycisk).toHaveAttribute("data-skoki", "0");
  await expect(przycisk).toHaveText("WOLĘ NIE");
  expect(await gdzie()).toBe(przed);
  await kontekst.close();
});

test("negatywne: zero rotate i pozycja zawsze w obrebie tablicy ogloszen", async ({ page }) => {
  await page.goto("/");
  const przycisk = page.locator('[data-cta="wole-nie"]');
  for (let i = 0; i < 4; i += 1) {
    await najedz(page);
    const wynik = await przycisk.evaluate((el) => {
      const t = getComputedStyle(el).transform;
      const p = el.getBoundingClientRect();
      const k = el.closest(".tablica")!.getBoundingClientRect();
      return { t, miesci: p.left >= k.left - 1 && p.right <= k.right + 1 && p.top >= k.top - 1 && p.bottom <= k.bottom + 1 };
    });
    expect(wynik.t, `transform po skoku ${i + 1}`).toBe("none");
    expect(wynik.miesci, `przycisk poza tablica po skoku ${i + 1}`).toBe(true);
  }
});

test("uciekinier NIGDY nie zaslania przycisku PRZYSTĘPUJĘ (10 losowan)", async ({ page }) => {
  await page.goto("/");
  const uciekinier = page.locator('[data-cta="wole-nie"]');
  const glowny = page.locator('[data-cta="przystepuje"]');
  for (let i = 0; i < 10; i += 1) {
    await najedz(page);
    const wynik = await glowny.evaluate((el) => {
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return t === el || el.contains(t);
    });
    expect(wynik, `uciekinier zaslonił przycisk glowny po najechaniu ${i + 1}`).toBe(true);
  }
  // po limicie skokow przycisk stoi w siatce ozdob, nie na druku
  const w = await uciekinier.evaluate((el) => {
    const p = el.getBoundingClientRect();
    const s = el.closest(".tablica")!.querySelector(".tablica__siatka")!.getBoundingClientRect();
    return p.left >= s.left - 1 && p.right <= s.right + 1 && p.top >= s.top - 1 && p.bottom <= s.bottom + 1;
  });
  expect(w).toBe(true);
});
