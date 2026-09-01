import { test, expect } from "@playwright/test";
import egzamin from "../data/egzamin.json";

// AC F3-03: przeciagniecie karty w slot przybija ZAL. (dragTo), pelna sciezka
// klawiatura Enter/strzalki/Enter, upuszczenie poza slotem wraca skokiem,
// liczba zalaczonych trafia do payloadu /api/ocena.

const PIERWSZA = egzamin.zalozenia[0].id;
const DRUGA = egzamin.zalozenia[1].id;

test("drag: karta w slocie dostaje pieczatke ZAL.", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "na dotyku obowiazuje tap-tap, osobny test");
  await page.goto("/egzamin");
  const karta = page.locator(`[data-karta='${PIERWSZA}']`);
  await expect(karta).toHaveAttribute("data-zalaczona", "nie");

  await karta.dragTo(page.locator("[data-slot='0']"));

  await expect(page.locator("[data-slot='0'] [data-karta]")).toHaveAttribute("data-karta", PIERWSZA);
  await expect(page.locator(`[data-karta='${PIERWSZA}']`)).toHaveAttribute("data-zalaczona", "tak");
  await expect(page.locator("[data-slot='0']")).toHaveAttribute("data-zajety", "tak");
  await expect(page.locator("[data-slot='0'] .pieczatka svg")).toHaveAttribute("aria-label", "ZAŁ.");
});

test("drag poza slot: karta wraca skokiem, slot zostaje pusty", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "przeciaganie tylko na wskazniku precyzyjnym");
  await page.goto("/egzamin");
  const karta = page.locator(`[data-karta='${PIERWSZA}']`);
  await karta.dragTo(page.locator("h1"));

  await expect(karta).toHaveAttribute("data-zalaczona", "nie");
  await expect(page.locator("[data-slot='0']")).toHaveAttribute("data-zajety", "nie");
  // powrot jest skokowy (3 klatki), nie plynny
  const ruch = await page.locator(".karta-dowodowa--powrot").evaluate((el) => {
    const s = getComputedStyle(el);
    return { nazwa: s.animationName, timing: s.animationTimingFunction, petle: s.animationIterationCount };
  });
  expect(ruch.nazwa).toBe("jwp-powrot");
  expect(ruch.timing).toMatch(/^steps\(3(, end)?\)$/);
  expect(ruch.petle).toBe("1");
});

test("klawiatura: Enter podnosi, strzalki wybieraja slot, Enter upuszcza", async ({ page }) => {
  await page.goto("/egzamin");
  const karta = page.locator(`[data-karta='${PIERWSZA}']`);
  await karta.focus();
  await expect(karta).toBeFocused();

  await page.keyboard.press("Enter"); // podnies
  await expect(karta).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-slot='0']")).toHaveClass(/arkusz__slot--cel/);

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-slot='2']")).toHaveClass(/arkusz__slot--cel/);

  await page.keyboard.press("Enter"); // upusc
  await expect(page.locator("[data-slot='2'] [data-karta]")).toHaveAttribute("data-karta", PIERWSZA);
  await expect(page.locator("[data-slot='2'] .pieczatka svg")).toHaveAttribute("aria-label", "ZAŁ.");
  await expect(page.locator("[data-slot='0']")).toHaveAttribute("data-zajety", "nie");
});

test("tap-tap: klik w karte, klik w slot (sciezka dotykowa)", async ({ page }) => {
  await page.goto("/egzamin");
  await page.locator(`[data-karta='${DRUGA}']`).click();
  await expect(page.locator(`[data-karta='${DRUGA}']`)).toHaveAttribute("aria-pressed", "true");
  await page.locator("[data-slot='1']").click();
  await expect(page.locator("[data-slot='1'] [data-karta]")).toHaveAttribute("data-karta", DRUGA);
});

test("liczba zalaczonych dowodow trafia do payloadu /api/ocena", async ({ page }) => {
  await page.goto("/egzamin");
  // dwa dowody sciezka tap-tap (dziala na obu projektach)
  await page.locator(`[data-karta='${PIERWSZA}']`).click();
  await page.locator("[data-slot='0']").click();
  await page.locator(`[data-karta='${DRUGA}']`).click();
  await page.locator("[data-slot='1']").click();
  await expect(page.locator("[data-slot='1'] [data-karta]")).toHaveCount(1);

  await page.locator("[data-pole-robocze]").fill("zebry wygrają, bo pęd");
  await page.route("**/api/ocena", (trasa) => trasa.fulfill({ json: { punkty: 8, komentarz: "OK." } }));
  const zadanie = page.waitForRequest("**/api/ocena");
  await page.locator("[data-arkusz] button").click();

  const cialo = (await zadanie).postDataJSON();
  expect(cialo.zalaczoneDowody).toBe(2);
  expect(cialo.odpowiedz).toBe("zebry wygrają, bo pęd");
});

test("stan dowodow przezywa przeladowanie (Z11)", async ({ page }) => {
  await page.goto("/egzamin");
  await page.locator(`[data-karta='${PIERWSZA}']`).click();
  await page.locator("[data-slot='0']").click();
  await page.waitForTimeout(600); // debounce zapisu 400 ms
  await page.reload();
  await expect(page.locator("[data-slot='0'] [data-karta]")).toHaveAttribute("data-karta", PIERWSZA);
});

test("negatywne: karty NIE sa akapitami (anty-spec 05 D1)", async ({ page }, info) => {
  await page.goto("/egzamin");
  await expect(page.locator("[data-karta]")).toHaveCount(6);
  await page.locator("[data-karta='kosmos']").click();
  await page.locator("[data-slot='0']").click();
  await page.locator("[data-karta='slon-oko']").click();
  await page.locator("[data-slot='3']").click();
  await page.waitForTimeout(600); // pieczatki musza dobic, inaczej zrzut lapie klatke ceremonii
  await page.screenshot({ path: `screenshots/F3/F3-03-karty-${info.project.name}.png`, fullPage: true });
  const akapity = await page.locator("p").allTextContents();
  for (const z of egzamin.zalozenia) {
    expect(akapity.some((t) => t.includes(z.tekst))).toBe(false);
  }
});
