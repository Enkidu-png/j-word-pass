// Silnik ruchu klasy `ceremonia` (Z8): jednorazowa, wyzwolona, zawsze do pominiecia.
// Dekoracje (`gif-less`) sa czystym CSS i nie potrzebuja JS.

export type KrokCeremonii = { czasMs: number; akcja: () => void };

export function chceRedukcjiRuchu(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const PRZERWANE = Symbol("pominieto ceremonie");

function czekaj(ms: number, sygnal: AbortSignal): Promise<void> {
  return new Promise((spelnij, odrzuc) => {
    if (sygnal.aborted) return odrzuc(PRZERWANE);
    const id = setTimeout(() => {
      sygnal.removeEventListener("abort", przerwij);
      spelnij();
    }, ms);
    const przerwij = () => {
      clearTimeout(id);
      odrzuc(PRZERWANE);
    };
    sygnal.addEventListener("abort", przerwij, { once: true });
  });
}

/**
 * Odprawia kroki sekwencyjnie: czeka `czasMs`, wykonuje `akcja`, idzie dalej.
 *
 * Pominiecie (Esc albo przycisk POMIN CEREMONIE, Z8/Z9) przerywa czekanie
 * i NATYCHMIAST wykonuje ostatni krok, czyli stan koncowy - kandydat nigdy nie
 * traci wyniku przez pominiecie teatru.
 *
 * `prefers-reduced-motion` (Z10) skraca calosc do jednego kroku 300 ms.
 */
export async function odprawCeremonie(
  kroki: KrokCeremonii[],
  sygnalPominiecia: AbortSignal,
): Promise<void> {
  if (kroki.length === 0) return;
  const ostatni = kroki[kroki.length - 1];

  if (chceRedukcjiRuchu()) {
    try {
      await czekaj(300, sygnalPominiecia);
    } catch {
      // pominieto w trakcie skroconej wersji - stan koncowy i tak nalezy sie kandydatowi
    }
    ostatni.akcja();
    return;
  }

  for (const krok of kroki) {
    try {
      await czekaj(krok.czasMs, sygnalPominiecia);
    } catch {
      ostatni.akcja();
      return;
    }
    krok.akcja();
  }
}
