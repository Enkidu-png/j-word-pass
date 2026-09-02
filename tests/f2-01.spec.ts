import { test, expect } from "@playwright/test";
import { wejdz } from "./pomoc";

// AC F2-01 (plan/11-BACKLOG.md). Shell: PasGoniec gorny, PassOMetr, StrazEtapu,
// stopka-webring.

// Slot byl pusty do F5-03. Od F5-03 siedzi w nim RADIO KOMISJI i kontrakt
// zmienia sie z "pusty" na "dokladnie jedno radio w stopce".
test("stopka ma slot na radio i to w nim siedzi RADIO KOMISJI", async ({ page }) => {
  await wejdz(page);
  const slot = page.locator("footer [data-radio-slot]");
  await expect(slot).toHaveCount(1);
  await expect(slot.locator("[data-radio]")).toHaveCount(1);
});

test("PassOMetr ma trzy pola, etapy 2 i 3 sa aria-disabled przed zdaniem", async ({ page }) => {
  await wejdz(page);
  const pola = page.locator(".pass-o-metr__pole");
  await expect(pola).toHaveCount(3);
  await expect(page.locator('.pass-o-metr [aria-disabled="true"]')).toHaveCount(2);
  await expect(page.locator('[data-etap="quiz"] [aria-disabled="true"]')).toHaveCount(1);
  await expect(page.locator('[data-etap="ogien"] [aria-disabled="true"]')).toHaveCount(1);
  await expect(page.locator('[data-etap="egzamin"] a')).toHaveCount(1);
});

test("wejscie na /quiz bez egzaminu pokazuje druk BEZ przekierowania", async ({ page }) => {
  await page.goto("/quiz");
  await expect(page.locator(".straz__tresc")).toHaveText("ALEKSANDRO, KOMISJA ZABRANIA. NAJPIERW ETAP 1.");
  expect(new URL(page.url()).pathname).toBe("/quiz");
  await expect(page.getByRole("heading", { name: "ETAP 2: QUIZ" })).toHaveCount(0);
});

test("licznik odwiedzin ma 7 cyfr i rosnie o 1 po nowej sesji", async ({ browser }) => {
  const kontekst = await browser.newContext();
  const a = await kontekst.newPage();
  await wejdz(a);
  const licznik = a.locator("[data-licznik]");
  // Licznik liczy w useEffect, wiec pierwsza klatka po goto ma jeszcze wartosc
  // wyjsciowa. Czekamy na zapis do localStorage, nie na sam render - inaczej
  // test raz na kilka przebiegow czytal stan sprzed inkrementu.
  await expect.poll(() => a.evaluate(() => localStorage.getItem("jwp.odwiedziny"))).not.toBeNull();
  const pierwszy = (await licznik.textContent())?.trim() ?? "";
  expect(pierwszy).toMatch(/^\d{7}$/);
  await a.close();

  // Nowa sesja = nowa karta z czystym sessionStorage, ale tym samym localStorage.
  const b = await kontekst.newPage();
  await wejdz(b);
  const oczekiwany = String(Number(pierwszy) + 1).padStart(7, "0");
  await expect(b.locator("[data-licznik]")).toHaveText(oczekiwany);
  expect(oczekiwany).toMatch(/^\d{7}$/);
  await kontekst.close();
});

test("na 390 px PassOMetr jest NAD stopka", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await wejdz(page);
  const gora = (s: string) => page.locator(s).evaluate((el) => el.getBoundingClientRect().top);
  const metr = await gora(".pass-o-metr");
  const stopka = await gora("footer.stopka");
  const tresc = await gora("main.tresc");
  console.log(`390 px: tresc.top=${tresc} passOMetr.top=${metr} stopka.top=${stopka}`);
  expect(metr).toBeLessThan(stopka);
  expect(metr).toBeGreaterThan(tresc);
});

test("negatywne: zero position fixed, zero sticky, zero hamburgera", async ({ page }) => {
  await wejdz(page);
  const zle = await page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .map((el) => ({ znacznik: el.tagName, klasa: el.className?.toString?.() ?? "", poz: getComputedStyle(el).position }))
      .filter((x) => x.poz === "fixed" || x.poz === "sticky"),
  );
  expect(zle).toEqual([]);
  await expect(page.locator('button[aria-label*="menu" i], .hamburger, [data-hamburger]')).toHaveCount(0);
});

test("gorny pas-goniec niesie tekst komisji", async ({ page }) => {
  await wejdz(page);
  await expect(page.locator("body > .pas-goniec").first()).toContainText("KOMISJA CZUWA");
});
