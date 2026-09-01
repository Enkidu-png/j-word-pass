# WERYFIKACJA - lista kontrolna dla użytkownika

Zbudowana z issues, które są REALNIE ukończone i sprawdzone na uruchomionej aplikacji
(nie z planu). Każda pozycja mówi: co uruchomić, co kliknąć, czego oczekiwać i czym to
zmierzyć. Odhaczaj tylko to, co sam zobaczysz.

## 0. Przygotowanie środowiska

```bash
cd ~/repos/j-word-pass
pnpm dev            # serwer deweloperski na http://localhost:3000
```

Pułapka: `pnpm build` nadpisuje `.next` i PSUJE działający `pnpm dev`. Kolejność zawsze:
najpierw testy na `dev`, potem `build`, potem `rm -rf .next && pnpm dev`.

- [ ] `pnpm dev` startuje bez błędów, `http://localhost:3000` oddaje bramę
- [ ] `pnpm run check` kończy się `samotest: czysto` + `lint-tokens: czysto` i zero błędów `tsc`

---

## 1. Bramy jakości (jedna komenda, jeden wynik)

| Co uruchomić | Czego oczekiwać |
|---|---|
| `pnpm run check` | `samotest: czysto`, `lint-tokens: czysto`, brak wyjścia z `tsc`, exit 0 |
| `npx playwright test` | `212 passed + 22 skipped + 0 failed` (2,1 min) |
| `pnpm build` | zielony, tabela route'ów jak niżej |

- [ ] `pnpm run check` exit 0
- [ ] `npx playwright test` = 212 passed, 0 failed
      (22 skipped to normalne: 12 testów jest przypisanych do jednego viewportu,
      a 10 z `tests/f6-02.spec.ts` samo się pomija, bo wymaga ręcznie postawionego
      buildu produkcyjnego na porcie 3100 - patrz punkt 9)
- [ ] `pnpm build` zielony, budżet first-load poniżej 160 kB dla każdej strony:
      `/` 104 kB, `/egzamin` 110 kB, `/proba-ognia` 108 kB, `/quiz` 113 kB, shared 102 kB

---

## 2. Shell i brama (F2-01, F2-02, F2-03)

Otwórz `http://localhost:3000` w oknie 1280x800.

- [ ] **Kursor** jest własny (pikselowa pieczątka), nie systemowa strzałka.
      Zmierz: DevTools Console -> `getComputedStyle(document.documentElement).cursor`
      zawiera `url(`
- [ ] **Pasek krawędzi** u góry (ok. 44 px) z przewijającym się napisem i proporczykami
- [ ] **PassOMetr** w prawym górnym rogu, trzy segmenty: EGZAMIN / QUIZ / PRÓBA OGNIA
- [ ] **Stopka webring** na dole: Prev / Next / Random / Lista, licznik odwiedzin,
      data ostatniej aktualizacji, odznaka VALID HTML 4.0
- [ ] **Tablica ogłoszeń** ma co najmniej 6 niezależnie ruszających się elementów
      (mrugania, obroty, majtanie) - żadne dwa nie idą w tym samym rytmie
- [ ] **Przycisk `WOLĘ NIE`**: najedź myszą trzy razy. Za każdym razem ucieka w inne
      miejsce, po trzeciej ucieczce napis zmienia się na `DOBRA, I TAK MUSISZ` i
      przestaje uciekać. Czwarte najechanie nic nie robi.
- [ ] **Radio Komisji** (lewy dolny róg): domyślnie CISZA. Kliknij `WŁĄCZAM SZUM
      URZĘDOWY` - dopiero teraz leci szum. Odśwież stronę (F5) - dźwięku NIE MA,
      pojawia się notka, że potrzebne jest jedno kliknięcie. To jest zamierzone (Z16).
- [ ] **Blokada etapu**: wpisz w pasek adresu `http://localhost:3000/quiz`. URL
      ZOSTAJE `/quiz` (bez przekierowania), a na stronie stoi druk
      `KOMISJA ZABRANIA. NAJPIERW ETAP 1.`
- [ ] **Kliknięcie w zablokowany segment QUIZ** w PassOMetrze nie nawiguje, pokazuje
      dymek gasnący po ok. 1,2 s
- [ ] **Ceremonia wejścia**: kliknij `SKŁADAM WNIOSEK I WCHODZĘ`. Pieczątka
      `PRZYJĘTO`, szuflada akt, ląduje na `/egzamin` w mniej niż 2 s, a kursor
      klawiatury (fokus) stoi na nagłówku etapu.
