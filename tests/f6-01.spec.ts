import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// AC F6-01: axe = 0 bledow critical na 4 stronach, caly flow brama -> pergamin
// bez myszy, zero `outline: none` bez zamiennika.

const PELNY_STAN = () => {
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
  test(`axe bez bledow critical: ${sciezka}`, async ({ page }, info) => {
    await page.addInitScript(PELNY_STAN);
    await page.goto(sciezka);
    await page.waitForTimeout(500);
    const wynik = await new AxeBuilder({ page }).analyze();
    // AC wymaga zera CRITICAL; audyt domknal takze serious (kontrasty, aria na <p>),
    // wiec prog jest ostrzejszy niz AC - inaczej regresja wrocilaby niezauwazona.
    const powazne = wynik.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    if (powazne.length > 0) {
      console.log(`${sciezka} [${info.project.name}]`, JSON.stringify(powazne.map((v) => ({ id: v.id, n: v.nodes.length, cel: v.nodes[0]?.target })), null, 1));
    }
    // pelna lista do wgladu, takze serious - kontrasty tokenow siedza wlasnie tam
    const inne = wynik.violations.filter((v) => v.impact !== "critical");
    if (inne.length > 0) {
      console.log(`${sciezka} [${info.project.name}] NIE-CRITICAL`, JSON.stringify(inne.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, cel: v.nodes[0]?.target, html: v.nodes[0]?.html?.slice(0, 120) })), null, 1));
    }
    expect(powazne).toEqual([]);
  });
}

test("NEGATYWNE: zaden outline:none nie zostaje bez zamiennika", async ({ page }) => {
  await page.goto("/");
  const css = await page.evaluate(async () => {
    const linki = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')];
    const tresci = await Promise.all(linki.map((l) => fetch(l.href).then((r) => r.text())));
    return tresci.join("\n");
  });
  // kazdy blok z outline:none musi w tym samym bloku dawac zamiennik
  const bloki = css.match(/\{[^}]*outline\s*:\s*none[^}]*\}/g) ?? [];
  for (const blok of bloki) {
    expect(blok).toMatch(/box-shadow|border|background|outline\s*:\s*(?!none)/);
  }
});

// Caly flow brama -> pergamin SAMA KLAWIATURA. Zero `click()`, zero `fill()` -
// wylacznie Tab, Enter, Spacja, strzalki i pisanie. Ocena AI zamockowana, bo
// idzie do zewnetrznego modelu; wszystko inne jest prawdziwe.
async function tabujDo(page: import("@playwright/test").Page, selektor: string, limit = 90) {
  for (let i = 0; i < limit; i += 1) {
    const trafiony = await page.locator(selektor).evaluate((el) => el === document.activeElement).catch(() => false);
    if (trafiony) return i;
    await page.keyboard.press("Tab");
  }
  throw new Error(`nie dotabowano do ${selektor}`);
}

