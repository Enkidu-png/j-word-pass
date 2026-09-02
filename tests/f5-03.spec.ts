import { test, expect } from "@playwright/test";
import { wejdz } from "./pomoc";

// AC F5-03 (plan/09 E). Radio zyje w stopce layoutu, wiec testujemy je z bramy.
// Zaden skrypt YouTube nie moze pojawic sie przed gestem Aleksandry (Z15, Z14).

const doYT = (url: string) =>
  url.includes("youtube.com") || url.includes("youtube-nocookie.com");

test("przed kliknieciem WLACZ zero zadan do YouTube", async ({ page }) => {
  const yt: string[] = [];
  page.on("request", (r) => {
    if (doYT(r.url())) yt.push(r.url());
  });
  await wejdz(page);
  await expect(page.locator("[data-radio]")).toBeVisible();
  await expect(page.locator("[data-radio-ekran]")).toContainText("KLIKNIJ WŁĄCZ, ALEKSANDRO");
  await page.waitForTimeout(1500);
  expect(yt).toHaveLength(0);
  // zero iframe'a i zero skryptu w DOM przed gestem
  expect(await page.locator("iframe").count()).toBe(0);
  expect(await page.locator('script[src*="youtube"]').count()).toBe(0);
});

test("WLACZ laduje iframe_api, iframe ma film i minimum 200x200", async ({ page }) => {
  const yt: string[] = [];
  page.on("request", (r) => {
    if (doYT(r.url())) yt.push(r.url());
  });
  await wejdz(page);
  await page.locator("[data-radio-cta]").click();

  await expect.poll(() => yt.some((u) => u.includes("iframe_api")), { timeout: 10_000 }).toBe(true);
  const ramka = page.locator("[data-radio-ekran] iframe");
  await expect(ramka).toHaveAttribute("src", /oCcks-fwq2c/, { timeout: 15_000 });
  await expect(ramka).toHaveAttribute("src", /youtube-nocookie\.com/);

  const pudlo = await ramka.boundingBox();
  console.log(`iframe radia: ${pudlo?.width}x${pudlo?.height}`);
  expect(pudlo!.width).toBeGreaterThanOrEqual(200);
  expect(pudlo!.height).toBeGreaterThanOrEqual(200);
  // F9-05: tytul ramki niesie nazwe BIEZACEGO materialu, bo materialy sa trzy
  await expect(ramka).toHaveAttribute(
    "title",
    "Odtwarzacz radia Komisji: POST MALONE, TINY DESK CONCERT, NPR MUSIC",
  );

  expect(await page.evaluate(() => localStorage.getItem("jwp.audio"))).toBe("on");
});

test("WYLACZ cichnie w mniej niz 100 ms (getPlayerState === 2)", async ({ page }) => {
  await wejdz(page);
  await page.locator("[data-radio-cta]").click();
  // pauza ma sens dopiero, gdy odtwarzacz REALNIE gra (stan 1). Mierzenie
  // czasu pauzy na materiale, ktory sie jeszcze nie zaczal, mierzy nic.
  await page.waitForFunction(() => window.jwpRadio?.getPlayerState() === 1, null, {
    timeout: 30_000,
  });
  await expect(page.locator("[data-radio-cta]")).toHaveText("WYŁĄCZ");

  const ms = await page.evaluate(async () => {
    const start = performance.now();
    (document.querySelector("[data-radio-cta]") as HTMLButtonElement).click();
    while (performance.now() - start < 100) {
      if (window.jwpRadio?.getPlayerState() === 2) return performance.now() - start;
      await new Promise((r) => setTimeout(r, 5));
    }
    return -1;
  });
  console.log(`pauza po ${ms} ms, stan ${await page.evaluate(() => window.jwpRadio?.getPlayerState())}`);
  expect(ms).toBeGreaterThanOrEqual(0);
  expect(ms).toBeLessThan(100);
  expect(await page.evaluate(() => localStorage.getItem("jwp.audio"))).toBe("off");
});

test("radio nie jest fixed i nie zaslania zadnego przycisku na 390 px", async ({ page }) => {
  await wejdz(page);
  const pozycje = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-radio], [data-radio] *")).map(
      (e) => getComputedStyle(e).position,
    ),
  );
  expect(pozycje).not.toContain("fixed");
  expect(pozycje).not.toContain("sticky");

  // zaden przycisk strony nie ma radia na swoim srodku
  const kolizje = await page.evaluate(() =>
    Array.from(document.querySelectorAll("button, a")).filter((b) => {
      const p = b.getBoundingClientRect();
      if (p.width === 0 || p.height === 0) return false;
      if (b.closest("[data-radio]")) return false;
      const na = document.elementFromPoint(p.x + p.width / 2, p.y + p.height / 2);
      return na != null && na.closest("[data-radio]") != null;
    }).length,
  );
  expect(kolizje).toBe(0);
});

