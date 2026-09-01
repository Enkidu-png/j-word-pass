import { test, expect } from "@playwright/test";

// AC F2-04: stan przezywa reload (sessionStorage jwp.v1, debounce 400 ms);
// negatywne: localStorage pusty poza jwp.audio.

test("odpowiedz z /egzamin wraca po przeladowaniu", async ({ page }) => {
  await page.goto("/egzamin");
  const pole = page.locator("[data-pole-robocze]");
  await pole.fill("stal ma gestosc 7,85 g/cm3");

  // debounce 400 ms - zapis nastepuje dopiero po nim
  await expect
    .poll(() => page.evaluate(() => window.sessionStorage.getItem("jwp.v1")))
    .toContain("7,85");

  await page.reload();
  await expect(page.locator("[data-pole-robocze]")).toHaveValue("stal ma gestosc 7,85 g/cm3");

  const stan = await page.evaluate(() => JSON.parse(window.sessionStorage.getItem("jwp.v1")!));
  expect(stan.v).toBe(1);
  expect(stan.egzamin.odpowiedz).toBe("stal ma gestosc 7,85 g/cm3");
});

test("negatywne: localStorage nie dostaje nic poza jwp.audio", async ({ page }) => {
  await page.goto("/egzamin");
  await page.locator("[data-pole-robocze]").fill("cokolwiek");
  await expect
    .poll(() => page.evaluate(() => window.sessionStorage.getItem("jwp.v1")))
    .toContain("cokolwiek");

  const klucze = await page.evaluate(() => Object.keys(window.localStorage));
  expect(klucze.filter((k) => k !== "jwp.audio")).toEqual([]);
});
