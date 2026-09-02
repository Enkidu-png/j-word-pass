import { test, expect } from "@playwright/test";
import komisja from "../data/komisja.json";

// AC F10-02 (plan/05 A,B; plan/04 B,D,F; plan/01 Z6, Z9, Z10, Z11, Z16).
// Reszta suity wchodzi z gotowym wpisem `jwp.wstep` (playwright.config.ts),
// wiec TYLKO ten plik ogląda brame - dlatego kasuje stan wejsciowy.
test.use({ storageState: { cookies: [], origins: [] } });

const WIDOKI = ["/", "/egzamin", "/quiz", "/proba-ognia"];

for (const widok of WIDOKI) {
  test(`${widok}: bez odpowiedzi nakladka zaslania tresc`, async ({ page }) => {
    await page.goto(widok);
    const nakladka = page.locator("[data-wstep-nakladka]");
    await expect(nakladka).toBeVisible();

    // „Zaslania" mierzone tak, jak widzi to petent: w srodku ekranu i w czterech
    // cwiartkach na wierzchu lezy nakladka, nie tresc widoku.
    const naWierzchu = await page.evaluate(() => {
      const { innerWidth: w, innerHeight: h } = window;
      const punkty = [
        [w / 2, h / 2],
        [w * 0.25, h * 0.25],
        [w * 0.75, h * 0.25],
        [w * 0.25, h * 0.8],
        [w * 0.75, h * 0.8],
      ];
      return punkty.every((p) =>
        document.elementFromPoint(p[0], p[1])?.closest("[data-wstep-nakladka]") != null,
      );
    });
    expect(naWierzchu).toBe(true);

    // Tresc pod spodem nie przewija sie spod nakladki.
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
  });
}

test("nakladka trzyma fokus: Tab nie wychodzi poza nia", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-wstep-nakladka]")).toBeVisible();
  const wSrodku = async () =>
    page.evaluate(() => document.activeElement?.closest("[data-wstep-nakladka]") != null);

  expect(await wSrodku()).toBe(true);
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(await wSrodku()).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(await wSrodku()).toBe(true);
});

test("bledna odpowiedz: stempel, fokus zostaje w polu, ZERO przeladowania", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    (window as unknown as { znacznik: string }).znacznik = "ta-sama-strona";
  });

  await page.locator("[data-pole='wstep']").fill("Zenon");
  await page.locator("[data-cta='wstep']").click();

  await expect(page.locator("[data-stempel='wstep']")).toHaveText(komisja.wstep.stempel);
  expect(await page.evaluate(() => document.activeElement?.getAttribute("data-pole"))).toBe("wstep");
  expect(await page.evaluate(() => (window as unknown as { znacznik?: string }).znacznik)).toBe(
    "ta-sama-strona",
  );
  await expect(page.locator("[data-wstep-nakladka]")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("jwp.wstep"))).toBeNull();
});

// Odpowiedz bierzemy Z DANYCH, nie z literalu: prawdziwy klucz nie ma prawa
// stac w repozytorium poza `data/komisja.json` (AC F10-03).
const O = komisja.wstep.odpowiedz;
for (const wpis of [O, O.toLowerCase(), O.toUpperCase(), `  ${O}  `]) {
  test(`poprawna odpowiedz "${wpis}" zdejmuje nakladke i zostaje po reloadzie`, async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-pole='wstep']").fill(wpis);
    await page.locator("[data-cta='wstep']").click();

    await expect(page.locator("[data-wstep-nakladka]")).toHaveCount(0);
    expect(await page.evaluate(() => window.localStorage.getItem("jwp.wstep"))).toBeTruthy();
    await expect(page.locator("h1")).toBeVisible();

    await page.reload();
    await expect(page.locator("[data-wstep-nakladka]")).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
  });
}

test("sama klawiatura: Tab do pola, wpis, Enter przepuszcza", async ({ page }) => {
  await page.goto("/egzamin");
  await expect(page.locator("[data-wstep-nakladka]")).toBeVisible();

  const pole = page.locator("[data-pole='wstep']");
  await expect(pole).toBeFocused();
  // Z10: fokus klawiatura widoczny.
  await page.keyboard.press("Tab");
  const przycisk = page.locator("[data-cta='wstep']");
  await expect(przycisk).toBeFocused();
  const obwodka = await przycisk.evaluate((e) => getComputedStyle(e).outline);
  expect(obwodka).toContain("dashed");

  await page.keyboard.press("Shift+Tab");
  await page.keyboard.type(komisja.wstep.odpowiedz);
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-wstep-nakladka]")).toHaveCount(0);
});

test("charakter strony: kafel, minimum 3 ozdoby, napis-obrazek, zero przekrzywien", async ({
  page,
}) => {
  await page.goto("/");
  const nakladka = page.locator("[data-wstep-nakladka]");
  await expect(nakladka).toBeVisible();

  const tlo = await nakladka.evaluate((e) => {
    const s = getComputedStyle(e);
    return { obraz: s.backgroundImage, powtarzanie: s.backgroundRepeat, rozmiar: s.backgroundSize };
  });
  expect(tlo.obraz).toContain("kafel-");
  expect(tlo.powtarzanie).toBe("repeat");
  expect(tlo.rozmiar).toBe("auto");

  expect(await nakladka.locator("img[data-ozdoba]").count()).toBeGreaterThanOrEqual(3);
  await expect(nakladka.locator("svg[data-napis]")).toHaveAttribute(
    "aria-label",
    komisja.wstep.naglowek,
  );

  // Z6: nic w nakladce nie stoi krzywo (dozwolone tylko lustro scaleX/scaleY).
  const krzywe = await nakladka.evaluate((korzen) =>
    [korzen, ...korzen.querySelectorAll("*")]
      .map((e) => getComputedStyle(e as Element).transform)
      .filter((t) => {
        if (t === "none" || t === "") return false;
        const m = t.match(/matrix\(([^)]+)\)/);
        if (!m) return true;
        const [a, b, c] = m[1].split(",").map(Number);
        return b !== 0 || c !== 0 || Math.abs(Math.abs(a) - 1) > 0.001;
      }),
  );
  expect(krzywe).toEqual([]);

  // Z16: pytanie bramy jest w danych, nie w komponencie.
  await expect(page.locator("label[for='wstep-odpowiedz']")).toHaveText(komisja.wstep.pytanie);
});

test("reduced-motion: nakladka wchodzi bez animacji", async ({ browser }) => {
  const kontekst = await browser.newContext({
    baseURL: "http://localhost:3000",
    reducedMotion: "reduce",
    storageState: { cookies: [], origins: [] },
  });
  const page = await kontekst.newPage();
  await page.goto("/");
  const nakladka = page.locator("[data-wstep-nakladka]");
  await expect(nakladka).toBeVisible();

  const ruch = await nakladka.evaluate((korzen) =>
    [korzen, ...korzen.querySelectorAll("*")]
      .map((e) => getComputedStyle(e as Element))
      .filter((s) => s.animationName !== "none" && s.animationPlayState !== "paused")
      .map((s) => s.animationName),
  );
  expect(ruch).toEqual([]);
  await kontekst.close();
});
