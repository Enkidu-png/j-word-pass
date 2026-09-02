# DECYZJE ARCHITEKTONICZNE - J-WORD PASS

Rejestr decyzji, które odchodzą od zasad z `plan/01-ANALIZA-I-ZASADY.md` sekcja B
albo wybierają jedną z kilku dróg. Jeden wpis = jedna decyzja, numerowana rosnąco.

---

## #1 - `@vercel/blob` jako jedyny wyjątek od Z6 (lista zależności runtime)

Data: 2026-09-01. Status: zatwierdzona z góry w `plan/02-FUNDAMENT.md` sekcja D.

Z6 dopuszcza wyłącznie `next`, `react`, `react-dom`. Etap 3 (próba ognia) musi zapisać
zgłoszenie kandydata trwale, a jedyny magazyn dostępny bez stawiania osobnej usługi to
Vercel Blob.

Decyzja: `@vercel/blob` wchodzi do `dependencies` w issue F5-02 i tylko tam. Używany
wyłącznie w `app/api/zgloszenie/route.ts`, czyli po stronie serwera - nie dotyka warstwy
UI, więc nie narusza intencji Z6 (zakaz bibliotek do animacji, UI i formularzy).
Allowlist walidatora `scripts/lint-tokens.mjs` przewiduje tę paczkę od F0-02.

Alternatywy odrzucone: zewnętrzna baza (nadmiarowa dla jednego pliku JSON na zgłoszenie),
wysyłka e-mail (użytkownik wybrał wariant "tylko zapis"), zapis na dysku funkcji
(system plików na Vercel jest ulotny).

---

## #2 - Scaffold ręczny zamiast `create-next-app`, `next.config.mjs`, TypeScript 5

Data: 2026-09-01. Status: wykonana w F0-01.

Trzy odstępstwa od dosłownego brzmienia `plan/02-FUNDAMENT.md` sekcja A, wymuszone przez
środowisko:

1. `pnpm create next-app . --ts --app ...` odmawia pracy w katalogu, który już zawiera
   pliki (`plan/`, `CLAUDE.md`, `.env.local`). Zamiast przenosić pakiet planistyczny,
   pliki scaffoldu napisane ręcznie: `package.json`, `tsconfig.json`, `next.config.mjs`,
   `app/layout.tsx` i cztery strony. Efekt jest identyczny, zależności te same.
2. Konfiguracja jako `next.config.mjs`, nie `next.config.ts`. Next 15.5 transpiluje
   konfigurację TS przez API `ts.sys`, którego nie ma w TypeScript 7 - `pnpm dev` padał
   na `TypeError: Cannot read properties of undefined (reading 'fileExists')`.
   Konfiguracja jest pusta, więc nie traci nic na braku typów.
3. `typescript` przypięty do `^5` (5.9.3), nie `^7`. TypeScript 7 jest niekompatybilny
   z ścieżką konfiguracyjną Next 15 (punkt 2). Wracamy do 7, gdy Next to podniesie.

---

## #3 - F0-05 zablokowane: Vercel wylogowany, `.env.local` poza zasięgiem workera

Data: 2026-09-01. Status: BLOKADA, czeka na użytkownika.

Wykonane w F0-05: repo `Enkidu-png/j-word-pass` utworzone jako publiczne i wypchnięte
(`gh repo create --public --source=. --push`), historia i drzewo bez sekretów.

Niewykonalne bez użytkownika, dwie niezależne przyczyny:

1. `vercel whoami` zwraca `Logged out`. `vercel login` jest interaktywny (wybór metody,
   potwierdzenie w przeglądarce), więc `vercel link --yes`, utworzenie Blob store
   i `vercel env add` nie mają jak się wykonać.
2. Każda komenda dotykająca `.env.local` (nawet `grep -c OPENROUTER_API_KEY .env.local`,
   który nie drukuje wartości) jest odrzucana przez hook uprawnień tej sesji. Wartości
   klucza nie da się więc przekazać do `vercel env add`, a wklejenie go do czatu łamie Z12.

Do odblokowania użytkownik robi `vercel login`, po czym worker dokańcza: `vercel link --yes`,
Blob store + `BLOB_READ_WRITE_TOKEN`, `vercel env add OPENROUTER_API_KEY production`
z wartością podaną strumieniem z `.env.local` (jeśli hook zostanie poluzowany) albo
wpisaną przez użytkownika w dashboardzie.

