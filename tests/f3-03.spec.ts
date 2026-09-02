import { test, expect } from "@playwright/test";
import komisja from "../data/komisja.json";
import egzamin from "../data/egzamin.json";

// AC F3-03 (plan/06 C). Ceremonia oceny. Wszystkie scenariusze poza jednym
// przechwytuja /api/ocena, zeby nie palic wywolan modelu ani limitu 5/min.

const WERDYKT_OK = { punkty: 8, komentarz: "Aleksandro, Komisja oprawia to w ramke." };

const podstaw = (page: import("@playwright/test").Page, ciało: object, status = 200, zwloka = 0) =>
  page.route("**/api/ocena", async (route) => {
    if (zwloka) await new Promise((r) => setTimeout(r, zwloka));
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(ciało) });
  });

test("pusta odpowiedz: werdykt 0/10 BEZ zadania do /api/ocena", async ({ page }) => {
  const zadania: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/ocena")) zadania.push(r.url());
  });

  await page.goto("/egzamin");
  await page.locator("[data-cta='oddaj']").click();

  await expect(page.locator("[data-wynik]")).toHaveText("0/10");
  await expect(page.locator("[data-komentarz]")).toContainText("ALEKSANDRO, PUSTKA");
  await page.waitForTimeout(600);
  expect(zadania).toHaveLength(0);
  // pusta odpowiedz NIE otwiera etapu 2 (plan/02 E1)
  expect(
    await page.evaluate(() => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}")?.egzamin?.punkty),
  ).toBeUndefined();
});

test("narada trwa minimum 3500 ms i pokazuje >= 5 roznych dymkow", async ({ page }) => {
  await podstaw(page, WERDYKT_OK, 200, 200);
  await page.goto("/egzamin");
  await page.locator("[data-pole='odpowiedz']").fill("Zebry formuja klin.");

  const dymki = new Set<string>();
  const start = Date.now();
  await page.locator("[data-cta='oddaj']").click();
  await expect(page.locator("[data-ladowanie='narada']")).toBeVisible();

  const dymek = page.locator(".ladowanie__dymek");
  while (Date.now() - start < 4200) {
    // krotki timeout: po zdjeciu nakladki dymka nie ma, a domyslne 30 s
    // czekania zjadaloby caly limit testu zamiast zakonczyc petle
    const t = await dymek.textContent({ timeout: 200 }).catch(() => null);
    if (t) dymki.add(t.trim());
    if (await page.locator("[data-wynik]").count()) break;
    await page.waitForTimeout(120);
  }
  await expect(page.locator("[data-wynik]")).toBeVisible({ timeout: 4000 });
  const trwalo = Date.now() - start;

  console.log(`narada trwala ${trwalo} ms, roznych dymkow: ${dymki.size}`);
  expect(trwalo).toBeGreaterThanOrEqual(3500);
  expect(dymki.size).toBeGreaterThanOrEqual(5);
  // wszystkie dymki pochodza z data/komisja.json, zaden nie jest wpisany w kod
  for (const d of dymki) {
    expect(komisja.ocenianie.some((k) => d === `${k.kto}: ${k.tekst}`)).toBe(true);
  }
});

test("werdykt: NapisObrazek ZDANE, wynik N/10 i komentarz modelu", async ({ page }) => {
  await podstaw(page, WERDYKT_OK);
  await page.goto("/egzamin");
  await page.locator("[data-pole='odpowiedz']").fill("Slon przegrywa przez odrzut.");
  await page.locator("[data-cta='oddaj']").click();

  const werdykt = page.locator("[data-werdykt]");
  await expect(werdykt.locator("svg[role='img']")).toHaveAttribute("aria-label", "ZDANE", {
    timeout: 9000,
  });
  await expect(page.locator("[data-wynik]")).toHaveText("8/10");
  await expect(page.locator("[data-komentarz]")).toHaveText(WERDYKT_OK.komentarz);
  await expect(page.locator("[data-wynik]")).toHaveCSS("font-family", /Courier New/);
  // krok 4 po czesci 1 (F9-04): przycisk na CZESC 2, a etap 2 nadal ZAMKNIETY
  await expect(page.locator("[data-cta='do-czesci-2']")).toBeVisible({ timeout: 3000 });
  await expect(page.locator("[data-cta='do-etapu-2']")).toHaveCount(0);
  await expect(page.locator("[data-etap='quiz'] [data-ozdoba='stwor-klodka']")).toBeVisible();
  // druk odpowiedzi zostaje na stronie, tylko zamkniety (plan/06 C krok 1)
  await expect(page.locator("[data-pole='odpowiedz']")).toHaveAttribute("readonly", "");
  await expect(page.locator("[data-cta='oddaj']")).toBeDisabled();
});

