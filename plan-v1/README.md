# PAKIET PLANISTYCZNY: J-WORD PASS

Kiczowaty (celowo) trzyetapowy system egzaminacyjny: egzamin z fizyki oceniany przez AI,
quiz 15 pytań, formularz „próba ognia" z listem w butelce. Next.js 15, deploy Vercel.
Tryb wykonania: **TIME** (orkiestrator + sztafeta workerów).

## Pliki

| Plik | Co zawiera |
|---|---|
| `01-ANALIZA-I-ZASADY.md` | analiza 3 referencji (MFSA z kodu, Cameron's World, Dino's), twarde zasady Z1-Z16, słownik 20 pojęć, anty-spec globalna |
| `02-FUNDAMENT.md` | stack, tokeny CSS, dane kanoniczne (egzamin/quiz/komisja), zapis zgłoszeń (Vercel Blob), konwencje |
| `03-SILNIK-ANIMACJI.md` | system przekrojowy: gif-less (7 wariantów), kafle tła, ceremonie, licznik, pieczątka, playground /dev/animacje |
| `04-SHELL-I-BRAMA.md` | layout wspólny (pass-o-metr, marquee, radio, webring) + etap 0 z przyciskiem-uciekinierem |
| `05-EGZAMIN.md` | scena kosmos (słoń/zebry), karty dowodowe przeciągane (pointer events), ceremonia narada-komisji |
| `06-QUIZ.md` | segregator 15 teczek, 15 unikalnych signature, maszyna prawdy, płonące przejście |
| `07-PROBA-OGNIA.md` | formularz OGN-3/TAJ (email, but, ucho), spalenie, list w butelce, pergamin TAJNE |
| `08-AI-KOMISJA.md` | OpenRouter (gemini-2.5-flash-lite, przetestowany), prompt kanoniczny, clamp 6-10, sanityzacja |
| `09-MASTER-PROMPT.md` | kontrakt orkiestratora TIME (zasady 1-10, pętla /loop, kick-starter) + uwagi operacyjne |
| `11-QUIZ-TRESC.md` | kanoniczna treść 15 pytań quizu (przepisywana 1:1 do data/quiz.json w F0-03) |
| `10-BACKLOG.md` | fazy F0-F8, 29 issues z AC, CZYTAJ: i dowodami; F7-ZNALEZISKA; bramka F8 |

## Jak wystartować (TL;DR)

1. Otwórz NOWE okno Claude Code w `~/repos/j-word-pass`.
2. Wpisz `/loopstart kickoff` - skill przeczyta ten pakiet, zweryfikuje środowisko
   i wykona blok z `09-MASTER-PROMPT.md` (łącznie z pętlą /loop).
3. Po F2 dostaniesz URL preview. Przy `STOP-GATE`/`BLOCKED-ASK-USER` odpowiadasz w czacie.
4. Kontynuacja po handoffie: `/clear` + kick-starter wypisany przez poprzednią sesję.

## Co dostarcza user po drodze

- Decyzja przy bramce F8 (zgoda na deploy produkcyjny, opcjonalnie domena).
- Nic więcej: klucz OpenRouter jest już w `.env.local`, konta GitHub/Vercel zalogowane.

## Decyzje otwarte

- **D1. Nazwa „J-word":** nie rozwijamy, czym jest J-słowo - strona nigdzie tego nie
  wyjaśnia (feature, nie brak: urząd nie tłumaczy się z nazw).
- **D2. Font pikselowy:** dozwolony w F5/F6 jako self-hosted woff2, decyzja workera
  z wpisem w DECISIONS.md (plan/02 B).
- **D3. Panel odczytu zgłoszeń:** świadomie brak (YAGNI) - dashboard Vercel Blob.
- **D4. Repo publiczne:** tak (zero sekretów w kodzie). Gdyby user wolał prywatne,
  zmiana jednym `gh repo edit --visibility` - nie blokuje niczego.
