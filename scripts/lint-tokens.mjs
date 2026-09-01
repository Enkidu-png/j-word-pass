// Walidator projektu J-WORD PASS. Trzy niezależne kontrole:
//   (a) Z3 - zero literałów kolorów i rozmiarów czcionki poza app/tokens.css
//   (b) Z6 - lista zależności runtime zamknięta
//   (c) spójność danych kanonicznych z data/ (aktywna, gdy pliki istnieją)
// Uruchamiane przez `pnpm run check`. Exit 1 = lista naruszeń na stderr.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const KORZEN = process.cwd();
const bledy = [];

/* ---------- pomocnicze ---------- */

function plikiRek(katalog, rozszerzenia) {
  if (!existsSync(katalog)) return [];
  const wynik = [];
  for (const wpis of readdirSync(katalog)) {
    const sciezka = join(katalog, wpis);
    if (statSync(sciezka).isDirectory()) {
      if (wpis === "node_modules" || wpis === "vendor") continue; // Z3 wyjątek (d)
      wynik.push(...plikiRek(sciezka, rozszerzenia));
    } else if (rozszerzenia.some((r) => wpis.endsWith(r))) {
      wynik.push(sciezka);
    }
  }
  return wynik;
}

// Z3 wyjątek (c): wnętrze url("data:...") nie podlega kontroli - var() tam nie działa.
function bezDataUri(linia) {
  return linia.replace(/url\(\s*(['"]?)data:[^)]*\1\s*\)/gi, 'url("data:USUNIETE")');
}

/* ---------- (a) Z3: literały kolorów i rozmiarów czcionki ---------- */

const NAZWY_KOLOROW = `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue
blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan
darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange
darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet
deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro
ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki
lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray
lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey
lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid
mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue
mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod
palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple
red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue
slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white
whitesmoke yellow yellowgreen`.split(/\s+/).filter(Boolean);

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const FUNKCJA_KOLORU = /\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/;
const NAZWANY = new RegExp(`:\\s*["']?(${NAZWY_KOLOROW.join("|")})\\b`);
// font-size / fontSize z wartością, która nie sięga po token
const ROZMIAR = /(font-size|fontSize)\s*:\s*(.+)$/;

function sprawdzZ3() {
  const pliki = [
    ...plikiRek(join(KORZEN, "app"), [".css", ".ts", ".tsx"]),
    ...plikiRek(join(KORZEN, "components"), [".css", ".ts", ".tsx"]),
  ].filter((p) => relative(KORZEN, p) !== join("app", "tokens.css"));

  for (const plik of pliki) {
    const linie = readFileSync(plik, "utf8").split("\n");
    linie.forEach((surowa, i) => {
      const linia = bezDataUri(surowa);
      const gdzie = `${relative(KORZEN, plik)}:${i + 1}`;
      if (HEX.test(linia)) bledy.push(`${gdzie} literał koloru (hex): ${surowa.trim()}`);
      else if (FUNKCJA_KOLORU.test(linia)) bledy.push(`${gdzie} literał koloru (funkcja): ${surowa.trim()}`);
      else if (NAZWANY.test(linia)) bledy.push(`${gdzie} literał koloru (nazwa): ${surowa.trim()}`);
      const m = linia.match(ROZMIAR);
      if (m && !m[2].includes("var(")) bledy.push(`${gdzie} literał rozmiaru czcionki: ${surowa.trim()}`);
    });
  }
}

/* ---------- (b) Z6: allowlist zależności runtime ---------- */

const DOZWOLONE = ["next", "react", "react-dom", "@vercel/blob"];

function sprawdzZaleznosci() {
  const pkg = JSON.parse(readFileSync(join(KORZEN, "package.json"), "utf8"));
  for (const nazwa of Object.keys(pkg.dependencies ?? {})) {
    if (!DOZWOLONE.includes(nazwa)) {
      bledy.push(`package.json zależność runtime spoza allowlisty (Z6): ${nazwa}`);
    }
  }
}

/* ---------- (c) dane kanoniczne ---------- */

const EMOJI = /\p{Extended_Pictographic}/u;

function sprawdzQuiz() {
  const sciezka = join(KORZEN, "data", "quiz.json");
  if (!existsSync(sciezka)) return;
  const quiz = JSON.parse(readFileSync(sciezka, "utf8"));
  if (!Array.isArray(quiz) || quiz.length !== 15) {
    bledy.push(`data/quiz.json: oczekiwano 15 rekordów, jest ${Array.isArray(quiz) ? quiz.length : "nie-tablica"}`);
    return;
  }
  const signatury = new Set();
  quiz.forEach((p, i) => {
    const gdzie = `data/quiz.json[${i}]`;
    if (p.id !== i + 1) bledy.push(`${gdzie}: id ${p.id}, oczekiwano ${i + 1} (ciągłość 1-15)`);
    if (!p.signature) bledy.push(`${gdzie}: brak signature`);
    else if (signatury.has(p.signature)) bledy.push(`${gdzie}: signature niepowtarzalne, duplikat "${p.signature}"`);
    else signatury.add(p.signature);
    if (p.typ === "abcd") {
      const klucze = Object.keys(p.warianty ?? {}).sort().join("");
      if (klucze !== "ABCD") bledy.push(`${gdzie}: warianty "${klucze}", oczekiwano ABCD`);
      if (!["A", "B", "C", "D"].includes(p.poprawna)) bledy.push(`${gdzie}: poprawna "${p.poprawna}" spoza {A,B,C,D}`);
    } else if (p.typ === "otwarte") {
      if (!Array.isArray(p.kluczOtwarte) || p.kluczOtwarte.length === 0) {
        bledy.push(`${gdzie}: typ otwarte bez kluczOtwarte`);
      }
    } else {
      bledy.push(`${gdzie}: typ "${p.typ}" spoza {abcd, otwarte}`);
    }
    // Z4: emoji wolno wyłącznie w polu emojiZrodlowe
    for (const [pole, wartosc] of Object.entries(p)) {
      if (pole === "emojiZrodlowe") continue;
      if (EMOJI.test(JSON.stringify(wartosc))) bledy.push(`${gdzie}: emoji w polu "${pole}" (Z4)`);
    }
  });
}

function sprawdzEgzamin() {
  const sciezka = join(KORZEN, "data", "egzamin.json");
  if (!existsSync(sciezka)) return;
  const e = JSON.parse(readFileSync(sciezka, "utf8"));
  for (const pole of ["tytul", "tresc", "zalozenia", "polecenie"]) {
    if (e[pole] === undefined) bledy.push(`data/egzamin.json: brak pola "${pole}"`);
  }
  if (Array.isArray(e.zalozenia)) {
    const ids = new Set(e.zalozenia.map((z) => z.id));
    if (ids.size !== e.zalozenia.length) bledy.push("data/egzamin.json: id założeń nie są unikalne");
  }
  if (EMOJI.test(JSON.stringify(e))) bledy.push("data/egzamin.json: emoji w danych (Z4)");
}

function sprawdzKomisje() {
  const sciezka = join(KORZEN, "data", "komisja.json");
  if (!existsSync(sciezka)) return;
  const k = JSON.parse(readFileSync(sciezka, "utf8"));
  const stany = ["powitanie", "czekanie", "ocenianie", "werdyktWysoki", "werdyktNiski", "werdyktZero"];
  for (const stan of stany) {
    if (!Array.isArray(k[stan]) || k[stan].length === 0) bledy.push(`data/komisja.json: brak kwestii dla stanu "${stan}"`);
  }
  if (!Array.isArray(k.werdyktAwaryjny) || k.werdyktAwaryjny.length < 5) {
    bledy.push("data/komisja.json: werdyktAwaryjny musi mieć co najmniej 5 wariantów");
  }
  if (EMOJI.test(JSON.stringify(k))) bledy.push("data/komisja.json: emoji w danych (Z4)");
}

/* ---------- start ---------- */

sprawdzZ3();
sprawdzZaleznosci();
sprawdzQuiz();
sprawdzEgzamin();
sprawdzKomisje();

if (bledy.length > 0) {
  console.error(`KOMISJA ODRZUCA KOD. NARUSZEŃ: ${bledy.length}`);
  for (const b of bledy) console.error(`  ${b}`);
  process.exit(1);
}
console.log("lint-tokens: czysto");
