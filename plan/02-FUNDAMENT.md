# 02 - FUNDAMENT: STACK, TOKENY, DANE KANONICZNE, KONWENCJE

## A. STACK (dokładny, bez wariantów)

- **Next.js 15 (App Router), TypeScript, React 19.** Scaffold: `pnpm create next-app@latest . --ts --app --no-tailwind --no-eslint --src-dir=false --import-alias "@/*"` bez ESLinta.
- **Zależności runtime: dokładnie next, react, react-dom, @vercel/blob** (Z6; @vercel/blob
  dochodzi w F5-02, allowlist w walidatorze). DevDeps dozwolone: typescript,
  @playwright/test, @axe-core/playwright. ESLinta nie instalujemy (ponytail: tsc +
  walidator wystarczą).
- **Deploy: Vercel**, projekt `j-word-pass`, repo GitHub `Enkidu-png/j-word-pass` (prywatne? NIE - publiczne, nie ma nic wrażliwego poza env). Env produkcyjne: `OPENROUTER_API_KEY` (ustawiane przez `vercel env add`, nigdy w repo).
- **Struktura katalogów:**

```
app/
  layout.tsx          # shell: tokens.css, kursor-komisji, pass-o-metr, webring-stopki
  page.tsx            # Etap 0: brama (wejście)
  egzamin/page.tsx    # Etap 1
  quiz/page.tsx       # Etap 2
  proba-ognia/page.tsx# Etap 3
  api/ocena/route.ts  # POST: ocena egzaminu przez OpenRouter
  api/zgloszenie/route.ts # POST: zapis 1 pliku JSON per zgłoszenie do Vercel Blob (patrz D)
  tokens.css          # JEDYNE miejsce z literałami kolorów/rozmiarów (Z3)
  globals.css         # reset + klasy motywów wspólnych (gif-less, formularz-F7...)
components/           # PascalCase = nazwy ze słownika (PassOMetr.tsx, Pieczatka.tsx...)
lib/
  stan.ts             # sessionStorage jwp.v1: zapis/odczyt/typy
  animacje.ts         # pomocniki ceremonii (rAF, steps)
data/
  egzamin.json        # kanoniczne dane egzaminu
  quiz.json           # kanoniczne 15 pytań + klucz + signature
  komisja.json        # kwestie dialogowe komisji (teksty dymków)
scripts/
  lint-tokens.mjs     # walidator Z3 + walidacja danych kanonicznych
```

## B. TOKENY (`app/tokens.css` - wartości startowe, wolno tunować, nie wolno omijać)

Paleta: „urzędowo-jarmarczna". Kolory celowo za ostre, ale NAZWANE i używane spójnie.

```css
:root {
  /* kolory */
  --papier: #f4e9c8;        /* tło druków, pożółkły papier */
  --atrament: #1a1447;      /* tekst podstawowy, granat długopisu */
  --alarm: #ff2079;         /* magenta: błędy, kara śmierci, blink */
  --jad: #21f363;           /* zielony CRT: sukcesy, punkty */
  --urzad: #b3241a;         /* czerwień pieczątki */
  --kosmos: #0b0330;        /* tło sekcji kosmicznych (egzamin) */
  --chrom-a: #7df9ff; --chrom-b: #f6f186; --chrom-c: #ff9bf2; /* gradient chromowy nagłówków */
  --cien: #000000;          /* twardy cień, zawsze pełny czarny */
  --gwiazda: #ffffff;       /* kropki gwiazd w kafel--kosmos; też literał w data: URI kursora */
  --zebra-a: #f4e9c8; --zebra-b: #f6f186; /* biało-żółte pasy kafel--zebra (= papier/chrom-b) */
  /* typografia */
  --font-urzad: "Courier New", Courier, monospace;    /* druki, dane, formularze */
  --font-krzyk: Impact, "Arial Black", sans-serif;    /* nagłówki-krzyki */
  --font-glos: Georgia, "Times New Roman", serif;     /* narracja komisji */
  --rozmiar-krzyk: clamp(44px, 8vw, 96px);
  --rozmiar-tekst: 18px;
  --rozmiar-drobny: 13px;
  /* geometria */
  --cien-x: 4px; --cien-y: 4px;   /* twardy offset cienia (anty-spec D3) */
  --ramka: 4px double var(--atrament);
  /* ruch */
  --t-dekoracja: 800ms;  /* bazowy czas pętli gif-less */
  --t-ceremonia: 600ms;  /* bazowy krok ceremonii */
}
```

Czcionek webowych NIE ładujemy (Impact/Courier/Georgia są systemowe; brak requestu
do Google Fonts = zero CLS i zero zależności). Wyjątek dozwolony w F5 (polish), jeśli
worker uzna, że potrzebny jest font pikselowy: wtedy self-hosted woff2 w `public/`,
z fallbackiem, decyzja odnotowana w DECISIONS.md.

## C. DANE KANONICZNE (jedyne źródła prawdy, Z-jedno-źródło)

