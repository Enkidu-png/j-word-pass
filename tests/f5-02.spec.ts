import { test, expect } from "@playwright/test";
import komisja from "../data/komisja.json";

// AC F5-02: poprawny POST tworzy blob zgloszenia/...json; email "x" -> 400 z komunikatem
// Komisji; payload 3 KB -> 400/413; brak tokena -> 200 tryb "dev-log" (mierzone osobno,
// bo lokalny dev MA token - dowod w BACKLOGU); negatywne: drugi submit z flaga wyslano
// nie wysyla (assercja na ruchu sieciowym).

const POPRAWNE = {
  email: "kandydatka@komisja.pl",
  rozmiarButa: 39,
  srednicaUchaMm: 240,
  punktyEgzamin: 8,
  punktyQuiz: 12,
};

const WPUSC = () => {
  if (window.sessionStorage.getItem("jwp.v1")) return;
  window.sessionStorage.setItem(
    "jwp.v1",
    JSON.stringify({
      v: 1,
      // F9-04: etap 1 ma dwie czesci, wiec straz wpuszcza dopiero po OBU werdyktach
      egzamin: {
        odpowiedz: "x",
        zalaczone: [],
        punkty: 8,
        komentarz: "ok",
        odpowiedz2: "y",
        punkty2: 7,
        komentarz2: "ok2",
      },
      quiz: { odpowiedzi: {}, punkty: 12 },
      ogien: null,
    }),
  );
};

test("poprawny POST konczy sie zapisem pod zgloszenia/<ts>-<losowe6>.json", async ({ request }) => {
  const res = await request.post("/api/zgloszenie", { data: POPRAWNE });
  expect(res.status()).toBe(200);
  const cialo = await res.json();
  expect(["blob", "dev-log"]).toContain(cialo.tryb);
  expect(cialo.sciezka).toMatch(/^zgloszenia\/\d{4}-\d{2}-\d{2}T[\d:.]+Z-[a-z0-9]{6}\.json$/);
});

test("email 'x' odsylany z 400 i komunikatem Komisji", async ({ request }) => {
  const res = await request.post("/api/zgloszenie", { data: { ...POPRAWNE, email: "x" } });
  expect(res.status()).toBe(400);
  expect((await res.json()).blad).toContain("ADRES NIE PRZYPOMINA ADRESU");
});

test("zakresy buta i ucha pilnowane po stronie serwera", async ({ request }) => {
  const but = await request.post("/api/zgloszenie", { data: { ...POPRAWNE, rozmiarButa: 8 } });
  expect(but.status()).toBe(400);
  expect((await but.json()).blad).toContain("10-70");

  const ucho = await request.post("/api/zgloszenie", { data: { ...POPRAWNE, srednicaUchaMm: 900 } });
  expect(ucho.status()).toBe(400);
  expect((await ucho.json()).blad).toContain("5-500");
});

test("payload 3 KB odbity limitem objetosci", async ({ request }) => {
  const res = await request.post("/api/zgloszenie", {
    data: { ...POPRAWNE, email: `${"a".repeat(3000)}@komisja.pl` },
  });
  expect([400, 413]).toContain(res.status());
  expect((await res.json()).blad).toContain("objętość");
});

// Parkowanie zdjete w F5-02 (issue F7-01): formularz /proba-ognia istnieje
// od F5-01, a ceremonia spalenia od F5-02.

test("pierwszy submit wysyla POST, powrot z flaga wyslano juz nie (07 D2)", async ({ page }) => {
  await page.addInitScript(WPUSC);
  const posty: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/zgloszenie") && r.method() === "POST") posty.push(r.url());
  });

  await page.goto("/proba-ognia");
  await page.locator("[data-pole='email']").fill("kandydatka@komisja.pl");
  await page.locator("[data-pole='but']").fill("39");
  await page.locator("[data-pole='ucho']").fill("240");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta]").click();
  await przyjmijWyzwanie(page);
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 9000 });
  await expect.poll(() => posty.length).toBe(1);

  // flaga wyslano musi wyladowac w stanie, inaczej powrot na URL wysle drugi raz
  await expect
    .poll(() => page.evaluate(() => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}")?.ogien?.wyslano))
    .toBe(true);

  await page.reload();
  await expect(page.locator("[data-butelka]")).toBeVisible();   // od razu stan po wysylce
  await expect(page.locator("[data-cta]")).toHaveCount(0);       // nie ma czym wyslac drugi raz
  await page.waitForTimeout(800);
  expect(posty).toHaveLength(1);
});

