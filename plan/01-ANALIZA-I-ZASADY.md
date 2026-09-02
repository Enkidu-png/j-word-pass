# 01 - ANALIZA REFERENCJI I TWARDE ZASADY

## A. DLACZEGO PIERWSZA WERSJA BYŁA KLAPĄ (analiza porażki, nie narzekanie)

Pierwszy pakiet (`plan-v1/`) opisywał estetykę „powściągliwego retro urzędowego":
papier, chrom, pieczątki, wszystko rysowane proceduralnie. Zawierał zasadę
**„zero binariów w repo, obrazy wyłącznie jako inline SVG i CSS"**. Ta jedna zasada
przesądziła o klapie, bo referencja, którą dostaliśmy, **JEST zbiorem animowanych
GIF-ów**. Nie da się zbudować `make-frontend-shit-again` bez GIF-ów, tak jak nie da się
zbudować kolażu bez wycinków.

Druga przyczyna: pakiet v1 kazał wszystko rysować od zera („proceduralnie"), więc
powstały czyste, spójne, oszczędne sceny. Referencja jest odwrotnością spójności -
to wysypisko niepasujących do siebie obrazków na kafelkowym tle.

**Wniosek do egzekwowania w całym tym pakiecie: charakter tej strony robią GOTOWE
ANIMOWANE OBRAZKI, gęsto upchane, na kafelkowych tłach. Kod jest tylko rusztowaniem,
które je rozstawia.**

## B. ANATOMIA REFERENCJI (zmierzona w kodzie, nie z pamięci)

Źródło: `github.com/SaraVieira/make-frontend-shit-again`, sklonowane i przeczytane
plik po pliku 2026-09-02. Autorka: Sara Vieira. Stack referencji: Nuxt 2 + SCSS.
My przepisujemy zachowanie, nie kod (inny framework).

### B1. Warstwa globalna (`layouts/default.vue`)

| Cecha | Wartość zmierzona w kodzie |
|---|---|
| Tło `html` | `background-image: url(bg.png)` - kafel 304x234 px, POWTARZANY, bez `background-size` |
| Kursor | `cursor: url(cursor.gif), auto` - animowany GIF 50x50 px jako kursor CAŁEJ strony |
| Font | `"Caveat"` (odręczny!) z fallbackiem `Source Sans Pro`, potem systemowy |
| Kolor tekstu | biały na sekcji 1, CZARNY na sekcjach z jasnym tłem - decyzja per sekcja, nie globalna |
| `h1` | 60 px globalnie, 78 px na sekcjach 2 i 3 |
| `p` | 18 px |
| Linki | `color: lightblue` |
| Prawy klik | ZABLOKOWANY, z `alert("Right click is disabled!!!")` |
| Sekcja | `.container`: `min-height: 100vh; width: 100vw`, flex center, `flex-wrap: wrap` |

### B2. Sekcje (`components/Page1..5.vue`) - pięć pełnoekranowych ekranów

Każda sekcja ma WŁASNY kafel tła. To jest główny mechanizm rytmu strony:

| Sekcja | Kafel tła | Rozmiar kafla | Zawartość charakterystyczna |
|---|---|---|---|
| Page1 | `bg.png` (dziedziczy z `html`) | 304x234 | statek `ship.gif`, napis-obrazek `make.gif`, `<marquee behavior="alternate">`, licznik odwiedzin, `baby.gif`, dolny pas `under.gif` |
| Page2 | `bg-1.png` | 41x73 | wirujący statek `ship2.gif`, napis-obrazek `fun.gif`, pasek `crysballbar.gif`, DWA `hotdog.gif` w dolnych rogach (prawy odbity) |
| Page3 | `bg-3.png` | 128x128 | lista 4 pozycji, każda z GIF-em obok tekstu, górny pas `baloons.gif`, dwa `37.gif` w dolnych rogach |
| Page4 | `bg4.png` | 144x136 | 5 GIF-ów rozrzuconych po `position: absolute` w rogach i przy krawędziach, `dope.gif` na środku |
| Page5 | `bg5.png` | 527x400 | tekst zamykający, `10.gif`, plakietki `valid-html40.png` + `w3c-css.gif` + `netscape.gif`, dwa pasy `16.gif` (góra i dół) |

### B3. Trzy powtarzalne wzorce układu (to jest CAŁA gramatyka tej strony)

1. **ROGI.** GIF w `position: absolute` przyklejony do rogu: `left:0; bottom:0` oraz
   `right:0; bottom:0` z `transform: scaleX(-1)` (lustro, NIE obrót). Występuje na
   Page2 (hotdog), Page3 (37.gif), Page4 (dolphin).
2. **PASY.** Wąski GIF rozciągnięty na całą szerokość jako `background` diva o stałej
   wysokości: `under.gif` 45 px (dół Page1), `baloons.gif` 43 px (góra Page3),
   `16.gif` 15 px (góra i dół Page5).
3. **NAPIS-OBRAZEK.** Nagłówek to nie tekst, tylko animowany GIF z napisem
   (`make.gif` 713x79, `fun.gif` 1060x75, `dope.gif` 684x106) wstawiony w `<h1>`.

### B4. Dźwięk

Referencja ma `<audio controls autoplay>` z coverem „My Heart Will Go On (Techno Mix)",
**widoczny** w lewym górnym rogu, i wymusza `play()` w `mounted()`. My robimy to samo
w duchu, ale z koncertem Post Malone Tiny Desk (patrz `09-RADIO.md`).

## C. DRUGA REFERENCJA: POST MALONE TINY DESK

`https://youtu.be/oCcks-fwq2c` - koncert z serii NPR Tiny Desk. ID filmu: `oCcks-fwq2c`.
Rola w projekcie: **to jest ścieżka dźwiękowa strony**, odpowiednik `music.mp3`
z referencji. Nie analizujemy go wizualnie, nie kopiujemy estetyki NPR. Kontrakt
techniczny w `09-RADIO.md`.

## D. ODBIORCA: ALEKSANDRA (jedna osoba, nie „użytkownik")

Strony używa **wyłącznie Aleksandra**. To nie jest produkt, to jest żart zrobiony
dla jednej konkretnej osoby. Konsekwencje, obowiązujące w każdym pliku copy:

- **Zero form bezosobowych.** Nie „Kandydat proszony jest o", tylko „Aleksandro,
  Komisja prosi Cię o". Nie „Wypełniono niegodnie", tylko „Aleksandro, to nie jest
  adres e-mail".
- Zwrot grzecznościowy: **wołacz „Aleksandro"** albo drugą osobą liczby pojedynczej.
  Formularze zwracają się do niej bezpośrednio.
- Zero wariantów językowych, zero i18n, zero „dla wszystkich kandydatów".
- Komisja jest pompatyczna, ale mówi DO NIEJ. Napięcie między urzędowym tonem
  a imieniem w wołaczu jest tu żartem, nie błędem.

## E. TWARDE ZASADY (łamanie = issue niezaliczone)

Numeracja Z1-Z18. Każda zasada ma przykład złamania, żeby nie było wątpliwości.

**Z1. Zakaz wyśrodkowanej kropki `·` jako ozdobnika między słowami.**
Złamanie: `ETAP 1 · EGZAMIN`. Poprawnie: `ETAP 1 - EGZAMIN`.

**Z2. Zakaz długiego myślnika `—` i półpauzy `–` w copy i UI.** Dotyczy też tekstu
wracającego z modelu AI (sanitizer w `/api/ocena` zostaje z v1). Złamanie:
`Komisja obraduje — proszę czekać`. Poprawnie: `Komisja obraduje, proszę czekać`.

**Z3. Kolory i rozmiary czcionek WYŁĄCZNIE przez tokeny z `app/tokens.css`.**
Wyjątki: `app/vendor/**` oraz wnętrze `url("data:...")`. Złamanie: `color: #ff00ff`
w komponencie. Poprawnie: `color: var(--jad)`.

**Z4. Zero emoji w UI.** Emoji wolno wyłącznie w polu `emojiZrodlowe` danych quizu.
Charakter robią GIF-y, nie emoji. Złamanie: `<h2>Etap 1 🚀</h2>`.

**Z5. Zakaz lewego brandowego paska akcentu (`border-left`) na calloutach, cytatach
i pillach.** To sygnatura generycznego szablonu dokumentacji. Złamanie:
`.uwaga { border-left: 4px solid var(--jad); }`. Poprawnie: pełna ramka `border: 3px
outset` albo tło kafelkowe.

**Z6. ZAKAZ PRZEKRZYWIANIA. Żadnych `rotate()`, `skew()`, `rotate3d()` ani
`transform: rotate` na treści, nagłówkach, kartach, obrazkach i pieczątkach.**
Wszystko stoi pod kątem prostym. Dozwolone wyjątki, wyczerpująca lista:
(a) `scaleX(-1)` do lustrzanego odbicia GIF-a w przeciwległym rogu (wzorzec ROGI z B3);
(b) obrót wewnątrz EKRANU ŁADOWANIA 3D (`04-SILNIK-SCENY.md` sekcja F) - to jedyne
miejsce, gdzie obrót jest zamówiony wprost;
(c) `scaleY(-1)` w odbiciu-lustrze wody, jeśli powstanie.
Złamanie: pieczątka wbijana pod kątem 12 stopni, przekrzywiony nagłówek, karta
z `rotate(-2deg)` „dla luzu".

**Z7. Assety graficzne to PLIKI w `public/assets/`, nie kod.** Odwrotność zasady
z pakietu v1 i główny powód tej przebudowy. Nagłówki sekcji, stwory w rogach, paski,
kursor - wszystko to gotowe pliki GIF/PNG. Rysowanie SVG od zera jest dozwolone tylko
tam, gdzie plik nie istnieje i `03-BIBLIOTEKA-ASSETOW.md` mówi to wprost.

**Z8. Gęstość, nie oszczędność.** Każdy pełnoekranowy widok ma **minimum 6 animowanych
elementów** (GIF-y, `<marquee>`, migające bloki), z czego minimum 2 w rogach i minimum
1 pas na całą szerokość. Widok z trzema elementami i dużą pustą przestrzenią jest
złamaniem zasady, nawet jeśli „wygląda lepiej".

**Z9. Każda strona ma własny kafel tła.** Kafel to plik PNG/GIF powtarzany przez
`background-repeat: repeat`, BEZ `background-size`, w oryginalnej rozdzielczości.
Złamanie: `background-size: cover` na kaflu, gradient CSS zamiast kafla.

**Z10. Fokus klawiaturą musi być widoczny na każdym elemencie interaktywnym.**
`:focus-visible` daje `outline: 3px dashed var(--fokus); outline-offset: 2px`.
Zakaz `outline: none` bez zamiennika. Kicz nie zwalnia z dostępności.

**Z11. `prefers-reduced-motion: reduce` zatrzymuje ruch.** Animacje CSS dostają
`animation-play-state: paused`, a animowane GIF-y są podmieniane na statyczną klatkę
(mechanizm w `04-SILNIK-SCENY.md` sekcja G). Wyjątek: nic. Nawet napis płonący.

**Z12. Sekrety wyłącznie w `.env.local` i w env Vercela.** `OPENROUTER_API_KEY`
i `BLOB_READ_WRITE_TOKEN` nie mogą pojawić się w kodzie, commicie, promptcie workera
ani w czacie. Złamanie: `const key = "sk-or-..."`.

**Z13. Walidacja na granicy zaufania po stronie serwera, zawsze.** Route API waliduje
każde pole, niezależnie od walidacji w formularzu. Zostaje z v1 bez zmian.

**Z14. Zero bibliotek runtime poza `next`, `react`, `react-dom`, `@vercel/blob`.**
Żadnych bibliotek animacji, UI, formularzy, 3D. Walidator `scripts/lint-tokens.mjs`
pilnuje allowlisty. Efekt 3D robimy CSS-owymi transformacjami, nie `three.js`.

**Z15. Dźwięk startuje TYLKO po geście Aleksandry.** Zero autoplay z dźwiękiem.
Stan włączenia zapamiętany w `localStorage` pod kluczem `jwp.audio`.

**Z16. Copy mówi do Aleksandry, ale NIE wszędzie po imieniu** (sekcja D, wersja
poprawiona po odbiorze 2026-09-02). Domyślny rejestr to drugia osoba liczby pojedynczej
(„Twoja odpowiedź", „potwierdzam"), a wołacz `Aleksandro` jest **przyprawą, nie regułą**:
za dużo imienia brzmi jak mail marketingowy, nie jak żart. Wiążący rozkład:

| Miejsce | Zwrot |
|---|---|
| treść pytania etapu 1 (obie części) | BEZOSOBOWO, zero imienia |
| pytania quizu | dokładnie 3 z 15 z imieniem: jedno `Aleksandro`, jedno `Rutkowska`, jedno `Mario Magdaleno`; pozostałe 12 bezosobowo |
| klauzula zgody w etapie 3 | `Potwierdzam, że rozumiem powagę sytuacji.` bez imienia |
| etykiety pól, przyciski, komunikaty błędów | drugą osobą, imię dozwolone oszczędnie |
| pasy-gońce | wg treści z `05` A i `06` C, imię dozwolone |

Złamanie: „Kandydat proszony jest o wypełnienie druku" (forma bezosobowa urzędowa
zamiast drugiej osoby) ORAZ wstawienie `Aleksandro` do treści pytania egzaminacyjnego.

