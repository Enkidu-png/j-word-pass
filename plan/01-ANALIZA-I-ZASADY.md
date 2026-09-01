# 01 - ANALIZA REFERENCJI, TWARDE ZASADY, SŁOWNIK

Ten plik jest źródłem charakteru projektu. Każdy inny plik pakietu odwołuje się do
nazw i zasad zdefiniowanych tutaj. Złamanie zasady z sekcji B = issue niezaliczone.

---

## A. ANALIZA REFERENCJI (co dokładnie zbadano i co z tego bierzemy)

### A1. `SaraVieira/make-frontend-shit-again` (kod przeczytany z repo, gałąź `master`)

Zbadane pliki: `layouts/default.vue`, `pages/_lang/index.vue`, `components/Page1..5.vue`,
`nuxt.config.js`, `package.json`, drzewo `assets/` (46 plików, w tym 30 GIF-ów).

Ustalenia faktograficzne (nie interpretacje):

| Co | Jak zrobione w oryginale | Plik |
|---|---|---|
| Ruch na stronie | Wyłącznie animowane GIF-y i `<marquee behavior="alternate">`. **Zero animacji CSS, zero JS animacji.** | `Page1.vue`, `Page3.vue` |
| Kursor | `cursor: url("../assets/cursor.gif"), auto` na `html` | `layouts/default.vue` |
| Tło | Kafelkowany bitmapowy `background-image` na `html`, **inny bitmapowy kafelek per sekcja** (`bg.png`, `bg-1.png`, `bg-3.png`, `bg4.png`, `bg5.png`) | `layouts/default.vue`, `Page3.vue` |
| Struktura strony | Jedna długa strona, sekcje `.container` po `min-height: 100vh`, scroll natywny. Zero routingu między sekcjami. | `pages/_lang/index.vue` |
| Dźwięk | `<audio autoplay controls>` z coverem Titanica w wersji techno, dodatkowo `document.querySelector("audio").play()` w `mounted()` | `pages/_lang/index.vue` |
| Wrogość wobec użytkownika | `contextmenu` blokowany, `alert("Right click is disabled!!!")` | `layouts/default.vue` |
| Ozdobniki krawędzi | Paski przyklejone do góry/dołu viewportu wypełnione kafelkiem GIF (`under.gif`, `baloons.gif`) | `Page1.vue`, `Page3.vue` |
| Wiarygodność epoki | Zewnętrzny licznik odwiedzin `cutercounter.com`, odznaki `valid-html40.png`, `w3c-css.gif`, `netscape.gif` | `Page1.vue`, `assets/` |
| Typografia | Google Font `Caveat` (odręczny) na WSZYSTKIM, `h1` = 60-78 px, `p` = 18 px, brak skali | `nuxt.config.js`, `layouts/default.vue` |
| Kolor linku | `a { color: lightblue }` (słowo kluczowe CSS, nie token) | `layouts/default.vue` |

**Wniosek metodyczny (to jest sedno stylu):** wrażenie „strona żyje" nie bierze się
z jednej dużej animacji, tylko z **wielu małych, niezależnych, zapętlonych ruchów, które
nie są ze sobą zsynchronizowane i nie reagują na użytkownika**. GIF nie ma easingu,
nie ma stanu, nie ma `transition`. Ma stałą liczbę klatek i skacze między nimi.

**Czego NIE bierzemy:** binarnych GIF-ów (nie mamy assetów i nie będziemy ich generować),
`autoplay` dźwięku bez zgody, blokady prawego przycisku, zewnętrznych liczników.

**Co bierzemy i jak to zastępujemy:** patrz `03-SILNIK-ANIMACJI.md`, motyw `gif-less`.

### A2. `cameronsworld.net`

