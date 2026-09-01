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
- [x] **F0-04** `infra` Playwright: devDeps `@playwright/test` + `@axe-core/playwright`, `npx playwright install chromium`, `playwright.config.ts` (viewporty 1280x800 i 390x844, baseURL http://localhost:3000, webServer `pnpm dev`), `tests/smoke.spec.ts` (4 route'y odpowiadają 200 i mają `h1`).
  CZYTAJ: 02→E.
  AC: `npx playwright test` zielony; negatywne: zero innych nowych devDeps.
  DOWÓD: ✓ `npx playwright test` = 8 passed (4 route'y x 2 projekty: desktop 1280x800, mobile 390x844), webServer `pnpm dev`; ✓ devDeps po issue: `@axe-core/playwright`, `@playwright/test` + zastane `@types/*`, `typescript` - zero innych nowych; ✓ `pnpm run check` exit 0.
- [x] **F0-05** `infra` Git + GitHub + Vercel + env: repo `Enkidu-png/j-word-pass` (public) wypchnięte, projekt Vercel podpięty (`vercel link --yes`), Blob store utworzony + `BLOB_READ_WRITE_TOKEN` w env, `OPENROUTER_API_KEY` w Vercel env (wartość czytana z ISTNIEJĄCEGO `.env.local` przez grep - NIE z promptu; klucz nie przechodzi przez czat).
  CZYTAJ: 02→A, 02→D, 08→E.
  AC: `gh repo view Enkidu-png/j-word-pass` działa; `vercel env ls` pokazuje oba klucze; wszystkie komendy CLI z flagami nieinteraktywnymi (`--yes`); negatywne: `grep -r "sk-or-" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local` = 0; `git log -p | grep -c "sk-or-"` = 0.
  ✓ ODBLOKOWANE I DOMKNIĘTE przez orkiestratora (user wykonał `vercel login`). `gh repo view Enkidu-png/j-word-pass` = PUBLIC/main; `vercel link --yes` = enkidu-pngs-projects/j-word-pass; Blob store `jwp-zgloszenia` utworzony przez `vercel blob create-store jwp-zgloszenia --access private --yes` (PRYWATNY - zgłoszenia zawierają e-maile; F5-02 musi użyć `access: "private"` w `put()`); `vercel env ls` pokazuje `BLOB_READ_WRITE_TOKEN` (Production, Preview, Development) i `OPENROUTER_API_KEY` (Production+Preview jako Sensitive, Development jako zwykły - `--sensitive` jest niedozwolone dla Development). Negatywne: `grep -rEo "sk-or-v1-[a-z0-9]{16,}"` w drzewie (bez node_modules/.git/.next/.env.local) = 0 trafień; `git log -p --all | grep -c` na tym samym wzorcu = 0; `git ls-files | grep -cE "^\.(vercel|env)"` = 0. Klucz podany przez usera w czacie i wprowadzony przez stdin do `vercel env add` - nie przeszedł przez żaden plik repo, commit ani prompt workera (Z12).
- [x] **F0-06** `infra` Weryfikacja pomiarów kontekstu (bez modyfikacji plików w ~/.claude - to prywatne repo usera).
  CZYTAJ: 09→START.
  AC: `bash ~/.claude/agent-context.sh` zwraca liczbę lub NO-AGENT-TRANSCRIPT; `cat ~/.claude/context-usage.txt` zwraca liczbę albo pliku brak (wtedy odnotować w raporcie - orkiestrator pracuje wg zasady 9 "brak pliku = pracuj dalej").
  DOWÓD: ✓ `bash ~/.claude/agent-context.sh` -> `NO-TRANSCRIPT` (exit 1) - wartość dopuszczona przez AC, worker pracuje dalej i nie zgaduje procentu; ✓ `cat ~/.claude/context-usage.txt` -> `11` (liczba, plik istnieje). Zero modyfikacji w ~/.claude.

## F1 - SILNIK ANIMACJI (przekrojowy, test-first z playgroundem)

- [x] **F1-01** `silnik` ⚠ HARD Biblioteka `gif-less` (7 wariantów z 03→B) + 5 kafli tła (03→C) + desynchronizacja delayami.
  CZYTAJ: 03→A,B,C; 01→B (Z7,Z8,Z10).
  AC: `/dev/animacje` pokazuje 7 wariantów i 5 kafli; `grep -nE 'animation-timing-function:\s*(ease|cubic-bezier|linear)' app/globals.css` zwraca wyłącznie linie między znacznikami `/* == CEREMONIE START == */` a `/* == CEREMONIE END == */` (03→E); klasy `.gif-less--*` bez skrótu `animation:` (grep = 0); reduced-motion zatrzymuje wszystko (Playwright `page.emulateMedia({reducedMotion:'reduce'})` + screenshot); long tasks: `PerformanceObserver({type:'longtask'})` przez `page.evaluate`, 5 s idle -> 0 wpisów > 50 ms.
  DOWÓD: ✓ `npx playwright test` = 16 passed (2 projekty x 8), w tym `tests/f1-01.spec.ts`: `[data-wariant]`=7, `[data-kafel]`=5, każdy wariant z `getComputedStyle` ma `steps(N)` N∈⟨2,8⟩, czas 300-1400 ms, `iteration-count: infinite`; ✓ screenshots/F1/F1-01-playground-desktop.png + -mobile.png (7 wariantów, 5 kafli proceduralnych, ściana 20 dekoracji); ✓ AC grep `animation-timing-function:\s*(ease|...)` = 1 trafienie, linia 144, znaczniki CEREMONIE w 142 i 145 (wyłącznie wewnątrz); ✓ skrót `animation:` w klasach `.gif-less--*` = 0 (jedyne wystąpienie w pliku to `animation: none !important` w bloku reduced-motion); ✓ reduced-motion: `emulateMedia({reducedMotion:'reduce'})` -> `animationName === "none"` dla WSZYSTKICH `.gif-less`, screenshots/F1/F1-01-reduced-motion-{desktop,mobile}.png (treść czytelna, blink widoczny); ✓ desynchronizacja: 20 dekoracji ściany ma 20 różnych `animation-delay` (wzór `(i*137)%900`); ✓ budżet: `PerformanceObserver({type:'longtask'})` 5 s idle -> 0 wpisów > 50 ms (oba viewporty); ✓ `pnpm run check` exit 0.
  UWAGA: znaleziony i naprawiony w trakcie weryfikacji (widoczny dopiero na screenshotcie, testy go nie łapały): inline `background: "none"` w playgroundzie kasował `background-image` z `.gif-less--chrom` (skrót nadpisuje longhand), przez co tekst z `background-clip: text; color: transparent` był NIEWIDOCZNY. Fix: longhand `backgroundImage` + `undefined`. Dodany assert pilnujący gradientu chromu.
- [x] **F1-02** `silnik` `odprawCeremonie()` + `KometaKursora` + `LicznikMechaniczny` + `Pieczatka`.
  CZYTAJ: 03→D,E,F,G.
  AC: playground: ceremonia demo 3 kroki, Esc skacze do stanu końcowego (test Playwright); kometa znika przy `(pointer:coarse)` emulacji i reduced-motion; licznik z 0 na 42 kręci ≤ 900 ms; pieczątka wbija się w 350 ms; negatywne: kometa nie generuje rAF gdy karta ukryta (Playwright: `page.evaluate` podmienia `requestAnimationFrame` na licznik, symulacja `document.hidden=true` + `visibilitychange`, po 500 ms licznik nie rośnie).
  DOWÓD: ✓ `npx playwright test` = 28 passed (2 projekty), `tests/f1-02.spec.ts`: ceremonia demo 3 kroki zapalają się sekwencyjnie, `data-stan-koncowy` = `tak` po pełnym przebiegu; ✓ Esc w połowie -> stan końcowy w < 600 ms (mierzone `Date.now()`) + fokus na elemencie końcowym (Z9, `toBeFocused`); ✓ kometa: 8 kwadratów obecnych, ogon faktycznie goni kursor (`style.transform` po `mouse.move` = `translate3d(120px, 200px, 0)` -> `(300px, 500px)`); znika po `emulateMedia({reducedMotion:'reduce'})` i w kontekście `hasTouch`+`isMobile` (`matchMedia('(pointer: coarse)')` = true) -> `[data-kometa]` = 0; ✓ negatywne rAF: podmiana `window.requestAnimationFrame` na licznik - 300 ms przy widocznej karcie daje > 0 klatek, po `document.hidden=true` + `visibilitychange` licznik przez 500 ms = 0; ✓ licznik: klik NA 42 -> `data-licznik="42"`, `transitionDuration` kolumn max 480 ms (≤ 900 cap), `transitionTimingFunction` = `steps(10)`, taśmy stoją na `translateY(0%,0%,-40%,-20%)` = cyfry 0042; ✓ pieczątka: `animationName` = `jwp-wbicie`, czas dokładnie 350 ms, `steps(4)`, 1 iteracja, tekst po łuku w `<textPath>` + `aria-label`; ✓ screenshots/F1/F1-02-silnik-desktop.png (ceremonia w stanie końcowym, licznik 0042 na bębnach, 3 pieczątki w tonach urzad/alarm/jad); ✓ `pnpm run check` exit 0.
  UWAGA: `--rozmiar-pieczatka` dołożony do tokens.css - walidator (słusznie) odrzucił `font-size: 15px` w `.pieczatka__tekst` (Z3).
- [x] **F1-03** `silnik` Playground `/dev/animacje` domknięty + budżet.
  CZYTAJ: 03→H,I.
  AC: produkcyjny build zwraca 404 na /dev/animacje (`pnpm build && pnpm start`, curl); screenshot playgroundu do `screenshots/F1/`; anty-spec 03→I: grep `transition: all` = 0.
  DOWÓD: ✓ `pnpm build` zielony (8/8 stron, first load 102 kB, `/dev/animacje` 105 kB) + `pnpm start`, `curl -o /dev/null -w '%{http_code}'`: `/dev/animacje` = **404**, a `/`, `/egzamin`, `/quiz`, `/proba-ognia` = 200; treść playgroundu nie wycieka (`grep -c 'PLAC PROB'` na produkcyjnym HTML = 0, strona zwraca druk 404); brama zamknięta w `app/dev/layout.tsx` (serwerowy layout, `notFound()` gdy `NODE_ENV==="production"`), więc chroni całe drzewo `/dev`, nie pojedynczą stronę; ✓ screenshots/F1/F1-03-playground-{desktop,mobile}.png (pełny playground: 7 wariantów, 5 kafli, ściana 20 dekoracji, ceremonia w stanie końcowym, licznik 0042, 3 pieczątki; mobile 390 px układa się w kolumnę); ✓ anty-spec 03→I komplet: `transition: all` = 0; własności animowane w `@keyframes` = `{transform, opacity, background-position-x, visibility}`, czyli zero `width/height/top/left` (pkt 2); `will-change` = 0 (pkt 3); `IntersectionObserver` = 0 (pkt 4); ✓ `pnpm run check` exit 0, `npx playwright test` = 28 passed.
  UWAGA: w tabeli buildu `/dev/animacje` nadal figuruje jako route (2,71 kB bundla), ale serwuje 404 - to tylko artefakt kompilacji, nieosiągalny nawigacyjnie.

## F2 - SHELL + BRAMA

- [x] **F2-01** `ui` Shell: kursor-komisji, PasekKrawedzi z marquee, PassOMetr (z awarią co 45 s), WebringStopki z licznikiem, layout.
  CZYTAJ: 04→A; 03→B,F (gif-less, licznik); 02→F (kopiowanie); 01→C (nazwy).
  AC: wszystkie 5 elementów na screenshotcie 1280x800; wejście z URL na `/quiz` bez ukończonego egzaminu pokazuje druk `KOMISJA ZABRANIA. NAJPIERW ETAP 1.` bez redirectu (Playwright); PassOMetr blokuje przyszłe etapy dymkiem (Playwright: klik w QUIZ przed egzaminem nie nawiguję); `:focus-visible` daje dashed outline (screenshot z Tab); mobile 390px: PassOMetr jako pasek nad stopką; negatywne: brak sticky headera, brak hamburgera.
  DOWÓD: ✓ `npx playwright test` = 37 passed + 1 skipped (`tests/f2-01.spec.ts`, 11 przypadków); ✓ screenshots/F2/F2-01-shell-desktop.png 1280x800 - wszystkie 5 elementów naraz: kursor-komisji (własny SVG w `data:` URI, wariant przechylony `rotate(20 16 16)` na klikalnych - assert na `getComputedStyle().cursor`), PasekKrawedzi 44 px z proporczykami i marquee (`jwp-marquee`, `steps(24)`, 3,8 s - patrz DECISIONS #4), PassOMetr w prawym górnym rogu z 3 segmentami, WebringStopki z odznaką VALID HTML 4.0 i licznikiem mechanicznym (1545013 + dzień, asercja zakresu), layout bez sticky headera; ✓ straż etapu: `/quiz` bez egzaminu -> URL NADAL `/quiz` (zero redirectu, Z15) + druk `KOMISJA ZABRANIA. NAJPIERW ETAP 1.`, `/proba-ognia` -> `NAJPIERW ETAP 2.`, a po wstawieniu do `sessionStorage` egzaminu z punktami druk na `/quiz` znika (`[data-straz]` = 0) - screenshots/F2/F2-01-straz-quiz.png; ✓ PassOMetr: segment QUIZ ma `data-stan="zablokowany"` i `title="KOMISJA ZABRANIA"`, klik NIE nawiguje (URL zostaje `/`) i pokazuje dymek gasnący po 1,2 s, a segment EGZAMIN nawiguje normalnie; ✓ `:focus-visible`: Tab -> `outlineStyle` = `dashed`, szerokość > 0, screenshots/F2/F2-01-fokus-{desktop,mobile}.png; ✓ mobile 390: pasek 32 px, PassOMetr `position: static`, szerokość 390 px, leży POD treścią i przylega do stopki (odstęp < 8 px), a w DOM nadal stoi przed treścią i stopką (`compareDocumentPosition`) - przestawiona jest wyłącznie kolejność wizualna, więc Tab i czytnik ekranu idą kolejnością z plan/04 A; screenshots/F2/F2-01-shell-mobile.png; ✓ negatywne: zero elementów `position: sticky`, zero `<header>`, zero przycisku menu/hamburger; ✓ `pnpm run check` exit 0, `pnpm build` zielony.
  UWAGA: pierwsza wersja kładła PassOMetr na mobile pod paskiem krawędzi (u GÓRY) - testy przechodziły, bo asercja `metr.y < stopka.y` była spełniona trywialnie. Wyłapane dopiero na screenshotcie; poprawione przez `order` we flexowym `body` i zaostrzoną asercję (metr musi być POD treścią i przylegać do stopki).
  KOPIOWANIE (02→F pkt 4): sprawdzone `98.css` pod PassOMetr i `formularz-F7`; odrzucone - potrzebne było ~15 linii ramki `outset` na naszych tokenach, a wklejka ciągnęłaby cały arkusz i tak wymagający przemapowania kolorów. Kursor, proporczyki i odznaka: własne SVG/gradienty, zero plików.
- [x] **F2-02** `ui` RadioKomisji: proceduralny szum WebAudio + beep, opt-in, localStorage.
  CZYTAJ: 04→A pkt 4; 01→B (Z16).
  AC: dźwięk startuje TYLKO po kliknięciu (odświeżenie z jwp.audio=on wymaga jednego kliknięcia - autoplay policy); wyłączenie ucisza w < 100 ms; negatywne: zero plików audio w public/.
  DOWÓD: ✓ `npx playwright test` = 43 passed + 1 skipped (`tests/f2-02.spec.ts`, 6 przypadków); ✓ Z16 zweryfikowane podsłuchem `AudioContext` wstrzykniętym przez `addInitScript` PRZED skryptami strony: po `localStorage.setItem("jwp.audio","on")` + `reload()` liczba utworzonych kontekstów = **0**, `[data-gra]` = `nie`, widoczna notka `KOMISJA PAMIĘTA WYBÓR /// POTRZEBNE JEDNO KLIKNIĘCIE`; dopiero klik tworzy 1 kontekst w stanie `running`; ✓ dźwięk jest PRAWDZIWY, nie samo `running`: podsłuch węzłów pokazuje `gain.value` = 0,03, filtr `lowpass` 400 Hz, źródło z `loop=true` i buforem, w którym 1000/1000 próbek jest niezerowych (biały szum, nie cisza); ✓ wyciszenie: pomiar `performance.now()` w przeglądarce od kliknięcia do `ctx.state === "closed"` = **< 100 ms**, `jwp.audio` przestawione na `off`; ✓ negatywne: katalog `public/` w ogóle nie istnieje, a nasłuch `page.on("request")` nie złapał ani jednego żądania o `.mp3/.ogg/.wav/.m4a/.aac/.flac`; jedyny klucz w `localStorage` to `jwp.audio` (`Object.keys(localStorage)` = `["jwp.audio"]`, Z11); ✓ screenshots/F2/F2-02-radio-wlaczone.png (obudowa SVG z kratką głośnika i gałką, wskaźnik przestawiony na włączone); ✓ `pnpm run check` exit 0.
  UWAGA: napis przycisku to `WŁĄCZAM SZUM URZĘDOWY` / `WYCISZAM RADIO KOMISJI` zamiast `WŁĄCZ SZUM URZĘDOWY` z plan/04 A4 - Z13 zabrania trybu rozkazującego i każe pisać przyciski jako zdania w pierwszej osobie.
- [x] **F2-03** `ui` Brama: kompozycja (nagłówek chrom, tablica ogłoszeń ≥ 6 dekoracji, formularz-F7 z wnioskiem) + przycisk-uciekinier + ceremonia wejścia.
  CZYTAJ: 04→B; 03→B,E,G (gif-less, ceremonie, pieczątka); 02→F (kopiowanie); 05→B krok 6 (spójność rolet).
  AC: Playwright: `page.locator('.gif-less')` widocznych w viewport 1280x800 >= 6 ORAZ zbiór ich `animation-delay` ma >= 6 różnych wartości; `WOLĘ NIE` ucieka 3x i kapituluje (Playwright); ceremonia wejścia <= 2 s, Esc skip, fokus ląduje na `h1` strony `/egzamin` (stub z F0-01, docelowy nagłówek od F3); reduced-motion: pojedynczy fade; negatywne: brak hero z 2 przyciskami obok siebie (anty-spec 01→D1).
  DOWÓD: ✓ `npx playwright test` = 53 passed + 4 skipped (`tests/f2-03.spec.ts`, 11 przypadków); ✓ ściana ruchu: w viewporcie 1280x800 zliczone `.gif-less` faktycznie widoczne (niezerowe pudełko + przecięcie z viewportem) = **>= 6**, a zbiór ich `animation-delay` ma **>= 6 różnych wartości** (wzór `(i*137)%900`, zero wspólnego zegara); screenshots/F2/F2-03-brama.png; ✓ tablica ogłoszeń ma 7 dekoracji, każda z innym wariantem: blink `UWAGA! EGZAMIN TRWA`, obrot pieczątka `WZÓR`, tancz zebra ASCII w `<pre>`, majtanie `pod nadzorem od 1998`, skok odznaka `NAJLEPIEJ OGLĄDAĆ W 800x600`, blink `KOMISJA CZUWA`, majtanie `AKTA W OBIEGU`; ✓ `WOLĘ NIE`: 3 hovery przestawiają `data-ucieczki` 1->2->3 i za każdym razem zmieniają pozycję, po trzeciej ucieczce napis to `DOBRA, I TAK MUSISZ`, czwarty hover nic nie zmienia; w kontekście `hasTouch` kapituluje OD RAZU; fokus klawiaturą NIE płoszy (a11y); ✓ ceremonia wejścia: od kliknięcia CTA do `/egzamin` **<= 2000 ms** (pieczątka `PRZYJĘTO` -> szuflada akt `steps(6)` -> przejście), fokus ląduje na `h1[tabindex="-1"]` etapu (`toBeFocused`, Z9); ✓ Esc w trakcie -> `/egzamin` w < 600 ms, fokus też na `h1`; ✓ reduced-motion: wszystkie `.gif-less` mają `animationName: none` (0 ruchomych), a przejście to pojedynczy `jwp-fade` 0,3 s zamiast szuflady; ✓ negatywne: CTA i uciekinier NIE leżą w jednym rzędzie (pasy pionowe pudełek się nie przecinają), `h1` nie jest wyśrodkowany - zero hero z dwoma przyciskami obok siebie (01→D1); ✓ `pnpm run check` exit 0, `pnpm build` zielony (brama 2,48 kB, first load 104 kB).
  UWAGA: trzy błędy złapane przez testy/screenshot, nie przez lekturę kodu: (1) uciekinier w pierwszej wersji stał w pasie CTA i łamał anty-spec D1 - zszedł pod druk; (2) `reduced-motion` szło od razu do przejścia, bez żadnego fade - `chceRedukcjiRuchu()` włącza teraz zasłonę natychmiast, więc jest jeden krok 300 ms zamiast zera; (3) `dispatchEvent("mouseenter")` nie rusza Reacta (delegacja przez mouseover) - test używa `hover()`.
  Z8: `Pieczatka` dostała prop `dekoracyjna` - pieczęć `WZÓR` na tablicy tylko wisi i obraca się jako dekoracja, więc nie może być jednocześnie ceremonią (zero klasy `ceremonia`, zero wbicia).
- [x] **F2-04** `deploy` Pierwszy deploy preview Vercel + stan `lib/stan.ts` (sessionStorage jwp.v1, debounce 400 ms).
  CZYTAJ: 02→G (kontrakt stanu); 02→E; 01→B (Z11).
  AC: URL preview działa i pokazuje bramę (wklejony w BACKLOG przy odhaczeniu); Playwright: na stubie `/egzamin` tymczasowy `<input>` podpięty do `lib/stan.ts` - wpis tekstu, `page.reload()`, wartość wraca; `sessionStorage` ma klucz `jwp.v1`; negatywne: `localStorage` pusty poza `jwp.audio`.
  DOWÓD: URL <https://j-word-pass-ehluwxh43-enkidu-pngs-projects.vercel.app> - ✓ `vercel curl` zwraca HTML bramy (`<title>J-WORD PASS`, 2x `gif-less`, przycisk `WOLĘ NIE`, 17 162 B); anonimowy `curl` dostaje 302 na `vercel.com/sso-api`, bo projekt ma włączoną Deployment Protection (znalezisko F7-04). Stan: ✓ `npx playwright test tests/f2-04.spec.ts` = 4 passed (desktop+mobile) - wpis do `[data-pole-robocze]`, `page.reload()`, wartość wraca; `sessionStorage["jwp.v1"].v === 1`; `Object.keys(localStorage)` bez `jwp.audio` = `[]`.
  UWAGA: Vercel PRZYPISAŁ ten deploy do PRODUKCJI mimo `vercel deploy` BEZ `--prod` (pierwszy deploy projektu, aliasy `j-word-pass.vercel.app`). Opisane w DECISIONS #7 - dotyczy bramki F8-01.

## F3 - EGZAMIN + AI (najważniejsza powierzchnia)

- [x] **F3-01** `ai` Route `/api/ocena`: OpenRouter gemini-2.5-flash-lite + fallback mistral + clamp 6-10 + sanitizeDash + limity.
  CZYTAJ: 08 (cały); 01→B (Z1,Z2,Z12).
  AC: wszystkie punkty z 08→D (obecnie 7; pkt 7 = tylko produkcja, weryfikacja w F8-01) - curl-e wklejone do commita; negatywne: string OPENROUTER nie występuje w żadnym pliku klienckim.
  DOWÓD (`pnpm dev` + curl, potem utrwalone w `tests/f3-01.spec.ts` = ✓ 4 passed):
  ✓ D1 `curl -X POST localhost:3000/api/ocena -d '{"odpowiedz":"zebry wygrają bo pęd","zalaczoneDowody":2}'` -> HTTP 200, `punkty:6`, komentarz po polsku („(...) argumentacja oparta na 'pędzie' nie spełnia minimalnych kryteriów oceny kreatywności zgodnie z paragrafem 3.b protokołu."); drugi strzał: `punkty:7`, sprawdzone programowo - brak `—`, `–`, `·`, brak emoji, są diakrytyki.
  ✓ D2 payload 9000 znaków -> HTTP 413 `{"blad":"Wniosek przekracza dopuszczalną objętość akt."}`.
  ✓ D3 `odpowiedz:""` -> HTTP 200 `{"punkty":0,"komentarz":"PUSTKA."}` (bez wywołania modelu).
  ✓ D4 dev z `OPENROUTER_API_KEY=` (klucz odpięty) -> HTTP 502 `{"blad":"Komisja nieosiągalna."}` w 0,43 s.
  ✓ D5 `grep -r "sk-or-"` (bez node_modules/.git/.next/.env.local) = 7 trafień, wszystkie to TREŚĆ AC w `plan/` i `DECISIONS.md`, zero kluczy (zgodnie z DECISIONS z F0-05).
  ✓ D6 `grep -rln OPENROUTER app lib components scripts` = tylko `app/api/ocena/route.ts`; import z `route.ts` w kliencie = 0 trafień.
  ⏳ D7 rate limit - kod aktywny wyłącznie przy `NODE_ENV === "production"`, weryfikacja w F8-01 (tak przewiduje spec).
  UWAGA: plik route Next.js NIE MOŻE eksportować nic poza handlerami - `export function sanitizeDash` przechodzi `tsc --noEmit`, ale wywala `pnpm build` („does not match the required types of a Next.js Route"). Funkcja jest modułowo prywatna.
- [x] **F3-02** `ui` ⚠ HARD Scena egzaminu: kosmos, słoń ze strzałem hoverowym + licznik naboi, 12 zeber (1 oficerska reverse), arkusz formularz-F7 z textarea.
  CZYTAJ: 05→A1,A2; 03→B (warianty); 02→F (kopiowanie).
  AC: screenshot desktop + mobile 390px (kolumna, 5 zeber); hover słonia odpala strzał + odrzut + licznik -1 (Playwright: licznik po 3 hoverach = 4997); hover zebry robi beczkę raz; negatywne: treść założeń NIE występuje jako blok `<p>` (anty-spec 05→D1).
  ✓ D1 screenshoty: `screenshots/F3/F3-02-egzamin-desktop.png` (1280x800, dwie kolumny) i `F3-02-egzamin-mobile.png` (390x844) - obejrzane, nie tylko wygenerowane.
  ✓ D2 mobile: `.egzamin__plansza` ma JEDNĄ kolumnę (`gridTemplateColumns` = 1 wartość), `.scena__zebra:visible` = **5**, dolna krawędź sceny <= górna krawędź arkusza (scena NAD arkuszem). Test `tests/f3-02.spec.ts` „mobile 390px".
  ✓ D3 słoń: `[data-scena] [data-licznik]` startuje na `5000`, po 3 hoverach = **4997** (asercja po każdym hoverze: 4999/4998/4997). Odrzut `jwp-odrzut` `steps(5)` `iteration-count: 1`, 3 elementy `.slon__pocisk`.
  ✓ D4 stado: `.scena__zebra` = **12**, dokładnie JEDNA z `animation-direction: reverse` (oficerska, `OFICERKA=4`), >= 10 różnych `animation-delay` (desynchronizacja z 03→B). Hover zebry: `jwp-beczka`, 500 ms, `steps(4)`, `iteration-count: 1`, po zakończeniu klasa znika (jednorazowo, nie pętla).
  ✓ D5 arkusz: nagłówek = `egzamin.tytul` z JSON, textarea z placeholderem ze spec, `data-znaki` śledzi długość (`ZNAKÓW: 3`), stempel mruga dopiero od 200 znaków, DOKŁADNIE JEDEN przycisk (`ODDAJĘ WYWÓD POD OSĄD KOMISJI`), 6 pustych slotów dowodowych.
  ✓ D6 negatywne (anty-spec 05→D1): żaden z 6 tekstów `zalozenia` z `data/egzamin.json` nie występuje w żadnym `<p>` na stronie.
  ✓ D7 `pnpm run check` zielony, `pnpm build` zielony (`/egzamin` 2,94 kB, first load 105 kB), pełna suite `npx playwright test` = **72 passed + 10 skipped + 0 failed**.
  UWAGA 1 (pułapka do zapamiętania): hover słonia sypał SERIĄ strzałów (licznik leciał w dół o ~30 na sekundę). Przyczyna: salwa remontuje poddrzewo (`key={salwa}`), a majtanie i pociski podmieniają element pod kursorem - przeglądarka wysyła kolejny `mouseover`/`mouseenter` i strzał wyzwala sam siebie. Fix: `.scena__slon * { pointer-events: none }` (celem hoveru jest wyłącznie stabilny kontener) + `z-index: 1`, żeby przeskakująca zebra nie zasłaniała słonia. To samo zabezpieczenie na `.zebra`.
  UWAGA 2 (kopiowanie, 02→F.4): nic nie vendorowano. Sprawdzone (a) gotowe keyframes - beczka/odrzut to 4 linie `@keyframes`, wklejka nic nie skraca; (b) 98.css/NES.css nie mają ani słonia, ani zebry; clip-arty CC0 to wielopathowe rysunki, które i tak trzeba by przemapować na płaskie wypełnienia i obrys 3px z tokenów. SVG narysowane ręcznie. F7-02 nadal otwarte i nadal blokuje pierwszy vendoring.
  UWAGA 3: `app/egzamin/PoleRobocze.tsx` (rusztowanie F2-04) skasowane, zastąpione arkuszem `app/egzamin/Arkusz.tsx`. Atrybut `data-pole-robocze` przeniesiony na `<textarea>`, więc `tests/f2-04.spec.ts` (przeżycie reloadu) działa bez zmian.
- [x] **F3-03** `ui` Karty dowodowe: przeciąganie na POINTER EVENTS (nie HTML5 DnD - testowalne przez Playwright dragTo; decyzja z krytyki planu) + fallback klawiatura + tap-tap mobile + pieczątka ZAŁ.
  CZYTAJ: 05→A3, 05→C (wiersze drag/klawiatura/mobile).
  AC: przeciągnięcie karty w slot przybija ZAŁ. (Playwright `dragTo`); pełna ścieżka klawiaturą Enter/strzałki/Enter działa (test); upuszczenie poza slotem wraca skokiem; licznik załączonych trafia do payloadu ocena (assert w request).
  ✓ D1 `dragTo` karty na `[data-slot='0']`: slot dostaje `data-zajety="tak"`, karta `data-zalaczona="tak"`, w slocie SVG pieczątki z `aria-label="ZAŁ."`. Test `tests/f3-03.spec.ts` „drag: karta w slocie dostaje pieczatke ZAL." (desktop).
  ✓ D2 `dragTo` na `h1` (poza slotem): karta wraca, slot pusty, powrót skokowy `jwp-powrot` `steps(3)` `iteration-count: 1`, 240 ms.
  ✓ D3 klawiatura, pełna ścieżka: fokus na karcie -> Enter (`aria-pressed="true"`, slot 0 dostaje klasę `--cel`) -> ArrowRight x2 (cel przeskakuje na slot 2) -> Enter (karta w slocie 2 z pieczątką ZAŁ., slot 0 nadal pusty).
  ✓ D4 tap-tap (ścieżka dotykowa, przechodzi na OBU projektach): klik w kartę -> `aria-pressed="true"`, klik w slot -> karta w slocie.
  ✓ D5 payload: po załączeniu 2 dowodów i wpisaniu odpowiedzi klik CTA wysyła `POST /api/ocena` z `{"odpowiedz":"zebry wygrają, bo pęd","zalaczoneDowody":2}` (assert na `postDataJSON()` przechwyconego requestu).
  ✓ D6 Z11: dowody przeżywają reload (`zalaczone` w `sessionStorage`, debounce 400 ms) - test „stan dowodow przezywa przeladowanie".
  ✓ D7 anty-spec 05→D1 nadal trzyma po dodaniu kart: 6 elementów `[data-karta]`, żaden tekst założenia nie występuje w `<p>`. Screenshoty `screenshots/F3/F3-03-karty-desktop.png` i `-mobile.png` (dwa dowody przybite).
  ✓ D8 `pnpm run check` zielony, `pnpm build` zielony (`/egzamin` 4,91 kB, first load 107 kB), pełna suite = **84 passed + 12 skipped + 0 failed**, powtórzona 2x.
  UWAGA 1: `pointerdown` NIE podnosi karty - podniesienie zapala się dopiero na pierwszym `pointermove`. Inaczej ścieżka tap-tap ginie: `pointerdown` ustawiał `podniesiona`, a następujący po nim `click` od razu ją zdejmował (karta „migała" i nic się nie działo).
  UWAGA 2: karty leżą rozrzucone po scenie i część zeber zasłaniają, więc test beczki z F3-02 musiał przestać zakładać, że zebra nr 0 jest na wierzchu - bierze pierwszą, którą `elementFromPoint` faktycznie zwraca w jej środku. Kod bez zmian, to była za wąska asercja.
  UWAGA 3: pieczątka bazowa ma sztywne `width: 120px`, więc na fiszce dostaje override na 46 px plus powiększony tekst po łuku - przy samym zmniejszeniu szerokości napis `ZAŁ.` był nieczytelny (oględziny wycinka screenshotu, nie asercja).
  UWAGA 4: zrzuty pieczątek WYMAGAJĄ odczekania po kliknięciu. `jwp-wbicie` trwa 350 ms i w połowie stempel jest wielki i półprzezroczysty - pierwszy screenshot złapał właśnie tę klatkę i wyglądał jak błąd renderowania.
  UWAGA 5 (mobile): rolka kart siedzi na dole sceny i zasłaniała słonia. Scena na < 768 px urosła do 440 px, a słoń wszedł nad rolkę (`bottom: 132px`).
- [x] **F3-04** `ui` Ceremonia narada-komisji + werdykt + pusta odpowiedź 0/10 + fallback awaryjny + przejście do quizu.
  CZYTAJ: 05→B; 03→E; dane komisja.json.
  AC: pusta odpowiedź: 0/10 bez requestu do API (assert network); niepusta: min 3,5 s teatru, dymki losują się, gwiazdki wypełniają do N, pieczątka N/10, komentarz AI na druku; Esc skip do werdyktu; wyłączony klucz (env unset w dev) -> werdykt awaryjny ≤ 16 s; po powrocie na /egzamin: readonly + werdykt z sessionStorage; screenshot werdyktu.
  ✓ D1 pusta odpowiedź: licznik requestów na `/api/ocena` = **0**, `data-werdykt="0"`, pieczątka `0/10 - PUSTKA` z podpisem `PUSTKA INTELEKTUALNA - 0 PKT`. Test `tests/f3-04.spec.ts`.
  ✓ D2 niepusta: od kliknięcia CTA do werdyktu **>= 3500 ms** (pomiar `Date.now()`), dymki w trakcie teatru mają teksty z `data/komisja.json` -> `ocenianie` i w oknie 3 s pojawiają się >= 2 różne (losowanie nigdy nie powtarza poprzedniej kwestii).
  ✓ D3 werdykt: `data-gwiazdki="8"`, dokładnie 8 gwiazdek `data-pelna="tak"`, `LicznikMechaniczny` na 08, pieczątka `8/10 - ZDANO` (ton `jad`), komentarz AI w `[data-komentarz]` na druku `formularz-F7` z podpisami trzech głów. Fokus po ceremonii ląduje na `[data-do-quizu]` (Z9).
  ✓ D4 Esc: werdykt na ekranie w **< 2000 ms** od naciśnięcia, bez czekania na pełne 3,5 s.
  ✓ D5 padnięta Komisja (`/api/ocena` -> 502): werdykt awaryjny w **< 16 s**, punkty = `6 + (dlugosc % 5)` (zweryfikowane liczbowo), komentarz z puli `werdyktAwaryjny`, na ekranie migający `PROTOKÓŁ AWARYJNY`. Uwaga: symulacja przez `page.route`, bo hook uprawnień nie pozwala ruszać `.env.local`; wariant „klucz odpięty" dał ten sam 502 w F3-01 D4.
  ✓ D6 powrót na `/egzamin` po ocenie: werdykt i komentarz odtworzone z `sessionStorage`, `textarea.readOnly === true`, ZERO przycisków w arkuszu (drugiego submitu nie ma).
  ✓ D7 `[data-do-quizu]` prowadzi na `/quiz` (roleta `steps(8)` 900 ms + `router.push`), a `StrazEtapu` już nie blokuje (`[data-straz]` = 0 elementów).
  ✓ D8 screenshoty werdyktu: `screenshots/F3/F3-04-werdykt-desktop.png` i `-mobile.png`. Pełna suite = **96 passed + 12 skipped + 0 failed**, `pnpm run check` i `pnpm build` zielone.
  UWAGA 1 (naprawa wspólnego komponentu): tekst po łuku w `components/Pieczatka.tsx` szedł DO GÓRY NOGAMI (łuk biegł w odwrotną stronę) i dłuższy napis owijał się poza koniec ścieżki. Poprawione: łuk `M 14,44 A 65,65 0 0 0 86,44` plus `textLength="70" lengthAdjust="spacingAndGlyphs"`, więc dowolnie długi napis mieści się w kole i czyta się normalnie. Widoczne WYŁĄCZNIE na screenshocie - `tests/f1-02.spec.ts` sprawdzał tylko treść i `aria-label` i był zielony przez cały czas.
  UWAGA 2: gwiazdki werdyktu miały wypełnienie `--chrom-b` na papierze `--papier` - praktycznie niewidoczne. Zmienione na `--urzad`. Ta sama klasa błędu co pieczątka: asercja `data-pelna="tak"` przechodziła, obrazek nie.
  UWAGA 3 (naprawiony błąd hydracji): tekst wpisany do arkusza PRZED hydracją ginął, bo `useEffect` nadpisywał stan zapisem z `sessionStorage`. Teraz wartość z DOM ma pierwszeństwo, a CTA jest `disabled` do czasu hydracji (bez tego submit szedł natywnym GET-em i wypychał odpowiedź do adresu). Znalezione, bo test padał tylko w pełnym równoległym przebiegu.
  UWAGA 4 (świadome uproszczenie): krok 1 z 05→B (arkusz składa się w samolocik na `clip-path`) NIE jest zaimplementowany - arkusz po prostu schodzi z ekranu. Czysta dekoracja bez AC, oznaczona `ponytail:` w `app/egzamin/Plansza.tsx`.
  UWAGA 5: `PUSTKA INTELEKTUALNA - 0 PKT` (28 znaków) na łuku pieczątki byłoby nieczytelne nawet po naprawie, więc pieczęć nosi `0/10 - PUSTKA`, a pełne zdanie stoi pod nią jako podpis pieczęci (Z14 spełnione - komunikat siedzi w motywie pieczątki).

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

- [ ] **F7-01** `perf` Long task ~116 ms przy starcie `/dev/animacje` (hydracja), zmierzony w F1-01. NIE łamie AC F1-01 (AC mierzy 5 s IDLE, a zadanie pada na `startTime` ~222 ms, czyli przed ustabilizowaniem strony; w oknie idle jest 0 wpisów > 50 ms) i pochodzi z serwera DEV, gdzie kod jest nieminifikowany i kompilowany na żądanie.
  ZNALEZIONE W: F1-01 (pomiar `PerformanceObserver({type:"longtask", buffered:true})`).
  AC: powtórzyć pomiar na buildzie PRODUKCYJNYM (`pnpm build && pnpm start`) dla 4 stron kandydata (`/`, `/egzamin`, `/quiz`, `/proba-ognia`) - liczone WSZYSTKIE long taski, także startowe; jeśli którykolwiek > 50 ms, zdiagnozować i naprawić, jeśli nie - zamknąć wpisem "odrzucone: koszt wyłącznie dev-serwera" z wklejonymi liczbami. Uwaga: `/dev/animacje` w produkcji nie istnieje (F1-03), więc mierzy się strony kandydata.
  DYSPOZYCJA: przeniesione do F6-02 (budżety perf na preview) - tam jest właściwe środowisko pomiaru; wpis zostaje otwarty do czasu wykonania F6-02.

- [ ] **F7-02** `infra` `scripts/lint-tokens.mjs` skanuje także KOMENTARZE CSS, więc literał koloru w komentarzu wywala `pnpm run check`.
  ZNALEZIONE W: F2-01 (komentarz przy kursorze-komisji tłumaczył, które tokeny odpowiadają wartościom w `data:` URI, i został odrzucony jako naruszenie Z3).
  DLACZEGO TO PROBLEM: (a) Z3(c) każe wskazać token „w komentarzu obok" wartości z `data:` URI; (b) DoD każdej fazy dopuszcza literały kolorów w vendor „tylko w komentarzu licencyjnym" - a taki komentarz dziś nie przejdzie walidatora. Pierwsza wklejka do `app/vendor/` z nagłówkiem `/* src: URL (licencja) */` zawierającym hex zablokuje build.
  OBEJŚCIE ZASTOSOWANE W F2-01: komentarz nazywa tokeny (`--urzad`, `--atrament`) zamiast powtarzać hex. Działa, ale nie skaluje się na vendor.
  AC: walidator pomija treść komentarzy CSS (`/* ... */`) przy szukaniu literałów kolorów i rozmiarów czcionki, zachowując wykrywanie w kodzie; test negatywny: `color:#fff` w KODZIE nadal wywala check (exit 1), a ten sam literał w komentarzu przechodzi (exit 0); test na `app/vendor/x.css` z nagłówkiem licencyjnym zawierającym hex -> exit 0.

- [x] **F7-03** `test` `tests/f1-02.spec.ts` (licznik mechaniczny) pada na strict-mode violation: `[data-licznik]` znajduje 2 elementy na `/dev/animacje`.
  ZNALEZIONE W: F2-04 (pełny przebieg `npx playwright test` = 2 failed / 58 passed / 4 skipped).
  PRZYCZYNA: F2-01 dołożył `WebringStopki` do layoutu ROOT, a stopka renderuje własny `LicznikMechaniczny` (licznik odwiedzin, `data-licznik="1545013"`). Test z F1-02 zakłada, że na stronie jest tylko jeden licznik. Regresja testu, nie kodu - komponent działa poprawnie w obu miejscach.
  AC: `npx playwright test tests/f1-02.spec.ts` zielony na obu projektach bez rozluźniania asercji - locator zawężony do demo playgroundu (`[data-licznik-demo] [data-licznik]`); pełny przebieg `npx playwright test` = 0 failed.
  ✓ D1 `npx playwright test tests/f1-02.spec.ts` = **12 passed** (desktop + mobile). Zmiana wyłącznie w teście: `const demo = page.locator("[data-licznik-demo]")` i wszystkie trzy locatory (`[data-licznik]`, `.licznik-mechaniczny__tasma` x2) zawężone do `demo`. Asercje bez zmian (nadal 4 taśmy, `steps(10)`, pozycje 0/0/-40%/-20%).
  ✓ D2 pełny `npx playwright test` = **64 passed + 8 skipped + 0 failed**, powtórzone 3x pod rząd. Wymagało też naprawy F7-06 (patrz niżej).
  ✓ D3 `pnpm run check` zielony (`lint-tokens: czysto` + `tsc --noEmit` bez błędów).

- [x] **F7-06** `test` `tests/f2-03.spec.ts` („WOLĘ NIE ucieka dokładnie 3 razy") pada w PEŁNYM przebiegu suite, a przechodzi uruchomiony pojedynczo - `data-ucieczki` zatrzymuje się na `2` zamiast `3`.
  ZNALEZIONE W: F7-03 (weryfikacja AC „pełny przebieg = 0 failed"; poprzedni worker zapisał to w NEXT-TASKS jako „flake timingowy", pomiar pokazał że to nie flake - w pełnym przebiegu pada powtarzalnie).
  PRZYCZYNA: uciekinier po hoverze przeskakuje na nową pozycję. Gdy nowa pozycja trafi POD aktualny wskaźnik myszy, kolejny `locator.hover()` nie rusza kursora, więc przeglądarka nie wysyła nowego `mouseenter` i licznik nie rośnie. Losowość pozycji sprawia, że przy innym przeplocie (pełna suite, 4 workery) trafienie zdarza się częściej. Kod komponentu jest poprawny - `mouseenter` z definicji nie powtarza się bez opuszczenia elementu.
  AC: `npx playwright test` = 0 failed w trzech przebiegach pod rząd, bez rozluźniania asercji (nadal wymagane dokładnie 3 ucieczki i kapitulacja).
  ✓ D1 fix: `await page.mouse.move(0, 0)` przed każdym `hover({force:true})` w pętli i przed hoverem czwartym - kursor opuszcza przycisk, więc każdy hover jest prawdziwym wejściem. Asercje nietknięte.
  ✓ D2 `npx playwright test` uruchomione 3x pod rząd: **64 passed + 8 skipped + 0 failed** za każdym razem.

- [ ] **F7-04** `deploy` Projekt ma włączoną Deployment Protection (Vercel Authentication) - anonimowy `curl` na URL deployu dostaje 302 na `vercel.com/sso-api`.
  ZNALEZIONE W: F2-04 (weryfikacja AC „URL preview działa"; obejście: `vercel curl <url>`, które dokłada token).
  DLACZEGO TO PROBLEM: kandydat wchodzący z linku zobaczy ekran logowania Vercela, a nie bramę. Dopóki gra ma być publiczna, ochrona musi zniknąć albo dostać bypass.
  AC: decyzja użytkownika na bramce F8-01 - albo `vercel project` / dashboard wyłącza Vercel Authentication dla produkcji, albo zostaje świadomie (gra prywatna). Weryfikacja: `curl -sI <url produkcyjny>` zwraca 200, nie 302.

- [ ] **F7-05** `ui` Na 390 px widżet RadioKomisji (lewy dolny róg) NAKŁADA SIĘ na treść `WebringStopki` - zasłania wiersz „ostatnia aktualizacja / projekt" i etykietę licznika odwiedzin.
  ZNALEZIONE W: F2-04 (oględziny screenshotu DoD `screenshots/F2/F2-DoD-egzamin-mobile.png`; testy tego nie łapią, bo asercje sprawdzają istnienie elementów, nie kolizję prostokątów).
  AC: na 390x844 prostokąt widżetu radia nie przecina żadnego prostokąta tekstu stopki (Playwright: `getBoundingClientRect()` obu, assert brak przecięcia) - np. przez dolny padding stopki równy wysokości widżetu; screenshot mobile w `screenshots/F7/`; desktop 1280x800 bez zmian wizualnych.
  ROZSZERZENIE (F3-04): widżet nie zasłania już tylko stopki. Na `screenshots/F3/F3-04-werdykt-mobile.png` przykrywa PRZYCISK `PRZYJMUJĘ WERDYKT, ŻĄDAM QUIZU`, a na `F3-04-werdykt-desktop.png` wchodzi na scenę egzaminu. To samo zjawisko, ale trafia już w element interaktywny, więc AC obejmuje też: na obu viewportach prostokąt widżetu nie przecina prostokąta ŻADNEGO elementu klikalnego (`button`, `a`, `[role="button"]`).

## F8 - BRAMKA DECYZYJNA: PRODUKCJA

- [ ] **F8-01** `deploy` ⏳ STOP-GATE przed wykonaniem: pokaż userowi URL preview + WERYFIKACJA.md, zapytaj o zgodę na `vercel --prod` (i ewentualną domenę).
  AC: produkcyjny URL działa, `/api/ocena` na produkcji odpowiada (1 test-curl, koszt ~$0.0001); rate limit: 6 szybkich żądań, szóste dostaje 429 (08→B pkt 7); formularz zapisuje do Blob na produkcji (1 wpis testowy, potem usunięty).

---

## GITHUB-IMPORT
Issues NIE importujemy do GitHub na starcie (checkboxy tego pliku = źródło prawdy;
sztafeta workerów czyta plik, nie API). Po zakończeniu buildu ewentualne otwarte
pozycje F7 przenieść: `gh issue create -R Enkidu-png/j-word-pass -t "<tytuł>" -b "<AC>"`
-l odpowiednim labelem; link zwrotny wpisać przy issue w tym pliku.
