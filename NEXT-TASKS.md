# NEXT-TASKS (sztafeta workerow, build v2)

> Ten plik opisuje stan **na moment jego zapisania** i jest przeznaczony dla
> NASTEPNEGO workera. Zrodlem prawdy o zakresie jest `plan/`, a o postepie
> checkboxy w `plan/11-BACKLOG.md`. Jesli ten plik kiedykolwiek zacznie mowic
> co innego niz backlog, wierz backlogowi i skasuj ten plik.

## Gdzie jestesmy (aktualizacja: paczka F7-07)

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

## Co doszlo w paczce F7-07

- **F7-07 ZROBIONE, ROOT CAUSE calej kaskady napisow.** `.napis { width: 100% }`
  w `app/style/scena.css` to teraz `:where(.napis) { width: 100% }`.
  Specyficznosc spada z (0,1,0) na (0,0,0), wiec regula bazowa jest wartoscia
  DOMYSLNA, a nie zawodnikiem bijacym klasy widokow z arkuszy importowanych
  wczesniej. Odzyskane dwie martwe reguly: `.werdykt__napis` (760 -> 420 px)
  i `.maszyna__napis` (663,7 -> 320 px). Osiem pozostalych napisow na `/`,
  `/egzamin`, `/quiz`, `/proba-ognia`, `/nie-ma`, `/dev/scena` co do piksela
  bez zmian - tabela przed/po siedzi w `plan/11-BACKLOG.md`.
  Straznik: `tests/f7-07.spec.ts` (20 testow). `tests/f7-06.spec.ts` dostal
  zaktualizowane dwie wartosci w tabeli „przed poprawki".
- **`.brak__napis` przestal dzialac przez przypadek.** Wczesniej wygrywal
  wylacznie dlatego, ze `nieznalezione.css` jest importowany PO `scena.css`.
  Dzis wygrywa specyficznoscia, jak kazda inna klasa widoku.
- Stan po paczce: `pnpm run check` czysto, `pnpm build` zielony (`/quiz` 115 kB,
  `/egzamin` 112 kB, `/proba-ognia` 109 kB, `/` 107 kB, `/dev/scena` 107 kB),
  `npx playwright test` = **366 passed / 0 failed / 6 skipped**.
- **F8-01 NIE RUSZANY** - stop-gate Aleksandry. Zero deployu.

## Co doszlo w paczce F7-02, F7-03, F7-05

- **F7-02 ZAMKNIETE** jako nieaktualne. `h1` na `/`, `/egzamin` i `/quiz` niesie
  dzis `NapisObrazek`, a nie tekst Caveatem od `x = 0`. Pomiar na zywej stronie
  daje lewa krawedz tresci 12/450/460 px (desktop) i 12/45/45 px (390 px).
  `tests/f7-02.spec.ts` zostaje jako straznik regresji.
- **F7-03 ZROBIONE.** Plakietki webringu maja `klatka-statyczna` w manifescie,
  walidator wymaga tego pola takze od roli `plakietka`, `tests/f1-01.spec.ts`
  wrocil ze skanu `main.tresc` na CALY dokument.
- **F7-05 ZROBIONE.** Odbijany goniec liczy droge od kontenera (`100cqw` plus
  `container-type: inline-size`), `.pas-goniec` ma `text-align: left`, a goniec
  bramy ponizej 480 px bierze `--stopien-drobny`.

## Nastepne issue

**BRAK ISSUE DO WZIECIA.** Po F7-07 w `plan/11-BACKLOG.md` nie ma juz zadnego
otwartego `[ ]` poza **F8-01**, a to twardy STOP-GATE Aleksandry - nie dotykac,
zero deployu. Nastepny worker albo dostaje NOWE znalezisko do dopisania w
F7-ZNALEZISKA, albo nie ma czego robic.

## Stan srodowiska

- `pnpm dev` chodzi na `localhost:3000`. `pnpm run check` zielony, `pnpm build`
  zielony (`/quiz` 115 kB, `/egzamin` 112 kB, `/proba-ognia` 109 kB, `/` 107 kB,
  `/_not-found` 102 kB, limit 160 kB), `npx playwright test` = **334 passed,
  0 failed, 6 skipped** (14 nowych testow z F7).
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

## Pulapki zmierzone w przebiegu F7

