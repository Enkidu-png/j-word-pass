"use client";

import { useEffect, useState } from "react";
import Ozdoba from "@/components/scena/Ozdoba";
import Pas from "@/components/scena/Pas";

// Stopka-webring (plan/05 A3). Licznik odwiedzin jest LOKALNY - referencja
// wisi na cutercounter.com, my nie chcemy trzeciej strony w tym projekcie.

const KLUCZ_LICZNIKA = "jwp.odwiedziny";
const KLUCZ_SESJI = "jwp.odwiedziny.sesja";
const START = 1337;
const CYFR = 7;

function policzOdwiedziny(): number {
  try {
    const zapisane = window.localStorage.getItem(KLUCZ_LICZNIKA);
    if (zapisane === null) {
      window.localStorage.setItem(KLUCZ_LICZNIKA, String(START));
      window.sessionStorage.setItem(KLUCZ_SESJI, "1");
      return START;
    }
    const teraz = Number(zapisane) || START;
    // Inkrement raz na sesje, nie raz na render - inaczej licznik pedzilby
    // przy kazdej nawigacji miedzy etapami.
    if (window.sessionStorage.getItem(KLUCZ_SESJI)) return teraz;
    const nowy = teraz + 1;
    window.localStorage.setItem(KLUCZ_LICZNIKA, String(nowy));
    window.sessionStorage.setItem(KLUCZ_SESJI, "1");
    return nowy;
  } catch {
    // tryb prywatny albo zablokowany storage: licznik pokazuje wartosc startowa
    return START;
  }
}

const PLAKIETKI = ["plakietka-html", "plakietka-css", "plakietka-przegladarka"];

export default function StopkaWebring() {
  const [odwiedziny, ustawOdwiedziny] = useState<number | null>(null);

  useEffect(() => ustawOdwiedziny(policzOdwiedziny()), []);

  return (
    <footer className="stopka">
      <div className="stopka__szyna">
        <Pas id="pas-cienki" pozycja="gora" wysokosc={14} />
      </div>
      <p className="stopka__licznik">
        <span className="stopka__licznik-podpis">ODWIEDZIN:</span>
        <output className="stopka__licznik-cyfry" data-licznik>
          {String(odwiedziny ?? START).padStart(CYFR, "0")}
        </output>
      </p>
      <p className="stopka__plakietki">
        {PLAKIETKI.map((id) => (
          <Ozdoba key={id} id={id} klasa="stopka__plakietka" />
        ))}
      </p>
      {/* Kontrakt miedzy fazami: RadioTinyDesk wchodzi tu w F5-03 (plan/05 A3). */}
      <div data-radio-slot />
      <p className="stopka__tekst">STRONA WYKONANA RĘCZNIE DLA ALEKSANDRY</p>
      <Ozdoba id="stwor-koperta" klasa="stopka__koperta" />
    </footer>
  );
}
