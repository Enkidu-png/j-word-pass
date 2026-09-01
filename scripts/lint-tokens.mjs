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

// KOMENTARZE NIE SĄ KODEM (znalezisko F7-02). Z3(c) każe wskazać token
// „w komentarzu obok" wartości z `data:` URI, a DoD faz dopuszcza literały koloru
// w nagłówku licencyjnym pliku vendor - jedno i drugie wywracało walidator.
// Treść komentarza znika, ale ZNAKI NOWEJ LINII zostają, żeby numery linii
// w komunikatach dalej wskazywały prawdziwe miejsce.
export function bezKomentarzy(tresc) {
  const bezBlokowych = tresc.replace(/\/\*[\s\S]*?\*\//g, (blok) => blok.replace(/[^\n]/g, " "));
  // `//` ucinamy tylko wtedy, gdy NIE jest częścią `://` - inaczej zjadłoby
  // resztę linii z adresem URL i schowało literał, który stoi za nim.
  return bezBlokowych.replace(/(^|[^:])\/\/[^\n]*/g, (_, przed) => przed);
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
  ]
    // Z3 wyjątek (a): paleta. Plus `opengraph-image.tsx`: satori z `next/og` nie
    // rozumie `var()`, więc obrazek OG MUSI mieć literały - te same, co w tokens.css.
    .filter((p) => {
      const wzgledna = relative(KORZEN, p);
      return wzgledna !== join("app", "tokens.css") && wzgledna !== join("app", "opengraph-image.tsx");
    });

  for (const plik of pliki) {
    const linie = bezKomentarzy(readFileSync(plik, "utf8")).split("\n");
    const oryginal = readFileSync(plik, "utf8").split("\n");
    linie.forEach((bezKom, i) => {
      const surowa = oryginal[i] ?? bezKom;
      const linia = bezDataUri(bezKom);
      const gdzie = `${relative(KORZEN, plik)}:${i + 1}`;
      if (HEX.test(linia)) bledy.push(`${gdzie} literał koloru (hex): ${surowa.trim()}`);
      else if (FUNKCJA_KOLORU.test(linia)) bledy.push(`${gdzie} literał koloru (funkcja): ${surowa.trim()}`);
      else if (NAZWANY.test(linia)) bledy.push(`${gdzie} literał koloru (nazwa): ${surowa.trim()}`);
      const m = linia.match(ROZMIAR);
      if (m && !m[2].includes("var(")) bledy.push(`${gdzie} literał rozmiaru czcionki: ${surowa.trim()}`);
    });
  }
}

/* ---------- (d) Z1, Z2, Z5: kanon typografii i ozdobnikow ---------- */

// Z3 mial walidator od poczatku, kanon nie mial zadnego - byl czysty wylacznie
// dzieki dyscyplinie autorow. Pierwszy nowy plik moglby go zlamac bez czerwieni.
const MYSLNIK = /[—–]/;
const SRODKOWA_KROPKA = /·/;
const PASEK_AKCENTU = /(border-left|borderLeft)\s*[:=]/;

function sprawdzKanon() {
  const pliki = [
    ...plikiRek(join(KORZEN, "app"), [".css", ".ts", ".tsx"]),
    ...plikiRek(join(KORZEN, "components"), [".css", ".ts", ".tsx"]),
  ]
    // Sanitizer w `ocena` MUSI zawierac te znaki - to on je wycina z odpowiedzi modelu.
    .filter((p) => relative(KORZEN, p) !== join("app", "api", "ocena", "route.ts"));

  for (const plik of pliki) {
    const linie = bezKomentarzy(readFileSync(plik, "utf8")).split("\n");
    const oryginal = readFileSync(plik, "utf8").split("\n");
    linie.forEach((linia, i) => {
      const surowa = (oryginal[i] ?? linia).trim();
      const gdzie = `${relative(KORZEN, plik)}:${i + 1}`;
      if (MYSLNIK.test(linia)) bledy.push(`${gdzie} Z2 dlugi mysnik w copy/UI: ${surowa}`);
      if (SRODKOWA_KROPKA.test(linia)) bledy.push(`${gdzie} Z1 srodkowa kropka jako ozdobnik: ${surowa}`);
      if (PASEK_AKCENTU.test(linia)) bledy.push(`${gdzie} Z5 lewy pasek akcentu: ${surowa}`);
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

/* ---------- samotest (F7-02) ---------- */
// `node scripts/lint-tokens.mjs --samotest` - najmniejszy sprawdzian, ktory pada,
// gdy strippera komentarzy ktos zepsuje. Bez frameworka, bez fixture'ow na dysku.

if (process.argv.includes("--samotest")) {
  const przypadki = [
    ["/* src: https://x.dev (MIT) tlo #ff2079 */\n.a { color: var(--alarm); }", false, "hex w komentarzu blokowym"],
    ["// tlo to #ff2079\nconst a = 1;", false, "hex w komentarzu liniowym"],
    [".a { color: #ff2079; }", true, "hex w kodzie"],
    ['const u = "https://x.dev/a"; const c = "#ff2079";', true, "hex za adresem z //"],
    ["/* wielolinijkowy\n   #ff2079 */\n.a { color: red2; }", false, "hex w komentarzu wieloliniowym"],
  ];
  let bledne = 0;
  for (const [wejscie, maZnalezc, opis] of przypadki) {
    const znalazl = HEX.test(bezKomentarzy(wejscie));
    if (znalazl !== maZnalezc) {
      console.error(`SAMOTEST PADL: ${opis} - oczekiwano ${maZnalezc}, jest ${znalazl}`);
      bledne += 1;
    }
  }
  // numeracja linii nie moze sie rozjechac po wycieciu komentarza
  const linie = bezKomentarzy("/* a\n   b */\n.c { color: #fff; }").split("\n");
  if (linie.length !== 3 || !HEX.test(linie[2])) {
    console.error("SAMOTEST PADL: komentarz zjadl znaki nowej linii");
    bledne += 1;
  }
  console.log(bledne === 0 ? "samotest: czysto" : `samotest: ${bledne} bledow`);
  process.exit(bledne === 0 ? 0 : 1);
}

/* ---------- start ---------- */

sprawdzZ3();
sprawdzKanon();
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
