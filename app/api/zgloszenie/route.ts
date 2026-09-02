import { adresZadania, limitPrzekroczony } from "@/lib/limit";
import { losowe6, zapiszJSON } from "@/lib/zapis";

// Zapis zgloszenia Aleksandry. Kontrakt: plan/02 sekcja D. Jeden plik JSON per
// zgloszenie, zero panelu admina (odczyt przez dashboard Vercel Blob).
//
// Store `jwp-zgloszenia` jest PRYWATNY (DECISIONS #6) - zgloszenia niosa adresy
// e-mail, wiec `access: "private"`. Domyslne przyklady z dokumentacji uzywaja
// "public" i na tym store po prostu nie przechodza.

export const runtime = "nodejs";

// Ten plik nie moze eksportowac NIC poza handlerami i konfiguracja segmentu -
// `tsc --noEmit` tego nie lapie, wywala dopiero `pnpm build`.

// F10-01: druk niesie teraz OBIE odpowiedzi egzaminacyjne w calosci, wiec 2 KB
// juz nie starcza. Gorna granica to dwa razy limit `/api/ocena` plus metryczka.
const LIMIT_BAJTOW = 24 * 1024;

function liczbaWZakresie(wartosc: unknown, min: number, max: number): number | null {
  // Bez tego strażnika `null`, `true` i `[]` przechodzily przez `Number()` jako
  // 0 albo 1, czyli granica zaufania obiecywala wiecej, niz sprawdzala.
  if (typeof wartosc !== "number") return null;
  const n = wartosc;
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

// F10-01: praca Aleksandry idzie do akt w calosci, ale nie bez konca.
const tekst = (wartosc: unknown): string =>
  typeof wartosc === "string" ? wartosc.slice(0, 8 * 1024) : "";

const punktyLubNull = (wartosc: unknown): number | null =>
  liczbaWZakresie(wartosc, 0, 10);

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
  if (email.length > 254) {
    return Response.json(
      { blad: "Aleksandro, Twój adres przekracza dopuszczalną objętość akt." },
      { status: 413 },
    );
  }
  if (!/.+@.+\..+/.test(email)) {
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
  // F9-04: etap 1 to dwie czesci po 10 punktow
  const punktyEgzamin = liczbaWZakresie(cialo.punktyEgzamin, 0, 20);
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

  // F10-01: jeden plik ma dawac PELNY obraz podejscia, czyli obie odpowiedzi
  // z obydwoma werdyktami plus wynik quizu. Braki nie odsylaja druku - starsze
  // podejscia (albo padniety sessionStorage) maja sie zapisac tak czy owak.
  const zgloszenie = {
    email,
    rozmiarButa,
    srednicaUchaMm,
    punktyEgzamin,
    punktyQuiz,
    czesc1: {
      odpowiedz: tekst(cialo.odpowiedz),
      punkty: punktyLubNull(cialo.punkty),
      komentarz: tekst(cialo.komentarz),
    },
    czesc2: {
      odpowiedz: tekst(cialo.odpowiedz2),
      punkty: punktyLubNull(cialo.punkty2),
      komentarz: tekst(cialo.komentarz2),
    },
    ts: new Date().toISOString(),
  };
  const sciezka = `zgloszenia/${zgloszenie.ts}-${losowe6()}.json`;

  try {
    // Bez tokena i poza produkcja `zapiszJSON` schodzi na log - inaczej kazdy
    // przebieg suity dosypywalby smieci do platnego store'a (znalezisko F7-16).
    const tryb = await zapiszJSON(sciezka, zgloszenie);
    return Response.json({ tryb, sciezka });
  } catch {
    // Teatr w kliencie nie moze zalezec od Bloba - klient dostaje 502 i pokazuje
    // stempel o pamieci ulotnej, a zgloszenie zostaje w logu (plan/07 B).
    console.log(`[zgloszenie awaria-bloba] ${sciezka} ${JSON.stringify(zgloszenie)}`);
    return Response.json({ blad: "Aleksandro, Komisja zapisała Twój druk w pamięci ulotnej." }, { status: 502 });
  }
}
