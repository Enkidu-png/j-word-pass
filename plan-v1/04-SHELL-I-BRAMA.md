# 04 - SHELL (layout wspólny) I ETAP 0: BRAMA

## A. SHELL (`app/layout.tsx` + komponenty globalne)

Elementy obecne na każdej stronie, w tej kolejności DOM:

1. **`kursor-komisji`**: `html { cursor: url("data:image/svg+xml,..."), auto }` -
   SVG 32x32: pieczątka-wskaźnik (okrąg `--urzad` z krzyżykiem celowniczym). Hotspot 4 4.
   Na elementach klikalnych wariant `pointer` (ta sama pieczątka przechylona 20deg).
2. **`PasekKrawedzi` górny**: 44 px, kafelek trójkątnych proporczyków
   (`repeating-linear-gradient` + `conic`), `.gif-less--jazda`. Zawiera napis przewijany
   CSS-marquee własnej roboty (element z `transform: translateX` w pętli `steps(24)`,
   3800 ms - duża liczba kroków celowo: rwany przesuw): treść
   `WITAMY W SYSTEMIE J-WORD PASS /// KOMISJA CZUWA /// NIE ODŚWIEŻAJ STRONY (ALBO ODŚWIEŻ, ZAPISUJEMY) ///`.
3. **`PassOMetr`** (prawy górny róg, fixed, z-index nad treścią): ramka `formularz-F7`
   w miniaturze, 3 segmenty [EGZAMIN][QUIZ][OGIEŃ]; segment aktualny mruga
   (`.gif-less--blink`); segmenty ukończone wypełnione `--jad` kratką. Co 45 s pasek
   robi „awarię": cofa się o 10% na 800 ms i wraca (dekoracja, `steps(3)`); awaria
   czysto wizualna, stan w `sessionStorage` nietknięty (timer: `setInterval`
   w komponencie, reset przy nawigacji - akceptowane). Klik w PassOMetr -> nawigacja
   do ukończonych etapów (do przodu zablokowane: `title="KOMISJA ZABRANIA"`).
4. **`RadioKomisji`** (lewy dolny róg, fixed): obudowa radia SVG, przycisk
   `WŁĄCZ SZUM URZĘDOWY`. Dźwięk: WebAudio - proceduralny szum (biały szum przez
   biquad lowpass 400 Hz, gain 0.03) + co 8-15 s losowy „beep" sinus 880 Hz 90 ms.
   Zero plików audio. Z16: nie startuje sam. Stan w `localStorage jwp.audio`.
5. **`WebringStopki`**: `CZĘŚĆ OFICJALNEGO WEBRINGU KOMISJI: [POPRZEDNIA] [NASTĘPNA] [LOSOWA] [LISTA]` -
   linki prowadzą do trzech etapów i strony głównej (LOSOWA = faktycznie `Math.random`
   po 4 ścieżkach). Pod spodem: `Ostatnia aktualizacja: 03.01.2000 /// projekt strony: SAMMY Z KOMISJI` +
   odznaka `VALID HTML 4.0` (własne SVG, świadome kłamstwo) + licznik odwiedzin:
   `LicznikMechaniczny` startujący od 1545013 + `Math.floor(Date.now()/86400000)%997`
   (bez backendu). Licznik renderowany dopiero po hydracji (`useEffect`);
   SSR pokazuje wartość bazową 1545013 - zero hydration mismatch.
6. **`KometaKursora`** (plan/03 D).

### Tabela interakcji shella

