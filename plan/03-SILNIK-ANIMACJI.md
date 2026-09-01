# 03 - SILNIK ANIMACJI: gif-less, ceremonie, playground

System przekrojowy używany przez wszystkie etapy. Budowany test-first z playgroundem
`/dev/animacje` (strona dostępna tylko w dev: `notFound()` gdy `NODE_ENV==="production"`).

## A. DLACZEGO TAK (esencja analizy MFSA z plan/01 A1)

Oryginał animuje WYŁĄCZNIE gotowymi GIF-ami: ruch skokowy, zapętlony, niezsynchronizowany,
obojętny na użytkownika. My nie mamy GIF-ów, więc odtwarzamy ich CHARAKTER czystym CSS:
mało klatek, zero easingu, pętla. To jest motyw `gif-less` i to on odróżnia tę stronę
od „retro szablonu z framer-motion".

## B. `gif-less` - kontrakt techniczny

Każda dekoracja to element z klasą `.gif-less` + modyfikatorem wariantu.
Wspólna baza:

```css
.gif-less { animation-timing-function: steps(var(--klatki, 4), end);
            animation-iteration-count: infinite; }
@media (prefers-reduced-motion: reduce) { .gif-less { animation: none !important; } }
```

ZAPIS WYŁĄCZNIE LONGHANDAMI: klasy `.gif-less--*` ustawiają `animation-name` i
`animation-duration` (plus ewentualnie `animation-direction`); ZAKAZ skrótu
`animation:` w tych klasach - skrót nadpisałby timing-function z bazy na `ease`.

Warianty startowe (biblioteka minimum, wszystkie w `globals.css`, każdy ≤ 15 linii CSS):

| Wariant | Efekt | Parametry startowe |
|---|---|---|
| `.gif-less--blink` | znika/pojawia się (dawny `<blink>`) | `steps(2)`, 700 ms, `visibility` |
| `.gif-less--majtanie` | kołysze się ±12deg wokół górnej krawędzi | `steps(4)`, 900 ms |
| `.gif-less--skok` | podskok o 6 px | `steps(3)`, 500 ms |
| `.gif-less--obrot` | pełny obrót (pieczątki, gwiazdki) | `steps(8)`, 1400 ms |
| `.gif-less--jazda` | przesuw `background-position-x` o pełny kafel (paski krawędzi) | `steps(8)`, 1200 ms |
| `.gif-less--chrom` | przelatujący błysk po gradientowym tekście nagłówka | `steps(6)`, 1300 ms |
| `.gif-less--tancz` | naprzemienny `scaleX(1)/scaleX(-1)` (postacie) | `steps(2)`, 600 ms |

