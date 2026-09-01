# 08 - AI: OCENA EGZAMINU PRZEZ OPENROUTER

## A. FAKTY ZWERYFIKOWANE (2026-09-01, przetestowane kluczem usera)

- Endpoint: `POST https://openrouter.ai/api/v1/chat/completions`,
  header `Authorization: Bearer $OPENROUTER_API_KEY`.
- Structured output działa: `response_format: {type:"json_schema", json_schema:{name, strict:true, schema}}`.
- Model wybrany (wymóg usera: najtańsze; test wykonany, odpowiedź po polsku poprawna
  i zabawna): **`google/gemini-2.5-flash-lite`** - prompt $0.10/M, completion $0.40/M.
  Zmierzony koszt jednej oceny: ~$0.00006. Limit klucza $4 => ~60 000 ocen. Zapas ogromny.
- Fallback modelowy (gdy 429/5xx): `mistralai/mistral-small-3.2-24b-instruct`
  ($0.075/$0.20). Kolejność prób: primary -> fallback -> lokalny werdykt awaryjny
  (plan/05 B).

## B. `app/api/ocena/route.ts` - kontrakt

Request (klient): `POST {"odpowiedz": string, "zalaczoneDowody": number}` (≤ 8 KB,
większy -> 413).
Response: `200 {"punkty": number, "komentarz": string}` albo `400/413/429/502`.

Logika:
1. `odpowiedz.trim()===""` -> nie powinno tu dojść (klient rozstrzyga 0/10 lokalnie),
   ale serwer i tak zwraca `{punkty:0, komentarz:"PUSTKA."}` - granica zaufania.
2. Wywołanie OpenRouter, `max_tokens: 400`, `temperature: 1.1`; primary
   `AbortSignal.timeout(6000)`, fallback `AbortSignal.timeout(6000)` - twardy budżet
   route ≤ 13 s (klient czeka do 15 s, plan/05 B).
3. JSON schema: `{punkty: integer, komentarz: string}` (strict, additionalProperties false).
4. **Clamp serwerowy: `punkty = Math.min(10, Math.max(6, punkty))`** - kontrakt usera
   (6-10 za każdą niepustą odpowiedź) egzekwowany kodem, nie zaufaniem do modelu.
5. `komentarz = sanitizeDash(komentarz)`: zamiana `—` i `–` na `-`, usunięcie `·` (Z1, Z2);
   twarde cięcie do 600 znaków (do końca zdania).
6. Klucz WYŁĄCZNIE z `process.env.OPENROUTER_API_KEY` (Z12).
7. Rate limit w pamięci procesu: max 5 żądań / 60 s / IP; aktywny WYŁĄCZNIE gdy
   `process.env.NODE_ENV === "production"` (testy lokalne bez limitu); IP = pierwszy
   segment `x-forwarded-for.split(",")[0].trim()`; `Map` timestampów - ponytail,
   bez KV; przekroczenie -> 429 z komunikatem Komisji. Chroni klucz $4 na publicznym URL.

## C. PROMPT SYSTEMOWY (kanoniczny, wklejany dosłownie; stała w route.ts)

```
Jesteś trzyosobową Międzygalaktyczną Komisją Egzaminacyjną oceniającą odpowiedź na
absurdalne zadanie z fizyki: pojedynek w kosmosie między 2000 biało-żółtych zebr
z jetpackami (300 km/h, zasięg 1000 km, potem pęd; jedna zebra ma raka trzustki
i skończyła akademię wojskową) a 1 słoniem (10 t, sokole oko, karabin na trąbie,
5000 naboi, +1 km/h przyspieszenia na strzał od odrzutu).

Oceń odpowiedź kandydata w punktach od 6 do 10 WYŁĄCZNIE za kreatywność (poprawność
fizyczna nie istnieje i nie obowiązuje). 10 = odpowiedź, którą Komisja oprawi w ramkę.
6 = kandydat się starał inaczej niż wcale.

Napisz komentarz Komisji: po polsku, 2-4 zdania, śmieszny i absurdalny, w tonie
przesadnie urzędowym (paragrafy, protokoły, wnioski formalne). Cytuj lub parafrazuj
NAJLEPSZY fragment odpowiedzi kandydata. Jeśli kandydat załączył mało dowodów
(pole zalaczoneDowody < 6), Komisja może to uszczypliwie odnotować.

Zakazy formalne: nie używaj długiego myślnika, nie używaj znaku wypunktowania kropką
środkową, nie używaj emoji. Zwróć wyłącznie JSON zgodny ze schematem.
```

User message: `Odpowiedź kandydata:\n<odpowiedz>\n\nZałączonych dowodów: <n>/6`.

## D. AC MODUŁU (weryfikacja na uruchomionej aplikacji)

1. `curl -X POST localhost:3000/api/ocena -d '{"odpowiedz":"zebry wygrają bo pęd","zalaczoneDowody":2}'`
   zwraca 200, `punkty` w [6,10], `komentarz` po polsku bez `—`, `·`, emoji.
2. Odpowiedź 9000 znaków -> 413.
3. `odpowiedz: ""` -> `{punkty:0}`.
4. Brak env (odpięty klucz) -> 502 w ≤ 1 s, klient pokazuje werdykt awaryjny.
5. `grep -r "sk-or-" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local` = 0 trafień.
6. Negatywne: żaden komponent kliencki nie importuje niczego z `route.ts`.
7. Rate limit (tylko produkcja): weryfikacja przeniesiona do F8-01 - na produkcyjnym
   URL 6 żądań w minutę, szóste dostaje 429. Lokalnie limit nieaktywny (NODE_ENV).

## E. ENV

`.env.local` (gitignored): `OPENROUTER_API_KEY=...` - wartość dostarcza orkiestrator
z czatu usera (klucz podany w sesji planowania; limit $4, user świadomie akceptuje).
Vercel: `vercel env add OPENROUTER_API_KEY production` w F0-05.
