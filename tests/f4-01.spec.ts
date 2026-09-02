import { test, expect } from "@playwright/test";
import pytania from "../data/quiz.json";
import { dopasujOtwarte } from "../lib/quiz";

// AC F4-01 (plan/07 A, D, E). Karta pytania, nawigacja, rzad 15 kwadratow,
// zapis stanu. Quiz stoi za straza etapu, wiec kazdy test wpuszcza sie sam,
// wkladajac do sessionStorage zdany egzamin.

const WPUSC = () => {
  // tylko gdy pusto: `addInitScript` odpala sie takze przy `page.reload()`,
  // a nadpisanie skasowaloby zaznaczenia, ktore ten test wlasnie sprawdza
  if (window.sessionStorage.getItem("jwp.v1")) return;
  window.sessionStorage.setItem(
    "jwp.v1",
    JSON.stringify({
      v: 1,
      // F9-04: etap 1 ma dwie czesci, wiec straz wpuszcza dopiero po OBU werdyktach
      egzamin: {
        odpowiedz: "x",
        zalaczone: [],
        punkty: 8,
        komentarz: "ok",
        odpowiedz2: "y",
        punkty2: 7,
        komentarz2: "ok2",
      },
      quiz: null,
      ogien: null,
    }),
  );
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(WPUSC);
});

test("wszystkie 15 pytan przechodne strzalka w prawo", async ({ page }) => {
  await page.goto("/quiz");
  const licznik = page.locator("[data-licznik-pytan]");
  await expect(licznik).toContainText("PYTANIE 01 / 15");
  for (let i = 2; i <= 15; i++) {
    await page.keyboard.press("ArrowRight");
    await expect(licznik).toContainText(`PYTANIE ${String(i).padStart(2, "0")} / 15`);
    await expect(page.locator(".karta__pytanie")).toHaveText(pytania[i - 1].pytanie);
  }
  // za ostatnim pytaniem strzalka nie wyjezdza poza arkusz
  await page.keyboard.press("ArrowRight");
  await expect(licznik).toContainText("PYTANIE 15 / 15");
  await page.keyboard.press("ArrowLeft");
  await expect(licznik).toContainText("PYTANIE 14 / 15");
});

test("klikniecie w kwadrat skacze do pytania", async ({ page }) => {
  await page.goto("/quiz");
  for (const nr of [9, 3, 15, 1]) {
    await page.locator(`[data-kwadrat='${nr}']`).click();
    await expect(page.locator("[data-licznik-pytan]")).toContainText(
      `PYTANIE ${String(nr).padStart(2, "0")} / 15`,
    );
    await expect(page.locator(".karta__pytanie")).toHaveText(pytania[nr - 1].pytanie);
  }
});

test("kwadraty sa fokusowalne i skacza z klawiatury", async ({ page }) => {
  await page.goto("/quiz");
  await page.locator("[data-kwadrat='7']").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-licznik-pytan]")).toContainText("PYTANIE 07 / 15");
});

test("trzy zaznaczenia wracaja po page.reload()", async ({ page }) => {
  await page.goto("/quiz");
  await page.locator("[data-wariant='B'] input").check();
  await page.locator("[data-kwadrat='2']").click();
  await page.locator("[data-wariant='D'] input").check();
  await page.locator("[data-kwadrat='5']").click();
  await page.locator("[data-wariant='A'] input").check();
  // zapis idzie z debounce 400 ms (plan/07 D)
  await expect
    .poll(() =>
      page.evaluate(
        () => Object.keys(JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}")?.quiz?.odpowiedzi ?? {}).length,
      ),
    )
    .toBe(3);

  await page.reload();
  await page.locator("[data-kwadrat='1']").click();
  await expect(page.locator("[data-wariant='B']")).toHaveAttribute("data-wybrany", "tak");
  await page.locator("[data-kwadrat='2']").click();
  await expect(page.locator("[data-wariant='D']")).toHaveAttribute("data-wybrany", "tak");
  await page.locator("[data-kwadrat='5']").click();
  await expect(page.locator("[data-wariant='A']")).toHaveAttribute("data-wybrany", "tak");
  await expect(page.locator("[data-wariant='B'] input")).not.toBeChecked();
});