**Z17. Zakaz `transition: all`.** Zawsze lista konkretnych właściwości.

**Z18. Budżet wagi widoku: suma assetów pobieranych na jednym ekranie <= 2,5 MB.**
Referencja ma pliki po 1,6 MB (`frontend1.gif`) - my takich nie bierzemy bez
przepuszczenia przez optymalizację. Metoda pomiaru w `03-BIBLIOTEKA-ASSETOW.md`.

## F. SŁOWNIK POJĘĆ (używaj TYLKO tych nazw w całym pakiecie i w kodzie)

| Nazwa | Znaczenie |
|---|---|
| `kafel` | plik graficzny powtarzany jako tło sekcji przez `background-repeat: repeat` |
| `stwór-rogowy` | animowany GIF przyklejony do rogu widoku, wzorzec ROGI z B3 |
| `pas` | wąski GIF rozciągnięty na 100% szerokości jako tło diva o stałej wysokości |
| `napis-obrazek` | nagłówek będący plikiem GIF z tekstem, a nie tekstem w `<h1>` |
| `kursor-komisji` | animowany GIF ustawiony jako `cursor` całej strony |
| `pas-goniec` | element `<marquee>` albo jego CSS-owy odpowiednik, przewijający tekst |
| `ekran-ladowania` | pełnoekranowy ekran startowy z animacją 3D, sekcja F w `04` |
| `plonacy-napis` | napis `EGZAMIN JASIU` z nałożonym ogniem, sekcja E w `04` |
| `radio-tiny-desk` | odtwarzacz koncertu Post Malone, kontrakt w `09` |
| `druk` | dowolny formularz w tym projekcie |
| `werdykt` | wynik etapu zapisany w `sessionStorage` |
| `komisja` | narrator strony, pisze urzędowo, ale zwraca się do Aleksandry po imieniu |
| `pass-o-metr` | pasek postępu przez 3 etapy, element wspólny w shellu |
| `biblioteka-assetow` | katalog `public/assets/` plus manifest `data/assety.json` |

