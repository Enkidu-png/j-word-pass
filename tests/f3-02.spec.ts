import { test, expect } from "@playwright/test";
import egzamin from "../data/egzamin.json";

// AC F3-02: scena kosmiczna (slon ze strzalem hoverowym + licznik naboi,
// 12 zeber z jedna oficerska reverse), arkusz formularz-F7 z textarea,
// mobile = kolumna i 5 zeber, zalozenia NIE jako blok <p> (anty-spec 05 D1).

test("hover slonia: strzal + odrzut + licznik naboi w dol (3 hovery = 4997)", async ({ page }) => {
  await page.goto("/egzamin");
  const licznik = page.locator("[data-scena] [data-licznik]");
  await expect(licznik).toHaveAttribute("data-licznik", "5000");

  const slon = page.locator("[data-slon]");
  for (let i = 0; i < 3; i++) {
    // kursor musi opuscic slonia, inaczej nie ma kolejnego mouseenter
    await page.mouse.move(0, 0);
    await slon.hover();
    await expect(licznik).toHaveAttribute("data-licznik", String(5000 - (i + 1)));
  }
  await expect(licznik).toHaveAttribute("data-licznik", "4997");

  // odrzut i pociski to ceremonia: jednorazowa, skokowa
  const odrzut = await page
    .locator(".slon__odrzut")
    .evaluate((el) => {
      const s = getComputedStyle(el);
      return { nazwa: s.animationName, timing: s.animationTimingFunction, petle: s.animationIterationCount };
    });
  expect(odrzut.nazwa).toBe("jwp-odrzut");
  expect(odrzut.timing).toMatch(/^steps\(5(, end)?\)$/);
  expect(odrzut.petle).toBe("1");
  await expect(page.locator(".slon__pocisk")).toHaveCount(3);
});

test("stado: 12 zeber, jedna oficerska leci pod prad, hover robi beczke RAZ", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "mobile ma 5 zeber, osobny test");
  await page.goto("/egzamin");
  await expect(page.locator(".scena__zebra")).toHaveCount(12);

  const kierunki = await page
    .locator(".scena__skok")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationDirection));
  expect(kierunki.filter((k) => k === "reverse")).toHaveLength(1);

  // desynchronizacja: kazda zebra ma wlasny delay
  const delaye = await page
    .locator(".scena__skok")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationDelay));
  expect(new Set(delaye).size).toBeGreaterThanOrEqual(10);

  const zebra = page.locator("[data-zebra='0']");
  await page.mouse.move(0, 0);
  await zebra.hover();
  const beczka = await zebra.evaluate((el) => {
    const s = getComputedStyle(el);
    return { nazwa: s.animationName, czasMs: parseFloat(s.animationDuration) * 1000,
             timing: s.animationTimingFunction, petle: s.animationIterationCount };
  });
  expect(beczka.nazwa).toBe("jwp-beczka");
  expect(beczka.czasMs).toBe(500);
  expect(beczka.timing).toMatch(/^steps\(4(, end)?\)$/);
  expect(beczka.petle).toBe("1"); // jednorazowo, nie petla

  // po zakonczeniu klasa znika, wiec kolejny hover moze wbic beczke od nowa
  await expect(zebra).toHaveClass("", { timeout: 2000 });
});

test("mobile 390px: kolumna i tylko 5 widocznych zeber", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "AC dotyczy viewportu 390 px");
  await page.goto("/egzamin");
  await expect(page.locator(".scena__zebra:visible")).toHaveCount(5);

  const kolumny = await page
    .locator(".egzamin__plansza")
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(kolumny.split(" ")).toHaveLength(1);

  // scena stoi NAD arkuszem
  const scena = await page.locator("[data-scena]").boundingBox();
  const arkusz = await page.locator("[data-arkusz]").boundingBox();
  expect(scena!.y + scena!.height).toBeLessThanOrEqual(arkusz!.y + 1);
});

test("arkusz: naglowek, textarea z licznikiem znakow i jeden submit", async ({ page }, info) => {
  await page.goto("/egzamin");
  await expect(page.locator("[data-arkusz] h2")).toHaveText(egzamin.tytul);

  const pole = page.locator("[data-pole-robocze]");
  await expect(pole).toHaveAttribute("placeholder", "Tu wpisz wywód. Komisja czyta WSZYSTKO. Serio.");
  await pole.fill("abc");
  await expect(page.locator("[data-znaki]")).toHaveAttribute("data-znaki", "3");
  await expect(page.locator("[data-znaki]")).toHaveText("ZNAKÓW: 3");

  // stempel mruga dopiero po pelnych 200 znakach
  await expect(page.locator(".arkusz__znaki--mruga")).toHaveCount(0);
  await pole.fill("x".repeat(200));
  await expect(page.locator(".arkusz__znaki--mruga")).toHaveCount(1);

  // jedyny submit na arkuszu (05 A2)
  await expect(page.locator("[data-arkusz] button")).toHaveCount(1);
  await expect(page.locator("[data-arkusz] button")).toHaveText("ODDAJĘ WYWÓD POD OSĄD KOMISJI");

  // 6 slotow na dowody, wszystkie puste
  await expect(page.locator(".arkusz__slot")).toHaveCount(6);

  await pole.fill("Zebry maja pęd, słoń ma odrzut. Wynik jest oczywisty.");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `screenshots/F3/F3-02-egzamin-${info.project.name}.png`, fullPage: true });
});

test("negatywne: zadne zalozenie NIE jest wyswietlone jako blok <p> (anty-spec 05 D1)", async ({ page }) => {
  await page.goto("/egzamin");
  const akapity = await page.locator("p").allTextContents();
  for (const zalozenie of egzamin.zalozenia) {
    expect(akapity.some((t) => t.includes(zalozenie.tekst))).toBe(false);
  }
});
