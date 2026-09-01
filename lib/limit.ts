// Wspolny limiter zadan dla obu route'ow API. Mieszka w lib/, bo `route.ts`
// w Next.js nie moze eksportowac nic poza handlerami i konfiguracja segmentu.
//
// ponytail: limit w pamieci procesu, bez KV. Sufit: kazda instancja serverless ma
// wlasna Mape, wiec przy wielu instancjach limit jest luzniejszy niz deklarowany.
// Na ruch tej gry wystarcza; KV dopiero gdyby klucz zaczal znikac.

const zadania = new Map<string, number[]>();

/** Adres z naglowka proxy; `lokalny` gdy brak (dev, curl bez proxy). */
export function adresZadania(request: Request): string {
  return (request.headers.get("x-forwarded-for") ?? "lokalny").split(",")[0].trim();
}

/**
 * Dopisuje zadanie i mowi, czy przekroczylo limit w oknie 60 s.
 * Poza produkcja nie limituje - testy i dev maja chodzic bez czekania.
 *
 * `brama` rozdziela liczniki route'ow: bez niej zlozenie druku zjadaloby
 * kandydatce pule ocen egzaminu, bo obie bramy dziela jedna Mape.
 */
export function limitPrzekroczony(brama: string, ip: string, naMinute: number): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const klucz = `${brama}:${ip}`;
  const teraz = Date.now();
  const swieze = (zadania.get(klucz) ?? []).filter((t) => teraz - t < 60_000);
  swieze.push(teraz);
  zadania.set(klucz, swieze);

  // Sprzatanie przy okazji: adresy, ktore przestaly pytac, nie moga zostac w Mapie
  // na zawsze - inaczej rosnie ona przez caly czas zycia instancji.
  for (const [k, znaczniki] of zadania) {
    if (k !== klucz && znaczniki.every((t) => teraz - t >= 60_000)) zadania.delete(k);
  }

  return swieze.length > naMinute;
}
