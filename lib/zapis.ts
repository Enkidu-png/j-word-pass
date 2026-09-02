import { put } from "@vercel/blob";

// Wspolny zapis JSON-a do PRYWATNEGO store'a `jwp-zgloszenia` (plan/02 D, F10-01).
//
// Poza produkcja NIE piszemy nic, tylko log - inaczej kazdy przebieg suity
// zasmieca platny store (w v1 uzbieralo sie 332 pliki, znalezisko F7-16).
// Blad Bloba LECI DALEJ: wolajacy decyduje, czy to blad uzytkownika (druk),
// czy tylko wpis w logu (ocena).

export function losowe6(): string {
  return Math.random().toString(36).slice(2, 8).padEnd(6, "0");
}

export async function zapiszJSON(sciezka: string, dane: unknown): Promise<"dev-log" | "blob"> {
  const tresc = JSON.stringify(dane);
  if (!process.env.BLOB_READ_WRITE_TOKEN || process.env.NODE_ENV !== "production") {
    console.log(`[blob dev-log] ${sciezka} ${tresc}`);
    return "dev-log";
  }
  await put(sciezka, tresc, {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
  });
  return "blob";
}
