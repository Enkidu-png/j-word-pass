# NEXT-TASKS (sztafeta workerow, build v2)

> Ten plik opisuje stan **na moment jego zapisania** i jest przeznaczony dla
> NASTEPNEGO workera. Zrodlem prawdy o zakresie jest `plan/`, a o postepie
> checkboxy w `plan/11-BACKLOG.md`. Jesli ten plik kiedykolwiek zacznie mowic
> co innego niz backlog, wierz backlogowi i skasuj ten plik.

## Gdzie jestesmy

**Fazy F0, F1, F2 i F3 ZAMKNIETE**, kazda z raportem DoD w `plan/11-BACKLOG.md`.
W tym przebiegu doszly: F3-01, F3-02, F3-03. Jeden commit na issue plus commit
z raportem fazy.

Etap 1 dziala end to end: kafel kosmiczny, pas balonow, `ETAP 1` chromem,
plonacy napis `EGZAMIN JASIU`, scena kosmiczna (planeta, ladownik, 12 gwiazdek,
`pointer-events: none`), druki `DANE DO ZADANIA` i `TREŚĆ PYTANIA`, druk
odpowiedzi z licznikiem, osmiornice rogowe, ceremonia narady z dymkami komisji
i werdykt `ZDANE`/`NIEZDANE` z przejsciem na etap 2. Sprawdzone na ZYWYM modelu:
werdykt `7/10` po 5465 ms, komentarz w wolaczu `Aleksandro`.

**Deploy: NIE ruszany w tej paczce.** Ostatni preview jest sprzed F3, produkcja
bez zmian. Bramka F8 nadal nalezy do Aleksandry.

## Nastepne issue

**F4-01** (pierwsze issue fazy F4, QUIZ, oznaczone `⚠ HARD`). Sprawdz jego
`CZYTAJ:` w backlogu. Faza F4 nie zalezy od F3 - uzywa F1 i F2.

## Stan srodowiska

- `pnpm dev` chodzi na `localhost:3000`. `pnpm run check` zielony, `pnpm build`
  zielony (`/egzamin` first load 112 kB, limit 160 kB), `npx playwright test`
  = 146 passed, 0 failed, 10 skipped, dwa pelne przebiegi z rzedu.
- Nowe pliki tej fazy: `components/egzamin/DrukOdpowiedzi.tsx`,
  `app/style/egzamin.css`, `tests/f3-02.spec.ts`, `tests/f3-03.spec.ts`.
- **`.ladowanie` jest teraz `position: fixed`** (bylo `absolute`). Kazda kolejna
  ceremonia odpalana przyciskiem ponizej pierwszego ekranu dziala dzieki temu
  poprawnie. Nie cofaj tego bez przeczytania testu regresji w `tests/f3-03.spec.ts`.
- **`uzyjStanu` nasluchuje zdarzenia `jwp:stan`.** Kto zapisuje werdykt etapu
  BEZ zmiany sciezki, ten musi po `zapiszTeraz` zrobic
  `window.dispatchEvent(new Event("jwp:stan"))`, inaczej PassOMetr zostanie
  z etapem zamknietym. Wzorzec: `components/egzamin/DrukOdpowiedzi.tsx`.
- **Zero punktow NIE idzie do `sessionStorage`.** `etapUkonczony` patrzy na
  `punkty != null`, wiec zapisane `0` otworzyloby quiz, a `plan/02 E1` mowi,
  ze pusta odpowiedz ma zostawiac bramke zamknieta. `lib/stan.ts` nie wolno
  zmieniac (`plan/02 B`), wiec pilnuje tego strona zapisujaca.
- `KafelTla id="..."` to sposob na Z9 w kazdym kolejnym widoku.
- `FokusNaNaglowku` fokusuje `main.tresc h1` po KAZDEJ zmianie sciezki.
  Naglowki etapow musza miec `tabIndex={-1}`. Naglowek bramy CELOWO go nie ma.
- `EkranLadowania` renderuje sie portalem do `<body>`. Nie wkladaj go w scene
  widoku - wpadnie w pomiary tego widoku.

## Pulapki zmierzone w tym przebiegu (nie tracic na nie czasu drugi raz)