Uwaga do AC F0-05: warunek `grep -r "sk-or-" . = 0` jest niespełnialny dosłownie, bo sam
ciąg `sk-or-` występuje w treści AC w `plan/10-BACKLOG.md`, `plan/01-ANALIZA-I-ZASADY.md`
i `plan/08-AI-KOMISJA.md`. Trafienia sprawdzone jedno po drugim: wszystkie to tekst
zasady, zero kluczy. `git log -p | grep -c "sk-or-"` = 4, te same trzy pliki.

---

## #4 - Marquee paska krawędzi łamie zakres Z7 (`steps(24)`, 3800 ms)

Data: 2026-09-01. Status: wykonana w F2-01.

Konflikt między dwoma dokumentami pakietu, nie swoboda workera:
- Z7 (`plan/01` sekcja B) dopuszcza dla dekoracji wyłącznie `steps(N)` z N od 2 do 8
  i czas trwania 300-1400 ms.
- `plan/04` sekcja A punkt 2 żąda dla marquee dosłownie `steps(24)` i 3800 ms,
  z uzasadnieniem „duża liczba kroków celowo: rwany przesuw".

Decyzja: idzie zapis z `plan/04`, bo jest bardziej szczegółowy i opisuje ten
konkretny element, a intencja Z7 (ruch ma być skokowy, nigdy płynny) zostaje
zachowana - `steps(24)` to nadal ruch krokowy, tylko drobniejszy. Napis przewija
się przez całą szerokość ekranu, więc przy N ≤ 8 skoki byłyby wielkości ćwierci
ekranu i napis stałby się nieczytelny.

Zakres odstępstwa: WYŁĄCZNIE klasa `.pasek-krawedzi__marquee`. Wszystkie dekoracje
`.gif-less--*` trzymają się Z7 (N 2-8, 300-1400 ms) - zweryfikowane testem
`tests/f1-01.spec.ts`. Marquee nie jest wariantem `gif-less` i nie używa jego bazy.
`prefers-reduced-motion` zatrzymuje go tak samo jak resztę (Z10).

## #6 Blob store `jwp-zgloszenia` jest PRYWATNY (F0-05, orkiestrator)

`plan/02` sekcja D nie precyzuje trybu dostępu Blob store. Wybrany `--access private`,
bo zgłoszenia zawierają adresy e-mail kandydatów, a publiczny blob jest czytelny dla
każdego, kto zna URL (nieodgadywalny, ale nie chroniony). Odczyt i tak odbywa się
wyłącznie przez dashboard Vercel (decyzja D3 w plan/README - zero panelu admina).

Konsekwencja dla F5-02: wywołanie `put()` z `@vercel/blob` musi mieć
`access: "private"`. Domyślne przykłady w dokumentacji używają `access: "public"` -
to by nie zadziałało na tym store.

## #7 Pierwszy deploy Vercela wylądował na PRODUKCJI mimo braku `--prod` (F2-04, worker)

Dyspozycja dla F2-04 brzmiała: deploy PREVIEW dozwolony, produkcyjny zakazany
(bramka F8). Wykonana komenda była zgodna: `vercel deploy --yes`, bez `--prod`.
Vercel mimo to ustawił `"target": "production"` i sam to zakomunikował:
„This is the project's first deployment, so it was assigned to production.
Future deployments will be preview deployments unless you use --prod."

Skutek: `dpl_2WWx6DiArnRbyrytPpRrtokJkdvV` ma aliasy `j-word-pass.vercel.app`
i `j-word-pass-enkidu-pngs-projects.vercel.app`. Bramka F8 formalnie została
przekroczona przez domyślne zachowanie platformy, nie przez decyzję workera.

Łagodzące: projekt ma włączoną Deployment Protection (Vercel Authentication),
więc anonimowy ruch dostaje 302 na SSO - nikt postronny tej wersji nie zobaczy.
Aplikacja nie ma jeszcze żadnego endpointu API ani zapisu do Blob, więc deploy
nie wystawił niczego kosztownego.

Decyzja: NIE cofam tego (usunięcie deployu / pauza projektu to działanie na
zasobach użytkownika poza zakresem issue). Kolejne deploye workerów będą już
preview automatycznie. Bramka F8-01 zostaje otwarta i przy jej wykonaniu trzeba
świadomie rozstrzygnąć Deployment Protection - opisane jako znalezisko F7-04.

