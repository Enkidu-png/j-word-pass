# NEXT-TASKS - stan sztafety

## Następne issue
**F8-01** `deploy` ⏳ **STOP-GATE - NIE WYKONYWAĆ BEZ ZGODY USERA.** Backlog nie ma już
żadnego innego otwartego `[ ]` poza `F7-04` (też decyzja usera). Fazy F0-F6 zamknięte
z DoD. Kolejny worker NIE ma co budować: ma poprowadzić bramkę F8 albo dostać nowy zakres.

Co należy do bramki F8 (plan/10 linia ~378):
1. Pokazać userowi URL preview + `WERYFIKACJA.md` i zapytać o zgodę na `vercel --prod`.
2. Dopiero po zgodzie: produkcyjny URL, test-curl `/api/ocena`, rate limit (6 żądań,
   szóste = 429), jeden wpis testowy do Bloba i jego usunięcie.
3. Przy okazji rozstrzygnąć **F7-04** (Deployment Protection): dziś anonimowy `curl`
   dostaje 302 na `vercel.com/sso-api`, więc publiczny link nie zadziała dla nikogo
   spoza zespołu Vercela.

`WERYFIKACJA.md` NIE ISTNIEJE w repo - jeśli bramka F8 ma go pokazać userowi, ktoś musi
go najpierw napisać (pakiet planistyczny zapowiada go jako listę checkboxów dla usera).

## Zrobione w tej zmianie
Cała faza **F5** (F5-01 ognisko + druk OGN-3/TAJ, F5-02 `/api/zgloszenie` + Vercel Blob,
F5-03 ceremonia spalenia + list w butelce + pergamin) z DoD, cała faza **F6** (F6-01
audyt a11y, F6-02 budżety perf, F6-03 404 + OG + favicon) z DoD, plus domknięte
znaleziska **F7-01** (pomiarem) i **F7-02** (naprawą, osobny commit).
Commity: `b61e6d2`, `bffe61b`, `3da5ff4`, `b33bc34`, `d6d3380`, `2e4e017`, `53a0fcb`,
`39375ed`, `cb72eab`.

## Blokady wymagające użytkownika
1. **Bramka F8** - deploy produkcyjny czeka na zgodę. W tej paczce NIC nie deployowano
   (obowiązywał twardy zakaz; wszystkie pomiary perf robione na lokalnym `next start`).
2. **F7-04 Deployment Protection WŁĄCZONA** - decyzja przy F8-01.
3. **DECISIONS #7** - pierwszy deploy wylądował na produkcji mimo braku `--prod`.
4. Hook uprawnień odrzuca komendy dotykające `.env.local`. Nie blokuje pracy.
5. **D1-D4 z `plan/README.md`** nadal nietknięte (D2 - font pikselowy - był dozwolony
   w F5/F6 i świadomie NIE został wzięty: żadna binarka nie weszła do repo).

## Pułapki środowiskowe
- **`pnpm build` PSUJE działający `pnpm dev`** (nadpisuje `.next`). Zmierzone znowu w tej
  zmianie: po buildzie `npx playwright test` wywala `Timed out waiting 120000ms from
  config.webServer`. Kolejność zawsze: testy -> build -> `kill` portu + `rm -rf .next` +
  `pnpm dev`.
- **Pierwszy pełny przebieg suite po restarcie dev bywa czerwony** (Next kompiluje trasy
  na żądanie, 4 workery walą naraz). W tej zmianie `f4-03` padł raz z tego powodu i
  przeszedł natychmiast po rozgrzaniu. Przed traktowaniem czerwieni jako regresji:
  uruchom sam ten plik jeszcze raz.
- **`steps(N)` (czyli `jump-end`) NIGDY nie dochodzi do ostatniej klatki keyframes.**
  Kosztowało to błysk ceremonii, który zostawał na 45 % krycia przez cały krok zamiast
  zgasnąć po 80 ms. Do animacji, która MA dojechać do wartości końcowej: `steps(N, jump-none)`.
- **`.pieczatka` ma własną szerokość 120 px, a jej opakowanie `.pieczatka-drgniecie` jest
  inline** - `width: 100%` na kontenerze nie zwęża pieczęci, a `width: 100%` na niej samej
  zeruje ją do niewidzialności. Trzeba `display: block` na opakowaniu. Asercja na
  `aria-label` przechodzi mimo zerowej szerokości - sprawdzaj `boundingBox()`.
