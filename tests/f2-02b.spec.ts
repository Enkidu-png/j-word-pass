import { test, expect } from "@playwright/test";

// AC wspolne dla F2-02a i F2-02b (patrz DECISIONS.md #18): gestosc Z8, rozne
// opoznienia ozdob tablicy, pole `ALEKSANDRA` z `readonly`, drozne przyciski.

test("gestosc bramy: minimum 12 animowanych elementow (Z8)", async ({ page }) => {
  await page.goto("/");
  const policz = async (selektor: string) => page.locator(selektor).count();
  const ozdoby = await policz(".brama img[data-ozdoba]");
  const pasy = await policz(".brama [data-pas]");
  const gonce = await policz(".brama .pas-goniec");
  const razem = ozdoby + pasy + gonce;
  console.log(`gestosc bramy: ozdoby=${ozdoby} pasy=${pasy} gonce=${gonce} razem=${razem}`);
  expect(razem).toBeGreaterThanOrEqual(12);
  // Z8 dokladniej: minimum 2 w rogach i minimum 1 pas na cala szerokosc.
  expect(await policz(".brama [data-stwor]")).toBeGreaterThanOrEqual(2);
  expect(pasy).toBeGreaterThanOrEqual(1);
});

test("ozdoby tablicy maja co najmniej 6 roznych animation-delay", async ({ page }) => {
  await page.goto("/");
  const opoznienia = await page
    .locator(".tablica__ozdoba")
    .evaluateAll((l) => l.map((e) => getComputedStyle(e).animationDelay));
  console.log(`animation-delay tablicy: ${opoznienia.join(", ")}`);
  expect(opoznienia.length).toBeGreaterThanOrEqual(6);
  expect(new Set(opoznienia).size).toBeGreaterThanOrEqual(6);
  // roznica minimum 120 ms miedzy sasiadami (plan/05 B1 punkt 7)
  const ms = opoznienia.map((o) => Number(o.replace("s", "")) * 1000).sort((a, b) => a - b);
  for (let i = 1; i < ms.length; i += 1) expect(ms[i] - ms[i - 1]).toBeGreaterThanOrEqual(120);
  // szesc pol w dwoch rzedach po trzy na desktopie
  await expect(page.locator(".tablica__pole")).toHaveCount(6);
});

test("pole imienia ma wartosc ALEKSANDRA i atrybut readonly", async ({ page }) => {
  await page.goto("/");
  const pole = page.locator('[data-pole="imie"]');
  await expect(pole).toHaveValue("ALEKSANDRA");
  await expect(pole).toHaveAttribute("readonly", /.*/);
});

test("nic nie zaslania przyciskow bramy (elementFromPoint)", async ({ page }) => {
  await page.goto("/");
  const przyciski = page.locator(".brama button, .brama a, .brama input");
  const ile = await przyciski.count();
  expect(ile).toBeGreaterThan(0);
  for (let i = 0; i < ile; i += 1) {
    const wynik = await przyciski.nth(i).evaluate((el) => {
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      const trafiony = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return { ja: el.outerHTML.slice(0, 60), trafiony: trafiony === el || el.contains(trafiony), co: trafiony?.outerHTML.slice(0, 60) ?? "" };
    });
    expect(wynik.trafiony, `zaslonięty: ${wynik.ja} przez ${wynik.co}`).toBe(true);
  }
});

test("negatywne: brama nie jest hero z dwoma przyciskami w pustce", async ({ page }) => {
  await page.goto("/");
  // przycisk stoi WEWNATRZ tablicy ogloszen, nie w pustej przestrzeni
  await expect(page.locator('.tablica [data-cta="przystepuje"]')).toHaveCount(1);
});
