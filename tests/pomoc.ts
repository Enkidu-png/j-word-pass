import type { Page, Response } from "@playwright/test";

// Ceremonia wejscia (F2-04) zaslania brame nakladka na 1200-2600 ms przy
// PIERWSZYM wejsciu w sesji, a Playwright daje kazdemu testowi swiezy kontekst,
// czyli swieza sesje. Testy, ktore mierza DOM zaraz po `goto`, musza jej
// poczekac - inaczej czytaja stan zaslonietej strony.
export async function wejdz(page: Page, sciezka = "/"): Promise<Response | null> {
  const odpowiedz = await page.goto(sciezka);
  if (new URL(page.url()).pathname === "/") {
    // Bariera hydracji. `PierwszeWejscie` stawia ten klucz w swoim efekcie, wiec
    // jego obecnosc znaczy, ze decyzja o ceremonii JUZ zapadla. Bez niej
    // `waitFor detached` przechodzil, ZANIM nakladka zdazyla sie zamontowac,
    // i test mierzyl brame chwile przed zaslonieciem jej ekranem ladowania.
    await page.waitForFunction(() => window.sessionStorage.getItem("jwp.ladowanie") === "1");
  }
  await page.locator("[data-ladowanie]").waitFor({ state: "detached", timeout: 15_000 });
  return odpowiedz;
}
