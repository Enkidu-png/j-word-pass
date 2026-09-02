# HANDOFF - J-WORD PASS (przebudowa v2)

## STOP-GATE: bramka decyzyjna F8 (deploy produkcyjny)

`STOP-GATE: bramka decyzyjna F8 (deploy produkcyjny)`

Build v2 jest skonczony. Wszystkie fazy F0-F6 zamkniete z DoD, wszystkie
znaleziska F7 zamkniete, review koncowy wykonany i jego blokujace naprawione.
Jedyne otwarte issue w backlogu to **F8-01**, ktore jest Twoja decyzja.

**Nikt nie wykonal `vercel deploy --prod`.** Na `j-word-pass.vercel.app` stoi
dalej WERSJA PIERWSZA. Wersja druga zyje wylacznie na preview.

### Co robisz

1. Otworz preview: `https://j-word-pass-numze2ovx-enkidu-pngs-projects.vercel.app`
   (adres z F2-05; jesli wygasl, `vercel deploy --target=preview` da nowy).
2. Przejdz `WERYFIKACJA.md` - okolo 75 checkboxow zbudowanych z realnie
   zamknietych issues, kazdy mowi co kliknac, czego oczekiwac i czym zmierzyc.
3. Odpowiedz w czacie: zgoda na podmiane produkcji czy nie.

Bez Twojego "tak" nikt nic nie wdraza.

## Stan repo

Branch `main`, drzewo czyste, wszystko wypchniete na `origin/main`.

Ukonczone: **F0** (fundament, czystka, 43 assety, font, walidator, testy bazowe),
**F1** (silnik sceny plus playground `/dev/scena`), **F2** (shell, brama,
przycisk-uciekinier, ceremonia wejscia, pierwszy deploy preview), **F3** (etap 1:
egzamin, plonacy napis, ceremonia oceny), **F4** (etap 2: quiz, 15 pytan,
maszyna prawdy), **F5** (etap 3: proba ognia, spalenie, list w butelce, radio),
**F6** (a11y, budzety, 404, OG, samoocena gestosci), **F7-01 do F7-07**
(wszystkie znaleziska).

Otwarte: **F8-01** i nic wiecej.

Pomiary koncowe: `pnpm run check` czysto, `pnpm build` zielony (first load JS
102-115 kB przy limicie 160 kB), `npx playwright test` = **368 passed, 0 failed,
6 skipped**.

## Review koncowy (zasada 10)

Reviewer zweryfikowal okolo 40% AC na uruchomionej aplikacji. Znalazl trzy
blokujace, wszystkie naprawione przez orkiestratora i zmierzone na buildzie
PRODUKCYJNYM, nie na dev (commit `5bd37fe`):

1. **Strzalki w quizie nie dzialaly w produkcji.** Nasluch wisial na sekcji,
   do ktorej fokus nigdy nie docieral. Na `pnpm dev` dzialalo przez przypadek
   (podwojny efekt StrictMode). Zielone testy klamaly, bo mierzyly dev.
2. **Z11 zlamane na kazdym widoku.** Modyfikator `--odbijany` gornego paska mial
   wyzsza specyficznosc niz blok `prefers-reduced-motion`, wiec pasek jechal
   mimo ustawienia "ogranicz ruch".
3. **Dziura w dowodzie**, ktora przepuscila punkt 2: test reduced motion
   sprawdzal tylko jeden z dwoch wariantow paska.

Poza tym poprawione: `PROBA OGNIA` na `PRÓBA OGNIA`, `IMIĘ KANDYDATKI` i dwa
pola druku na zwrot do Aleksandry (Z16), osiem bezosobowych pytan quizu,
`sanitizeDash` wycina teraz takze emoji (Z4), `liczbaWZakresie` odrzuca
nie-liczby.

`WERYFIKACJA.md` zaktualizowany po tych naprawach: sekcja 8 nie jest juz lista
usterek, tylko lista potwierdzen.

## Do decyzji Aleksandry

1. **F8-01, deploy produkcyjny** - opisane wyzej. Jedyna rzecz, ktora blokuje
   zamkniecie projektu.
2. **Deployment Protection.** Anonimowy `curl` na preview dostawal 302 na
   `vercel.com/sso-api` w wersji pierwszej. Jesli link ma dzialac dla kogos
   spoza zespolu Vercela, trzeba to zdjac w ustawieniach projektu. Nie ruszane,
   bo to zmiana widocznosci calego projektu, czyli Twoja decyzja.

## Dlug swiadomy

- `lib/limit.ts:4` - jedyny `ponytail:` w repo. Limit zada w pamieci procesu,
  bez KV; przy wielu instancjach serverless jest luzniejszy, niz deklaruje.
  Sufit i sciezka wyjscia opisane w komentarzu.
- `DECISIONS.md #23` - `/api/zgloszenie` przyjmuje punkty etapow od klienta bez
  dowodu, ze etapy zdane. Swiadome: strona nie ma sesji serwerowej i miec nie
  bedzie, a zapis do Bloba to pamiatka, nie rejestr wynikow.
- Poza tym: zero `TODO`, zero `FIXME`, zero martwego kodu (sprawdzone w recenzji).

## Pulapki srodowiskowe (dla nastepnej sesji)

- **`pnpm build` psuje dzialajacy `pnpm dev`** (nadpisuje `.next`). Kolejnosc
  zawsze: testy, build, `pkill -f "next dev"; pkill -f next-server; rm -rf .next;
  pnpm dev`, potem `curl` na 200.
- **`agent-context.sh` w podagencie zwraca `STALE-TRANSCRIPT`** i nie mierzy okna
  workera (DECISIONS #14). Sztafeta jechala na granicach faz, nie na procentach.
- **`npx playwright test | tail -3` ukrywa czerwone** - reporter wypisuje
  `N failed` PRZED `N passed`. Zawsze pelny output.
- **Testy CSS: `page.addStyleTag()` doklada arkusz na koniec `<head>`** i wygrywa
  kolejnoscia niezaleznie od poprawki, wiec do dowodow kaskady sie nie nadaje.
- **`addInitScript` serializuje funkcje** - domkniecia nie ma, argumenty ida
  drugim parametrem.
- **Mierz produkcje, nie dev.** Blokujace znalezisko numer 1 przeszlo przez cala
  faze F4 i audyt F6 wlasnie dlatego, ze wszyscy mierzyli `pnpm dev`.
