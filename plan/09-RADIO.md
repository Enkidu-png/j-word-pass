# 09 - RADIO TINY DESK (`components/RadioTinyDesk.tsx`)

Zamówienie Aleksandry: z radia ma lecieć koncert Post Malone Tiny Desk.
Materiał: `https://youtu.be/oCcks-fwq2c`, ID filmu `oCcks-fwq2c`.

## A. DECYZJA TECHNICZNA

Odtwarzanie tego materiału legalnie jest możliwe **wyłącznie przez oficjalny
odtwarzacz osadzony**. Regulamin YouTube API Services wymaga, żeby osadzony
odtwarzacz był **widoczny i miał minimum 200x200 px**. Ukrycie go (1x1 px,
`opacity: 0`) łamałoby dokładnie ten regulamin, którym uzasadniamy całą decyzję,
więc odtwarzacz **jest widoczny** i wbudowany w obudowę radia jako jego ekran.

Parametry:
- `src`: `https://www.youtube-nocookie.com/embed/oCcks-fwq2c?enablejsapi=1&playsinline=1&rel=0&origin=<origin strony>`
- rozmiar: **260x200 px** na desktopie, **200x200 px** na 390 px (minimum z regulaminu)
- `title="Odtwarzacz radia Komisji: <nazwa bieżącego materiału>"` (F9-05)
- sterowanie przez YouTube IFrame API (`https://www.youtube.com/iframe_api`).
  **To jedyny dozwolony skrypt zewnętrzny w projekcie**, wyjątek od Z14 zapisany
  w `DECISIONS.md`.

**Pułapka, która inaczej zabije każdą sesję:** przy `src` na `youtube-nocookie.com`
konstruktor MUSI dostać jawny `host`, inaczej `onReady` nigdy nie przyjdzie i radio
zawsze wpada w tryb awaryjny:

```js
new YT.Player(el, {
  host: "https://www.youtube-nocookie.com",
  videoId: "oCcks-fwq2c",
  playerVars: { enablejsapi: 1, playsinline: 1, rel: 0, origin: window.location.origin },
  events: { onReady, onStateChange },
})
```

**Iframe i skrypt montowane są DOPIERO po kliknięciu `WŁĄCZ`.** Przed gestem
Aleksandry w DOM nie ma ani `<iframe>`, ani `<script>` - to jednocześnie spełnia
Z15 (zero autoplay) i kryterium z sekcji E (zero żądań do YouTube przed gestem).

**Zakaz pobierania audio z YouTube do repo.** Zero `youtube-dl`, `yt-dlp`, `ytdl`,
zero pliku z koncertem. To naruszenie regulaminu i prawa autorskiego.

## B. OBUDOWA RADIA (to widzi Aleksandra)

Blok szerokości 300 px (mobile 220 px) **w przepływie strony**, w slocie
`<div data-radio-slot>` w stopce (`05` A3). Zakaz `position: fixed` - w v1 fixed
zasłaniał przyciski i był błędem F7-05.

Elementy obudowy, od góry:
- ramka `5px outset var(--chrom-a)`, tło `--chrom-b`
- napis `RADIO KOMISJI` czcionką terminalową
- **ekran**: przed gestem prostokąt 260x200 (mobile 200x200) z tłem `--kosmos`
  i napisem `KLIKNIJ WŁĄCZ, ALEKSANDRO`; po geście w tym samym miejscu montuje się
  `<iframe>` o tych samych wymiarach, więc obudowa nie skacze
- **wskaźnik strojenia**: pasek 200x14 px z `Pas id="pas-cienki"` jako tłem
  i pionową kreską `3px solid var(--alarm)` przesuwaną `steps(20)` co 4 s, tylko gdy gra