- [ ] To samo z `Esc` w trakcie ceremonii: skacze na `/egzamin` w mniej niż 0,6 s

---

## 3. Egzamin, karty dowodowe i komisja (F3-02, F3-03, F3-04)

Wejdź na `/egzamin` przez bramę.

- [ ] **Scena**: czarny kosmos, słoń, 12 zeber. Dokładnie jedna zebra leci pod prąd
      (oficerska). Zebry nie są zsynchronizowane.
- [ ] **Słoń**: najedź na niego myszą. Leci strzał, słoń ma odrzut, a licznik naboi
      spada o 1 (5000 -> 4999). Trzy najechania = 4997. Licznik NIE leci serią.
- [ ] **Zebra**: najedź na zebrę - robi beczkę dokładnie raz i przestaje.
- [ ] **Arkusz F-7**: pole `textarea` z licznikiem znaków. Po przekroczeniu 200 znaków
      zaczyna mrugać stempel.
- [ ] **Karta dowodowa - mysz**: przeciągnij dowolną kartę na pusty slot. W slocie
      pojawia się okrągła pieczątka `ZAŁ.`
- [ ] **Karta dowodowa - poza slot**: przeciągnij kartę na nagłówek strony. Karta wraca
      skokowo (nie płynnie), slot zostaje pusty.
- [ ] **Karta dowodowa - klawiatura**: Tab na kartę, Enter (podnosi), strzałka w prawo
      dwa razy (cel przeskakuje na trzeci slot), Enter (karta ląduje w trzecim slocie).
      Cała ścieżka bez myszy działa.
- [ ] **Pusta odpowiedź**: nie wpisuj nic, kliknij `ODDAJĘ WYWÓD POD OSĄD KOMISJI`.
      Wynik `0/10`, pieczątka `0/10 - PUSTKA` i podpis `PUSTKA INTELEKTUALNA - 0 PKT`.
      Zmierz: DevTools -> Network, filtr `ocena` - ZERO żądań do `/api/ocena`.
- [ ] **Niepusta odpowiedź**: wpisz kilka zdań, kliknij CTA. Teatr narady trwa co
      najmniej 3,5 s, trzy głowy komisji mówią różne kwestie w dymkach, potem werdykt:
      gwiazdki, licznik mechaniczny, pieczątka `N/10`, komentarz AI na druku F-7.
      Fokus po ceremonii sam ląduje na przycisku przejścia do quizu.
- [ ] **Komentarz AI bez zakazanych znaków**: w komentarzu Komisji nie ma ani jednego
      długiego myślnika `-` (em-dash), ani kropki środkowej, ani emoji. To jest
      pilnowane przez `sanitizeDash()` w `app/api/ocena/route.ts`.
- [ ] **`Esc` w trakcie narady**: werdykt pojawia się od razu (poniżej 2 s), bez utraty
      punktów.
- [ ] **Powrót na `/egzamin` po ocenie**: `textarea` jest tylko do odczytu, przycisku
      oddania w ogóle nie ma (drugiego podejścia nie ma).
- [ ] **Komisja padła**: DevTools -> Network -> Block request URL na `*/api/ocena`,
      odśwież, wpisz odpowiedź i oddaj. Pojawia się mrugający `PROTOKÓŁ AWARYJNY`
      i werdykt z puli awaryjnej (punkty 6-10) w mniej niż 16 s.

---

## 4. Quiz - segregator i signature (F4-01, F4-02a/b/c)

Wejdź na `/quiz` po zaliczonym egzaminie.

- [ ] **15 teczek**: po prawej stronie stos 15 zakładek (na 390 px - pozioma rolka
      u góry). Klik zakładki otwiera teczkę.
- [ ] **Nawigacja klawiaturą**: fokus na zakładce 01, strzałka w dół 14 razy - przechodzi
      przez wszystkie teczki, nagłówek `AKTA NR NN/15` za każdym razem dostaje fokus.
- [ ] **Zapis stanu**: zaznacz warianty w 3 różnych pytaniach, wpisz coś w lukę pytania
      14, naciśnij F5. Wszystkie zaznaczenia wracają, zakładki mają stempel `WYPEŁNIONO`.
- [ ] **Brak podpowiedzi**: zaznacz świadomie błędny wariant. NIC się nie podświetla na
      zielono ani czerwono, nie ma napisu POPRAWNIE / BŁĄD. Ocena jest dopiero na końcu.
