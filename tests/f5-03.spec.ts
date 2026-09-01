import { test, expect } from "@playwright/test";

// AC F5-03: sekwencja krok po kroku wg tabeli 07 B (4 zrzuty faz); klik butelki
// I Enter na fokusie rozwijaja pergamin z e-mailem i suma N/25; Esc w krokach 1-4
// skacze do butelki; reduced-motion: 2 kroki po 300 ms; OD NOWA czysci stan i wraca
// do bramy; powrot na URL po wysylce: od razu butelka, zero POST.

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

async function wypelnijIWyslij(page: import("@playwright/test").Page) {
  await page.locator("[data-pole='email']").fill("kandydatka@komisja.pl");
  await page.locator("[data-pole='but']").fill("39");
  await page.locator("[data-pole='ucho']").fill("240");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta]").click();
}

const faza = (page: import("@playwright/test").Page) =>
  page.locator("[data-faza]").getAttribute("data-faza");

test("ceremonia idzie krok po kroku wg tabeli 07 B", async ({ page }, info) => {
  await page.addInitScript(WPUSC);
  await page.goto("/proba-ognia");
  const start = Date.now();
  await wypelnijIWyslij(page);

  // krok 1 (0-500 ms): druk sklada sie w kwadrat
  await expect(page.locator("[data-skladanie='skladanie']")).toBeVisible({ timeout: 400 });
  await page.screenshot({ path: `screenshots/F5/F5-03-krok1-skladanie-${info.project.name}.png` });

  // krok 2 (500-1500 ms): kwadrat leci w ognisko, plomienie buchaja, ekran blyska
  await expect(page.locator("[data-skladanie='spalanie']")).toBeVisible({ timeout: 1500 });
  expect(await page.locator("[data-ognisko]").getAttribute("data-bucha")).toBe("tak");
  await page.screenshot({ path: `screenshots/F5/F5-03-krok2-spalanie-${info.project.name}.png` });

  // krok 3 (1500-2600 ms): dym morfuje w butelke przez 4 klatki
  await expect(page.locator("[data-klatka]")).toBeVisible({ timeout: 2000 });
  const klatki = new Set<string>();
  for (let i = 0; i < 14; i += 1) {
    const k = await page.locator("[data-klatka]").getAttribute("data-klatka").catch(() => null);
    if (k) klatki.add(k);
    if (klatki.size === 4) break;
    await page.waitForTimeout(90);
  }
  await page.screenshot({ path: `screenshots/F5/F5-03-krok3-dym-${info.project.name}.png` });
  expect([...klatki].length).toBeGreaterThanOrEqual(3);   // morfoza to podmiana rysunkow

  // krok 4 i 5 (2600-3400 ms): roleta morza, butelka dryfuje z dymkiem KLIKNIJ
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 4000 });
  const czas = Date.now() - start;
  expect(czas).toBeLessThanOrEqual(9000);                 // Z9
  await expect(page.locator("[data-dymek]")).toHaveText("KLIKNIJ");
  await expect(page.locator("[data-butelka]")).toBeFocused();   // Z9: fokus po ceremonii
  await expect(page.locator(".ogien__tlo--morze")).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `screenshots/F5/F5-03-krok5-butelka-${info.project.name}.png` });

  // krok 6: klik rozwija pergamin z e-mailem i suma 9 + 13 = 22 na 25
  await page.locator("[data-butelka]").click();
  await expect(page.locator("[data-pergamin]")).toBeVisible({ timeout: 3000 });
  await expect(page.locator("[data-email-zwoju]")).toHaveText("kandydatka@komisja.pl");
  await expect(page.locator("[data-dorobek]")).toHaveAttribute("data-dorobek", "22");
  await expect(page.locator("[data-pergamin] .pieczatka svg")).toHaveAttribute("aria-label", "TAJNE");
  await expect(page.locator(".ogien__pergamin-naglowek")).toBeFocused();
  await page.waitForTimeout(800);   // zwoj rozwija sie 700 ms - wczesniejszy zrzut lapie klatke posrednia
  // pieczec ma byc WIDOCZNA, nie tylko obecna - raz juz zjechala do zera szerokosci
  const pudloPieczeci = await page.locator("[data-pergamin] .pieczatka svg").boundingBox();
  expect(pudloPieczeci!.width).toBeGreaterThan(40);
  expect(pudloPieczeci!.height).toBeGreaterThan(40);
  await page.screenshot({ path: `screenshots/F5/F5-03-krok6-pergamin-${info.project.name}.png`, fullPage: true });
});

test("Enter na zafokusowanej butelce otwiera list tak samo jak klik", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/proba-ognia");
  await wypelnijIWyslij(page);
  await expect(page.locator("[data-butelka]")).toBeFocused({ timeout: 9000 });
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-pergamin]")).toBeVisible({ timeout: 3000 });
  await expect(page.locator("[data-email-zwoju]")).toHaveText("kandydatka@komisja.pl");
});

test("Esc w krokach 1-4 skacze od razu do butelki", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/proba-ognia");
  await wypelnijIWyslij(page);
  await expect(page.locator("[data-skladanie]")).toBeVisible({ timeout: 800 });
  const start = Date.now();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 2000 });
  expect(Date.now() - start).toBeLessThan(1500);   // skrot, nie doczekanie harmonogramu
  expect(await faza(page)).toBe("butelka");
});

test("Z10: reduced-motion oddaje butelke i pergamin w dwoch krokach po 300 ms", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(WPUSC);
  await page.goto("/proba-ognia");
  await wypelnijIWyslij(page);
  const t0 = Date.now();
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 2000 });
  const doButelki = Date.now() - t0;
  expect(doButelki).toBeLessThan(1200);            // jeden krok 300 ms, nie 3400 ms
  expect(await page.locator("[data-butelka]").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");

  const t1 = Date.now();
  await page.locator("[data-butelka]").click();
  await expect(page.locator("[data-pergamin]")).toBeVisible({ timeout: 2000 });
  expect(Date.now() - t1).toBeLessThan(1200);
});

test("powrot na URL po wysylce: od razu butelka, zero POST", async ({ page }) => {
  await page.addInitScript(WPUSC);
  const posty: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/zgloszenie") && r.method() === "POST") posty.push(r.url());
  });
  await page.goto("/proba-ognia");
  await wypelnijIWyslij(page);
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 9000 });
  await expect
    .poll(() => page.evaluate(() => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}")?.ogien?.wyslano))
    .toBe(true);

  const start = Date.now();
  await page.reload();
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 3000 });
  expect(Date.now() - start).toBeLessThan(3000);   // zero ceremonii przy powrocie
  await expect(page.locator("[data-druk]")).toHaveCount(0);
  await page.waitForTimeout(600);
  expect(posty).toHaveLength(1);
});

test("OD NOWA czysci stan i odsyla do bramy", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/proba-ognia");
  await wypelnijIWyslij(page);
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 9000 });
  await page.locator("[data-butelka]").click();
  await expect(page.locator("[data-od-nowa]")).toBeVisible({ timeout: 3000 });
  await page.locator("[data-od-nowa]").click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => sessionStorage.getItem("jwp.v1"))).toBeNull();
});
