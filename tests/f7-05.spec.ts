import { test, expect } from "@playwright/test";

// AC F7-05: widzet RadioKomisji nie przykrywa ANI stopki, ANI zadnego elementu
// klikalnego - na obu viewportach. Sprawdzamy dwoma miarami:
//  (a) przeciecie prostokatow radia i wierszy tekstu stopki = zero,
//  (b) trafienie w srodek kazdego klikalnego elementu (`elementFromPoint`)
//      nigdy nie laduje w radiu - czyli radio niczego nie zaslania.
// (b) jest mocniejsze niz samo przeciecie: strazEtapu to CELOWA nakladka nad
// trescia (Z15) i lezy NAD radiem, wiec przeciecie z nia bledem nie jest.

async function zbadaj(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const radio = document.querySelector("[data-radio]");
    if (!radio) return { brakRadia: true, przykryte: [], stopka: [] };
    const r = radio.getBoundingClientRect();
    const przykryte: string[] = [];
    for (const el of Array.from(document.querySelectorAll('button, a, [role="button"]'))) {
      if (radio.contains(el)) continue;
      const e = el.getBoundingClientRect();
      if (e.width === 0 || e.height === 0) continue;
      const trafiony = document.elementFromPoint(e.left + e.width / 2, e.top + e.height / 2);
      if (trafiony && radio.contains(trafiony)) przykryte.push((el.textContent || el.tagName).trim().slice(0, 60));
    }
    const stopka: string[] = [];
    const f = document.querySelector("[data-webring]");
    if (f)
      for (const el of Array.from(f.querySelectorAll("p, span"))) {
        const e = el.getBoundingClientRect();
        if (e.width === 0 || e.height === 0) continue;
        if (r.left < e.right && e.left < r.right && r.top < e.bottom && e.top < r.bottom)
          stopka.push((el.textContent || "").trim().slice(0, 60));
      }
    return { brakRadia: false, przykryte, stopka };
  });
}

for (const sciezka of ["/", "/egzamin", "/quiz", "/proba-ognia"]) {
  test(`radio nie zaslania nic na ${sciezka}`, async ({ page }, info) => {
    await page.goto(sciezka);
    await expect(page.locator("[data-radio]")).toHaveCount(1);
    const wynik = await zbadaj(page);
    expect(wynik.brakRadia).toBe(false);
    expect(wynik.przykryte).toEqual([]);
    expect(wynik.stopka).toEqual([]);
    if (sciezka === "/")
      await page.screenshot({ path: `screenshots/F7/F7-05-brama-${info.project.name}.png`, fullPage: true });
  });
}

test("radio nie zaslania przycisku werdyktu ani stopki po ocenie", async ({ page }, info) => {
  await page.route("**/api/ocena", (t) => t.fulfill({ json: { punkty: 8, komentarz: "Komisja odnotowuje tupet." } }));
  await page.goto("/egzamin");
  await page.locator("[data-pole-robocze]").fill("Zebry maja ped, slon ma odrzut.");
  await page.locator("[data-arkusz] button").click();
  await expect(page.locator("[data-werdykt]")).toHaveAttribute("data-werdykt", "8", { timeout: 12_000 });
  await page.waitForTimeout(400);

  const wynik = await zbadaj(page);
  expect(wynik.przykryte).toEqual([]);
  expect(wynik.stopka).toEqual([]);
  await page.screenshot({ path: `screenshots/F7/F7-05-werdykt-${info.project.name}.png`, fullPage: true });
});