test("awaria Bloba nie psuje druku: stempel o pamieci ulotnej po jednym ponowieniu", async ({ page }) => {
  await page.addInitScript(WPUSC);
  let prob = 0;
  await page.route("**/api/zgloszenie", async (route) => {
    prob += 1;
    await route.fulfill({ status: 502, contentType: "application/json", body: '{"blad":"padlo"}' });
  });

  await page.goto("/proba-ognia");
  await page.locator("[data-pole='email']").fill("kandydatka@komisja.pl");
  await page.locator("[data-pole='but']").fill("39");
  await page.locator("[data-pole='ucho']").fill("240");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta]").click();

  // teatr rusza NATYCHMIAST, nie po odpowiedzi serwera
  await expect(page.locator("[data-faza='skladanie']")).toBeVisible({ timeout: 400 });
  await przyjmijWyzwanie(page);
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 9000 });
  await expect(page.locator("[data-ulotna]")).toContainText("KOMISJA ZAPISAŁA W PAMIĘCI ULOTNEJ");
  expect(prob).toBe(2);                                          // retry dokladnie 1x (07 B)
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}")?.ogien?.wyslano))
    .not.toBe(true);
});

// --- Ceremonia spalenia i list w butelce (plan/08 C, D) ---

async function zloz(page: import("@playwright/test").Page) {
  await page.goto("/proba-ognia");
  await page.locator("[data-pole='email']").fill("kandydatka@komisja.pl");
  await page.locator("[data-pole='but']").fill("39");
  await page.locator("[data-pole='ucho']").fill("240");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta]").click();
}

// F9-06: miedzy ceremonia a butelka stoi ekran z zadaniem proby ognia.
async function przyjmijWyzwanie(page: import("@playwright/test").Page) {
  await page.locator("[data-cta='przyjmuje-wyzwanie']").click({ timeout: 12_000 });
}

test("cztery kroki ceremonii ida po kolei w kontraktowych czasach", async ({ page }) => {
  await page.addInitScript(WPUSC);
  const start = Date.now();
  await zloz(page);

  const ceremonia = page.locator("[data-ceremonia]");
  await expect(ceremonia).toHaveAttribute("data-faza", "skladanie");
  await expect(ceremonia).toHaveAttribute("data-faza", "ogien", { timeout: 3000 });
  await expect(page.locator(".ceremonia__plomien")).toHaveCount(8);
  await expect(ceremonia).toHaveAttribute("data-faza", "popiol", { timeout: 3000 });
  await expect(page.locator("[data-popiol] .popiol__ziarno")).toHaveCount(20);
  // F9-06: krok 4 to ekran wyzwania, butelka wchodzi dopiero po jego przyjeciu
  await expect(page.locator("[data-wyzwanie]")).toBeVisible({ timeout: 3000 });
  expect(Date.now() - start).toBeGreaterThanOrEqual(3200);
  await expect(page.locator("[data-butelka]")).toHaveCount(0);
  await przyjmijWyzwanie(page);
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 3000 });
  // Selektor zawezony do bloku butelki: F6-04 dolozyl na tym widoku drugiego
  // gonca (pod drukiem), wiec `.last()` lapal juz nie ten element.
  await expect(page.locator(".butelka-blok [data-goniec]")).toContainText(
    "KLIKNIJ BUTELKĘ, ALEKSANDRO",
  );
});

test("Escape w kroku 1 skacze od razu na koniec ceremonii", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await zloz(page);
  await expect(page.locator("[data-faza='skladanie']")).toBeVisible({ timeout: 400 });
  await page.keyboard.press("Escape");
  // F9-06: koniec ceremonii to ekran wyzwania, butelka o jedno klikniecie dalej
  await expect(page.locator("[data-wyzwanie]")).toBeVisible({ timeout: 600 });
  await przyjmijWyzwanie(page);
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 600 });
});