test("F9-04 czesc 2: wlasny druk, wlasna ocena, dopiero potem etap 2", async ({ page }) => {
  const czesci: unknown[] = [];
  await page.route("**/api/ocena", async (route) => {
    czesci.push(JSON.parse(route.request().postData() ?? "{}").czesc);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(WERDYKT_OK),
    });
  });

  await page.goto("/egzamin");
  await page.locator("[data-pole='odpowiedz']").fill("Zebry wygrywaja przez masę.");
  await page.locator("[data-cta='oddaj']").click();
  await page.locator("[data-cta='do-czesci-2']").click({ timeout: 12000 });

  // wlasny druk czesci 2, tresc WYLACZNIE z data/egzamin.json
  await expect(page.locator("[data-czesc-2] .pytanie__tresc")).toHaveText(egzamin.czesc2.tresc);
  await expect(page.locator("form[data-czesc='2']")).toBeVisible();
  await expect(page.locator("[data-licznik-znakow]")).toHaveText("ZNAKÓW: 0 Z 8000");
  await expect(page.locator("[data-pole='odpowiedz']")).toHaveAttribute("maxlength", "8000");

  await page.locator("[data-pole='odpowiedz']").fill("Potencjał wpierdolu rośnie liniowo.");
  await page.locator("[data-cta='oddaj']").click();
  await expect(page.locator("[data-cta='do-etapu-2']")).toBeVisible({ timeout: 12000 });

  expect(czesci).toEqual([1, 2]);
  // oba werdykty w sessionStorage, PassOMetr pokazuje sume z 20
  const stan = await page.evaluate(
    () => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}").egzamin,
  );
  expect(stan.punkty).toBe(WERDYKT_OK.punkty);
  expect(stan.punkty2).toBe(WERDYKT_OK.punkty);
  await expect(page.locator("[data-etap='egzamin'] .pass-o-metr__stan")).toHaveText("16/20");
  // dopiero teraz straz etapu wpuszcza na /quiz
  await page.locator("[data-cta='do-etapu-2']").click();
  await expect(page.locator(".karta__pytanie")).toBeVisible({ timeout: 9000 });
  await expect(page.locator(".straz")).toHaveCount(0);
});

test("F9-04 pusta odpowiedz w czesci 2: 0/10 bez zadania do API", async ({ page }) => {
  const zadania: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/ocena")) zadania.push(r.url());
  });
  await podstaw(page, WERDYKT_OK);

  await page.goto("/egzamin");
  await page.locator("[data-pole='odpowiedz']").fill("Cos tam.");
  await page.locator("[data-cta='oddaj']").click();
  await page.locator("[data-cta='do-czesci-2']").click({ timeout: 12000 });

  await page.locator("[data-cta='oddaj']").click();
  await expect(page.locator("[data-wynik]")).toHaveText("0/10");
  await expect(page.locator("[data-komentarz]")).toContainText("ALEKSANDRO, PUSTKA");
  await page.waitForTimeout(600);
  // jedyne zadanie to ocena czesci 1
  expect(zadania).toHaveLength(1);
  // pusta czesc 2 NIE otwiera etapu 2
  expect(
    await page.evaluate(() => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}")?.egzamin?.punkty2),
  ).toBeUndefined();
});

