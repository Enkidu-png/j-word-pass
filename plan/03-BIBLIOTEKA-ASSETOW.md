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

### A1. PRZEPIS NA GIFCITIES (zweryfikowany 2026-09-02, działa z curl)

GifCities nie ma publicznego API JSON. Ma zwykły formularz, który zwraca HTML,
a w nim bezpośrednie adresy plików. Pełna ścieżka, sprawdzona na żywo:

```bash
# 1. Szukanie - zwraca HTML z adresami plikow
curl -s "https://gifcities.org/search?q=spaceship&offset=0&page_size=200" \
  | grep -oE 'https://blob\.gifcities\.org/gifcities/[A-Z0-9]+\.gif' \
  | sort -u > /tmp/kandydaci.txt

# 2. Pobranie kandydata
curl -sL -o public/assets/statek.gif "$(head -1 /tmp/kandydaci.txt)"

# 3. Sprawdzenie, co sie realnie pobralo (wymiary decyduja o przydatnosci)
file public/assets/statek.gif                       # -> GIF image data, version 89a, 640 x 170
sips -g pixelWidth -g pixelHeight public/assets/statek.gif   # wymiary do manifestu

# 4. Klatka statyczna dla reduced-motion (plan/03 E). `sips` bierze pierwsza klatke.
sips -s format png public/assets/statek.gif --out public/assets/statyczne/statek.png
```

**Wynik weryfikacji:** zapytanie `spaceship` zwróciło kilkanaście unikalnych adresów,
pobrany plik to poprawny GIF 89a. Ścieżka jest wykonalna bez przeglądarki i bez
udziału Aleksandry.

Uwagi praktyczne dla workera:
- Wyszukiwarka zwraca WSZYSTKO, co pasuje hasłem, w losowych wymiarach. **Sprawdzaj
  `file` po każdym pobraniu** i odrzucaj to, co nie mieści się w wymiarach z tabeli B.
- Hasła szukaj po angielsku (`spaceship`, `fire`, `dolphin`, `under construction`,
  `starfield`, `88x31`), archiwum jest anglojęzyczne.
- Jeden plik nie pasuje - bierz następny z listy kandydatów. **Nie blokuj się na
  jednym obrazku**, lista ma zwykle kilkadziesiąt pozycji.
- Kafle tła szukaj hasłami `background tile`, `starry background`, `seamless tile`.
  Kafel poznasz po małych wymiarach (poniżej 350 px w obu osiach).

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

### B3. Pełna lista pozycji (kanoniczna, 43 sztuki)

Tabela w sekcji D jest jedynym źródłem prawdy o `id`. Ta lista mówi tylko, ile czego
trzeba zdobyć, żeby pakiet się domknął. Liczby są wyliczone z realnego zapotrzebowania
pozostałych plików, nie wzięte z sufitu:

| Grupa | Ile | Skąd wynika |
|---|---|---|
| rdzeń, rola `ozdoba` | 6 | `statek`, `statek-wir`, `ogien`, `planeta`, `strzalka-dol`, `nowe` |
| ozdoby quizu | 13 | tabela `07 B` wymaga 15 RÓŻNYCH, z czego `planeta` i `ogien` są już w rdzeniu |
| ozdoby interfejsu | 7 | `stwor-koperta` (stopka), `stwor-klodka` (PassOMetr), `stwor-strzalka` (lista założeń), `stwor-kot`, `stwor-but`, `stwor-ucho`, `stwor-butelka` (próba ognia) |
| stwory rogowe | 4 | `stwor-delfin`, `stwor-hotdog`, `stwor-reka`, `stwor-klepsydra` - po 2 na widok, z rotacją między widokami |
| pasy, rola `pas` | 3 | `pas-budowa` (45 px), `pas-balony` (43 px), `pas-cienki` (15 px) |
| kafle, rola `kafel` | 5 | po jednym na bramę, egzamin, quiz, próbę ognia i 404 (Z9) |
| plakietki, rola `plakietka` | 3 | stopka, format 88x31 |
| kursory, rola `kursor` | 2 | `kursor`, `kursor-rece` |
| **razem** | **43** | z czego **30 o roli `ozdoba`** |

