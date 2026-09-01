import manifest from "@/data/assety.json";

// Jedyne wejscie do biblioteki assetow. Komponenty pytaja o pozycje po `id`
// i nigdy nie znaja sciezki do pliku (plan/03 D2). Manifest jest walidowany
// przez scripts/lint-tokens.mjs, wiec tu nie ma juz co sprawdzac w runtime.

export type Rola = "ozdoba" | "kafel" | "pas" | "kursor" | "plakietka";

export type Pozycja = {
  id: string;
  plik: string;
  szerokosc: number;
  wysokosc: number;
  opis: string;
  rola: Rola;
  "klatka-statyczna"?: string;
};

export const POZYCJE = manifest.pozycje as Pozycja[];

const PO_ID = new Map(POZYCJE.map((p) => [p.id, p]));

export function assetPo(id: string): Pozycja {
  const p = PO_ID.get(id);
  // Blad w `id` ma padac glosno w developmencie, a nie renderowac pusty <img>
  // z zepsutym ukladem, ktorego nikt nie zauwazy na zrzucie.
  if (!p) throw new Error(`Brak pozycji "${id}" w data/assety.json`);
  return p;
}

export function pozycjeRoli(rola: Rola): Pozycja[] {
  return POZYCJE.filter((p) => p.rola === rola);
}
