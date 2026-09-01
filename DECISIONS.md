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
