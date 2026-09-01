"use client";

import { useEffect, useRef, useState } from "react";
import egzamin from "@/data/egzamin.json";
import { czytajStan, zapiszStan } from "@/lib/stan";

// Arkusz formularz-F7 (plan/05 A2). Zastapil tymczasowe pole robocze z F2-04 -
// atrybut `data-pole-robocze` zostaje na textarea, bo to nadal TO SAMO pole
// odpowiedzi kandydata i asercje przezycia reloadu maja go po czym znalezc.

const SLOTY = 6;

export default function Arkusz() {
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
        // F3-04 podepnie tu ceremonie narada-komisji
        e.preventDefault();
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
        <ul className="arkusz__sloty">
          {Array.from({ length: SLOTY }, (_, i) => (
            <li className="arkusz__slot" key={i} data-slot={i} />
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