0. **`page.addStyleTag()` NIE nadaje sie do testowania kaskady.** Dokleja arkusz
   na KONIEC `<head>`, wiec przy rownej specyficznosci wygrywa kolejnoscia
   niezaleznie od tego, czy poprawka weszla. Pierwsza wersja testu F7-07
   przechodzila takze z cofnietym fixem. Regule-konkurenta wstawiaj przez
   `document.head.prepend(<style>)`, czyli PRZED arkuszem badanym.
   Drugi warunek: badz pewien, ze element NIE ma juz wlasnej reguly o tej samej
   specyficznosci - `.egzamin__etap` ma `width: 100%` w `egzamin.css`, wiec na
   nim dowod tez byl slepy. Uzyty zostal napis z samymi `napis napis--chrom`.
1. **`Range.getClientRects()` na `<svg>` z `<text textLength>` klamie.** Oddaje
   szerokosc SUROWYCH glifow, PRZED skalowaniem viewBox - na bramie 1404 px
   przy elemencie szerokim na 1256 px. Napisy-obrazki mierz obrysem elementu.
2. **`100%` w `translateX` to szerokosc ELEMENTU, nie kontenera.** Droge
   animacji liczona od kontenera daje `100cqw` plus `container-type:
   inline-size` na kontenerze. Zero JS.
3. **`text-align: center` przesuwa punkt startowy `inline-block` PRZED
   transformem.** Kazda animacja typu „od lewej krawedzi kontenera" wymaga
   `text-align: left` na kontenerze, inaczej start jest o polowe wolnego
   miejsca dalej.
4. **Restart animacji przez `style.animation = "none"` i `""` KASUJE inline
   `animation-duration`** ustawiony przez komponent. Animacja dostaje 0 s, stoi
   w miejscu, a test przechodzi nie mierzac niczego. Przewijaj przez
   `element.getAnimations()`.
5. **`sips -s format png` wyciaga pierwsza klatke GIF-a.** Zastepuje `gifsicle`,
   ktorego na tej maszynie nie ma.

## Pulapki zmierzone w przebiegu F6

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

**ZERO.** Cala faza F7-ZNALEZISKA zamknieta: **F7-01** (z F5-02), **F7-02**,
**F7-03**, **F7-04**, **F7-05**, **F7-06**, **F7-07** - kazde z dowodem
w `plan/11-BACKLOG.md`.

## Decyzje w toku

- **D-kontekst (do Aleksandry):** `agent-context.sh` nie mierzy okna workera.
  Rekomendacja: konczyc paczke na granicy fazy. Opis: `DECISIONS.md` #14.
- **F7-04 ROZSTRZYGNIETE** przez orkiestratora (Aleksandra niedostepna):
  Z10 wygrywa ze spec `plan/05 A1`, `DECISIONS.md` wpis 21. Wyjatek
  `WYJATKI_F7_04` z `tests/f6-01.spec.ts` USUNIETY.
- Swiadome odstepstwa opisane i zamkniete: `DECISIONS.md` #15-#21.

## Co doszlo w paczce F7-04 plus F7-06

- **F7-04 ZROBIONE.** Nowy token `--chrom-b-jasny` (`#858585`) uzyty WYLACZNIE
  w regule `.pass-o-metr__pole--zamkniety`. Kontrast 3,75:1 -> 5,16:1,
  `axe` na `/` bez `color-contrast`. `--chrom-b` nietkniety.
  Straznik: `tests/f7-04.spec.ts`.
- **F7-06 ZROBIONE.** Szerokosc napisu bramy niesie `.brama__naglowek`
  (wzorzec z `.egzamin__naglowek`), nie `.brama__napis`. 1256 -> 720 px
  (1280x800), 366 -> 351 px (390x844). Straznik: `tests/f7-06.spec.ts`
  z tabela pomiarow SPRZED poprawki dla pozostalych widokow.
- Stan po paczce: `pnpm run check` czysto, `pnpm build` zielony (first load
  102 kB), `npx playwright test` = **346 passed / 0 failed / 6 skipped**.
- **F8-01 NIE RUSZANY** - to stop-gate Aleksandry. Zero deployu.

## Pulapka srodowiskowa zlapana na starcie tej paczki

Na porcie 3000 wisial `next-server` z POPRZEDNIEJ sesji, karmiony katalogiem
`.next` po `pnpm build`. Kazdy `GET /` oddawal 404 (`ENOENT .next/server/app/
page.js`), a swiezy `pnpm dev` cichcem przenosil sie na port 3001, wiec testy
z `baseURL: 3000` waliły w martwy serwer i wisialy do timeoutu. Lekarstwo,
zawsze przed pomiarami: `pkill -f "next dev"; pkill -f next-server;
rm -rf .next; pnpm dev` i sprawdzenie `curl -o /dev/null -w "%{http_code}"
http://localhost:3000/` = 200. To dopisek do `DECISIONS.md` #19.
