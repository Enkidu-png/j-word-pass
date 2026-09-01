# 10 - BACKLOG

## Reguły
- Kolejność ŚCIŚLE liniowa: pierwszy `[ ]` od góry jest następny. Zero rozgałęzień.
- Jedno issue = jeden commit `Fx-NN: opis`. Odhaczenie ZAWSZE z dowodem
  (`✓ <metoda>` albo `✓ screenshots/Fx/plik.png`).
- Faza F(n+1) dopiero po DoD F(n).
- `CZYTAJ:` = budżet czytania workera per issue (plik -> sekcja). Worker NIE czyta
  całego pakietu.
- `⚠ HARD` = zadanie koncepcyjnie grube: na początku paczki, świeże okno.
- Labels: `infra` `silnik` `ui` `ai` `dane` `deploy` `a11y` `perf`.

## Definition of Done każdej fazy (AC6)
`pnpm run check` zielony, `pnpm build` zielony, screenshot stanu fazy w `screenshots/Fx/`,
wpis raportu fazy w czacie orkiestratora, zero znalezisk bez issue w F7-ZNALEZISKA.
Jeśli faza dotknęła `app/vendor/`: każdy plik vendor ma w pierwszej linii
`/* src: URL (licencja) */`, zero plików binarnych w vendor, literały kolorów w vendor
przemapowane na `var(--...)` (dozwolone tylko w komentarzu licencyjnym).

---

## F0 - FUNDAMENT

- [x] **F0-01** `infra` Scaffold Next.js 15 + struktura katalogów + tokens.css + globals.css (reset, klasy kafli PUSTE na razie) + 4 stuby route'ów + DECISIONS.md + skrypt `check` (stub).
  CZYTAJ: 02→A, 02→B.
  AC: `pnpm dev` serwuje 4 route'y (`/`, `/egzamin`, `/quiz`, `/proba-ognia`), każdy ze stubem `<h1 tabIndex={-1}>` z nazwą etapu; strona główna pokazuje J-WORD PASS na `--papier`; `package.json` ma skrypt `check` = `node scripts/lint-tokens.mjs && tsc --noEmit` (skrypt na razie stub zwracający 0); `DECISIONS.md` istnieje z wpisem #1 (@vercel/blob - wyjątek od Z6, zatwierdzony w plan/02 D); dependencies = next/react/react-dom (@vercel/blob dochodzi w F5-02 - allowlist walidatora go przewiduje); `tsc --noEmit` czysty; po scaffoldzie `.gitignore` nadal zawiera `.env*` i `git status --porcelain` NIE pokazuje `.env.local` (weryfikacja PRZED pierwszym pushem - klucz nie może wyjść na publiczne repo).
  DOWÓD: ✓ curl 4 route'y = 200 z `<h1 tabindex="-1">` (`/`, `/egzamin`, `/quiz`, `/proba-ognia`); ✓ screenshots/F0/F0-01-brama.png (J-WORD PASS na `--papier`, chrome-headless-shell 1280x800); ✓ `pnpm run check` exit 0, test negatywny (`const x: number = "nie"`) exit 2; ✓ `git check-ignore -v .env.local` = `.gitignore:1:.env*`, `git status --porcelain` bez `.env.local`. Commit bdde793.
