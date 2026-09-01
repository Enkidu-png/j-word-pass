# 02 - FUNDAMENT: STACK, CO ZOSTAJE, TOKENY, DANE

## A. STACK I REPO

- Next.js 15 App Router, React 19, TypeScript. Katalog: `~/repos/j-word-pass`.
- Repo: `Enkidu-png/j-word-pass` (public), deploy Vercel, projekt już podlinkowany.
- Zależności runtime: `next`, `react`, `react-dom`, `@vercel/blob`. Nic więcej (Z14).
- Komendy: `pnpm dev`, `pnpm build`, `pnpm run check`, `npx playwright test`.
- Menedżer: pnpm 11. Node 26. TypeScript **przypięty do `^5.9.3`** - TS 7 psuje Next 15.5.
- Konfiguracja to `next.config.mjs`, NIE `.ts` (patrz `DECISIONS.md` #2 z v1).

## B. CO ZOSTAJE Z WERSJI 1 (nie dotykać bez potrzeby)

Decyzja Aleksandry: „nowa skóra, stary szkielet". Te rzeczy są zweryfikowane
i działają na produkcji, przepisywanie ich to czysta strata:

| Plik | Rola | Zmiany dozwolone |
|---|---|---|
| `app/api/ocena/route.ts` | ocena egzaminu przez OpenRouter, clamp 6-10, sanitizeDash, limit 5/min | tylko treść promptu (zwrot do Aleksandry) |
| `app/api/zgloszenie/route.ts` | zapis do Vercel Blob, walidacja, limit 3/min, tryb dev-log | tylko komunikaty błędów (zwrot do Aleksandry) |
| `lib/limit.ts` | wspólny limiter z pulą per route | brak |
| `lib/stan.ts` | stan w `sessionStorage` pod `jwp.v1`, `zapiszStan` z debounce 400 ms, `zapiszTeraz` | brak |
| `lib/quiz.ts` | `normalizuj`, `ocenPytanie`, `policzQuiz`, dopasowanie odpowiedzi otwartej z pytania 14 | brak |
| `data/egzamin.json`, `data/quiz.json`, `data/komisja.json` | treść kanoniczna | treść tak, struktura nie |
| `scripts/lint-tokens.mjs` | walidator Z3, Z6-allowlist, kanon Z1/Z2/Z5, walidacja danych | rozszerzenie o Z6-zakaz-obrotu i Z9 |
| `playwright.config.ts` | dwa viewporty 1280x800 i 390x844 | brak |
| `tests/f5-02.spec.ts` | test kontraktu `/api/zgloszenie` | brak |
| `tests/f3-01.spec.ts` | test kontraktu `/api/ocena` | TAK: aktualizacja payloadu po usunięciu `zalaczoneDowody` (F3-01) |

## C. CO LECI DO KOSZA (usunięte w F0-02, bez litości)

Cała warstwa wizualna v1. Kasujemy pliki, nie komentujemy ich „na wszelki wypadek":

- `app/globals.css` i `app/tokens.css` - przepisywane od zera
- `app/page.tsx`, `app/egzamin/**`, `app/quiz/**`, `app/proba-ognia/**` - wszystkie widoki
- `components/**` - WSZYSTKIE osiem plików, wypisane z `git ls-files`:
  `KometaKursora.tsx`, `LicznikMechaniczny.tsx`, `PasekKrawedzi.tsx`, `PassOMetr.tsx`,
  `Pieczatka.tsx`, `RadioKomisji.tsx`, `StrazEtapu.tsx`, `WebringStopki.tsx`.
  Po czystce katalog `components/` jest PUSTY.
- `lib/animacje.ts` - silnik animacji v1, po czystce nikt go nie importuje
- `app/dev/**` (playground v1 razem z `layout.tsx`), `app/not-found.tsx`,
  `app/opengraph-image.tsx`, `app/icon.svg` - trzy ostatnie odtwarzane w F6-03
- `tests/f1-*.spec.ts`, `tests/f2-*.spec.ts`, `tests/f4-*.spec.ts`, `tests/f6-*.spec.ts`,
  `tests/f7-*.spec.ts` - testy nieistniejących już komponentów
- `screenshots/F1..F7/**` - dowody z poprzedniego buildu
- `NEXT-TASKS.md` i `WERYFIKACJA.md` - pochodzą z buildu v1 i KŁAMIĄ o stanie
  (mówią „fazy F0-F6 zamknięte"). Worker czyta `NEXT-TASKS.md` na starcie, więc
  zostawienie ich to gwarantowane zamieszanie. Kasujemy w F0-01.

`StrazEtapu` (blokada wejścia na etap bez ukończenia poprzedniego) i `PassOMetr`
odtwarzamy od zera w nowej skórze - logika była dobra, wygląd nie.

## D. TOKENY CSS (`app/tokens.css`) - paleta jaskrawa, nie stonowana

Referencja nie ma palety, ma zderzenia kolorów. Nasza paleta ma być czytelna
w druku i jaskrawa w ozdobnikach. Wartości startowe, kontrast zmierzony:

```css
:root {
  /* tła i płótna */
  --kosmos: #000018;        /* ciemne tło sekcji z gwiazdami */
  --papier: #f4f0e4;        /* podkład pod tekst czytany, kontrast 15,2:1 z --tusz */
  --tusz: #101010;          /* tekst czytany */
  --druk-tlo: #ffffff;      /* wnętrze formularzy */

  /* akcenty kiczu */
  --jad: #39ff14;           /* jadowita zieleń, TYLKO ozdobniki i ramki */
  --magenta: #ff00c8;       /* akcent 2, TYLKO ozdobniki */
  --cyjan: #00fff2;         /* akcent 3, TYLKO ozdobniki */
  --alarm: #cc0060;         /* błędy, kontrast 5,9:1 na --papier */
  --zloto: #ffd400;         /* wyróżnienia werdyktu */

  /* stopnie gradientu chromowego dla NapisObrazek (plan/04 D) */
  --chrom-1: #ffffff;
  --chrom-2: #dcdcdc;
  --chrom-3: #6e6e6e;
  --chrom-4: #303030;
  --chrom-5: #b0b0b0;
  --chrom-6: #f0f0f0;

  /* zar plonacego napisu (plan/04 E) */
  --zar: #ff6a00;
  --zar-poswiata: rgba(255, 106, 0, 0.55);
  --zar-poswiata-zero: rgba(255, 106, 0, 0);
  --zloto-mgla: rgba(255, 212, 0, 0.2);

  /* chrom i ramki */
  --chrom-a: #dcdcdc;
  --chrom-b: #6e6e6e;
  --ramka-jasna: #ffffff;
  --ramka-ciemna: #404040;
  --fokus: #ff00c8;

  /* typografia */
  --font-odreczny: "Caveat", "Comic Sans MS", cursive;
  --font-czytany: "Verdana", "Geneva", sans-serif;
  --font-terminal: "Courier New", monospace;
  --stopien-h1: 60px;
  --stopien-h1-duzy: 78px;
  --stopien-h2: 32px;
  --stopien-tresc: 18px;
  --stopien-drobny: 14px;
}
```

**Reguła kontrastu (Z10 + F6):** tekst czytany zawsze na `--papier` albo `--druk-tlo`,
nigdy bezpośrednio na kaflu. Jaskrawe tokeny (`--jad`, `--magenta`, `--cyjan`) są
zabronione jako kolor tekstu dłuższego niż 3 słowa.

**Fonty:** `Caveat` self-hostowany jako `woff2` w `public/fonts/` (F0-04), z `font-display:
swap` i fallbackiem `Comic Sans MS`. Zakaz ładowania z Google Fonts w runtime (Z14
dotyczy też zewnętrznych zasobów blokujących render).

## E. DANE KANONICZNE

Bez zmian strukturalnych względem v1. `data/egzamin.json`, `data/quiz.json`
(15 pytań), `data/komisja.json` (stany dymków + werdykty awaryjne).

**Kształt `data/egzamin.json` -> `zalozenia`** (sprawdzone w repo, NIE zmieniać):
tablica SZEŚCIU OBIEKTÓW `{ "id": "kosmos", "tekst": "Pojedynek odbywa się w kosmosie." }`.
`scripts/lint-tokens.mjs` sprawdza unikalność pola `id`. Kto zamieni to na tablicę
stringów, wywali `pnpm run check`.

**Nowy plik: `data/assety.json`** - manifest biblioteki assetów, jedyne źródło prawdy
o tym, co gdzie leży. Kontrakt w `03-BIBLIOTEKA-ASSETOW.md` sekcja D.

### E1. PROGI ZDANIA ETAPU (definicja, bez której `StrazEtapu` nie ma sensu)

`/api/ocena` klampuje punkty do przedziału 6-10, więc etapu 1 nie da się oblać
merytorycznie. To jest CELOWE: Komisja jest pompatyczna, ale łaskawa dla Aleksandry.
Definicja wiążąca:

| Etap | Zdany gdy | `NIEZDANE` pojawia się gdy |
|---|---|---|
| 1 egzamin | `punkty >= 6` | wyłącznie przy pustej odpowiedzi (werdykt 0/10) |
| 2 quiz | zawsze po oddaniu arkusza | nigdy; wynik `N/15` jest informacją, nie bramką |
| 3 próba ognia | po poprawnym wysłaniu druku | nie dotyczy |

`StrazEtapu` przepuszcza na `/quiz`, gdy w `sessionStorage` jest werdykt etapu 1
z `punkty >= 6`; na `/proba-ognia`, gdy jest wynik quizu (dowolny). Pusta odpowiedź
w etapie 1 zostawia bramkę zamkniętą i to jest jedyny sposób, żeby utknąć.

**Zmiana treści (nie struktury):** wszystkie stringi widoczne dla Aleksandry
przechodzą na zwrot bezpośredni (Z16). To dotyczy `data/komisja.json`,
`data/egzamin.json`, promptu systemowego w `/api/ocena` i wszystkich komunikatów
walidacji w `/api/zgloszenie`.

## F. KONWENCJE KODU

- Komponenty w `components/`, jeden plik = jeden komponent, nazwy po polsku bez
  polskich znaków (`PasGoniec`, `StworRogowy`, `NapisObrazek`).
- Wszystkie style w `app/globals.css` plus pliki `app/style/<obszar>.css` importowane
  do `globals.css`. Zero CSS-in-JS, zero modułów CSS (jeden mechanizm, nie trzy).
- Klasy CSS po polsku bez znaków diakrytycznych, w konwencji BEM-lite:
  `.stwor-rogowy`, `.stwor-rogowy--lustro`, `.pas--gorny`.
- `route.ts` w Next.js NIE MOŻE eksportować nic poza handlerami i konfiguracją
  segmentu. `tsc --noEmit` tego nie łapie, wywala dopiero `pnpm build`.
- Commit: `Fx-NN: opis` po polsku bez znaków diakrytycznych, jeden per issue.

## G. PUŁAPKI ŚRODOWISKOWE (zmierzone w buildzie v1, nie tracić na nie czasu ponownie)

1. `pnpm build` NADPISUJE `.next` i psuje działający `pnpm dev` (potem 500/404 i brak
   hydracji). Kolejność zawsze: testy, potem build, potem restart dev.
2. `reuseExistingServer: true` w `playwright.config.ts` potrafi serwować STARĄ stronę
   i dać fałszywe „failed" przy poprawnym kodzie. Przy niewytłumaczalnych failach:
   ubij dev server i wystartuj świeży.
3. Wyścig z hydracją: `fill()` przed hydracją bywa nadpisany przez `useEffect`
   czytający `sessionStorage`. To realny błąd, naprawiany w kodzie (wartość z DOM ma
   pierwszeństwo, CTA `disabled` do hydracji), nie w teście.
4. Playwright MCP startuje na kanale `chrome`, którego nie ma na tej maszynie. Do
   zrzutów używać `npx playwright test` albo `chrome-headless-shell`.
5. Komendy `vercel blob` wymagają jawnego `--rw-token` (token z `vercel env pull`
   do pliku tymczasowego). Sama zmienna `VERCEL_OIDC_TOKEN` nie wystarcza.
6. **Narzędzia graficzne, stan zmierzony na tej maszynie 2026-09-02:** `gifsicle`
   BRAK, `magick`/`convert` BRAK, `ffmpeg` BRAK. Dostępne: `curl`, `sips`, `python3`,
   `jq`. `sips` czyta wymiary (`sips -g pixelWidth -g pixelHeight`) i robi klatkę
   statyczną z GIF-a (`sips -s format png`), ale **nie umie przeskalować ani
   zoptymalizować animowanego GIF-a bez spłaszczenia go do jednej klatki**.
   Konsekwencja dla `plan/03`: nie skalujemy animowanych plików, tylko odrzucamy
   te za duże i szukamy innych. Zakaz instalowania czegokolwiek przez `brew`
   bez zgody Aleksandry (to jej maszyna, nie środowisko CI).
7. Poza produkcją `/api/zgloszenie` NIE pisze do Bloba (inaczej każdy przebieg testów
   zaśmieca płatny store - w v1 uzbierało się 332 pliki).
