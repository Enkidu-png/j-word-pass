# 03 - BIBLIOTEKA ASSETOW

To jest najważniejszy plik tego pakietu. Bez assetów nie ma projektu (Z7).

## A. SKĄD BIORĄ SIĘ PLIKI (kolejność źródeł, obowiązkowa)

Referencja `make-frontend-shit-again` **nie ma pliku LICENSE** i ma `"private": true`
w `package.json`. Nie mamy więc licencji na jej pliki, mimo że sama zawartość to
klasyczny clipart z ery GeoCities. Dlatego traktujemy jej katalog `assets/`
jako **listę zakupów**, a nie jako magazyn.

Kolejność sięgania po plik, od góry:

1. **GifCities** (`gifcities.org`, projekt Internet Archive) - wyszukiwarka GIF-ów
   z archiwum GeoCities. To jest naturalne źródło dokładnie tej estetyki i dokładnie
   tych motywów. Pobieranie: bezpośredni URL do pliku z archiwum.
2. **Zasoby CC0 / public domain** - `openclipart.org`, `publicdomainvectors.org`,
   Wikimedia Commons z licencją PD lub CC0.
3. **Własny GIF/APNG wygenerowany z SVG** - dopuszczalny tylko wtedy, gdy motywu nie
   ma w źródłach 1 i 2. Generowanie: pojedynczy plik SVG plus animacja CSS zapisana
   jako sprite, albo statyczny PNG plus animacja `steps()` po sprite'ie.
4. **Plik z referencji** - dopuszczalny WYŁĄCZNIE dla motywów, których nie da się
   znaleźć w źródłach 1-3, z wpisem w `ATTRIBUTION.md`. Strona jest prywatnym żartem
   dla jednej osoby, nie produktem komercyjnym, ale to nie jest powód, żeby nie
   zapisać, skąd co pochodzi.

**Każdy pobrany plik dostaje wpis w `ATTRIBUTION.md`** w formacie:
`<nazwa pliku> | <URL źródła> | <licencja albo "GeoCities archive, public domain-ish"> | <data pobrania>`.

## B. LISTA ZAKUPÓW (motyw, przeznaczenie, wymiary docelowe)

Wymiary podane w kolumnie „docelowe" są wiążące. Plik większy przeskalować przed
wrzuceniem do repo, nie w CSS.

### B1. Rdzeń (bez tego nic nie działa) - zdobyć w F0-03

| Motyw | Nazwa docelowa | Wymiary | Gdzie użyty |
|---|---|---|---|
| kursor, animowany | `kursor.gif` | 32x32 | `cursor:` na `html` (kursor-komisji) |
| statek kosmiczny, lecący | `statek.gif` | 100-130 szer. | nagłówek bramy, sekcja egzaminu |
| statek kosmiczny, wirujący | `statek-wir.gif` | 100-130 szer. | ekran-ladowania, quiz |
| ogień, płomień | `ogien.gif` | 75x90 | plonacy-napis, próba ognia |
| planeta | `planeta.gif` | 150-350 szer. | tło sceny egzaminu, róg quizu |
| pas budowy „under construction" | `pas-budowa.gif` | szer. dowolna, wys. 45 | dolny pas bramy |
| pas ozdobny 2 | `pas-balony.gif` | szer. dowolna, wys. 43 | górny pas quizu |
| pas cienki | `pas-cienki.gif` | szer. dowolna, wys. 15 | góra i dół próby ognia |
| migający napis „NOWE" | `nowe.gif` | do 200 szer. | odznaczenie świeżego etapu |
| strzałka w dół, migająca | `strzalka-dol.gif` | do 180 szer. | zachęta do przewinięcia |

### B2. Kafle tła - po jednym na powierzchnię, zdobyć w F0-03

| Nazwa docelowa | Wymiary kafla | Powierzchnia | Charakter |
|---|---|---|---|
| `kafel-brama.png` | 200-320 kw. | brama | gwiazdy albo kosmos |
| `kafel-egzamin.png` | 100-150 kw. | egzamin | ciemny, kosmiczny |
| `kafel-quiz.png` | 100-150 kw. | quiz | jasny, papierowy albo w kratkę |
| `kafel-ogien.png` | 100-150 kw. | próba ognia | ciepły, pomarańczowo-czarny |
| `kafel-404.png` | 100-150 kw. | 404 | dowolny, byle inny niż pozostałe |

### B3. Stwory rogowe - minimum 8 różnych, zdobyć w F0-03

