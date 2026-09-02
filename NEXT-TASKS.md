# NEXT-TASKS (sztafeta workerow, build v2)

> Ten plik opisuje stan **na moment jego zapisania** i jest przeznaczony dla
> NASTEPNEGO workera. Zrodlem prawdy o zakresie jest `plan/`, a o postepie
> checkboxy w `plan/11-BACKLOG.md`. Jesli ten plik kiedykolwiek zacznie mowic
> co innego niz backlog, wierz backlogowi i skasuj ten plik.

## Gdzie jestesmy

**Fazy F0, F1 i F2 ZAMKNIETE**, kazda z raportem DoD w `plan/11-BACKLOG.md`.
W tym przebiegu doszly: F2-01, F2-02a, F2-02b, F2-03, F2-04, F2-05.
Jeden commit na issue plus jeden commit poprawkowy `F2-04` (obwodka fokusu).

Brama dziala end to end: kafel gwiazd, statek, chromowy napis, podtytul,
pas-goniec ze strzalka, tablica ogloszen z 6 migajacymi ozdobami, druk wstepny
`ALEKSANDRA` readOnly, przycisk-uciekinier, dwa delfiny rogowe, pas
`UNDER CONSTRUCTION`, ceremonia wejscia z ekranem ladowania 3D. Shell (goniec
gorny, PassOMetr, straz etapu, stopka-webring) stoi nad wszystkimi widokami.

**Preview na zywo:** https://j-word-pass-numze2ovx-enkidu-pngs-projects.vercel.app
Produkcja NIE zostala tknieta (`j-word-pass-mhtj52hct...` bez zmian). Bramka F8
nadal nalezy do Aleksandry.

## Nastepne issue

**F3-01** (pierwsze issue fazy F3, EGZAMIN). Sprawdz jego `CZYTAJ:` w backlogu.

## Stan srodowiska

- `pnpm dev` chodzi na `localhost:3000`. `pnpm run check` zielony, `pnpm build`
  zielony (brama 107 kB first load, playground 107 kB), `npx playwright test`
  = 118 passed, 0 failed, 8 skipped, TRZY pelne przebiegi z rzedu.
- Nowe pliki tej fazy: `components/shell/` (`PassOMetr`, `StrazEtapu`,
  `StopkaWebring`, `FokusNaNaglowku`, `uzyjStanu`), `components/brama/`
  (`DrukWstepny`, `PrzyciskUciekinier`, `PierwszeWejscie`),
  `components/scena/KafelTla`, `app/style/shell.css`, `app/style/brama.css`,
  `tests/pomoc.ts`.
- `KafelTla id="..."` to sposob na Z9 w kazdym kolejnym widoku: renderuje jedna
  regule `html:root{background-image:...}` ze sciezka z manifestu. Uzyj go w F3-F6
  zamiast wpisywac kafel do arkusza.
- `FokusNaNaglowku` w shellu fokusuje `main.tresc h1` po KAZDEJ zmianie sciezki.
  Naglowki etapow musza miec `tabIndex={-1}`. Naglowek bramy CELOWO go nie ma.
- `EkranLadowania` renderuje sie portalem do `<body>`. Nie wkladaj go w scene
  widoku - wpadnie w pomiary tego widoku.

## Pulapki zmierzone w tym przebiegu (nie tracic na nie czasu drugi raz)

1. **Wchodzac testem na `/` uzywaj `wejdz(page)` z `tests/pomoc.ts`**, nie
   `page.goto`. Ceremonia wejscia zaslania brame na 1200-2600 ms przy pierwszym
   wejsciu w sesji, a Playwright daje kazdemu testowi swiezy kontekst, czyli
   swieza sesje. Samo „poczekaj az nakladka zniknie" NIE wystarcza: przechodzi,
   zanim nakladka zdazy sie zamontowac. Bariera to klucz `jwp.ladowanie`
   w `sessionStorage`.
2. **Jeden zielony przebieg testow niczego nie dowodzi.** Dwa bledy tej fazy
   (wyscig z ceremonia, prog czasu przy reduced motion) pojawialy sie WYLACZNIE
   przy pelnym przebiegu na czterech workerach i znikaly przy uruchomieniu
   pojedynczego pliku. Przed odhaczeniem: `npx playwright test` co najmniej dwa
   razy z rzedu.
3. **Nie mierz czasu przez `MutationObserver` z ciasnym progiem.** Do 400 ms
   kontraktu dochodzi narzut dwoch commitow Reacta i obciazenia serwera dev
   (425-456 ms w izolacji, ponad 700 ms przy czterech workerach). Prog ma
   pilnowac wyboru galezi kontraktu, nie szumu. Dokladny czas mierz
   znacznikami STRONY, jak w F1-04.
4. **Pozycje elementu mierz `offsetLeft`/`offsetTop`, nie `boundingBox()`**,
   jesli w tescie jest `hover()` albo `focus()` - jedno i drugie dowija strone
   i wspolrzedne ekranowe zmieniaja sie takze wtedy, gdy element stoi w miejscu.
   Dwa testy uciekiniera padaly wylacznie z tego powodu.
5. **`pnpm build` psuje dzialajacy `pnpm dev`.** Kolejnosc zawsze: testy, build,
   restart dev. Potwierdzone drugi raz w tym przebiegu.
6. **Zrzut z PREVIEW pokazuje rzeczy, ktorych nie widzi lokalne uruchomienie.**
   Obwodka fokusu na naglowku i ucinanie tekstu w goncu wyszly dopiero tam.
7. **`bash ~/.claude/agent-context.sh` oddaje `STALE-TRANSCRIPT`** przez caly
   przebieg (raz na starcie oddal `40`, potem juz nigdy liczby). Warunek
   sztafety „konczy przy 55%" jest tym narzedziem niemierzalny. DECISIONS #14.
   Ta paczka zostala domknieta NA GRANICY FAZY, zgodnie z dyspozycja.

## Otwarte issues w F7-ZNALEZISKA

- **F7-01** dwa testy w `tests/f5-02.spec.ts` sparkowane, odpiac po F5-02.
- **F7-02** naglowek `h1` przyciety przy lewej krawedzi okna (Caveat ma ujemny
  wysiew, `body` ma `margin: 0`). Dotyczy wszystkich widokow z `h1`.
- **F7-03** plakietki webringu nie maja klatki statycznej, wiec animuja sie mimo
  reduced motion. Przez to `tests/f1-01.spec.ts` skanuje tylko `main.tresc`.
- **F7-04** kontrast tekstu w zamknietym polu PassOMetr okolo 3,8:1 (spec kaze
  `--tusz` na `--chrom-b`). Konflikt spec kontra dostepnosc, czeka na decyzje.
- **F7-05** wariant `odbijany` pasa-gonca liczy droge od szerokosci OKNA, nie
  kontenera, wiec na bramie ucina `ALEKSANDRO`. Widoczne na zrzucie z preview.

## Decyzje w toku

- **D-kontekst (do Aleksandry):** `agent-context.sh` nie mierzy okna workera.
  Rekomendacja: konczyc paczke na granicy fazy. Opis: `DECISIONS.md` #14.
- **F7-04 (do Aleksandry):** kontrast pola zamknietego. Albo zmieniamy tlo/tekst,
  albo swiadomie zostawiamy kicz i zapisujemy to w `DECISIONS.md`.
- Swiadome odstepstwa opisane i zamkniete: `DECISIONS.md` #15 (viewBox
  `NapisObrazek`), #16 (kruche selektory), #17 (klatka reduced-motion
  synchronicznie), **#18** (AC F2-02a jest kopia AC F2-02b).
