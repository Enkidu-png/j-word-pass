# NEXT-TASKS (sztafeta workerow, build v2)

> Ten plik opisuje stan **na moment jego zapisania** i jest przeznaczony dla
> NASTEPNEGO workera. Zrodlem prawdy o zakresie jest `plan/`, a o postepie
> checkboxy w `plan/11-BACKLOG.md`. Jesli ten plik kiedykolwiek zacznie mowic
> co innego niz backlog, wierz backlogowi i skasuj ten plik.

## Gdzie jestesmy

**Fazy F0-F6 ZAMKNIETE**, kazda z raportem DoD w `plan/11-BACKLOG.md`.
W tym przebiegu doszly: F6-01, F6-02, F6-03, F6-04 plus raport fazy F6.
Jeden commit na issue.

**F6 to byla ostatnia faza budowlana.** Zostaja tylko otwarte znaleziska
w F7-ZNALEZISKA i bramka decyzyjna F8, ktora nalezy do Aleksandry.

Co realnie doszlo:
- audyt dostepnosci z przejsciem brama-pergamin SAMA KLAWIATURA (15 krokow,
  zero klikniec), axe-core bez bledow `critical` na piatce widokow, tabela
  kontrastu mierzona na zywej stronie;
- budzety wagi, long taskow i wymiarow obrazkow na czterech widokach
  produkcyjnych, nie tylko na bramie i playgroundzie;
- **nowy widok `/nie-ma`** (404 Komisji) z wlasnym kaflem `kafel-404`, favicon
  `app/icon.png` i obrazek OG z `app/opengraph-image.tsx`;
- samoocena gestosci i charakteru piatki widokow, z maszynowym straznikiem
  anty-spec i Z6.

**Deploy: NIE ruszany w tej paczce.** Bramka F8 nadal nalezy do Aleksandry.

## Nastepne issue

**F7-02** (naglowek `h1` przyciety przy lewej krawedzi okna). Pierwszy `[ ]`
od gory w `plan/11-BACKLOG.md`. Potem F7-03, potem F7-05.
**F7-04 POMIJAC** - czeka na decyzje Aleksandry (konflikt spec kontra kontrast).
**F8-01 to twardy STOP-GATE** - nie dotykac.

## Stan srodowiska

- `pnpm dev` chodzi na `localhost:3000`. `pnpm run check` zielony, `pnpm build`
  zielony (`/quiz` 115 kB, `/egzamin` 112 kB, `/proba-ognia` 109 kB, `/` 107 kB,
  `/_not-found` 102 kB, limit 160 kB), `npx playwright test` = **320 passed,
  0 failed, 6 skipped**, trzy przebiegi z rzedu.
- Nowe pliki fazy F6: `app/not-found.tsx`, `app/style/nieznalezione.css`,
  `app/opengraph-image.tsx`, `app/icon.png`, `tests/f6-01.spec.ts`,
  `tests/f6-03.spec.ts`, `tests/f6-04.spec.ts`. Rozbudowany `tests/budzet.spec.ts`.
- `next/og` jest modulem samego `next`, wiec obrazek OG **nie lamie Z14** - zero
  nowych zaleznosci runtime. `@axe-core/playwright` siedzi w `devDependencies`
  i tez nie dotyka runtime'u.
- **`noValidate` na formularzu jest OBOWIAZKOWE, jesli walidacje robi aplikacja**
  (pulapka z F5, dalej aktualna).
- **Nie odmontowuj `iframe` odtwarzacza przy pauzie** (DECISIONS #20).
- `window.jwpRadio` i `window.jwpAwaria` to uchwyty diagnostyczne.
- Wczesniejsze pulapki srodowiska (JEDEN `pnpm dev` naraz, `pnpm build` psuje
  dzialajacy `dev`, `nextjs-portal` na zrzutach z dev, `addInitScript`
  serializuje funkcje, kolejnosc arkuszy w `globals.css`) sa dalej aktualne.

## Pulapki zmierzone w tym przebiegu

1. **`NapisObrazek` jest blokiem na 100% szerokosci kontenera.** Krotki tekst
   (viewBox `226x130` dla "404") rosnie wtedy do 350 px wysokosci i zostawia nad
   soba pusta plachte tla. Kazdy nowy `NapisObrazek` potrzebuje jawnej szerokosci.
2. **Stwory rogowe `--gora` wchodza pod pas gorny.** Pas jest `position: absolute`
   przy `top: 0` kontenera i stwor tez, wiec stwor znika za pasem. Na widoku
   z pasem u gory stwory trzeba zjechac o wysokosc pasa.
3. **Test „zero obrotu" nie moze porownywac `transform` do listy stringow.**
   Obrot i skos siedza WYLACZNIE w `b` i `c` macierzy `matrix(a,b,c,d,e,f)`.
   Warunek `b === 0 && c === 0` przepusci marquee, lustro i puls, a nie
   przepusci `rotate` ani `skew`. Stara wersja w `f4-03` wywracala sie na
   pierwszym goncu, ktory sie akurat przesuwal.
4. **`[data-goniec]").last()` to kruchy selektor.** Dolozenie gonca na widoku
   zmienia to, co lapie `.last()`. Zawezaj do bloku (`.butelka-blok [data-goniec]`).
5. **Pomiar ukladu wymaga `document.fonts.status === "loaded"`.** Przy
   rownoleglej suicie `Caveat` doladowywal sie PO pomiarze i wysokosci blokow
   jeszcze rosly - test dziur widzial plachte, ktorej sekunde pozniej nie bylo.
6. **WCAG 1.4.3 wylacza spod progu kontrastu kontrolki NIEAKTYWNE.** Szare
   `ODDAJ PRACE` i `SKLADAM WNIOSEK` maja 3,72:1 i to jest poprawne, bo szarosc
   jest komunikatem. Zostaja w tabeli dowodowej, poza asercja.
7. `bash ~/.claude/agent-context.sh` przez caly przebieg oddawal `52` raz na
   starcie i `STALE-TRANSCRIPT` pozniej. Paczka domknieta NA GRANICY FAZY,
   zgodnie z dyspozycja (DECISIONS #14).

## Otwarte issues w F7-ZNALEZISKA

- **F7-02** naglowek `h1` przyciety przy lewej krawedzi okna. NIE dotyczy
  `/egzamin`, `/proba-ognia` ani `/nie-ma` (tam `h1` niesie `NapisObrazek`).
- **F7-03** plakietki webringu nie maja klatki statycznej, wiec animuja sie mimo
  reduced motion.
- **F7-04** kontrast tekstu w zamknietym polu PassOMetr okolo 3,8:1. Konflikt
  spec kontra dostepnosc, czeka na decyzje. W `tests/f6-01.spec.ts` siedzi
  jawny wyjatek `WYJATKI_F7_04` - po decyzji Aleksandry ma zniknac.
- **F7-05** wariant `odbijany` pasa-gonca liczy droge od szerokosci OKNA, nie
  kontenera, wiec na bramie ucina `ALEKSANDRO`. Widac to na
  `screenshots/F6/f6-04-brama-desktop.png` (napis `< PRZEWIN W DOL, ALEKSAN`).
- **F7-01 ZAMKNIETE** razem z F5-02.

## Decyzje w toku

- **D-kontekst (do Aleksandry):** `agent-context.sh` nie mierzy okna workera.
  Rekomendacja: konczyc paczke na granicy fazy. Opis: `DECISIONS.md` #14.
- **F7-04 (do Aleksandry):** kontrast pola zamknietego PassOMetr.
- Swiadome odstepstwa opisane i zamkniete: `DECISIONS.md` #15-#20.
