import { test, expect } from "@playwright/test";
import komisja from "../data/komisja.json";

// AC F3-04: pusta odpowiedz = 0/10 bez requestu do API, niepusta = min 3,5 s
// teatru z losowanymi dymkami, gwiazdki do N, pieczatka N/10, komentarz AI
// na druku; Esc skacze do werdyktu; padniete API = werdykt awaryjny <= 16 s;
// powrot na /egzamin = arkusz readonly + werdykt z sessionStorage.

const OCENA = { punkty: 8, komentarz: "Komisja odnotowuje tupet i brak wzorów." };

async function udawajKomisje(page: import("@playwright/test").Page, opoznienieMs = 0) {
  await page.route("**/api/ocena", async (trasa) => {
    if (opoznienieMs) await new Promise((s) => setTimeout(s, opoznienieMs));
    await trasa.fulfill({ json: OCENA });
  });
}

test("pusta odpowiedz: 0/10 i ZERO requestow do /api/ocena", async ({ page }) => {
  await page.goto("/egzamin");
  let strzalow = 0;
  page.on("request", (r) => {
    if (r.url().includes("/api/ocena")) strzalow++;
  });

  await page.locator("[data-arkusz] button").click();
  await expect(page.locator("[data-werdykt]")).toHaveAttribute("data-werdykt", "0", { timeout: 5000 });
  await expect(page.locator("[data-narada='werdykt'] .pieczatka svg")).toHaveAttribute(
    "aria-label",
    "0/10 - PUSTKA",
  );
  await expect(page.locator(".narada__podpis-pieczeci")).toHaveText("PUSTKA INTELEKTUALNA - 0 PKT");
  expect(strzalow).toBe(0);
});

test("niepusta: min 3,5 s teatru, dymki, gwiazdki do N, pieczatka N/10, komentarz AI", async ({
  page,
}, info) => {
  await udawajKomisje(page);
  await page.goto("/egzamin");
  await page.locator("[data-pole-robocze]").fill("Zebry maja pęd, słoń ma odrzut.");

  const start = Date.now();
  await page.locator("[data-arkusz] button").click();

  // teatr: dymki komisji, kwestie z data/komisja.json, zmieniaja sie
  await expect(page.locator("[data-dymek]")).toBeVisible();
  const pula = komisja.ocenianie.map((k) => k.tekst);
  const widziane = new Set<string>();
  // probkujemy w oknie krotszym niz 3,5 s teatru, inaczej dymek znika w trakcie
  for (let i = 0; i < 6; i++) {
    widziane.add((await page.locator("[data-dymek]").textContent()) ?? "");
    await page.waitForTimeout(500);
  }
  for (const t of widziane) expect(pula).toContain(t);
  expect(widziane.size).toBeGreaterThanOrEqual(2); // dymki sie losuja, nie stoja

  await expect(page.locator("[data-werdykt]")).toHaveAttribute("data-werdykt", "8", { timeout: 12_000 });
  expect(Date.now() - start).toBeGreaterThanOrEqual(3500);

  // gwiazdki wypelniaja sie do N
  await expect(page.locator("[data-gwiazdki]")).toHaveAttribute("data-gwiazdki", "8", { timeout: 4000 });
  await expect(page.locator(".narada__gwiazdka[data-pelna='tak']")).toHaveCount(8);
  await expect(page.locator("[data-narada='werdykt'] .pieczatka svg")).toHaveAttribute("aria-label", "8/10 - ZDANO");
  await expect(page.locator("[data-komentarz]")).toHaveText(OCENA.komentarz);
  // Z9: fokus konczy na przycisku do quizu
  await expect(page.locator("[data-do-quizu]")).toBeFocused();

  await page.waitForTimeout(400);
  await page.screenshot({ path: `screenshots/F3/F3-04-werdykt-${info.project.name}.png`, fullPage: true });
});

test("Esc pomija teatr i skacze od razu do werdyktu", async ({ page }) => {
  await udawajKomisje(page);
  await page.goto("/egzamin");
  await page.locator("[data-pole-robocze]").fill("krotko i na temat");
  await page.locator("[data-arkusz] button").click();
  await expect(page.locator("[data-dymek]")).toBeVisible();

  const start = Date.now();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-werdykt]")).toBeVisible({ timeout: 3000 });
  expect(Date.now() - start).toBeLessThan(2000); // bez czekania na pelne 3,5 s
});

test("padnieta Komisja: werdykt awaryjny w mniej niz 16 s", async ({ page }) => {
  await page.route("**/api/ocena", (trasa) => trasa.fulfill({ status: 502, json: { blad: "Komisja nieosiągalna." } }));
  await page.goto("/egzamin");
  await page.locator("[data-pole-robocze]").fill("cokolwiek, byle nie pusto");

  const start = Date.now();
  await page.locator("[data-arkusz] button").click();
  // uwaga: napis awaryjny mruga (gif-less--blink), wiec toBeVisible bywa false
  await expect(page.locator("[data-awaryjny]")).toHaveCount(1, { timeout: 16_000 });
  expect(Date.now() - start).toBeLessThan(16_000);

  // 05 B: punkty z dlugosci odpowiedzi, komentarz z puli zapasowej
  const punkty = Number(await page.locator("[data-werdykt]").getAttribute("data-werdykt"));
  expect(punkty).toBe(6 + ("cokolwiek, byle nie pusto".length % 5));
  const komentarz = await page.locator("[data-komentarz]").textContent();
  expect(komisja.werdyktAwaryjny.map((k) => k.tekst)).toContain(komentarz);
});

test("powrot na /egzamin: arkusz readonly, werdykt z sessionStorage", async ({ page }) => {
  await udawajKomisje(page);
  await page.goto("/egzamin");
  await page.locator("[data-pole-robocze]").fill("wywod kandydata");
  await page.locator("[data-arkusz] button").click();
  await expect(page.locator("[data-werdykt]")).toBeVisible({ timeout: 12_000 });

  await page.reload();
  await expect(page.locator("[data-werdykt]")).toHaveAttribute("data-werdykt", "8");
  await expect(page.locator("[data-komentarz]")).toHaveText(OCENA.komentarz);
  await expect(page.locator("[data-pole-robocze]")).toHaveJSProperty("readOnly", true);
  await expect(page.locator("[data-arkusz] button")).toHaveCount(0); // zero drugiego submitu
});

test("przycisk werdyktu prowadzi na /quiz, ktory jest juz odblokowany", async ({ page }) => {
  await udawajKomisje(page);
  await page.goto("/egzamin");
  await page.locator("[data-pole-robocze]").fill("wywod kandydata");
  await page.locator("[data-arkusz] button").click();
  await expect(page.locator("[data-do-quizu]")).toBeVisible({ timeout: 12_000 });

  await page.locator("[data-do-quizu]").click();
  await page.waitForURL("**/quiz", { timeout: 5000 });
  await expect(page.locator("[data-straz]")).toHaveCount(0); // straz etapu przepuszcza
});