- [ ] **Pytanie 14 (otwarte)**: wpisz `mohsa`, potem `Mohsa`, potem `skala Mohsa` - każdy
      z tych wpisów jest uznawany. Wpisz `richtera` - nie jest.
- [ ] **15 różnych signature**: przejdź kolejno przez wszystkie 15 teczek i sprawdź, że
      każda ma INNĄ animowaną scenkę w pasku nad pytaniem (ośmiornica z trzema sercami,
      Wenus kręcąca się pod prąd, marsz emu, młotek i piórko, śpiący ślimak, strefy
      czasowe Rosji, topniejący gal, sauna, kość udowa, drewniana mysz, rekin, nutki
      Mozarta, mrówki z mszycami, skala twardości, wombat z kostką).
- [ ] **Signature reagują na wariant**: w pytaniu 1 najedź na wariant B - jedno z trzech
      serc przestaje bić. W pytaniu 7 najedź na wariant A - kropla galu kapie szybciej.
      W pytaniu 12 najedź na wariant A - nutki układają się w uśmiech.
- [ ] **Zero emoji**: nigdzie w interfejsie quizu nie ma emoji (są tylko w `data/quiz.json`
      w polu `emojiZrodlowe`, które nie trafia na ekran).

---

## 5. Quiz - maszyna prawdy (F4-03)

- [ ] **Ostrzeżenie o pustkach**: nie odpowiadaj na wszystkie pytania i kliknij
      `ODDAJĘ AKTA DO WERYFIKACJI`. Pojawia się druk `CZY NA PEWNO? N TECZEK ŚWIECI
      PUSTKĄ`. `WRACAM` zamyka druk i NIE uruchamia maszyny.
- [ ] **Ceremonia**: `NIECH SIĘ DZIEJE` uruchamia maszynę - lej, korba, teczki lecą po
      kolei, licznik trafień się kręci. Całość kończy się wynikiem w mniej niż 9 s.
      Zmierzone w tym przeglądzie: 7,5 s.
- [ ] **Pieczątka wyniku** `N/15` jest czytelna, tekst po łuku czyta się normalnie
      (NIE do góry nogami) i mieści się w kole.
- [ ] **`Esc` w trakcie**: wszystkie 15 werdyktów pojawia się naraz w mniej niż 1,5 s.
- [ ] **Tryb rewizji**: po werdykcie wariant poprawny jest obwiedziony, wybrany błędny
      przekreślony dwiema odręcznymi kreskami, radia są zablokowane. Pytanie 14 pokazuje
      `KOMISJA UZNAJE: mohsa /// skala mohsa`.
- [ ] **F5 po werdykcie**: strona wchodzi OD RAZU w rewizję, maszyny nie da się puścić
      drugi raz.
- [ ] **Przejście**: `WZYWAM PRÓBĘ OGNIA` odpala płonący samolocik i prowadzi na
      `/proba-ognia` w ok. 2,2 s.

---

## 6. Próba ognia - druk OGN-3/TAJ (F5-01, F5-02)

- [ ] **Ognisko** widoczne pod drukiem (płomienie w trzech warstwach, ruch skokowy).
- [ ] **CTA zablokowane**: dopóki nie zaznaczysz checkboxa `PRZYJMUJĘ Z POKORĄ`,
      przycisk `JESTEM GOTOWA NA PRÓBĘ OGNIA` jest nieaktywny i ma WIDOCZNIE inne tło
      (blokada widać gołym okiem, nie tylko w atrybucie).
- [ ] **Zły e-mail**: wpisz `x` w pole adresu i wyślij druk. Druk się trzęsie, pojawia
      się stempel `WYPEŁNIONO NIEGODNIE: ADRES NIE PRZYPOMINA ADRESU`, a fokus wraca na
      pole e-mail. Podkreślenie pola NIE robi się czerwone - komunikat niesie wyłącznie
      stempel (zasada Z14).
