# 11 - BACKLOG (przebudowa v2)

## Reguły
- Kolejność ŚCIŚLE liniowa: pierwszy `[ ]` od góry jest następny. Zero rozgałęzień.
- Jedno issue = jeden commit `Fx-NN: opis`. Odhaczenie ZAWSZE z dowodem
  (`✓ <metoda>` albo `✓ screenshots/Fx/plik.png`).
- Faza F(n+1) dopiero po DoD F(n).
- `CZYTAJ:` = budżet czytania workera per issue. Worker NIE czyta całego pakietu.
- `⚠ HARD` = zadanie koncepcyjnie grube: na początku paczki, świeże okno.
- Labels: `infra` `assety` `silnik` `ui` `ai` `dane` `deploy` `a11y` `perf`.

## Definition of Done każdej fazy (AC6)
`pnpm run check` zielony, `pnpm build` zielony, `npx playwright test` bez failów,
zrzut ekranu stanu fazy w `screenshots/Fx/` **obejrzany i oceniony** względem Z7-Z9
i anty-spec z `plan/01 G`, wpis raportu fazy, zero znalezisk bez issue w F7-ZNALEZISKA.

---

## F0 - FUNDAMENT I CZYSTKA

- [x] **F0-01** `infra` Czystka: usunięcie całej warstwy wizualnej v1 wg listy `plan/02 C`, zostawienie tego, co wymienia `plan/02 B`. Kasujemy też `NEXT-TASKS.md` i `WERYFIKACJA.md` z v1 (kłamią o stanie: mówią „fazy F0-F6 zamknięte", a worker czyta NEXT-TASKS na starcie). Nowe puste `app/globals.css` i `app/tokens.css` z tokenami z `plan/02 D`. Cztery route'y renderują stub `<h1 tabIndex={-1}>`.
  CZYTAJ: 02→B, 02→C, 02→D.
  AC: `ls components/` = PUSTO; `ls lib/` = dokładnie `limit.ts stan.ts quiz.ts` (bez `animacje.ts`); `NEXT-TASKS.md` i `WERYFIKACJA.md` nie istnieją (`test ! -f`); `pnpm dev` serwuje `/`, `/egzamin`, `/quiz`, `/proba-ognia` ze stubem i statusem 200; `pnpm build` i `tsc --noEmit` zielone; `app/tokens.css` zawiera wszystkie tokeny z `plan/02 D` łącznie z `--chrom-1..6`, `--zar`, `--zar-poswiata`, `--zloto-mgla` (grep w dowodzie); negatywne: `git diff --stat` NIE pokazuje zmian w `data/`, `app/api/`, `lib/limit.ts`, `lib/stan.ts`, `lib/quiz.ts`.
  DOWOD: ✓ `ls components/` = 0 plikow; ✓ `ls lib/` = `limit.ts quiz.ts stan.ts`; ✓ `test ! -f` dla `NEXT-TASKS.md` i `WERYFIKACJA.md`; ✓ curl 200 plus `<h1 tabindex="-1">` na `/`, `/egzamin`, `/quiz`, `/proba-ognia`; ✓ grep 32/32 tokeny z `plan/02 D` w `app/tokens.css` (w tym `--chrom-1..6`, `--zar`, `--zar-poswiata`, `--zloto-mgla`); ✓ `pnpm run check` czysto; ✓ `pnpm build` zielony (first load 102 kB); ✓ `git diff HEAD --stat -- data app/api lib/limit.ts lib/stan.ts lib/quiz.ts` pusty; ✓ screenshots/F0/F0-01-stub-brama.png OBEJRZANY (papier, czarny napis, nic przekrzywionego). Commit: `F0-01`.
- [x] **F0-02** `infra` Walidator `scripts/lint-tokens.mjs`: (a) przenumerowanie istniejącego komunikatu allowlisty zależności z `Z6` na `Z14` (w v2 Z6 to zakaz obrotu, kolizja etykiet); (b) nowa reguła `Z6 obrot` - zakaz `rotate(`, `rotate3d(`, `rotateX(`, `rotateY(`, `rotateZ(`, `skew(` w `app/**` i `components/**` z wyjątkiem `components/scena/EkranLadowania.tsx` i `app/style/ladowanie.css`; (c) `Z9 kafel` - pozycja manifestu o roli `kafel` nie może mieć rozszerzenia `.gif`; (d) walidacja `data/assety.json` wg `plan/03 D`.
  CZYTAJ: 01→E (Z3, Z6, Z9, Z14), 03→D.
  AC: wstawienie `transform: rotate(3deg)` do dowolnego komponentu wywala `pnpm run check` komunikatem zawierającym dokładnie `Z6 obrot` (output w dowodzie), usunięcie wraca do zielonego; ten sam zapis w `app/style/ladowanie.css` NIE wywala; komunikat o niedozwolonej zależności mówi `Z14`, nie `Z6`; pozycja manifestu wskazująca nieistniejący plik wywala `check`; negatywne: `scaleX(-1)` i `scaleY(-1)` NIE są łapane.
  DOWOD: ✓ `components/scena/Probny.tsx` z `transform: rotate(3deg)` daje `Z6 obrot: return <div style={{ transform: "rotate(3deg)" }} />;` i exit 1, po usunieciu `lint-tokens: czysto` exit 0; ✓ ten sam zapis (plus `skew` i `rotate3d`) w `app/style/ladowanie.css` i w `components/scena/EkranLadowania.tsx` NIE wywala; ✓ wszystkie 6 wariantow (`rotate`, `rotate3d`, `rotateX/Y/Z`, `skew`) po 1 trafieniu; ✓ `scaleX(-1)` i `scaleY(-1)` = 0 trafien; ✓ dodanie `lodash` do dependencies daje `package.json zaleznosc runtime spoza allowlisty (Z14): lodash`; ✓ pozycja manifestu wskazujaca nieistniejacy plik daje `plik nie istnieje na dysku` plus `klatka-statyczna nie istnieje na dysku`; ✓ `kafel` z `.gif` daje `Z9 kafel nie moze byc .gif`, `id` spoza tabeli `03 D1` i plik-sierota w `public/assets/` tez lapane; ✓ `pnpm run check` czysto po sprzataniu. Commit: `F0-02`.
- [x] **F0-03a** `assety` ⚠ HARD Rdzeń biblioteki: 6 ozdób rdzenia, 3 pasy, 5 kafli, 2 kursory (16 pozycji) plus szkielet `data/assety.json` i `ATTRIBUTION.md`.
  CZYTAJ: 03→A,A1,B1,B2,B3,C,D.
  AC: `data/assety.json` ma 16 pozycji z istniejącymi plikami; każda o roli `ozdoba` lub `pas` ma istniejącą `klatka-statyczna` w `public/assets/statyczne/`; każdy `kafel` to `.png` i ma oba wymiary <= 350 px; kursory <= 32x32 (`sips -g pixelWidth -g pixelHeight` w dowodzie); `pnpm run check` zielony z walidacją z F0-02; negatywne: `find public/assets -type f -size +300k` = pusto, zero plików audio i wideo w `public/`.
  DOWOD: ✓ `jq '.pozycje | length'` = 16, wszystkie `.plik` istnieja na dysku; ✓ 9 pozycji roli `ozdoba`/`pas` ma `klatka-statyczna` w `public/assets/statyczne/` i kazda istnieje; ✓ 5 kafli to `.png` o wymiarach 200x200, 100x100, 144x144, 100x110, 100x100 (wszystkie <= 350); ✓ `sips -g pixelWidth -g pixelHeight`: `kursor.gif` 32x32, `kursor-rece.gif` 20x15; ✓ `pnpm run check` czysto (walidator z F0-02 przyjmuje manifest i nie widzi plikow-sierot); ✓ `find public/assets -type f -size +300k` pusto (najciezszy plik 69 KB); ✓ zero plikow audio i wideo, `public/` to 11 gif plus 14 png; ✓ screenshots/F0/F0-03a-biblioteka.png OBEJRZANY - wszystkie 16 pozycji i 9 klatek statycznych na jednym arkuszu, kazda przedstawia zamowiony motyw, tla przezroczyste, 5 kafli wyraznie rozne. Commit: `F0-03a`.
- [ ] **F0-03b** `assety` Ozdoby quizu i interfejsu: 13 ozdób quizu plus 7 ozdób interfejsu plus 4 stwory rogowe (24 pozycje), wszystkie `id` z tabeli `plan/03 D1`.
  CZYTAJ: 03→A1,B3,D1,E; 07→B.
  AC: manifest ma łącznie 40 pozycji; wszystkie 15 `id` z tabeli `07 B` istnieją w manifeście (skrypt porównujący dwa zbiory, wynik w dowodzie); każda nowa pozycja ma klatkę statyczną; `pnpm run check` zielony; negatywne: zero `id` spoza tabeli `03 D1`, żaden plik > 300 KB.
- [ ] **F0-03c** `assety` Plakietki 88x31 (3 pozycje) i domknięcie atrybucji.
  CZYTAJ: 03→A1,B5,D.
  AC: manifest ma 43 pozycje, w tym 30 o roli `ozdoba`; **dla każdego pliku z `public/assets/*.{gif,png}` (bez podkatalogu `statyczne/`) istnieje w `ATTRIBUTION.md` wiersz zaczynający się od jego nazwy** - dowód: skrypt porównujący dwa posortowane zbiory zwraca pustą różnicę w obie strony; plakietki mają dokładnie 88x31; negatywne: zero wierszy atrybucji dla plików, których nie ma.
- [ ] **F0-04** `infra` Font `Caveat` self-hostowany: `public/fonts/caveat.woff2`, `@font-face` z `font-display: swap`, fallback `Comic Sans MS`.
  CZYTAJ: 02→D.
  AC: plik `woff2` istnieje i ma > 10 KB; **uwaga wykonawcza:** `fonts.googleapis.com/css2` bez nagłówka `User-Agent` przeglądarki oddaje `ttf`, nie `woff2` - użyj `curl -H "User-Agent: Mozilla/5.0 ... Chrome/120"` i pobierz adres `.woff2` z odpowiedzi; `curl -s localhost:3000 | grep -c "fonts.googleapis"` = 0; nagłówek na bramie renderuje się fontem odręcznym (zrzut OBEJRZANY); polskie znaki `ąćęłńóśźż` widoczne poprawnie; negatywne: zero żądań do zewnętrznych domen na starcie strony.
- [ ] **F0-05** `infra` Testy bazowe: `tests/smoke.spec.ts` (4 route'y 200 plus `h1`), `tests/kanon.spec.ts` (brak `·` i `—` w `document.body.innerText` na 4 stronach), szkielet `tests/budzet.spec.ts` (funkcja sumująca `transferSize` odpowiedzi `image/*`, na razie uruchamiana tylko na `/`).
  CZYTAJ: 01→E (Z1, Z2, Z18), 03→C.
  AC: `npx playwright test` zielony na obu viewportach; test kanonu realnie mierzy (wstaw `—` do stubu, test pada, usuń); **realna walidacja budżetu przenosi się do F1-05** - w F0 strony są stubami bez obrazków i próg niczego by nie złapał; negatywne: zero nowych devDependencies.
- [ ] **F0-06** `infra` Weryfikacja pomiarów kontekstu, **tylko odczyt**.
  CZYTAJ: 10→START.
  AC: `bash ~/.claude/agent-context.sh` zwraca liczbę albo `NO-AGENT-TRANSCRIPT`; `cat ~/.claude/context-usage.txt` zwraca liczbę albo pliku brak; negatywne: **zero modyfikacji czegokolwiek w `~/.claude`**. `~/.claude` to prywatne repo Aleksandry z hookiem auto-commit i push na drugą maszynę - brak pliku `context-usage.txt` raportujemy jako `[do decyzji]`, nie łatamy po cichu.

## F1 - SILNIK SCENY (przekrojowy, test-first z playgroundem)

- [ ] **F1-01** `silnik` ⚠ HARD `lib/assety.ts` + `components/scena/Ozdoba.tsx` + `StworRogowy.tsx` + `Pas.tsx` + playground `/dev/scena` pokazujący wszystkie pozycje manifestu.
  CZYTAJ: 04→A,B,C,G; 03→D,E.
  AC: `/dev/scena` renderuje po jednej `Ozdoba` na każdą pozycję manifestu (liczba `img[data-ozdoba]` == liczba pozycji roli `ozdoba`); `page.emulateMedia({reducedMotion:'reduce'})` powoduje, że KAŻDY `img[data-ozdoba]` ma `src` zawierający `/statyczne/` i kończący się `.png`; stwór w prawym rogu ma `transform: scaleX(-1)`, w lewym nie ma żadnego `transform`; negatywne: `git grep -n 'src="/assets' app components` = 0 trafień (ścieżki tylko z manifestu).
- [ ] **F1-02** `silnik` `NapisObrazek.tsx` (warianty `chrom` i `neon`) + `PasGoniec.tsx` (warianty zwykły i odbijany).
  CZYTAJ: 04→D,H.
  AC: `NapisObrazek` renderuje `<svg role="img">` z `aria-label` równym tekstowi i `<title>` z tym samym tekstem; gradient chromowy ma 6 stopni (`querySelectorAll('stop').length === 6`); tekst z polskimi znakami `PRÓBA OGNIA` renderuje się bez obcinania (zrzut ekranu, szerokość viewBox liczona z długości tekstu); `PasGoniec` przy `reducedMotion:'reduce'` ma `animation-name: none` i tekst wyśrodkowany; negatywne: `grep -c 'rotate\|skew' components/scena/NapisObrazek.tsx` = 0.
- [ ] **F1-03** `silnik` `PlonacyNapis.tsx` - trzy warstwy wg `plan/04 E`.
  CZYTAJ: 04→E; 03→D.
  AC: dla tekstu `EGZAMIN JASIU` liczba płomieni na playgroundzie = `ceil(szerokosc/60)` (odczytać szerokość z `getBoundingClientRect` i porównać, wynik w dowodzie); płomienie mają różne `animation-delay` (zbiór wartości ma >= 4 elementy); przy `reducedMotion:'reduce'` warstwa ognia i poświaty mają `display: none`, a napis jest widoczny; zrzut ekranu `screenshots/F1/plonacy-napis.png` OBEJRZANY - napis czytelny, ogień u dołu, nic nie jest przekrzywione; negatywne: zero `rotate` w pliku i w CSS płonącego napisu.
- [ ] **F1-04** `silnik` ⚠ HARD `EkranLadowania.tsx` - sześcian 3D wg `plan/04 F`, warianty `start` i `narada`.
  CZYTAJ: 04→F; 03→D.
  AC: sześcian ma 6 ścian (`querySelectorAll('.ladowanie-sciana').length === 6`), każda z inną `Ozdoba`; animacja obrotu używa `steps(12)` (odczyt `animation-timing-function`); ekran znika nie wcześniej niż 1200 ms i nie później niż 2600 ms od montażu (pomiar `performance.now()` w teście, wynik w dowodzie); `Escape` zdejmuje go natychmiast i fokus ląduje na `h1`; przy `reducedMotion:'reduce'` brak obrotu i znika po 400 ms; zrzut `screenshots/F1/ladowanie.png` obejrzany.
- [ ] **F1-05** `silnik` Kursor-komisji, domknięcie playgroundu, URUCHOMIENIE realnego testu budżetu na `/dev/scena` (strona z kompletem assetów).
  CZYTAJ: 04→I,K,L; 03→C.
  AC: `html` ma `cursor` z `url("/assets/kursor.gif") 4 2`; plik kursora <= 32x32; `tests/budzet.spec.ts` mierzy `/dev/scena` i podaje zmierzoną sumę (wynik w dowodzie), a podniesienie progu do 1 KB powoduje FAIL (dowód, że test realnie mierzy); produkcyjny build zwraca 404 na `/dev/scena`; zero long tasków > 50 ms w 5 s bezczynności; negatywne: `grep -rn 'transition: all' app components` = 0.

## F2 - SHELL I BRAMA

- [ ] **F2-01** `ui` Shell: `PasGoniec` górny, `PassOMetr` (3 stany, awaria co 45 s), `StrazEtapu`, stopka-webring z licznikiem lokalnym i plakietkami.
  CZYTAJ: 05→A; 04→B,C,H; 01→F (słownik).
  AC: w stopce istnieje pusty `<div data-radio-slot>` (wypełniany w F5-03; kolejność DOM z `plan/05 A` weryfikowana dopiero tam); `PassOMetr` pokazuje trzy pola, etap 2 i 3 mają `aria-disabled="true"` przed zdaniem poprzednich; wejście z URL na `/quiz` bez zdanego egzaminu pokazuje druk `ALEKSANDRO, KOMISJA ZABRANIA. NAJPIERW ETAP 1.` BEZ przekierowania (URL się nie zmienia); licznik odwiedzin pokazuje 7 cyfr i rośnie o 1 po nowej sesji; na 390 px `PassOMetr` jest NAD stopką (porównanie `getBoundingClientRect().top`, wynik w dowodzie); negatywne: zero elementów z `position: fixed` w shellu (`page.evaluate` po wszystkich elementach), zero sticky headera, zero hamburgera.
- [ ] **F2-02a** `ui` ⚠ HARD Brama, szkielet: kafel tła, statek, `NapisObrazek J-WORD PASS`, podtytuł, pas-goniec ze strzałką, pas dolny, dwa stwory rogowe (punkty 2-6, 9, 10 z `plan/05 B1`).
  CZYTAJ: 05→B1,C,D; 04→B,C,D; 01→E (Z8, Z9).
  AC: liczba animowanych elementów w widoku 1280x800 >= 12 (policzyć `img[data-ozdoba]` + pasy + pas-goniec, wynik w dowodzie); zbiór `animation-delay` ozdób tablicy ogłoszeń ma >= 6 różnych wartości; `getComputedStyle(html).backgroundRepeat === "repeat"` ORAZ `getComputedStyle(html).backgroundSize === "auto"` (`getComputedStyle` zawsze zwraca wartość, więc „nie ma" jest nieweryfikowalne), plus `git grep -n "background-size" app/style` = 0; pole imienia ma wartość `ALEKSANDRA` i atrybut `readonly`; zrzuty desktop i 390 px OBEJRZANE - tekst czytelny na kaflu, nic nie zasłania przycisków (`elementFromPoint` na środku każdego przycisku zwraca ten przycisk); negatywne: zero `rotate`/`skew` w DOM bramy, brak hero z dwoma przyciskami w pustej przestrzeni.
- [ ] **F2-02b** `ui` Brama, wypełnienie: tablica ogłoszeń z minimum 6 ozdobami o różnych `animation-delay` i druk wstępny z `ALEKSANDRA` readOnly (punkty 7-8 z `plan/05 B1`).
  CZYTAJ: 05→B1 pkt 7-8, 05→C; 04→B; 01→E (Z8).
  AC: liczba animowanych elementów w widoku 1280x800 >= 12 (policzyć, wynik w dowodzie); zbiór `animation-delay` ozdób tablicy ma >= 6 różnych wartości; pole imienia ma wartość `ALEKSANDRA` i atrybut `readonly`; zrzuty desktop i 390 px OBEJRZANE - tekst czytelny na kaflu, `elementFromPoint` na środku każdego przycisku zwraca ten przycisk; negatywne: zero `rotate`/`skew` w DOM bramy.
- [ ] **F2-03** `ui` Przycisk-uciekinier wg `plan/05 B2`.
  CZYTAJ: 05→B2,C.
  AC: `WOLĘ NIE` zmienia pozycję dokładnie 3 razy przy trzech osobnych najechaniach (kursor musi opuścić przycisk między nimi), przy czwartym zostaje i ma tekst `DOBRZE, ALEKSANDRO, NIECH BĘDZIE`; klik po kapitulacji prowadzi na `/egzamin`; `Enter` na sfokusowanym przycisku NIE powoduje ucieczki; przy `(pointer: coarse)` ucieczka wyłączona; negatywne: przycisk nigdy nie ma `transform: rotate` (Z6), nigdy nie wychodzi poza kontener (`getBoundingClientRect` mieści się w tablicy ogłoszeń).
- [ ] **F2-04** `ui` Ceremonia wejścia na bramie + podpięcie `EkranLadowania` do pierwszego wejścia w sesji.
  CZYTAJ: 05→B3; 04→F; 02→B (lib/stan.ts).
  AC: klik `PRZYSTĘPUJĘ` pokazuje ekran ładowania i po 1200-2600 ms ląduje na `/egzamin` z fokusem na `h1`; `Escape` skraca do natychmiast; drugie wejście na `/` w tej samej sesji NIE pokazuje ekranu (klucz `jwp.ladowanie` w `sessionStorage`); negatywne: ekran ładowania nie pojawia się przy `reducedMotion` dłużej niż 400 ms.
- [ ] **F2-05** `deploy` Pierwszy deploy PREVIEW (nie produkcja) i weryfikacja bramy na żywo.
  CZYTAJ: 02→A; 02→G pkt 5.
  AC: `vercel deploy` (BEZ `--prod`) zwraca URL preview, anonimowy `curl -sI <url>` = 200. **Deployment Protection została wyłączona 2026-09-01** (`vercel project protection` zwraca `"ssoProtection": null`) - gdyby wróciła, curl da 302 na `vercel.com/sso-api` i wtedy AC brzmi „200 z nagłówkiem bypass ALBO 302 z odnotowanym powodem i issue w F7"; brama na preview pokazuje kafel, statek i tablicę ogłoszeń (zrzut z preview w `screenshots/F2/`); URL wklejony do BACKLOG przy odhaczeniu; negatywne: `vercel ls` pokazuje, że produkcja NIE została podmieniona (Environment produkcyjnego deployu bez zmian).

## F3 - EGZAMIN

- [ ] **F3-01** `dane` Treść pod Aleksandrę: `data/egzamin.json` (pole `zalozenia` jako lista 6 pozycji), `data/komisja.json`, prompt systemowy w `/api/ocena` i komunikaty w `/api/zgloszenie` przepisane na zwrot bezpośredni (Z16). Usunięcie pola `zalaczniki` z kontraktu `/api/ocena`.
  CZYTAJ: 01→D; 06→A; 02→B,E.
  AC: `git grep -niE "kandydat[a-ząćęłńóśźż]*( jest| proszony| powinien)|wypełniono niegodnie" data app | wc -l` = 0; `jq '.zalozenia | length' data/egzamin.json` = 6 i każdy element ma pola `id` oraz `tekst` (struktura BEZ zmian); prompt systemowy w `app/api/ocena/route.ts` zawiera instrukcję zwracania się do Aleksandry (grep w dowodzie); **dwie** próby przez curl z odstępem 60 s (limit to 5/min - pięć prób plus curl kontraktowy dałoby 429) i w obu odpowiedź zawiera imię w jakiejś formie; curl z payloadem bez `zalaczoneDowody` zwraca 200 i punkty 0-10; negatywne: `git grep -c zalaczoneDowody app/api tests` = 0 (to JEST realna nazwa pola w kodzie, `zalaczniki` nie występuje nigdzie i było błędem planu), `tests/f3-01.spec.ts` zielony po aktualizacji payloadu.
- [ ] **F3-02** `ui` ⚠ HARD Scena egzaminu: kafel, pas górny, `ETAP 1`, `PlonacyNapis EGZAMIN JASIU`, scena kosmiczna (planeta, statek, 12 gwiazdek), druki `DANE DO ZADANIA` i `TREŚĆ PYTANIA`, textarea z licznikiem, stwory rogowe.
  CZYTAJ: 06→A,B,D,E; 04→B,C,D,E; 03→D.
  AC: sześć założeń renderuje się jako `<li>` z `data/egzamin.json` (zero tej treści w kodzie komponentu, `git grep` w dowodzie); liczba animowanych elementów >= 6 (policzyć, wynik w dowodzie); płonący napis widoczny i czytelny na zrzucie desktop i 390 px (OBEJRZEĆ); licznik znaków zmienia kolor na `--alarm` powyżej 7500 znaków; scena kosmiczna ma `pointer-events: none` (klik w planetę nie robi nic); negatywne: zero elementów przeciąganych (`draggable` nie występuje w DOM), zero `rotate`/`skew`, treść założeń NIE występuje jako goły `<p>` bez druku.
- [ ] **F3-03** `ui` Ceremonia oceny wg `plan/06 C`: wariant `narada` ekranu ładowania, dymki z `data/komisja.json`, werdykt, pusta odpowiedź, fallback awaryjny.
  CZYTAJ: 06→C,D; 04→F; 02→B (lib/stan.ts).
  AC: pusta odpowiedź daje werdykt 0/10 BEZ żądania do `/api/ocena` (assercja na `page.on('request')`); niepusta: narada trwa minimum 3500 ms i pokazuje >= 5 różnych dymków (zebrać teksty, sprawdzić rozmiar zbioru); werdykt pokazuje `NapisObrazek` ZDANE albo NIEZDANE plus wynik `N/10` plus komentarz modelu; klucz odpięty w dev -> werdykt awaryjny w <= 16 s; powrót na `/egzamin` po zdaniu: textarea `readOnly`, werdykt z `sessionStorage`, zero żądania; `Escape` w trakcie narady skacze do werdyktu; zrzut werdyktu OBEJRZANY (napis czytelny, nic nie jest przekrzywione).

## F4 - QUIZ

- [ ] **F4-01** `ui` ⚠ HARD Karta pytania i nawigacja: 15 pytań, warianty A-D, pytanie 14 otwarte, rząd 15 kwadratów, zapis stanu.
  CZYTAJ: 07→A,D,E; 04→B,C,D; 02→B (lib/stan.ts).
  AC: wszystkie 15 pytań przechodne klawiaturą (strzałki lewo/prawo i kliknięcie w kwadrat); zaznaczenie 3 wariantów, `page.reload()`, zaznaczenia wracają; pytanie 14 akceptuje `mohsa`, `Mohsa` i `skala Mohsa` (test normalizacji); kwadrat odpowiedzianego pytania ma inny styl niż nieodpowiedzianego (porównanie `getComputedStyle`); negatywne: zero informacji o poprawności przed oddaniem arkusza (żaden element nie ma klasy sugerującej poprawność), zero emoji w DOM.
- [ ] **F4-02** `ui` Ozdoby 15 pytań wg tabeli `plan/07 B` plus reakcje na hover.
  CZYTAJ: 07→B; 04→B; 03→D.
  AC: zbiór `id` ozdób użytych w 15 pytaniach ma dokładnie 15 elementów (wypisać listę w dowodzie); pytanie 1 na hover wariantu B zmienia `animation-duration` ozdoby (odczyt przed i po); pytanie 14 przy poprawnym wpisie błyska (`animation-name` się zmienia); zrzut-kolaż 15 ozdób w `screenshots/F4/` OBEJRZANY - ozdoby realnie się różnią, nie są 15 wariantami tego samego; negatywne: zero ozdób bez pozycji w manifeście.
- [ ] **F4-03** `ui` Maszyna prawdy wg `plan/07 C` plus tryb rewizji.
  CZYTAJ: 07→C,D,E; 04→D.
  AC: pełna ceremonia <= 9000 ms (pomiar `performance.now()`, wynik w dowodzie); `Escape` pokazuje wszystkie werdykty naraz; nieodpowiedziane liczą się jako błędne po potwierdzeniu druku; tryb rewizji: poprawna ma ramkę `--jad`, błędnie wybrana `line-through` i ramkę `--alarm`; wynik zapisany w `sessionStorage`; przejście prowadzi na `/proba-ognia`; negatywne: zero przekreśleń pod kątem, zero animacji przewracania kartek 3D.

## F5 - PRÓBA OGNIA I RADIO

- [ ] **F5-01** `ui` Scena ogniska plus druk OGN-3/TAJ z walidacją stemplami wg `plan/08 A,B`.
  CZYTAJ: 08→A,B,E; 04→B,C; 01→D.
  AC: błędny e-mail powoduje drganie druku (`translateX`, nie obrót) plus stempel `ALEKSANDRO, TO NIE JEST ADRES` plus fokus wraca do pola; but 8 daje stempel o skali 10-70; ucho 200 przechodzi z dopiskiem podziwu; submit `disabled` bez checkboxa; zrzuty desktop i 390 px OBEJRZANE; negatywne: zero czerwonych obwódek bez stempla, zero steppera, zero `rotate` na drganiu.
- [ ] **F5-02** `ui` ⚠ HARD Ceremonia spalenia plus list w butelce wg `plan/08 C,D`.
  CZYTAJ: 08→C,D,E,F; 04→B; 02→B (api/zgloszenie).
  AC: sekwencja czterech kroków udokumentowana czterema zrzutami faz w `screenshots/F5/` (OBEJRZANE); klik i `Enter` na butelce rozwijają pergamin z e-mailem i sumą `N/25`; `Escape` w krokach 1-3 skacze do butelki; `OD NOWA` czyści `sessionStorage` i wraca na `/`; powrót na URL po wysłaniu pokazuje od razu butelkę bez żądania POST; POST trafia do `/api/zgloszenie` i lokalnie zwraca `tryb: "dev-log"`; negatywne: pergamin nie jest przekrzywiony, zero konfetti.
- [ ] **F5-03** `ui` `RadioTinyDesk` wg `plan/09` - obudowa, YouTube IFrame API po geście, wskaźnik strojenia, suwak.
  CZYTAJ: 09 (cały).
  AC: przed kliknięciem `WŁĄCZ` zero żądań do `youtube.com` i `youtube-nocookie.com` (assercja `page.on('request')`); po kliknięciu pojawia się żądanie do `iframe_api` i `iframe` z `src` zawierającym `oCcks-fwq2c`; `localStorage.jwp.audio === "on"`; `WYŁĄCZ` cichnie w < 100 ms; radio NIE ma `position: fixed` i nie zasłania żadnego przycisku (`elementFromPoint` na 390 px); zrzut obudowy w `screenshots/F5/` OBEJRZANY; negatywne: zero plików audio w `public/`, `git grep -ciE "youtube-dl|ytdl|yt-dlp"` = 0.

## F6 - POLISH

- [ ] **F6-01** `a11y` Audyt dostępności: przejście przez 3 etapy samą klawiaturą, kontrasty tokenów, `aria-label` na ozdobach interaktywnych, `role="button"` na butelce.
  CZYTAJ: 01→E (Z10, Z11); 02→D.
  AC: pełny przepływ brama-pergamin przechodzalny bez myszy (kroki wypisane w commit message); `@axe-core/playwright` zwraca 0 błędów `critical` na 4 stronach plus 404; każdy token tekstu ma kontrast >= 4,5:1 na swoim tle (tabela pomiarów w dowodzie); wszystkie `img[data-ozdoba]` dekoracyjne mają `alt=""` i `aria-hidden="true"`, a te niosące treść mają `alt` z manifestu; negatywne: żaden `outline: none` bez zamiennika.
- [ ] **F6-02** `perf` Budżety: brak long tasków > 50 ms w 5 s bezczynności na 4 stronach, first load JS < 160 kB, suma obrazów na widok <= 2,5 MB.
  CZYTAJ: 03→C; 04→L.
  AC: `tests/budzet.spec.ts` zielony dla wszystkich 4 stron (wypisać zmierzone sumy w dowodzie); `pnpm build` pokazuje first load < 160 kB dla każdej strony; `PerformanceObserver` nie notuje long taska > 50 ms w 5 s bezczynności; negatywne: zero obrazów bez `width`/`height` w atrybutach (`page.evaluate` po wszystkich `img`).
- [ ] **F6-03** `ui` 404 Komisji, favicon, obrazek OG z `metadataBase`.
  CZYTAJ: 02→A; 01→D.
  AC: `/nie-ma` zwraca 404 ze stroną spełniającą Z8 tak samo jak każdy inny widok: własny kafel `kafel-404`, >= 6 animowanych elementów, >= 2 stwory rogowe, >= 1 pas, tekst do Aleksandry; `metadataBase` liczony z `VERCEL_PROJECT_PRODUCTION_URL` z fallbackiem na localhost - build z tą zmienną daje absolutny `og:image` na domenie produkcyjnej (pomiar curlem na `next start`, wynik w dowodzie); favicon istnieje; negatywne: `og:image` nigdy nie wskazuje `localhost` w buildzie z ustawioną zmienną.
- [ ] **F6-04** `ui` Samoocena gęstości i charakteru (Z8, anty-spec `plan/01 G`) na wszystkich 4 widokach plus 404.
  CZYTAJ: 01→E (Z7, Z8, Z9), 01→G.
  AC: dla każdego z 5 widoków w dowodzie tabela: liczba animowanych elementów (>= 6), liczba stworów rogowych (>= 2), liczba pasów (>= 1), nazwa kafla (5 różnych kafli na 5 widoków); zrzuty wszystkich 5 widoków OBEJRZANE i skonfrontowane z anty-spec punkt po punkcie (wynik: lista `punkt anty-spec -> spełniony/naruszony`); każde naruszenie poprawione w tym samym issue; negatywne: żaden widok nie ma pustego pasa > 120 px bez elementu.

## F7 - ZNALEZISKA (rośnie w trakcie, zakładana pusta)

Każde znalezisko z zasady 7a ląduje tu jako osobne issue z pełnym AC.
DoD fazy: każde znalezisko ma issue; każde issue ma dyspozycję (zrobione, świadomie
odrzucone z powodem, albo przeniesione do trackera).

## F8 - BRAMKA DECYZYJNA

- [ ] **F8-01** `deploy` ⏳ STOP-GATE przed wykonaniem: pokaż Aleksandrze URL preview plus `WERYFIKACJA.md`, zapytaj o zgodę na `vercel deploy --prod` (podmiana żywej produkcji z wersji 1).
  AC: produkcyjny URL działa i pokazuje NOWĄ bramę (zrzut); `/api/ocena` na produkcji odpowiada (1 curl); rate limit: szóste żądanie daje 429; formularz zapisuje do Bloba (1 wpis testowy, potem usunięty, `vercel blob list` = pusto); `og:image` na produkcji wskazuje domenę produkcyjną.

---

## GITHUB-IMPORT

Issues NIE importujemy do GitHub na starcie - checkboxy tego pliku są źródłem prawdy,
a sztafeta workerów czyta plik, nie API. Po zakończeniu buildu otwarte pozycje z F7
można przenieść przez `gh issue create`, z labelem fazy i linkiem do tego pliku.

## WYNIK TESTU F-KROK 3 (kolejność faz)

- F1 nie importuje niczego z F2+ (silnik nie zna widoków, tylko manifest).
- F2 używa wyłącznie komponentów z F1.
- F3, F4, F5 używają F1 i F2, nie używają siebie nawzajem.
- F0-03 (assety) jest na ścieżce krytycznej WSZYSTKIEGO - dlatego stoi w F0
  i jest oznaczone `⚠ HARD`.
- Po F2 projekt jest pokazywalny (brama działa, deploy preview ma sens).
- Żadna faza nie ma więcej niż 6 issues. Żadne issue nie przekracza dnia pracy.
