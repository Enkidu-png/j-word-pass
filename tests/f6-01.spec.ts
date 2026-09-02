import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { wejdz } from "./pomoc";

// AC F6-01 (plan/01 E: Z10, Z11; plan/02 D). Audyt dostepnosci.
// Cztery widoki produkcyjne plus 404. Etapy 2 i 3 stoja za straza etapu,
// wiec kazdy test wpuszcza sie sam przez sessionStorage.

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

const WIDOKI = ["/", "/egzamin", "/quiz", "/proba-ognia", "/nie-ma"];

// ---------- AC 2: axe-core, zero bledow `critical` ----------
for (const sciezka of WIDOKI) {
  test(`axe: ${sciezka} bez bledow critical`, async ({ page }) => {
    await page.addInitScript(WPUSC);
    await wejdz(page, sciezka);
    const wynik = await new AxeBuilder({ page }).analyze();
    const powazne = wynik.violations.filter((v) => v.impact === "critical");
    console.log(
      `axe ${sciezka}: critical=${powazne.length}, wszystkie=${wynik.violations.length} ` +
        `[${wynik.violations.map((v) => `${v.id}/${v.impact}x${v.nodes.length}`).join(", ")}]`,
    );
    expect(
      powazne.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`),
    ).toEqual([]);
  });
}

// ---------- AC 3: kontrast tekstu >= 4,5:1 na wlasnym tle ----------
// Pomiar na ZYWEJ stronie, nie z tabeli tokenow: bierzemy kazdy element
// niosacy wlasny tekst i szukamy pierwszego przodka z nieprzezroczystym tlem.
const ZMIERZ_KONTRAST = () => {
  const rozbij = (c: string): [number, number, number, number] => {
    const l = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0];
    return [l[0] ?? 0, l[1] ?? 0, l[2] ?? 0, l[3] ?? 1];
  };
  const lum = (r: number, g: number, b: number) => {
    const k = [r, g, b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
  };
  const tlo = (el: Element): { rgb: [number, number, number]; obrazek: boolean } | null => {
    let w: Element | null = el;
    while (w) {
      const s = getComputedStyle(w);
      const [r, g, b, a] = rozbij(s.backgroundColor);
      if (a > 0.95) return { rgb: [r, g, b], obrazek: s.backgroundImage !== "none" };
      if (s.backgroundImage !== "none") return null; // tekst wprost na kaflu
      w = w.parentElement;
    }
    return null;
  };
  const wynik: {
    tekst: string;
    sel: string;
    kolor: string;
    tlo: string;
    ratio: number;
    wylaczony: boolean;
  }[] = [];
  for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) < 0.1) continue;
    if (el.getBoundingClientRect().width === 0) continue;
    const wlasny = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent ?? "")
      .join("")
      .trim();
    if (!wlasny) continue;
    const t = tlo(el);
    const [r, g, b] = rozbij(s.color);
    const l1 = lum(r, g, b);
    const l2 = t ? lum(...t.rgb) : NaN;
    const ratio = t ? (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) : 0;
    wynik.push({
      tekst: wlasny.slice(0, 40),
      sel: `${el.tagName.toLowerCase()}.${el.className || "-"}`.slice(0, 60),
      kolor: s.color,
      tlo: t ? `rgb(${t.rgb.join(",")})` : "BRAK (tekst na kaflu)",
      ratio: Math.round(ratio * 100) / 100,
      // WCAG 1.4.3 wylacza spod progu kontrolki nieaktywne. Zostaja w tabeli
      // dowodowej, ale nie wywracaja asercji - szarosc JEST tu komunikatem.
      wylaczony:
        (el as HTMLButtonElement).disabled === true ||
        el.getAttribute("aria-disabled") === "true" ||
        el.closest("[disabled],[aria-disabled='true']") !== null,
    });
  }
  return wynik;
};

// F7-04: kontrast tekstu w zamknietym polu PassOMetr czeka na decyzje
// Aleksandry (konflikt spec kontra dostepnosc). Wylaczony z asercji, ale
// DALEJ raportowany w tabeli dowodowej.
const WYJATKI_F7_04 = ["pass-o-metr__pole"];

for (const sciezka of WIDOKI) {
  test(`kontrast: ${sciezka} kazdy tekst >= 4,5:1`, async ({ page }) => {
    await page.addInitScript(WPUSC);
    await wejdz(page, sciezka);
    const tabela = await page.evaluate(ZMIERZ_KONTRAST);
    console.log(`\n=== KONTRAST ${sciezka} ===`);
    for (const w of tabela) {
      console.log(`${String(w.ratio).padStart(6)}:1${w.wylaczony ? " [nieaktywny]" : ""}  ${w.sel}  ${w.kolor} na ${w.tlo}  "${w.tekst}"`);
    }
    const zle = tabela.filter(
      (w) => w.ratio < 4.5 && !w.wylaczony && !WYJATKI_F7_04.some((k) => w.sel.includes(k)),
    );
    expect(zle).toEqual([]);
  });
}

// ---------- AC 4: ozdobniki ----------
for (const sciezka of WIDOKI) {
  test(`ozdoby: ${sciezka} dekoracyjne maja alt="" i aria-hidden`, async ({ page }) => {
    await page.addInitScript(WPUSC);
    await wejdz(page, sciezka);
    const zle = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>("img[data-ozdoba]"))
        .map((i) => ({
          id: i.dataset.ozdoba ?? "",
          alt: i.getAttribute("alt"),
          ukryty: i.getAttribute("aria-hidden"),
        }))
        // dekoracyjny = alt puste; wtedy MUSI byc aria-hidden.
        // niosacy tresc = alt niepusty; wtedy aria-hidden byloby sprzecznoscia.
        .filter((o) =>
          o.alt === "" ? o.ukryty !== "true" : o.alt === null || o.ukryty === "true",
        ),
    );
    expect(zle).toEqual([]);
  });
}

// ---------- AC 5 (negatywne): zaden `outline: none` bez zamiennika ----------
test("zaden arkusz nie kasuje outline bez zamiennika", async ({ page }) => {
  await wejdz(page, "/");
  const grzechy = await page.evaluate(() => {
    const zle: string[] = [];
    const chodz = (lista: CSSRuleList) => {
      for (const r of Array.from(lista)) {
        if (r instanceof CSSGroupingRule) chodz(r.cssRules);
        if (!(r instanceof CSSStyleRule)) continue;
        const o = r.style.outline || r.style.outlineStyle || r.style.outlineWidth;
        const kasuje = /(^|\s)(none|0px|0)(\s|$)/.test(o) && o !== "";
        if (!kasuje) continue;
        const zamiennik =
          r.style.boxShadow !== "" || r.style.border !== "" || r.style.backgroundColor !== "";
        if (!zamiennik) zle.push(`${r.selectorText} { outline: ${o} }`);
      }
    };
    for (const a of Array.from(document.styleSheets)) {
      try {
        chodz(a.cssRules);
      } catch {
        /* arkusz z innego origin, nie nasz */
      }
    }
    return zle;
  });
  expect(grzechy).toEqual([]);
});

// ---------- AC 1: pelny przeplyw brama -> pergamin sama klawiatura ----------
async function tabDo(page: Page, selektor: string, limit = 80) {
  for (let i = 0; i < limit; i += 1) {
    // jeden round-trip na krok: sprawdzenie fokusu robi sama przegladarka
    if (await page.evaluate((s) => document.activeElement?.matches(s) === true, selektor)) return i;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Tab nie dotarl do ${selektor} w ${limit} krokach`);
}

// Fokus MUSI byc widoczny (Z10): outline szerszy od zera na aktywnym elemencie.
async function fokusWidoczny(page: Page) {
  const opis = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return "brak fokusu";
    const s = getComputedStyle(el);
    return `${el.tagName}.${(el as HTMLElement).className} outline=${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`;
  });
  // Z10 doslownie: obwodka kreskowana w kolorze --fokus, nigdy zerowa.
  expect(opis).toMatch(/outline=[1-9]\d*px dashed rgb\(255, 0, 200\)/);
  return opis;
}