## G. ANTY-SPEC GLOBALNA (czego NIE robić - to chroni charakter mocniej niż nakazy)

1. **Zero „czystego, minimalistycznego retro".** Jeśli wynik wygląda jak nowoczesna
   strona z pikselową czcionką, jest do przerobienia. Punkt odniesienia to wysypisko
   GIF-ów, nie plakat w stylu vintage.
2. **Zero hero z jednym nagłówkiem i dwoma przyciskami obok siebie.**
3. **Zero kart w siatce 3 na wiersz z jednakowymi cieniami.**
4. **Zero `border-radius` powyżej 4 px.** Rogi są ostre albo `outset`/`ridge`.
5. **Zero cieni typu `box-shadow: 0 10px 30px rgba(0,0,0,.1)`.** Dozwolone tylko
   twarde obramowania `outset`, `ridge`, `groove` i cień 2 px bez rozmycia.
6. **Zero animacji `ease-in-out` na ozdobnikach.** Ruch dekoracyjny jest skokowy
   (`steps()`) albo pochodzi z GIF-a.
7. **Zero pustej przestrzeni „dla oddechu"** - patrz Z8.
8. **Zero przeciągania myszą jako mechaniki zadania** (usunięte na wyraźne życzenie,
   szczegóły w `06-EGZAMIN.md`).
9. **Zero scroll-hijackingu i animacji wyzwalanych scrollem.** Strona ma się dać
   przewinąć normalnie.
10. **Zero tekstu na tle bez podkładu.** Kafle są kontrastowe, więc każdy blok tekstu
    ma własne tło (biały/czarny prostokąt albo ramka `outset`), inaczej jest nieczytelny.
    To jedyny punkt, w którym referencja jest gorsza od nas i świadomie ją poprawiamy.
