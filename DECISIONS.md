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
