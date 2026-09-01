# 05 - SHELL WSPÓLNY I BRAMA (etap 0)

## A. SHELL (`app/layout.tsx` + `app/style/shell.css`)

Kolejność w DOM, wiążąca:

1. `EkranLadowania` (nakładka, `04` sekcja F) - montowany tylko po stronie klienta.
2. `PasGoniec` górny, tekst: `KOMISJA CZUWA - ALEKSANDRO, KOMISJA CZUWA` (wariant
   odbijany, 12 s).
3. `PassOMetr` - trzy pola etapów, patrz A1.
4. `StrazEtapu` - niewidoczny komponent pilnujący kolejności etapów, patrz A2.
5. `{children}`
6. `RadioTinyDesk` - `09`.
7. `StopkaWebring` - patrz A3.

**Zakaz sticky headera. Zakaz hamburgera. Zakaz nawigacji w prawym górnym rogu.**
Nawigacja to wyłącznie `PassOMetr` i stopka (anty-spec globalna 2).

### A1. PassOMetr

Trzy pola obok siebie, każde w ramce `3px outset var(--chrom-a)`, tło `--papier`.
Zawartość pola: numer etapu, nazwa, stan.

| Stan | Wygląd | Klikalne |
|---|---|---|
| `zamkniety` | tło `--chrom-b`, tekst przekreślony, `Ozdoba id="stwor-klodka"` | nie, `aria-disabled="true"` |
| `otwarty` | tło `--papier`, ramka `--jad`, obok `Ozdoba id="nowe"` (migające NOWE) | tak, `<a>` |
| `zdany` | tło `--papier`, wynik `N/10` albo `N/15`, obok `Ozdoba id="stwor-gwiazdka"` | tak, wraca do podglądu |

Awaria co 45 s: jedno losowe pole na 700 ms zmienia tekst na `BŁĄD ODCZYTU AKT`
i wraca. Efekt zrobiony `setInterval` w `useEffect` z czyszczeniem.

**Awaria jest WYŁĄCZONA pod automatem** (`navigator.webdriver === true`). Losowa
mutacja DOM co 45 s wchodziłaby w każdy test trwający dłużej niż to (ceremonia quizu
ma budżet 9 s, ale narada plus fallback API sięgają 16 s, a całe scenariusze
end-to-end idą dłużej) i dawałaby fałszywe faile nie do odtworzenia. Do weryfikacji
ręcznej służy atrybut `data-awaria` na PassOMetr plus funkcja wywoływana z konsoli.

Mobile 390 px: pola układają się w kolumnę, PassOMetr ląduje NAD stopką, nie na górze
(w v1 błędnie lądował na górze i to było łapane dopiero na zrzucie).

### A2. StrazEtapu

Wejście z URL na `/quiz` bez zdanego egzaminu: **bez przekierowania**, pokazuje druk
na środku: `ALEKSANDRO, KOMISJA ZABRANIA. NAJPIERW ETAP 1.` plus link `WRÓĆ DO ETAPU 1`.
Ten sam wzorzec dla `/proba-ognia` bez quizu.

### A3. Stopka-webring

Zawiera, w tej kolejności: pas cienki (`Pas id="pas-cienki"`), licznik odwiedzin
(patrz niżej), trzy plakietki 88x31 z `03` B5, tekst `STRONA WYKONANA RĘCZNIE DLA
ALEKSANDRY`, oraz `Ozdoba id="stwor-koperta"`.

**Miejsce na radio:** między plakietkami a tekstem stopki stoi pusty
`<div data-radio-slot>`. Wypełnia go `RadioTinyDesk` dopiero w F5-03 - shell powstaje
w F2, radio w F5, więc slot jest kontraktem między fazami.

**Licznik odwiedzin:** zero usług zewnętrznych (referencja używa cutercounter, my nie).
Licznik jest lokalny: `localStorage` klucz `jwp.odwiedziny`, inkrementowany raz na
sesję, wyświetlany jako 7 cyfr z wiodącymi zerami na czarnym tle czcionką
`var(--font-terminal)`, startuje od `0001337`.

## B. BRAMA (`/`, etap 0)

### B1. Kompozycja, od góry

