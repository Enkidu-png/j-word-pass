# NEXT-TASKS (sztafeta workerow, build v2)

> Ten plik opisuje stan **na moment jego zapisania** i jest przeznaczony dla
> NASTEPNEGO workera. Zrodlem prawdy o zakresie jest `plan/`, a o postepie
> checkboxy w `plan/11-BACKLOG.md`. Jesli ten plik kiedykolwiek zacznie mowic
> co innego niz backlog, wierz backlogowi i skasuj ten plik.

## Gdzie jestesmy (aktualizacja: cala faza F10)

**Fazy F0-F7, F9 i F10 ZAMKNIETE.** W tym przebiegu doszla CALA FAZA F10
(F10-01, F10-02, F10-03) z raportem DoD w `plan/11-BACKLOG.md`. Wszystko jest
na PRODUKCJI i tam zweryfikowane.

**Otwarta pozycja: `F7-09`** - to nie jest robota workera, tylko decyzja
Aleksandry (integracja GitHub deployuje `main` prosto na produkcje).

## Co doszlo w tej paczce

- **F10-01** - kazda udana ocena zapisuje `odpowiedzi/<ISO>-czesc<N>-<losowe6>.json`
  do prywatnego store'a `jwp-zgloszenia` (pelna tresc odpowiedzi, punkty,
  komentarz, model). `/api/zgloszenie` zapisuje komplet: obie odpowiedzi
  z werdyktami plus wynik quizu. Wspolny zapis w `lib/zapis.ts`. Awaria Bloba
  NIE zabiera werdyktu. Przepis na odczyt: `WERYFIKACJA.md` sekcja 11.
- **F10-02** - brama wstepu: pelnoekranowa nakladka z pytaniem `Jak na drugie
  imie ma Janek?` przed kazdym z czterech widokow. Tresc widoku chowa ARKUSZ
  (`:root:not([data-wstep="1"])`), nie React - dzieki temu nic nie mignie przed
  hydracja. Pytanie i odpowiedz w `data/komisja.json -> wstep`.
- **F10-03** - `/api/ocena` i `/api/zgloszenie` wymagaja naglowka `x-jwp-klucz`,
  porownanie ze zmienna `JWP_KLUCZ_WSTEPU`. 401 przed wywolaniem modelu.

## Nastepne issue

**BRAK ISSUE DO WZIECIA.** Otwarte zostaje tylko `F7-09` (decyzja Aleksandry).
Nastepny worker albo dostaje NOWE znalezisko do dopisania w F7-ZNALEZISKA,
albo nie ma czego robic.

## Stan srodowiska

- `pnpm run check` zielony. `pnpm build` zielony (rozmiary bez zmian wzgledem F9).
- `npx playwright test` = **424 passed / 6 skipped / 0 failed**.
- **UWAGA, NOWE:** serwer deweloperski do testow musi miec klucz wstepu:
  `JWP_KLUCZ_WSTEPU=wstep-testowy pnpm dev`. Playwright wstrzykuje to sam przez
  `webServer.env`, ale gdy `pnpm dev` odpalasz RECZNIE (a `reuseExistingServer`
  go potem przejmuje), bez tej zmiennej `/api/*` oddaje 401 i pada 9 testow.
- Cala suita wchodzi z gotowym `jwp.wstep` w `localStorage` przez `storageState`
  w `playwright.config.ts`. Sama brama testuje sie w `tests/f10-02.spec.ts`,
  ktory ten wpis kasuje.

## Pulapki zmierzone w tym przebiegu (pelny opis: DECISIONS.md #24)

1. **`JWP_KLUCZ_WSTEPU` jest w Vercelu WRAZLIWA** - `vercel env pull` oddaje
   `"[REDACTED]"`, nie wartosc. Testy jada na wlasnej, jawnej i umyslnie innej.
2. **`vercel blob get` wymaga `--access private`**, samo `--rw-token` nie starcza.
3. **`extraHTTPHeaders` w `use` leci do KAZDEGO hosta**, takze youtube.com -
   globalny `x-jwp-klucz` wywracal `tests/f5-03`. Klucz doklejaj per `request.post`.
4. **Nakladki bramy nie ma w HTML-u z serwera** - w DOM-ie psula pomiary sceny
   (`f1-02`, `f7-08`). Tresc chowa arkusz, nie React.
5. **Sam `focusin` nie wystarcza na pulapke fokusu** - Shift+Tab z pierwszego pola
   oddaje fokus przegladarce bez zadnego zdarzenia. Cykl domyka nasluch `keydown`.
6. **Produkcja potrafi odbic `curl` z lokalnego IP** strona `Vercel Security
   Checkpoint` (403), przy 200 dla tego samego adresu z zewnatrz. Weryfikuj
   produkcje przez zwykla przegladarke (`fetch` z konsoli strony).
7. Wczesniejsze pulapki srodowiska (limiter tylko na produkcji, JEDEN `pnpm dev`
   naraz, `pnpm build` psuje dzialajacy `dev`, migotanie `f4-01` i `f6-01` pod
   pelnym obciazeniem, `clientWidth` w zamknietym `<details>`) sa dalej aktualne.

## Decyzje w toku

- **`F7-09` nalezy do Aleksandry.**
- Brama wstepu to **prog zwalniajacy, nie uwierzytelnienie** (DECISIONS #24).
  Nie dokladac do niej niczego, co wymagaloby, zeby byla szczelna.
- `agent-context.sh` przez caly ten przebieg oddawal `STALE-TRANSCRIPT`.
