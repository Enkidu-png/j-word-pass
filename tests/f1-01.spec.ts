import { test, expect } from "@playwright/test";

// AC F1-01: playground pokazuje 7 wariantow gif-less i 5 kafli tla, dekoracje sa
// skokowe (steps), zdesynchronizowane delayami, reduced-motion je zatrzymuje,
// a sciana 20 dekoracji nie generuje long taskow.

test("playground pokazuje 7 wariantow gif-less i 5 kafli tla", async ({ page }, info) => {
  await page.goto("/dev/animacje");
  await expect(page.locator("[data-wariant]")).toHaveCount(7);
  await expect(page.locator("[data-kafel]")).toHaveCount(5);

  // kazdy wariant faktycznie animuje sie krokowo (Z7: wylacznie steps(N), N 2-8,
  // czas 300-1400 ms) - czytane z getComputedStyle, nie z pliku CSS
  const opisy = await page.locator("[data-wariant] .gif-less").evaluateAll((els) =>
    els.map((el) => {
      const s = getComputedStyle(el);
      return {
        nazwa: s.animationName,
        timing: s.animationTimingFunction,
        czasMs: parseFloat(s.animationDuration) * 1000,
        petla: s.animationIterationCount,
      };
    }),
  );
  expect(opisy).toHaveLength(7);
  // chrom rysuje tekst gradientem (background-clip: text) - bez background-image
  // tekst byl niewidoczny; assert pilnuje, ze nic go nie nadpisuje
  const chrom = await page
    .locator("[data-wariant='chrom'] .gif-less")
    .evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(chrom).toContain("linear-gradient");
  for (const o of opisy) {
    expect(o.nazwa).not.toBe("none");
    // przegladarka serializuje domyslne `end` jako `steps(N)`
    const kroki = o.timing.match(/^steps\((\d+)(, end)?\)$/);
    expect(kroki, `timing ${o.nazwa} = ${o.timing}`).not.toBeNull();
    const n = Number(kroki![1]);
    expect(n).toBeGreaterThanOrEqual(2);
    expect(n).toBeLessThanOrEqual(8);
    expect(o.czasMs).toBeGreaterThanOrEqual(300);
    expect(o.czasMs).toBeLessThanOrEqual(1400);
    expect(o.petla).toBe("infinite");
  }

  // kazdy kafel ma proceduralne tlo (gradienty), zero plikow
  const tla = await page.locator("[data-kafel] .kafel-tla").evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).backgroundImage),
  );
  expect(tla).toHaveLength(5);
  for (const t of tla) {
    expect(t).toContain("gradient");
    expect(t).not.toContain("url(");
  }

  await page.screenshot({
    path: `screenshots/F1/F1-01-playground-${info.project.name}.png`,
    fullPage: true,
  });
});

test("desynchronizacja: sciana dekoracji ma rozne animation-delay", async ({ page }) => {
  await page.goto("/dev/animacje");
  const opoznienia = await page
    .locator("[data-sciana] .gif-less")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationDelay));
  expect(opoznienia).toHaveLength(20);
  expect(new Set(opoznienia).size).toBeGreaterThanOrEqual(6);
});

test("reduced-motion zatrzymuje wszystkie dekoracje", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dev/animacje");
  const stan = await page.locator(".gif-less").evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).animationName),
  );
  expect(stan.length).toBeGreaterThan(0);
  expect(stan.every((n) => n === "none")).toBe(true);
  await page.screenshot({
    path: `screenshots/F1/F1-01-reduced-motion-${info.project.name}.png`,
    fullPage: true,
  });
});

test("budzet: 5 s idle na scianie 20 dekoracji bez long taskow > 50 ms", async ({ page }) => {
  test.setTimeout(30_000);
  await page.goto("/dev/animacje");
  // AC mierzy 5 s IDLE, wiec liczy sie tylko to, co dzieje sie po ustabilizowaniu
  // strony. `buffered: true` dociaga tez zadania sprzed obserwacji (w dev-serwerze
  // hydracja to jedno zadanie ~116 ms przy starcie) - odsiewamy je po `startTime`.
  const odKiedy = await page.evaluate(() => {
    const okno = window as unknown as { __dlugie: { d: number; s: number }[] };
    okno.__dlugie = [];
    const start = performance.now();
    new PerformanceObserver((lista) => {
      for (const w of lista.getEntries()) okno.__dlugie.push({ d: w.duration, s: w.startTime });
    }).observe({ type: "longtask", buffered: true });
    return start;
  });
  await page.waitForTimeout(5000);
  const dlugie = await page.evaluate(
    (od) =>
      (window as unknown as { __dlugie: { d: number; s: number }[] }).__dlugie
        .filter((w) => w.s >= od && w.d > 50)
        .map((w) => Math.round(w.d)),
    odKiedy,
  );
  expect(dlugie).toEqual([]);
});