- [ ] **Rozmiar buta poza skalą**: wpisz `8`. Stempel z zakresem `10-70`.
- [ ] **Ucho 200 mm**: przechodzi, ale z dopiskiem `KOMISJA NOTUJE Z PODZIWEM`.
- [ ] **Walidacja serwerowa jest prawdziwa** (nie kopią klienta). Sprawdź z terminala:
      ```bash
      curl -s -X POST http://localhost:3000/api/zgloszenie -H 'content-type: application/json' \
        -d '{"email":"x","rozmiarButa":39,"srednicaUchaMm":60}' -w '\n%{http_code}\n'
      # oczekiwane: 400 + WYPEŁNIONO NIEGODNIE: ADRES NIE PRZYPOMINA ADRESU
      curl -s -X POST http://localhost:3000/api/zgloszenie -H 'content-type: application/json' \
        -d '{"email":"a@b.pl","rozmiarButa":8,"srednicaUchaMm":60}' -w '\n%{http_code}\n'
      # oczekiwane: 400 + ROZMIAR BUTA POZA SKALĄ KOMISJI (10-70)
      curl -s -X POST http://localhost:3000/api/zgloszenie -H 'content-type: application/json' \
        -d '{"email":"a@b.pl","rozmiarButa":39,"srednicaUchaMm":900}' -w '\n%{http_code}\n'
      # oczekiwane: 400 + ŚREDNICA UCHA POZA SKALĄ KOMISJI (5-500)
      ```
- [ ] **Jedna wysyłka, nie dwie**: DevTools -> Network, wyślij poprawny druk. Dokładnie
      JEDNO żądanie POST na `/api/zgloszenie`. Odśwież stronę - strona od razu pokazuje
      przyjęty druk, przycisku wysyłki nie ma, licznik POST-ów zostaje na 1.
- [ ] **Zero toasta**: po wysyłce NIE ma komunikatu typu "wysłano pomyślnie".
      Potwierdzeniem jest wyłącznie list w butelce.

---

## 7. Ceremonia spalenia i list w butelce (F5-03)

- [ ] **Sekwencja**: po wysłaniu druku leci ceremonia - druk się składa, wpada w ogień,
      dym zmienia się w butelkę, tło zmienia się w morze. Całość poniżej 9 s.
- [ ] **Butelka** dryfuje po morzu, ma dymek `KLIKNIJ`.
- [ ] **Klik butelki** rozwija pergamin z Twoim adresem e-mail i sumą punktów `N/25`
      (egzamin + quiz), z pieczątką `TAJNE`. Pieczątka nie zasłania adresu i jest
      wyraźnie widoczna (nie zwinięta do zera).
- [ ] **Enter na butelce** (bez myszy, po Tab) robi to samo co klik.
- [ ] **`Esc` w krokach 1-4** przeskakuje od razu do butelki (poniżej 1,5 s).
- [ ] **OD NOWA** czyści cały stan i wraca na bramę. Sprawdź w DevTools -> Application
      -> Session Storage: klucza `jwp.v1` nie ma.

---

## 8. Dostępność i szacunek dla przeglądarki (F6-01, Z15)

- [ ] **Cały przebieg bez myszy**: od bramy do pergaminu wyłącznie Tab / Enter / Spacja
      / pisanie. Po każdej ceremonii fokus sam ląduje na sensownym elemencie.
- [ ] **Widoczny fokus**: naciśnij Tab na bramie. Aktywny element ma przerywaną obwódkę
      (`dashed`, 3 px). Zmierz: Console -> `getComputedStyle(document.activeElement).outlineStyle`
      zwraca `dashed`.
- [ ] **Prawy przycisk działa** na całej stronie (kontekstowe menu przeglądarki wyskakuje).
- [ ] **Ctrl+F działa**, tekst da się zaznaczyć myszą.
- [ ] **Zredukowany ruch**: macOS -> Ustawienia -> Dostępność -> Wyświetlacz ->
      Ogranicz ruch. Odśwież stronę. WSZYSTKIE dekoracje stoją, treść i punktacja są
      w pełni dostępne, ceremonie skracają się do jednego kroku.
      Zmierz: Console -> `[...document.querySelectorAll('.gif-less')].filter(e => getComputedStyle(e).animationName !== 'none').length`
      zwraca `0`.
- [ ] **Brak trybu ciemnego** - strona wygląda tak samo niezależnie od ustawień systemu
      (to jest zamierzone, anty-spec D7).

---

## 9. Wydajność (F6-02)

Wymaga buildu produkcyjnego na osobnym porcie (dev jest za wolny do pomiaru):

```bash
pnpm build
npx next start -p 3100      # zostaw działające w osobnym oknie
npx playwright test tests/f6-02.spec.ts    # przestaje się pomijać
```

- [ ] `tests/f6-02.spec.ts` = 5 passed (na 4 stronach zero long tasków > 50 ms w 5 s idle)
- [ ] Po pomiarze: `lsof -ti:3100 | xargs kill -9 && rm -rf .next && pnpm dev`
      (build nadpisał `.next` i zepsuł serwer deweloperski)
