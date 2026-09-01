# 04 - SILNIK SCENY (system przekrojowy, budowany test-first z playgroundem)

Wszystkie powierzchnie (`05`, `06`, `07`, `08`) używają WYŁĄCZNIE tych komponentów.
Zakaz pisania animacji ad hoc w widoku. Playground: `/dev/scena`, wyłączony
w produkcji (404).

## A. STRUKTURA MODUŁU

```
components/scena/
  Ozdoba.tsx         - jeden GIF z manifestu, obsluga reduced-motion (sekcja G)
  StworRogowy.tsx    - Ozdoba przyklejona do rogu, wzorzec ROGI (sekcja B)
  Pas.tsx            - wasky GIF na 100% szerokosci (sekcja C)
  NapisObrazek.tsx   - naglowek jako SVG z chromem (sekcja D)
  PlonacyNapis.tsx   - NapisObrazek + ogien (sekcja E)
  EkranLadowania.tsx - pelnoekranowy ekran startowy 3D (sekcja F)
  PasGoniec.tsx      - przewijajacy sie tekst (sekcja H)
lib/assety.ts        - czytanie manifestu, typ Pozycja, funkcja assetPo(id)
app/style/scena.css     - style wszystkich powyzszych POZA ekranem ladowania
app/style/ladowanie.css - WYLACZNIE style EkranLadowania; osobny plik, bo to
                          jedyne miejsce z dozwolonym obrotem (Z6b), a walidator
                          z F0-02 trzyma allowliste rotacji wlasnie na tej sciezce
```

## B. STWÓR ROGOWY (wzorzec ROGI)

Interfejs: `<StworRogowy id="stwor-delfin" rog="lewy-dol" lustro={false} />`.
`rog`: `lewy-gora` | `prawy-gora` | `lewy-dol` | `prawy-dol`.

```css
.stwor-rogowy {
  position: absolute;
  z-index: 2;
  pointer-events: none;   /* ozdoba nie lapie klikniec */
}
.stwor-rogowy--lewy-dol  { left: 0;  bottom: 0; }
.stwor-rogowy--prawy-dol { right: 0; bottom: 0; }
.stwor-rogowy--lewy-gora { left: 0;  top: 0; }
.stwor-rogowy--prawy-gora{ right: 0; top: 0; }
.stwor-rogowy--lustro    { transform: scaleX(-1); }  /* jedyny dozwolony transform (Z6a) */
```

Reguła użycia: **ta sama pozycja w dwóch przeciwległych rogach, prawa z `--lustro`**.
To dokładnie wzorzec z referencji (hotdog, 37.gif, dolphin).

Warianty brzegowe: poniżej 390 px szerokości stwory dolne mają `max-width: 22vw`,
żeby nie zasłaniały treści. Stwory NIGDY nie leżą nad elementem klikalnym - test
`elementFromPoint` na środku każdego przycisku, jak w v1 (`tests/f7-05.spec.ts`).

## C. PAS

Interfejs: `<Pas id="pas-budowa" pozycja="dol" wysokosc={45} />`.

```css
.pas {
  position: absolute; left: 0; width: 100%;
  background-repeat: repeat-x;
  background-position: center;
  z-index: 3;
}
.pas--gora { top: 0; }
.pas--dol  { bottom: 0; }
```

Wysokość z propa jako `height` inline (jedyny dozwolony styl inline w projekcie,
bo wartość pochodzi z manifestu). Kolor tła pasa: brak, GIF ma własne.

## D. NAPIS-OBRAZEK

Generowany SVG, bo nie ma go w archiwum (patrz `03` B4). Interfejs:
`<NapisObrazek tekst="EGZAMIN JASIU" wariant="chrom" />`.

Algorytm rysowania (wariant `chrom`):

```
1. viewBox = "0 0 <10*len(tekst)> 120", preserveAspectRatio="xMidYMid meet"
2. <defs><linearGradient id="chrom" x1="0" y1="0" x2="0" y2="1">
     stop 0%   var(--chrom-1)
     stop 35%  var(--chrom-2)
     stop 50%  var(--chrom-3)
     stop 51%  var(--chrom-4)
     stop 70%  var(--chrom-5)
     stop 100% var(--chrom-6)
   (tokeny z plan/02 D - Z3 nie dopuszcza surowych hexow w components/**)
   </linearGradient></defs>
3. <text> font-family: var(--font-czytany), font-weight 900,
   font-size 96, letter-spacing 2, fill url(#chrom),
   stroke var(--tusz), stroke-width 3, paint-order stroke
4. x = 50% , y = 96 , text-anchor="middle" , dominant-baseline="alphabetic"
5. Zero rotacji, zero skew (Z6). Napis stoi prosto.
```

