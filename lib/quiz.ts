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
