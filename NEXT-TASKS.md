# NEXT-TASKS - stan sztafety

## Następne issue
**F5-01** `ui` Scena ogniska + formularz OGN-3/TAJ (3 pola z kiczem: stopka-miarka,
suwmiarka ucha) + walidacja kliencka ze stemplami + klauzula śmierci + checkbox.
`CZYTAJ: 07→A,C; 02→F (kopiowanie); 01→B (Z13,Z14)`.
Potem po kolei: F5-02 (`/api/zgloszenie` + Vercel Blob), F5-03 (⚠ HARD, ceremonia
spalenia + list w butelce - na początek paczki, świeże okno).

`/proba-ognia` to dziś stub z samym `<h1>`. Wejście na niego jest już realną ścieżką:
quiz kończy się przejściem `podanie-do-ognia`, które robi `router.push("/proba-ognia")`.

## Zrobione w tej zmianie
F7-05 (widżet radia zasłaniał przyciski - naprawione u źródła), F4-01, F4-02a, F4-02b,
F4-02c, F4-03 + DoD całej fazy F4. Nowe znalezisko F7-08 znalezione I zamknięte.
Commity: `52b69b4`, `fb860d4`, `32472d0`, `d668479`, `ddc9617`, `a6b5742`.

## Blokady wymagające użytkownika
1. **Bramka F8 przekroczona przez PLATFORMĘ** - pierwszy `vercel deploy` bez `--prod`
   wylądował na produkcji (DECISIONS #7). W tej paczce NIC nie deployowano.
2. **Deployment Protection (Vercel Authentication) WŁĄCZONA** - anonimowy `curl` dostaje
   302 na `vercel.com/sso-api`. Decyzja na F8-01 (znalezisko F7-04).
3. Hook uprawnień odrzuca komendy dotykające `.env.local`. Nie blokuje pracy.
4. **F7-02 nadal otwarte i nadal blokuje pierwszy vendoring** (`scripts/lint-tokens.mjs`
   skanuje komentarze CSS, więc nagłówek licencyjny z hexem wywali `pnpm run check`).
   F4 nic nie vendorował, ale F5-01/F5-03 mogą chcieć (płomienie, pergamin).

## Pułapki środowiskowe
- **`pnpm build` PSUJE działający `pnpm dev`** - build nadpisuje `.next`, po czym serwer
  dev oddaje 500 (`ENOENT .next/server/pages/_document.js`) albo 404 na chunkach, a strona
  wygląda jak zahydrowana, tylko kliknięcia nic nie robią. Zmierzone dwa razy w tej zmianie
  (fałszywe "failed" w f4-02b/c). Kolejność: testy -> build -> restart dev.
- **Dodanie NOWEGO pliku komponentu przy działającym `pnpm dev`** daje ten sam objaw
  (404 chunku, brak hydracji). Lekarstwo to samo: ubić port, `rm -rf .next`, `pnpm dev`.
- **Pierwszy przebieg tuż po restarcie dev bywa wolny** (Next kompiluje route na żądanie) -
  test `f2-03 ceremonia wejscia <= 2 s` padł raz z tego powodu, dwa kolejne pełne przebiegi
  czyste. Przed serią pomiarów czasu zrób jedno "rozgrzewkowe" wejście na każdy route.
- **`page.addInitScript` odpala się TAKŻE przy `reload()`** - skrypt, który bezwarunkowo
  wpisuje `jwp.v1`, kasuje to, co test właśnie sprawdza. Wzorzec: `if (getItem) return;`.
- **`animation-play-state: paused` NIE pozwala nadpisać transformu z keyframes** - żeby
  reguła CSS przestawiła element (uśmiech nutek w signature 12), trzeba `animation-name: none`.
- **Pieczątka wbija się 350 ms** - zrzut zaraz po pojawieniu się łapie klatkę pośrednią
  (stempel wielki i przezroczysty). Przed screenshotem `waitForTimeout(400)`.
- **`--jad` i `--chrom-b` jako KOLOR TEKSTU na papierze są nieczytelne** - używać ich jako
  tła (tak zrobione w podpisie werdyktu maszyny).
- **Natywne radio schowane w `.tylko-dla-czytnika` nie da się kliknąć przez `check()`**
  (Playwright celuje w pudełko SVG). W testach klikać etykietę `[data-wariant-etykieta]`.
- Zastane i nadal aktualne: TypeScript przypięty do `^5.9.3`, konfiguracja to
  `next.config.mjs`, Playwright MCP na kanale `chrome` nie działa, `route.ts` nie może
  eksportować nic poza handlerami (łapie dopiero `pnpm build`), `reuseExistingServer: true`
  potrafi serwować starą stronę: `for p in 3000 3001 3002; do lsof -ti tcp:$p | xargs -r kill -9; done`.
- `bash ~/.claude/agent-context.sh` w podagencie zwraca `NO-TRANSCRIPT` przez całą zmianę.
  Wg zasady: pracować dalej, nie wymyślać procentu.
- Kółko z literą "N" w lewym dolnym rogu zrzutów to WSKAŹNIK DEV NEXT.JS, nie element
  aplikacji (kosztowało 15 minut śledztwa - w produkcji go nie ma).

## Stan środowiska
node v26.7.0, pnpm 11.12.0, next 15.5.24, react 19.2.8, typescript 5.9.3.
`pnpm run check` zielony. `pnpm build` zielony (`/quiz` 11,4 kB, first load 113 kB).
`npx playwright test` = **150 passed + 12 skipped + 0 failed** (dwa przebiegi pod rząd).
Deploy: bez zmian (nic nie wypychano, obowiązuje zakaz).

## Nowe znaleziska tej zmiany
- **F7-08** `silnik` (ZAMKNIĘTE) - `zapiszStan` z debounce 400 ms gubił werdykt etapu przy
  szybkim F5. Naprawione u źródła: `lib/stan.ts` ma `zapiszTeraz()`, użyte dla werdyktów
  quizu I egzaminu (ten sam błąd siedział w `app/egzamin/Plansza.tsx`).
- **F7-05** ZAMKNIĘTE - `RadioKomisji` przestał być `position: fixed` i wrócił do przepływu
  nad stopką (DECISIONS #8: świadome odstępstwo od plan/04 A pkt 4).
- **DECISIONS #9** - `steps(60)` i `steps(12)` z tabeli 06 D łamią Z7 (2-8 klatek), oba
  zjechały na `steps(8)`.
- F7-01, F7-02, F7-04 nadal otwarte. Otwarte D1-D4 z `plan/README.md` nadal nietknięte.

## Świadome uproszczenia do ewentualnego dobrania w F6
- Krok 1 ceremonii z 05→B (arkusz składa się w samolocik na `clip-path`) nie istnieje -
  arkusz po prostu schodzi z ekranu (`ponytail:` w `app/egzamin/Plansza.tsx`).
- Próg werdyktu wysoki/niski egzaminu = 9 punktów (`ponytail:` w `app/egzamin/Narada.tsx`).
- Krok 1 maszyny prawdy ("stos teczek zjeżdża do środka") jest uproszczony do podmiany
  panelu: zakładki zostają, teczka ustępuje miejsca maszynie. Reszta harmonogramu 06 B
  zaimplementowana co do milisekundy.
- Signature 9 (kość) nie ma pętli dekoracyjnej - rusza się wyłącznie po kliknięciu, bo Z8
  zabrania być naraz dekoracją i ceremonią.
