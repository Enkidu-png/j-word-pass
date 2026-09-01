# HANDOFF - J-WORD PASS

Stan: **PROJEKT SKOŃCZONY I OPUBLIKOWANY.** Wszystkie fazy F0-F8 zamknięte, backlog
nie ma ani jednego otwartego issue. Produkcja żyje publicznie.

**https://j-word-pass.vercel.app**

## Co jest zrobione
- F0 fundament, F1 silnik animacji, F2 shell i brama, F3 egzamin z oceną AI,
  F4 quiz, F5 próba ognia, F6 polish, F7 znaleziska (16 sztuk), F8 publikacja.
- 48 commitów, wszystko na `Enkidu-png/j-word-pass` (public), drzewo zsynchronizowane.

## Bramy jakości (ostatni pomiar)
- `pnpm run check` zielony, `pnpm build` zielony (first load 102-113 kB / budżet 160)
- `npx playwright test` = 212 passed + 22 skipped + 0 failed
  (z ręcznym buildem na :3100 jest 217 + 17 - 5 testów perf pomija się bez niego)
- Produkcja zweryfikowana na żywo: 4 strony 200, `/dev/animacje` 404, `og:image`
  na domenie produkcyjnej, ocena AI odpowiada, rate limit `6:429`, walidacja 400.

## Decyzje usera wykonane na bramce F8
1. Deployment Protection ZDJĘTA (`ssoProtection: false`) - strona publiczna.
2. Deploy produkcyjny wykonany świadomie, repo wypchnięte.
3. Store `jwp-zgloszenia` wyczyszczony (332 śmieci z testów + wpis testowy F8).

## Co zostało po stronie ryzyka
- `/api/ocena` jest publiczny. Jedyna ochrona: limit 5/min/IP w pamięci instancji
  (`lib/limit.ts`). Klucz OpenRouter ma limit $4, model kosztuje ~$0.00006 za ocenę.
  Gdyby ktoś uparcie pompował endpoint z wielu adresów, limit go nie zatrzyma -
  wtedy KV albo wyłączenie klucza.
- Dług `ponytail:` (3 pozycje, każda z nazwanym sufitem): limit w pamięci procesu
  bez KV; próg werdyktu wysoki/niski zaszyty na 9 (`app/egzamin/Narada.tsx:22`);
  krok 1 ceremonii uproszczony (`app/egzamin/Plansza.tsx:251`).

## Odbiór ręczny
`WERYFIKACJA.md` - 15 sekcji z checkboxami, zbudowanych z realnie ukończonych issues.
Sekcja 13a zawiera poprawki po review końcowym.

## Pułapki dla przyszłych sesji
- `pnpm build` psuje działający `pnpm dev` (kolejność: testy -> build -> restart dev).
- `route.ts` w Next.js nie może eksportować nic poza handlerami - `tsc --noEmit` tego
  nie łapie, wywala dopiero `pnpm build`.
- Poza produkcją `/api/zgloszenie` NIE pisze do Bloba (F7-16) - inaczej każdy przebieg
  testów zaśmiecał płatny store.
- Komendy `vercel blob` wymagają `--rw-token` (token z `vercel env pull` do pliku
  tymczasowego) - zmienna `VERCEL_OIDC_TOKEN` z `.env.local` sama nie wystarcza.
