# 07 - ETAP 3: PRÓBA OGNIA (`/proba-ognia`)

Motyw sekcji: `kafel--ogien` przygaszony (overlay `--kosmos` 60%), potem `kafel--morze`
w finale. Dane wysyłane do `/api/zgloszenie` (plan/02 D).

## A. KONCEPT: FORMULARZ PRZY OGNISKU

Scena: środek ekranu zajmuje ognisko (SVG stos polan + płomienie 4-klatkowe `steps(4)`,
3 warstwy płomieni z różnymi delayami; iskry: 6 kwadracików 3x3 wylatujących w pętli).
Układ: kontener `max-width: 640px` wycentrowany, ognisko pod drukiem (niższy z-index,
wystaje zza dolnej krawędzi druku); 3 pola na łuku - `rotate(-8deg / 0 / 8deg)` kolejno.
Druk `formularz-F7` nr `OGN-3/TAJ`:
`KWESTIONARIUSZ OSTATECZNY. WYPEŁNIĆ DRUKOWANYMI. KOMISJA PATRZY.`

Pola (dokładnie te trzy - wymóg usera):

| Pole | Typ | Walidacja klient + serwer | Kicz |
|---|---|---|---|
| `ADRES POCZTY ELEKTRONICZNEJ` | email | `.+@.+\..+` | dopisek drobnym: `(tej prawdziwej. Komisja pozna się na fałszu.)` |
| `ROZMIAR BUTA` | number 10-70, krok 0.5 | zakres | obok stopka-miarka SVG, która rośnie/maleje wraz z wartością (`transform: scaleX`, skokowo per zmiana) |
| `PRZYBLIŻONA ŚREDNICA UCHA (MM)` | number 5-500 | zakres | obok ucho SVG z suwmiarką; wartość poza 20-90 mm: dopisek `KOMISJA NOTUJE Z PODZIWEM` (bez blokady - to „przybliżona") |

Błąd walidacji: pole trzęsie się 2 klatki, pod polem stempel `--alarm`
`WYPEŁNIONO NIEGODNIE: <powód>`; fokus wraca do pola. Zero czerwonych obwódek bez stempla (Z14).

Nad przyciskiem klauzula (blink na słowie ŚMIERCIĄ, `--alarm`):
`Oświadczam, że wiem, iż zadanie jest TAJNE, a udostępnianie go osobom postronnym
grozi ŚMIERCIĄ (par. 44 ust. 0 Regulaminu Komisji).` + checkbox wymagany z etykietą
`PRZYJMUJĘ Z POKORĄ` (Z13: pełna poprawna pisownia).

CTA: `JESTEM GOTOWA NA PRÓBĘ OGNIA` (dokładna fraza usera, rodzaj żeński zachowany).

## B. CEREMONIA `proba-ognia` -> `list-w-butelce`

Po walidacji OK: POST `/api/zgloszenie` startuje RÓWNOLEGLE z ceremonią (wynik POST
nie blokuje teatru; błąd -> po ceremonii dyskretny stempel `KOMISJA ZAPISAŁA W PAMIĘCI
ULOTNEJ` i retry w tle 1x).

| # | czas | krok |
|---|---|---|
| 1 | 0-500 ms | druk składa się w kwadrat (3 klatki `clip-path`) |
| 2 | 500-1500 ms | kwadrat wlatuje w ognisko; płomienie buchają x2 (scale, `steps(3)`), ekran błyska `--chrom-b` na 80 ms |
| 3 | 1500-2600 ms | z ogniska unosi się dym, który klatkowo formuje się w BUTELKĘ (morfoza podmianą 4 kolejnych SVG, `steps(4)`) - formularz spłonął, ale treść przetrwała w butelce |
| 4 | 2600-3400 ms | tło przechodzi w `kafel--morze` (roleta w dół `steps(8)`); butelka spada w fale, chlup: 5 kropel `steps(3)` |
| 5 | pętla | butelka dryfuje (translate sinusoidalny KLATKOWO: 6 pozycji w pętli 2,4 s) z korkiem i zwiniętym pergaminem w środku; nad nią dymek `.gif-less--blink`: `KLIKNIJ` |
| 6 | klik butelki | korek wystrzeliwuje (1 klatka + 3 klatki lotu), pergamin rozwija się z butelki do pełnego druku (`scaleY` od 0.05 do 1 w `steps(5)`, 700 ms) |

Pergamin (finalny komunikat, druk `formularz-F7` na pożółkłym tle, pieczątka `TAJNE`
ton `alarm` w rogu, przybita z obrotem):

> `DECYZJA KOMISJI NR OGN-3/TAJ/<rok>`
> `Kandydatura przyjęta. ZADANIE otrzymasz w ciągu 3 dni roboczych na adres <email>.`
> `Zadanie jest TAJNE. Udostępnianie go innym grozi śmiercią.`
> `Odwołań nie przewidziano. Gratulacji również.`
> podpisy trzech głów komisji (odręczne SVG-gryzmoły) + data + `licznik-mechaniczny`
> z sumą punktów kandydata (egzamin + quiz) i podpisem `DOROBEK ŻYCIA: N/25`

Pod pergaminem: `webring-stopki` zostaje, plus mały przycisk `OD NOWA (KOMISJA NIE ZALECA)` -
czyści `sessionStorage jwp.v1` i wraca do bramy.

Skip (Esc) w krokach 1-4: od razu stan z kroku 5. Reduced-motion: druk znika,
butelka i pergamin pojawiają się w dwóch krokach po 300 ms.

## C. TABELA INTERAKCJI

| Zdarzenie | Reakcja |
|---|---|
| fokus pola | podkreślenie kropkowane pola zmienia się w ciągłe; ognisko strzela iskrą |
| wpis rozmiaru buta | stopka-miarka skaluje się skokowo |
| wpis średnicy ucha | suwmiarka rozsuwa się; poza 20-90: dopisek podziwu |
| submit z błędem | trzęsienie + stempel niegodności, fokus na pierwsze błędne pole |
| submit OK | ceremonia B; przycisk disabled na czas ceremonii |
| klik butelki | krok 6; butelka fokusowalna (`role="button"`, Enter działa) |
| hover ogniska | płomień wychyla się w stronę kursora (wybór 1 z 3 klatek kierunkowych wg pozycji myszy) |
| mobile | formularz nad ogniskiem (kolumna); butelka większa (min 44px cel dotykowy) |
| reduced-motion | patrz B; pola bez trzęsienia (tylko stempel) |
| powrót po wysłaniu | od razu stan butelki/pergaminu z `sessionStorage` (flaga `wyslano`), bez ponownego POST |

## D. ANTY-SPEC PRÓBY OGNIA
1. Zakaz toasta „Wysłano pomyślnie" - potwierdzeniem jest wyłącznie list w butelce.
2. Zakaz podwójnego POST (idempotencja: flaga `wyslano` w stanie; przycisk znika po sukcesie).
3. Zakaz stepper-wizarda 1-2-3 nad formularzem.
4. Zakaz prawdziwego ostrzegania usera przed karą śmierci w tonie serio - klauzula ma
   być oczywistym absurdem (paragraf 44 ustęp 0), nie straszakiem.
