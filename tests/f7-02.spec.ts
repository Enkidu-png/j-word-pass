import { test, expect } from "@playwright/test";
import { wejdz } from "./pomoc";

// AC F7-02 (plan/02 D, plan/01 E Z1). Naglowek `h1` nie moze byc przycinany
// przy lewej krawedzi okna. Mierzone na zywym widoku, nie z kodu.

const WIDOKI = ["/", "/egzamin", "/quiz"];

const WPUSC = () => {
  window.sessionStorage.setItem(
    "jwp.v1",
    JSON.stringify({
      v: 1,
      egzamin: { odpowiedz: "x", zalaczone: [], punkty: 8, komentarz: "ok" },
      quiz: { odpowiedzi: {}, punkty: 12 },
      ogien: null,
    }),
  );
};

for (const sciezka of WIDOKI) {
  test(`h1 na ${sciezka} miesci sie w viewporcie`, async ({ page }) => {
    await page.addInitScript(WPUSC);
    await wejdz(page, sciezka);
    await page.waitForFunction(() => document.fonts.status === "loaded");

    const pomiar = await page.evaluate(() => {
      const h1 = document.querySelector("main.tresc h1") ?? document.querySelector("h1");
      if (!h1) return null;
      // obrys wlasny naglowka
      const wlasny = h1.getBoundingClientRect();
      // Obrys realnej TRESCI. Dla wezlow tekstowych bierzemy prostokaty
      // Range (glify), dla obrazkow i napisow-obrazkow prostokat elementu.
      // UWAGA: `Range.getClientRects()` na <svg> z <text textLength> oddaje
      // szerokosc SUROWYCH glifow, PRZED skalowaniem viewBox - na bramie
      // wychodzilo 1404 px przy elemencie szerokim na 1256 px. To artefakt
      // pomiaru, nie przyciecie, wiec SVG mierzymy jego wlasnym obrysem
      // (`preserveAspectRatio="xMidYMid meet"` trzyma napis w tym pudelku).
      const tresci: DOMRect[] = [];
      for (const w of [...h1.childNodes]) {
        if (w.nodeType === Node.TEXT_NODE && (w.textContent ?? "").trim()) {
          const zakres = document.createRange();
          zakres.selectNode(w);
          tresci.push(...[...zakres.getClientRects()]);
        }
      }
      for (const el of h1.querySelectorAll("svg, img")) tresci.push(el.getBoundingClientRect());
      const widoczne = tresci.filter((r) => r.width > 0 && r.height > 0);
      const lewa = Math.min(wlasny.left, ...widoczne.map((r) => r.left));
      const prawa = Math.max(wlasny.right, ...widoczne.map((r) => r.right));
      const trescRects: number = widoczne.length;
      return {
        lewa,
        prawa,
        scrollWidth: h1.scrollWidth,
        clientWidthRodzica: (h1.parentElement as HTMLElement).clientWidth,
        okno: window.innerWidth,
        trescRects,
        overflowBody: getComputedStyle(document.body).overflowX,
      };
    });

    expect(pomiar).not.toBeNull();
    console.log(sciezka, JSON.stringify(pomiar));
    expect(pomiar!.lewa).toBeGreaterThanOrEqual(0);
    expect(pomiar!.prawa).toBeLessThanOrEqual(pomiar!.okno);
    expect(pomiar!.scrollWidth).toBeLessThanOrEqual(pomiar!.clientWidthRodzica);
    // negatywne: poprawka nie chowa przepelnienia na `body`
    expect(pomiar!.overflowBody).not.toBe("hidden");
  });
}
