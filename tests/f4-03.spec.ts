import { test, expect } from "@playwright/test";
import pytania from "../data/quiz.json";

// AC F4-03 (plan/07 C, D, E). Maszyna prawdy, tryb rewizji, przejscie na etap 3.

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

// Komplet odpowiedzi: wszystkie poprawne poza pytaniem 2 (celowo bledne).
const KOMPLET: Record<string, string> = {};
for (const p of pytania) {
  KOMPLET[String(p.id)] = p.typ === "otwarte" ? "skala Mohsa" : (p.poprawna as string);
}
KOMPLET["2"] = pytania[1].poprawna === "A" ? "B" : "A";

// UWAGA: `addInitScript` SERIALIZUJE funkcje, wiec nie ma tu domkniecia -
// odpowiedzi musza przyjsc argumentem, inaczej w przegladarce leci ReferenceError
// i test cicho pracuje na pustym arkuszu.
const wypelnij = (odpowiedzi: Record<string, string>) => {
  // `addInitScript` odpala sie takze przy `page.reload()`, a ponowne wypelnienie
  // skasowaloby punkty zapisane przez ceremonie
  if (JSON.parse(window.sessionStorage.getItem("jwp.v1") ?? "{}")?.quiz) return;
  window.sessionStorage.setItem(
    "jwp.v1",
    JSON.stringify({
      v: 1,
      egzamin: { odpowiedz: "x", zalaczone: [], punkty: 8, komentarz: "ok" },
      quiz: { odpowiedzi, punkty: null },
      ogien: null,
    }),
  );
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(WPUSC);
});

test("pelna ceremonia miesci sie w 9000 ms i konczy przyciskiem na etap 3", async ({ page }) => {
  await page.addInitScript(wypelnij, KOMPLET);
  await page.goto("/quiz");
  await page.locator("[data-kwadrat='15']").click();
  const start = await page.evaluate(() => performance.now());
  await page.locator("[data-cta='oddaj-arkusz']").click();
  await expect(page.locator("[data-potwierdzenie]")).toHaveCount(0);
  await page.locator("[data-cta='do-etapu-3']").waitFor({ timeout: 12_000 });
  const czas = await page.evaluate((s) => performance.now() - s, start);
  console.log(`pelna ceremonia: ${Math.round(czas)} ms`);
  expect(czas).toBeLessThanOrEqual(9000);

  await expect(page.locator("[data-punkty]")).toHaveText(`PUNKTY: 14 / 15`);
  await expect(page.locator(".maszyna__napis")).toHaveAttribute("aria-label", "14/15");
  await expect(page.locator(".maszyna__ogien")).toHaveCount(2);
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}").quiz.punkty))
    .toBe(14);

  await page.locator("[data-cta='do-etapu-3']").click();
  await expect(page).toHaveURL(/\/proba-ognia$/);
  await expect(page.locator(".straz")).toHaveCount(0);
});

test("Escape pokazuje wszystkie werdykty naraz", async ({ page }) => {
  await page.addInitScript(wypelnij, KOMPLET);
  await page.goto("/quiz");
  await page.locator("[data-kwadrat='15']").click();
  await page.locator("[data-cta='oddaj-arkusz']").click();
  await expect(page.locator("[data-kwadrat='15']")).not.toHaveAttribute("data-werdykt", /.+/);
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-werdykt]")).toHaveCount(15);
  await expect(page.locator("[data-kwadrat='2']")).toHaveAttribute("data-werdykt", "falsz");
  await expect(page.locator("[data-kwadrat='1']")).toHaveAttribute("data-werdykt", "prawda");
  await expect(page.locator("[data-punkty]")).toHaveText("PUNKTY: 14 / 15");
});

