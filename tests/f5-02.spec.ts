import { test, expect } from "@playwright/test";

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
      egzamin: { odpowiedz: "x", zalaczone: [], punkty: 8, komentarz: "ok" },
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
  await expect(page.locator("[data-przyjeto]")).toBeVisible();
  await expect.poll(() => posty.length).toBe(1);

  // flaga wyslano musi wyladowac w stanie, inaczej powrot na URL wysle drugi raz
  await expect
    .poll(() => page.evaluate(() => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}")?.ogien?.wyslano))
    .toBe(true);

  await page.reload();
  await expect(page.locator("[data-przyjeto]")).toBeVisible();   // od razu stan po wysylce
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

  await expect(page.locator("[data-przyjeto]")).toBeVisible();   // teatr nie czeka na siec
  await expect(page.locator("[data-ulotna]")).toContainText("KOMISJA ZAPISAŁA W PAMIĘCI ULOTNEJ");
  expect(prob).toBe(2);                                          // retry dokladnie 1x (07 B)
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}")?.ogien?.wyslano))
    .not.toBe(true);
});
