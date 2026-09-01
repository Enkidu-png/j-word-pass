# NEXT-TASKS (sztafeta workerow, build v2)

> Ten plik opisuje stan **na moment jego zapisania** i jest przeznaczony dla
> NASTEPNEGO workera. Zrodlem prawdy o zakresie jest `plan/`, a o postepie
> checkboxy w `plan/11-BACKLOG.md`. Jesli ten plik kiedykolwiek zacznie mowic
> co innego niz backlog, wierz backlogowi i skasuj ten plik.

## Gdzie jestesmy

**Fazy F0 i F1 ZAMKNIETE**, obie z raportem DoD wpisanym w `plan/11-BACKLOG.md`.
Ukonczone i odhaczone z dowodami: F0-01, F0-02, F0-03a, F0-03b, F0-03c, F0-04,
F0-05, F0-06, F1-01, F1-02, F1-03, F1-04, F1-05. Jeden commit na issue.

## Nastepne issue

**F2-01** (`ui`, shell: PasGoniec gorny, PassOMetr, StrazEtapu, stopka-webring).
CZYTAJ: `05→A`; `04→B,C,H`; `01→F`.

Pozostale w fazie F2: F2-02a (⚠ HARD), F2-02b, F2-03, F2-04, F2-05 (deploy preview).

## Stan srodowiska

- `pnpm dev` chodzi na `localhost:3000`. `pnpm run check` zielony,
  `pnpm build` zielony (first load 102 kB, playground 106 kB),
  `npx playwright test` = 68 passed, 0 failed, 8 skipped na obu viewportach.
- Biblioteka assetow domknieta: `data/assety.json` ma 43 pozycje (30 `ozdoba`,
  5 `kafel`, 3 `pas`, 3 `plakietka`, 2 `kursor`), `ATTRIBUTION.md` ma wiersz na
  kazdy plik, roznica zbiorow pusta w obie strony.
- Silnik sceny gotowy w `components/scena/`: `Ozdoba`, `StworRogowy`, `Pas`,
  `NapisObrazek`, `PlonacyNapis`, `PasGoniec`, `EkranLadowania`, plus hook
  `uzyjKlatki` i `lib/assety.ts`. Playground `/dev/scena` pokazuje wszystko
  i w produkcji oddaje 404.
- Cztery route'y to nadal stuby `<h1 tabIndex={-1}>`. Warstwa wizualna widokow
  zaczyna sie dopiero w F2.

## Pulapki zmierzone w tym przebiegu (nie tracic na nie czasu drugi raz)

1. **`npx playwright test | tail -3` UKRYWA czerwone.** Reporter `list` wypisuje
   `N failed` PRZED `N skipped` i `N passed`. Jeden commit poszedl na czerwonym
   drzewie. Czytaj `tail -12` albo `grep -E "failed|passed"`. (DECISIONS #16)
2. **`bash ~/.claude/agent-context.sh` zwraca `STALE-TRANSCRIPT` przez CALY
   przebieg workera** i nigdy nie odda liczby. Warunek sztafety „konczy przy
   55% okna" jest tym narzedziem niemierzalny. Szczegoly i rekomendacja:
   DECISIONS #14. **To czeka na decyzje Aleksandry.**
3. **Selektory `.first()` i liczenie po calym dokumencie sa kruche.**
   Playground rosnie z kazdym issue; plonacy napis dolozyl kilkanascie kopii
   ozdoby `ogien` i popsul trzy wczesniejsze testy. Zawezaj do sekcji albo do
   `aria-label`. (DECISIONS #16)
4. **Wyszukiwarka GifCities trafia w motyw mniej wiecej w polowie przypadkow.**
   Kazdy nowy asset MUSI przejsc przez arkusz stykowy renderowany na `--kosmos`
   I na `--papier` przed wpisaniem do manifestu. Dwa tla, bo druga najczestsza
   wada po zlym motywie to nieprzezroczysta ramka. (DECISIONS #13)
5. **`pnpm build` psuje dzialajacy `pnpm dev`.** Kolejnosc zawsze: testy, build,
   restart dev. Potwierdzone w tym przebiegu.
6. **Pomiar czasu z `page.evaluate` mierzy wlasny narzut.** Ekran ladowania
   pokazywal 790 ms tam, gdzie realnie bylo 405. Znaczniki `performance.now()`
   stawia strona, nie test.

## Decyzje w toku

- **D-kontekst (do Aleksandry):** `agent-context.sh` nie mierzy okna workera.
  Rekomendacja: konczyc paczke na granicy fazy albo na ustalonej liczbie issues,
  zamiast na procencie okna. Opis: `DECISIONS.md` #14.
- Otwarte issue **F7-01**: dwa testy w `tests/f5-02.spec.ts` sa sparkowane przez
  `test.skip`, bo steruja formularzem `/proba-ognia` usunietym w F0-01. Odpiac
  po ukonczeniu F5-02. Pelne AC w `plan/11-BACKLOG.md`, faza F7.
- Swiadome odstepstwa od planu, opisane i zamkniete: `NapisObrazek` ma inny
  wzor na `viewBox` niz `plan/04 D` (DECISIONS #15), lista kasacji z `plan/02 C`
  byla niepelna (DECISIONS #12).
