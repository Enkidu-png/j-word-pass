# NEXT-TASKS - stan sztafety

## Następne issue
**F0-05** (dokończenie, obecnie ⛔ BLOKADA) -> potem **F1-01** `⚠ HARD` (biblioteka
`gif-less`, świeże okno).

## Co zostało w F0
- **F0-05** - część GitHub zrobiona (repo publiczne wypchnięte). Zostaje: `vercel link --yes`,
  Blob store + `BLOB_READ_WRITE_TOKEN`, `vercel env add OPENROUTER_API_KEY production`.
- F0-01, F0-02, F0-03, F0-04, F0-06 - odhaczone z dowodami w `plan/10-BACKLOG.md`.
- DoD F0: `pnpm run check` zielony, `pnpm build` zielony (first load 102 kB),
  screenshot `screenshots/F0/F0-01-brama.png`. Brakuje wyłącznie F0-05.

## Blokady wymagające użytkownika
1. `vercel whoami` = `Logged out`. Potrzebne ręczne `vercel login` (interaktywne).
2. Hook uprawnień odrzuca KAŻDĄ komendę dotykającą `.env.local`, także taką, która nie
   drukuje wartości (`grep -c OPENROUTER_API_KEY .env.local`). Bez poluzowania hooka
   worker nie ma jak podać klucza do `vercel env add`, a wklejenie go do czatu łamie Z12.
   Obejście bez zmiany hooka: użytkownik wpisuje klucz w dashboardzie Vercel.

## Pułapki środowiskowe (zmierzone, nie zgadnięte)
- `pnpm create next-app .` ODMAWIA pracy w tym katalogu (są `plan/`, `CLAUDE.md`,
  `.env.local`). Scaffold jest ręczny - nie próbować ponownie.
- **TypeScript 7 psuje Next 15.5.** `next.config.ts` wywala `TypeError: Cannot read
  properties of undefined (reading 'fileExists')`. Dlatego konfiguracja to
  `next.config.mjs`, a `typescript` jest przypięty do `^5`. Nie podnosić do 7.
- Playwright MCP (`mcp__plugin_playwright_playwright__*`) startuje na kanale `chrome`,
  którego na tej maszynie NIE MA. Do weryfikacji wzrokowej używać albo własnego
  `npx playwright test`, albo binarki
  `~/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
  z `--headless --window-size=1280,800 --screenshot=... --virtual-time-budget=3000`.
- `bash ~/.claude/agent-context.sh` w podagencie zwraca `NO-TRANSCRIPT` (exit 1).
  Wg zasady 9: pracować dalej, nie wymyślać procentu. `~/.claude/context-usage.txt` żyje
  i zwraca liczbę, ale dotyczy sesji orkiestratora, nie workera.
- AC F0-05 `grep -r "sk-or-" = 0` jest niespełnialne dosłownie: ciąg występuje w treści
  samych zasad w `plan/01`, `plan/08`, `plan/10`. Zero prawdziwych kluczy.

## Stan środowiska
node v26.7.0, pnpm 11.12.0, next 15.5.24, react 19.2.8, typescript 5.9.3,
@playwright/test 1.62.1 + @axe-core/playwright 4.13.0, chromium zainstalowany.
`gh` zalogowany (Enkidu-png), repo https://github.com/Enkidu-png/j-word-pass (public).
`vercel` WYLOGOWANY.

## Decyzje w toku
DECISIONS.md ma wpisy #1 (@vercel/blob), #2 (scaffold ręczny, next.config.mjs, TS 5),
#3 (blokada F0-05). Otwarte D1-D4 z `plan/README.md` nietknięte.
