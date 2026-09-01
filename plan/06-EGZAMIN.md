# 06 - ETAP 1: EGZAMIN (`/egzamin`)

Najważniejsza powierzchnia. Tu Aleksandra pisze odpowiedź, którą ocenia model.

## A. ZMIANA WZGLĘDEM v1: KONIEC PRZECIĄGANIA DOWODÓW

W v1 „karty dowodowe" przeciągało się myszą do slotów. **Ta mechanika znika w całości**
(polecenie wprost). Zamiast niej: treść kart wchodzi do **treści zadania**.

Co konkretnie:
- Kasujemy komponent kart, sloty, obsługę pointer events, ścieżkę klawiaturową
  i pieczątkę `ZAŁ.`, oraz pole **`zalaczoneDowody`** w payloadzie do `/api/ocena`
  (to jest realna nazwa pola w kodzie, `app/api/ocena/route.ts` i `tests/f3-01.spec.ts`).
- Sześć założeń, które były na kartach, staje się **listą punktowaną w treści zadania**,
  wyświetloną jako `DANE DO ZADANIA` na osobnym druku.
- Prompt systemowy w `/api/ocena` traci zdanie o liczbie załączników; punktacja
  zależy wyłącznie od treści odpowiedzi.

Źródło treści założeń: `data/egzamin.json`, pole `zalozenia` - **tablica sześciu
obiektów `{ id, tekst }`**, nie stringów (`plan/02 E`). Struktury nie zmieniamy,
`scripts/lint-tokens.mjs` sprawdza unikalność `id`.
Zakaz powtarzania tej treści w komponencie (Z3-analog dla danych).

## B. KOMPOZYCJA

1. Kafel tła `kafel-egzamin.png` (ciemny, kosmiczny).
2. `Pas id="pas-balony" pozycja="gora" wysokosc={43}`.
3. `NapisObrazek` z tekstem `ETAP 1` - chrom.
4. **`PlonacyNapis tekst="EGZAMIN JASIU"`** (`04` sekcja E). Stoi bezpośrednio pod
   `ETAP 1`, wyśrodkowany, szerokość maksymalnie 90% widoku.
5. **Scena kosmiczna** - blok wysokości 320 px (mobile 200 px) z kaflem gwiazd:
   - `Ozdoba id="planeta"` po prawej, 220 px
   - `Ozdoba id="statek"` po lewej, 130 px
   - 12 małych `Ozdoba id="stwor-gwiazdka"` rozstawionych losowo, każda z innym
     `animation-delay` (0 do 1100 ms, krok 100 ms)
   - scena jest **wyłącznie dekoracją**, zero interakcji, `pointer-events: none`
6. **Druk `DANE DO ZADANIA`** - blok na `--papier`, ramka `4px ridge`, lista `<ul>`
   z sześcioma założeniami z `data/egzamin.json`. Każda pozycja poprzedzona
   `Ozdoba id="stwor-strzalka"` szerokości 24 px (id z tabeli `03` D1).
7. **Druk `TREŚĆ PYTANIA`** - tekst pytania z `data/egzamin.json`, na `--papier`,
   stopień `--stopien-h2`.
8. **Druk odpowiedzi** - `<textarea>` minimum 10 wierszy, tło `--druk-tlo`, ramka
   `3px inset`, licznik znaków pod polem (limit 8000, licznik zmienia kolor na
   `--alarm` powyżej 7500).
9. Przycisk `ODDAJ PRACĘ KOMISJI`.
10. `StworRogowy` x2 w dolnych rogach z `--lustro`.

Minimum 6 animowanych elementów: planeta, statek, 12 gwiazdek, płonący napis, pas,
2 stwory rogowe. Z8 spełnione.

## C. CEREMONIA OCENY (narada komisji)

Po kliknięciu `ODDAJ PRACĘ KOMISJI`:

| Krok | Czas | Co się dzieje |
|---|---|---|
| 1 | 0 ms | Druk odpowiedzi staje się `readOnly`, przycisk `disabled` |
| 2 | 0-3500 ms | `EkranLadowania` w wariancie `narada`: sześcian 3D plus dymki z `data/komisja.json` (jeden co 700 ms, minimum 5 różnych) |
| 3 | po odpowiedzi API i min. 3500 ms | Werdykt: `NapisObrazek` z `ZDANE` albo `NIEZDANE`, wynik `N/10` czcionką terminalową, komentarz modelu na `--papier` |
| 4 | +400 ms | `Ozdoba id="nowe"` przy etapie 2 w PassOMetr, przycisk `PRZEJDŹ DO ETAPU 2` |

Pusta odpowiedź (po `trim()`): **zero requestu do API**, natychmiastowy werdykt 0/10
z komentarzem `ALEKSANDRO, PUSTKA TEŻ JEST ODPOWIEDZIĄ, ALE NIE NA TEN EGZAMIN.`

Awaria API (502, brak klucza, timeout): werdykt awaryjny losowany z
`data/komisja.json` pola `werdyktAwaryjny`, czas do pokazania maksymalnie 16 s.

`Escape` w trakcie kroku 2: skok do werdyktu (gdy odpowiedź już jest) albo do
komunikatu `KOMISJA JESZCZE OBRADUJE`.

Powrót na `/egzamin` po zdanym etapie: druk `readOnly`, werdykt odtworzony
z `sessionStorage`, zero ponownego requestu.

## D. TABELA `zdarzenie -> reakcja`

| Zdarzenie | Reakcja |
|---|---|
| hover na planetę | brak (dekoracja, `pointer-events: none`) |
| hover na `ODDAJ PRACĘ` | ramka `outset` na `inset`, tło `--jad` |
| wpisywanie w textarea | licznik znaków aktualizuje się, stan zapisywany `zapiszStan` (debounce 400 ms) |
| klik `ODDAJ PRACĘ` | ceremonia C, stan zapisywany przez `zapiszTeraz` (nie debounce) |
| Tab | PassOMetr, textarea, `ODDAJ PRACĘ`, radio, stopka |
| Escape podczas narady | skok do werdyktu albo komunikat |
| mobile 390 px | scena kosmiczna 200 px, planeta 120 px, gwiazdki 6 zamiast 12 |
| reduced-motion | klatki statyczne, płonący napis bez ognia i poświaty |
| brak JS | druk i lista założeń widoczne (SSR), przycisk nie działa |
| F5 w trakcie pisania | tekst wraca z `sessionStorage` (błąd hydracji z v1: wartość z DOM ma pierwszeństwo) |

## E. ANTY-SPEC EGZAMINU

1. **Zero przeciągania czegokolwiek myszą** - to jest powód tej przebudowy.
2. Zero założeń wyświetlonych jako zwykłe `<p>` bez druku i ramki - mają być listą
   na `--papier` w ramce `ridge`.
3. Zero przekrzywionej pieczątki (Z6). Werdykt to prosty `NapisObrazek`.
4. Zero paska postępu ładowania w stylu nowoczesnym (cienka linia u góry). Postęp
   pokazuje sześcian 3D i pasek z `#`.
5. Zero natychmiastowej oceny „na żywo" przy pisaniu.
