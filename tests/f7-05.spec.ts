import { test, expect } from "@playwright/test";
import { wejdz } from "./pomoc";

// AC F7-05 (plan/04 H, K2; plan/05 B1 pkt 6). Odbijany goniec ma liczyc droge
// od szerokosci KONTENERA, nie okna. Mierzone na zywej bramie, w 5 probkach
// czasu rozlozonych na pelny cykl animacji.

test("odbijany goniec na bramie nigdy nie wychodzi poza swoj kontener", async ({ page }) => {
  await wejdz(page, "/");
  await page.waitForFunction(() => document.fonts.status === "loaded");

  const wynik = await page.evaluate(async () => {
    const kontener = document.querySelector<HTMLElement>(".brama__zjazd .pas-goniec")!;
    const tresc = kontener.querySelector<HTMLElement>(".pas-goniec__tresc")!;
    const czas = parseFloat(getComputedStyle(tresc).animationDuration) * 1000;
    // Animacja chodzi od zaladowania strony, wiec probkowanie „od teraz" trafia
    // w losowa faze. Przewijamy ja na poczatek, zeby jeden przebieg pokryl CALA
    // droge: od 0 do maksimum. Bez tego trzeba by czekac dwa czasy trwania.
    // PULAPKA: restart przez `style.animation = "none"` i `""` KASUJE inline
    // `animation-duration`, ktory ustawia komponent - animacja dostaje 0 s,
    // stoi w miejscu, a test przechodzi nie mierzac niczego. Web Animations
    // przewija bez dotykania stylow.
    for (const a of tresc.getAnimations()) a.currentTime = 0;
    const probki: { t: number; lewy: number; prawy: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const k = kontener.getBoundingClientRect();
      const t = tresc.getBoundingClientRect();
      probki.push({ t: i, lewy: t.left - k.left, prawy: k.right - t.right });
      await new Promise((r) => setTimeout(r, (1.05 * czas) / 40));
    }
    return {
      trescW: Math.round(tresc.getBoundingClientRect().width),
      kontenerW: kontener.clientWidth,
      scrollW: tresc.scrollWidth,
      najmniejszyLewy: Math.min(...probki.map((p) => p.lewy)),
      najmniejszyPrawy: Math.min(...probki.map((p) => p.prawy)),
      // K2: droga idzie transformem, nie `left` ani `width`.
      wlasciwosc: getComputedStyle(tresc).animationName,
    };
  });

  console.log(JSON.stringify(wynik));
  // Tolerancja 1 px na zaokraglenia subpikselowe.
  expect(wynik.najmniejszyLewy).toBeGreaterThan(-1);
  expect(wynik.najmniejszyPrawy).toBeGreaterThan(-1);
  expect(wynik.scrollW).toBeLessThanOrEqual(wynik.kontenerW);
  expect(wynik.wlasciwosc).toBe("goniec-odbijany");
});

// Negatywne AC (plan/04 K2): droga jest robiona transformem, zero animacji
// `left`, `width`, `top` i `height`.
test("keyframes odbijanego gonca rusza wylacznie transformem", async ({ page }) => {
  await wejdz(page, "/");
  const klatki = await page.evaluate(() => {
    const out: string[] = [];
    for (const arkusz of [...document.styleSheets]) {
      let reguly: CSSRuleList;
      try {
        reguly = arkusz.cssRules;
      } catch {
        continue;
      }
      for (const r of [...reguly]) {
        if (r instanceof CSSKeyframesRule && r.name === "goniec-odbijany") {
          for (const k of [...r.cssRules]) out.push(k.cssText);
        }
      }
    }
    return out;
  });
  expect(klatki.length).toBeGreaterThan(0);
  const tekst = klatki.join(" ");
  expect(tekst).toContain("transform");
  for (const zakazana of ["left:", "width:", "top:", "height:"]) {
    expect(tekst, `keyframes: ${tekst}`).not.toContain(zakazana);
  }
  // Droga liczona od kontenera (cqw), nie od okna (vw).
  expect(tekst).not.toContain("vw");
});