Wariant `neon`: ten sam kształt, `fill: var(--jad)`, `stroke: var(--magenta)`,
plus `filter: drop-shadow(0 0 6px var(--jad))` pulsujący `steps(2)` co 600 ms.

**Dostępność:** SVG ma `role="img"` i `aria-label={tekst}`. Sam tekst jest też
w `<title>`, żeby dało się go zaznaczyć czytnikiem.

## E. PŁONĄCY NAPIS (`EGZAMIN JASIU`, zamówiony wprost)

Kompozycja trzech warstw, wszystkie stoją prosto (Z6):

```
warstwa 3 (przod):  <Ozdoba id="ogien"> x N, N = ceil(szerokosc_napisu / 60),
                    rozstawione co 60 px wzdluz DOLNEJ krawedzi napisu,
                    kazdy z animation-delay = i * 90 ms (desynchronizacja),
                    mix-blend-mode: screen
warstwa 2 (napis):  <NapisObrazek tekst="EGZAMIN JASIU" wariant="chrom">
                    z filtrem: drop-shadow(0 0 12px var(--zar))
                    animacja "zar": opacity 1 -> .82 -> 1, 900 ms, steps(3), infinite
warstwa 1 (poswiata): div o wysokosci 40% napisu, przyklejony do dolu,
                    background: radial-gradient(ellipse at 50% 100%,
                      var(--zar-poswiata) 0%, var(--zar-poswiata-zero) 70%)
                    animacja "oddech": transform: scaleY(1) -> scaleY(1.12) -> scaleY(1),
                    1300 ms, steps(4), infinite
```

Parametry wiążące: ogień startuje 12 px poniżej linii bazowej napisu; łączna
wysokość kompozycji = wysokość napisu + 60 px; `will-change: opacity` tylko na
warstwie 2.

`prefers-reduced-motion`: warstwy 1 i 3 znikają (`display: none`), zostaje sam
chromowy napis. Bez wyjątków (Z11).

## F. EKRAN ŁADOWANIA 3D (zamówiony wprost)

Pełnoekranowa nakładka pokazywana przy pierwszym wejściu na bramę oraz przy przejściu
między etapami. **Jedyne miejsce w projekcie, gdzie obrót jest dozwolony (Z6b).**

Geometria: sześcian CSS 3D, 160x160x160 px, każda ściana to inna `Ozdoba`
(statek, planeta, ogień, dyskietka, kula ziemska, gwiazdka).

```css
.ladowanie-scena { perspective: 600px; }
.ladowanie-szescian {
  width: 160px; height: 160px;
  position: relative;
  transform-style: preserve-3d;
  animation: obrot-szescianu 2400ms steps(12) infinite;
}
@keyframes obrot-szescianu {
  from { transform: rotateX(-18deg) rotateY(0deg); }
  to   { transform: rotateX(-18deg) rotateY(360deg); }
}
.ladowanie-sciana { position: absolute; width: 160px; height: 160px;
  border: 3px ridge var(--chrom-a); background: var(--kosmos); }
/* sciany: translateZ(80px), rotateY(90deg) translateZ(80px), ... standardowy szescian */
```

`steps(12)` zamiast płynnego obrotu - ruch ma być skokowy jak w GIF-ie (Z-anty-spec 6).

Pod sześcianem: `PasGoniec` z tekstem `KOMISJA PRZYGOTOWUJE AKTA DLA ALEKSANDRY`
oraz pasek postępu zbudowany z powtarzanego znaku `#` (10 pozycji, dopełniane co
`czas_calkowity / 10`).

**Kontrakt czasu - DWA WARIANTY, nie mylić ich:**

| Wariant | Gdzie | Minimum | Maksimum | Warunek zniknięcia |
|---|---|---|---|---|
| `start` | wejście na bramę, przejścia między etapami | 1200 ms | 2600 ms | minęło 1200 ms ORAZ `document.fonts.ready` i obrazki pierwszego ekranu mają `complete === true`; twardy timeout 2600 ms zdejmuje niezależnie od stanu |
| `narada` | ceremonia oceny egzaminu (`06` C) | 3500 ms | 16000 ms | minęło 3500 ms ORAZ przyszła odpowiedź z `/api/ocena`; twardy timeout 16000 ms pokazuje werdykt awaryjny |

Wariant `narada` dokłada dymki Komisji i NIE ma limitu 2600 ms - ocena przez model
trwa dłużej niż ładowanie strony. Mylenie tych dwóch kontraktów było wychwycone
w krytyce planu jako sprzeczność, więc tabela jest wiążąca.

**Klawiatura:** `Escape` zdejmuje ekran natychmiast. Fokus po zdjęciu ląduje na `h1`
strony docelowej.

`prefers-reduced-motion`: sześcian nie obraca się, pokazuje jedną ścianę, ekran znika
po 400 ms.

