import { test, expect } from "@playwright/test";
import pytania from "../data/quiz.json";

// AC F4-03: pelna ceremonia <= 9 s, Esc = wszystkie werdykty naraz, nieodpowiedziane
// licza sie jako bledne po potwierdzeniu druku, rewizja (poprawna obwiedziona, bledna
// przekreslona), przejscie z plonacym samolocikiem <= 2,2 s na /proba-ognia,
// wynik w sessionStorage.

const WPUSC = () => {
  if (window.sessionStorage.getItem("jwp.v1")) return;
  window.sessionStorage.setItem(
    "jwp.v1",
    JSON.stringify({
      v: 1,
      egzamin: { odpowiedz: "x", zalaczone: [], punkty: 8, komentarz: "ok" },
      quiz: null,
      ogien: null,
    }),
  );
};

// Wypelnia caly quiz: `poprawnych` pierwszych pytan dobrze, reszte blednie.
async function wypelnij(page: import("@playwright/test").Page, poprawnych: number) {
  for (const [i, p] of pytania.entries()) {
    await page.locator(`[data-zakladka="${p.id}"]`).click();
    const dobrze = i < poprawnych;
    if (p.typ === "otwarte") {
      await page.locator("[data-luka]").fill(dobrze ? "skala Mohsa" : "richtera");
    } else {
      const w = dobrze
        ? (p.poprawna as string)
        : (["A", "B", "C", "D"] as const).find((x) => x !== p.poprawna)!;
      await page.locator(`[data-wariant-etykieta="${w}"]`).click();
    }
  }
  await page.waitForTimeout(600); // debounce zapisu
}

test("maszyna prawdy: cala ceremonia <= 9 s, licznik i pieczatka N/15", async ({ page }, info) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await wypelnij(page, 15);

  const start = Date.now();
  await page.locator("[data-oddaj]").click();
  // komplet odpowiedzi = zero pytania o braki
  await expect(page.locator("[data-potwierdzenie]")).toHaveCount(0);
  await expect(page.locator("[data-maszyna]")).toBeVisible();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `screenshots/F4/F4-03-maszyna-${info.project.name}.png`, fullPage: true });

  await expect(page.locator("[data-wynik]")).toHaveAttribute("data-wynik", "15", { timeout: 12_000 });
  const czas = Date.now() - start;
  expect(czas).toBeLessThanOrEqual(9000);

  await expect(page.locator("[data-wynik] .pieczatka svg")).toHaveAttribute("aria-label", "15/15");
  await expect(page.locator("[data-do-ognia]")).toBeFocused(); // Z9
  // zakladki barwia sie werdyktem
  expect(await page.locator('[data-zakladka][data-werdykt="prawda"]').count()).toBe(15);
  // wynik siedzi w sessionStorage
  expect(
    await page.evaluate(() => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}").quiz?.punkty),
  ).toBe(15);
});

test("Esc pomija teatr: wszystkie werdykty naraz", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await wypelnij(page, 10);

  await page.locator("[data-oddaj]").click();
  await expect(page.locator("[data-maszyna]")).toBeVisible();
  const start = Date.now();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-wynik]")).toHaveAttribute("data-wynik", "10", { timeout: 4000 });
  expect(Date.now() - start).toBeLessThan(1500);
  expect(await page.locator("[data-zakladka][data-werdykt]:not([data-werdykt=''])").count()).toBe(15);
});

test("nieodpowiedziane: druk o pustce, WRACAM wraca, NIECH SIE DZIEJE liczy je jako bledne", async ({
  page,
}) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  // tylko dwa pytania wypelnione, oba poprawnie
  for (const id of [1, 2]) {
    await page.locator(`[data-zakladka="${id}"]`).click();
    await page.locator(`[data-wariant-etykieta="${pytania[id - 1].poprawna}"]`).click();
  }

  await page.locator("[data-oddaj]").click();
  await expect(page.locator("[data-potwierdzenie]")).toBeVisible();
  await expect(page.locator(".segregator__druk")).toHaveText("CZY NA PEWNO? 13 TECZEK ŚWIECI PUSTKĄ");

  await page.locator("[data-wracam]").click();
  await expect(page.locator("[data-potwierdzenie]")).toHaveCount(0);
  await expect(page.locator("[data-maszyna]")).toHaveCount(0);

  await page.locator("[data-oddaj]").click();
  await page.locator("[data-niech-sie-dzieje]").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-wynik]")).toHaveAttribute("data-wynik", "2", { timeout: 4000 });
  expect(await page.locator('[data-zakladka][data-werdykt="pustka"]').count()).toBe(13);
});

test("rewizja: poprawna obwiedziona, wybrana bledna przekreslona", async ({ page }, info) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await wypelnij(page, 0); // wszystko zle, ale wypelnione
  await page.locator("[data-oddaj]").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-wynik]")).toHaveAttribute("data-wynik", "0", { timeout: 4000 });

  await page.locator('[data-zakladka="1"]').click();
  const poprawna = pytania[0].poprawna as string;
  await expect(page.locator(`[data-wariant-etykieta="${poprawna}"]`)).toHaveAttribute(
    "data-rewizja",
    "poprawna",
  );
  const wybrana = page.locator("[data-rewizja='bledna']");
  await expect(wybrana).toHaveCount(1);
  await expect(wybrana.locator(".wariant__skreslenie")).toBeVisible();
  // rewizja jest tylko do czytania - nie da sie zmienic odpowiedzi po werdykcie
  await expect(page.locator('input[data-wariant="A"]')).toBeDisabled();

  await page.locator('[data-zakladka="14"]').click();
  await expect(page.locator("[data-klucz]")).toContainText("mohsa");
  // pieczec wynikowa wbija sie 350 ms - bez tej pauzy zrzut lapie klatke posrednia
  // (stempel wielki i przezroczysty), co juz raz zmylilo ogledziny w F3
  await page.waitForTimeout(400);
  await page.screenshot({ path: `screenshots/F4/F4-03-rewizja-${info.project.name}.png`, fullPage: true });
});

test("przejscie do proby ognia <= 2,2 s prowadzi na /proba-ognia", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await wypelnij(page, 15);
  await page.locator("[data-oddaj]").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-wynik]")).toBeVisible({ timeout: 4000 });

  const start = Date.now();
  await page.locator("[data-do-ognia]").click();
  await expect(page.locator("[data-przejscie]")).toBeVisible();
  await expect(page.locator("[data-przejscie='plonie'] .podanie__plomienie")).toBeVisible({ timeout: 2000 });
  await page.waitForURL("**/proba-ognia", { timeout: 4000 });
  const czas = Date.now() - start;
  expect(czas).toBeLessThanOrEqual(2600); // 2,2 s ceremonii + narzut nawigacji
  // etap 2 zaliczony, wiec straz etapu nie zabrania wejscia na ogien
  await expect(page.locator("[data-straz]")).toHaveCount(0);
});

test("powrot na /quiz po werdykcie: od razu rewizja, zero ponownej ceremonii", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await wypelnij(page, 15);
  await page.locator("[data-oddaj]").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-wynik]")).toBeVisible({ timeout: 4000 });

  await page.reload();
  await expect(page.locator("[data-wynik]")).toHaveAttribute("data-wynik", "15");
  await expect(page.locator("[data-maszyna]")).toHaveCount(0);
  await expect(page.locator("[data-oddaj]")).toHaveCount(0);
  await expect(page.locator("[data-teczka] .wariant[data-rewizja='poprawna']")).toHaveCount(1);
});