test("pytanie 14 jest otwarte i przyjmuje mohsa, Mohsa oraz skala Mohsa", async ({ page }) => {
  await page.goto("/quiz");
  await page.locator("[data-kwadrat='14']").click();
  const pole = page.locator("[data-pole='otwarte']");
  await expect(pole).toBeVisible();
  await expect(page.locator(".wariant")).toHaveCount(0);

  const klucz = pytania[13].kluczOtwarte;
  for (const wpis of ["mohsa", "Mohsa", "skala Mohsa"]) {
    await pole.fill(wpis);
    await expect
      .poll(() =>
        page.evaluate(
          () => JSON.parse(sessionStorage.getItem("jwp.v1") ?? "{}")?.quiz?.odpowiedzi?.["14"],
        ),
      )
      .toBe(wpis);
    // ta sama funkcja liczy punkty w F4-03 (lib/quiz.ts)
    expect(dopasujOtwarte(wpis, klucz)).toBe(true);
  }
  expect(dopasujOtwarte("skala richtera", klucz)).toBe(false);
});

test("kwadrat odpowiedzianego pytania ma inny styl niz nieodpowiedzianego", async ({ page }) => {
  await page.goto("/quiz");
  const styl = (nr: number) =>
    page.locator(`[data-kwadrat='${nr}']`).evaluate((e) => {
      const cs = getComputedStyle(e);
      return `${cs.backgroundColor} ${cs.borderTopStyle}`;
    });
  const przed = await styl(1);
  await page.locator("[data-wariant='C'] input").check();
  await expect(page.locator("[data-kwadrat='1']")).toHaveAttribute("data-odpowiedziane", "tak");
  const po = await styl(1);
  const pusty = await styl(2);
  console.log(`kwadrat 1 przed: ${przed} | po: ${po} | kwadrat 2 pusty: ${pusty}`);
  expect(po).not.toBe(przed);
  expect(po).not.toBe(pusty);
});

test("negatywne: zero informacji o poprawnosci i zero emoji w DOM", async ({ page }) => {
  await page.goto("/quiz");
  for (const nr of [1, 8, 14, 15]) {
    await page.locator(`[data-kwadrat='${nr}']`).click();
    const podejrzane = await page.evaluate(() => {
      const wzor = /poprawn|niepoprawn|dobra|zla|blad|bledn|correct|wrong|prawda|falsz/i;
      return [...document.querySelectorAll("main.tresc *")]
        .filter((e) =>
          [...e.attributes].some((a) => wzor.test(a.name) || wzor.test(a.value)),
        )
        .map((e) => e.outerHTML.slice(0, 120));
    });
    expect(podejrzane).toEqual([]);
  }
  const emoji = await page.evaluate(() =>
    /\p{Extended_Pictographic}/u.test(document.querySelector("main.tresc")?.textContent ?? ""),
  );
  expect(emoji).toBe(false);
});

test("minimum 6 animowanych elementow i wlasny kafel tla (Z8, Z9)", async ({ page }) => {
  await page.goto("/quiz");
  await page.locator(".karta").waitFor();
  const ile = await page.evaluate(
    () =>
      [...document.querySelectorAll("main.tresc *")].filter((e) => {
        const cs = getComputedStyle(e);
        const src = e.getAttribute("src") ?? "";
        const tlo = cs.backgroundImage;
        return cs.animationName !== "none" || src.endsWith(".gif") || tlo.includes(".gif");
      }).length,
  );
  console.log(`animowanych elementow na /quiz: ${ile}`);
  expect(ile).toBeGreaterThanOrEqual(6);
  const kafel = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundImage);
  expect(kafel).toContain("kafel-quiz");
});

test("stwory rogowe nie leza na kwadratach ani na nawigacji", async ({ page }) => {
  await page.goto("/quiz");
  await expect(page.locator("[data-kwadrat]")).toHaveCount(15);
  const kolizje = await page.evaluate(() => {
    const zderzone: string[] = [];
    for (const cel of document.querySelectorAll("[data-kwadrat], [data-krok]")) {
      // bez przewiniecia elementFromPoint na elemencie pod zagieciem oddaje null
      cel.scrollIntoView({ block: "center" });
      const r = cel.getBoundingClientRect();
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (el !== cel && !cel.contains(el)) zderzone.push(cel.outerHTML.slice(0, 60));
    }
    return zderzone;
  });
  expect(kolizje).toEqual([]);
});
