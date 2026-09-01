import { test, expect } from "@playwright/test";

// AC F2-03: >= 6 dekoracji gif-less widocznych bez scrolla i >= 6 roznych
// animation-delay; WOLĘ NIE ucieka 3x i kapituluje; ceremonia wejscia <= 2 s
// z Esc-skipem i fokusem na h1 egzaminu; reduced-motion: pojedynczy fade;
// negatywne: brak hero z dwoma przyciskami obok siebie.

test("sciana ruchu: >= 6 dekoracji w viewporcie i >= 6 roznych opoznien", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "AC mierzy viewport 1280x800");
  await page.goto("/");

  const widoczne = await page.locator(".gif-less").evaluateAll((els) =>
    els
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.width > 0 &&
          r.height > 0 &&
          r.top < window.innerHeight &&
          r.bottom > 0 &&
          r.left < window.innerWidth &&
          r.right > 0
        );
      })
      .map((el) => getComputedStyle(el).animationDelay),
  );
  expect(widoczne.length).toBeGreaterThanOrEqual(6);
  expect(new Set(widoczne).size).toBeGreaterThanOrEqual(6);

  await page.screenshot({ path: "screenshots/F2/F2-03-brama.png" });
});

test("WOLĘ NIE ucieka dokladnie 3 razy, potem kapituluje", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "na dotyku uciekinier kapituluje od razu");
  await page.goto("/");
  const uciekinier = page.locator("[data-uciekinier]");
  await expect(uciekinier).toHaveText("WOLĘ NIE");

  const pozycje: string[] = [];
  for (let i = 0; i < 3; i++) {
    await uciekinier.hover({ force: true });
    await expect(uciekinier).toHaveAttribute("data-ucieczki", String(i + 1));
    pozycje.push(await uciekinier.evaluate((el) => `${(el as HTMLElement).style.top}`));
  }
  await expect(uciekinier).toHaveText("DOBRA, I TAK MUSISZ");

  // czwarty hover juz nic nie zmienia
  await uciekinier.hover({ force: true });
  await expect(uciekinier).toHaveAttribute("data-ucieczki", "3");
  expect(pozycje.filter(Boolean).length).toBe(3); // faktycznie sie przestawial

  // fokus klawiatura NIE ploszy uciekiniera (a11y)
  await uciekinier.focus();
  await expect(uciekinier).toHaveAttribute("data-ucieczki", "3");
});

test("uciekinier na dotyku kapituluje od razu", async ({ browser }) => {
  const kontekst = await browser.newContext({ hasTouch: true, isMobile: true });
  const strona = await kontekst.newPage();
  await strona.goto("/");
  await expect(strona.locator("[data-uciekinier]")).toHaveText("DOBRA, I TAK MUSISZ");
  await kontekst.close();
});

test("ceremonia wejscia: <= 2 s, konczy sie na /egzamin z fokusem na h1", async ({ page }) => {
  await page.goto("/");
  const start = Date.now();
  await page.locator("[data-cta]").click();
  await expect(page.locator("[data-stempel]")).toBeVisible();
  await expect(page.locator("[data-szuflada]")).toBeVisible();
  await page.waitForURL(/\/egzamin$/);
  const czas = Date.now() - start;
  expect(czas).toBeLessThanOrEqual(2000);

  // Z9: fokus na nagłówku nowego etapu
  await expect(page.locator('h1[tabindex="-1"]')).toBeFocused();
});

test("Esc pomija ceremonie i od razu wpuszcza do egzaminu", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-cta]").click();
  await expect(page.locator("[data-stempel]")).toBeVisible();
  const start = Date.now();
  await page.keyboard.press("Escape");
  await page.waitForURL(/\/egzamin$/);
  expect(Date.now() - start).toBeLessThan(600);
  await expect(page.locator('h1[tabindex="-1"]')).toBeFocused();
});

test("reduced-motion: brama stoi, CTA dziala, przejscie to pojedynczy fade", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const ruchome = await page
    .locator(".gif-less")
    .evaluateAll((els) => els.filter((el) => getComputedStyle(el).animationName !== "none").length);
  expect(ruchome).toBe(0);

  await page.locator("[data-cta]").click();
  const fade = await page
    .locator("[data-szuflada]")
    .evaluate((el) => {
      const s = getComputedStyle(el);
      return { nazwa: s.animationName, czas: s.animationDuration };
    });
  expect(fade.nazwa).toBe("jwp-fade");
  expect(fade.czas).toBe("0.3s");
  await page.waitForURL(/\/egzamin$/);
});

test("negatywne: zero hero z dwoma przyciskami obok siebie", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "uklad hero dotyczy desktopu");
  await page.goto("/");
  const cta = (await page.locator("[data-cta]").boundingBox())!;
  const uciekinier = (await page.locator("[data-uciekinier]").boundingBox())!;
  // nie stoja w jednym rzedzie: pasy pionowe nie zachodza na siebie
  const wJednymRzedzie =
    cta.y < uciekinier.y + uciekinier.height && uciekinier.y < cta.y + cta.height;
  expect(wJednymRzedzie).toBe(false);
  // naglowek nie jest wysrodkowanym hero
  expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).textAlign)).not.toBe("center");
});
