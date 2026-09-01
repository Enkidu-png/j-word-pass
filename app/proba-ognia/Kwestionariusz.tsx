"use client";

import { useEffect, useRef, useState } from "react";
import Ognisko from "./Ognisko";
import { czytajStan, zapiszStan, zapiszTeraz } from "@/lib/stan";

// Druk OGN-3/TAJ z plan/07 A. Dokladnie trzy pola (wymog usera), walidacja
// wylacznie nasza (`noValidate` - natywny dymek przegladarki nie jest pieczatka,
// a Z14 wymaga pieczatki albo formularza-F7), stempel zamiast czerwonej obwodki.

type Pole = "email" | "but" | "ucho";

const POWODY: Record<Pole, string> = {
  email: "ADRES NIE PRZYPOMINA ADRESU",
  but: "ROZMIAR BUTA POZA SKALĄ KOMISJI (10-70)",
  ucho: "ŚREDNICA UCHA POZA SKALĄ KOMISJI (5-500)",
};

function liczba(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// Walidacja klienta = ta sama trojka regul co serwer w F5-02 (plan/07 A tabela).
function zbadaj(email: string, but: string, ucho: string): Pole[] {
  const bledy: Pole[] = [];
  if (!/.+@.+\..+/.test(email)) bledy.push("email");
  const b = liczba(but);
  if (b === null || b < 10 || b > 70) bledy.push("but");
  const u = liczba(ucho);
  if (u === null || u < 5 || u > 500) bledy.push("ucho");
  return bledy;
}

export default function Kwestionariusz() {
  const [email, ustawEmail] = useState("");
  const [but, ustawBut] = useState("");
  const [ucho, ustawUcho] = useState("");
  const [pokora, ustawPokore] = useState(false);
  const [bledy, ustawBledy] = useState<Pole[]>([]);
  const [proba, ustawProbe] = useState(0);   // numer podejscia: remontuje trzesienie
  const [iskra, ustawIskre] = useState(0);   // fokus pola strzela iskra z ogniska
  const [przyjete, ustawPrzyjete] = useState(false);
  const [ulotna, ustawUlotna] = useState(false);   // Blob padl: zgloszenie zyje tylko w logu
  // natywny submit przed hydracja wypchnalby e-mail kandydata do adresu URL
  const [gotowy, ustawGotowy] = useState(false);

  const pola = useRef<Record<Pole, HTMLInputElement | null>>({ email: null, but: null, ucho: null });

  useEffect(() => ustawGotowy(true), []);

  // Fokus MUSI wrocic po renderze: `key` z numerem proby remontuje pole (tak
  // restartuje sie trzesienie), wiec focus() wolany w handlerze ladowal na
  // elemencie, ktory React za chwile wyrzucal z DOM.
  useEffect(() => {
    if (proba > 0 && bledy.length > 0) pola.current[bledy[0]]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proba]);

  useEffect(() => {
    // to, co kandydat zdazyl wpisac PRZED hydracja, bije zapis z sessionStorage
    const zapis = czytajStan()?.ogien;
    ustawEmail(pola.current.email?.value || zapis?.email || "");
    ustawBut(pola.current.but?.value || (zapis?.rozmiarButa != null ? String(zapis.rozmiarButa) : ""));
    ustawUcho(pola.current.ucho?.value || (zapis?.srednicaUchaMm != null ? String(zapis.srednicaUchaMm) : ""));
    // powrot na URL po wysylce: druk jest juz przyjety i NIE leci drugi POST (07 C)
    if (zapis?.wyslano) ustawPrzyjete(true);
  }, []);

  // POST leci OBOK teatru (plan/07 B): niczego nie blokuje, a przy awarii ponawia
  // sie raz w tle. Druga proba ma sens tylko dla awarii serwera - 4xx znaczy, ze
  // druk jest wadliwy i powtorka nic nie zmieni.
  async function wyslij(dane: Record<string, unknown>) {
    for (const podejscie of [0, 1]) {
      try {
        const res = await fetch("/api/zgloszenie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dane),
        });
        if (res.ok) {
          zapiszTeraz({ ogien: { wyslano: true } });
          return;
        }
        if (res.status < 500) break;
      } catch {
        // siec padla - drugie podejscie albo stempel o pamieci ulotnej
      }
      if (podejscie === 0) await new Promise((g) => setTimeout(g, 400));
    }
    ustawUlotna(true);
  }

  const zapisz = (patch: { email?: string; rozmiarButa?: number | null; srednicaUchaMm?: number | null }) =>
    zapiszStan({ ogien: patch });

  const uchoLiczba = liczba(ucho);
  const podziw = uchoLiczba !== null && uchoLiczba >= 5 && uchoLiczba <= 500 && (uchoLiczba < 20 || uchoLiczba > 90);
  // stopka rosnie skokowo: 1 krok skali na kazdy pelny rozmiar (transform: scaleX)
  const butLiczba = liczba(but);
  const skalaStopki = butLiczba === null ? 1 : Math.max(0.4, Math.min(1.9, butLiczba / 42));
  const rozwarcie = uchoLiczba === null ? 12 : Math.max(6, Math.min(52, uchoLiczba / 4));

  function stempel(pole: Pole) {
    if (!bledy.includes(pole)) return null;
    return (
      <p className="formularz-F7 ogien__stempel" data-stempel={pole} role="alert">
        WYPEŁNIONO NIEGODNIE: {POWODY[pole]}
      </p>
    );
  }

  return (
    <div className="ogien__scena">
      <Ognisko iskra={iskra} />

      <form
        className="formularz-F7 ogien__druk"
        data-druk="OGN-3/TAJ"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const nowe = zbadaj(email, but, ucho);
          ustawBledy(nowe);
          ustawProbe((n) => n + 1);
          if (nowe.length > 0) return;   // fokus ustawia efekt po remoncie pol
          // werdykt etapu nie moze zginac w debounce (znalezisko F7-08)
          const stan = czytajStan();
          zapiszTeraz({ ogien: { email, rozmiarButa: liczba(but), srednicaUchaMm: liczba(ucho) } });
          ustawPrzyjete(true);
          // idempotencja (anty-spec 07 D2): raz wyslane zgloszenie nie leci drugi raz
          if (!stan?.ogien?.wyslano) {
            void wyslij({
              email,
              rozmiarButa: liczba(but),
              srednicaUchaMm: liczba(ucho),
              punktyEgzamin: stan?.egzamin?.punkty ?? 0,
              punktyQuiz: stan?.quiz?.punkty ?? 0,
            });
          }
          // ponytail: ceremonia spalenia i list w butelce dochodza w F5-03,
          // tu konczy sie na przyjeciu druku - zero toasta (anty-spec 07 D1).
        }}
      >
        <p className="ogien__numer">DRUK OGN-3/TAJ</p>
        <h2 className="ogien__naglowek">KWESTIONARIUSZ OSTATECZNY. WYPEŁNIĆ DRUKOWANYMI. KOMISJA PATRZY.</h2>

        <div className="ogien__pole" data-luk="0" key={`email-${proba}`} data-zle={bledy.includes("email") ? "tak" : "nie"}>
          <label className="ogien__etykieta" htmlFor="ogn-email">ADRES POCZTY ELEKTRONICZNEJ</label>
          <input
            id="ogn-email"
            ref={(el) => { pola.current.email = el; }}
            data-pole="email"
            className="ogien__wpis"
            type="email"
            autoComplete="email"
            value={email}
            onFocus={() => ustawIskre((n) => n + 1)}
            onChange={(e) => { ustawEmail(e.target.value); zapisz({ email: e.target.value }); }}
          />
          <span className="ogien__dopisek">(tej prawdziwej. Komisja pozna się na fałszu.)</span>
          {stempel("email")}
        </div>

        <div className="ogien__pole" data-luk="1" key={`but-${proba}`} data-zle={bledy.includes("but") ? "tak" : "nie"}>
          <label className="ogien__etykieta" htmlFor="ogn-but">ROZMIAR BUTA</label>
          <div className="ogien__wiersz">
            <input
              id="ogn-but"
              ref={(el) => { pola.current.but = el; }}
              data-pole="but"
              className="ogien__wpis ogien__wpis--liczba"
              type="number"
              min={10}
              max={70}
              step={0.5}
              value={but}
              onFocus={() => ustawIskre((n) => n + 1)}
              onChange={(e) => { ustawBut(e.target.value); zapisz({ rozmiarButa: liczba(e.target.value) }); }}
            />
            {/* stopka-miarka: skaluje sie skokowo wraz z wartoscia (plan/07 A) */}
            <svg className="ogien__stopka" viewBox="0 0 120 60" aria-hidden="true" data-stopka={skalaStopki.toFixed(2)}>
              <g style={{ transform: `scaleX(${skalaStopki})`, transformOrigin: "6px 30px" }}>
                <path className="ogien__stopka-ksztalt" d="M8 34 C8 20 26 16 46 18 C70 20 92 22 100 26 C110 31 108 40 96 42 C74 46 40 48 22 46 C12 45 8 41 8 34 Z" />
                <circle className="ogien__stopka-palec" cx="100" cy="20" r="5" />
                <circle className="ogien__stopka-palec" cx="88" cy="16" r="4" />
                <circle className="ogien__stopka-palec" cx="77" cy="14" r="3" />
              </g>
              <path className="ogien__miarka" d="M4 54 H116" />
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <path key={i} className="ogien__miarka" d={`M${4 + i * 18} 54 v${i % 2 === 0 ? -8 : -4}`} />
              ))}
            </svg>
          </div>
          {stempel("but")}
        </div>

        <div className="ogien__pole" data-luk="2" key={`ucho-${proba}`} data-zle={bledy.includes("ucho") ? "tak" : "nie"}>
          <label className="ogien__etykieta" htmlFor="ogn-ucho">PRZYBLIŻONA ŚREDNICA UCHA (MM)</label>
          <div className="ogien__wiersz">
            <input
              id="ogn-ucho"
              ref={(el) => { pola.current.ucho = el; }}
              data-pole="ucho"
              className="ogien__wpis ogien__wpis--liczba"
              type="number"
              min={5}
              max={500}
              value={ucho}
              onFocus={() => ustawIskre((n) => n + 1)}
              onChange={(e) => { ustawUcho(e.target.value); zapisz({ srednicaUchaMm: liczba(e.target.value) }); }}
            />
            {/* ucho w suwmiarce: szczeki rozsuwaja sie wraz z wartoscia */}
            <svg className="ogien__ucho" viewBox="0 0 120 70" aria-hidden="true">
              <path className="ogien__ucho-ksztalt" d="M46 12 C64 6 82 16 82 34 C82 48 70 52 66 60 C62 68 50 68 44 62 C36 54 34 46 34 34 C34 22 38 15 46 12 Z" />
              <path className="ogien__ucho-ksztalt" d="M50 26 C60 22 66 28 62 38 C59 45 54 46 52 50" />
              <g className="ogien__suwmiarka">
                <path className="ogien__suwmiarka-belka" d="M6 66 H114" />
                <path className="ogien__suwmiarka-szczeka" d={`M${58 - rozwarcie} 66 v-38`} />
                <path className="ogien__suwmiarka-szczeka" d={`M${58 + rozwarcie} 66 v-38`} />
              </g>
            </svg>
          </div>
          {podziw && (
            <p className="ogien__podziw" data-podziw="">KOMISJA NOTUJE Z PODZIWEM</p>
          )}
          {stempel("ucho")}
        </div>

        <p className="ogien__klauzula" data-klauzula="">
          Oświadczam, że wiem, iż zadanie jest TAJNE, a udostępnianie go osobom postronnym
          grozi <span className="ogien__smierc gif-less gif-less--blink">ŚMIERCIĄ</span>{" "}
          (par. 44 ust. 0 Regulaminu Komisji).
        </p>

        <label className="ogien__pokora">
          <input
            type="checkbox"
            data-pokora
            checked={pokora}
            onChange={(e) => ustawPokore(e.target.checked)}
          />
          PRZYJMUJĘ Z POKORĄ
        </label>

        {przyjete ? (
          <p className="formularz-F7 ogien__przyjeto" data-przyjeto="" role="status">
            DRUK OGN-3/TAJ PRZYJĘTY. KOMISJA SZYKUJE OGIEŃ.
            {ulotna && (
              <span className="ogien__ulotna" data-ulotna="">KOMISJA ZAPISAŁA W PAMIĘCI ULOTNEJ</span>
            )}
          </p>
        ) : (
          <button className="ogien__cta" type="submit" data-cta disabled={!gotowy || !pokora}>
            JESTEM GOTOWA NA PRÓBĘ OGNIA
          </button>
        )}
      </form>
    </div>
  );
}
