# 06 - ETAP 2: QUIZ O WSZYSTKIM I O NICZYM (`/quiz`)

Dane: `data/quiz.json` (15 pytań, plan/02 C2). Motyw sekcji: `kafel--urzad`
(papier kancelaryjny) z wtrąceniami per pytanie.

## A. KONCEPT PREZENTACJI: SEGREGATOR

Quiz to segregator akt: 15 teczek ułożonych w pionowy stos z zakładkami po prawej
(numer + kategoria). Jedna teczka otwarta naraz. Otwarcie = teczka „wyciąga się"
ze stosu i rozkłada (2 klatki `steps(2)`, 250 ms - szybko, to dekoracja nawigacji,
nie ceremonia). Nawigacja: klik zakładki, strzałki góra/dół, oraz przyciski
`NASTĘPNA TECZKA` / `POPRZEDNIA`. Wolno odpowiadać w dowolnej kolejności; zakładka
z odpowiedzią dostaje mini-stempel `WYPEŁNIONO`.

Struktura teczki (wspólny szkielet - S7):
- nagłówek: `AKTA NR N/15 /// KATEGORIA` (bez emoji - Z4),
- treść pytania `--font-glos`,
- 4 warianty jako pozycje formularza z kwadratowymi checkboxami stylizowanymi na
  odręczne `X` (SVG krzyżyk z 2-klatkowym wbiciem), wybór = radio (jeden naraz),
- strefa `signature` (patrz D) - element sceny unikalny dla pytania.

Pytanie 14 (otwarte, skala Mohsa): zamiast wariantów pole tekstowe stylizowane na
lukę w druku (`....................`), walidacja wg `kluczOtwarte`.

## B. MASZYNA PRAWDY (sprawdzenie, klik `ODDAJĘ AKTA DO WERYFIKACJI`)

Przycisk aktywny zawsze (nieodpowiedziane pytania liczą się jako błędne, komunikat
potwierdzenia gdy > 0 nieodpowiedzianych: druk `CZY NA PEWNO? N TECZEK ŚWIECI PUSTKĄ`
z przyciskami `WRACAM` / `NIECH SIĘ DZIEJE`).

Ceremonia `maszyna-prawdy` (całość ≤ 9 s - Z9; 15 pytań => 400 ms/pytanie + finał):

| # | czas | krok |
|---|---|---|
| 1 | 0-600 ms | stos teczek zjeżdża do środka; nad nim rozkłada się „maszyna": obudowa SVG z lejem, korbą i wyjściem na pieczątki |
| 2 | 15 x 400 ms | teczki wpadają kolejno do leja (`steps(3)`); przy każdej maszyna wypluwa werdykt: zielony stempel `PRAWDA` (+1 na `licznik-mechaniczny` po prawej) albo magenta `FAŁSZ/PUSTKA` z krótkim wstrząsem obudowy (2 px, 2 klatki). Zakładka teczki barwi się odpowiednio |
| 3 | +600 ms | maszyna dymi (3 kwadraty dymu, `steps(4)`), korba robi obrót honorowy, wynik: `Pieczatka` `N/15` ton `jad` (≥8) albo `urzad` (<8) + jedna kwestia komisji zależna od progu |
| 4 | przegląd | pod wynikiem lista 15 zakładek: klik pokazuje teczkę w trybie rewizji - poprawna odpowiedź obwiedziona `--jad`, wybrana błędna przekreślona `--alarm` (dwie kreski odręczne SVG) |

Skip (Esc): pomija krok 2 klatkowo (wszystkie werdykty naraz), zostaje krok 3-4.
Punkty do `sessionStorage jwp.v1.quiz = {punkty, odpowiedzi}`.

## C. PRZEJŚCIE DO PRÓBY OGNIA (oryginalne - wymóg usera)

Po werdykcie przycisk `WZYWAM PRÓBĘ OGNIA`. Ceremonia przejścia `podanie-do-ognia`:
wynik quizu zostaje przybity do papierowego samolocika (jak w egzaminie - motyw wraca),
samolocik leci w prawo, ale po 600 ms ZAPALA SIĘ od dołu (klatkowe płomienie
`--alarm`/`--chrom-b`, `steps(4)`), ekran wypełnia `kafel--ogien` kołem od punktu zapłonu
(`clip-path: circle()` rosnący w `steps(6)`, 800 ms), `router.push("/proba-ognia")`.
Całość 2,2 s, skip Esc.

## D. SIGNATURE PER PYTANIE (różnicowanie bliźniaków - S7)