Kolaż z archiwum GeoCities. Kluczowe obserwacje: layout tabelaryczny, zagnieżdżone ramki,
skrajnie gęste upakowanie (brak oddechu jako środek wyrazu), kolory sąsiadujące bez logiki
(neon na neonie), Times New Roman, tekst rozstrzelony literami pionowo („M Y I N T E R E S T S"),
webringi (Prev / Next / Random / List), „always under construction", zalecenia typu
„best viewed at 800x600".

Co bierzemy: **gęstość i kolaż** (element może nachodzić na element), pionowe rozstrzelenie
liter jako motyw nagłówka pobocznego, retoryka „pod nadzorem" / „ta strona jest zawsze
w budowie", nawigacja typu webring w stopce.

### A3. `dinostomatopie.com`

Strona lokalnej pizzerii utrzymana w stanie z 2000 roku. Kluczowe: nawigacja rozsypana
po treści jako obrazkowe przyciski („Click here for..."), narracja pierwszoosobowa zamiast
copy marketingowego, losowe pogrubienia i kursywy w środku zdania, niekonsekwentna
wielkość liter („Seattle's", „SEattle"), licznik odwiedzin, „last updated 03/01/2000",
podpis autora strony („website design by Sammy").

Co bierzemy: **głos** - pierwsza osoba, konkret, brak korporacyjnego copy; losowe
pogrubienia w środku zdania; podpis autora i data ostatniej aktualizacji w stopce;
przyciski akcji opisane zdaniem, nie czasownikiem („Kliknij tutaj żeby oddać dowód
komisji"), nigdy „Wyślij".

### A4. Synteza - czym jest J-WORD PASS

Trzy referencje dają trzy różne rzeczy: **MFSA** daje mechanikę ruchu, **Cameron's World**
daje gęstość i kolaż, **Dino's Tomato Pie** daje głos. Sklejamy je klamrą fabularną:

> J-WORD PASS to system egzaminacyjny Międzygalaktycznej Komisji Kwalifikacyjnej,
> postawiony w 1998 roku i od tamtej pory nietknięty, mimo że nadal wydaje przepustki.
> Kandydat przechodzi trzy etapy: EGZAMIN Z FIZYKI, QUIZ O WSZYSTKIM I O NICZYM,
> PRÓBA OGNIA. Na końcu dostaje zadanie. Zadanie jest tajne.

Cała biurokracja jest udawana i przesadzona: pieczątki, numery formularzy (`F-7/BIS`),
paski postępu, które cofają się bez powodu, komisja z trzech głów, klauzule o karze śmierci
za udostępnianie zadania. Kicz jest **konsekwentny i celowy**, nie przypadkowy: brzydota ma
własne reguły i tych reguł się trzymamy.

---

## B. TWARDE ZASADY (numerowane, egzekwowalne)

Łamanie = issue niezaliczone, PR odrzucony.

**Z1. Zero wyśrodkowanych kropek `·` jako ozdobnika między słowami.**
Złamanie: `EGZAMIN · KROK 1 · 2026`. Zamiast tego: `EGZAMIN /// KROK 1 /// 2026`
albo tabela, albo osobne elementy.

**Z2. Zero długich myślników `—` w copy i UI.** Dozwolony wyłącznie zwykły dywiz `-`.
Dotyczy też tekstów generowanych przez AI: prompt systemowy zawiera ten zakaz, a odpowiedź
przechodzi przez `sanitizeDash()` (patrz `08-AI-KOMISJA.md`).

**Z3. Style wyłącznie przez tokeny CSS.** W żadnym pliku komponentu nie może wystąpić
literał koloru (`#ff00ff`, `rgb(...)`, `hotpink`) ani literał rozmiaru czcionki.
Wolno: `var(--kolor-alarm)`, `var(--font-krzyk)`. Wyjątki: (a) plik `app/tokens.css`;
(b) wartości geometryczne bez znaczenia semantycznego (`translateX(3px)`, `0`, `100%`);
(c) wnętrze `url("data:image/svg+xml,...")` (kursor, favicon) - tam `var()` nie działa,
więc literał dozwolony pod warunkiem, że ta sama wartość istnieje jako token i jest
wskazana w komentarzu obok; walidator pomija wnętrza `data:` URI; (d) pliki
`app/vendor/**` (polityka kopiowania, 02 sekcja F). Weryfikacja: `pnpm run check` (skrypt w F0).

**Z4. Zero emoji w UI.** Emoji z treści quizu dostarczonej przez użytkownika NIE trafiają
do interfejsu jako znaki Unicode. Każda kategoria quizu ma zamiast tego `signature`
(motyw wizualny CSS/SVG) opisany w `06-QUIZ.md`. Emoji wolno zostawić wyłącznie
w `data/quiz.json` jako pole `emojiZrodlowe` (dokumentacja pochodzenia, nierenderowane).

**Z5. Zero lewego brandowego paska akcentu (`border-left`) na calloutach, cytatach, pillach.**
Ramka ma być pełna, podwójna (`border-style: double`), wytłoczona (`outset`/`inset`)
albo żadna. `border-left` solo to sygnatura generycznego szablonu.

**Z6. Zero bibliotek do animacji, UI i formularzy.** Zakazane: framer-motion, gsap,
tailwind, shadcn, react-hook-form, zod-form, lottie, three.js, dowolna biblioteka
komponentów. Ruch robimy CSS-em i `requestAnimationFrame`. Dozwolone zależności runtime:
`next`, `react`, `react-dom`, `@vercel/blob` (serwer) i nic więcej bez wpisu
w `DECISIONS.md` z uzasadnieniem. WYJĄTEK (nie łamie tej zasady): vendoring PLIKÓW
CSS/SVG na licencji MIT/ISC/BSD/CC0 do `app/vendor/` wg plan/02 sekcja F - kopiujemy
pliki, nigdy pakiety npm; pliki binarne (fonty, obrazy) zakazane także w vendor.
(Uzasadnienie: styl polega na ręcznej robocie; biblioteka animacji natychmiast wprowadza
easing „produktowy", który zabija efekt.)

**Z7. Każdy ruch dekoracyjny jest skokowy.** Animacje dekoracyjne (motyw `gif-less`)
używają wyłącznie `animation-timing-function: steps(N)` z N od 2 do 8 i czasu trwania
z zakresu 300-1400 ms. `ease`, `ease-in-out`, `cubic-bezier` są zarezerwowane WYŁĄCZNIE
dla animacji sterowanych akcją użytkownika (przejścia etapów, otwieranie listu) - patrz Z8.

**Z8. Ruch ma dwie klasy i nie wolno ich mieszać.**
`dekoracja` = zapętlona, skokowa, nieinteraktywna, nigdy nie blokuje wejścia.
`ceremonia` = jednorazowa, wyzwolona kliknięciem, może zająć ekran, ma zdefiniowany czas
całkowity i zawsze da się ją pominąć (`Esc` lub przycisk `POMIŃ CEREMONIĘ`).
Element nie może być jednocześnie dekoracją i ceremonią.

**Z9. Żadna ceremonia nie trwa dłużej niż 9 s bez możliwości pominięcia** i każda
kończy się stanem, w którym fokus klawiatury jest ustawiony na sensownym elemencie
(pierwszy nagłówek nowego etapu albo pierwszy przycisk).

**Z10. `prefers-reduced-motion: reduce` wyłącza WSZYSTKIE ruchy klasy `dekoracja`
i skraca każdą `ceremonię` do jednego kroku ≤ 400 ms.** Treść i punktacja muszą
pozostać w pełni dostępne. Weryfikacja: Playwright `page.emulateMedia({reducedMotion:"reduce"})` plus screenshot.

**Z11. Zero utraty danych kandydata przy przeładowaniu.** Odpowiedzi egzaminu i quizu
zapisują się w `sessionStorage` pod kluczem `jwp.v1` przy każdej zmianie pola
(debounce 400 ms). Przeładowanie strony w połowie quizu przywraca zaznaczenia.

**Z12. Klucz OpenRouter nigdy nie trafia do klienta ani do repozytorium.** Wywołania AI
idą wyłącznie przez Route Handler po stronie serwera. W kodzie klienta nie może wystąpić
string `OPENROUTER`. Weryfikacja: `grep -r OPENROUTER app/ --include=*.tsx` = 0 trafień
oraz `grep -r "sk-or-" . --exclude-dir=.git --exclude=.env.local` = 0 trafień.

**Z13. Copy jest po polsku, pisane pierwszą osobą Komisji, z pełnymi znakami
diakrytycznymi.** Zakaz „ą" zapisanego jako „a". Zakaz korporacyjnych czasowników:
`Wyślij`, `Dalej`, `Rozpocznij`, `Zatwierdź`. Każdy przycisk to zdanie
(`ODDAJĘ DOWÓD KOMISJI`, `JESTEM GOTOWA NA PRÓBĘ OGNIA`).

**Z14. Zero paska sukcesu bez pieczątki.** Każdy komunikat o wyniku musi być osadzony
w motywie `pieczatka` albo `formularz-F7`, nigdy jako zwykły zielony alert.

**Z15. Zero scroll-hijackingu i zero blokowania natywnych zachowań przeglądarki.**
Prawy przycisk działa. `Ctrl+F` działa. Zaznaczanie tekstu działa. Kicz robimy warstwą
wizualną, nie odbieraniem kontroli. (Świadome odejście od referencji A1.)

**Z16. Dźwięk nigdy nie startuje sam.** Ścieżka dźwiękowa jest wyłączona domyślnie,
włącza ją wyłącznie kliknięcie w motyw `radio-komisji`. Stan zapamiętywany w
`localStorage` pod `jwp.audio`.

---

## C. SŁOWNIK POJĘĆ (nazwy obowiązujące w całym pakiecie i w kodzie)

Nazwy w kodzie: klasy CSS i komponenty używają dokładnie tych nazw w formie
kebab-case (CSS) lub PascalCase (React). Zakaz synonimów.

| Nazwa | Co to jest | Gdzie zdefiniowane |
|---|---|---|
| `gif-less` | Technika ruchu: zapętlona animacja CSS `steps(N)` udająca animowany GIF z epoki. Podstawowy budulec dekoracji. | `03` |
| `kafel-tla` | Kafelkowane tło sekcji generowane proceduralnie (`repeating-linear-gradient` + `radial-gradient`), inne dla każdego z 5 wariantów. | `03` |
| `pasek-krawedzi` | Poziomy pas 40-48 px przyklejony do górnej lub dolnej krawędzi viewportu, wypełniony kafelkiem w ruchu. | `03` |
| `kursor-komisji` | Własny kursor (SVG data-URI, 32x32) plus `kometa-kursora`. | `04` |
| `kometa-kursora` | Ślad z 8 kwadratów podążający za kursorem z opóźnieniem klatkowym. Wyłączany przez Z10 i na dotyku. | `03` |
| `pass-o-metr` | Globalny wskaźnik postępu przez trzy etapy, stylizowany na pasek postępu z Windows 95, który potrafi się cofnąć. | `04` |
| `formularz-F7` | Wizualny motyw „druku urzędowego": ramka `double`, nagłówek z numerem druku, pola z podkreśleniem kropkowanym. | `04` |
| `pieczatka` | Okrągła lub owalna pieczęć nakładana z obrotem i skokiem skali, z tekstem po łuku. Każdy wynik dostaje pieczątkę. | `03`, `05` |
| `komisja` | Trzy „głowy" egzaminatorów (SVG, styl clip-art), animowane niezależnie, wypowiadające kwestie w dymkach. | `05` |
| `karta-dowodowa` | Przeciągalna karta z danymi wejściowymi zadania z fizyki (masa słonia, prędkość zebry itd.). | `05` |
| `maszyna-prawdy` | Ceremonia sprawdzania quizu: przewracanie kart pytań i naliczanie punktów na liczniku mechanicznym. | `06` |
| `licznik-mechaniczny` | Wyświetlacz liczb z bębnami przewijanymi pionowo `steps()`. | `03`, `06` |
| `signature` | Unikalna interakcja przypisana do jednego pytania quizu. Każde z 15 pytań ma inną. | `06` |
| `proba-ognia` | Trzeci etap: formularz plus ceremonia ognia. | `07` |
| `list-w-butelce` | Finalna ceremonia: butelka dryfująca po morzu, po kliknięciu rozwija pergamin z komunikatem końcowym. | `07` |
| `radio-komisji` | Widget dźwięku (wyłączony domyślnie, Z16). | `04` |
| `webring-stopki` | Stopka z nawigacją Prev / Next / Random / Lista i datą ostatniej aktualizacji. | `04` |
| `ceremonia` / `dekoracja` | Dwie klasy ruchu, patrz Z8. | `03` |

---

## D. ANTY-SPEC GLOBALNA (czego nie robimy nigdzie)

1. Nie robimy hero z wyśrodkowanym nagłówkiem, podtytułem i dwoma przyciskami obok siebie.
2. Nie robimy siatki kart 3 w rzędzie z ikoną, tytułem i akapitem.
3. Nie robimy `box-shadow: 0 1px 3px rgba(0,0,0,.1)` ani żadnego miękkiego cienia
   produktowego. Cień jest twardy, przesunięty o całkowitą liczbę pikseli, bez rozmycia.
4. Nie robimy `border-radius` większego niż 0 nigdzie poza motywami `pieczatka`
   i `list-w-butelce`. Świat jest kanciasty.
5. Nie robimy gradientów pastelowych ani „glassmorphism". Gradient jest dozwolony wyłącznie
   jako kafelek tła w jaskrawych kolorach albo jako `chrom` w nagłówku.
6. Nie robimy scroll-triggered fade-in-up. Element albo jest, albo wskakuje skokowo.
7. Nie robimy dark mode. Strona ma jeden wygląd i jest nim zawsze.
   (`prefers-color-scheme` ignorujemy świadomie; to nie jest produkt, to jest artefakt.)
8. Nie tłumaczymy interfejsu. Tylko polski.