| Zdarzenie | Reakcja |
|---|---|
| hover na link/przycisk | kursor-pieczątka przechylona; element dostaje `outline: 3px dashed var(--alarm)` i skok `translate(-2px,-2px)` skokowo (bez transition) |
| fokus klawiaturą | ten sam outline co hover (`:focus-visible`), NIGDY `outline: none` |
| klik w segment PassOMetr (ukończony) | nawigacja `router.push` |
| klik w segment PassOMetr (przyszły) | brak nawigacji; dymek `KOMISJA ZABRANIA` 1,2 s |
| mobile < 768px | PasekKrawedzi 32 px, PassOMetr zwija się do paska 100% szerokości nad stopką, kometa wyłączona, radio zostaje |
| reduced-motion | wszystkie `gif-less` stoją (Z10), marquee zatrzymany na początku napisu |
| brak JS | treść etapów czytelna (SSR), interakcje nieaktywne; nie obsługujemy dalej - świadomy próg |
| wejście z URL na etap bez ukończenia poprzedniego | strona renderuje się normalnie; na wierzchu druk `formularz-F7`: `KOMISJA ZABRANIA. NAJPIERW ETAP N.` z linkiem do właściwego etapu - bez redirectu (Z15); po ukończeniu poprzedniego etapu druk nie występuje |

### Anty-spec shella
1. Zakaz sticky headera z logo i nawigacją poziomą (nawigacją jest PassOMetr i webring).
2. Zakaz hamburger-menu.
3. Zakaz footera w 4 kolumnach z linkami.

## B. ETAP 0: BRAMA (`app/page.tsx`)

Funkcja fabularna: przedsionek urzędu. Ma zrobić pierwsze wrażenie ściany ruchu
(gęstość Cameron's World) i wpuścić do egzaminu.

### Kompozycja (desktop, od góry)
1. Nagłówek `J-WORD PASS` w `--font-krzyk`, `--rozmiar-krzyk`, wypełnienie gradientem
   chromowym (`background-clip: text`) + `.gif-less--chrom`. Pod spodem, rozstrzelone
   pionowo po lewej krawędzi (motyw Cameron's World): `S Y S T E M  P R Z E P U S T E K`.
2. Tablica ogłoszeń: 5-7 elementów porozrzucanych z `position: absolute`, każdy z inną
   dekoracją: `UWAGA! EGZAMIN TRWA` (blink), pieczątka `WZÓR` (obrot), zebra ASCII-art
   w `<pre>` (tancz), notka `pod nadzorem od 1998` (majtanie), odznaka
   `NAJLEPIEJ OGLĄDAĆ W 800x600` (skok).
3. Blok `formularz-F7` na środku: `WNIOSEK O DOPUSZCZENIE DO EGZAMINU. POUCZENIE:
   system składa się z trzech etapów. Wyniki są ostateczne. Odwołania rozpatruje
   niszczarka.` + jedyny prawdziwy CTA: przycisk `SKŁADAM WNIOSEK I WCHODZĘ`.
4. Przycisk-uciekinier (żart wejściowy): obok CTA drugi przycisk `WOLĘ NIE`, który
   przy hover ucieka (translate w losowy z 4 rogów kontenera, skokowo). Po 3 ucieczkach
   zatrzymuje się i zmienia napis na `DOBRA, I TAK MUSISZ`, klik = to samo co CTA.
   Na dotyku (pointer: coarse): nie ucieka, od razu wariant `DOBRA...`. Klawiaturą:
   fokusowalny normalnie, nie ucieka przy fokusie (a11y).

### Ceremonia wejścia (klik CTA)
| # | czas | krok |
|---|---|---|
| 1 | 0-400 ms | na przycisk wbija się `Pieczatka` tekst `PRZYJĘTO` ton `urzad` |
| 2 | 400-1600 ms | ekran zasnuwa się „szufladą akt": prostokąty `--papier` wjeżdżają z prawej, `steps(6)` |
| 3 | 1600-2000 ms | `router.push("/egzamin")`; egzamin odsłania się analogicznie w lewo |

Skip (Esc): natychmiast krok 3. Fokus po wejściu: nagłówek egzaminu (`tabIndex={-1}.focus()`).

### AC-kluczowe bramy
- Ściana ruchu: minimum 6 niezależnych dekoracji `gif-less` z różnymi delayami widocznych
  bez scrolla na 1280x800 (screenshot + zliczenie).
- `WOLĘ NIE` ucieka dokładnie 3 razy, potem kapituluje (test Playwright: 3x hover, assert
  tekstu).
- reduced-motion: brama statyczna, CTA działa, przejście = pojedynczy fade 300 ms.