## G. REDUCED MOTION DLA GIF-ÓW (mechanizm)

GIF-a nie zatrzyma CSS. Komponent `Ozdoba`:

```
1. Renderuje <img src={pozycja.plik}> z SSR (bez JS dziala normalnie, GIF sie rusza).
2. useEffect: mql = matchMedia("(prefers-reduced-motion: reduce)")
3. Jesli mql.matches -> setSrc(pozycja["klatka-statyczna"])
4. Nasluchuje mql.change, zeby zmiana ustawienia w locie tez dzialala.
```

Test (Playwright): `page.emulateMedia({ reducedMotion: 'reduce' })`, potem assercja,
że każdy `img[data-ozdoba]` ma `src` kończący się na `.png` i zawierający `/statyczne/`.

## H. PAS-GONIEC (przewijający się tekst)

Element `<marquee>` jest przestarzały, ale DZIAŁA i jest sercem tej estetyki.
Decyzja: **używamy CSS-owego odpowiednika**, bo `<marquee>` nie ma kontroli nad
`prefers-reduced-motion` i wywala walidację HTML.

```css
.pas-goniec { overflow: hidden; white-space: nowrap; }
.pas-goniec__tresc {
  display: inline-block;
  padding-left: 100%;
  animation: goniec 12000ms steps(60) infinite;
}
@keyframes goniec { from { transform: translateX(0); } to { transform: translateX(-100%); } }
```

Wariant `odbijany` (odpowiednik `behavior="alternate"`): `animation-direction:
alternate`, `padding-left: 0`, przesunięcie od 0 do `calc(100% - <szerokosc tresci>)`.

`prefers-reduced-motion`: `animation: none`, tekst statyczny, wyśrodkowany.

## I. KURSOR KOMISJI

```css
html { cursor: url("/assets/kursor.gif") 4 2, auto; }
a, button, [role="button"] { cursor: url("/assets/kursor-rece.gif") 8 2, pointer; }
```

Hotspot podany jawnie (`4 2`), inaczej przeglądarka trafia obok. Rozmiar pliku
kursora **maksymalnie 32x32** - większe kursory są w Chrome ignorowane.

**Kursor NIE animuje się** - Chrome i Safari renderują pierwszą klatkę GIF-a
ustawionego jako `cursor`. To ograniczenie przeglądarki, nie błąd implementacji.
Referencja ma dokładnie ten sam efekt. Nie zgłaszać tego jako regresji.

Wariant brzegowy: przy `(pointer: coarse)` (dotyk) kursor nie ma znaczenia, ale
regułę zostawiamy, bo nic nie kosztuje.

## J. TABELA `zdarzenie -> reakcja` DLA SILNIKA

| Zdarzenie | Stwór rogowy | Pas | Napis-obrazek | Ekran ładowania | Pas-goniec |
|---|---|---|---|---|---|
| hover | brak (pointer-events: none) | brak | brak | brak | pauza animacji |
| klik | brak | brak | brak | brak | brak |
| fokus klawiaturą | nie jest fokusowalny | nie jest fokusowalny | nie jest fokusowalny | Escape zdejmuje | nie jest fokusowalny |
| mobile 390 px | `max-width: 22vw` | bez zmian | `font-size` skalowany viewBox-em | sześcian 110 px | prędkość 8000 ms |
| reduced-motion | klatka statyczna | klatka statyczna | bez pulsowania | jedna ściana, 400 ms | tekst statyczny |
| brak JS | GIF się rusza (SSR) | działa | działa | nie pokazuje się wcale | działa |
| stan błędu (brak pliku) | `alt` z manifestu | pusty pas | tekst zapasowy w `<h1>` | pomijany | działa |

## K. ANTY-SPEC SILNIKA

1. Zero `transition: all` (Z17).
2. Zero animacji na `left`/`top`/`width`/`height` - tylko `transform` i `opacity`.
3. Zero `rotate`/`skew` poza sekcją F (Z6).
4. Zero `IntersectionObserver` do wyzwalania animacji scrollem (anty-spec globalna 9).
5. Zero `requestAnimationFrame` w pętli ciągłej. Ruch robią GIF-y i CSS.
6. Zero `background-size: cover` na kaflu (Z9).

## L. BUDŻETY (kryteria akceptacji silnika)

- Zero long tasków powyżej 50 ms w 5 s bezczynności na każdej z 4 stron.
  Pomiar: `PerformanceObserver({type:'longtask'})` przez `page.evaluate`.
- `pnpm build`: first load JS na każdej stronie <= 160 kB.
- Suma assetów obrazkowych na widok <= 2,5 MB (Z18, pomiar w `tests/budzet.spec.ts`).
- Playground `/dev/scena` w produkcji zwraca 404 (`pnpm build && pnpm start`, curl).
