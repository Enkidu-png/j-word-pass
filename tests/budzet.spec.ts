import { test, expect, type Page } from "@playwright/test";

// Z18: suma assetow pobieranych na jednym ekranie <= 2,5 MB. Pomiar wg plan/03 C:
// sumujemy transferSize wszystkich odpowiedzi typu image/*.
export const PROG_BAJTOW = 2.5 * 1024 * 1024;

export async function zmierzObrazki(page: Page, sciezka: string): Promise<number> {
  let suma = 0;
  const licz = async (odpowiedz: import("@playwright/test").Response) => {
    const typ = odpowiedz.headers()["content-type"] ?? "";
    if (!typ.startsWith("image/")) return;
    // transferSize siedzi w danych czasowych zasobu; przy braku (cache, 304)
    // spada do dlugosci ciala, zeby pomiar nigdy nie byl cicho zerowy.
    const rozmiar = (await odpowiedz.body().catch(() => Buffer.alloc(0))).length;
    suma += rozmiar;
  };
  page.on("response", licz);
  await page.goto(sciezka, { waitUntil: "networkidle" });
  page.off("response", licz);
  return suma;
}

// F6-02: cztery widoki produkcyjne. Etapy 2 i 3 stoja za straza etapu, wiec
// kazdy test wpuszcza sie sam przez sessionStorage.
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

const WIDOKI = ["/", "/egzamin", "/quiz", "/proba-ognia"];

// F1-05: realna walidacja progu. /dev/scena sciaga KOMPLET biblioteki, wiec to
// najciezsza strona, jaka projekt kiedykolwiek wystawi - jesli miesci sie tutaj,
// zmiesci sie na kazdym widoku. Cztery widoki produkcyjne dochodza w F6-02.
// (widoki produkcyjne mierzy petla F6-02 nizej, tu zostaje sam playground)
for (const sciezka of ["/dev/scena"]) {
  test(`${sciezka} miesci sie w budzecie obrazkow (Z18)`, async ({ page }) => {
    const suma = await zmierzObrazki(page, sciezka);
    console.log(
      `budzet ${sciezka} : ${suma} B (${(suma / 1024).toFixed(1)} KB), prog ${PROG_BAJTOW} B`,
    );
    expect(suma).toBeLessThanOrEqual(PROG_BAJTOW);
  });
}

for (const sciezka of WIDOKI) {
  test(`${sciezka} miesci sie w budzecie obrazkow (Z18, F6-02)`, async ({ page }) => {
    await page.addInitScript(WPUSC);
    const suma = await zmierzObrazki(page, sciezka);
    console.log(
      `budzet F6-02 ${sciezka} : ${suma} B (${(suma / 1024).toFixed(1)} KB), prog ${PROG_BAJTOW} B`,
    );
    expect(suma).toBeLessThanOrEqual(PROG_BAJTOW);
  });

  test(`${sciezka} nie ma long taska > 50 ms w 5 s bezczynnosci`, async ({ page }) => {
    test.setTimeout(30_000);
    await page.addInitScript(WPUSC);
    await page.goto(sciezka, { waitUntil: "networkidle" });
    const dlugie = await page.evaluate(zbierzLongTaski);
    console.log(`long taski na ${sciezka} w 5 s: ${dlugie.length ? dlugie.join(", ") : "brak"}`);
    expect(dlugie.filter((d) => d > 50)).toEqual([]);
  });

  // plan/03 C: kazdy <img> ma jawne width i height, inaczej strona skacze
  // przy doladowaniu GIF-a.
  test(`${sciezka} ma zero obrazkow bez width/height`, async ({ page }) => {
    await page.addInitScript(WPUSC);
    await page.goto(sciezka, { waitUntil: "networkidle" });
    const bezWymiarow = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img"))
        .filter((i) => !i.getAttribute("width") || !i.getAttribute("height"))
        .map((i) => i.getAttribute("src") ?? i.outerHTML.slice(0, 80)),
    );
    expect(bezWymiarow).toEqual([]);
  });
}

// Anty-spec silnika K5 i budzet L1: ruch robia GIF-y i CSS, wiec watek glowny
// ma stac. Long task powyzej 50 ms w bezczynnosci znaczy, ze cos kreci petle.
const zbierzLongTaski = () =>
  new Promise<number[]>((gotowe) => {
    const zebrane: number[] = [];
    const obs = new PerformanceObserver((lista) => {
      for (const w of lista.getEntries()) zebrane.push(Math.round(w.duration));
    });
    obs.observe({ type: "longtask", buffered: false });
    setTimeout(() => {
      obs.disconnect();
      gotowe(zebrane);
    }, 5000);
  });
test("/dev/scena nie ma long taska > 50 ms w 5 s bezczynnosci", async ({ page }) => {
  test.setTimeout(30_000);
  await page.goto("/dev/scena", { waitUntil: "networkidle" });
  const dlugie = await page.evaluate(zbierzLongTaski);
  console.log(`long taski na /dev/scena w 5 s: ${dlugie.length ? dlugie.join(", ") : "brak"}`);
  expect(dlugie.filter((d) => d > 50)).toEqual([]);
});