- [x] **F0-02** `infra` Walidator `scripts/lint-tokens.mjs`: (a) literały kolorów/font-size w `app/**` i `components/**` poza tokens.css -> exit 1 z listą (pomija `app/vendor/**` i wnętrza `url("data:...")` - wyjątki Z3); (b) allowlist dependencies = next, react, react-dom, @vercel/blob; (c) walidacja JSON-ów z data/ (aktywuje się, gdy pliki istnieją).
  CZYTAJ: 01→B (Z3), 02→C4.
  AC: wstawienie testowe `color:#fff` do komponentu wywala `pnpm run check` (pokazać output); usunięcie -> zielony; negatywne: `translateX(3px)` NIE jest łapane, literał wewnątrz `url("data:...")` NIE jest łapany.
  DOWÓD: ✓ `components/_ProbaWalidatora.tsx` ze `style={{color:"#fff"}}` -> `pnpm run check` exit 1, output `KOMISJA ODRZUCA KOD. NARUSZEŃ: 1 / components/_ProbaWalidatora.tsx:2 literał koloru (hex)`; po usunięciu pliku exit 0 (`lint-tokens: czysto`); ✓ negatywne: plik z `translateX(3px)` i `url("data:image/svg+xml,...fill=%27#ffffff%27...")` -> exit 0; ✓ dodatkowo `fontSize:"18px"` i `gsap` w dependencies -> 2 naruszenia. Commit cef0ee2.
