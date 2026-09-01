import { test, expect } from "@playwright/test";

// Etapy 2 i 3 sa za StrazaEtapu (plan/05 A2), wiec bez werdyktu poprzedniego
// etapu ich naglowek NIE moze sie pokazac. Smoke pilnuje obu wariantow.
const OTWARTE = ["/", "/egzamin"];
const ZASTRZEZONE = [
  { sciezka: "/quiz", numer: "1" },
  { sciezka: "/proba-ognia", numer: "2" },
];

for (const sciezka of OTWARTE) {
  test(`${sciezka} odpowiada 200 i ma nagłówek`, async ({ page }) => {
    const odpowiedz = await page.goto(sciezka);
    expect(odpowiedz?.status()).toBe(200);
    await expect(page.locator("main.tresc h1")).toHaveCount(1);
    await expect(page.locator("main.tresc h1")).not.toBeEmpty();
  });
}

for (const { sciezka, numer } of ZASTRZEZONE) {
  test(`${sciezka} odpowiada 200 i bez werdyktu pokazuje druk odmowny`, async ({ page }) => {
    const odpowiedz = await page.goto(sciezka);
    expect(odpowiedz?.status()).toBe(200);
    await expect(page.locator(".straz__tresc")).toHaveText(
      `ALEKSANDRO, KOMISJA ZABRANIA. NAJPIERW ETAP ${numer}.`,
    );
    await expect(page.locator("main.tresc h1")).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe(sciezka);
  });
}