test("suwak glosnosci zapisuje jwp.glosnosc i przezywa przeladowanie", async ({ page }) => {
  await wejdz(page);
  await page.locator("[data-radio-glosnosc]").fill("25");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("jwp.glosnosc"))).toBe("25");
  await page.reload();
  await expect(page.locator("[data-radio-glosnosc]")).toHaveValue("25");
  // wejscie z jwp.audio === "on" NIE startuje samo (Z15)
  await page.evaluate(() => localStorage.setItem("jwp.audio", "on"));
  await page.reload();
  await expect(page.locator("[data-radio-ekran]")).toContainText("KLIKNIJ, ABY WZNOWIĆ");
  expect(await page.locator("iframe").count()).toBe(0);
});

test("negatywne: zero plikow audio w public i zero pobieraczy w repo", async () => {
  const { execSync } = await import("node:child_process");
  const audio = execSync('find public -type f \\( -name "*.mp3" -o -name "*.ogg" -o -name "*.wav" -o -name "*.m4a" \\) | wc -l')
    .toString()
    .trim();
  expect(Number(audio)).toBe(0);
  // Szukamy w KODZIE i manifescie zaleznosci. `plan/` i `DECISIONS.md` nazywaja
  // te narzedzia po to, zeby ich zakazac, wiec ich stamtad nie liczymy.
  const pobieracze = execSync('git grep -ciE "youtube-dl|ytdl|yt-dlp" -- app components lib public scripts package.json | wc -l')
    .toString()
    .trim();
  expect(Number(pobieracze)).toBe(0);
});

// --- F9-05: trzy materialy i przelaczanie strzalkami ---

const KANALY = [
  { id: "oCcks-fwq2c", nazwa: "POST MALONE, TINY DESK CONCERT, NPR MUSIC" },
  { id: "RLmx3KMNuRM", nazwa: "TOP GUN NIESIOŁOWICE, CZASEM ŁOWIĘ RYBY" },
  { id: "wj2jITPprLw", nazwa: "TAK PUSZYSTY JAK ALMETTE, EBR CYPISZ" },
];

test("F9-05 podpis LECI znika, zostaje nazwa biezacego materialu", async ({ page }) => {
  await wejdz(page);
  await expect(page.locator("[data-radio-nazwa]")).toHaveText(KANALY[0].nazwa);
  expect(await page.content()).not.toContain("LECI: POST");
  await expect(page.locator("[data-radio-poprzedni]")).toHaveAttribute("aria-label", /Poprzedni/);
  await expect(page.locator("[data-radio-nastepny]")).toHaveAttribute("aria-label", /Następny/);
});

test("F9-05 strzalki chodza w petli i zapisuja jwp.kanal, bez zadan do YouTube", async ({
  page,
}) => {
  const yt: string[] = [];
  page.on("request", (r) => {
    if (doYT(r.url())) yt.push(r.url());
  });
  await wejdz(page);

  for (const oczekiwany of [KANALY[1], KANALY[2], KANALY[0]]) {
    await page.locator("[data-radio-nastepny]").click();
    await expect(page.locator("[data-radio-nazwa]")).toHaveText(oczekiwany.nazwa);
    await expect.poll(() => page.evaluate(() => localStorage.getItem("jwp.kanal"))).toBe(
      oczekiwany.id,
    );
  }
  await page.locator("[data-radio-poprzedni]").click();
  await expect(page.locator("[data-radio-nazwa]")).toHaveText(KANALY[2].nazwa);

  // przelaczanie PRZED gestem WLACZ nie budzi YouTube (Z15)
  expect(yt).toHaveLength(0);
  expect(await page.locator("iframe").count()).toBe(0);

  // wybor przezywa przeladowanie
  await page.reload();
  await expect(page.locator("[data-radio-nazwa]")).toHaveText(KANALY[2].nazwa);
});

test("F9-05 strzalka dziala klawiatura i podmienia grajacy material", async ({ page }) => {
  await wejdz(page);
  await page.locator("[data-radio-cta]").click();
  await page.waitForFunction(() => window.jwpRadio?.getPlayerState() === 1, null, {
    timeout: 30_000,
  });
  expect(await page.evaluate(() => window.jwpRadio!.getVideoData().video_id)).toBe(KANALY[0].id);

  await page.locator("[data-radio-nastepny]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-radio-nazwa]")).toHaveText(KANALY[1].nazwa);
  await expect
    // tuz po `loadVideoById` odtwarzacz przez chwile nie ma jeszcze danych filmu
    .poll(() => page.evaluate(() => window.jwpRadio?.getVideoData?.()?.video_id), {
      timeout: 20_000,
    })
    .toBe(KANALY[1].id);
});
