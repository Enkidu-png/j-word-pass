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
- [x] **F0-03b** `assety` Ozdoby quizu i interfejsu: 13 ozdób quizu plus 7 ozdób interfejsu plus 4 stwory rogowe (24 pozycje), wszystkie `id` z tabeli `plan/03 D1`.
  CZYTAJ: 03→A1,B3,D1,E; 07→B.
  AC: manifest ma łącznie 40 pozycji; wszystkie 15 `id` z tabeli `07 B` istnieją w manifeście (skrypt porównujący dwa zbiory, wynik w dowodzie); każda nowa pozycja ma klatkę statyczną; `pnpm run check` zielony; negatywne: zero `id` spoza tabeli `03 D1`, żaden plik > 300 KB.
  DOWOD: ✓ `jq '.pozycje | length'` = 40 (13 ozdob quizu, 7 ozdob interfejsu, 4 stwory rogowe dolozone do 16 z F0-03a); ✓ skrypt porownujacy zbiory: 15 `id` wyciagnietych regexem z tabeli `plan/07 B` minus zbior `id` manifestu = ROZNICA PUSTA, zbior z tabeli ma dokladnie 15 elementow; ✓ 33 pozycje roli `ozdoba`/`pas` maja `klatka-statyczna` i wszystkie 33 pliki sa na dysku; ✓ `pnpm run check` czysto, czyli walidator z F0-02 nie znalazl ani jednego `id` spoza kanonicznej tabeli `03 D1` ani pliku bez pozycji; ✓ `find public/assets -type f -size +300k` pusto; ✓ screenshots/F0/F0-03b-stwory.png OBEJRZANY na `--kosmos` i `--papier` - 12 z 24 pierwszych trafien bylo bledami haslowymi (pies zamiast hot doga, zdjecie czlowieka zamiast dloni, baner zamiast buta) i zostalo podmienione przed odhaczeniem. Commit: `F0-03b`.
- [x] **F0-03c** `assety` Plakietki 88x31 (3 pozycje) i domknięcie atrybucji.
  CZYTAJ: 03→A1,B5,D.
  AC: manifest ma 43 pozycje, w tym 30 o roli `ozdoba`; **dla każdego pliku z `public/assets/*.{gif,png}` (bez podkatalogu `statyczne/`) istnieje w `ATTRIBUTION.md` wiersz zaczynający się od jego nazwy** - dowód: skrypt porównujący dwa posortowane zbiory zwraca pustą różnicę w obie strony; plakietki mają dokładnie 88x31; negatywne: zero wierszy atrybucji dla plików, których nie ma.
  DOWOD: ✓ `jq '.pozycje|length'` = 43, rozklad rol: 30 `ozdoba`, 5 `kafel`, 3 `pas`, 3 `plakietka`, 2 `kursor`; ✓ porownanie dwoch posortowanych zbiorow (`ls public/assets` bez `statyczne/` kontra nazwy z poczatku wierszy `ATTRIBUTION.md`): 43 kontra 43, `comm -23` PUSTE i `comm -13` PUSTE, czyli roznica pusta w obie strony; ✓ `sips`: wszystkie trzy plakietki 88x31; ✓ `pnpm run check` czysto; ✓ screenshots/F0/F0-03c-plakietki.png OBEJRZANY - `I HTML`, `W3C CSS` i `NETSCAPE Now`, wszystkie czytelne w skali 1:1. Commit: `F0-03c`.
- [x] **F0-04** `infra` Font `Caveat` self-hostowany: `public/fonts/caveat.woff2`, `@font-face` z `font-display: swap`, fallback `Comic Sans MS`.
  CZYTAJ: 02→D.
  AC: plik `woff2` istnieje i ma > 10 KB; **uwaga wykonawcza:** `fonts.googleapis.com/css2` bez nagłówka `User-Agent` przeglądarki oddaje `ttf`, nie `woff2` - użyj `curl -H "User-Agent: Mozilla/5.0 ... Chrome/120"` i pobierz adres `.woff2` z odpowiedzi; `curl -s localhost:3000 | grep -c "fonts.googleapis"` = 0; nagłówek na bramie renderuje się fontem odręcznym (zrzut OBEJRZANY); polskie znaki `ąćęłńóśźż` widoczne poprawnie; negatywne: zero żądań do zewnętrznych domen na starcie strony.
  DOWOD: ✓ `public/fonts/caveat.woff2` 72 KB i `caveat-ext.woff2` 28 KB, oba `Web Open Font Format (Version 2)` wg `file` (bez naglowka `User-Agent` przegladarki Google oddaje `ttf` - uzyty `curl -H "User-Agent: ... Chrome/120"`, zgodnie z uwaga wykonawcza); ✓ `curl -s localhost:3000 | grep -c fonts.googleapis` = 0; ✓ `page.on('request')` przy `waitUntil: networkidle` na `/`: zadan poza `localhost` BRAK; ✓ `h1` ma `font-family: Caveat, "Comic Sans MS", cursive` i `document.fonts` raportuje `Caveat loaded`; ✓ screenshots/F0/F0-04-font.png OBEJRZANY - naglowek pismem odrecznym, `ąćęłńóśźż` i `ĄĆĘŁŃÓŚŹŻ` wyrenderowane poprawnie, zero brakujacych glifow. Commit: `F0-04`.
