import { test, expect } from "@playwright/test";

// AC F6-02: brak long tasks > 50 ms w 5 s IDLE na kazdej z 4 stron.
// Mierzone na BUDDZIE PRODUKCYJNYM (`pnpm build && npx next start -p 3100`), bo
// serwer dev kompiluje na zadanie i podaje nieminifikowany kod - to wlasnie
// zawyzalo pomiar w znalezisku F7-01. Test odpala sie tylko, gdy port 3100
// odpowiada; inaczej pomija sie sam (pelny przebieg suite nie ma pasc przez
// brak recznie wystartowanego serwera).

const PROD = "http://localhost:3100";

const WPUSC = () => {
  if (window.sessionStorage.getItem("jwp.v1")) return;
  window.sessionStorage.setItem(
    "jwp.v1",
    JSON.stringify({
      v: 1,
      egzamin: { odpowiedz: "x", zalaczone: [], punkty: 9, komentarz: "ok" },
      quiz: { odpowiedzi: {}, punkty: 13 },
      ogien: null,
    }),
  );
};

for (const sciezka of ["/", "/egzamin", "/quiz", "/proba-ognia"]) {
  test(`zero long tasks > 50 ms w 5 s idle: ${sciezka}`, async ({ page, request }, info) => {
    test.skip(info.project.name !== "desktop", "budzet mierzymy raz, na 1280x800");
    test.slow();
    const zyje = await request.get(`${PROD}/`).then((r) => r.ok()).catch(() => false);
    test.skip(!zyje, "brak buildu produkcyjnego na 3100 - patrz naglowek pliku");

    await page.addInitScript(WPUSC);
    await page.addInitScript(() => {
      (window as unknown as { __dlugie: number[] }).__dlugie = [];
      new PerformanceObserver((lista) => {
        for (const w of lista.getEntries()) {
          (window as unknown as { __dlugie: number[] }).__dlugie.push(Math.round(w.duration));
        }
      }).observe({ type: "longtask", buffered: true });
    });

    await page.goto(`${PROD}${sciezka}`, { waitUntil: "load" });
    // okno IDLE liczy sie PO ustabilizowaniu strony: hydracja to nie bezczynnosc
    await page.waitForTimeout(1500);
    await page.evaluate(() => ((window as unknown as { __dlugie: number[] }).__dlugie.length = 0));
    await page.waitForTimeout(5000);
    const dlugie = await page.evaluate(() => (window as unknown as { __dlugie: number[] }).__dlugie);
    expect(dlugie.filter((d) => d > 50)).toEqual([]);
  });
}

test("F7-01: hydracja na buildzie produkcyjnym nie daje long taska > 50 ms", async ({ page, request }, info) => {
  test.skip(info.project.name !== "desktop", "pomiar raz");
  const zyje = await request.get(`${PROD}/`).then((r) => r.ok()).catch(() => false);
  test.skip(!zyje, "brak buildu produkcyjnego na 3100");

  await page.addInitScript(() => {
    (window as unknown as { __dlugie: number[] }).__dlugie = [];
    new PerformanceObserver((lista) => {
      for (const w of lista.getEntries()) {
        (window as unknown as { __dlugie: number[] }).__dlugie.push(Math.round(w.duration));
      }
    }).observe({ type: "longtask", buffered: true });
  });
  // /dev/animacje to strona, na ktorej F7-01 zmierzyl 116 ms na serwerze DEV
  await page.goto(`${PROD}/dev/animacje`, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  const dlugie = await page.evaluate(() => (window as unknown as { __dlugie: number[] }).__dlugie);
  console.log("F7-01 long taski od nawigacji do 3 s (prod):", JSON.stringify(dlugie));
  expect(Math.max(0, ...dlugie)).toBeLessThanOrEqual(50);
});
