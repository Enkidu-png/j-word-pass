import { test, expect } from "@playwright/test";

const ETAPY = ["/", "/egzamin", "/quiz", "/proba-ognia"];

for (const sciezka of ETAPY) {
  test(`${sciezka} odpowiada 200 i ma nagłówek`, async ({ page }) => {
    const odpowiedz = await page.goto(sciezka);
    expect(odpowiedz?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).not.toBeEmpty();
  });
}
