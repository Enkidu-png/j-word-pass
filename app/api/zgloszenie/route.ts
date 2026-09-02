import { put } from "@vercel/blob";

import { adresZadania, limitPrzekroczony } from "@/lib/limit";

// Zapis zgloszenia Aleksandry. Kontrakt: plan/02 sekcja D. Jeden plik JSON per
// zgloszenie, zero panelu admina (odczyt przez dashboard Vercel Blob).
//
// Store `jwp-zgloszenia` jest PRYWATNY (DECISIONS #6) - zgloszenia niosa adresy
// e-mail, wiec `access: "private"`. Domyslne przyklady z dokumentacji uzywaja
// "public" i na tym store po prostu nie przechodza.

export const runtime = "nodejs";

// Ten plik nie moze eksportowac NIC poza handlerami i konfiguracja segmentu -
// `tsc --noEmit` tego nie lapie, wywala dopiero `pnpm build`.

const LIMIT_BAJTOW = 2 * 1024;

function liczbaWZakresie(wartosc: unknown, min: number, max: number): number | null {
  const n = typeof wartosc === "number" ? wartosc : Number(wartosc);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

function losowe6(): string {
  return Math.random().toString(36).slice(2, 8).padEnd(6, "0");
}

export async function POST(request: Request) {
  // Druk bez auth zapisuje pliki do platnego store'a - limit jest tu jedyna
  // zapora przed pompowaniem go skryptem. Prog nizszy niz w `ocena`, bo
  // Aleksandra sklada zgloszenie raz, nie piec razy na minute.
  if (limitPrzekroczony("zgloszenie", adresZadania(request), 3)) {
    return Response.json(
      { blad: "Aleksandro, Komisja przyjęła już Twój druk. Odczekaj minutę." },
      { status: 429 },
    );
  }

  const surowy = await request.text();
  if (new TextEncoder().encode(surowy).length > LIMIT_BAJTOW) {
    return Response.json(
      { blad: "Aleksandro, Twoje zgłoszenie przekracza dopuszczalną objętość akt. Komisja czyta, ale nie tomami." },
      { status: 413 },
    );
  }

  let cialo: Record<string, unknown>;
  try {
    cialo = JSON.parse(surowy) as Record<string, unknown>;
  } catch {
    return Response.json({ blad: "Aleksandro, Komisja nie potrafi odczytać Twojego druku." }, { status: 400 });
  }

  // Granica zaufania: te same trzy reguly co u klienta, tylko tu obowiazuja naprawde.
  const email = typeof cialo.email === "string" ? cialo.email.trim() : "";
  if (!/.+@.+\..+/.test(email) || email.length > 254) {
    return Response.json(
      { blad: "Aleksandro, ADRES NIE PRZYPOMINA ADRESU. Komisja odsyła Ci druk." },
      { status: 400 },
    );
  }
  const rozmiarButa = liczbaWZakresie(cialo.rozmiarButa, 10, 70);
  if (rozmiarButa === null) {
    return Response.json(
      { blad: "Aleksandro, Twój rozmiar buta wypada poza skalą Komisji (10-70)." },
      { status: 400 },
    );
  }
  const srednicaUchaMm = liczbaWZakresie(cialo.srednicaUchaMm, 5, 500);
  if (srednicaUchaMm === null) {
    return Response.json(
      { blad: "Aleksandro, średnica Twojego ucha wypada poza skalą Komisji (5-500)." },
      { status: 400 },
    );
  }

  // Punkty tez sa granica zaufania: ciche zerowanie wartosci spoza skali
  // zapisywaloby do Bloba druk, ktorego Komisja nigdy nie wystawila.
  const punktyEgzamin = liczbaWZakresie(cialo.punktyEgzamin, 0, 10);
  if (punktyEgzamin === null) {
    return Response.json(
      { blad: "Aleksandro, Twoje punkty z etapu 1 wypadają poza skalą Komisji (0-10)." },
      { status: 400 },
    );
  }
  const punktyQuiz = liczbaWZakresie(cialo.punktyQuiz, 0, 15);
  if (punktyQuiz === null) {
    return Response.json(
      { blad: "Aleksandro, Twoje punkty z etapu 2 wypadają poza skalą Komisji (0-15)." },
      { status: 400 },
    );
  }

  const zgloszenie = {
    email,
    rozmiarButa,
    srednicaUchaMm,
    punktyEgzamin,
    punktyQuiz,
    ts: new Date().toISOString(),
  };
  const sciezka = `zgloszenia/${zgloszenie.ts}-${losowe6()}.json`;

  // Bez tokena (lokalny dev) formularz ma DZIALAC, nie wywalac sie na infrastrukturze.
  // Poza produkcja NIE piszemy do Bloba nawet z tokenem: `.env.local` go ma, wiec kazdy
  // przebieg suite dopisywal smieci do platnego store'a (332 pliki przed sprzatnieciem).
  if (!process.env.BLOB_READ_WRITE_TOKEN || process.env.NODE_ENV !== "production") {
    console.log(`[zgloszenie dev-log] ${sciezka} ${JSON.stringify(zgloszenie)}`);
    return Response.json({ tryb: "dev-log", sciezka });
  }

  try {
    const blob = await put(sciezka, JSON.stringify(zgloszenie), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return Response.json({ tryb: "blob", sciezka: blob.pathname });
  } catch {
    // Teatr w kliencie nie moze zalezec od Bloba - klient dostaje 502 i pokazuje
    // stempel o pamieci ulotnej, a zgloszenie zostaje w logu (plan/07 B).
    console.log(`[zgloszenie awaria-bloba] ${sciezka} ${JSON.stringify(zgloszenie)}`);
    return Response.json({ blad: "Aleksandro, Komisja zapisała Twój druk w pamięci ulotnej." }, { status: 502 });
  }
}
