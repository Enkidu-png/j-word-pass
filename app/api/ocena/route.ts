// Ocena odpowiedzi egzaminacyjnej przez OpenRouter. Kontrakt: plan/08 sekcja B.
// Klucz zyje wylacznie tutaj, po stronie serwera (Z12).

import { adresZadania, limitPrzekroczony } from "@/lib/limit";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_PRIMARY = "google/gemini-2.5-flash-lite";
const MODEL_FALLBACK = "mistralai/mistral-small-3.2-24b-instruct";
const LIMIT_BAJTOW = 8 * 1024;

const PROMPT_SYSTEMOWY = `Jesteś trzyosobową Międzygalaktyczną Komisją Egzaminacyjną oceniającą odpowiedź na
absurdalne zadanie z fizyki: pojedynek w kosmosie między 2000 biało-żółtych zebr
z jetpackami (300 km/h, zasięg 1000 km, potem pęd; jedna zebra ma raka trzustki
i skończyła akademię wojskową) a 1 słoniem (10 t, sokole oko, karabin na trąbie,
5000 naboi, +1 km/h przyspieszenia na strzał od odrzutu).

Oceń odpowiedź kandydata w punktach od 6 do 10 WYŁĄCZNIE za kreatywność (poprawność
fizyczna nie istnieje i nie obowiązuje). 10 = odpowiedź, którą Komisja oprawi w ramkę.
6 = kandydat się starał inaczej niż wcale.

Napisz komentarz Komisji: po polsku, 2-4 zdania, śmieszny i absurdalny, w tonie
przesadnie urzędowym (paragrafy, protokoły, wnioski formalne). Cytuj lub parafrazuj
NAJLEPSZY fragment odpowiedzi kandydata. Jeśli kandydat załączył mało dowodów
(pole zalaczoneDowody < 6), Komisja może to uszczypliwie odnotować.

Zakazy formalne: nie używaj długiego myślnika, nie używaj znaku wypunktowania kropką
środkową, nie używaj emoji. Zwróć wyłącznie JSON zgodny ze schematem.`;

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

// Z1 + Z2: myślniki na dywiz, kropka środkowa w kosz. Dotyczy takze tekstu z AI.
function sanitizeDash(tekst: string): string {
  const czysty = tekst.replace(/[—–]/g, "-").replace(/·/g, "").trim();
  if (czysty.length <= 600) return czysty;
  const uciety = czysty.slice(0, 600);
  const koniec = Math.max(uciety.lastIndexOf("."), uciety.lastIndexOf("!"), uciety.lastIndexOf("?"));
  return koniec > 0 ? uciety.slice(0, koniec + 1) : uciety;
}


async function zapytajModel(model: string, odpowiedz: string, dowody: number, klucz: string) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${klucz}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      temperature: 1.1,
      response_format: { type: "json_schema", json_schema: SCHEMA },
      messages: [
        { role: "system", content: PROMPT_SYSTEMOWY },
        {
          role: "user",
          content: `Odpowiedź kandydata:\n${odpowiedz}\n\nZałączonych dowodów: ${dowody}/6`,
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
    return Response.json({ blad: "Wniosek przekracza dopuszczalną objętość akt." }, { status: 413 });
  }

  let cialo: { odpowiedz?: unknown; zalaczoneDowody?: unknown };
  try {
    cialo = JSON.parse(surowy);
  } catch {
    return Response.json({ blad: "Formularz nieczytelny dla Komisji." }, { status: 400 });
  }
  const odpowiedz = typeof cialo.odpowiedz === "string" ? cialo.odpowiedz : null;
  if (odpowiedz === null) {
    return Response.json({ blad: "Brak pola odpowiedzi." }, { status: 400 });
  }
  const dowody = typeof cialo.zalaczoneDowody === "number" ? cialo.zalaczoneDowody : 0;

  // Granica zaufania: klient rozstrzyga pustke lokalnie, serwer i tak jej pilnuje.
  if (odpowiedz.trim() === "") {
    return Response.json({ punkty: 0, komentarz: "PUSTKA." });
  }

  if (limitPrzekroczony("ocena", adresZadania(request), 5)) {
    return Response.json(
      { blad: "Komisja obraduje. Proszę odczekać minutę i złożyć wniosek ponownie." },
      { status: 429 },
    );
  }

  const klucz = process.env.OPENROUTER_API_KEY;
  if (!klucz) {
    return Response.json({ blad: "Komisja nieosiągalna." }, { status: 502 });
  }

  for (const model of [MODEL_PRIMARY, MODEL_FALLBACK]) {
    try {
      const werdykt = await zapytajModel(model, odpowiedz, dowody, klucz);
      return Response.json({
        punkty: Math.min(10, Math.max(6, Math.round(werdykt.punkty))),
        komentarz: sanitizeDash(werdykt.komentarz),
      });
    } catch {
      // primary padl - probujemy fallbacku; po nim oddajemy 502 i klient
      // pokazuje werdykt awaryjny (plan/05 B)
    }
  }
  return Response.json({ blad: "Komisja nieosiągalna." }, { status: 502 });
}
