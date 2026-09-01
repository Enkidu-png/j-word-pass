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