test("caly flow brama -> pergamin sama klawiatura", async ({ page }) => {
  test.slow();
  const kroki: string[] = [];
  await page.route("**/api/ocena", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ punkty: 9, komentarz: "Komisja notuje." }) }),
  );

  await page.goto("/");
  await tabujDo(page, "main [data-cta]");
  await page.keyboard.press("Enter");
  kroki.push("brama: Tab do SKŁADAM WNIOSEK I WCHODZĘ, Enter");
  await expect(page).toHaveURL(/\/egzamin/, { timeout: 9000 });

  // egzamin: wywod z klawiatury i oddanie arkusza
  await tabujDo(page, "[data-pole-robocze]");
  await page.keyboard.type("Zebry przegrywaja, bo jetpacki nie maja hamulcow.");
  kroki.push("egzamin: Tab do pola wywodu, pisanie z klawiatury");
  await tabujDo(page, "[data-arkusz] .arkusz__cta");
  await page.keyboard.press("Enter");
  kroki.push("egzamin: Tab do ODDAJĘ WYWÓD, Enter");
  await expect(page.locator("[data-do-quizu]")).toBeFocused({ timeout: 20_000 });
  await page.keyboard.press("Enter");
  kroki.push("egzamin: werdykt sam laduje fokus na PRZYJMUJĘ WERDYKT, Enter");
  await expect(page).toHaveURL(/\/quiz/, { timeout: 9000 });

  // quiz: 15 teczek, kazda zaznaczona spacja albo wpisana z klawiatury
  for (let nr = 1; nr <= 15; nr += 1) {
    await tabujDo(page, `[data-zakladka="${nr}"]`, 140);
    await page.keyboard.press("Enter");
    const luka = page.locator("[data-luka]");
    if (await luka.count()) {
      await tabujDo(page, "[data-luka]", 30);
      await page.keyboard.type("skala Mohsa");
    } else {
      await tabujDo(page, "[data-wariant='A']", 30);
      await page.keyboard.press("Space");
    }
  }
  kroki.push("quiz: 15 teczek otwartych Enterem, warianty zaznaczone spacja, luka wpisana");
  await page.waitForTimeout(600);
  await tabujDo(page, "[data-oddaj]", 140);
  await page.keyboard.press("Enter");
  kroki.push("quiz: Tab do ODDAJĘ AKTA, Enter");
  await expect(page.locator("[data-do-ognia]")).toBeFocused({ timeout: 20_000 });
  await page.keyboard.press("Enter");
  kroki.push("quiz: maszyna prawdy sama laduje fokus na WZYWAM PRÓBĘ OGNIA, Enter");
  await expect(page).toHaveURL(/\/proba-ognia/, { timeout: 9000 });

  // proba ognia: druk, klauzula i list
  await tabujDo(page, "[data-pole='email']");
  await page.keyboard.type("kandydatka@komisja.pl");
  await tabujDo(page, "[data-pole='but']", 20);
  await page.keyboard.type("39");
  await tabujDo(page, "[data-pole='ucho']", 20);
  await page.keyboard.type("240");
  await tabujDo(page, "[data-pokora]", 20);
  await page.keyboard.press("Space");
  kroki.push("ognisko: trzy pola wpisane, checkbox PRZYJMUJĘ Z POKORĄ spacja");
  await tabujDo(page, "form [data-cta]", 20);
  await page.keyboard.press("Enter");
  kroki.push("ognisko: Tab do JESTEM GOTOWA NA PRÓBĘ OGNIA, Enter");
  await expect(page.locator("[data-butelka]")).toBeFocused({ timeout: 12_000 });
  await page.keyboard.press("Enter");
  kroki.push("morze: ceremonia sama laduje fokus na butelce, Enter otwiera list");
  await expect(page.locator("[data-pergamin]")).toBeVisible({ timeout: 4000 });
  await expect(page.locator(".ogien__pergamin-naglowek")).toBeFocused();
  kroki.push("pergamin: fokus na naglowku DECYZJA KOMISJI");

  console.log("NAGRANIE KROKÓW (bez myszy):\n" + kroki.map((k, i) => `${i + 1}. ${k}`).join("\n"));
});

test("zrzut dowodowy: widoczny fokus klawiatury na bramie i na butelce", async ({ page }, info) => {
  await page.goto("/");
  await tabujDo(page, "main [data-cta]");
  await page.screenshot({ path: `screenshots/F6/F6-01-fokus-brama-${info.project.name}.png` });

  await page.addInitScript(PELNY_STAN);
  await page.goto("/proba-ognia");
  await page.locator("[data-pole='email']").fill("kandydatka@komisja.pl");
  await page.locator("[data-pole='but']").fill("39");
  await page.locator("[data-pole='ucho']").fill("240");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta]").click();
  await expect(page.locator("[data-butelka]")).toBeFocused({ timeout: 12_000 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `screenshots/F6/F6-01-fokus-butelka-${info.project.name}.png` });
});
