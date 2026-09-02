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

- [ ] **F7-01** `infra` Odpiecie parkowania dwoch testow w `tests/f5-02.spec.ts`.
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

- [ ] **F7-02** `ui` Naglowek `h1` jest przyciety przy lewej krawedzi okna.
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
- [ ] **F7-03** `ui` Plakietki webringu nie respektuja Z11 (reduced motion).
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
- [ ] **F7-04** `a11y` Kontrast tekstu w zamknietym polu PassOMetr.
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

- [ ] **F7-05** `ui` Wariant `odbijany` pasa-gonca liczy droge od szerokosci OKNA, nie kontenera.
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