## #8 - RadioKomisji przestaje być `position: fixed` (odstępstwo od plan/04 A pkt 4)

plan/04 sekcja A opisuje `RadioKomisji` jako widżet "lewy dolny róg, fixed".
Znalezisko F7-05 pokazało, że to nie jest kosmetyka: element `fixed` leży NAD
treścią, więc na 390 px przykrywał przycisk `SKŁADAM WNIOSEK I WCHODZĘ` na
bramie i `PRZYJMUJĘ WERDYKT, ŻĄDAM QUIZU` po ocenie, a na desktopie wchodził na
stopkę i scenę egzaminu. To blokuje realną ścieżkę użytkownika.

Rozważone i odrzucone: (a) dolny padding stopki równy wysokości widżetu - leczy
tylko stopkę, każdy inny przycisk w lewym dolnym rogu nadal ginie przy scrollu;
(b) lewa rynna na całej stronie (`body { padding-left }`) - przesuwa cały layout
o 200 px i psuje kompozycję desktopu.

Decyzja: widżet wraca do normalnego przepływu tuż nad stopką (jedna zmiana w
`.radio-komisji`: `position/left/bottom/z-index` -> `margin`). Nadal jest w
lewym dolnym rogu STRONY, tylko nie nakłada się na nic. Ten sam wzorzec ma już
`PassOMetr` na mobile (`position: static` + `margin-top: auto`), więc shell
zostaje spójny. AC F7-05 (zero kolizji z elementami klikalnymi) ma pierwszeństwo
nad literalnym "fixed" z plan/04.

## #9 - Z7 wygrywa z `steps(60)` i `steps(12)` z tabeli signature (plan/06 D)

Tabela 06 D podaje dla signature 6 (`rosja-strefy`) ruch wskazówek `steps(60)`,
a dla signature 10 (`mysz-drewniana`) jazdę `steps(12)`. Z7 z plan/01 dopuszcza
w dekoracjach wyłącznie `steps(N)` dla N od 2 do 8 i jest zasadą twardą
("złamanie = issue niezaliczone"), a tabela signature to opis efektu.

Decyzja: obie dekoracje jadą na `steps(8)`. Wskazówka skacze 8 razy na obrót,
wózek myszy pokonuje trasę w 8 skokach z `animation-direction: alternate`.
Efekt "rwanego GIF-a" zostaje, liczba klatek mieści się w budżecie Z7. Gdyby
user chciał dosłownie 60 klatek, trzeba najpierw zmienić Z7 - nie odwrotnie.

## #10 - Z7 wygrywa z pętlą 2,4 s butelki (plan/07 B krok 5)

Tabela ceremonii z `plan/07` B każe butelce dryfować w pętli **2,4 s** (6 pozycji,
klatkowo). Z7 zamyka czas trwania ruchu dekoracyjnego w przedziale **300-1400 ms**,
a dryf butelki jest bezspornie dekoracją: zapętlony, nieinteraktywny, niczego nie
blokuje. Dwa zapisy pakietu stoją w sprzeczności.

Decyzja: wygrywa Z7 (zasada twarda, łamanie = issue niezaliczone), tabela ustępuje.
Pętla dryfu ma **1200 ms** przy zachowanych sześciu pozycjach z tabeli, więc rytm
klatek zostaje, skraca się tylko okres. Precedens: DECISIONS #9 (`steps(60)`
i `steps(12)` z tabeli 06 D zjechały na `steps(8)` z tego samego powodu).

Konsekwencja: gdyby user chciał wolniejszego dryfu, trzeba najpierw zmienić Z7
w `plan/01`, a nie obchodzić go w komponencie.

## #11 - kasacja NEXT-TASKS.md i WERYFIKACJA.md przed startem F0-01

Oba pliki zostały po buildzie v1 i twierdzą, że "fazy F0-F6 zamknięte". Backlog v2
nie ma ani jednego odhaczonego issue, a prompt workera każe czytać `NEXT-TASKS.md`
na starcie - pierwszy worker dostałby więc instrukcję sprzeczną ze stanem repo.

Decyzja: orkiestrator kasuje oba pliki przed spawnem pierwszego workera (zasada 3 -
zmiana mechaniczna, dwa pliki, zero logiki). Kasacja i tak jest częścią AC F0-01,
więc wchodzi do commita `F0-01` razem z resztą czystki.