Sześcian ekranu ładowania (`04` F) NIE potrzebuje nowych plików - używa sześciu już
policzonych: `statek`, `planeta`, `ogien`, `stwor-dyskietka`, `stwor-kula-ziemska`,
`stwor-gwiazdka`.

**Motyw nie do znalezienia w archiwum:** wolno podstawić inny GIF, ale `id` zostaje
z tabeli D, a w `ATTRIBUTION.md` idzie dopisek `podstawienie: <czego szukano>`.
Twardy warunek, którego nie wolno obejść: **15 ozdób quizu musi być 15 różnymi
plikami** (test na rozmiar zbioru w F4-02).

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

- **Na tej maszynie NIE MA `gifsicle`, `magick` ani `ffmpeg`** (sprawdzone, `plan/02 G`
  punkt 6). Nie da się więc ani zoptymalizować, ani przeskalować animowanego GIF-a
  bez spłaszczenia go do jednej klatki. Dlatego zamiast optymalizacji obowiązuje
  **twardy filtr: plik powyżej 300 KB odrzucamy i bierzemy następnego kandydata
  z listy**. Archiwum zwraca kilkadziesiąt wyników na hasło, więc to nie jest problem.
- Rozmiar wyświetlania ustawiają atrybuty `width` i `height` na `<img>` (wartości
  z manifestu), NIE przeskalowany plik. Plik zostaje w oryginalnej rozdzielczości.
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

### D1. KANONICZNA TABELA `id` (jedyne źródło prawdy, reszta plików tylko ją cytuje)

`ozdoba`: `statek`, `statek-wir`, `ogien`, `planeta`, `strzalka-dol`, `nowe`,
`stwor-osmiornica`, `stwor-ptak`, `stwor-mlotek`, `stwor-slimak`, `stwor-zegar`,
`stwor-kropla`, `stwor-kosc`, `stwor-mysz`, `stwor-dyskietka`, `stwor-nuta`,
`stwor-kula-ziemska`, `stwor-krysztal`, `stwor-gwiazdka`, `stwor-koperta`,
`stwor-klodka`, `stwor-strzalka`, `stwor-kot`, `stwor-but`, `stwor-ucho`,
`stwor-butelka`, `stwor-delfin`, `stwor-hotdog`, `stwor-reka`, `stwor-klepsydra` (30)

`pas`: `pas-budowa`, `pas-balony`, `pas-cienki` (3)

`kafel`: `kafel-brama`, `kafel-egzamin`, `kafel-quiz`, `kafel-ogien`, `kafel-404` (5)

`plakietka`: `plakietka-html`, `plakietka-css`, `plakietka-przegladarka` (3)

`kursor`: `kursor`, `kursor-rece` (2)

**Zakaz wymyślania `id` spoza tej listy.** Potrzeba nowego motywu w trakcie budowy ->
najpierw dopisz go tutaj, potem użyj.

### D2. POLA

Pola: `id` (unikalne, kebab-case), `plik`, `szerokosc`, `wysokosc`, `opis`
(polski, trafia do `alt`), `rola` (`ozdoba` | `kafel` | `pas` | `kursor` | `plakietka`),
`klatka-statyczna` (ścieżka do pierwszej klatki jako PNG, wymagana dla ról `ozdoba`
i `pas` - potrzebna do Z11).

**Kafle muszą być plikami PNG, nie GIF-ami.** Animowanego tła nie da się zatrzymać
przy `prefers-reduced-motion`, a Z11 nie ma wyjątków. Walidator odrzuca pozycję
o roli `kafel` z rozszerzeniem `.gif`.

**Kursor jest wyjątkiem od Z11** i nie ma `klatka-statyczna` - przeglądarki i tak
renderują tylko pierwszą klatkę pliku ustawionego jako `cursor` (`04` I).

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