### C1. `data/egzamin.json`
```json
{
  "tytul": "EGZAMIN PAŃSTWOWY Z FIZYKI STOSOWANEJ NR F-7/BIS",
  "tresc": "Kto twoim zdaniem wygrałby pojedynek - 2000 zebr z jetpackami, ale biało-żółtych, czy 1 słoń z karabinem maszynowym na trąbie?",
  "zalozenia": [
    {"id": "kosmos", "tekst": "Pojedynek odbywa się w kosmosie."},
    {"id": "zebra-v", "tekst": "Prędkość zebry w kosmosie wynosi 300 km/h. Jetpacki mają zasięg około 1000 km (potem już tylko pęd)."},
    {"id": "slon-oko", "tekst": "Słoń ma sokole oko i 5000 naboi."},
    {"id": "slon-masa", "tekst": "Masa słonia wynosi około 10 t (elefantus gigantis)."},
    {"id": "zebra-cv", "tekst": "Jedna z zebr ma raka trzustki i skończyła akademię wojskową."},
    {"id": "odrzut", "tekst": "Przyjmujemy, że słoń przy każdym strzale przyspiesza o 1 km/h."}
  ],
  "polecenie": "Zastosuj odpowiednie wzory i udowodnij wynik.",
  "liczbaPodzadan": 1,
  "punktyMin": 6, "punktyMax": 10, "punktyPuste": 0
}
```
Uwaga wierności: treść zadania przepisana Z ZACHOWANIEM absurdu, ale z poprawioną
ortografią (`trszustki` -> `trzustki`, `zeber` -> `zebr`). Absurd merytoryczny zostaje w 100%.

