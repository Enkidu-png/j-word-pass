# 05 - ETAP 1: EGZAMIN Z FIZYKI (`/egzamin`)

Dane: `data/egzamin.json` (plan/02 C1). AI: plan/08. Motyw sekcji: `kafel--kosmos`.

## A. KONCEPT PREZENTACJI

Sala egzaminacyjna dryfująca w kosmosie. Treść zadania NIE jest wyświetlona jako blok
tekstu - jest INSCENIZOWANA: po lewej stronie orbitują aktorzy pojedynku, po prawej wisi
arkusz `formularz-F7` z polem odpowiedzi. Dane wejściowe zadania (6 założeń) to
`karta-dowodowa` - fiszki, które kandydat FIZYCZNIE przenosi na arkusz, żeby je
„załączyć do dowodu".

### A1. Scena (lewa połowa, desktop)
- Tło `kafel--kosmos`. W nim:
- **Słoń**: SVG clip-art (obrys gruby 3px, wypełnienia płaskie), karabin na trąbie,
  `.gif-less--majtanie`. Przy każdym najechaniu strzela: 3 kwadraty `--chrom-b` lecą
  po prostej (`steps(5)`, 400 ms) i słoń odskakuje o 8 px w tył (odrzut! - żart z
  założenia `odrzut`).
- **Chmura zeber**: 12 sztuk SVG zebry biało-żółtej (pasy `--papier`/`--chrom-b`)
  z płomykiem jetpacka (`.gif-less--blink` na płomieniu), rozrzucone transformami,
  każda z innym delayem `.gif-less--skok`. Jedna zebra ma czapkę oficerską i dyplom
  pod pachą (ta z akademii wojskowej) i porusza się odwrotnie do stada
  (`animation-direction: reverse`).
- Licznik naboi słonia: `LicznikMechaniczny` od 5000, odlicza 1 przy każdym strzale
  hoverowym (czysto dekoracyjny, po wyczerpaniu napis `PRZERWA TECHNICZNA` i reset).

### A2. Arkusz (prawa połowa)
`formularz-F7` z nagłówkiem `EGZAMIN PAŃSTWOWY Z FIZYKI STOSOWANEJ NR F-7/BIS`,
treść pytania w `--font-glos`, polecenie w ramce. Pod tym:
- **Strefa dowodów**: 6 pustych slotów z podpisem `ZAŁĄCZ DOWODY (PRZECIĄGNIJ)`.
- **Pole odpowiedzi**: `<textarea>` stylizowany na kartkę w kratkę (kafelek gradientowy),
  placeholder `Tu wpisz wywód. Komisja czyta WSZYSTKO. Serio.`, autosize do 60vh,
  licznik znaków w rogu stylizowany na stempel (`ZNAKÓW: N`).
- CTA: `ODDAJĘ WYWÓD POD OSĄD KOMISJI` (jedyny submit; brak drugiego przycisku).