- **`next/og` (satori) NIE parsuje skrótów typu `border: 24px double #...`** - odpowiedź
  leci 500 `failed to pipe response`. Podwójna ramka = dwa prostokąty `solid`. Satori nie
  zna też `var()`, dlatego `app/opengraph-image.tsx` jest wpisany w wyjątki Z3 walidatora.
- **Lighthouse CLI nie znajduje przeglądarki** - trzeba wskazać binarkę Playwrighta:
  `CHROME_PATH="$(node -e "console.log(require('@playwright/test').chromium.executablePath())")"`.
- **`vercel blob list` nie działa w tym repo** - CLI sam wstrzykuje `VERCEL_OIDC_TOKEN` i
  wymaga do pary `BLOB_STORE_ID`, którego ustawienie z powłoki nie pomaga. Listing Bloba
  robi się przez SDK z poziomu serwera dev (tymczasowy route + `list()`, plik kasowany
  po pomiarze). `vercel blob list-stores` działa i pokazuje `store_SXqnky9LZsRHchFX`.
- **Pole remontowane przez zmianę `key` traci fokus ustawiony w handlerze** - `focus()`
  musi iść z `useEffect` po renderze (naprawione w kwestionariuszu OGN-3/TAJ).
- Zastane i nadal aktualne: TypeScript `^5.9.3`, konfiguracja `next.config.mjs`, Playwright
  MCP na kanale `chrome` nie działa, `route.ts` nie może eksportować nic poza handlerami,
  `zapiszStan` ma debounce 400 ms (do werdyktów `zapiszTeraz()`), kółko z literą N w rogu
  zrzutów to WSKAŹNIK DEV NEXT.JS, nie element aplikacji.
- `bash ~/.claude/agent-context.sh` w podagencie zwracał `NO-TRANSCRIPT` przez całą zmianę.

## Stan środowiska
node v26.7.0, pnpm 11.12.0, next 15.5.24, react 19.2.8, typescript 5.9.3,
**@vercel/blob 2.8.0** (doszedł w F5-02, jest na allowliście Z6).
`pnpm run check` zielony (`samotest: czysto` + `lint-tokens: czysto` + tsc).
`pnpm build` zielony: `/` 104 kB, `/egzamin` 110 kB, `/proba-ognia` 108 kB, `/quiz` 113 kB.
`npx playwright test` = **217 passed + 17 skipped + 0 failed**.
Deploy: bez zmian, nic nie wypychano.

## Nowe decyzje tej zmiany
- **DECISIONS #10** - pętla dryfu butelki ma 1200 ms zamiast 2,4 s z tabeli 07 B; Z7
  (300-1400 ms dla dekoracji) wygrywa z tabelą, sześć pozycji zostaje.
- **Token `--alarm` zmieniony** z `#ff2079` na `#cc0060` (F6-01): stary miał 3,02:1 na
  papierze i tyle samo jako tło pod papierem. Zrzuty z faz F2-F4 pokazują jeszcze starą,
  jaśniejszą magentę - to nie regres, tylko starsze zrzuty.
- **Vendoring ODBLOKOWANY** (F7-02 naprawione). `app/vendor/` nadal puste - do dziś nic
  nie było warte wklejki, ale następny worker nie musi już nic obchodzić.

## Świadome uproszczenia
- Krok 1 ceremonii z 05→B (arkusz składa się w samolocik) - arkusz po prostu schodzi
  z ekranu (`ponytail:` w `app/egzamin/Plansza.tsx`).
- Próg werdyktu wysoki/niski egzaminu = 9 punktów (`ponytail:` w `app/egzamin/Narada.tsx`).
- Krok 1 maszyny prawdy uproszczony do podmiany panelu.
- Signature 9 (kość) nie ma pętli dekoracyjnej (Z8).
- `tests/f6-02.spec.ts` pomija się sam, gdy na porcie 3100 nie stoi build produkcyjny -
  pomiar long tasków wymaga ręcznego `pnpm build && npx next start -p 3100`.