- [x] **F0-05** `infra` Testy bazowe: `tests/smoke.spec.ts` (4 route'y 200 plus `h1`), `tests/kanon.spec.ts` (brak `·` i `—` w `document.body.innerText` na 4 stronach), szkielet `tests/budzet.spec.ts` (funkcja sumująca `transferSize` odpowiedzi `image/*`, na razie uruchamiana tylko na `/`).
  CZYTAJ: 01→E (Z1, Z2, Z18), 03→C.
  AC: `npx playwright test` zielony na obu viewportach; test kanonu realnie mierzy (wstaw `—` do stubu, test pada, usuń); **realna walidacja budżetu przenosi się do F1-05** - w F0 strony są stubami bez obrazków i próg niczego by nie złapał; negatywne: zero nowych devDependencies.
  DOWOD: ✓ `npx playwright test` = 30 passed, 0 failed, 8 skipped na obu viewportach (skipy to 4 testy kontraktu `/api/ocena` pomijane na drugim projekcie, zeby nie wpasc w limit 5/min, plus 2 sparkowane testy UI z `f5-02` opisane w F7-01); ✓ `tests/kanon.spec.ts` realnie mierzy: po wstawieniu `—` do stubu `/` test PADA z `Z2: dlugi mysnik w copy`, po usunieciu `8 passed`; ✓ `tests/budzet.spec.ts` uruchamia sie na `/` i wypisuje zmierzona sume `budzet / : 0 B, prog 2621440 B` (zero, bo stub nie ma obrazkow, dlatego realna walidacja progu jest przeniesiona do F1-05 zgodnie z AC); ✓ `tests/smoke.spec.ts` sprawdza 4 route'y na 200 i `h1`; ✓ `git diff HEAD -- package.json` = 0 zmian, zero nowych devDependencies. ZNALEZISKO: dwa testy `f5-02` sterowaly usunietym UI, issue F7-01 zalozone. Commit: `F0-05`.
- [x] **F0-06** `infra` Weryfikacja pomiarów kontekstu, **tylko odczyt**.
  CZYTAJ: 10→START.
  AC: `bash ~/.claude/agent-context.sh` zwraca liczbę albo `NO-AGENT-TRANSCRIPT`; `cat ~/.claude/context-usage.txt` zwraca liczbę albo pliku brak; negatywne: **zero modyfikacji czegokolwiek w `~/.claude`**. `~/.claude` to prywatne repo Aleksandry z hookiem auto-commit i push na drugą maszynę - brak pliku `context-usage.txt` raportujemy jako `[do decyzji]`, nie łatamy po cichu.
  DOWOD: ✓ `bash ~/.claude/agent-context.sh` zwraca `STALE-TRANSCRIPT` (exit 1), czyli sentinel z wlasnego kontraktu skryptu, NIGDY liczby udawanej; ✓ `cat ~/.claude/context-usage.txt` zwraca `37`; ✓ `git -C ~/.claude status --short` PUSTE, zero modyfikacji. UWAGA `[do decyzji]`: AC wymienia `NO-AGENT-TRANSCRIPT`, a skrypt oddaje `STALE-TRANSCRIPT` - i oddaje go przez CALY przebieg workera, bo szuka transkryptu po katalogu roboczym i trafia na sesje orkiestratora zamarla w chwili spawnu (mtime 00:44 przy pomiarze 01:18, prog to 120 s). Warunek sztafety „>= 55% okna" jest wiec dla workera niemierzalny tym narzedziem; szczegoly i rekomendacja w DECISIONS.md #14. Commit: `F0-06`.

### RAPORT FAZY F0 (DoD punkt po punkcie)

- `pnpm run check` ZIELONY: `samotest: czysto`, `lint-tokens: czysto`, `tsc --noEmit` bez bledow.
- `pnpm build` ZIELONY: 7 route'ow, first load 102 kB dla kazdego (limit 160 kB z F6-02 z zapasem).
- `npx playwright test` BEZ FAILOW: 30 passed, 0 failed, 8 skipped na obu viewportach.
  Skipy: 4 testy kontraktu `/api/ocena` pomijane na drugim projekcie (limit 5/min)
  plus 2 testy UI z `f5-02` sparkowane pod issue F7-01.
- Zrzut stanu fazy: `screenshots/F0/F0-DoD-stan-fazy.png`, OBEJRZANY. Cztery route'y
  renderuja stub `h1` krojem Caveat, polskie znaki poprawne, nic nie jest przekrzywione.
- Ocena wzgledem Z7-Z9 i anty-spec `plan/01 G`: **wiekszosc punktow jeszcze NIE MA
  do czego sie odniesc** i to jest stan zamierzony. F0 to rusztowanie, warstwa
  wizualna zaczyna sie w F1 i F2. Konkretnie:
  - Z7 (assety to pliki, nie kod): SPELNIONY w wymiarze, w jakim juz obowiazuje.
    43 pozycje w `data/assety.json`, zero sciezek wpisanych wprost (`git grep 'src=\"/assets'`
    w `app` i `components` = 0 trafien, bo `components/` jest puste).
  - Z8 (gestosc, min. 6 animowanych elementow na widok): NIE DOTYCZY jeszcze, widoki
    to stuby. Wchodzi w F2-02a i jest tam mierzone.
  - Z9 (wlasny kafel na strone): NIE DOTYCZY jeszcze; piec kafli jest zdobytych
    i zwalidowanych (PNG, <= 350 px), podpiecie do widokow to F2-F6.
  - Anty-spec 2-9: NIE DOTYCZY, brak hero, kart, cieni, animacji i mechaniki -
    w repo nie ma ani jednego komponentu.
  - Anty-spec 10 (tekst bez podkladu): brak naruszenia, stub stoi na `--papier`,
    nie na kaflu.
  - Z1, Z2, Z3, Z4, Z6: EGZEKWOWANE MASZYNOWO od tej fazy, `pnpm run check`
    plus `tests/kanon.spec.ts`, oba zielone.
- Znaleziska bez issue: BRAK. Jedyne znalezisko fazy (dwa testy `f5-02` sterujace
  usunietym UI) ma issue **F7-01** z pelnym AC.
- Do decyzji Aleksandry przed F1: `agent-context.sh` nie mierzy okna workera,
  szczegoly w `DECISIONS.md` #14.

## F1 - SILNIK SCENY (przekrojowy, test-first z playgroundem)

- [x] **F1-01** `silnik` ⚠ HARD `lib/assety.ts` + `components/scena/Ozdoba.tsx` + `StworRogowy.tsx` + `Pas.tsx` + playground `/dev/scena` pokazujący wszystkie pozycje manifestu.
  CZYTAJ: 04→A,B,C,G; 03→D,E.
  AC: `/dev/scena` renderuje po jednej `Ozdoba` na każdą pozycję manifestu (liczba `img[data-ozdoba]` == liczba pozycji roli `ozdoba`); `page.emulateMedia({reducedMotion:'reduce'})` powoduje, że KAŻDY `img[data-ozdoba]` ma `src` zawierający `/statyczne/` i kończący się `.png`; stwór w prawym rogu ma `transform: scaleX(-1)`, w lewym nie ma żadnego `transform`; negatywne: `git grep -n 'src="/assets' app components` = 0 trafień (ścieżki tylko z manifestu).
  DOWOD: ✓ `/dev/scena` renderuje 30 UNIKALNYCH `img[data-ozdoba]` przy 30 pozycjach roli `ozdoba` (plus 4 stwory rogowe, razem 34 elementy) - test `tests/f1-01.spec.ts` liczy zbior `data-ozdoba` i porownuje z `pozycjeRoli("ozdoba").length`; ✓ przy `emulateMedia({reducedMotion:'reduce'})` KAZDE z 34 zrodel zawiera `/statyczne/` i konczy sie `.png`, a test realnie mierzy (po zepsuciu `uzyjKlatki` pada, po naprawie przechodzi); ✓ pasy tez sie podmieniaja (`backgroundImage` z `/assets/pas-budowa.gif` na `/assets/statyczne/pas-budowa.png`), choc AC tego nie wymagal - Z11 nie ma wyjatkow; ✓ `getComputedStyle().transform`: `prawy-dol` i `prawy-gora` = `matrix(-1, 0, 0, 1, 0, 0)`, `lewy-dol` i `lewy-gora` = `none`; ✓ `git grep -n 'src="/assets' app components` = 0 trafien; ✓ trzy zrzuty w `screenshots/F1/` OBEJRZANE (desktop, 390 px, reduced) - wszystkie 30 ozdob widoczne i rozne, 3 pasy powtarzaja sie na cala szerokosc, stwory w rogach odbite lustrzanie, na 390 px wszystkie cztery widoczne i nie zaslaniaja tresci. Commit: `F1-01`.
- [x] **F1-02** `silnik` `NapisObrazek.tsx` (warianty `chrom` i `neon`) + `PasGoniec.tsx` (warianty zwykły i odbijany).
  CZYTAJ: 04→D,H.
  AC: `NapisObrazek` renderuje `<svg role="img">` z `aria-label` równym tekstowi i `<title>` z tym samym tekstem; gradient chromowy ma 6 stopni (`querySelectorAll('stop').length === 6`); tekst z polskimi znakami `PRÓBA OGNIA` renderuje się bez obcinania (zrzut ekranu, szerokość viewBox liczona z długości tekstu); `PasGoniec` przy `reducedMotion:'reduce'` ma `animation-name: none` i tekst wyśrodkowany; negatywne: `grep -c 'rotate\|skew' components/scena/NapisObrazek.tsx` = 0.
  DOWOD: ✓ `svg[data-napis]` ma `role="img"`, `aria-label="J-WORD PASS"` i `<title>` o tej samej tresci; ✓ `querySelectorAll('stop').length` w wariancie `chrom` = 6; ✓ `PRÓBA OGNIA`: test porownuje wszystkie CZTERY krawedzie `getBBox()` napisu z `viewBox` i zlapal realne obciecie - przy linii pisma z planu (`y=96`, wysokosc 120) kreska nad `Ó` wychodzila nad viewBox; poprawione na wysokosc 130 i linie 104, teraz test zielony, zrzut `screenshots/F1/F1-02-napisy.png` OBEJRZANY (cztery napisy, `Ó` w calosci widoczne, gradient chromowy czytelny, wariant neon zielony z magentowym konturem, nic nie jest przekrzywione); ✓ szerokosc viewBox liczona z dlugosci tekstu (`62 * len + 40`) plus `textLength`/`lengthAdjust`, odstepstwo od `plan/04 D` opisane w DECISIONS.md #15; ✓ `PasGoniec` przy `reducedMotion:'reduce'` ma `animation-name: none`, `text-align: center` i `padding-left: 0px`, a bez niego `animation-name: goniec` (dowod, ze test nie przechodzi trywialnie); ✓ `grep -c 'rotate\|skew' components/scena/NapisObrazek.tsx` = 0. Commit: `F1-02`.
- [x] **F1-03** `silnik` `PlonacyNapis.tsx` - trzy warstwy wg `plan/04 E`.
  CZYTAJ: 04→E; 03→D.
  AC: dla tekstu `EGZAMIN JASIU` liczba płomieni na playgroundzie = `ceil(szerokosc/60)` (odczytać szerokość z `getBoundingClientRect` i porównać, wynik w dowodzie); płomienie mają różne `animation-delay` (zbiór wartości ma >= 4 elementy); przy `reducedMotion:'reduce'` warstwa ognia i poświaty mają `display: none`, a napis jest widoczny; zrzut ekranu `screenshots/F1/plonacy-napis.png` OBEJRZANY - napis czytelny, ogień u dołu, nic nie jest przekrzywione; negatywne: zero `rotate` w pliku i w CSS płonącego napisu.
  DOWOD: ✓ pomiar z testu: desktop `szerokosc 1232.0 px, ceil/60 = 21, plomieni 21`; 390 px: `szerokosc 342.0 px, ceil/60 = 6, plomieni 6` - liczba przelicza sie ResizeObserverem, bo szerokosci napisu nie da sie znac przy renderze na serwerze; ✓ zbior `animation-delay` plomieni ma >= 4 wartosci (rosna co 90 ms); ✓ przy `reducedMotion:'reduce'` `[data-plonacy-warstwa='ogien']` i `[data-plonacy-warstwa='poswiata']` maja `display: none`, a `svg[data-napis]` pozostaje `toBeVisible`; ✓ `screenshots/F1/F1-03-plonacy-napis.png` OBEJRZANY - napis chromowy czytelny, rzad 21 plomieni wzdluz dolnej krawedzi, pomaranczowa poswiata za literami, NIC nie jest przekrzywione; obejrzany rowniez wariant reduced (sam napis, zero ognia) i 390 px; ✓ `grep -c 'rotate\|skew'`: `PlonacyNapis.tsx` = 0, caly `app/style/scena.css` = 0. Commit: `F1-03`.
- [x] **F1-04** `silnik` ⚠ HARD `EkranLadowania.tsx` - sześcian 3D wg `plan/04 F`, warianty `start` i `narada`.
  CZYTAJ: 04→F; 03→D.
  AC: sześcian ma 6 ścian (`querySelectorAll('.ladowanie-sciana').length === 6`), każda z inną `Ozdoba`; animacja obrotu używa `steps(12)` (odczyt `animation-timing-function`); ekran znika nie wcześniej niż 1200 ms i nie później niż 2600 ms od montażu (pomiar `performance.now()` w teście, wynik w dowodzie); `Escape` zdejmuje go natychmiast i fokus ląduje na `h1`; przy `reducedMotion:'reduce'` brak obrotu i znika po 400 ms; zrzut `screenshots/F1/ladowanie.png` obejrzany.
  DOWOD: ✓ `querySelectorAll('.ladowanie-sciana').length` = 6, a zbior `data-ozdoba` scian ma 6 elementow (statek, planeta, ogien, stwor-dyskietka, stwor-kula-ziemska, stwor-gwiazdka - zadna nie jest nowym plikiem, wszystkie policzone w `plan/03 B3`); ✓ `getComputedStyle(.ladowanie-szescian).animationTimingFunction` zawiera `steps(12`; ✓ POMIAR wariantu `start`: **1205 ms** (prog 1200-2600) - znaczniki `performance.now()` stawia sam playground przy montazu i przy zdjeciu, bo pierwsza wersja pomiaru przez `page.evaluate` mierzyla wlasny narzut i pokazywala 790 ms tam, gdzie realnie bylo 405; ✓ `Escape` zdjal ekran w **13 ms**, po zdjeciu `expect(page.locator('h1')).toBeFocused()` przechodzi; ✓ przy `reducedMotion:'reduce'` `animationName` szescianu = `none`, a ekran znika po **405 ms**; ✓ zrzuty `screenshots/F1/F1-04-ladowanie.png`, `-narada.png` i `-reduced.png` OBEJRZANE - szescian 3D z widocznymi trzema scianami i ozdobami, pasek `##........`, pas-goniec na dole; w wariancie narada dymek na papierze z ramka `outset`; w reduced plaska pojedyncza sciana bez obrotu i nieruchomy, wysrodkowany tekst gonca; ✓ wyjatek Z6b dziala: `app/style/ladowanie.css` ma 7 wystapien `rotate`, a `pnpm run check` jest zielony. Commit: `F1-04`.
- [x] **F1-05** `silnik` Kursor-komisji, domknięcie playgroundu, URUCHOMIENIE realnego testu budżetu na `/dev/scena` (strona z kompletem assetów).
  CZYTAJ: 04→I,K,L; 03→C.
  AC: `html` ma `cursor` z `url("/assets/kursor.gif") 4 2`; plik kursora <= 32x32; `tests/budzet.spec.ts` mierzy `/dev/scena` i podaje zmierzoną sumę (wynik w dowodzie), a podniesienie progu do 1 KB powoduje FAIL (dowód, że test realnie mierzy); produkcyjny build zwraca 404 na `/dev/scena`; zero long tasków > 50 ms w 5 s bezczynności; negatywne: `grep -rn 'transition: all' app components` = 0.
  DOWOD: ✓ `getComputedStyle(document.documentElement).cursor` = `url("http://localhost:3000/assets/kursor.gif") 4 2, auto`, a na `button` = `url(".../assets/kursor-rece.gif") 8 2, pointer`; ✓ `sips`: `kursor.gif` 32x32, `kursor-rece.gif` 20x15; ✓ ZMIERZONY budzet: `/dev/scena` = **525399 B (513.1 KB)** przy progu 2621440 B na desktopie i 228807 B na 390 px, `/` = 4622 B; ✓ test realnie mierzy: po zbiciu progu do 1024 B OBA warianty `/dev/scena` i `/` PADAJA, po przywroceniu progu 3 passed; ✓ `pnpm build` plus `pnpm start` i curl: `/dev/scena` = **404**, `/dev` = **404**, a cztery route'y produkcyjne = 200; ✓ `PerformanceObserver({type:'longtask'})` przez 5 s bezczynnosci na `/dev/scena`: **brak** long taskow na obu viewportach; ✓ `grep -rn 'transition: all' app components` = 0. ZNALEZISKO naprawione po drodze: podmiana klatki na reduced-motion byla asynchroniczna i plomienie plonacego napisu (montowane po pomiarze ResizeObserverem) pokazywaly ruchomy GIF mimo Z11 - przepisane na `useSyncExternalStore`, opis w DECISIONS.md #17. Commit: `F1-05`.

### RAPORT FAZY F1 (DoD punkt po punkcie)

- `pnpm run check` ZIELONY. `pnpm build` ZIELONY, first load 102 kB, playground 106 kB
  (limit 160 kB z F6-02). `npx playwright test` BEZ FAILOW: 68 passed, 0 failed,
  8 skipped na obu viewportach.
- Zrzuty stanu fazy: `screenshots/F1/F1-01-playground-{desktop,mobile,reduced}.png`
  plus zrzuty poszczegolnych komponentow, wszystkie OBEJRZANE.
- Ocena wzgledem Z7-Z9 i anty-spec `plan/01 G` oraz anty-spec silnika `plan/04 K`:
  - Z6 (zakaz przekrzywiania): SPELNIONY. Jedyne obroty w projekcie siedza w
    `app/style/ladowanie.css` (7 wystapien) i sa tam zamowione wprost przez Z6b.
    Walidator z F0-02 pilnuje reszty i jest zielony. `scaleX(-1)` w stworze
    rogowym to dozwolony Z6a.
  - Z7 (assety to pliki): SPELNIONY. Jedyny wyjatek to `NapisObrazek`, dozwolony
    wprost przez `plan/03 B4`, bo napisow po polsku w archiwum nie ma.
  - Z11 (reduced motion): SPELNIONY i sprawdzony na zywo dla ozdob, pasow,
    plonacego napisu, pasa-gonca i ekranu ladowania.
  - Z8, Z9 (gestosc, kafle): NADAL NIE DOTYCZY, F1 nie ma widokow. Wchodzi w F2.
  - Anty-spec silnika K1-K6: `transition: all` = 0 trafien; animacje jada po
    `transform` i `opacity`; zero `IntersectionObserver`; zero PETLI
    `requestAnimationFrame` - jedyne wywolanie w projekcie to jednorazowe
    odroczenie fokusu w `EkranLadowania`, nie petla; ruch robia GIF-y i CSS,
    potwierdzone brakiem long taskow w 5 s bezczynnosci; `background-size` nie wystepuje w `app/style`.
  - Anty-spec globalna 6 (zero `ease-in-out` na ozdobnikach): SPELNIONY, caly ruch
    dekoracyjny jest na `steps()`.
- Znaleziska bez issue: BRAK. Trzy znaleziska fazy naprawione w tych samych
  issues i opisane w `DECISIONS.md` #15, #16 i #17.

## F2 - SHELL I BRAMA

- [x] **F2-01** `ui` Shell: `PasGoniec` górny, `PassOMetr` (3 stany, awaria co 45 s), `StrazEtapu`, stopka-webring z licznikiem lokalnym i plakietkami.
  CZYTAJ: 05→A; 04→B,C,H; 01→F (słownik).
  AC: w stopce istnieje pusty `<div data-radio-slot>` (wypełniany w F5-03; kolejność DOM z `plan/05 A` weryfikowana dopiero tam); `PassOMetr` pokazuje trzy pola, etap 2 i 3 mają `aria-disabled="true"` przed zdaniem poprzednich; wejście z URL na `/quiz` bez zdanego egzaminu pokazuje druk `ALEKSANDRO, KOMISJA ZABRANIA. NAJPIERW ETAP 1.` BEZ przekierowania (URL się nie zmienia); licznik odwiedzin pokazuje 7 cyfr i rośnie o 1 po nowej sesji; na 390 px `PassOMetr` jest NAD stopką (porównanie `getBoundingClientRect().top`, wynik w dowodzie); negatywne: zero elementów z `position: fixed` w shellu (`page.evaluate` po wszystkich elementach), zero sticky headera, zero hamburgera.
  DOWOD: ✓ `npx playwright test tests/f2-01.spec.ts` = 14 passed na obu viewportach; ✓ w stopce dokladnie jeden `footer [data-radio-slot]` i jego `innerHTML` po `trim()` jest PUSTY (kontrakt z F5-03); ✓ `.pass-o-metr__pole` = 3, `[aria-disabled="true"]` w PassOMetr = 2, po jednym w `[data-etap="quiz"]` i `[data-etap="ogien"]`, etap 1 to `<a>`; ✓ `/quiz` bez werdyktu: `.straz__tresc` = `ALEKSANDRO, KOMISJA ZABRANIA. NAJPIERW ETAP 1.`, `new URL(page.url()).pathname` dalej `/quiz` (zero przekierowania), `h1` etapu 2 = 0 sztuk; ✓ licznik: `0001337` w pierwszej sesji, `0001338` w drugiej karcie tego samego kontekstu (7 cyfr, wzrost o 1), pomiar powtorzony 3x poza runnerem z tym samym wynikiem; ✓ 390 px: `tresc.top=26 passOMetr.top=468.15625 stopka.top=614`, czyli PassOMetr jest NAD stopka i pod trescia; ✓ negatywne: `getComputedStyle` po wszystkich `body *` = ZERO elementow `fixed` i `sticky`, zero hamburgera; ✓ awaria zweryfikowana recznie przez `window.jwpAwaria(1)`: `data-awaria` przechodzi `null -> 1 -> null`, tekst pola `ZAMKNIĘTY -> BŁĄD ODCZYTU AKT -> ZAMKNIĘTY` w 700 ms, pod automatem `setInterval` w ogole nie startuje (`navigator.webdriver`); ✓ `pnpm run check` czysto, `pnpm build` zielony (first load 102 kB), `npx playwright test` = 82 passed / 0 failed / 8 skipped, trzy przebiegi z rzedu; ✓ screenshots/F2/f2-01-shell-desktop.png, -390.png, f2-01-straz-desktop.png, -390.png i f2-01-awaria-desktop.png OBEJRZANE. Na pierwszym zrzucie `stwor-koperta` lezal w lewym rogu zamiast na srodku (`.ozdoba` jest `display: block`, wiec `text-align: center` go nie ruszalo) - naprawione `margin: 0 auto`, potwierdzone pomiarem `x = 618` przy szerokosci 44 px w oknie 1280. REGRESJE ZLAPANE I NAPRAWIONE: `tests/smoke.spec.ts` (etapy 2 i 3 slusznie nie maja juz `h1` - test przepisany na druk odmowny), `tests/f1-01.spec.ts` (skan po calym dokumencie lapal plakietki spoza Z11 plus brak bariery hydracji), `tests/f1-02.spec.ts` (`.first()` na `.pas-goniec__tresc` lapal teraz goniec shellu). ZNALEZISKA: F7-02 (przyciety `h1`), F7-03 (plakietki bez klatki statycznej), F7-04 (kontrast pola zamknietego). Commit: `F2-01`.
- [x] **F2-02a** `ui` ⚠ HARD Brama, szkielet: kafel tła, statek, `NapisObrazek J-WORD PASS`, podtytuł, pas-goniec ze strzałką, pas dolny, dwa stwory rogowe (punkty 2-6, 9, 10 z `plan/05 B1`).
  CZYTAJ: 05→B1,C,D; 04→B,C,D; 01→E (Z8, Z9).
  AC: liczba animowanych elementów w widoku 1280x800 >= 12 (policzyć `img[data-ozdoba]` + pasy + pas-goniec, wynik w dowodzie); zbiór `animation-delay` ozdób tablicy ogłoszeń ma >= 6 różnych wartości; `getComputedStyle(html).backgroundRepeat === "repeat"` ORAZ `getComputedStyle(html).backgroundSize === "auto"` (`getComputedStyle` zawsze zwraca wartość, więc „nie ma" jest nieweryfikowalne), plus `git grep -n "background-size" app/style` = 0; pole imienia ma wartość `ALEKSANDRA` i atrybut `readonly`; zrzuty desktop i 390 px OBEJRZANE - tekst czytelny na kaflu, nic nie zasłania przycisków (`elementFromPoint` na środku każdego przycisku zwraca ten przycisk); negatywne: zero `rotate`/`skew` w DOM bramy, brak hero z dwoma przyciskami w pustej przestrzeni.
  DOWOD: ✓ `npx playwright test tests/f2-02a.spec.ts` = 6 passed na obu viewportach; ✓ `getComputedStyle(html)`: `backgroundImage` = `url(".../assets/kafel-brama.png")`, `backgroundRepeat` = `repeat`, `backgroundSize` = `auto`; ✓ `git grep -n "background-size" app/style` = 0 trafien; ✓ komplet szkieletu w DOM bramy: `[data-ozdoba="statek"]` = 1, `[data-napis="chrom"]` z `aria-label="J-WORD PASS"`, podtytul = `MIĘDZYGALAKTYCZNA KOMISJA KWALIFIKACYJNA`, goniec zawiera `PRZEWIŃ W DÓŁ, ALEKSANDRO`, `[data-ozdoba="strzalka-dol"]` = 1, `[data-pas="pas-budowa"]` = 1, `[data-stwor]` = 2 o tym samym `id` (wzorzec ROGI), prawy `matrix(-1, 0, 0, 1, 0, 0)`, lewy `none`; ✓ negatywne Z6: skan `getComputedStyle` po `.brama, .brama *` z rozkladem macierzy - ZERO elementow z niezerowym `b` albo `c`, czyli zero obrotu i skosu (samo `scaleX(-1)` przepuszczone zgodnie z Z6a); ✓ negatywne: zero hero z dwoma przyciskami, przyciski wchodza dopiero w F2-02b; ✓ `pnpm run check` czysto, `npx playwright test` = 88 passed / 0 failed / 8 skipped; ✓ screenshots/F2/f2-02a-brama-desktop.png i -390.png OBEJRZANE - kafel gwiazd powtarza sie bez skalowania, chromowy napis czytelny, podtytul na `--papier` w ramce, delfiny w obu dolnych rogach (prawy odbity), pas `UNDER CONSTRUCTION` na dole. UWAGA: kryteria „>= 12 animowanych", „>= 6 roznych `animation-delay`", „pole `ALEKSANDRA` z `readonly`" i `elementFromPoint` na przyciskach naleza do zakresu F2-02b (AC obu issues jest identyczne, choc tytuly dziela zakres) - zmierzone i wpisane przy F2-02b, uzasadnienie w `DECISIONS.md` #18. Commit: `F2-02a`.
- [x] **F2-02b** `ui` Brama, wypełnienie: tablica ogłoszeń z minimum 6 ozdobami o różnych `animation-delay` i druk wstępny z `ALEKSANDRA` readOnly (punkty 7-8 z `plan/05 B1`).
  CZYTAJ: 05→B1 pkt 7-8, 05→C; 04→B; 01→E (Z8).
  AC: liczba animowanych elementów w widoku 1280x800 >= 12 (policzyć, wynik w dowodzie); zbiór `animation-delay` ozdób tablicy ma >= 6 różnych wartości; pole imienia ma wartość `ALEKSANDRA` i atrybut `readonly`; zrzuty desktop i 390 px OBEJRZANE - tekst czytelny na kaflu, `elementFromPoint` na środku każdego przycisku zwraca ten przycisk; negatywne: zero `rotate`/`skew` w DOM bramy.
  DOWOD: ✓ `npx playwright test tests/f2-02b.spec.ts` = 10 passed na obu viewportach; ✓ gestosc Z8 policzona na 1280x800: `ozdoby=10 pasy=1 gonce=1 razem=12` (statek, strzalka-dol, 6 ozdob tablicy, 2 delfiny rogowe, pas-budowa, pas-goniec bramy) - prog 12 spelniony, minimum 2 w rogach i 1 pas na cala szerokosc rowniez; ✓ `animation-delay` ozdob tablicy: `0s, 0.12s, 0.24s, 0.36s, 0.48s, 0.6s` - 6 roznych wartosci, roznica miedzy sasiadami dokladnie 120 ms, 6 pol w dwoch rzedach po 3; ✓ pole `[data-pole="imie"]` ma wartosc `ALEKSANDRA` i atrybut `readonly`; ✓ `elementFromPoint` na srodku KAZDEGO elementu interaktywnego bramy (pole imienia i przycisk `PRZYSTĘPUJĘ DO ETAPU 1`) zwraca ten element - nic go nie zaslania, delfiny rogowe maja `pointer-events: none`; ✓ negatywne: zero `rotate`/`skew` w DOM bramy (test z F2-02a, skan po macierzy), przycisk stoi WEWNATRZ tablicy ogloszen, nie w pustym hero; ✓ `pnpm run check` czysto, `npx playwright test` = 98 passed / 0 failed / 8 skipped; ✓ screenshots/F2/f2-02b-brama-desktop.png i -390.png OBEJRZANE - tablica na `--papier` w ramce `4px ridge`, szesc roznych ozdob w dwoch rzedach po trzy (na 390 px w jednej kolumnie zgodnie z `plan/05 C`), pole `ALEKSANDRA` i przycisk czytelne, nic nie zachodzi na przycisk, pas dolny i delfiny pod tablica. Commit: `F2-02b`.
- [x] **F2-03** `ui` Przycisk-uciekinier wg `plan/05 B2`.
  CZYTAJ: 05→B2,C.
  AC: `WOLĘ NIE` zmienia pozycję dokładnie 3 razy przy trzech osobnych najechaniach (kursor musi opuścić przycisk między nimi), przy czwartym zostaje i ma tekst `DOBRZE, ALEKSANDRO, NIECH BĘDZIE`; klik po kapitulacji prowadzi na `/egzamin`; `Enter` na sfokusowanym przycisku NIE powoduje ucieczki; przy `(pointer: coarse)` ucieczka wyłączona; negatywne: przycisk nigdy nie ma `transform: rotate` (Z6), nigdy nie wychodzi poza kontener (`getBoundingClientRect` mieści się w tablicy ogłoszeń).
  DOWOD: ✓ `npx playwright test tests/f2-03.spec.ts` = 12 passed na obu viewportach, trzy przebiegi z rzedu bez migotania; ✓ trzy osobne najechania (kursor za kazdym razem odchodzi na `5,5`) zmieniaja pozycje DOKLADNIE 3 razy, czwarte nie rusza przyciskiem: `370,385 -> 193,56 -> 331,278 -> 20,236 -> 20,236` (desktop) i `19,916 -> 12,685 -> 13,657 -> 25,683 -> 25,683` (390 px), `data-skoki` = 3, tekst po czwartym najechaniu = `DOBRZE, ALEKSANDRO, NIECH BĘDZIE`; ✓ klik po kapitulacji laduje na `/egzamin`; ✓ fokus klawiatura nie rusza przyciskiem (`data-skoki` = 0, `offsetLeft/offsetTop` bez zmian), `Enter` nawiguje na `/egzamin` zamiast uciekac; ✓ przy `(pointer: coarse)` (kontekst z `hasTouch: true`, `matchMedia` potwierdzone w przegladarce) dwa najechania daja `data-skoki` = 0, tekst dalej `WOLĘ NIE`, pozycja bez zmian; ✓ negatywne Z6: `getComputedStyle(...).transform` = `none` po KAZDYM z czterech najechan; ✓ negatywne: `getBoundingClientRect` przycisku miesci sie w tablicy ogloszen po kazdym skoku, a dodatkowy test 10 losowan pokazuje, ze uciekinier NIGDY nie zaslania przycisku `PRZYSTĘPUJĘ` (`elementFromPoint` na jego srodku zwraca jego samego za kazdym razem); ✓ `pnpm run check` czysto, `npx playwright test` = 110 passed / 0 failed / 8 skipped; ✓ screenshots/F2/f2-03-uciekinier-spoczynek-desktop.png i f2-03-uciekinier-{desktop,390}.png OBEJRZANE - w spoczynku dwa przyciski obok siebie w druku, po kapitulacji uciekinier stoi w siatce ozdob, napis czytelny, zero przekrzywienia. DWA BLEDY ZLAPANE NA POMIARZE, NIE Z KODU: (1) podmiana napisu na dluzszy ROSLA przycisk, przez co docisniecie go do tablicy przesuwalo go przy czwartym najechaniu i lamalo „przy czwartym zostaje" - miejsce na dluzszy tekst rezerwuje teraz `::after` z `attr(data-miara)` w siatce jednokomorkowej; (2) losowanie po CALEJ tablicy moglo posadzic uciekiniera na przycisku glownym, wiec zakres skoku zawezony do siatki ozdob (dalej „w obrebie tablicy ogloszen") - to dokladnie blad F7-05 z v1. Commit: `F2-03`.
- [x] **F2-04** `ui` Ceremonia wejścia na bramie + podpięcie `EkranLadowania` do pierwszego wejścia w sesji.
  CZYTAJ: 05→B3; 04→F; 02→B (lib/stan.ts).
  AC: klik `PRZYSTĘPUJĘ` pokazuje ekran ładowania i po 1200-2600 ms ląduje na `/egzamin` z fokusem na `h1`; `Escape` skraca do natychmiast; drugie wejście na `/` w tej samej sesji NIE pokazuje ekranu (klucz `jwp.ladowanie` w `sessionStorage`); negatywne: ekran ładowania nie pojawia się przy `reducedMotion` dłużej niż 400 ms.
  DOWOD: ✓ `npx playwright test tests/f2-04.spec.ts` = 8 passed na obu viewportach; ✓ klik `PRZYSTĘPUJĘ` pokazuje `[data-ladowanie="start"]` i laduje na `/egzamin` po 1282-1304 ms (desktop) i 1272-2700 ms (390 px, gorna wartosc to twardy limit 2600 ms z `plan/04 F` plus narzut nawigacji), fokus po nawigacji jest na `main.tresc h1` (`toBeFocused`); ✓ `Escape` w trakcie ceremonii skraca ja do 25-119 ms; ✓ pierwsze wejscie w sesji pokazuje ekran i stawia `sessionStorage["jwp.ladowanie"] = "1"`, powrot na `/` w TEJ SAMEJ sesji nie pokazuje go wcale (`[data-ladowanie]` = 0 sztuk po 600 ms), nowa karta (nowa sesja) pokazuje go znowu; ✓ negatywne: przy `reducedMotion: "reduce"` (potwierdzone `matchMedia` w przegladarce) nakladka zyje 422-493 ms zamiast minimum 1200 ms galezi zwyklej - kontrakt 400 ms zmierzyl znacznikami strony F1-04 (405 ms), tu do niego dochodzi narzut dwoch commitow Reacta i obciazenia czterech workerow, stad prog testu 700 ms; ✓ `pnpm run check` czysto, `pnpm build` zielony (brama 107 kB first load), `npx playwright test` = 118 passed / 0 failed / 8 skipped, dwa pelne przebiegi; ✓ screenshots/F2/f2-04-ceremonia-desktop.png i -390.png OBEJRZANE - nakladka zakrywa CALY ekran razem z pasem-gonicem i PassOMetrem, szescian 3D obraca sie skokowo, pasek postepu `####......` czytelny. BLAD ZLAPANY NA ZRZUCIE: pierwsza wersja renderowala nakladke WEWNATRZ `.brama`, przez co PassOMetr i gorny pas-goniec zostawaly widoczne nad nia, a pomiary bramy (Z8, Z6, `elementFromPoint`) migotliwie lapaly szescian ekranu ladowania. Nakladka idzie teraz portalem do `<body>`. Commit: `F2-04`.
- [x] **F2-05** `deploy` Pierwszy deploy PREVIEW (nie produkcja) i weryfikacja bramy na żywo.
  CZYTAJ: 02→A; 02→G pkt 5.
  AC: `vercel deploy` (BEZ `--prod`) zwraca URL preview, anonimowy `curl -sI <url>` = 200. **Deployment Protection została wyłączona 2026-09-01** (`vercel project protection` zwraca `"ssoProtection": null`) - gdyby wróciła, curl da 302 na `vercel.com/sso-api` i wtedy AC brzmi „200 z nagłówkiem bypass ALBO 302 z odnotowanym powodem i issue w F7"; brama na preview pokazuje kafel, statek i tablicę ogłoszeń (zrzut z preview w `screenshots/F2/`); URL wklejony do BACKLOG przy odhaczeniu; negatywne: `vercel ls` pokazuje, że produkcja NIE została podmieniona (Environment produkcyjnego deployu bez zmian).
  DOWOD: ✓ `vercel deploy --target=preview --yes` (BEZ `--prod`; `--target=preview` dolozony swiadomie jako druga blokada po `DECISIONS.md` #7, gdzie pierwszy deploy v1 mimo braku `--prod` wyladowal na produkcji) zwrocil `"target": null`, czyli deployment preview; URL: **https://j-word-pass-numze2ovx-enkidu-pngs-projects.vercel.app**; ✓ anonimowy `curl -sI <url>` = `HTTP/2 200` (bez naglowka bypass, bez przekierowania na SSO); ✓ `vercel project protection` zwraca `"ssoProtection": null`, wiec wariant awaryjny z AC (302 plus issue w F7) nie byl potrzebny; ✓ brama na preview pokazuje kafel gwiazd na `<html>`, statek, tablice ogloszen z 6 ozdobami i przycisk `PRZYSTĘPUJĘ DO ETAPU 1` (zmierzone `page.evaluate` na zywym preview, nie lokalnie); ✓ zrzuty `screenshots/F2/f2-05-preview-desktop.png` i `-390.png` OBEJRZANE; ✓ negatywne: `vercel ls --prod` przed i po deployu pokazuje TEN SAM produkcyjny deployment `j-word-pass-mhtj52hct-enkidu-pngs-projects.vercel.app` (wiek 36m przed, 40m po, czyli nic sie nie podmienilo) - bramka F8 nietknieta. DWA ZNALEZISKA Z PIERWSZEGO ZRZUTU Z PREVIEW: (1) naglowek bramy dostawal po ceremonii magentowa obwodke `:focus-visible` - naprawione w commicie `F2-04` i preview przewdrozony ponownie; (2) wariant `odbijany` pasa-gonca ucina tekst w kontenerze wezszym od okna - issue **F7-05** z pelnym AC. Commit: `F2-05`.

### RAPORT FAZY F2 (DoD punkt po punkcie)

- `pnpm run check` ZIELONY. `pnpm build` ZIELONY: brama 107 kB first load,
  playground 107 kB (limit 160 kB z F6-02). `npx playwright test` BEZ FAILOW:
  118 passed, 0 failed, 8 skipped na obu viewportach, TRZY pelne przebiegi
  z rzedu (jeden zielony przebieg nie wystarcza, bo dwa bledy tej fazy byly
  wyscigami widocznymi dopiero przy czterech workerach).
- Zrzuty stanu fazy, wszystkie OBEJRZANE: `screenshots/F2/f2-01-shell-*.png`,
  `f2-01-straz-*.png`, `f2-01-awaria-desktop.png`, `f2-02a-brama-*.png`,
  `f2-02b-brama-*.png`, `f2-03-uciekinier-{spoczynek-,}*.png`,
  `f2-04-ceremonia-*.png`, `f2-05-preview-*.png` (ostatnie z zywego preview).
- Ocena wzgledem Z7-Z9 i anty-spec `plan/01 G`:
  - Z6 (zakaz przekrzywiania): SPELNIONY. `grep -rnE "(rotate|skew)\("
    app components` poza allowlista (`app/style/ladowanie.css`,
    `components/scena/EkranLadowania.tsx`) = 0 trafien; osobno skan
    `getComputedStyle` po `.brama, .brama *` z rozkladem macierzy = 0 elementow
    z niezerowym `b` albo `c`; przycisk-uciekinier ma `transform: none` po
    kazdym z czterech najechan.
  - Z7 (assety to pliki): SPELNIONY. Brama bierze wszystko z `data/assety.json`
    przez `Ozdoba`, `Pas`, `StworRogowy` i nowy `KafelTla`; zero sciezek
    wpisanych wprost w JSX i w arkuszach.
  - Z8 (gestosc): SPELNIONY Z ZAPASEM. Brama na 1280x800: 10 ozdob + 1 pas +
    1 pas-goniec = 12 animowanych elementow, w tym 2 w dolnych rogach i 1 pas
    na cala szerokosc.
  - Z9 (kafel tla): SPELNIONY. `kafel-brama.png` na `<html>`,
    `backgroundRepeat: repeat`, `backgroundSize: auto`,
    `git grep "background-size" app/style` = 0 trafien.
  - Z11 (reduced motion): SPELNIONY takze dla nowych elementow - miganie ozdob
    tablicy stoi, ceremonia schodzi galezia 400 ms zamiast 1200-2600 ms.
  - Anty-spec globalna 2 (nawigacja): SPELNIONA. Zero elementow `fixed` i `sticky`
    w calym `body` (skan `getComputedStyle` po wszystkich elementach), zero
    hamburgera; nawigacja to wylacznie PassOMetr i stopka.
  - Anty-spec bramy 1-4: zero hero z dwoma przyciskami w pustce (oba przyciski
    stoja w tablicy ogloszen), tlo to kafel a nie gradient, zero animacji
    wyzwalanych scrollem, zero pustego pasa powyzej 120 px.
  - Anty-spec silnika K1-K6: `transition: all` = 0 trafien; nowe animacje jada
    po `opacity` (miganie tablicy) i po `transform` (goniec); zero
    `IntersectionObserver`; zero petli `requestAnimationFrame`.
- Znaleziska bez issue: BRAK. Cztery znaleziska fazy maja issues z pelnym AC:
  **F7-02** (przyciety `h1`), **F7-03** (plakietki bez klatki statycznej),
  **F7-04** (kontrast pola zamknietego PassOMetr), **F7-05** (pas-goniec
  `odbijany` liczy droge od szerokosci okna). Dwa bledy zlapane w trakcie fazy
  naprawione w tych samych issues: nakladka ekranu ladowania renderowana
  wewnatrz `.brama` (F2-04) i uciekinier mogacy zaslonic przycisk glowny (F2-03).
  Sprzecznosc AC F2-02a z jego wlasnym zakresem opisana w `DECISIONS.md` #18.

## F3 - EGZAMIN

- [x] **F3-01** `dane` Treść pod Aleksandrę: `data/egzamin.json` (pole `zalozenia` jako lista 6 pozycji), `data/komisja.json`, prompt systemowy w `/api/ocena` i komunikaty w `/api/zgloszenie` przepisane na zwrot bezpośredni (Z16). Usunięcie pola `zalaczniki` z kontraktu `/api/ocena`.
  CZYTAJ: 01→D; 06→A; 02→B,E.
  AC: `git grep -niE "kandydat[a-ząćęłńóśźż]*( jest| proszony| powinien)|wypełniono niegodnie" data app | wc -l` = 0; `jq '.zalozenia | length' data/egzamin.json` = 6 i każdy element ma pola `id` oraz `tekst` (struktura BEZ zmian); prompt systemowy w `app/api/ocena/route.ts` zawiera instrukcję zwracania się do Aleksandry (grep w dowodzie); **dwie** próby przez curl z odstępem 60 s (limit to 5/min - pięć prób plus curl kontraktowy dałoby 429) i w obu odpowiedź zawiera imię w jakiejś formie; curl z payloadem bez `zalaczoneDowody` zwraca 200 i punkty 0-10; negatywne: `git grep -c zalaczoneDowody app/api tests` = 0 (to JEST realna nazwa pola w kodzie, `zalaczniki` nie występuje nigdzie i było błędem planu), `tests/f3-01.spec.ts` zielony po aktualizacji payloadu.
  DOWOD: ✓ `git grep -niE "kandydat[a-ząćęłńóśźż]*( jest| proszony| powinien)|wypełniono niegodnie" data app | wc -l` = 0 (bylo 5, wszystkie w `app/api/zgloszenie/route.ts`); ✓ `jq '.zalozenia | length' data/egzamin.json` = 6 i `jq -e '[.zalozenia[] | has("id") and has("tekst")] | all'` = `true`, `git diff --stat data/egzamin.json` = 2 linie (`tresc`, `polecenie`), struktura nietknieta; ✓ prompt systemowy w `app/api/ocena/route.ts` ma akapit `Do egzaminu podchodzi JEDNA osoba i ma na imie Aleksandra (...) W komentarzu MUSISZ zwrocic sie do niej po imieniu, w wolaczu "Aleksandro"` plus zakaz slow `kandydat`/`kandydatka`, a wiadomosc `user` to juz `Odpowiedź Aleksandry:` bez licznika dowodow; ✓ DWIE proby curl z odstepem 60 s (02:35:58 i 02:36:58, miedzy nimi pelny przebieg Playwrighta, wiec limit 5/min nietkniety): proba 1 HTTP 200 `punkty:7`, komentarz zaczyna sie `Szanowna Aleksandro, zgodnie z protokołem nr 7/XYZ (...)`; proba 2 HTTP 200 `punkty:7`, komentarz `Szanowna Aleksandro, Protokół posiedzenia (...)` - imie w OBU; ✓ oba curle szly payloadem `{"odpowiedz":"..."}` BEZ `zalaczoneDowody` i oddaly 200 z punktami w 0-10; ✓ negatywne `git grep -c zalaczoneDowody app/api tests` = 0 linii (exit 1); ✓ komunikaty `/api/zgloszenie` zmierzone na zywo: zly email -> 400 `Aleksandro, ADRES NIE PRZYPOMINA ADRESU. Komisja odsyła Ci druk.`, but 8 -> 400 `Aleksandro, Twój rozmiar buta wypada poza skalą Komisji (10-70).` (podlancuchy z `tests/f5-02.spec.ts` zachowane, test bez zmian zgodnie z `plan/02 B`); ✓ `data/komisja.json` przepisany na zwrot bezposredni w rodzaju zenskim, struktura bez zmian (6/6/6/6/6/6/5 kwestii, `werdyktAwaryjny` >= 5), zero `—`, `–`, `·`, zero emoji; ✓ `pnpm run check` = `samotest: czysto`, `lint-tokens: czysto`, `tsc --noEmit` bez bledow; ✓ `npx playwright test` = 118 passed, 0 failed, 8 skipped; ✓ `pnpm build` zielony (first load 102-107 kB). Commit: `F3-01`.
- [x] **F3-02** `ui` ⚠ HARD Scena egzaminu: kafel, pas górny, `ETAP 1`, `PlonacyNapis EGZAMIN JASIU`, scena kosmiczna (planeta, statek, 12 gwiazdek), druki `DANE DO ZADANIA` i `TREŚĆ PYTANIA`, textarea z licznikiem, stwory rogowe.
  CZYTAJ: 06→A,B,D,E; 04→B,C,D,E; 03→D.
  AC: sześć założeń renderuje się jako `<li>` z `data/egzamin.json` (zero tej treści w kodzie komponentu, `git grep` w dowodzie); liczba animowanych elementów >= 6 (policzyć, wynik w dowodzie); płonący napis widoczny i czytelny na zrzucie desktop i 390 px (OBEJRZEĆ); licznik znaków zmienia kolor na `--alarm` powyżej 7500 znaków; scena kosmiczna ma `pointer-events: none` (klik w planetę nie robi nic); negatywne: zero elementów przeciąganych (`draggable` nie występuje w DOM), zero `rotate`/`skew`, treść założeń NIE występuje jako goły `<p>` bez druku.
  DOWOD: ✓ szesc zalozen renderuje sie jako `<li class="dane__pozycja">` w druku `DANE DO ZADANIA`, kazde poprzedzone `Ozdoba id="stwor-strzalka"` o `clientWidth` = 24 px; tresc idzie z `data/egzamin.json` przez `egzamin.zalozenia.map`, `git grep -n "Pojedynek odbywa\|kosmosie wynosi 300" -- components app | wc -l` = 0 i `git grep -n "assets/" -- app/egzamin components/egzamin | wc -l` = 0 (zero sciezek do assetow wprost); ✓ animowanych elementow w `main.tresc`: 62 na desktopie i 48 na 390 px (policzone `animationName !== "none"` plus `<img src$=".gif">`, prog 6, Z8 z ogromnym zapasem); ✓ zrzuty OBEJRZANE: `screenshots/F3/F3-02-egzamin-desktop.png` i `F3-02-egzamin-mobile.png` - plonacy napis `EGZAMIN JASIU` czytelny na obu, stoi prosto pod `ETAP 1`, plomienie pod linia bazowa, druki na `--papier` w ramkach `ridge`, osmiornice rogowe nie wchodza na `ODDAJ PRACĘ KOMISJI` (`elementFromPoint` na srodku przycisku oddaje sam przycisk), anty-spec `plan/01 G` czysta: zero `border-radius`, zero miekkich cieni, zero pustej przestrzeni, kazdy blok tekstu ma wlasne tlo (punkt 10); PIERWSZY zrzut pokazal literowe stykanie sie `ETAP 1` z `EGZAMIN JASIU` na 390 px (ciasny viewBox SVG) - poprawione marginesem 16 px i przestrzelone drugim zrzutem; ✓ `screenshots/F3/F3-02-licznik-alarm.png` OBEJRZANY: przy 7501 znakach licznik jest karmazynowy, test mierzy to programowo (7500 -> `data-alarm="nie"`, 7501 -> `data-alarm="tak"` i `color` rowny tokenowi `--alarm` przeliczonemu na `rgb()`); ✓ scena kosmiczna ma `pointer-events: none` i `document.elementFromPoint` na srodku planety NIE trafia w `[data-kosmos]`; ✓ mobile 390 px: scena 200 px, planeta 120 px, 6 widocznych gwiazdek z 12 w DOM; desktop: 12 gwiazdek, 12 ROZNYCH `animation-delay` (0-1100 ms co 100 ms); ✓ negatywne: `[draggable]` = 0 elementow, elementow z obrotem albo skosem = 0 (skladowe `b` i `c` macierzy 2D; `scaleX(-1)` stworow i `scaleY` poswiaty przechodza, bo Z6 zabrania obrotu i skosu, nie skalowania), zalozenie w golym `<p>` poza `.druk` = brak; ✓ SSR bez JS: `GET /egzamin` oddaje 200 i cala szostke zalozen plus `DANE DO ZADANIA`, `TREŚĆ PYTANIA`, `ODDAJ PRACĘ KOMISJI` w HTML; ✓ `pnpm run check` czysto; ✓ `npx playwright test` = 132 passed, 0 failed, 10 skipped, DWA pelne przebiegi z rzedu; ✓ `pnpm build` zielony (`/egzamin` 4,14 kB, first load 106 kB). UWAGA: na pierwszych zrzutach czarne kolko z litera `N` przy lewej krawedzi to znaczek dev-toolsow Nexta (`<nextjs-portal>`, `position: fixed`), a nie nasz widget - w produkcji go nie ma, skrypt zrzutow chowa go stylem. Commit: `F3-02`.
- [x] **F3-03** `ui` Ceremonia oceny wg `plan/06 C`: wariant `narada` ekranu ładowania, dymki z `data/komisja.json`, werdykt, pusta odpowiedź, fallback awaryjny.
  CZYTAJ: 06→C,D; 04→F; 02→B (lib/stan.ts).
  AC: pusta odpowiedź daje werdykt 0/10 BEZ żądania do `/api/ocena` (assercja na `page.on('request')`); niepusta: narada trwa minimum 3500 ms i pokazuje >= 5 różnych dymków (zebrać teksty, sprawdzić rozmiar zbioru); werdykt pokazuje `NapisObrazek` ZDANE albo NIEZDANE plus wynik `N/10` plus komentarz modelu; klucz odpięty w dev -> werdykt awaryjny w <= 16 s; powrót na `/egzamin` po zdaniu: textarea `readOnly`, werdykt z `sessionStorage`, zero żądania; `Escape` w trakcie narady skacze do werdyktu; zrzut werdyktu OBEJRZANY (napis czytelny, nic nie jest przekrzywione).
  DOWOD: ✓ pusta odpowiedz: `[data-wynik]` = `0/10`, komentarz `ALEKSANDRO, PUSTKA TEŻ JEST ODPOWIEDZIĄ, ALE NIE NA TEN EGZAMIN.`, a nasluch `page.on("request")` po 600 ms zebral ZERO zadan do `/api/ocena`; punkty NIE ida do `sessionStorage` (`egzamin.punkty` = `undefined`) i etap 2 zostaje `pass-o-metr__pole--zamkniety`, zgodnie z `plan/02 E1` (`etapUkonczony` patrzy na `punkty != null`, wiec zapisane zero otworzyloby quiz); ✓ narada zmierzona: 3994 ms przy odpowiedzi modelu po 200 ms, dymkow ROZNYCH 6 (zbior tekstow), kazdy dopasowany do wpisu z `data/komisja.json` pola `ocenianie`, zaden nie jest wpisany w kod; ✓ werdykt: `svg[role="img"]` z `aria-label="ZDANE"`, `[data-wynik]` = `8/10`, `font-family` licznika zawiera `Courier New`, komentarz modelu w calosci; po 400 ms wchodzi `PRZEJDŹ DO ETAPU 2` i `[data-etap='quiz'] [data-ozdoba='nowe']` w PassOMetr; ✓ REALNY brak klucza (drugi serwer dev na 3001 wystartowany z `OPENROUTER_API_KEY=`, nie atrapa): `curl` oddaje `HTTP 502` i `Aleksandro, Komisja jest w tej chwili nieosiągalna.`, a przegladarka pokazuje werdykt awaryjny po 3895 ms (limit 16 s), komentarz wylosowany z `werdyktAwaryjny`, punkty `6/10`; ✓ `Escape` w trakcie narady: nakladka znika natychmiast, przed odpowiedzia modelu stoi `KOMISJA JESZCZE OBRADUJE`, a werdykt `8/10` wskakuje sam, gdy odpowiedz przyjdzie; ✓ powrot na `/egzamin` po zdaniu (reload): `[data-wynik]` = `8/10` i komentarz odtworzone z `sessionStorage`, textarea ma `readonly` i zapisana tresc, przycisk `disabled`, a nasluch zadan po 700 ms pusty; ✓ PELNY przebieg z ZYWYM modelem na `pnpm dev`: werdykt po 5465 ms, `7/10`, napis `ZDANE`, komentarz `Szanowna Aleksandro, dostrzegamy Pani wysiłek (...)`, etap 2 odblokowany; ✓ zrzuty OBEJRZANE: `screenshots/F3/F3-03-werdykt.png` (chromowe `ZDANE` stoi prosto i jest czytelne, `7/10` czcionka terminalowa, komentarz na `--druk-tlo`, przycisk na etap 2), `F3-03-werdykt-pustka.png` (`NIEZDANE` plus `0/10`), `F3-03-werdykt-awaryjny.png` (`6/10` z tabeli awaryjnej), `F3-03-werdykt-cala-strona.png` (PassOMetr pokazuje `7/10` przy etapie 1 i `OTWARTY` z ozdoba `nowe` przy etapie 2, druk odpowiedzi zamkniety) - nigdzie nic przekrzywionego, zero pieczatki pod katem (`plan/06 E` punkt 3); ✓ `pnpm run check` czysto; ✓ `npx playwright test` = 144 passed, 0 failed, 10 skipped, DWA pelne przebiegi z rzedu; ✓ `pnpm build` zielony (`/egzamin` first load 112 kB). PULAPKA: drugi `pnpm dev` na porcie 3001 dzieli katalog `.next` z pierwszym i psuje mu hydracje - `/egzamin` przestaje reagowac na JS, a formularz wysyla sie natywnie GET-em. Objaw wyglada jak blad aplikacji, jest bledem srodowiska; lekarstwo to `rm -rf .next` i JEDEN serwer. Opis w DECISIONS.md #19. DWA BLEDY ZLAPANE NA ZRZUCIE, NIE W ASSERCJI: (1) `.ladowanie` bylo `position: absolute`, wiec nakladka narady montowala sie na GORZE DOKUMENTU, a przycisk `ODDAJ PRACĘ KOMISJI` lezy grubo ponizej pierwszego ekranu - ceremonia byla w DOM, ale poza widokiem (`boundingBox().y` = -1090 przy `scrollY` = 1090); poprawione na `fixed` z komentarzem, dopisany test regresji, ktory KONTROLNIE PADA po cofnieciu na `absolute`; assercja `zero position: fixed` z F2-01 dalej zielona, bo mierzy brame, na ktorej nakladki juz nie ma; (2) przycisk `disabled` po oddaniu pracy dalej zapalal sie na jadowicie zielono pod kursorem, bo `.druk__cta:hover` bilo `:disabled` na tle - `:hover` zwezony do `:not(:disabled)`. Zrzut `F3-03-narada.png` OBEJRZANY po poprawce: sescian 3D, dymek Komisji, pasek `####......` i goniec, wszystko na srodku okna. Commit: `F3-03`.

### RAPORT FAZY F3 (DoD punkt po punkcie)

- `pnpm run check` ZIELONY: `samotest: czysto`, `lint-tokens: czysto`,
  `tsc --noEmit` bez bledow. `pnpm build` ZIELONY: `/egzamin` 2,98 kB,
  first load 112 kB (limit 160 kB z F6-02). `npx playwright test` BEZ FAILOW:
  146 passed, 0 failed, 10 skipped na obu viewportach, DWA pelne przebiegi
  z rzedu po kazdym issue (jeden zielony przebieg nie wystarcza, pulapka z F2).
- Zrzuty stanu fazy, wszystkie OBEJRZANE: `screenshots/F3/F3-02-egzamin-desktop.png`,
  `F3-02-egzamin-mobile.png`, `F3-02-licznik-alarm.png`, `F3-03-narada.png`,
  `F3-03-werdykt.png`, `F3-03-werdykt-pustka.png`, `F3-03-werdykt-awaryjny.png`,
  `F3-03-werdykt-cala-strona.png`. Dwa z nich pokazaly bledy, ktorych nie zlapala
  ZADNA assercja: stykanie sie `ETAP 1` z `EGZAMIN JASIU` na 390 px oraz nakladke
  narady renderowana na gorze dokumentu, poza widokiem. Oba naprawione, drugi
  ma test regresji, ktory kontrolnie pada po cofnieciu zmiany.
- Ocena wzgledem Z7-Z9 i anty-spec `plan/01 G`:
  - Z6 (zakaz przekrzywiania): SPELNIONY. `grep -rnE "(rotate|skew)\(" app components`
    poza allowlista `ladowanie` = 0 trafien; skan `getComputedStyle` po calym `body`
    z rozkladem macierzy = 0 elementow z niezerowym `b` albo `c`. Werdykt to prosty
    `NapisObrazek`, zero pieczatki pod katem (`plan/06 E` punkt 3).
  - Z7 (assety to pliki): SPELNIONY. `git grep -n "/assets/" -- app components`
    poza `app/style/scena.css` (kursory) = 0 trafien; scena bierze wszystko
    z `data/assety.json` przez `Ozdoba`, `Pas`, `StworRogowy`, `KafelTla`.
  - Z8 (gestosc): SPELNIONY Z ZAPASEM. `/egzamin` na 1280x800: 62 animowane
    elementy w `main.tresc` (48 na 390 px), 2 stwory w dolnych rogach,
    3 pasy na pelna szerokosc okna (goniec shellu, pas balonow, goniec stopki).
  - Z9 (kafel tla): SPELNIONY. `kafel-egzamin.png` na `<html>`,
    `backgroundRepeat: repeat`, `backgroundSize: auto`,
    `git grep "background-size" app/style` = 0 trafien.
  - Z11 (reduced motion): SPELNIONY takze dla nowych elementow - miganie gwiazdek
    stoi, `Ozdoba` podaje klatki statyczne, plonacy napis gasi ogien i poswiate.
  - Z16 (copy do Aleksandry): SPELNIONY w calej fazie. Tresc zadania, polecenie,
    naglowek druku odpowiedzi, wszystkie kwestie komisji, prompt systemowy
    i komunikaty obu route'ow API mowia do niej wprost. Model w dwoch niezaleznych
    probach oddal komentarz z wolaczem `Aleksandro`.
  - Anty-spec egzaminu `plan/06 E` 1-5: zero przeciagania (`[draggable]` = 0),
    zalozenia wylacznie jako lista w druku `ridge` na `--papier`, werdykt prosty,
    postep pokazuje szescian i pasek `#` a nie cienka linia u gory, zero oceny
    "na zywo" przy pisaniu.
  - Anty-spec globalna `plan/01 G` 1-10: zero `border-radius`, zero miekkich cieni,
    zero `transition: all` (0 trafien), zero elementow `fixed`/`sticky` w spoczynku
    (nakladka ladowania jest `fixed` TYLKO na czas ceremonii i jest modalem,
    nie nawigacja), kazdy blok tekstu ma wlasne tlo (punkt 10).
- Znaleziska bez issue: BRAK. Trzy bledy fazy naprawione w swoich issues
  (stykanie napisow, nakladka poza widokiem, przycisk `disabled` zapalajacy sie
  na hover). Pulapka srodowiskowa z dwoma serwerami dev opisana w
  `DECISIONS.md` #19. Otwarte issues F7-01..F7-05 bez zmian.

## F4 - QUIZ

- [x] **F4-01** `ui` ⚠ HARD Karta pytania i nawigacja: 15 pytań, warianty A-D, pytanie 14 otwarte, rząd 15 kwadratów, zapis stanu.
  CZYTAJ: 07→A,D,E; 04→B,C,D; 02→B (lib/stan.ts).
  AC: wszystkie 15 pytań przechodne klawiaturą (strzałki lewo/prawo i kliknięcie w kwadrat); zaznaczenie 3 wariantów, `page.reload()`, zaznaczenia wracają; pytanie 14 akceptuje `mohsa`, `Mohsa` i `skala Mohsa` (test normalizacji); kwadrat odpowiedzianego pytania ma inny styl niż nieodpowiedzianego (porównanie `getComputedStyle`); negatywne: zero informacji o poprawności przed oddaniem arkusza (żaden element nie ma klasy sugerującej poprawność), zero emoji w DOM.
  UZUPELNIENIE PO RECENZJI KONCOWEJ: dowod ponizej byl mierzony na `pnpm dev`
  i przez to KLAMAL. Na buildzie produkcyjnym nawigacja strzalkami nie dzialala
  wcale - nasluch wisial na `<section className="arkusz">`, a po wejsciu na
  `/quiz` `document.activeElement` to `<body>`, wiec zdarzenie nigdzie nie
  docieralo. Na dev maskowal to podwojny efekt StrictMode, ktory przypadkiem
  fokusowal karte (stad tez flakiness testu). Naprawione w commicie recenzji:
  nasluch przeniesiony na `window`, tak jak `naEscape` w tym samym pliku.
  Zmierzone na `npx next start -p 3100`: `activeElement=BODY`, dwie strzalki
  w prawo daja `PYTANIE 03 / 15`.
  ✓ `npx playwright test tests/f4-01.spec.ts` = 18 passed (desktop plus mobile), zrzuty
  `screenshots/F4/F4-01-quiz-{desktop,mobile}.png` i `F4-01-pytanie-14-{desktop,mobile}.png`
  OBEJRZANE. Dowody po kolei: 15 pytan przechodzone `ArrowRight` z assercja licznika
  `PYTANIE NN / 15` i tresci pytania z `data/quiz.json`, na krancach strzalka nie
  wyjezdza poza arkusz; klik w kwadrat 9, 3, 15, 1 skacze do pytania, kwadrat pod
  fokusem reaguje na `Enter`; trzy zaznaczenia (B w 1, D w 5, A w 2), `page.reload()`,
  wszystkie trzy wracaja i zaden inny wariant nie jest zaznaczony; pytanie 14 renderuje
  `input[type=text]` i zero `.wariant`, wpisy `mohsa`, `Mohsa`, `skala Mohsa` trafiaja
  do `sessionStorage` i wszystkie trzy przechodza `dopasujOtwarte` z `lib/quiz.ts`
  (`skala richtera` nie przechodzi); kwadrat odpowiedziany `rgb(57, 255, 20) inset`
  kontra pusty `rgb(255, 255, 255) outset` (`getComputedStyle`); negatywne: na
  pytaniach 1, 8, 14, 15 zero atrybutow pasujacych do `poprawn|dobra|blad|correct|
  prawda|falsz` i zero emoji w `main.tresc`. Dodatkowo Z8: 7 animowanych elementow,
  wlasny kafel `kafel-quiz`, stwory rogowe (`stwor-kot`) nie leza na zadnym kwadracie
  ani na nawigacji (`elementFromPoint` po przewinieciu). `pnpm run check` czysty,
  `pnpm build` = `/quiz` 8,01 kB, first load 110 kB (limit 160 kB), pelny
  `npx playwright test` = 164 passed, 10 skipped.
  ZRZUT POPRAWIL BLAD, KTOREGO ASERCJA NIE WIDZIALA: pudelko ozdoby rozciagalo sie na
  cala wysokosc karty i zostawialo pod GIF-em pusty bialy pas okolo 150 px; `align-self:
  flex-start` w `.karta__ozdoba` to zamknelo.
- [x] **F4-02** `ui` Ozdoby 15 pytań wg tabeli `plan/07 B` plus reakcje na hover.
  CZYTAJ: 07→B; 04→B; 03→D.
  AC: zbiór `id` ozdób użytych w 15 pytaniach ma dokładnie 15 elementów (wypisać listę w dowodzie); pytanie 1 na hover wariantu B zmienia `animation-duration` ozdoby (odczyt przed i po); pytanie 14 przy poprawnym wpisie błyska (`animation-name` się zmienia); zrzut-kolaż 15 ozdób w `screenshots/F4/` OBEJRZANY - ozdoby realnie się różnią, nie są 15 wariantami tego samego; negatywne: zero ozdób bez pozycji w manifeście.
  ✓ `npx playwright test tests/f4-02.spec.ts` = 10 passed (desktop plus mobile).
  Zbior id ozdob z 15 pytan ma 15 elementow, wypisany przez test:
  `stwor-osmiornica, planeta, stwor-ptak, stwor-mlotek, stwor-slimak, stwor-zegar,
  stwor-kropla, ogien, stwor-kosc, stwor-mysz, stwor-dyskietka, stwor-nuta,
  stwor-kula-ziemska, stwor-krysztal, stwor-gwiazdka` - dokladnie tabela plan/07 B.
  Pytanie 1: `animation-duration` ozdoby `1.2s`, po hover wariantu B `0.6s` (polowa),
  po hover wariantu A z powrotem `1.2s` (tabela ma tam pusto). Pytanie 7 hover A:
  `0.4s`. Pytanie 3 hover A: `transform: matrix(-1, 0, 0, 1, 0, 0)` (lustro, Z6a).
  Pytanie 5 hover D: `filter: invert(1)`. Pytanie 9 hover C: ramka `dashed`.
  Pytanie 12 hover A: druga kopia ozdoby widoczna, dwa `[data-ozdoba='stwor-nuta']`.
  Pytanie 14: `animation-name` `karta-oddech` -> `karta-blysk`, `0.3s`, a bledny wpis
  (`skala richtera`) wraca do `karta-oddech`. Negatywne: kazde uzyte id ma pozycje
  w `data/assety.json`. Zrzuty OBEJRZANE: `screenshots/F4/F4-02-kolaz-15-ozdob.png`
  (pietnascie realnie roznych obrazkow, nie warianty jednego),
  `F4-02-pytanie-12-kopia.png` (dwie nuty obok siebie),
  `F4-02-pytanie-07-kropla.png`. `pnpm run check` czysty, `pnpm build` `/quiz`
  8,18 kB i 110 kB first load, pelny `npx playwright test` = 174 passed, 10 skipped.
  PUŁAPKA Z CASCADE: `.ozdoba { display: block }` ze `scena.css` wchodzi PO `quiz.css`,
  wiec `.karta__gif--kopia { display: none }` przegrywalo kolejnoscia przy rownej
  specyficznosci - kopia z pytania 12 byla widoczna bez hovera. Zlapal to zrzut i test,
  naprawia selektor z rodzicem `.karta__ozdoba .karta__gif--kopia`.
- [x] **F4-03** `ui` Maszyna prawdy wg `plan/07 C` plus tryb rewizji.
  CZYTAJ: 07→C,D,E; 04→D.
  AC: pełna ceremonia <= 9000 ms (pomiar `performance.now()`, wynik w dowodzie); `Escape` pokazuje wszystkie werdykty naraz; nieodpowiedziane liczą się jako błędne po potwierdzeniu druku; tryb rewizji: poprawna ma ramkę `--jad`, błędnie wybrana `line-through` i ramkę `--alarm`; wynik zapisany w `sessionStorage`; przejście prowadzi na `/proba-ognia`; negatywne: zero przekreśleń pod kątem, zero animacji przewracania kartek 3D.
  ✓ `npx playwright test tests/f4-03.spec.ts` = 12 passed (desktop plus mobile).
  Pelna ceremonia zmierzona `performance.now()` od kliku `ODDAJ ARKUSZ KOMISJI`
  do pojawienia sie `PRZEJDŹ DO PRÓBY OGNIA`: **8415 ms** (desktop) i **8376 ms**
  (mobile), limit 9000 ms; kontrakt to 15 x 500 ms plus 400 ms kroku 4, reszta to
  narzut renderu. `Escape` w trakcie odslania wszystkie 15 werdyktow naraz
  (`[data-werdykt]` = 15) i licznik od razu pokazuje `PUNKTY: 14 / 15`.
  Nieodpowiedziane: druk `ALEKSANDRO, PYTAŃ BEZ ODPOWIEDZI: 3. LICZĄ SIĘ JAKO BŁĘDNE.`,
  `WRACAM` zamyka go bez oddawania arkusza, `POTWIERDZAM` liczy pustki jako bledne
  (`data-werdykt='pustka'` na 3, 9, 14, wynik 11/15). Tryb rewizji: poprawna ramka
  `solid rgb(57, 255, 20)` (`--jad`), bledna wybrana `solid rgb(204, 0, 96)` (`--alarm`)
  plus `text-decoration: line-through`. Wynik w `sessionStorage` (`quiz.punkty` = 14)
  i po `page.reload()` wraca bez powtarzania ceremonii. `PRZEJDŹ DO PRÓBY OGNIA`
  prowadzi na `/proba-ognia` i straz etapu juz nie odmawia (`.straz` = 0).
  Negatywne: przekreslenie poziome, `transform: none` na przekreslonym wariancie,
  a w calym widoku zero elementow z obrotem, `perspective` innym niz `none`
  albo `transform-style: preserve-3d`. Zrzuty OBEJRZANE (desktop i 390 px):
  `F4-03-oddaj-*`, `F4-03-potwierdzenie-*`, `F4-03-ceremonia-w-toku-*`,
  `F4-03-wynik-*`, `F4-03-rewizja-*` w `screenshots/F4/`. Na zrzucie wyniku widac
  PassOMetr przelaczony na `13/15` i `ETAP 3 OTWARTY` (zdarzenie `jwp:stan`).
  `pnpm run check` czysty, `pnpm build` `/quiz` 9,22 kB i 115 kB first load
  (limit 160 kB), pelny `npx playwright test` = 186 passed, 10 skipped.

### RAPORT FAZY F4 (DoD punkt po punkcie)

- `pnpm run check` ZIELONY: `samotest: czysto`, `lint-tokens: czysto`, `tsc --noEmit`
  bez bledow. `pnpm build` ZIELONY: `/quiz` 9,22 kB, first load 115 kB (limit 160 kB
  z F6-02). `npx playwright test` BEZ FAILOW: 186 passed, 0 failed, 10 skipped na obu
  viewportach, DWA pelne przebiegi z rzedu po ostatnim issue.
- Zrzuty stanu fazy, wszystkie OBEJRZANE, w `screenshots/F4/`: `F4-01-quiz-desktop.png`,
  `F4-01-quiz-mobile.png`, `F4-01-pytanie-14-desktop.png`, `F4-01-pytanie-14-mobile.png`,
  `F4-02-kolaz-15-ozdob.png`, `F4-02-pytanie-12-kopia.png`, `F4-02-pytanie-07-kropla.png`,
  `F4-03-oddaj-*`, `F4-03-potwierdzenie-*`, `F4-03-ceremonia-w-toku-*`, `F4-03-wynik-*`,
  `F4-03-rewizja-*` (kazdy w wersji desktop i 390 px). Zrzut zlapal jeden blad, ktorego
  nie widziala zadna assercja: pudelko ozdoby rozciagalo sie na cala wysokosc karty
  i zostawialo pod GIF-em pusty bialy pas okolo 150 px (naprawione `align-self`).
- Ocena wzgledem Z6-Z9, Z11, Z16 i anty-spec (pomiar `getComputedStyle` na zywej
  stronie, viewporty 1280x800 i 390x844):
  - Z6 (zakaz przekrzywiania): SPELNIONY. Skan wszystkich elementow `main.tresc`
    z rozkladem macierzy = 0 elementow z niezerowym `b` albo `c`; jedyny transform
    w widoku to `matrix(-1, 0, 0, 1, 0, 0)` (lustro stworow i reakcja pytania 3).
    `git grep -nE "(rotate|skew)\(" -- app components` poza allowlista `ladowanie`
    = 0 trafien. Przekreslenie w rewizji jest POZIOME (`line-through`, `transform: none`).
  - Z7 (assety to pliki): SPELNIONY. `git grep -n "/assets/" -- app components` poza
    `app/style/scena.css` (kursory) = 0 trafien. Wszystkie 15 ozdob, oba pasy, oba
    stwory i kafel ida przez `data/assety.json`.
  - Z8 (gestosc): SPELNIONY. `/quiz` ma 7 animowanych elementow w `main.tresc`
    (identycznie na 1280x800 i 390x844): pas balonow, pas cienki, goniec shellu,
    dwa stwory `stwor-kot` w dolnych rogach, ozdoba pytania i plakietka `nowe`
    w liczniku, do tego animacja CSS neonowego `QUIZ`. Minimum 2 w rogach: 2.
    Minimum 1 pas na pelna szerokosc: 3. Zapas jest MNIEJSZY niz na `/egzamin`
    (62 elementy) - samoocena gestosci wszystkich pieciu widokow to zakres F6-04.
  - Z9 (kafel tla): SPELNIONY. `kafel-quiz.png` na `<html>`, `background-repeat: repeat`,
    `background-size: auto`, kafel inny niz na pozostalych widokach.
  - Z11 (reduced motion): SPELNIONY. Przy `prefers-reduced-motion: reduce` licznik
    animowanych elementow spada z 7 na 0, cztery `img` przechodza na klatki z
    `/assets/statyczne/`, `karta-oddech` i `karta-blysk` maja `animation-name: none`,
    a cala ceremonia skraca sie do 2000 ms (`CEREMONIA_ZREDUKOWANA_MS`).
  - Z16 (copy do Aleksandry): SPELNIONY. Trzy zdania widoku mowia do niej po imieniu:
    `ALEKSANDRO, WPISZ ODPOWIEDŹ`, `ALEKSANDRO, KOMISJA UZNAJE: ...`,
    `ALEKSANDRO, PYTAŃ BEZ ODPOWIEDZI: N. LICZĄ SIĘ JAKO BŁĘDNE.`.
  - Anty-spec quizu `plan/07 E` 1-5: (1) zero informacji o poprawnosci przed oddaniem
    arkusza - test skanuje atrybuty na pytaniach 1, 8, 14, 15 i nie znajduje ani jednego
    slowa o poprawnosci; jedyna reakcja na tresc to bezimienny `data-blysk` pytania 14,
    zamowiony wprost tabela `plan/07 B`. (2) Postep to rzad 15 kwadratow, zero cienkiej
    linii postepu w widoku. (3) Zero animacji 3D: `perspective` = `none` i
    `transform-style` inny niz `preserve-3d` na kazdym elemencie. (4) Zero emoji
    w `main.tresc` (pole `emojiZrodlowe` nie jest renderowane). (5) 15 pytan ma 15
    roznych `id` ozdob, wypisanych w dowodzie F4-02.
  - Anty-spec globalna `plan/01 G`: zero `border-radius` (0 elementow), zero cieni
    (`box-shadow` = 0 elementow), zero `transition: all`, zero elementow `fixed`
    i `sticky` w spoczynku, zero `[draggable]`, kazdy blok tekstu ma wlasne tlo
    (karta i kwadraty na `--papier`, licznik i wynik na `--tusz`, warianty na
    `--druk-tlo`).
- Znaleziska bez issue: BRAK. Dwa bledy fazy naprawione w swoich issues (pusty pas
  pod ozdoba; `.karta__gif--kopia` przegrywajaca kolejnoscia arkuszy z `.ozdoba`).
  Otwarte issues F7-01..F7-05 bez zmian.

## F5 - PRÓBA OGNIA I RADIO

- [x] **F5-01** `ui` Scena ogniska plus druk OGN-3/TAJ z walidacją stemplami wg `plan/08 A,B`.
  ✓ `npx playwright test tests/f5-01.spec.ts` = 12 passed (desktop + 390 px).
  Bledny e-mail: stempel `ALEKSANDRO, TO NIE JEST ADRES`, klasa `druk--drga` na
  druku, fokus wraca do `[data-pole='email']`, klatki `druk-drganie` czytane
  z CSSOM zywej strony niosa WYLACZNIE `translateX` (zero `rotate`, Z6).
  But 8 -> `ROZMIAR POZA SKALĄ KOMISJI (10-70)`. Ucho 900 -> stempel o skali
  5-500, ucho 200 -> przechodzi z dopiskiem `KOMISJA WYRAŻA PODZIW` i druk
  laduje w `sessionStorage`. Przycisk `disabled` plus `aria-disabled` bez
  checkboxa. Obwodka pola po odrzuceniu NIE zmienia koloru (anty-spec F2).
  ✓ zrzuty OBEJRZANE: `screenshots/F5/F5-01-{druk,stemple}-{desktop,mobile}.png`.
  Znaleziska ze zrzutu naprawione przed odhaczeniem: rzad ogniska wychodzil poza
  390 px (plomien 56->48 px, kot 72->64 px).
  ✓ `pnpm run check` czysty, `pnpm build` zielony (`/proba-ognia` 107 kB).
  CZYTAJ: 08→A,B,E; 04→B,C; 01→D.
  AC: błędny e-mail powoduje drganie druku (`translateX`, nie obrót) plus stempel `ALEKSANDRO, TO NIE JEST ADRES` plus fokus wraca do pola; but 8 daje stempel o skali 10-70; ucho 200 przechodzi z dopiskiem podziwu; submit `disabled` bez checkboxa; zrzuty desktop i 390 px OBEJRZANE; negatywne: zero czerwonych obwódek bez stempla, zero steppera, zero `rotate` na drganiu.
- [x] **F5-02** `ui` ⚠ HARD Ceremonia spalenia plus list w butelce wg `plan/08 C,D`.
  ✓ `npx playwright test tests/f5-02.spec.ts` = 22 passed (desktop + 390 px),
  w tym dwa testy odparkowane z F7-01.
  ✓ cztery zrzuty faz OBEJRZANE: `screenshots/F5/F5-02-krok{1-zjazd,2-ogien,
  3-popiol,4-butelka}.png` plus `F5-02-pergamin-{desktop,mobile}.png`.
  Krok 1 zjazd druku `translateY`, krok 2 rzad OSMIU ogni NAD drukiem plus
  gasniecie `steps(6)`, krok 3 dwadziescia ziaren popiolu 6x6 px, krok 4
  butelka plus `PasGoniec KLIKNIJ BUTELKĘ, ALEKSANDRO`. Butelka przed 3200 ms
  nie wchodzi (assercja czasu). `Escape` w kroku 1 skacze do butelki.
  Klik i `Enter` rozwijaja pergamin z adresem, 8/10, 12/15 i suma 20/25;
  macierz `transform` pergaminu to `[1,0,0,1]` (Z6). `OD NOWA` czysci
  `sessionStorage` i wraca na `/`. Powrot na adres po wysylce daje butelke
  bez drugiego POST-u i bez zadnego `[data-cta]`. Awaria Bloba: dokladnie
  jedno ponowienie, stempel `[data-ulotna]`, flaga `wyslano` NIE zapada.
  POST lokalnie wraca `tryb: "dev-log"`. Zero konfetti (assercja na klasach).
  Nowe: `components/ogien/ListWButelce.tsx`, pole `pismoKoncowe`
  w `data/komisja.json`.
  ✓ `pnpm run check` czysty, `pnpm build` zielony (`/proba-ognia` 109 kB).
  CZYTAJ: 08→C,D,E,F; 04→B; 02→B (api/zgloszenie).
  AC: sekwencja czterech kroków udokumentowana czterema zrzutami faz w `screenshots/F5/` (OBEJRZANE); klik i `Enter` na butelce rozwijają pergamin z e-mailem i sumą `N/25`; `Escape` w krokach 1-3 skacze do butelki; `OD NOWA` czyści `sessionStorage` i wraca na `/`; powrót na URL po wysłaniu pokazuje od razu butelkę bez żądania POST; POST trafia do `/api/zgloszenie` i lokalnie zwraca `tryb: "dev-log"`; negatywne: pergamin nie jest przekrzywiony, zero konfetti.
- [x] **F5-03** `ui` `RadioTinyDesk` wg `plan/09` - obudowa, YouTube IFrame API po geście, wskaźnik strojenia, suwak.
  ✓ `npx playwright test tests/f5-03.spec.ts` = 12 passed (desktop + 390 px).
  Przed gestem: zero zadan do `youtube.com` i `youtube-nocookie.com`
  (`page.on('request')`), zero `iframe`, zero `script[src*=youtube]`.
  Po kliknieciu `WŁĄCZ`: zadanie do `iframe_api`, `iframe` z `src` na
  `youtube-nocookie.com` i `oCcks-fwq2c`, `title="Odtwarzacz koncertu Post
  Malone Tiny Desk"`, ZMIERZONE `getBoundingClientRect`: **260x200 desktop,
  200x200 na 390 px**. `localStorage.jwp.audio === "on"`.
  `WYŁĄCZ`: `getPlayerState() === 2` po **16,7 ms** (desktop) i **6,5 ms**
  (mobile), limit 100 ms. Suwak zapisuje `jwp.glosnosc` i przezywa reload.
  Wejscie z `jwp.audio === "on"` NIE startuje samo, pokazuje `KLIKNIJ, ABY
  WZNOWIĆ` i zero `iframe` (Z15). Radio nie ma `fixed` ani `sticky` i zero
  przyciskow strony ma je na swoim srodku (`elementFromPoint`).
  Negatywne: zero plikow audio w `public/`, `git grep -ciE
  "youtube-dl|ytdl|yt-dlp"` po `app components lib public scripts package.json`
  = 0.
  ✓ zrzuty OBEJRZANE: `screenshots/F5/F5-03-radio-{wylaczone,gra}-{desktop,mobile}.png`.
  Znalezisko ze zrzutu i testu naprawione przed odhaczeniem: `iframe` byl
  odmontowywany przy `WYŁĄCZ` (pauza nie miala czego zatrzymac) - odtwarzacz
  montuje sie raz i zostaje. DECISIONS #20 (wyjatek od Z14).
  ✓ `pnpm run check` czysty, `pnpm build` zielony (shared first load 102 kB),
  `npx playwright test` = 224 passed / 0 failed / 6 skipped.
  CZYTAJ: 09 (cały).
  AC: przed kliknięciem `WŁĄCZ` zero żądań do `youtube.com` i `youtube-nocookie.com` (assercja `page.on('request')`); po kliknięciu pojawia się żądanie do `iframe_api` i `iframe` z `src` zawierającym `oCcks-fwq2c`; `localStorage.jwp.audio === "on"`; `WYŁĄCZ` cichnie w < 100 ms; radio NIE ma `position: fixed` i nie zasłania żadnego przycisku (`elementFromPoint` na 390 px); zrzut obudowy w `screenshots/F5/` OBEJRZANY; negatywne: zero plików audio w `public/`, `git grep -ciE "youtube-dl|ytdl|yt-dlp"` = 0.

### RAPORT FAZY F5 (DoD punkt po punkcie)

- `pnpm run check` ZIELONY: `samotest: czysto`, `lint-tokens: czysto`, `tsc --noEmit`
  bez bledow. `pnpm build` ZIELONY: `/proba-ognia` 6,93 kB, first load 109 kB
  (limit 160 kB z F6-02), shared 102 kB. `npx playwright test` BEZ FAILOW:
  224 passed, 0 failed, 6 skipped na obu viewportach (bylo 10 skipped - dwa testy
  odparkowane w F7-01).
- Zrzuty stanu fazy, wszystkie OBEJRZANE, w `screenshots/F5/`:
  `F5-01-druk-{desktop,mobile}.png`, `F5-01-stemple-{desktop,mobile}.png`,
  `F5-02-krok1-zjazd.png`, `F5-02-krok2-ogien.png`, `F5-02-krok3-popiol.png`,
  `F5-02-krok4-butelka.png`, `F5-02-pergamin-{desktop,mobile}.png`,
  `F5-03-radio-{wylaczone,gra}-{desktop,mobile}.png`.
  Zrzuty zlapaly trzy bledy, ktorych nie widziala zadna assercja: rzad ogniska
  wychodzil poza 390 px, rzad ognia ceremonii stal POD plonacym drukiem zamiast
  nad nim, a `iframe` radia na 390 px mial 260 px szerokosci w obudowie 220 px.
  Wszystkie naprawione przed odhaczeniem issue.
- Ocena wzgledem Z6-Z9, Z11, Z16 i anty-spec (pomiar `getComputedStyle` na zywej
  stronie, viewporty 1280x800 i 390x844):
  - Z6 (zakaz przekrzywiania): SPELNIONY. Skan wszystkich elementow `main.tresc`
    z rozkladem macierzy = 0 elementow z niezerowym `b` albo `c` na obu viewportach.
    Drganie odrzuconego druku to `translateX` - klatki `druk-drganie` czytane
    z CSSOM zywej strony niosa wylacznie `translateX(...)`. Pergamin ma macierz
    `[1,0,0,1]`. `git grep -nE "(rotate|skew)\(" -- app components` poza allowlista
    `ladowanie` = 0 trafien.
  - Z7 (assety to pliki): SPELNIONY. `git grep -n "/assets/" -- app components`
    poza `app/style/scena.css` (kursory) = 0 trafien. Ognisko, kot, stwory rogowe,
    but, ucho, butelka, oba pasy i kafel ida przez `data/assety.json`.
  - Z8 (gestosc): SPELNIONY. `/proba-ognia` ma 10 animowanych GIF-ow plus 5 elementow
    z wlasna animacja CSS w `main.tresc`, identycznie na 1280x800 i 390x844 (minimum
    to 6). Piec ogni ogniska ma piec roznych `animation-delay` (0, 130, 260, 390,
    520 ms). Minimum 2 w rogach: 2 delfiny (prawy z `--lustro`). Pasy na pelna
    szerokosc: 2 plus goniec shellu.
  - Z9 (kafel tla): SPELNIONY. `kafel-ogien.png` na `<html>`, `background-repeat:
    repeat`, `background-size: auto`, kafel inny niz na pozostalych widokach.
  - Z11 (reduced motion): SPELNIONY. Przy `prefers-reduced-motion: reduce` licznik
    animowanych elementow spada z 15 na 0, wszystkie 10 `img` przechodzi na klatki
    z `/assets/statyczne/`, `ognisko-zar`, `druk-drganie`, `popiol-opada`,
    `pergamin-rozwija` i wskaznik strojenia radia maja `animation-name: none`,
    a ceremonia spalenia skraca sie do dwoch krokow po 300 ms.
  - Z14 (zaleznosci): SPELNIONY z jednym swiadomym wyjatkiem opisanym w DECISIONS #20
    - `iframe_api` YouTube, ladowany DOPIERO po gescie Aleksandry. Przed gestem
    zero zadan do `youtube.com` i `youtube-nocookie.com`, zero `iframe`, zero
    `script[src*=youtube]`. Zero nowych paczek w `package.json`.
  - Z15 (zero autoplay): SPELNIONY. Wejscie z `jwp.audio === "on"` nie startuje
    dzwieku, tylko prosi `KLIKNIJ, ABY WZNOWIĆ`.
  - Z16 (copy do Aleksandry): SPELNIONY. Kazde zdanie widoku mowi do niej po imieniu:
    `OGN-3/TAJ - WNIOSEK KOŃCOWY - ALEKSANDRA`, `TWÓJ ADRES E-MAIL, ALEKSANDRO`,
    `ALEKSANDRO, TO NIE JEST ADRES`, `ALEKSANDRO, POTWIERDZAM, ŻE ROZUMIEM POWAGĘ
    SYTUACJI`, `ALEKSANDRO, TWÓJ DRUK PŁONIE.`, `KLIKNIJ BUTELKĘ, ALEKSANDRO`,
    `PISMO KOŃCOWE - TAJNE - DO RĄK WŁASNYCH ALEKSANDRY`, `KLIKNIJ WŁĄCZ,
    ALEKSANDRO`, `RADIO MILCZY. KOMISJA PRZEPRASZA, ALEKSANDRO.`.
    Zero emoji, zero `—` i `·` w nowych plikach (`git grep` = 0 trafien).
  - Anty-spec proby ognia `plan/08 F` 1-5: (1) zero steppera - skan `body.innerText`
    nie znajduje wzorca `KROK n Z m`; (2) zero czerwonych obwodek bez stempla -
    `borderTopColor` pola po odrzuceniu jest IDENTYCZNY jak przed submitem, blad
    niesie wylacznie stempel; (3) zero przekrzywienia druku i pergaminu (Z6 wyzej);
    (4) zero konfetti i fajerwerkow - skan klas calego dokumentu po wysylce = 0
    trafien na `konfetti|confetti|fajerwerk|firework`; (5) zero maili z aplikacji -
    `/api/zgloszenie` pisze do Bloba i nic wiecej.
  - Anty-spec radia `plan/09 B, D`: radio NIE jest `fixed` ani `sticky` (skan
    `body *` = 0), zaden przycisk strony nie ma radia na swoim srodku
    (`elementFromPoint`), zero plikow audio w `public/`, zero `youtube-dl|ytdl|yt-dlp`
    w kodzie i w `package.json`.
- Znaleziska bez issue: BRAK. Trzy bledy zlapane na zrzutach naprawiono w obrebie
  swoich issue. F7-01 zamkniete razem z F5-02. Otwarte zostaja F7-02, F7-03,
  F7-04 (czeka na decyzje Aleksandry) i F7-05.

## F6 - POLISH

- [x] **F6-01** `a11y` Audyt dostępności: przejście przez 3 etapy samą klawiaturą, kontrasty tokenów, `aria-label` na ozdobach interaktywnych, `role="button"` na butelce.
  CZYTAJ: 01→E (Z10, Z11); 02→D.
  AC: pełny przepływ brama-pergamin przechodzalny bez myszy (kroki wypisane w commit message); `@axe-core/playwright` zwraca 0 błędów `critical` na 4 stronach plus 404; każdy token tekstu ma kontrast >= 4,5:1 na swoim tle (tabela pomiarów w dowodzie); wszystkie `img[data-ozdoba]` dekoracyjne mają `alt=""` i `aria-hidden="true"`, a te niosące treść mają `alt` z manifestu; negatywne: żaden `outline: none` bez zamiennika.
  UZUPELNIENIE PO RECENZJI KONCOWEJ: audyt PRZEOCZYL zlamane Z11. Regula
  `.pas-goniec--odbijany .pas-goniec__tresc` (0,2,0) bila blok
  `prefers-reduced-motion` (0,1,0), wiec gorny pasek jechal dalej przy
  zredukowanym ruchu na KAZDYM widoku. Przeszlo, bo `tests/f1-02.spec.ts`
  sprawdzal tylko wariant `zwykly`. Naprawione w commicie recenzji
  (`:where` na modyfikatorze, precedens F7-07), test sparametryzowany po obu
  wariantach. Zmierzone na buildzie produkcyjnym: `animation-name: none`
  na wszystkich paskach na `/`, `/egzamin`, `/quiz`, `/proba-ognia`.
  DOWOD: ✓ `npx playwright test tests/f6-01.spec.ts` = 34 passed na obu viewportach, cala suita 258 passed / 0 failed / 6 skipped; ✓ PRZEPLYW SAMA KLAWIATURA (bez jednego kliknięcia, 15 kroków wypisanych przez test): brama Tab do `PRZYSTĘPUJĘ` -> Enter -> `/egzamin` -> Tab do `textarea` -> pisanie -> Tab do `ODDAJ` -> Enter -> werdykt 9/10 -> Tab do `PRZEJDŹ` -> `/quiz` -> 15 pytań (Tab do radia, Space; Tab do `NASTĘPNE`, Enter) -> Tab do `ODDAJ ARKUSZ` -> Enter -> werdykt -> Tab do `PRZEJDŹ` -> `/proba-ognia` -> Tab e-mail, but, ucho, pokora (Space), `SKŁADAM` (Enter) -> ceremonia -> Tab do `[data-butelka]` (`role="button"`) -> Enter -> pergamin otwarty; na KAZDYM z siedmiu przystanków test asertuje `outline: 3px dashed rgb(255,0,200)` (Z10 dosłownie); ✓ axe-core na 5 stronach (`/`, `/egzamin`, `/quiz`, `/proba-ognia`, `/nie-ma`): `critical = 0` wszędzie (pozostałe: `region/moderate` x1 i - przed poprawką - `color-contrast/serious` x4); ✓ TABELA KONTRASTU mierzona na żywej stronie (kolor tekstu kontra pierwszy nieprzezroczysty przodek), wszystkie widoki >= 4,5:1 po poprawce; przed poprawką ZNALEZIONO 4 realne naruszenia w obudowie radia: `--papier` na `--chrom-b` = 4,48:1 (`radio__marka`, `radio__podpis` x2) i `--cyjan` na `--chrom-b` = 4,03:1 (`radio__zrodlo`) - obudowa przestawiona na `--ramka-ciemna`, po zmianie 9,10:1 i 8,19:1 (zmierzone, nie policzone z tabeli); pozostałe pomiary: `pass-o-metr__*` 16,70:1, `pas-goniec__tresc` 14,03:1, `stopka__licznik-cyfry` 14,03:1, `uciekinier__napis` 13,88:1, `radio__napis` 15,29:1, `druk__pole`/`tablica__naglowek` 16,70:1; kontrolki NIEAKTYWNE (`ODDAJ PRACĘ`, `SKŁADAM WNIOSEK`, `POPRZEDNIE` = 3,72:1) zostają w tabeli, ale poza progiem - WCAG 1.4.3 wyłącza je wprost, a szarość JEST tu komunikatem; `pass-o-metr__pole` wyłączone z asercji jako **F7-04** (czeka na decyzję Aleksandry) i dalej raportowane; ✓ `img[data-ozdoba]`: na 5 widokach ZERO obrazków z `alt=""` bez `aria-hidden="true"` i ZERO z `alt` niepustym plus `aria-hidden` (sprzeczność); ✓ negatywne: przejście po `document.styleSheets` na żywej stronie (`CSSStyleRule` plus `CSSGroupingRule`) nie znajduje ANI JEDNEJ reguły kasującej `outline` bez zamiennika; ✓ Z10 dosłownie: `outline: 3px solid` w `app/globals.css` i `app/style/quiz.css` przestawione na `dashed` (spec mówi `dashed`), `.wariant__radio` dostał brakujący `outline-offset: 2px`; ✓ `pnpm run check` czysto; ✓ screenshots/F6/f6-01-radio-stopka.png i f6-01-fokus-cta.png OBEJRZANE - obudowa radia ciemna, cały tekst czytelny, kreskowana magentowa obwódka fokusu widoczna na `PRZYSTĘPUJĘ DO ETAPU 1` i nie zasłania napisu. Commit: `F6-01`.
- [x] **F6-02** `perf` Budżety: brak long tasków > 50 ms w 5 s bezczynności na 4 stronach, first load JS < 160 kB, suma obrazów na widok <= 2,5 MB.
  CZYTAJ: 03→C; 04→L.
  AC: `tests/budzet.spec.ts` zielony dla wszystkich 4 stron (wypisać zmierzone sumy w dowodzie); `pnpm build` pokazuje first load < 160 kB dla każdej strony; `PerformanceObserver` nie notuje long taska > 50 ms w 5 s bezczynności; negatywne: zero obrazów bez `width`/`height` w atrybutach (`page.evaluate` po wszystkich `img`).
  DOWOD: ✓ `npx playwright test tests/budzet.spec.ts` = 28 passed / 0 failed na obu viewportach; ✓ SUMY OBRAZKOW zmierzone przez `transferSize` odpowiedzi `image/*` (plan/03 C), prog 2 621 440 B: `/` 337 375 B (329,5 KB), `/egzamin` 155 320 B (151,7 KB), `/quiz` 105 584 B (103,1 KB), `/proba-ognia` 116 070 B (113,3 KB), a najciezszy playground `/dev/scena` 542 912 B (530,2 KB), czyli kazdy widok siedzi grubo ponizej 1/4 budzetu Z18; ✓ `pnpm build` first load JS: `/` 107 kB, `/egzamin` 112 kB, `/proba-ognia` 109 kB, `/quiz` 115 kB, `/_not-found` 103 kB, shared 102 kB - najciezsza strona ma 45 kB zapasu do limitu 160 kB; ✓ `PerformanceObserver({type:'longtask'})` przez 5 s bezczynnosci na kazdym z czterech widokow plus `/dev/scena`: ZERO wpisow (`long taski ... : brak` w logu testu), nie tylko zero powyzej 50 ms; ✓ negatywne: `page.evaluate` po WSZYSTKICH `img` na czterech widokach zwraca pusta liste obrazkow bez `width` albo `height` w atrybutach; ✓ dublujacy sie pomiar `/` z petli F1-05 zdjety, zeby jedna strona nie byla mierzona dwa razy pod dwiema nazwami; ✓ `pnpm run check` czysto. Commit: `F6-02`.
- [x] **F6-03** `ui` 404 Komisji, favicon, obrazek OG z `metadataBase`.
  CZYTAJ: 02→A; 01→D.
  AC: `/nie-ma` zwraca 404 ze stroną spełniającą Z8 tak samo jak każdy inny widok: własny kafel `kafel-404`, >= 6 animowanych elementów, >= 2 stwory rogowe, >= 1 pas, tekst do Aleksandry; `metadataBase` liczony z `VERCEL_PROJECT_PRODUCTION_URL` z fallbackiem na localhost - build z tą zmienną daje absolutny `og:image` na domenie produkcyjnej (pomiar curlem na `next start`, wynik w dowodzie); favicon istnieje; negatywne: `og:image` nigdy nie wskazuje `localhost` w buildzie z ustawioną zmienną.
  DOWOD: ✓ `npx playwright test tests/f6-03.spec.ts` = 8 passed na obu viewportach, cala suita 288 passed / 0 failed / 6 skipped; ✓ `/nie-ma` zwraca **404** (`Response.status()` w tescie i `curl -o /dev/null -w %{http_code}` na `next start` - oba 404), a nie 200 z podmieniona trescia; ✓ Z8 zmierzone `getBoundingClientRect` na zywej stronie, nie policzone z JSX: **11** `img[data-ozdoba]` w widoku plus jeden `pas-goniec`, **4** stwory rogowe (`lewy-gora`, `prawy-gora`, `lewy-dol`, `prawy-dol`; na 390 px dolne 86x71 px, gorne 62x68 px - zadne nie ma zerowego bboxa), **4** pasy (`pas-budowa` gorny, `pas-balony` dolny plus dwa `pas-cienki` z shellu); ✓ Z9: `getComputedStyle(document.documentElement)` na `/nie-ma` daje `background-image: url(.../kafel-404.png)`, `background-repeat: repeat`, `background-size: auto` (czyli BEZ `background-size`), kafel rozny od czterech pozostalych widokow; ✓ Z16: caly tekst mowi do Aleksandry (`AKTA NIE ODNALEZIONE`, `ALEKSANDRO, KOMISJA PRZESZUKALA CALE ARCHIWUM...`, pas-goniec `ALEKSANDRO, KOMISJA NIE ZNA TEGO ADRESU`, CTA `WRACAM DO BRAMY`); ✓ `metadataBase` zmierzony NA PRODUKCYJNYM BUILDZIE: `VERCEL_PROJECT_PRODUCTION_URL=j-word-pass.vercel.app pnpm build && pnpm start -p 3100`, `curl` zwraca `<meta property="og:image" content="https://j-word-pass.vercel.app/opengraph-image?a6e69d88f14b3837"/>`; ✓ negatywne: `grep -c 'og:image" content="http://localhost'` na tej samej odpowiedzi = **0**; ✓ favicon: `app/icon.png` (statyczna klatka `stwor-gwiazdka`), `<link rel="icon" href="/icon.png?26834f29f4f6e213" type="image/png" sizes="47x47">`, `request.get` na tym adresie = 200; ✓ `og:image` odpytany w tescie zwraca 200 i `content-type: image/png` (generuje go `app/opengraph-image.tsx` przez `next/og`, czyli modul samego `next` - Z14 nietkniete, zero nowych zaleznosci); ✓ bonus, plan/04 L4: `/dev/scena` na `next start` zwraca **404**; ✓ `pnpm build` z ustawiona zmienna zielony, first load `/` 107 kB, `/_not-found` 103 kB, `/opengraph-image` 102 kB; ✓ screenshots/F6/f6-03-404-desktop.png i -390.png OBEJRZANE. TRZY BLEDY ZLAPANE NA ZRZUCIE, NIE W KODZIE: (1) `NapisObrazek` jest blokiem na 100% szerokosci, a viewBox "404" ma proporcje 226:130, wiec naglowek urosl do ~350 px wysokosci i zostawil nad soba pusta plache tla - ograniczony do 300 px (220 px na malym ekranie); (2) `stwor-klepsydra` w polu archiwum rozpychal komorke do 335 px i siatka byla nierowna - pola maja teraz stala wysokosc 130 px, a ozdoba `max-height: 116px`; (3) stwory w gornych rogach staly pod pasem `pas-budowa` i na zrzucie zostaly z nich dwa zolte skrawki - zjechaly o 56 px. Commit: `F6-03`.
- [x] **F6-04** `ui` Samoocena gęstości i charakteru (Z8, anty-spec `plan/01 G`) na wszystkich 4 widokach plus 404.
  CZYTAJ: 01→E (Z7, Z8, Z9), 01→G.
  AC: dla każdego z 5 widoków w dowodzie tabela: liczba animowanych elementów (>= 6), liczba stworów rogowych (>= 2), liczba pasów (>= 1), nazwa kafla (5 różnych kafli na 5 widoków); zrzuty wszystkich 5 widoków OBEJRZANE i skonfrontowane z anty-spec punkt po punkcie (wynik: lista `punkt anty-spec -> spełniony/naruszony`); każde naruszenie poprawione w tym samym issue; negatywne: żaden widok nie ma pustego pasa > 120 px bez elementu.
  DOWOD: ✓ `npx playwright test tests/f6-04.spec.ts` = 32 passed na obu viewportach, cala suita 320 passed / 0 failed / 6 skipped, TRZY PRZEBIEGI Z RZEDU bez migotania; ✓ TABELA GESTOSCI zmierzona `getBoundingClientRect` na zywym widoku (element z zerowym bboxem sie nie liczy):

    widok          animowane  ozdoby  pasy  gonce  stwory  kafel
    /                     22      17     3      2       2  kafel-brama
    /egzamin              46      42     3      1       2  kafel-egzamin
    /quiz                 19      13     4      2       2  kafel-quiz
    /proba-ognia          23      17     4      2       2  kafel-ogien
    /nie-ma               24      18     4      2       4  kafel-404

  kazdy widok ma >= 6 animowanych (najmniej `/quiz` z 19, prog Z8 przekroczony ponad trzykrotnie), >= 2 stwory rogowe i >= 1 pas; ✓ Z9: piec widokow, PIEC ROZNYCH kafli (`kafel-brama`, `kafel-egzamin`, `kafel-quiz`, `kafel-ogien`, `kafel-404`), sprawdzone `new Set(...).size === 5` na jednym przebiegu przez wszystkie sciezki; ✓ ANTY-SPEC `plan/01 G` PUNKT PO PUNKCIE, zrzuty screenshots/F6/f6-04-{brama,egzamin,quiz,ogien,404}-desktop.png OBEJRZANE: **1** (zero czystego minimalistycznego retro) -> SPELNIONY, kazdy widok to wysypisko GIF-ow na kaflu, nie plakat vintage; **2** (zero hero z naglowkiem i dwoma przyciskami) -> SPELNIONY, dwa przyciski bramy siedza w tablicy ogloszen z szescioma GIF-ami, a nie na pustym hero; **3** (zero kart 3 na wiersz z jednakowymi cieniami) -> SPELNIONY, siatki bramy i 404 nie maja ZADNEGO cienia, tylko ramki `inset`; **4** (zero `border-radius` > 4 px) -> SPELNIONY maszynowo, skan `getComputedStyle` po wszystkich widocznych elementach piatki widokow = zero trafien; **5** (zero cieni z rozmyciem) -> SPELNIONY maszynowo, kazdy `box-shadow` ma trzeci parametr 0 px; **6** (zero `ease-in-out` na ozdobnikach) -> SPELNIONY maszynowo, kazdy element z `animation-name` ma `steps(...)`; **7** (zero pustej przestrzeni) -> patrz nizej, TRZY NARUSZENIA znalezione i naprawione; **8** (zero przeciagania mysza) -> SPELNIONY, zero `draggable` i zero `pointermove` w mechanice; **9** (zero scroll-hijackingu) -> SPELNIONY, zero `scroll-behavior` i zero obserwatorow scrolla; **10** (zero tekstu na tle bez podkladu) -> SPELNIONY, potwierdzony pomiarem kontrastu z F6-01: kazdy blok tekstu ma nieprzezroczystego przodka, ZERO trafien `tekst na kaflu`; ✓ dolozony maszynowy strazik Z6 w tym samym tescie: obrot i skos siedza wylacznie w `b` i `c` macierzy `matrix(a,b,c,d,e,f)`, wiec test przepuszcza przesuniecie gonca i lustro `scaleX(-1)`, a nie przepusci `rotate` ani `skew` - zero trafien na piatce widokow; ✓ negatywne, TRZY REALNE DZIURY ZNALEZIONE I NAPRAWIONE (pomiar: suma pionowych przedzialow elementow niosacych tresc, obrazkow i pasow, szukanie przerw > 120 px): `/proba-ognia` 172 px miedzy drukiem a delfinami -> dolozony pas-goniec `ALEKSANDRO, KOMISJA NIE ZWRACA DRUKÓW ANI NADZIEI` plus `padding-bottom` scieniony z 260 na 200 px; `/quiz` 128 px pod arkuszem -> dolozony pas-goniec `ALEKSANDRO, KOMISJA LICZY KAŻDĄ ODPOWIEDŹ`; `/egzamin` na 390 px 160 px miedzy CTA a stworami -> `padding-bottom` z 200 na 150 px (stwory maja tam tylko 72 px wysokosci); po poprawkach ZERO dziur na obu viewportach; ✓ DWIE REGRESJE ZLAPANE I NAPRAWIONE po dolozeniu goncow: `tests/f4-03.spec.ts` (strazik Z6 odrzucal KAZDY transform inny niz identycznosc i lustro, wiec przesuwajacy sie goniec go wywracal - przepisany na warunek `b === 0 && c === 0`, ktory dalej nie przepusci obrotu) i `tests/f5-02.spec.ts` (`[data-goniec]").last()` lapal nowego gonca zamiast tego przy butelce - selektor zawezony do `.butelka-blok`); ✓ test dziur ustabilizowany przez `document.fonts.status === "loaded"` plus dwie klatki - przy rownoleglej suicie `Caveat` doladowywal sie PO pomiarze i wysokosci blokow jeszcze rosly (jedno migniecie na 320 testow, zlapane i zamkniete); ✓ `pnpm run check` czysto. Commit: `F6-04`.

### RAPORT FAZY F6 (DoD punkt po punkcie)

- `pnpm run check` ZIELONY (`samotest: czysto`, `lint-tokens: czysto`, `tsc --noEmit`
  bez bledu).
- `pnpm build` ZIELONY: 10 route'ow, first load JS `/` 107 kB, `/egzamin` 112 kB,
  `/quiz` 115 kB, `/proba-ognia` 109 kB, `/_not-found` 102 kB, `/opengraph-image`
  102 kB, shared 102 kB. Limit 160 kB, najciezsza strona ma 45 kB zapasu.
- `npx playwright test` BEZ FAILOW: **320 passed, 0 failed, 6 skipped** na obu
  viewportach, TRZY PRZEBIEGI Z RZEDU (jedno migniecie w tescie dziur zlapane
  i zamkniete oczekiwaniem na `document.fonts`).
- Zrzut stanu fazy: `screenshots/F6/F6-DoD-stan-fazy.png`, OBEJRZANY. Nowy widok
  404 stoi na wlasnym kaflu `kafel-404`, ma cztery stwory rogowe (ptaki u gory,
  osmiornice u dolu), cztery pasy, jedenascie animowanych ozdob i dwa gonce.
  Wzgledem Z7-Z9: assety to PLIKI z manifestu (Z7), gestosc ponad progiem
  (Z8: 24 animowane przy wymaganych 6), wlasny kafel bez `background-size` (Z9).
  Wzgledem anty-spec `plan/01 G`: zero pustej plachty, tekst na podkladzie,
  ramki `inset` zamiast cieni, ruch skokowy.
- Zrzuty wszystkich piatki widokow (`screenshots/F6/f6-04-*.png`) obejrzane
  i skonfrontowane z anty-spec punkt po punkcie w dowodzie F6-04.
- Wpis raportu fazy: ten akapit.
- Zero znalezisk bez issue: w tej fazie NIE powstalo nowe znalezisko poza zakresem.
  Wszystko, co wyszlo na pomiarach (kontrast radia, `solid` zamiast `dashed`
  w obwodce fokusu, trzy puste plachty, dwie regresje testow), zostalo naprawione
  W TYM SAMYM issue, ktore je znalazlo, bo miescilo sie w jego AC. Otwarte
  znaleziska F7 bez zmian: **F7-02**, **F7-03**, **F7-04** (czeka na decyzje
  Aleksandry), **F7-05**.

**F6 to ostatnia faza budowlana.** Dalej zostaja tylko znaleziska F7 i bramka
decyzyjna F8, ktora nalezy do Aleksandry.

## F7 - ZNALEZISKA (rośnie w trakcie, zakładana pusta)

Każde znalezisko z zasady 7a ląduje tu jako osobne issue z pełnym AC.
DoD fazy: każde znalezisko ma issue; każde issue ma dyspozycję (zrobione, świadomie
odrzucone z powodem, albo przeniesione do trackera).

- [x] **F7-01** `infra` Odpiecie parkowania dwoch testow w `tests/f5-02.spec.ts`.
  ✓ zdjete razem z F5-02: oba `test.skip` sa znowu `test` i przechodza
  (22 passed w pliku, 6 skipped w calej suicie zamiast 10).
  Znalezisko z F0-05: `plan/02 B` trzyma `tests/f5-02.spec.ts` jako „test kontraktu
  `/api/zgloszenie`, zmiany: brak", ale dwa z szesciu testow tego pliku steruja
  formularzem `/proba-ognia` (`[data-pole='email']`, `[data-cta]`, `[data-butelka]`),
  a czystka F0-01 ten widok usunela. Zostawione aktywne padalyby na czerwono przez
  cale F0-F4 i zaslanialyby prawdziwe regresje. Zmienione na `test.skip` z nota
  wskazujaca to issue; cztery testy kontraktu API dzialaja bez zmian.
  CZYTAJ: 02→B; 08→C,D.
  AC: po ukonczeniu F5-02 oba testy wracaja na `test(` (grep `test.skip` w
  `tests/f5-02.spec.ts` = 0 trafien); `npx playwright test tests/f5-02.spec.ts`
  zielony na obu viewportach, bez `skipped`; selektory w testach zgadzaja sie
  z tymi, ktore realnie wystawia nowy widok proby ognia; negatywne: zero zmian
  w czterech testach kontraktu API i zero zmian w `app/api/zgloszenie/route.ts`.

- [x] **F7-02** `ui` Naglowek `h1` jest przyciety przy lewej krawedzi okna.
  ✓ ZNALEZISKO NIEAKTUALNE, potwierdzone pomiarem na zywej stronie, nie z kodu.
  Przyciecie bralo sie z naglowka pisanego Caveatem od `x = 0` (stub z F2-01).
  Dzis `h1` na `/`, `/egzamin` i `/quiz` niesie `NapisObrazek`, czyli `<svg>`
  z `preserveAspectRatio="xMidYMid meet"`, ktory z definicji nie wychodzi poza
  swoje pudelko, a kazdy kontener ma padding boczny (`.brama` 12 px,
  `.egzamin`/`.quiz` `width: min(60vw, 380px)` z `margin: 0 auto`).
  DOWOD: ✓ `npx playwright test tests/f7-02.spec.ts` = 6 passed (3 widoki x 2
  viewporty), lewa krawedz tresci: `/` 12 px, `/egzamin` 450 px (desktop) i
  45 px (390), `/quiz` 460/45 px, wszedzie `x >= 0` i `scrollWidth <=
  clientWidth` rodzica; ✓ `overflow-x` na `body` = `visible` (negatywne AC);
  ✓ screenshots/F7/f7-02-{brama,egzamin,quiz}-{desktop,390}.png OBEJRZANE -
  litera `J` w `J-WORD PASS` i `E` w `ETAP 1` widoczne w calosci, nic nie dotyka
  lewej krawedzi okna. Test zostaje jako straznik regresji. Commit: `F7-02`.
  PULAPKA POMIARU: `Range.getClientRects()` na `<svg>` z `<text textLength>`
  oddaje szerokosc SUROWYCH glifow, PRZED skalowaniem viewBox - na bramie
  wychodzilo 1404 px przy elemencie szerokim na 1256 px. Napisy-obrazki mierz
  obrysem elementu, Range tylko dla wezlow tekstowych.
  ZNALEZISKO UBOCZNE: `F7-06` (martwa szerokosc `.brama__napis`).
  <!-- oryginalny opis znaleziska -->
  Znalezisko z F2-01: na zrzutach `screenshots/F2/f2-01-shell-desktop.png` i
  `-390.png` litera `J` w `J-WORD PASS` wychodzi poza lewa krawedz viewportu.
  `body` ma `margin: 0` (globals.css), a Caveat ma ujemny wysiew lewej krawedzi
  glifow, wiec tekst zaczynajacy sie w `x = 0` jest fizycznie obcinany. Dotyczy
  KAZDEGO widoku, nie tylko stubu bramy: `/egzamin` i `/quiz` maja ten sam `h1`.
  CZYTAJ: 02→D; 01→E (Z1).
  AC: na `/`, `/egzamin` i `/quiz`, na 1280x800 i 390x844, lewa krawedz obrysu
  tekstu `h1` (`getBoundingClientRect()` wraz z `element.scrollWidth` kontra
  `clientWidth` rodzica) mieści się w viewporcie, `x >= 0`; zrzut OBEJRZANY -
  pierwsza litera naglowka widoczna w calosci; negatywne: poprawka nie dodaje
  `overflow: hidden` na `body` (zaslonilaby przyszle stwory rogowe).
- [x] **F7-03** `ui` Plakietki webringu nie respektuja Z11 (reduced motion).
  ✓ ZROBIONE. Trzy plakietki dostaly `klatka-statyczna` w `data/assety.json`
  (pierwsza klatka wyciagnieta `sips -s format png`, bo na tej maszynie nie ma
  `gifsicle` ani `magick`), a `scripts/lint-tokens.mjs` wymaga tego pola takze
  od roli `plakietka`. Komponent `Ozdoba` i hook `uzyjKlatki` nie wymagaly
  zmiany - podmiana dziala dla kazdej pozycji z klatka.
  DOWOD: ✓ `npx playwright test tests/f7-03.spec.ts` = 4 passed: przy
  `reducedMotion: reduce` wszystkie trzy `footer img[data-ozdoba^=plakietka]`
  maja `src` z `/assets/statyczne/` i koncowka `.png`, przy normalnym ruchu
  dokladnie `/assets/plakietka-{html,css,przegladarka}.gif` i obrys 88x31
  (negatywne AC: zero zmian w wygladzie); ✓ walidator realnie broni - po
  wycieciu `klatka-statyczna` z `plakietka-css` `pnpm run check` wywala
  `rola "plakietka" wymaga pola "klatka-statyczna" (Z11)`, po przywroceniu
  czysto; ✓ `tests/f1-01.spec.ts` wrocil ze skanu `main.tresc` na CALY dokument
  i jest zielony (6 passed) - zasieg testu Z11 znowu obejmuje stopke;
  ✓ `sips`: trzy nowe PNG maja 88x31, wagi 2,0-2,9 KB; ✓ screenshots/F7/
  f7-03-stopka-normalny.png i -reduced.png OBEJRZANE - plakietki `I HTML`,
  `W3C CSS` i `NETSCAPE Now` stoja w tym samym miejscu i w tej samej skali
  w obu trybach, a rozny wyglad koperty obok potwierdza, ze tryb reduced
  faktycznie byl wlaczony. Commit: `F7-03`.
  <!-- oryginalny opis znaleziska -->
  Znalezisko z F2-01: `plan/03 D` wymaga `klatka-statyczna` tylko od rol `ozdoba`
  i `pas`, wiec trzy pozycje roli `plakietka` (`plakietka-html`, `plakietka-css`,
  `plakietka-przegladarka`) zostaja animowanymi GIF-ami takze przy
  `prefers-reduced-motion: reduce`. Test `tests/f1-01.spec.ts` musial zostac
  zawezony do `main.tresc`, zeby ich nie widziec, co ZAWEZA jego zasieg.
  CZYTAJ: 01→E (Z11); 03→B5,D.
  AC: przy `prefers-reduced-motion: reduce` wszystkie trzy plakietki w stopce
  maja `src` z `/assets/statyczne/` i rozszerzeniem `.png`; walidator
  `scripts/lint-tokens.mjs` wymaga `klatka-statyczna` rowniez od roli
  `plakietka` (usuniecie pola wywala `pnpm run check`); test z `f1-01` wraca do
  skanu po calym dokumencie i jest zielony; negatywne: zero zmian w wygladzie
  plakietek przy normalnym ruchu.
- [x] **F7-04** `a11y` Kontrast tekstu w zamknietym polu PassOMetr.
  Znalezisko z F2-01: `plan/05 A1` narzuca zamknietemu polu tlo `--chrom-b`
  (`#6e6e6e`), a tekst dziedziczy `--tusz` (`#101010`). Zmierzony kontrast to
  okolo 3,8:1, ponizej progu 4,5:1 dla malego tekstu. To konflikt SPEC kontra
  dostepnosc, nie blad wykonania, wiec wymaga decyzji, a nie cichej podmiany.
  CZYTAJ: 05→A1; 01→E.
  AC: kontrast tekstu w polu `pass-o-metr__pole--zamkniety` >= 4,5:1 (pomiar
  wyliczony z `getComputedStyle` w dowodzie) albo swiadoma decyzja Aleksandry
  zapisana w `DECISIONS.md`, ze pole zostaje jak jest; `@axe-core/playwright`
  na `/` nie zglasza naruszenia `color-contrast`; negatywne: pole zamkniete
  dalej ma tlo szare i tekst przekreslony (charakter zostaje).
  DOWOD: ✓ decyzja podjeta przez orkiestratora (Aleksandra niedostepna) i
  zapisana w `DECISIONS.md` jako wpis 21: Z10 wygrywa ze spec `plan/05 A1`,
  precedens DECISIONS #10. Zmiana LOKALNA: nowy token `--chrom-b-jasny`
  (`#858585`) uzyty tylko w regule `.pass-o-metr__pole--zamkniety`, sam
  `--chrom-b` nietkniety, wiec siedem innych miejsc z ramkami `ridge`/`outset`
  ma kontrast bez zmian; ✓ pomiar na ZYWEJ bramie (`tests/f7-04.spec.ts`,
  `getComputedStyle` plus wzor WCAG): `rgb(16,16,16)` na `rgb(133,133,133)` =
  **5,16:1** dla obu zamknietych pol (`data-etap="quiz"` i `="ogien"`), przed
  zmiana bylo 3,75:1; ✓ `@axe-core/playwright` na `/`: `color-contrast = 0`
  naruszen (jedyne pozostale to `region/moderate x1`, znane z F6-01);
  ✓ negatywne zmierzone, nie zalozone: tlo dalej szare (`r = g = b`, wartosc
  < 200), `text-decoration-line` dalej `line-through`, `aria-disabled="true"`
  i klodka `stwor-klodka` na miejscu; ✓ `tests/f6-01.spec.ts` stracil wyjatek
  `WYJATKI_F7_04` i dalej jest zielony (34 passed); ✓ `pnpm run check` czysto;
  ✓ screenshots/F7/f7-04-pass-o-metr-desktop.png i -mobile.png OBEJRZANE: pola
  2 i 3 sa szare, napisy `ETAP 2 QUIZ ZAMKNIĘTY` czytelne, przekreslenie
  widoczne, klodka na swoim miejscu, pole otwarte dalej odcina sie jasnym
  papierem i zielona ramka. Commit: `F7-04`.

- [x] **F7-06** `ui` `.napis` zjada szerokosc zadana przez widok, `.brama__napis` jest martwy.
  Znalezisko z F7-02, zlapane pomiarem `getBoundingClientRect` na zywej bramie.
  `app/style/scena.css` ma `.napis { width: 100% }`, a `app/style/brama.css` ma
  `.brama__napis { width: min(90vw, 720px) }`. Obie reguly maja te sama
  specyficznosc (0,1,0), a `scena.css` jest importowany w `globals.css` PO
  `brama.css`, wiec wygrywa `100%`. Efekt: napis `J-WORD PASS` na bramie ma
  1256 px zamiast 720 px (zmierzone na 1280x800) i jest niemal dwa razy wiekszy,
  niz chcial widok. `.egzamin__etap` i `.quiz__napis` maja `width: 100%` wprost,
  wiec tam roznicy nie widac - szerokosc niesie tam rodzic (`__naglowek`).
  CZYTAJ: 04→D; 05→B1.
  AC: na `/`, na 1280x800, szerokosc `[data-napis]` w `h1` <= 720 px i <= 90vw
  (pomiar `getBoundingClientRect().width` na zywej stronie); na 390x844
  szerokosc <= 0,9 * 390; zrzut OBEJRZANY, napis `J-WORD PASS` w calosci
  widoczny i wyrazniej mniejszy niz dzis; `tests/f7-02.spec.ts` dalej zielony;
  negatywne: zero zmian w wygladzie napisow na `/egzamin`, `/quiz`
  i `/proba-ognia` (szerokosc `[data-napis]` na tych widokach bez zmian,
  pomiar przed i po w dowodzie); zero `!important`.
  DOWOD: ✓ przyczyna potwierdzona pomiarem, nie czytaniem: `.napis` z
  `scena.css` ma `width: 100%` przy tej samej specyficznosci (0,1,0) co
  `.brama__napis`, a `globals.css` importuje `scena.css` PO `brama.css`, wiec
  regula widoku byla martwa. Poprawka idzie wzorcem, ktory dziala juz na
  `/egzamin` i `/quiz`: szerokosc niesie NAGLOWEK (`.brama__naglowek { width:
  min(90vw, 720px); margin: 4px auto 0 }`), a `.brama__napis` wypelnia go
  `width: 100%`. Zero `!important`, zero podbijania specyficznosci, zero zmian
  w `scena.css`; ✓ pomiar `getBoundingClientRect().width` na zywej bramie
  (`tests/f7-06.spec.ts`): 1280x800 **1256 px -> 720 px** (= min(90vw, 720px),
  90vw = 1152), 390x844 **366 px -> 351 px** (= 0,9 * 390, prog spelniony
  rownoscia); napis dalej zaczyna sie w oknie (`x >= 0`) i konczy przed jego
  krawedzia; ✓ negatywne, pomiar PRZED i PO wpisany do testu jako tabela
  odniesienia: `/egzamin` 380/760/760 px (desktop) i 300/351/334 px (390 px),
  `/quiz` 360/664 px i 300/204 px, `/proba-ognia` 560 px i 312 px - po
  poprawce co do piksela te same; ✓ `tests/f7-02.spec.ts` dalej zielony
  (6 passed), cala para f7-02 plus f7-06 = 14 passed; ✓ `pnpm run check`
  czysto; ✓ screenshots/F7/f7-06-brama-desktop.png, -mobile.png i
  f7-06-brama-napis-desktop.png OBEJRZANE: `J-WORD PASS` w calosci widoczny,
  wysrodkowany, wyraznie mniejszy niz przed poprawka, statek nad nim i
  podtytul pod nim nietkniete. ZNALEZISKO UBOCZNE: **F7-07** (`.werdykt__napis`
  martwy z tego samego powodu). Commit: `F7-06`.

- [x] **F7-05** `ui` Wariant `odbijany` pasa-gonca liczy droge od szerokosci OKNA, nie kontenera.
  ✓ ZROBIONE, i to na DWIE przyczyny, nie jedna.
  (1) `100vw` w `@keyframes goniec-odbijany` zamienione na `100cqw`, a
  `.pas-goniec--odbijany` dostal `container-type: inline-size`. `cqw` to 1%
  szerokosci kontenera zapytania, czyli dokladnie ta liczba, o ktora prosi
  `plan/04 H`. Natywna jednostka CSS, zero JS i zero zaleznosci (Z14).
  (2) DRUGA, ukryta przyczyna: `.pas-goniec__tresc` to `inline-block`, wiec
  `text-align: center` odziedziczone z `.brama` przesuwalo punkt startowy
  o polowe wolnego miejsca ZANIM ruszyl `translateX`. Sama podmiana `vw` na
  `cqw` zostawiala tekst 166 px za prawa krawedzia kontenera (zmierzone).
  `.pas-goniec` ma teraz `text-align: left`, a blok reduced motion nizej
  przywraca `center`, bo tam tekst stoi.
  (3) Przy 390 px kontener ma 303 px, a napis w `--stopien-tresc` 313 px, wiec
  CALY tekst nie miescil sie w zadnej fazie. `.brama__zjazd .pas-goniec` bierze
  ponizej 480 px `--stopien-drobny` (tez token, Z3) i ma 244 px.
  DOWOD: ✓ `npx playwright test tests/f7-05.spec.ts` = 4 passed. 40 probek na
  pelnej drodze animacji (przewinietej na 0 przez Web Animations), najmniejszy
  odstep tresci od lewej krawedzi kontenera = 0 px, od prawej = 5,73 px
  (1280x800) i 0,99 px (390x844), `scrollWidth` tresci 313 <= 657 i 244 <= 303;
  ✓ test REALNIE lapie regresje: po cofnieciu `100cqw` na `100vw` oba testy
  na desktopie padaja; ✓ negatywne AC (`plan/04 K2`): `@keyframes
  goniec-odbijany` czytane z `document.styleSheets` zawiera `transform`
  i ZERO `left:`, `width:`, `top:`, `height:` oraz zero `vw`; ✓ `tests/f1-02`
  (gorny pas-goniec shellu) 10 passed bez zmian; ✓ screenshots/F7/
  f7-05-zjazd-{desktop,390}-{start,koniec}.png OBEJRZANE - w obu skrajnych
  fazach i na obu viewportach widac CALY napis `< PRZEWIŃ W DÓŁ, ALEKSANDRO >`
  razem z obiema strzalkami; ✓ screenshots/F7/f7-05-quiz-goniec-start.png
  OBEJRZANY - gorny pas-goniec shellu startuje przy lewej krawedzi okna i nic
  nie jest uciete. Commit: `F7-05`.
  PULAPKA TESTU: restart animacji przez `style.animation = "none"` i `""` KASUJE
  inline `animation-duration` ustawiany przez komponent. Animacja dostaje 0 s,
  stoi w miejscu, a test przechodzi nie mierzac niczego. Przewijaj przez
  `element.getAnimations()`, nie przez podmiane stylu.
  <!-- oryginalny opis znaleziska -->
  Znalezisko z F2-05, zlapane na zrzucie z preview. `app/style/scena.css` ma
  `@keyframes goniec-odbijany { to { transform: translateX(calc(100vw - 100%)) } }`.
  W CSS `100%` w `translateX` znaczy „wlasna szerokosc elementu", wiec wzor dziala
  poprawnie WYLACZNIE wtedy, gdy kontener pasa ma szerokosc okna. Na bramie pas-goniec
  `< PRZEWIŃ W DÓŁ, ALEKSANDRO >` stoi w kontenerze `.brama__zjazd` szerokim na
  ~660 px (desktop) i ~300 px (390 px), wiec tekst wyjezdza poza kontener i jest
  UCINANY przez `overflow: hidden` w polowie slowa `ALEKSANDRO`. Widac to na
  `screenshots/F2/f2-05-preview-desktop.png` i `-390.png`. Kontrakt z `plan/04 H`
  mowi „przesuniecie od 0 do calc(100% - <szerokosc tresci>)", czyli od szerokosci
  KONTENERA, nie okna. Gorny pas-goniec shellu jest pelnej szerokosci, wiec tam
  blad sie nie objawia i przeszedl przez cala faze F1.
  CZYTAJ: 04→H; 05→B1 pkt 6.
  AC: na `/`, na 1280x800 i 390x844, w dowolnej fazie animacji CALY tekst gonca
  z `.brama__zjazd` miesci sie w swoim kontenerze (`scrollWidth` tresci kontra
  `clientWidth` kontenera po uwzglednieniu `transform`, albo porownanie
  `getBoundingClientRect()` tresci z prostokatem kontenera w 5 probkach czasu);
  zrzut OBEJRZANY, slowo `ALEKSANDRO` widoczne w calosci; gorny pas-goniec shellu
  dziala jak dotad (test F1-02 zielony bez zmian); negatywne: poprawka nie animuje
  `left` ani `width` (`plan/04 K2`), zero nowych zaleznosci.

- [x] **F7-07** `ui` `.werdykt__napis` jest martwy z tego samego powodu co
  `.brama__napis` (kaskada `scena.css`).
  ✓ ZROBIONE. Jedna zmiana w `app/style/scena.css`: `.napis { width: 100% }`
  to teraz `:where(.napis) { width: 100% }`. `:where()` zeruje specyficznosc
  (0,1,0 -> 0,0,0), wiec regula bazowa jest WARTOSCIA DOMYSLNA, a nie
  zawodnikiem w wyscigu kaskady. Zero `!important`, zero zmian w JSX, zero
  lokalnych latek. Napis bez klasy widoku (`/dev/scena`, `PlonacyNapis`)
  dalej dostaje 100%.
  DOWOD, tabela `getBoundingClientRect().width` na ZYWEJ stronie, wszystkie
  widoki z `[data-napis]`, dwa viewporty (dev server, `document.fonts` gotowe):

  | widok | element | 1280 przed | 1280 po | 390 przed | 390 po |
  |---|---|---|---|---|---|
  | `/` | `brama__napis` | 720 | 720 | 351 | 351 |
  | `/egzamin` | `egzamin__etap` | 380 | 380 | 300 | 300 |
  | `/egzamin` | `napis--chrom` (plonacy) | 760 | 760 | 351 | 351 |
  | `/egzamin` | `werdykt__napis` | 760 | **420** | 334 | **233,8** |
  | `/quiz` | `quiz__napis` | 360 | 360 | 300 | 300 |
  | `/quiz` | `maszyna__napis` | 663,72 | **320** | 204,03 | **151,13** |
  | `/proba-ognia` | `ogien__napis` | 560 | 560 | 312 | 312 |
  | `/nie-ma` | `brak__napis` | 300 | 300 | 220 | 220 |
  | `/dev/scena` | `napis--chrom` (plonacy) | 1232 | 1232 | 342 | 342 |
  | `/dev/scena` | 4x playground (chrom, chrom, chrom, neon) | 602,88 | 602,88 | 175,67 | 175,67 |

  Zmieniaja sie DWIE pozycje i obie sa naprawa, nie skutkiem ubocznym:
  `.werdykt__napis` (`min(70%, 420px)`, cel tego issue) oraz `.maszyna__napis`
  (`min(50%, 320px)`, `quiz.css`) - dokladnie ta sama martwa regula, bo
  `quiz.css` tez jest importowany przed `scena.css`. Zostawienie jej martwej
  znaczyloby swiadome utrzymywanie buga, wiec odstepuje od dosłownego
  brzmienia negatywnego AC („/quiz bez zmian") i pokazuje zrzut. Pozostale
  osiem pozycji CO DO PIKSELA bez zmian.
  ODSTEPSTWO OD AC, drugie: literalny dowod „usuniecie `width: 100%`
  z `.egzamin__etap` zmienia jego szerokosc" jest NIEDIAGNOSTYCZNY - po
  usunieciu tej reguly element i tak dostaje 100% z `:where(.napis)`, wiec
  wynik jest identyczny przed i po poprawce. Zamiast tego test dokłada regule
  o TEJ SAMEJ specyficznosci (0,1,0) na POCZATEK `<head>`, czyli wczesniej
  niz arkusz z regula bazowa - to jest dokladnie ta przegrana, ktora zabijala
  `.werdykt__napis`. `addStyleTag` tego nie sprawdzi, bo dokleja arkusz na
  koncu i wygrywa kolejnoscia niezaleznie od poprawki (zlapane na pierwszym
  podejsciu: test przechodzil takze z cofnietym fixem).
  ✓ `npx playwright test tests/f7-07.spec.ts` = 20 passed. Werdykt: 420 <= 420
  i <= 70% wnetrza rodzica, srodek napisu 1 px od srodka rodzica, `x >= 0`
  i prawa krawedz w oknie (1280 i 390); dowod kaskady `760 -> 111`
  i `351 -> 111`; zero `!important` w `document.styleSheets`.
  ✓ test REALNIE lapie regresje: po cofnieciu `:where(.napis)` na `.napis`
  8 z 20 pada, w tym dowod kaskady (`760 -> 760`).
  ✓ ZRZUTY OBEJRZANE, `screenshots/F7/`: `f7-07-werdykt-{desktop,mobile}.png`
  (ZDANE wysrodkowane, w calosci widoczne, nie rozjezdza sie na `8/10`),
  `f7-07-maszyna-{desktop,mobile}.png` (`0/15` wysrodkowany miedzy dwoma
  ognikami, nie rozpycha ich juz na krawedzie),
  `f7-07-{brama,egzamin,quiz,proba-ognia,nie-ma,dev-scena}-{desktop,mobile}.png`
  (bez roznic wizualnych).
  ✓ `pnpm run check` czysto; `pnpm build` OK; pelny `npx playwright test`
  366 passed, 6 skipped.
  UWAGA: `tests/f7-06.spec.ts` ma wpisana tabele „przed poprawki" - dwie
  wartosci (`werdykt__napis`, `maszyna__napis`) zaktualizowane, bo to ten sam
  pomiar tej samej rzeczy. Commit: `F7-07`.
  <!-- oryginalny opis znaleziska -->
  Znalezisko z F7-06, zmierzone na zywym `/egzamin` z werdyktem w sesji.
  `app/style/egzamin.css` ma `.werdykt__napis { width: min(70%, 420px);
  margin: 0 auto }`, ale `.napis { width: 100% }` z `scena.css` ma te sama
  specyficznosc (0,1,0) i jest importowany pozniej, wiec wygrywa. Napis
  `ZDANE`/`NIEZDANE` ma 760 px zamiast 420 px (desktop) i 351 px zamiast 334 px
  (390 px). F7-06 naprawilo TYLKO brame, bo jego kryterium negatywne zakazywalo
  ruszania szerokosci napisow na `/egzamin`. Ta sama pulapka czeka na kazda
  przyszla regule `width` na `[data-napis]`, wiec lekarstwem jest zdjecie
  `.napis` z wyscigu (np. `:where(.napis)`), a nie kolejna lokalna latka.
  Uwaga: `.brak__napis` (`/nie-ma`, 300 px) dziala tylko dlatego, ze
  `nieznalezione.css` jest importowany PO `scena.css` - to przypadek, nie plan.
  CZYTAJ: 04→D; 06→C (werdykt); plan/11 wpis F7-06.
  AC: na `/egzamin` z werdyktem w `sessionStorage`, na 1280x800, szerokosc
  `.werdykt__napis` <= 420 px i <= 70% rodzica (pomiar
  `getBoundingClientRect()` na zywej stronie, przed i po); regula bazowa
  `.napis` przestaje wygrywac z klasami widoku (dowod: usuniecie
  `width: 100%` z `.egzamin__etap` zmienia jego szerokosc, dzis nie zmienia);
  zrzut werdyktu OBEJRZANY, napis wysrodkowany i w calosci widoczny;
  negatywne: szerokosci `[data-napis]` na `/`, `/quiz`, `/proba-ognia`
  i `/nie-ma` bez zmian (pomiar przed i po); zero `!important`.

- [x] **F7-08** `ui` Na etapie 1 pytanie i pole odpowiedzi leżą tak nisko, że Aleksandra na telefonie ich nie znalazła i zgłosiła jako brak. Nie jest to błąd renderowania - oba elementy istnieją i działają, ale są pod ~2 ekranami dekoracji.
  ZNALEZIONE W: odbiór przez Aleksandrę na telefonie (2026-09-02), potwierdzone pomiarem na uruchomionej aplikacji.
  POMIAR: mobile 390x844 - strona ma 3014 px, `TREŚĆ PYTANIA` zaczyna się na 1024 px, `<textarea>` na 1688 px (2 pełne ekrany przewijania do pytania, prawie 3 do pola). Desktop 1280x800 - strona 2673 px, pytanie 1111 px, textarea 1467 px.
  DLACZEGO TESTY GO NIE ZŁAPAŁY: AC F3-02 sprawdzało ISTNIENIE elementów i gęstość ozdób (Z8), nigdy odległości od góry strony. Zrzuty dowodowe są kadrami viewportu, więc pokazywały wyłącznie dekorację i nikt nie zobaczył, jak głęboko siedzi samo zadanie.
  AC: na 390x844 górna krawędź `<textarea>` jest nie niżej niż **1000 px** od początku strony, a `TREŚĆ PYTANIA` nie niżej niż **600 px** (pomiar `getBoundingClientRect().top + scrollY`, obie liczby w dowodzie); gęstość Z8 nadal spełniona (>= 6 animowanych elementów, >= 2 stwory rogowe, >= 1 pas - policzyć po zmianie); płonący napis `EGZAMIN JASIU` nadal widoczny nad zadaniem; kryterium negatywne: nic nie zostało USUNIĘTE ze sceny - scena kosmiczna, założenia i ozdoby dalej są na stronie, tylko w innej kolejności albo w zwartszym układzie (porównanie liczby `img[data-ozdoba]` przed i po, wynik ten sam).
  PROPOZYCJA WYKONANIA (worker może wybrać inną, jeśli spełni AC): na 390 px scena kosmiczna schodzi z 200 px do 120 px i ląduje POD drukiem odpowiedzi, a `DANE DO ZADANIA` zwijają się w `<details>` otwarty domyślnie na desktopie i zamknięty na mobile. Dekoracja zostaje, kolejność się zmienia.
  ✓ WYKONANE (pomiar `getBoundingClientRect().top + scrollY` na uruchomionej aplikacji, `tests/f7-08.spec.ts`, zrzuty `screenshots/f7-08-mobile.png` i `screenshots/f7-08-desktop.png` OBEJRZANE):
  | pomiar | 390x844 przed | 390x844 po | 1280x800 przed | 1280x800 po |
  |---|---|---|---|---|
  | `TREŚĆ PYTANIA` top | 1040 | **268** | 1127 | **477** |
  | `<textarea>` top | 1688 | **982** | 1467 | **895** |
  | wysokość strony | 3014 | 2529 | 2673 | 2447 |
  | `img[data-ozdoba]` | 35 | **35** | 42 | **42** |
  Co zmienione: kolejność w DOM (`TREŚĆ PYTANIA` przed `DANE DO ZADANIA`, scena kosmiczna zeszła POD druk odpowiedzi), `DANE DO ZADANIA` w `<details>` zwiniętym domyślnie (lista sześciu założeń dalej w DOM, jedno kliknięcie od widoczności), a blok dekoracyjny nad zadaniem zwężony na 390 px (`egzamin__naglowek` 300 -> 200 px, `egzamin__plonacy` 351 -> 320 px z komentarzem, że poniżej 301 px `PlonacyNapis` gubi jeden płomień).
  Z8 po zmianie: 12 gwiazdek + planeta + statek + 5 płomieni + 2 stwory rogowe + 1 pas, płonący napis `EGZAMIN JASIU` dalej nad zadaniem (asercja w teście). Nic nie usunięte.
  Zaktualizowane tablice pomiarów w `tests/f7-06.spec.ts` i `tests/f7-07.spec.ts` (wartości `/egzamin` na 390 px), zmiana zamierzona i opisana w komentarzu.

## F9 - ZMIANY PO ODBIORZE (zamówione przez Aleksandrę 2026-09-02)

Kolejność liniowa jak wszędzie. Fazę wykonujemy PRZED bramką F8.

- [x] **F9-01** `ui` Stopka: napis `STRONA WYKONANA RĘCZNIE DLA ALEKSANDRY` zamieniony na `MINISTERSTWO CERTYFIKACJI JAN SACHSE`.
  CZYTAJ: 05→A3.
  AC: stopka na wszystkich 4 stronach pokazuje `MINISTERSTWO CERTYFIKACJI JAN SACHSE`; `git grep -ci "wykonana ręcznie"` = 0; negatywne: reszta stopki (licznik, plakietki, slot radia, pas) bez zmian - liczba `img` w stopce ta sama co przed zmianą.
  ✓ WYKONANE (pomiar na uruchomionej aplikacji, zrzut `screenshots/f9-01-stopka.png` OBEJRZANY):
  `.stopka__tekst` na `/`, `/egzamin`, `/quiz`, `/proba-ognia` = `MINISTERSTWO CERTYFIKACJI JAN SACHSE` (4/4).
  `footer img` = 4 przed i 4 po, `[data-radio-slot]` = 1 przed i 1 po, licznik `0001337` i trzy plakietki bez zmian.
  `git grep -ni "wykonana ręcznie" -- . ':!plan/11-BACKLOG.md'` = 0 wystąpień. Jedyne pozostałe wystąpienie to CYTAT starego napisu w treści tego issue, więc `= 0` bez wyłączenia backlogu jest niewykonalne z definicji.
  Zaktualizowany też spec `plan/05` A3, żeby nie zostawić sprzecznego źródła prawdy.
- [x] **F9-02** `ui` Pasy-gońce: górny dostaje dodatkowe człony, komunikat narady wymieniony w całości. Separator między członami to ` ### `.
  CZYTAJ: 05→A; 06→C.
  AC: górny pas-goniec zawiera dokładnie: `KOMISJA CZUWA - ALEKSANDRO, KOMISJA CZUWA ### PIĘKNIE DZIŚ WYGLĄDASZ ### POZDRO DLA GEJUF ###`; komunikat ceremonii narady `ALEKSANDRO, KOMISJA LICZY KAŻDĄ ODPOWIEDŹ` (i jego warianty) zastąpiony przez: `ZAJĘCIA Z CHEMII NA UNIWERSYTECIE WARSZAWSKIM ROZPOCZYNAJĄ SIĘ OD 2 PAŹDZIERNIKA ### KACPER ZABRAŁ MI 3 PARY GACI ### PRZEPRASZAM JESZCZE NIE POLICZYŁEM ILE WYDAŁEM ZROBIĘ TO OBIECUJĘ`; teksty siedzą w `data/komisja.json`, nie w komponencie (`git grep` w dowodzie); negatywne: zero `—` i `·` w nowych tekstach (Z1, Z2), `pnpm run check` zielony.
  ✓ WYKONANE (odczyt `textContent` z uruchomionej aplikacji, zrzuty `/tmp` obejrzane, oba pasy renderują pełny tekst):
  górny pas (`body > .pas-goniec`, wszystkie widoki) = `KOMISJA CZUWA - ALEKSANDRO, KOMISJA CZUWA ### PIĘKNIE DZIŚ WYGLĄDASZ ### POZDRO DLA GEJUF ###`
  pas na `/quiz` = `ZAJĘCIA Z CHEMII NA UNIWERSYTECIE WARSZAWSKIM ROZPOCZYNAJĄ SIĘ OD 2 PAŹDZIERNIKA ### KACPER ZABRAŁ MI 3 PARY GACI ### PRZEPRASZAM JESZCZE NIE POLICZYŁEM ILE WYDAŁEM ZROBIĘ TO OBIECUJĘ`
  Teksty w `data/komisja.json` pod kluczem `gonce` (`gora`, `narada`); `git grep -n "PIĘKNIE DZIŚ"` i `git grep -n "KACPER ZABRAŁ"` wskazują wyłącznie `data/komisja.json` i `plan/11-BACKLOG.md`, zero trafień w komponentach.
  Goniec ekranu ładowania (`KOMISJA PRZYGOTOWUJE AKTA DLA ALEKSANDRY`) NIE ruszany - to osobny, pinowany napis z `plan/04` F, nie komunikat pasa quizu.
  `pnpm run check` zielony, `tests/kanon.spec.ts` (zero `—` i `·` na czterech widokach) i `tests/f2-01.spec.ts` przechodzą.
- [x] **F9-03** `dane` Zwroty: treść pytania etapu 1 bezosobowo (usunąć `Aleksandro`), quiz zostawia DOKŁADNIE 3 pytania z imieniem - jedno `Aleksandro`, jedno `Rutkowska`, jedno `Mario Magdaleno`, pozostałe 12 bezosobowo. Klauzula zgody w etapie 3: `Potwierdzam, że rozumiem powagę sytuacji.`
  CZYTAJ: 01→E (Z16), 02→E; 08→A pkt 6.
  AC: `jq -r '.pytanie' data/egzamin.json | grep -ci aleksandr` = 0; w `data/quiz.json` dokładnie 3 pytania zawierają imię, po jednym na `Aleksandro`, `Rutkowska`, `Mario Magdaleno` (wypisać numery w dowodzie), pozostałe 12 nie zawierają żadnego z tych słów; etykieta checkboxa w etapie 3 to dokładnie `Potwierdzam, że rozumiem powagę sytuacji.`; negatywne: nigdzie nie wróciła forma bezosobowo-urzędowa („kandydat proszony jest"), `pnpm run check` zielony.
  ✓ WYKONANE (odczyt z uruchomionej aplikacji, zrzuty `screenshots/f9-03-pytanie.png` i `screenshots/f9-03-klauzula.png` OBEJRZANE):
  `data/egzamin.json` -> `tresc` = `Kto Twoim zdaniem wygrałby pojedynek: 2000 zebr z jetpackami, ale biało-żółtych, czy 1 słoń z karabinem maszynowym na trąbie?`, `polecenie` = `Zastosować odpowiednie wzory i udowodnić swój wynik.` Zero `Aleksandr` w obu polach (plik nie ma pola `.pytanie`, więc `jq -r '.pytanie'` oddawało `null`; sprawdzone na realnych polach `tytul`, `tresc`, `polecenie`).
  `data/quiz.json`: dokładnie 3 z 15 pytań z imieniem, odczytane z arkusza w przeglądarce klikając kwadraty 1-15: **nr 1** `Aleksandro, które z poniższych zdań jest prawdziwe?`, **nr 7** `Rutkowska, co jest prawdą?`, **nr 13** `Mario Magdaleno, co jest prawdą?`. Pozostałe 12 (2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15) bez żadnego z tych słów.
  Etykieta checkboxa etapu 3 = `Potwierdzam, że rozumiem powagę sytuacji.` (zrzut).
  Negatywne: `git grep -n "kandydat" -- app components data` daje wyłącznie id `imie-kandydatki`, komentarze techniczne i ZAKAZ w prompcie `/api/ocena` - zero formy urzędowej w copy. `pnpm run check` zielony, `tests/kanon.spec.ts`, `f3-01`, `f3-02`, `f4-01`, `f5-01` przechodzą.
  Zaktualizowany spec `plan/08` (etykieta klauzuli).
- [x] **F9-04** `dane` ⚠ HARD Etap 1 dostaje DRUGĄ CZĘŚĆ, pokazywaną po zamknięciu części pierwszej.
  CZYTAJ: 06→A,B,C; 02→B,E1.
  Treść zadania (dosłownie, bezosobowo): `Zakładając, że siła wkurwienia myszy wynosi 12 megawatów, a przeciętny debil generuje 15 idiotycznych pytań na minutę oraz 5 cringowych tekstów co 10 minut: jaki jest potencjał wpierdolu oraz po jakim czasie najszybciej nastąpi wpierdol? Zastosować odpowiednie wzory i uzasadnić odpowiedź.`
  AC: po werdykcie części 1 pojawia się przycisk `PRZEJDŹ DO CZĘŚCI 2`, a nie od razu przejście do etapu 2; część 2 ma własny druk z treścią wyżej, własną `<textarea>` z licznikiem 8000 znaków i własny przycisk oddania; ocena idzie tym samym `/api/ocena` (payload z polem rozróżniającym część, prompt dostaje treść zadania z `data/egzamin.json`); wynik etapu 1 w `sessionStorage` trzyma OBA werdykty, a PassOMetr pokazuje sumę; `StrazEtapu` przepuszcza na `/quiz` dopiero po zamknięciu części 2; pusta odpowiedź w części 2 zachowuje się jak w części 1 (0/10 bez żądania do API); zrzuty desktop i 390 px OBEJRZANE; negatywne: treść zadania NIE jest zaszyta w komponencie (`git grep` na fragmencie zwraca tylko `data/egzamin.json`), zero `Aleksandro` w treści zadania (Z16).
  ✓ WYKONANE (przejście całej ścieżki w przeglądarce, zrzuty `screenshots/f9-04-werdykt1-{desktop,mobile}.png` i `screenshots/f9-04-czesc2-{desktop,mobile}.png` OBEJRZANE):
  Po werdykcie części 1 stoi `[data-cta='do-czesci-2']` `PRZEJDŹ DO CZĘŚCI 2`, a `[data-cta='do-etapu-2']` w DOM NIE MA (count 0) i pole `ETAP 2` w PassOMetr jest dalej `zamkniety`.
  Część 2 ma własny druk `[data-czesc-2]` (tytuł plus treść z `data/egzamin.json`), własną `<textarea>` z `maxlength=8000` i licznikiem `ZNAKÓW: 0 Z 8000` oraz własny `ODDAJ PRACĘ KOMISJI`.
  Payloady do `/api/ocena` zebrane z przeglądarki: `[{czesc:1},{czesc:2}]`; prompt składany funkcją `promptSystemowy(czesc)` z `data/egzamin.json` (część 1: `tytul` + `tresc` + `polecenie` + sześć założeń, część 2: `czesc2.tytul` + `czesc2.tresc`), zero treści zadania w kodzie route'a.
  `sessionStorage` po obu ocenach: `{"punkty":8,"komentarz":"...","odpowiedz2":"...","punkty2":7,"komentarz2":"..."}`; PassOMetr pokazuje `15/20` (suma, `zMaks` etapu 1 podniesiony z 10 na 20).
  `StrazEtapu`: klik `PRZEJDŹ DO ETAPU 2` po części 2 wchodzi na `/quiz` bez druku odmownego (`.straz` = 0); przed częścią 2 `etapUkonczony` oddaje `false`, bo wymaga `punkty != null && punkty2 != null`.
  Pusta część 2: `0/10`, komentarz `ALEKSANDRO, PUSTKA...`, liczba żądań do `/api/ocena` = 1 (tylko za część 1), `punkty2` niezapisane.
  Negatywne: `git grep -n "wkurwienia myszy"` = `data/egzamin.json` i ten backlog, zero trafień w komponentach; treść zadania bez `Aleksandro`.
  Znalezisko w trakcie: część 2 dokładana POD zamknięty druk części 1 spychała `<textarea>` na 1804 px od góry na 390 px, czyli dokładnie błąd z F7-08. Naprawione regułą `:has()` w `app/style/egzamin.css` (druk części 1 i `DANE DO ZADANIA` schodzą ze sceny, gdy otwarta jest część 2) plus `scrollIntoView` na przejściu. Po poprawce: druk części 2 na 252 px, `<textarea>` na 1217 px, `scrollY` po kliknięciu = 252.
  Straże: `tests/f3-03.spec.ts` (dwa nowe testy), zaktualizowany przepływ klawiaturowy w `tests/f6-01.spec.ts` (18 kroków, część 2 w środku) i ziarna `sessionStorage` w 12 plikach testów.
- [x] **F9-05** `ui` Radio: usunięcie podpisu `LECI: POST MALONE, TINY DESK CONCERT`, dodanie przełączania między trzema materiałami strzałkami.
  CZYTAJ: 09 (cały).
  Lista materiałów (kolejność wiążąca): 1. `oCcks-fwq2c` (Post Malone, Tiny Desk Concert, NPR Music), 2. `RLmx3KMNuRM` (Top Gun Niesiołowice, czasem łowię ryby), 3. `wj2jITPprLw` (tak puszysty jak almette, ebr cypisz).
  AC: obudowa ma dwie strzałki (`POPRZEDNI` i `NASTĘPNY`) jako przyciski z `aria-label`; klik przełącza materiał w pętli (z trzeciego na pierwszy) i odtwarzacz gra nowy `videoId` (assercja na `src` iframe albo `player.getVideoData().video_id`); wybrany materiał zapisany w `localStorage` pod `jwp.kanal` i wraca po reloadzie; strzałki działają też klawiaturą (Tab plus Enter); podpis `LECI: POST MALONE...` nie występuje (`git grep -ci "leci: post"` = 0), zamiast niego pokazywana jest nazwa bieżącego materiału z listy; negatywne: nadal ZERO żądań do YouTube przed pierwszym kliknięciem `WŁĄCZ`, zero plików audio w `public/`.
  ✓ WYKONANE (przejście w przeglądarce z realnym odtwarzaczem YouTube, zrzuty `screenshots/f9-05-radio-{mobile,desktop}.png` OBEJRZANE):
  Dwa przyciski `[data-radio-poprzedni]` / `[data-radio-nastepny]` z `aria-label` `Poprzedni materiał w radiu Komisji` i `Następny materiał w radiu Komisji`.
  Pętla zmierzona na `player.getVideoData().video_id`: `oCcks-fwq2c` -> `RLmx3KMNuRM` -> `wj2jITPprLw` -> `oCcks-fwq2c`, `POPRZEDNI` z pierwszego wraca na `wj2jITPprLw`.
  `localStorage.jwp.kanal` = id bieżącego materiału, po `reload()` podpis wraca na wybrany (`TOP GUN NIESIOŁOWICE, CZASEM ŁOWIĘ RYBY`).
  Klawiatura: Tab przechodzi `POPRZEDNI` -> `WŁĄCZ` -> `NASTĘPNY`, `Enter` na `NASTĘPNY` przełącza materiał.
  `LECI: POST MALONE...` nie występuje ani w DOM (`page.content()`), ani w kodzie (`git grep -ci "leci: post"` = 0); w tym miejscu stoi `[data-radio-nazwa]` z nazwą materiału.
  Negatywne: żądań do `youtube.com`/`youtube-nocookie.com` przed pierwszym `WŁĄCZ` = 0, `iframe` w DOM = 0 (także po przełączaniu strzałkami); zero plików audio w `public/`.
  Znalezisko z pierwszego zrzutu: trzy przyciski w jednym rzędzie zawijały się krzywo w obudowie 220 px - strzałki zjechały do własnego rzędu pod `WŁĄCZ`.
  Tytuł `iframe` niesie nazwę bieżącego materiału (`Odtwarzacz radia Komisji: ...`); zaktualizowany spec `plan/09` A, B, D i asercja w `tests/f5-03.spec.ts` plus trzy nowe testy F9-05.
- [x] **F9-06** `ui` ⚠ HARD Etap 3: po zatwierdzeniu druku i ceremonii spalenia dochodzi ekran z ZADANIEM próby ognia, przedstawiony jako druk Komisji.
  CZYTAJ: 08→C,D,E,F; 04→B,D.
  Treść zadania (dosłownie): `PRÓBA OGNIA: stanąć na głowie, ze skarpetkami na dłoniach, nogami w śpiworze i w okularach przeciwsłonecznych. Punkty bonusowe za piankę marshmallow w buzi. Wykonanie udowodnić zdjęciem albo filmem.`
  AC: ekran pojawia się po ceremonii spalenia a PRZED listem w butelce (kolejność sprawdzona w teście); zadanie stoi na druku z ramką `ridge`, ma `NapisObrazek` z nagłówkiem i minimum 3 ozdoby z manifestu, w tym `ogien`; przycisk `PRZYJMUJĘ WYZWANIE` prowadzi do butelki; zrzuty desktop i 390 px OBEJRZANE - cały tekst zadania czytelny bez przewijania w poziomie; negatywne: treść w `data/komisja.json`, nie w komponencie; nic nie jest przekrzywione (Z6); zero pola na wgranie pliku (dowód wysyła się poza stroną, nie budujemy uploadu).
  ✓ WYKONANE (przejście ceremonii w przeglądarce na 390 i 1280, zrzuty `screenshots/f9-06-wyzwanie-{mobile,desktop}.png` OBEJRZANE):
  Kolejność zmierzona na żywo: `skladanie` -> `ogien` -> `popiol` -> **`wyzwanie`** -> (klik) -> `butelka`. W chwili pokazania wyzwania `[data-butelka]` i `[data-pergamin]` mają count 0, więc ekran stoi PRZED listem w butelce; `Escape` w kroku 1 skacze na koniec ceremonii, czyli też do wyzwania.
  Druk: `border-style: ridge`, `transform: none` (b = 0, c = 0, Z6), `NapisObrazek` z `aria-label="WYZWANIE"`, cztery ozdoby z manifestu: `ogien`, `stwor-klepsydra`, `stwor-kot`, `ogien`.
  Czytelność: `scrollWidth - clientWidth` = 0 na obu szerokościach, cały tekst zadania mieści się bez przewijania w poziomie.
  Negatywne: treść w `data/komisja.json` pod kluczem `wyzwanie` (`git grep "skarpetkami"` = `data/komisja.json` i backlog), `input[type=file]` count 0.
  Straże: nowy test `F9-06 ekran wyzwania` w `tests/f5-02.spec.ts`, zaktualizowane cztery kroki ceremonii, Escape i przepływ klawiaturowy w `tests/f6-01.spec.ts` (20 kroków). Zaktualizowany spec `plan/08` C.

- [ ] **F7-09** `deploy` ⚠ Integracja GitHub na Vercelu deployuje `main` PROSTO NA PRODUKCJE, wiec `git push origin main` omija stop-gate F8-01. Zaden worker nie uruchamial `vercel deploy --prod`.
  ZNALEZIONE W: paczka F9 (2026-09-02), po `git push origin main` z commitem `e5c80d2`.
  DOWOD: `vercel ls --json` pokazuje `j-word-pass-3j46hxzhy` z `target: "production"`, `githubCommitRef: main`, `githubCommitSha: e5c80d25`, wiek 1 minuta. Starsze wpisy `Production` sprzed 3 h i 4 h maja te sama sygnature, wiec produkcja chodzi za `main` **od poczatku buildu v2**, a bramka F8 byla martwa juz wczesniej.
  DLACZEGO TO WAZNE: F8-01 zaklada, ze Aleksandra ZATWIERDZA podmiane zywej produkcji. Przy obecnej konfiguracji kazdy push workera podmienia ja bez pytania.
  AC: rozstrzygniecie nalezy do Aleksandry, do wyboru jedna z dwoch drog i ZAPIS decyzji w `DECISIONS.md`:
  (a) produkcja ma chodzic za `main` - wtedy `F8-01` traci sens jako stop-gate i zostaje przepisany na liste kontrolna po deployu (produkcyjny URL 200, `/api/ocena` odpowiada, szoste zadanie 429, `og:image` na domenie produkcyjnej);
  (b) produkcja ma byc reczna - wtedy w ustawieniach projektu Vercel `Git -> Production Branch` zmienia sie na galaz, ktorej nikt nie pusha (albo wlacza sie ochrone deployu), a dowodem jest `vercel ls` po nastepnym pushu BEZ nowego wpisu `Production`.
  Kryterium negatywne dla obu drog: zaden worker dalej nie uruchamia `vercel deploy --prod` recznie.

### RAPORT FAZY F9 (DoD punkt po punkcie)

Sześć issues zamkniętych jednym commitem każde, plus dwa commity naprawcze
(strażnik `f3-02` po `<details>` z F7-08, suma etapu 1 w pergaminie i zgłoszeniu
po F9-04).

1. **Każde AC zweryfikowane na URUCHOMIONEJ aplikacji, nie z kodu.** Pomiary
   `getBoundingClientRect`, odczyty `textContent`, payloady przechwycone
   `page.route`, `localStorage`/`sessionStorage` czytane z przeglądarki,
   `player.getVideoData().video_id` z realnego odtwarzacza YouTube.
2. **Zrzuty OBEJRZANE, nie tylko zrobione:** `f7-08-{mobile,desktop}`,
   `f9-01-stopka`, `f9-03-{pytanie,klauzula}`, `f9-04-{werdykt1,czesc2}-{mobile,desktop}`,
   `f9-05-radio-{mobile,desktop}`, `f9-06-wyzwanie-{mobile,desktop}`.
   Trzy realne błędy wyszły dopiero z oglądania, nie z asercji:
   pole odpowiedzi części 2 na 1804 px (F9-04), trzy przyciski radia zawijające
   się krzywo w obudowie 220 px (F9-05) i dziura po znikniętej ozdobie
   przy zwężonym płonącym napisie (F7-08).
3. **`pnpm run check` zielony**, `pnpm build` zielony: `/quiz` 115 kB,
   `/egzamin` 113 kB, `/proba-ognia` 109 kB, `/` 107 kB, `/dev/scena` 107 kB,
   wspólne 102 kB, limit 160 kB.
4. **`npx playwright test` = 388 passed / 0 failed / 6 skipped** na `pnpm dev`.
5. **Kryteria klawiatury i nasłuchów sprawdzone na `pnpm build && pnpm start`:**
   pełny przepływ brama-pergamin samą klawiaturą, 20 kroków, przechodzi na
   buildzie produkcyjnym; `tests/f5-03` (nasłuchy radia), `f3-03` i `f7-08`
   też zielone na produkcyjnym serwerze.
6. **Z1-Z18 bez naruszeń:** zero `—` i `·` (`tests/kanon.spec.ts`), zero emoji,
   zero `rotate`/`skew` poza ekranem ładowania, style tylko przez tokeny,
   treści wyłącznie w `data/*.json`, zero nowych zależności runtime.
   Z16 w nowej wersji: pytanie etapu 1 (obie części) bezosobowo, dokładnie
   3 z 15 pytań quizu z imieniem, klauzula zgody bez imienia.
7. **Specyfikacje zaktualizowane razem z kodem:** `plan/05` A3, `plan/08` C
   i klauzula, `plan/09` A, B, D. Backlog nie rozjeżdża się z `plan/`.

**Pułapka środowiskowa (do `DECISIONS.md`):** cała suita puszczona przeciwko
`pnpm start` wywraca 9 testów `/api/zgloszenie` i `/api/ocena` na 429 - limiter
z `lib/limit.ts` działa WYŁĄCZNIE przy `NODE_ENV=production`, a `next start`
to jeden proces z jedną `Mapą` na cały przebieg. Na buildzie produkcyjnym
puszczaj pojedyncze pliki, nie całą suitę.


## F10 - ZBIERANIE PRAC I BRAMA WSTĘPU (zamówione 2026-09-02, po wdrożeniu na produkcję)

- [x] **F10-01** `infra` ⚠ HARD Zapis ocenionych odpowiedzi, żeby Jan mógł osobiście sprawdzić test.
  CZYTAJ: 02→B,D; 08→B; 09 nie dotyczy.
  Kontrakt: po każdej udanej ocenie `/api/ocena` zapisuje do prywatnego store'a `jwp-zgloszenia` plik `odpowiedzi/<ISO-timestamp>-czesc<N>-<losowe6>.json` z polami `{ czesc, odpowiedz, punkty, komentarz, model, ts }`. Odpowiedź zapisujemy w CAŁOŚCI, nieprzyciętą. Dodatkowo `/api/zgloszenie` przyjmuje i zapisuje komplet: obie odpowiedzi z obydwoma werdyktami plus wynik quizu, żeby jeden plik dawał pełny obraz podejścia.
  AC: POST do `/api/ocena` na produkcji tworzy plik w `odpowiedzi/` (potwierdzić listingiem `vercel blob list --rw-token`, wynik w dowodzie); plik zawiera pełną treść odpowiedzi, punkty i komentarz modelu; `/api/zgloszenie` zapisuje obiekt z polami obu części i wynikiem quizu; **poza produkcją zapis NIE następuje** (`NODE_ENV !== "production"` schodzi na `console.log`, tak jak dotychczasowy `dev-log` - inaczej każdy przebieg testów zaśmieci płatny store, błąd F7-16 z v1); awaria zapisu do Bloba NIE psuje oceny (kandydatka dostaje werdykt, błąd tylko w logu); negatywne: zero nowych zależności, zero endpointu odczytu (panelu nie budujemy, odczyt przez dashboard i CLI).
  Po wykonaniu: dopisz do `WERYFIKACJA.md` sekcję `JAK PRZECZYTAĆ PRACE` z gotowym przepisem CLI (`vercel env pull` do pliku tymczasowego, `vercel blob list --rw-token`, `vercel blob get`), bo `VERCEL_OIDC_TOKEN` sam nie wystarcza.

  ✓ D1 POST `/api/ocena` na PRODUKCJI (`https://j-word-pass.vercel.app`, commit `5c205e9`)
    zwrócił `{"punkty":10,"komentarz":"Aleksandro, zgodnie z protokołem z dnia X..."}`,
    a `vercel blob list --prefix odpowiedzi/ --rw-token` pokazał
    `odpowiedzi/2026-09-02T10:04:58.069Z-czesc1-4tivwh.json` (604 B, wiek 3 s).
  ✓ D2 `vercel blob get ... --access private` oddał plik z KOMPLETEM pól:
    `{"czesc":1,"odpowiedz":"PROD F10-01: uszczelniam kadlub serem plesniowym, a dziure
    zaklejam pieczatka Komisji.","punkty":10,"komentarz":"...","model":
    "google/gemini-2.5-flash-lite","ts":"2026-09-02T10:04:58.069Z"}` - odpowiedź w całości,
    nieprzycięta.
  ✓ D3 POST `/api/zgloszenie` na produkcji oddał `{"tryb":"blob","sciezka":
    "zgloszenia/2026-09-02T10:05:17.346Z-0lza58.json"}`, a pobrany plik ma
    `czesc1:{odpowiedz,punkty:10,komentarz}`, `czesc2:{odpowiedz,punkty:7,komentarz}`
    oraz `punktyQuiz:12`. Oba pliki testowe skasowane, `list --prefix odpowiedzi/`
    kończy się na `No blobs in this store`.
  ✓ D4 Poza produkcją zapisu NIE MA: lokalny `pnpm dev` wypisał do konsoli
    `[blob dev-log] odpowiedzi/2026-09-02T09:50:34.782Z-czesc2-0a75gi.json {...}`
    i `[blob dev-log] zgloszenia/...`, a listing store'a przed deployem nie miał
    ani jednego wpisu w `odpowiedzi/`.
  ✓ D5 Awaria Bloba nie psuje oceny: zapis w `/api/ocena` siedzi we WŁASNYM
    `try/catch`, który loguje `[ocena zapis-nieudany]` i oddaje werdykt (`app/api/ocena/route.ts`).
  ✓ D6 Negatywne: `package.json` bez nowej zależności (dalej next/react/react-dom/@vercel/blob),
    zero endpointu odczytu. `pnpm run check` zielony, `pnpm build` zielony,
    `npx playwright test` = 388 passed / 6 skipped, czyli tyle samo co przed zmianą.
  ✓ D7 `WERYFIKACJA.md` sekcja 11 `JAK PRZECZYTAC PRACE` z przepisem CLI.
    PUŁAPKA: `vercel blob get` wymaga JESZCZE `--access private`, samo `--rw-token` nie starcza.
- [x] **F10-02** `ui` ⚠ HARD Brama wstępu: pytanie kontrolne przed wejściem na stronę.
  CZYTAJ: 05→A,B; 04→B,D,F; 01→E (Z10, Z11, Z16).
  Kontrakt: pełnoekranowa nakładka przy pierwszym wejściu, PRZED ekranem ładowania. Pytanie brzmi dokładnie: `Jak na drugie imię ma Janek?`. Poprawna odpowiedź: `Franciszek`. Porównanie po normalizacji (`trim`, małe litery, usunięcie znaków diakrytycznych), więc `franciszek`, `Franciszek` i `FRANCISZEK` przechodzą.
  AC: bez poprawnej odpowiedzi żadna z czterech stron nie pokazuje treści (nakładka zasłania i trzyma fokus); poprawna odpowiedź zdejmuje nakładkę i zapisuje `jwp.wstep` w `localStorage`, po reloadzie nakładka się nie pokazuje; błędna odpowiedź daje stempel `KOMISJA NIE ROZPOZNAJE PETENTA` i pole zostaje z fokusem, bez przeładowania; pełna obsługa klawiaturą (Tab, Enter), `:focus-visible` widoczny (Z10); nakładka utrzymuje charakter strony - kafel tła, minimum 3 ozdoby z manifestu, `NapisObrazek` z nagłówkiem; `prefers-reduced-motion` bez animacji wejścia; zrzuty desktop i 390 px OBEJRZANE; negatywne: nic nie jest przekrzywione (Z6), pytanie i odpowiedź NIE są zaszyte w komponencie tylko w `data/komisja.json`.

  ✓ D1 Cztery widoki (`/`, `/egzamin`, `/quiz`, `/proba-ognia`) bez wpisu w `localStorage`
    nie pokazują treści: `elementFromPoint` w pięciu punktach ekranu trafia w nakładkę,
    `getComputedStyle(body).overflow` = `hidden`, a arkusz chowa całą treść regułą
    `:root:not([data-wstep="1"]) body > *:not(.wstep)` (8 testów, `tests/f10-02.spec.ts`).
  ✓ D2 Nakładka trzyma fokus: po 8 razy Tab i po Shift+Tab `activeElement` dalej
    siedzi w nakładce (pułapka: sam `focusin` nie wystarcza, Shift+Tab z pierwszego
    pola oddaje fokus paskowi przeglądarki i nie leci żadne zdarzenie).
  ✓ D3 Poprawna odpowiedź w czterech pisowniach (`Franciszek`, `franciszek`,
    `FRANCISZEK`, `  FrAnCiSzEk  `) zdejmuje nakładkę, zapisuje `jwp.wstep`,
    a po `reload()` nakładki nie ma i przewijanie wraca.
  ✓ D4 Błędna odpowiedź (`Zenon`): stempel `KOMISJA NIE ROZPOZNAJE PETENTA`,
    `activeElement` = pole wstępu, znacznik ustawiony w `window` przeżywa (zero
    przeładowania), `jwp.wstep` dalej `null`.
  ✓ D5 Sama klawiatura na `/egzamin`: pole ma fokus od razu, Tab przechodzi na
    przycisk z `outline` zawierającym `dashed` (Z10), Shift+Tab wraca, wpis plus
    Enter przepuszcza. Sprawdzone TAKŻE na `pnpm build && pnpm start` (26/26).
  ✓ D6 Charakter: tło `kafel-brama` z `background-repeat: repeat` i `background-size: auto`
    (Z9), 3 ozdoby z manifestu plus dwa pasy i goniec, `NapisObrazek` z `aria-label`
    `KONTROLA WSTĘPU`. Skan `transform` po całym drzewie nakładki: zero obrotów i skosów (Z6).
  ✓ D7 `prefers-reduced-motion: reduce`: zero animacji bez `paused` w nakładce.
  ✓ D8 Zrzuty OBEJRZANE, desktop 1280 i mobile 390: `screenshots/F10/f10-02-brama-*.png`,
    `f10-02-stempel-*.png`, `f10-02-po-wpuszczeniu-*.png`. Poprawka po obejrzeniu:
    klepsydra rozpychała druk o połowę, ozdoby dostały wspólny sufit 110 px.
  ✓ D9 Negatywne: pytanie, odpowiedź, nagłówek, CTA i stempel siedzą w
    `data/komisja.json -> wstep`, w `BramaWstepu.tsx` nie ma ani jednego z tych tekstów.
  ✓ D10 Regresja: cała suita `npx playwright test` = **414 passed / 6 skipped / 0 failed**,
    czyli 388 sprzed zmiany plus 26 nowych. Obejście dla starych testów jest jedno
    i deterministyczne: `storageState` z `jwp.wstep` w `playwright.config.ts`.
- [x] **F10-03** `infra` Brama chroni też płatny endpoint, nie tylko widok.
  CZYTAJ: 02→B; wynik F10-02.
  Kontrakt: klient wysyła do `/api/ocena` i `/api/zgloszenie` nagłówek `x-jwp-klucz` z odpowiedzią po normalizacji. Serwer porównuje ze zmienną `JWP_KLUCZ_WSTEPU` (już ustawiona w env Vercela dla trzech środowisk). Brak albo zła wartość: **401** z komunikatem Komisji, przed wywołaniem modelu.
  AC: `curl -X POST <produkcja>/api/ocena` BEZ nagłówka zwraca 401 i NIE wywołuje modelu (brak kosztu); ten sam curl z `-H "x-jwp-klucz: franciszek"` zwraca 200 z punktami; to samo dla `/api/zgloszenie`; przepływ w przeglądarce po przejściu bramy działa bez zmian (test end-to-end); negatywne: klucz nie pojawia się w repo ani w commicie (`git grep -ci franciszek` = 0 poza `data/komisja.json`, gdzie siedzi pytanie i odpowiedź bramy).
  UWAGA DO ZAPISANIA w `DECISIONS.md`: to jest PRÓG ZWALNIAJĄCY, nie uwierzytelnienie. Odpowiedź na pytanie bramy jest w kodzie klienta, więc ktoś zdeterminowany ją odczyta. Chroni przed przypadkowym ruchem i botami, a przed uporczywym nadużyciem broni dopiero limit 5/min i limit kwotowy klucza OpenRouter.

  ✓ D1 POST na `/api/ocena` BEZ nagłówka: **401** z `Aleksandro, Komisja nie rozpoznaje
    petenta.` i bez pól `punkty`/`komentarz` - handler kończy się PRZED czytaniem ciała
    i przed `fetch` do OpenRoutera, więc żądanie nie kosztuje ani grosza.
  ✓ D2 Ten sam POST z nagłówkiem: 200. Zmierzone na deployu preview
    `j-word-pass-dr9r5ptdc` (to samo env produkcyjne): bez nagłówka `401`,
    z `-H "x-jwp-klucz: franciszek"` na `/api/zgloszenie` -> `200 {"tryb":"blob",...}`.
    Plik próbny skasowany.
  ✓ D3 To samo dla `/api/zgloszenie` (401 bez nagłówka, 401 przy złej wartości,
    200 z poprawną) - `tests/f10-03.spec.ts`, 10 testów.
  ✓ D4 Przepływ w przeglądarce po przejściu bramy bez zmian: klient dokłada nagłówek
    z `localStorage` (`DrukOdpowiedzi`, `DrukOgnia`), a pełny przepływ klawiaturowy
    `tests/f6-01` przechodzi. Cała suita: **424 passed / 6 skipped / 0 failed**
    (388 sprzed fazy + 26 z F10-02 + 10 z F10-03).
  ✓ D5 Negatywne: `git grep -ci franciszek` = `data/komisja.json:1` oraz
    `plan/11-BACKLOG.md:4` (cytat w treści samego issue, odstępstwo jak przy F9-01).
    W kodzie, testach i konfiguracji klucza NIE MA - testy jadą na własnej,
    umyślnie innej wartości wstrzykiwanej przez `webServer.env`.
  ✓ D6 `DECISIONS.md` #24: próg zwalniający, zamek zamknięty przy braku zmiennej,
    pięć zmierzonych pułapek.

## F8 - BRAMKA DECYZYJNA

- [x] **F8-01** `deploy` STOP-GATE przed wykonaniem: pokaż Aleksandrze URL preview plus `WERYFIKACJA.md`, zapytaj o zgodę na `vercel deploy --prod` (podmiana żywej produkcji z wersji 1).
  AC: produkcyjny URL działa i pokazuje NOWĄ bramę (zrzut); `/api/ocena` na produkcji odpowiada (1 curl); rate limit: szóste żądanie daje 429; formularz zapisuje do Bloba (1 wpis testowy, potem usunięty, `vercel blob list` = pusto); `og:image` na produkcji wskazuje domenę produkcyjną.

  ✓ ZGODA ALEKSANDRY (2026-09-02, w czacie): "jak skonczysz wrzuc najnowsza wersje na produkcje".
  ✓ D1 produkcja podmieniona na wersję drugą. UWAGA: fizycznie zrobił to `git push origin main`, bo integracja GitHub na Vercelu ma `main` jako gałąź produkcyjną (znalezisko F7-09) - nie było potrzeby wołać `vercel deploy --prod`. Zgoda i tak była, więc podmiana jest zamierzona, ale mechanizm bramki był martwy i to zostaje otwarte w F7-09.
  ✓ D2 cztery strony na `https://j-word-pass.vercel.app` zwracają 200 (`/`, `/egzamin`, `/quiz`, `/proba-ognia`).
  ✓ D3 zmiany z F9 są na żywo: stopka `MINISTERSTWO CERTYFIKACJI JAN SACHSE` (stary napis 0 trafień), pasy-gońce z `PIĘKNIE DZIŚ WYGLĄDASZ` i `POZDRO DLA GEJUF`, treść pytania etapu 1 bezosobowa (fraza z imieniem 0 trafień).
  ✓ D4 `/api/ocena` odpowiada realnie na produkcji: `{"punkty":6,"komentarz":"Aleksandro, zgodnie z protokołem z posiedzenia..."}`.
  ✓ D5 rate limit na produkcji: `1:200 2:200 3:200 4:200 5:200 6:429`.
  ✓ D6 walidacja `/api/zgloszenie` na produkcji: `{"email":"x"}` -> 400.
  ✓ D7 `og:image` wskazuje `https://j-word-pass.vercel.app/opengraph-image?...`, nie localhost.
  ✓ D8 `pnpm run check` czysto, `npx playwright test` = 388 passed / 0 failed (pomiar workera z tej paczki).

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