- [ ] Raporty Lighthouse z poprzedniego pomiaru do wglądu:
      `screenshots/F6/F6-02-lighthouse-{brama,egzamin,quiz,proba-ognia}.report.html`
      - LCP 1,8-1,9 s na każdej stronie (próg 2,5 s)

---

## 10. 404, favicon i podgląd w social (F6-03)

- [ ] `http://localhost:3000/nieistnieje` oddaje HTTP **404** (sprawdź w DevTools ->
      Network, kolumna Status - nie tylko wygląd strony) z nagłówkiem
      `AKTA ZAGINĘŁY. NISZCZARKA BYŁA SZYBSZA.`, pieczątką `BRAK AKT` i linkiem
      `WRACAM DO BRAMY I MELDUJĘ SIĘ PONOWNIE`, który faktycznie prowadzi na `/`.
      Na 404 zostaje spójny shell: pasek krawędzi i stopka webring.
- [ ] **Favicon** w karcie przeglądarki to pieczątka z literą W (`app/icon.svg`).
- [ ] **Obrazek OG**: `http://localhost:3000/opengraph-image` zwraca PNG 1200x630.
      ```bash
      curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:3000/opengraph-image
      # oczekiwane: 200 image/png
      ```
- [ ] ⚠ **ZNANY BŁĄD DO NAPRAWY PRZED DEPLOYEM**: w buildzie produkcyjnym `og:image`
      wskazuje na `http://localhost:3000/...`, bo w `app/layout.tsx` brakuje
      `metadataBase`. Po deployu podgląd linku na Slacku / Facebooku / Discordzie
      NIE zadziała. Sprawdź po naprawie:
      ```bash
      pnpm build && npx next start -p 3100
      curl -s http://localhost:3100/ | grep 'og:image"'
      # oczekiwane PO naprawie: pełny adres produkcyjny, NIE localhost
      ```

---

## 11. Bezpieczeństwo i granice zaufania (F3-01, F5-02)

- [ ] **Klucz OpenRouter nie wycieka do klienta**:
      ```bash
      grep -rn OPENROUTER app components lib
      # oczekiwane: dokładnie jedno trafienie, app/api/ocena/route.ts (kod serwera)
      ```
- [ ] **Żaden sekret nie siedzi w repo ani w historii gita**:
      ```bash
      git ls-files | grep -cE '^\.(env|vercel)'          # oczekiwane: 0
      git log -p --all | grep -cE 'sk-or-v1-[A-Za-z0-9_-]{20,}|vercel_blob_rw_[A-Za-z0-9_]{20,}'
      # oczekiwane: 0
      ```
- [ ] **`/api/ocena` odrzuca śmieci** (uruchom przy działającym `pnpm dev`):
      ```bash
      curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3000/api/ocena \
        -H 'content-type: application/json' -d '{"odpowiedz":""}'          # 200 (PUSTKA)
      curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3000/api/ocena \
        -H 'content-type: application/json' -d '{"cos":1}'                 # 400
      curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3000/api/ocena \
        -H 'content-type: application/json' -d '{"odpowiedz":123}'         # 400
      python3 -c "print('{\"odpowiedz\":\"' + 'x'*9000 + '\"}')" | \
        curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3000/api/ocena \
        -H 'content-type: application/json' --data-binary @-               # 413
      ```
- [ ] **Limit żądań na `/api/ocena` działa** (tylko na buildzie produkcyjnym - w trybie
      dev jest świadomie wyłączony):
      ```bash
      pnpm build && npx next start -p 3100
      for i in $(seq 1 7); do curl -s -o /dev/null -w "$i: %{http_code}\n" \
        -X POST localhost:3100/api/ocena -H 'content-type: application/json' \
        -d '{"odpowiedz":"zebry maja jetpacki","zalaczoneDowody":2}'; done
      # oczekiwane: 1-5 = 200, 6 i 7 = 429
      ```
      Zweryfikowane w tym przeglądzie: dokładnie taki wynik.
- [ ] ⚠ **ZNANY BRAK**: `/api/zgloszenie` NIE ma żadnego limitu żądań. Ta sama pętla
      siedmiu curli oddaje 7x 200 i zapisuje 7 plików do prywatnego store'u Vercel Blob.
      Do rozstrzygnięcia przed produkcją.

---

## 12. Kanon wizualny (Z1-Z16, anty-spec) - sprawdzenie w przeglądarce

Wklej w DevTools Console na każdej z 4 stron (`/`, `/egzamin`, `/quiz`, `/proba-ognia`):