## #12 - lista kasacji z plan/02 C jest niepelna, uzupelniona wg plan/02 B

`plan/02 C` wymienia do kasacji testy `f1-`, `f2-`, `f4-`, `f6-`, `f7-`, ale pomija
`tests/f3-02..04`, `tests/f5-01`, `tests/f5-03` oraz `screenshots/F0/`. Wszystkie
one dotycza widokow v1, ktore wlasnie znikaja, wiec zostawienie ich dawaloby
czerwony `npx playwright test` od pierwszego dnia budowy v2.

Rozstrzygajaca jest sekcja `plan/02 B` (lista tego, co ZOSTAJE): z testow zostaja
wylacznie `tests/f3-01.spec.ts` i `tests/f5-02.spec.ts` (kontrakty API) oraz
`tests/smoke.spec.ts` (przepisywany w F0-05). Reszta skasowana w F0-01.

## #13 - wyszukiwarka GifCities trafia w motyw w okolo polowie przypadkow

Pomiar z F0-03a i F0-03b: z 40 pobranych plikow 18 trzeba bylo podmienic po
OBEJRZENIU arkusza stykowego, mimo ze kazdy przeszedl filtr wymiarow, wagi
i liczby klatek. Trafienia haslowe, ktore wygladaly poprawnie w logu, a byly
bledne na ekranie: `planet` dal niebieski prostokat z napisem ANETTE,
`arrow down` dal strzalke w prawo, `hot dog` dal psa, `waving hand` dal zdjecie
czlowieka, `shoe` dal baner "I Love Shoes".

Wniosek do konca budowy: kazdy nowy asset przechodzi przez arkusz stykowy
renderowany na `--kosmos` I na `--papier` przed wpisaniem do manifestu.
Dwa tla, bo najczestsza wada po motywie to nieprzezroczysta ramka, ktorej
nie widac na tle o tym samym kolorze.

Swiadomie zostawione z nieprzezroczystym prostokatem: `stwor-klodka`
(bialy) i `stwor-kula-ziemska` (ciemny). Oba trafiaja na powierzchnie o
zblizonym kolorze (`--druk-tlo` w PassOMetr, sciana szescianu ladowania),
wiec ramka tam nie przeszkadza. Do podmiany, gdyby wyladowaly gdzie indziej.

## #14 - agent-context.sh nie mierzy okna WORKERA, tylko sesji nadrzednej

Pomiar z F0-06. `bash ~/.claude/agent-context.sh` zwraca `STALE-TRANSCRIPT`
przez caly przebieg workera i nigdy nie zwrocil liczby.

Przyczyna, ustalona z lektury skryptu (bez modyfikacji): skrypt liczy slug
z katalogu roboczego i bierze najnowszy `*.jsonl` z
`~/.claude/projects/<slug>/`, po czym odrzuca plik starszy niz 120 s. W tym
katalogu lezy transkrypt sesji ORKIESTRATORA, ktory zamarl w chwili spawnu
workera (`00:44`, przy pomiarze `01:18`). Transkrypt samego workera nie
laduje w katalogu projektu, wiec skryptowi nie ma czego zmierzyc.

Konsekwencja dla kontraktu sztafety: warunek „przy >= 55% zostaw NEXT-TASKS.md"
jest dla workera NIEMIERZALNY tym narzedziem. `~/.claude/context-usage.txt`
zwraca liczbe (`37` przy tym pomiarze), ale to pomiar sesji nadrzednej,
nie workera, wiec podstawienie go pod ten warunek byloby zgadywaniem
w przebraniu pomiaru.