Motywy do znalezienia (każdy 60-160 px wysokości): delfin lub ryba, hot dog lub inne
jedzenie, kot, kula ziemska wirująca, koperta lecąca, dyskietka, telefon, gwiazdka
migająca, ręka wskazująca, klepsydra. Minimum 8 z tej listy, im więcej tym lepiej.
Nazwy: `stwor-<motyw>.gif`.

### B4. Napisy-obrazki - generowane u nas w F1-03

Referencja ma nagłówki jako GIF-y z napisami (`make.gif`, `fun.gif`, `dope.gif`).
Naszych napisów nie znajdziemy w archiwum, bo mówią po polsku do Aleksandry.
Dlatego **napis-obrazek generujemy sami** jako SVG z gradientem chromowym plus
animacja CSS, opakowane w komponent `NapisObrazek` (`04-SILNIK-SCENY.md` sekcja D).
To jedyny dozwolony wyjątek od Z7, bo plik po prostu nie istnieje.

Napisy do wygenerowania: `J-WORD PASS`, `EGZAMIN JASIU`, `QUIZ`, `PROBA OGNIA`,
`ZDANE`, `NIEZDANE`, `ALEKSANDRO`.

### B5. Plakietki stopki - zdobyć w F0-03

`plakietka-html.gif`, `plakietka-css.gif`, `plakietka-przegladarka.gif` (88x31 każda,
klasyczny format przycisku 88x31 z lat 90.). Źródło: GifCities, hasło „88x31".

## C. OPTYMALIZACJA I BUDŻET (Z18)

- Plik powyżej **300 KB** nie wchodzi do repo bez przepuszczenia przez `gifsicle -O3
  --lossy=60` (lub równoważnik). Jeśli po optymalizacji nadal przekracza 300 KB,
  szukamy innego pliku.
- **Budżet widoku: suma assetów pobieranych na jednym ekranie <= 2,5 MB.**
  Pomiar: `npx playwright test tests/budzet.spec.ts`, który sumuje `transferSize`
  wszystkich odpowiedzi typu `image/*` na danej stronie i porównuje z progiem.
- Wszystkie `<img>` ozdobne dostają `loading="lazy"` i `decoding="async"`, poza tymi
  widocznymi w pierwszym ekranie.
- Każdy `<img>` ma jawne `width` i `height` w atrybutach - inaczej strona skacze.

## D. MANIFEST `data/assety.json` (jedyne źródło prawdy)

Struktura, walidowana przez `scripts/lint-tokens.mjs`:

```json
{
  "wersja": 1,
  "pozycje": [
    {
      "id": "statek",
      "plik": "/assets/statek.gif",
      "szerokosc": 106,
      "wysokosc": 82,
      "opis": "Statek kosmiczny lecacy w prawo",
      "rola": "ozdoba",
      "klatka-statyczna": "/assets/statyczne/statek.png"
    }
  ]
}
```

Pola: `id` (unikalne, kebab-case), `plik`, `szerokosc`, `wysokosc`, `opis`
(polski, trafia do `alt`), `rola` (`ozdoba` | `kafel` | `pas` | `kursor` | `plakietka`),
`klatka-statyczna` (ścieżka do pierwszej klatki jako PNG, wymagana dla `rola:
"ozdoba"` i `"pas"` - potrzebna do Z11).

**Zakaz wpisywania ścieżek do plików wprost w komponentach.** Komponent bierze pozycję
z manifestu po `id`. Złamanie: `<img src="/assets/statek.gif">` w JSX.

Walidacja w `pnpm run check`: każda pozycja manifestu ma istniejący plik na dysku;
każdy plik w `public/assets/` ma pozycję w manifeście; każda pozycja o roli `ozdoba`
lub `pas` ma istniejącą `klatka-statyczna`; `id` unikalne.

## E. KLATKI STATYCZNE (mechanizm dla Z11)

Animowanego GIF-a nie da się zatrzymać CSS-em. Dlatego dla każdego GIF-a ozdobnego
generujemy pierwszą klatkę jako PNG do `public/assets/statyczne/<id>.png`
(narzędzie: `gifsicle '<plik>' '#0' > klatka.gif` plus konwersja, albo `sips`).

Komponent `Ozdoba` czyta `window.matchMedia("(prefers-reduced-motion: reduce)")`
i podmienia `src` na `klatka-statyczna`. Szczegóły w `04-SILNIK-SCENY.md` sekcja G.
