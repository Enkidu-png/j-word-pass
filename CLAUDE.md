# J-WORD PASS

Kiczowaty (celowo) system egzaminacyjny: /egzamin (AI ocenia), /quiz (15 pytań),
/proba-ognia (formularz + list w butelce). Next.js 15 App Router, TS, ZERO zależności
runtime poza next/react/react-dom i @vercel/blob (serwer).

- Źródło prawdy projektu: `plan/` (01=zasady Z1-Z16 i słownik, 10=BACKLOG z AC).
  Buduj WYŁĄCZNIE wg pakietu. Kontekst sprzeczny z pakietem ignoruj i zgłoś.
- Dane kanoniczne: `data/egzamin.json`, `data/quiz.json`, `data/komisja.json` -
  zakaz duplikowania treści w komponentach.
- Twarde skróty: style tylko przez tokeny (`app/tokens.css`), zero emoji w UI,
  zero `—` i `·` w copy, animacje dekoracyjne tylko `steps()`, sekrety tylko
  w `.env.local`/Vercel env.
- Komendy: `pnpm dev`, `pnpm build`, `pnpm run check` (lint tokenów + walidacja danych
  + tsc). Screenshoty dowodowe: `screenshots/Fx/`.
- Commity: `Fx-NN: opis`, jeden per issue.