- przycisk `WŁĄCZ` / `WYŁĄCZ` w ramce `3px outset`
- suwak głośności `<input type="range" min="0" max="100">` sterujący `setVolume`
- **strzałki `POPRZEDNI` i `NASTĘPNY`** (F9-05) w rzędzie pod `WŁĄCZ`, z `aria-label`,
  przełączające w pętli między trzema materiałami; wybór w `localStorage` pod `jwp.kanal`
- podpis: nazwa BIEŻĄCEGO materiału (podpis `LECI: POST MALONE...` skasowany w F9-05)
  plus link `youtu.be/<id bieżącego materiału>` otwierany w nowej karcie (atrybucja źródła)

**Lista materiałów (F9-05, kolejność wiążąca):** 1. `oCcks-fwq2c` (Post Malone, Tiny Desk
Concert, NPR Music), 2. `RLmx3KMNuRM` (Top Gun Niesiołowice, czasem łowię ryby),
3. `wj2jITPprLw` (tak puszysty jak almette, ebr cypisz).

## C. KONTRAKT ZACHOWANIA

| Zdarzenie | Reakcja |
|---|---|
| pierwsze kliknięcie `WŁĄCZ` | ładuje `iframe_api`, tworzy odtwarzacz, `playVideo()` |
| klik `WYŁĄCZ` | `pauseVideo()`; `getPlayerState()` zwraca `2` (paused) w poniżej 100 ms od kliknięcia, wskaźnik staje |
| zmiana suwaka | `setVolume(wartość)`, wartość zapisana w `localStorage` `jwp.glosnosc` |
| wejście na stronę z `jwp.audio === "on"` | **nie startuje sam** - pokazuje napis `KLIKNIJ, ABY WZNOWIĆ` (polityka autoplay przeglądarek, Z15) |
| przejście między etapami | odtwarzanie NIE przerywa się (radio żyje w layoucie, nie w stronie) |
| brak sieci albo blokada YouTube | po 5 s bez `onReady`: ekran pokazuje `RADIO MILCZY. KOMISJA PRZEPRASZA, ALEKSANDRO.` i link do koncertu |
| Tab | `WŁĄCZ`, suwak, link - w tej kolejności |
| reduced-motion | wskaźnik strojenia stoi, dźwięk działa normalnie |
| mobile 390 px | obudowa 180x92, suwak pełna szerokość pod przyciskiem |

## D. WYMOGI TWARDE

1. **Zero autoplay z dźwiękiem** (Z15). Zawsze gest Aleksandry.
2. Stan włączenia w `localStorage` pod `jwp.audio` (`on`/`off`), głośność pod
   `jwp.glosnosc`, wybrany materiał pod `jwp.kanal` (F9-05). Zero innych kluczy
   w `localStorage` poza `jwp.odwiedziny`.
3. `iframe` ma `title="Odtwarzacz radia Komisji: <nazwa materiału>"` (dostępność)
   i minimum 200x200 px (regulamin, sekcja A).
4. Skrypt `iframe_api` ładowany **dopiero po geście**, nie przy starcie strony -
   inaczej psuje budżet pierwszego ładowania.
5. Zero `document.write`, zero synchronicznych skryptów.

## E. WERYFIKACJA (kryteria akceptacji)

- Test Playwright: bez kliknięcia w `WŁĄCZ` na stronie **nie ma** żądania do
  `youtube.com` ani `youtube-nocookie.com` (assercja na `page.on('request')`).
- Po kliknięciu `WŁĄCZ` pojawia się żądanie do `youtube.com/iframe_api` oraz
  `iframe` z `src` zawierającym `oCcks-fwq2c`, o wymiarach >= 200x200
  (`getBoundingClientRect`, wynik w dowodzie).
- `WYŁĄCZ`: `player.getPlayerState() === 2` w poniżej 100 ms od kliknięcia.
- `localStorage` po włączeniu ma `jwp.audio === "on"`.
- Zrzut ekranu obudowy radia w `screenshots/F5/`.
- Negatywne: zero plików audio w `public/`, zero wystąpień `youtube-dl`/`ytdl`
  w repo i w `package.json`.
