# 07 - ETAP 2: QUIZ (`/quiz`)

15 pytań z `data/quiz.json`. W v1 był „segregator teczek" z 15 unikalnymi scenkami
rysowanymi w SVG. Zostaje pomysł (każde pytanie ma własną ozdobę), zmienia się
wykonanie: **ozdoba pytania to GIF z biblioteki, nie rysunek SVG** (Z7).

## A. KOMPOZYCJA

1. Kafel tła `kafel-quiz.png` (jasny, papierowy albo kratka).
2. `Pas id="pas-balony" pozycja="gora" wysokosc={43}`.
3. `NapisObrazek tekst="QUIZ" wariant="neon"`.
4. **Licznik pytań** czcionką terminalową na czarnym tle: `PYTANIE 07 / 15`.
5. **Karta pytania** - blok na `--papier`, ramka `4px ridge`, wewnątrz:
   - lewa kolumna (200 px, mobile: nad treścią): `Ozdoba` przypisana do pytania
   - prawa kolumna: treść pytania (`--stopien-h2`) i cztery warianty A-D
6. **Warianty** jako `<label>` z `<input type="radio">`, każdy w ramce `2px outset`,
   tło `--druk-tlo`. Zaznaczony: ramka `3px inset var(--jad)`, tło `--zloto` z 20%
   przezroczystości. **Zero natychmiastowej informacji, czy dobrze.**
7. **Pytanie 14** jest otwarte: `<input type="text">` zamiast wariantów.
8. **Nawigacja**: `POPRZEDNIE` i `NASTĘPNE` w ramkach `outset`, plus rząd 15 kwadratów
   1-15 (kwadrat wypełniony = odpowiedziane). Kwadraty są klikalne i fokusowalne.
9. Po 15. pytaniu przycisk `ODDAJ ARKUSZ KOMISJI`.
10. `StworRogowy` x2 dolne z `--lustro`, `Pas id="pas-cienki" pozycja="dol"`.

## B. OZDOBY PYTAŃ (S7 - różnicowanie bliźniaków)

Wspólny szkielet karty jest jeden. Wyróżnikiem każdego z 15 pytań jest **inna pozycja
z manifestu** plus jedna reakcja na hover wariantu. Tabela wiążąca:

| Nr | `Ozdoba` (id z manifestu) | Reakcja na hover wybranego wariantu |
|---|---|---|
| 1 | `stwor-osmiornica` | wariant B: ozdoba przyspiesza (`animation-duration` 50%) |
| 2 | `planeta` | brak |
| 3 | `stwor-ptak` | wariant A: ozdoba przechodzi na `--lustro` |
| 4 | `stwor-mlotek` | brak |
| 5 | `stwor-slimak` | wariant D: ozdoba dostaje `filter: invert(1)` |
| 6 | `stwor-zegar` | brak |
| 7 | `stwor-kropla` | wariant A: `animation-duration` skrócone do 400 ms |
| 8 | `stwor-ogien` | brak |
| 9 | `stwor-kosc` | wariant C: ozdoba dostaje ramkę `3px dashed var(--magenta)` |
| 10 | `stwor-mysz` | brak |
| 11 | `stwor-dyskietka` | brak |
| 12 | `stwor-nuta` | wariant A: pojawia się druga kopia ozdoby obok |
| 13 | `stwor-kula-ziemska` | brak |
| 14 | `stwor-krysztal` | poprawny wpis: ozdoba błyska (`opacity` 1/0.3, `steps(2)`, 300 ms) |
| 15 | `stwor-gwiazdka` | brak |

Jeśli któregoś motywu nie ma w archiwum, wolno podstawić inny GIF z biblioteki -
**warunek: 15 pozycji musi być RÓŻNYCH**, sprawdzane testem (zbiór `id` ma 15 elementów).

## C. MASZYNA PRAWDY (ceremonia wyniku)

Po `ODDAJ ARKUSZ KOMISJI`:

| Krok | Czas | Co się dzieje |
|---|---|---|
| 1 | 0 ms | Jeśli są nieodpowiedziane: druk `ALEKSANDRO, PYTAŃ BEZ ODPOWIEDZI: N. LICZĄ SIĘ JAKO BŁĘDNE.` z `POTWIERDZAM` i `WRACAM` |
| 2 | 0-9000 ms | Werdykty 15 pytań po kolei, jeden co 500 ms: kwadrat pytania robi się zielony (`--jad`) albo czerwony (`--alarm`), licznik punktów rośnie |
| 3 | koniec | `NapisObrazek` z wynikiem `N/15`, `Ozdoba id="ogien"` po obu stronach wyniku |
| 4 | +400 ms | Przycisk `PRZEJDŹ DO PRÓBY OGNIA` |

Pełna ceremonia **maksymalnie 9000 ms** (pomiar `performance.now()` w teście).
`Escape`: wszystkie werdykty naraz.

**Tryb rewizji** po ceremonii: przycisk `OBEJRZYJ ARKUSZ`. Wtedy przy każdym pytaniu
poprawna odpowiedź ma ramkę `3px solid var(--jad)`, a błędnie wybrana ma
`text-decoration: line-through` i ramkę `--alarm`. Zero przekreśleń pod kątem (Z6).

## D. TABELA `zdarzenie -> reakcja`

| Zdarzenie | Reakcja |
|---|---|
| hover na wariant | ramka `2px outset` na `3px outset`, plus reakcja z tabeli B |
| klik na wariant | zaznaczenie, zapis `zapiszStan` (debounce 400 ms) |
| klik na kwadrat 1-15 | skok do pytania |
| strzałki lewo/prawo | poprzednie/następne pytanie |
| strzałki góra/dół w grupie radio | zmiana wariantu (natywne zachowanie, nie nadpisywać) |
| Tab | licznik, ozdoba (pomijana, `aria-hidden`), warianty, nawigacja, kwadraty |
| mobile 390 px | ozdoba nad treścią, kwadraty w 3 rzędach po 5 |
| reduced-motion | ozdoby statyczne, ceremonia skraca się do 2000 ms |
| brak JS | pytania widoczne (SSR), zaznaczanie nie działa |
| F5 w połowie | zaznaczenia wracają z `sessionStorage` |

## E. ANTY-SPEC QUIZU

1. Zero informacji o poprawności przed oddaniem arkusza.
2. Zero paska postępu w stylu cienkiej linii - postęp to rząd kwadratów.
3. Zero animacji przewracania kartek w 3D (Z6, obrót tylko w ekranie ładowania).
4. Zero emoji w treści pytań poza polem `emojiZrodlowe` (Z4).
5. Zero ozdób powtórzonych między pytaniami (test na 15 różnych `id`).
