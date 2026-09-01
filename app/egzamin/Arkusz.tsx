"use client";

import { useEffect, useRef, useState } from "react";
import egzamin from "@/data/egzamin.json";
import { czytajStan, zapiszStan } from "@/lib/stan";

// Arkusz formularz-F7 (plan/05 A2). Zastapil tymczasowe pole robocze z F2-04 -
// atrybut `data-pole-robocze` zostaje na textarea, bo to nadal TO SAMO pole
// odpowiedzi kandydata i asercje przezycia reloadu maja go po czym znalezc.

export default function Arkusz({
  sloty,
  celSlotu,
  naSlot,
  ciagniona,
  zalaczone,
}: {
  sloty: React.ReactNode[];
  celSlotu: number;      // slot wskazany klawiatura, -1 = nic nie jest podniesione
  naSlot: (i: number) => void;
  ciagniona: boolean;    // trwa przeciaganie: sloty swieca krata --jad
  zalaczone: number;
}) {
  const [odpowiedz, ustawOdpowiedz] = useState("");
  const pole = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ustawOdpowiedz(czytajStan()?.egzamin?.odpowiedz ?? "");
  }, []);

  // autosize: pole rosnie z trescia, sufit 60vh pilnuje CSS
  useEffect(() => {
    const el = pole.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [odpowiedz]);

  return (
    <form
      className="arkusz formularz-F7"
      data-arkusz=""
      onSubmit={(e) => {
        e.preventDefault();
        // ponytail: sam wniosek do Komisji. Ceremonia narada-komisji i werdykt
        // na ekranie dokłada F3-04 - tutaj liczy sie kontrakt payloadu (05 A3:
        // liczba zalaczonych dowodow idzie do AI).
        void fetch("/api/ocena", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ odpowiedz, zalaczoneDowody: zalaczone }),
        });
      }}
    >
      {/* chromowy gradient czyta sie dopiero na ciemnym pasku - na papierze ginie */}
      <div className="arkusz__pasek">
        <h2 className="arkusz__naglowek gif-less gif-less--chrom">{egzamin.tytul}</h2>
      </div>
      <p className="arkusz__tresc">{egzamin.tresc}</p>
      <p className="arkusz__polecenie">{egzamin.polecenie}</p>

      <div className="arkusz__dowody">
        <span className="arkusz__etykieta">ZAŁĄCZ DOWODY (PRZECIĄGNIJ)</span>
        <ul className={`arkusz__sloty${ciagniona ? " arkusz__sloty--czekaja" : ""}`}>
          {sloty.map((zawartosc, i) => (
            <li
              className={`arkusz__slot${celSlotu === i ? " arkusz__slot--cel" : ""}`}
              key={i}
              data-slot={i}
              data-zajety={zawartosc ? "tak" : "nie"}
              onClick={() => naSlot(i)}
            >
              {zawartosc}
            </li>
          ))}
        </ul>
      </div>

      <label className="arkusz__etykieta" htmlFor="wywod">
        MIEJSCE NA WYWÓD
      </label>
      <div className="arkusz__pole">
        <textarea
          id="wywod"
          ref={pole}
          data-pole-robocze
          className="arkusz__textarea kafel-tla kafel--urzad"
          rows={6}
          placeholder="Tu wpisz wywód. Komisja czyta WSZYSTKO. Serio."
          value={odpowiedz}
          onChange={(e) => {
            ustawOdpowiedz(e.target.value);
            zapiszStan({ egzamin: { odpowiedz: e.target.value } });
          }}
        />
        {/* remont co pelne 200 znakow = jedno mrugniecie zachety, zero timerow */}
        <span
          key={Math.floor(odpowiedz.length / 200)}
          className={`arkusz__znaki${odpowiedz.length >= 200 ? " arkusz__znaki--mruga ceremonia" : ""}`}
          data-znaki={odpowiedz.length}
        >
          ZNAKÓW: {odpowiedz.length}
        </span>
      </div>

      <button className="arkusz__cta" type="submit">
        ODDAJĘ WYWÓD POD OSĄD KOMISJI
      </button>
    </form>
  );
}