test("nieodpowiedziane licza sie jako bledne po potwierdzeniu druku", async ({ page }) => {
  await page.addInitScript(wypelnij, { ...KOMPLET, "3": "", "9": "", "14": "" });
  await page.goto("/quiz");
  await page.locator("[data-kwadrat='15']").click();
  await page.locator("[data-cta='oddaj-arkusz']").click();
  const druk = page.locator("[data-potwierdzenie]");
  await expect(druk).toContainText("ALEKSANDRO, PYTAŃ BEZ ODPOWIEDZI: 3. LICZĄ SIĘ JAKO BŁĘDNE.");

  // WRACAM zamyka druk bez oddawania arkusza
  await page.locator("[data-cta='wracam']").click();
  await expect(druk).toHaveCount(0);
  await expect(page.locator("[data-maszyna]")).toHaveCount(0);

  await page.locator("[data-cta='oddaj-arkusz']").click();
  await page.locator("[data-cta='potwierdzam']").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-punkty]")).toHaveText("PUNKTY: 11 / 15");
  for (const nr of [3, 9, 14]) {
    await expect(page.locator(`[data-kwadrat='${nr}']`)).toHaveAttribute("data-werdykt", "pustka");
  }
});

test("tryb rewizji: poprawna ramka --jad, bledna line-through i ramka --alarm", async ({ page }) => {
  await page.addInitScript(wypelnij, KOMPLET);
  await page.goto("/quiz");
  await page.locator("[data-kwadrat='15']").click();
  await page.locator("[data-cta='oddaj-arkusz']").click();
  await page.keyboard.press("Escape");
  await page.locator("[data-cta='obejrzyj-arkusz']").click();

  await page.locator("[data-kwadrat='2']").click();
  const poprawna = page.locator(`[data-wariant='${pytania[1].poprawna}']`);
  const bledna = page.locator(`[data-wariant='${KOMPLET["2"]}']`);
  await expect(poprawna).toHaveAttribute("data-rewizja", "poprawna");
  await expect(bledna).toHaveAttribute("data-rewizja", "bledna");
  const styl = (l: typeof poprawna) =>
    l.evaluate((e) => {
      const cs = getComputedStyle(e);
      return {
        ramka: `${cs.borderTopStyle} ${cs.borderTopColor}`,
        przekreslenie: cs.textDecorationLine,
        transform: cs.transform,
      };
    });
  const dobra = await styl(poprawna);
  const zla = await styl(bledna);
  console.log(`rewizja poprawna: ${JSON.stringify(dobra)} | bledna: ${JSON.stringify(zla)}`);
  expect(dobra.ramka).toBe("solid rgb(57, 255, 20)");
  expect(zla.ramka).toBe("solid rgb(204, 0, 96)");
  expect(zla.przekreslenie).toBe("line-through");
  // negatywne: przekreslenie POZIOME, zero skosu (Z6)
  expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(zla.transform);
});

test("wynik wraca po page.reload() bez powtarzania ceremonii", async ({ page }) => {
  await page.addInitScript(wypelnij, KOMPLET);
  await page.goto("/quiz");
  await page.locator("[data-kwadrat='15']").click();
  await page.locator("[data-cta='oddaj-arkusz']").click();
  await page.keyboard.press("Escape");
  await page.locator("[data-cta='do-etapu-3']").waitFor();

  await page.reload();
  // bez ceremonii: wynik i przycisk sa od razu
  await page.locator("[data-cta='do-etapu-3']").waitFor({ timeout: 3000 });
  await expect(page.locator("[data-punkty]")).toHaveText("PUNKTY: 14 / 15");
});

test("negatywne: zero obrotu i zero perspektywy 3D w calym widoku", async ({ page }) => {
  await page.addInitScript(wypelnij, KOMPLET);
  await page.goto("/quiz");
  await page.locator("[data-kwadrat='15']").click();
  await page.locator("[data-cta='oddaj-arkusz']").click();
  await page.keyboard.press("Escape");
  await page.locator("[data-cta='obejrzyj-arkusz']").click();
  const podejrzane = await page.evaluate(() =>
    [...document.querySelectorAll("main.tresc *")]
      .filter((e) => {
        const cs = getComputedStyle(e);
        const t = cs.transform;
        // scaleX(-1) (lustro) jest dozwolone, obrot i skos nie
        const obrot = t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)" && t !== "matrix(-1, 0, 0, 1, 0, 0)";
        return obrot || cs.perspective !== "none" || cs.transformStyle === "preserve-3d";
      })
      .map((e) => `${e.className} ${getComputedStyle(e).transform}`),
  );
  expect(podejrzane).toEqual([]);
});
