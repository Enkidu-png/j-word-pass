import { normalizuj } from "@/lib/quiz";

// BRAMA WSTEPU (F10-02). Pytanie i odpowiedz siedza w data/komisja.json,
// tu jest tylko porownanie i miejsce przechowania.
//
// To PROG ZWALNIAJACY, nie uwierzytelnienie: odpowiedz przechodzi przez
// przegladarke, wiec ktos uporczywy ja odczyta. Chroni przed przypadkowym
// ruchem i botami (DECISIONS #24).

export const KLUCZ_WSTEPU = "jwp.wstep";

export function wstepPasuje(wpis: string, odpowiedz: string): boolean {
  const w = normalizuj(wpis);
  return w.length > 0 && w === normalizuj(odpowiedz);
}

// Wartosc do naglowka `x-jwp-klucz` (F10-03). Poza przegladarka pusty string.
export function kluczWstepu(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KLUCZ_WSTEPU) ?? "";
  } catch {
    return "";
  }
}
