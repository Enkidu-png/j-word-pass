import { test, expect } from "@playwright/test";

// AC F5-01: bledny email = trzesienie + stempel + fokus; but 8 = stempel (10-70);
// ucho 200 = przechodzi z dopiskiem podziwu; submit bez checkboxa zablokowany;
// negatywne: zero czerwonych obwodek bez stempla, brak steppera.

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

async function wejdz(page: import("@playwright/test").Page) {
  await page.addInitScript(WPUSC);
  await page.goto("/proba-ognia");
  await expect(page.locator("[data-druk]")).toBeVisible();
  await expect(page.locator("[data-straz]")).toHaveCount(0);
  // CTA odblokowuje sie dopiero po hydracji + checkboxie
  await expect(page.locator("[data-cta]")).toBeDisabled();
}

test("submit bez checkboxa zablokowany, z checkboxem czynny", async ({ page }) => {
  await wejdz(page);
  await page.locator("[data-pole='email']").fill("kandydatka@komisja.pl");
  await page.locator("[data-pole='but']").fill("39");
  await page.locator("[data-pole='ucho']").fill("60");
  // nadal disabled - pokora niezlozona
  await expect(page.locator("[data-cta]")).toBeDisabled();
  await expect(page.locator("[data-butelka]")).toHaveCount(0);

  const tlemDisabled = await page.locator("[data-cta]").evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.locator("[data-pokora]").check();
  await expect(page.locator("[data-cta]")).toBeEnabled();
  // stan blokady musi byc WIDOCZNY, nie tylko obecny w atrybucie
  expect(await page.locator("[data-cta]").evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(tlemDisabled);
  await page.locator("[data-cta]").click();
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 9000 });
  await expect(page.locator("[data-stempel]")).toHaveCount(0);
});

test("bledny email: trzesienie, stempel niegodnosci, fokus wraca do pola", async ({ page }) => {
  await wejdz(page);
  const email = page.locator("[data-pole='email']");
  await email.fill("nie-jest-adresem");
  await page.locator("[data-pole='but']").fill("39");
  await page.locator("[data-pole='ucho']").fill("60");
  await page.locator("[data-pokora]").check();

  const spokojnaObwodka = await email.evaluate((el) => getComputedStyle(el).borderBottomColor);
  await page.locator("[data-cta]").click();

  const stempel = page.locator("[data-stempel='email']");
  await expect(stempel).toBeVisible();
  await expect(stempel).toContainText("WYPEŁNIONO NIEGODNIE");
  await expect(email).toBeFocused();
  // trzesienie: pole ma animacje 2 klatek
  const ruch = await page.locator("[data-luk='0']").evaluate((el) => {
    const s = getComputedStyle(el);
    return { nazwa: s.animationName, klatki: s.animationTimingFunction };
  });
  expect(ruch.nazwa).toBe("jwp-trzesienie");
  expect(ruch.klatki).toContain("steps(2");
  // NEGATYWNE: zero czerwonych obwodek - pole wyglada tak samo jak przed bledem
  expect(await email.evaluate((el) => getComputedStyle(el).borderBottomColor)).toBe(spokojnaObwodka);
  await expect(page.locator("[data-butelka]")).toHaveCount(0);
});

test("but 8 poza skala 10-70 dostaje stempel, 39 przechodzi", async ({ page }) => {
  await wejdz(page);
  await page.locator("[data-pole='email']").fill("kandydatka@komisja.pl");
  await page.locator("[data-pole='but']").fill("8");
  await page.locator("[data-pole='ucho']").fill("60");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta]").click();

  await expect(page.locator("[data-stempel='but']")).toContainText("WYPEŁNIONO NIEGODNIE");
  await expect(page.locator("[data-stempel='but']")).toContainText("10-70");
  await expect(page.locator("[data-pole='but']")).toBeFocused();
  await expect(page.locator("[data-stempel='email']")).toHaveCount(0);

  await page.locator("[data-pole='but']").fill("39");
  await page.locator("[data-cta]").click();
  await expect(page.locator("[data-stempel]")).toHaveCount(0);
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 9000 });
});

test("ucho 200 przechodzi z dopiskiem podziwu, stopka skaluje sie z butem", async ({ page }) => {
  await wejdz(page);
  await page.locator("[data-pole='ucho']").fill("60");
  await expect(page.locator("[data-podziw]")).toHaveCount(0);   // 20-90 = nuda
  await page.locator("[data-pole='ucho']").fill("200");
  await expect(page.locator("[data-podziw]")).toContainText("KOMISJA NOTUJE Z PODZIWEM");

  // stopka-miarka rosnie skokowo wraz z rozmiarem buta
  await page.locator("[data-pole='but']").fill("20");
  const mala = await page.locator("[data-stopka]").getAttribute("data-stopka");
  await page.locator("[data-pole='but']").fill("60");
  const duza = await page.locator("[data-stopka]").getAttribute("data-stopka");
  expect(Number(duza)).toBeGreaterThan(Number(mala));

  await page.locator("[data-pole='email']").fill("kandydatka@komisja.pl");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta]").click();
  await expect(page.locator("[data-stempel]")).toHaveCount(0);   // 200 mm nie blokuje
  await expect(page.locator("[data-butelka]")).toBeVisible({ timeout: 9000 });
});

test("NEGATYWNE: zero steppera 1-2-3 nad formularzem (anty-spec 07 D3)", async ({ page }) => {
  await wejdz(page);
  const druk = page.locator("[data-druk]");
  await expect(druk.locator("ol")).toHaveCount(0);
  await expect(page.getByText(/KROK\s*\d\s*(Z|\/)\s*\d/i)).toHaveCount(0);
});

test("zrzut sceny ogniska", async ({ page }, info) => {
  await wejdz(page);
  await page.locator("[data-pole='email']").fill("kandydatka@komisja.pl");
  await page.locator("[data-pole='but']").fill("47");
  await page.locator("[data-pole='ucho']").fill("240");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `screenshots/F5/F5-01-ognisko-${info.project.name}.png`, fullPage: true });
  // drugi zrzut: stan po niegodnym wypelnieniu (stempel na druku)
  await page.locator("[data-pole='email']").fill("x");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta]").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `screenshots/F5/F5-01-stempel-${info.project.name}.png`, fullPage: true });
});

test("Z10: reduced-motion gasi trzesienie, stempel zostaje", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await wejdz(page);
  await page.locator("[data-pole='email']").fill("x");
  await page.locator("[data-pokora]").check();
  await page.locator("[data-cta]").click();
  await expect(page.locator("[data-stempel='email']")).toBeVisible();
  expect(await page.locator("[data-luk='0']").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  expect(await page.locator(".ognisko__plomien").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
});