test("F9-06 ekran wyzwania: druk Komisji miedzy ceremonia a butelka", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await zloz(page);
  const wyzwanie = page.locator("[data-wyzwanie]");
  await expect(wyzwanie).toBeVisible({ timeout: 12_000 });

  // kolejnosc: wyzwanie PRZED listem w butelce
  await expect(page.locator("[data-butelka]")).toHaveCount(0);
  await expect(page.locator("[data-pergamin]")).toHaveCount(0);

  // tresc WYLACZNIE z data/komisja.json
  await expect(page.locator("[data-wyzwanie-tresc]")).toHaveText(komisja.wyzwanie.tresc);
  // naglowek jako NapisObrazek plus minimum 3 ozdoby z manifestu, w tym `ogien`
  await expect(wyzwanie.locator("svg[role='img']")).toHaveAttribute(
    "aria-label",
    komisja.wyzwanie.naglowek,
  );
  const ozdoby = await wyzwanie
    .locator("img[data-ozdoba]")
    .evaluateAll((e) => e.map((x) => (x as HTMLElement).dataset.ozdoba));
  expect(ozdoby.length).toBeGreaterThanOrEqual(3);
  expect(ozdoby).toContain("ogien");

  // druk z ramka ridge, nic nie jest przekrzywione (Z6)
  await expect(wyzwanie).toHaveCSS("border-style", "ridge");
  const m = await wyzwanie.evaluate((e) => getComputedStyle(e).transform);
  const [, bb, cc] = m === "none" ? [0, 0, 0] : m.match(/-?[\d.]+/g)!.map(Number);
  expect(bb).toBe(0);
  expect(cc).toBe(0);
  // caly tekst czytelny bez przewijania w poziomie
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBe(0);
  // zero pola na wgranie pliku
  expect(await page.locator("input[type='file']").count()).toBe(0);

  await page.locator("[data-cta='przyjmuje-wyzwanie']").click();
  await expect(page.locator("[data-butelka]")).toBeVisible();
  await expect(page.locator("[data-wyzwanie]")).toHaveCount(0);
});

test("Enter na butelce rozwija pergamin z e-mailem i suma 27/35, pergamin bez przekrzywienia", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await zloz(page);
  const butelka = page.locator("[data-butelka]");
  await przyjmijWyzwanie(page);
  await expect(butelka).toBeVisible({ timeout: 9000 });
  await expect(page.locator("[data-pergamin]")).toHaveCount(0);

  await butelka.focus();
  await page.keyboard.press("Enter");
  const pergamin = page.locator("[data-pergamin]");
  await expect(pergamin).toBeVisible();
  await expect(page.locator("[data-pergamin-email]")).toContainText("kandydatka@komisja.pl");
  // F9-04: etap 1 to suma dwoch czesci (8 plus 7) z 20
  await expect(pergamin).toContainText("15/20");
  await expect(pergamin).toContainText("12/15");
  await expect(page.locator("[data-suma]")).toContainText("27/35");

  // Z6 i anty-spec plan/08 F punkt 3: zero obrotu i skosu na pergaminie
  const m = await pergamin.evaluate((e) => getComputedStyle(e).transform);
  if (m !== "none") {
    const [a, b, c, d] = m.slice(7, -1).split(", ").map(Number);
    expect([a, b, c, d]).toEqual([1, 0, 0, 1]);
  }
});

test("OD NOWA czysci sessionStorage i wraca na brame", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await zloz(page);
  await przyjmijWyzwanie(page);
  await page.locator("[data-butelka]").click({ timeout: 9000 });
  await page.locator("[data-cta='od-nowa']").click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("jwp.v1"))).toBeNull();
});

test("negatywne: zero konfetti i zero fajerwerkow po wyslaniu", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await zloz(page);
  await przyjmijWyzwanie(page);
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 9000 });
  const klasy = await page.evaluate(() =>
    Array.from(document.querySelectorAll("*")).map((e) => e.className.toString()).join(" "),
  );
  expect(klasy.toLowerCase()).not.toMatch(/konfetti|confetti|fajerwerk|firework/);
});
