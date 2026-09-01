# HANDOFF - J-WORD PASS

Stan: **BUILD SKOŃCZONY.** Wszystkie fazy budowlane F0-F6 zamknięte z DoD, review
końcowy wykonany, jego znaleziska poprawione i zweryfikowane. Repo czyste,
44 commity, nic nie deployowano od pierwszego (przypadkowego) deployu z F2-04.

STOP-GATE: bramka decyzyjna F8 (deploy produkcyjny). Pętla zatrzymana, czeka na usera.

## Bramy jakości (ostatni pomiar)
- `pnpm run check` zielony (samotest walidatora + lint-tokens + tsc)
- `pnpm build` zielony, first load 102-113 kB przy budżecie 160 kB
- `npx playwright test` = 212 passed + 22 skipped + 0 failed
  (z ręcznie postawionym buildem na :3100 jest 217 passed + 17 skipped - 5 testów
  perf pomija się bez niego; liczba zależy od środowiska, nie od regresu)

## Co czeka na decyzję usera
1. **F8-01** - zgoda na `vercel --prod` (i ewentualna domena).
2. **F7-04** - Deployment Protection jest WŁĄCZONA: anonimowy `curl` dostaje 302 na
   SSO Vercela, czyli publiczny link nie zadziała dla nikogo z zewnątrz. Zdjęcie jej
   odsłania `/api/ocena` (koszt), którego jedyną ochroną zostaje limit 5/min/IP.
3. **Deployment produkcyjny z F2-04** - powstał przypadkiem (Vercel przypisuje
   pierwszy deploy projektu do produkcji automatycznie, `--prod` nie było użyte).
   Jest za SSO, bez endpointów kosztowych. Zostawić czy skasować.
4. **Sprzątanie store'a** - w prywatnym `jwp-zgloszenia` leży kilkanaście testowych
   plików `zgloszenia/2026-09-01T*.json` z F5-02 i z review. Do skasowania przy F8.

## Odbiór ręczny
`WERYFIKACJA.md` - 15 sekcji z checkboxami, zbudowane z realnie ukończonych issues.
Sekcja 14 wymienia to, czego NIE należy odhaczać (decyzje wyżej).

## Środowisko
node v26.7.0, pnpm 11.12.0, gh zalogowany (Enkidu-png), vercel CLI 59.3.0 zalogowany
(enkidu-png), projekt podlinkowany, `OPENROUTER_API_KEY` i `BLOB_READ_WRITE_TOKEN`
w env Vercela dla wszystkich trzech środowisk.

## Pułapki (pełna lista w NEXT-TASKS.md)
`pnpm build` psuje działający `pnpm dev` (kolejność: testy -> build -> restart dev);
`route.ts` nie może eksportować nic poza handlerami (`tsc` tego nie łapie, `pnpm build`
tak); hook uprawnień odrzuca każdą komendę czytającą `.env.local`.