1. **JEDEN `pnpm dev` naraz.** Drugi serwer na innym porcie dzieli katalog
   `.next` i psuje hydracje pierwszego: strona przestaje reagowac na JS,
   a formularz wysyla sie natywnie GET-em z trescia w query stringu. Wyglada
   jak blad komponentu, jest bledem srodowiska. Lekarstwo: `rm -rf .next`
   i jeden serwer. Dowod wymagajacy innego env zbieraj po kolei. DECISIONS #19.
2. **`position: absolute` na pelnoekranowej nakladce to pulapka.** Element
   siada na gorze DOKUMENTU, nie okna. Jesli odpala go przycisk ponizej
   pierwszego ekranu, nakladka jest w DOM i przechodzi `toBeVisible()`,
   a uzytkownik nie widzi jej wcale. Mierz `boundingBox().y` wzgledem OKNA.
3. **Nie renderuj wyniku ceremonii rownolegle z nakladka.** Werdykt wstawiony
   do drzewa juz w fazie narady konczyl etap po 300 ms zamiast po kontraktowych
   3500 ms i przechodzil przez wszystkie assercje poza pomiarem czasu.
4. **`locator.textContent()` bez `timeout` zjada caly limit testu.** W petli
   probkujacej element, ktory za chwile zniknie, domyslne 30 s zawiesza test.
   Zawsze `textContent({ timeout: 200 }).catch(() => null)`.
5. **Assercja `expect(y).toBeLessThanOrEqual(0)` przechodzi takze dla `-1090`.**
   Kontrola przez cofniecie poprawki jest obowiazkowa: test, ktory nie pada po
   przywroceniu buga, niczego nie pilnuje. Wlasciwa forma: `Math.abs(y) <= 1`.
6. **`:hover` bije `:disabled` na tej samej specyficznosci.** Przycisk po
   oddaniu pracy dalej zapalal sie na `--jad` pod kursorem. Zawsze
   `:hover:not(:disabled)`.
7. **Zrzuty z `pnpm dev` maja czarne kolko z `N` przy lewej krawedzi** - to
   `<nextjs-portal>`, znaczek dev-toolsow, `position: fixed`. W produkcji go
   nie ma. Skrypt zrzutow chowa go `nextjs-portal{display:none!important}`.
8. **`pnpm build` psuje dzialajacy `pnpm dev`.** Kolejnosc zawsze: testy, build,
   restart dev. Potwierdzone trzeci raz.
9. **`bash ~/.claude/agent-context.sh` oddaje `STALE-TRANSCRIPT`** przez caly
   przebieg (raz na starcie oddal `44`, potem juz nigdy liczby). Warunek
   sztafety „konczy przy 55%" jest tym narzedziem niemierzalny. DECISIONS #14.
   Ta paczka zostala domknieta NA GRANICY FAZY, zgodnie z dyspozycja.

## Otwarte issues w F7-ZNALEZISKA

- **F7-01** dwa testy w `tests/f5-02.spec.ts` sparkowane, odpiac po F5-02.
- **F7-02** naglowek `h1` przyciety przy lewej krawedzi okna. Uwaga: NIE dotyczy
  `/egzamin`, bo tam `h1` niesie `NapisObrazek`, a nie tekst Caveatem.
- **F7-03** plakietki webringu nie maja klatki statycznej, wiec animuja sie mimo
  reduced motion.
- **F7-04** kontrast tekstu w zamknietym polu PassOMetr okolo 3,8:1. Konflikt
  spec kontra dostepnosc, czeka na decyzje.
- **F7-05** wariant `odbijany` pasa-gonca liczy droge od szerokosci OKNA, nie
  kontenera, wiec na bramie ucina `ALEKSANDRO`.

## Decyzje w toku

- **D-kontekst (do Aleksandry):** `agent-context.sh` nie mierzy okna workera.
  Rekomendacja: konczyc paczke na granicy fazy. Opis: `DECISIONS.md` #14.
- **F7-04 (do Aleksandry):** kontrast pola zamknietego PassOMetr.
- Swiadome odstepstwa opisane i zamkniete: `DECISIONS.md` #15, #16, #17, #18,
  **#19** (dwa serwery dev kontra katalog `.next`).
