import { normalizuj } from "@/lib/quiz";

// F10-03: prog zwalniajacy przed PLATNYMI endpointami. Klient dokleja naglowek
// `x-jwp-klucz` z odpowiedzia z bramy wstepu, serwer porownuje ze zmienna
// srodowiskowa JWP_KLUCZ_WSTEPU (Z12 - wartosc zyje wylacznie w env).
//
// To NIE jest uwierzytelnienie: odpowiedz przechodzi przez przegladarke, wiec
// ktos uporczywy ja odczyta. Chroni przed przypadkowym ruchem i botami, a przed
// uporczywym naduzyciem broni limit 5/min i limit kwotowy klucza OpenRouter
// (DECISIONS #24).
//
// Zamek jest ZAMKNIETY z braku klucza po stronie serwera: srodowisko bez
// JWP_KLUCZ_WSTEPU odbija wszystko, zamiast przepuszczac wszystko.
export function brakKlucza(request: Request): Response | null {
  const oczekiwany = process.env.JWP_KLUCZ_WSTEPU ?? "";
  const podany = request.headers.get("x-jwp-klucz") ?? "";
  if (oczekiwany !== "" && normalizuj(podany) === normalizuj(oczekiwany)) return null;
  return Response.json(
    { blad: "Aleksandro, Komisja nie rozpoznaje petenta. Wróć do bramy wstępu." },
    { status: 401 },
  );
}
