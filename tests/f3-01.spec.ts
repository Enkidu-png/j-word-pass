import { test, expect } from "@playwright/test";

// F10-03: `/api/ocena` i `/api/zgloszenie` oddaja 401 bez klucza z bramy wstepu.
// Przegladarka bierze go z localStorage, wywolania z fixture `request` musza go
// doklejac same. Naglowek NIE jest globalny w konfiguracji: leciałby wtedy takze
// do youtube.com i wywracal testy radia.
const KLUCZ = { "x-jwp-klucz": "wstep-testowy" };

// AC F3-01 (plan/06 A). Test API - niezalezny od viewportu, wiec biegnie tylko na desktopie.
// Kontrakt po F3-01: payload to samo pole `odpowiedz`, licznik dowodow znikl razem
// z przeciaganiem kart (plan/06 A).
// Punkt 1 kosztuje jedno wywolanie OpenRoutera (~$0.00006).

test.describe(() => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "desktop", "test API, nie UI");
  });

  test("niepusta odpowiedz: 200, punkty 6-10, komentarz bez zakazanych znakow", async ({ request }) => {
    const res = await request.post("/api/ocena", {
      data: { odpowiedz: "Zebry formują klin, słoń kicha i traci nabój." },
      headers: KLUCZ,
    });
    expect(res.status()).toBe(200);
    const { punkty, komentarz } = await res.json();
    expect(punkty).toBeGreaterThanOrEqual(6);
    expect(punkty).toBeLessThanOrEqual(10);
    expect(komentarz).not.toMatch(/[—–·]/);
    expect(komentarz).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
    expect(komentarz.length).toBeLessThanOrEqual(600);
  });

  test("pusta odpowiedz: 0/10 bez pytania modelu", async ({ request }) => {
    const res = await request.post("/api/ocena", { data: { odpowiedz: "   " }, headers: KLUCZ });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ punkty: 0, komentarz: "PUSTKA." });
  });

  test("odpowiedz ponad 8 KB: 413", async ({ request }) => {
    const res = await request.post("/api/ocena", {
      data: { odpowiedz: "z".repeat(9000) },
      headers: KLUCZ,
    });
    expect(res.status()).toBe(413);
  });

  test("smiec zamiast JSON: 400", async ({ request }) => {
    const res = await request.post("/api/ocena", {
      headers: { ...KLUCZ, "Content-Type": "application/json" },
      data: "to nie jest json",
    });
    expect(res.status()).toBe(400);
  });
});
