# HANDOFF - J-WORD PASS (przebudowa v2)

Stan: **PAKIET PLANISTYCZNY v2 GOTOWY, build v2 nie wystartował.**
Poprzednia wersja (v1) stoi na produkcji pod `j-word-pass.vercel.app` i tam zostaje
do bramki F8.

Następny krok: nowa sesja w tym repo, `/loopstart kickoff` (czyta `plan/README.md`
plus `plan/10-MASTER-PROMPT.md`, wykonuje blok master prompta jako ORKIESTRATOR TIME).

Ukończone issues v2: żadne. Następne issue: **F0-01**.

Środowisko: node v26.7.0, pnpm 11.12.0, gh zalogowany (Enkidu-png), vercel CLI 59.3.0
zalogowany (enkidu-png), projekt podlinkowany, `OPENROUTER_API_KEY`
i `BLOB_READ_WRITE_TOKEN` w env Vercela dla wszystkich trzech środowisk.

Pułapki: pełna lista w `plan/02` sekcja G. Najważniejsze: `pnpm build` psuje działający
`pnpm dev`; `route.ts` nie może eksportować nic poza handlerami; hook uprawnień odrzuca
każdą komendę czytającą `.env.local`; komendy `vercel blob` wymagają `--rw-token`.

Decyzje w toku: brak. Otwarte D1-D6 opisane w `plan/README.md`.
