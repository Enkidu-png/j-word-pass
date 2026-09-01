# NEXT-TASKS - stan sztafety

## Następne issue
**F3-02** `ui` ⚠ **HARD** - scena egzaminu (kosmos, słoń ze strzałem hoverowym +
licznik naboi, 12 zeber z jedną oficerską reverse, arkusz `formularz-F7` z textarea).
BACKLOG mówi wprost: `⚠ HARD` = „na początku paczki, ŚWIEŻE OKNO". Dlatego poprzedni
worker skończył zmianę tutaj, a nie na wyczerpaniu kontekstu - `agent-context.sh`
przez całą zmianę zwracał `NO-TRANSCRIPT`, więc procentu nie ma czym zmierzyć.

Uwaga do F3-02: tymczasowe `<input data-pole-robocze>` w `app/egzamin/PoleRobocze.tsx`
to rusztowanie z F2-04 (dowód na przeżycie reloadu). Arkusz `formularz-F7` ma je
ZASTĄPIĆ - textarea podpięta pod `zapiszStan({egzamin:{odpowiedz}})`. Wtedy trzeba
przenieść asercje z `tests/f2-04.spec.ts` na nowy selektor albo zostawić `data-pole-robocze`
na textarea.

## Zrobione w tej zmianie
F2-04 (z deployem), DoD fazy F2, F3-01. Każde odhaczone w `plan/10-BACKLOG.md`
z dowodem, jeden commit per issue (`1a833fe`, `ca43f89`).

## Blokady wymagające użytkownika
1. **Bramka F8 została przekroczona przez PLATFORMĘ, nie przez decyzję.** `vercel deploy`
   BEZ `--prod` wylądował na produkcji, bo to był pierwszy deploy projektu i Vercel
   przypisuje takie automatycznie (komunikat CLI cytowany w DECISIONS #7). Aliasy:
   `j-word-pass.vercel.app`. Kolejne deploye będą już preview. Nic nie cofano.
2. **Deployment Protection (Vercel Authentication) jest WŁĄCZONA** - anonimowy `curl`
   dostaje 302 na `vercel.com/sso-api`. Do weryfikacji URL-i używać `vercel curl <url>`.
   Decyzja „zostawiamy czy zdejmujemy" należy do usera na F8-01 (znalezisko F7-04).
3. Hook uprawnień nadal odrzuca komendy dotykające `.env.local`. NIE blokuje pracy:
   `pnpm dev` sam ładuje ten plik i `/api/ocena` działa lokalnie (zweryfikowane curl-em).

## Pułapki środowiskowe
- **`reuseExistingServer: true`** - stara pułapka repo, nadal aktualna. DODATKOWO
  zmierzone w tej zmianie: gdy dev-serwer wystartował się RĘCZNIE w tle, Playwright
  potrafi go zignorować, wejść na port 3001 i paść na `Timed out waiting 120000ms`.
  Przed każdą serią: `for p in 3000 3001 3002; do lsof -ti tcp:$p | xargs -r kill -9; done`.
- **Pełny `npx playwright test` bywa FLAKY na pierwszym przebiegu po zmianie kodu**:
  4 workery naraz zmuszają dev-serwer do kompilacji na żądanie i test uciekiniera
  z `f2-03` padł raz na timing. Ten sam plik osobno = 7 passed. Przed uznaniem faila
  za prawdziwy - powtórzyć plik pojedynczo.
- **Plik `route.ts` w Next.js nie może eksportować NICZEGO poza handlerami HTTP.**
  `export function sanitizeDash` przechodzi `tsc --noEmit` i wywraca dopiero
  `pnpm build`. Zawsze `pnpm build`, nie sam `check`.
- `test.skip(({}, info) => ...)` NIE działa jako warunek w `test.describe` (info jest
  `undefined`). Wzorzec, który działa: `test.beforeEach(({}, info) => { test.skip(...) })`.
- Zastane i nadal aktualne: TypeScript przypięty do `^5.9.3`, konfiguracja to
  `next.config.mjs`, Playwright MCP na kanale `chrome` nie działa (używać `npx playwright test`),
  `getComputedStyle` serializuje `steps(N, end)` jako `steps(N)`, React nie słucha
  surowego `dispatchEvent("mouseenter")` (używać `locator.hover()`),
  `lint-tokens` skanuje komentarze CSS (F7-02 - naprawić PRZED pierwszym vendoringiem).
- `bash ~/.claude/agent-context.sh` w podagencie zwraca `NO-TRANSCRIPT`. Wg zasady:
  pracować dalej, nie wymyślać procentu.

## Stan środowiska
node v26.7.0, pnpm 11.12.0, next 15.5.24, react 19.2.8, typescript 5.9.3.
`pnpm run check` zielony, `pnpm build` zielony (`/api/ocena` jako ƒ, first load 102 kB).
`npx playwright test` = **61 passed + 8 skipped + 2 failed**; oba faile to JEDNO znane
znalezisko **F7-03** (`tests/f1-02.spec.ts`, strict-mode violation na `[data-licznik]` -
stopka z F2-01 dołożyła drugi licznik na `/dev/animacje`). Kod działa, test jest za wąski.
Deploy: <https://j-word-pass-ehluwxh43-enkidu-pngs-projects.vercel.app> (READY, chroniony SSO).

## Nowe znaleziska tej zmiany (wszystkie mają issue w F7-ZNALEZISKA)
- **F7-03** `test` - `f1-02` pada przez drugi `[data-licznik]` w stopce. Fix = zawężenie
  locatora do `[data-licznik-demo]`. To jedyne czerwone w suite.
- **F7-04** `deploy` - Deployment Protection blokuje anonimowy dostęp do deployu.
- **F7-05** `ui` - na 390 px widżet RadioKomisji NAKŁADA SIĘ na tekst stopki
  (widoczne na `screenshots/F2/F2-DoD-egzamin-mobile.png`, testy tego nie łapią).
- **DECISIONS #7** - pierwszy deploy Vercela = produkcja mimo braku `--prod`.
- Otwarte D1-D4 z `plan/README.md` nadal nietknięte. F7-01 i F7-02 nadal otwarte.