test("przeplyw brama-pergamin sama klawiatura", async ({ page }) => {
  test.setTimeout(420_000);
  const kroki: string[] = [];
  await page.route("**/api/ocena", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ punkty: 9, komentarz: "ALEKSANDRO, KOMISJA UZNAJE." }),
    }),
  );
  await page.route("**/api/zgloszenie", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
  );

  // 1. BRAMA
  await wejdz(page, "/");
  await tabDo(page, "[data-cta='przystepuje']");
  kroki.push(`brama: Tab do PRZYSTĘPUJĘ, fokus ${await fokusWidoczny(page)}`);
  await page.keyboard.press("Enter");
  await page.waitForURL("**/egzamin");
  kroki.push("brama: Enter -> /egzamin");

  // 2. EGZAMIN
  await page.locator("[data-ladowanie]").waitFor({ state: "detached" }).catch(() => {});
  await tabDo(page, "textarea");
  kroki.push(`egzamin: Tab do pola odpowiedzi, fokus ${await fokusWidoczny(page)}`);
  await page.keyboard.type("Odpowiedz Aleksandry na pytanie komisji, dostatecznie dluga.");
  await tabDo(page, "[data-cta='oddaj']");
  kroki.push(`egzamin: Tab do ODDAJ, fokus ${await fokusWidoczny(page)}`);
  await page.keyboard.press("Enter");
  await page.locator("[data-cta='do-etapu-2']").waitFor({ timeout: 30_000 });
  kroki.push("egzamin: Enter -> werdykt 9/10");
  await tabDo(page, "[data-cta='do-etapu-2']");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/quiz");
  kroki.push("egzamin: Enter na PRZEJDŹ -> /quiz");

  // 3. QUIZ: 15 pytan, kazde z klawiatury
  await page.locator("[data-karta]").first().waitFor();
  for (let n = 1; n <= 15; n += 1) {
    const otwarte = page.locator("[data-pole='otwarte']");
    if (await otwarte.count()) {
      await tabDo(page, "[data-pole='otwarte']");
      await page.keyboard.type("odpowiedz");
    } else {
      await tabDo(page, "[data-wariant='A'] input");
      await page.keyboard.press("Space");
    }
    if (n < 15) {
      await tabDo(page, "[data-krok='nastepne']");
      await page.keyboard.press("Enter");
      await page.waitForFunction(
        (nr) => document.querySelector(`[data-kwadrat][data-biezacy='tak']`)?.getAttribute("data-kwadrat") !== String(nr),
        n,
      );
    }
  }
  kroki.push("quiz: 15 pytan wypelnionych klawiatura (Tab + Enter/typing)");
  await tabDo(page, "[data-cta='oddaj-arkusz']");
  kroki.push(`quiz: Tab do ODDAJ ARKUSZ, fokus ${await fokusWidoczny(page)}`);
  await page.keyboard.press("Enter");
  // ekran potwierdzenia wstaje TYLKO gdy zostaly pytania bez odpowiedzi
  if (await page.locator("[data-potwierdzenie]").count()) {
    await tabDo(page, "[data-cta='potwierdzam']");
    await page.keyboard.press("Enter");
    kroki.push("quiz: ekran potwierdzenia -> POTWIERDZAM");
  }
  await page.locator("[data-cta='do-etapu-3']").waitFor({ timeout: 30_000 });
  kroki.push("quiz: werdykt etapu 2");
  await tabDo(page, "[data-cta='do-etapu-3']");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/proba-ognia");
  kroki.push("quiz: Enter -> /proba-ognia");

  // 4. PROBA OGNIA
  await tabDo(page, "[data-pole='email']");
  kroki.push(`ogien: Tab do e-mail, fokus ${await fokusWidoczny(page)}`);
  await page.keyboard.type("aleksandra@example.com");
  await tabDo(page, "[data-pole='but']");
  await page.keyboard.type("38");
  await tabDo(page, "[data-pole='ucho']");
  await page.keyboard.type("14");
  await tabDo(page, "[data-pokora]");
  await page.keyboard.press("Space");
  await tabDo(page, "[data-cta='skladam']");
  kroki.push(`ogien: Tab do SKŁADAM, fokus ${await fokusWidoczny(page)}`);
  await page.keyboard.press("Enter");
  await page.locator("[data-butelka]").waitFor({ timeout: 30_000 });
  kroki.push("ogien: ceremonia spalenia -> butelka");

  // 5. PERGAMIN
  await tabDo(page, "[data-butelka]");
  kroki.push(`butelka: Tab do role="button", fokus ${await fokusWidoczny(page)}`);
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-pergamin]")).toBeVisible();
  kroki.push("butelka: Enter -> pergamin otwarty. KONIEC PRZEPŁYWU.");

  console.log("\n=== PRZEPŁYW KLAWIATURA ===\n" + kroki.map((k, i) => `${i + 1}. ${k}`).join("\n"));
});
