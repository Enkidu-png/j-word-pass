import { test, expect } from "@playwright/test";
import { wejdz } from "./pomoc";

// AC F6-04 (plan/01 E: Z7, Z8, Z9; plan/01 G). Samoocena gestosci i charakteru.
// Pomiary robi przegladarka na zywym widoku, tabela ladu w logu testu.

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

const POLICZ = () => {
  const widoczny = (e: Element) => {
    const b = e.getBoundingClientRect();
    return b.width > 0 && b.height > 0;
  };
  const kafel = getComputedStyle(document.documentElement).backgroundImage.match(
    /kafel-[a-z0-9-]+/,
  );
  return {
    // animowane: GIF-y z manifestu, pasy (tlo z GIF-a) i gonce (<marquee> CSS-owy)
    animowane:
      [...document.querySelectorAll("img[data-ozdoba]")].filter(widoczny).length +
      [...document.querySelectorAll("[data-pas]")].filter(widoczny).length +
      [...document.querySelectorAll(".pas-goniec")].filter(widoczny).length,
    ozdoby: [...document.querySelectorAll("img[data-ozdoba]")].filter(widoczny).length,
    stwory: [...document.querySelectorAll("[data-stwor]")].filter(widoczny).length,
    pasy: [...document.querySelectorAll("[data-pas]")].filter(widoczny).length,
    gonce: [...document.querySelectorAll(".pas-goniec")].filter(widoczny).length,
    kafel: kafel ? kafel[0] : "BRAK",
  };
};

// anty-spec 4, 5, 6: maszynowo sprawdzalne punkty charakteru
const CHARAKTER = () => {
  const grzechy: string[] = [];
  for (const e of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
    const b = e.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    const s = getComputedStyle(e);
    const opis = `${e.tagName.toLowerCase()}.${e.className || "-"}`.slice(0, 50);
    // 4: zero border-radius powyzej 4 px
    for (const r of [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomLeftRadius, s.borderBottomRightRadius]) {
      if (r.endsWith("px") && parseFloat(r) > 4) grzechy.push(`anty-spec 4: ${opis} radius ${r}`);
    }
    // 5: zero cieni z rozmyciem (dozwolony twardy cien 2 px bez blur)
    if (s.boxShadow !== "none") {
      const liczby = s.boxShadow.match(/-?[\d.]+px/g) ?? [];
      const blur = liczby[2] ? parseFloat(liczby[2]) : 0;
      if (blur > 0) grzechy.push(`anty-spec 5: ${opis} box-shadow blur ${blur}px`);
    }
    // 6: ruch dekoracyjny skokowy, nie ease-in-out
    if (s.animationName !== "none" && /ease-in-out|cubic-bezier/.test(s.animationTimingFunction)) {
      grzechy.push(`anty-spec 6: ${opis} ${s.animationName} ${s.animationTimingFunction}`);
    }
    // Z6 zabrania OBROTU i SKOSU, nie skalowania ani przesuwania. W macierzy
    // matrix(a,b,c,d,e,f) obrot i skos siedza wylacznie w b i c, wiec dopoki
    // oba sa zerowe, element stoi pod katem prostym. Przesuwanie (marquee),
    // lustro scaleX(-1) i puls scaleY(1.06) przechodza; rotate i skew nie.
    if (s.transform !== "none") {
      const m = s.transform.match(/^matrix\(([^)]+)\)$/);
      const [, b2, c] = (m?.[1] ?? "").split(",").map((x) => parseFloat(x));
      if (m === null || b2 !== 0 || c !== 0) grzechy.push(`Z6: ${opis} transform ${s.transform}`);
    }
  }
  return [...new Set(grzechy)];
};