Każde pytanie ma JEDEN unikalny element sceny. Budżet: każdy ≤ 30 linii kodu, ma być
tani i głupi, nie rozbudowany. Lista kanoniczna (worker implementuje dokładnie te):

| # | signature | Zachowanie |
|---|---|---|
| 1 | `osmiornica-trzy-serca` | 3 serca SVG pulsują `steps(2)`; przy hover wariantu B jedno serce ZAMIERA (animation-play-state: paused) |
| 2 | `wenus-obraca-sie-zle` | kula Wenus obraca się w przeciwną stronę niż strzałka podpisana `WSZYSCY INNI` |
| 3 | `emu-marsz` | rząd 5 emu maszeruje przez teczkę; jedno niesie flagę z napisem `EMU 1 : 0 ARMIA` |
| 4 | `mlotek-i-piorko` | młotek i piórko spadają RÓWNO w pętli (steps(6)); pod nimi napis `W PRÓŻNI. SERIO.` |
| 5 | `slimak-spi` | ślimak z czapką nocną, nad nim ZzZ klatkowo; klik budzi go na 2 s (otwiera jedno oko) |
| 6 | `rosja-strefy` | pasek 11 zegarów, każdy pokazuje inną godzinę, wskazówki skaczą `steps(60)` |
| 7 | `gal-topnieje` | łyżeczka z metalu kapie (kropla `steps(3)`); przy hover wariantu A kapie szybciej |
| 8 | `sauna-parowa` | 3 kłęby pary unoszą się nad napisem SAUNA (klatkowo, różne delaye) |
| 9 | `kosc-udowa` | kość SVG z metką `WYTRZYMAŁOŚĆ: TAK`; klik = kość robi wyciskanie sztangi (2 klatki) |
| 10 | `mysz-drewniana` | drewniana mysz z dwoma kółkami jeździ po dolnej krawędzi teczki tam-siam (`steps(12)`) |
| 11 | `rekin-starszy-od-drzew` | oś czasu: rekin po lewej, drzewo po prawej, rekin ma laskę i siwe skrzela (blink na skrzelach) |
| 12 | `mozart-kanon` | 4 nutki skaczą po pięciolinii `steps(4)`; hover wariantu A: nutki układają się w uśmiech |
| 13 | `mrowki-hodowcy` | rządek mrówek niesie mszyce jak walizki, w pętli przez szerokość teczki |
| 14 | `skala-twardosci` | 10 kamyków od 1 do 10; wpisanie poprawnej odpowiedzi w lukę sprawia, że kamyk 10 błyska diamentowo |
| 15 | `wombat-kostka` | wombat, za nim rządek idealnych sześcianów; co pętlę dokłada się jeden (max 6, reset) |

## E. TABELA INTERAKCJI

| Zdarzenie | Reakcja |
|---|---|
| klik zakładka | otwarcie teczki (250 ms, `steps(2)`) |
| strzałki góra/dół | poprzednia/następna teczka; fokus na pytaniu |
| wybór wariantu | krzyżyk wbija się (2 klatki), poprzedni wybór gaśnie; zakładka dostaje `WYPEŁNIONO` |
| hover wariantu | wariant przesuwa się o 3px w prawo skokowo; niektóre signature reagują (1,7,12) |
| wpis w lukę (pyt. 14) | znaki pojawiają się jak z maszyny do pisania (bez animacji per znak - po prostu font `--font-urzad`); signature 14 reaguje na poprawność na żywo |
| klik `ODDAJĘ AKTA` | potwierdzenie (jeśli braki) -> maszyna-prawdy |
| Esc w ceremonii | skip klatkowy |
| mobile | zakładki jako pozioma rolka u góry; teczka pełnoekranowa; signature zostają |
| reduced-motion | teczki przełączają się bez animacji; maszyna-prawdy = tabela wyników od razu + pieczątka |
| powrót po zaliczeniu | tryb rewizji (B krok 4) od razu, przycisk do próby ognia |

## F. ANTY-SPEC QUIZU
1. Zakaz karuzeli z kropkami postępu - stos teczek to jedyna nawigacja.
2. Zakaz natychmiastowego feedbacku poprawności przy zaznaczaniu (werdykt TYLKO
   w maszynie prawdy; wyjątek: signature 14 może mrugnąć, bo to żart, nie ocena).
3. Zakaz emoji kategorii w UI (Z4) - kategorie reprezentuje signature.
4. Zakaz „Twój wynik: 87%" - punkty zawsze N/15, procenty to wynalazek korporacji.
