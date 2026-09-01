// Reguly odpowiedzi quizu (plan/02 C2). Trzymane osobno od UI, bo maszyna
// prawdy z F4-03 liczy punkty tym samym kodem, ktorym pytanie 14 sprawdza wpis.

export function normalizuj(tekst: string): string {
  return tekst
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // zdejmuje diakrytyki: "Mohsa" i "Móhsa" to to samo
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Pytanie otwarte: dopasowanie bez wielkosci liter i bez diakrytykow do listy
// `kluczOtwarte` z data/quiz.json ("mohsa", "skala mohsa").
export function dopasujOtwarte(wpis: string, klucz: string[] | null): boolean {
  if (!klucz || klucz.length === 0) return false;
  const w = normalizuj(wpis);
  return w.length > 0 && klucz.some((k) => normalizuj(k) === w);
}

export type Werdykt15 = "prawda" | "falsz" | "pustka";

type Pytanie = {
  id: number;
  typ: string;
  poprawna: string | null;
  kluczOtwarte: string[] | null;
};

// Werdykt jednego pytania. Nieodpowiedziane to `pustka` - liczy sie jak blad
// (plan/06 B), ale ma wlasny stempel, bo to dwie rozne winy.
export function ocenPytanie(p: Pytanie, odpowiedz: string | undefined): Werdykt15 {
  const wpis = (odpowiedz ?? "").trim();
  if (!wpis) return "pustka";
  if (p.typ === "otwarte") return dopasujOtwarte(wpis, p.kluczOtwarte) ? "prawda" : "falsz";
  return wpis === p.poprawna ? "prawda" : "falsz";
}

export function policzQuiz(
  pytania: Pytanie[],
  odpowiedzi: Record<number, string>,
): { werdykty: Record<number, Werdykt15>; punkty: number } {
  const werdykty: Record<number, Werdykt15> = {};
  let punkty = 0;
  for (const p of pytania) {
    werdykty[p.id] = ocenPytanie(p, odpowiedzi[p.id]);
    if (werdykty[p.id] === "prawda") punkty++;
  }
  return { werdykty, punkty };
}
