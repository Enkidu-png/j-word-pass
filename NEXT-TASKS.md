# NEXT-TASKS - stan sztafety

## Następne issue
**F2-04** `deploy` - **STOP ORKIESTRATORA**. Worker zatrzymał się PRZED nim zgodnie
z dyspozycją ("STOP TAKŻE przed F2-04").

**WAŻNE: powód tego STOP-u już nie obowiązuje.** Dyspozycja uzasadniała go słowami
„wymaga Vercel - zablokowane", ale użytkownik odblokował Vercela W TRAKCIE tej zmiany
(commit `87ddee0`, F0-05 odhaczone). Zmierzone teraz, nie założone:
`vercel whoami` = `enkidu-png`, `vercel env ls` pokazuje `OPENROUTER_API_KEY`
(Preview + Production, sensitive) i `BLOB_READ_WRITE_TOKEN` (wszystkie środowiska).
Worker mimo to NIE ruszył F2-04, bo STOP był poleceniem wprost, a issue kończy się
publicznym deployem - to decyzja dla użytkownika, nie dla workera.
**Do decyzji: zielone światło na F2-04 (łącznie z `vercel` deploy preview)?**

## Zrobione w tej zmianie
F1-01, F1-02, F1-03 (cała faza F1 + DoD), F2-01, F2-02, F2-03.
Każde odhaczone w `plan/10-BACKLOG.md` z dowodem, jeden commit per issue.

## Co zostało w F2
- **F2-04** - `lib/stan.ts` ma już stronę CZYTAJĄCĄ (`czytajStan`, `etapUkonczony`,
  typ `StanJWP` wg kontraktu plan/02 G) - dołożył ją F2-01, bo shell musi wiedzieć,
  które etapy są ukończone. Do dopisania: `zapiszStan(patch)` z debounce 400 ms,
  `wyczyscStan()`, tymczasowy `<input>` na stubie `/egzamin` do testu przeżycia
  reloadu, oraz deploy preview. Deploy = część zablokowana, reszta wykonalna od ręki.

## Blokady wymagające użytkownika
1. ~~`vercel whoami` = `Logged out`~~ - **ZDJĘTA przez użytkownika w trakcie zmiany**
   (commit `87ddee0`). F0-05 odhaczone, Blob store `jwp-zgloszenia` prywatny, oba
   klucze w env Vercela. Deployowa część F2-04 jest technicznie odblokowana.
2. Hook uprawnień nadal odrzuca komendy dotykające `.env.local`. Przestało to blokować
   env na Vercelu (użytkownik podał klucz przez stdin), ale worker wciąż nie może
   czytać tego pliku - istotne dla F3-01, jeśli route ma działać lokalnie w `pnpm dev`.

## Pułapki środowiskowe (zmierzone w tej zmianie, nie zgadnięte)
- **`reuseExistingServer: true` w `playwright.config.ts` to najdroższa pułapka tego
  repo.** Kolejny przebieg podpina się pod dev-serwer z poprzedniego issue i serwuje
  STARĄ stronę. Objaw mylący: wszystko interaktywne pada, `[data-odpraw]` = 0, mimo
  że kod jest poprawny (kosztowało jeden fałszywy przebieg "8 failed").
  Lekarstwo PRZED każdą serią: `for p in 3000 3001; do lsof -ti tcp:$p | xargs -r kill -9; done`
  i w razie wątpliwości `rm -rf .next`.
- `pkill -f "next start"` NIE ubija serwera produkcyjnego (proces nazywa się inaczej),
  a `pnpm dev` cicho przeskakuje na port 3001 i skrypty gadają z poprzednim serwerem.
  Zawsze ubijać po PORCIE, nie po nazwie.
- Skrypty diagnostyczne z `import { chromium } from "@playwright/test"` muszą leżeć
  W KATALOGU REPO (w `/tmp` nie rozwiąże się pakiet). Kasować po użyciu.
- `getComputedStyle` serializuje `steps(N, end)` jako `steps(N)` - asercje muszą
  dopuszczać obie formy. Podobnie `translateY(-0%)` wychodzi jako `translateY(0%)`.
- `PerformanceObserver({type:"longtask", buffered:true})` łapie też zadania SPRZED
  obserwacji (hydracja ~116 ms w dev). Przy mierzeniu "idle" filtrować po `startTime`.
- React nie słucha surowego `dispatchEvent("mouseenter")` (delegacja przez mouseover) -
  w testach używać `locator.hover()`.
- Walidator `lint-tokens` skanuje TAKŻE komentarze CSS - hex w komentarzu wywala check
  (opisane jako F7-02).
- Zastane i nadal aktualne: TypeScript przypięty do `^5.9.3` (TS 7 psuje Next 15.5),
  konfiguracja to `next.config.mjs`, Playwright MCP na kanale `chrome` nie działa -
  używać `npx playwright test`.
- `bash ~/.claude/agent-context.sh` w podagencie zwraca `NO-TRANSCRIPT` przez CAŁĄ
  zmianę. Wg zasady 9: pracować dalej, nie wymyślać procentu.

## Stan środowiska
node v26.7.0, pnpm 11.12.0, next 15.5.24, react 19.2.8, typescript 5.9.3.
`pnpm run check` zielony, `pnpm build` zielony (first load 102 kB, brama 104 kB),
`npx playwright test` = **53 passed + 4 skipped** (6 plików: smoke, f1-01, f1-02,
f2-01, f2-02, f2-03). `gh` zalogowany, `vercel` ZALOGOWANY (`enkidu-png`), projekt podpięty, env komplet.

## Nowe decyzje i znaleziska
- **DECISIONS #4** - marquee paska krawędzi dostaje `steps(24)`/3800 ms, czyli poza
  zakresem Z7 (N 2-8, 300-1400 ms). To konflikt plan/01 z plan/04 A2, który żąda tych
  wartości wprost; wygrywa dokument szczegółowy, odstępstwo ograniczone do jednej klasy.
- **F7-01** (`perf`) - long task ~116 ms przy starcie strony w DEV. Nie łamie AC F1-01
  (AC mierzy idle). Dyspozycja: powtórzyć pomiar na buildzie produkcyjnym w F6-02.
- **F7-02** (`infra`) - `lint-tokens.mjs` skanuje komentarze CSS. Zablokuje pierwszą
  wklejkę do `app/vendor/` z nagłówkiem licencyjnym zawierającym hex. Do naprawy przed
  pierwszym vendoringiem.
- **DECISIONS #5/#6** - dopisane przez użytkownika przy odblokowaniu F0-05 (Blob store
  prywatny, bo zgłoszenia zawierają e-maile). Nie ruszane przez workera.
- Otwarte D1-D4 z `plan/README.md` nadal nietknięte.
