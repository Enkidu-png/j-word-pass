# NEXT-TASKS - stan sztafety

## Następne issue
**F4-01** `ui` ⚠ **HARD** - Segregator quizu: stos 15 teczek, zakładki, nawigacja
klik/strzałki, wybór wariantów, pytanie 14 otwarte, stemple WYPEŁNIONO, zapis stanu.
BACKLOG: `⚠ HARD` = na początku paczki, ŚWIEŻE OKNO. `CZYTAJ: 06→A,E; 02→C2; 02→F`.

UWAGA przed startem F4: orkiestrator ma po fazie F3 zrobić `/code-review`. Jeśli
review zostawi poprawki, idą PRZED F4-01.

Uwaga do F4-01: `data/quiz.json` i `plan/11-QUIZ-TRESC.md` są jeszcze nieczytane
przez żadnego workera. Pytanie 14 jest otwarte (normalizacja `mohsa`/`Mohsa`/
`skala Mohsa`), reszta wariantowa. Anty-spec: zero emoji w DOM (grep po zakresach
emoji na wyrenderowanym HTML) i zero natychmiastowego feedbacku poprawności.

## Zrobione w tej zmianie
F7-03, F7-06 (nowe), F3-02, F3-03, F3-04, F7-07 (nowe), DoD fazy F3. Każde
odhaczone w `plan/10-BACKLOG.md` z dowodami, jeden commit per issue
(`8b650ed`, `f35eea2`, `1e93fa5`, `1abdb5e`, `5b6bd25`).

## Blokady wymagające użytkownika
1. **Bramka F8 przekroczona przez PLATFORMĘ, nie decyzję** - pierwszy `vercel deploy`
   bez `--prod` wylądował na produkcji (DECISIONS #7). Aliasy: `j-word-pass.vercel.app`.
   W tej paczce NIC nie deployowano (zakaz w promptcie).
2. **Deployment Protection (Vercel Authentication) WŁĄCZONA** - anonimowy `curl` dostaje
   302 na `vercel.com/sso-api`. Do weryfikacji URL-i `vercel curl <url>`. Decyzja na F8-01
   (znalezisko F7-04).
3. Hook uprawnień odrzuca komendy dotykające `.env.local`. NIE blokuje pracy: `pnpm dev`
   sam ładuje ten plik. Skutek dla testów: scenariusz „klucz odpięty" symuluje się przez
   `page.route(... 502)`, nie przez zmianę env (tak zrobione w F3-04 D5).

## Pułapki środowiskowe
- **`reuseExistingServer: true`** - przed każdą serią testów:
  `for p in 3000 3001 3002; do lsof -ti tcp:$p | xargs -r kill -9; done`.
- **Fail TYLKO w pełnym równoległym przebiegu = zwykle wyścig z hydracją, nie flake.**
  Zmierzone w F3-04: `fill()` na polu przed hydracją wpisuje tekst do DOM, ale React
  go nie widzi, a `useEffect` czytający `sessionStorage` go NADPISUJE. Objaw: werdykt
  „PUSTKA" mimo wypełnionego pola. Lekcja ogólna: każdy `useEffect`, który przy montażu
  ustawia stan pola z zapisu, musi najpierw sprawdzić, co jest w DOM.
- **Formularz bez ochrony robi natywny GET-submit przed hydracją** i wypycha treść do
  adresu. Wzorzec zastosowany w `app/egzamin/Arkusz.tsx`: `disabled` na CTA do czasu
  `useEffect`. Playwright sam czeka na aktywny przycisk, więc to też stabilizuje testy.
- **Hover na elemencie, który się rusza albo jest remontowany, wyzwala mouseenter SERIAMI.**
  W F3-02 słoń strzelał ~30 razy na sekundę. Lekarstwo: `pointer-events: none` na CAŁEJ
  zawartości elementu (celem hoveru zostaje stabilny kontener) plus `z-index`, żeby nic
  nie przelatywało nad nim. W teście: `page.mouse.move(0,0)` przed każdym `hover()`.
- **Elementy z `gif-less--blink` mają `visibility: hidden` przez pół cyklu** - `toBeVisible()`
  na nich jest losowe. Asertować `toHaveCount(1)`.
- **`steps(N)` na ceremonii + zrzut ekranu = klatka pośrednia.** Pieczątka w połowie
  `jwp-wbicie` jest wielka i półprzezroczysta. Przed screenshotem `waitForTimeout(400+)`.
- **Kierunek łuku SVG (`sweep-flag`) ustalać empirycznie na zrzucie, nie rozumowaniem** -
  w F7-07 dwie „oczywiste" wersje dały tekst do góry nogami.
- Zastane i nadal aktualne: TypeScript przypięty do `^5.9.3`, konfiguracja to
  `next.config.mjs`, Playwright MCP na kanale `chrome` nie działa (używać `npx playwright test`),
  `getComputedStyle` serializuje `steps(N, end)` jako `steps(N)`, React nie słucha surowego
  `dispatchEvent("mouseenter")`, `route.ts` nie może eksportować nic poza handlerami
  (łapie to dopiero `pnpm build`), `lint-tokens` skanuje komentarze CSS (F7-02 - naprawić
  PRZED pierwszym vendoringiem).
- `bash ~/.claude/agent-context.sh` w podagencie zwraca `NO-TRANSCRIPT` przez całą zmianę.
  Wg zasady: pracować dalej, nie wymyślać procentu.

## Stan środowiska
node v26.7.0, pnpm 11.12.0, next 15.5.24, react 19.2.8, typescript 5.9.3.
`pnpm run check` zielony. `pnpm build` zielony (`/egzamin` 8,13 kB, first load 110 kB).
`npx playwright test` = **96 passed + 12 skipped + 0 failed** (dwa przebiegi pod rząd).
Deploy: bez zmian od poprzedniej zmiany (nic nie wypychano).

## Nowe znaleziska tej zmiany
- **F7-06** `test` (ZAMKNIĘTE) - `f2-03` padał w pełnej suite, bo uciekinier przeskakiwał
  pod sam kursor i nie było kolejnego `mouseenter`.
- **F7-07** `ui` (ZAMKNIĘTE) - `Pieczatka` rysowała tekst po łuku do góry nogami, a dłuższy
  napis owijał się poza ścieżkę. Zastane z F1-02, wykryte oględzinami screenshotu.
- **F7-05** ROZSZERZONE - widżet RadioKomisji nie zasłania już tylko stopki: przykrywa
  przycisk `PRZYJMUJĘ WERDYKT, ŻĄDAM QUIZU` na mobile i wchodzi na scenę na desktopie.
  AC obejmuje teraz kolizję z każdym elementem klikalnym na obu viewportach.
- F7-01, F7-02, F7-04 nadal otwarte. Otwarte D1-D4 z `plan/README.md` nadal nietknięte.

## Świadome uproszczenia do ewentualnego dobrania w F6
- Krok 1 ceremonii z 05→B (arkusz składa się w samolocik na `clip-path`) nie istnieje -
  arkusz po prostu schodzi z ekranu. Oznaczone `ponytail:` w `app/egzamin/Plansza.tsx`.
- Próg werdyktu wysoki/niski = 9 punktów, dobrany z zakresu 6-10 (`data/egzamin.json`),
  bo `komisja.json` nie podaje liczby. Oznaczone `ponytail:` w `app/egzamin/Narada.tsx`.
