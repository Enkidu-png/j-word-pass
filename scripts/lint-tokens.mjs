// Walidator projektu J-WORD PASS. Niezależne kontrole:
//   (a) Z3 - zero literałów kolorów i rozmiarów czcionki poza app/tokens.css
//   (b) Z14 - lista zależności runtime zamknięta
//   (c) Z6 - zakaz obrotu i skosu poza ekranem ładowania
//   (d) Z9 - kafel tła musi być PNG, oraz spójność data/assety.json
//   (e) spójność danych kanonicznych z data/ (aktywna, gdy pliki istnieją)
//   (f) Z1, Z2, Z5 - kanon typografii i ozdobników
// Uruchamiane przez `pnpm run check`. Exit 1 = lista naruszeń na stderr.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

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

/* ---------- (f) Z1, Z2, Z5: kanon typografii i ozdobnikow ---------- */

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

/* ---------- (b) Z14: allowlist zależności runtime ---------- */

const DOZWOLONE = ["next", "react", "react-dom", "@vercel/blob"];

function sprawdzZaleznosci() {
  const pkg = JSON.parse(readFileSync(join(KORZEN, "package.json"), "utf8"));
  for (const nazwa of Object.keys(pkg.dependencies ?? {})) {
    if (!DOZWOLONE.includes(nazwa)) {
      bledy.push(`package.json zależność runtime spoza allowlisty (Z14): ${nazwa}`);
    }
  }
}

/* ---------- (e) dane kanoniczne ---------- */

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

/* ---------- (c) Z6: zakaz obrotu i skosu ---------- */

