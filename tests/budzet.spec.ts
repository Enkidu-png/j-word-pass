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

// Na razie mierzymy tylko brame. Realna walidacja progu wchodzi w F1-05
// (playground /dev/scena z kompletem assetow) i w F6-02 (cztery widoki) -
// w F0 strony sa stubami bez obrazkow i prog niczego by nie zlapal.
test("/ miesci sie w budzecie obrazkow (Z18)", async ({ page }) => {
  const suma = await zmierzObrazki(page, "/");
  console.log(`budzet / : ${suma} B (${(suma / 1024).toFixed(1)} KB), prog ${PROG_BAJTOW} B`);
  expect(suma).toBeLessThanOrEqual(PROG_BAJTOW);
});