// anty-spec 7 i Z8: zaden pas w pionie szerszy niz 120 px nie moze byc pusty.
// Bierzemy elementy niosace tresc (tekst wlasny, obrazki, pasy) i szukamy
// dziur w sumie ich przedzialow pionowych.
const DZIURY = () => {
  const przedzialy: [number, number][] = [];
  for (const e of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
    const b = e.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    const tekst = Array.from(e.childNodes).some(
      (n) => n.nodeType === 3 && (n.textContent ?? "").trim() !== "",
    );
    const rzecz = e.tagName === "IMG" || e.tagName === "SVG" || e.hasAttribute("data-pas");
    if (!tekst && !rzecz) continue;
    przedzialy.push([b.top + window.scrollY, b.bottom + window.scrollY]);
  }
  przedzialy.sort((a, z) => a[0] - z[0]);
  const dziury: string[] = [];
  let koniec = 0;
  for (const [g, d] of przedzialy) {
    if (g - koniec > 120) dziury.push(`pusty pas ${Math.round(koniec)} - ${Math.round(g)} px`);
    koniec = Math.max(koniec, d);
  }
  return dziury;
};

// Uklad mierzymy dopiero, gdy fonty sa gotowe. Przy rownoleglym przebiegu
// suity `Caveat` doladowywal sie PO pierwszym pomiarze i wysokosci blokow
// jeszcze rosly - test dziur potrafil wtedy zobaczyc plachte, ktorej sekunde
// pozniej juz nie bylo.
async function ustabilizuj(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => document.fonts.status === "loaded");
  await page.evaluate(
    () => new Promise((g) => requestAnimationFrame(() => requestAnimationFrame(g))),
  );
}

const kafle: Record<string, string> = {};

for (const sciezka of WIDOKI) {
  test(`gestosc: ${sciezka} spelnia Z8 i Z9`, async ({ page }) => {
    await page.addInitScript(WPUSC);
    await wejdz(page, sciezka);
    await ustabilizuj(page);
    const l = await page.evaluate(POLICZ);
    console.log(
      `GESTOSC ${sciezka.padEnd(14)} animowane=${l.animowane} (ozdoby ${l.ozdoby}, pasy ${l.pasy}, gonce ${l.gonce}) stwory=${l.stwory} kafel=${l.kafel}`,
    );
    expect(l.animowane, "Z8: minimum 6 animowanych elementow").toBeGreaterThanOrEqual(6);
    expect(l.stwory, "Z8: minimum 2 stwory rogowe").toBeGreaterThanOrEqual(2);
    expect(l.pasy, "Z8: minimum 1 pas").toBeGreaterThanOrEqual(1);
    expect(l.kafel, "Z9: wlasny kafel tla").not.toBe("BRAK");
    kafle[sciezka] = l.kafel;
  });

  test(`charakter: ${sciezka} nie lamie anty-spec 4, 5, 6 ani Z6`, async ({ page }) => {
    await page.addInitScript(WPUSC);
    await wejdz(page, sciezka);
    await ustabilizuj(page);
    expect(await page.evaluate(CHARAKTER)).toEqual([]);
  });

  test(`gestosc: ${sciezka} nie ma pustego pasa > 120 px`, async ({ page }) => {
    await page.addInitScript(WPUSC);
    await wejdz(page, sciezka);
    await ustabilizuj(page);
    expect(await page.evaluate(DZIURY)).toEqual([]);
  });
}

test("Z9: piec widokow, piec ROZNYCH kafli", async ({ page }) => {
  const zebrane: Record<string, string> = {};
  for (const sciezka of WIDOKI) {
    await page.addInitScript(WPUSC);
    await wejdz(page, sciezka);
    zebrane[sciezka] = await page.evaluate(
      () =>
        getComputedStyle(document.documentElement).backgroundImage.match(/kafel-[a-z0-9-]+/)?.[0] ??
        "BRAK",
    );
  }
  console.log("KAFLE:", JSON.stringify(zebrane));
  expect(new Set(Object.values(zebrane)).size).toBe(WIDOKI.length);
});