// Z6 nie mial walidatora, a w buildzie v1 przekrzywione karty byly najczestszym
// nawrotem do generycznego szablonu. Wyjatki sa dokladnie dwa i sa wypisane
// z nazwy - ekran ladowania 3D to jedyne miejsce, gdzie obrot jest zamowiony
// wprost (plan/01 Z6 punkt b). `scaleX(-1)` i `scaleY(-1)` sa dozwolone
// (punkty a i c) i celowo NIE lapie ich ten wzorzec.
const OBROT = /\b(rotate|rotate3d|rotateX|rotateY|rotateZ|skew)\s*\(/;

const OBROT_WYJATKI = [
  join("components", "scena", "EkranLadowania.tsx"),
  join("app", "style", "ladowanie.css"),
];

function sprawdzObrot() {
  const pliki = [
    ...plikiRek(join(KORZEN, "app"), [".css", ".ts", ".tsx"]),
    ...plikiRek(join(KORZEN, "components"), [".css", ".ts", ".tsx"]),
  ].filter((p) => !OBROT_WYJATKI.includes(relative(KORZEN, p)));

  for (const plik of pliki) {
    const linie = bezKomentarzy(readFileSync(plik, "utf8")).split("\n");
    const oryginal = readFileSync(plik, "utf8").split("\n");
    linie.forEach((linia, i) => {
      if (!OBROT.test(linia)) return;
      const gdzie = `${relative(KORZEN, plik)}:${i + 1}`;
      bledy.push(`${gdzie} Z6 obrot: ${(oryginal[i] ?? linia).trim()}`);
    });
  }
}

/* ---------- (d) manifest assetow (plan/03 D) ---------- */

// Kanoniczna tabela id z plan/03 D1. Zakaz wymyslania id spoza listy: nowy motyw
// najpierw laduje w planie, dopiero potem w manifescie.
const ID_KANONICZNE = {
  ozdoba: `statek statek-wir ogien planeta strzalka-dol nowe stwor-osmiornica stwor-ptak
    stwor-mlotek stwor-slimak stwor-zegar stwor-kropla stwor-kosc stwor-mysz stwor-dyskietka
    stwor-nuta stwor-kula-ziemska stwor-krysztal stwor-gwiazdka stwor-koperta stwor-klodka
    stwor-strzalka stwor-kot stwor-but stwor-ucho stwor-butelka stwor-delfin stwor-hotdog
    stwor-reka stwor-klepsydra`,
  pas: "pas-budowa pas-balony pas-cienki",
  kafel: "kafel-brama kafel-egzamin kafel-quiz kafel-ogien kafel-404",
  plakietka: "plakietka-html plakietka-css plakietka-przegladarka",
  kursor: "kursor kursor-rece",
};

const ROLE = Object.keys(ID_KANONICZNE);

function sprawdzAssety() {
  const sciezka = join(KORZEN, "data", "assety.json");
  if (!existsSync(sciezka)) return; // manifest powstaje w F0-03a
  const manifest = JSON.parse(readFileSync(sciezka, "utf8"));
  if (!Array.isArray(manifest.pozycje)) {
    bledy.push("data/assety.json: brak tablicy \"pozycje\"");
    return;
  }

  const widzianeId = new Set();
  const uzytePliki = new Set();
  const uzyteKlatki = new Set();

  for (const [i, poz] of manifest.pozycje.entries()) {
    const gdzie = `data/assety.json[${i}] ${poz.id ?? "bez-id"}`;
    for (const pole of ["id", "plik", "szerokosc", "wysokosc", "opis", "rola"]) {
      if (poz[pole] === undefined) bledy.push(`${gdzie}: brak pola "${pole}"`);
    }
    if (widzianeId.has(poz.id)) bledy.push(`${gdzie}: id nie jest unikalne`);
    widzianeId.add(poz.id);

    if (!ROLE.includes(poz.rola)) {
      bledy.push(`${gdzie}: rola "${poz.rola}" spoza {${ROLE.join(", ")}}`);
    } else if (!ID_KANONICZNE[poz.rola].split(/\s+/).includes(poz.id)) {
      bledy.push(`${gdzie}: id spoza kanonicznej tabeli plan/03 D1 dla roli "${poz.rola}"`);
    }

    // Z9: kafel to PNG. Animowanego tla nie da sie zatrzymac przy reduced motion.
    if (poz.rola === "kafel" && String(poz.plik).toLowerCase().endsWith(".gif")) {
      bledy.push(`${gdzie}: Z9 kafel nie moze byc .gif`);
    }

    if (typeof poz.plik === "string") {
      uzytePliki.add(poz.plik);
      if (!existsSync(join(KORZEN, "public", poz.plik.replace(/^\//, "")))) {
        bledy.push(`${gdzie}: plik nie istnieje na dysku: ${poz.plik}`);
      }
    }

    // Z11: ozdoby i pasy musza miec klatke statyczna, kursor jest z niej zwolniony.
    if (poz.rola === "ozdoba" || poz.rola === "pas") {
      const klatka = poz["klatka-statyczna"];
      if (typeof klatka !== "string") {
        bledy.push(`${gdzie}: rola "${poz.rola}" wymaga pola "klatka-statyczna" (Z11)`);
      } else {
        uzyteKlatki.add(klatka);
        if (!existsSync(join(KORZEN, "public", klatka.replace(/^\//, "")))) {
          bledy.push(`${gdzie}: klatka-statyczna nie istnieje na dysku: ${klatka}`);
        }
      }
    }
  }

  // Kazdy plik w public/assets/ ma pozycje w manifescie; kazda klatka w statyczne/
  // jest przez ktoras pozycje wskazana. Inaczej biblioteka cicho puchnie.
  const katalog = join(KORZEN, "public", "assets");
  if (!existsSync(katalog)) return;
  for (const plik of plikiRek(katalog, [".gif", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".cur"])) {
    const url = `/${relative(join(KORZEN, "public"), plik).split(sep).join("/")}`;
    const wStatycznych = url.startsWith("/assets/statyczne/");
    if (wStatycznych && !uzyteKlatki.has(url)) {
      bledy.push(`public${url}: klatka statyczna, ktorej nie wskazuje zadna pozycja manifestu`);
    } else if (!wStatycznych && !uzytePliki.has(url)) {
      bledy.push(`public${url}: plik bez pozycji w data/assety.json`);
    }
  }
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
sprawdzObrot();
sprawdzZaleznosci();
sprawdzAssety();
sprawdzQuiz();
sprawdzEgzamin();
sprawdzKomisje();

if (bledy.length > 0) {
  console.error(`KOMISJA ODRZUCA KOD. NARUSZEŃ: ${bledy.length}`);
  for (const b of bledy) console.error(`  ${b}`);
  process.exit(1);
}
console.log("lint-tokens: czysto");
