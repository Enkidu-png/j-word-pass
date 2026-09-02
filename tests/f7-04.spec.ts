import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { wejdz } from "./pomoc";

// AC F7-04 (plan/05 A1 kontra plan/01 E Z10, rozstrzygniete w DECISIONS 21).
// Tekst zamknietego pola PassOMetr musi miec kontrast >= 4,5:1, a pole ma
// ZOSTAC szare i przekreslone. Wszystko mierzone na zywej stronie.

const lum = (rgb: number[]) => {
  const k = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (k[0] ?? 0) + 0.7152 * (k[1] ?? 0) + 0.0722 * (k[2] ?? 0);
};
const rozbij = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);

test("kontrast tekstu w zamknietym polu PassOMetr >= 4,5:1", async ({ page }) => {
  await wejdz(page, "/");
  const pola = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".pass-o-metr__pole--zamkniety")).map((pole) => {
      const tresc = pole.querySelector(".pass-o-metr__tresc") as HTMLElement;
      const s = getComputedStyle(tresc);
      return {
        etap: pole.getAttribute("data-etap"),
        kolor: s.color,
        tlo: getComputedStyle(pole).backgroundColor,
        dekoracja: s.textDecorationLine,
        ariaDisabled: tresc.getAttribute("aria-disabled"),
        klodka: pole.querySelector("img[data-ozdoba='stwor-klodka']") !== null,
      };
    }),
  );

  expect(pola.length).toBe(2);
  for (const p of pola) {
    const l1 = lum(rozbij(p.kolor));
    const l2 = lum(rozbij(p.tlo));
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    console.log(`F7-04 etap=${p.etap} ${p.kolor} na ${p.tlo} = ${ratio.toFixed(2)}:1 deco=${p.dekoracja}`);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    // negatywne: charakter zostaje - tlo dalej szare (r=g=b i ciemniejsze niz
    // --papier), tekst dalej przekreslony, pole dalej nieklikalne z klodka.
    const [r, g, b] = rozbij(p.tlo);
    expect(r).toBe(g);
    expect(g).toBe(b);
    expect(r).toBeLessThan(200);
    expect(p.dekoracja).toContain("line-through");
    expect(p.ariaDisabled).toBe("true");
    expect(p.klodka).toBe(true);
  }
});

test("axe na / nie zglasza naruszenia color-contrast", async ({ page }) => {
  await wejdz(page, "/");
  const wynik = await new AxeBuilder({ page }).analyze();
  const kontrast = wynik.violations.filter((v) => v.id === "color-contrast");
  console.log(
    `F7-04 axe /: color-contrast=${kontrast.length}, wszystkie=${wynik.violations.length} ` +
      `[${wynik.violations.map((v) => `${v.id}/${v.impact}x${v.nodes.length}`).join(", ")}]`,
  );
  expect(kontrast.flatMap((v) => v.nodes.map((n) => n.target.join(" ")))).toEqual([]);
});