### A3. `karta-dowodowa` (interakcja signature egzaminu)
6 fiszek (założenia z JSON) porozrzucanych po scenie z lekkimi obrotami. Przeciąganie
na POINTER EVENTS (`pointerdown/move/up` + `setPointerCapture`; NIE HTML5 DnD -
decyzja z krytyki planu: testowalne przez Playwright dragTo) + fallback klawiaturowy: fokus na karcie,
Enter = „podnieś", strzałki wybierają slot, Enter = „upuść". Na dotyku: tap karta ->
tap slot. Karta w slocie: przybita `Pieczatka` mini `ZAŁ.` i lekko krzywo
(`rotate((idx%3-1)*2deg)`).
Załączenie dowodów NIE jest wymagane do submitu, ale liczba załączonych kart jest
wysyłana do AI jako `zalaczoneDowody` (Komisja komentuje braki: „nie załączyłaś dowodu
o raku trzustki, ale Komisja doceni tupet").

## B. OCENA (klik CTA) - ceremonia `narada-komisji`

Warunek pusty: `textarea.trim().length === 0` -> BEZ wywołania AI, wynik 0/10
(`punktyPuste` z JSON), ceremonia skrócona: wielka `Pieczatka` `PUSTKA INTELEKTUALNA - 0 PKT`
ton `alarm` + komisja unosi brwi (patrz niżej). Zapis do stanu i przejście dozwolone
(quiz otwarty) - user tak zdefiniował: 0 punktów, nie blokada.

Niepuste -> POST `/api/ocena` (plan/08). Ceremonia na czas oczekiwania (min 3,5 s nawet
gdy API odpowie szybciej - teatr ważniejszy od latencji; max czekania 15 s, potem fallback):

| # | czas | krok |
|---|---|---|
| 1 | 0-600 ms | arkusz składa się w samolocik (3 klatki `clip-path`, `steps(3)`) i odlatuje w głąb sceny |
| 2 | 600 ms | wjeżdża stół komisji: 3 głowy (`komisja`, `data/komisja.json`), każda `.gif-less` innym wariantem (majtanie/skok/tancz) |
| 3 | pętla | nad głowami dymki z kwestiami stanu `ocenianie` losowane co 1,8 s (`Hm.`, `Śmiałe.`, `Sekretarzu, proszę o kalkulator.`); między głowami lata kartka (translate po trójkącie, `steps(6)`) |
| 4 | po odpowiedzi API | dymki gasną; werbel: rząd 10 gwiazdek wypełnia się kolejno po 90 ms do wartości punktów; `LicznikMechaniczny` kręci do `punkty` |
| 5 | +400 ms | `Pieczatka` z tekstem `N/10 - ZDANO` (ton `jad`, bo minimum to 6) wbija się w ekran; pod nią komentarz Komisji (tekst z AI) na druku `formularz-F7` z podpisami trzech głów (kwestia werdyktu wg progu z `komisja.json`) |
| 6 | przycisk | `PRZYJMUJĘ WERDYKT, ŻĄDAM QUIZU` -> ceremonia przejścia: scena kosmosu zwija się jak roleta do góry (`steps(8)`, 900 ms), `router.push("/quiz")` |

Fallback po 15 s / błędzie API: punkty = `6 + (dlugoscOdpowiedzi % 5)`, komentarz
z puli 5 zapasowych w `data/komisja.json` (`werdykt-awaryjny`), w konsoli warn.
Skip ceremonii: Esc -> od razu krok 5.

## C. TABELA INTERAKCJI

| Zdarzenie | Reakcja |
|---|---|
| hover słoń | strzał + odrzut + licznik naboi -1 |
| hover zebra | zebra robi beczkę (360deg, `steps(4)`, 500 ms, jednorazowo) |
| drag karta-dowodowa | karta unosi się (scale 1.05, twardy cień rośnie do 8px), slot podświetla `--jad` kratką |
| drop w slot | pieczątka `ZAŁ.`, slot zajęty; drop poza slotem: karta wraca skokiem (3 klatki) |
| wpisywanie w textarea | licznik znaków skacze `steps`, co 200 znaków stempel mruga zachęcająco |
| klik CTA (puste) | ceremonia skrócona 0/10, patrz B |
| klik CTA (pełne) | ceremonia narada-komisji, patrz B |
| klawiatura na kartach | Enter/strzałki, patrz A3 |
| mobile < 768px | scena nad arkuszem (kolumna), zebry: 5 zamiast 12, karty-dowodowe jako pozioma rolka scrollowana, drag zastąpiony tap-tap |
| reduced-motion | scena statyczna, ceremonia = spinner-stempel (1 element, `steps(8)`) + wynik po 400 ms |
| powrót na stronę po ocenie | arkusz zablokowany (readonly), widoczny werdykt i pieczątka z `sessionStorage`; przycisk do quizu |

## D. ANTY-SPEC EGZAMINU
1. Zakaz wyświetlenia treści zadania jako jednego bloku `<p>` - założenia są TYLKO
   kartami dowodowymi.
2. Zakaz modala na wynik - wynik jest sceną, nie okienkiem.
3. Zakaz spinnera-kółka na czas API - czekaniem jest narada komisji.
4. Zakaz walidacji „min. N znaków" - pustka to legalna odpowiedź warta 0.