Desynchronizacja (kluczowa dla efektu „ściana niezależnych GIF-ów"): każdy element
dostaje `animation-delay` wyliczony z indexu: `style={{animationDelay: `${(i*137)%900}ms`}}`.
Zakaz wspólnego zegara.

## C. `kafel-tla` - proceduralne tła sekcji

5 wariantów, każdy = jeden `background` z powtarzalnych gradientów (bez plików):

1. `kafel--kosmos`: `--kosmos` + 3 warstwy `radial-gradient` kropek 2px w `var(--gwiazda)`
   o różnych `background-size` (67px, 131px, 199px - liczby pierwsze, brak mory).
2. `kafel--zebra`: `repeating-linear-gradient(105deg, var(--zebra-a) 0 24px, var(--zebra-b) 24px 48px)`
   (żart z treści zadania: zebry są biało-żółte).
3. `kafel--urzad`: `--papier` + delikatna krata `repeating-linear-gradient` co 28px
   jak papier kancelaryjny.
4. `kafel--ogien`: `repeating-conic-gradient` w `--alarm`/`--chrom-b`, użyty w próbie ognia.
5. `kafel--morze`: poziome pasy `--chrom-a`/`--atrament` z `.gif-less--jazda` na
   `background-position` (fale pod list-w-butelce).

Budżet: sekcja z kafelkiem + 20 dekoracji `gif-less` nie może zjeść więcej niż 16 ms/frame
(pomiar: `PerformanceObserver({type:"longtask"})` przez Playwright `page.evaluate`,
5 s idle -> 0 wpisów > 50 ms).

## D. `kometa-kursora`

8 elementów `div.kometa` (kwadraty 8x8, kolory cyklicznie `--chrom-a/b/c`), pozycja
aktualizowana w JEDNYM `requestAnimationFrame`: każdy kwadrat goni poprzedni ze
sztywnym krokiem klatkowym co 3 klatki rAF (skokowo, nie lerp - charakter `gif-less`).
Wyłączenia: `prefers-reduced-motion`, `(pointer: coarse)` (dotyk), oraz gdy karta
nieaktywna (`visibilitychange` -> stop rAF). Implementacja w `lib/animacje.ts` +
komponent `KometaKursora.tsx` montowany w layout.

## E. `ceremonia` - kontrakt

Ceremonia = sekwencja kroków z twardym harmonogramem. Pomocnik w `lib/animacje.ts`:

```ts
type KrokCeremonii = { czasMs: number; akcja: () => void };
async function odprawCeremonie(kroki: KrokCeremonii[], sygnalPominiecia: AbortSignal): Promise<void>
// - wykonuje kroki sekwencyjnie (setTimeout), abort -> natychmiast wykonuje OSTATNI krok
//   (stan końcowy) i kończy; reduced-motion -> od razu ostatni krok po 300 ms.
```

CSS ceremonii (jedyne miejsce, gdzie wolno `ease`/`cubic-bezier`) żyje w `globals.css`
między znacznikami `/* == CEREMONIE START == */` i `/* == CEREMONIE END == */`.
Zasady z plan/01: Z8 (klasy ruchu), Z9 (≤9 s, skip przez Esc/przycisk, fokus końcowy),
Z10 (reduced-motion). Każda ceremonia w spec etapów (05-07) ma tabelę kroków z czasami -
worker implementuje dokładnie te czasy jako wartości startowe.

## F. `licznik-mechaniczny`

Komponent `LicznikMechaniczny.tsx`: liczba jako kolumny cyfr; każda kolumna to pionowa
taśma 0-9 przesuwana `transform: translateY` z `transition: steps(10)` na zmianę wartości.
Czas przejścia: 120 ms na jedną pozycję cyfry, maks 900 ms łącznie (cap). Dźwięku brak.
Props: `{wartosc: number, szerokosc: number}` (liczba kolumn, zera wiodące).

## G. `pieczatka`

Komponent `Pieczatka.tsx`: SVG generowany w komponencie - okrąg/owal, tekst po łuku
(`<textPath>`), kolor `--urzad` lub `--alarm`, lekki szum krawędzi (stroke-dasharray).
Animacja wbicia (klasa `ceremonia`): `scale(3)->scale(1)` + `rotate(-14deg)` w 350 ms
`steps(4)` + jednorazowe drgnięcie rodzica o 2 px. Props:
`{tekst: string, ton: "urzad"|"alarm"|"jad", obrocDeg?: number}`.

## H. PLAYGROUND `/dev/animacje` (buduje się PRZED etapami)

Strona z sekcją per wariant: wszystkie `gif-less`, kometa, licznik (przyciski +1/+10/reset),
pieczątka (przycisk „wbij"), 5 kafli tła, jedna ceremonia demo (3 kroki + skip).
AC playgroundu = AC silnika. Screenshot playgroundu = dowód F1.

## I. ANTY-SPEC SILNIKA

1. Zakaz `transition: all`.
2. Zakaz animowania `width/height/top/left` w pętli (tylko `transform`/`opacity`/
   `background-position`/`visibility`/`clip-path`).
3. Zakaz `will-change` na więcej niż 3 elementach jednocześnie.
4. Zakaz IntersectionObserver do odpalania dekoracji (dekoracje po prostu lecą; obserwera
   wolno użyć wyłącznie do PAUZOWANIA pętli poza viewportem, jeśli budżet z C pęknie).