### C2. `data/quiz.json`
15 pytań - PEŁNA treść kanoniczna w `plan/11-QUIZ-TRESC.md` (pytania, warianty,
kategorie, emoji źródłowe, klucz, signature). Przepisać 1:1 (treści wariantów bez zmian).
Schemat rekordu:
```json
{
  "id": 1, "kategoria": "Biologia", "emojiZrodlowe": "🐙",
  "typ": "abcd",                      // "abcd" | "otwarte" (pytanie 14: Mohsa)
  "pytanie": "Które z poniższych zdań jest prawdziwe?",
  "warianty": {"A": "...", "B": "...", "C": "...", "D": "..."},
  "poprawna": "B",
  "kluczOtwarte": null,               // dla typ=otwarte: ["mohsa", "skala mohsa"]
  "signature": "osmiornica-trzy-serca" // patrz 06-QUIZ.md sekcja D
}
```
Klucz odpowiedzi (z inputu): 1:B, 2:C, 3:A, 4:B, 5:A, 6:A, 7:A, 8:A, 9:A, 10:A, 11:A,
12:A, 13:A, 14:otwarte („Mohsa"), 15:A. Pytanie otwarte akceptuje dopasowanie
case-insensitive po `normalize("NFD")` bez diakrytyków do listy `kluczOtwarte`.

### C3. `data/komisja.json`
Kwestie trzech głów komisji (imiona: `PRZEWODNICZĄCY HIENIALIUSZ`, `SEKRETARZ OKOŃ`,
`CZŁONKINI Z URZĘDU`). Minimum 6 kwestii na stan: powitanie, czekanie, ocenianie,
werdykt-wysoki (9-10), werdykt-niski (6-8), werdykt-zero. Teksty pisze worker w F3
zgodnie z głosem z `01` sekcja A3 (pierwsza osoba, konkret, zero korpo).

### C4. Walidacja danych: `scripts/lint-tokens.mjs` waliduje też JSON-y:
quiz ma dokładnie 15 rekordów, każde `abcd` ma 4 warianty i `poprawna` w {A,B,C,D},
`signature` unikalne, `id` ciągłe 1-15. Wywołanie: `pnpm run check` (skrypt łączy
lint tokenów + walidację danych + `tsc --noEmit`). Nie podpinamy do CI ani `predeploy`;
`pnpm run check` uruchamia worker ręcznie per issue (AC). Walidator ma też allowlist
zależności runtime (next, react, react-dom, @vercel/blob) i ignoruje `app/vendor/**`
oraz wnętrza `url("data:...")`.

## D. ZAPIS ZGŁOSZEŃ (formularz, wariant „tylko zapis")

Decyzja użytkownika: tylko zapis + list w butelce, mail wysyłany ręcznie.
Realizacja bez dodatkowych usług: `app/api/zgloszenie/route.ts` robi POST do
**Vercel Blob** (`@vercel/blob` - DOZWOLONY wyjątek od Z6, bo to warstwa serwerowa,
nie UI; wpis w DECISIONS.md z góry zatwierdzony) - jeden plik JSON per zgłoszenie:
`zgloszenia/<ISO-timestamp>-<losowe6>.json` z polami
`{email, rozmiarButa, srednicaUchaMm, punktyEgzamin, punktyQuiz, ts}`.
Wymaga `BLOB_READ_WRITE_TOKEN` (Vercel tworzy przy podpięciu Blob store w F0).
Fallback gdy env brak (lokalny dev): zapis do `console.log` + odpowiedź 200 z polem
`"tryb": "dev-log"` - formularz działa lokalnie bez tokenów.
Odczyt zgłoszeń: user wchodzi w dashboard Vercel Blob (nie budujemy panelu admina - YAGNI).

Walidacja serwerowa (granica zaufania, obowiązkowa): email regex `.+@.+\..+`,
rozmiarButa liczba 10-70, srednicaUchaMm liczba 5-500, payload ≤ 2 KB. Błąd -> 400
z komunikatem w stylu Komisji.

## E. KONWENCJE KODU

- Komponenty klienckie tylko tam, gdzie jest stan/interakcja (`"use client"` per plik).
  Strony renderują strukturę serwerowo, wyspy interaktywne jako komponenty.
- Nazwy plików komponentów = PascalCase nazwy słownika: `PassOMetr.tsx`, `Pieczatka.tsx`,
  `MaszynaPrawdy.tsx`, `ListWButelce.tsx`, `KartaDowodowa.tsx`, `Komisja.tsx`.
- Klasy CSS = kebab-case ze słownika: `.gif-less`, `.formularz-F7`, `.pasek-krawedzi`.
- Commity: `Fx-NN: opis` (per issue, konwencja z BACKLOG).
- Screenshoty dowodowe: `screenshots/Fx/` w repo (PNG z Playwright, viewport 1280x800
  oraz 390x844 dla mobile tam, gdzie AC tego wymaga).
- Playwright: `@playwright/test` w devDeps, `npx playwright install chromium` w F0-04
  (config: viewporty 1280x800 i 390x844, baseURL http://localhost:3000).
  Testy w `tests/` - używane jako narzędzie weryfikacji AC (screenshot + asercje),
  nie jako pełny suite regresyjny.

## F. POLITYKA KOPIOWANIA (przyspieszenie: gotowe bloki z GitHuba - dyrektywa usera)

Nie wynajdujemy kół. Workerzy AKTYWNIE kopiują gotowy kod open source zamiast pisać
od zera, na tych warunkach:

1. **Wolno kopiować (wklejka do repo, "vendoring"):** fragmenty CSS/JS/SVG z repozytoriów
   i serwisów na licencjach MIT/ISC/BSD/CC0/WTFPL - np. kolekcje animacji CSS
   (`animate.css` - wybrane keyframes, `css-loaders`), generatory patternów
   (`css-pattern`, MagicPattern), clip-arty SVG (openclipart CC0, SVG Repo z filtrem
   licencji), kursory/odznaki z kolekcji public domain, snippety z CodePen oznaczone
   MIT. Każda wklejka dostaje komentarz `/* src: <URL> (licencja) */` w miejscu użycia.
2. **Wolno całe biblioteki CSS jako JEDEN plik statyczny** (nie npm): `98.css` (MIT)
   lub `NES.css` (MIT) mogą zostać zvendorowane do `app/vendor/` i użyte selektywnie
   (np. okna/przyciski Windows 95 dla `pass-o-metr` i `formularz-F7`), BEZ towarzyszących
   plików fontów (binarki zakazane także w vendor; `98.css` używamy z naszym
   `--font-urzad`), pod warunkiem przemapowania kolorów na nasze tokeny (Z3 dotyczy NASZYCH komponentów; plik
   vendor jest wyłączony spod lint-tokens - wpisany na listę ignore skryptu).
3. **Nadal ZAKAZANE:** zależności npm runtime (Z6 bez zmian - kopiujemy pliki, nie
   instalujemy pakietów), kod GPL/AGPL (licencja wirusowa), kopiowanie całych stron
   1:1 (przejmujemy techniki i bloki, nie cudzy produkt), assety bez jasnej licencji.
4. **Priorytet szukania** przy każdym issue UI: (a) czy jest gotowy snippet/keyframes
   do wklejenia? (b) czy 98.css/NES.css ma ten komponent? (c) dopiero potem pisanie
   od zera. Wybór odnotowany jednym zdaniem w commit message.
5. Skopiowany ruch dekoracyjny MUSI zostać przestawiony na `steps()` (Z7) - easing
   z wklejki się wymienia, reszta zostaje.

## G. STAN `sessionStorage jwp.v1` (kontrakt `lib/stan.ts`)

Jeden klucz, jeden obiekt (zapis debounce 400 ms, odczyt przy mount):

```ts
type StanJWP = {
  v: 1;
  egzamin: { odpowiedz: string; zalaczone: string[];        // id kart w slotach
             punkty: number | null; komentarz: string | null } | null;
  quiz:    { odpowiedzi: Record<number, string>;            // id pytania -> "A".."D"/tekst
             punkty: number | null } | null;
  ogien:   { email: string; rozmiarButa: number | null; srednicaUchaMm: number | null;
             wyslano: boolean } | null;
};
```

`lib/stan.ts` eksportuje: `czytajStan()`, `zapiszStan(patch)` (merge płytki per etap),
`wyczyscStan()`. Wyłącznie sessionStorage (Z11); jedyny localStorage w projekcie to
`jwp.audio`. Suma do pergaminu: `(egzamin?.punkty ?? 0) + (quiz?.punkty ?? 0)` / 25.
