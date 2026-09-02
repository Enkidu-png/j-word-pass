# NEXT-TASKS (sztafeta workerow, build v2)

> Ten plik opisuje stan **na moment jego zapisania** i jest przeznaczony dla
> NASTEPNEGO workera. Zrodlem prawdy o zakresie jest `plan/`, a o postepie
> checkboxy w `plan/11-BACKLOG.md`. Jesli ten plik kiedykolwiek zacznie mowic
> co innego niz backlog, wierz backlogowi i skasuj ten plik.

## Gdzie jestesmy (aktualizacja: paczka F7-08 plus cala faza F9)

**Fazy F0-F7 ZAMKNIETE.** W tym przebiegu doszlo **F7-08** oraz **CALA FAZA F9**
(F9-01 do F9-06) z raportem DoD w `plan/11-BACKLOG.md`. Jeden commit na issue
plus dwa commity naprawcze.

**Jedyna otwarta pozycja w backlogu to `F8-01` - twardy STOP-GATE Aleksandry.**
Nie dotykac, zero `vercel deploy --prod`.

## Co doszlo w tej paczce

- **F7-08** - zadanie etapu 1 wyszlo spod dekoracji. Na 390x844 `TREŚĆ PYTANIA`
  z 1040 na **268 px**, `<textarea>` z 1688 na **982 px**. Sposob: kolejnosc
  w DOM (pytanie przed danymi, scena kosmiczna POD druk odpowiedzi),
  `DANE DO ZADANIA` w `<details>` zwinietym domyslnie, zwezony blok napisow nad
  zadaniem. Liczba `img[data-ozdoba]` bez zmian (35 i 42).
- **F9-01** - stopka mowi `MINISTERSTWO CERTYFIKACJI JAN SACHSE` na czterech
  widokach, reszta stopki nietknieta (4 obrazki przed i po).
- **F9-02** - nowe teksty pasow-goncow, oba w `data/komisja.json` pod `gonce`.
- **F9-03** - Z16 w nowej wersji: pytanie etapu 1 bezosobowo, dokladnie 3 z 15
  pytan quizu z imieniem (nr 1 `Aleksandro`, nr 7 `Rutkowska`, nr 13
  `Mario Magdaleno`), klauzula `Potwierdzam, że rozumiem powagę sytuacji.`
- **F9-04 (HARD)** - etap 1 ma DWIE czesci. Nowy `data/egzamin.json -> czesc2`,
  `lib/stan.ts` niesie `odpowiedz2/punkty2/komentarz2`, `etapUkonczony("egzamin")`
  wymaga OBU werdyktow, PassOMetr pokazuje sume z 20, `/api/ocena` sklada prompt
  z danych i dostaje pole `czesc`.
- **F9-05** - radio przelacza trzy materialy strzalkami, wybor w `localStorage`
  pod `jwp.kanal`, podpis `LECI: POST MALONE...` skasowany.
- **F9-06 (HARD)** - ekran WYZWANIA miedzy ceremonia spalenia a butelka,
  tresc w `data/komisja.json -> wyzwanie`.
- Naprawcze: straznik `tests/f3-02` mierzy strzalke po rozwinieciu `<details>`;
  pergamin i `/api/zgloszenie` licza etap 1 jako **sume dwoch czesci** (20 i 35).

## Nastepne issue

**BRAK ISSUE DO WZIECIA poza `F8-01`**, ktory jest stop-gatem Aleksandry.
Nastepny worker albo dostaje NOWE znalezisko do dopisania w F7-ZNALEZISKA,
albo nie ma czego robic.

## Stan srodowiska

- `pnpm run check` zielony. `pnpm build` zielony: `/quiz` 115 kB, `/egzamin`
  113 kB, `/proba-ognia` 109 kB, `/` 107 kB, `/dev/scena` 107 kB, wspolne 102 kB.
- `npx playwright test` na `pnpm dev` = **388 passed / 0 failed / 6 skipped**.
- Kryteria klawiatury sprawdzone na `pnpm build && pnpm start`: pelny przeplyw
  brama-pergamin sama klawiatura, 20 krokow, przechodzi.
- Uwaga: po tej paczce na porcie 3000 chodzi `pnpm start` (build produkcyjny).
  Przed dalsza praca: `pkill -f next-server; rm -rf .next; pnpm dev`.

## Pulapki zmierzone w tym przebiegu (pelny opis: DECISIONS.md #23)

1. **Limiter zapala sie DOPIERO na produkcji.** `lib/limit.ts` wychodzi przy
   `NODE_ENV !== "production"`. Cala suita przeciwko `pnpm start` wywraca 9
   testow na 429 (jeden proces, jedna `Mapa` licznikow) i pociaga za soba
   `tests/f6-01`. To nie regresja. Na buildzie puszczaj pojedyncze pliki
   i odczekaj minute miedzy przebiegami.
2. **`clientWidth` wewnatrz ZAMKNIETEGO `<details>` to zero.** Zwiniete
   `<details>` nie ma ukladu. Pomiar wnetrza zawsze po klikniecie w `summary`.
3. **`PlonacyNapis` liczy plomienie jako `ceil(szerokosc / 60)`.** Zwezenie
   napisu ZABIERA ozdobe ze sceny i lamie kryterium „nic nie usuniete".
   Ponizej 301 px na 390 px nie schodzic.
4. **Nowy blok dokladany POD zamkniety druk powtarza blad F7-08.** Czesc 2
   egzaminu ladowala pole odpowiedzi na 1804 px. Lekarstwo bez JS:
   `.egzamin:has([data-czesc-2]) .druk--pytanie:not([data-czesc-2])` na
   `display: none` plus `scrollIntoView` na przejsciu.
5. **`tests/f4-01` „przechodne strzalka w prawo" migocze pod obciazeniem.**
   Nasluch strzalek wchodzi po hydracji, `pnpm dev` przy 12 workerach kompiluje
   `/quiz` wolniej niz test naciska klawisz. Pojedynczo przechodzi zawsze.
6. Wczesniejsze pulapki srodowiska (JEDEN `pnpm dev` naraz, `pnpm build` psuje
   dzialajacy `dev`, martwy `next-server` na porcie 3000, `nextjs-portal`
   na zrzutach z dev, `page.addStyleTag` nie nadaje sie do testowania kaskady,
   kolejnosc arkuszy w `globals.css`) sa dalej aktualne.

## Decyzje w toku

- **F8-01 nadal nalezy do Aleksandry.** Zero deployu produkcyjnego.
- `agent-context.sh` przez caly ten przebieg oddawal `STALE-TRANSCRIPT`,
  wiec paczka zostala domknieta na granicy fazy (DECISIONS #14).
- Swiadome odstepstwa tej paczki: `DECISIONS.md` #23 (trzy odstepstwa,
  trzy pulapki).
