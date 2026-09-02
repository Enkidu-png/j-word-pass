import { test, expect } from "@playwright/test";

// AC F10-03 (plan/02 B, wynik F10-02). Brama chroni takze platne endpointy.
// Reszta suity dostaje klucz z `playwright.config.ts`, tu go celowo zdejmujemy.

const DRUK = {
  email: "kandydatka@komisja.pl",
  rozmiarButa: 39,
  srednicaUchaMm: 240,
  punktyEgzamin: 8,
  punktyQuiz: 12,
};

test.describe("bez klucza", () => {
  test.use({ extraHTTPHeaders: {} });

  test("/api/ocena bez naglowka: 401 i ZERO wywolania modelu", async ({ request }) => {
    const res = await request.post("/api/ocena", { data: { odpowiedz: "cokolwiek" } });
    expect(res.status()).toBe(401);
    const cialo = await res.json();
    expect(cialo.blad).toContain("nie rozpoznaje petenta");
    // Brak pol werdyktu to dowod, ze model nie zostal zapytany - handler konczy
    // sie przed `fetch` do OpenRoutera.
    expect(cialo.punkty).toBeUndefined();
    expect(cialo.komentarz).toBeUndefined();
  });

  test("/api/zgloszenie bez naglowka: 401", async ({ request }) => {
    const res = await request.post("/api/zgloszenie", { data: DRUK });
    expect(res.status()).toBe(401);
    expect((await res.json()).blad).toContain("nie rozpoznaje petenta");
  });
});

test.describe("zly klucz", () => {
  test.use({ extraHTTPHeaders: { "x-jwp-klucz": "zenon" } });

  test("zla wartosc naglowka: 401 na obu endpointach", async ({ request }) => {
    expect((await request.post("/api/ocena", { data: { odpowiedz: "x" } })).status()).toBe(401);
    expect((await request.post("/api/zgloszenie", { data: DRUK })).status()).toBe(401);
  });
});

const KLUCZ = { "x-jwp-klucz": "wstep-testowy" };

test("z naglowkiem endpointy dzialaja jak dotad", async ({ request }) => {
  // `/api/ocena` z pusta odpowiedzia oddaje werdykt 0 bez pytania modelu -
  // sprawdza przejscie przez prog, nie samego modelu.
  const ocena = await request.post("/api/ocena", { data: { odpowiedz: "   " }, headers: KLUCZ });
  expect(ocena.status()).toBe(200);
  expect((await ocena.json()).punkty).toBe(0);

  const zgloszenie = await request.post("/api/zgloszenie", { data: DRUK, headers: KLUCZ });
  expect(zgloszenie.status()).toBe(200);
  expect((await zgloszenie.json()).sciezka).toContain("zgloszenia/");
});

test("wielkosc liter i spacje w naglowku nie maja znaczenia", async ({ playwright }) => {
  const kontekst = await playwright.request.newContext({
    baseURL: "http://localhost:3000",
    extraHTTPHeaders: { "x-jwp-klucz": "  WSTEP-TESTOWY  " },
  });
  const res = await kontekst.post("/api/ocena", { data: { odpowiedz: "   " } });
  expect(res.status()).toBe(200);
  await kontekst.dispose();
});