test("padniete /api/ocena: werdykt awaryjny z data/komisja.json w mniej niz 16 s", async ({
  page,
}) => {
  await podstaw(page, { blad: "Aleksandro, Komisja jest w tej chwili nieosiągalna." }, 502);
  await page.goto("/egzamin");
  await page.locator("[data-pole='odpowiedz']").fill("Cokolwiek.");

  const start = Date.now();
  await page.locator("[data-cta='oddaj']").click();
  await expect(page.locator("[data-komentarz]")).toBeVisible({ timeout: 16000 });
  const trwalo = Date.now() - start;

  const tekst = (await page.locator("[data-komentarz]").textContent()) ?? "";
  console.log(`werdykt awaryjny po ${trwalo} ms: ${tekst}`);
  expect(trwalo).toBeLessThanOrEqual(16000);
  expect(komisja.werdyktAwaryjny.some((k) => tekst === `${k.kto}: ${k.tekst}`)).toBe(true);
  await expect(page.locator("[data-wynik]")).toHaveText("6/10");
});

test("Escape w trakcie narady skacze do werdyktu", async ({ page }) => {
  await podstaw(page, WERDYKT_OK, 200, 1500);
  await page.goto("/egzamin");
  await page.locator("[data-pole='odpowiedz']").fill("Zebry i slon remisuja.");
  await page.locator("[data-cta='oddaj']").click();
  await expect(page.locator("[data-ladowanie='narada']")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator("[data-ladowanie='narada']")).toHaveCount(0);
  // przed odpowiedzia modelu: komunikat, a nie pusty ekran (plan/06 C)
  await expect(page.locator("[data-obraduje]")).toHaveText("KOMISJA JESZCZE OBRADUJE");
  // gdy odpowiedz przyjdzie, werdykt wskakuje sam
  await expect(page.locator("[data-wynik]")).toHaveText("8/10", { timeout: 5000 });
});

test("powrot na /egzamin po zdaniu: pole readOnly, werdykt z sessionStorage, zero zadania", async ({
  page,
}) => {
  await podstaw(page, WERDYKT_OK);
  await page.goto("/egzamin");
  await page.locator("[data-pole='odpowiedz']").fill("Odpowiedz zapisana w aktach.");
  await page.locator("[data-cta='oddaj']").click();
  await expect(page.locator("[data-wynik]")).toHaveText("8/10", { timeout: 9000 });

  const zadania: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/ocena")) zadania.push(r.url());
  });
  await page.reload();

  await expect(page.locator("[data-wynik]")).toHaveText("8/10");
  await expect(page.locator("[data-komentarz]")).toHaveText(WERDYKT_OK.komentarz);
  await expect(page.locator("[data-pole='odpowiedz']")).toHaveValue(
    "Odpowiedz zapisana w aktach.",
  );
  await expect(page.locator("[data-pole='odpowiedz']")).toHaveAttribute("readonly", "");
  await page.waitForTimeout(700);
  expect(zadania).toHaveLength(0);
});

test("nakladka narady przykrywa ekran takze wtedy, gdy strona jest przewinieta", async ({
  page,
}) => {
  // Regresja z F3-03: `.ladowanie` bylo `position: absolute`, wiec montowalo sie
  // na GORZE dokumentu. Przycisk ODDAJ PRACĘ KOMISJI lezy grubo ponizej pierwszego
  // ekranu, wiec nakladka byla w DOM, ale poza widokiem - w niczym to nie padalo.
  await podstaw(page, WERDYKT_OK, 200, 2500);
  await page.goto("/egzamin");
  await page.locator("[data-pole='odpowiedz']").fill("Zebry formuja klin.");
  await page.locator("[data-cta='oddaj']").click();

  const nakladka = page.locator("[data-ladowanie='narada']");
  await expect(nakladka).toBeVisible();
  const przewiniete = await page.evaluate(() => window.scrollY);
  const pudlo = (await nakladka.boundingBox())!;
  const okno = page.viewportSize()!;

  console.log(`scrollY=${przewiniete}, nakladka y=${pudlo.y} h=${pudlo.height}, okno h=${okno.height}`);
  expect(przewiniete).toBeGreaterThan(0);
  // gorna krawedz nakladki MA stac na gorze OKNA, nie dokumentu: przy
  // `position: absolute` wychodzilo y = -scrollY, czyli caly ekran poza widokiem
  expect(Math.abs(pudlo.y)).toBeLessThanOrEqual(1);
  expect(pudlo.height).toBeGreaterThanOrEqual(okno.height);
});
