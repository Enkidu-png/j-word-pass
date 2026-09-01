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

type Patch = {
  [K in Etap]?: Partial<NonNullable<StanJWP[K]>>;
};

let oczekujacy: Patch | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

function scal(stan: StanJWP | null, patch: Patch): StanJWP {
  const bazowy: StanJWP = stan ?? { v: 1, egzamin: null, quiz: null, ogien: null };
  const wynik: StanJWP = { ...bazowy, v: 1 };
  for (const etap of Object.keys(patch) as Etap[]) {
    // merge plytki per etap (kontrakt plan/02 G)
    wynik[etap] = { ...(bazowy[etap] ?? {}), ...patch[etap] } as never;
  }
  return wynik;
}

// Zapis z debounce 400 ms: kolejne wywolania sklejaja sie w jeden patch,
// zeby pisanie w textarea nie waliło w sessionStorage na kazdy znak.
export function zapiszStan(patch: Patch): void {
  if (typeof window === "undefined") return;
  oczekujacy = { ...oczekujacy, ...patch };
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    const doZapisu = oczekujacy;
    oczekujacy = null;
    timer = null;
    if (!doZapisu) return;
    try {
      window.sessionStorage.setItem(KLUCZ_STANU, JSON.stringify(scal(czytajStan(), doZapisu)));
    } catch {
      // brak miejsca / tryb prywatny - kandydat traci zapis, nie strone
    }
  }, 400);
}

// Zapis NATYCHMIASTOWY - do kamieni milowych (werdykt etapu), gdzie debounce
// jest realnym ryzykiem: kandydat, ktory odswiezy strone w ciagu 400 ms od
// werdyktu, straciłby wynik. Pisanie po kazdym znaku dalej idzie przez debounce.
export function zapiszTeraz(patch: Patch): void {
  if (typeof window === "undefined") return;
  if (timer) clearTimeout(timer);
  timer = null;
  const doZapisu = { ...oczekujacy, ...patch };
  oczekujacy = null;
  try {
    window.sessionStorage.setItem(KLUCZ_STANU, JSON.stringify(scal(czytajStan(), doZapisu)));
  } catch {
    // brak miejsca / tryb prywatny - kandydat traci zapis, nie strone
  }
}

export function wyczyscStan(): void {
  if (typeof window === "undefined") return;
  if (timer) clearTimeout(timer);
  timer = null;
  oczekujacy = null;
  try {
    window.sessionStorage.removeItem(KLUCZ_STANU);
  } catch {
    // jw.
  }
}