- [x] **F0-03** `dane` Dane kanoniczne: `data/egzamin.json` (02→C1), `data/quiz.json` (15 pytań 1:1 z plan/11-QUIZ-TRESC.md), `data/komisja.json` (min. 6 stanów kwestii + werdykt-awaryjny x5).
  CZYTAJ: 02→C, 11 (cały), 01→A3 (głos).
  AC: `pnpm run check` przechodzi z aktywną walidacją danych (15 rekordów, id 1-15 ciągłe, abcd po 4 warianty, `poprawna` w {A,B,C,D}, signature unikalne, pyt. 14 ma `kluczOtwarte`); negatywne: emoji tylko w polu `emojiZrodlowe`.
  DOWÓD: ✓ `pnpm run check` exit 0 z aktywną walidacją danych; `node -e` na quiz.json: 15 rekordów, id 1-15 ciągłe, 15 unikalnych signature, pyt. 14 `typ:otwarte` + `kluczOtwarte:[mohsa, skala mohsa]`; ✓ skrypt porównujący 71 linii treści z plan/11 z JSON-em: 0 niedopasowań (kopia 1:1); ✓ negatywne: doklejenie emoji do `pytanie` -> exit 1 `emoji w polu "pytanie" (Z4)`; podmiana id/signature/poprawna/wariantów -> exit 1 z 5 naruszeniami; ✓ `grep -c "—\|·"` na data/*.json = 0 (Z1, Z2).
- [ ] **F0-04** `infra` Playwright: devDeps `@playwright/test` + `@axe-core/playwright`, `npx playwright install chromium`, `playwright.config.ts` (viewporty 1280x800 i 390x844, baseURL http://localhost:3000, webServer `pnpm dev`), `tests/smoke.spec.ts` (4 route'y odpowiadają 200 i mają `h1`).
  CZYTAJ: 02→E.
  AC: `npx playwright test` zielony; negatywne: zero innych nowych devDeps.
- [ ] **F0-05** `infra` Git + GitHub + Vercel + env: repo `Enkidu-png/j-word-pass` (public) wypchnięte, projekt Vercel podpięty (`vercel link --yes`), Blob store utworzony + `BLOB_READ_WRITE_TOKEN` w env, `OPENROUTER_API_KEY` w Vercel env (wartość czytana z ISTNIEJĄCEGO `.env.local` przez grep - NIE z promptu; klucz nie przechodzi przez czat).
  CZYTAJ: 02→A, 02→D, 08→E.
  AC: `gh repo view Enkidu-png/j-word-pass` działa; `vercel env ls` pokazuje oba klucze; wszystkie komendy CLI z flagami nieinteraktywnymi (`--yes`); negatywne: `grep -r "sk-or-" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local` = 0; `git log -p | grep -c "sk-or-"` = 0.
- [ ] **F0-06** `infra` Weryfikacja pomiarów kontekstu (bez modyfikacji plików w ~/.claude - to prywatne repo usera).
  CZYTAJ: 09→START.
  AC: `bash ~/.claude/agent-context.sh` zwraca liczbę lub NO-AGENT-TRANSCRIPT; `cat ~/.claude/context-usage.txt` zwraca liczbę albo pliku brak (wtedy odnotować w raporcie - orkiestrator pracuje wg zasady 9 "brak pliku = pracuj dalej").

## F1 - SILNIK ANIMACJI (przekrojowy, test-first z playgroundem)

- [ ] **F1-01** `silnik` ⚠ HARD Biblioteka `gif-less` (7 wariantów z 03→B) + 5 kafli tła (03→C) + desynchronizacja delayami.
  CZYTAJ: 03→A,B,C; 01→B (Z7,Z8,Z10).
  AC: `/dev/animacje` pokazuje 7 wariantów i 5 kafli; `grep -nE 'animation-timing-function:\s*(ease|cubic-bezier|linear)' app/globals.css` zwraca wyłącznie linie między znacznikami `/* == CEREMONIE START == */` a `/* == CEREMONIE END == */` (03→E); klasy `.gif-less--*` bez skrótu `animation:` (grep = 0); reduced-motion zatrzymuje wszystko (Playwright `page.emulateMedia({reducedMotion:'reduce'})` + screenshot); long tasks: `PerformanceObserver({type:'longtask'})` przez `page.evaluate`, 5 s idle -> 0 wpisów > 50 ms.
- [ ] **F1-02** `silnik` `odprawCeremonie()` + `KometaKursora` + `LicznikMechaniczny` + `Pieczatka`.
  CZYTAJ: 03→D,E,F,G.
  AC: playground: ceremonia demo 3 kroki, Esc skacze do stanu końcowego (test Playwright); kometa znika przy `(pointer:coarse)` emulacji i reduced-motion; licznik z 0 na 42 kręci ≤ 900 ms; pieczątka wbija się w 350 ms; negatywne: kometa nie generuje rAF gdy karta ukryta (Playwright: `page.evaluate` podmienia `requestAnimationFrame` na licznik, symulacja `document.hidden=true` + `visibilitychange`, po 500 ms licznik nie rośnie).
- [ ] **F1-03** `silnik` Playground `/dev/animacje` domknięty + budżet.
  CZYTAJ: 03→H,I.
  AC: produkcyjny build zwraca 404 na /dev/animacje (`pnpm build && pnpm start`, curl); screenshot playgroundu do `screenshots/F1/`; anty-spec 03→I: grep `transition: all` = 0.

## F2 - SHELL + BRAMA

- [ ] **F2-01** `ui` Shell: kursor-komisji, PasekKrawedzi z marquee, PassOMetr (z awarią co 45 s), WebringStopki z licznikiem, layout.
  CZYTAJ: 04→A; 03→B,F (gif-less, licznik); 02→F (kopiowanie); 01→C (nazwy).
  AC: wszystkie 5 elementów na screenshotcie 1280x800; wejście z URL na `/quiz` bez ukończonego egzaminu pokazuje druk `KOMISJA ZABRANIA. NAJPIERW ETAP 1.` bez redirectu (Playwright); PassOMetr blokuje przyszłe etapy dymkiem (Playwright: klik w QUIZ przed egzaminem nie nawiguję); `:focus-visible` daje dashed outline (screenshot z Tab); mobile 390px: PassOMetr jako pasek nad stopką; negatywne: brak sticky headera, brak hamburgera.
- [ ] **F2-02** `ui` RadioKomisji: proceduralny szum WebAudio + beep, opt-in, localStorage.
  CZYTAJ: 04→A pkt 4; 01→B (Z16).
  AC: dźwięk startuje TYLKO po kliknięciu (odświeżenie z jwp.audio=on wymaga jednego kliknięcia - autoplay policy); wyłączenie ucisza w < 100 ms; negatywne: zero plików audio w public/.
- [ ] **F2-03** `ui` Brama: kompozycja (nagłówek chrom, tablica ogłoszeń ≥ 6 dekoracji, formularz-F7 z wnioskiem) + przycisk-uciekinier + ceremonia wejścia.
  CZYTAJ: 04→B; 03→B,E,G (gif-less, ceremonie, pieczątka); 02→F (kopiowanie); 05→B krok 6 (spójność rolet).
  AC: Playwright: `page.locator('.gif-less')` widocznych w viewport 1280x800 >= 6 ORAZ zbiór ich `animation-delay` ma >= 6 różnych wartości; `WOLĘ NIE` ucieka 3x i kapituluje (Playwright); ceremonia wejścia <= 2 s, Esc skip, fokus ląduje na `h1` strony `/egzamin` (stub z F0-01, docelowy nagłówek od F3); reduced-motion: pojedynczy fade; negatywne: brak hero z 2 przyciskami obok siebie (anty-spec 01→D1).
- [ ] **F2-04** `deploy` Pierwszy deploy preview Vercel + stan `lib/stan.ts` (sessionStorage jwp.v1, debounce 400 ms).
  CZYTAJ: 02→G (kontrakt stanu); 02→E; 01→B (Z11).
  AC: URL preview działa i pokazuje bramę (wklejony w BACKLOG przy odhaczeniu); Playwright: na stubie `/egzamin` tymczasowy `<input>` podpięty do `lib/stan.ts` - wpis tekstu, `page.reload()`, wartość wraca; `sessionStorage` ma klucz `jwp.v1`; negatywne: `localStorage` pusty poza `jwp.audio`.

## F3 - EGZAMIN + AI (najważniejsza powierzchnia)

- [ ] **F3-01** `ai` Route `/api/ocena`: OpenRouter gemini-2.5-flash-lite + fallback mistral + clamp 6-10 + sanitizeDash + limity.
  CZYTAJ: 08 (cały); 01→B (Z1,Z2,Z12).
  AC: wszystkie punkty z 08→D (obecnie 7; pkt 7 = tylko produkcja, weryfikacja w F8-01) - curl-e wklejone do commita; negatywne: string OPENROUTER nie występuje w żadnym pliku klienckim.
- [ ] **F3-02** `ui` ⚠ HARD Scena egzaminu: kosmos, słoń ze strzałem hoverowym + licznik naboi, 12 zeber (1 oficerska reverse), arkusz formularz-F7 z textarea.
  CZYTAJ: 05→A1,A2; 03→B (warianty); 02→F (kopiowanie).
  AC: screenshot desktop + mobile 390px (kolumna, 5 zeber); hover słonia odpala strzał + odrzut + licznik -1 (Playwright: licznik po 3 hoverach = 4997); hover zebry robi beczkę raz; negatywne: treść założeń NIE występuje jako blok `<p>` (anty-spec 05→D1).
- [ ] **F3-03** `ui` Karty dowodowe: przeciąganie na POINTER EVENTS (nie HTML5 DnD - testowalne przez Playwright dragTo; decyzja z krytyki planu) + fallback klawiatura + tap-tap mobile + pieczątka ZAŁ.
  CZYTAJ: 05→A3, 05→C (wiersze drag/klawiatura/mobile).
  AC: przeciągnięcie karty w slot przybija ZAŁ. (Playwright `dragTo`); pełna ścieżka klawiaturą Enter/strzałki/Enter działa (test); upuszczenie poza slotem wraca skokiem; licznik załączonych trafia do payloadu ocena (assert w request).
- [ ] **F3-04** `ui` Ceremonia narada-komisji + werdykt + pusta odpowiedź 0/10 + fallback awaryjny + przejście do quizu.
  CZYTAJ: 05→B; 03→E; dane komisja.json.
  AC: pusta odpowiedź: 0/10 bez requestu do API (assert network); niepusta: min 3,5 s teatru, dymki losują się, gwiazdki wypełniają do N, pieczątka N/10, komentarz AI na druku; Esc skip do werdyktu; wyłączony klucz (env unset w dev) -> werdykt awaryjny ≤ 16 s; po powrocie na /egzamin: readonly + werdykt z sessionStorage; screenshot werdyktu.

## F4 - QUIZ

- [ ] **F4-01** `ui` ⚠ HARD Segregator: stos 15 teczek, zakładki, nawigacja (klik/strzałki), wybór wariantów, pyt. 14 otwarte, stemple WYPEŁNIONO, zapis stanu.
  CZYTAJ: 06→A,E; 02→C2; 02→F (kopiowanie).
  AC: wszystkie 15 pytań przechodne klawiaturą; F5 w połowie przywraca zaznaczenia (Playwright: zaznacz 3, reload, assert); pyt. 14 akceptuje `mohsa`/`Mohsa`/`skala Mohsa` (normalize test); negatywne: zero emoji w DOM (grep renderowanego HTML po zakresach emoji = 0), zero natychmiastowego feedbacku poprawności.
- [ ] **F4-02a** `ui` Signature pytań 1-5 z tabeli 06→D.
  CZYTAJ: 06→D (wiersze 1-5); 03→B.
  AC: pytania 1-5 mają unikalne elementy (screenshot-kolaż do screenshots/F4/); signature 1 reaguje na hover wariantu B (Playwright: `animation-play-state` jednego serca = paused); budżet: `node -e` liczy linie każdego pliku signature, max <= 30 (wynik w dowodzie odhaczenia); negatywne: zero emoji w DOM.
- [ ] **F4-02b** `ui` Signature pytań 6-10 z tabeli 06→D.
  CZYTAJ: 06→D (wiersze 6-10); 03→B.
  AC: jak F4-02a dla pytań 6-10; signature 7 reaguje na hover wariantu A (kropla kapie szybciej - zmiana `animation-duration`, assert w Playwright).
- [ ] **F4-02c** `ui` Signature pytań 11-15 z tabeli 06→D.
  CZYTAJ: 06→D (wiersze 11-15); 03→B.
  AC: jak F4-02a dla pytań 11-15; signature 12 reaguje na hover wariantu A (nutki w uśmiech); signature 14 błyska przy poprawnym wpisie.
- [ ] **F4-03** `ui` Maszyna prawdy: ceremonia 15x werdykt + licznik + pieczątka N/15 + tryb rewizji + przejście podanie-do-ognia.
  CZYTAJ: 06→B,C; 03→E,F.
  AC: pełna ceremonia ≤ 9 s (pomiar performance.now w teście); Esc = wszystkie werdykty naraz; nieodpowiedziane liczą się jako błędne po potwierdzeniu druku; rewizja: poprawna obwiedziona, błędna przekreślona; przejście z płonącym samolocikiem ≤ 2,2 s prowadzi na /proba-ognia; wynik w sessionStorage; screenshoty: maszyna w trakcie + rewizja.

## F5 - PRÓBA OGNIA

- [ ] **F5-01** `ui` Scena ogniska + formularz OGN-3/TAJ (3 pola z kiczem: stopka-miarka, suwmiarka ucha) + walidacja kliencka ze stemplami + klauzula śmierci + checkbox.
  CZYTAJ: 07→A,C; 02→F (kopiowanie); 01→B (Z13,Z14).
  AC: błędny email -> trzęsienie + stempel WYPEŁNIONO NIEGODNIE + fokus (Playwright); but 8 -> stempel (zakres 10-70); ucho 200 -> przechodzi z dopiskiem podziwu; submit bez checkboxa zablokowany; screenshot desktop+mobile; negatywne: zero czerwonych obwódek bez stempla, brak steppera.
- [ ] **F5-02** `infra` Route `/api/zgloszenie`: walidacja serwerowa + Vercel Blob + fallback dev-log + idempotencja klienta.
  CZYTAJ: 02→D; 07→B (start równoległy, retry).
  AC: poprawny POST tworzy blob `zgloszenia/...json` (potwierdzić przez listing SDK lub dashboard - wklejony dowód); email `x` -> 400 z komunikatem Komisji; payload 3 KB -> 400/413; lokalnie bez tokena: 200 `tryb:"dev-log"`; negatywne: drugi submit z flagą wyslano nie wysyła (assert network).
- [ ] **F5-03** `ui` ⚠ HARD Ceremonia spalenia + list-w-butelce + pergamin + OD NOWA.
  CZYTAJ: 07→B,C; 03→E; 02→F (kopiowanie).
  AC: sekwencja krok po kroku wg tabeli (wideo lub 4 screenshoty faz); klik butelki (i Enter na fokusie) rozwija pergamin z e-mailem kandydata i sumą N/25; Esc w 1-4 skacze do butelki; reduced-motion: 2 kroki po 300 ms; OD NOWA czyści stan i wraca do bramy; powrót na URL po wysłaniu: od razu butelka, zero POST.

## F6 - POLISH

- [ ] **F6-01** `a11y` Audyt dostępności całości: fokus-ścieżka przez 3 etapy samą klawiaturą, kontrasty tokenów (poprawić wartości w tokens.css jeśli < 4.5:1 dla tekstu treści; nagłówki dekoracyjne ≥ 3:1), aria-labels na SVG interaktywnych, `role="button"` na butelce.
  CZYTAJ: 01→B (Z9,Z10); wyniki własne.
  AC: cały flow brama->pergamin przechodzalny bez myszy (nagranie kroków w commit message); `@axe-core/playwright`: 0 błędów critical na 4 stronach; negatywne: żaden `outline:none` bez zamiennika.
- [ ] **F6-02** `perf` Budżety: LCP < 2,5 s na preview (Lighthouse), brak long tasks > 50 ms idle na każdej z 4 stron, bundle first-load < 160 kB.
  CZYTAJ: 03→C budżet, 03→I.
  AC: raport Lighthouse w screenshots/F6/; `next build` output first-load wklejony; poprawki jeśli przekroczone.
- [ ] **F6-03** `ui` 404 w stylu Komisji (`AKTA ZAGINĘŁY. NISZCZARKA BYŁA SZYBSZA.` + pieczątka + link do bramy), metadata/OG: `app/opengraph-image.tsx` przez `ImageResponse` z `next/og` (zero nowych zależności, zero binariów), favicon: `app/icon.svg` (pieczątka, Next 15 obsługuje SVG natywnie).
  CZYTAJ: 04→A (stopka spójna); 02→A.
  AC: /nieistnieje daje stylizowane 404 (screenshot); `curl -s <url> | grep og:` pokazuje og:title i og:image; GET /opengraph-image zwraca 200 image/png; favicon widoczny.

## F7-ZNALEZISKA (rośnie w trakcie; DoD: każde znalezisko ma issue z dyspozycją zrobione / odrzucone z powodem / przeniesione)

_(pusta na starcie)_

## F8 - BRAMKA DECYZYJNA: PRODUKCJA

- [ ] **F8-01** `deploy` ⏳ STOP-GATE przed wykonaniem: pokaż userowi URL preview + WERYFIKACJA.md, zapytaj o zgodę na `vercel --prod` (i ewentualną domenę).
  AC: produkcyjny URL działa, `/api/ocena` na produkcji odpowiada (1 test-curl, koszt ~$0.0001); rate limit: 6 szybkich żądań, szóste dostaje 429 (08→B pkt 7); formularz zapisuje do Blob na produkcji (1 wpis testowy, potem usunięty).

---

## GITHUB-IMPORT
Issues NIE importujemy do GitHub na starcie (checkboxy tego pliku = źródło prawdy;
sztafeta workerów czyta plik, nie API). Po zakończeniu buildu ewentualne otwarte
pozycje F7 przenieść: `gh issue create -R Enkidu-png/j-word-pass -t "<tytuł>" -b "<AC>"`
-l odpowiednim labelem; link zwrotny wpisać przy issue w tym pliku.
