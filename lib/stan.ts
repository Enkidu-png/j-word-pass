// Kontrakt stanu kandydata z plan/02 sekcja G. Jeden klucz, jeden obiekt,
// wylacznie sessionStorage (Z11). Jedyny localStorage w projekcie to `jwp.audio`.

export type StanJWP = {
  v: 1;
  egzamin: {
    odpowiedz: string;
    zalaczone: string[];
    punkty: number | null;
    komentarz: string | null;
  } | null;
  quiz: { odpowiedzi: Record<number, string>; punkty: number | null } | null;
  ogien: {
    email: string;
    rozmiarButa: number | null;
    srednicaUchaMm: number | null;
    wyslano: boolean;
  } | null;
};

export const KLUCZ_STANU = "jwp.v1";

export type Etap = "egzamin" | "quiz" | "ogien";

export function czytajStan(): StanJWP | null {
  if (typeof window === "undefined") return null;
  try {
    const surowy = window.sessionStorage.getItem(KLUCZ_STANU);
    if (!surowy) return null;
    const stan = JSON.parse(surowy) as StanJWP;
    return stan?.v === 1 ? stan : null;
  } catch {
    // uszkodzony wpis nie moze wywrocic strony - kandydat zaczyna od czysta
    return null;
  }
}

// Etap liczy sie za ukonczony dopiero, gdy ma werdykt (punkty), a ogien
// gdy zgloszenie poszlo. To ta wiedza rzadzi PassOMetrem i strazami etapow.
export function etapUkonczony(stan: StanJWP | null, etap: Etap): boolean {
  if (!stan) return false;
  if (etap === "egzamin") return stan.egzamin?.punkty != null;
  if (etap === "quiz") return stan.quiz?.punkty != null;
  return stan.ogien?.wyslano === true;
}

// ponytail: strona czytajaca. `zapiszStan(patch)` z debounce 400 ms i
// `wyczyscStan()` dochodza w F2-04 - shell ich jeszcze nie potrzebuje.
