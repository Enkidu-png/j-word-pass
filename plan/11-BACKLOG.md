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

- [ ] **F0-01** `infra` Czystka: usunięcie całej warstwy wizualnej v1 wg listy `plan/02 C`, zostawienie tego, co wymienia `plan/02 B`. Nowe puste `app/globals.css` i `app/tokens.css` z tokenami z `plan/02 D`. Cztery route'y renderują stub `<h1 tabIndex={-1}>` z nazwą etapu.
  CZYTAJ: 02→B, 02→C, 02→D.
  AC: `pnpm dev` serwuje `/`, `/egzamin`, `/quiz`, `/proba-ognia` ze stubem i statusem 200; `pnpm build` zielony; `tsc --noEmit` czysty; katalog `components/` zawiera WYŁĄCZNIE pliki wymienione w `plan/02 B` (`ls components/` w dowodzie); negatywne: `git grep -l "Pieczatka\|KometaKursora\|segregator"` w `app/` i `components/` zwraca 0 plików; `data/*.json`, `lib/*.ts` i `app/api/**` nietknięte (`git diff --stat` nie pokazuje ich).
- [ ] **F0-02** `infra` Walidator `scripts/lint-tokens.mjs` rozszerzony o: (a) Z6 - zakaz `rotate(`, `skew(`, `rotate3d(`, `rotateZ(` w `app/**` i `components/**` poza `components/scena/EkranLadowania.tsx` i `app/style/ladowanie.css`; (b) Z9 - zakaz `background-size` w regule zawierającej `--kafel` albo klasę `.kafel`; (c) walidacja `data/assety.json` wg `plan/03 D`.
  CZYTAJ: 01→E (Z3, Z6, Z9), 03→D.
  AC: wstawienie `transform: rotate(3deg)` do dowolnego komponentu wywala `pnpm run check` z komunikatem zawierającym `Z6` (pokazać output), usunięcie wraca do zielonego; wstawienie `rotateY` do `EkranLadowania.tsx` NIE wywala; pozycja w `data/assety.json` wskazująca nieistniejący plik wywala `check`; negatywne: `scaleX(-1)` NIE jest łapane.
- [ ] **F0-03** `assety` ⚠ HARD Zdobycie biblioteki assetów wg `plan/03 B`: rdzeń (10 pozycji), 5 kafli, minimum 8 stworów rogowych, 3 plakietki 88x31. Pliki do `public/assets/`, klatki statyczne do `public/assets/statyczne/`, manifest `data/assety.json`, źródła do `ATTRIBUTION.md`.
  CZYTAJ: 03 (cały).
  AC: `data/assety.json` ma >= 26 pozycji, wszystkie z istniejącymi plikami (`pnpm run check` zielony z walidacją z F0-02); każda pozycja o roli `ozdoba` lub `pas` ma istniejącą `klatka-statyczna`; `ATTRIBUTION.md` ma wiersz dla KAŻDEGO pliku z `public/assets/` (liczba wierszy == liczba plików, pokazać `wc -l`); żaden plik nie przekracza 300 KB (`find public/assets -size +300k` = pusto); negatywne: zero plików audio i wideo w `public/`.
- [ ] **F0-04** `infra` Font `Caveat` self-hostowany: `public/fonts/caveat.woff2` (podzbiór z polskimi znakami), `@font-face` z `font-display: swap`, fallback `Comic Sans MS`.
  CZYTAJ: 02→D.
  AC: `curl -s localhost:3000 | grep -c "fonts.googleapis"` = 0; nagłówek na bramie renderuje się fontem odręcznym (zrzut ekranu); polskie znaki `ąćęłńóśźż` widoczne poprawnie w zrzucie; negatywne: zero żądań do zewnętrznych domen na starcie strony (assercja `page.on('request')` w teście).
