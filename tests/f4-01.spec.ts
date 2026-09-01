import { test, expect } from "@playwright/test";
import pytania from "../data/quiz.json";

// AC F4-01: 15 teczek przechodnych klawiatura, F5 w polowie przywraca zaznaczenia,
// pytanie 14 przyjmuje mohsa / Mohsa / skala Mohsa; negatywne: zero emoji w DOM,
// zero natychmiastowego feedbacku poprawnosci.

// Straz etapu (Z15) wisi na /quiz dopoki etap 1 nie ma werdyktu - w testach quizu
// wpisujemy gotowy stan egzaminu, zeby druk nie zaslanial segregatora.
// Uwaga: skrypt startowy odpala sie TAKZE przy reloadzie, wiec nie wolno mu
// nadpisywac stanu - inaczej test zapisu quizu kasowalby to, co sprawdza.
const WPUSC = () => {
  if (window.sessionStorage.getItem("jwp.v1")) return;
  window.sessionStorage.setItem(
    "jwp.v1",
    JSON.stringify({
      v: 1,
      egzamin: { odpowiedz: "cokolwiek", zalaczone: [], punkty: 8, komentarz: "ok" },
      quiz: null,
      ogien: null,
    }),
  );
};

test("15 teczek: kazda otwieralna klawiatura, fokus laduje na naglowku akt", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await expect(page.locator("[data-zakladka]")).toHaveCount(15);

  // strzalka w dol przechodzi przez caly stos: 1 -> 15
  await page.locator('[data-zakladka="1"]').focus();
  for (let i = 2; i <= 15; i++) {
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("[data-teczka]")).toHaveAttribute("data-teczka", String(i));
    await expect(page.locator("[data-naglowek-teczki]")).toBeFocused();
    await expect(page.locator("[data-naglowek-teczki]")).toContainText(
      `AKTA NR ${String(i).padStart(2, "0")}/15`,
    );
  }
  // i z powrotem w gore
  await page.keyboard.press("ArrowUp");
  await expect(page.locator("[data-teczka]")).toHaveAttribute("data-teczka", "14");

  // przyciski nawigacji i klik w zakladke daja to samo
  await page.locator('[data-zakladka="3"]').click();
  await expect(page.locator("[data-teczka]")).toHaveAttribute("data-teczka", "3");
  await page.locator("[data-nastepna]").click();
  await expect(page.locator("[data-teczka]")).toHaveAttribute("data-teczka", "4");
  await page.locator("[data-poprzednia]").click();
  await expect(page.locator("[data-teczka]")).toHaveAttribute("data-teczka", "3");

  // wariant da sie zaznaczyc sama klawiatura (Tab do listy, potem strzalka)
  await page.locator('[data-zakladka="1"]').click();
  await page.locator('input[data-wariant="A"]').focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('input[data-wariant="B"]')).toBeChecked();
});

test("F5 w polowie przywraca zaznaczenia i stemple WYPELNIONO", async ({ page }, info) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");

  const wybory: [number, string][] = [
    [2, "C"],
    [5, "A"],
    [9, "D"],
  ];
  for (const [id, w] of wybory) {
    await page.locator(`[data-zakladka="${id}"]`).click();
    // klikamy etykiete, tak jak kandydat - samo radio siedzi w .tylko-dla-czytnika
    await page.locator(`[data-wariant-etykieta="${w}"]`).click();
    await expect(page.locator(`input[data-wariant="${w}"]`)).toBeChecked();
    await expect(page.locator(`[data-zakladka="${id}"]`)).toHaveAttribute("data-wypelniono", "tak");
  }
  // pytanie 14 tez ma przezyc reload
  await page.locator('[data-zakladka="14"]').click();
  await page.locator("[data-luka]").fill("skala Mohsa");
  await page.waitForTimeout(600); // debounce zapisu 400 ms (plan/02 G)

  await page.reload();

  for (const [id, w] of wybory) {
    await expect(page.locator(`[data-zakladka="${id}"]`)).toHaveAttribute("data-wypelniono", "tak");
    await page.locator(`[data-zakladka="${id}"]`).click();
    await expect(page.locator(`input[data-wariant="${w}"]`)).toBeChecked();
  }
  await page.locator('[data-zakladka="14"]').click();
  await expect(page.locator("[data-luka]")).toHaveValue("skala Mohsa");
  await expect(page.locator("[data-zakladka='14']")).toHaveAttribute("data-wypelniono", "tak");

  await page.screenshot({ path: `screenshots/F4/F4-01-segregator-${info.project.name}.png`, fullPage: true });
});

test("pytanie 14: mohsa / Mohsa / skala Mohsa sa przyjmowane, smiecie nie", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");
  await page.locator('[data-zakladka="14"]').click();
  const luka = page.locator("[data-luka]");
  const znacznik = page.locator("[data-otwarte-trafione]");

  for (const dobre of ["mohsa", "Mohsa", "skala Mohsa", "  SKALA   MOHSA  "]) {
    await luka.fill(dobre);
    await expect(znacznik).toHaveAttribute("data-otwarte-trafione", "tak");
  }
  for (const zle of ["", "moss", "richtera", "skala"]) {
    await luka.fill(zle);
    await expect(znacznik).toHaveAttribute("data-otwarte-trafione", "nie");
  }
});

test("negatywne: zero emoji w DOM i zero feedbacku poprawnosci przy zaznaczaniu", async ({ page }) => {
  await page.addInitScript(WPUSC);
  await page.goto("/quiz");

  // zaznaczamy blednie WSZEDZIE, gdzie sie da, i patrzymy czy cokolwiek reaguje
  for (const p of pytania) {
    if (p.typ !== "abcd") continue;
    const zly = (["A", "B", "C", "D"] as const).find((w) => w !== p.poprawna)!;
    await page.locator(`[data-zakladka="${p.id}"]`).click();
    await page.locator(`[data-wariant-etykieta="${zly}"]`).click();
    // klucz odpowiedzi nie moze wyciec do DOM zadnym atrybutem
    expect(await page.locator(`[data-teczka] [data-poprawna], [data-teczka] [data-bledna]`).count()).toBe(0);
  }
  const html = await page.content();
  expect(html).not.toMatch(/POPRAWN|BŁĄD|BLAD|ŹLE|DOBRZE|PUNKT/i);

  // Z4: zero emoji w wyrenderowanym HTML (zakresy piktogramow i dingbatow)
  const emoji =
    html.match(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu,
    ) ?? [];
  expect(emoji).toEqual([]);
});