1. `EkranLadowania` (pierwsze wejście w sesji, `sessionStorage` klucz `jwp.ladowanie`).
2. Kafel tła: `kafel-brama.png`, `background-repeat: repeat`.
3. `Ozdoba id="statek"` - statek kosmiczny, szerokość 200 px, wyśrodkowany.
4. `NapisObrazek tekst="J-WORD PASS" wariant="chrom"`.
5. Podtytuł jako tekst na `--papier`: `MIĘDZYGALAKTYCZNA KOMISJA KWALIFIKACYJNA`.
6. `PasGoniec` odbijany: `< PRZEWIŃ W DÓŁ, ALEKSANDRO >` plus `Ozdoba id="strzalka-dol"`.
7. **Tablica ogłoszeń** - blok na `--papier` w ramce `4px ridge`, zawierający
   minimum **6 różnych `Ozdoba`** rozstawionych w dwóch rzędach po 3, każda
   z `animation-delay` różniącym się o co najmniej 120 ms.
8. **Druk wstępny** - formularz z jednym polem `IMIĘ KANDYDATKI`, wypełnionym na sztywno
   wartością `ALEKSANDRA` i `readOnly`, oraz przyciskiem `PRZYSTĘPUJĘ DO ETAPU 1`.
9. `StworRogowy` x2 w dolnych rogach (ta sama pozycja, prawa z `--lustro`).
10. `Pas id="pas-budowa" pozycja="dol" wysokosc={45}`.

Razem: 3 + 6 + 2 + 1 pas = minimum 12 animowanych elementów. Z8 spełnione z zapasem.

### B2. Przycisk-uciekinier

Obok przycisku głównego stoi drugi: `WOLĘ NIE`. Na `mouseenter` przeskakuje
do losowej pozycji w obrębie tablicy ogłoszeń. **Skacze dokładnie 3 razy**, przy
czwartym najechaniu zostaje i zmienia tekst na `DOBRZE, ALEKSANDRO, NIECH BĘDZIE`,
a klik prowadzi na `/egzamin` tak samo jak przycisk główny.

Skok = zmiana `left`/`top` w obrębie kontenera `position: relative`. **Zero obrotu**
(Z6). Kursor musi opuścić przycisk, żeby liczyć kolejne najechanie (błąd F7-06 z v1).

Klawiatura: przycisk `WOLĘ NIE` jest normalnie fokusowalny i po `Enter` NIE ucieka -
ucieczka to efekt wyłącznie myszy. Dotyk: `pointer: coarse` wyłącza ucieczkę.

### B3. Ceremonia wejścia

Klik `PRZYSTĘPUJĘ DO ETAPU 1`:
1. `EkranLadowania` pojawia się na 1200-2600 ms (kontrakt z `04` F).
2. Nawigacja na `/egzamin`, fokus ląduje na `h1`.

`Escape` w trakcie: natychmiastowe przejście.

## C. TABELA `zdarzenie -> reakcja` (brama)

| Zdarzenie | Reakcja |
|---|---|
| hover na `PRZYSTĘPUJĘ` | ramka zmienia się z `outset` na `inset`, tło na `--jad` |
| hover na `WOLĘ NIE` | skok do losowej pozycji (3 razy), potem kapitulacja |
| klik `PRZYSTĘPUJĘ` | ceremonia wejścia (B3) |
| Tab | kolejność: pola PassOMetr, druk wstępny, `PRZYSTĘPUJĘ`, `WOLĘ NIE`, radio, stopka |
| `:focus-visible` | `outline: 3px dashed var(--fokus)`, offset 2 px |
| scroll | nic się nie dzieje poza normalnym przewijaniem (anty-spec 9) |
| mobile 390 px | tablica ogłoszeń w jednej kolumnie, stwory dolne `max-width: 22vw` |
| reduced-motion | wszystkie `Ozdoba` na klatkach statycznych, `PasGoniec` statyczny |
| prawy klik | **nic**. Referencja blokuje prawy klik alertem, my NIE - alert blokuje całą sesję przeglądarki i psuje testy. Decyzja zapisana w `DECISIONS.md` |

## D. ANTY-SPEC BRAMY

1. Zero hero z dwoma przyciskami obok siebie w pustej przestrzeni.
2. Zero gradientu jako tła sekcji - tło to kafel (Z9).
3. Zero animacji wejścia elementów przy scrollu.
4. Zero pustego pasa powyżej 120 px bez żadnego elementu.
