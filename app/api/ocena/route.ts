// Ocena odpowiedzi egzaminacyjnej przez OpenRouter. Kontrakt: plan/08 sekcja B.
// Klucz zyje wylacznie tutaj, po stronie serwera (Z12).

import egzamin from "@/data/egzamin.json";
import { adresZadania, limitPrzekroczony } from "@/lib/limit";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_PRIMARY = "google/gemini-2.5-flash-lite";
const MODEL_FALLBACK = "mistralai/mistral-small-3.2-24b-instruct";
const LIMIT_BAJTOW = 8 * 1024;

// Tresc zadania NIE jest przepisana do promptu (F9-04) - obie czesci ida
// z data/egzamin.json, wiec zmiana zadania nie wymaga dotykania tego pliku.
function zadanie(czesc: 1 | 2): string {
  if (czesc === 2) return `${egzamin.czesc2.tytul}\n${egzamin.czesc2.tresc}`;
  const dane = egzamin.zalozenia.map((z) => `- ${z.tekst}`).join("\n");
  return `${egzamin.tytul}\n${egzamin.tresc}\n${egzamin.polecenie}\nDANE DO ZADANIA:\n${dane}`;
}

function promptSystemowy(czesc: 1 | 2): string {
  return `Jesteś trzyosobową Międzygalaktyczną Komisją Egzaminacyjną oceniającą odpowiedź
na absurdalne zadanie egzaminacyjne. Treść zadania, na które odpowiadała Aleksandra:

${zadanie(czesc)}

Do egzaminu podchodzi JEDNA osoba i ma na imię Aleksandra. Komisja mówi wyłącznie
DO NIEJ, drugą osobą liczby pojedynczej, w rodzaju żeńskim. W komentarzu MUSISZ
zwrócić się do niej po imieniu, w wołaczu "Aleksandro". Nigdy nie pisz "kandydat",
"kandydatka" ani żadnej formy bezosobowej.

Oceń jej odpowiedź w punktach od 6 do 10 WYŁĄCZNIE za kreatywność (poprawność
fizyczna nie istnieje i nie obowiązuje). 10 = odpowiedź, którą Komisja oprawi w ramkę.
6 = Aleksandra starała się inaczej niż wcale.

Napisz komentarz Komisji: po polsku, 2-4 zdania, śmieszny i absurdalny, w tonie
przesadnie urzędowym (paragrafy, protokoły, wnioski formalne). Cytuj lub parafrazuj
NAJLEPSZY fragment jej odpowiedzi. Wulgaryzmy w treści zadania są celowe i Komisja
się nimi nie gorszy.

Zakazy formalne: nie używaj długiego myślnika, nie używaj znaku wypunktowania kropką
środkową, nie używaj emoji. Zwróć wyłącznie JSON zgodny ze schematem.`;
}

const SCHEMA = {
  name: "werdykt",
  strict: true,
  schema: {
    type: "object",
    properties: { punkty: { type: "integer" }, komentarz: { type: "string" } },
    required: ["punkty", "komentarz"],
    additionalProperties: false,
  },
};

// Z1 + Z2 + Z4: myślniki na dywiz, kropka środkowa i emoji w kosz. Dotyczy takze
// tekstu z AI - prompt to prosba, nie walidator, wiec granica zaufania czysci sama.
function sanitizeDash(tekst: string): string {
  const czysty = tekst
    .replace(/[—–]/g, "-")
    .replace(/·/g, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .trim();
  if (czysty.length <= 600) return czysty;
  const uciety = czysty.slice(0, 600);
  const koniec = Math.max(uciety.lastIndexOf("."), uciety.lastIndexOf("!"), uciety.lastIndexOf("?"));
  return koniec > 0 ? uciety.slice(0, koniec + 1) : uciety;
}


async function zapytajModel(model: string, odpowiedz: string, klucz: string, czesc: 1 | 2) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${klucz}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      temperature: 1.1,
      response_format: { type: "json_schema", json_schema: SCHEMA },
      messages: [
        { role: "system", content: promptSystemowy(czesc) },
        {
          role: "user",
          content: `Odpowiedź Aleksandry:\n${odpowiedz}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`openrouter ${res.status}`);
  const dane = await res.json();
  const tresc = dane?.choices?.[0]?.message?.content;
  const werdykt = JSON.parse(typeof tresc === "string" ? tresc : "null");
  if (typeof werdykt?.punkty !== "number" || typeof werdykt?.komentarz !== "string") {
    throw new Error("odpowiedz modelu nie ma ksztaltu werdyktu");
  }
  return werdykt as { punkty: number; komentarz: string };
}

export async function POST(request: Request) {
  const surowy = await request.text();
  if (new TextEncoder().encode(surowy).length > LIMIT_BAJTOW) {
    return Response.json({ blad: "Aleksandro, Twój wniosek przekracza dopuszczalną objętość akt." }, { status: 413 });
  }

  let cialo: { odpowiedz?: unknown; czesc?: unknown };
  try {
    cialo = JSON.parse(surowy);
  } catch {
    return Response.json({ blad: "Aleksandro, Komisja nie potrafi odczytać Twojego formularza." }, { status: 400 });
  }
  const odpowiedz = typeof cialo.odpowiedz === "string" ? cialo.odpowiedz : null;
  // Granica zaufania: wszystko poza jawna dwojka to czesc 1.
  const czesc: 1 | 2 = cialo.czesc === 2 || cialo.czesc === "2" ? 2 : 1;
  if (odpowiedz === null) {
    return Response.json({ blad: "Aleksandro, Komisja nie znalazła w druku pola z Twoją odpowiedzią." }, { status: 400 });
  }

  // Granica zaufania: klient rozstrzyga pustke lokalnie, serwer i tak jej pilnuje.
  if (odpowiedz.trim() === "") {
    return Response.json({ punkty: 0, komentarz: "PUSTKA." });
  }

  if (limitPrzekroczony("ocena", adresZadania(request), 5)) {
    return Response.json(
      { blad: "Aleksandro, Komisja obraduje. Odczekaj minutę i złóż wniosek ponownie." },
      { status: 429 },
    );
  }

  const klucz = process.env.OPENROUTER_API_KEY;
  if (!klucz) {
    return Response.json({ blad: "Aleksandro, Komisja jest w tej chwili nieosiągalna." }, { status: 502 });
  }

  for (const model of [MODEL_PRIMARY, MODEL_FALLBACK]) {
    try {
      const werdykt = await zapytajModel(model, odpowiedz, klucz, czesc);
      return Response.json({
        punkty: Math.min(10, Math.max(6, Math.round(werdykt.punkty))),
        komentarz: sanitizeDash(werdykt.komentarz),
      });
    } catch {
      // primary padl - probujemy fallbacku; po nim oddajemy 502 i klient
      // pokazuje werdykt awaryjny (plan/05 B)
    }
  }
  return Response.json({ blad: "Aleksandro, Komisja jest w tej chwili nieosiągalna." }, { status: 502 });
}
