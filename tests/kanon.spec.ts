import { test, expect } from "@playwright/test";
import { wejdz } from "./pomoc";

// Z1 i Z2 maja walidator statyczny w scripts/lint-tokens.mjs, ale ten patrzy
// tylko na pliki zrodlowe. Tekst sklejony w przegladarce (z data/, z odpowiedzi
// API, z atrybutu alt) nie przechodzi przez tamten filtr. Ten test mierzy to,
// co Aleksandra realnie widzi na ekranie.

const STRONY = ["/", "/egzamin", "/quiz", "/proba-ognia"];

for (const sciezka of STRONY) {
  test(`${sciezka} bez srodkowej kropki i dlugiego mysnika`, async ({ page }) => {
    await wejdz(page, sciezka);
    const tekst = await page.evaluate(() => document.body.innerText);
    expect(tekst, "Z1: srodkowa kropka jako ozdobnik").not.toContain("·");
    expect(tekst, "Z2: dlugi mysnik w copy").not.toContain("—");
    expect(tekst, "Z2: polpauza w copy").not.toContain("–");
  });
}