```js
// Z1/Z2/Z4 - zero kropek srodkowych, dlugich myslnikow i emoji
const t = document.body.innerText;
console.log("middot:", t.includes("·"), "dash:", /[—–]/.test(t),
  "emoji:", /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(t));
// oczekiwane: trzy razy false

// Z5 - zero elementow z samym lewym paskiem akcentu
console.log([...document.querySelectorAll("*")].filter(e => {
  const c = getComputedStyle(e), w = s => parseFloat(s) || 0;
  return w(c.borderLeftWidth) >= 2 && !w(c.borderTopWidth) && !w(c.borderRightWidth) && !w(c.borderBottomWidth);
}).length);
// oczekiwane: 0

// Z7 - kazda dekoracja ma ruch skokowy steps(2..8) i 300-1400 ms
console.log([...document.querySelectorAll(".gif-less")].filter(e => {
  const c = getComputedStyle(e);
  if (c.animationName === "none") return false;
  const m = c.animationTimingFunction.split(",")[0].trim().match(/^steps\((\d+)/);
  const d = parseFloat(c.animationDuration) * 1000;
  return !m || +m[1] < 2 || +m[1] > 8 || d < 300 || d > 1400;
}).length);
// oczekiwane: 0

// anty-spec D3 - zero miekkich rozmytych cieni produktowych
console.log([...document.querySelectorAll("*")].filter(e => {
  const s = getComputedStyle(e).boxShadow;
  if (!s || s === "none") return false;
  const px = [...s.matchAll(/(-?[\d.]+)px/g)].map(m => +m[1]);
  return px[2] > 0;
}).length);
// oczekiwane: 0

// Z11/Z16 - localStorage tylko na dzwiek, stan kandydata w sessionStorage
console.log(Object.keys(localStorage), Object.keys(sessionStorage));
// oczekiwane: [] lub ["jwp.audio"]  oraz  ["jwp.v1"] po rozpoczeciu egzaminu
```

- [ ] Z1 / Z2 / Z4 - trzy razy `false` na wszystkich 4 stronach i na 404
- [ ] Z5 - `0` na wszystkich 4 stronach
- [ ] Z7 - `0` na wszystkich 4 stronach
- [ ] anty-spec D3 (miękkie cienie) - `0` na wszystkich 4 stronach
- [ ] Z11 / Z16 - `localStorage` nie zawiera nic poza `jwp.audio`
- [ ] Style wyłącznie przez tokeny (Z3) - pilnuje `pnpm run check`, punkt 1

---

## 13. Playground animacji (F1-01, F1-02, F1-03)

- [ ] `http://localhost:3000/dev/animacje` pokazuje 7 wariantów `gif-less` i 5 kafli tła
      oraz ścianę 20 zdesynchronizowanych dekoracji
- [ ] Demo ceremonii: 3 kroki zapalają się po kolei, `Esc` skacze od razu do stanu
      końcowego
- [ ] Licznik mechaniczny kręci się z 0 na 42 z bębnami przewijanymi pionowo
- [ ] Trzy pieczątki wbijają się z obrotem, tekst po łuku czytelny
- [ ] **Playground NIE wycieka na produkcję**:
      ```bash
      pnpm build && npx next start -p 3100
      curl -s -o /dev/null -w '%{http_code}\n' localhost:3100/dev/animacje   # 404
      curl -s -o /dev/null -w '%{http_code}\n' localhost:3100/               # 200
      ```
      Zweryfikowane w tym przeglądzie: 404 dla `/dev/animacje`, 200 dla 4 stron aplikacji.

---

## 14. Co ZOSTAJE otwarte (nie odhaczaj - to decyzje dla Ciebie)

- [ ] **F8-01** deploy produkcyjny - czeka na Twoją zgodę, nic nie było wypychane
- [ ] **F7-04** Deployment Protection na Vercelu jest WŁĄCZONA - anonimowy `curl` na
      URL deployu dostaje 302 na `vercel.com/sso-api`, więc publiczny link nie zadziała
      dla nikogo spoza zespołu. Decyzja: zostawić czy zdjąć.
- [ ] `metadataBase` w `app/layout.tsx` (punkt 10) - do naprawy PRZED deployem
- [ ] Limit żądań na `/api/zgloszenie` (punkt 11) - do rozstrzygnięcia przed deployem
- [ ] Sprzątanie po testach: w prywatnym store `jwp-zgloszenia` leży kilkanaście
      testowych plików `zgloszenia/2026-09-01T*.json` (z F5-02 i z tego przeglądu)