- [ ] **F0-05** `infra` Testy bazowe: `tests/smoke.spec.ts` (4 route'y 200 + `h1`), `tests/budzet.spec.ts` (suma `transferSize` odpowiedzi `image/*` na widok <= 2,5 MB), `tests/kanon.spec.ts` (brak `·` i `—` w `document.body.innerText` na 4 stronach).
  CZYTAJ: 01→E (Z1, Z2, Z18), 03→C.
  AC: `npx playwright test` zielony na obu viewportach; test budżetu realnie mierzy (podnieś próg do 1 KB, test pada, przywróć); negatywne: zero nowych devDependencies.
- [ ] **F0-06** `infra` Weryfikacja pomiarów kontekstu (bez modyfikacji innych plików w `~/.claude`).
  CZYTAJ: 10→START.
  AC: `bash ~/.claude/agent-context.sh` zwraca liczbę albo `NO-AGENT-TRANSCRIPT`; `cat ~/.claude/context-usage.txt` zwraca liczbę albo pliku brak (odnotować w raporcie).

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
- [ ] **F1-05** `silnik` Kursor-komisji + domknięcie playgroundu + budżety.
  CZYTAJ: 04→I,K,L.
  AC: `html` ma `cursor` z `url("/assets/kursor.gif") 4 2`; plik kursora ma maksymalnie 32x32 (`file public/assets/kursor.gif` w dowodzie); produkcyjny build zwraca 404 na `/dev/scena` (`pnpm build && pnpm start`, curl); zero long tasków > 50 ms w 5 s bezczynności na playgroundzie; negatywne: `grep -rn 'transition: all' app components` = 0.

## F2 - SHELL I BRAMA

- [ ] **F2-01** `ui` Shell: `PasGoniec` górny, `PassOMetr` (3 stany, awaria co 45 s), `StrazEtapu`, stopka-webring z licznikiem lokalnym i plakietkami.
  CZYTAJ: 05→A; 04→B,C,H; 01→F (słownik).
  AC: `PassOMetr` pokazuje trzy pola, etap 2 i 3 mają `aria-disabled="true"` przed zdaniem poprzednich; wejście z URL na `/quiz` bez zdanego egzaminu pokazuje druk `ALEKSANDRO, KOMISJA ZABRANIA. NAJPIERW ETAP 1.` BEZ przekierowania (URL się nie zmienia); licznik odwiedzin pokazuje 7 cyfr i rośnie o 1 po nowej sesji; na 390 px `PassOMetr` jest NAD stopką (porównanie `getBoundingClientRect().top`, wynik w dowodzie); negatywne: zero elementów z `position: fixed` w shellu (`page.evaluate` po wszystkich elementach), zero sticky headera, zero hamburgera.
- [ ] **F2-02** `ui` ⚠ HARD Brama `/`: kompozycja 10 punktów z `plan/05 B1`, kafel tła, tablica ogłoszeń z 6 ozdobami, druk wstępny z `ALEKSANDRA` readOnly.
  CZYTAJ: 05→B1,C,D; 04→B,C,D; 01→E (Z8, Z9).
  AC: liczba animowanych elementów w widoku 1280x800 >= 12 (policzyć `img[data-ozdoba]` + pasy + pas-goniec, wynik w dowodzie); zbiór `animation-delay` ozdób tablicy ogłoszeń ma >= 6 różnych wartości; `html` ma `background-repeat: repeat` i NIE ma `background-size` (odczyt `getComputedStyle`); pole imienia ma wartość `ALEKSANDRA` i atrybut `readonly`; zrzuty desktop i 390 px OBEJRZANE - tekst czytelny na kaflu, nic nie zasłania przycisków (`elementFromPoint` na środku każdego przycisku zwraca ten przycisk); negatywne: zero `rotate`/`skew` w DOM bramy, brak hero z dwoma przyciskami w pustej przestrzeni.
- [ ] **F2-03** `ui` Przycisk-uciekinier wg `plan/05 B2`.
  CZYTAJ: 05→B2,C.
  AC: `WOLĘ NIE` zmienia pozycję dokładnie 3 razy przy trzech osobnych najechaniach (kursor musi opuścić przycisk między nimi), przy czwartym zostaje i ma tekst `DOBRZE, ALEKSANDRO, NIECH BĘDZIE`; klik po kapitulacji prowadzi na `/egzamin`; `Enter` na sfokusowanym przycisku NIE powoduje ucieczki; przy `(pointer: coarse)` ucieczka wyłączona; negatywne: przycisk nigdy nie ma `transform: rotate` (Z6), nigdy nie wychodzi poza kontener (`getBoundingClientRect` mieści się w tablicy ogłoszeń).
- [ ] **F2-04** `ui` Ceremonia wejścia na bramie + podpięcie `EkranLadowania` do pierwszego wejścia w sesji.
  CZYTAJ: 05→B3; 04→F; 02→B (lib/stan.ts).
  AC: klik `PRZYSTĘPUJĘ` pokazuje ekran ładowania i po 1200-2600 ms ląduje na `/egzamin` z fokusem na `h1`; `Escape` skraca do natychmiast; drugie wejście na `/` w tej samej sesji NIE pokazuje ekranu (klucz `jwp.ladowanie` w `sessionStorage`); negatywne: ekran ładowania nie pojawia się przy `reducedMotion` dłużej niż 400 ms.
- [ ] **F2-05** `deploy` Pierwszy deploy PREVIEW (nie produkcja) i weryfikacja bramy na żywo.
  CZYTAJ: 02→A; 02→G pkt 5.
  AC: `vercel deploy` (BEZ `--prod`) zwraca URL preview, `curl -sI <url>` = 200; brama na preview pokazuje kafel, statek i tablicę ogłoszeń (zrzut z preview w `screenshots/F2/`); URL wklejony do BACKLOG przy odhaczeniu; negatywne: `vercel ls` pokazuje, że produkcja NIE została podmieniona (Environment produkcyjnego deployu bez zmian).

## F3 - EGZAMIN

- [ ] **F3-01** `dane` Treść pod Aleksandrę: `data/egzamin.json` (pole `zalozenia` jako lista 6 pozycji), `data/komisja.json`, prompt systemowy w `/api/ocena` i komunikaty w `/api/zgloszenie` przepisane na zwrot bezpośredni (Z16). Usunięcie pola `zalaczniki` z kontraktu `/api/ocena`.
  CZYTAJ: 01→D; 06→A; 02→B,E.
  AC: `git grep -niE "kandydat[a-ząćęłńóśźż]*( jest| proszony| powinien)|wypełniono niegodnie" data app | wc -l` = 0; `data/egzamin.json` ma tablicę `zalozenia` o długości 6; curl do `/api/ocena` z payloadem BEZ pola `zalaczniki` zwraca 200 i punkty w zakresie 0-10; odpowiedź modelu zawiera imię `Aleksandr` w jakiejś formie w minimum 3 z 5 prób (wynik w dowodzie); negatywne: `git grep -c zalaczniki app/api` = 0, testy `tests/f3-01.spec.ts` z v1 nadal zielone po aktualizacji payloadu.
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
  AC: `/nie-ma` zwraca 404 ze stroną w stylu projektu (własny kafel, minimum 3 ozdoby, tekst do Aleksandry); `metadataBase` liczony z `VERCEL_PROJECT_PRODUCTION_URL` z fallbackiem na localhost - build z tą zmienną daje absolutny `og:image` na domenie produkcyjnej (pomiar curlem na `next start`, wynik w dowodzie); favicon istnieje; negatywne: `og:image` nigdy nie wskazuje `localhost` w buildzie z ustawioną zmienną.
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
