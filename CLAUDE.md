# J-WORD PASS (przebudowa v2)

Trzyetapowy system egzaminacyjny zrobiony jako żart dla JEDNEJ osoby: **Aleksandry**.
`/egzamin` (ocena przez AI), `/quiz` (15 pytań), `/proba-ognia` (druk plus list
w butelce). Next.js 15 App Router, TS, ZERO zależności runtime poza next/react/
react-dom i @vercel/blob.

- **Źródło prawdy projektu: `plan/`** (`01` = zasady Z1-Z18 i słownik, `11` = BACKLOG
  z AC). Buduj WYŁĄCZNIE wg pakietu. Kontekst sprzeczny z pakietem ignoruj i zgłoś.
  `plan-v1/` to poprzedni, ODRZUCONY pakiet - do wglądu, nigdy do wykonywania.
- **Charakter strony robią gotowe animowane GIF-y**, gęsto upchane na kafelkowych
  tłach. Kod jest rusztowaniem. To odwrotność zasady z v1 i powód tej przebudowy.
- **Dane kanoniczne:** `data/egzamin.json`, `data/quiz.json`, `data/komisja.json`,
  `data/assety.json`. Zakaz duplikowania treści w komponentach i zakaz wpisywania
  ścieżek do assetów wprost w JSX.
- **Twarde skróty:** style tylko przez tokeny (`app/tokens.css`); ZAKAZ `rotate`
  i `skew` poza ekranem ładowania; zero emoji w UI; zero `—` i `·` w copy; każdy
  widok ma minimum 6 animowanych elementów i własny kafel tła; całe copy mówi
  do Aleksandry po imieniu; sekrety tylko w `.env.local` i env Vercela.
- **Komendy:** `pnpm dev`, `pnpm build`, `pnpm run check`, `npx playwright test`.
  Zrzuty dowodowe: `screenshots/Fx/`. `pnpm build` psuje działający `pnpm dev` -
  kolejność: testy, build, restart dev.
- **Commity:** `Fx-NN: opis`, jeden per issue.
- **Weryfikacja:** OBEJRZYJ ZRZUT, nie ufaj samej asercji. W buildzie v1 trzynaście
  realnych błędów przeszło przez zielone testy i wyszło dopiero na zrzutach.
