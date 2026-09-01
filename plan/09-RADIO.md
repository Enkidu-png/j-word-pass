# 09 - RADIO TINY DESK (`components/RadioTinyDesk.tsx`)

Zamówienie Aleksandry: z radia ma lecieć koncert Post Malone Tiny Desk.
Materiał: `https://youtu.be/oCcks-fwq2c`, ID filmu `oCcks-fwq2c`.

## A. DECYZJA TECHNICZNA

Odtwarzanie cudzego materiału z YouTube legalnie i bez pobierania pliku jest możliwe
**wyłącznie przez oficjalny odtwarzacz osadzony**. Dlatego:

- `<iframe>` z `https://www.youtube-nocookie.com/embed/oCcks-fwq2c` (wariant
  bez ciasteczek śledzących), parametry: `enablejsapi=1`, `playsinline=1`, `rel=0`.
- Odtwarzacz jest **ukryty pod obudową radia**: `iframe` ma rozmiar 1x1 px,
  `opacity: 0`, `position: absolute`, `pointer-events: none`. Widoczna jest tylko
  nasza obudowa (patrz B).
- Sterowanie przez YouTube IFrame API (`https://www.youtube.com/iframe_api`).
  **To jedyny dozwolony skrypt zewnętrzny w projekcie**, wyjątek od Z14 zapisany
  w `DECISIONS.md`. Ładowany leniwie, dopiero przy pierwszym kliknięciu w radio.

**Zakaz pobierania audio z YouTube do repo.** Zero `youtube-dl`, zero pliku mp3
z koncertem. To naruszenie regulaminu YouTube i prawa autorskiego.

## B. OBUDOWA RADIA (to widzi Aleksandra)

Blok 260x120 px (mobile: 180x92 px) przyklejony do prawego dolnego rogu, ale
**w przepływie strony**, nie `position: fixed` - w v1 `fixed` zasłaniał przyciski
i był błędem F7-05. Konkretnie: radio siedzi w stopce, nad plakietkami.

Elementy obudowy:
- ramka `5px outset var(--chrom-a)`, tło `--chrom-b`
- napis `RADIO KOMISJI` czcionką terminalową
- **wskaźnik strojenia**: pasek 200x14 px z `Ozdoba id="pas-cienki"` jako tłem
  i pionową kreską `3px solid var(--alarm)` przesuwającą się `steps(20)`, 4 s,
  tylko gdy gra
- przycisk `WŁĄCZ` / `WYŁĄCZ` w ramce `3px outset`
- suwak głośności `<input type="range" min=0 max=100>` sterujący `setVolume`
- pod obudową tekst: `LECI: POST MALONE, TINY DESK CONCERT` plus link
  `youtu.be/oCcks-fwq2c` otwierany w nowej karcie (atrybucja źródła)

## C. KONTRAKT ZACHOWANIA

| Zdarzenie | Reakcja |
|---|---|
| pierwsze kliknięcie `WŁĄCZ` | ładuje `iframe_api`, tworzy odtwarzacz, `playVideo()` |
| klik `WYŁĄCZ` | `pauseVideo()`, dźwięk cichnie w poniżej 100 ms, wskaźnik staje |
| zmiana suwaka | `setVolume(wartość)`, wartość zapisana w `localStorage` `jwp.glosnosc` |
| wejście na stronę z `jwp.audio === "on"` | **nie startuje sam** - pokazuje napis `KLIKNIJ, ABY WZNOWIĆ` (polityka autoplay przeglądarek, Z15) |
| przejście między etapami | odtwarzanie NIE przerywa się (radio żyje w layoucie, nie w stronie) |
| brak sieci albo blokada YouTube | po 5 s bez `onReady`: obudowa pokazuje `RADIO MILCZY. KOMISJA PRZEPRASZA.` i link do koncertu |
| Tab | `WŁĄCZ`, suwak, link - w tej kolejności |
| reduced-motion | wskaźnik strojenia stoi, dźwięk działa normalnie |
| mobile 390 px | obudowa 180x92, suwak pełna szerokość pod przyciskiem |

## D. WYMOGI TWARDE

1. **Zero autoplay z dźwiękiem** (Z15). Zawsze gest Aleksandry.
2. Stan włączenia w `localStorage` pod `jwp.audio` (`on`/`off`), głośność pod
   `jwp.glosnosc`. Zero innych kluczy w `localStorage` poza `jwp.odwiedziny`.
3. `iframe` ma `title="Odtwarzacz koncertu Post Malone Tiny Desk"` (dostępność).
4. Skrypt `iframe_api` ładowany **dopiero po geście**, nie przy starcie strony -
   inaczej psuje budżet pierwszego ładowania.
5. Zero `document.write`, zero synchronicznych skryptów.

## E. WERYFIKACJA (kryteria akceptacji)

- Test Playwright: bez kliknięcia w `WŁĄCZ` na stronie **nie ma** żądania do
  `youtube.com` ani `youtube-nocookie.com` (assercja na `page.on('request')`).
- Po kliknięciu `WŁĄCZ` pojawia się żądanie do `youtube.com/iframe_api` oraz
  `iframe` z `src` zawierającym `oCcks-fwq2c`.
- `localStorage` po włączeniu ma `jwp.audio === "on"`.
- Zrzut ekranu obudowy radia w `screenshots/F5/`.
- Negatywne: zero plików audio w `public/`, zero wystąpień `youtube-dl`/`ytdl`
  w repo i w `package.json`.
