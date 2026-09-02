# 08 - ETAP 3: PRÓBA OGNIA (`/proba-ognia`)

Ostatni etap. Aleksandra wypełnia druk `OGN-3/TAJ`, druk płonie, zostaje list
w butelce z podsumowaniem.

## A. KOMPOZYCJA

1. Kafel tła `kafel-ogien.png` (ciepły, pomarańczowo-czarny).
2. `Pas id="pas-cienki" pozycja="gora" wysokosc={15}` i taki sam na dole.
3. `NapisObrazek tekst="PROBA OGNIA" wariant="chrom"`.
4. **Ognisko** - blok wysokości 220 px: pięć `Ozdoba id="ogien"` w rzędzie u dołu,
   każdy z innym `animation-delay` (0, 130, 260, 390, 520 ms), oraz jedna
   `Ozdoba id="stwor-kot"` siedząca obok ogniska.
5. **Druk OGN-3/TAJ** - blok na `--papier`, ramka `4px ridge`, nagłówek druku
   czcionką terminalową `OGN-3/TAJ - WNIOSEK KOŃCOWY - ALEKSANDRA`.
   Trzy pola:
   - `TWÓJ ADRES E-MAIL, ALEKSANDRO` - `type="email"`
   - `ROZMIAR BUTA` - `type="number"`, zakres 10-70, obok `Ozdoba id="stwor-but"`
   - `ŚREDNICA UCHA W MILIMETRACH` - `type="number"`, zakres 5-500, obok
     `Ozdoba id="stwor-ucho"` (jeśli brak motywu: dowolna inna z biblioteki)
6. **Klauzula** na `--papier`, stopień `--stopien-drobny`, plus `<input type="checkbox">`
   z etykietą `Potwierdzam, że rozumiem powagę sytuacji.` (Z16 po zmianie z 2026-09-02).
7. Przycisk `SKŁADAM WNIOSEK` - `disabled` dopóki checkbox niezaznaczony.
8. `StworRogowy` x2 dolne z `--lustro`.

## B. WALIDACJA KLIENCKA (stemple, nie czerwone obwódki)

| Pole | Warunek | Reakcja |
|---|---|---|
| e-mail | nie pasuje do `.+@.+\..+` | druk drga (`translateX` 0/-6/6/0, 240 ms, `steps(4)`), pod polem stempel `ALEKSANDRO, TO NIE JEST ADRES` na `--alarm`, fokus wraca do pola |
| rozmiar buta | poza 10-70 | stempel `ROZMIAR POZA SKALĄ KOMISJI (10-70)` |
| ucho | poza 5-500 | stempel `ŚREDNICA POZA SKALĄ KOMISJI (5-500)` |
| ucho | 150-500 | przechodzi, ale dopisek `KOMISJA WYRAŻA PODZIW` |
| checkbox | niezaznaczony | przycisk `disabled`, `aria-disabled="true"` |

Drganie to `translateX`, **nie obrót** (Z6). Zero czerwonych obwódek bez stempla.

## C. CEREMONIA SPALENIA

| Krok | Czas | Co się dzieje |
|---|---|---|
| 1 | 0-900 ms | Druk zjeżdża w dół do ogniska (`transform: translateY`), POST do `/api/zgloszenie` startuje równolegle |
| 2 | 900-2400 ms | Nad drukiem pojawia się rząd `Ozdoba id="ogien"` (8 sztuk), druk traci `opacity` do 0 skokowo (`steps(6)`) |
| 3 | 2400-3200 ms | Popiół: 20 kwadratów 6x6 px koloru `--chrom-b` opada `translateY` z różnymi opóźnieniami |
| 4 | 3200 ms | Pojawia się `Ozdoba id="stwor-butelka"` na środku, z `PasGoniec` pod spodem: `KLIKNIJ BUTELKĘ, ALEKSANDRO` |

`Escape` w krokach 1-3: skok do kroku 4.
`prefers-reduced-motion`: kroki 1-3 zastąpione dwoma krokami po 300 ms.

## D. LIST W BUTELCE

Klik (albo `Enter` na fokusie - butelka ma `role="button"` i `tabIndex={0}`)
rozwija **pergamin**: blok na `--papier`, ramka `4px ridge`, wewnątrz:

- nagłówek `PISMO KOŃCOWE - TAJNE - DO RĄK WŁASNYCH ALEKSANDRY`
- adres e-mail podany w druku
- wynik etapu 1 (`N/10`), etapu 2 (`N/15`), suma jako `N/25`
- zdanie zamykające z `data/komisja.json`, pole `pismoKoncowe`
- przycisk `OD NOWA` - czyści `sessionStorage` i wraca na `/`

Pergamin **nie jest przekrzywiony** (Z6). Rozwijanie: `max-height` 0 do 1200 px,
600 ms, `steps(8)`.

Powrót na `/proba-ognia` po wysłaniu: od razu butelka, **zero ponownego POST**
(flaga `wyslano` w `sessionStorage`).

## E. TABELA `zdarzenie -> reakcja`

| Zdarzenie | Reakcja |
|---|---|
| hover na ognisko | brak (dekoracja) |
| hover na `SKŁADAM WNIOSEK` | ramka `outset` na `inset`, tło `--zloto` |
| klik `SKŁADAM WNIOSEK` z błędem | walidacja B, ceremonia NIE startuje |
| klik `SKŁADAM WNIOSEK` poprawnie | ceremonia C |
| klik/Enter na butelce | rozwinięcie pergaminu |
| Tab | pola druku, checkbox, przycisk, butelka, `OD NOWA` |
| mobile 390 px | ognisko 140 px, pola druku pełna szerokość |
| reduced-motion | ceremonia dwuetapowa, ozdoby statyczne |
| brak JS | druk widoczny, submit nie działa (przycisk `disabled` do hydracji) |
| drugi submit | blokowany flagą `wyslano`, zero requestu |

## F. ANTY-SPEC PRÓBY OGNIA

1. Zero steppera „krok 1 z 3" nad formularzem.
2. Zero czerwonych obwódek bez stempla.
3. Zero przekrzywionego pergaminu ani druku (Z6).
4. Zero konfetti i zero fajerwerków po wysłaniu - jest ogień, nie impreza.
5. Zero maili wysyłanych z aplikacji. Zapis do Bloba i tyle (decyzja z v1).
