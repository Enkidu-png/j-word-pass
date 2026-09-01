# PAKIET PLANISTYCZNY v2: J-WORD PASS (przebudowa)

Trzyetapowy system egzaminacyjny zrobiony jako żart dla **jednej osoby: Aleksandry**.
Wersja 1 była klapą wizualną - powstała czysta, powściągliwa strona retro, a miała
powstać kopia energii `make-frontend-shit-again`: wysypisko animowanych GIF-ów na
kafelkowych tłach. Ten pakiet to przebudowa warstwy wizualnej od zera.

Tryb wykonania: **TIME** (orkiestrator + sztafeta workerów).
Poprzedni pakiet leży w `plan-v1/` - do wglądu, nie do wykonywania.

## Co się zmienia względem v1 (streszczenie decyzji Aleksandry)

| Zmiana | Gdzie opisana |
|---|---|
| GIF-y jako pliki zamiast rysowania w SVG (odwrócenie zasady v1) | `01` A, `01` E-Z7, `03` |
| Gęsto, nie oszczędnie - minimum 6 animowanych elementów na widok | `01` E-Z8 |
| Kafelkowe tła, inne na każdej powierzchni | `01` E-Z9, `03` B2 |
| ZAKAZ przekrzywiania czegokolwiek (koniec pieczątek pod kątem) | `01` E-Z6 |
| Koniec przeciągania dowodów, treść kart wchodzi do zadania | `06` A |
| Radio gra koncert Post Malone Tiny Desk | `09` |
| Ekran ładowania z animacją 3D | `04` F |
| Płonący napis `EGZAMIN JASIU` | `04` E |
| Całe copy zwraca się do Aleksandry po imieniu | `01` D, `01` E-Z16 |

## Pliki

| Plik | Co zawiera |
|---|---|
| `01-ANALIZA-I-ZASADY.md` | analiza porażki v1, anatomia referencji zmierzona w kodzie, odbiorca, zasady Z1-Z18, słownik 14 pojęć, anty-spec globalna |
| `02-FUNDAMENT.md` | stack, co zostaje z v1 i co leci do kosza, tokeny CSS, dane, konwencje, 6 pułapek środowiskowych |
| `03-BIBLIOTEKA-ASSETOW.md` | kolejność źródeł assetów, lista zakupów, budżety wagi, manifest `data/assety.json`, klatki statyczne |
| `04-SILNIK-SCENY.md` | komponenty przekrojowe z algorytmami: Ozdoba, StworRogowy, Pas, NapisObrazek, PlonacyNapis, EkranLadowania 3D, PasGoniec, kursor |
| `05-SHELL-I-BRAMA.md` | layout, PassOMetr, StrazEtapu, stopka z lokalnym licznikiem, brama i przycisk-uciekinier |
| `06-EGZAMIN.md` | etap 1, płonący napis, scena kosmiczna, ceremonia oceny, koniec przeciągania |
| `07-QUIZ.md` | etap 2, 15 pytań, tabela 15 różnych ozdób, maszyna prawdy, tryb rewizji |
| `08-PROBA-OGNIA.md` | etap 3, druk OGN-3/TAJ, walidacja stemplami, spalenie, list w butelce |
| `09-RADIO.md` | odtwarzacz koncertu Post Malone Tiny Desk, kontrakt YouTube IFrame API |
| `10-MASTER-PROMPT.md` | kontrakt orkiestratora TIME (zasady 1-10, pętla /loop, kick-starter) plus uwagi operacyjne |
| `11-BACKLOG.md` | fazy F0-F8, 33 issues z AC, `CZYTAJ:` i dowodami; F7-ZNALEZISKA; bramka F8 |

## Jak wystartować (TL;DR)

1. Otwórz NOWE okno Claude Code w `~/repos/j-word-pass`.
2. Wpisz `/loopstart kickoff` - skill przeczyta ten pakiet, zweryfikuje środowisko
   i wykona blok z `10-MASTER-PROMPT.md` łącznie z pętlą `/loop`.
3. Po F2 dostaniesz URL preview. Przy `STOP-GATE` albo `BLOCKED-ASK-USER` odpowiadasz w czacie.
4. Kontynuacja po handoffie: `/clear` plus kick-starter wypisany przez poprzednią sesję.

## Co dostarczasz po drodze

- Decyzja przy bramce F8: zgoda na podmianę żywej produkcji nową wersją.
- Nic więcej. Klucze są w env, konta zalogowane, produkcja stoi.

## Decyzje otwarte

- **D1. Licencje assetów.** Referencja nie ma pliku LICENSE, więc jej katalog `assets/`
  traktujemy jako listę zakupów, a nie magazyn. Pliki bierzemy z GifCities (archiwum
  GeoCities), zasobów CC0 albo generujemy sami; każdy plik dostaje wiersz
  w `ATTRIBUTION.md`. Kolejność źródeł: `03` A.
- **D2. Repo jest publiczne.** Przy assetach z archiwum to świadome ryzyko o niskiej
  wadze (prywatny żart, nie produkt). Gdyby przeszkadzało, jedna komenda
  `gh repo edit --visibility private` to zmienia i nic nie blokuje.
- **D3. Prawy klik NIE jest blokowany**, mimo że referencja go blokuje alertem.
  Alert w przeglądarce blokuje całą sesję i psuje testy Playwright. Zapisane w `05` C.
- **D4. `<marquee>` zastąpiony CSS-em.** Znacznik działa, ale nie da się go podporządkować
  `prefers-reduced-motion` (Z11) i wywala walidację HTML. Efekt wizualny identyczny, `04` H.
- **D5. Napisy-obrazki generujemy jako SVG**, bo mówią po polsku do Aleksandry i nie ma
  ich w żadnym archiwum. To jedyny dozwolony wyjątek od Z7, `03` B4.
- **D6. Produkcja z wersji 1 zostaje na żywo do bramki F8.** Cały build v2 idzie
  na preview. Podmiana dopiero za zgodą Aleksandry.
- **D7. Nie instalujemy narzędzi graficznych.** Na maszynie nie ma `gifsicle`,
  `magick` ani `ffmpeg`, a `~/.claude` i środowisko to prywatny sprzęt Aleksandry.
  Zamiast optymalizować i skalować GIF-y, odrzucamy pliki powyżej 300 KB i bierzemy
  następnego kandydata z archiwum. Klatki statyczne robi `sips`, który jest w systemie.
- **D8. Odtwarzacz YouTube jest WIDOCZNY, minimum 200x200 px.** Pierwsza wersja planu
  kazała go ukryć pod obudową radia, co łamie regulamin YouTube API Services -
  ten sam, którym uzasadniamy wybór osadzonego odtwarzacza. Sprzeczność wychwycona
  w krytyce planu, poprawiona w `09` A.
- **D9. Progi zdania etapu zdefiniowane w `02` E1.** `/api/ocena` klampuje punkty
  do 6-10, więc egzaminu nie da się oblać merytorycznie i to jest celowe. `NIEZDANE`
  pojawia się wyłącznie przy pustej odpowiedzi. Bez tej definicji `StrazEtapu`
  nie miał czego pilnować.