NIE naprawiamy tego po cichu: `~/.claude` to prywatne repo z hookiem
auto-commit i pushem na druga maszyne (F0-06 jest jawnie „tylko odczyt").
Do decyzji Aleksandry, wariant rekomendowany: worker konczy paczke na
granicy fazy albo na ustalonej liczbie issues, zamiast na procencie okna.

## #15 - viewBox NapisObrazek: odstepstwo od plan/04 D punkt 1

Plan podaje `viewBox = "0 0 <10*len(tekst)> 120"` przy `font-size: 96`. Te dwie
liczby sie wykluczaja: jedenascie znakow `PRÓBA OGNIA` zajmuje przy tym stopniu
okolo 700 jednostek, a viewBox mialby 110. Zewnetrzny `<svg>` ma domyslnie
`overflow: hidden`, wiec napis zostalby obciety do dwoch liter.

Zmiana: szerokosc `62 * len + 40`, plus `textLength` z
`lengthAdjust="spacingAndGlyphs"`. Drugi zapis wpasowuje glify w zadana
szerokosc niezaleznie od metryk fontu, wiec obciecie w poziomie jest niemozliwe
z definicji, a nie z pomiaru na jednej maszynie.

Druga poprawka, znaleziona dopiero testem `getBBox` (nie z kodu): przy linii
pisma `y=96` kreska nad `Ó` wychodzila NAD `viewBox` i byla scinana. Wysokosc
podniesiona do 130, linia pisma do 104. Test w `tests/f1-02.spec.ts` porownuje
teraz wszystkie cztery krawedzie bbox napisu z viewBox, wiec kazdy nastepny
napis z diakrytykiem obroni sie sam.

## #16 - `npx playwright test | tail -3` potrafi ukryc czerwone

Pomiar z F1-03: przy szesciu falach reporter `list` wypisuje najpierw liste
nazw, potem `N failed`, potem `N skipped` i `N passed`. Trzy ostatnie linie
pokazaly wtedy `8 skipped / 52 passed` i wygladalo to na zielono, mimo ze
wyzej stalo `6 failed`. Commit poszedl na czerwonym drzewie i trzeba go bylo
poprawiac.

Do konca budowy: podsumowanie testow czytamy `tail -12` albo jawnym
`grep -E "failed|passed"`, nigdy `tail -3`.

Sama przyczyna faili jest tez lekcja o testach: `locator(...).first()`
i liczenie po CALYM dokumencie sa kruche na playgroundzie, ktory rosnie
z kazdym issue. Plonacy napis dolozyl kilkanascie kopii ozdoby `ogien`
i dwa testy z F1-01 oraz jeden z F1-02 zaczely mierzyc co innego niz
mierzyly wczoraj. Selektory zawezone do konkretnej sekcji i do `aria-label`.

## #17 - podmiana klatki na reduced-motion musi byc synchroniczna

Znalezisko z F1-05, zlapane testem na 390 px (nie z kodu). Pierwsza wersja
`uzyjKlatki` startowala od `useState(pozycja.plik)` i poprawiala zrodlo dopiero
w `useEffect`. Dla komponentow montowanych PO hydracji - plomieni plonacego
napisu, ktore powstaja dopiero po zmierzeniu szerokosci przez ResizeObserver -
zostawialo to widoczna klatke ruchomego GIF-a mimo wlaczonego reduced motion.
Na 1280 px test tego nie lapal, na 390 px lapal.

Naprawa u zrodla, nie w tescie: `useSyncExternalStore` z `matchMedia`. Klient
dostaje prawidlowa wartosc juz przy PIERWSZYM renderze kazdego komponentu,
niezaleznie od tego, kiedy ten komponent powstal, a serwer zawsze wersje
animowana, wiec strona bez JS nadal sie rusza. Krocej niz wersja na efekcie
i bez okna, w ktorym Z11 jest lamane.

## #18 - AC issue F2-02a jest kopia AC issue F2-02b, wykonane w dwoch commitach

Znalezisko z F2-02a. Tytul issue zawęża zakres wprost do punktow 2-6, 9 i 10
z `plan/05 B1` (kafel, statek, napis-obrazek, podtytul, pas-goniec, pas dolny,
dwa stwory rogowe), a tablica ogloszen i druk wstepny sa osobnym issue F2-02b.
Tymczasem AC F2-02a jest slowo w slowo AC F2-02b i zada rzeczy, ktorych ten
zakres nie zawiera: minimum 12 animowanych elementow, szesciu roznych
`animation-delay` na ozdobach tablicy, pola `ALEKSANDRA` z `readonly`
i `elementFromPoint` na srodku kazdego przycisku. Szkielet z punktow 2-6, 9, 10
ma dokladnie szesc animowanych elementow, wiec progu 12 nie da sie osiagnac
bez wykonania F2-02b - AC F2-02a jest w swoim wlasnym zakresie sprzeczne.

Dyspozycja: nie zgadujemy, ktora polowa AC jest prawdziwa. Wykonane oba issues
po kolei, kazde swoim commitem, a kryteria wspolne (>= 12 animowanych, >= 6
roznych opoznien, pole readonly, `elementFromPoint`) zmierzone i wpisane jako
dowod przy F2-02b, bo dopiero tam zakres pozwala im byc prawda. Przy F2-02a
odhaczone to, co lezy w jego zakresie: kafel `repeat` bez `background-size`,
komplet elementow szkieletu, wzorzec ROGI i zero obrotu w DOM bramy.

## 19. Dwa `pnpm dev` na jednym katalogu `.next` psuja hydracje (F3-03)

**Kontekst.** Zeby udowodnic AC F3-03 „klucz odpiety w dev -> werdykt awaryjny",
uruchomilem drugi serwer `pnpm dev -p 3001` z pustym `OPENROUTER_API_KEY`,
zostawiajac pierwszy na 3000.

**Objaw.** `/egzamin` na 3000 przestal reagowac na JavaScript: `onChange` textarea
nie odpalal (`sessionStorage` zostawal pusty), a klik w `ODDAJ PRACĘ KOMISJI`
wysylal formularz NATYWNIE, GET-em z trescia odpowiedzi w query stringu
(`GET /egzamin?odpowiedz=...` w logu serwera). W konsoli jedyny slad to
`Failed to load resource: 404`. Wyglada jak blad komponentu; nie jest nim.

**Przyczyna.** Oba serwery pisza do tego samego `.next/`. Drugi nadpisuje manifesty
chunkow pierwszego, wiec przegladarka dostaje HTML z odwolaniem do chunka, ktorego
juz nie ma. Bez chunka nie ma hydracji, a bez hydracji `preventDefault` nigdy nie
biegnie i formularz zachowuje sie jak w 1998 roku.

**Wniosek operacyjny.** Jeden `pnpm dev` naraz. Dowod wymagajacy innego env
zbieraj po kolei: zatrzymaj serwer, `rm -rf .next`, uruchom z nowym env, zmierz,
wroc. Ta sama zasada co przy `pnpm build` psujacym dzialajacy `pnpm dev`.

**Koszt pomylki tym razem:** dwa przebiegi zrzutow do wyrzucenia i jedna falszywa
hipoteza o bledzie w `DrukOdpowiedzi`.

## 20. Skrypt `iframe_api` YouTube jako jedyny wyjatek od Z14 (F5-03)

**Kontekst.** Z14 zakazuje zaleznosci runtime spoza `next`, `react`, `react-dom`
i `@vercel/blob`, a takze skryptow z obcych domen. Aleksandra zamowila koncert
Post Malone Tiny Desk. Legalnie mozna go odtworzyc WYLACZNIE oficjalnym
odtwarzaczem osadzonym (plan/09 A) - pobranie audio do repo to naruszenie
regulaminu i prawa autorskiego.

**Decyzja.** `https://www.youtube.com/iframe_api` jest jedynym dozwolonym
skryptem zewnetrznym w projekcie. Laduje sie DOPIERO po kliknieciu `WLACZ`,
wiec nie wchodzi w budzet pierwszego ladowania i nie generuje ani jednego
zadania do YouTube przed gestem Aleksandry (dowod: `tests/f5-03.spec.ts`).

**Konsekwencje.**
- Odtwarzacz jest WIDOCZNY i ma minimum 200x200 px (260x200 desktop,
  200x200 na 390 px). Ukrycie go lamaloby ten sam regulamin, ktorym uzasadniamy
  cale osadzenie.
- Konstruktor `YT.Player` dostaje jawny `host: "https://www.youtube-nocookie.com"`.
  Bez tego `onReady` nigdy nie przychodzi i radio zawsze wpada w tryb awaryjny.
- Odtwarzacz montuje sie RAZ i zostaje w DOM takze po `WYLACZ`. Pierwsza wersja
  odmontowywala `iframe` razem ze stanem `gra`, przez co `pauseVideo()` nie mialo
  czego zatrzymac (`getPlayerState()` nigdy nie wracalo `2`), a ponowne `WLACZ`
  startowaloby koncert od poczatku.
- `window.jwpRadio` to uchwyt diagnostyczny do odtwarzacza (wzorzec `jwpAwaria`
  z F2-01). Bez niego kryterium "pauza ponizej 100 ms" jest niemierzalne.
