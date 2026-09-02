# NEXT-TASKS (sztafeta workerow, build v2)

> Ten plik opisuje stan **na moment jego zapisania** i jest przeznaczony dla
> NASTEPNEGO workera. Zrodlem prawdy o zakresie jest `plan/`, a o postepie
> checkboxy w `plan/11-BACKLOG.md`. Jesli ten plik kiedykolwiek zacznie mowic
> co innego niz backlog, wierz backlogowi i skasuj ten plik.

## Gdzie jestesmy

**Fazy F0-F5 ZAMKNIETE**, kazda z raportem DoD w `plan/11-BACKLOG.md`.
W tym przebiegu doszly: F5-01, F5-02, F5-03 oraz zamkniete znalezisko F7-01.
Jeden commit na issue.

Etap 3 dziala end to end: kafel `kafel-ogien`, dwa pasy cienkie, `PROBA OGNIA`,
ognisko z pieciu ogni plus kot, druk OGN-3/TAJ z walidacja stemplami, ceremonia
spalenia w czterech krokach (zjazd druku, osiem ogni, dwadziescia ziaren popiolu,
butelka) i list w butelce z suma `N/25` oraz przyciskiem `OD NOWA`.
W stopce gra `RADIO KOMISJI` (YouTube IFrame API po gescie).

**Deploy: NIE ruszany w tej paczce.** Bramka F8 nadal nalezy do Aleksandry.

## Nastepne issue

**F6-01** (pierwsze issue fazy F6, POLISH - audyt dostepnosci). Sprawdz jego
`CZYTAJ:` w backlogu. F6 to OSTATNIA faza budowlana: po jej DoD paczka konczy
sie niezaleznie od kontekstu, a dalej jest tylko bramka decyzyjna F8.

## Stan srodowiska

- `pnpm dev` chodzi na `localhost:3000`. `pnpm run check` zielony, `pnpm build`
  zielony (`/quiz` 115 kB, `/egzamin` 112 kB, `/proba-ognia` 109 kB, limit
  160 kB), `npx playwright test` = 224 passed, 0 failed, 6 skipped.
- Nowe pliki fazy F5: `components/ogien/DrukOgnia.tsx`,
  `components/ogien/ListWButelce.tsx`, `components/RadioTinyDesk.tsx`,
  `app/style/ogien.css`, `tests/f5-01.spec.ts`, `tests/f5-03.spec.ts`.
  Nowe pole `pismoKoncowe` w `data/komisja.json`.
- **`noValidate` na formularzu jest OBOWIAZKOWE, jesli walidacje robi aplikacja.**
  Przy `type="email"` i `min`/`max` przegladarka BLOKUJE submit i `onSubmit`
  nigdy nie dochodzi. Szesc assercji padalo na "brak stempla", a przyczyna byla
  natywna walidacja, nie kod stempli.
- **Nie odmontowuj `iframe` odtwarzacza przy pauzie.** Pierwsza wersja radia
  renderowala gniazdo tylko gdy `gra === true`; `WYLACZ` kasowalo iframe razem
  ze stanem, wiec `getPlayerState()` nigdy nie wracalo `2`, a ponowne `WLACZ`
  startowaloby koncert od poczatku. Odtwarzacz montuje sie RAZ. DECISIONS #20.
- **`YT.Player` na `youtube-nocookie.com` MUSI dostac jawny `host`**, inaczej
  `onReady` nie przychodzi i radio zawsze wpada w tryb awaryjny (plan/09 A).
- `window.jwpRadio` to uchwyt diagnostyczny do odtwarzacza (jak `jwpAwaria`).
  Bez niego kryterium "pauza ponizej 100 ms" jest niemierzalne.
- Test F2-01 sprawdzal, ze slot na radio jest PUSTY. Od F5-03 sprawdza, ze siedzi
  w nim dokladnie jedno `[data-radio]`.
- Wczesniejsze pulapki srodowiska (JEDEN `pnpm dev` naraz, `pnpm build` psuje
  dzialajacy `dev`, `nextjs-portal` na zrzutach z dev, `addInitScript`
  serializuje funkcje, kolejnosc arkuszy w `globals.css`) sa dalej aktualne -
  opis w historii tego pliku i w `DECISIONS.md` #14, #19.

## Pulapki zmierzone w tym przebiegu

1. **Natywna walidacja HTML kontra walidacja wlasna** - patrz `noValidate` wyzej.
   Objaw wyglada jak martwy handler, przyczyna jest w przegladarce.
2. **Nie mierz animacji probkujac `getComputedStyle` w petli.** Animacja 240 ms
   konczy sie, zanim petla assercji do niej dojdzie. Pewniejsze jest przeczytanie
   klatek kluczowych z `document.styleSheets` (`CSSKeyframesRule`) - to dalej
   pomiar na zywej stronie, a nie na tekscie pliku.
3. **`getPlayerState()` mierz dopiero, gdy odtwarzacz REALNIE gra (stan `1`).**
   Pauza materialu, ktory sie nie zaczal, nie zwraca `2` i test klamie.
4. **GIF ognia ma klatki prawie przezroczyste.** Na zrzucie fazy potrafi zniknac
   caly rzad plomieni - to klatka, nie brak elementu. Sprawdzaj `boundingBox`,
   zanim uznasz element za niewidoczny.
5. `bash ~/.claude/agent-context.sh` przez caly przebieg oddawal `50` raz na
   starcie i `STALE-TRANSCRIPT` pozniej. Paczka domknieta NA GRANICY FAZY,
   zgodnie z dyspozycja (DECISIONS #14).

## Otwarte issues w F7-ZNALEZISKA

- **F7-02** naglowek `h1` przyciety przy lewej krawedzi okna. NIE dotyczy
  `/egzamin` ani `/proba-ognia` (tam `h1` niesie `NapisObrazek`).
- **F7-03** plakietki webringu nie maja klatki statycznej, wiec animuja sie mimo
  reduced motion.
- **F7-04** kontrast tekstu w zamknietym polu PassOMetr okolo 3,8:1. Konflikt
  spec kontra dostepnosc, czeka na decyzje.
- **F7-05** wariant `odbijany` pasa-gonca liczy droge od szerokosci OKNA, nie
  kontenera, wiec na bramie ucina `ALEKSANDRO`.
- **F7-01 ZAMKNIETE** razem z F5-02.

## Decyzje w toku

- **D-kontekst (do Aleksandry):** `agent-context.sh` nie mierzy okna workera.
  Rekomendacja: konczyc paczke na granicy fazy. Opis: `DECISIONS.md` #14.
- **F7-04 (do Aleksandry):** kontrast pola zamknietego PassOMetr.
- Swiadome odstepstwa opisane i zamkniete: `DECISIONS.md` #15-#19 oraz **#20**
  (skrypt `iframe_api` jako jedyny wyjatek od Z14).
